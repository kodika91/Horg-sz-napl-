(function(){
  if(window.KP_V33_PROTECTED_FISH_CARDS)return;
  window.KP_V33_PROTECTED_FISH_CARDS=true;
  var s=document.createElement('style');
  s.id='kp-v33-banned-filter-style';
  s.textContent='#page-fish .ftab[onclick*=banned]{order:-999!important;background:rgba(160,48,48,.10)!important;border-color:rgba(160,48,48,.26)!important;color:var(--danger,#a03030)!important;font-weight:900!important}#page-fish .ftab[onclick*=banned].active{background:linear-gradient(135deg,var(--danger,#a03030),#b65b3a)!important;color:#fff!important;border-color:transparent!important}.weather-card,.weather-card.theme-clear-day,.weather-card.theme-clear-night,.weather-card.theme-cloudy,.weather-card.theme-rain,.weather-card.theme-storm,.weather-card.theme-mist,.weather-card.theme-snow{border-radius:28px!important;overflow:hidden!important;clip-path:inset(0 round 28px)!important;-webkit-mask-image:-webkit-radial-gradient(white,black)!important}.weather-card::before,.weather-card::after{border-radius:inherit!important;overflow:hidden!important}@media(max-width:640px){.weather-card{border-radius:26px!important;clip-path:inset(0 round 26px)!important}}';
  document.head.appendChild(s);
  if(!document.getElementById('kp-v33-safety-data-repo')){
    var k=document.createElement('script');
    k.id='kp-v33-safety-data-repo';
    k.src='assets/kp-v33-safety-data-repo.js?v=20260519-334';
    document.body.appendChild(k);
  }
})();