/* kp-mod-force-hide-settings.js — felesleges beállítási kártyák eltávolítása
 * v1.1 · ténylegesen törli az Importálás/Törlés/Export blokkokat.
 */
(function(){
'use strict';
if(window.KP_FORCE_HIDE_SETTINGS_V11)return;
window.KP_FORCE_HIDE_SETTINGS_V11=true;

function txt(n){return String((n&&n.textContent)||'').toLowerCase().replace(/\s+/g,' ').trim()}
function isBad(t){
  return t.includes('adatok törlése')||
         t.includes('összes törlése')||
         t.includes('importálás')||
         t.includes('json betöltése')||
         t.includes('túraösszesítő export')||
         t.includes('aktuális túra html')||
         t.includes('pdf / nyomtatás')||
         t.includes('csv letöltése')||
         t.includes('exportálás');
}
function protectedNode(el){
  return !el||
    el.id==='kp-simple-settings-panel'||
    el.id==='v18-image-manager'||
    el.closest('#kp-simple-settings-panel')||
    el.closest('#v18-image-manager')||
    el.closest('#sf-nav-overlay');
}
function shouldRun(){
  const body=txt(document.body);
  return body.includes('visszatöltés')||body.includes('adatok törlése')||body.includes('importálás')||body.includes('túraösszesítő export');
}
function removeNoise(){
  if(!shouldRun())return;
  Array.from(document.querySelectorAll('.card, section, article, .panel, .export-card')).forEach(function(el){
    if(protectedNode(el))return;
    const t=txt(el);
    if(t.length<8||t.length>1400)return;
    if(isBad(t)){
      el.setAttribute('data-kp-removed-settings-noise','1');
      el.remove();
    }
  });
}
setTimeout(removeNoise,80);
setTimeout(removeNoise,300);
setTimeout(removeNoise,900);
setTimeout(removeNoise,1800);
setInterval(removeNoise,1000);
try{new MutationObserver(function(){setTimeout(removeNoise,40)}).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}
console.log('[force-hide-settings] v1.1 aktív');
})();