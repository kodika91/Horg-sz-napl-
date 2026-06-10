// kp-mod-weather-ios.js — iOS-stílusú immerzív időjárás "lap" (v3: külön élő ég-réteg)
// A weather-card keret nélküli felület; mobilon edge-to-edge. Az "élő" hátteret
// egy külön .kp-live-sky réteg adja (tartalom mögött), amit a téma-osztályok nem
// írnak felül -> garantáltan animál. Kikapcsolás: töröld a betöltő sort az index.html-ből.
(function(){
  if(window.KP_MOD_WEATHER_IOS)return;
  window.KP_MOD_WEATHER_IOS=true;

  function injectStyle(){
    if(document.getElementById('kp-weather-ios-style'))return;
    var s=document.createElement('style');
    s.id='kp-weather-ios-style';
    s.textContent=[
      /* Alap: keret nélküli, levegős lap (gép = lekerekített) */
      '.weather-card.kp-apple-weather{position:relative!important;border:0!important;box-shadow:0 20px 54px rgba(20,60,90,.26)!important;overflow:hidden!important;border-radius:26px!important;padding:26px 22px 22px!important}',
      /* Mobil: TELJES szélességű, kerettelen "lap" */
      '@media(max-width:980px){.weather-card.kp-apple-weather{width:100vw!important;max-width:100vw!important;margin-left:50%!important;transform:translateX(-50%)!important;border-radius:0!important;padding:30px 18px 26px!important;box-shadow:0 14px 40px rgba(20,60,90,.22)!important}}',
      /* ÉLŐ ég-réteg: külön elem a tartalom mögött, garantáltan animál */
      '.weather-card.kp-apple-weather .kp-live-sky{position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none!important;background:radial-gradient(120% 80% at 18% 12%, rgba(255,255,255,.22), transparent 52%), radial-gradient(120% 90% at 85% 78%, rgba(255,255,255,.12), transparent 56%)!important;background-size:200% 200%!important;animation:kpSkyDrift 26s ease-in-out infinite alternate!important}',
      /* Nap/hold fény lassú lüktetése */
      '.weather-card.kp-apple-weather::after{animation:kpSunFloat 10s ease-in-out infinite!important}',
      /* Óriási, letisztult hőfok */
      '.weather-card.kp-apple-weather .weather-temp{font-size:clamp(64px,18vw,108px)!important;font-weight:800!important;letter-spacing:-.05em!important;line-height:.88!important}',
      '.weather-card.kp-apple-weather .weather-desc{font-size:16px!important;opacity:.95!important;margin-top:2px!important}',
      '.weather-card.kp-apple-weather .weather-loc{font-size:15px!important;opacity:.92!important}',
      /* Üveg al-panelek */
      '.weather-card.kp-apple-weather .forecast-item,.weather-card.kp-apple-weather .wd-card,.weather-card.kp-apple-weather .weather-detail,.weather-card.kp-apple-weather .weather-details>div{background:rgba(255,255,255,.14)!important;border:1px solid rgba(255,255,255,.20)!important;border-radius:18px!important;-webkit-backdrop-filter:saturate(170%) blur(18px)!important;backdrop-filter:saturate(170%) blur(18px)!important}',
      '.weather-card.kp-apple-weather .forecast-wrap{border-top:1px solid rgba(255,255,255,.18)!important;margin-top:16px!important;padding-top:16px!important}',
      '.weather-card.kp-apple-weather .section-label{letter-spacing:.06em!important;text-transform:uppercase!important;opacity:.85!important}',
      /* Animációk */
      '@keyframes kpSkyDrift{0%{background-position:0% 0%}100%{background-position:100% 100%}}',
      '@keyframes kpSunFloat{0%,100%{transform:translateY(0) scale(1);opacity:.95}50%{transform:translateY(7px) scale(1.05);opacity:1}}',
      /* Mozgáscsökkentés tisztelete */
      '@media(prefers-reduced-motion:reduce){.weather-card.kp-apple-weather .kp-live-sky{animation:none!important}.weather-card.kp-apple-weather::after{animation:none!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  function injectOverlay(){
    document.querySelectorAll('.weather-card.kp-apple-weather').forEach(function(c){
      if(!c.querySelector('.kp-live-sky')) c.insertAdjacentHTML('afterbegin','<div class="kp-live-sky" aria-hidden="true"></div>');
    });
  }

  injectStyle();
  injectOverlay();
  setInterval(function(){injectStyle();injectOverlay();},2500);
})();
