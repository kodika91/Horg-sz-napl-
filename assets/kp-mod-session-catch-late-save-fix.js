/* kp-mod-session-catch-late-save-fix.js — tartós fogásazonosító és biztonságos mentés
 * v2: szerkesztéskor soha nem hoz létre új fogást. Új fogás mentésekor ugyanazt
 * a piszkozat-azonosítót használja, amíg a mentés be nem fejeződik.
 */
(function(){
'use strict';
if(window.KP_SESSION_CATCH_LATE_SAVE_FIX_V2)return;
window.KP_SESSION_CATCH_LATE_SAVE_FIX_V2=true;

let lastCatchPhotoData='',lastCatchPhotoName='',lastSelectedSessionId='';
const draftIds=new WeakMap();
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function val(id){const e=qs('#'+id);return e?String(e.value||'').trim():''}
function num(v){v=String(v||'').replace(',','.');const n=Number(v);return Number.isFinite(n)?n:null}
function norm(v){return String(v==null?'':v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function uid(prefix){try{if(crypto&&typeof crypto.randomUUID==='function')return prefix+'_'+crypto.randomUUID()}catch(e){}return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,12)}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function dbKey(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}}
function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(dbKey())||'{}')}catch(e){return {}}}
function savedb(d){try{if(typeof saveDB==='function'){saveDB(d);return true}}catch(e){console.warn('[stable-catch-save] saveDB hiba',e)}try{localStorage.setItem(dbKey(),JSON.stringify(d||{}));return true}catch(e){toast('Fogás mentési hiba: '+(e&&e.message||e));return false}}
function visible(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>20&&r.height>20}
function addFormVisible(){return visible(qs('#ac-fish'))||visible(qs('#ac-bait'))}
function editFormVisible(){return visible(qs('#ec-fish'))||visible(qs('#ec-bait'))}
function rememberSessionIdFromClick(el){const p=el&&el.closest&&el.closest('[data-session-id]');if(p&&p.getAttribute('data-session-id'))lastSelectedSessionId=p.getAttribute('data-session-id')}
function sameSessionId(s,id){return String(s&&(s.id||s.sessionId||s.uuid||''))===String(id)}
function findSession(d){const ss=Array.isArray(d.sessions)?d.sessions:[],ids=['session-id','active-session-id','detail-session-id','ec-session-id','ac-session-id'];for(const id of ids){const v=val(id);if(v){const s=ss.find(x=>sameSessionId(x,v));if(s)return s}}try{if(window.currentSessionDetailId){const s=ss.find(x=>sameSessionId(x,window.currentSessionDetailId));if(s)return s}}catch(e){}if(lastSelectedSessionId){const s=ss.find(x=>sameSessionId(x,lastSelectedSessionId));if(s)return s}return ss[ss.length-1]||null}
function ensureSessionId(s){if(!s)return'';let id=String(s.id||s.sessionId||s.uuid||'');if(!id)id=uid('session');s.id=id;s.sessionId=id;s.uuid=id;return id}
function ensureCatchId(c){if(!c)return'';let id=String(c.id||c.catchId||c.recordId||c.uuid||'');if(!id)id=uid('catch');c.id=id;c.catchId=id;c.recordId=id;return id}
function getAddPanel(){const f=qs('#ac-fish')||qs('#ac-bait');return f&&f.closest('.modal-card,.modal-body,.event-form-grid,form')||f&&f.parentElement||document.body}
function draftId(){const panel=getAddPanel();if(!draftIds.has(panel))draftIds.set(panel,uid('catch'));return draftIds.get(panel)}
function clearDraft(){const panel=getAddPanel();if(panel)draftIds.delete(panel);lastCatchPhotoData='';lastCatchPhotoName=''}
function readPhoto(panel){if(lastCatchPhotoData)return{photo:lastCatchPhotoData,photoData:lastCatchPhotoData,photoName:lastCatchPhotoName,photoStorage:'inline-backup'};const img=qsa('img',panel||document).find(i=>visible(i)&&String(i.src||'').startsWith('data:image/'));return img?{photo:img.src,photoData:img.src,photoName:'fogás_kép.jpg',photoStorage:'inline-backup'}:{}}
function readNewCatch(){
  const panel=getAddPanel(),fish=val('ac-fish'),bait=val('ac-bait'),method=val('ac-method'),weightRaw=val('ac-weight'),lengthRaw=val('ac-length'),note=val('ac-note'),photoField=val('ac-photo'),photoObj=readPhoto(panel);
  if(!fish&&!bait&&!method&&!weightRaw&&!lengthRaw&&!note&&!photoField&&!photoObj.photo)return null;
  const t=new Date().toISOString(),id=draftId();
  const c={id,catchId:id,recordId:id,createdAt:t,updatedAt:t,time:val('ac-time')||t,fish,hal:fish,bait,csali:bait,method,modszer:method,count:Number(val('ac-count'))||1,weight:weightRaw||'',weightKg:num(weightRaw),length:lengthRaw||'',lengthCm:num(lengthRaw),note,photo:photoField||photoObj.photo||'',...photoObj};
  if(window.__kpLastBaitCombo&&Array.isArray(window.__kpLastBaitCombo)){c.baitCombo=window.__kpLastBaitCombo.slice();c.csaliKombinacio=c.baitCombo.slice()}
  return c;
}
function samePhysical(a,b){
  if(!a||!b)return false;
  if(String(a.id||a.catchId||a.recordId||'')===String(b.id||b.catchId||b.recordId||''))return true;
  if(norm(a.fish||a.hal)!==norm(b.fish||b.hal))return false;
  const aw=num(a.weightKg!=null?a.weightKg:a.weight),bw=num(b.weightKg!=null?b.weightKg:b.weight),al=num(a.lengthCm!=null?a.lengthCm:a.length),bl=num(b.lengthCm!=null?b.lengthCm:b.length);
  if((aw!=null||bw!=null)&&Math.abs((aw||0)-(bw||0))>0.0001)return false;
  if((al!=null||bl!=null)&&Math.abs((al||0)-(bl||0))>0.0001)return false;
  return Number(a.count||1)===Number(b.count||1);
}
function addCatchIfMissing(session,c){
  if(!session||!c)return false;ensureSessionId(session);if(!Array.isArray(session.catches))session.catches=[];
  if(session.catches.some(x=>samePhysical(x,c)))return false;
  session.catches.push(c);session.updatedAt=new Date().toISOString();session.modifiedAt=session.updatedAt;return true;
}
function fallbackSaveNewCatch(){const c=readNewCatch();if(!c)return false;const d=getdb(),s=findSession(d);if(!s)return false;const ok=addCatchIfMissing(s,c);if(ok){savedb(d);clearDraft();try{window.kpCanonicalizeCatches&&window.kpCanonicalizeCatches()}catch(e){}toast(c.photo?'Fogás és kép elmentve.':'Fogás elmentve.')}return ok}
function catchIds(s){return new Set((s&&Array.isArray(s.catches)?s.catches:[]).map(c=>String(c.id||c.catchId||c.recordId||'')))}
function wrapAdd(fnName){
  const old=window[fnName];if(typeof old!=='function'||old.__kpStableAdd)return false;
  const nw=function(){
    const beforeDb=getdb(),beforeSession=findSession(beforeDb),beforeIds=catchIds(beforeSession),beforeLen=beforeSession&&beforeSession.catches?beforeSession.catches.length:0;
    let r;try{r=old.apply(this,arguments)}catch(e){console.warn('[stable-catch-save] eredeti '+fnName+' hiba',e)}
    setTimeout(function(){
      const afterSession=findSession(getdb()),after=afterSession&&Array.isArray(afterSession.catches)?afterSession.catches:[],added=after.length>beforeLen||after.some(c=>!beforeIds.has(String(c.id||c.catchId||c.recordId||'')));
      if(added){clearDraft();return}
      if(addFormVisible()&&!editFormVisible())fallbackSaveNewCatch();
    },700);
    return r;
  };nw.__kpStableAdd=true;window[fnName]=nw;return true;
}
function wrapEdit(fnName){
  const old=window[fnName];if(typeof old!=='function'||old.__kpStableEdit)return false;
  const nw=function(){
    const args=arguments,d=getdb(),s=findSession(d),before=(s&&Array.isArray(s.catches))?s.catches.map(c=>JSON.parse(JSON.stringify(c))):[],index=Number(args[0]),oldCatch=Number.isInteger(index)&&before[index]?before[index]:null,oldId=oldCatch?ensureCatchId(oldCatch):'';
    let r;try{r=old.apply(this,args)}catch(e){console.warn('[stable-catch-edit] eredeti '+fnName+' hiba',e);throw e}
    setTimeout(function(){
      const db=getdb(),session=findSession(db);if(!session||!Array.isArray(session.catches)||!oldCatch)return;
      let target=Number.isInteger(index)?session.catches[index]:null;if(!target||!samePhysical(target,oldCatch)){target=session.catches.find(c=>String(c.id||c.catchId||c.recordId||'')===oldId)||target}
      if(target){target.id=oldId;target.catchId=oldId;target.recordId=oldId;target.updatedAt=new Date().toISOString()}
      if(session.catches.length>before.length){
        const keep=[];let keptTarget=false;session.catches.forEach(function(c){if(samePhysical(c,target||oldCatch)){if(!keptTarget){keep.push(target||c);keptTarget=true}}else keep.push(c)});session.catches=keep;
      }
      savedb(db);try{window.kpCanonicalizeCatches&&window.kpCanonicalizeCatches()}catch(e){}
    },0);
    return r;
  };nw.__kpStableEdit=true;window[fnName]=nw;return true;
}
function install(){['saveActiveCatch','addActiveCatch','addSessionCatch','saveCatch','saveCatchModal','addCatchToSession'].forEach(wrapAdd);['saveSessionCatch','saveCatchEdit'].forEach(wrapEdit)}
document.addEventListener('click',e=>rememberSessionIdFromClick(e.target),true);
document.addEventListener('change',function(e){const input=e.target;if(!addFormVisible()||editFormVisible()||!input||String(input.type||'').toLowerCase()!=='file')return;const file=input.files&&input.files[0];if(!file||!/^image\//.test(file.type||''))return;lastCatchPhotoName=file.name||'fogás_kép.jpg';const fr=new FileReader();fr.onload=()=>{lastCatchPhotoData=String(fr.result||'')};fr.readAsDataURL(file)},true);
setTimeout(install,300);setTimeout(install,1200);setInterval(install,2500);
console.log('[stable-catch-save] v2 aktív · szerkesztéskor azonosító megőrzése kötelező');
})();