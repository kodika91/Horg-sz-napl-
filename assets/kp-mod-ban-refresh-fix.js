// kp-mod-ban-refresh-fix.js
(function(){
if(window.KP_BAN_ENGINE)return;window.KP_BAN_ENGINE=true;
var old=window.currentBanState;
var M={jan:1,januar:1,feb:2,februar:2,mar:3,marcius:3,apr:4,aprilis:4,maj:5,majus:5,jun:6,junius:6,jul:7,julius:7,aug:8,augusztus:8,sze:9,szept:9,szeptember:9,okt:10,oktober:10,nov:11,november:11,dec:12,december:12};
var R={i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11,xii:12};
function n(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\./g,'').trim();}
function mo(s){s=n(s);return R[s]||M[s]||0;}
function parse(t){
 t=String(t||'');
 if(!t||/nem foghato|nem fogható|vedett|védett|helyi szabaly|helyi szabály/i.test(t))return null;
 var re=/([ivx]{1,4}|jan\.?|feb\.?|mar\.?|már\.?|apr\.?|ápr\.?|maj\.?|máj\.?|jun\.?|jún\.?|jul\.?|júl\.?|aug\.?|sze\.?|szept\.?|okt\.?|nov\.?|dec\.?)\s*(\d{1,2})/giu;
 var a=[],m;
 while((m=re.exec(t))){var mm=mo(m[1]),dd=parseInt(m[2],10);if(mm&&dd)a.push([mm,dd]);}
 return a.length>1?{s:a[0],e:a[1]}:null;
}
function inside(p){
 if(!p)return false;
 var d=new Date(),y=d.getFullYear();
 var now=new Date(y,d.getMonth(),d.getDate()).getTime();
 var a=new Date(y,p.s[0]-1,p.s[1]).getTime();
 var b=new Date(y,p.e[0]-1,p.e[1]).getTime();
 if(b<a){if(now>=a)return true;a=new Date(y-1,p.s[0]-1,p.s[1]).getTime();}
 return now>=a&&now<=b;
}
window.currentBanState=function(f){var p=parse(f&&f.ban);if(p)return inside(p);return old?old(f):false;};
function fixHome(){
 var root=document.getElementById('ban-text');if(!root)return;
 var cards=root.getElementsByClassName('kp-v35-card');
 for(var i=cards.length-1;i>=0;i--){var p=parse(cards[i].textContent);if(p&&!inside(p))cards[i].style.display='none';}
 var v=0;for(var j=0;j<cards.length;j++){if(cards[j].style.display!=='none')v++;}
 var sub=root.getElementsByClassName('kp-v35-sub')[0];if(sub&&v)sub.textContent='Jelenleg '+v+' halfaj érintett. Koppints a halfajra a részletekhez. A helyi horgászrend eltérhet.';
 var al=document.getElementById('ban-alert');if(al&&cards.length&&v===0)al.style.display='none';
}
function run(){try{if(typeof checkBans==='function')checkBans();}catch(e){}setTimeout(fixHome,100);setTimeout(fixHome,500);try{if(typeof renderFishGrid==='function')renderFishGrid();}catch(e){}}
setTimeout(run,300);setTimeout(run,1200);setInterval(run,3000);
window.kpBanEngineDebug=function(){try{return (typeof FISH_DB!=='undefined'?FISH_DB:[]).filter(window.currentBanState).map(function(f){return f.name+' | '+f.ban;});}catch(e){return String(e.message||e);}};
})();
