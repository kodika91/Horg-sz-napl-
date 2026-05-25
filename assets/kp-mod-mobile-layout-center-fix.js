/* kp-mod-mobile-layout-center-fix.js — mobil középre igazítás / vízszintes túlnyúlás javítás
 * v1.0 · Csak CSS/layout hotfix, adatot és mentést nem módosít.
 */
(function(){
'use strict';
if(window.KP_MOBILE_LAYOUT_CENTER_FIX_V1)return;
window.KP_MOBILE_LAYOUT_CENTER_FIX_V1=true;
function inject(){
  if(document.getElementById('kp-mobile-layout-center-fix-css'))return;
  const st=document.createElement('style');
  st.id='kp-mobile-layout-center-fix-css';
  st.textContent=`
    html,body{max-width:100%!important;overflow-x:hidden!important;}
    body{margin-left:0!important;margin-right:0!important;}
    .app,.app-shell,.page,.page-content,.screen,.main,.content,#app,#root,[id^="page-"]{
      box-sizing:border-box!important;
      max-width:100vw!important;
    }
    @media(max-width:760px){
      .app,.app-shell,#app,#root,.main,.content,.page,.page-content,[id^="page-"]{
        width:100%!important;
        margin-left:auto!important;
        margin-right:auto!important;
        overflow-x:hidden!important;
      }
      .card,.section,.panel,.item-list-card,.bait-card,.fish-card,.session-card,.location-card{
        box-sizing:border-box!important;
        max-width:calc(100vw - 24px)!important;
      }
      img,canvas,svg,video{max-width:100%!important;}
      .horizontal-scroll,.tabs,.chip-row,.btn-row{max-width:100%!important;}
    }
  `;
  document.head.appendChild(st);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
setTimeout(inject,500);setTimeout(inject,1500);
console.log('[mobile-layout-center-fix] aktív');
})();
