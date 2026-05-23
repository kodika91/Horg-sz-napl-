/* kp-mod-spotfinder-nav.js — egyszerű visszatalálás mód horgászhelyhez
 * v1.0 · Nem túranapló, csak célpont követés.
 */
(function(){
'use strict';
if(window.KP_SPOT_NAV_V1)return;
window.KP_SPOT_NAV_V1=true;

let target=null,line=null,marker=null,follow=true;
function qs(s,r=document){return r.querySelector(s)}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[spot-nav]',m)}catch(e){}}
function fmt(m){m=Number(m)||0;return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'}
function map(){return window.spotFinderMap||window.map||null}
function current(){
  const la=Number(window._gpsLat||window.lat);
  const lo=Number(window._gpsLon||window.lon);
  if(!Number.isFinite(la)||!Number.isFinite(lo))return null;
  return {lat:la,lon:lo};
}
function dist(a,b){
  const R=6371000;
  const dLat=(b.lat-a.lat)*Math.PI/180;
  const dLon=(b.lon-a.lon)*Math.PI/180;
  const s1=Math.sin(dLat/2),s2=Math.sin(dLon/2);
  const q=s1*s1+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*s2*s2;
  return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));
}
function ensureUi(){
  if(qs('#sf-nav-overlay'))return;
  const wrap=document.createElement('div');
  wrap.id='sf-nav-overlay';
  wrap.style.cssText='position:absolute;left:10px;right:10px;top:10px;z-index:1002;display:none';
  wrap.innerHTML='<div style="background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-radius:16px;padding:12px 14px;box-shadow:0 6px 18px rgba(0,0,0,.18)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div id="sf-nav-name" style="font-weight:800;font-size:15px;color:#2a2018">Célpont</div><div id="sf-nav-dist" style="font-size:13px;color:#6b5840">0 m</div></div><div style="display:flex;gap:8px"><button id="sf-nav-follow" style="border:0;border-radius:10px;padding:10px 12px;font-weight:800;background:#2c6e7a;color:#fff">Kövess</button><button id="sf-nav-stop" style="border:0;border-radius:10px;padding:10px 12px;font-weight:800;background:#efe7dc;color:#2a2018">Leállítás</button></div></div></div>';
  const host=qs('#spotfinder-map-view')||document.body;
  host.appendChild(wrap);
  qs('#sf-nav-follow').onclick=function(){follow=true;update()};
  qs('#sf-nav-stop').onclick=stop;
}
function setTarget(s){
  if(!s||!window.L||!map())return;
  ensureUi();
  target={id:s.id,name:s.name||'Horgászhely',lat:Number(s.lat),lon:Number(s.lon)};
  if(marker){try{marker.remove()}catch(e){}}
  marker=L.marker([target.lat,target.lon],{zIndexOffset:1500}).addTo(map());
  marker.bindPopup('🎯 '+target.name);
  if(line){try{line.remove()}catch(e){}}
  follow=true;
  qs('#sf-nav-overlay').style.display='block';
  qs('#sf-nav-name').textContent=target.name;
  update();
  toast('Visszavezetés elindítva.');
}
function update(){
  if(!target||!map()||!window.L)return;
  const me=current();
  if(!me)return;
  const d=dist(me,target);
  qs('#sf-nav-dist').textContent='Távolság: '+fmt(d)+(d<15?' · Megérkeztél ✓':'');
  if(line){try{line.remove()}catch(e){}}
  line=L.polyline([[me.lat,me.lon],[target.lat,target.lon]],{weight:4,opacity:.82}).addTo(map());
  if(follow){
    const b=L.latLngBounds([[me.lat,me.lon],[target.lat,target.lon]]);
    map().fitBounds(b,{padding:[60,60],maxZoom:17});
  }
}
function stop(){
  target=null;
  if(line){try{line.remove()}catch(e){} line=null;}
  if(marker){try{marker.remove()}catch(e){} marker=null;}
  const ov=qs('#sf-nav-overlay');
  if(ov)ov.style.display='none';
}
window.kpSpotNavigateTo=setTarget;
window.kpSpotStopNavigation=stop;

const oldList=window.renderSpotFinderList;
if(typeof oldList==='function'&&!oldList.KP_SPOT_NAV_WRAPPED){
  window.renderSpotFinderList=function(){
    const r=oldList.apply(this,arguments);
    setTimeout(function(){
      document.querySelectorAll('[onclick^="spotFinderEdit("]').forEach(function(btn){
        if(btn.dataset.navReady)return;
        btn.dataset.navReady='1';
        const row=btn.closest('.card,.spot-card,.list-card,.item-list-card');
        if(!row)return;
        const nav=document.createElement('button');
        nav.type='button';
        nav.textContent='📍 Visszatalálás';
        nav.style.cssText='margin-top:8px;width:100%;border:0;border-radius:12px;padding:11px 12px;font-weight:800;background:linear-gradient(135deg,#2c6e7a,#3a8a99);color:#fff';
        nav.onclick=function(){
          try{
            const id=(btn.getAttribute('onclick').match(/spotFinderEdit\(([^)]+)\)/)||[])[1];
            const clean=String(id||'').replace(/['"]/g,'');
            const db=(typeof getDB==='function'?getDB():{});
            const s=(db.scoutSpots||[]).find(x=>String(x.id)===clean);
            if(!s)return toast('A hely nem található.');
            setTarget(s);
          }catch(e){toast('Nem sikerült elindítani a visszavezetést.');}
        };
        row.appendChild(nav);
      });
    },120);
    return r;
  };
  window.renderSpotFinderList.KP_SPOT_NAV_WRAPPED=true;
}
setInterval(update,3000);
console.log('[spot-nav] egyszerű visszatalálás mód aktív');
})();
