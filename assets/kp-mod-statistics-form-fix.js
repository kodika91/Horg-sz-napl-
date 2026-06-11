// kp-mod-statistics-form-fix.js — Statisztika mobil űrlap olvashatósági javítás
(function(){
'use strict';
if(window.KP_MOD_STATISTICS_FORM_FIX_V1)return;
window.KP_MOD_STATISTICS_FORM_FIX_V1=true;

function addCss(){
  if(document.getElementById('kpst-form-fix-css'))return;
  var s=document.createElement('style');
  s.id='kpst-form-fix-css';
  s.textContent='\
#page-stats .kpst-filter input,#page-stats .kpst-filter select,#page-stats .kpst-filter textarea{background:#082421!important;color:#f4fff9!important;-webkit-text-fill-color:#f4fff9!important;border:1px solid rgba(174,255,230,.26)!important;box-shadow:none!important;appearance:none!important;-webkit-appearance:none!important;accent-color:#35e9b7!important}\
#page-stats .kpst-filter input[type="date"]{color-scheme:dark!important;background:#082421!important;color:#f4fff9!important;-webkit-text-fill-color:#f4fff9!important;min-height:48px}\
#page-stats .kpst-filter input[type="date"]::-webkit-date-and-time-value{color:#f4fff9!important;text-align:left}\
#page-stats .kpst-filter input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1) brightness(1.7);opacity:.85}\
#page-stats .kpst-filter select{background-color:#082421!important;background-image:linear-gradient(45deg,transparent 50%,#baffec 50%),linear-gradient(135deg,#baffec 50%,transparent 50%)!important;background-position:calc(100% - 18px) 19px,calc(100% - 12px) 19px!important;background-size:6px 6px,6px 6px!important;background-repeat:no-repeat!important;padding-right:38px!important}\
#page-stats .kpst-filter select option{background:#082421!important;color:#f4fff9!important}\
#page-stats .kpst-filter input::placeholder{color:rgba(244,255,249,.58)!important;-webkit-text-fill-color:rgba(244,255,249,.58)!important}\
#page-stats .kpst-search input{background:transparent!important;border:0!important;color:#f4fff9!important;-webkit-text-fill-color:#f4fff9!important}\
#page-stats .kpst-filter input:focus,#page-stats .kpst-filter select:focus{outline:none!important;border-color:rgba(93,255,145,.50)!important;box-shadow:0 0 0 3px rgba(93,255,145,.10)!important}\
@media(max-width:820px){#page-stats .kpst-filter input,#page-stats .kpst-filter select{font-size:16px!important;border-radius:16px!important;height:54px!important}#page-stats .kpst-search{height:54px!important;border-radius:16px!important}}';
  document.head.appendChild(s);
}
addCss();
})();