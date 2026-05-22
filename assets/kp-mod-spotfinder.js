/* kp-mod-spotfinder.js — helykereső, GPS, térkép
 * Tartalom: v39-spotfinder-enhance v5
 * v5: GPS auto-start, távolság kijelzés, zoom gombok, fotó IDB fallback
 */
(function(){
'use strict';
if(window.KP_V39_SF_ENHANCE)return;
window.KP_V39_SF_ENHANCE=true;

function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return{}}}
function savedb(d){try{if(typeof saveDB==='function')saveDB(d)}catch(e){console.warn('[v39]',e)}}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[v39]',m)}catch(e){}}
function _esc(s){return typeof escText==='function'?escText(s):String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function _escj(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
function _date(d){return typeof spotFinderFormatDate==='function'?spotFinderFormatDate(d):(d?new Date(d).toLocaleDateString('hu-HU'):'')}

/* ── IndexedDB fotótárolás ─────────────────────────────────────── */
const IDB_NAME='sfPhotos',IDB_VER=1,IDB_STORE='photos';
let _idb=null;
function idbOpen(){
  if(_idb){try{if(_idb.objectStoreNames)return Promise.resolve(_idb);}catch(e){_idb=null;}}
  return new Promise((res,rej)=>{
    const r=indexedDB.open(IDB_NAME,IDB_VER);
    r.onupgradeneeded=e=>e.target.result.createObjectStore(IDB_STORE);
    r.onsuccess=e=>{_idb=e.target.result;res(_idb)};
    r.onerror=e=>rej(e.target.error);
  });
}
async function idbPut(id,blob){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(blob,id);tx.oncomplete=res;tx.onerror=e=>rej(e.target.error)});}
async function idbGet(id){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readonly');const r=tx.objectStore(IDB_STORE).get(id);r.onsuccess=e=>res(e.target.result||null);r.onerror=e=>rej(e.target.error)});}
async function idbDel(id){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).delete(id);tx.oncomplete=res;tx.onerror=e=>rej(e.target.error)});}

const _urlCache={};
async function photoUrl(id){if(!id)return null;if(_urlCache[id])return _urlCache[id];const b=await idbGet(id);if(!b)return null;return(_urlCache[id]=URL.createObjectURL(b));}

const _pend=new Set(),_todel=new Set();
function _cleanSet(s){s.forEach(id=>{idbDel(id).catch(()=>{});delete _urlCache[id];});s.clear();}

/* ── Haversine távolság (méter) ────────────────────────────────── */
function sfDistance(lat1,lon1,lat2,lon2){
  const R=6371000,r=Math.PI/180;
  const dLat=(lat2-lat1)*r,dLon=(lon2-lon1)*r;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function sfFormatDist(m){return m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km';}

function sfUpdateDistanceDisplay(la,lo){
  let el=document.getElementById('sf-dist-overlay');
  if(!el){
    el=document.createElement('div');
    el.id='sf-dist-overlay';
    el.style.cssText='position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:1002;background:rgba(41,121,255,.88);color:#fff;border-radius:20px;padding:5px 14px;font-size:13px;font-weight:800;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap;display:none';
    const mapEl=document.getElementById('spotfinder-map-view');
    if(mapEl)mapEl.appendChild(el);
  }
  const p=typeof spotFinderGetFormPoint==='function'?spotFinderGetFormPoint():null;
  if(p&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))){
    const d=sfDistance(la,lo,Number(p.lat),Number(p.lon));
    el.textContent='📍 '+sfFormatDist(d)+' a kijelölt ponttól';
    el.style.display='block';
  } else {
    el.style.display='none';
  }
}

