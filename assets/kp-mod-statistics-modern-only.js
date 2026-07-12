/* kp-mod-statistics-modern-only.js — csak a modern statisztika marad aktív */
(function(){
'use strict';
if(window.KP_STATISTICS_MODERN_ONLY_V2)return;
window.KP_STATISTICS_MODERN_ONLY_V2=true;
window.KP_STATISTICS_MODERN_ONLY_V1=true;
var busy=false,cleaned=false;

function modern(){return typeof window.KP_RENDER_STATS==='function'?window.KP_RENDER_STATS:null}
function removeLegacy(){
  var root=document.getElementById('page-stats');
  if(root&&!cleaned){root.innerHTML='';cleaned=true}
  try{delete window.renderStats}catch(e){window.renderStats=undefined}
  try{delete window.renderStatistics}catch(e){window.renderStatistics=undefined}
}
function installModernAliases(){
  var fn=modern();if(!fn)return false;
  window.renderStats=fn;
  window.renderStatistics=fn;
  return true;
}
function renderModern(){
  if(busy)return;
  var root=document.getElementById('page-stats');
  if(!root||!root.classList.contains('active'))return;
  var fn=modern();if(!fn)return;
  busy=true;
  try{root.innerHTML='';fn()}catch(e){console.warn('[modern-stats-only] render hiba',e)}
  finally{setTimeout(function(){busy=false},0)}
}
function ensure(){
  removeLegacy();
  if(!installModernAliases())return;
  var root=document.getElementById('page-stats');
  if(root&&root.classList.contains('active')&&!root.querySelector('.kpst'))renderModern();
}

var observer=new MutationObserver(function(mutations){
  if(busy)return;
  var root=document.getElementById('page-stats');
  if(!root||!root.classList.contains('active'))return;
  var touched=mutations.some(function(m){return m.target===root||root.contains(m.target)});
  if(touched&&!root.querySelector('.kpst'))setTimeout(renderModern,0);
});
observer.observe(document.documentElement,{childList:true,subtree:true});

document.addEventListener('click',function(){setTimeout(ensure,0);setTimeout(ensure,120);setTimeout(ensure,400)},true);
setTimeout(ensure,40);
setTimeout(ensure,200);
setTimeout(ensure,600);
setInterval(ensure,1000);
})();