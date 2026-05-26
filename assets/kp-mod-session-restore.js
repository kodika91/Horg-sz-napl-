// kp-mod-session-restore.js — GitHub sessions/*.json visszatöltés
// v1.11 · mergeListFromBackup foto patch; patchCatchPhotosFromBackup
(function(){
'use strict';
if(window.KP_MOD_SESSION_RESTORE_V1)return;
window.KP_MOD_SESSION_RESTORE_V1=true;

const DEF={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
const MAIN_DB_KEY='horgaszpro_v0230';
const arr=x=>Array.isArray(x)?x:[];
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
function stripRemote(obj){if(!obj||typeof obj!=='object')return obj;const out={...obj};if('fishImages' in out)out.fishImages={};return out}
function mergeCatch(localCatch,remoteCatch){const out={...(remoteCatch||{})};for(const key of Object.keys(localCatch||{})){const v=localCatch[key];if(v!==null&&v!==undefined&&v!=='')out[key]=v}return out}
function recalcSession(s){const catches=[...arr(s.catches),...arr(s.fogások),...arr(s.fogasok)];let count=0,weight=0;catches.forEach(c=>{const n=Number(c.count)||1;count+=n;weight+=(Number(c.weight)||0)*n});s.catchCount=count;s.totalWeight=Math.round(weight*100)/100;return s}
function catchKey(c,p){if(c&&c.id)return 'id:'+String(c.id);return 'combo:'+String(c&&c.fish||c&&c.hal||'')+'|'+String(c&&c.time||c&&c.ido||'')+'|'+String(c&&c.weight||c&&c.suly||'')+'|'+String(c&&c.bait||c&&c.csali||'')+'|'+String(c&&c.photoPath||'')+'|'+p}
function crossDedupCatches(s){if(!s||typeof s!=='object')return s;const seen=new Set();const dedup=a=>arr(a).filter(c=>{const k=catchKey(c,'dd');if(seen.has(k))return false;seen.add(k);return true});return{...s,catches:dedup(s.catches),fogások:dedup(s.fogások),fogasok:dedup(s.fogasok)}}
function mergeCatchArray(localArr,remoteArr,prefix){const out=[],map={};arr(localArr).forEach((c,i)=>{const k=catchKey(c,prefix+':local:'+i);map[k]=out.length;out.push(c)});arr(remoteArr).forEach((rc,i)=>{const k=catchKey(rc,prefix+':remote:'+i);if(map[k]==null){map[k]=out.length;out.push(rc)}else{out[map[k]]=mergeCatch(out[map[k]],rc)}});return out}
function cfg(){let c={};try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync_v1')||localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){}return{owner:c.owner||DEF.owner,repo:c.repo||DEF.repo,branch:c.branch||DEF.branch,root:String(c.root||DEF.root).replace(/^\/+|\/+$/g,'')||DEF.root,tok:(c['to'+'ken']||localStorage.getItem('v18_github_'+'token')||'').trim()}}
function apiPath(p){return String(p||'').replace(/^\/+/,'').split('/').map(encodeURIComponent).join('/')}
function rootPath(c,p){p=String(p||'').replace(/^\/+/,'');return p.startsWith(c.root+'/')?p:c.root+'/'+p}
function check(c){const miss=[];if(!c.owner)miss.push('owner');if(!c.repo)miss.push('repo');if(!c.branch)miss.push('branch');if(!c.tok)miss.push('token');if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '))}
async function req(c,url,opt){if(typeof githubRequest==='function')return githubRequest({owner:c.owner,repo:c.repo,branch:c.branch,root:c.root,token:c.tok},url,opt||{});const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...((opt&&opt.headers)||{})};h['Author'+'ization']='Bea'+'rer '+c.tok;const r=await fetch(url,{...(opt||{}),headers:h});const txt=await r.text();let d;try{d=txt?JSON.parse(txt):null}catch(e){d={message:txt}}if(!r.ok)throw new Error((d&&d.message)||('GitHub API hiba: '+r.status));return d}
function dec64(s){s=String(s||'').replace(/\n/g,'');try{return decodeURIComponent(escape(atob(s)))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}catch(_){return ''}}}
async function getJson(c,path){const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(path)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();const data=await req(c,url);let txt;if(data&&data.sha&&(data.encoding==='none'||data.content==='')){const blobUrl='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/git/blobs/'+data.sha;const blob=await req(c,blobUrl);txt=dec64(blob&&blob.content||'')}else{txt=dec64(data&&data.content||'')}await delay(300);if(!txt||!txt.trim())return null;return JSON.parse(txt)}
async function listSessionFiles(c){const p=rootPath(c,'sessions');const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();const data=await req(c,url);return Array.isArray(data)?data.filter(x=>x&&x.type==='file'&&/\.json$/i.test(x.name||'')).map(x=>x.path).sort():[]}
async function loadLatestFullBackup(c){
  if(window._kpBackupCache&&typeof window._kpBackupCache.data==='object'&&Date.now()-window._kpBackupCache.ts<60000){return window._kpBackupCache.data}
  const paths=[];
  try{const man=await getJson(c,rootPath(c,'manifest.json'));if(man){[man.latestBackup,man.latest,man.backup].filter(Boolean).forEach(p=>{paths.push(String(p).replace(/^\/+/,''));paths.push(rootPath(c,p))})}}catch(e){console.warn('[KP session restore] manifest olvasás sikertelen:',e)}
  paths.push(rootPath(c,'latest/full_backup_latest.json'));
  const seen={};
  for(const p of paths){
    if(!p||seen[p])continue;seen[p]=1;
    try{const d=await getJson(c,p);if(d&&typeof d==='object'){const stripped=stripRemote(d);window._kpBackupCache={data:stripped,path:p,ts:Date.now()};return stripped}}catch(e){console.warn('[KP session restore] backup kihagyva:',p,e)}
  }
  return null;
}
function mergeListFromBackup(db,backup,key){
  if(!backup||!Array.isArray(backup[key])||!backup[key].length)return 0;
  const local=Array.isArray(db[key])?db[key]:[];
  const ids=new Map(),names=new Map();
  local.forEach((x,i)=>{if(x&&x.id)ids.set(x.id,i);const n=String((x&&x.name)||'').trim().toLowerCase();if(n)names.set(n,i);});
  const out=[...local];
  let added=0;
  backup[key].forEach(x=>{
    if(!x||typeof x!=='object')return;
    let idx=-1;
    if(x.id&&ids.has(x.id))idx=ids.get(x.id);
    else if(!x.id){const n=String(x.name||'').trim().toLowerCase();if(n&&names.has(n))idx=names.get(n);}
    if(idx===-1){out.push(x);added++;}
    else if(!out[idx].photo&&x.photo){out[idx]={...out[idx],photo:x.photo};}
  });
  db[key]=out;
  return added;
}
function patchCatchPhotosFromBackup(db,backup){
  if(!backup||!Array.isArray(backup.sessions))return;
  const bkMap={};
  backup.sessions.forEach(s=>{if(s&&s.id)bkMap[String(s.id)]=s;});
  arr(db.sessions).forEach(s=>{
    if(!s||!s.id)return;
    const bs=bkMap[String(s.id)];
    if(!bs)return;
    const pm={};
    ['catches','fogások','fogasok'].forEach(k=>arr(bs[k]).forEach(c=>{if(c&&c.id&&c.photo)pm[String(c.id)]=c.photo;}));
    if(!Object.keys(pm).length)return;
    ['catches','fogások','fogasok'].forEach(k=>{s[k]=arr(s[k]).map(c=>{if(!c||c.photo||!c.id)return c;const p=pm[String(c.id)];return p?{...c,photo:p}:c;});});
  });
}
function finalCatchCount(db){return arr(db&&db.sessions).reduce((a,s)=>a+arr(s&&s.catches).length+arr(s&&s.fogások).length+arr(s&&s.fogasok).length,0)}
function localDb(){try{if(typeof getDB==='function')return getDB()}catch(e){console.warn('[KP session restore] getDB hiba:',e)}try{return JSON.parse(localStorage.getItem(MAIN_DB_KEY)||'{}')}catch(e){return {}}}
function saveLocalDb(d){if(typeof saveDB==='function')saveDB(d);else{try{localStorage.setItem(MAIN_DB_KEY,JSON.stringify(d||{}))}catch(e){throw new Error('Tár megtelt, mentés sikertelen. Szabadíts fel helyet!')}}}
function keyOf(o,p){return String((o&&typeof o==='object'&&(o.id||o.uuid||o.createdAt||o.created||(String(o.date||'')+'|'+String(o.time||'')+'|'+String(o.location||'')+'|'+String(o.bait||o.csali||'')+'|'+String(o.fish||o.hal||''))))||p+'_'+Math.random()).slice(0,240)}
function mergeArray(a,b,p){const out=[],seen={};arr(a).forEach(x=>{const k=keyOf(x,p);seen[k]=1;out.push(x)});arr(b).forEach(x=>{const k=keyOf(x,p);if(!seen[k]){seen[k]=1;out.push(x)}});return out}
function mergeNamedLists(localObj,remoteObj,names,prefix){const out={...(localObj||{})};names.forEach(name=>{const l=arr(localObj&&localObj[name]);const r=arr(remoteObj&&remoteObj[name]);if(!(l.length||r.length))return;if(name==='catches'||name==='fogások'||name==='fogasok')out[name]=mergeCatchArray(l,r,prefix+':'+name);else out[name]=mergeArray(l,r,prefix+':'+name)});return out}
function mergeSession(localSession,remoteSession){let out={...(remoteSession||{}),...(localSession||{})};out=mergeNamedLists(out,remoteSession,['catches','fogások','fogasok','events','notes','photos','images','mapPoints'],'session-inner');out=crossDedupCatches(out);return recalcSession(out)}
function mergeSessionsIntoDb(db,remoteSessions){db=db&&typeof db==='object'?db:{};if(!Array.isArray(db.sessions))db.sessions=[];const map={};db.sessions.forEach((s,i)=>{if(s)map[String(s.id||keyOf(s,'session'))]=i});let added=0,merged=0,catches=0;arr(remoteSessions).forEach(rs=>{if(!rs||typeof rs!=='object')return;const rsc=crossDedupCatches(rs);recalcSession(rsc);catches+=arr(rsc.catches).length+arr(rsc.fogások).length+arr(rsc.fogasok).length;const k=String(rsc.id||keyOf(rsc,'session'));if(map[k]==null){map[k]=db.sessions.length;db.sessions.push(rsc);added++}else{db.sessions[map[k]]=mergeSession(db.sessions[map[k]],rsc);merged++}});db.sessions=db.sessions.map(s=>crossDedupCatches(recalcSession(s)));return{db,added,merged,catches}}
async function restoreFromSessions(auto){const c=cfg();check(c);const backup=await loadLatestFullBackup(c).catch(e=>{console.warn('[KP session restore] fő backup nem olvasható:',e);return null});const files=await listSessionFiles(c);if(!files.length)throw new Error('Nem található session JSON a GitHubon: '+rootPath(c,'sessions'));const sessions=[];for(const path of files){try{const data=await getJson(c,path);const raw=data&&data.session?data.session:data;if(raw&&typeof raw==='object')sessions.push(raw)}catch(e){console.warn('[KP session restore] fájl kihagyva:',path,e)}}if(!sessions.length)throw new Error('A session fájlokból nem sikerült horgászatot kiolvasni.');const db=localDb();const baitAdded=mergeListFromBackup(db,backup,'baits');const gearAdded=mergeListFromBackup(db,backup,'gear');const locAdded=mergeListFromBackup(db,backup,'locations');const scoutAdded=mergeListFromBackup(db,backup,'scoutSpots');const res=mergeSessionsIntoDb(db,sessions);if(backup)patchCatchPhotosFromBackup(res.db,backup);res.db._meta={...(res.db._meta||{}),sessionRestoreAt:new Date().toISOString(),sessionRestoreSource:'github-sessions',sessionRestoreFiles:files.length,sessionRestoreBaitsAdded:baitAdded,sessionRestoreGearAdded:gearAdded,sessionRestoreLocAdded:locAdded,sessionRestoreScoutAdded:scoutAdded};const fc=finalCatchCount(res.db);toast('Restore kész: '+fc+' fogás');saveLocalDb(res.db);try{typeof renderSessionsList==='function'&&renderSessionsList();typeof renderActiveSessionHome==='function'&&renderActiveSessionHome();typeof updateHome==='function'&&updateHome();typeof renderStorageOverview==='function'&&renderStorageOverview();typeof renderBaits==='function'&&renderBaits();typeof renderLocations==='function'&&renderLocations();typeof updateDatalists==='function'&&updateDatalists()}catch(e){}const msg='GitHub session restore kész: '+files.length+' fájl, '+res.added+' új, '+res.merged+' összevont, '+res.catches+' fogás, '+baitAdded+' csali, '+gearAdded+' felszerelés, '+locAdded+' hely, '+scoutAdded+' spot.';if(!auto)toast(msg);console.log('[KP session restore]',msg);return res}
window.kpRestoreFromSessions=async function(){try{return await restoreFromSessions(false)}catch(e){toast('Session visszatöltési hiba: '+e.message);throw e}};
function wrapRestore(name){const old=window[name];if(typeof old!=='function'||old.__kpSessionRestoreWrapped)return;const wrapped=async function(){let r;try{r=await old.apply(this,arguments)}catch(e){console.warn('[KP session restore] alap restore hiba:',e)}try{await restoreFromSessions(true);toast('GitHub session fájlok visszatöltve.')}catch(e){toast('Session visszatöltési hiba: '+e.message)}return r};wrapped.__kpSessionRestoreWrapped=true;window[name]=wrapped}
function install(){wrapRestore('kpRestoreLatestGithubBackup');wrapRestore('githubRestoreLatestFromRepo');wrapRestore('githubDownloadLatestFromRepo')}
setTimeout(install,300);setTimeout(install,1500);setInterval(install,3000);
console.log('[KP] session restore modul aktív.');
})();
