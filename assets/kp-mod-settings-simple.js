/* kp-mod-settings-simple.js — Beállítások egyszerűsítése
 * v1.1 · Csak GitHub szinkron, összevonó visszatöltés és képkezelő maradjon látható.
 */
(function(){
'use strict';
if(window.KP_SETTINGS_SIMPLE_V11)return;
window.KP_SETTINGS_SIMPLE_V11=true;

function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[settings-simple]',m)}catch(e){}}
function titleText(){return ((qs('#page-title-text')||qs('#page-title')||{}).textContent||'').toLowerCase()}
function isSettingsLike(){
  const id=((qs('.page.active')||{}).id||'').toLowerCase();
  const t=titleText();
  return !!qs('#page-settings,.page.active[id*="settings"],[data-page="settings"].active')||id.includes('export')||id.includes('setting')||t.includes('beállítás')||t.includes('export')||t.includes('adatmentés');
}
function scope(){return qs('#page-settings')||qs('#page-export')||qs('[data-page="settings"]')||qs('.page.active')||document.body}

function ensureStyle(){
  if(qs('#kp-settings-simple-style'))return;
  const st=document.createElement('style');
  st.id='kp-settings-simple-style';
  st.textContent=`
    #kp-simple-settings-panel{margin:14px 0 18px;padding:16px;border-radius:18px;background:linear-gradient(180deg,rgba(8,36,33,.92),rgba(14,49,45,.86));border:1px solid rgba(174,255,230,.18);box-shadow:0 18px 48px rgba(0,0,0,.28)}
    #kp-simple-settings-panel h3{margin:0 0 6px;font-size:18px;color:#f4fff9}
    #kp-simple-settings-panel p{margin:0 0 12px;font-size:13px;line-height:1.5;color:rgba(230,255,248,.76)}
    .kp-ss-grid{display:grid;gap:10px}.kp-ss-field label{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:rgba(174,255,230,.66);margin-bottom:5px}.kp-ss-field input{width:100%;padding:11px 12px;border-radius:12px;border:1px solid rgba(174,255,230,.18);background:rgba(255,255,255,.08);color:#f4fff9;font:inherit}.kp-ss-field input::placeholder{color:rgba(230,255,248,.45)}.kp-ss-actions{display:grid;gap:8px;margin-top:12px}.kp-ss-actions button{width:100%;min-height:44px;border-radius:12px;border:0;font-weight:800;cursor:pointer}.kp-ss-primary{background:linear-gradient(135deg,#5dff91,#2ed5ff);color:#031615}.kp-ss-secondary{background:rgba(255,255,255,.08);border:1px solid rgba(174,255,230,.18)!important;color:#f4fff9}.kp-ss-note{font-size:12px!important;margin-top:10px!important;color:rgba(230,255,248,.62)!important}
    body.kp-settings-simple-active .kp-hide-settings-noise{display:none!important}
    body.kp-settings-simple-active #v18-image-manager{display:block!important}
    body.kp-settings-simple-active #kp-simple-settings-panel{display:block!important}
    @media(max-width:720px){#kp-simple-settings-panel{margin:10px 0;padding:14px;border-radius:16px}.kp-ss-actions button{min-height:48px;font-size:15px}}
  `;
  document.head.appendChild(st);
}

function loadCfg(){try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
function saveCfg(c){localStorage.setItem('kapaspont_github_sync',JSON.stringify(c));localStorage.setItem('horgaszpro_github_sync',JSON.stringify(c));if(c.token)localStorage.setItem('v18_github_token',c.token)}
function panel(){
  const c=loadCfg();
  const wrap=document.createElement('div');wrap.id='kp-simple-settings-panel';wrap.className='card';
  wrap.innerHTML=`
    <h3>GitHub mentés és visszatöltés</h3>
    <p>Csak ez maradjon a naplóhoz: GitHub kapcsolat, mentés és a legutóbbi mentés összevonó betöltése. A betöltés nem írja felül a meglévő bejegyzéseket.</p>
    <div class="kp-ss-grid">
      <div class="kp-ss-field"><label>Tulajdonos</label><input id="kp-ss-owner" value="${String(c.owner||'kodika91').replace(/"/g,'&quot;')}"></div>
      <div class="kp-ss-field"><label>Adat repo</label><input id="kp-ss-repo" value="${String(c.repo||'horgasz-naplo-adatok').replace(/"/g,'&quot;')}"></div>
      <div class="kp-ss-field"><label>Branch</label><input id="kp-ss-branch" value="${String(c.branch||'main').replace(/"/g,'&quot;')}"></div>
      <div class="kp-ss-field"><label>Root mappa</label><input id="kp-ss-root" value="${String(c.root||'kapaspont').replace(/"/g,'&quot;')}"></div>
      <div class="kp-ss-field"><label>GitHub token</label><input id="kp-ss-token" type="password" value="${String(c.token||localStorage.getItem('v18_github_token')||'').replace(/"/g,'&quot;')}"></div>
    </div>
    <div class="kp-ss-actions">
      <button class="kp-ss-primary" id="kp-ss-save">Beállítás mentése</button>
      <button class="kp-ss-secondary" id="kp-ss-merge">Legutóbbi GitHub mentés betöltése / összevonása</button>
      <button class="kp-ss-secondary" id="kp-ss-backup">Mentés GitHubra most</button>
      <button class="kp-ss-secondary" id="kp-ss-img">Képkezelő megnyitása</button>
    </div>
    <p class="kp-ss-note">A képkezelő GitHub fájlokba menti a halfaj, csali és felszerelés képeit; ez változatlanul megmaradt.</p>`;
  wrap.querySelector('#kp-ss-save').onclick=function(){const next={owner:qs('#kp-ss-owner').value.trim()||'kodika91',repo:qs('#kp-ss-repo').value.trim()||'horgasz-naplo-adatok',branch:qs('#kp-ss-branch').value.trim()||'main',root:qs('#kp-ss-root').value.trim()||'kapaspont',token:qs('#kp-ss-token').value.trim()};saveCfg(next);toast('GitHub beállítás mentve.')};
  wrap.querySelector('#kp-ss-merge').onclick=function(){const b=qs('#kp-ss-save');if(b)b.click();if(typeof githubRestoreLatestFromRepo==='function')githubRestoreLatestFromRepo();else if(typeof kpRestoreLatestGithubBackup==='function')kpRestoreLatestGithubBackup(false);else toast('A visszatöltő modul még nem töltött be.')};
  wrap.querySelector('#kp-ss-backup').onclick=function(){const b=qs('#kp-ss-save');if(b)b.click();if(typeof githubSyncNow==='function')githubSyncNow();else toast('A GitHub mentés modul még nem töltött be.')};
  wrap.querySelector('#kp-ss-img').onclick=function(){const im=qs('#v18-image-manager');if(im)im.scrollIntoView({behavior:'smooth',block:'start'});else toast('A képkezelő még töltődik.')};
  return wrap;
}
function hideNoise(sc){
  const bad=['túraösszesítő export','aktuális túra html','pdf / nyomtatás','importálás','json betöltése','adatok törlése','összes törlése','csv letöltése','exportálás'];
  qsa('.card,section,article',sc).forEach(el=>{
    if(el.id==='kp-simple-settings-panel'||el.id==='v18-image-manager')return;
    const t=(el.textContent||'').toLowerCase();
    if(bad.some(w=>t.includes(w)))el.classList.add('kp-hide-settings-noise');
  });
}
function simplify(){
  ensureStyle();
  if(!isSettingsLike()){document.body.classList.remove('kp-settings-simple-active');return;}
  document.body.classList.add('kp-settings-simple-active');
  const sc=scope();
  let p=qs('#kp-simple-settings-panel',sc)||qs('#kp-simple-settings-panel');
  if(!p){p=panel();sc.insertBefore(p,sc.firstChild)}
  hideNoise(sc);
  const im=qs('#v18-image-manager');if(im)im.style.display='block';
}
const oldShow=window.showPage;
if(typeof oldShow==='function'&&!oldShow.KP_SETTINGS_SIMPLE_V11_WRAPPED){window.showPage=function(){const r=oldShow.apply(this,arguments);setTimeout(simplify,120);setTimeout(simplify,700);return r};window.showPage.KP_SETTINGS_SIMPLE_V11_WRAPPED=true}
setTimeout(simplify,700);setTimeout(simplify,1800);setInterval(simplify,1600);
try{new MutationObserver(()=>setTimeout(simplify,80)).observe(document.body,{childList:true,subtree:true})}catch(e){}
console.log('[settings-simple] v1.1 aktív');
})();
