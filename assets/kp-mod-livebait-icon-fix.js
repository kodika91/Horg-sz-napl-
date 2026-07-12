/* Sneci / élőhalas csali ikon javítás a statisztikában és csalik nézetben. */
(function(){
'use strict';
if(window.KP_LIVEBAIT_ICON_FIX_V1)return;
window.KP_LIVEBAIT_ICON_FIX_V1=true;

function norm(v){return String(v==null?'':v).trim().toLowerCase().replace(/[áéíóöőúüű]/g,function(c){return {'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u'}[c]}).replace(/[^a-z0-9]+/g,'')}
function isLiveBaitName(v){var n=norm(v);return n==='sneci'||n.includes('elohal')||n.includes('csalihal')}
function patch(){
  document.querySelectorAll('.kpst-rank').forEach(function(row){
    var name=row.querySelector('.name');
    var ico=row.querySelector('.ico');
    if(name&&ico&&isLiveBaitName(name.textContent))ico.textContent='🐟';
  });
  document.querySelectorAll('.kpst-side section').forEach(function(section){
    var h=section.querySelector('h3');
    var name=section.querySelector('.kpst-feature b');
    var ico=section.querySelector('.kpst-feature>span');
    if(h&&/leghatékonyabb csali/i.test(h.textContent||'')&&name&&ico&&isLiveBaitName(name.textContent))ico.textContent='🐟';
  });
  document.querySelectorAll('.kpbm-card').forEach(function(card){
    var name=card.querySelector('.kpbm-name');
    var sub=card.querySelector('.kpbm-sub');
    if(!name||!isLiveBaitName(name.textContent)&&!(sub&&isLiveBaitName(sub.textContent)))return;
    var noimg=card.querySelector('.kpbm-noimg');
    if(noimg){noimg.innerHTML='<i class="ti ti-fish"></i><b>Élőhalas csali</b><span>Halcsali</span>';}
  });
}
var obs=new MutationObserver(function(){patch()});
obs.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(patch,500);setTimeout(patch,1500);setInterval(patch,3000);
})();