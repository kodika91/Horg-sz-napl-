// kp-mod-fish-auto-image.js — automatikus halfajkép a latin név alapján.
// DOM-alapú: azokat a kártyákat kezeli, ahol TÉNYLEGESEN nincs vagy törött a kép
// (hiányzó helyi asset VAGY img:'' HuV2 faj). A meglévő működő képet és a saját
// feltöltött képet SOHA nem írja felül. Forrás: Wikipédia vezérkép, tartalék: Commons.
(function(){
'use strict';
if(window.KP_MOD_FISH_AUTO_IMG)return;
window.KP_MOD_FISH_AUTO_IMG=true;

function db(){try{return typeof getDB==='function'?getDB():null;}catch(e){return null;}}
// A FISH_DB az app.html-ben const -> nincs a window-on; globális scope-ból érjük el.
function fishList(){try{var a=Function('return FISH_DB')();if(Array.isArray(a))return a;}catch(e){}return Array.isArray(window.FISH_DB)?window.FISH_DB:[];}
function fishById(id){id=String(id);return fishList().find(function(f){return String(f.id)===id;});}

var busy=false, tried={};

function cardId(card){var on=card.getAttribute('onclick')||'';var m=on.match(/openFishDetail\(\s*['"]([^'"]+)['"]/);return m?m[1]:'';}
function cardLatin(card,id){var f=fishById(id);if(f&&f.latin)return f.latin;var el=card.querySelector('.fish-name-lat');return el?(el.textContent||''):'';}

function cardBroken(card){
  var wrap=card.querySelector('.fish-img-wrap');if(!wrap)return false;
  var ph=wrap.querySelector('.fish-img-placeholder');
  if(ph){try{if(getComputedStyle(ph).display!=='none')return true;}catch(e){}}
  var img=wrap.querySelector('img');
  if(!img)return true;
  if(img.style.display==='none')return true;
  if(img.complete&&img.naturalWidth===0)return true;
  return false;
}

// "Coregonus lavaretus csoport" -> "Coregonus lavaretus"; "Rutilus virgo / ..." -> "Rutilus virgo"
function cleanLatin(s){
  s=String(s||'').split('/')[0].replace(/\bcsoport\b/gi,'').replace(/\bspp?\.?/gi,'').trim();
  var m=s.match(/^([A-Z][A-Za-zäöüáéíóúőű-]+)\s+([a-zäöüáéíóúőű-]{2,})/);
  if(m)return m[1]+' '+m[2];
  m=s.match(/^([A-Z][A-Za-zäöüáéíóúőű-]+)/);
  return m?m[1]:'';
}

function okPhoto(u){return /\.(jpe?g|png)$/i.test(String(u||'').split('?')[0]);}
function fromWiki(latin){
  var t=encodeURIComponent(latin.replace(/\s+/g,'_'));
  return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+t)
    .then(function(r){return r.ok?r.json():null;})
    .then(function(j){if(!j)return null;var s=(j.originalimage&&j.originalimage.source)||(j.thumbnail&&j.thumbnail.source)||'';return okPhoto(s)?s:null;})
    .catch(function(){return null;});
}
function fromCommons(latin){
  var q=encodeURIComponent(latin+' filetype:bitmap');
  var u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'+
    '&generator=search&gsrsearch='+q+'&gsrnamespace=6&gsrlimit=8'+
    '&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=1000';
  return fetch(u).then(function(r){return r.ok?r.json():null;}).then(function(j){
    var pages=(j&&j.query&&j.query.pages)||{};
    var hit=Object.keys(pages).map(function(k){return pages[k];})
      .sort(function(a,b){return (a.index||0)-(b.index||0);})
      .map(function(p){return p.imageinfo&&p.imageinfo[0];}).filter(Boolean)
      .filter(function(ii){return /image\/(jpe?g|png)/i.test(ii.mime||'')&&ii.width>=700;})[0];
    return hit?hit.thumburl:null;
  }).catch(function(){return null;});
}

function attach(id,src){
  var d=db();if(!d)return;
  if(!d.fishImages)d.fishImages={};
  if(d.fishImages[id])return;         // közben feltöltöttek egyet -> nem írjuk felül
  d.fishImages[id]={src:src,mode:'auto',source:'Automatikus (Wikipédia / Commons)',updatedAt:new Date().toISOString()};
  try{if(typeof saveDB==='function')saveDB(d);}catch(e){}
  try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}
  try{
    if(window._lastFishDetailId===id&&typeof openFishDetail==='function'){
      var m=document.getElementById('data-modal');
      if(m&&m.classList.contains('show'))openFishDetail(id);
    }
  }catch(e){}
}

function scan(){
  if(busy)return;
  var cards=document.querySelectorAll('#page-fish .fish-card');
  if(!cards.length)return;
  var d=db();var fi=(d&&d.fishImages)||{};
  for(var i=0;i<cards.length;i++){
    var card=cards[i], id=cardId(card);
    if(!id||tried[id]||fi[id])continue;
    if(!cardBroken(card))continue;    // van működő kép -> nem nyúlunk hozzá
    var latin=cleanLatin(cardLatin(card,id));
    if(!latin){tried[id]=true;continue;}
    tried[id]=true;busy=true;
    (function(fid,lat){
      fromWiki(lat).then(function(s){return s||fromCommons(lat);}).then(function(s){
        busy=false;if(s)attach(fid,s);
      }).catch(function(){busy=false;});
    })(id,latin);
    return;                            // egyszerre egy lekérés, a hálózat kímélése miatt
  }
}

setTimeout(scan,2500);
setInterval(scan,3000);
})();
