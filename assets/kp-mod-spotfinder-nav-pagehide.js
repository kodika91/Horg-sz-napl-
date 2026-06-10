/* kp-mod-spotfinder-nav-pagehide.js — Visszatalálás sáv eltüntetése menüváltáskor
 * v1.1 · Nem nyúl a helymentéshez. Betölti a modern Helykereső UI modult is.
 */
(function(){
'use strict';
if(window.KP_SPOT_NAV_PAGEHIDE_V1)return;
window.KP_SPOT_NAV_PAGEHIDE_V1=true;

function qs(s,r=document){return r.querySelector(s)}
function isSpotfinderActive(){
  const p=qs('#page-spotfinder');
  if(p&&p.classList&&p.classList.contains('active'))return true;
  const bodyPage=(document.body&&document.body.dataset&&document.body.dataset.page)||'';
  if(String(bodyPage).toLowerCase()==='spotfinder')return true;
  const visible=qs('#page-spotfinder:not([hidden])');
  if(visible){
    const st=getComputedStyle(visible);
    return st.display!=='none'&&st.visibility!=='hidden'&&visible.offsetParent!==null;
  }
  return false;
}
function hardHideOverlay(){
  const ov=qs('#sf-nav-overlay');
  if(ov){
    ov.style.display='none';
    ov.setAttribute('aria-hidden','true');
  }
}
function stopNavSilent(){
  hardHideOverlay();
  try{
    if(window.kpSpotStopNavigation){
      const oldToast=window.showToast;
      window.showToast=function(){};
      try{window.kpSpotStopNavigation()}finally{window.showToast=oldToast;}
    }
  }catch(e){hardHideOverlay();}
}
function onPageMaybeChanged(id){
  if(String(id||'')!=='spotfinder'){
    setTimeout(stopNavSilent,40);
    setTimeout(hardHideOverlay,180);
    setTimeout(hardHideOverlay,700);
  }
}
function wrapShowPage(){
  const old=window.showPage;
  if(typeof old!=='function'||old.__kpSpotNavPagehide)return false;
  const nw=function(id){
    const r=old.apply(this,arguments);
    onPageMaybeChanged(id);
    return r;
  };
  nw.__kpSpotNavPagehide=true;
  window.showPage=nw;
  return true;
}
function loadModernSpotfinder(){
  if(document.getElementById('kp-mod-spotfinder-modern'))return;
  var s=document.createElement('script');
  s.id='kp-mod-spotfinder-modern';
  s.src='assets/kp-mod-spotfinder-modern.js?v=20260610-1';
  s.defer=false;
  document.body.appendChild(s);
}
function watch(){
  wrapShowPage();
  loadModernSpotfinder();
  if(!isSpotfinderActive())hardHideOverlay();
}
setTimeout(wrapShowPage,300);
setTimeout(wrapShowPage,1200);
setTimeout(loadModernSpotfinder,500);
setInterval(watch,900);
document.addEventListener('click',function(){setTimeout(watch,120);},true);
window.addEventListener('hashchange',function(){setTimeout(watch,60);});
console.log('[spot-nav-pagehide] aktív: modern Helykereső loaderrel.');
})();