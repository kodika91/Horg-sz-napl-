(function(){
var BASE='https://raw.githubusercontent.com/kodika91/Horg-sz-napl-/main/assets/fish/';

/* ── Egységes képmegjelenítés: minden hal cover-rel, padding nélkül ──────────
   A blob CSS object-fit:contain + padding:6px-et használ (illusztrációkhoz).
   Ez felülírja globálisan, hogy fotók és illusztrációk egyformán nézzenek ki.
   A kártya border-radius + overflow:hidden gondoskodik a lekerekítésről. ── */
(function injectUniformImageCss(){
  if(document.getElementById('fish-uniform-img-css'))return;
  var s=document.createElement('style');
  s.id='fish-uniform-img-css';
  s.textContent=
    /* kártyakép */
    '.fish-img-wrap{padding:0!important}'
   +'.fish-img-wrap img{object-fit:cover!important;border-radius:0!important}'
    /* részletnézet */
   +'.fish-detail-img{padding:0!important}'
   +'.fish-detail-img img{object-fit:cover!important;border-radius:0!important}';
  (document.head||document.documentElement).appendChild(s);
})();

var files={
  lenai_tok:[BASE+'l%C3%A9nai%20tok.jpg'],
  kurta_baing:[BASE+'kurta%20baing.jpg'],
  koi_ponty:[BASE+'koi%20ponty.jpg'],
  kovi_csik:[BASE+'k%C3%B6vi%20cs%C3%ADk.jpg'],
  karasz_hibrid:[BASE+'k%C3%A1r%C3%A1sz%20hibrid.jpg'],
  tarka_geb:[BASE+'tarka%20g%C3%A9b.jpg'],
  razbora:[BASE+'razb%C3%B3ra.jpg'],
  magyar_buco:[BASE+'magyar%20buc%C3%B3.jpg'],
  vago_csik:[BASE+'v%C3%A1g%C3%B3%20cs%C3%ADk.jpg'],
  szivarvanyos_okle:[BASE+'sziv%C3%A1rv%C3%A1nyos%20%C3%B6kle.jpg'],
  szeles_durbincs:[BASE+'sz%C3%A9les%20durbincs.jpg'],
  soregtok:[BASE+'s%C5%91regtok.jpg']
};
var aliases={
  lenai_tok:['lenai tok','lénai tok','acipenser baerii'],
  kurta_baing:['kurta baing','leucaspius delineatus'],
  koi_ponty:['koi ponty','koi','nishikigoi','diszponty','díszponty'],
  kovi_csik:['kovi csik','kövi csík','kovicsik','kövicsík','barbatula barbatula'],
  karasz_hibrid:['karasz hibrid','kárász hibrid'],
  tarka_geb:['tarka geb','tarka géb','proterorhinus semilunaris','proterorhinus marmoratus'],
  razbora:['razbora','razbóra','kinai razbora','kínai razbóra','pseudorasbora parva'],
  magyar_buco:['magyar buco','magyar bucó','zingel zingel'],
  vago_csik:['vago csik','vágó csík','misgurnus fossilis'],
  szivarvanyos_okle:['szivarvanyos okle','szivárványos ökle','rhodeus sericeus','rhodeus amarus'],
  szeles_durbincs:['szeles durbincs','széles durbincs','gymnocephalus baloni'],
  soregtok:['soregtok','sőregtok','acipenser nudiventris']
};
function n(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function getDb(){try{if(typeof FISH_DB!=='undefined'&&Array.isArray(FISH_DB))return FISH_DB;}catch(e){} if(Array.isArray(window.FISH_DB))return window.FISH_DB; return null;}
function rerender(){try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}try{if(typeof renderFishCards==='function')renderFishCards();}catch(e){}try{if(typeof renderFishList==='function')renderFishList();}catch(e){}}
function asImg(t){t=String(t||'').trim();if(!t)return '';if(/^data:image\//i.test(t))return t;if(/^https?:\/\//i.test(t))return t;return 'data:image/webp;base64,'+t;}
function fetchFirst(paths){
  var chain=Promise.resolve('');
  paths.forEach(function(p){
    chain=chain.then(function(prev){
      if(prev)return prev;
      if(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(p)){return Promise.resolve(p);}
      return fetch(p,{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).catch(function(){return '';});
    });
  });
  return chain;
}
function patch(imgs){
  var db=getDb();if(!db)return false;
  var m={};Object.keys(aliases).forEach(function(id){aliases[id].forEach(function(a){m[n(a)]=id;});});
  var changed=0;
  db.forEach(function(f){
    if(!f)return;
    var arr=[f.name,f.latin,f.id,f.title,f.huName];
    for(var i=0;i<arr.length;i++){
      var id=m[n(arr[i])];
      if(id&&imgs[id]){
        f.img=imgs[id];f.image=imgs[id];f.kep=imgs[id];f.photo=imgs[id];
        if(f.huV2){f.huV2.img=imgs[id];f.huV2.kep_statusz='Kép elérhető';f.huV2.kepkartya='Egységesített halfajkép elérhető';}
        changed++;break;
      }
    }
  });
  rerender();
  console.log('Hiányzó halfajképek bekötve:',changed);
  return changed>0;
}
function go(){
  var imgs={};
  Promise.all(Object.keys(files).map(function(id){
    return fetchFirst(files[id]).then(function(t){
      if(t)imgs[id]=asImg(t);
      else console.warn('Halfajkép nem található:',id,files[id]);
    });
  })).then(function(){
    if(!patch(imgs))setTimeout(function(){patch(imgs);},600);
  });
}

var FISH_IMG_BASE=BASE;
function normFilename(s){
  return String(s||'').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,'_')
    .replace(/[^a-z0-9_]/g,'')
    .replace(/_+/g,'_')
    .replace(/^_|_$/g,'');
}
function autoLoadCustomImages(){
  var db=getDb();if(!db)return;
  var tried={};
  db.forEach(function(entry){
    if(!entry)return;
    if(entry.img&&String(entry.img).length>10)return;
    var nameVariants=[entry.huName,entry.name,entry.id,entry.title,entry.nev].filter(Boolean);
    nameVariants.forEach(function(nm){
      var fn=normFilename(nm)+'.jpg';
      if(tried[fn])return;
      tried[fn]=true;
      var imgEl=new Image();
      imgEl.onload=(function(e,fn2){
        return function(){
          if(!e.img||String(e.img).length<10){
            var url=FISH_IMG_BASE+fn2;
            e.img=url;e.image=url;e.kep=url;e.photo=url;
            if(e.huV2){e.huV2.img=url;e.huV2.kep_statusz='Kép elérhető';}
            rerender();
            console.log('[fish-custom] Kép betöltve:',nm,'→',fn2);
          }
        };
      }(entry,fn));
      imgEl.src=FISH_IMG_BASE+fn;
    });
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
setTimeout(autoLoadCustomImages,600);
})();
