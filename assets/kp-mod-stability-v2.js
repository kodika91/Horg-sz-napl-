// kp-mod-stability-v2.js — stabilizáló réteg: időjárás, tilalom, halfajok, kontraszt
// Halfaj kártyák: képek nélkül, általános adatokkal + felhasználónként számolt saját statisztikával.
// v9: saját fogások kizárólag a fő adatbázisból: horgaszpro_v0230 -> sessions[] -> catches[].
(function(){
'use strict';
if(window.KP_MOD_STABILITY_SAFE_V9)return;
window.KP_MOD_STABILITY_SAFE_V9=true;
window.KP_MOD_STABILITY_SAFE_V8=true;
window.KP_MOD_STABILITY_SAFE_V7=true;
window.KP_MOD_STABILITY_SAFE_V6=true;
window.KP_MOD_STABILITY_SAFE_V5=true;

function qs(s,r){return (r||document).querySelector(s)}
function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fishDB(){try{return Function('return FISH_DB')()}catch(e){return window.FISH_DB||[]}}
function banState(f){try{return Function('f','return currentBanState(f)')(f)}catch(e){try{return window.currentBanState(f)}catch(_){return false}}}
function asText(v){return String(v==null?'':v).trim()}
function pick(o,keys){for(var i=0;i<keys.length;i++){var v=o&&o[keys[i]];if(v!=null&&String(v).trim()!=='')return v}return ''}
function shortText(v,n){v=asText(v).replace(/\s+/g,' ');return v.length>n?v.slice(0,n-1).trim()+'…':v}

function css(){
  if(qs('#kp-stability-safe-css'))return;
  var s=document.createElement('style');
  s.id='kp-stability-safe-css';
  s.textContent=':root{--g-bg:#061917;--g-card:rgba(8,36,33,.82);--g-line:rgba(174,255,230,.18);--g-text:#f4fff9;--g-muted:rgba(230,255,248,.76);--g-green:#5dff91;--g-warn:#ffd36a;--g-red:#ff806f}body{background:var(--g-bg)!important;color:var(--g-text)!important}.page-content{background:var(--g-bg)!important}.kph-card,.kpms-panel,.kpms-kpi,.kpgm-card,.kpgm-overview,.kpbm-card,.kpbm-overview,.kpsfm-list-panel,.kpsfm-map-panel,.kpsfm-overview>div,.session-card,.timeline-card,.location-card,.map-card,.detail-hero,.detail-mode-panel{background:var(--g-card)!important;border-color:var(--g-line)!important;color:var(--g-text)!important;box-shadow:0 18px 48px rgba(0,0,0,.24)!important}.kpms-panel h2,.kpms-kpi-title,.kpms-kpi-val,.kpgm-title,.kpbm-name,.kpsfm-title h1,.detail-title-main,.section-label,.kph-card h3{color:var(--g-text)!important}.kpms-panel p,.kpms-muted,.kpms-kpi-sub,.kpgm-sub,.kpbm-sub,.kpsfm-title p,.empty-sub,.kph-card p{color:var(--g-muted)!important}.kph-ban-list{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}.kph-ban-list div{background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,128,111,.35)!important;border-radius:18px!important;padding:15px!important;color:var(--g-text)!important}.kph-ban-list small{display:block;color:var(--g-muted);margin-top:4px}.kph-ban-list em{display:block;color:var(--g-warn);font-style:normal;font-size:12px;margin-top:4px}.kph-ban-empty{display:none!important}.kpfish-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin:10px 0 18px}.kpfish-hero h1{font-size:38px;margin:0;color:var(--g-text)}.kpfish-hero p{margin:8px 0 0;color:var(--g-muted)}.kpfish-search{height:48px;border-radius:16px;background:rgba(255,255,255,.09);border:1px solid var(--g-line);color:#fff;padding:0 16px;min-width:280px}.kpfish-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}.kpfish-tabs button{border:1px solid var(--g-line);background:rgba(255,255,255,.08);color:var(--g-text);border-radius:999px;padding:11px 15px;font-weight:850}.kpfish-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}.kpfish-card{background:linear-gradient(145deg,rgba(9,43,39,.90),rgba(6,25,23,.90));border:1px solid var(--g-line);border-radius:26px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,.24);cursor:pointer;transition:transform .15s,box-shadow .15s,border-color .15s}.kpfish-card:hover{transform:translateY(-2px);border-color:rgba(93,255,145,.35);box-shadow:0 22px 60px rgba(0,0,0,.34)}.kpfish-body{padding:18px}.kpfish-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.kpfish-body h3{margin:0;color:var(--g-text);font-size:22px}.kpfish-body em,.latin{display:block;color:var(--g-muted);font-style:italic;margin-top:3px}.kpfish-mark{width:44px;height:44px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(93,255,145,.18),rgba(46,213,255,.12));border:1px solid rgba(93,255,145,.22);font-size:22px;flex:0 0 auto}.kpfish-tags{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.kpfish-tags span,.kpfish-chip{background:rgba(255,255,255,.08);border:1px solid var(--g-line);border-radius:999px;padding:6px 10px;color:var(--g-text);font-size:12px}.kpfish-chip.warn,.kpfish-ban{background:rgba(255,80,70,.22)!important;border-color:rgba(255,130,107,.45)!important;color:#ffd4ca!important;font-weight:900}.kpfish-chip.good{background:rgba(93,255,145,.13)!important;border-color:rgba(93,255,145,.25)!important;color:#d8ffe4!important}.kpfish-rules{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.kpfish-rules div,.kpfish-personal div{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:10px}.kpfish-rules b,.kpfish-personal b{display:block;color:var(--g-text);font-size:15px}.kpfish-rules span,.kpfish-personal span{display:block;color:var(--g-muted);font-size:11px;margin-top:2px}.kpfish-line{margin-top:10px;color:var(--g-muted);font-size:13px;line-height:1.45;display:grid;gap:5px}.kpfish-line strong{color:var(--g-text);font-weight:800}.kpfish-personal{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.kpfish-personal div{border-color:rgba(93,255,145,.16);background:rgba(93,255,145,.07)}.kpfish-modal{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.72);backdrop-filter:blur(12px);display:none;align-items:flex-start;justify-content:center;overflow:auto;padding:90px 18px 28px}.kpfish-modal.show{display:flex}.kpfish-detail{width:min(980px,100%);background:linear-gradient(145deg,rgba(10,42,38,.96),rgba(6,25,23,.96));border:1px solid var(--g-line);border-radius:30px;color:var(--g-text);box-shadow:0 30px 100px rgba(0,0,0,.55);overflow:hidden}.kpfish-close{position:sticky;top:0;float:right;margin:14px;border:1px solid var(--g-line);background:rgba(255,255,255,.10);color:#fff;border-radius:14px;padding:10px 14px;font-weight:900}.kpfish-detail-head{display:block;padding:24px}.kpfish-detail h2{font-size:42px;margin:0;color:var(--g-text)}.kpfish-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.kpfish-stats div{background:rgba(255,255,255,.08);border:1px solid var(--g-line);border-radius:16px;padding:12px}.kpfish-stats b{display:block;font-size:18px}.kpfish-stats small{color:var(--g-muted)}.kpfish-info{padding:0 24px 24px;display:grid;gap:12px}.kpfish-info section{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:16px}.kpfish-info h4{margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em;color:var(--g-muted)}.fish-card,.fish-grid{display:none!important}@media(max-width:760px){.kpfish-hero{display:block}.kpfish-search{width:100%;min-width:0;margin-top:12px}.kpfish-rules,.kpfish-personal,.kpfish-stats{grid-template-columns:1fr 1fr}.kpfish-modal{padding-top:74px}.kpfish-detail h2{font-size:32px}}';
  document.head.appendChild(s);
}

function logo(){var b=qs('.kph-global-brand');if(!b)return;qsa('img',b).forEach(function(i){i.removeAttribute('src');i.style.display='none'});if(!qs('.kp-safe-logo',b)){var d=document.createElement('div');d.className='kp-safe-logo';d.innerHTML='<img src="assets/icon.svg" alt=""><strong>Vízparti Napló</strong>';b.appendChild(d)}}
function nav(){var l=qs('.kph-global-links');if(!l)return;if(!qs('[data-page="new-session"]',l)){var b=document.createElement('button');b.dataset.page='new-session';b.className='new-trip';b.innerHTML='<i class="ti ti-plus"></i>Új túra';b.onclick=function(){showPage&&showPage('new-session',b)};l.insertBefore(b,l.children[1]||null)}if(!qs('[data-page="fish"]',l)){var f=document.createElement('button');f.dataset.page='fish';f.innerHTML='<i class="ti ti-fish"></i>Halfajok';f.onclick=function(){showPage&&showPage('fish',f)};var st=qs('[data-page="stats"]',l);l.insertBefore(f,st||null)}}
function forceBans(){}
function fixForecastLabels(){}

var ACC={'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u'};
function norm(s){return String(s==null?'':s).toLowerCase().replace(/[áéíóöőúüű]/g,function(c){return ACC[c]||c}).replace(/[^a-z0-9]+/g,'').trim()}
function formatDate(t){if(!t)return 'Még nincs';try{return new Date(t).toLocaleDateString('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit'})}catch(e){return 'Még nincs'}}
function parseDate(v){
  if(v==null||v==='')return 0;
  if(typeof v==='number'){if(v<10000000000)v*=1000;var dn=new Date(v).getTime();return isNaN(dn)?0:dn}
  var s=String(v).trim();
  var m=s.match(/(20\d{2}|19\d{2})[.\-\/ ](\d{1,2})[.\-\/ ](\d{1,2})/);
  if(m){var d1=new Date(+m[1],+m[2]-1,+m[3]).getTime();return isNaN(d1)?0:d1}
  var d=Date.parse(s);return isNaN(d)?0:d;
}
function num(v){if(v==null||v==='')return 0;var n=parseFloat(String(v).replace(',','.').replace(/[^0-9.\-]/g,''));return isNaN(n)?0:n}
function weightKg(o){var n=num(pick(o,['weightKg','weight_kg','kg','sulyKg','súlyKg','fishWeightKg']));if(n)return n;n=num(pick(o,['weight','fishWeight','catchWeight','suly','súly','mass']));if(!n)return 0;return n>80?n/1000:n}
function lengthCm(o){return num(pick(o,['lengthCm','length','cm','hossz','meret','méret','fishLengthCm']))}
function countOf(o){var n=num(pick(o,['count','db','quantity','qty','darab']));return n>0?Math.max(1,Math.round(n)):1}
function dateOf(o,ctx){return parseDate(pick(o,['caughtAt','catchDate','date','datum','datetime','time','createdAt','timestamp','startTime','startedAt']))||parseDate(ctx&&ctx.date)}
function idValue(v){if(v==null)return '';if(typeof v==='object')return pick(v,['id','fishId','speciesId','name','fishName','species','latin']);return v}
function fishValue(o){return idValue(pick(o,['fishId','fish_id','fishID','speciesId','species_id','species','fish','fishName','halfaj','faj','halfajNev','speciesName']))}
function nameValue(o){return idValue(pick(o,['name','nev','név']))}
function matchFish(o,f){
  var wanted=[f.id,f.name,f.latin].map(norm).filter(Boolean);
  var vals=[fishValue(o),nameValue(o),pick(o,['latin','latinName','scientificName'])].map(norm).filter(Boolean);
  for(var i=0;i<vals.length;i++){for(var j=0;j<wanted.length;j++){if(vals[i]===wanted[j])return true}}
  return false;
}
function catchKey(c,ctx,f){
  var fish=norm(fishValue(c)||nameValue(c)||f.id||f.name||f.latin);
  var d=dateOf(c,ctx)||0;
  var w=Math.round((weightKg(c)||0)*1000);
  var l=Math.round((lengthCm(c)||0)*10);
  if(d||w||l)return [fish,d,w,l].join('|');
  var explicit=pick(c,['id','catchId','catchID','uuid','uid','recordId','_id','key']);
  if(explicit)return 'id:'+norm(explicit);
  return [fish,ctx.sessionId||'',countOf(c),norm(pick(c,['bait','csali','method','modszer','módszer']))].join('|');
}
function loadPrimaryDB(){
  try{var fn=Function('return (typeof getDB==="function")?getDB:null')();if(typeof fn==='function'){var db=fn();if(db&&typeof db==='object')return db;}}catch(e){}
  try{return JSON.parse(localStorage.getItem('horgaszpro_v0230')||'{}')||{}}catch(e){return {}}
}
function personalStats(f){
  var stat={count:0,biggest:0,last:0,_seen:{}};
  var db=loadPrimaryDB();
  var sessions=Array.isArray(db.sessions)?db.sessions:[];
  sessions.forEach(function(s){
    var catches=Array.isArray(s.catches)?s.catches:[];
    var ctx={date:s.date||s.startedAt||s.startTime||s.createdAt||'',place:s.location||s.hely||s.water||'',sessionId:s.id||''};
    catches.forEach(function(c){
      if(!c||typeof c!=='object')return;
      if(!matchFish(c,f))return;
      var key=catchKey(c,ctx,f);
      if(stat._seen[key])return;
      stat._seen[key]=1;
      var n=countOf(c), w=weightKg(c), d=dateOf(c,ctx);
      stat.count+=n;
      if(w>stat.biggest)stat.biggest=w;
      if(d>stat.last)stat.last=d;
    });
  });
  delete stat._seen;
  return stat;
}
function kgText(v){if(!v)return '–';return (v>=1?(Math.round(v*100)/100).toString().replace('.',',')+' kg':Math.round(v*1000)+' g')}

function banDateText(f){var b=f.ban||f.banText||f.tilalom||'';if(!b){var from=f.banFrom||f.closedFrom||f.from||'',to=f.banTo||f.closedTo||f.to||'';if(from&&to)b=from+' – '+to;}if(!b)return 'Nincs tilalom';return banState(f)?(b+' · jelenleg aktív'):(b+' · jelenleg nem aktív')}
function typeLabelHu(t){t=String(t||'');if(t==='native')return 'Őshonos';if(t==='nonnative')return 'Nem őshonos';if(t==='invasive')return 'Inváziós';if(t==='protected')return 'Védett';return t||'Őshonos'}
function minText(f){return f.minSize?f.minSize+' cm':'–'}
function quotaText(f){return f.quota?f.quota+' db':'–'}
function habitatText(f){return pick(f,['habitat','elohely','élőhely','water','place'])}
function baitText(f){return pick(f,['bait','csali','method','modszer','módszer'])}
function noteText(f){return pick(f,['note','desc','description','megjegyzes','megjegyzés'])}

window.setFishImageFromFile=function(){};
function fishChips(f,b){
  var out=[];
  out.push('<span>'+(f.cat==='predator'?'Ragadozó':'Békés')+'</span>');
  out.push('<span>'+esc(typeLabelHu(f.type))+'</span>');
  out.push(b?'<span class="kpfish-chip warn">Tilalom alatt</span>':'<span class="kpfish-chip good">Nincs aktív tilalom</span>');
  return out.join('');
}
function fishCard(f){
  var b=banState(f), h=habitatText(f), bait=baitText(f), ps=personalStats(f);
  return '<article class="kpfish-card" onclick="kpModernFishOpen(\''+esc(f.id)+'\')">'+
    '<div class="kpfish-body">'+
      '<div class="kpfish-head"><div><h3>'+esc(f.name)+'</h3><em>'+esc(f.latin||'')+'</em></div><div class="kpfish-mark">🐟</div></div>'+
      '<div class="kpfish-tags">'+fishChips(f,b)+'</div>'+
      '<div class="kpfish-rules"><div><b>'+esc(minText(f))+'</b><span>Min. méret</span></div><div><b>'+esc(quotaText(f))+'</b><span>Napi kvóta</span></div><div><b>'+esc(banDateText(f).split(' · ')[0])+'</b><span>Tilalom</span></div></div>'+
      '<div class="kpfish-line">'+(h?'<div><strong>Élőhely:</strong> '+esc(shortText(h,74))+'</div>':'')+(bait?'<div><strong>Ajánlott:</strong> '+esc(shortText(bait,74))+'</div>':'')+'</div>'+
      '<div class="kpfish-personal"><div><b>'+esc(ps.count)+'</b><span>Saját fogás</span></div><div><b>'+esc(kgText(ps.biggest))+'</b><span>Legnagyobb</span></div><div><b>'+esc(formatDate(ps.last))+'</b><span>Utoljára</span></div></div>'+
    '</div></article>';
}
function renderFish(){
  var page=qs('#page-fish');if(!page||!page.classList.contains('active'))return;
  if(!qs('#kpfish-wrap',page)){
    page.innerHTML='<div id="kpfish-wrap"><div class="kpfish-hero"><div><h1>Halfajok</h1><p>Általános halfaj-adatok + saját naplód alapján számolt fogási adatok.</p></div><input class="kpfish-search" placeholder="Keresés halfaj alapján..." oninput="window.__kpfishSearch=this.value;window.kpModernFishRender()"></div><div class="kpfish-tabs"><button onclick="window.__kpfishFilter=\'all\';window.kpModernFishRender()">Összes</button><button onclick="window.__kpfishFilter=\'banned\';window.kpModernFishRender()">Tilalom alatt</button><button onclick="window.__kpfishFilter=\'predator\';window.kpModernFishRender()">Ragadozó</button><button onclick="window.__kpfishFilter=\'peaceful\';window.kpModernFishRender()">Békés</button></div><div id="fish-grid"></div></div>';
  }
  var list=fishDB();var search=(window.__kpfishSearch||'').toLowerCase();var filter=window.__kpfishFilter||'all';
  if(filter==='banned')list=list.filter(banState);
  if(filter==='predator')list=list.filter(function(f){return f.cat==='predator'});
  if(filter==='peaceful')list=list.filter(function(f){return f.cat!=='predator'});
  if(search)list=list.filter(function(f){return (String(f.name||'')+' '+String(f.latin||'')).toLowerCase().indexOf(search)>=0});
  var host=qs('#fish-grid',page);if(!host)return;host.className='kpfish-grid';host.innerHTML=list.map(fishCard).join('');
}
window.kpModernFishRender=renderFish;
window.kpModernFishOpen=function(id){
  var f=fishDB().find(function(x){return String(x.id)===String(id)});if(!f)return;
  var b=banState(f), ps=personalStats(f), h=habitatText(f), bait=baitText(f), note=noteText(f);
  var m=qs('#kpfish-modal');if(!m){m=document.createElement('div');m.id='kpfish-modal';m.className='kpfish-modal';document.body.appendChild(m)}
  m.innerHTML='<div class="kpfish-detail"><button class="kpfish-close" onclick="document.getElementById(\'kpfish-modal\').classList.remove(\'show\')">Bezárás</button><div class="kpfish-detail-head"><h2>'+esc(f.name)+'</h2><div class="latin">'+esc(f.latin||'')+'</div><div class="kpfish-tags">'+fishChips(f,b)+'</div><div class="kpfish-stats"><div><b>'+esc(minText(f))+'</b><small>min. méret</small></div><div><b>'+esc(quotaText(f))+'</b><small>napi kvóta</small></div><div><b>'+esc(ps.count)+'</b><small>saját fogás</small></div><div><b>'+esc(formatDate(ps.last))+'</b><small>utoljára fogva</small></div></div></div><div class="kpfish-info"><section><h4>Tilalmi idő</h4><p>'+esc(banDateText(f))+'</p></section><section><h4>Saját naplód alapján</h4><p>Fogások száma: '+esc(ps.count)+' · Legnagyobb: '+esc(kgText(ps.biggest))+' · Utoljára: '+esc(formatDate(ps.last))+'</p></section><section><h4>Élőhely</h4><p>'+esc(h||'Nincs adat')+'</p></section><section><h4>Javasolt csalik / módszerek</h4><p>'+esc(bait||'Nincs adat')+'</p></section><section><h4>Megjegyzés</h4><p>'+esc(note||'Nincs külön megjegyzés.')+'</p></section></div></div>';
  m.classList.add('show');
};
function wrap(){var old=window.renderFishGrid;if(typeof old==='function'&&!old.__safeFish){window.renderFishGrid=function(){renderFish()};window.renderFishGrid.__safeFish=true}var oldOpen=window.openFishDetail;if(typeof oldOpen==='function'&&!oldOpen.__safeFish){window.openFishDetail=function(id){window.kpModernFishOpen(id)};window.openFishDetail.__safeFish=true}var oldHome=window.updateHome;if(typeof oldHome==='function'&&!oldHome.__safeBans){window.updateHome=function(){var r=oldHome.apply(this,arguments);setTimeout(function(){forceBans();fixForecastLabels()},80);setTimeout(function(){forceBans();fixForecastLabels()},700);return r};window.updateHome.__safeBans=true}}
function tick(){css();logo();nav();forceBans();fixForecastLabels();wrap();renderFish()}
setTimeout(tick,300);setTimeout(tick,1200);setTimeout(tick,2400);setInterval(tick,1200);
})();
