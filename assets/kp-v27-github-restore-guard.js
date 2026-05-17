(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD)return;
  window.KP_V27_GITHUB_RESTORE_GUARD=true;
  const V='v27.3';
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
  window.githubRestoreLatestFromRepo=async function(){const c=cfg();try{reqCfg(c);githubClearLog&&githubClearLog();log('GitHub visszatöltés indult. Legfrissebb használható backup keresése…');const found=await findValid(c);if(!found){toast('Nem találtam használható JSON mentést.');return;}const d=found.data;const ok=confirm('Visszatöltöm ezt a GitHub backupot?\n\nForrás: '+found.path+'\nHorgászatok: '+((d.sessions||[]).length)+'\nFogások: '+((d.sessions||[]).reduce((a,s)=>a+(s.catches||[]).length,0))+'\nHelykereső pontok: '+((d.scoutSpots||[]).length));if(!ok)return;try{localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify({created:new Date().toISOString(),...(getDB?getDB():{})}))}catch(e){}const next={sessions:d.sessions||[],locations:d.locations||[],scoutSpots:d.scoutSpots||[],baits:d.baits,gear:d.gear,setups:d.setups,fishImages:d.fishImages||{},activeSessionId:d.activeSessionId||null,_meta:{app:d.app||'KapásPont',restoredAt:new Date().toISOString(),source:found.path}};Object.keys(next).forEach(k=>next[k]===undefined&&delete next[k]);localStorage.setItem(DB_KEY,JSON.stringify(next));try{if(typeof restoreFishImageAssets==='function')await restoreFishImageAssets(d.fishImageAssets||[])}catch(e){}if(typeof migrateDB==='function')migrateDB();['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}});toast('GitHub backup visszatöltve.');log('Visszatöltve: '+found.path);}catch(e){toast('GitHub visszatöltési hiba: '+e.message);log('Visszatöltési hiba: '+e.message)}};
  window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
  log('Append-only backup visszatöltés aktív.');
})();