// kp-mod-fish.js — halfaj kártyák, tilalmi időszak
// Tartalom: v31-fish-card-cleanup · v33-CSS · v35-home-ban-render · v36-img-crop · v37-img-remap

(function(){
  if(window.KP_V37_IMG_REMAP)return;
  window.KP_V37_IMG_REMAP=true;
  var MAP={
    'szilvaorru.jpg':'szilvaorru_keszeg.jpg',
    'szivarvanyos.jpg':'szivarvanyos_okle.jpg',
    'szivarvanyosokle.jpg':'szivarvanyos_okle.jpg',
    'fejes_domolyko.jpg':'domolyko.jpg',
    'lenaiktok.jpg':'lenai_tok.jpg',
    'koi.jpg':'koi_ponty.jpg',
    'magyarbuco.jpg':'magyar_buco.jpg',
    'nemetbuco.jpg':'nemet_buco.jpg',
    'vagocsik.jpg':'vago_csik.jpg',
    'vagodurbincs.jpg':'vago_durbincs.png',
    'vago_durbincs.jpg':'vago_durbincs.png',
    'vagotok.jpg':'vagotok.png',
    'comp%C3%B3.jpg':'compo.jpg',
    'j%C3%A1szkeszeg.jpg':'jaszkeszeg.jpg',
    'sullo.jpg':'fogassullo.jpg',
    'ko_pisztrang.jpg':'sebespisztrang.jpg'
  };
  document.addEventListener('error',function(e){
    var img=e.target;
    if(!img||img.tagName!=='IMG'||img.dataset.kpRemap)return;
    var src=String(img.src||'');
    var file=src.split('/').pop().split('?')[0];
    var fix=MAP[file];
    if(fix){
      img.dataset.kpRemap='1';
      img.src=src.slice(0,src.lastIndexOf('/')+1)+fix;
    }
  },true);
})();

(function(){
  if(window.KP_V31_FISH_CARD_CLEANUP)return;
  window.KP_V31_FISH_CARD_CLEANUP=true;
  function addStyle(){
    if(document.getElementById('kp-v31-fish-clean-style'))return;
    const s=document.createElement('style');
    s.id='kp-v31-fish-clean-style';
    s.textContent=`
      #fish-image-manager,.fish-image-manager,.fish-gallery-panel,.fish-image-tools,
      [id*="fish-image" i]:not(.fish-detail-img),[class*="fish-image-tools" i],
      .image-manager-card,.fish-manager-card{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;}
      #page-fish .fish-card,#page-fish .fish-big-card,#page-fish .fish-detail-card{display:block!important;}
    `;
    document.head.appendChild(s);
  }
  function cleanup(){
    addStyle();
    const page=document.getElementById('page-fish')||document.body;
    page.querySelectorAll('button,label,div,section,article').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt.includes('Feltöltés')&&txt.includes('Megnyitás')&&txt.includes('Alap kép')){
        let card=el;
        for(let i=0;i<4&&card&&card.parentElement;i++){
          const t=(card.textContent||'').replace(/\s+/g,' ').trim();
          if(t.includes('Feltöltés')&&t.includes('Megnyitás')&&t.includes('Alap kép'))break;
          card=card.parentElement;
        }
        if(card){card.style.display='none';card.style.visibility='hidden';card.style.height='0';card.style.overflow='hidden';card.style.margin='0';card.style.padding='0';card.setAttribute('data-kp-hidden-old-fish-uploader','1');}
      }
    });
    page.querySelectorAll('*').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt.startsWith('Megjegyzés: saját feltöltött kép')||txt.includes('saját feltöltött kép ezen az eszközön offline is megmarad')){
        el.style.display='none';el.setAttribute('data-kp-hidden-old-fish-note','1');
      }
    });
  }
  const oldRenderFish=window.renderFish;
  if(typeof oldRenderFish==='function')window.renderFish=function(){const r=oldRenderFish.apply(this,arguments);setTimeout(cleanup,80);return r};
  const oldShowPage=window.showPage;
  if(typeof oldShowPage==='function')window.showPage=function(id){const r=oldShowPage.apply(this,arguments);setTimeout(cleanup,120);return r};
  function boot(){cleanup()}
  boot();setInterval(boot,1500);
})();

