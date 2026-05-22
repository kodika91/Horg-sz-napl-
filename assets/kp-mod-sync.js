// kp-mod-sync.js — GitHub szinkronizáció, backup, visszatöltés
// Tartalom: v27-github-restore-guard · v29-stable-github-sync
//           v33-safety-data-repo · v36-merge-restore-settings

(function(){
  if(window.KP_V27_GITHUB_RESTORE_GUARD_V2)return;
  window.KP_V27_GITHUB_RESTORE_GUARD_V2=true;
  const V='v27.8-restore-root-fix';
  const DEFAULT={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const dec=s=>{try{return decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(String(s||'').replace(/\n/g,'')),c=>c.charCodeAt(0)))}catch(_){return ''}}};
  let autoRestoreChecked=false;
  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})};
  function rawCfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function cfg(){const c=rawCfg()||{};return {owner:c.owner||DEFAULT.owner,repo:c.repo||DEFAULT.repo,branch:c.branch||DEFAULT.branch,root:String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'')||DEFAULT.root,token:(c.token||localStorage.getItem('v18_github_token')||'').trim()}}
  function apiPath(p){return String(p).replace(/^\/+/,'').split('/').map(encodeURIComponent).join('/')}
  function withRoot(c,p){p=String(p||'').replace(/^\/+/,'');const r=String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'');return p.startsWith(r+'/')?p:(r+'/'+p)}
  function check(c){const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
  async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}return data}
  async function getJsonOrNull(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const txt=dec(d.content||'');return txt?JSON.parse(txt):null}catch(e){return null}}
  function countData(d){return {sessions:(d&&d.sessions||[]).length,locations:(d&&d.locations||[]).length,scoutSpots:(d&&d.scoutSpots||[]).length,catches:(d&&d.sessions||[]).reduce((a,s)=>a+(s.catches||[]).length,0)}}
  function hasMeaningful(d){const c=countData(d||{});return c.sessions>0||c.locations>0||c.scoutSpots>0||c.catches>0}
  function currentDb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
  async function findLatestBackup(c){
    const candidates=[];
    try{const man=await getJsonOrNull(c,withRoot(c,'manifest.json'));if(man){[man.latestBackup,man.backup].filter(Boolean).forEach(p=>{candidates.push(String(p).replace(/^\/+/,''));candidates.push(withRoot(c,p));});}}
    catch(e){}
    candidates.push(withRoot(c,'latest/full_backup_latest.json'));
    candidates.push(withRoot(c,'backups/full_backup_latest.json'));
    const seen=[...new Set(candidates.filter(Boolean))];
    for(const p of seen){const d=await getJsonOrNull(c,p);if(d&&hasMeaningful(d))return {data:d,path:p};}
    return {data:null,path:null};
  }
  window.kpRestoreLocalSafetyBackup=function(){try{const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');if(!raw){toast('Nincs helyi biztonsági mentés ezen a telefonon.');return;}const d=JSON.parse(raw);if(!confirm('Visszatöltsem a telefonon tárolt legutóbbi helyi biztonsági mentést?'))return;localStorage.setItem(DB_KEY,JSON.stringify(d));try{if(typeof migrateDB==='function')migrateDB();}catch(e){}refresh();toast('Telefonos biztonsági mentés visszatöltve.');}catch(e){toast('Visszatöltési hiba: '+e.message)}};
  window.kpRestoreLatestGithubBackup=async function(auto){try{const c=cfg();check(c);const found=await findLatestBackup(c);if(!found.data||!hasMeaningful(found.data))throw new Error('Nem találtam használható GitHub backupot.');const rc=countData(found.data),lc=countData(currentDb());if(!auto){if(!confirm('Visszatöltsem a legutóbbi GitHub mentést?\n\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\n\nForrás: '+found.path))return;}try{localStorage.setItem(DB_KEY+'_before_github_restore',localStorage.getItem(DB_KEY)||'{}')}catch(e){}localStorage.setItem(DB_KEY,JSON.stringify(found.data));try{if(typeof migrateDB==='function')migrateDB();}catch(e){}refresh();toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');}catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message)}};
  function addSafetyCard(){try{const scope=document.querySelector('#page-settings');if(!scope)return;if(scope.querySelector('#kp-safety-restore-card'))return;const cards=[...scope.querySelectorAll('.card')];if(!cards.length)return;const target=cards.find(c=>((c.textContent||'').toLowerCase().includes('github')))||cards[cards.length-1];if(!target||!target.parentNode)return;const wrap=document.createElement('div');wrap.className='card';wrap.id='kp-safety-restore-card';wrap.style.marginTop='14px';wrap.innerHTML='<h3 style="margin-top:0">Biztonsági mentés</h3><p class="muted" style="font-size:12px;line-height:1.5">GitHub visszatöltés az adatrepo kapaspont/ mappájából.</p>';const ghBtn=document.createElement('button');ghBtn.type='button';ghBtn.className='btn-primary';ghBtn.style.cssText='width:100%;margin-top:8px';ghBtn.textContent='Legutóbbi GitHub mentés visszatöltése';ghBtn.onclick=()=>window.kpRestoreLatestGithubBackup(false);const localBtn=document.createElement('button');localBtn.type='button';localBtn.className='btn-secondary';localBtn.style.cssText='width:100%;margin-top:8px';localBtn.textContent='Telefonos biztonsági mentés visszatöltése';localBtn.onclick=window.kpRestoreLocalSafetyBackup;wrap.appendChild(ghBtn);wrap.appendChild(localBtn);target.parentNode.insertBefore(wrap,target.nextSibling);}catch(e){}}
  function maybeAutoRestore(){if(autoRestoreChecked)return;autoRestoreChecked=true;setTimeout(()=>{try{if(hasMeaningful(currentDb()))return;const c=cfg();check(c);window.kpRestoreLatestGithubBackup(true);}catch(e){}},1800);}
  function install(){addSafetyCard();maybeAutoRestore();}
  setTimeout(install,600);setTimeout(install,1800);setTimeout(install,3200);setInterval(install,4000);
  try{new MutationObserver(()=>setTimeout(install,80)).observe(document.body,{childList:true,subtree:true});}catch(e){}
})();

(function(){
  if(window.KP_V29_STABLE_GITHUB_SYNC)return;
  window.KP_V29_STABLE_GITHUB_SYNC=true;
  const V='v29.5';
  let running=false;
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const pad=n=>String(n).padStart(2,'0');
  const stamp=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+'-'+pad(d.getMinutes())+'-'+pad(d.getSeconds())};
  const slug=s=>String(s||'adat').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'adat';
  const enc=s=>{s=String(s||'');try{return btoa(unescape(encodeURIComponent(s)))}catch(e){const b=new TextEncoder().encode(s);let bin='';for(let i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return btoa(bin)}};
  const dec=s=>{try{return decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(String(s||'').replace(/\n/g,'')),c=>c.charCodeAt(0)))}catch(_){return ''}}};
  const ib64=d=>(String(d||'').match(/^data:[^;]+;base64,(.+)$/)||[])[1]||'';
  const ext=d=>{const m=String(d||'').match(/^data:([^;]+);base64,/);return m?((m[1].split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg'):'jpg'};
  function cfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function check(c){if(typeof githubRequireConfig==='function')return githubRequireConfig(c);const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
  function root(c){return String(c.root||'kapaspont').replace(/^\/+|\/+$/g,'')||'kapaspont'}
  function fpath(c,p){return root(c)+'/'+String(p||'').replace(/^\/+/,'')}
  function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
  async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}return data}
  async function getJson(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const txt=dec(d.content||'');return txt?JSON.parse(txt):null}catch(e){return null}}
  async function put(c,p,b64,msg,mode){if(!b64||String(b64).length<8)throw new Error('Üres fájlt nem mentek: '+p);const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);if(mode==='create')return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg||'KapásPont új fájl',content:b64,branch:c.branch})});let sha=null;try{const old=await gh(c,url+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());sha=old&&old.sha}catch(e){if(!String(e.message||'').includes('Not Found'))throw e}const body={message:msg||'KapásPont fájl frissítés',content:b64,branch:c.branch};if(sha)body.sha=sha;return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  function thumb(dataUrl){return new Promise(resolve=>{try{const img=new Image();img.onload=()=>{try{const max=180;let w=img.width,h=img.height;const r=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*r));h=Math.max(1,Math.round(h*r));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.38))}catch(e){resolve('')}};img.onerror=()=>resolve('');img.src=dataUrl}catch(e){resolve('')}})}
  async function sanitize(db,c){const out=JSON.parse(JSON.stringify(db||{}));const imgs=[];async function add(dataUrl,rel,label){if(!String(dataUrl||'').startsWith('data:image/'))return null;const p=fpath(c,rel+'.'+ext(dataUrl));imgs.push({path:p,base64:ib64(dataUrl),label});return {storage:'github',path:p,relativePath:rel+'.'+ext(dataUrl),thumb:await thumb(dataUrl),bytes:Math.round(ib64(dataUrl).length*0.75),createdAt:new Date().toISOString()}}
  for(const s of (out.sessions||[])){const base='images/sessions/'+(s.date||new Date().toISOString().slice(0,10))+'/'+slug(s.id||s.location||Date.now());let i=0;for(const ca of (s.catches||[])){i++;if(ca.photo&&String(ca.photo).startsWith('data:image/')){const r=await add(ca.photo,base+'_catch_'+pad(i),'fogás kép');if(r){ca.photo=r.thumb;ca.photoRef=r;ca.photoPath=r.path;ca.photoStorage='github'}}}}
  out.githubImageFiles=imgs.map(x=>({path:x.path,label:x.label}));return {db:out,imgs};}
  function countData(d){return {sessions:(d.sessions||[]).length,locations:(d.locations||[]).length,scoutSpots:(d.scoutSpots||[]).length,catches:(d.sessions||[]).reduce((a,s)=>a+(s.catches||[]).length,0)}}
  function hasMeaningful(d){const c=countData(d||{});return c.sessions>0||c.locations>0||c.scoutSpots>0||c.catches>0}
  async function guard(c,local){const lc=countData(local||{});if(!hasMeaningful(local))throw new Error('Biztonsági védelem: nincs helyi túra/hely/fogás adat.');const man=await getJson(c,fpath(c,'manifest.json'));if(man&&man.backup){const remote=await getJson(c,man.backup);if(remote&&hasMeaningful(remote)){const rc=countData(remote);if(lc.sessions<rc.sessions||lc.catches<rc.catches){if(!confirm('VÉDELEM: a GitHub backupban több adat van mint a telefónon.\n\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás\n\nKészítsü új mentésfájlt?'))throw new Error('Mentés megszakítva.');}}}
  async function sync(){if(running){toast('Már fut egy GitHub mentés.');return;}running=true;try{const c=cfg();check(c);if(typeof githubClearLog==='function')githubClearLog();const local=typeof getDB==='function'?getDB():{};await guard(c,local);const pack=await sanitize(local,c);for(const im of pack.imgs){await put(c,im.path,im.base64,'KapásPont kép mentés')}const ts=stamp();const backupPath=fpath(c,'backups/full_backup_'+ts+'.json');const backup={schemaVersion:5,backupType:'github-sync-full',app:'KapásPont',appVersion:V,exported:new Date().toISOString(),...pack.db};await put(c,backupPath,enc(JSON.stringify(backup,null,2)),'KapásPont új backup','create');const man={schemaVersion:3,mode:'append-only',created:new Date().toISOString(),app:'KapásPont',sessionCount:(pack.db.sessions||[]).length,backup:backupPath,latestBackup:backupPath};await put(c,fpath(c,'manifest.json'),enc(JSON.stringify(man,null,2)),'KapásPont manifest frissítés');toast('Új GitHub backup kész: '+ts);if(typeof renderStorageOverview==='function')renderStorageOverview();}catch(e){toast('Mentési hiba: '+e.message);}finally{running=false;}}
  function activateButtons(){document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').toLowerCase();if(t.includes('mentés githubra most')){b.disabled=false;b.onclick=function(ev){ev.preventDefault();ev.stopPropagation();sync();};}})};
  function install(){if(typeof getDB!=='function'){setTimeout(install,250);return}window.githubSyncNow=function(){return sync()};window.githubScheduleAutoBackup=function(){};activateButtons();setInterval(activateButtons,1000);}
  install();
})();

