// kp-mod-journal-weather-fix.js — célzott javítás: Napló szűrők + Open-Meteo GPS időjárás
(function(){
'use strict';
if(window.KP_MOD_JOURNAL_WEATHER_FIX_V1)return;
window.KP_MOD_JOURNAL_WEATHER_FIX_V1=true;

function addCss(){
  if(document.getElementById('kpj-select-readability-fix'))return;
  var s=document.createElement('style');
  s.id='kpj-select-readability-fix';
  s.textContent='\
.kpj-input,.kpj-select{background:#082421!important;color:#f4fff9!important;border:1px solid rgba(174,255,230,.24)!important;-webkit-text-fill-color:#f4fff9!important;appearance:none!important;-webkit-appearance:none!important;background-image:linear-gradient(45deg,transparent 50%,rgba(244,255,249,.88) 50%),linear-gradient(135deg,rgba(244,255,249,.88) 50%,transparent 50%)!important;background-position:calc(100% - 18px) 17px,calc(100% - 12px) 17px!important;background-size:6px 6px,6px 6px!important;background-repeat:no-repeat!important}.kpj-input::placeholder{color:rgba(244,255,249,.62)!important;-webkit-text-fill-color:rgba(244,255,249,.62)!important}.kpj-select option{background:#082421!important;color:#f4fff9!important}.kpj-select:focus,.kpj-input:focus{outline:none!important;border-color:rgba(93,255,145,.48)!important;box-shadow:0 0 0 3px rgba(93,255,145,.10)!important}@supports (-webkit-touch-callout:none){.kpj-select{background-color:#082421!important;color:#f4fff9!important}}';
  document.head.appendChild(s);
}

function n(v){var x=Number(v);return Number.isFinite(x)?x:0}
function setText(id,value){var el=document.getElementById(id);if(el)el.textContent=value}
function weatherDesc(code){
  var c=Number(code);
  if(typeof window.wDesc==='function'){try{return window.wDesc(c)}catch(e){}}
  if(c===0)return 'Derült';
  if(c===1||c===2)return 'Részben felhős';
  if(c===3)return 'Borult';
  if(c===45||c===48)return 'Ködös';
  if(c>=51&&c<=67)return 'Eső';
  if(c>=71&&c<=77)return 'Havazás';
  if(c>=80&&c<=82)return 'Zápor';
  if(c>=95)return 'Zivatar';
  return 'Változékony';
}
function weatherIcon(code,dt){
  if(typeof window.wIcon==='function'){try{return window.wIcon(code,dt||new Date())}catch(e){}}
  var c=Number(code);
  if(c===0)return '☀️';
  if(c===1||c===2)return '🌤️';
  if(c===3)return '☁️';
  if(c===45||c===48)return '🌫️';
  if(c>=51&&c<=82)return '🌧️';
  if(c>=95)return '⛈️';
  return '⛅';
}
function windDir(deg){
  if(typeof window.degDir==='function'){try{return window.degDir(deg)}catch(e){}}
  var dirs=['É','ÉK','K','DK','D','DNy','Ny','ÉNy'];
  return dirs[Math.round((((Number(deg)||0)%360)/45))%8];
}
function getCoords(force){
  return new Promise(function(resolve,reject){
    var has=Number.isFinite(Number(window.lat))&&Number.isFinite(Number(window.lon));
    if(has&&!force)return resolve({lat:Number(window.lat),lon:Number(window.lon),source:'cache'});
    if(!navigator.geolocation)return has?resolve({lat:Number(window.lat),lon:Number(window.lon),source:'cache'}):reject(new Error('GPS nem elérhető'));
    navigator.geolocation.getCurrentPosition(function(pos){
      window.lat=pos.coords.latitude;window.lon=pos.coords.longitude;
      resolve({lat:window.lat,lon:window.lon,source:'gps',accuracy:pos.coords.accuracy});
    },function(err){
      if(has)resolve({lat:Number(window.lat),lon:Number(window.lon),source:'cache'});else reject(err);
    },{enableHighAccuracy:true,maximumAge:60000,timeout:12000});
  });
}
async function reversePlace(lat,lon){
  try{
    var url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon)+'&zoom=12&addressdetails=1';
    var r=await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error('reverse geocode '+r.status);
    var j=await r.json();
    var a=j.address||{};
    var name=a.city||a.town||a.village||a.municipality||a.county||j.name||'GPS pozíció';
    window.placeCache={name:name,raw:j,lat:lat,lon:lon};
  }catch(e){
    if(!window.placeCache)window.placeCache={name:'GPS pozíció',lat:lat,lon:lon};
  }
}
async function accurateWeather(force){
  var c=await getCoords(!!force);
  var url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(c.lat)+'&longitude='+encodeURIComponent(c.lon)+'&timezone=auto&forecast_days=2&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m';
  var res=await fetch(url,{cache:'no-store'});
  if(!res.ok)throw new Error('Open-Meteo hiba: '+res.status);
  var data=await res.json();
  var cur=data.current||{};
  window.weatherCache={
    temperature_2m:n(cur.temperature_2m),
    apparent_temperature:n(cur.apparent_temperature),
    relative_humidity_2m:n(cur.relative_humidity_2m),
    weather_code:n(cur.weather_code),
    surface_pressure:n(cur.surface_pressure),
    wind_speed_10m:n(cur.wind_speed_10m),
    wind_direction_10m:n(cur.wind_direction_10m),
    time:cur.time,
    latitude:c.lat,
    longitude:c.lon,
    source:'open-meteo-gps'
  };
  var h=data.hourly||{},len=Math.min(48,(h.time||[]).length);
  window.forecast24Cache=[];
  for(var i=0;i<len;i++)window.forecast24Cache.push({
    time:h.time[i],
    temp:n((h.temperature_2m||[])[i]),
    humidity:n((h.relative_humidity_2m||[])[i]),
    code:n((h.weather_code||[])[i]),
    pressure:n((h.surface_pressure||[])[i]),
    wind:n((h.wind_speed_10m||[])[i]),
    windDir:n((h.wind_direction_10m||[])[i])
  });
  reversePlace(c.lat,c.lon).finally(function(){refreshUi()});
  refreshUi();
  try{localStorage.setItem('kp_weather_last_fix',JSON.stringify({t:Date.now(),weather:window.weatherCache,place:window.placeCache,forecast:window.forecast24Cache.slice(0,24)}))}catch(e){}
  return window.weatherCache;
}
function refreshUi(){
  var w=window.weatherCache;if(!w)return;
  setText('w-icon',weatherIcon(w.weather_code,new Date()));
  setText('w-temp',Math.round(w.temperature_2m)+'°C');
  setText('w-desc',weatherDesc(w.weather_code));
  setText('w-loc',(window.placeCache&&window.placeCache.name)||'GPS pozíció');
  setText('w-wind',Math.round(w.wind_speed_10m)+' km/h '+windDir(w.wind_direction_10m));
  setText('w-hum',Math.round(w.relative_humidity_2m)+'%');
  setText('w-pres',Math.round(w.surface_pressure)+' hPa');
  setText('w-feel',Math.round(w.apparent_temperature)+'°C');
  if(typeof window.KP_RENDER_JOURNAL==='function')window.KP_RENDER_JOURNAL();
  if(typeof window.updateHome==='function'){try{window.updateHome()}catch(e){}}
}
function installWeather(){
  if(window.fetchWeather&&!window.fetchWeather.__kpAccurate){
    var old=window.fetchWeather;
    window.fetchWeather=function(force){return accurateWeather(force).catch(function(err){console.warn('[Vízparti Napló] pontos időjárás hiba:',err);return old.apply(this,arguments)})};
    window.fetchWeather.__kpAccurate=true;
  }
}
function tick(){addCss();installWeather()}
setTimeout(tick,200);setTimeout(tick,900);setTimeout(tick,1800);setInterval(tick,2000);
})();