/* ── Fotók olvasása (IDB + base64 fallback) ────────────────────── */
window.spotFinderReadPhotos=function(input){
  const files=[...(input.files||[])].filter(f=>f.type&&f.type.startsWith('image/'));
  if(!files.length){toast('Nem képfájlt választottál.');return;}
  let done=0;
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=1100;
        const sc=Math.min(1,MAX/Math.max(img.width,img.height));
        const cv=document.createElement('canvas');
        cv.width=Math.round(img.width*sc);
        cv.height=Math.round(img.height*sc);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        const id='sfidb_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
        const finish=(asIdb,dataUrl)=>{
          if(asIdb)_pend.add(id);
          spotFinderDraftPhotos.push({id,idb:asIdb,createdAt:new Date().toISOString(),data:asIdb?undefined:dataUrl});
          done++;
          if(done===files.length){renderSpotFinderPhotoPreview();toast(files.length+' fotó hozzáadva.');}
        };
        cv.toBlob(blob=>{
          if(!blob){done++;if(done===files.length)renderSpotFinderPhotoPreview();return;}
          idbPut(id,blob).then(()=>{
            _urlCache[id]=URL.createObjectURL(blob);
            finish(true,null);
          }).catch(()=>{
            /* IDB nem elérhető – base64 mentés */
            finish(false,cv.toDataURL('image/jpeg',0.78));
          });
        },'image/jpeg',0.80);
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
  input.value='';
};

window.renderSpotFinderPhotoPreview=function(){
  const el=document.getElementById('sf-photo-preview');
  if(!el)return;
  const photos=spotFinderDraftPhotos;
  if(!photos.length){el.innerHTML='<div class="spot-photo-empty">Még nincs csatolt fotó.</div>';return;}
  el.innerHTML=photos.map((p,i)=>`<div style="position:relative"><img class="spot-photo-thumb" data-pid="${p.id}" src="${p.data||''}" style="${p.data?'':'opacity:.3'}" onclick="sfOpenLightbox(this)" alt="Hely fotó"><button title="Fotó törlése" onclick="spotFinderRemovePhoto(${i})" style="position:absolute;right:-5px;top:-7px;width:22px;height:22px;border-radius:50%;background:var(--danger);color:white;font-size:12px;border:0;cursor:pointer">&times;</button></div>`).join('');
  photos.forEach(p=>{
    if(!p.idb)return;
    const img=el.querySelector(`img[data-pid="${p.id}"]`);
    if(!img)return;
    const url=_urlCache[p.id];
    if(url){img.src=url;img.style.opacity='';return;}
    photoUrl(p.id).then(u=>{if(u&&img.isConnected){img.src=u;img.style.opacity='';}});
  });
};

