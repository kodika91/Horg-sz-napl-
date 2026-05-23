/* kp-mod-force-hide-settings.js — felesleges beállítási kártyák kényszerített elrejtése
 * v1.0 · oldalstruktúrától függetlenül rejti az import/törlés/export blokkokat.
 */
(function(){
'use strict';
if(window.KP_FORCE_HIDE_SETTINGS_V1)return;
window.KP_FORCE_HIDE_SETTINGS_V1=true;

function txt(n){return String((n&&n.textContent)||'').toLowerCase().replace(/\s+/g,' ').trim()}
function isBad(t){
  return t.includes('adatok törlése')||
         t.includes('összes törlése')||
         t.includes('importálás')||
         t.includes('json betöltése')||
         t.includes('túraösszesítő export')||
         t.includes('aktuális túra html')||
         t.includes('pdf / nyomtatás')||
         t.includes('csv letöltése');
}
function shouldRun(){
  const body=txt(document.body);
  return body.includes('gitHub mentés'.toLowerCase())||body.includes('visszatöltés')||body.includes('adatok törlése')||body.includes('importálás')||body.includes('túraösszesítő export');
}
function hide(){
  if(!shouldRun())return;
  Array.from(document.querySelectorAll('.card, section, article, .panel, .export-card, div')).forEach(function(el){
    if(!el||el.id==='kp-simple-settings-panel'||el.id==='v18-image-manager'||el.closest('#kp-simple-settings-panel')||el.closest('#v18-image-manager'))return;
    const t=txt(el);
    if(t.length<8||t.length>1200)return;
    if(isBad(t)){
      el.style.setProperty('display','none','important');
      el.setAttribute('data-kp-hidden-settings-noise','1');
    }
  });
}
setTimeout(hide,300);
setTimeout(hide,900);
setTimeout(hide,1800);
setInterval(hide,1200);
try{new MutationObserver(function(){setTimeout(hide,60)}).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}
console.log('[force-hide-settings] aktív');
})();
