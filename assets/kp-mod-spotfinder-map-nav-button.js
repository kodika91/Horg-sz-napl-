/* kp-mod-spotfinder-map-nav-button.js — kompakt Visszatalálás gomb a térkép menübe
 * v1.0 · a meglévő kpSpotNavigateTo modult hívja, a térkép gombsor stílusához igazítva.
 */
(function(){
'use strict';
if(window.KP_SPOT_MAP_NAV_BTN_V10)return;
window.KP_SPOT_MAP_NAV_BTN_V10=true;

function qs(s,r=document){return r.querySelector(s)}
function toast(m){try{typeof showToast==='function'?showToast(m):alert(m)}catch(e){console.log(m)}}
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return{}}}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}

const btnStyle='width:36px;height:36px;border:0;border-radius:9px;background:rgba(255,255,255,.93);box-shadow:0 2px 8px rgba(0,0,0,.22);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#333;line-height:1;padding:0;box-sizing:border-box';

function currentSpot(){
  const data=db();
  const spots=data.scoutSpots||[];
  const id=(qs('#sf-id')&&qs('#sf-id').value||'').trim();
  if(id){
    const byId=spots.find(s=>s&&s.id===id);
    if(byId)return byId;
  }
  const p=typeof spotFinderGetFormPoint==='function'?spotFinderGetFormPoint():null;
  const la=num(p&&p.lat)||num(qs('#sf-lat')&&qs('#sf-lat').value);
  const lo=num(p&&p.lon)||num(qs('#sf-lon')&&qs('#sf-lon').value);
  if(la!=null&&lo!=null){
    const same=spots.find(s=>Math.abs(Number(s.lat)-la)<0.00002&&Math.abs(Number(s.lon)-lo)<0.00002);
    if(same)return same;
    return {
      id:id||'map_current_point',
      name:(qs('#sf-name')&&qs('#sf-name').value||'Kijelölt hely').trim()||'Kijelölt hely',
      lat:la,
      lon:lo
    };
  }
  return null;
}

function startNav(btn){
  const spot=currentSpot();
  if(!spot){toast('⚠️ Előbb válassz ki vagy nyiss meg egy mentett helyet a térképen.');return;}
  if(typeof window.kpSpotNavigateTo!=='function'){
    toast('⚠️ A visszatalálás modul még nem töltött be. Próbáld meg újra pár másodperc múlva.');
    return;
  }
  window.kpSpotNavigateTo(spot,btn);
}

function inject(){
  const bar=qs('#sf-btn-bar');
  if(!bar)return false;
  if(qs('#sf-btn-nav',bar))return true;
  const gps=qs('#sf-btn-gps',bar);
  const btn=document.createElement('button');
  btn.id='sf-btn-nav';
  btn.type='button';
  btn.title='Visszatalálás a kijelölt helyhez';
  btn.setAttribute('aria-label','Visszatalálás');
  btn.style.cssText=btnStyle;
  btn.innerHTML='<i class="ti ti-route" style="font-size:17px"></i>';
  btn.onclick=function(){startNav(btn)};
  if(gps&&gps.parentNode===bar)gps.insertAdjacentElement('afterend',btn);
  else bar.insertBefore(btn,bar.firstChild);
  return true;
}

function loop(){inject();}
const oldShow=window.showPage;
if(typeof oldShow==='function'&&!oldShow.KP_SPOT_MAP_NAV_BTN_WRAPPED){
  window.showPage=function(id){
    const r=oldShow.apply(this,arguments);
    if(id==='spotfinder')setTimeout(inject,650);
    return r;
  };
  window.showPage.KP_SPOT_MAP_NAV_BTN_WRAPPED=true;
}
setTimeout(inject,700);
setTimeout(inject,1600);
setInterval(loop,2000);
console.log('[spot-map-nav-btn] v1.0 aktív');
})();