window.spotFinderRemovePhoto=function(i){
  const p=spotFinderDraftPhotos[i];
  if(p&&p.idb){
    if(_pend.has(p.id)){idbDel(p.id).catch(()=>{});delete _urlCache[p.id];_pend.delete(p.id);}
    else{_todel.add(p.id);}
  }
  spotFinderDraftPhotos.splice(i,1);
  renderSpotFinderPhotoPreview();
};
window.spotFinderClearPhotos=function(){
  spotFinderDraftPhotos.forEach(p=>{
    if(!p.idb)return;
    if(_pend.has(p.id)){idbDel(p.id).catch(()=>{});delete _urlCache[p.id];_pend.delete(p.id);}
    else{_todel.add(p.id);}
  });
  spotFinderDraftPhotos.length=0;
  renderSpotFinderPhotoPreview();
};
window.spotFinderClearForm=function(){
  _cleanSet(_pend);
  _cleanSet(_todel);
  ['sf-id','sf-name','sf-gps','sf-note','sf-lat','sf-lon'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  spotFinderDraftPhotos.length=0;
  renderSpotFinderPhotoPreview();
  if(typeof renderSpotFinderMap==='function')renderSpotFinderMap();
  const distEl=document.getElementById('sf-dist-overlay');
  if(distEl)distEl.style.display='none';
};

window.spotFinderSave=function(){
  const db=getdb();
  if(!db.scoutSpots)db.scoutSpots=[];
  const sid=(document.getElementById('sf-id')?.value||'').trim();
  const name=(document.getElementById('sf-name')?.value||'').trim();
  const note=(document.getElementById('sf-note')?.value||'').trim();
  const gps=(document.getElementById('sf-gps')?.value||'').trim();
  const p=typeof spotFinderGetFormPoint==='function'?spotFinderGetFormPoint():null;
  if(!p){toast('Előbb rögzíts GPS pontot.');return;}
  if(!name){toast('Adj rövid nevet a helynek.');return;}
  /* base64 fotókat is mentjük */
  const photos=spotFinderDraftPhotos.map(ph=>({
    id:ph.id,
    idb:!!ph.idb,
    createdAt:ph.createdAt,
    data:ph.idb?undefined:ph.data
  }));
  const payload={id:sid||('spot_'+Date.now()),name,gps:gps||`${Number(p.lat).toFixed(5)}°N, ${Number(p.lon).toFixed(5)}°E`,lat:Number(p.lat),lon:Number(p.lon),note,photos,updatedAt:new Date().toISOString()};
  if(!sid)payload.createdAt=new Date().toISOString();
  const ix=db.scoutSpots.findIndex(s=>s.id===payload.id);
  if(ix>=0){payload.createdAt=db.scoutSpots[ix].createdAt||payload.updatedAt;db.scoutSpots[ix]=payload;}
  else{db.scoutSpots.unshift(payload);}
  if(!db.locations)db.locations=[];
  const locId='sfloc_'+payload.id;
  const ex=db.locations.find(l=>l.id===locId);
  if(ex){Object.assign(ex,{name:payload.name,lat:payload.lat,lon:payload.lon,gps:payload.gps,note:payload.note,updatedAt:payload.updatedAt});}
  else{db.locations.push({id:locId,name:payload.name,type:'Ismeretlen',county:'',settlement:'',gps:payload.gps,lat:payload.lat,lon:payload.lon,note:payload.note,feedingPoint:'',castDirection:'',bottomNote:'',last:'',sessions:0,catchCount:0,totalWeight:0,favorite:false,fromSpotFinder:true,createdAt:payload.createdAt||payload.updatedAt,updatedAt:payload.updatedAt});}
  savedb(db);
  _cleanSet(_todel);
  _pend.clear();
  spotFinderClearForm();
  if(typeof renderSpotFinder==='function')renderSpotFinder();
  toast('Helykeresői pont mentve. ✓ Helyek szinkronizálva.');
};

window.spotFinderEdit=function(id){
  _cleanSet(_pend);_cleanSet(_todel);
  const db=getdb();
  const s=(db.scoutSpots||[]).find(x=>x.id===id);
  if(!s)return;
  document.getElementById('sf-id').value=s.id||'';
  document.getElementById('sf-name').value=s.name||'';
  document.getElementById('sf-gps').value=s.gps||'';
  document.getElementById('sf-note').value=s.note||'';
  document.getElementById('sf-lat').value=s.lat||'';
  document.getElementById('sf-lon').value=s.lon||'';
  spotFinderDraftPhotos.length=0;
  (s.photos||[]).forEach(ph=>spotFinderDraftPhotos.push({id:ph.id,idb:!!ph.idb,createdAt:ph.createdAt,data:ph.data}));
  renderSpotFinderPhotoPreview();
  if(typeof renderSpotFinderMap==='function')renderSpotFinderMap();
  window.scrollTo(0,0);
};

window.spotFinderDelete=function(id){
  if(!confirm('Töröd ezt a helykeresői pontot?'))return;
  const db=getdb();
  const spot=(db.scoutSpots||[]).find(s=>s.id===id);
  if(spot)(spot.photos||[]).forEach(p=>{if(p.idb){idbDel(p.id).catch(()=>{});delete _urlCache[p.id];}});
  db.scoutSpots=(db.scoutSpots||[]).filter(s=>s.id!==id);
  db.locations=(db.locations||[]).filter(l=>l.id!==('sfloc_'+id));
  savedb(db);
  spotFinderClearForm();
  if(typeof renderSpotFinder==='function')renderSpotFinder();
  toast('Hely törölve.');
};

window.renderSpotFinderList=function(){
  const el=document.getElementById('spotfinder-list');
  if(!el)return;
  const db=getdb();
  const list=[...(db.scoutSpots||[])].sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  if(!list.length){el.innerHTML='<div class="empty-state"><i class="ti ti-map-search empty-icon"></i><div class="empty-title">Még nincs mentett hely</div><div class="empty-sub">Bejárás közben rögzíts GPS pontot, adj nevet és megjegyzést.</div></div>';return;}
  el.innerHTML=list.map(s=>{
    const photos=s.photos||[];
    const thumbs=photos.slice(0,4).map(p=>{
      const src=(!p.idb&&p.data)?p.data:'';
      return `<img class="spot-photo-thumb" data-pid="${p.id}" src="${src}" alt="" style="${src?'':'opacity:.3'}" onclick="sfOpenLightbox(this)">`;}).join('')+(photos.length>4?`<div class="spot-photo-empty">+${photos.length-4} fotó</div>`:'');
    return `<div class="spot-card"><div><div class="spot-card-name">${_esc(s.name||'Névtelen hely')}</div><div class="spot-card-meta"><i class="ti ti-current-location"></i> ${_esc(s.gps||'')} · ${_esc(_date(s.updatedAt||s.createdAt))} · ${photos.length} fotó</div>${s.note?`<div class="spot-card-note">${_esc(s.note)}</div>`:'' }${photos.length?`<div class="spot-photo-preview-grid">${thumbs}</div>`:''}</div><div class="spot-card-actions"><button class="btn-secondary" onclick="spotFinderEdit('${_escj(s.id)}')"><i class="ti ti-edit"></i> Szerkesztés</button><button class="btn-secondary" onclick="spotFinderOpenMap('${_escj(s.id)}')"><i class="ti ti-map-pin"></i> Térkép</button><button class="btn-danger-outline" onclick="spotFinderDelete('${_escj(s.id)}')"><i class="ti ti-trash"></i></button></div></div>`;
  }).join('');
  list.forEach(s=>(s.photos||[]).slice(0,4).forEach(p=>{
    if(!p.idb)return;
    const img=el.querySelector(`img[data-pid="${p.id}"]`);
    if(!img)return;
    const url=_urlCache[p.id];
    if(url){img.src=url;img.style.opacity='';return;}
    photoUrl(p.id).then(u=>{if(u&&img.isConnected){img.src=u;img.style.opacity='';}});
  }));
};

/* ── Helyszín markerek a térképen ──────────────────────────────── */
let _locMarkers=[];
function _clearLocMarkers(){_locMarkers.forEach(m=>{try{m.remove()}catch(_){}});_locMarkers=[];}
function sfRenderLocations(){
  if(typeof L==='undefined'||!window.spotFinderMap)return;
  _clearLocMarkers();
  const db=getdb();
  (db.locations||[]).forEach(loc=>{
    if(!loc.lat||!loc.lon||loc.fromSpotFinder)return;
    try{
      const m=L.marker([Number(loc.lat),Number(loc.lon)],{icon:L.divIcon({className:'',html:'<div style="width:12px;height:12px;background:#5a7042;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',iconSize:[12,12],iconAnchor:[6,6]}),zIndexOffset:-100}).addTo(spotFinderMap);
      m.bindPopup(`<div style="font-weight:700">${_esc(loc.name||'Helyszín')}</div><div style="font-size:11px;color:#666">${_esc(loc.type||'')}</div>`);
      _locMarkers.push(m);
    }catch(e){console.warn('[v39]',e);}
  });
}
function sfRenderLocationsRetry(n){if(window.spotFinderMap){sfRenderLocations();return;}if(n>0)setTimeout(()=>sfRenderLocationsRetry(n-1),300);}

const _origRenderSF=window.renderSpotFinder;
window.renderSpotFinder=function(){if(typeof _origRenderSF==='function')_origRenderSF.apply(this,arguments);setTimeout(()=>sfRenderLocationsRetry(5),250);setTimeout(sfInjectMapButtons,350);};

/* ── Lightbox ──────────────────────────────────────────────────── */
window.sfOpenLightbox=function(imgEl){
  let lbx=document.getElementById('sf-lightbox');
  if(!lbx){
    lbx=document.createElement('div');lbx.id='sf-lightbox';
    lbx.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:10px';
    lbx.innerHTML='<button id="sf-lbx-x" style="position:fixed;top:16px;right:16px;border:0;border-radius:50%;width:44px;height:44px;background:rgba(255,255,255,.18);color:#fff;font-size:28px;cursor:pointer">&times;</button><img id="sf-lbx-img" alt="Hely fotó" style="max-width:96vw;max-height:92dvh;object-fit:contain;border-radius:14px">';
    document.body.appendChild(lbx);
    lbx.addEventListener('click',e=>{if(e.target===lbx||e.target.id==='sf-lbx-x')lbx.style.display='none';});
  }
  const out=document.getElementById('sf-lbx-img');
  const src=imgEl&&(imgEl.getAttribute('src')||imgEl.src)||'';
  out.src=src;
  lbx.style.display='flex';
  const pid=imgEl&&imgEl.dataset.pid;
  if(pid){
    const url=_urlCache[pid];
    if(url){out.src=url;return;}
    photoUrl(pid).then(u=>{if(u)out.src=u;});
  }
};

/* ── Teljes képernyős mód ──────────────────────────────────────── */
let _full=false,_shellSt='',_mapSt='';
window.sfToggleFullscreen=function(){
  const shell=document.querySelector('.spotfinder-map-shell');
  const mapEl=document.getElementById('spotfinder-map-view');
  const btn=document.getElementById('sf-btn-fs');
  if(!shell||!mapEl)return;
  _full=!_full;
  if(_full){
    _shellSt=shell.style.cssText;_mapSt=mapEl.style.cssText;
    shell.style.cssText='position:fixed;inset:0;z-index:9990;border-radius:0;margin:0;padding:0';
    mapEl.style.cssText='height:100dvh;width:100vw';
    if(btn){btn.innerHTML='<i class="ti ti-minimize"></i>';btn.title='Vissza';}
    document.body.style.overflow='hidden';
    const bar=document.getElementById('sf-btn-bar');
    if(bar)bar.style.bottom='max(48px, env(safe-area-inset-bottom, 48px))';
  }else{
    shell.style.cssText=_shellSt;mapEl.style.cssText=_mapSt;
    if(btn){btn.innerHTML='<i class="ti ti-maximize"></i>';btn.title='Teljes képernyő';}
    document.body.style.overflow='';
    const bar=document.getElementById('sf-btn-bar');
    if(bar)bar.style.bottom='10px';
  }
  setTimeout(()=>{if(window.spotFinderMap)spotFinderMap.invalidateSize();},150);
};

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(_full)sfToggleFullscreen();
    const lbx=document.getElementById('sf-lightbox');
    if(lbx&&lbx.style.display!=='none')lbx.style.display='none';
  }
});

