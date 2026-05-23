// GitHub restore overlay patch
(function(){
if(window.KP_GITHUB_RESTORE_OVERLAY)return;
window.KP_GITHUB_RESTORE_OVERLAY=true;
function ui(msg,type){
let el=document.getElementById('kp-gh-restore-overlay');
if(!el){
el=document.createElement('div');
el.id='kp-gh-restore-overlay';
el.style.cssText='position:fixed;right:14px;bottom:14px;z-index:999999;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-radius:16px;padding:12px 14px;box-shadow:0 6px 18px rgba(0,0,0,.18);border:1px solid rgba(44,110,122,.22);font-size:13px;font-weight:700;color:#2a2018;max-width:320px';
document.body.appendChild(el);
}
el.style.display='block';
el.innerHTML=(type==='ok'?'✅ ':type==='err'?'⚠️ ':'☁️ ')+msg;
if(type==='ok'||type==='err'){setTimeout(()=>{if(el)el.style.display='none'},2600)}
}
const old1=window.kpRestoreLatestGithubBackup;
if(typeof old1==='function'){window.kpRestoreLatestGithubBackup=async function(auto){ui('GitHub mentés keresése…');try{await old1.apply(this,arguments);ui('GitHub mentés visszatöltve.','ok')}catch(e){ui('Visszatöltési hiba.','err');throw e}}}
const old2=window.githubRestoreLatestFromRepo;
if(typeof old2==='function'){window.githubRestoreLatestFromRepo=async function(){ui('GitHub backup összevonása…');try{await old2.apply(this,arguments);ui('Összevonás kész.','ok')}catch(e){ui('Összevonási hiba.','err');throw e}}}
})();