/* kp-mod-session-catch-late-save-fix.js — Utólagos fogás hozzáadás mentés javítás
 * v1.0 · Csak a meglévő túrához utólag hozzáadott fogás mentését védi.
 * Nem nyúl képekhez, csalikhoz, helykeresőhöz.
 */
(function(){
'use strict';
if(window.KP_SESSION_CATCH_LATE_SAVE_FIX_V1)return;
window.KP_SESSION_CATCH_LATE_SAVE_FIX_V1=true;

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
function catchFormVisible(){return visible(qs('#ac-bait'))||visible(qs('#ac-fish'))||visible(qs('#ec-fish'))||visible(qs('#ec-bait'))}
function findSessionIdFromUi(){
  const ids=['session-id','active-session-id','detail-session-id','ec-session-id','ac-session-id'];
  for(const id of ids){const v=val(id);if(v)return v}
  try{if(window.activeSessionId)return String(window.activeSessionId)}catch(e){}
  try{if(window.currentSessionId)return String(window.currentSessionId)}catch(e){}
  const active=qsa('[data-session-id]').find(visible)||qs('[data-session-id]');
  if(active)return active.getAttribute('data-session-id')||'';
  return '';
}
function latestSession(d){const ss=Array.isArray(d.sessions)?d.sessions:[];return ss[ss.length-1]||null}
function findSession(d){
  const ss=Array.isArray(d.sessions)?d.sessions:[];
  const id=findSessionIdFromUi();
  if(id){const s=ss.find(x=>String(x.id||x.uuid||x.sessionId||'')===String(id));if(s)return s}
  try{const aid=d.activeSessionId||window.activeSessionId;if(aid){const s=ss.find(x=>String(x.id||x.uuid||x.sessionId||'')===String(aid));if(s)return s}}catch(e){}
  const open=qsa('.session-item.active,.session-card.active,.card.active,[data-session-id].active').map(el=>el.getAttribute('data-session-id')).find(Boolean);
  if(open){const s=ss.find(x=>String(x.id||x.uuid||x.sessionId||'')===String(open));if(s)return s}
  return latestSession(d);
}
function readCatch(){
  const fish=val('ac-fish')||val('ec-fish')||val('catch-fish');
  const bait=val('ac-bait')||val('ec-bait')||val('catch-bait');
  const method=val('ac-method')||val('ec-method')||val('catch-method');
  const weightRaw=val('ac-weight')||val('ec-weight')||val('catch-weight');
  const lengthRaw=val('ac-length')||val('ec-length')||val('catch-length');
  const status=val('ac-status')||val('ec-status')||val('catch-status');
  const note=val('ac-note')||val('ec-note')||val('catch-note');
  const photo=val('ac-photo')||val('ec-photo')||val('catch-photo');
  if(!fish&&!bait&&!method&&!weightRaw&&!lengthRaw&&!note&&!photo)return null;
  const t=new Date().toISOString();
  return {id:'catch_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),createdAt:t,updatedAt:t,time:t,fish:fish||'',hal:fish||'',bait:bait||'',csali:bait||'',method:method||'',modszer:method||'',weight:weightRaw||'',weightKg:num(weightRaw),length:lengthRaw||'',lengthCm:num(lengthRaw),status:status||'',note:note||'',photo:photo||''};
}
function catchKey(c){return String(c&& (c.id||c.uuid||c.createdAt||(String(c.time||'')+'|'+String(c.fish||c.hal||'')+'|'+String(c.bait||c.csali||'')+'|'+String(c.weight||c.weightKg||''))) )}
function addCatchIfMissing(session,c){
  if(!session||!c)return false;
  if(!Array.isArray(session.catches))session.catches=[];
  const k=catchKey(c);
  const exists=session.catches.some(x=>catchKey(x)===k)||session.catches.some(x=>String(x.fish||x.hal||'')===String(c.fish||c.hal||'')&&String(x.bait||x.csali||'')===String(c.bait||c.csali||'')&&String(x.weight||x.weightKg||'')===String(c.weight||c.weightKg||'')&&Math.abs(Date.parse(x.createdAt||x.time||0)-Date.parse(c.createdAt||c.time||0))<5000);
  if(exists)return false;
  session.catches.push(c);
  if(Array.isArray(session.fogasok))session.fogasok=session.catches;
  if(Array.isArray(session['fogások']))session['fogások']=session.catches;
  session.updatedAt=new Date().toISOString();
  session.modifiedAt=session.updatedAt;
  return true;
}
function fallbackSaveCatch(){
  const c=readCatch();if(!c)return false;
  const d=getdb();if(!Array.isArray(d.sessions)||!d.sessions.length){toast('Nincs túra, amihez menthetném a fogást.');return false}
  const s=findSession(d);if(!s){toast('Nem találom a túrát a fogás mentéséhez.');return false}
  const ok=addCatchIfMissing(s,c);
  if(ok){savedb(d);refresh();toast('Fogás elmentve a túrához.');console.log('[late-catch-save] fallback saved',s.id||s.uuid,c);return true}
  return false;
}
function wrap(fnName){
  const old=window[fnName];
  if(typeof old!=='function'||old.__kpLateCatchFix)return false;
  const nw=function(){
    const before=JSON.stringify((findSession(getdb())||{}).catches||[]);
    let r;
    try{r=old.apply(this,arguments)}catch(e){console.warn('[late-catch-save] original '+fnName+' failed',e);r=null}
    setTimeout(function(){
      const after=JSON.stringify((findSession(getdb())||{}).catches||[]);
      if(before===after&&catchFormVisible())fallbackSaveCatch();
    },120);
    return r;
  };
  nw.__kpLateCatchFix=true;
  window[fnName]=nw;
  return true;
}
function install(){
  ['saveActiveCatch','saveSessionCatch','addActiveCatch','addSessionCatch','saveCatch','saveCatchModal'].forEach(wrap);
}
document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('button');
  if(!b||!catchFormVisible())return;
  const t=String(b.textContent||'').toLowerCase();
  if(/fogás|fogas|mentés|mentes|hozzáadás|hozzaadas|save|add/.test(t)){
    setTimeout(function(){fallbackSaveCatch()},260);
  }
},true);
setTimeout(install,400);setTimeout(install,1500);setInterval(install,2500);
window.kpLateCatchSaveDebug=function(){const d=getdb(),s=findSession(d);return{hasForm:catchFormVisible(),session:s&&(s.id||s.uuid||s.sessionId||s.date),catchCount:s&&Array.isArray(s.catches)?s.catches.length:null,readCatch:readCatch()}};
console.log('[late-catch-save] v1.0 aktív');
})();