/* ── Térkép gombok (zoom + fullscreen + GPS) ───────────────────── */
const _btnStyle='width:36px;height:36px;border:0;border-radius:9px;background:rgba(255,255,255,.93);box-shadow:0 2px 8px rgba(0,0,0,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#333;line-height:1';
function sfInjectMapButtons(){
  const mapEl=document.getElementById('spotfinder-map-view');
  if(!mapEl||document.getElementById('sf-btn-bar'))return;
  const bar=document.createElement('div');
  bar.id='sf-btn-bar';
  bar.style.cssText='position:absolute;bottom:10px;right:10px;z-index:1001;display:flex;flex-direction:column;gap:6px;pointer-events:all';
  bar.innerHTML=`
    <button id="sf-btn-fs" onclick="sfToggleFullscreen()" title="Teljes képernyő" style="${_btnStyle}"><i class="ti ti-maximize" style="font-size:17px"></i></button>
    <button id="sf-btn-gps" onclick="sfToggleLiveGps()" title="GPS nyomkövetés" style="${_btnStyle}"><i class="ti ti-current-location" style="font-size:17px"></i></button>
    <button onclick="if(window.spotFinderMap)spotFinderMap.zoomIn()" title="Nagyítás" style="${_btnStyle}">+</button>
    <button onclick="if(window.spotFinderMap)spotFinderMap.zoomOut()" title="Kicsinyítés" style="${_btnStyle}">−</button>
  `;
  mapEl.appendChild(bar);
  /* Leaflet saját zoom gombok elrejtése — saját gombokkal helyettesítve */
  if(!document.getElementById('sf-zoom-hide-style')){
    const st=document.createElement('style');
    st.id='sf-zoom-hide-style';
    st.textContent='#spotfinder-map-view .leaflet-control-zoom{display:none!important}';
    document.head.appendChild(st);
  }
  setTimeout(sfCenterOnAppGps,300);
}

