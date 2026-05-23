/* kp-mod-spotfinder-save-position-fix.js — Helykereső mentés utáni GPS pozíció megtartása
 * v1.0 · Additív javítás: mentés után nem üríti ki a kijelölt/jelenlegi térképpontot.
 */
(function(){
'use strict';
if(window.KP_SF_SAVE_POSITION_FIX_V1)return;
window.KP_SF_SAVE_POSITION_FIX_V1=true;

function qs(id){return document.getElementById(id)}
function val(id){const e=qs(id);return e?String(e.value||''):''}
function set(id,v){const e=qs(id);if(e)e.value=v==null?'':String(v)}
function num(v){const n=Number(String(v||'').replace(',','.'));return Number.isFinite(n)?n:null}
function hasPoint(p){return p&&num(p.lat)!=null&&num(p.lon)!=null}
function readPoint(){
  let p=null;
  try{p=typeof window.spotFinderGetFormPoint==='function'?window.spotFinderGetFormPoint():null}catch(e){}
  const lat=hasPoint(p)?p.lat:val('sf-lat');
  const lon=hasPoint(p)?p.lon:val('sf-lon');
  const la=num(lat),lo=num(lon);
  if(la==null||lo==null)return null;
  return {lat:la,lon:lo,gps:val('sf-gps')||la.toFixed(5)+'°N, '+lo.toFixed(5)+'°E'};
}
function restorePoint(p){
  if(!hasPoint(p))return;
  set('sf-lat',p.lat);
  set('sf-lon',p.lon);
  set('sf-gps',p.gps||Number(p.lat).toFixed(5)+'°N, '+Number(p.lon).toFixed(5)+'°E');
  try{if(typeof window.renderSpotFinderMap==='function')window.renderSpotFinderMap()}catch(e){}
  try{if(typeof window.spotFinderMap!=='undefined'&&window.spotFinderMap&&typeof window.spotFinderMap.setView==='function')window.spotFinderMap.setView([Number(p.lat),Number(p.lon)],Math.max(window.spotFinderMap.getZoom&&window.spotFinderMap.getZoom()||15,15))}catch(e){}
}
function wrap(){
  const old=window.spotFinderSave;
  if(typeof old!=='function'||old.__kpSavePositionFix)return false;
  const fixed=function(){
    const before=readPoint();
    const beforeId=val('sf-id');
    const beforeName=val('sf-name');
    const r=old.apply(this,arguments);
    setTimeout(function(){
      /* Csak mentés után állítjuk vissza a térképpontot. Ha eleve nem volt pont, nem találunk ki újat. */
      if(before&&beforeName){
        restorePoint(before);
        console.log('[sf-save-position-fix] GPS pont visszaállítva mentés után.',beforeId||'new',before);
      }
    },120);
    return r;
  };
  fixed.__kpSavePositionFix=true;
  window.spotFinderSave=fixed;
  return true;
}
setTimeout(wrap,300);
setTimeout(wrap,1200);
setInterval(wrap,3000);
console.log('[sf-save-position-fix] aktív');
})();
