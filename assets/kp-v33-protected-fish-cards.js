(function(){
  if(window.KP_V33_PROTECTED_FISH_CARDS)return;
  window.KP_V33_PROTECTED_FISH_CARDS=true;
  var s=document.createElement('style');
  s.id='kp-v33-banned-filter-style';
  s.textContent='#page-fish .ftab[onclick*=banned]{order:-999!important;background:rgba(160,48,48,.10)!important;border-color:rgba(160,48,48,.26)!important;color:var(--danger,#a03030)!important;font-weight:900!important}#page-fish .ftab[onclick*=banned].active{background:linear-gradient(135deg,var(--danger,#a03030),#b65b3a)!important;color:#fff!important;border-color:transparent!important}';
  document.head.appendChild(s);
})();
