// kp-mod-weather-ios.js — iOS-stílusú immerzív időjárás "lap" (v2: teljes szélességű)
// A weather-card keret nélküli felületté válik; mobilon edge-to-edge "lap".
// A weather-mod által adott .kp-apple-weather osztályra épít (magasabb specificitás).
// Kikapcsolás: töröld a betöltő sort az index.html-ből.
(function(){
  if(window.KP_MOD_WEATHER_IOS)return;
  window.KP_MOD_WEATHER_IOS=true;

  function inject(){
    if(document.getElementById('kp-weather-ios-style'))return;
    var s=document.createElement('style');
    s.id='kp-weather-ios-style';
    s.textContent=[
      /* Alap: keret nélküli, levegős, finoman élő háttér (gép = lekerekített lap) */
      '.weather-card.kp-apple-weather{border:0!important;box-shadow:0 20px 54px rgba(20,60,90,.26)!important;overflow:hidden!important;border-radius:26px!important;padding:26px 22px 22px!important;background-size:170% 170%!important;animation:kpSkyDrift 24s ease-in-out infinite alternate!important}',
      /* Mobil: TELJES szélességű, kerettelen "lap" (edge-to-edge) */
      '@media(max-width:980px){.weather-card.kp-apple-weather{width:100vw!important;max-width:100vw!important;margin-left:50%!important;transform:translateX(-50%)!important;border-radius:0!important;padding:30px 18px 26px!important;box-shadow:0 14px 40px rgba(20,60,90,.22)!important}}',
      /* Nap/hold fény lassú lüktetése */
      '.weather-card.kp-apple-weather::after{animation:kpSunFloat 10s ease-in-out infinite!important}',
      /* Óriási, letisztult hőfok + tipográfia */
      '.weather-card.kp-apple-weather .weather-temp{font-size:clamp(64px,18vw,108px)!important;font-weight:800!important;letter-spacing:-.05em!important;line-height:.88!important}',
      '.weather-card.kp-apple-weather .weather-desc{font-size:16px!important;opacity:.95!important;margin-top:2px!important}',
      '.weather-card.kp-apple-weather .weather-loc{font-size:15px!important;opacity:.92!important}',
      /* Üveg al-panelek (órás előrejelzés + részletek) — minden "egy lapon" */
      '.weather-card.kp-apple-weather .forecast-item,.weather-card.kp-apple-weather .wd-card,.weather-card.kp-apple-weather .weather-detail,.weather-card.kp-apple-weather .weather-details>div{background:rgba(255,255,255,.15)!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:18px!important;-webkit-backdrop-filter:saturate(170%) blur(18px)!important;backdrop-filter:saturate(170%) blur(18px)!important}',
      '.weather-card.kp-apple-weather .forecast-wrap{border-top:1px solid rgba(255,255,255,.18)!important;margin-top:16px!important;padding-top:16px!important}',
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