/* ── GPS nyomkövetés ───────────────────────────────────────────── */
let _watchId=null,_gpsMark=null,_gpsFollow=true,_gpsLat=null,_gpsLon=null;
const _gpsCSS=document.createElement('style');
_gpsCSS.textContent='@keyframes sfPulse{0%{transform:scale(1);opacity:.9}70%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:0}}.sf-gps-wrap{width:20px;height:20px;position:relative}.sf-gps-dot{width:14px;height:14px;background:#2979ff;border:2.5px solid #fff;border-radius:50%;position:absolute;top:3px;left:3px;box-shadow:0 2px 8px rgba(41,121,255,.5)}.sf-gps-ring{width:20px;height:20px;border-radius:50%;background:rgba(41,121,255,.3);position:absolute;top:0;left:0;animation:sfPulse 1.8s ease-out infinite}';
document.head.appendChild(_gpsCSS);
function sfGpsIcon(){return L.divIcon({className:'',html:'<div class="sf-gps-wrap"><div class="sf-gps-ring"></div><div class="sf-gps-dot"></div></div>',iconSize:[20,20],iconAnchor:[10,10]});}

function sfCenterOnAppGps(){
  if(!window.spotFinderMap)return;
  const la=parseFloat(window.lat),lo=parseFloat(window.lon);
  if(Number.isFinite(la)&&Number.isFinite(lo)){spotFinderMap.setView([la,lo],15);}
}

