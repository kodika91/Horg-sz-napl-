// kp-mod-map-navigation-fix.js — valódi útvonaltervezés a kiválasztott helyhez
(function(){
'use strict';
if(window.KP_MOD_MAP_NAVIGATION_FIX)return;
window.KP_MOD_MAP_NAVIGATION_FIX=true;

function toast(message){
  try{if(typeof showToast==='function')showToast(message);else console.log(message);}catch(e){}
}
function validCoord(value,limit){
  var n=Number(value);
  return Number.isFinite(n)&&n!==0&&Math.abs(n)<=limit?n:null;
}
function selectedPoint(){
  var active=document.querySelector('#page-map .kpmap-item.active');
  if(!active)return null;
  var id=active.dataset.id;
  var db;
  try{db=typeof getDB==='function'?getDB():{};}catch(e){db={};}
  var locations=Array.isArray(db.locations)?db.locations:[];
  var spots=Array.isArray(db.scoutSpots)?db.scoutSpots:[];
  var sessions=Array.isArray(db.sessions)?db.sessions:[];
  var item=null;
  if(String(id).indexOf('loc-')===0){
    var locId=String(id).slice(4);
    item=locations.find(function(x){return String(x&& (x.id||x.name))===locId;});
  }else if(String(id).indexOf('spot-')===0){
    var spotId=String(id).slice(5);
    item=spots.find(function(x){return String(x&& (x.id||x.name))===spotId;});
  }
  if(!item){
    var title=(active.querySelector('b')||{}).textContent||'';
    var key=title.trim().toLowerCase();
    item=locations.concat(spots).find(function(x){return String(x&&x.name||'').trim().toLowerCase()===key;});
    if(!item){
      var s=sessions.find(function(x){
        var name=typeof x.location==='string'?x.location:(x.location&&x.location.name)||x.locationName||x.water||x.spotName||'';
        return String(name).trim().toLowerCase()===key;
      });
      item=s||null;
    }
  }
  if(!item)return null;
  var lat=validCoord(item.lat!=null?item.lat:item.latitude,90);
  var lon=validCoord(item.lon!=null?item.lon:(item.lng!=null?item.lng:item.longitude),180);
  if(lat==null||lon==null){
    var gps=String(item.gps||item.coords||'').match(/(-?\d+(?:[\.,]\d+)?)\s*[,; ]\s*(-?\d+(?:[\.,]\d+)?)/);
    if(gps){lat=validCoord(String(gps[1]).replace(',','.'),90);lon=validCoord(String(gps[2]).replace(',','.'),180);}
  }
  if(lat!=null&&lon!=null&&lat>=14&&lat<=25&&lon>=44&&lon<=51){var tmp=lat;lat=lon;lon=tmp;}
  return lat!=null&&lon!=null?{lat:lat,lon:lon}:null;
}
function openNavigation(point){
  if(!point){toast('Ehhez a helyhez nincs érvényes GPS-koordináta.');return;}
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
