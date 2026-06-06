(function(){
  if(window.KP_V28_SEASON_WEATHER)return;
  window.KP_V28_SEASON_WEATHER=true;

  function month(){return new Date().getMonth()+1;}
  function seasonName(){
    var m=month();
    if(m===12||m===1||m===2)return 'winter';
    if(m>=3&&m<=5)return 'spring';
    if(m>=6&&m<=8)return 'summer';
    return 'autumn';
  }
  function applySeason(){
    var s=seasonName();
    document.documentElement.setAttribute('data-season',s);
    document.body.classList.remove('season-spring','season-summer','season-autumn','season-winter');
    document.body.classList.add('season-'+s);
  }

  var css='';
  css += ':root[data-season="spring"]{--bg:#f3f7ed;--bg2:#e8f0dd;--bg3:#dce8cf;--card:#fbfff6;--card2:#eef6e6;--water:#4f8f72;--water2:#75aa62;--moss:#5d914d;--sunset:#c98b45;--season-accent:#75aa62;--season-soft:rgba(117,170,98,.14)}';
  css += ':root[data-season="summer"]{--bg:#eef7f3;--bg2:#dff0ec;--bg3:#d0e8e4;--card:#f8fffc;--card2:#e8f6f2;--water:#237f92;--water2:#36a8bd;--moss:#4a9b62;--sunset:#e08b3d;--season-accent:#36a8bd;--season-soft:rgba(54,168,189,.14)}';
  css += ':root[data-season="autumn"]{--bg:#f4f0e8;--bg2:#ede3d5;--bg3:#e4d6c4;--card:#fff9f0;--card2:#f3eadc;--water:#6f7f4b;--water2:#a85a2b;--moss:#6f7f4b;--sunset:#c76f2c;--season-accent:#a85a2b;--season-soft:rgba(168,90,43,.14)}';
  css += ':root[data-season="winter"]{--bg:#eef3f7;--bg2:#e1e9f0;--bg3:#d4e0e9;--card:#fbfdff;--card2:#edf4fa;--water:#3b6f93;--water2:#6e9fc0;--moss:#557f8f;--sunset:#8a7cc2;--season-accent:#6e9fc0;--season-soft:rgba(110,159,192,.16)}';
  css += 'body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(circle at 15% 8%,var(--season-soft),transparent 32%),radial-gradient(circle at 92% 18%,rgba(255,255,255,.42),transparent 28%)}';
  css += '.sidebar-brand,.top-bar{background:color-mix(in srgb,var(--bg) 88%,white 12%)!important}.brand-logo,.new-session-btn-side,.tb-btn.primary{background:linear-gradient(135deg,var(--water),var(--water2))!important}.nav-item-side.active{background:var(--season-soft)!important;border-color:color-mix(in srgb,var(--season-accent) 45%,transparent)!important;color:var(--water)!important}.stat-icon,.loc-icon,.item-icon{background:linear-gradient(135deg,var(--season-soft),rgba(255,255,255,.45))!important}';
  css += '.weather-card{border:0!important;border-radius:28px!important;background:linear-gradient(160deg,#68b8ff 0%,#4a98f0 48%,#2f73d2 100%)!important;color:#fff!important;box-shadow:0 18px 45px rgba(36,100,170,.25)!important;overflow:hidden!important;position:relative!important}.weather-card::before{content:""!important;position:absolute!important;inset:0!important;background:radial-gradient(circle at 18% 12%,rgba(255,255,255,.55),transparent 30%),radial-gradient(circle at 78% 6%,rgba(255,255,255,.22),transparent 24%)!important;opacity:1!important;pointer-events:none!important}.weather-card::after{content:""!important;position:absolute!important;right:-42px!important;top:-38px!important;width:150px!important;height:150px!important;border-radius:50%!important;background:radial-gradient(circle,#fff7aa 0%,#ffd65a 38%,rgba(255,214,90,.08) 70%,transparent 72%)!important;filter:blur(.1px)!important;opacity:.95!important}.weather-card *{position:relative;z-index:1}.weather-card .section-label,.weather-card .weather-desc,.weather-card .weather-loc,.weather-card .wd-lbl,.weather-card .forecast-title,.weather-card .forecast-sub,.weather-card .forecast-meta{color:rgba(255,255,255,.84)!important}.weather-card .weather-temp,.weather-card .wd-val,.weather-card .forecast-temp,.weather-card .forecast-hour{color:#fff!important}.weather-icon-big{background:rgba(255,255,255,.18)!important;border-color:rgba(255,255,255,.24)!important;color:#fff!important;backdrop-filter:blur(16px)!important}.forecast-item,.weather-card .w-btn,.weather-card .mini-btn{background:rgba(255,255,255,.16)!important;border:1px solid rgba(255,255,255,.24)!important;color:#fff!important;backdrop-filter:blur(16px)!important}.forecast-wrap{border-top:1px solid rgba(255,255,255,.20)!important}.weather-details>div,.weather-detail,.wd-card{background:rgba(255,255,255,.14)!important;border-color:rgba(255,255,255,.22)!important;border-radius:18px!important;backdrop-filter:blur(14px)!important}';
  css += '.weather-card.theme-clear-night{background:linear-gradient(160deg,#101b38 0%,#1d3565 48%,#315a91 100%)!important}.weather-card.theme-cloudy{background:linear-gradient(160deg,#7f93aa 0%,#667f9a 52%,#4d6d8f 100%)!important}.weather-card.theme-rain{background:linear-gradient(160deg,#526f90 0%,#3f607e 52%,#2c506e 100%)!important}.weather-card.theme-storm{background:linear-gradient(160deg,#23283a 0%,#394358 50%,#596274 100%)!important}.weather-card.theme-mist{background:linear-gradient(160deg,#a9b7c2 0%,#8ea1ae 50%,#718a9a 100%)!important}.weather-card.theme-snow{background:linear-gradient(160deg,#dfefff 0%,#bddcf4 50%,#8eb8df 100%)!important}.weather-card.theme-snow .weather-temp,.weather-card.theme-snow .wd-val,.weather-card.theme-snow .forecast-temp,.weather-card.theme-snow .forecast-hour{color:#1e3a56!important}.weather-card.theme-snow .section-label,.weather-card.theme-snow .weather-desc,.weather-card.theme-snow .weather-loc,.weather-card.theme-snow .wd-lbl,.weather-card.theme-snow .forecast-title,.weather-card.theme-snow .forecast-sub,.weather-card.theme-snow .forecast-meta{color:rgba(30,58,86,.72)!important}';

  css += '.kp-pres-trend{display:inline-block;font-size:13px;font-weight:800;margin-left:2px;line-height:1;vertical-align:middle}.kp-pres-rising{color:#4ade80!important}.kp-pres-falling{color:#fb923c!important}.kp-pres-stable{color:rgba(255,255,255,.6)!important}';
  css += '#kp-pressure-summary{margin-top:14px;padding:11px 15px;border-radius:16px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22);color:#fff;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}';
  css += '#kp-pressure-summary .kp-ps-icon{font-size:20px;line-height:1;flex-shrink:0}';
  css += '#kp-pressure-summary .kp-ps-delta{margin-left:auto;font-size:11px;font-weight:500;opacity:.78;white-space:nowrap}';

  css += '@media(max-width:640px){.weather-card{border-radius:24px!important}.forecast-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.weather-icon-big{width:68px!important;height:68px!important;border-radius:20px!important}}';

  var st=document.createElement('style');
  st.id='kp-v28-season-weather-style';
  st.textContent=css;
  document.head.appendChild(st);

  function enhanceWeather(){
    document.querySelectorAll('.weather-card').forEach(function(card){
      card.classList.add('kp-apple-weather');
      var t=card.querySelector('.weather-temp');
      if(t&&!t.dataset.kpApple){t.dataset.kpApple='1';t.style.fontSize='clamp(46px,9vw,82px)';t.style.fontWeight='800';t.style.letterSpacing='-.06em';t.style.lineHeight='.9';}
    });
  }

  function pressureTrend(prev,curr){
    if(prev==null||curr==null)return 'stable';
    var d=curr-prev;
    if(d>0.5)return 'rising';
    if(d<-0.5)return 'falling';
    return 'stable';
  }
  function trendArrow(t){return t==='rising'?'↑':t==='falling'?'↓':'→';}
  function trendClass(t){return t==='rising'?'kp-pres-rising':t==='falling'?'kp-pres-falling':'kp-pres-stable';}
  function trendLabel(t){return t==='rising'?'emelkedik':t==='falling'?'csökken':'stabil';}
  function fishingHint(trend,delta){
    if(trend==='rising'&&delta>3)return 'Erősen emelkedő nyomás – aktív halak, kiváló horgászkörülmények';
    if(trend==='rising')return 'Emelkedő légnyomás – jó horgászkörülmények várhatók';
    if(trend==='falling'&&delta<-3)return 'Erősen csökkenő nyomás – halak mélyebbre húzódnak, nehezebb fogás';
    if(trend==='falling')return 'Csökkenő légnyomás – a halak kevésbé aktívak';
    return 'Stabil légnyomás – kiegyensúlyozott horgászkörülmények';
  }

  function overrideRenderForecast24(){
    if(window.__kpPressureTrendPatched)return;
    if(typeof window.renderForecast24!=='function')return;
    window.__kpPressureTrendPatched=true;
    var origFormatHour=window.formatHour;
    var origWIcon=window.wIcon;
    window.renderForecast24=function(){
      var el=document.getElementById('forecast-grid');
      if(!el)return;
      var cache=window.forecast24Cache||[];
      if(!cache.length){
        el.innerHTML='<div class="empty-state" style="grid-column:1/-1;padding:14px"><div class="empty-sub">Nincs előrejelzési adat.</div></div>';
        return;
      }
      var items=cache.map(function(f,i){
        var trend='stable',trendVal=0;
        if(i>0&&cache[i-1].pressure!=null&&f.pressure!=null){
          trendVal=f.pressure-cache[i-1].pressure;
          trend=pressureTrend(cache[i-1].pressure,f.pressure);
        }
        return{time:f.time,temp:f.temp,code:f.code,wind:f.wind,pressure:f.pressure,trend:trend,trendVal:trendVal};
      });
      el.innerHTML=items.map(function(f){
        var pres=f.pressure!=null?Math.round(f.pressure)+' hPa':'— hPa';
        var arrow=trendArrow(f.trend);
        var cls=trendClass(f.trend);
        var label=trendLabel(f.trend);
        var fmtHour=typeof origFormatHour==='function'?origFormatHour(f.time):formatHour(f.time);
        var icon=typeof origWIcon==='function'?origWIcon(f.code,new Date(f.time)):wIcon(f.code,new Date(f.time));
        return '<div class="forecast-item">'+
          '<div class="forecast-hour">'+fmtHour+'</div>'+
          '<div class="forecast-icon">'+icon+'</div>'+
          '<div class="forecast-temp">'+Math.round(f.temp)+'°</div>'+
          '<div class="forecast-meta">'+
            Math.round(f.wind)+' km/h<br>'+
            '<span title="'+label+'" style="white-space:nowrap">'+
              pres+
              '<span class="kp-pres-trend '+cls+'">'+arrow+'</span>'+
            '</span>'+
          '</div>'+
        '</div>';
      }).join('');
      var withPres=items.filter(function(x){return x.pressure!=null;});
      var summaryTrend='stable',summaryDelta=0;
      if(withPres.length>=2){
        summaryDelta=withPres[withPres.length-1].pressure-withPres[0].pressure;
        if(summaryDelta>1.5)summaryTrend='rising';
        else if(summaryDelta<-1.5)summaryTrend='falling';
      }
      var strip=document.getElementById('kp-pressure-summary');
      var wrap=el.closest?el.closest('.forecast-wrap'):null;
      if(!wrap)wrap=el.parentElement;
      if(!strip&&wrap){strip=document.createElement('div');strip.id='kp-pressure-summary';wrap.appendChild(strip);}
      if(strip){
        var hint=fishingHint(summaryTrend,summaryDelta);
        var sIcon=trendArrow(summaryTrend);
        var deltaStr=summaryDelta!==0?(summaryDelta>0?'+':'')+summaryDelta.toFixed(1)+' hPa / 24h':'';
        strip.innerHTML='<span class="kp-ps-icon">'+sIcon+'</span><span>'+hint+'</span>'+(deltaStr?'<span class="kp-ps-delta">'+deltaStr+'</span>':'');
      }
    };
  }

  function applyPatchAndRerender(){
    overrideRenderForecast24();
    if(window.__kpPressureTrendPatched){
      if(window.forecast24Cache&&window.forecast24Cache.length&&!document.getElementById('kp-pressure-summary')){
        try{window.renderForecast24();}catch(e){}
      }
    }
  }

  applyPatchAndRerender();
  var patchTries=0;
  var patchInterval=setInterval(function(){
    applyPatchAndRerender();
    patchTries++;
    if(document.getElementById('kp-pressure-summary')||patchTries>80)clearInterval(patchInterval);
  },150);

  applySeason();
  enhanceWeather();
  setInterval(function(){applySeason();enhanceWeather();},2500);
})();
