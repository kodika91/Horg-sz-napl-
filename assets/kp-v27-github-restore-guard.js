(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD)return;
  window.KP_V27_GITHUB_RESTORE_GUARD=true;
  const V='v27.4-merge-restore';
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  function cfg(){return typeof githubLoadConfig==='function'?githubLoadConfig():{};}
  function reqCfg(c){if(typeof githubRequireConfig==='function')return githubRequireConfig(c);}
  function encPath(p){return String(p||'').split('/').map(encodeURIComponent).join('/');}
  function root(c){return String(c.root||'kapaspont').replace(/^\/+|\/+$/g,'')||'kapaspont';}
  function b64Utf8(str){str=String(str||'');try{return btoa(unescape(encodeURIComponent(str)))}catch(e){const bytes=new TextEncoder().encode(str);let bin='';for(let i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);return btoa(bin)}}
  window.githubToBase64Utf8=b64Utf8;
  const oldPut=window.githubPutFile;
  if(typeof oldPut==='function')window.githubPutFile=async function(c,path,content,msg){if(String(path||'').endsWith('.json')&&(!content||String(content).length<20))throw new Error('Biztonsági védelem: üres JSON mentést nem írok fel GitHubra.');return oldPut.apply(this,arguments)};
  async function readText(c,path){const data=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(path)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const raw=String(data.content||'').replace(/\n/g,'');if(!raw)return '';try{return decodeURIComponent(escape(atob(raw)))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(raw),ch=>ch.charCodeAt(0)))}catch(_){return atob(raw)}}}
  async function listBackupPaths(c){try{const arr=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(root(c)+'/backups')+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());return Array.isArray(arr)?arr.filter(x=>x&&x.name&&x.name.endsWith('.json')).map(x=>x.path).sort().reverse():[]}catch(e){return []}}
  function validData(d){return d&&typeof d==='object'&&(Array.isArray(d.sessions)||Array.isArray(d.locations)||Array.isArray(d.scoutSpots)||Array.isArray(d.baits))&&(((d.sessions||[]).length)||((d.locations||[]).length)||((d.scoutSpots||[]).length)||((d.baits||[]).length));}
  async function findValid(c){
    const r=root(c);const cand=[];const seen={};
    try{const man=JSON.parse(await readText(c,r+'/manifest.json')||'{}');if(man.backup)cand.push(man.backup);if(man.latestBackup)cand.push(man.latestBackup);if(man.latest)cand.push(man.latest)}catch(e){}
    (await listBackupPaths(c)).forEach(p=>cand.push(p));
    cand.push(r+'/latest/full_backup_latest.json');
    for(const p of cand){if(!p||seen[p])continue;seen[p]=1;try{const txt=await readText(c,p);if(!txt.trim()){log('Üres backup kihagyva: '+p);continue;}const d=JSON.parse(txt);if(validData(d))return {path:p,data:d};log('Tartalom nélküli backup kihagyva: '+p)}catch(e){log('Nem használható backup: '+p+' · '+e.message)}}
    return null;
  }
  function arr(x){return Array.isArray(x)?x:[]}
  function keyOf(o,prefix){if(!o||typeof o!=='object')return prefix+'_'+Math.random();return String(o.id||o.uuid||o.createdAt||o.date+'|'+o.location+'|'+o.lat+'|'+o.lon||JSON.stringify(o)).slice(0,220)}
  function mergeArray(local,remote,prefix){const out=[];const seen={};arr(local).forEach(x=>{const k=keyOf(x,prefix);seen[k]=1;out.push(x)});arr(remote).forEach(x=>{const k=keyOf(x,prefix);if(!seen[k]){seen[k]=1;out.push(x)}});return out}
  function mergeNamed(local,remote){return arr(local).length?mergeArray(local,remote,'named'):arr(remote)}
  function countData(d){return {sessions:arr(d&&d.sessions).length,locations:arr(d&&d.locations).length,scoutSpots:arr(d&&d.scoutSpots).length,catches:arr(d&&d.sessions).reduce((a,s)=>a+arr(s.catches).length,0)}}
  function mergeDB(local,d,source){
    const next={
      ...local,
      sessions:mergeArray(local.sessions,d.sessions,'session'),
      locations:mergeArray(local.locations,d.locations,'location'),
      scoutSpots:mergeArray(local.scoutSpots,d.scoutSpots,'scout'),
      baits:mergeNamed(local.baits,d.baits),
      gear:mergeNamed(local.gear,d.gear),
      setups:mergeNamed(local.setups,d.setups),
      fishImages:{...(d.fishImages||{}),...(local.fishImages||{})},
      activeSessionId:local.activeSessionId||d.activeSessionId||null,
      _meta:{app:d.app||'KapásPont',restoredAt:new Date().toISOString(),restoreMode:'merge',source:source}
    };
    Object.keys(next).forEach(k=>next[k]===undefined&&delete next[k]);
    return next;
  }
  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
  function saveBeforeRestore(){try{const local=getDB?getDB():{};const snap={created:new Date().toISOString(),backupType:'local-before-github-restore',...local};localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify(snap));localStorage.setItem(DB_KEY+'_safety_restore_latest',JSON.stringify(snap));return snap}catch(e){return null}}
  window.kpRestoreLocalSafetyBackup=function(){try{const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');if(!raw){toast('Nincs helyi biztonsági mentés.');return;}const d=JSON.parse(raw);const c=countData(d);const ok=confirm('Visszatöltsem a helyi biztonsági mentést?\n\nLétrehozva: '+(d.created||'ismeretlen')+'\nHorgászatok: '+c.sessions+'\nFogások: '+c.catches+'\nHelykereső pontok: '+c.scoutSpots);if(!ok)return;localStorage.setItem(DB_KEY,JSON.stringify(d));if(typeof migrateDB==='function')migrateDB();refresh();toast('Helyi biztonsági mentés visszatöltve.');log('Helyi biztonsági mentés visszatöltve.')}catch(e){toast('Biztonsági mentés visszatöltési hiba: '+e.message);log('Biztonsági mentés visszatöltési hiba: '+e.message)}};
  window.githubRestoreLatestFromRepo=async function(){const c=cfg();try{reqCfg(c);githubClearLog&&githubClearLog();log('GitHub visszatöltés indult. Legfrissebb használható backup keresése…');const found=await findValid(c);if(!found){toast('Nem találtam használható JSON mentést.');return;}const d=found.data;const local=getDB?getDB():{};const rc=countData(d);const lc=countData(local);const ok=confirm('GitHub backup összevonása a telefon adataival?\n\nA helyi adatok nem törlődnek, hanem össze lesznek vonva.\n\nTelefon most: '+lc.sessions+' túra, '+lc.catches+' fogás, '+lc.scoutSpots+' helykereső pont\nGitHub backup: '+rc.sessions+' túra, '+rc.catches+' fogás, '+rc.scoutSpots+' helykereső pont\n\nForrás: '+found.path);if(!ok)return;saveBeforeRestore();const next=mergeDB(local,d,found.path);localStorage.setItem(DB_KEY,JSON.stringify(next));try{if(typeof restoreFishImageAssets==='function')await restoreFishImageAssets(d.fishImageAssets||[])}catch(e){}if(typeof migrateDB==='function')migrateDB();refresh();const nc=countData(next);toast('GitHub backup összevonva.');log('Összevonva: '+found.path+' · Eredmény: '+nc.sessions+' túra, '+nc.catches+' fogás, '+nc.scoutSpots+' helykereső pont.')}catch(e){toast('GitHub visszatöltési hiba: '+e.message);log('Visszatöltési hiba: '+e.message)}};
  window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
  function addSafetyButton(){try{const settings=document.getElementById('page-settings')||document.getElementById('settings')||document.body;if(!settings||document.getElementById('kp-safety-restore-btn'))return;const cards=settings.querySelectorAll('.card,.settings-card,.panel,section');const host=cards&&cards.length?cards[cards.length-1]:settings;const box=document.createElement('div');box.className='card';box.style.marginTop='12px';box.innerHTML='<h3 style="margin-top:0">Biztonsági mentés</h3><p class="muted" style="font-size:12px;line-height:1.4">GitHub visszatöltés előtt automatikus helyi mentés készül. Ezzel visszaállítható az előző telefonos állapot.</p>';const btn=document.createElement('button');btn.id='kp-safety-restore-btn';btn.type='button';btn.className='btn-secondary';btn.textContent='Biztonsági mentés visszatöltése';btn.onclick=window.kpRestoreLocalSafetyBackup;box.appendChild(btn);host.appendChild(box);}catch(e){}}
  function hideCsvButtons(){try{document.querySelectorAll('button,a').forEach(el=>{const t=(el.textContent||'').toLowerCase();if(t.includes('csv'))el.style.display='none';});}catch(e){}}
  function installUi(){addSafetyButton();hideCsvButtons();}
  setInterval(installUi,1500);setTimeout(installUi,600);setTimeout(installUi,1800);
  log('Append-only backup visszatöltés aktív, összevonós móddal.');
})();