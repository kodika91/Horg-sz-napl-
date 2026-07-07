// kp-mod-fish-auto-image.js — automatikus halfajkép a latin név alapján.
// A napló háttérkép-logikájával azonos elv: a képet KÖZVETLENÜL a kártyára/részletre
// tesszük megjelenítéskor, és csak az URL-t cache-eljük külön (localStorage 'kpfai_url').
// NEM írjuk a nagy DB-be, így a tárhely-korlát sem dobja el. A meglévő működő képet és
// a saját feltöltött képet SOHA nem írjuk felül (csak törött/hiányzó képnél lépünk be).
// Forrás: Wikipédia vezérkép; tartalék: Wikimedia Commons keresés.
(function(){
'use strict';
if(window.KP_MOD_FISH_AUTO_IMG)return;
window.KP_MOD_FISH_AUTO_IMG=true;

// A FISH_DB az app.html-ben const -> nincs a window-on; globális scope-ból érjük el.
function fishList(){try{var a=Function('return FISH_DB')();if(Array.isArray(a))return a;}catch(e){}return Array.isArray(window.FISH_DB)?window.FISH_DB:[];}
function fishById(id){id=String(id);return fishList().find(function(f){return String(f.id)===id;});}

var CACHE=(function(){try{return JSON.parse(localStorage.getItem('kpfai_url')||'{}');}catch(e){return {};}})();
function saveCache(){try{localStorage.setItem('kpfai_url',JSON.stringify(CACHE));}catch(e){}}
var busy=false, tried={};

function css(){
  if(document.getElementById('kpfai-css'))return;
  var s=document.createElement('style');s.id='kpfai-css';
  s.textContent='#page-fish .fish-img-wrap img.kpfai-img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.fish-detail-img img.kpfai-img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}';
  document.head.appendChild(s);
}

function cardId(card){var on=card.getAttribute('onclick')||'';var m=on.match(/openFishDetail\(\s*['"]([^'"]+)['"]/);return m?m[1]:'';}
function cardLatin(card,id){var f=fishById(id);if(f&&f.latin)return f.latin;var el=card.querySelector('.fish-name-lat');return el?(el.textContent||''):'';}

function imgBroken(img){if(!img)return true;if(img.style.display==='none')return true;if(!img.getAttribute('src'))return true;if(img.complete&&img.naturalWidth===0)return true;return false;}
function cardBroken(card){
  var wrap=card.querySelector('.fish-img-wrap');if(!wrap)return false;
  var ph=wrap.querySelector('.fish-img-placeholder');
  if(ph){try{if(getComputedStyle(ph).display!=='none')return true;}catch(e){}}
  return imgBroken(wrap.querySelector('img:not(.kpfai-img)')||wrap.querySelector('img'));
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

function injectCard(card,url){
  var wrap=card.querySelector('.fish-img-wrap');if(!wrap)return;
  var ph=wrap.querySelector('.fish-img-placeholder');
  var img=wrap.querySelector('img.kpfai-img');
  if(!img){img=document.createElement('img');img.loading='lazy';img.className='kpfai-img';wrap.insertBefore(img,wrap.firstChild);}
  img.alt=card.querySelector('.fish-name-sci')?card.querySelector('.fish-name-sci').textContent:'';
  img.onerror=function(){img.style.display='none';if(ph)ph.style.display='flex';};
  img.onload=function(){img.style.display='';if(ph)ph.style.display='none';};
  if(img.getAttribute('src')!==url)img.src=url;
}
function injectDetail(url){
  var hero=document.querySelector('.fish-detail-img');if(!hero)return;
  var img=hero.querySelector('img.kpfai-img');
  if(!img){img=document.createElement('img');img.className='kpfai-img';hero.innerHTML='';hero.appendChild(img);}
  if(img.getAttribute('src')!==url)img.src=url;
}

function lookup(latin){return fromWiki(latin).then(function(s){return s||fromCommons(latin);});}

// Rács: minden törött kártyára — cache-ből azonnal, különben egy lekérés throttle-lel.
function applyGrid(){
  var cards=document.querySelectorAll('#page-fish .fish-card');
  if(!cards.length)return;
  var pending=null;
  for(var i=0;i<cards.length;i++){
    var card=cards[i], id=cardId(card);
    if(!id)continue;
    if(CACHE[id]){ if(cardBroken(card))injectCard(card,CACHE[id]); continue; }
    if(tried[id]||!cardBroken(card))continue;
    if(!pending)pending={card:card,id:id};
  }
  if(pending&&!busy){
    var latin=cleanLatin(cardLatin(pending.card,pending.id));
    if(!latin){tried[pending.id]=true;return;}
    tried[pending.id]=true;busy=true;
    var pid=pending.id, pcard=pending.card;
    lookup(latin).then(function(url){
      busy=false;
      if(!url)return;
      CACHE[pid]=url;saveCache();
      injectCard(pcard,url);
    }).catch(function(){busy=false;});
  }
}

// Részletnézet: cache-ből azonnal, különben lekérés a nyitott halfajra.
function applyDetail(){
  var id=window._lastFishDetailId;if(!id)return;
  var hero=document.querySelector('.fish-detail-img');if(!hero)return;
  if(!imgBroken(hero.querySelector('img')))return; // van működő kép
  if(CACHE[id]){injectDetail(CACHE[id]);return;}
  if(tried[id]||busy)return;
  var f=fishById(id);var latin=cleanLatin((f&&f.latin)|| (hero.parentNode?(hero.parentNode.querySelector('.fish-detail-latin')||{}).textContent:'') );
  if(!latin){tried[id]=true;return;}
  tried[id]=true;busy=true;
  lookup(latin).then(function(url){busy=false;if(!url)return;CACHE[id]=url;saveCache();injectDetail(url);}).catch(function(){busy=false;});
}

function run(){css();try{applyGrid();}catch(e){}try{applyDetail();}catch(e){}}

// Bekötjük az app render-függvényeit, hogy újrarajzolás után is visszakerüljön a kép.
var oR=window.renderFishGrid;
if(typeof oR==='function'&&!oR.__kpfai){window.renderFishGrid=function(){var r=oR.apply(this,arguments);setTimeout(run,30);return r;};window.renderFishGrid.__kpfai=1;}
var oD=window.openFishDetail;
if(typeof oD==='function'&&!oD.__kpfai){window.openFishDetail=function(){var r=oD.apply(this,arguments);setTimeout(applyDetail,40);setTimeout(applyDetail,220);return r;};window.openFishDetail.__kpfai=1;}
var oS=window.showPage;
if(typeof oS==='function'&&!oS.__kpfai){window.showPage=function(id){var r=oS.apply(this,arguments);if(String(id||'').indexOf('fish')>=0)setTimeout(run,120);return r;};window.showPage.__kpfai=1;}

setTimeout(run,1500);
setInterval(run,2500);
})();
