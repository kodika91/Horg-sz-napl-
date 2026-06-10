// kp-mod-home-api-fix.js — modern főoldal időjárás, tilalom, Új túra javítás
(function(){
'use strict';
if(window.KP_MOD_HOME_API_FIX_V1)return;
window.KP_MOD_HOME_API_FIX_V1=true;

function qs(id){return document.getElementById(id)}
function make(id,tag,parent){var e=qs(id);if(e)return e;e=document.createElement(tag||'div');e.id=id;(parent||document.body).appendChild(e);return e;}
function ensureWeatherNodes(){
  make('gps-dot','span');make('gps-text','span');
  var page=qs('page-home')||document.body;
  make('weather-loading','div',page).style.display='none';
  make('weather-data','div',page).style.display='none';
  ['w-icon','w-temp','w-desc','w-loc','w-wind','w-hum','w-pres','w-feel','forecast-grid','cta-sub'].forEach(function(id){make(id,'div',page);});
  var ba=make('ban-alert','div',page);ba.style.display='none';make('ban-text','div',ba);
}
function injectCss(){if(qs('kph-api-fix-css'))return;var s=document.createElement('style');s.id='kph-api-fix-css';s.textContent='#gps-dot,#gps-text,#weather-loading,#weather-data,#ban-alert,#ban-text{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}.kph-global-links button.new-trip{background:linear-gradient(135deg,#5dff91,#2ed5ff)!important;color:#041514!important;border:0!important}.kph-global-links button.new-trip i{color:#041514!important}.kph-ban-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.kph-ban-list div{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:15px;display:grid;gap:5px}.kph-ban-list i{color:#ff826b;font-size:25px}.kph-ban-list small{color:rgba(230,255,248,.70)}';document.head.appendChild(s);}
function addNewTripNav(){var links=document.querySelector('.kph-global-links');if(!links||links.querySelector('[data-page="new-session"]'))return;var b=document.createElement('button');b.dataset.page='new-session';b.className='new-trip';b.innerHTML='<i class="ti ti-plus"></i>Új túra';b.onclick=function(){if(window.showPage)showPage('new-session',b);};links.insertBefore(b,links.children[1]||null);}
function banNamesFromOldLogic(){
  ensureWeatherNodes();
  try{if(typeof checkBans==='function')checkBans();}catch(e){}
  var text=(qs('ban-text')&&qs('ban-text').textContent)||'';
  var m=text.match(/figyelmeztetés alatt:\s*(.*?)\.\s*A helyi/i)||text.match(/alatt:\s*(.*?)\./i);
  if(!m||!m[1])return [];
  return m[1].split(',').map(function(x){return x.trim();}).filter(Boolean);
}
function renderBans(){var card=document.querySelector('.kph-card.bans');if(!card)return;var names=banNamesFromOldLogic();if(!names.length)return;card.innerHTML='<h3>Aktuális tilalom alatt álló halak</h3><div class="kph-ban-list">'+names.map(function(n){return '<div><i class="ti ti-fish-off"></i><span>'+n+'</span><small>Aktív tilalom</small></div>';}).join('')+'</div><p style="color:rgba(230,255,248,.70);margin-top:12px">A helyi horgászrend eltérhet, indulás előtt ellenőrizd.</p>';}
function safeWeatherRefresh(){
  ensureWeatherNodes();
  try{if(typeof fetchWeather==='function')fetchWeather(true);}catch(e){console.warn('[home-api-fix] fetchWeather hiba',e);}
  setTimeout(function(){try{if(typeof updateHome==='function')updateHome();}catch(e){}renderBans();},900);
  setTimeout(function(){try{if(typeof updateHome==='function')updateHome();}catch(e){}renderBans();},2200);
}
function wrapGpsAndWeather(){
  var oldGet=window.getLocation;
  if(typeof oldGet==='function'&&!oldGet.__kphApiFix){
    window.getLocation=function(){ensureWeatherNodes();var r=oldGet.apply(this,arguments);setTimeout(safeWeatherRefresh,1400);setTimeout(safeWeatherRefresh,3500);return r;};
    window.getLocation.__kphApiFix=true;
  }
  var oldFetch=window.fetchWeather;
  if(typeof oldFetch==='function'&&!oldFetch.__kphApiFix){
    window.fetchWeather=function(force){ensureWeatherNodes();var r=oldFetch.apply(this,arguments);setTimeout(function(){try{if(typeof updateHome==='function')updateHome();}catch(e){}renderBans();},800);return r;};
    window.fetchWeather.__kphApiFix=true;
  }
}
function tick(){injectCss();ensureWeatherNodes();addNewTripNav();wrapGpsAndWeather();renderBans();}
setTimeout(tick,300);setTimeout(tick,1200);setTimeout(tick,2500);setInterval(tick,1800);
})();