function sfOnGpsPos(pos){
  const la=pos.coords.latitude,lo=pos.coords.longitude;
  _gpsLat=la;_gpsLon=lo;
  if(!window.spotFinderMap&&typeof spotFinderEnsureMap==='function')spotFinderEnsureMap();
  if(!window.spotFinderMap)return;
  if(!_gpsMark){
    _gpsMark=L.marker([la,lo],{icon:sfGpsIcon(),zIndexOffset:2000}).addTo(spotFinderMap);
    _gpsMark.bindPopup('Te vagy itt');
  }else{
    _gpsMark.setLatLng([la,lo]);
  }
  if(_gpsFollow)spotFinderMap.panTo([la,lo]);
  sfUpdateDistanceDisplay(la,lo);
  const btn=document.getElementById('sf-btn-gps');
  if(btn){btn.style.background='rgba(41,121,255,.85)';btn.style.color='#fff';}
}

window.sfToggleLiveGps=function(){
  if(_watchId!=null){
    if(!_gpsFollow){_gpsFollow=true;if(_gpsMark&&window.spotFinderMap)spotFinderMap.panTo(_gpsMark.getLatLng());return;}
    sfStopGps();return;
  }
  if(!navigator.geolocation){toast('GPS nem támogatott ezen az eszközön.');return;}
  _gpsFollow=true;
  toast('GPS helymeghatározás…');
  navigator.geolocation.getCurrentPosition(sfOnGpsPos,()=>{},{enableHighAccuracy:true,timeout:8000,maximumAge:30000});
  _watchId=navigator.geolocation.watchPosition(
    sfOnGpsPos,
    err=>{toast('GPS hiba: '+err.message);sfStopGps();},
    {enableHighAccuracy:true,maximumAge:3000,timeout:20000}
  );
  if(window.spotFinderMap&&!spotFinderMap._v39drag){
    spotFinderMap._v39drag=true;
    spotFinderMap.on('dragstart',()=>{_gpsFollow=false;});
  }
};

