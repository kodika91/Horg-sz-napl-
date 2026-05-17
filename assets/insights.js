(function(){
'use strict';
var MIN=3;

function addStyle(){
  if(document.getElementById('ins2-style'))return;
  var s=document.createElement('style');
  s.id='ins2-style';
  s.textContent=
    '.insights-btn{display:none!important}'
   +'.insights-entry{display:flex!important;align-items:center;gap:12px;width:100%;box-sizing:border-box;margin:12px 0;border:1px solid rgba(40,90,70,.16);background:rgba(255,255,255,.78);color:#24301f;border-radius:18px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,.08);font-family:inherit;text-align:left;cursor:pointer;overflow:hidden}'
   +'.insights-entry .ico{width:42px;height:42px;min-width:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#e8f0e8;border:1px solid #cad8ca;color:#2f756c;font-size:22px;flex-shrink:0}'
   +'.insights-entry strong{display:block;font-size:16px;margin-bottom:2px;line-height:1.2}'
   +'.insights-entry span{display:block;font-size:12px;color:#746858;line-height:1.3}'
   +'.insights-entry .arr{margin-left:auto;color:#a78f73;font-size:26px;flex-shrink:0}'
   +'.ins-panel{position:fixed;inset:0;display:none;z-index:100000;background:rgba(0,0,0,.48);overflow:auto}'
   +'.ins-panel.show{display:flex;align-items:flex-start;justify-content:center;padding:16px 12px}'
   +'.ins-wrap{width:min(860px,100%);background:#fbfaf4;border-radius:24px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.3);font-family:system-ui,-apple-system,sans-serif;color:#24301f;margin-bottom:24px}'
   +'.ins-head{background:linear-gradient(135deg,#1a3a32,#2f6a5e);color:#fff;padding:16px 18px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}'
   +'.ins-head h2{margin:0;font-size:20px;font-weight:800}'
   +'.ins-head p{margin:4px 0 0;font-size:13px;opacity:.85}'
   +'.ins-close{border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.14);color:#fff;border-radius:12px;padding:8px 14px;font-weight:700;cursor:pointer;font-size:14px;flex-shrink:0}'
   +'.ins-sum{display:flex;background:#e4f0ea;border-bottom:1px solid #cde0d6}'
   +'.ins-stat{flex:1;text-align:center;padding:11px 6px;border-right:1px solid #cde0d6}'
   +'.ins-stat:last-child{border-right:none}'
   +'.ins-stat .sv{font-size:21px;font-weight:800;color:#1a5248;line-height:1}'
   +'.ins-stat .sl{font-size:11px;color:#3a6a5e;margin-top:3px}'
   +'.ins-body{padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}'
   +'@media(max-width:580px){.ins-body{grid-template-columns:1fr}}'
   +'.ins-card{background:#fff;border:1px solid #e4e5dd;border-radius:16px;padding:14px}'
   +'.ins-card.wide{grid-column:1/-1}'
   +'.ins-card h3{margin:0 0 10px;font-size:14px;font-weight:700;color:#2a3a28}'
   +'.ins-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0ece3;font-size:13px}'
   +'.ins-row:last-child{border-bottom:none}'
   +'.ins-badge{background:#e4f0ea;color:#1a5248;border-radius:8px;padding:2px 8px;font-size:11px;font-weight:700;margin-left:auto;white-space:nowrap}'
   +'.ins-badge.lo{background:#fdf0e0;color:#8a5a20}'
   +'.ins-empty{color:#9a8a7a;font-size:13px;font-style:italic;padding:6px 0;line-height:1.55}'
   +'.ins-note{background:#f4eedf;border-left:4px solid #3f7e72;border-radius:10px;padding:10px 12px;font-size:13px;line-height:1.55;color:#3a2818;margin-bottom:8px}'
   +'.ins-note:last-child{margin-bottom:0}'
   +'.ins-br{display:flex;align-items:center;gap:8px;margin:5px 0}'
   +'.ins-brl{font-size:12px;color:#5a4a38;min-width:85px;max-width:85px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'
   +'.ins-bar{height:8px;background:#e4ede8;border-radius:4px;flex:1;overflow:hidden}'
   +'.ins-bar-f{height:100%;background:#3a7e6e;border-radius:4px}'
   +'.ins-brv{font-size:11px;color:#4a6058;white-space:nowrap}'
   +'.ins-nodata{text-align:center;padding:30px 16px;color:#8a7a6a;grid-column:1/-1}'
   +'.ins-nodata .ni{font-size:40px;margin-bottom:10px}'
   +'.ins-nodata strong{display:block;font-size:15px;margin-bottom:6px;color:#4a3a28}'
   +'.ins-nodata small{font-size:12px;color:#a89a88}';
  document.head.appendChild(s);
}

function nt(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function gf(o,ks){for(var i=0;i<ks.length;i++){var v=o[ks[i]];if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;}return null;}

function fLoc(s){return gf(s,['helyszin','helyszínNeve','location','hely','place','vizter','viz','fishingSpot']);}
function fBait(s){return gf(s,['csali','csali_tipus','csalifajta','bait','csal','baitType']);}
function fMethod(s){return gf(s,['modszer','horgaszmodszer','method','technika','technique','fishing_method']);}
function fWeather(s){return gf(s,['idojaras','idojaras_leiras','weather','ido','tempo','weatherDesc']);}
function fNotes(s){return gf(s,['megjegyzes','megjegyzes2','notes','note','comment','leiras','egyeb','description']);}
function fDate(s){return gf(s,['datum','idopont','date','time','kelt','createdAt','timestamp']);}

function fishList(s){
  var f=gf(s,['fogott','fogasok','fogasok_lista','fogaslista','caught','halfajok','halak','fish','catches']);
  if(!f)return[];
  if(typeof f==='number'&&f>0)return[{faj:'ismeretlen halfaj',db:f}];
  if(typeof f==='string'&&f.trim()){
    return f.split(/[;,]+/).map(function(p){
      p=p.trim();if(!p)return null;
      var m=p.match(/^(.+?)\s+(\d+)\s*(db|darab|pcs?)?$/i);
      if(m)return{faj:m[1].trim(),db:parseInt(m[2])||1};
      return{faj:p,db:1};
    }).filter(Boolean);
  }
  if(Array.isArray(f)){
    return f.map(function(x){
      if(!x)return null;
      if(typeof x==='string')return{faj:x,db:1};
      if(typeof x==='object'){
        var faj=x.faj||x.halfaj||x.halfajNeve||x.species||x.name||x.tipus||'?';
        var db=parseInt(x.db||x.count||x.mennyiseg||x.darabszam||1)||1;
        return{faj:faj,db:db};
      }
      return null;
    }).filter(Boolean);
  }
  if(typeof f==='object'){
    return Object.keys(f).map(function(k){return{faj:k,db:parseInt(f[k])||1};});
  }
  return[];
}

function totalFish(sessions){
  var t=0;
  sessions.forEach(function(s){fishList(s).forEach(function(f){t+=f.db||0;});});
  return t;
}

function hasFields(o){
  var ks=['datum','date','helyszin','location','hely','modszer','method','csali','bait','fogott','caught','halak','fogasok','idojaras','weather','megjegyzes','notes'];
  var found=0;ks.forEach(function(k){if(o[k]!==undefined)found++;});return found>=2;
}

function readSessions(){
  var sessions=[],seen={};
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    try{
      var raw=localStorage.getItem(k);
      if(!raw||raw.length<10)continue;
      var val=JSON.parse(raw);
      if(Array.isArray(val)){
        val.forEach(function(item,idx){
          if(item&&typeof item==='object'&&hasFields(item)){
            var uid=JSON.stringify([item.datum||item.date,item.helyszin||item.location,idx]);
            if(!seen[uid]){seen[uid]=1;sessions.push(item);}
          }
        });
      }else if(val&&typeof val==='object'&&!Array.isArray(val)&&hasFields(val)){
        var uid2=JSON.stringify([val.datum||val.date,val.helyszin||val.location]);
        if(!seen[uid2]){seen[uid2]=1;sessions.push(val);}
      }
    }catch(e){}
  }
  return sessions;
}

function rank(sessions,getter){
  var map={};
  sessions.forEach(function(s){
    var v=getter(s);if(!v||String(v).trim()==='')return;
    var k=nt(String(v));
    if(!map[k])map[k]={label:String(v),count:0,fish:0};
    map[k].count++;
    map[k].fish+=totalFish([s]);
  });
  return Object.values(map).sort(function(a,b){return b.fish-a.fish||b.count-a.count;});
}

function bars(items){
  if(!items.length)return'<div class="ins-empty">Nincs elég adat ehhez az elemzéshez.</div>';
  var max=Math.max.apply(null,items.slice(0,5).map(function(i){return i.fish||i.count;}));
  if(!max)max=1;
  return items.slice(0,5).map(function(it){
    var val=it.fish>0?it.fish:it.count;
    var pct=Math.round(val/max*100);
    var valStr=it.fish>0?(it.fish+' hal, '+it.count+' alk.'):(it.count+' alkalom');
    return'<div class="ins-br"><span class="ins-brl" title="'+esc(it.label)+'">'+esc(it.label.substring(0,15))+'</span>'
      +'<div class="ins-bar"><div class="ins-bar-f" style="width:'+pct+'%"></div></div>'
      +'<span class="ins-brv">'+esc(valStr)+'</span></div>';
  }).join('');
}

function renderPanel(sessions){
  if(!sessions.length){
    return'<div class="ins-body"><div class="ins-nodata"><div class="ni">📖</div>'
      +'<strong>Még nincs naplóadat.</strong>'
      +'<p>Rögzíts horgászatokat, hogy az elemzés elkezdjen működni.</p>'
      +'<small>Az elemzés automatikusan frissül, ahogy adatokat rögzítesz.</small></div></div>';
  }
  if(sessions.length<MIN){
    return'<div class="ins-body"><div class="ins-nodata"><div class="ni">📊</div>'
      +'<strong>Még kevés naplóadat áll rendelkezésre megbízható tanulságokhoz.</strong>'
      +'<p>Legalább '+MIN+' bejegyzés szükséges – eddig: <strong>'+sessions.length+'</strong> db</p>'
      +'<small>Rögzíts még '+(MIN-sessions.length)+' horgászatot a megbízható elemzéshez!</small></div></div>';
  }

  var locs=rank(sessions,fLoc);
  var baits=rank(sessions,fBait);
  var methods=rank(sessions,fMethod);
  var wlist=rank(sessions,fWeather);
  var totalS=sessions.length;
  var totalF=totalFish(sessions);
  var successS=sessions.filter(function(s){return totalFish([s])>0;}).length;
  var pct=totalS?Math.round(successS/totalS*100):0;

  var fishMap={};
  sessions.forEach(function(s){
    var l=fLoc(s)||'?',b=fBait(s)||'?';
    fishList(s).forEach(function(f){
      var k=nt(f.faj);if(!k||k==='?'||k==='ismeretlen halfaj')return;
      if(!fishMap[k])fishMap[k]={label:f.faj,count:0,locs:{},baits:{}};
      fishMap[k].count+=f.db||1;
      fishMap[k].locs[nt(l)]=(fishMap[k].locs[nt(l)]||0)+(f.db||1);
      fishMap[k].baits[nt(b)]=(fishMap[k].baits[nt(b)]||0)+(f.db||1);
    });
  });
  var fishArr=Object.values(fishMap).sort(function(a,b){return b.count-a.count;});

  var lessonArr=sessions.filter(function(s){
    var nn=fNotes(s);return nn&&String(nn).trim().length>15;
  }).slice(-8).reverse();

  var html='<div class="ins-sum">'
    +'<div class="ins-stat"><div class="sv">'+totalS+'</div><div class="sl">horgászat</div></div>'
    +'<div class="ins-stat"><div class="sv">'+totalF+'</div><div class="sl">fogott hal</div></div>'
    +'<div class="ins-stat"><div class="sv">'+successS+'</div><div class="sl">sikeres nap</div></div>'
    +'<div class="ins-stat"><div class="sv">'+pct+'%</div><div class="sl">sikerességi %</div></div>'
    +'</div><div class="ins-body">';

  html+='<div class="ins-card"><h3>📍 Legjobb helyek</h3>'+bars(locs)+'</div>';
  html+='<div class="ins-card"><h3>🧱 Legjobb csalik</h3>'+bars(baits)+'</div>';
  html+='<div class="ins-card"><h3>🎣 Legjobb módszerek</h3>'+bars(methods)+'</div>';

  html+='<div class="ins-card"><h3>🌤 Időjárási összefüggések</h3>';
  if(wlist.length<2){
    html+='<div class="ins-empty">Legalább 2 különböző időjárási feltétel szükséges az összehasonlításhoz.</div>';
  }else{
    html+=wlist.slice(0,5).map(function(w){
      var avg=w.count>0?(w.fish/w.count).toFixed(1):0;
      return'<div class="ins-row"><span style="flex:1">'+esc(w.label)+'</span>'
        +'<span class="ins-badge'+(w.fish===0?' lo':'')+'">'+avg+' hal/nap</span></div>';
    }).join('');
  }
  html+='</div>';

  html+='<div class="ins-card"><h3>🐟 Halfaj szerinti tapasztalatok</h3>';
  if(!fishArr.length){
    html+='<div class="ins-empty">Rögzítsd a fogott halakat fajok szerint, hogy ez a kártya feltöltődjön!</div>';
  }else{
    html+=fishArr.slice(0,7).map(function(f){
      var bl=Object.entries(f.locs).sort(function(a,b){return b[1]-a[1];})[0];
      var bb=Object.entries(f.baits).sort(function(a,b){return b[1]-a[1];})[0];
      var details=[];
      if(bl&&bl[0]!=='?')details.push('Legtöbb: '+bl[0]);
      if(bb&&bb[0]!=='?')details.push('Csali: '+bb[0]);
      return'<div class="ins-row"><div style="flex:1;min-width:0">'
        +'<strong style="font-size:13px">'+esc(f.label)+'</strong>'
        +(details.length?'<br><small style="color:#7a6a58">'+esc(details.join(' · '))+'</small>':'')
        +'</div><span class="ins-badge">'+f.count+' db</span></div>';
    }).join('');
  }
  html+='</div>';

  html+='<div class="ins-card wide"><h3>💡 Saját megjegyzésekből kiemelt tanulságok</h3>';
  if(!lessonArr.length){
    html+='<div class="ins-empty">Adj megjegyzéseket a bejegyzésekhez, hogy tanulságok jelenjenek meg itt.</div>';
  }else{
    html+=lessonArr.slice(0,5).map(function(s){
      var meta=[fDate(s),fLoc(s)].filter(Boolean).join(' · ');
      var txt=String(fNotes(s)).substring(0,320);
      return'<div class="ins-note">'
        +(meta?'<small style="color:#7a6a58;display:block;margin-bottom:4px">'+esc(meta)+'</small>':'')
        +esc(txt)+'</div>';
    }).join('');
  }
  html+='</div></div>';
  return html;
}

function openPanel(){
  addStyle();
  var panel=document.getElementById('ins2-panel');
  if(!panel){
    panel=document.createElement('div');
    panel.id='ins2-panel';
    panel.className='ins-panel';
    panel.innerHTML='<div class="ins-wrap">'
      +'<div class="ins-head"><div><h2>Tapasztalat</h2>'
      +'<p>A naplóadatokból készülő horgászati tudástár</p></div>'
      +'<button class="ins-close" type="button">Bezár ✕</button></div>'
      +'<div id="ins2-body"></div></div>';
    document.body.appendChild(panel);
    panel.querySelector('.ins-close').onclick=function(){panel.classList.remove('show');};
    panel.onclick=function(e){if(e.target===panel)panel.classList.remove('show');};
  }
  panel.querySelector('#ins2-body').innerHTML=renderPanel(readSessions());
  panel.classList.add('show');
}

function textOf(el){return(el&&el.textContent||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function isCard(el){
  if(!el||!el.getBoundingClientRect)return false;
  var r=el.getBoundingClientRect(),t=textOf(el);
  return r.width>250&&r.height>56&&r.height<150&&t.indexOf('terkep')>-1&&t.indexOf('gps')>-1;
}
function findMapCard(){
  var els=Array.prototype.slice.call(document.querySelectorAll('button,a,div,li'));
  for(var i=0;i<els.length;i++){
    if(textOf(els[i]).indexOf('terkep')>-1&&textOf(els[i]).indexOf('gps')>-1){
      var node=els[i];
      for(var j=0;j<6&&node;j++,node=node.parentElement){if(isCard(node))return node;}
    }
  }
  return null;
}

function syncSize(entry,ref){
  try{
    var cs=window.getComputedStyle(ref);
    var h=ref.getBoundingClientRect().height;
    if(h>20){
      entry.style.height=h+'px';
      entry.style.paddingTop=cs.paddingTop;
      entry.style.paddingBottom=cs.paddingBottom;
      entry.style.paddingLeft=cs.paddingLeft;
      entry.style.paddingRight=cs.paddingRight;
      entry.style.borderRadius=cs.borderRadius;
    }
  }catch(e){}
}

function createEntry(){
  var b=document.createElement('button');
  b.id='insights-entry';
  b.className='insights-entry';
  b.type='button';
  b.innerHTML='<div class="ico">⅁</div>'
    +'<div><strong>Tapasztalat</strong>'
    +'<span>Elemzések és tanulságok a naplóadatokból</span></div>'
    +'<div class="arr">›</div>';
  b.onclick=openPanel;
  return b;
}

var _mounting=false;
function mount(){
  if(_mounting)return;_mounting=true;
  addStyle();
  var old=document.getElementById('insights-btn');if(old)old.remove();
  var card=findMapCard();if(!card){_mounting=false;return;}
  var ex=document.getElementById('insights-entry');
  if(ex){
    if(ex.previousElementSibling!==card&&ex.parentNode!==card.parentNode)ex.remove();
    else{requestAnimationFrame(function(){syncSize(ex,card);});_mounting=false;return;}
  }
  var entry=createEntry();
  card.parentNode.insertBefore(entry,card.nextSibling);
  requestAnimationFrame(function(){syncSize(entry,card);});
  _mounting=false;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
setTimeout(mount,800);setTimeout(mount,1800);setTimeout(mount,3500);
document.addEventListener('click',function(){setTimeout(mount,350);},true);
try{new MutationObserver(function(){mount();}).observe(document.body,{childList:true,subtree:true});}catch(e){}
window.openInsightsPanel=openPanel;
document.addEventListener('click',function(ev){
  try{if(ev.target&&ev.target.closest&&ev.target.closest('#insights-entry')){openPanel();ev.stopPropagation();ev.preventDefault();}}catch(e){}
},true);
})();