/* kp-mod-statistics-modern-only.js — a régi statisztika végleges kiváltása */
(function(){
'use strict';
if(window.KP_STATISTICS_MODERN_ONLY_V1)return;
window.KP_STATISTICS_MODERN_ONLY_V1=true;
var busy=false;

function modern(){
  return typeof window.KP_RENDER_STATS==='function'?window.KP_RENDER_STATS:null;
}
function renderModern(){
  if(busy)return;
  var root=document.getElementById('page-stats');
  if(!root||!root.classList.contains('active'))return;
  var fn=modern();
  if(!fn)return;
  busy=true;
  try{fn()}catch(e){console.warn('[modern-stats-only] render hiba',e)}
  finally{setTimeout(function(){busy=false},0)}
}
function installAliases(){
  var fn=modern();
  if(!fn)return false;
  window.renderStats=fn;
  window.renderStatistics=fn;
  return true;
}
function ensure(){
  if(!installAliases())return;
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
setTimeout(ensure,100);
setTimeout(ensure,500);
setInterval(ensure,800);
})();
