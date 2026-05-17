(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD)return;
  window.KP_V27_GITHUB_RESTORE_GUARD=true;
  const V='v27.2';
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
  const oldSync=window.githubSyncNow;
  function hasRealData(db){return !!(db&&(((db.sessions||[]).length)||((db.locations||[]).length)||((db.scoutSpots||[]).length)))}
  if(typeof oldSync==='function')window.githubSyncNow=async function(auto=false){try{if(auto&&!hasRealData(typeof getDB==='function'?getDB():{})){log('Automatikus mentés kihagyva: nincs érdemi helyi adat.');return;}}catch(e){}return oldSync.apply(this,arguments)};
  async function readText(c,path){const data=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(path)+'?ref='+encodeURIComponent(c.branch));const raw=String(data.content||'').replace(/\n/g,'');return raw?decodeURIComponent(escape(atob(raw))):'';}
  async function listBackupPaths(c){try{const arr=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(root(c)+'/backups')+'?ref='+encodeURIComponent(c.branch));return Array.isArray(arr)?arr.filter(x=>x&&x.name&&x.name.endsWith('.json')).map(x=>x.path).sort().reverse():[]}catch(e){return []}}
  async function findValid(c){const r=root(c);const cand=[];try{const man=JSON.parse(await readText(c,r+'/manifest.json')||'{}');if(man.latest)cand.push(man.latest);if(man.backup)cand.push(man.backup)}catch(e){}cand.push(r+'/latest/full_backup_latest.json');(await listBackupPaths(c)).forEach(p=>cand.push(p));const seen={};for(const p of cand){if(!p||seen[p])continue;seen[p]=1;try{const txt=await readText(c,p);if(!txt.trim()){log('Üres backup kihagyva: '+p);continue;}const d=JSON.parse(txt);if(d&&(d.sessions||d.locations||d.scoutSpots||d.baits))return {path:p,data:d};}catch(e){log('Nem használható backup: '+p+' · '+e.message)}}return null;}
  window.githubRestoreLatestFromRepo=async function(){const c=cfg();try{reqCfg(c);githubClearLog&&githubClearLog();log('GitHub visszatöltés indult…');const found=await findValid(c);if(!found){toast('Nem találtam használható JSON mentést. A manifest/képek megvannak, de a JSON üres.');return;}const d=found.data;const ok=confirm('Visszatöltöm a GitHub mentést?\n\nForrás: '+found.path+'\nHorgászatok: '+((d.sessions||[]).length)+'\nHelykereső pontok: '+((d.scoutSpots||[]).length));if(!ok)return;try{localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify({created:new Date().toISOString(),...(getDB?getDB():{})}))}catch(e){}const next={sessions:d.sessions||[],locations:d.locations||[],scoutSpots:d.scoutSpots||[],baits:d.baits,gear:d.gear,setups:d.setups,fishImages:d.fishImages||{},activeSessionId:d.activeSessionId||null,_meta:{app:d.app||'KapásPont',restoredAt:new Date().toISOString(),source:found.path}};Object.keys(next).forEach(k=>next[k]===undefined&&delete next[k]);localStorage.setItem(DB_KEY,JSON.stringify(next));try{if(typeof restoreFishImageAssets==='function')await restoreFishImageAssets(d.fishImageAssets||[])}catch(e){}if(typeof migrateDB==='function')migrateDB();['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}});toast('GitHub mentés visszatöltve.');log('Visszatöltve: '+found.path);}catch(e){toast('GitHub visszatöltési hiba: '+e.message);log('Visszatöltési hiba: '+e.message)}};
  window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
  log('GitHub visszatöltés és üres mentés elleni védelem aktív.');
})();
