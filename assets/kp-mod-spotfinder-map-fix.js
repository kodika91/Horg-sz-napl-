// kp-mod-spotfinder-map-fix.js — modern Helykereső térkép újrainicializálás
(function(){
'use strict';
if(window.KP_MOD_SPOTFINDER_MAP_FIX_V1)return;
window.KP_MOD_SPOTFINDER_MAP_FIX_V1=true;

function active(){var p=document.getElementById('page-spotfinder');return !!(p&&p.classList&&p.classList.contains('active'));}
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY||'horgaszpro_v0230')||'{}')}catch(e){return {};}}
function spots(){var d=db();var a=[];(d.scoutSpots||[]).forEach(function(s){if(s&&s.lat&&s.lon)a.push(s);});(d.locations||[]).forEach(function(l){if(l&&l.lat&&l.lon&&!l.fromSpotFinder)a.push(l);});return a;}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function clearBrokenMap(mapEl){
  try{
    if(window.spotFinderMap&&window.spotFinderMap.getContainer&&window.spotFinderMap.getContainer()!==mapEl){
      window.spotFinderMap.remove();
      window.spotFinderMap=null;
    }
  }catch(e){window.spotFinderMap=null;}
  try{if(mapEl&&mapEl._leaflet_id&&!window.spotFinderMap)delete mapEl._leaflet_id;}catch(e){}
}
function fallbackMap(mapEl){
  if(typeof L==='undefined'||!mapEl)return false;
  try{
    if(window.spotFinderMap)return true;
    mapEl.innerHTML='';
    var list=spots();
    var center=list.length?[Number(list[0].lat),Number(list[0].lon)]:[47.955,21.37];
    var map=L.map(mapEl,{zoomControl:false}).setView(center,list.length?13:10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
    list.forEach(function(s){
      var la=Number(s.lat),lo=Number(s.lon);if(!Number.isFinite(la)||!Number.isFinite(lo))return;
      var m=L.marker([la,lo]).addTo(map);
      m.bindPopup('<b>'+(s.name||'Mentett hely')+'</b><br>'+(s.gps||''));
    });
    if(list.length>1){
      try{map.fitBounds(list.map(function(s){return [Number(s.lat),Number(s.lon)];}),{padding:[30,30]});}catch(e){}
    }
    window.spotFinderMap=map;
    setTimeout(function(){try{map.invalidateSize();}catch(e){}},250);
    return true;
  }catch(e){console.warn('[spot-map-fix] fallback map hiba',e);return false;}
}
function repair(){
  if(!active())return;
  var mapEl=document.getElementById('spotfinder-map-view');
  if(!mapEl)return;
  clearBrokenMap(mapEl);
  var ok=false;
  try{
    if(typeof spotFinderEnsureMap==='function'){spotFinderEnsureMap();ok=!!window.spotFinderMap;}
  }catch(e){console.warn('[spot-map-fix] ensure hiba',e);}
  try{
    if(typeof renderSpotFinderMap==='function'){renderSpotFinderMap();ok=!!window.spotFinderMap;}
  }catch(e){console.warn('[spot-map-fix] render hiba',e);}
  if(!ok)ok=fallbackMap(mapEl);
  try{if(window.spotFinderMap){window.spotFinderMap.invalidateSize();if(typeof sfInjectMapButtons==='function')sfInjectMapButtons();}}catch(e){}
  if(!ok&&mapEl&&!mapEl.querySelector('.kpsfm-map-error')){
    mapEl.innerHTML='<div class="kpsfm-map-error" style="height:100%;min-height:320px;display:grid;place-items:center;text-align:center;color:#735f4b;padding:20px"><div><i class="ti ti-map-off" style="font-size:42px;color:#0f7b88"></i><div style="font-weight:800;margin-top:8px">A térkép nem töltött be</div><div style="font-size:13px;margin-top:5px">Ellenőrizd az internetkapcsolatot, majd frissítsd az oldalt.</div></div></div>';
  }
}
var oldShow=window.showPage;
if(typeof oldShow==='function'&&!oldShow.__kpSpotMapFix){
  window.showPage=function(id){var r=oldShow.apply(this,arguments);if(id==='spotfinder'){setTimeout(repair,250);setTimeout(repair,900);setTimeout(repair,1800);}return r;};
  window.showPage.__kpSpotMapFix=true;
}
setTimeout(repair,800);
setTimeout(repair,1800);
setInterval(repair,2500);
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(repair,250);});
console.log('[spot-map-fix] aktív');
})();