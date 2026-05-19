(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD_V2)return;
  window.KP_V27_GITHUB_RESTORE_GUARD_V2=true;
  const V='v27.8-restore-root-fix';
  const DEFAULT={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const dec=s=>{try{return decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(String(s||'').replace(/\n/g,'')),c=>c.charCodeAt(0)))}catch(_){return ''}}};
  let autoRestoreChecked=false;

  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
  function rawCfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function cfg(){const c=rawCfg()||{};return {owner:c.owner||DEFAULT.owner,repo:c.repo||DEFAULT.repo,branch:c.branch||DEFAULT.branch,root:String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'')||DEFAULT.root,token:(c.token||localStorage.getItem('v18_github_token')||'').trim()}}
  function apiPath(p){return String(p).replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}
  function withRoot(c,p){p=String(p||'').replace(/^\/+/, '');const r=String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'');return p.startsWith(r+'/')?p:(r+'/'+p)}
  function check(c){const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
  async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}return data}
  async function getJsonOrNull(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const txt=dec(d.content||'');return txt?JSON.parse(txt):null}catch(e){return null}}
  async function findJson(c,paths){for(const p of paths){const d=await getJsonOrNull(c,p);if(d)return {data:d,path:p}}return {data:null,path:null}}
  function countData(d){return {sessions:(d&&d.sessions||[]).length,locations:(d&&d.locations||[]).length,scoutSpots:(d&&d.scoutSpots||[]).length,catches:(d&&d.sessions||[]).reduce((a,s)=>a+(s.catches||[]).length,0)}}
  function hasMeaningful(d){const c=countData(d||{});return c.sessions>0||c.locations>0||c.scoutSpots>0||c.catches>0}
  function currentDb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
  async function findLatestBackup(c){
    const manifestTry=await findJson(c,[withRoot(c,'manifest.json'),'manifest.json']);
    const man=manifestTry.data;
    const candidates=[];
    if(man){[man.latestBackup,man.backup].filter(Boolean).forEach(p=>{candidates.push(String(p).replace(/^\/+/,''));candidates.push(withRoot(c,p));});}
    candidates.push(withRoot(c,'latest/full_backup_latest.json'));
    candidates.push('latest/full_backup_latest.json');
    candidates.push(withRoot(c,'backups/full_backup_latest.json'));
    const seen=[...new Set(candidates.filter(Boolean))];
    for(const p of seen){const d=await getJsonOrNull(c,p);if(d&&hasMeaningful(d))return {data:d,path:p,manifestPath:manifestTry.path};}
    for(const p of seen){const d=await getJsonOrNull(c,p);if(d)return {data:d,path:p,manifestPath:manifestTry.path};}
    return {data:null,path:null,manifestPath:manifestTry.path};
  }

  window.kpRestoreLocalSafetyBackup=function(){try{const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');if(!raw){toast('Nincs helyi biztonsági mentés ezen a telefonon.');return;}const d=JSON.parse(raw);const ok=confirm('Visszatöltsem a telefonon tárolt legutóbbi helyi biztonsági mentést?');if(!ok)return;localStorage.setItem(DB_KEY,JSON.stringify(d));try{if(typeof migrateDB==='function')migrateDB();}catch(e){}refresh();toast('Telefonos biztonsági mentés visszatöltve.');}catch(e){toast('Visszatöltési hiba: '+e.message)}};

  window.kpRestoreLatestGithubBackup=async function(auto){try{const c=cfg();check(c);const found=await findLatestBackup(c);const remote=found.data;if(!remote||!hasMeaningful(remote))throw new Error('Nem találtam használható GitHub backupot a kapaspont/latest vagy kapaspont/manifest útvonalon.');const rc=countData(remote),lc=countData(currentDb());if(!auto){const ok=confirm('Visszatöltsem a legutóbbi GitHub mentést?\n\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás, '+rc.locations+' hely\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás, '+lc.locations+' hely\n\nForrás: '+found.path);if(!ok)return;}try{localStorage.setItem(DB_KEY+'_before_github_restore',localStorage.getItem(DB_KEY)||'{}')}catch(e){}localStorage.setItem(DB_KEY,JSON.stringify(remote));try{if(typeof migrateDB==='function')migrateDB();}catch(e){}refresh();toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');log('GitHub visszatöltés kész: '+found.path);}catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message);log('GitHub visszatöltési hiba: '+e.message)}};

  function getSettingsScope(){return document.querySelector('#page-settings')||document.querySelector('[data-page="settings"]')||null;}
  function removeSafetyCardOutsideSettings(){try{const scope=getSettingsScope();[...document.querySelectorAll('#kp-safety-restore-card')].forEach(card=>{if(!scope||!scope.contains(card))card.remove();});}catch(e){}}
  function addSafetyCard(){try{const scope=getSettingsScope();if(!scope)return;removeSafetyCardOutsideSettings();if(scope.querySelector('#kp-safety-restore-card'))return;const cards=[...scope.querySelectorAll('.card')];if(!cards.length)return;const importCard=cards.find(c=>((c.textContent||'').toLowerCase().includes('importálás')));const githubCard=cards.find(c=>((c.textContent||'').toLowerCase().includes('github')));const target=importCard||githubCard||cards[cards.length-1];if(!target||!target.parentNode)return;const wrap=document.createElement('div');wrap.className='card';wrap.id='kp-safety-restore-card';wrap.style.marginTop='14px';wrap.innerHTML='<h3 style="margin-top:0">Biztonsági mentés</h3><p class="muted" style="font-size:12px;line-height:1.5">A GitHub visszatöltés az adatrepó kapaspont/ mappájából olvas: manifest.json vagy latest/full_backup_latest.json.</p>';const ghBtn=document.createElement('button');ghBtn.type='button';ghBtn.className='btn-primary';ghBtn.style.width='100%';ghBtn.style.marginTop='8px';ghBtn.textContent='Legutóbbi GitHub mentés visszatöltése';ghBtn.onclick=()=>window.kpRestoreLatestGithubBackup(false);const localBtn=document.createElement('button');localBtn.type='button';localBtn.className='btn-secondary';localBtn.style.width='100%';localBtn.style.marginTop='8px';localBtn.textContent='Telefonos biztonsági mentés visszatöltése';localBtn.onclick=window.kpRestoreLocalSafetyBackup;wrap.appendChild(ghBtn);wrap.appendChild(localBtn);target.parentNode.insertBefore(wrap,target.nextSibling);}catch(e){console.log(e)}}
  function hideCsvExport(){try{const scope=getSettingsScope()||document;[...scope.querySelectorAll('.card')].forEach(card=>{const t=(card.textContent||'').toLowerCase();if(t.includes('csv export')||t.includes('csv letöltése'))card.style.display='none';});}catch(e){}}
  function maybeAutoRestoreFromGithub(){if(autoRestoreChecked)return;autoRestoreChecked=true;setTimeout(()=>{try{const local=currentDb();if(hasMeaningful(local))return;const c=cfg();check(c);window.kpRestoreLatestGithubBackup(true);}catch(e){log('Automatikus GitHub visszatöltés kihagyva: '+e.message)}},1800);}
  function install(){addSafetyCard();hideCsvExport();maybeAutoRestoreFromGithub();}
  setTimeout(install,600);setTimeout(install,1800);setTimeout(install,3200);setInterval(install,4000);try{new MutationObserver(()=>setTimeout(install,80)).observe(document.body,{childList:true,subtree:true});}catch(e){}log('GitHub visszatöltés root hotfix aktív.');
})();