function sfStopGps(){
  if(_watchId!=null){navigator.geolocation.clearWatch(_watchId);_watchId=null;}
  if(_gpsMark){_gpsMark.remove();_gpsMark=null;}
  _gpsLat=null;_gpsLon=null;
  const btn=document.getElementById('sf-btn-gps');
  if(btn){btn.style.background='rgba(255,255,255,.93)';btn.style.color='';}
  const distEl=document.getElementById('sf-dist-overlay');
  if(distEl)distEl.style.display='none';
  _gpsFollow=true;
}
window.sfStopGps=sfStopGps;

function sfAutoStartGps(){
  if(_watchId!=null)return;
  if(!navigator.geolocation)return;
  setTimeout(()=>{
    if(document.getElementById('page-spotfinder')?.classList.contains('active')){
      sfToggleLiveGps();
    }
  },800);
}

const _origGetLoc=window.getLocation;
window.getLocation=function(){
  const r=typeof _origGetLoc==='function'?_origGetLoc.apply(this,arguments):undefined;
  setTimeout(()=>{
    if(document.getElementById('page-spotfinder')?.classList.contains('active')){sfCenterOnAppGps();}
  },2000);
  return r;
};

/* ── showPage hook ─────────────────────────────────────────────── */
const _origShow=window.showPage;
window.showPage=function(id){
  if(id==='spotfinder'){
    setTimeout(()=>{sfInjectMapButtons();sfRenderLocationsRetry(5);},400);
    sfAutoStartGps();
  }else{
    sfStopGps();
    if(_full)sfToggleFullscreen();
    const lbx=document.getElementById('sf-lightbox');
    if(lbx)lbx.style.display='none';
  }
  return typeof _origShow==='function'?_origShow.apply(this,arguments):undefined;
};

/* ── Régi base64 fotók migrálása IDB-be ────────────────────────── */
async function migratePhotos(){
  const db=getdb();let changed=false;
  for(const s of(db.scoutSpots||[])){
    for(const p of(s.photos||[])){
      if(!p.data||p.idb)continue;
      try{
        const raw=p.data.includes(',')?p.data.split(',')[1]:p.data;
        const bin=atob(raw),bytes=new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
        await idbPut(p.id,new Blob([bytes],{type:'image/jpeg'}));
        delete p.data;p.idb=true;changed=true;
      }catch(e){
        /* IDB nem érhető el — base64 marad */
        console.warn('[v39] migrate skip:',e.message||e);
      }
    }
  }
  if(changed){savedb(db);console.log('[v39] Régi base64 fotók migrálva IDB-be.');}
}
setTimeout(migratePhotos,2500);
setTimeout(()=>{sfInjectMapButtons();sfRenderLocationsRetry(5);},1200);
console.log('[v39] SpotFinder Enhance v5 · GPS auto-start, távolság, zoom, fotó fallback');
})();
