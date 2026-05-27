/* kp-mod-setup-scroll-gear-select-fix.js
 * v1.3 · kategóriahelyes felszerelés-választók
 * - Nem keveri a bot / orsó / zsinór / horog / kosár listákat.
 * - Ha egy kategóriához nincs biztos találat, nem tölti fel más felszereléssel.
 */
(function(){
'use strict';
if(window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V13)return;
window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V13=true;

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(v){return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function getDBSafe(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem('horgaszpro_v0230')||'{}')}catch(e){return {}}}
function titleOf(x){return x.name||x.title||x.model||x.brandModel||x.type||x.label||''}
function metaOf(x){return [x.brand,x.model,x.category,x.cat,x.kind,x.type,x.size,x.length,x.weight,x.diameter,x.note].filter(Boolean).join(' · ')}
function hayOf(x){return norm([titleOf(x),x.category,x.cat,x.kind,x.type,x.group,x.subtype,x.method,x.note].filter(Boolean).join(' '))}
function hasAny(hay,arr){hay=norm(hay);return arr.some(k=>hay.includes(norm(k)))}
function hasNone(hay,arr){return !hasAny(hay,arr)}

const FIELDS=[
  {key:'rod', labels:['bot','horgaszbot'], ids:['setup-rod','rod'], pos:['bot','rod'], neg:['orso','reel','zsinor','line','horog','hook','kosar','basket','etetokosar','method kosar','kiegeszito']},
  {key:'reel', labels:['orso','orsó'], ids:['setup-reel','reel'], pos:['orso','orsó','reel'], neg:['bot','rod','zsinor','line','horog','hook','kosar','basket','etetokosar','method kosar']},
  {key:'line', labels:['fozsinor','főzsinór','zsinor','zsinór'], ids:['setup-line','line'], pos:['fozsinor','főzsinór','zsinor','zsinór','line','monofil','fonott','fluorocarbon'], neg:['bot','rod','orso','reel','horog','hook','kosar','basket']},
  {key:'leader', labels:['eloke','előke'], ids:['setup-leader','leader'], pos:['eloke','előke','leader','hooklength'], neg:['bot','rod','orso','reel','kosar','basket']},
  {key:'hook', labels:['horog'], ids:['setup-hook','hook'], pos:['horog','hook'], neg:['bot','rod','orso','reel','zsinor','line','kosar','basket']},
  {key:'terminal', labels:['kosar','kosár','vegszerelek','végszerelék'], ids:['setup-terminal','terminal'], pos:['kosar','kosár','etetokosar','etetőkosár','feederkosar','method kosar','method kosár','basket','terminal','vegszerelek','végszerelék'], neg:['bot','rod','orso','orsó','reel','zsinor','zsinór','line','horog','hook']},
  {key:'bait', labels:['csali'], ids:['setup-bait','bait'], bait:true}
];

function itemMatchesField(g,field){
  const hay=hayOf(g);
  if(!titleOf(g))return false;
  if(!hasAny(hay,field.pos||[]))return false;
  if(!hasNone(hay,field.neg||[]))return false;
  return true;
}
function listOptions(field,current){
  const db=getDBSafe();
  let list=[];
  if(field.bait){
    const b=Array.isArray(db.baits)?db.baits:[];
    list=b.filter(x=>titleOf(x)).map(x=>({name:titleOf(x),meta:metaOf(x)}));
  }else{
    const gear=Array.isArray(db.gear)?db.gear:[];
    list=gear.filter(g=>itemMatchesField(g,field)).map(x=>({name:titleOf(x),meta:metaOf(x)}));
  }
  const seen=new Set();
  list=list.filter(x=>{const k=norm(x.name);if(!k||seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.name.localeCompare(b.name,'hu'));
  const cur=String(current||'').trim();
  let html='<option value="">Válassz az adatbázisból…</option>';
  if(cur && !list.some(x=>x.name===cur)) html+=`<option value="${esc(cur)}" selected>${esc(cur)} (jelenlegi)</option>`;
  html+=list.map(x=>`<option value="${esc(x.name)}" ${x.name===cur?'selected':''}>${esc(x.name)}${x.meta?' — '+esc(x.meta):''}</option>`).join('');
  return {html,count:list.length};
}
function controlFromLabel(label){
  if(label.htmlFor){const byFor=document.getElementById(label.htmlFor); if(byFor)return byFor;}
  const group=label.closest('.form-group,.field,.input-group,.setup-field,div');
  if(group){const c=qs('input:not([type="hidden"]), textarea, select',group); if(c)return c;}
  let n=label.nextElementSibling;
  while(n){if(n.matches&&n.matches('input,textarea,select'))return n; const c=qs('input:not([type="hidden"]), textarea, select',n); if(c)return c; n=n.nextElementSibling;}
  return null;
}
function findControls(root,field){
  const found=[];
  field.ids.forEach(id=>{const el=qs('#'+id,root); if(el)found.push(el);});
  qsa('label,.form-label',root).forEach(l=>{
    const t=norm(l.textContent||'');
    if(field.labels.some(x=>t===norm(x)||t.includes(norm(x)))){const c=controlFromLabel(l); if(c)found.push(c);}
  });
  return found.filter((v,i,a)=>v&&a.indexOf(v)===i);
}
function enhanceSelectors(root=document){
  const db=getDBSafe();
  if((!Array.isArray(db.gear)||!db.gear.length)&&(!Array.isArray(db.baits)||!db.baits.length))return;
  FIELDS.forEach(field=>{
    findControls(root,field).forEach(input=>{
      if(!input || input.dataset.kpGearSelectEnhanced==='1')return;
      const opts=listOptions(field,input.value||'');
      if(!opts.count)return;
      const select=document.createElement('select');
      select.className=input.className||'form-input';
      select.id=input.id||('kp-setup-'+field.key);
      if(input.name)select.name=input.name;
      select.dataset.kpGearSelectEnhanced='1';
      select.dataset.kpGearField=field.key;
      select.innerHTML=opts.html;
      input.replaceWith(select);
    });
  });
}

function isShown(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el);return st.display!=='none'&&st.visibility!=='hidden'&&st.opacity!=='0';}
function activeModal(){return qsa('.modal-backdrop.show,.modal.show,[role="dialog"].show,.dialog.show,.sheet.show,.drawer.show').find(isShown)||null;}
function modalCard(modal){return qs('.modal-card',modal)||qs('.dialog-card',modal)||qs('.sheet-card',modal)||qs('.drawer-card',modal)||modal;}
function modalBody(modal){return qs('.modal-body',modal)||qs('.dialog-body',modal)||qs('.sheet-body',modal)||qs('.drawer-body',modal)||modalCard(modal);}
function isGearOrSetup(modal){
  const txt=norm((qs('.modal-title',modal)?.textContent||'')+' '+(modal.id||'')+' '+(modal.className||''));
  return hasAny(txt,['felszereles','osszeallitas','setup','gear']) || FIELDS.some(f=>findControls(modal,f).length);
}

let locked=false,savedY=0,scrollEl=null,lastY=null;
function lockPage(){
  if(locked)return;
  savedY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.classList.add('kp-modal-page-lock');
  document.body.classList.add('kp-modal-page-lock');
  Object.assign(document.body.style,{position:'fixed',top:'-'+savedY+'px',left:'0',right:'0',width:'100%',overflow:'hidden'});
  document.documentElement.style.overflow='hidden';
  locked=true;
}
function unlockPage(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-modal-page-lock');
  document.body.classList.remove('kp-modal-page-lock');
  Object.assign(document.body.style,{position:'',top:'',left:'',right:'',width:'',overflow:''});
  document.documentElement.style.overflow='';
  const y=savedY; locked=false; scrollEl=null;
  setTimeout(()=>{try{window.scrollTo(0,y)}catch(e){}},0);
}
function activate(){
  const m=activeModal();
  if(!m){unlockPage();return;}
  const card=modalCard(m), body=modalBody(m);
  card.classList.add('kp-universal-scroll-card');
  body.classList.add('kp-universal-scroll-body');
  scrollEl=body;
  if(isGearOrSetup(m))enhanceSelectors(m);
  lockPage();
}
function canScroll(sc,dy){
  if(!sc||sc.scrollHeight<=sc.clientHeight+2)return false;
  return dy>0 ? sc.scrollTop+sc.clientHeight<sc.scrollHeight-2 : dy<0 ? sc.scrollTop>0 : false;
}

document.addEventListener('touchstart',e=>{lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null;setTimeout(activate,0);},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{const m=activeModal();if(!m)return;const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;const dy=(lastY==null||y==null)?0:(lastY-y);lastY=y;const sc=scrollEl||modalBody(m);if(sc&&sc.contains(e.target)&&canScroll(sc,dy))return;e.preventDefault();},{passive:false,capture:true});
document.addEventListener('wheel',e=>{const m=activeModal();if(!m)return;const sc=scrollEl||modalBody(m);if(sc&&sc.contains(e.target)&&canScroll(sc,e.deltaY))return;e.preventDefault();},{passive:false,capture:true});
document.addEventListener('click',()=>{setTimeout(activate,25);setTimeout(activate,180);setTimeout(activate,650);},true);
window.addEventListener('resize',()=>setTimeout(activate,80));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(activate,80));
setInterval(()=>{activate(); const m=activeModal(); if(m&&isGearOrSetup(m))enhanceSelectors(m);},450);

(function style(){
  const old=qs('#kp-setup-scroll-gear-select-fix-css'); if(old)old.remove();
  const st=document.createElement('style'); st.id='kp-setup-scroll-gear-select-fix-css';
  st.textContent=`html.kp-modal-page-lock,body.kp-modal-page-lock{overscroll-behavior:none!important;overflow:hidden!important;touch-action:none!important}.modal-backdrop.show{position:fixed!important;inset:0!important;overflow:hidden!important;overscroll-behavior:contain!important;touch-action:none!important}.modal-card.kp-universal-scroll-card{display:flex!important;flex-direction:column!important;max-height:calc(100dvh - 22px)!important;overflow:hidden!important}.modal-card.kp-universal-scroll-card .modal-head{flex:0 0 auto!important;position:sticky!important;top:0!important;background:var(--card)!important;z-index:3!important}.modal-card.kp-universal-scroll-card .modal-body.kp-universal-scroll-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding-bottom:calc(120px + env(safe-area-inset-bottom))!important}.modal-card.kp-universal-scroll-card select.form-input{touch-action:manipulation!important}@media(max-width:760px){.modal-card.kp-universal-scroll-card{width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important}.modal-card.kp-universal-scroll-card select.form-input{height:56px!important}}`;
  document.head.appendChild(st);
})();
window.kpSetupScrollGearFixDebug=function(){const m=activeModal();return{version:'v1.3',active:!!m,isGearOrSetup:isGearOrSetup(m),locked,gearCount:(getDBSafe().gear||[]).length,baitCount:(getDBSafe().baits||[]).length,enhanced:qsa('[data-kp-gear-select-enhanced="1"]').length,fields:qsa('[data-kp-gear-select-enhanced="1"]').map(x=>x.dataset.kpGearField+':'+x.options.length).join('|'),modal:m&&(m.id||m.className),scroll:scrollEl&&(scrollEl.id||scrollEl.className)}};
console.log('[kp-setup-scroll-gear-select-fix] v1.3 aktív · kategóriahelyes választók');
})();
