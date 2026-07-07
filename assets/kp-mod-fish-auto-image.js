// kp-mod-fish-auto-image.js — automatikus halfajkép a latin név alapján (Wikipédia).
// Csak akkor lép működésbe, ha az adott halfajhoz NINCS beépített kép és NINCS
// saját feltöltött kép. A feltöltött kép mindig elsődleges — auto kép sosem írja felül.
(function(){
'use strict';
if(window.KP_MOD_FISH_AUTO_IMG)return;
window.KP_MOD_FISH_AUTO_IMG=true;

function db(){try{return typeof getDB==='function'?getDB():null;}catch(e){return null;}}
var busy=false, tried={};

function candidates(){
  if(!Array.isArray(window.FISH_DB))return [];
  var d=db();if(!d)return [];
  var fi=d.fishImages||{};
  return window.FISH_DB.filter(function(f){
    if(!f||!f.id)return false;
    if(f.img)return false;            // van beépített asset-kép -> nem nyúlunk hozzá
    if(fi[f.id])return false;         // van saját feltöltött VAGY korábbi auto kép
    if(tried[f.id])return false;      // ebben a munkamenetben már próbáltuk
    if(!f.latin||!/[a-z]/i.test(f.latin))return false;
    return true;
  });
}

function lookup(latin){
  var title=encodeURIComponent(String(latin).trim().replace(/\s+/g,'_'));
  return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+title)
    .then(function(r){return r.ok?r.json():null;})
    .then(function(j){
      if(!j)return null;
      var src=(j.originalimage&&j.originalimage.source)||(j.thumbnail&&j.thumbnail.source)||'';
      if(!src)return null;
      var bare=src.split('?')[0];
      if(!/\.(jpe?g|png)$/i.test(bare))return null; // rajz/SVG/egyéb kihagyva
      return src;
    })
    .catch(function(){return null;});
}

function step(){
  if(busy)return;
  var list=candidates();
  if(!list.length)return;
  busy=true;
  var f=list[0];
  tried[f.id]=true;
  lookup(f.latin).then(function(src){
    busy=false;
    if(!src)return;
    var d=db();if(!d)return;
    if(!d.fishImages)d.fishImages={};
    if(d.fishImages[f.id])return;     // közben feltöltöttek egyet -> ne írjuk felül
    d.fishImages[f.id]={src:src,mode:'auto',source:'Wikipédia (automatikus)',updatedAt:new Date().toISOString()};
    try{if(typeof saveDB==='function')saveDB(d);}catch(e){}
    try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}
  });
}

setTimeout(step,3500);
setInterval(step,4000);
})();
