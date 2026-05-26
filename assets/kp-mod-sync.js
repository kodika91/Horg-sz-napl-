// kp-mod-sync.js — KapásPont GitHub szinkron és visszatöltés
// v39.4 · delay() rate limiting + getText nagy fájl fix (>1MB: Git blobs API)
(function(){
'use strict';
if(window.KP_MOD_SYNC_V39)return;
window.KP_MOD_SYNC_V39=true;

const DEFAULT={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
let running=false;
const arr=x=>Array.isArray(x)?x:[];
const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}};
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
function status(msg,type){
  let el=document.getElementById('kp-gh-restore-overlay');
  if(!el){
    el=document.createElement('div');
    el.id='kp-gh-restore-overlay';
    el.style.cssText='position:fixed;right:14px;bottom:14px;z-index:999999;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-radius:16px;padding:12px 14px;box-shadow:0 6px 18px rgba(0,0,0,.18);border:1px solid rgba(44,110,122,.22);font-size:13px;font-weight:700;color:#2a2018;max-width:320px';
    document.body.appendChild(el);
  }
  el.style.display='block';
  el.innerHTML=(type==='ok'?'✅ ':type==='err'?'⚠️ ':'☁️ ')+msg;
  if(type==='ok'||type==='err')setTimeout(()=>{if(el)el.style.display='none'},2800);
}
function cfg(){
  let c={};
  try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){}
  return {
    owner:c.owner||DEFAULT.owner,
    repo:'horgasz-naplo-adatok',
    branch:c.branch||DEFAULT.branch,
    root:String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'')||DEFAULT.root,
    token:(c.token||localStorage.getItem('v18_github_token')||'').trim()
  };
}
function check(c){const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
function saveDb(d){localStorage.setItem(DB_KEY,JSON.stringify(d||{}));try{if(typeof migrateDB==='function')migrateDB()}catch(e){}refresh();}
function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
function counts(d){d=d||{};return{sessions:arr(d.sessions).length,locations:arr(d.locations).length,scoutSpots:arr(d.scoutSpots).length,catches:arr(d.sessions).reduce((a,s)=>a+arr(s&&s.catches).length+arr(s&&s.fogások).length+arr(s&&s.fogasok).length,0),baits:arr(d.baits).length,gear:arr(d.gear).length}}
function meaningful(d){const c=counts(d);return c.sessions||c.locations||c.scoutSpots||c.catches||c.baits||c.gear}
function keyOf(o,p){return String((o&&typeof o==='object'&&(o.id||o.uuid||o.createdAt||o.created||(String(o.date||'')+'|'+String(o.time||'')+'|'+String(o.location||'')+'|'+String(o.lat||'')+'|'+String(o.lon||'')+'|'+String(o.bait||o.csali||'')+'|'+String(o.fish||o.hal||''))))||p+'_'+Math.random()).slice(0,240)}
function mergeArray(a,b,p){const out=[],seen={};arr(a).forEach(x=>{const k=keyOf(x,p);seen[k]=1;out.push(x)});arr(b).forEach(x=>{const k=keyOf(x,p);if(!seen[k]){seen[k]=1;out.push(x)}});return out}
function sessionKey(s){return keyOf(s,'session')}
function mergeNamedLists(localObj,remoteObj,names,prefix){
  const out={...(localObj||{})};
  names.forEach(function(name){
    const l=arr(localObj&&localObj[name]);
    const r=arr(remoteObj&&remoteObj[name]);
    if(l.length||r.length)out[name]=mergeArray(l,r,prefix+':'+name);
  });
  return out;
}
function mergeSession(localSession,remoteSession){
  let out={...(remoteSession||{}),...(localSession||{})};
  out=mergeNamedLists(out,remoteSession,['catches','fogások','fogasok','events','notes','photos','images'],'session-inner');
  const lu=String(localSession&&localSession.updatedAt||localSession&&localSession.modifiedAt||'');
  const ru=String(remoteSession&&remoteSession.updatedAt||remoteSession&&remoteSession.modifiedAt||'');
  if(ru>lu)out={...out,updatedAt:remoteSession.updatedAt||out.updatedAt,modifiedAt:remoteSession.modifiedAt||out.modifiedAt};
  return out;
}
function mergeSessions(localSessions,remoteSessions){
  const out=[],map={};
  arr(localSessions).forEach(s=>{const k=sessionKey(s);map[k]=out.length;out.push(s)});
  arr(remoteSessions).forEach(rs=>{
    const k=sessionKey(rs);
    if(map[k]==null){map[k]=out.length;out.push(rs)}
    else out[map[k]]=mergeSession(out[map[k]],rs);
  });
  return out;
}
function mergeDB(local,remote,source){local=local||{};remote=remote||{};return{...local,sessions:mergeSessions(local.sessions,remote.sessions),locations:mergeArray(local.locations,remote.locations,'location'),scoutSpots:mergeArray(local.scoutSpots,remote.scoutSpots,'scout'),baits:mergeArray(local.baits,remote.baits,'bait'),gear:mergeArray(local.gear,remote.gear,'gear'),fishImages:{...(remote.fishImages||{}),...(local.fishImages||{})},activeSessionId:local.activeSessionId||remote.activeSessionId||null,_meta:{app:'KapásPont',restoreMode:'deep-merge',restoredAt:new Date().toISOString(),source:source||''}}}
function enc(s){s=String(s||'');try{return btoa(unescape(encodeURIComponent(s)))}catch(e){const b=new TextEncoder().encode(s);let bin='';for(let i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return btoa(bin)}}
function dec(s){s=String(s||'').replace(/\n/g,'');try{return decodeURIComponent(escape(atob(s)))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}catch(_){return ''}}}
function apiPath(p){return String(p||'').replace(/^\/+/,'').split('/').map(encodeURIComponent).join('/')}
function fpath(c,p){p=String(p||'').replace(/^\/+/,'');return p.startsWith(c.root+'/')?p:c.root+'/'+p}
async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}};if(!res.ok)throw new Error((data&&data.message)||('GitHub API hiba: '+res.status));return data}
async function getSha(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());return d&&d.sha}catch(e){return null}}
async function getText(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());if(d&&d.sha&&(d.encoding==='none'||d.content==='')){const blob=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/git/blobs/'+d.sha);await delay(300);return dec(blob&&blob.content||'')}await delay(300);return dec(d.content||'')}catch(e){return null}}
async function getJson(c,p){const t=await getText(c,p);if(!t||!t.trim())return null;try{return JSON.parse(t)}catch(e){return null}}
async function putJson(c,p,obj,msg,createOnly){const json=JSON.stringify(obj,null,2)+'\n';if(!json||json.length<100)throw new Error('Túl kicsi JSON mentés, nem írok üres backupot: '+p);const sha=createOnly?null:await getSha(c,p);const body={message:msg||'KapásPont mentés',content:enc(json),branch:c.branch};if(sha)body.sha=sha;return gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
async function listBackups(c){try{const a=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(fpath(c,'backups'))+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());return Array.isArray(a)?a.filter(x=>x&&x.name&&x.name.endsWith('.json')).map(x=>x.path).sort().reverse():[]}catch(e){return []}}
async function findLatestBackup(c){status('GitHub mentés keresése…');const cand=[],seen={};const man=await getJson(c,fpath(c,'manifest.json'));if(man)[man.latestBackup,man.backup,man.latest].filter(Boolean).forEach(p=>{cand.push(String(p).replace(/^\/+/,''));cand.push(fpath(c,p))});cand.push(fpath(c,'latest/full_backup_latest.json'));for(const p of await listBackups(c))cand.push(p);for(const p of cand){if(!p||seen[p])continue;seen[p]=1;const d=await getJson(c,p);if(d&&meaningful(d))return{path:p,data:d}}return null}
function safety(){try{const local=db();const snap={created:new Date().toISOString(),backupType:'local-before-github-restore',...local};localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify(snap));localStorage.setItem(DB_KEY+'_safety_restore_latest',JSON.stringify(snap))}catch(e){}}
function stamp(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+'-'+p(d.getMinutes())+'-'+p(d.getSeconds())}
window.githubSyncNow=async function(){if(running){toast('Már fut egy GitHub mentés.');return}running=true;status('GitHub mentés készítése…');try{const c=cfg();check(c);const local=db();if(!meaningful(local))throw new Error('Nincs menthető naplóadat.');const backup={schemaVersion:5,backupType:'github-sync-full',app:'KapásPont',appVersion:'v39.1',exported:new Date().toISOString(),...local};const backupJson=JSON.stringify(backup,null,2);if(!backupJson||backupJson.length<100)throw new Error('Túl kicsi backup JSON, mentés megszakítva.');const bp=fpath(c,'backups/full_backup_'+stamp()+'.json');await putJson(c,bp,backup,'KapásPont új backup',false);await putJson(c,fpath(c,'latest/full_backup_latest.json'),backup,'KapásPont latest backup frissítés',false);await putJson(c,fpath(c,'manifest.json'),{schemaVersion:3,app:'KapásPont',appVersion:'v39.1',updated:new Date().toISOString(),backup:bp,latestBackup:fpath(c,'latest/full_backup_latest.json'),latest:fpath(c,'latest/full_backup_latest.json'),counts:counts(backup)},'KapásPont manifest frissítés',false);status('GitHub mentés kész.','ok');toast('GitHub mentés kész.')}catch(e){status('Mentési hiba: '+e.message,'err');toast('Mentési hiba: '+e.message)}finally{running=false}}
window.githubRestoreLatestFromRepo=async function(){try{const c=cfg();check(c);const found=await findLatestBackup(c);if(!found){status('Nem találtam használható mentést.','err');return}const local=db(),lc=counts(local),rc=counts(found.data);if(!confirm('GitHub backup összevonása?\n\nHelyi: '+lc.sessions+' túra, '+lc.catches+' fogás, '+lc.scoutSpots+' hely\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás, '+rc.scoutSpots+' hely\n\nA művelet mélyen összevon, nem felülír.'))return;safety();status('Adatok összevonása…');saveDb(mergeDB(local,found.data,found.path));status('Összevonás kész.','ok');toast('GitHub backup összevonva.')}catch(e){status('Visszatöltési hiba: '+e.message,'err');toast('GitHub visszatöltési hiba: '+e.message)}}
window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
window.kpRestoreLatestGithubBackup=async function(auto){try{const c=cfg();check(c);const found=await findLatestBackup(c);if(!found)throw new Error('Nem találtam használható GitHub backupot.');if(!auto){const lc=counts(db()),rc=counts(found.data);if(!confirm('Visszatöltsem és összevonjam a legutóbbi GitHub mentést?\n\nHelyi: '+lc.sessions+' túra, '+lc.catches+' fogás, '+lc.scoutSpots+' hely\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás, '+rc.scoutSpots+' hely'))return}safety();saveDb(mergeDB(db(),found.data,found.path));status('GitHub mentés visszatöltve.','ok')}catch(e){if(!auto){status('Visszatöltési hiba: '+e.message,'err');toast('GitHub visszatöltési hiba: '+e.message)}}}
window.kpRestoreLocalSafetyBackup=function(){try{const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');if(!raw){toast('Nincs helyi biztonsági mentés.');return}const d=JSON.parse(raw);if(!confirm('Visszatöltsem a helyi biztonsági mentést?'))return;saveDb(d);status('Helyi biztonsági mentés visszatöltve.','ok')}catch(e){status('Helyi visszatöltési hiba: '+e.message,'err')}}
window.kpImportFromFile=function(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=function(){const file=input.files[0];if(!file)return;const r=new FileReader();r.onload=function(e){try{const d=JSON.parse(e.target.result);safety();saveDb(mergeDB(db(),d,'file-import'));status('Fájlból visszatöltés kész.','ok')}catch(err){status('Import hiba: '+err.message,'err')}};r.readAsText(file)};document.body.appendChild(input);input.click();setTimeout(()=>input.remove(),5000)};
function install(){document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').toLowerCase();if(t.includes('mentés githubra most')){b.disabled=false;b.onclick=e=>{e.preventDefault();e.stopPropagation();window.githubSyncNow()}}})}
setInterval(install,2500);setTimeout(install,500);
})();
