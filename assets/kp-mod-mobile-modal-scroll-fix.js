/* kp-mod-mobile-modal-scroll-fix.js — gyors fogás űrlap alsó gomb elérhetőség javítás
 * v1.4 · Fontos szűkítés: csak a gyors fogás űrlapra aktiválódik, csali hozzáadásnál nem zárja le a scrollt.
 * Nem nyúl mentéshez, helykeresőhöz, DB-hez.
 */
(function(){
'use strict';
if(window.KP_MOBILE_MODAL_SCROLL_FIX_V14)return;
window.KP_MOBILE_MODAL_SCROLL_FIX_V14=true;

let locked=false, activePanel=null, activeScroll=null, lastY=null, spacer=null;
const FIELD_SEL='#ac-bait,#ac-method,#ac-weight,#ac-length,#ac-fish,#ac-count,#ac-photo';
const REQUIRED_SEL='#ac-bait';
const SECONDARY_SEL='#ac-method,#ac-weight,#ac-length,#ac-fish,#ac-count,#ac-photo';
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function visible(el){
  if(!el||!el.isConnected)return false;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  const r=el.getBoundingClientRect();
  return r.width>35&&r.height>35;
}
function quickCatchActive(){
  const main=qs(REQUIRED_SEL);
  if(!visible(main))return false;
  return qsa(SECONDARY_SEL).some(visible);
}
function field(){return quickCatchActive()?qs(REQUIRED_SEL):null}
function containsFields(el){return !!(el&&qs(REQUIRED_SEL,el)&&qs(SECONDARY_SEL,el))}
function goodContainerName(el){return /modal|sheet|dialog|drawer|popup|catch|fog|active|form|panel|content|body/i.test((el.id||'')+' '+(el.className||''))}
function nearestPanelFromField(f){
  if(!f)return null;
  let best=null, n=f;
  for(let i=0;n&&n!==document.body&&i<16;i++,n=n.parentElement){
    if(!visible(n)||!containsFields(n))continue;
    const r=n.getBoundingClientRect();
    const st=getComputedStyle(n);
    const controls=n.querySelectorAll('input,select,textarea,button').length;
    let score=0;
    if(goodContainerName(n))score+=25;
    if(st.position==='fixed'||st.position==='absolute')score+=18;
    if(r.height>260)score+=12;
    if(r.width>260)score+=4;
    score+=Math.min(controls,14);
    if(!best||score>best.score)best={el:n,score};
  }
  return best&&best.el;
}
function findPanel(){const f=field();return f?nearestPanelFromField(f):null}
function findScrollArea(panel){
  if(!panel)return null;
  const named=['.modal-body','.modal-content','.sheet-body','.bottom-sheet-body','.drawer-body','.dialog-body','.event-form-grid','.form-grid','form'];
  for(const s of named){
    const el=qs(s,panel);
    if(el&&containsFields(el))return el.closest('.modal-body,.modal-content,.sheet-body,.bottom-sheet-body,.drawer-body,.dialog-body')||el.parentElement||el;
  }
  return panel;
}
function ensureSpacer(sc){
  if(!sc)return;
  spacer=sc.querySelector(':scope > .kp-catch-scroll-spacer');
  if(!spacer){
    spacer=document.createElement('div');
    spacer.className='kp-catch-scroll-spacer';
    spacer.setAttribute('aria-hidden','true');
    spacer.style.cssText='height:180px;min-height:180px;flex:0 0 180px;pointer-events:none';
    sc.appendChild(spacer);
  }
}
function lockBody(){
  if(locked)return;
  document.body.classList.add('kp-catch-scroll-lock');
  document.documentElement.classList.add('kp-catch-scroll-lock');
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  locked=true;
}
function unlockBody(){
  if(!locked)return;
  document.body.classList.remove('kp-catch-scroll-lock');
  document.documentElement.classList.remove('kp-catch-scroll-lock');
  document.body.style.overflow='';
  document.documentElement.style.overflow='';
  if(activePanel){activePanel.classList.remove('kp-catch-panel-active');}
  if(activeScroll){
    activeScroll.classList.remove('kp-catch-scroll-area');
    activeScroll.style.overflowY='';
    activeScroll.style.webkitOverflowScrolling='';
    activeScroll.style.overscrollBehavior='';
    activeScroll.style.touchAction='';
    activeScroll.style.maxHeight='';
    activeScroll.style.height='';
    activeScroll.style.paddingBottom='';
  }
  activePanel=null;activeScroll=null;locked=false;
}
function activate(panel){
  if(!panel)return;
  activePanel=panel;
  activeScroll=findScrollArea(panel)||panel;
  panel.classList.add('kp-catch-panel-active');
  activeScroll.classList.add('kp-catch-scroll-area');
  const vh=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||700;
  const max=Math.max(320,Math.floor(vh-16));
  activeScroll.style.overflowY='auto';
  activeScroll.style.webkitOverflowScrolling='touch';
  activeScroll.style.overscrollBehavior='contain';
  activeScroll.style.touchAction='pan-y';
  activeScroll.style.maxHeight=max+'px';
  activeScroll.style.height='auto';
  activeScroll.style.paddingBottom='max(190px, calc(150px + env(safe-area-inset-bottom)))';
  ensureSpacer(activeScroll);
  lockBody();
}
function update(){const p=findPanel();if(p&&field())activate(p);else unlockBody()}
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
document.addEventListener('click',function(){setTimeout(update,50);setTimeout(update,250);setTimeout(update,800);},true);
window.addEventListener('resize',function(){setTimeout(update,100)});
if(window.visualViewport)visualViewport.addEventListener('resize',function(){setTimeout(update,80)});
window.addEventListener('orientationchange',function(){setTimeout(update,350)});
setInterval(update,700);
(function style(){
  if(qs('#kp-mobile-modal-scroll-fix-css'))qs('#kp-mobile-modal-scroll-fix-css').remove();
  const st=document.createElement('style');st.id='kp-mobile-modal-scroll-fix-css';
  st.textContent='html.kp-catch-scroll-lock,body.kp-catch-scroll-lock{overscroll-behavior:none!important}.kp-catch-panel-active{overscroll-behavior:contain!important;max-height:calc(100dvh - 8px)!important}.kp-catch-scroll-area{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;scroll-padding-bottom:190px!important}.kp-catch-scroll-area input,.kp-catch-scroll-area textarea,.kp-catch-scroll-area select,.kp-catch-scroll-area button{touch-action:manipulation!important}.kp-catch-scroll-spacer{display:block!important}';
  document.head.appendChild(st);
})();
setTimeout(update,500);setTimeout(update,1500);
window.kpCatchModalScrollDebug=function(){const p=findPanel();return{quickCatchActive:quickCatchActive(),field:!!field(),panel:p?(p.id||p.className||p.tagName):null,scroll:activeScroll?(activeScroll.id||activeScroll.className||activeScroll.tagName):null,locked,scrollTop:activeScroll&&activeScroll.scrollTop,scrollHeight:activeScroll&&activeScroll.scrollHeight,clientHeight:activeScroll&&activeScroll.clientHeight}};
console.log('[mobile-modal-scroll-fix] v1.4 aktív · csak gyors fogásra');
})();
