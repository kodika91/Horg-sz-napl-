/* kp-mod-spotfinder-nav.js — egyszerű visszatalálás mód horgászhelyhez
 * v1.5 · minden gombnyomásra látható visszajelzés, csendes kilépés nélkül.
 */
(function(){
'use strict';
if(window.KP_SPOT_NAV_V15)return;
window.KP_SPOT_NAV_V15=true;

let target=null,line=null,marker=null,follow=true,gpsWatch=null,lastPos=null,lastButton=null;
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function toast(m){try{typeof showToast==='function'?showToast(m):alert(m)}catch(e){console.log(m)}}
function fmt(m){m=Number(m)||0;return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'}
function map(){return window.spotFinderMap||window.map||window.leafletMap||null}
function dist(a,b){const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lon-a.lon)*Math.PI/180;const s1=Math.sin(dLat/2),s2=Math.sin(dLon/2);const q=s1*s1+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*s2*s2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}
function ensureStyle(){if(qs('#sf-nav-style'))return;const st=document.createElement('style');st.id='sf-nav-style';st.textContent='.sf-target-pin{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#2c6e7a;color:#fff;font-size:20px;font-weight:900;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35);position:relative}.sf-target-pin:after{content:"";position:absolute;width:44px;height:44px;border-radius:50%;border:2px solid rgba(44,110,122,.35);animation:sfPulse 1.4s infinite}@keyframes sfPulse{0%{transform:scale(.8);opacity:1}100%{transform:scale(1.45);opacity:0}}.kp-nav-btn-active{background:linear-gradient(135deg,#1e7f3e,#2fa85b)!important;color:#fff!important}';document.head.appendChild(st)}
function targetIcon(){ensureStyle();return L.divIcon({className:'',html:'<div class="sf-target-pin">🎯</div>',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-18]})}
function ensureUi(){
  ensureStyle();
  if(qs('#sf-nav-overlay'))return;
  const wrap=document.createElement('div');
  wrap.id='sf-nav-overlay';
  wrap.style.cssText='position:fixed;left:10px;right:10px;top:72px;z-index:99999;display:none';
  wrap.innerHTML='<div style="background:rgba(255,255,255,.98);backdrop-filter:blur(10px);border-radius:16px;padding:12px 14px;box-shadow:0 6px 18px rgba(0,0,0,.22);border:2px solid rgba(44,110,122,.28)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div id="sf-nav-name" style="font-weight:800;font-size:15px;color:#2a2018">🎯 Visszatalálás aktív</div><div id="sf-nav-dist" style="font-size:13px;color:#6b5840">📡 Indítás…</div></div><div style="display:flex;gap:8px"><button id="sf-nav-follow" style="border:0;border-radius:10px;padding:10px 12px;font-weight:800;background:#2c6e7a;color:#fff">Kövess</button><button id="sf-nav-stop" style="border:0;border-radius:10px;padding:10px 12px;font-weight:800;background:#efe7dc;color:#2a2018">Leállítás</button></div></div></div>';
  document.body.appendChild(wrap);
  qs('#sf-nav-follow').onclick=function(){follow=true;update();toast('📍 Visszatalálás követés aktív.')};
  qs('#sf-nav-stop').onclick=stop;
}
function showStatus(name,msg){ensureUi();const ov=qs('#sf-nav-overlay');if(ov)ov.style.display='block';const n=qs('#sf-nav-name');if(n)n.textContent='🎯 '+(name||'Visszatalálás aktív');const d=qs('#sf-nav-dist');if(d)d.textContent=msg||'📡 GPS keresése…'}
function current(){if(lastPos)return lastPos;const la=Number(window._gpsLat||window.lat);const lo=Number(window._gpsLon||window.lon);if(Number.isFinite(la)&&Number.isFinite(lo))return {lat:la,lon:lo};return null}
function startGps(){if(gpsWatch)return;if(!navigator.geolocation){showStatus(target&&target.name,'⚠️ A böngésző nem engedi a GPS-t.');toast('⚠️ GPS nem elérhető ebben a böngészőben.');return}showStatus(target&&target.name,'📡 GPS pozíció keresése…');gpsWatch=navigator.geolocation.watchPosition(function(p){lastPos={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy||0};window._gpsLat=lastPos.lat;window._gpsLon=lastPos.lon;update()},function(err){showStatus(target&&target.name,'⚠️ GPS hiba: '+err.message);toast('GPS hiba: '+err.message)},{enableHighAccuracy:true,maximumAge:2000,timeout:15000})}
function setButtonActive(btn){if(lastButton&&lastButton!==btn){lastButton.classList.remove('kp-nav-btn-active');lastButton.textContent='📍 Visszatalálás'}lastButton=btn;if(btn){btn.classList.add('kp-nav-btn-active');btn.textContent='✅ Visszatalálás aktív'}}
function setTarget(s,btn){
  showStatus(s&&s.name,'📡 Visszatalálás indítása…');
  setButtonActive(btn);
  if(!s){showStatus('Visszatalálás','⚠️ A mentett hely nem található.');toast('⚠️ A mentett hely nem található.');return}
  if(!window.L){showStatus(s.name,'⚠️ A térkép könyvtár még nem töltött be.');toast('⚠️ A térkép még nem töltött be. Nyomd meg újra pár másodperc múlva.');return}
  if(!map()){showStatus(s.name,'⚠️ A térkép nézet még nem aktív. Nyomd meg a Térkép/Nézet gombot.');toast('⚠️ A térkép nézet még nem aktív.');return}
  target={id:s.id,name:s.name||'Horgászhely',lat:Number(s.lat),lon:Number(s.lon)};
  if(!Number.isFinite(target.lat)||!Number.isFinite(target.lon)){showStatus(target.name,'⚠️ A hely GPS koordinátája hiányzik.');toast('⚠️ A hely GPS koordinátája hiányzik.');return}
  if(marker){try{marker.remove()}catch(e){}}
  marker=L.marker([target.lat,target.lon],{zIndexOffset:1500,icon:targetIcon()}).addTo(map());
  marker.bindPopup('🎯 '+target.name).openPopup();
  if(line){try{line.remove()}catch(e){}}
  follow=true;
  showStatus(target.name,'📡 GPS pozíció keresése…');
  startGps();
  update();
  toast('📍 Visszatalálás elindítva.');
}
function update(){if(!target||!map()||!window.L)return;const me=current();if(!me){showStatus(target.name,'📡 GPS pozíció keresése…');return}const di=dist(me,target);showStatus(target.name,'📏 '+fmt(di)+(me.acc?' · ±'+Math.round(me.acc)+' m':'')+(di<15?' · ✅ Megérkeztél':''));if(line){try{line.remove()}catch(e){}}line=L.polyline([[me.lat,me.lon],[target.lat,target.lon]],{weight:4,opacity:.82}).addTo(map());if(follow){const b=L.latLngBounds([[me.lat,me.lon],[target.lat,target.lon]]);map().fitBounds(b,{padding:[60,60],maxZoom:17})}}
function stop(){target=null;if(line){try{line.remove()}catch(e){} line=null}if(marker){try{marker.remove()}catch(e){} marker=null}const ov=qs('#sf-nav-overlay');if(ov)ov.style.display='none';if(lastButton){lastButton.classList.remove('kp-nav-btn-active');lastButton.textContent='📍 Visszatalálás';lastButton=null}if(gpsWatch){try{navigator.geolocation.clearWatch(gpsWatch)}catch(e){} gpsWatch=null}toast('🛑 Visszatalálás leállítva.')}
window.kpSpotNavigateTo=setTarget;window.kpSpotStopNavigation=stop;
function cleanupDupes(row){const btns=qsa('.kp-nav-btn',row);btns.forEach((b,i)=>{if(i>0)b.remove()});const all=qsa('button',row).filter(b=>(b.textContent||'').toLowerCase().includes('visszatalálás'));all.forEach((b,i)=>{if(i>0)b.remove()})}
function attachButtons(){ensureStyle();const db=(typeof getDB==='function'?getDB():{});const spots=(db.scoutSpots||[]);qsa('.card,.spot-card,.list-card,.item-list-card').forEach(function(row){const txt=(row.textContent||'').trim();const spot=spots.find(s=>s&&s.name&&txt.includes(String(s.name).trim()));if(!spot)return;cleanupDupes(row);if(row.querySelector('.kp-nav-btn'))return;const nav=document.createElement('button');nav.type='button';nav.className='kp-nav-btn';nav.textContent='📍 Visszatalálás';nav.style.cssText='margin-top:8px;width:100%;border:0;border-radius:12px;padding:11px 12px;font-weight:800;background:linear-gradient(135deg,#2c6e7a,#3a8a99);color:#fff';nav.onclick=function(){setTarget(spot,nav)};const actions=row.querySelector('.spot-actions,.actions,.btn-row');if(actions&&actions.parentNode===row)actions.insertAdjacentElement('afterend',nav); else row.appendChild(nav);cleanupDupes(row)})}
const oldList=window.renderSpotFinderList;if(typeof oldList==='function'&&!oldList.KP_SPOT_NAV_V15_WRAPPED){window.renderSpotFinderList=function(){const r=oldList.apply(this,arguments);setTimeout(attachButtons,160);setTimeout(attachButtons,900);return r};window.renderSpotFinderList.KP_SPOT_NAV_V15_WRAPPED=true}
setInterval(update,3000);setInterval(attachButtons,1500);setTimeout(attachButtons,500);
console.log('[spot-nav] v1.5 aktív');
})();