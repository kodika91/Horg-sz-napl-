(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD)return;
  window.KP_V27_GITHUB_RESTORE_GUARD=true;
  const V='v27.6-settings-only-safety-card';
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};

  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}

  window.kpRestoreLocalSafetyBackup=function(){
    try{
      const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');
      if(!raw){toast('Nincs helyi biztonsági mentés.');return;}
      const d=JSON.parse(raw);
      const ok=confirm('Visszatöltsem a legutóbbi helyi biztonsági mentést?');
      if(!ok)return;
      localStorage.setItem(DB_KEY,JSON.stringify(d));
      try{if(typeof migrateDB==='function')migrateDB();}catch(e){}
      refresh();
      toast('Biztonsági mentés visszatöltve.');
    }catch(e){toast('Visszatöltési hiba: '+e.message)}
  };

  function isSettingsOpen(){
    try{
      const active=document.querySelector('#page-settings.active, [data-page="settings"].active');
      if(active)return true;
      const title=(document.getElementById('page-title-text')?.textContent||document.getElementById('page-title')?.textContent||'').trim().toLowerCase();
      return title.includes('beállítás');
    }catch(e){return false;}
  }

  function getSettingsScope(){
    return document.querySelector('#page-settings') || document.querySelector('[data-page="settings"]') || null;
  }

  function removeSafetyCardOutsideSettings(){
    try{
      const scope=getSettingsScope();
      [...document.querySelectorAll('#kp-safety-restore-card')].forEach(card=>{
        if(!scope || !scope.contains(card)) card.remove();
      });
    }catch(e){}
  }

  function addSafetyCard(){
    try{
      removeSafetyCardOutsideSettings();
      if(!isSettingsOpen())return;

      const scope=getSettingsScope();
      if(!scope)return;
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
          GitHub visszatöltés előtt automatikus helyi mentés készül.\
          Ezzel visszaállítható a korábbi telefonos állapot.\
        </p>\
      ';

      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn-secondary';
      btn.style.width='100%';
      btn.textContent='Biztonsági mentés visszatöltése';
      btn.onclick=window.kpRestoreLocalSafetyBackup;

      wrap.appendChild(btn);
      target.parentNode.insertBefore(wrap,target.nextSibling);
    }catch(e){console.log(e)}
  }

  function hideCsvExport(){
    try{
      const scope=getSettingsScope() || document;
      [...scope.querySelectorAll('.card')].forEach(card=>{
        const t=(card.textContent||'').toLowerCase();
        if(t.includes('csv export')||t.includes('csv letöltése')){
          card.style.display='none';
        }
      });
    }catch(e){}
  }

  function install(){
    addSafetyCard();
    hideCsvExport();
  }

  setTimeout(install,600);
  setTimeout(install,1800);
  setTimeout(install,3200);
  setInterval(install,2500);

  log('Settings-only biztonsági mentés UI aktív.');
})();