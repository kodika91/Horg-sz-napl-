/* kp-mod-mobile-modal-scroll-fix.js — iPhone/Safari modál görgetés javítás
 * v1.0 · Cél: Fogás hozzáadása / űrlap modál esetén ne a háttér, hanem a megnyitott lap görögjön.
 * Nem nyúl mentéshez, helykeresőhöz, DB-hez.
 */
(function(){
'use strict';
if(window.KP_MOBILE_MODAL_SCROLL_FIX_V1)return;
window.KP_MOBILE_MODAL_SCROLL_FIX_V1=true;

let locked=false, lockY=0, activeScroller=null;
const MODAL_SEL=[
  '.modal.show','.modal.active','.modal.open','.modal-overlay.show','.modal-overlay.active','.modal-overlay.open',
  '.bottom-sheet.show','.bottom-sheet.active','.bottom-sheet.open','.sheet.show','.sheet.active','.sheet.open',
  '.dialog.show','.dialog.active','.dialog.open','[role="dialog"]',
  '#catch-modal','#active-catch-modal','#add-catch-modal','#catchModal','#activeCatchModal','#addCatchModal',
  '#event-modal','#photo-modal','#fish-detail-modal'
].join(',');
const FORM_HINT_SEL='#ac-bait,#ac-method,#ac-weight,#ac-length,#ac-fish,#active-catch-form,#catch-form,input[list="bait-options"],input[list="method-options"]';
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function visible(el){
  if(!el||!el.isConnected)return false;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  const r=el.getBoundingClientRect();
  return r.width>20&&r.height>20;
}
function isFixedLike(el){
  if(!el)return false;
  let n=el;
  for(let i=0;n&&n!==document.body&&i<4;i++,n=n.parentElement){
    const p=getComputedStyle(n).position;
    if(p==='fixed'||p==='sticky')return true;
  }
  return false;
}
function findModal(){
  const direct=qsa(MODAL_SEL).filter(visible);
  const withForm=direct.find(m=>qs(FORM_HINT_SEL,m));
  if(withForm)return withForm;
  if(direct.length)return direct[direct.length-1];
  const hint=qs(FORM_HINT_SEL);
  if(hint){
    let n=hint;
    for(let i=0;n&&n!==document.body&&i<8;i++,n=n.parentElement){
      if(visible(n)&&isFixedLike(n))return n;
      const st=getComputedStyle(n);
      if(visible(n)&&(st.overflowY==='auto'||st.overflowY==='scroll'))return n;
    }
  }
  return null;
}
function makeScrollable(modal){
  if(!modal)return null;
  const candidates=[
    modal,
    qs('.modal-content',modal),qs('.modal-body',modal),qs('.sheet-body',modal),qs('.bottom-sheet-body',modal),
    qs('.form-modal',modal),qs('.event-form-grid',modal)?.parentElement,
    qs('form',modal)?.parentElement
  ].filter(Boolean);
  let best=candidates.find(el=>el.scrollHeight>el.clientHeight+20)||candidates[0];
  if(!best)best=modal;
  modal.classList.add('kp-mobile-modal-open');
  best.classList.add('kp-mobile-modal-scroll-area');
  best.style.overflowY='auto';
  best.style.webkitOverflowScrolling='touch';
  best.style.overscrollBehavior='contain';
  best.style.maxHeight='calc(100dvh - 24px)';
  if(best!==modal){modal.style.overflow='hidden';modal.style.maxHeight='100dvh';}
  activeScroller=best;
  return best;
}
function lockBody(){
  if(locked)return;
  lockY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.classList.add('kp-modal-scroll-lock');
  document.body.classList.add('kp-modal-scroll-lock');
  document.body.style.position='fixed';
  document.body.style.top='-'+lockY+'px';
  document.body.style.left='0';
  document.body.style.right='0';
  document.body.style.width='100%';
  document.body.style.overflow='hidden';
  locked=true;
}
function unlockBody(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-modal-scroll-lock');
  document.body.classList.remove('kp-modal-scroll-lock');
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.left='';
  document.body.style.right='';
  document.body.style.width='';
  document.body.style.overflow='';
  window.scrollTo(0,lockY||0);
  locked=false;activeScroller=null;
}
function update(){
  const modal=findModal();
  if(modal){makeScrollable(modal);lockBody();}
  else{unlockBody();}
}
function canScroll(el,dy){
  if(!el)return false;
  if(el.scrollHeight<=el.clientHeight+2)return false;
  if(dy<0&&el.scrollTop<=0)return false;
  if(dy>0&&el.scrollTop+el.clientHeight>=el.scrollHeight-1)return false;
  return true;
}
let lastY=null;
document.addEventListener('touchstart',function(e){lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null;update();},{passive:true,capture:true});
document.addEventListener('touchmove',function(e){
  if(!locked)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y);
  lastY=y;
  const modal=findModal();
  if(!modal){unlockBody();return;}
  const t=e.target;
  let sc=t&&t.closest?t.closest('.kp-mobile-modal-scroll-area'):null;
  if(!sc)sc=activeScroller||makeScrollable(modal);
  if(sc&&modal.contains(t)&&canScroll(sc,dy))return;
  e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('click',function(){setTimeout(update,80);setTimeout(update,350);},true);
window.addEventListener('resize',function(){setTimeout(update,80);});
window.addEventListener('orientationchange',function(){setTimeout(update,250);});
setInterval(update,700);
(function style(){
  if(qs('#kp-mobile-modal-scroll-fix-css'))return;
  const st=document.createElement('style');
  st.id='kp-mobile-modal-scroll-fix-css';
  st.textContent='html.kp-modal-scroll-lock,body.kp-modal-scroll-lock{overscroll-behavior:none!important;touch-action:none}.kp-mobile-modal-open{overscroll-behavior:contain!important}.kp-mobile-modal-scroll-area{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;max-height:calc(100dvh - 24px)!important}.kp-mobile-modal-scroll-area input,.kp-mobile-modal-scroll-area textarea,.kp-mobile-modal-scroll-area select,.kp-mobile-modal-scroll-area button{touch-action:manipulation}';
  document.head.appendChild(st);
})();
setTimeout(update,500);
console.log('[mobile-modal-scroll-fix] aktív');
})();
