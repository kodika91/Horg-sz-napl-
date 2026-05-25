/* kp-mod-bait-form-scroll-fix.js — Új csali hozzáadása kártya mobil görgetés javítás
 * v1.0 · Csak a Csalik oldalon, új/szerkesztő csali űrlapnál aktiválódik.
 * Cél: telefonon ne a háttér/menü, hanem a megnyitott csali űrlap/kártya görögjön.
 */
(function(){
'use strict';
if(window.KP_BAIT_FORM_SCROLL_FIX_V1)return;
window.KP_BAIT_FORM_SCROLL_FIX_V1=true;

let locked=false, activePanel=null, activeScroll=null, lastY=null, oldScrollY=0;
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function text(el){return String(el&&el.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function visible(el){
  if(!el||!el.isConnected)return false;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  const r=el.getBoundingClientRect();
  return r.width>80&&r.height>80;
}
function isBaitsPage(){
  const p=qs('#page-baits');
  if(p&&p.classList&&p.classList.contains('active'))return true;
  const title=text(qs('.top-bar-title')||document.body);
  return title.includes('csalik')||title.includes('csali');
}
function hasBaitFormFields(el){
  if(!el)return false;
  const t=text(el);
  const inputCount=el.querySelectorAll('input,textarea,select').length;
  const baitWords=t.includes('csali')||t.includes('etetőanyag')||t.includes('etetoanyag')||t.includes('aroma')||t.includes('meret')||t.includes('hatekony');
  const addWords=t.includes('hozzaadas')||t.includes('uj csali')||t.includes('szerkesztes')||t.includes('mentes')||t.includes('fotokonyvtar')||t.includes('kep');
  return inputCount>=2&&baitWords&&addWords;
}
function findBaitPanel(){
  if(!isBaitsPage())return null;
  const candidates=qsa('.modal,.modal-content,.modal-body,.sheet,.bottom-sheet,.drawer,.dialog,.card,.item-form,.form-card,.panel,[role="dialog"]')
    .filter(visible)
    .filter(hasBaitFormFields);
  if(candidates.length){
    return candidates.sort((a,b)=>{
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      const as=a.querySelectorAll('input,textarea,select,button').length;
      const bs=b.querySelectorAll('input,textarea,select,button').length;
      return (bs+br.height/100)-(as+ar.height/100);
    })[0];
  }
  const formHint=qsa('input,textarea,select').find(function(i){
    if(!visible(i))return false;
    const ph=String(i.placeholder||'').toLowerCase();
    const lab=text(i.closest('label')||i.parentElement||i);
    return ph.includes('csali')||ph.includes('aroma')||ph.includes('méret')||ph.includes('meret')||lab.includes('csali')||lab.includes('aroma')||lab.includes('meret');
  });
  if(!formHint)return null;
  let best=null,n=formHint;
  for(let i=0;n&&n!==document.body&&i<12;i++,n=n.parentElement){
    if(visible(n)&&hasBaitFormFields(n)){best=n;break;}
  }
  return best;
}
function findScroll(panel){
  if(!panel)return null;
  const named=['.modal-body','.modal-content','.sheet-body','.drawer-body','.form-body','.card-body','form'];
  for(const s of named){const el=qs(s,panel);if(el&&visible(el))return el;}
  return panel;
}
function lockBody(){
  if(locked)return;
  oldScrollY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.classList.add('kp-bait-form-lock');
  document.body.classList.add('kp-bait-form-lock');
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  locked=true;
}
function unlockBody(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-bait-form-lock');
  document.body.classList.remove('kp-bait-form-lock');
  document.body.style.overflow='';
  document.documentElement.style.overflow='';
  if(activePanel)activePanel.classList.remove('kp-bait-form-panel-active');
  if(activeScroll){
    activeScroll.classList.remove('kp-bait-form-scroll-area');
    activeScroll.style.overflowY='';
    activeScroll.style.webkitOverflowScrolling='';
    activeScroll.style.overscrollBehavior='';
    activeScroll.style.touchAction='';
    activeScroll.style.maxHeight='';
    activeScroll.style.paddingBottom='';
  }
  activePanel=null;activeScroll=null;locked=false;
}
function ensureSpacer(sc){
  if(!sc||sc.querySelector(':scope > .kp-bait-form-scroll-spacer'))return;
  const sp=document.createElement('div');
  sp.className='kp-bait-form-scroll-spacer';
  sp.style.cssText='height:160px;min-height:160px;pointer-events:none';
  sc.appendChild(sp);
}
function activate(panel){
  activePanel=panel;
  activeScroll=findScroll(panel)||panel;
  panel.classList.add('kp-bait-form-panel-active');
  const vh=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||700;
  activeScroll.classList.add('kp-bait-form-scroll-area');
  activeScroll.style.overflowY='auto';
  activeScroll.style.webkitOverflowScrolling='touch';
  activeScroll.style.overscrollBehavior='contain';
  activeScroll.style.touchAction='pan-y';
  activeScroll.style.maxHeight=Math.max(320,Math.floor(vh-18))+'px';
  activeScroll.style.paddingBottom='max(170px, calc(140px + env(safe-area-inset-bottom)))';
  ensureSpacer(activeScroll);
  lockBody();
}
function update(){
  const panel=findBaitPanel();
  if(panel)activate(panel); else unlockBody();
}
function canScroll(el,dy){
  if(!el)return false;
  if(el.scrollHeight<=el.clientHeight+4)return false;
  if(dy<0&&el.scrollTop<=0)return false;
  if(dy>0&&el.scrollTop+el.clientHeight>=el.scrollHeight-2)return false;
  return true;
}
document.addEventListener('touchstart',function(e){lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null;setTimeout(update,0);},{passive:true,capture:true});
document.addEventListener('touchmove',function(e){
  if(!locked)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y);
  lastY=y;
  if(activeScroll&&activePanel&&activePanel.contains(e.target)&&canScroll(activeScroll,dy))return;
  e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('click',function(){setTimeout(update,60);setTimeout(update,300);setTimeout(update,900);},true);
window.addEventListener('resize',function(){setTimeout(update,100)});
if(window.visualViewport)visualViewport.addEventListener('resize',function(){setTimeout(update,100)});
window.addEventListener('orientationchange',function(){setTimeout(update,350)});
setInterval(update,800);
(function style(){
  if(qs('#kp-bait-form-scroll-fix-css'))return;
  const st=document.createElement('style');
  st.id='kp-bait-form-scroll-fix-css';
  st.textContent='html.kp-bait-form-lock,body.kp-bait-form-lock{overscroll-behavior:none!important}.kp-bait-form-panel-active{overscroll-behavior:contain!important}.kp-bait-form-scroll-area{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;scroll-padding-bottom:170px!important}.kp-bait-form-scroll-area input,.kp-bait-form-scroll-area textarea,.kp-bait-form-scroll-area select,.kp-bait-form-scroll-area button{touch-action:manipulation!important}.kp-bait-form-scroll-spacer{display:block!important}';
  document.head.appendChild(st);
})();
setTimeout(update,500);setTimeout(update,1500);
window.kpBaitFormScrollDebug=function(){const p=findBaitPanel();return{baitsPage:isBaitsPage(),panel:p?(p.id||p.className||p.tagName):null,scroll:activeScroll?(activeScroll.id||activeScroll.className||activeScroll.tagName):null,locked,scrollTop:activeScroll&&activeScroll.scrollTop,scrollHeight:activeScroll&&activeScroll.scrollHeight,clientHeight:activeScroll&&activeScroll.clientHeight}};
console.log('[bait-form-scroll-fix] v1.0 aktív');
})();
