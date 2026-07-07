// kp-mod-fish-auto-image.js — automatikus halfajkép a latin név alapján.
// Elsődleges forrás: en.wikipedia vezérkép; tartalék: Wikimedia Commons keresés.
// Csak akkor lép működésbe, ha az adott halfajhoz NINCS beépített kép és NINCS
// saját feltöltött kép. A feltöltött kép mindig elsődleges — auto kép sosem írja felül.
(function(){
'use strict';
if(window.KP_MOD_FISH_AUTO_IMG)return;
window.KP_MOD_FISH_AUTO_IMG=true;

function db(){try{return typeof getDB==='function'?getDB():null;}catch(e){return null;}}
// A FISH_DB az app.html-ben const, ezért NINCS a window-on — globális scope-ban kell elérni.
function fishList(){
  try{var a=Function('return FISH_DB')();if(Array.isArray(a))return a;}catch(e){}
  return Array.isArray(window.FISH_DB)?window.FISH_DB:[];
}
var busy=false, tried={};

function candidates(){
  var d=db();if(!d)return [];
  var fi=d.fishImages||{};
  return fishList().filter(function(f){
    if(!f||!f.id)return false;
    if(f.img)return false;            // van beépített asset-kép -> nem nyúlunk hozzá
    if(fi[f.id])return false;         // van saját feltöltött VAGY korábbi auto kép
    if(tried[f.id])return false;      // ebben a munkamenetben már próbáltuk
    if(!f.latin||!/[a-z]/i.test(f.latin))return false;
    return true;
  });
}

function okPhoto(u){var bare=String(u||'').split('?')[0];return /\.(jpe?g|png)$/i.test(bare);}

// 1) Wikipédia (angol) vezérkép a latin név alapján — a legjobb, felismerhető fotó.
function fromWiki(latin){
  var title=encodeURIComponent(String(latin).trim().replace(/\s+/g,'_'));
  return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+title)
    .then(function(r){return r.ok?r.json():null;})
    .then(function(j){
      if(!j)return null;
      var src=(j.originalimage&&j.originalimage.source)||(j.thumbnail&&j.thumbnail.source)||'';
      return okPhoto(src)?src:null;
    }).catch(function(){return null;});
}

// 2) Tartalék: Wikimedia Commons képkeresés a latin névre (csak fotó, fekvő, elég nagy).
function fromCommons(latin){
  var q=encodeURIComponent(String(latin).trim()+' filetype:bitmap');
  var u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'+
    '&generator=search&gsrsearch='+q+'&gsrnamespace=6&gsrlimit=8'+
    '&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=1000';
  return fetch(u).then(function(r){return r.ok?r.json():null;}).then(function(j){
    var pages=(j&&j.query&&j.query.pages)||{};
    var hit=Object.keys(pages).map(function(k){return pages[k];})
      .sort(function(a,b){return (a.index||0)-(b.index||0);})
      .map(function(p){return p.imageinfo&&p.imageinfo[0];}).filter(Boolean)
      .filter(function(ii){return /image\/(jpe?g|png)/i.test(ii.mime||'')&&ii.width>=700&&ii.width>=ii.height;})[0];
    return hit?hit.thumburl:null;
  }).catch(function(){return null;});
}

function attach(f,src){
  var d=db();if(!d)return;
  if(!d.fishImages)d.fishImages={};
  if(d.fishImages[f.id])return;       // közben feltöltöttek egyet -> ne írjuk felül
  d.fishImages[f.id]={src:src,mode:'auto',source:'Automatikus (Wikipédia / Commons)',updatedAt:new Date().toISOString()};
  try{if(typeof saveDB==='function')saveDB(d);}catch(e){}
  try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}
  try{
    if(window._lastFishDetailId===f.id&&typeof openFishDetail==='function'){
      var m=document.getElementById('data-modal');
      if(m&&m.classList.contains('show'))openFishDetail(f.id);
    }
  }catch(e){}
}

function step(){
  if(busy)return;
  var list=candidates();
  if(!list.length)return;
  busy=true;
  var f=list[0];
  tried[f.id]=true;
  fromWiki(f.latin).then(function(src){
    if(src)return src;
    return fromCommons(f.latin);
  }).then(function(src){
    busy=false;
    if(src)attach(f,src);
  }).catch(function(){busy=false;});
}

setTimeout(step,3500);
setInterval(step,4000);
})();
