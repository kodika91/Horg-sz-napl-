(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD)return;
  window.KP_V27_GITHUB_RESTORE_GUARD=true;
  const V='v27.7-github-restore-settings-stable';
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const dec=s=>{try{return decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(String(s||'').replace(/\n/g,'')),c=>c.charCodeAt(0)))}catch(_){return ''}}};
  let autoRestoreChecked=false;

  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
  function cfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function root(c){return String(c.root||'kapaspont').replace(/^\/+|\/+$/g,'')||'kapaspont'}
  function fpath(c,p){return root(c)+'/'+String(p||'').replace(/^\/+/, '')}
  function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
  function check(c){const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
  async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}return data}
  async function getJson(c,p){const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const txt=dec(d.content||'');return txt?JSON.parse(txt):null}
  function countData(d){return {sessions:(d&&d.sessions||[]).length,locations:(d&&d.locations||[]).length,scoutSpots:(d&&d.scoutSpots||[]).length,catches:(d&&d.sessions||[]).reduce((a,s)=>a+(s.catches||[]).length,0)}}
  function hasMeaningful(d){const c=countData(d||{});return c.sessions>0||c.locations>0||c.scoutSpots>0||c.catches>0}
  function currentDb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}

  window.kpRestoreLocalSafetyBackup=function(){
    try{
      const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');
      if(!raw){toast('Nincs helyi biztonsági mentés ezen a telefonon.');return;}
      const d=JSON.parse(raw);
      const ok=confirm('Visszatöltsem a telefonon tárolt legutóbbi helyi biztonsági mentést?');
      if(!ok)return;
      localStorage.setItem(DB_KEY,JSON.stringify(d));
      try{if(typeof migrateDB==='function')migrateDB();}catch(e){}
      refresh();
      toast('Telefonos biztonsági mentés visszatöltve.');
    }catch(e){toast('Visszatöltési hiba: '+e.message)}
  };

  window.kpRestoreLatestGithubBackup=async function(auto){
    try{
      const c=cfg();check(c);
      const man=await getJson(c,fpath(c,'manifest.json'));
      const backupPath=man&&(man.latestBackup||man.backup);
      if(!backupPath)throw new Error('A manifest nem tartalmaz visszatölthető backup útvonalat.');
      const remote=await getJson(c,backupPath);
      if(!remote||!hasMeaningful(remote))throw new Error('A GitHub backup üres vagy nem tartalmaz naplóadatot.');
      const rc=countData(remote), lc=countData(currentDb());
      if(!auto){
        const ok=confirm('Visszatöltsem a legutóbbi GitHub mentést?\n\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás, '+rc.locations+' hely\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás, '+lc.locations+' hely');
        if(!ok)return;
      }
      try{localStorage.setItem(DB_KEY+'_before_github_restore',localStorage.getItem(DB_KEY)||'{}')}catch(e){}
      localStorage.setItem(DB_KEY,JSON.stringify(remote));
      try{if(typeof migrateDB==='function')migrateDB();}catch(e){}
      refresh();
      toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');
      log('GitHub visszatöltés kész: '+backupPath);
    }catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message);log('GitHub visszatöltési hiba: '+e.message)}
  };

  function isVisible(el){
    if(!el)return false;
    const st=getComputedStyle(el);
    return st.display!=='none'&&st.visibility!=='hidden'&&el.offsetParent!==null;
  }
  function getSettingsScope(){return document.querySelector('#page-settings')||document.querySelector('[data-page="settings"]')||null;}
  function removeSafetyCardOutsideSettings(){try{const scope=getSettingsScope();[...document.querySelectorAll('#kp-safety-restore-card')].forEach(card=>{if(!scope||!scope.contains(card))card.remove();});}catch(e){}}

  function addSafetyCard(){
    try{
      const scope=getSettingsScope();
      if(!scope)return;
      removeSafetyCardOutsideSettings();
      if(scope.querySelector('#kp-safety-restore-card'))return;
      const cards=[...scope.querySelectorAll('.card')];
      if(!cards.length)return;
      const importCard=cards.find(c=>((c.textContent||'').toLowerCase().includes('importálás')));
      const githubCard=cards.find(c=>((c.textContent||'').toLowerCase().includes('github')));
      const target=importCard||githubCard||cards[cards.length-1];
      if(!target||!target.parentNode)return;
      const wrap=document.createElement('div');
      wrap.className='card';
      wrap.id='kp-safety-restore-card';
      wrap.style.marginTop='14px';
      wrap.innerHTML='\
        <h3 style="margin-top:0">Biztonsági mentés</h3>\
        <p class="muted" style="font-size:12px;line-height:1.5">\
          A telefonos mentés csak ezen a készüléken lévő visszaállítási pont.\
          A GitHub mentés a legutóbbi felhőben tárolt naplóadatot tölti vissza.\
        </p>\
      ';
      const ghBtn=document.createElement('button');
      ghBtn.type='button';ghBtn.className='btn-primary';ghBtn.style.width='100%';ghBtn.style.marginTop='8px';
      ghBtn.textContent='Legutóbbi GitHub mentés visszatöltése';
      ghBtn.onclick=()=>window.kpRestoreLatestGithubBackup(false);
      const localBtn=document.createElement('button');
      localBtn.type='button';localBtn.className='btn-secondary';localBtn.style.width='100%';localBtn.style.marginTop='8px';
      localBtn.textContent='Telefonos biztonsági mentés visszatöltése';
      localBtn.onclick=window.kpRestoreLocalSafetyBackup;
      wrap.appendChild(ghBtn);wrap.appendChild(localBtn);
      target.parentNode.insertBefore(wrap,target.nextSibling);
    }catch(e){console.log(e)}
  }

  function hideCsvExport(){try{const scope=getSettingsScope()||document;[...scope.querySelectorAll('.card')].forEach(card=>{const t=(card.textContent||'').toLowerCase();if(t.includes('csv export')||t.includes('csv letöltése'))card.style.display='none';});}catch(e){}}
  function maybeAutoRestoreFromGithub(){
    if(autoRestoreChecked)return;autoRestoreChecked=true;
    setTimeout(()=>{try{const local=currentDb();if(hasMeaningful(local))return;const c=cfg();check(c);window.kpRestoreLatestGithubBackup(true);}catch(e){log('Automatikus GitHub visszatöltés kihagyva: '+e.message)}},1800);
  }
  function install(){addSafetyCard();hideCsvExport();maybeAutoRestoreFromGithub();}
  setTimeout(install,600);setTimeout(install,1800);setTimeout(install,3200);
  setInterval(install,4000);
  try{new MutationObserver(()=>setTimeout(install,80)).observe(document.body,{childList:true,subtree:true});}catch(e){}
  log('Stabil Beállítások + GitHub visszatöltés UI aktív.');
})();