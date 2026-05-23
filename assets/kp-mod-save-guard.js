/* kp-mod-save-guard.js — mentésvédelem / quota guard
 * v1.0 · Additív hotfix: nem módosít menüt, nem töröl funkciót.
 * Cél: a fő napló DB maradjon kicsi; a GitHub backup automatikusan frissüljön; quota hiba esetén ne vesszen el túra/hely.
 */
(function(){
'use strict';
if(window.KP_SAVE_GUARD_V1)return;
window.KP_SAVE_GUARD_V1=true;

const GUARD_KEY='kapaspont_save_guard_status_v1';
const AUTOSYNC_DELAY=45000;
const MIN_AUTOSYNC_GAP=4*60*1000;
let wrapping=false, autosyncTimer=null, lastAutosync=Number(localStorage.getItem('kapaspont_save_guard_last_sync')||0)||0;
const arr=x=>Array.isArray(x)?x:[];
const nowIso=()=>new Date().toISOString();
const isDataUrl=s=>typeof s==='string'&&/^data:image\//i.test(s);
const short=s=>String(s||'').slice(0,64);
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[save-guard]',m)}catch(e){console.log('[save-guard]',m)}}
function getKey(){try{return window.DB_KEY||'kapaspont_db'}catch(e){return 'kapaspont_db'}}
function getdbRaw(){try{return JSON.parse(localStorage.getItem(getKey())||'{}')}catch(e){return {}}}
function sizeKB(v){try{return Math.round(new Blob([typeof v==='string'?v:JSON.stringify(v||{})]).size/1024)}catch(e){return 0}}
function status(obj){try{localStorage.setItem(GUARD_KEY,JSON.stringify({updatedAt:nowIso(),...obj}))}catch(e){}}
function meaningful(d){return arr(d&&d.sessions).length||arr(d&&d.locations).length||arr(d&&d.scoutSpots).length||arr(d&&d.baits).length||arr(d&&d.gear).length}
function clone(o){try{return JSON.parse(JSON.stringify(o||{}))}catch(e){return o||{}}}
function tinyThumb(data){return isDataUrl(data)?data.slice(0,9000):''}
function photoMetaFrom(obj,kind){
  obj=obj||{};
  return {
    storage:obj.photoStorage||obj.storage||'external',
    path:obj.photoPath||(obj.photoRef&&(obj.photoRef.path||obj.photoRef.relativePath))||obj.path||'',
    idbKey:obj.idbKey||obj.idb||obj.id||'',
    kind:kind||obj.kind||'photo',
    thumb:obj.thumb||obj.photoThumb||tinyThumb(obj.photo||obj.data),
    createdAt:obj.createdAt||nowIso()
  };
}
function compactPhotoObject(o,kind){
  if(!o||typeof o!=='object')return false;
  let changed=false;
  const p=o.photoPath||(o.photoRef&&(o.photoRef.path||o.photoRef.relativePath));
  if(isDataUrl(o.photo)&&p){
    o.photoThumb=o.photoThumb||tinyThumb(o.photo);
    delete o.photo;
    o.photoStorage=o.photoStorage||'github';
    o.photoRef={storage:'github',path:p,createdAt:o.createdAt||nowIso()};
    changed=true;
  }
  if(Array.isArray(o.photos)){
    o.photos=o.photos.map(function(ph){
      if(!ph||typeof ph!=='object')return ph;
      const np={...ph};
      const path=np.photoPath||(np.photoRef&&(np.photoRef.path||np.photoRef.relativePath))||np.path||'';
      if(isDataUrl(np.data)&&(path||np.idb||np.idbKey)){
        np.thumb=np.thumb||tinyThumb(np.data);
        np.photoRef=photoMetaFrom(np,kind||'spot');
        delete np.data;
        changed=true;
      }
      return np;
    });
  }
  return changed;
}
function compactDB(input,reason){
  const db=clone(input); let changed=false;
  arr(db.sessions).forEach(function(s){
    if(compactPhotoObject(s,'session'))changed=true;
    arr(s&&s.catches).forEach(c=>{if(compactPhotoObject(c,'catch'))changed=true;});
    arr(s&&s.events).forEach(e=>{if(compactPhotoObject(e,'event'))changed=true;});
  });
  arr(db.scoutSpots).forEach(function(s){if(compactPhotoObject(s,'spot'))changed=true;});
  arr(db.locations).forEach(function(l){if(compactPhotoObject(l,'location'))changed=true;});
  db._meta={...(db._meta||{}),saveGuard:'v1',saveGuardLastRun:nowIso(),saveGuardReason:reason||'normal'};
  return {db,changed};
}
function safetyLocal(db,label){
  try{
    const snap={createdAt:nowIso(),backupType:label||'save-guard-before-save',...clone(db)};
    localStorage.setItem(getKey()+'_save_guard_latest',JSON.stringify(snap));
  }catch(e){console.warn('[save-guard] local safety snapshot skipped:',e&&e.message||e)}
}
function safeSetDB(db,reason){
  const key=getKey();
  safetyLocal(db,'before-'+(reason||'save'));
  let data=JSON.stringify(db||{});
  try{
    localStorage.setItem(key,data);
    status({ok:true,mode:'normal',sizeKB:sizeKB(data),message:'Mentés rendben.'});
    scheduleAutosync(reason);
    return true;
  }catch(first){
    const c=compactDB(db,'quota-retry');
    data=JSON.stringify(c.db||{});
    try{
      localStorage.setItem(key,data);
      status({ok:true,mode:'compact',sizeKB:sizeKB(data),message:'Mentés rendben, a nagy GitHub/IDB képadatok hivatkozásként maradtak meg.'});
      toast('Mentésvédelem: a napló mentve, a nagy képek hivatkozásként maradtak meg.');
      scheduleAutosync('quota-compact');
      return true;
    }catch(second){
      status({ok:false,mode:'error',sizeKB:sizeKB(data),message:String(second&&second.message||second)});
      alert('Mentési védelem: a böngésző tárhelye megtelt. A program nem törölt adatot, de a legutóbbi módosítás nem biztos, hogy helyben elment. Kérlek nyomj GitHub mentést / exportot, mielőtt bezárod az oldalt.');
      return false;
    }
  }
}
function scheduleAutosync(reason){
  if(reason==='autosync')return;
  if(!meaningful(getdbRaw()))return;
  const t=Date.now();
  if(t-lastAutosync<MIN_AUTOSYNC_GAP)return;
  clearTimeout(autosyncTimer);
  autosyncTimer=setTimeout(function(){
    try{
      const cfg=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}');
      const token=((cfg&&cfg.token)||localStorage.getItem('v18_github_token')||'').trim();
      if(!token||typeof window.githubSyncNow!=='function')return;
      lastAutosync=Date.now();
      localStorage.setItem('kapaspont_save_guard_last_sync',String(lastAutosync));
      window.githubSyncNow();
    }catch(e){console.warn('[save-guard] autosync skipped',e)}
  },AUTOSYNC_DELAY);
}
function wrapSaveDB(){
  if(wrapping)return;
  const old=window.saveDB;
  if(typeof old!=='function'||old.__kpSaveGuard)return;
  wrapping=true;
  const nw=function(d){
    const src=d||getdbRaw();
    const c=compactDB(src,'saveDB');
    if(!safeSetDB(c.db,'saveDB'))return false;
    try{if(typeof window.migrateDB==='function')window.migrateDB()}catch(e){}
    ['updateHome','renderStorageOverview'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}});
    return true;
  };
  nw.__kpSaveGuard=true;
  window.saveDB=nw;
  wrapping=false;
}
function wrapLocalStorage(){
  if(localStorage.setItem.__kpSaveGuard)return;
  const oldSet=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){
    if(String(k)===String(getKey())&&typeof v==='string'){
      try{return oldSet(k,v)}catch(e){
        try{const parsed=JSON.parse(v); const c=compactDB(parsed,'localStorage-quota'); return oldSet(k,JSON.stringify(c.db));}
        catch(e2){throw e;}
      }}
    return oldSet(k,v);
  };
  localStorage.setItem.__kpSaveGuard=true;
}
function addIndicator(){
  if(document.getElementById('kp-save-guard-ind'))return;
  const el=document.createElement('div');
  el.id='kp-save-guard-ind';
  el.textContent='Mentésvédelem aktív';
  el.style.cssText='position:fixed;left:12px;bottom:12px;z-index:999998;background:rgba(37,104,91,.92);color:#fff;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;box-shadow:0 6px 16px rgba(0,0,0,.18);opacity:.88;pointer-events:none';
  document.body.appendChild(el);
  setTimeout(()=>{try{el.style.opacity='.28'}catch(e){}},6000);
}
window.kpSaveGuardCompactNow=function(){const d=getdbRaw();const c=compactDB(d,'manual');return safeSetDB(c.db,'manual')};
window.kpSaveGuardStatus=function(){try{return JSON.parse(localStorage.getItem(GUARD_KEY)||'{}')}catch(e){return {}}};
window.addEventListener('pagehide',function(){try{scheduleAutosync('pagehide')}catch(e){}});
function boot(){wrapLocalStorage();wrapSaveDB();addIndicator();setTimeout(wrapSaveDB,800);setTimeout(wrapSaveDB,2500);setInterval(wrapSaveDB,3000);status({ok:true,mode:'active',message:'Mentésvédelem aktív.'});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
console.log('[save-guard] Mentésvédelem aktív.');
})();
