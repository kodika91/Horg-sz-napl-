// kp-mod-sync.js — KapásPont GitHub szinkronizáció, backup, visszatöltés
// Javított stabil verzió: v37.0-fix-20260522
// Módosítás célja: szintaktikai hiba javítása, üres backup kezelése,
// adatrepo visszatöltés/mentés egységesítése, fájlból visszatöltés megtartása.

(function(){
  if(window.KP_MOD_SYNC_V37_FIXED)return;
  window.KP_MOD_SYNC_V37_FIXED=true;

  const V='v37.0-fix-20260522';
  const DEFAULT={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
  const SAFETY_DIR='kapaspont/biztonsagi-mentesek';
  let running=false, autoRestoreChecked=false;

  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const pad=n=>String(n).padStart(2,'0');
  const stamp=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+'-'+pad(d.getMinutes())+'-'+pad(d.getSeconds())};
  const arr=x=>Array.isArray(x)?x:[];
  const slug=s=>String(s||'adat').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'adat';

  function enc(s){
    s=String(s||'');
    try{return btoa(unescape(encodeURIComponent(s)))}
    catch(e){const b=new TextEncoder().encode(s);let bin='';for(let i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return btoa(bin)}
  }
  function dec(s){
    s=String(s||'').replace(/\n/g,'');
    try{return decodeURIComponent(escape(atob(s)))}
    catch(e){try{return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}catch(_){return ''}}
  }
  function cfg(){
    let c={};
    try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){}
    return {
      owner:c.owner||DEFAULT.owner,
      repo:c.repo||DEFAULT.repo,
      branch:c.branch||DEFAULT.branch,
      root:String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'')||DEFAULT.root,
      token:(c.token||localStorage.getItem('v18_github_token')||'').trim()
    };
  }
  function dataCfg(){
    const c=cfg();
    c.repo='horgasz-naplo-adatok';
    return c;
  }
  function check(c){
    const miss=[];
    ['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});
    if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));
  }
  function root(c){return String(c.root||DEFAULT.root).replace(/^\/+|\/+$/g,'')||DEFAULT.root}
  function fpath(c,p){p=String(p||'').replace(/^\/+/,'');const r=root(c);return p.startsWith(r+'/')?p:r+'/'+p}
  function apiPath(p){return String(p||'').replace(/^\/+/,'').split('/').map(encodeURIComponent).join('/')}
  function db(){
    try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}
    catch(e){return {}}
  }
  function saveDb(d){
    localStorage.setItem(DB_KEY,JSON.stringify(d||{}));
    try{if(typeof migrateDB==='function')migrateDB()}catch(e){}
    refresh();
  }
  function refresh(){
    ['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations','renderSettings'].forEach(fn=>{try{window[fn]&&window[fn]()}catch(e){}});
  }
  function counts(d){
    d=d||{};
    return {
      sessions:arr(d.sessions).length,
      locations:arr(d.locations).length,
      scoutSpots:arr(d.scoutSpots).length,
      catches:arr(d.sessions).reduce((a,s)=>a+arr(s&&s.catches).length,0),
      baits:arr(d.baits).length,
      gear:arr(d.gear).length
    };
  }
  function meaningful(d){
    const c=counts(d||{});
    return c.sessions>0||c.locations>0||c.scoutSpots>0||c.catches>0||c.baits>0||c.gear>0;
  }
  function emptyBackup(){
    return {
      schemaVersion:5,
      backupType:'github-sync-full',
      app:'KapásPont',
      appVersion:V,
      exported:new Date().toISOString(),
      sessions:[],
      locations:[],
      scoutSpots:[],
      baits:[],
      gear:[],
      githubImageFiles:[]
    };
  }
  async function gh(c,url,opts){
    const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});
    const txt=await res.text();
    let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}};
    if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}
    return data;
  }
  async function getTextOrNull(c,p){
    try{
      const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());
      return dec(d.content||'');
    }catch(e){return null}
  }
  async function getJsonOrNull(c,p){
    const txt=await getTextOrNull(c,p);
    if(!txt || !txt.trim())return null;
    try{return JSON.parse(txt)}catch(e){return null}
  }
  async function getSha(c,p){
    try{
      const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());
      return d&&d.sha;
    }catch(e){return null}
  }
  async function putB64(c,p,b64,msg,createOnly){
    if(!b64||String(b64).length<8)throw new Error('Üres fájlt nem mentek: '+p);
    const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);
    let sha=null;
    if(!createOnly)sha=await getSha(c,p);
    const body={message:msg||'KapásPont fájl frissítés',content:b64,branch:c.branch};
    if(sha)body.sha=sha;
    return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }
  async function putJson(c,p,obj,msg,createOnly){
    return putB64(c,p,enc(JSON.stringify(obj,null,2)+'\n'),msg,createOnly);
  }
  function saveSafety(){
    try{
      const local=db();
      const snap={created:new Date().toISOString(),backupType:'local-before-github-restore',...local};
      localStorage.setItem(DB_KEY+'_before_github_restore',JSON.stringify(snap));
      localStorage.setItem(DB_KEY+'_safety_restore_latest',JSON.stringify(snap));
    }catch(e){}
  }
  function keyOf(o,p){
    return String((o&&typeof o==='object'&&(o.id||o.uuid||o.createdAt||(String(o.date||'')+'|'+String(o.location||'')+'|'+String(o.lat||'')+'|'+String(o.lon||''))))||p+'_'+Math.random()).slice(0,240);
  }
  function mergeArray(a,b,p){
    const out=[],seen={};
    arr(a).forEach(x=>{const k=keyOf(x,p);seen[k]=1;out.push(x)});
    arr(b).forEach(x=>{const k=keyOf(x,p);if(!seen[k]){seen[k]=1;out.push(x)}});
    return out;
  }
  function mergeDB(local,remote,source){
    local=local||{};remote=remote||{};
    return {
      ...local,
      sessions:mergeArray(local.sessions,remote.sessions,'session'),
      locations:mergeArray(local.locations,remote.locations,'location'),
      scoutSpots:mergeArray(local.scoutSpots,remote.scoutSpots,'scout'),
      baits:mergeArray(local.baits,remote.baits,'bait'),
      gear:mergeArray(local.gear,remote.gear,'gear'),
      fishImages:{...(remote.fishImages||{}),...(local.fishImages||{})},
      activeSessionId:local.activeSessionId||remote.activeSessionId||null,
      _meta:{app:'KapásPont',restoreMode:'merge',restoredAt:new Date().toISOString(),source:source||''}
    };
  }
  async function listBackups(c){
    try{
      const a=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(fpath(c,'backups'))+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());
      return Array.isArray(a)?a.filter(x=>x&&x.name&&x.name.endsWith('.json')).map(x=>x.path).sort().reverse():[];
    }catch(e){return []}
  }
  async function findLatestBackup(c){
    const cand=[],seen={};
    const man=await getJsonOrNull(c,fpath(c,'manifest.json'));
    if(man){
      [man.latestBackup,man.backup,man.latest].filter(Boolean).forEach(p=>{
        cand.push(String(p).replace(/^\/+/,''));
        cand.push(fpath(c,p));
      });
    }
    cand.push(fpath(c,'latest/full_backup_latest.json'));
    cand.push(fpath(c,'backups/full_backup_latest.json'));
    (await listBackups(c)).forEach(p=>cand.push(p));
    for(const p of cand){
      if(!p||seen[p])continue;seen[p]=1;
      const d=await getJsonOrNull(c,p);
      if(d&&meaningful(d))return {path:p,data:d};
    }
    return null;
  }

  async function sanitize(dbObj,c){
    const out=JSON.parse(JSON.stringify(dbObj||{}));
    const imgs=[];
    const ib64=d=>(String(d||'').match(/^data:[^;]+;base64,(.+)$/)||[])[1]||'';
    const ext=d=>{const m=String(d||'').match(/^data:([^;]+);base64,/);return m?((m[1].split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg'):'jpg'};
    async function thumb(dataUrl){
      return new Promise(resolve=>{
        try{
          const img=new Image();
          img.onload=()=>{try{const max=180;let w=img.width,h=img.height;const r=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*r));h=Math.max(1,Math.round(h*r));const cnv=document.createElement('canvas');cnv.width=w;cnv.height=h;cnv.getContext('2d').drawImage(img,0,0,w,h);resolve(cnv.toDataURL('image/jpeg',0.38))}catch(e){resolve('')}};
          img.onerror=()=>resolve('');
          img.src=dataUrl;
        }catch(e){resolve('')}
      });
    }
    async function add(dataUrl,rel,label){
      if(!String(dataUrl||'').startsWith('data:image/'))return null;
      const p=fpath(c,rel+'.'+ext(dataUrl));
      imgs.push({path:p,base64:ib64(dataUrl),label});
      return {storage:'github',path:p,relativePath:rel+'.'+ext(dataUrl),thumb:await thumb(dataUrl),bytes:Math.round(ib64(dataUrl).length*0.75),createdAt:new Date().toISOString()};
    }
    for(const s of arr(out.sessions)){
      const base='images/sessions/'+(s.date||new Date().toISOString().slice(0,10))+'/'+slug(s.id||s.location||Date.now());
      let i=0;
      for(const ca of arr(s.catches)){
        i++;
        if(ca.photo&&String(ca.photo).startsWith('data:image/')){
          const r=await add(ca.photo,base+'_catch_'+pad(i),'fogás kép');
          if(r){ca.photo=r.thumb;ca.photoRef=r;ca.photoPath=r.path;ca.photoStorage='github'}
        }
      }
    }
    out.githubImageFiles=imgs.map(x=>({path:x.path,label:x.label}));
    return {db:out,imgs};
  }
  async function guardBeforeSave(c,local){
    if(!meaningful(local))throw new Error('Biztonsági védelem: nincs helyi túra/hely/fogás adat.');
    const found=await findLatestBackup(c);
    if(found&&found.data&&meaningful(found.data)){
      const lc=counts(local),rc=counts(found.data);
      if(lc.sessions<rc.sessions||lc.catches<rc.catches){
        if(!confirm('VÉDELEM: a GitHub backupban több adat van mint a telefonon.\n\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás\n\nKészítsek új mentésfájlt?'))throw new Error('Mentés megszakítva.');
      }
    }
  }

  async function syncNow(){
    if(running){toast('Már fut egy GitHub mentés.');return}
    running=true;
    try{
      const c=dataCfg();check(c);
      if(typeof githubClearLog==='function')githubClearLog();
      const local=db();
      await guardBeforeSave(c,local);
      const pack=await sanitize(local,c);
      for(const im of pack.imgs)await putB64(c,im.path,im.base64,'KapásPont kép mentés');
      const ts=stamp();
      const backup={schemaVersion:5,backupType:'github-sync-full',app:'KapásPont',appVersion:V,exported:new Date().toISOString(),...pack.db};
      const backupPath=fpath(c,'backups/full_backup_'+ts+'.json');
      await putJson(c,backupPath,backup,'KapásPont új backup',true);
      await putJson(c,fpath(c,'latest/full_backup_latest.json'),backup,'KapásPont latest backup frissítés',false);
      const man={schemaVersion:3,mode:'append-only',created:new Date().toISOString(),app:'KapásPont',appVersion:V,sessionCount:arr(pack.db.sessions).length,imageCount:arr(pack.db.githubImageFiles).length,backup:backupPath,latestBackup:fpath(c,'latest/full_backup_latest.json'),latest:fpath(c,'latest/full_backup_latest.json')};
      await putJson(c,fpath(c,'manifest.json'),man,'KapásPont manifest frissítés',false);
      toast('Új GitHub backup kész: '+ts);
      refresh();
    }catch(e){toast('Mentési hiba: '+e.message)}
    finally{running=false}
  }

  window.githubSyncNow=syncNow;
  window.githubScheduleAutoBackup=function(){};
  window.kpRestoreLatestGithubBackup=async function(auto){
    try{
      const c=dataCfg();check(c);
      const found=await findLatestBackup(c);
      if(!found||!meaningful(found.data))throw new Error('Nem találtam használható GitHub backupot.');
      const rc=counts(found.data),lc=counts(db());
      if(!auto&&!confirm('Visszatöltsem a legutóbbi GitHub mentést?\n\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\n\nForrás: '+found.path))return;
      saveSafety();
      saveDb(found.data);
      toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');
    }catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message)}
  };
  window.githubRestoreLatestFromRepo=async function(){
    try{
      const c=dataCfg();check(c);
      const found=await findLatestBackup(c);
      if(!found){toast('Nem találtam használható JSON mentést.');return}
      const local=db(),lc=counts(local),rc=counts(found.data);
      if(!confirm('GitHub backup összevonása a telefon adataival?\n\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\nGitHub: '+rc.sessions+' túra, '+rc.catches+' fogás'))return;
      saveSafety();
      saveDb(mergeDB(local,found.data,found.path));
      toast('GitHub backup összevonva.');
    }catch(e){toast('GitHub visszatöltési hiba: '+e.message)}
  };
  window.githubDownloadLatestFromRepo=window.githubRestoreLatestFromRepo;
  window.kpCreateGithubSafetyBackup=async function(){
    try{
      const c=dataCfg();check(c);
      const d=db();
      if(!meaningful(d))throw new Error('Nincs menthető naplóadat.');
      const ts=stamp();
      const path=SAFETY_DIR+'/safety_backup_'+ts+'.json';
      const pack={schemaVersion:7,backupType:'kapaspont-safety-backup',app:'KapásPont',appVersion:V,exported:new Date().toISOString(),counts:counts(d),...d};
      await putJson(c,path,pack,'KapásPont biztonsági mentés '+ts,true);
      await putJson(c,SAFETY_DIR+'/manifest.json',{schemaVersion:1,app:'KapásPont',appVersion:V,updated:new Date().toISOString(),latestBackup:path,backup:path,counts:counts(d)},'KapásPont biztonsági manifest',false);
      toast('GitHub biztonsági mentés kész.');
    }catch(e){toast('Biztonsági mentési hiba: '+e.message)}
  };
  window.kpRestoreGithubSafetyBackup=async function(auto){
    try{
      const c=dataCfg();check(c);
      const man=await getJsonOrNull(c,SAFETY_DIR+'/manifest.json');
      const p=man&&(man.latestBackup||man.backup);
      if(!p)throw new Error('Nincs mentési manifest.');
      const r=await getJsonOrNull(c,p);
      if(!meaningful(r))throw new Error('A GitHub mentés üres.');
      if(!auto&&!confirm('Visszatöltsem a GitHub biztonsági mentést?\n\nForrás: '+c.owner+'/'+c.repo+'/'+p))return;
      saveSafety();
      saveDb(r);
      toast(auto?'GitHub mentés automatikusan visszatöltve.':'GitHub mentés visszatöltve.');
    }catch(e){if(!auto)toast('GitHub visszatöltési hiba: '+e.message)}
  };
  window.kpRestoreLocalSafetyBackup=function(){
    try{
      const raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');
      if(!raw){toast('Nincs helyi biztonsági mentés.');return}
      const d=JSON.parse(raw),c=counts(d);
      if(!confirm('Visszatöltsem a helyi biztonsági mentést?\n\nTúrák: '+c.sessions))return;
      saveDb(d);
      toast('Biztonsági mentés visszatöltve.');
    }catch(e){toast('Biztonsági mentés visszatöltési hiba: '+e.message)}
  };
  window.kpImportFromFile=function(){
    const input=document.createElement('input');
    input.type='file';
    input.accept='.json,application/json';
    input.onchange=function(){
      const file=input.files[0];if(!file)return;
      const reader=new FileReader();
      reader.onload=function(e){
        try{
          const d=JSON.parse(e.target.result);
          if(!d||typeof d!=='object')throw new Error('Érvénytelen JSON fájl');
          const rc=counts(d),local=db(),lc=counts(local);
          if(!confirm('Fájlból visszatöltés?\n\nFájl: '+rc.sessions+' túra, '+rc.catches+' fogás\nTelefon: '+lc.sessions+' túra, '+lc.catches+' fogás\n\nAdatok ÖSSZEVONÁSRA kerülnek.'))return;
          saveSafety();
          saveDb(mergeDB(local,d,'file-import'));
          toast('Fájlból visszatöltés kész. '+rc.sessions+' túra, '+rc.catches+' fogás összevonva.');
        }catch(err){toast('Importálási hiba: '+err.message)}
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(()=>input.remove(),5000);
  };

  function activateButtons(){
    document.querySelectorAll('button').forEach(b=>{
      const t=(b.textContent||'').toLowerCase();
      if(t.includes('mentés githubra most')){b.disabled=false;b.onclick=function(ev){ev.preventDefault();ev.stopPropagation();syncNow()}}
    });
  }
  function activePageId(){const p=document.querySelector('.page.active,.page.show,[id^="page-"].active');return p&&p.id?p.id.replace(/^page-/,''):''}
  function isExportPage(){
    const id=activePageId();
    if(id&&id!=='export'&&id!=='settings'&&id!=='github-sync')return false;
    const title=((document.getElementById('page-title-text')||document.getElementById('page-title')||{}).textContent||'').toLowerCase();
    const t=(document.body.textContent||'').toLowerCase();
    return title.includes('beállítás')||title.includes('export')||t.includes('json mentés')||t.includes('importálás')||t.includes('túraösszesítő export');
  }
  function removeCard(){const old=document.getElementById('kp-safety-restore-card');if(old)old.remove()}
  function makeCard(){
    const w=document.createElement('div');
    w.className='card';
    w.id='kp-safety-restore-card';
    w.style.marginTop='14px';
    w.innerHTML='<h3 style="margin-top:0">Visszatöltés és biztonsági mentés</h3><p class="muted" style="font-size:12px;line-height:1.5">GitHub mentés, fájlból visszatöltés vagy helyi biztonsági mentés.</p>';
    const b1=document.createElement('button');
    b1.type='button';b1.className='btn-primary';b1.style.cssText='width:100%;margin-top:8px';b1.textContent='📂 Fájlból visszatöltés (JSON)';b1.onclick=window.kpImportFromFile;
    const b2=document.createElement('button');
    b2.type='button';b2.className='btn-secondary';b2.style.cssText='width:100%;margin-top:8px';b2.textContent='Helyi biztonsági mentés visszatöltése';b2.onclick=window.kpRestoreLocalSafetyBackup;
    const b3=document.createElement('button');
    b3.type='button';b3.className='btn-secondary';b3.style.cssText='width:100%;margin-top:8px';b3.textContent='Legutóbbi GitHub mentés visszatöltése';b3.onclick=()=>window.kpRestoreLatestGithubBackup(false);
    w.appendChild(b1);w.appendChild(b2);w.appendChild(b3);
    return w;
  }
  function cardByText(word){return [...document.querySelectorAll('.card,section,article,div')].find(n=>{const r=n.getBoundingClientRect(),t=(n.textContent||'').toLowerCase();return r.width>250&&r.height>40&&t.includes(word)&&t.length<1200})}
  function addCard(){if(!isExportPage()){removeCard();return}if(document.getElementById('kp-safety-restore-card'))return;const target=cardByText('importálás')||cardByText('json mentés')||cardByText('túraösszesítő export')||cardByText('github');if(target&&target.parentNode)target.parentNode.insertBefore(makeCard(),target.nextSibling)}
  function ui(){try{activateButtons();if(isExportPage())addCard();else removeCard()}catch(e){}}
  const oldShow=window.showPage;
  if(typeof oldShow==='function'&&!oldShow.KP_V37_FIXED_WRAPPED){
    window.showPage=function(){const r=oldShow.apply(this,arguments);setTimeout(ui,80);setTimeout(ui,350);return r};
    window.showPage.KP_V37_FIXED_WRAPPED=true;
  }
  function install(){
    activateButtons();
    ui();
    if(!autoRestoreChecked){
      autoRestoreChecked=true;
      setTimeout(()=>{try{if(meaningful(db()))return;window.kpRestoreLatestGithubBackup(true)}catch(e){}},2200);
    }
  }
  setTimeout(install,500);
  setTimeout(install,1500);
  setInterval(install,2500);
  try{new MutationObserver(()=>setTimeout(ui,80)).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();
