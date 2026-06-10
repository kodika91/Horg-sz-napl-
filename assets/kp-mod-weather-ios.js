// kp-mod-weather-ios.js — iOS-stílusú immerzív időjárás "lap"
// A weather-card keret nélküli felületté válik, finom élő háttérrel, üveg panelekkel.
// A weather-mod által adott .kp-apple-weather osztályra épít (magasabb specificitás),
// így ha nincs jelen, semmit nem ront. Kikapcsolás: töröld a betöltő sort az index.html-ből.
(function(){
  if(window.KP_MOD_WEATHER_IOS)return;
  window.KP_MOD_WEATHER_IOS=true;

  function inject(){
    if(document.getElementById('kp-weather-ios-style'))return;
    var s=document.createElement('style');
    s.id='kp-weather-ios-style';
    s.textContent=[
      /* Keret eltüntetése -> egybefüggő "lap", finom élő háttér-sodródás */
      '.weather-card.kp-apple-weather{border:0!important;border-radius:24px!important;box-shadow:0 20px 54px rgba(20,60,90,.28)!important;overflow:hidden!important;background-size:170% 170%!important;animation:kpSkyDrift 24s ease-in-out infinite alternate!important;padding:22px 20px 18px!important}',
      /* Nap/hold fény lassú lüktetése (a meglévő ::after-on) */
      '.weather-card.kp-apple-weather::after{animation:kpSunFloat 10s ease-in-out infinite!important}',
      /* Óriási, letisztult hőfok */
      '.weather-card.kp-apple-weather .weather-temp{font-size:clamp(58px,15vw,98px)!important;font-weight:800!important;letter-spacing:-.05em!important;line-height:.9!important}',
      '.weather-card.kp-apple-weather .weather-desc{font-size:15px!important;letter-spacing:.01em!important;opacity:.95!important}',
      /* Üveg al-panelek (órás előrejelzés + részletek) — "egy lapon ülnek" */
      '.weather-card.kp-apple-weather .forecast-item,.weather-card.kp-apple-weather .wd-card,.weather-card.kp-apple-weather .weather-detail,.weather-card.kp-apple-weather .weather-details>div{background:rgba(255,255,255,.15)!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:18px!important;-webkit-backdrop-filter:saturate(170%) blur(18px)!important;backdrop-filter:saturate(170%) blur(18px)!important}',
      '.weather-card.kp-apple-weather .forecast-wrap{border-top:1px solid rgba(255,255,255,.18)!important;margin-top:14px!important;padding-top:14px!important}',
      '.weather-card.kp-apple-weather .section-label{letter-spacing:.06em!important;text-transform:uppercase!important;opacity:.85!important}',
      /* Animációk */
      '@keyframes kpSkyDrift{0%{background-position:0% 0%}100%{background-position:100% 100%}}',
      '@keyframes kpSunFloat{0%,100%{transform:translateY(0) scale(1);opacity:.95}50%{transform:translateY(7px) scale(1.05);opacity:1}}',
      /* Mozgáscsökkentés tisztelete */
      '@media(prefers-reduced-motion:reduce){.weather-card.kp-apple-weather{animation:none!important}.weather-card.kp-apple-weather::after{animation:none!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  inject();
  setInterval(inject,3000);
})();
