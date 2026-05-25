/* kp-mod-catch-bait-combo.js — Gyors fogás csali kombináció választó
 * v1.1 · Scroll pozíció megtartása: a csali lista nem ugrik vissza felülre görgetés/kijelölés közben.
 * Nem módosít menüket, backupot, helykeresőt, mentési logikát; mentés előtt az input értékét állítja be.
 */
(function(){
'use strict';
if(window.KP_CATCH_BAIT_COMBO_V11)return;
window.KP_CATCH_BAIT_COMBO_V11=true;

const DEFAULTS=['Gumikukorica','Tigrismogyoró','Kukorica','Csonti','Pinki','Giliszta','Wafter','Pop up','Pellet','Method mix','Aqua Garant 2,5 mm'];
let enabled=false;
let selected=[];
let lastComboText='';
let lastComboArr=[];
let lastListScrollTop=0;
let lastRenderKey='';

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function norm(s){return String(s||'').trim().replace(/\s+/g,' ')}
function esc(s){return String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function baitInput(){return qs('#ac-bait')}
function hasQuickCatch(){return !!baitInput()}
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return {}}}
function baitNames(){
  const out=[];
  const d=db();
  function add(v){v=norm(v);if(v&&!out.some(x=>x.toLowerCase()===v.toLowerCase()))out.push(v)}
  DEFAULTS.forEach(add);
  ['baits','baitDB','BAIT_DB','BAITS','BaitsDB'].forEach(k=>{
    const arr=Array.isArray(window[k])?window[k]:(Array.isArray(d[k])?d[k]:[]);
    arr.forEach(x=>add(typeof x==='string'?x:(x&&(x.name||x.title||x.label||x.id))));
  });
  qsa('.bait-name,.item-name,#page-baits .item-list-card .item-name').forEach(e=>add(e.textContent));
  return out.sort((a,b)=>a.localeCompare(b,'hu'));
}
function comboText(){return selected.map(norm).filter(Boolean).join(' + ')}
function syncInput(){
  const input=baitInput();
  if(!input||!enabled)return;
  const t=comboText();
  if(t){input.value=t;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
  lastComboText=t;
  lastComboArr=selected.slice();
}
function rememberScroll(){
  const list=qs('#kp-bait-combo-list');
  if(list)lastListScrollTop=list.scrollTop||0;
}
function restoreScroll(){
  const list=qs('#kp-bait-combo-list');
  if(list){list.scrollTop=lastListScrollTop||0;setTimeout(()=>{try{list.scrollTop=lastListScrollTop||0}catch(e){}},0);}
}
function toggleItem(name){
  rememberScroll();
  name=norm(name);if(!name)return;
  const ix=selected.findIndex(x=>x.toLowerCase()===name.toLowerCase());
  if(ix>=0)selected.splice(ix,1); else selected.push(name);
  render(true);syncInput();restoreScroll();
}
function seedFromInput(){
  const input=baitInput();
  if(!input)return;
  const v=norm(input.value);
  if(!v)return;
  if(v.includes('+'))selected=v.split('+').map(norm).filter(Boolean);
  else if(!selected.length)selected=[v];
}
function updateSummaryOnly(host){
  const sum=qs('#kp-bait-combo-summary',host);
  if(sum)sum.textContent=enabled&&selected.length?comboText():'';
  qsa('.kp-bait-chip',host).forEach(b=>{
    const n=b.getAttribute('data-bait')||'';
    const on=selected.some(x=>x.toLowerCase()===n.toLowerCase());
    b.classList.toggle('on',on);
    b.style.border='1px solid '+(on?'rgba(74,124,89,.35)':'var(--border)');
    b.style.background=on?'var(--moss-bg)':'var(--card)';
    b.style.color=on?'var(--moss)':'var(--text2)';
  });
}
function render(force){
  const input=baitInput();if(!input)return;
  let host=qs('#kp-bait-combo-host');
  if(!host){
    host=document.createElement('div');
    host.id='kp-bait-combo-host';
    host.style.cssText='margin-top:8px;margin-bottom:10px';
    input.insertAdjacentElement('afterend',host);
    force=true;
  }
  const names=baitNames();
  const key=JSON.stringify({enabled,names,selected});
  if(!force&&host.dataset.ready==='1'&&lastRenderKey===key){return;}
  const oldList=qs('#kp-bait-combo-list',host);
  if(oldList)lastListScrollTop=oldList.scrollTop||lastListScrollTop||0;
  if(!force&&host.dataset.ready==='1'&&enabled&&qs('#kp-bait-combo-list',host)){
    updateSummaryOnly(host);
    lastRenderKey=key;
    return;
  }
  host.innerHTML=`
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:${enabled?'8px':'0'}">
      <button type="button" id="kp-bait-combo-toggle" class="kp-bait-combo-toggle ${enabled?'on':''}" style="border:1px solid ${enabled?'rgba(44,110,122,.35)':'var(--border2)'};background:${enabled?'linear-gradient(135deg,var(--water),var(--water2))':'var(--card2)'};color:${enabled?'#fff':'var(--text2)'};border-radius:999px;padding:8px 13px;font-weight:800;font-size:13px;display:inline-flex;gap:6px;align-items:center">
        <span>＋</span><span>Kombináció</span>
      </button>
      ${enabled?`<button type="button" id="kp-bait-combo-clear" style="border:1px solid var(--border);background:var(--card);color:var(--text3);border-radius:999px;padding:8px 11px;font-weight:700;font-size:12px">Törlés</button>`:''}
      <span id="kp-bait-combo-summary" style="font-size:12px;color:var(--text3);font-weight:700">${enabled&&selected.length?esc(comboText()):''}</span>
    </div>
    ${enabled?`<div id="kp-bait-combo-list" style="display:flex;gap:7px;flex-wrap:wrap;max-height:146px;overflow:auto;-webkit-overflow-scrolling:touch;padding:2px 2px 8px 2px;overscroll-behavior:contain">
      ${names.map(n=>{const on=selected.some(x=>x.toLowerCase()===n.toLowerCase());return `<button type="button" data-bait="${esc(n)}" class="kp-bait-chip ${on?'on':''}" style="border:1px solid ${on?'rgba(74,124,89,.35)':'var(--border)'};background:${on?'var(--moss-bg)':'var(--card)'};color:${on?'var(--moss)':'var(--text2)'};border-radius:999px;padding:8px 11px;font-size:13px;font-weight:800">${esc(n)}</button>`}).join('')}
    </div>`:''}`;
  host.dataset.ready='1';
  lastRenderKey=key;
  const toggle=qs('#kp-bait-combo-toggle',host);
  if(toggle)toggle.onclick=function(){rememberScroll();enabled=!enabled;if(enabled)seedFromInput();else lastListScrollTop=0;render(true);syncInput();restoreScroll();};
  const clear=qs('#kp-bait-combo-clear',host);
  if(clear)clear.onclick=function(){rememberScroll();selected=[];lastComboText='';lastComboArr=[];if(input)input.value='';render(true);restoreScroll();};
  const list=qs('#kp-bait-combo-list',host);
  if(list){list.addEventListener('scroll',function(){lastListScrollTop=this.scrollTop||0},{passive:true});}
  qsa('.kp-bait-chip',host).forEach(b=>b.onclick=function(){toggleItem(this.getAttribute('data-bait'))});
  restoreScroll();
}
function beforeSave(){
  if(enabled)syncInput();
}
function wrapSaveDB(){
  const old=window.saveDB;
  if(typeof old!=='function'||old.__kpBaitCombo)return;
  const nw=function(d){
    try{
      if(lastComboText&&lastComboArr.length&&d&&Array.isArray(d.sessions)){
        const sessions=d.sessions.slice().sort((a,b)=>String(b.updatedAt||b.date||b.startTime||'').localeCompare(String(a.updatedAt||a.date||a.startTime||'')));
        for(const s of sessions){
          const catches=Array.isArray(s.catches)?s.catches:Array.isArray(s.fogások)?s.fogások:[];
          if(!catches.length)continue;
          const c=catches[catches.length-1];
          if(c&&String(c.bait||c.csali||'').trim()===lastComboText){c.baitCombo=lastComboArr.slice();c.csaliKombinacio=lastComboArr.slice();break;}
        }
      }
    }catch(e){console.warn('[bait-combo] metadata skip',e)}
    return old.apply(this,arguments);
  };
  nw.__kpBaitCombo=true;
  window.saveDB=nw;
}
function boot(){
  if(hasQuickCatch())render(false);
  wrapSaveDB();
}
document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('button');
  if(b&&/fogás|fogas|mentés|mentes|hozzáadás|hozzaadas|save|add/i.test(String(b.textContent||'')))beforeSave();
  setTimeout(boot,80);setTimeout(boot,400);
},true);
document.addEventListener('input',function(e){if(e.target&&e.target.id==='ac-bait'&&!enabled){lastComboText='';lastComboArr=[];}},true);
setInterval(boot,1500);
setTimeout(boot,500);setTimeout(boot,1500);
console.log('[bait-combo] v1.1 aktív · scroll megtartás');
})();
