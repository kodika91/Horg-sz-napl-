/* kp-mod-statistics-bait-icons.js — csalinévhez tartozó, stabil ikonok */
(function(){
'use strict';
if(window.KP_STATISTICS_BAIT_ICONS_V1)return;
window.KP_STATISTICS_BAIT_ICONS_V1=true;

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
function apply(){
  document.querySelectorAll('#page-stats .kpst-card').forEach(function(card){
    var title=card.querySelector('h2');
    if(!title||norm(title.textContent)!=='legeredmenyesebbcsalik')return;
    card.querySelectorAll('.kpst-rank').forEach(function(row){
      var name=row.querySelector('.name'),ico=row.querySelector('.ico');
      if(name&&ico)ico.textContent=baitIcon(name.textContent);
    });
  });
}
var observer=new MutationObserver(function(){apply()});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',function(){setTimeout(apply,0);setTimeout(apply,200)},true);
setTimeout(apply,300);setInterval(apply,1500);
})();