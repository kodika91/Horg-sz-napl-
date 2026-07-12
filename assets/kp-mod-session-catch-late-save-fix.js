/* kp-mod-session-catch-late-save-fix.js — Utólagos fogásmentés biztonsági javítás
 * v1.2 · A tartalékmentés csak akkor fut le, ha az eredeti mentés nem módosította az adatbázist.
 * Fogásszerkesztéskor nem indít külön gombkattintásos második mentést.
 */
(function(){
'use strict';
if(window.KP_SESSION_CATCH_LATE_SAVE_FIX_V12)return;
window.KP_SESSION_CATCH_LATE_SAVE_FIX_V12=true;
window.KP_SESSION_CATCH_LATE_SAVE_FIX_V11=true;

let lastCatchPhotoData='', lastCatchPhotoName='', lastSelectedSessionId='';
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function val(id){const e=qs('#'+id);return e?String(e.value||'').trim():''}
function num(v){v=String(v||'').replace(',','.');const n=Number(v);return Number.isFinite(n)?n:null}
function toast(m){try{typeof showToast==='function'?showToast(m):alert(m)}catch(e){console.log(m)}}
function dbKey(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}}
function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(dbKey())||'{}')}catch(e){return {}}}
function savedb(d){
  try{if(typeof saveDB==='function'){saveDB(d);return true}}catch(e){console.warn('[late-catch-save] saveDB failed, fallback localStorage',e)}
  try{localStorage.setItem(dbKey(),JSON.stringify(d||{}));return true}catch(e){toast('Fogás mentési hiba: '+(e&&e.message||e));return false}
}
function refresh(){['renderSessionsList','renderActiveSessionHome','updateHome','renderStorageOverview','renderSessionDetail','renderSessions'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
function visible(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el);const r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>20&&r.height>20}
function norm(s){return String(s||'').trim()}
function catchFormVisible(){return visible(qs('#ac-bait'))||visible(qs('#ac-fish'))||visible(qs('#ec-fish'))||visible(qs('#ec-bait'))||!!qsa('input,select,textarea').find(e=>visible(e)&&/fogás|fogas|hal|csali/i.test(String(e.id||'')+' '+String(e.name||'')+' '+String(e.placeholder||'')))}
function rememberSessionIdFromClick(el){const p=el&&el.closest&&el.closest('[data-session-id]');if(p&&p.getAttribute('data-session-id'))lastSelectedSessionId=p.getAttribute('data-session-id')}
function findSessionIdFromUi(){
  const ids=['session-id','active-session-id','detail-session-id','ec-session-id','ac-session-id'];
  for(const id of ids){const v=val(id);if(v)return v}
  try{if(window.currentSessionId)return String(window.currentSessionId)}catch(e){}
  try{if(window.selectedSessionId)return String(window.selectedSessionId)}catch(e){}
  try{if(window.activeSessionId)return String(window.activeSessionId)}catch(e){}
  const active=qsa('[data-session-id]').filter(visible).find(el=>/active|selected|open|detail/i.test(String(el.className||'')))||qs('[data-session-id].active,[data-session-id].selected');
  if(active)return active.getAttribute('data-session-id')||'';
  return lastSelectedSessionId||'';
}
function latestSession(d){const ss=Array.isArray(d.sessions)?d.sessions:[];return ss[ss.length-1]||null}
function sameId(s,id){return String(s&&(s.id||s.uuid||s.sessionId||s.createdAt||''))===String(id)}
function findSession(d){
  const ss=Array.isArray(d.sessions)?d.sessions:[];
  const id=findSessionIdFromUi();
  if(id){const s=ss.find(x=>sameId(x,id));if(s)return s}
  const titleTxt=norm((qs('.session-detail-title,.detail-title,.top-bar-title')||{}).textContent);
  if(titleTxt){const s=ss.find(x=>titleTxt.includes(norm(x.location||x.place||x.name||x.title||''))&&norm(x.location||x.place||x.name||x.title||''));if(s)return s}
  return latestSession(d);
}
async function fileToDataUrl(file){
  const raw=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result));fr.onerror=rej;fr.readAsDataURL(file)});
  try{const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=raw});const maxSide=1200;let w=img.naturalWidth,h=img.naturalHeight;const scale=Math.min(1,maxSide/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);return canvas.toDataURL('image/jpeg',0.82)}catch(e){return raw}
}
function findCatchPanel(){
  const f=qs('#ac-bait')||qs('#ac-fish')||qs('#ec-fish')||qs('#ec-bait')||qsa('input,select,textarea').find(e=>visible(e)&&/fogás|fogas|hal|csali/i.test(String(e.id||'')+' '+String(e.name||'')+' '+String(e.placeholder||'')));
  let n=f;for(let i=0;n&&n!==document.body&&i<10;i++,n=n.parentElement){if(visible(n)&&n.querySelectorAll('input,select,textarea,button').length>=2)return n}return document;
}
function readPhotoFromPanel(panel){
  if(lastCatchPhotoData)return {photo:lastCatchPhotoData,photoData:lastCatchPhotoData,photoName:lastCatchPhotoName,photoStorage:'inline-backup'};
  const img=qsa('img',panel||document).find(i=>visible(i)&&String(i.src||'').startsWith('data:image/'));
  if(img)return {photo:img.src,photoData:img.src,photoName:'fogás_kép.jpg',photoStorage:'inline-backup'};
  return {};
}
function readCatch(){
  const panel=findCatchPanel();
  const fish=val('ac-fish')||val('ec-fish')||val('catch-fish')||val('fish');
  const bait=val('ac-bait')||val('ec-bait')||val('catch-bait')||val('bait');
  const method=val('ac-method')||val('ec-method')||val('catch-method')||val('method');
  const weightRaw=val('ac-weight')||val('ec-weight')||val('catch-weight')||val('weight');
  const lengthRaw=val('ac-length')||val('ec-length')||val('catch-length')||val('length');
  const status=val('ac-status')||val('ec-status')||val('catch-status');
  const note=val('ac-note')||val('ec-note')||val('catch-note')||val('note');
  const photoField=val('ac-photo')||val('ec-photo')||val('catch-photo')||val('photo');
  const photoObj=readPhotoFromPanel(panel);
  if(!fish&&!bait&&!method&&!weightRaw&&!lengthRaw&&!note&&!photoField&&!photoObj.photo)return null;
  const t=new Date().toISOString();
  const c={id:'catch_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),createdAt:t,updatedAt:t,time:t,fish:fish||'',hal:fish||'',bait:bait||'',csali:bait||'',method:method||'',modszer:method||'',weight:weightRaw||'',weightKg:num(weightRaw),length:lengthRaw||'',lengthCm:num(lengthRaw),status:status||'',note:note||'',photo:photoField||photoObj.photo||'',...photoObj};
  if(window.__kpLastBaitCombo&&Array.isArray(window.__kpLastBaitCombo)){c.baitCombo=window.__kpLastBaitCombo.slice();c.csaliKombinacio=c.baitCombo.slice()}
  return c;
}
function addCatchIfMissing(session,c){
  if(!session||!c)return false;
  if(!Array.isArray(session.catches))session.catches=[];
  const exists=session.catches.some(x=>String(x.id||'')===String(c.id))||session.catches.some(x=>String(x.fish||x.hal||'')===String(c.fish||c.hal||'')&&String(x.bait||x.csali||'')===String(c.bait||c.csali||'')&&String(x.weight||x.weightKg||'')===String(c.weight||c.weightKg||'')&&String(x.length||x.lengthCm||'')===String(c.length||c.lengthCm||''));
  if(exists)return false;
  session.catches.push(c);session.fogasok=session.catches;session['fogások']=session.catches;session.updatedAt=new Date().toISOString();session.modifiedAt=session.updatedAt;return true;
}
function fallbackSaveCatch(){
  const c=readCatch();if(!c)return false;
  const d=getdb();if(!Array.isArray(d.sessions)||!d.sessions.length){toast('Nincs túra, amihez menthetném a fogást.');return false}
  const s=findSession(d);if(!s){toast('Nem találom a túrát a fogás mentéséhez.');return false}
  const ok=addCatchIfMissing(s,c);
  if(ok){savedb(d);refresh();toast(c.photo?'Fogás és kép elmentve a túrához.':'Fogás elmentve a túrához.');console.log('[late-catch-save] saved',s.id||s.uuid,c);return true}
  return false;
}
function wrap(fnName){
  const old=window[fnName];if(typeof old!=='function'||old.__kpLateCatchFix)return false;
  const nw=function(){
    const before=JSON.stringify((findSession(getdb())||{}).catches||[]);
    let r;try{r=old.apply(this,arguments)}catch(e){console.warn('[late-catch-save] original '+fnName+' failed',e);r=null}
    setTimeout(function(){const after=JSON.stringify((findSession(getdb())||{}).catches||[]);if(before===after&&catchFormVisible())fallbackSaveCatch()},600);
    return r;
  };
  nw.__kpLateCatchFix=true;window[fnName]=nw;return true;
}
function install(){['saveActiveCatch','saveSessionCatch','addActiveCatch','addSessionCatch','saveCatch','saveCatchModal','saveCatchEdit','addCatchToSession'].forEach(wrap)}
document.addEventListener('click',function(e){rememberSessionIdFromClick(e.target)},true);
document.addEventListener('change',function(e){
  const input=e.target;if(!catchFormVisible()||!input||String(input.type||'').toLowerCase()!=='file')return;
  const file=input.files&&input.files[0];if(!file||!/^image\//.test(file.type||''))return;
  lastCatchPhotoName=file.name||'fogás_kép.jpg';
  fileToDataUrl(file).then(d=>{lastCatchPhotoData=d;console.log('[late-catch-save] catch photo captured',lastCatchPhotoName,d.length)}).catch(err=>console.warn('[late-catch-save] photo read failed',err));
},true);
setTimeout(install,400);setTimeout(install,1500);setInterval(install,2500);
window.kpLateCatchSaveDebug=function(){const d=getdb(),s=findSession(d),c=readCatch();return{hasForm:catchFormVisible(),session:s&&(s.id||s.uuid||s.sessionId||s.date||s.location),catchCount:s&&Array.isArray(s.catches)?s.catches.length:null,hasCapturedPhoto:!!lastCatchPhotoData,readCatch:c&&{fish:c.fish,bait:c.bait,weight:c.weight,hasPhoto:!!c.photo}}};
console.log('[late-catch-save] v1.2 aktív · duplikált szerkesztési mentés tiltva');
})();