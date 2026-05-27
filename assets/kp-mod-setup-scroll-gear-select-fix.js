/* kp-mod-setup-scroll-gear-select-fix.js
 * v1.1 · Univerzális modal háttér-scroll lock + összeállítás/felszerelés DB választók
 * - iPhone/Safari alatt a háttér/menu nem gördülhet a modal mögött.
 * - Minden .modal-backdrop.show esetén lezárja az oldal scrollját.
 * - Összeállítás modalban a setup mezőket a gear DB-ből választhatóvá teszi.
 */
(function(){
'use strict';
if(window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V11)return;
window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V11=true;

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(v){return String(v||'').trim().toLowerCase()}
function getDBSafe(){try{return typeof getDB==='function'?getDB():(JSON.parse(localStorage.getItem('horgaszpro_v0230')||'{}'))}catch(e){return {}}}

const setupFieldMap=[
  {id:'setup-rod', kinds:['bot','rod','feeder bot','match bot'], label:'Bot'},
  {id:'setup-reel', kinds:['orsó','orso','reel'], label:'Orsó'},
  {id:'setup-line', kinds:['főzsinór','fozsinor','zsinór','zsinor','line','main line'], label:'Főzsinór'},
  {id:'setup-leader', kinds:['előke','eloke','leader','hooklength'], label:'Előke'},
  {id:'setup-hook', kinds:['horog','hook'], label:'Horog'},
  {id:'setup-terminal', kinds:['kosár','kosar','method kosár','feeder kosár','úszó','uszo','műcsali','mucsali','terminal','feeder'], label:'Kosár / végszerelék'}
];

function gearName(g){return g.name||g.title||g.model||g.brandModel||g.type||''}
function gearKind(g){return norm([g.category,g.cat,g.kind,g.type,g.group,g.method,g.subtype].filter(Boolean).join(' '))}
function gearMeta(g){return [g.brand,g.model,g.size,g.length,g.weight,g.diameter,g.note].filter(Boolean).join(' · ')}
function matchesGear(g,kinds){const hay=norm([gearKind(g),gearName(g),gearMeta(g)].join(' '));return kinds.some(k=>hay.includes(norm(k)));}
function gearOptions(kinds,current){
  const db=getDBSafe();
  const gear=Array.isArray(db.gear)?db.gear:[];
  let list=gear.filter(g=>gearName(g)&&matchesGear(g,kinds));
  if(!list.length) list=gear.filter(g=>gearName(g));
  const seen=new Set();
  list=list.filter(g=>{const n=gearName(g).trim(); const key=norm(n); if(seen.has(key))return false; seen.add(key); return true;})
           .sort((a,b)=>gearName(a).localeCompare(gearName(b),'hu'));
  const cur=String(current||'').trim();
  let html='<option value="">Válassz a felszerelésekből…</option>';
  if(cur && !list.some(g=>gearName(g)===cur)) html+=`<option value="${esc(cur)}" selected>${esc(cur)} (jelenlegi)</option>`;
  html+=list.map(g=>{const n=gearName(g); const meta=gearMeta(g); return `<option value="${esc(n)}" ${n===cur?'selected':''}>${esc(n)}${meta?' — '+esc(meta):''}</option>`}).join('');
  return html;
}

function enhanceSetupGearSelectors(root=document){
  const db=getDBSafe();
  if(!Array.isArray(db.gear)||!db.gear.length)return;
  setupFieldMap.forEach(cfg=>{
    const input=qs('#'+cfg.id,root);
    if(!input || input.dataset.kpGearSelectEnhanced==='1')return;
    const oldValue=input.value||'';
    const select=document.createElement('select');
    select.className=input.className||'form-input';
    select.id=input.id;
    select.dataset.kpGearSelectEnhanced='1';
    select.innerHTML=gearOptions(cfg.kinds,oldValue);
    input.replaceWith(select);
  });
}

function activeModal(){
  return qsa('.modal-backdrop.show, .modal.show, [role="dialog"].show').find(m=>m.offsetParent!==null || getComputedStyle(m).display!=='none') || null;
}
function modalCard(modal){return qs('.modal-card',modal)||qs('.dialog-card',modal)||qs('.sheet-card',modal)||modal;}
function modalScrollArea(modal){return qs('.modal-body',modal)||qs('.dialog-body',modal)||qs('.sheet-body',modal)||modalCard(modal);}
function isSetupModal(modal){
  if(!modal)return false;
  const txt=(qs('.modal-title',modal)?.textContent||'')+' '+(modal.id||'')+' '+(modal.className||'');
  return /összeállítás|felszerelés-összeállítás|setup/i.test(txt) || !!qs('#setup-name,#setup-rod,#setup-reel,#setup-line,#setup-terminal',modal);
}

let locked=false, savedY=0, scrollEl=null, active=null, lastY=null;
function lockBackground(){
  if(locked)return;
  savedY=window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0;
  document.documentElement.classList.add('kp-modal-page-lock');
  document.body.classList.add('kp-modal-page-lock');
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  document.body.style.position='fixed';
  document.body.style.top='-'+savedY+'px';
  document.body.style.left='0';
  document.body.style.right='0';
  document.body.style.width='100%';
  locked=true;
}
function unlockBackground(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-modal-page-lock');
  document.body.classList.remove('kp-modal-page-lock');
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.left='';
  document.body.style.right='';
  document.body.style.width='';
  const y=savedY||0;
  locked=false; active=null; scrollEl=null;
  setTimeout(()=>{try{window.scrollTo(0,y)}catch(e){}},0);
}
function activate(){
  const modal=activeModal();
  if(!modal){unlockBackground();return;}
  active=modal;
  const card=modalCard(modal), body=modalScrollArea(modal);
  card.classList.add('kp-universal-scroll-card');
  body.classList.add('kp-universal-scroll-body');
  scrollEl=body;
  if(isSetupModal(modal)){
    card.classList.add('kp-setup-scroll-card');
    body.classList.add('kp-setup-scroll-body');
    enhanceSetupGearSelectors(modal);
  }
  lockBackground();
}
function canScroll(sc,dy){
  if(!sc || sc.scrollHeight<=sc.clientHeight+2)return false;
  if(dy>0) return sc.scrollTop+sc.clientHeight < sc.scrollHeight-2;
  if(dy<0) return sc.scrollTop > 0;
  return true;
}

document.addEventListener('touchstart',e=>{lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null; setTimeout(activate,0);},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{
  const modal=activeModal();
  if(!modal)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y); lastY=y;
  const sc=scrollEl||modalScrollArea(modal);
  if(sc && sc.contains(e.target) && canScroll(sc,dy))return;
  e.preventDefault();
},{passive:false,capture:true});

document.addEventListener('wheel',e=>{
  const modal=activeModal();
  if(!modal)return;
  const sc=scrollEl||modalScrollArea(modal);
  if(sc && sc.contains(e.target) && canScroll(sc,e.deltaY))return;
  e.preventDefault();
},{passive:false,capture:true});

document.addEventListener('click',()=>{setTimeout(activate,30);setTimeout(activate,180);setTimeout(activate,600);},true);
window.addEventListener('resize',()=>setTimeout(activate,80));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(activate,80));
setInterval(activate,500);

