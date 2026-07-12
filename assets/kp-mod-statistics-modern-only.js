/* kp-mod-statistics-modern-only.js — csak a modern statisztika marad aktív */
(function(){
'use strict';
if(window.KP_STATISTICS_MODERN_ONLY_V3)return;
window.KP_STATISTICS_MODERN_ONLY_V3=true;
window.KP_STATISTICS_MODERN_ONLY_V2=true;
window.KP_STATISTICS_MODERN_ONLY_V1=true;
var busy=false,cleaned=false;

function norm(v){return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function baitIcon(name){
  var n=norm(name);
  if(n==='csalihal'||n.indexOf('kishal')>=0)return '🐟';
  if(n==='csonti'||n.indexOf('nyuv')>=0||n.indexOf('larva')>=0)return '🐛';
  if(n.indexOf('gumikukorica')>=0||n.indexOf('kukorica')>=0)return '🌽';
  if(n.indexOf('tigrismogyoro')>=0)return '🥜';
  if(n.indexOf('promix')>=0||n.indexOf('pellet')>=0)return '🟢';
  if(n.indexOf('bojli')>=0)return '🟤';
  if(n.indexOf('giliszta')>=0)return '🪱';
  return '🎣';
}
function applyBaitIcons(){
  document.querySelectorAll('#page-stats .kpst-card').forEach(function(card){
    var title=card.querySelector('h2');
    if(!title||norm(title.textContent)!=='legeredmenyesebbcsalik')return;
    card.querySelectorAll('.kpst-rank').forEach(function(row){
      var name=row.querySelector('.name'),ico=row.querySelector('.ico');
      if(name&&ico)ico.textContent=baitIcon(name.textContent);
    });
  });
}
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
  try{root.innerHTML='';fn();setTimeout(applyBaitIcons,0)}catch(e){console.warn('[modern-stats-only] render hiba',e)}
  finally{setTimeout(function(){busy=false},0)}
}
function ensure(){
  removeLegacy();
  if(!installModernAliases())return;
  var root=document.getElementById('page-stats');
  if(root&&root.classList.contains('active')&&!root.querySelector('.kpst'))renderModern();
  applyBaitIcons();
}

var observer=new MutationObserver(function(mutations){
  if(busy)return;
  var root=document.getElementById('page-stats');
  if(!root||!root.classList.contains('active'))return;
  var touched=mutations.some(function(m){return m.target===root||root.contains(m.target)});
  if(touched&&!root.querySelector('.kpst'))setTimeout(renderModern,0);
  if(touched)setTimeout(applyBaitIcons,0);
});
observer.observe(document.documentElement,{childList:true,subtree:true});

document.addEventListener('click',function(){setTimeout(ensure,0);setTimeout(ensure,120);setTimeout(ensure,400)},true);
setTimeout(ensure,40);
setTimeout(ensure,200);
setTimeout(ensure,600);
setInterval(ensure,1000);
})();