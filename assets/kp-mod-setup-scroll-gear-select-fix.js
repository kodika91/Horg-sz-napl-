/* kp-mod-setup-scroll-gear-select-fix.js
 * v1.0 · Összeállítás modal mobil scroll + felszerelés DB választók
 * - Nem módosít mentési logikát: a meglévő setup mezők értékét írja.
 * - iPhone/Safari: a háttér gördülését lezárja, a modal body görgethető.
 */
(function(){
'use strict';
if(window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V1)return;
window.KP_SETUP_SCROLL_GEAR_SELECT_FIX_V1=true;

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(v){return String(v||'').trim().toLowerCase()}
function getDBSafe(){try{return typeof getDB==='function'?getDB():(JSON.parse(localStorage.getItem('horgaszpro_v0230')||'{}'))}catch(e){return {}}}
function visible(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el);const r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>40&&r.height>40;}

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
    select.dataset.kpOriginalType=input.tagName.toLowerCase();
    select.innerHTML=gearOptions(cfg.kinds,oldValue);
    select.addEventListener('change',function(){this.dataset.value=this.value||'';});
    input.replaceWith(select);
  });
}

function isSetupModal(modal){
  if(!modal||!modal.classList||!modal.classList.contains('show'))return false;
  const txt=(qs('.modal-title',modal)?.textContent||'')+' '+(modal.id||'');
  return /összeállítás|felszerelés-összeállítás|setup/i.test(txt) || !!qs('#setup-name,#setup-rod,#setup-reel,#setup-line,#setup-terminal',modal);
}
function activeSetupModal(){return qsa('.modal-backdrop.show').find(isSetupModal)||null;}

let locked=false, scrollEl=null;
function lockBackground(){
  if(locked)return;
  document.documentElement.classList.add('kp-setup-modal-lock');
  document.body.classList.add('kp-setup-modal-lock');
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  locked=true;
}
function unlockBackground(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-setup-modal-lock');
  document.body.classList.remove('kp-setup-modal-lock');
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
  if(scrollEl)scrollEl.classList.remove('kp-setup-scroll-body');
  scrollEl=null;locked=false;
}
function activate(){
  const modal=activeSetupModal();
  if(!modal){unlockBackground();return;}
  enhanceSetupGearSelectors(modal);
  const card=qs('.modal-card',modal)||modal;
  const body=qs('.modal-body',modal)||card;
  card.classList.add('kp-setup-scroll-card');
  body.classList.add('kp-setup-scroll-body');
  scrollEl=body;
  lockBackground();
}

let lastY=null;
document.addEventListener('touchstart',e=>{lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null; setTimeout(activate,0);},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{
  const modal=activeSetupModal();
  if(!modal)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y); lastY=y;
  const sc=scrollEl||qs('.modal-body',modal)||qs('.modal-card',modal);
  if(sc && sc.contains(e.target)){
    const canDown=dy>0 && sc.scrollTop+sc.clientHeight<sc.scrollHeight-2;
    const canUp=dy<0 && sc.scrollTop>0;
    if(canDown||canUp)return;
  }
  e.preventDefault();
},{passive:false,capture:true});

document.addEventListener('click',()=>{setTimeout(activate,40);setTimeout(activate,250);},true);
window.addEventListener('resize',()=>setTimeout(activate,80));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(activate,80));
setInterval(activate,700);

(function style(){
  const old=qs('#kp-setup-scroll-gear-select-fix-css'); if(old)old.remove();
  const st=document.createElement('style'); st.id='kp-setup-scroll-gear-select-fix-css';
  st.textContent=`
  html.kp-setup-modal-lock,body.kp-setup-modal-lock{overscroll-behavior:none!important;overflow:hidden!important;}
  .modal-backdrop.show{overscroll-behavior:contain!important;}
  .modal-card.kp-setup-scroll-card{display:flex!important;flex-direction:column!important;max-height:calc(100dvh - 22px)!important;overflow:hidden!important;}
  .modal-card.kp-setup-scroll-card .modal-head{flex:0 0 auto!important;position:sticky!important;top:0!important;background:var(--card)!important;z-index:3!important;}
  .modal-card.kp-setup-scroll-card .modal-body.kp-setup-scroll-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;padding-bottom:calc(110px + env(safe-area-inset-bottom))!important;}
  @media(max-width:760px){.modal-card.kp-setup-scroll-card{width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important;}.modal-card.kp-setup-scroll-card select.form-input{height:56px;}}
  `;
  document.head.appendChild(st);
})();

window.kpSetupScrollGearFixDebug=function(){const m=activeSetupModal();return{active:!!m,modal:m&&(m.id||m.className),locked,scroll:scrollEl&&(scrollEl.id||scrollEl.className),gearCount:(getDBSafe().gear||[]).length};};
console.log('[kp-setup-scroll-gear-select-fix] v1.0 aktív');
})();
