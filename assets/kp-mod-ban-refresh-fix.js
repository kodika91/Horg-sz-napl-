// kp-mod-ban-refresh-fix.js
(function(){
  if(window.KP_BAN_FIX_HOME_2)return;
  window.KP_BAN_FIX_HOME_2=true;
  var old=window.currentBanState;
  function after(m,d){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())>new Date(n.getFullYear(),m-1,d);}
  function expired(s){s=String(s||'').toLowerCase();return ((s.indexOf('máj. 29')>-1||s.indexOf('maj. 29')>-1)&&after(5,29))||((s.indexOf('ápr. 30')>-1||s.indexOf('apr. 30')>-1)&&after(4,30));}
  window.currentBanState=function(f){if(expired(f&&f.ban))return false;return old?old(f):false;};
  function home(){
    var root=document.getElementById('ban-text');
    if(!root)return;
    var cards=root.getElementsByClassName('kp-v35-card');
    for(var i=cards.length-1;i>=0;i--){if(expired(cards[i].textContent))cards[i].style.display='none';}
    var visible=0;for(var j=0;j<cards.length;j++){if(cards[j].style.display!=='none')visible++;}
    var sub=root.getElementsByClassName('kp-v35-sub')[0];
    if(sub&&visible)sub.textContent='Jelenleg '+visible+' halfaj érintett. Koppints a halfajra a részletekhez. A helyi horgászrend eltérhet.';
    var al=document.getElementById('ban-alert');if(al&&cards.length&&visible===0)al.style.display='none';
  }
  function run(){try{if(typeof checkBans==='function')checkBans();}catch(e){}setTimeout(home,100);setTimeout(home,500);}
  setTimeout(run,300);setTimeout(run,1200);setInterval(run,3000);
})();