(function(){
  if(window.KP_V33_PROTECTED_FISH_CARDS)return;
  window.KP_V33_PROTECTED_FISH_CARDS=true;
  var s=document.createElement('style');
  s.id='kp-v33-banned-filter-style';
  s.textContent=
    '#page-fish .ftab[onclick*=banned]{order:-999!important;background:rgba(160,48,48,.10)!important;border-color:rgba(160,48,48,.26)!important;color:var(--danger,#a03030)!important;font-weight:900!important}'+
    '#page-fish .ftab[onclick*=banned].active{background:linear-gradient(135deg,var(--danger,#a03030),#b65b3a)!important;color:#fff!important;border-color:transparent!important}'+
    '.weather-card,.weather-card.theme-clear-day,.weather-card.theme-clear-night,.weather-card.theme-cloudy,.weather-card.theme-rain,.weather-card.theme-storm,.weather-card.theme-mist,.weather-card.theme-snow{border-radius:28px!important;overflow:hidden!important;clip-path:inset(0 round 28px)!important;-webkit-mask-image:-webkit-radial-gradient(white,black)!important}'+
    '.weather-card::before,.weather-card::after{border-radius:inherit!important;overflow:hidden!important}'+
    '@media(max-width:640px){.weather-card{border-radius:26px!important;clip-path:inset(0 round 26px)!important}}'+
    '#page-baits .item-list-card .item-icon,#page-gear .item-list-card .item-icon{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;overflow:hidden!important;flex-shrink:0!important}'+
    '#page-baits .item-list-card .item-icon img,#page-gear .item-list-card .item-icon img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}'+
    '#page-fish .fish-img-wrap img.v18-managed-img{object-fit:cover!important;}';
  document.head.appendChild(s);
})();

(function(){
  if(window.KP_V35_HOME_BAN_RENDER_TEXT)return;
  window.KP_V35_HOME_BAN_RENDER_TEXT=true;

  var MONTHS_HU=['Jan.','Febr.','Már.','Ápr.','Máj.','Jún.','Júl.','Aug.','Szept.','Okt.','Nov.','Dec.'];
  var _cache=null;

  function formatRange(tol,ig){
    var a=tol.split('-'),b=ig.split('-');
    return MONTHS_HU[+a[0]-1]+' '+(+a[1])+' – '+MONTHS_HU[+b[0]-1]+' '+(+b[1]);
  }

  function isActive(tol,ig){
    var n=new Date(),md=(n.getMonth()+1)*100+n.getDate();
    var a=tol.split('-'),b=ig.split('-');
    return md>=(+a[0]*100+(+a[1]))&&md<=(+b[0]*100+(+b[1]));
  }

  function loadTilalom(cb){
    if(_cache){cb(_cache);return;}
    fetch('assets/tilalom.json')
      .then(function(r){return r.json();})
      .then(function(d){_cache=d;cb(d);})
      .catch(function(){cb([]);});
  }

  function addStyle(){
    if(document.getElementById('kp-v35-home-ban-style'))return;
    var s=document.createElement('style');
    s.id='kp-v35-home-ban-style';
    s.textContent='#ban-alert.kp-v35-wrap{padding:14px!important;align-items:flex-start!important}.kp-v35-box{width:100%}.kp-v35-title{font-size:15px;font-weight:900;color:var(--danger,#a03030);margin-bottom:6px}.kp-v35-sub{font-size:11px;line-height:1.4;color:#8a4b4b;margin-bottom:12px;font-weight:600}.kp-v35-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.kp-v35-card{border:1px solid rgba(160,48,48,.18);border-radius:16px;background:rgba(255,252,248,.94);overflow:hidden;box-shadow:0 6px 18px rgba(58,39,18,.08);cursor:pointer;text-align:left;padding:0}.kp-v35-img{height:74px;background:#eadfce;overflow:hidden;display:flex;align-items:center;justify-content:center}.kp-v35-img img{width:100%;height:100%;object-fit:cover}.kp-v35-body{padding:8px 9px 10px}.kp-v35-name{font-size:12px;font-weight:900;color:var(--text,#2a2018);line-height:1.15}.kp-v35-rule{font-size:10px;font-weight:800;color:var(--danger,#a03030);margin-top:5px;line-height:1.25}.kp-v35-more{margin-top:10px;width:100%;min-height:42px;border:none;border-radius:14px;background:linear-gradient(135deg,var(--danger,#a03030),#b75b3b);color:#fff;font-weight:900;font-size:12px}@media(min-width:640px){.kp-v35-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  function namesFromText(t){
    t=String(t||'');
    var a=t.indexOf('alatt:');
    var b=t.indexOf('. A helyi');
    if(a<0||b<0||b<=a)return[];
    return t.slice(a+6,b).split(',').map(function(x){return x.trim();}).filter(Boolean);
  }

  function setFallbackImage(img,list,idx,box){
    if(!list||idx>=list.length){img.style.display='none';box.textContent='🐟';return;}
    img.src=list[idx];
    img.onerror=function(){setFallbackImage(img,list,idx+1,box);};
  }

  function card(entry){
    var images=Array.isArray(entry.kep)?entry.kep:(entry.kep?[entry.kep]:[]);
    var btn=document.createElement('button');
    btn.type='button';btn.className='kp-v35-card';
    var imgbox=document.createElement('div');imgbox.className='kp-v35-img';
    if(images.length){
      var im=document.createElement('img');im.alt=entry.nev;
      imgbox.appendChild(im);setFallbackImage(im,images,0,imgbox);
    }else{imgbox.textContent='🐟';}
    var body=document.createElement('div');body.className='kp-v35-body';
    var n=document.createElement('div');n.className='kp-v35-name';n.textContent=entry.nev;
    var r=document.createElement('div');r.className='kp-v35-rule';r.textContent=formatRange(entry.tol,entry.ig);
    body.appendChild(n);body.appendChild(r);
    btn.appendChild(imgbox);btn.appendChild(body);
    btn.addEventListener('click',function(){
      if(entry.id&&typeof window.openFishDetail==='function')window.openFishDetail(entry.id);
    });
    return btn;
  }

  function openBannedFishPage(){
    if(typeof window.showPage==='function')window.showPage('fish');
    setTimeout(function(){
      window.fishFilter='banned';
      var page=document.getElementById('page-fish');
      if(page){
        page.querySelectorAll('.ftab').forEach(function(x){x.classList.remove('active');});
        var bannedBtn=Array.from(page.querySelectorAll('.ftab')).find(function(x){
          return(x.textContent||'').toLowerCase().indexOf('tilalomban')>-1;
        });
        if(bannedBtn)bannedBtn.classList.add('active');
      }
      if(typeof window.renderFishGrid==='function')window.renderFishGrid();
    },350);
  }

  function render(tilalomList){
    var alert=document.getElementById('ban-alert');
    var el=document.getElementById('ban-text');
    if(!alert||!el)return;
    if(el.querySelector('.kp-v35-box'))return;

    var domNames=namesFromText(el.textContent);
    var displayList;
    if(domNames.length){
      displayList=domNames.map(function(n){
        return tilalomList.find(function(f){return f.nev===n;});
      }).filter(Boolean);
    }else{
      displayList=tilalomList.filter(function(f){return isActive(f.tol,f.ig);});
    }
    if(!displayList.length)return;

    addStyle();
    alert.classList.add('kp-v35-wrap');
    el.textContent='';
    var box=document.createElement('div');box.className='kp-v35-box';
    var title=document.createElement('div');title.className='kp-v35-title';title.textContent='⚠️ Aktív tilalmi időszak!';
    var sub=document.createElement('div');sub.className='kp-v35-sub';
    sub.textContent='Jelenleg '+displayList.length+' halfaj érintett. Koppints a halfajra a részletekhez. A helyi horgászrend eltérhet.';
    var grid=document.createElement('div');grid.className='kp-v35-grid';
    displayList.slice(0,6).forEach(function(f){grid.appendChild(card(f));});
    box.appendChild(title);box.appendChild(sub);box.appendChild(grid);
    if(displayList.length>6){
      var more=document.createElement('button');
      more.type='button';more.className='kp-v35-more';
      more.textContent='Összes tilalmi hal megnyitása';
      more.addEventListener('click',openBannedFishPage);
      box.appendChild(more);
    }
    el.appendChild(box);
  }

  function run(){
    loadTilalom(function(list){
      render(list);
      setTimeout(function(){render(list);},300);
      setTimeout(function(){render(list);},900);
    });
  }
  run();
  setInterval(run,1600);
})();

