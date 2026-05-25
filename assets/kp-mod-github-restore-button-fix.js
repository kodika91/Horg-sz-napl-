/* kp-mod-github-restore-button-fix.js — Legutóbbi backup betöltése appba, ne telefonos letöltés
 * v1.0 · A backup/visszatöltés gombokat a meglévő merge restore funkciókra köti.
 */
(function(){
'use strict';
if(window.KP_GH_RESTORE_BTN_FIX_V1)return;
window.KP_GH_RESTORE_BTN_FIX_V1=true;

function txt(el){return String(el&&el.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function toast(m){try{typeof showToast==='function'?showToast(m):alert(m)}catch(e){console.log(m)}}
function isRestoreButton(b){
  const t=txt(b);
  if(!t)return false;
  const backup=t.includes('backup')||t.includes('mentes')||t.includes('visszatoltes')||t.includes('visszaallitas');
  const latest=t.includes('utolso')||t.includes('legutobbi')||t.includes('latest')||t.includes('github');
  const download=t.includes('letoltes')||t.includes('download');
  return backup&&(latest||download)&&!t.includes('export')&&!t.includes('uj backup')&&!t.includes('mentes githubra most');
}
async function restoreLatest(e){
  if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation&&e.stopImmediatePropagation();}
  try{
    if(typeof window.kpRestoreLatestGithubBackup==='function'){
      await window.kpRestoreLatestGithubBackup(false);
      return false;
    }
    if(typeof window.githubRestoreLatestFromRepo==='function'){
      await window.githubRestoreLatestFromRepo();
      return false;
    }
    if(typeof window.githubDownloadLatestFromRepo==='function'){
      await window.githubDownloadLatestFromRepo();
      return false;
    }
    toast('Nem találom a GitHub visszatöltő modult. Frissítsd az oldalt.');
  }catch(err){toast('Visszatöltési hiba: '+(err&&err.message||err));}
  return false;
}
function patchButtons(){
  document.querySelectorAll('button,a,[role="button"]').forEach(function(b){
    if(!isRestoreButton(b)||b.__kpRestoreBtnFixed)return;
    b.__kpRestoreBtnFixed=true;
    b.removeAttribute('download');
    if(b.tagName==='A')b.setAttribute('href','#');
    b.addEventListener('click',restoreLatest,true);
    b.onclick=restoreLatest;
    if(txt(b).includes('letoltes')){
      try{b.innerHTML=b.innerHTML.replace(/letöltés/ig,'betöltés').replace(/download/ig,'betöltés')}catch(e){}
    }
  });
}
setInterval(patchButtons,1000);
document.addEventListener('click',function(e){
  const b=e.target&&e.target.closest&&e.target.closest('button,a,[role="button"]');
  if(b&&isRestoreButton(b))restoreLatest(e);
},true);
setTimeout(patchButtons,500);setTimeout(patchButtons,1800);
console.log('[github-restore-button-fix] aktív: utolsó backup appba töltődik.');
})();