(function(){
  if(window.KP_V33_SAFETY_DATA_REPO)return;
  window.KP_V33_SAFETY_DATA_REPO=true;
  var DATA_REPO='horgasz-naplo-adatok';
  var SAFETY_DIR='kapaspont/biztonsagi-mentesek';
  var toast=function(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  function pad(n){return String(n).padStart(2,'0')}
  function stamp(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+'-'+pad(d.getMinutes())+'-'+pad(d.getSeconds())}
  function enc(s){s=String(s||'');try{return btoa(unescape(encodeURIComponent(s)))}catch(e){var b=new TextEncoder().encode(s),bin='';for(var i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return btoa(bin)}}
  function dec(s){try{return decodeURIComponent(escape(atob(String(s||'').replace(/\n/g,''))))}catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(String(s||'').replace(/\n/g,'')),function(c){return c.charCodeAt(0)}))}catch(_){return ''}}}
  function cfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function dc(){var c=cfg()||{};return {owner:c.owner||'kodika91',repo:DATA_REPO,branch:c.branch||'main',key:c.token||''}}
  function check(c){if(!c.owner||!c.repo||!c.branch||!c.key)throw new Error('Hiányzó GitHub beállítás vagy token.')}
  function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
  async function gh(c,url,opt){var h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};h[['Author','ization'].join('')]=['Bea','rer '].join('')+c.key;if(opt&&opt.headers)Object.assign(h,opt.headers);var res=await fetch(url,Object.assign({},opt||{},{headers:h}));var txt=await res.text();var data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok)throw new Error((data&&data.message)||('GitHub API hiba: '+res.status));return data}
  async function getJson(c,p){var d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());var txt=dec(d.content||'');return txt?JSON.parse(txt):null}
  async function putJson(c,p,obj,msg,createOnly){var url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);var sha=null;if(!createOnly){try{var old=await gh(c,url+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());sha=old&&old.sha}catch(e){if(!String(e.message||'').includes('Not Found'))throw e}}var body={message:msg,content:enc(JSON.stringify(obj,null,2)),branch:c.branch};if(sha)body.sha=sha;return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
  function counts(d){return {sessions:(d.sessions||[]).length,locations:(d.locations||[]).length,scoutSpots:(d.scoutSpots||[]).length,catches:(d.sessions||[]).reduce(function(a,s){return a+(s.catches||[]).length},0)}}
  function meaningful(d){var c=counts(d||{});return c.sessions||c.locations||c.scoutSpots||c.catches}
  function refresh(){['updateHome','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(function(f){try{window[f]&&window[f]()}catch(e){}})}
  window.kpCreateGithubSafetyBackup=async function(){try{var c=dc();check(c);var d=db();if(!meaningful(d))throw new Error('Nincs menthető naplóadat.');var ts=stamp();var path=SAFETY_DIR+'/safety_backup_'+ts+'.json';var pack=Object.assign({schemaVersion:7,backupType:'kapaspont-safety-backup',app:'KapásPont',exported:new Date().toISOString(),counts:counts(d)},d);await putJson(c,path,pack,'KapásPont biztonsági mentés '+ts,true);await putJson(c,SAFETY_DIR+'/manifest.json',{schemaVersion:1,app:'KapásPont',updated:new Date().toISOString(),latestBackup:path,backup:path,counts:counts(d)},'KapásPont biztonsági manifest',false);toast('GitHub biztonsági mentés kész.');}catch(e){toast('Biztonsági mentési hiba: '+e.message)}};
  window.kpRestoreGithubSafetyBackup=async function(auto){try{var c=dc();check(c);var man=await getJson(c,SAFETY_DIR+'/manifest.json');var p=man&&(man.latestBackup||man.backup);if(!p)throw new Error('Nincs mentési manifest.');var r=await getJson(c,p);if(!meaningful(r))throw new Error('A GitHub mentés üres.');if(!auto&&!confirm('Visszatöltsem a GitHub biztonsági mentést?\n\nForrás: '+c.owner+'/'+c.repo+'/'+p))return;try{localStorage.setItem(DB_KEY+'_before_github_restore',localStorage.getItem(DB_KEY)||'{}')}catch(e){}localStorage.setItem(DB_KEY,JSON.stringify(r));try{if(typeof migrateDB==='function')migrateDB()}catch(e){}refresh();toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');}catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message)}};
  function scope(){var t=((document.getElementById('page-title-text')||document.getElementById('page-title')||{}).textContent||'').toLowerCase();var s=document.querySelector('#page-settings,[data-page="settings"]');if(s)return s;if(t.includes('beállítás')||t.includes('settings'))return document.querySelector('.page.active,main')||document.body;return null}
  function card(){var s=scope();if(!s)return;if(document.getElementById('kp-safety-data-repo-card'))return;var cards=[].slice.call(s.querySelectorAll('.card'));var target=cards.find(function(c){return (c.textContent||'').toLowerCase().includes('github')})||cards[cards.length-1]||s;var w=document.createElement('div');w.className='card';w.id='kp-safety-data-repo-card';w.style.marginTop='14px';w.innerHTML='<h3 style="margin-top:0">Biztonsági mentés</h3><p class="muted" style="font-size:12px;line-height:1.5">A mentés a <b>horgasz-naplo-adatok</b> repo <b>kapaspont/biztonsagi-mentesek</b> mappájába készül.</p><button type="button" class="btn-primary" style="width:100%;margin-top:8px" onclick="kpCreateGithubSafetyBackup()">GitHub biztonsági mentés készítése</button><button type="button" class="btn-secondary" style="width:100%;margin-top:8px" onclick="kpRestoreGithubSafetyBackup(false)">GitHub biztonsági mentés visszatöltése</button>';if(target===s)s.appendChild(w);else target.parentNode.insertBefore(w,target.nextSibling);}
  function auto(){try{if(meaningful(db()))return;kpRestoreGithubSafetyBackup(true)}catch(e){}}
  setTimeout(card,700);setTimeout(card,1800);setInterval(card,4000);setTimeout(auto,2300);
  try{new MutationObserver(function(){setTimeout(card,100)}).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();

(function(){
  if(window.KP_V36_MERGE_RESTORE_SETTINGS_FIXED)return;
  window.KP_V36_MERGE_RESTORE_SETTINGS_FIXED=true;
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const arr=x=>Array.isArray(x)?x:[];
  const count=d=>({sessions:arr(d&&d.sessions).length,locations:arr(d&&d.locations).length,scoutSpots:arr(d&&d.scoutSpots).length,catches:arr(d&&d.sessions).reduce((a,s)=>a+arr(s.catches).length,0)});
  const keyOf=(o,p)=>String((o&&typeof o==='object'&&(o.id||o.uuid||o.createdAt||(String(o.date||'')+'|'+String(o.location||'')+'|'+String(o.lat||'')+'|'+String(o.lon||''))))||p+'_'+Math.random()).slice(0,240);
  function mergeArray(a,b,p){const out=[],seen={};arr(a).forEach(x=>{const k=keyOf(x,p);seen[k]=1;out.push(x)});arr(b).forEach(x=>{const k=keyOf(x,p);if(!seen[k]){seen[k]=1;out.push(x)}});return out}
  function mergeDB(local,remote,source){local=local||{};remote=remote||{};return {...local,sessions:mergeArray(local.sessions,remote.sessions,'session'),locations:mergeArray(local.locations,remote.locations,'location'),scoutSpots:mergeArray(local.scoutSpots,remote.scoutSpots,'scout'),baits:mergeArray(local.baits,remote.baits,'bait'),gear:mergeArray(local.gear,remote.gear,'gear'),fishImages:{...(remote.fishImages||{}),...(local.fishImages||{})},activeSessionId:local.activeSessionId||remote.activeSessionId||null,_meta:{app:'KapásPont',restoreMode:'merge',restoredAt:new Date().toISOString(),source:source||''}}}
  function cfg(){try{return typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||'{}')}catch(e){return {}}}
  function root(c){return String(c.root||'kapaspont').replace(/^\/+|\/+$/g,'')||'kapaspont'}
  function encPath(p){return String(p||'').split('/').map(encodeURIComponent).join('/')}
  async function readText(c,path){const d=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(path)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());const raw=String(d.content||'').replace(/\n/g,'');try{return decodeURIComponent(escape(atob(raw)))}catch(e){return atob(raw)}}
  async function listBackups(c){try{const a=await githubRequest(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+encPath(root(c)+'/backups')+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());return Array.isArray(a)?a.filter(x=>x&&x.name&&x.name.endsWith('.json')).map(x=>x.path).sort().reverse():[]}catch(e){return []}}
  function valid(d){return d&&typeof d==='object'&&(arr(d.sessions).length||arr(d.locations).length||arr(d.scoutSpots).length||arr(d.baits).length)}
  async function findBackup(c){const r=root(c),cand=[],seen={};try{const m=JSON.parse(await readText(c,r+'/manifest.json')||'{}');if(m.backup)cand.push(m.backup);if(m.latestBackup)cand.push(m.latestBackup);}catch(e){}(await listBackups(c)).forEach(p=>cand.push(p));for(const p of cand){if(!p||seen[p])continue;seen[p]=1;try{const d=JSON.parse(await readText(c,p)||'{}');if(valid(d))return {path:p,data:d}}catch(e){}}return null}
  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}})}
  function saveSafety(){try{const local=typeof getDB==='function'?getDB():{};const snap={created:new Date().toISOString(),backupType:'local-before-github-restore',...local};localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify(snap));localStorage.setItem(DB_KEY+'_safety_restore_latest',JSON.stringify(snap))}catch(e){}}
  window.githubRestoreLatestFromRepo=async function(){const c=cfg();try{if(typeof githubRequireConfig==='function')githubRequireConfig(c);const found=await findBackup(c);if(!found){toast('Nem találtam használható JSON mentést.');return;}const local=typeof getDB==='function'?getDB():{};const lc=count(local),rc=count(found.data);if(!confirm('GitHub backup összevonása a telefon adataival?\n\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás'))return;saveSafety();const next=mergeDB(local,found.data,found.path);localStorage.setItem(DB_KEY,JSON.stringify(next));try{if(typeof migrateDB==='function')migrateDB()}catch(e){}refresh();toast('GitHub backup összevonva.');}catch(e){toast('GitHub visszatöltési hiba: '+e.message)}};
  window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
  window.kpRestoreLocalSafetyBackup=window.kpRestoreLocalSafetyBackup||function(){try{const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');if(!raw){toast('Nincs helyi biztonsági mentés.');return;}const d=JSON.parse(raw),c=count(d);if(!confirm('Visszatöltsem a helyi biztonsági mentést?\n\nTúrák: '+c.sessions))return;localStorage.setItem(DB_KEY,JSON.stringify(d));try{if(typeof migrateDB==='function')migrateDB()}catch(e){}refresh();toast('Biztonsági mentés visszatöltve.')}catch(e){toast('Biztonsági mentés visszatöltési hiba: '+e.message)}};
  /* Fájlból visszatöltés: JSON fájl feltöltése és összevonás */
  window.kpImportFromFile=function(){
    const input=document.createElement('input');
    input.type='file';
    input.accept='.json,application/json';
    input.onchange=function(){
      const file=input.files[0];
      if(!file)return;
      const reader=new FileReader();
      reader.onload=function(e){
        try{
          const d=JSON.parse(e.target.result);
          if(!d||typeof d!=='object')throw new Error('Érvénytelen JSON fájl');
          const rc=count(d);
          const local=typeof getDB==='function'?getDB():{};
          const lc=count(local);
          if(!confirm('Fájlból visszatöltés?\n\nFájl: '+rc.sessions+' túra, '+rc.catches+' fogás\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\n\nAdatok ÖSSZEVONÁSRA kerülnek.'))return;
          saveSafety();
          const next=mergeDB(local,d,'file-import');
          localStorage.setItem(DB_KEY,JSON.stringify(next));
          try{if(typeof migrateDB==='function')migrateDB()}catch(err){}
          refresh();
          toast('Fájlból visszatöltés kész. '+rc.sessions+' túra, '+rc.catches+' fogás összevonva.');
        }catch(err){toast('Importálási hiba: '+err.message);}
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(()=>input.remove(),5000);
  };
  function activePageId(){const p=document.querySelector('.page.active,.page.show,[id^="page-"].active');return p&&p.id?p.id.replace(/^page-/,''):''}
  function isExportPage(){const id=activePageId();if(id&&id!=='export'&&id!=='settings'&&id!=='github-sync')return false;const t=(document.body.textContent||'').toLowerCase();return t.includes('json mentés')||t.includes('importálás')||t.includes('túraösszesítő export')}
  function removeCard(){const old=document.getElementById('kp-safety-restore-card');if(old)old.remove()}
  function makeCard(){
    const w=document.createElement('div');
    w.className='card';
    w.id='kp-safety-restore-card';
    w.style.marginTop='14px';
    w.innerHTML='<h3 style="margin-top:0">Visszatöltés</h3><p class="muted" style="font-size:12px;line-height:1.5">Korábban letöltött JSON backup fájlból vagy helyi mentésből.</p>';
    const b1=document.createElement('button');
    b1.type='button';
    b1.className='btn-primary';
    b1.style.cssText='width:100%;margin-top:8px';
    b1.textContent='📂 Fájlból visszatöltés (JSON)';
    b1.onclick=window.kpImportFromFile;
    const b2=document.createElement('button');
    b2.type='button';
    b2.className='btn-secondary';
    b2.style.cssText='width:100%;margin-top:8px';
    b2.textContent='Helyi biztonsági mentés visszatöltése';
    b2.onclick=window.kpRestoreLocalSafetyBackup;
    w.appendChild(b1);
    w.appendChild(b2);
    return w;
  }
  function cardByText(word){return [...document.querySelectorAll('.card,section,article,div')].find(n=>{const r=n.getBoundingClientRect(),t=(n.textContent||'').toLowerCase();return r.width>250&&r.height>40&&t.includes(word)&&t.length<1200})}
  function addCard(){if(!isExportPage()){removeCard();return}if(document.getElementById('kp-safety-restore-card'))return;const target=cardByText('importálás')||cardByText('json mentés')||cardByText('túraösszesítő export');if(target&&target.parentNode)target.parentNode.insertBefore(makeCard(),target)}
  function ui(){try{if(!isExportPage())removeCard();else addCard();}catch(e){}}
  const oldShow=window.showPage;if(typeof oldShow==='function'&&!oldShow.KP_V36_FIXED_WRAPPED){window.showPage=function(){const r=oldShow.apply(this,arguments);setTimeout(ui,80);setTimeout(ui,350);return r};window.showPage.KP_V36_FIXED_WRAPPED=true}
  setTimeout(ui,500);setTimeout(ui,1500);setInterval(ui,1500);
})();