(function style(){
  const old=qs('#kp-setup-scroll-gear-select-fix-css'); if(old)old.remove();
  const st=document.createElement('style'); st.id='kp-setup-scroll-gear-select-fix-css';
  st.textContent=`
  html.kp-modal-page-lock,body.kp-modal-page-lock{overscroll-behavior:none!important;overflow:hidden!important;touch-action:none!important;}
  .modal-backdrop.show{overscroll-behavior:contain!important;touch-action:none!important;}
  .modal-card.kp-universal-scroll-card{display:flex!important;flex-direction:column!important;max-height:calc(100dvh - 22px)!important;overflow:hidden!important;}
  .modal-card.kp-universal-scroll-card .modal-head{flex:0 0 auto!important;position:sticky!important;top:0!important;background:var(--card)!important;z-index:3!important;}
  .modal-card.kp-universal-scroll-card .modal-body.kp-universal-scroll-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding-bottom:calc(110px + env(safe-area-inset-bottom))!important;}
  .modal-card.kp-universal-scroll-card select.form-input{touch-action:manipulation!important;}
  @media(max-width:760px){.modal-card.kp-universal-scroll-card{width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important;}.modal-card.kp-universal-scroll-card select.form-input{height:56px;}}
  `;
  document.head.appendChild(st);
})();

window.kpSetupScrollGearFixDebug=function(){const m=activeModal();return{active:!!m,modal:m&&(m.id||m.className),isSetup:isSetupModal(m),locked,savedY,scroll:scrollEl&&(scrollEl.id||scrollEl.className),gearCount:(getDBSafe().gear||[]).length,bodyPosition:document.body.style.position,bodyTop:document.body.style.top};};
console.log('[kp-setup-scroll-gear-select-fix] v1.1 aktív · univerzális modal háttér-lock');
})();
