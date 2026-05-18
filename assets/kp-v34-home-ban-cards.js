(function(){
  if(window.KP_V34_HOME_BAN_CARDS)return;
  window.KP_V34_HOME_BAN_CARDS=true;
  window.KP_V34_HOME_BAN_EXPANDED=false;

  function txt(v){
    if(typeof window.escText==='function')return window.escText(v);
    return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function attr(v){
    if(typeof window.escAttr==='function')return window.escAttr(v);
    return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }
  function js(v){
    if(typeof window.escJS==='function')return window.escJS(v);
    return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
  }
  function addStyle(){
    if(document.getElementById('kp-v34-home-ban-style'))return;
    var s=document.createElement('style');
    s.id='kp-v34-home-ban-style';
    s.textContent=`
      .kp-v34-home-ban{background:linear-gradient(135deg,rgba(160,48,48,.08),rgba(255,253,248,.70));border:1px solid rgba(160,48,48,.22);border-radius:22px;padding:15px 14px;box-shadow:0 8px 22px rgba(80,40,30,.07);overflow:hidden;}
      .kp-v34-home-ban-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;color:var(--danger,#a03030)}
      .kp-v34-home-ban-head i{font-size:22px;margin-top:1px;flex:0 0 auto}.kp-v34-home-ban-title{font-size:16px;font-weight:900;line-height:1.25;color:var(--danger,#a03030)}.kp-v34-home-ban-sub{font-size:12px;line-height:1.45;color:#8c3636;margin-top:4px;font-weight:600}
      .kp-v34-home-ban-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}
      .kp-v34-home-ban-card{appearance:none;-webkit-appearance:none;text-align:left;border:1px solid rgba(160,48,48,.18);border-radius:17px;background:rgba(255,253,248,.86);overflow:hidden;min-width:0;box-shadow:0 5px 14px rgba(58,39,18,.07);cursor:pointer;padding:0;transition:transform .14s ease,box-shadow .14s ease;}
      .kp-v34-home-ban-card:active{transform:scale(.985)}.kp-v34-home-ban-card:hover{box-shadow:0 10px 22px rgba(58,39,18,.12)}
      .kp-v34-home-ban-img{height:76px;background:linear-gradient(135deg,#efe6d8,#e8dccb);display:flex;align-items:center;justify-content:center;overflow:hidden}.kp-v34-home-ban-img img{width:100%;height:100%;object-fit:cover;display:block}.kp-v34-home-ban-img .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text4,#b99d7a);font-size:28px}
      .kp-v34-home-ban-body{padding:9px 10px 10px}.kp-v34-home-ban-name{font-size:13px;font-weight:900;color:var(--text,#2c2118);line-height:1.12}.kp-v34-home-ban-rule{font-size:10.5px;font-weight:800;color:var(--danger,#a03030);line-height:1.25;margin-top:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .kp-v34-home-ban-more{width:100%;margin-top:10px;min-height:44px;border-radius:15px;background:linear-gradient(135deg,var(--danger,#a03030),#b75b3b);color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 8px 18px rgba(160,48,48,.18)}
      .kp-v34-home-ban-more.secondary{background:rgba(160,48,48,.08);color:var(--danger,#a03030);border:1px solid rgba(160,48,48,.22);box-shadow:none}
      @media(max-width:430px){.kp-v34-home-ban{padding:14px 13px}.kp-v34-home-ban-grid{gap:8px}.kp-v34-home-ban-img{height:70px}.kp-v34-home-ban-name{font-size:12.5px}.kp-v34-home-ban-rule{font-size:10px}}
    `;
    document.head.appendChild(s);
  }
  function getBannedFish(){
    if(!Array.isArray(window.FISH_DB))return [];
    if(typeof window.isBanned==='function')return window.FISH_DB.filter(function(f){try{return window.isBanned(f)}catch(e){return false}});
    return window.FISH_DB.filter(function(f){return !!f.ban && !/nem fogható|védett/i.test(String(f.ban||''));});
  }
  function imageHTML(f){
    var fi=typeof window.getFishImage==='function'?window.getFishImage(f):{src:f.img||'',fallbacks:[]};
    if(fi&&fi.src){
      return '<img src="'+attr(fi.src)+'" alt="'+attr(f.name)+'" data-fallback-index="1" data-fallbacks=\''+attr(JSON.stringify(fi.fallbacks||[]))+'\' onerror="handleFishImgError(this)" loading="lazy"><div class="ph" style="display:none"><i class="ti ti-fish"></i></div>';
    }
    return '<div class="ph"><i class="ti ti-fish"></i></div>';
  }
  function card(f){
    var rule=f.ban?'Tilalom: '+f.ban:'Aktív fajlagos tilalom';
    return '<button type="button" class="kp-v34-home-ban-card" onclick="openFishDetail(\''+js(f.id)+'\')"><div class="kp-v34-home-ban-img">'+imageHTML(f)+'</div><div class="kp-v34-home-ban-body"><div class="kp-v34-home-ban-name">'+txt(f.name)+'</div><div class="kp-v34-home-ban-rule">'+txt(rule)+'</div></div></button>';
  }
  function findWarningBox(){
    var page=document.getElementById('page-home')||document.body;
    var nodes=[].slice.call(page.querySelectorAll('div,section,article'));
    var matches=nodes.filter(function(el){
      if(el.dataset&&el.dataset.kpV34HomeBan==='1')return false;
      var t=(el.textContent||'').replace(/\s+/g,' ').trim();
      return t.includes('Aktív tilalmi időszak')&&t.includes('Jelenleg fajlagos tilalmi');
    });
    if(!matches.length)return null;
    matches.sort(function(a,b){return (a.textContent||'').length-(b.textContent||'').length});
    var el=matches[0];
    for(var i=0;i<4&&el.parentElement&&el.parentElement!==page;i++){
      var pt=(el.parentElement.textContent||'').replace(/\s+/g,' ').trim();
      if(pt.includes('Aktív tilalmi időszak')&&pt.includes('Jelenleg fajlagos tilalmi')&&pt.length<900){el=el.parentElement;}
    }
    return el;
  }
  function renderHomeBanCards(){
    addStyle();
    var box=findWarningBox();
    if(!box)return false;
    var fish=getBannedFish();
    if(!fish.length)return false;
    var limit=6;
    var expanded=!!window.KP_V34_HOME_BAN_EXPANDED;
    var visible=expanded?fish:fish.slice(0,limit);
    box.dataset.kpV34HomeBan='1';
    box.className='kp-v34-home-ban';
    box.innerHTML='<div class="kp-v34-home-ban-head"><i class="ti ti-alert-triangle"></i><div><div class="kp-v34-home-ban-title">Aktív tilalmi időszak!</div><div class="kp-v34-home-ban-sub">Jelenleg '+fish.length+' halfaj érintett. Koppints a halfajra a nagy kártyához. A helyi horgászrend eltérhet.</div></div></div><div class="kp-v34-home-ban-grid">'+visible.map(card).join('')+'</div>'+(fish.length>limit&&!expanded?'<button class="kp-v34-home-ban-more" onclick="window.KP_V34_HOME_BAN_EXPANDED=true;window.KP_V34_RENDER_HOME_BAN&&window.KP_V34_RENDER_HOME_BAN()"><i class="ti ti-layout-grid-add"></i> Összes tilalmi hal megnyitása</button>':'')+(fish.length>limit&&expanded?'<button class="kp-v34-home-ban-more secondary" onclick="window.KP_V34_HOME_BAN_EXPANDED=false;window.KP_V34_RENDER_HOME_BAN&&window.KP_V34_RENDER_HOME_BAN()"><i class="ti ti-chevron-up"></i> Kompakt nézet visszaállítása</button>':'');
    return true;
  }
  window.KP_V34_RENDER_HOME_BAN=renderHomeBanCards;
  function hook(){
    addStyle();
    var old=window.updateHome;
    if(typeof old==='function'&&!old.KP_V34_WRAPPED){
      var wrapped=function(){var r=old.apply(this,arguments);setTimeout(renderHomeBanCards,80);return r;};
      wrapped.KP_V34_WRAPPED=true;
      window.updateHome=wrapped;
    }
    var oldShow=window.showPage;
    if(typeof oldShow==='function'&&!oldShow.KP_V34_WRAPPED){
      var wrappedShow=function(){var r=oldShow.apply(this,arguments);setTimeout(renderHomeBanCards,120);return r;};
      wrappedShow.KP_V34_WRAPPED=true;
      window.showPage=wrappedShow;
    }
    renderHomeBanCards();
  }
  hook();
  setTimeout(hook,500);
  setTimeout(hook,1500);
  setInterval(renderHomeBanCards,1800);
})();
