/* kp-mod-mobile-modal-scroll-fix.js — iPhone/Safari gyors fogás modál görgetés javítás
 * v1.1 · Erősebb célzás: az ac-* fogásmezők alapján közvetlenül a gyors fogás lapot görgeti.
 * Nem nyúl mentéshez, helykeresőhöz, DB-hez.
 */
(function(){
'use strict';
if(window.KP_MOBILE_MODAL_SCROLL_FIX_V11)return;
window.KP_MOBILE_MODAL_SCROLL_FIX_V11=true;

let locked=false, lockY=0, activePanel=null, activeScroller=null, backdrop=null, lastY=null;
const FIELD_SEL='#ac-bait,#ac-method,#ac-weight,#ac-length,#ac-fish,#ac-count,#ac-photo,input[list="bait-options"],input[list="method-options"]';
const MODAL_SEL='.modal,.modal-overlay,.bottom-sheet,.sheet,.dialog,[role="dialog"],#catch-modal,#active-catch-modal,#add-catch-modal,#catchModal,#activeCatchModal,#addCatchModal';
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function visible(el){
  if(!el||!el.isConnected)return false;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  const r=el.getBoundingClientRect();
  return r.width>40&&r.height>40;
}
function hasCatchFields(el){return !!(el&&qs(FIELD_SEL,el));}
function fieldVisible(){return qsa(FIELD_SEL).find(visible)||null;}
function score(el){
  if(!el||el===document.body||el===document.documentElement)return -1;
  const r=el.getBoundingClientRect();
  const st=getComputedStyle(el);
  let s=0;
  if(hasCatchFields(el))s+=20;
  if(/modal|sheet|dialog|overlay|drawer|popup|catch|fog/i.test(el.id+' '+el.className))s+=18;
  if(st.position==='fixed'||st.position==='absolute')s+=10;
  if(r.height>280)s+=8;
  if(r.width>260)s+=4;
  const controls=el.querySelectorAll('input,select,textarea,button').length;
  s+=Math.min(controls,10);
  if(r.height>window.innerHeight*0.95)s-=8;
  return s;
}
function findCatchPanel(){
  const direct=qsa(MODAL_SEL).filter(visible).filter(hasCatchFields).sort((a,b)=>score(b)-score(a))[0];
  if(direct)return direct;
  const f=fieldVisible();
  if(!f)return null;
  let best=null,bestScore=-1,n=f;
  for(let i=0;n&&n!==document.body&&i<12;i++,n=n.parentElement){
    if(!visible(n))continue;
    const sc=score(n);
    if(sc>bestScore){best=n;bestScore=sc;}
  }
  return best;
}
function ensureBackdrop(){
  if(backdrop&&backdrop.isConnected)return backdrop;
  backdrop=document.createElement('div');
  backdrop.id='kp-catch-scroll-backdrop';
  backdrop.style.cssText='position:fixed;inset:0;z-index:100030;background:rgba(0,0,0,.22);display:none;touch-action:none';
  document.body.appendChild(backdrop);
  return backdrop;
}
function lockBody(){
  if(locked)return;
  lockY=window.scrollY||document.documentElement.scrollTop||0;
  document.documentElement.classList.add('kp-catch-modal-lock');
  document.body.classList.add('kp-catch-modal-lock');
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
  document.documentElement.classList.remove('kp-catch-modal-lock');
  document.body.classList.remove('kp-catch-modal-lock');
  document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';document.body.style.overflow='';
  if(activePanel){activePanel.classList.remove('kp-catch-modal-panel');activePanel.style.removeProperty('position');activePanel.style.removeProperty('inset');activePanel.style.removeProperty('z-index');activePanel.style.removeProperty('overflow-y');activePanel.style.removeProperty('-webkit-overflow-scrolling');activePanel.style.removeProperty('max-height');activePanel.style.removeProperty('height');activePanel.style.removeProperty('overscroll-behavior');activePanel.style.removeProperty('touch-action');}
  if(backdrop)backdrop.style.display='none';
  window.scrollTo(0,lockY||0);
  locked=false;activePanel=null;activeScroller=null;
}
function activate(panel){
  if(!panel)return;
  activePanel=panel;
  activeScroller=panel;
  const bd=ensureBackdrop();
  bd.style.display='block';
  panel.classList.add('kp-catch-modal-panel');
  panel.style.position='fixed';
  panel.style.inset='max(8px, env(safe-area-inset-top)) 10px max(8px, env(safe-area-inset-bottom)) 10px';
  panel.style.zIndex='100040';
  panel.style.overflowY='auto';
  panel.style.webkitOverflowScrolling='touch';
  panel.style.overscrollBehavior='contain';
  panel.style.touchAction='pan-y';
  panel.style.maxHeight='calc(100dvh - 16px)';
  panel.style.height='auto';
  lockBody();
}
function update(){
  const p=findCatchPanel();
  if(p&&fieldVisible()){activate(p);}
  else{unlockBody();}
}
function canScroll(el,dy){
  if(!el)return false;
  if(el.scrollHeight<=el.clientHeight+2)return false;
  if(dy<0&&el.scrollTop<=0)return false;
  if(dy>0&&el.scrollTop+el.clientHeight>=el.scrollHeight-1)return false;
  return true;
}
document.addEventListener('touchstart',function(e){lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null;setTimeout(update,0);},{passive:true,capture:true});
document.addEventListener('touchmove',function(e){
  if(!locked)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y);
  lastY=y;
  const t=e.target;
  if(activePanel&&activePanel.contains(t)&&canScroll(activeScroller,dy))return;
  e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('click',function(){setTimeout(update,80);setTimeout(update,350);setTimeout(update,900);},true);
window.addEventListener('resize',function(){setTimeout(update,80)});
window.addEventListener('orientationchange',function(){setTimeout(update,300)});
setInterval(update,650);
(function style(){
  if(qs('#kp-mobile-modal-scroll-fix-css'))qs('#kp-mobile-modal-scroll-fix-css').remove();
  const st=document.createElement('style');st.id='kp-mobile-modal-scroll-fix-css';
  st.textContent='html.kp-catch-modal-lock,body.kp-catch-modal-lock{overscroll-behavior:none!important}.kp-catch-modal-panel{background:var(--card,#faf8f4)!important;border-radius:18px!important;box-shadow:0 18px 60px rgba(0,0,0,.28)!important;padding-bottom:max(24px,env(safe-area-inset-bottom))!important;-webkit-overflow-scrolling:touch!important}.kp-catch-modal-panel input,.kp-catch-modal-panel textarea,.kp-catch-modal-panel select,.kp-catch-modal-panel button{touch-action:manipulation!important}@media(min-width:760px){.kp-catch-modal-panel{max-width:640px!important;margin:auto!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:min(640px,calc(100vw - 24px))!important}}';
  document.head.appendChild(st);
})();
setTimeout(update,500);setTimeout(update,1500);
window.kpCatchModalScrollDebug=function(){const p=findCatchPanel();return{field:!!fieldVisible(),panel:p?(p.id||p.className||p.tagName):null,locked,scrollHeight:p&&p.scrollHeight,clientHeight:p&&p.clientHeight}};
console.log('[mobile-modal-scroll-fix] v1.1 aktív');
})();
