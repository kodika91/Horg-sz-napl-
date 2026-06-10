/* kp-mod-spotfinder-nav.js — visszatalálás modul, konzol debug nélkül
 * Kompakt UI, követés BE/KI, térkép húzásra követés kikapcsolás.
 */
(function(){
'use strict';
if(window.KP_SPOT_NAV_CLEAN)return;
window.KP_SPOT_NAV_CLEAN=true;
let target=null,line=null,marker=null,follow=true,gpsWatch=null,lastPos=null,lastButton=null,cachedMap=null,dragBoundMap=null;
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function fmt(m){m=Number(m)||0;return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'}
function isMapObject(o){return !!(o&&typeof o.setView==='function'&&typeof o.fitBounds==='function'&&typeof o.addLayer==='function')}
function discoverMap(){
  if(isMapObject(cachedMap))return cachedMap;
  const candidates=[];
  try{candidates.push(window.spotFinderMap,window.map,window.leafletMap)}catch(e){}
  try{candidates.push(Function('try{return spotFinderMap}catch(e){return null}')())}catch(e){}
  for(const c of candidates){if(isMapObject(c)){cachedMap=c;window.spotFinderMap=c;bindMapDrag(c);return c}}
  try{if(typeof spotFinderEnsureMap==='function')spotFinderEnsureMap()}catch(e){}
  try{if(typeof renderSpotFinderMap==='function')renderSpotFinderMap()}catch(e){}
  try{const c=Function('try{return spotFinderMap}catch(e){return null}')();if(isMapObject(c)){cachedMap=c;window.spotFinderMap=c;bindMapDrag(c);return c}}catch(e){}
  return null;
}
function map(){return discoverMap()}
function mapHost(){return qs('#spotfinder-map-view')||qs('.spotfinder-map-shell')||qs('.leaflet-container')||document.body}
function positionOverlay(){
  const ov=qs('#sf-nav-overlay');if(!ov)return;
  const host=mapHost();
  if(host&&host!==document.body){
    const r=host.getBoundingClientRect(),pad=10,w=Math.min(620,Math.max(300,r.width-pad*2));
    ov.style.position='fixed';ov.style.left=Math.max(8,r.left+pad)+'px';ov.style.width=w+'px';ov.style.right='auto';ov.style.top=Math.max(8,r.top+pad)+'px';ov.style.maxWidth='calc(100vw - 16px)';
  }else{ov.style.position='fixed';ov.style.left='10px';ov.style.right='10px';ov.style.width='auto';ov.style.top='72px'}
}
function dist(a,b){const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lon-a.lon)*Math.PI/180;const s1=Math.sin(dLat/2),s2=Math.sin(dLon/2);const q=s1*s1+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*s2*s2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function applyFollowUi(){
  const btn=qs('#sf-nav-follow');if(!btn)return;
  if(follow){btn.textContent='Követés BE';btn.title='A térkép automatikusan követi a pozíciódat és a célt.';btn.style.background='linear-gradient(135deg,#0a7f68,#2ed5ff)';btn.style.color='#fff';btn.style.border='1px solid rgba(174,255,230,.24)'}
  else{btn.textContent='Követés KI';btn.title='A térkép nem mozog automatikusan.';btn.style.background='rgba(255,255,255,.10)';btn.style.color='#f4fff9';btn.style.border='1px solid rgba(174,255,230,.18)'}
}
function setFollow(v){follow=!!v;applyFollowUi()}
function bindMapDrag(m){if(!m||dragBoundMap===m||typeof m.on!=='function')return;dragBoundMap=m;try{m.on('dragstart zoomstart',function(){if(target&&follow)setFollow(false)})}catch(e){}}
function ensureStyle(){
  if(qs('#sf-nav-style-clean'))return;
  const st=document.createElement('style');st.id='sf-nav-style-clean';
  st.textContent='.sf-target-pin{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#0a7f68;color:#fff;font-size:20px;font-weight:900;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35);position:relative}.sf-target-pin:after{content:"";position:absolute;width:44px;height:44px;border-radius:50%;border:2px solid rgba(46,213,255,.45);animation:sfPulse 1.4s infinite}@keyframes sfPulse{0%{transform:scale(.8);opacity:1}100%{transform:scale(1.45);opacity:0}}.kp-nav-btn-active{background:linear-gradient(135deg,#0a7f68,#2ed5ff)!important;color:#fff!important}#sf-nav-overlay .sf-nav-box{background:rgba(8,36,33,.92);backdrop-filter:blur(14px);border-radius:16px;padding:10px 12px;box-shadow:0 12px 28px rgba(0,0,0,.28);border:1px solid rgba(174,255,230,.18);box-sizing:border-box}#sf-nav-overlay .sf-nav-row{display:flex;justify-content:space-between;gap:8px;align-items:center}#sf-nav-overlay .sf-nav-title{font-weight:900;font-size:13px;color:#f4fff9;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:350px}#sf-nav-overlay .sf-nav-dist{font-size:12px;color:rgba(230,255,248,.74);line-height:1.15;margin-top:2px}#sf-nav-overlay button{border-radius:12px;padding:7px 10px;font-weight:850;font-size:12px;min-height:34px}#sf-nav-stop{background:rgba(255,255,255,.10);color:#f4fff9;border:1px solid rgba(174,255,230,.18)}@media(max-width:720px){#sf-nav-overlay{left:10px!important;right:10px!important;width:auto!important;top:72px!important}#sf-nav-overlay .sf-nav-title{max-width:calc(100vw - 205px)}#sf-nav-overlay button{padding:7px 8px;font-size:11px}}';
  document.head.appendChild(st);
}
function targetIcon(){ensureStyle();return L.divIcon({className:'',html:'<div class="sf-target-pin">🎯</div>',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-18]})}
function ensureUi(){
  ensureStyle();
  if(qs('#sf-nav-overlay')){positionOverlay();applyFollowUi();return}
  const wrap=document.createElement('div');wrap.id='sf-nav-overlay';wrap.style.cssText='position:fixed;z-index:99999;display:none;box-sizing:border-box';
  wrap.innerHTML='<div class="sf-nav-box"><div class="sf-nav-row"><div style="min-width:0"><div id="sf-nav-name" class="sf-nav-title">🎯 Visszatalálás aktív</div><div id="sf-nav-dist" class="sf-nav-dist">📡 Indítás…</div></div><div style="display:flex;gap:6px;flex-shrink:0"><button id="sf-nav-follow">Követés BE</button><button id="sf-nav-stop">Leállítás</button></div></div></div>';
  document.body.appendChild(wrap);
  qs('#sf-nav-follow').onclick=function(){setFollow(!follow);if(follow)update();toast(follow?'📍 Követés bekapcsolva.':'📍 Követés kikapcsolva.')};
  qs('#sf-nav-stop').onclick=stop;applyFollowUi();positionOverlay();
}
function showStatus(name,msg){ensureUi();positionOverlay();const ov=qs('#sf-nav-overlay');if(ov)ov.style.display='block';const n=qs('#sf-nav-name');if(n)n.textContent='🎯 '+(name||'Visszatalálás aktív');const d=qs('#sf-nav-dist');if(d)d.textContent=msg||'📡 GPS keresése…';applyFollowUi()}
function current(){if(lastPos)return lastPos;const la=Number(window._gpsLat||window.lat),lo=Number(window._gpsLon||window.lon);if(Number.isFinite(la)&&Number.isFinite(lo))return {lat:la,lon:lo};return null}
function startGps(){if(gpsWatch)return;if(!navigator.geolocation){showStatus(target&&target.name,'⚠️ A böngésző nem engedi a GPS-t.');return}showStatus(target&&target.name,'📡 GPS pozíció keresése…');gpsWatch=navigator.geolocation.watchPosition(function(p){lastPos={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy||0};window._gpsLat=lastPos.lat;window._gpsLon=lastPos.lon;update()},function(err){showStatus(target&&target.name,'⚠️ GPS hiba: '+err.message)},{enableHighAccuracy:true,maximumAge:2000,timeout:15000})}
function setButtonActive(btn){if(lastButton&&lastButton!==btn){lastButton.classList.remove('kp-nav-btn-active');lastButton.textContent='📍 Visszatalálás'}lastButton=btn;if(btn){btn.classList.add('kp-nav-btn-active');btn.textContent='✅ Visszatalálás aktív'}}
function setTarget(s,btn){
  showStatus(s&&s.name,'📡 Visszatalálás indítása…');setButtonActive(btn);
  if(!s){showStatus('Visszatalálás','⚠️ A mentett hely nem található.');return}
  if(!window.L){showStatus(s.name,'⚠️ A térkép könyvtár még nem töltött be.');return}
  let m=map();if(!m){showStatus(s.name,'⚠️ Térkép inicializálása… próbáld újra.');return}
  target={id:s.id,name:s.name||'Horgászhely',lat:Number(s.lat),lon:Number(s.lon)};
  if(!Number.isFinite(target.lat)||!Number.isFinite(target.lon)){showStatus(target.name,'⚠️ A hely GPS koordinátája hiányzik.');return}
  if(marker){try{marker.remove()}catch(e){}}
  marker=L.marker([target.lat,target.lon],{zIndexOffset:1500,icon:targetIcon()}).addTo(m);marker.bindPopup('🎯 '+target.name).openPopup();
  if(line){try{line.remove()}catch(e){}}
  setFollow(true);showStatus(target.name,'📡 GPS pozíció keresése…');startGps();update();toast('📍 Visszatalálás elindítva.');
}
function update(){if(!target||!window.L)return;positionOverlay();const m=map();if(!m)return;const me=current();if(!me){showStatus(target.name,'📡 GPS pozíció keresése…');return}const di=dist(me,target);showStatus(target.name,'📏 '+fmt(di)+(me.acc?' · ±'+Math.round(me.acc)+' m':'')+(di<15?' · ✅ Megérkeztél':''));if(line){try{line.remove()}catch(e){}}line=L.polyline([[me.lat,me.lon],[target.lat,target.lon]],{weight:4,opacity:.82}).addTo(m);if(follow){const b=L.latLngBounds([[me.lat,me.lon],[target.lat,target.lon]]);m.fitBounds(b,{padding:[60,60],maxZoom:17})}}
function stop(){target=null;if(line){try{line.remove()}catch(e){} line=null}if(marker){try{marker.remove()}catch(e){} marker=null}const ov=qs('#sf-nav-overlay');if(ov)ov.style.display='none';if(lastButton){lastButton.classList.remove('kp-nav-btn-active');lastButton.textContent='📍 Visszatalálás';lastButton=null}if(gpsWatch){try{navigator.geolocation.clearWatch(gpsWatch)}catch(e){} gpsWatch=null}setFollow(true)}
function cleanupDupes(row){const all=qsa('button',row).filter(b=>(b.textContent||'').toLowerCase().includes('visszatalálás'));all.forEach((b,i)=>{if(i>0)b.remove()})}
function attachButtons(){ensureStyle();const db=(typeof getDB==='function'?getDB():{});const spots=(db.scoutSpots||[]);qsa('.spot-card,.card,.list-card,.item-list-card').forEach(function(row){const txt=(row.textContent||'').trim();const spot=spots.find(s=>s&&s.name&&txt.includes(String(s.name).trim()));if(!spot)return;cleanupDupes(row);if(row.querySelector('.kp-nav-btn'))return;const nav=document.createElement('button');nav.type='button';nav.className='kp-nav-btn';nav.textContent='📍 Visszatalálás';nav.style.cssText='margin-top:8px;width:100%;border:0;border-radius:14px;padding:11px 12px;font-weight:900;background:linear-gradient(135deg,#0a7f68,#2ed5ff);color:#fff';nav.onclick=function(){setTarget(spot,nav)};row.appendChild(nav);cleanupDupes(row)})}
window.kpSpotNavigateTo=setTarget;window.kpSpotStopNavigation=stop;
window.kpSpotNavDebug=function(){return {module:'kp-mod-spotfinder-nav.js clean',leafletLoaded:!!window.L,mapFound:!!map(),targetActive:!!target,follow:follow,gpsWatchActive:gpsWatch!=null,lastPosition:!!lastPos}};
const oldList=window.renderSpotFinderList;if(typeof oldList==='function'&&!oldList.KP_SPOT_NAV_CLEAN_WRAPPED){window.renderSpotFinderList=function(){const r=oldList.apply(this,arguments);setTimeout(attachButtons,160);setTimeout(attachButtons,900);return r};window.renderSpotFinderList.KP_SPOT_NAV_CLEAN_WRAPPED=true}
setInterval(attachButtons,1800);
setInterval(update,1800);
})();