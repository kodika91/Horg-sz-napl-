// kp-mod-map-navigation-fix.js — valódi útvonaltervezés a kiválasztott helyhez
(function(){
'use strict';
if(window.KP_MOD_MAP_NAVIGATION_FIX)return;
window.KP_MOD_MAP_NAVIGATION_FIX=true;

function toast(message){
  try{if(typeof showToast==='function')showToast(message);else console.log(message);}catch(e){}
}
function normalizeName(value){
  return String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}
function placeName(item){
  if(!item)return '';
  return item.name||item.title||item.locationName||item.water||item.spotName||(typeof item.location==='string'?item.location:(item.location&&item.location.name)||'');
}
function validCoord(value,limit){
  var n=Number(String(value==null?'':value).replace(',','.'));
  return Number.isFinite(n)&&n!==0&&Math.abs(n)<=limit?n:null;
}
function coords(item){
  if(!item)return null;
  var lat=validCoord(item.lat!=null?item.lat:item.latitude,90);
  var lon=validCoord(item.lon!=null?item.lon:(item.lng!=null?item.lng:item.longitude),180);
  if(lat==null||lon==null){
    var gps=String(item.gps||item.coords||'').match(/(-?\d+(?:[\.,]\d+)?)\s*[,; ]\s*(-?\d+(?:[\.,]\d+)?)/);
    if(gps){lat=validCoord(gps[1],90);lon=validCoord(gps[2],180);}
  }
  if(lat!=null&&lon!=null&&lat>=14&&lat<=25&&lon>=44&&lon<=51){var tmp=lat;lat=lon;lon=tmp;}
  return lat!=null&&lon!=null?{lat:lat,lon:lon}:null;
}
function selectedPoint(){
  var active=document.querySelector('#page-map .kpmap-item.active');
  if(!active)return null;
  var id=String(active.dataset.id||'');
  var db;
  try{db=typeof getDB==='function'?getDB():{};}catch(e){db={};}
  var locations=Array.isArray(db.locations)?db.locations:[];
  var spots=Array.isArray(db.scoutSpots)?db.scoutSpots:[];
  var sessions=Array.isArray(db.sessions)?db.sessions:[];
  var savedPlaces=locations.concat(spots).filter(function(x){return x&&!x.kpMapHiddenV1;});
  var item=null;

  if(id.indexOf('loc-')===0||id.indexOf('catch-loc-')===0){
    var locId=id.replace(/^catch-loc-/,'').replace(/^loc-/,'');
    item=locations.find(function(x){return String(x&&(x.id||x.name))===locId;})||null;
  }else if(id.indexOf('spot-')===0||id.indexOf('catch-spot-')===0){
    var spotId=id.replace(/^catch-spot-/,'').replace(/^spot-/,'');
    item=spots.find(function(x){return String(x&&(x.id||x.name))===spotId;})||null;
  }

  var title=(active.querySelector('b')||{}).textContent||'';
  var titleKey=normalizeName(title);
  if(!item&&titleKey){
    item=savedPlaces.find(function(x){return normalizeName(placeName(x))===titleKey;})||null;
  }

  if(!item&&titleKey){
    var session=sessions.find(function(x){return normalizeName(placeName(x))===titleKey;})||null;
    if(session){
      var sessionKey=normalizeName(placeName(session));
      item=savedPlaces.find(function(x){return normalizeName(placeName(x))===sessionKey&&coords(x);})||session;
    }
  }

  if(!item)return null;
  var point=coords(item);
  if(point)return point;

  var fallbackKey=normalizeName(placeName(item)||title);
  if(fallbackKey){
    var saved=savedPlaces.find(function(x){return normalizeName(placeName(x))===fallbackKey&&coords(x);});
    if(saved)return coords(saved);
  }
  return null;
}
function openNavigation(point){
  if(!point){toast('Ehhez a helyhez nincs érvényes GPS-koordináta vagy hozzá kapcsolt mentett hely.');return;}
  var destination=encodeURIComponent(point.lat+','+point.lon);
  var url='https://www.google.com/maps/dir/?api=1&destination='+destination+'&travelmode=driving';
  var opened=null;
  try{opened=window.open(url,'_blank','noopener,noreferrer');}catch(e){}
  if(!opened){try{window.location.href=url;}catch(e){toast('Nem sikerült megnyitni a térképes navigációt.');}}
}
document.addEventListener('click',function(event){
  var button=event.target.closest&&event.target.closest('#kpmap-nav');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openNavigation(selectedPoint());
},true);
})();
