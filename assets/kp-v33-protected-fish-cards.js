(function(){
  if(window.KP_V33_PROTECTED_FISH_CARDS)return;
  window.KP_V33_PROTECTED_FISH_CARDS=true;
  window.KP_V33_SHOW_ALL_PROTECTED_FISH=false;

  function safeText(v){
    if(typeof window.escText==='function')return window.escText(v);
    return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function safeAttr(v){
    if(typeof window.escAttr==='function')return window.escAttr(v);
    return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }
  function safeJS(v){
    if(typeof window.escJS==='function')return window.escJS(v);
    return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
  }
  function addStyle(){
    if(document.getElementById('kp-v33-protected-fish-style'))return;
    const s=document.createElement('style');
    s.id='kp-v33-protected-fish-style';
    s.textContent=`
      #fish-grid.kp-v33-protected-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(158px,1fr))!important;gap:12px!important;align-items:stretch!important}
      .kp-v33-protected-head{grid-column:1/-1;background:linear-gradient(135deg,rgba(160,48,48,.10),rgba(47,103,93,.07));border:1px solid rgba(160,48,48,.20);border-radius:20px;padding:15px 16px;box-shadow:0 8px 22px rgba(58,39,18,.07)}
      .kp-v33-protected-title{display:flex;align-items:center;gap:9px;font-size:17px;font-weight:900;color:var(--text);letter-spacing:.01em}.kp-v33-protected-title i{color:var(--danger);font-size:21px}.kp-v33-protected-sub{font-size:12px;color:var(--text2);line-height:1.45;margin-top:5px}
      .kp-v33-protected-card{position:relative;overflow:hidden;border:1px solid rgba(160,48,48,.18);background:linear-gradient(180deg,rgba(255,253,248,.98),rgba(247,240,228,.96));border-radius:18px;box-shadow:0 8px 20px rgba(58,39,18,.08);cursor:pointer;min-height:176px;display:flex;flex-direction:column;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
      .kp-v33-protected-card:active{transform:scale(.985)}.kp-v33-protected-card:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(58,39,18,.12);border-color:rgba(160,48,48,.30)}
      .kp-v33-protected-img{height:92px;background:linear-gradient(135deg,#efe5d7,#e7dac7);display:flex;align-items:center;justify-content:center;overflow:hidden}.kp-v33-protected-img img{width:100%;height:100%;object-fit:cover;display:block}.kp-v33-protected-img .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text4);font-size:32px}
      .kp-v33-protected-body{padding:10px 11px 12px;display:flex;flex-direction:column;gap:6px;flex:1}.kp-v33-protected-name{font-size:14px;font-weight:900;color:var(--text);line-height:1.13}.kp-v33-protected-latin{font-size:10.5px;color:var(--text3);font-style:italic;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kp-v33-protected-rule{font-size:11px;color:var(--danger);font-weight:800;line-height:1.25;margin-top:auto;display:flex;gap:5px;align-items:flex-start}.kp-v33-protected-rule i{font-size:13px;margin-top:1px;flex:0 0 auto}
      .kp-v33-protected-open{grid-column:1/-1;width:100%;min-height:48px;border-radius:16px;background:linear-gradient(135deg,var(--danger),#b65b3a);color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 22px rgba(160,48,48,.20)}
      .kp-v33-protected-open.secondary{background:rgba(160,48,48,.08);color:var(--danger);border:1px solid rgba(160,48,48,.22);box-shadow:none}
      @media(max-width:760px){#fish-grid.kp-v33-protected-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.kp-v33-protected-head{padding:14px}.kp-v33-protected-card{min-height:168px;border-radius:17px}.kp-v33-protected-img{height:86px}.kp-v33-protected-name{font-size:13.5px}.kp-v33-protected-open{min-height:50px}}
    `;
    document.head.appendChild(s);
  }
  function baseFilteredList(){
    let list=(window.FISH_DB||[]).slice();
    const filter=window.fishFilter||'all';
    const search=String(window.fishSearch||'').toLowerCase();
    if(filter==='catchable'&&typeof window.isHuCatchLogFish==='function')list=list.filter(window.isHuCatchLogFish);
    if(filter==='pondonly'&&typeof window.isHuPondOnlyFish==='function')list=list.filter(window.isHuPondOnlyFish);
    if(filter==='peaceful')list=list.filter(f=>f.cat==='peaceful');
    if(filter==='predator')list=list.filter(f=>f.cat==='predator');
    if(filter==='native')list=list.filter(f=>f.type==='native');
    if(filter==='invasive')list=list.filter(f=>f.type==='invasive');
    if(filter==='nonnative')list=list.filter(f=>f.type==='nonnative');
    if(filter==='protected'&&typeof window.isHuProtectedOrNotKeepableFish==='function')list=list.filter(window.isHuProtectedOrNotKeepableFish);
    if(filter==='banned'&&typeof window.isBanned==='function')list=list.filter(f=>window.isBanned(f));
    if(search)list=list.filter(f=>String(f.name||'').toLowerCase().includes(search)||String(f.latin||'').toLowerCase().includes(search));
    return list;
  }
  function cardHTML(f){
    const fi=typeof window.getFishImage==='function'?window.getFishImage(f):{src:f.img||'',fallbacks:[]};
    const banned=typeof window.isBanned==='function'&&window.isBanned(f);
    const rule=banned?'Aktív tilalmi idő':(f.ban||'Nem fogható / védett');
    const img=fi.src?`<img src="${safeAttr(fi.src)}" alt="${safeAttr(f.name)}" data-fallback-index="1" data-fallbacks='${safeAttr(JSON.stringify(fi.fallbacks||[]))}' onerror="handleFishImgError(this)" loading="lazy"><div class="ph" style="display:none"><i class="ti ti-fish"></i></div>`:`<div class="ph"><i class="ti ti-fish"></i></div>`;
    return `<button type="button" class="kp-v33-protected-card" onclick="openFishDetail('${safeJS(f.id)}')"><div class="kp-v33-protected-img">${img}</div><div class="kp-v33-protected-body"><div class="kp-v33-protected-name">${safeText(f.name)}</div><div class="kp-v33-protected-latin">${safeText(f.latin||'')}</div><div class="kp-v33-protected-rule"><i class="ti ${banned?'ti-ban':'ti-shield-lock'}"></i><span>${safeText(rule)}</span></div></div></button>`;
  }
  function renderSpecial(){
    const el=document.getElementById('fish-grid');
    if(!el)return false;
    const filter=window.fishFilter||'all';
    const special=(filter==='protected'||filter==='banned');
    if(!special)return false;
    const all=baseFilteredList();
    const hasSearch=!!String(window.fishSearch||'');
    const limit=6;
    const expanded=!!window.KP_V33_SHOW_ALL_PROTECTED_FISH||hasSearch;
    const visible=expanded?all:all.slice(0,limit);
    el.classList.add('kp-v33-protected-grid');
    const title=filter==='banned'?'Tilalmi idő alatt lévő halak':'Nem fogható / védett halfajok';
    const sub=expanded?`${all.length} halfaj megjelenítve. Koppints egy halfajra a nagy kártyához.`:`Az első ${Math.min(limit,all.length)} halfaj kompakt kártyában látszik. Koppintásra nyílik a nagy halfaj-kártya.`;
    el.innerHTML=`<div class="kp-v33-protected-head"><div class="kp-v33-protected-title"><i class="ti ti-shield-lock"></i>${title}</div><div class="kp-v33-protected-sub">${safeText(sub)}</div></div>${visible.map(cardHTML).join('')}${all.length>limit&&!expanded?`<button class="kp-v33-protected-open" onclick="window.KP_V33_SHOW_ALL_PROTECTED_FISH=true;renderFishGrid()"><i class="ti ti-layout-grid-add"></i> Összes tilalmi hal megnyitása</button>`:''}${expanded&&all.length>limit&&!hasSearch?`<button class="kp-v33-protected-open secondary" onclick="window.KP_V33_SHOW_ALL_PROTECTED_FISH=false;renderFishGrid()"><i class="ti ti-chevron-up"></i> Kompakt nézet visszaállítása</button>`:''}`;
    if(typeof window.renderFishImageManager==='function')window.renderFishImageManager();
    return true;
  }
  function hook(){
    addStyle();
    const old=window.renderFishGrid;
    if(typeof old==='function'&&!old.KP_V33_WRAPPED){
      const wrapped=function(){
        addStyle();
        const el=document.getElementById('fish-grid');
        if(el)el.classList.remove('kp-v33-protected-grid');
        if(renderSpecial())return;
        return old.apply(this,arguments);
      };
      wrapped.KP_V33_WRAPPED=true;
      window.renderFishGrid=wrapped;
    }
    const oldSet=window.setFishFilter;
    if(typeof oldSet==='function'&&!oldSet.KP_V33_WRAPPED){
      const wrappedSet=function(f,el){
        window.KP_V33_SHOW_ALL_PROTECTED_FISH=false;
        return oldSet.apply(this,arguments);
      };
      wrappedSet.KP_V33_WRAPPED=true;
      window.setFishFilter=wrappedSet;
    }
    if((window.fishFilter==='protected'||window.fishFilter==='banned')&&typeof window.renderFishGrid==='function')window.renderFishGrid();
  }
  hook();
  setTimeout(hook,500);
  setTimeout(hook,1500);
})();
