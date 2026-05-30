// kp-mod-ban-refresh-fix.js — minimal datum sorrend javitas
(function(){
  if(window.KP_BAN_REFRESH_FIX_MIN)return;
  window.KP_BAN_REFRESH_FIX_MIN=true;
  var previous=window.currentBanState;
  function todayAfter(month,day){
    var n=new Date();
    var today=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime();
    var limit=new Date(n.getFullYear(),month-1,day).getTime();
    return today>limit;
  }
  window.currentBanState=function(f){
    var text=String(f&&f.ban||'').toLowerCase();
    if((text.indexOf('máj. 29')>-1||text.indexOf('maj. 29')>-1||text.indexOf('v. 29')>-1)&&todayAfter(5,29))return false;
    if((text.indexOf('ápr. 30')>-1||text.indexOf('apr. 30')>-1||text.indexOf('iv. 30')>-1)&&todayAfter(4,30))return false;
    return previous?previous(f):false;
  };
  function refresh(){
    try{if(typeof checkBans==='function')checkBans();}catch(e){}
    try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}
  }
  setTimeout(refresh,300);
  setTimeout(refresh,1200);
  setInterval(refresh,60000);
})();
