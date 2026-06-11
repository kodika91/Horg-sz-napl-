// kp-mod-fish-images.js — assets/fish képek bekötése a halfajokhoz (rács + részletek), méret-igazítással
// Csak ott állít be képet, ahol hiányzik; a meglévő/saját feltöltött képeket nem írja felül.
(function(){
'use strict';
if(window.KP_MOD_FISH_IMAGES_V1)return;
window.KP_MOD_FISH_IMAGES_V1=true;

// Elérhető fájlok az assets/fish mappában: fájlnév-törzs -> kiterjesztés
var FILE={amur:'jpg',amurgeb:'jpg',angolna:'jpg',aranykarasz:'jpg',bagolykeszeg:'jpg',balin:'jpg',bodorka:'jpg',busa:'jpg',compo:'jpg',csuka:'jpg',deverkeszeg:'jpg',domolyko:'jpg',ezustkarasz:'jpg',feherbusa:'jpg',feketesuger:'jpg',feketeszajugeb:'jpg',fenekjaro_kullo:'jpg',fogassullo:'jpg',folyamigeb:'jpg',garda:'jpg',harcsa:'jpg',homoki_kullo:'jpg',jaszkeszeg:'jpg',karasz_hibrid:'jpg',karikakeszeg:'jpg',kecsege:'jpg',koi_ponty:'jpg',kosullo:'jpg',kovi_csik:'jpg',kurta_baing:'jpg',kusz:'jpg',lapipoc:'jpg',laposkeszeg:'jpg',lenai_tok:'jpg',magyar_buco:'jpg',marna:'jpg',menyhal:'jpg',naphal:'jpg',nemet_buco:'jpg',paduc:'jpg',pettyesbusa:'jpg',ponty:'jpg',razbora:'jpg',sebes_pisztrang:'jpg',sebespisztrang:'jpg',selymes_durbincs:'jpg',soregtok:'jpg',suger:'jpg',szeles_durbincs:'jpg',szilvaorru_keszeg:'jpg',szivarvanyos_okle:'jpg',szivarvanyos_pisztrang:'jpg',tarka_geb:'jpg',torpeharcsa:'jpg',vago_csik:'jpg',vorosszarnyu:'jpg',reti_csik:'png',vago_durbincs:'png',vagotok:'png'};
// Alias: slug -> tényleges fájl-törzs (ahol az id/név nem egyezik a fájlnévvel)
var ALIAS={sullo:'fogassullo',ko_pisztrang:'sebespisztrang',kovicsik:'kovi_csik',fejes_domolyko:'domolyko',szilvaorru:'szilvaorru_keszeg',feketeszaju_geb:'feketeszajugeb',vagodurbincs:'vago_durbincs',europai_harcsa:'harcsa',pisztrangsuger:'feketesuger'};
var ACC={'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u'};

function slug(s){return String(s==null?'':s).toLowerCase().replace(/[áéíóöőúüű]/g,function(c){return ACC[c]||c}).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}
function fileFor(stem){return (stem&&FILE[stem])?('assets/fish/'+stem+'.'+FILE[stem]):''}
function resolve(id,name){
  var sid=slug(id),sn=slug(name),c=[];
  if(ALIAS[sid])c.push(ALIAS[sid]);
  if(ALIAS[sn])c.push(ALIAS[sn]);
  c.push(sid,sn,sid.replace(/_/g,''),sn.replace(/_/g,''));
  for(var i=0;i<c.length;i++){var p=fileFor(c[i]);if(p)return p}
  return ''
}
function cardId(card){var on=card.getAttribute('onclick')||'';var m=on.match(/openFishDetail\(\s*['"]([^'"]+)['"]/);return m?m[1]:''}
function txt(el){return el?(el.textContent||''):''}
function imgBroken(img){if(!img)return true;if(img.style.display==='none')return true;if(!img.getAttribute('src'))return true;if(img.complete&&img.naturalWidth===0)return true;return false}

function bindCard(card){
  var wrap=card.querySelector('.fish-img-wrap');if(!wrap)return;
  var ph=wrap.querySelector('.fish-img-placeholder');
  var img=wrap.querySelector('img');
  var phVisible=ph&&getComputedStyle(ph).display!=='none';
  if(!phVisible&&!imgBroken(img))return; // van működő kép – nem nyúlunk hozzá
  var src=resolve(cardId(card),txt(card.querySelector('.fish-name-sci')));
  if(!src)return;
  if(!img){img=document.createElement('img');img.loading='lazy';wrap.insertBefore(img,wrap.firstChild)}
  img.className=(img.className||'').replace(/\bkpfi-img\b/,'').trim()+' kpfi-img';
  img.alt=txt(card.querySelector('.fish-name-sci'));
  img.onerror=function(){img.style.display='none';if(ph)ph.style.display='flex'};
  img.onload=function(){img.style.display='';if(ph)ph.style.display='none'};
  if(img.getAttribute('src')!==src)img.src=src;
}
function bindDetail(){
  var hero=document.querySelector('.fish-detail-img');if(!hero)return;
  var img=hero.querySelector('img');
  if(!imgBroken(img))return; // van működő kép
  var id=window._lastFishDetailId||'';if(!id)return;
  var f=Array.isArray(window.FISH_DB)?window.FISH_DB.find(function(x){return x.id===id}):null;
  var src=resolve(id,f?f.name:'');if(!src)return;
  if(!img){img=document.createElement('img');hero.innerHTML='';hero.appendChild(img)}
  img.className=(img.className||'').replace(/\bkpfi-img\b/,'').trim()+' kpfi-img';
  img.onerror=function(){img.style.display='none'};
  if(img.getAttribute('src')!==src)img.src=src;
}
function run(){
  try{document.querySelectorAll('#page-fish .fish-card').forEach(bindCard)}catch(e){}
  try{bindDetail()}catch(e){}
}
function css(){
  if(document.getElementById('kpfi-css'))return;
  var s=document.createElement('style');s.id='kpfi-css';
  s.textContent='#page-fish .fish-img-wrap{position:relative;min-height:110px}#page-fish .fish-img-wrap img.kpfi-img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.fish-detail-img img.kpfi-img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}';
  document.head.appendChild(s);
}
css();
var oldRender=window.renderFishGrid;
if(typeof oldRender==='function'&&!oldRender.__kpfi){window.renderFishGrid=function(){var r=oldRender.apply(this,arguments);setTimeout(run,30);return r};window.renderFishGrid.__kpfi=1}
var oldDetail=window.openFishDetail;
if(typeof oldDetail==='function'&&!oldDetail.__kpfi){window.openFishDetail=function(){var r=oldDetail.apply(this,arguments);setTimeout(bindDetail,40);setTimeout(bindDetail,200);return r};window.openFishDetail.__kpfi=1}
var oldShow=window.showPage;
if(typeof oldShow==='function'&&!oldShow.__kpfi){window.showPage=function(id){var r=oldShow.apply(this,arguments);if(String(id||'').indexOf('fish')>=0)setTimeout(run,120);return r};window.showPage.__kpfi=1}
setTimeout(run,600);setTimeout(run,1500);setInterval(run,1600);
})();