(function(){
  if(window.KP_V36_FISH_IMG_CROP)return;
  window.KP_V36_FISH_IMG_CROP=true;

  var RATIO=208/124;

  function crop(img){
    if(img.dataset.kpCrop)return;
    if(!img.complete||!img.naturalWidth||!img.naturalHeight)return;
    var nw=img.naturalWidth,nh=img.naturalHeight,r=nw/nh;
    var sx,sy,sw,sh;
    if(r>RATIO){sw=Math.round(nh*RATIO);sh=nh;sx=Math.round((nw-sw)/2);sy=0;}
    else{sw=nw;sh=Math.round(nw/RATIO);sx=0;sy=Math.round((nh-sh)/2);}
    try{
      var c=document.createElement('canvas');
      c.width=416;c.height=248;
      c.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,416,248);
      img.dataset.kpCrop='1';
      img.src=c.toDataURL('image/jpeg',0.88);
    }catch(e){img.dataset.kpCrop='err';}
  }

  function run(){
    var pg=document.getElementById('page-fish');
    if(!pg)return;
    pg.querySelectorAll('.fish-img-wrap img.v18-managed-img:not([data-kp-crop])').forEach(function(img){
      if(img.complete&&img.naturalWidth){crop(img);}
      else{img.addEventListener('load',function(){crop(img);},{once:true});}
    });
  }

  setInterval(run,800);
})();
