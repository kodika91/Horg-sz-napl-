(function(){
  if(window.KP_V29_STABLE_GITHUB_SYNC)return;
  window.KP_V29_STABLE_GITHUB_SYNC=true;
  const V='v29.2';
  let running=false;
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const log=m=>{try{typeof githubLog==='function'?githubLog(m):console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const pad=n=>String(n).padStart(2,'0');
  const stamp=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+'-'+pad(d.getMinutes())+'-'+pad(d.getSeconds())};
  const slug=s=>String(s||'adat').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'adat';
  const enc=s=>{s=String(s||'');try{return btoa(unescape(encodeURIComponent(s)))}catch(e){const b=new TextEncoder().encode(s);let bin='';for(let i=0;i<b.length;i++)bin+=String.fromCharCode(b[i]);return btoa(bin)}};
  const ib64=d=>(String(d||'').match(/^data:[^;]+;base64,(.+)$/)||[])[1]||'';
  const ext=d=>{const m=String(d||'').match(/^data:([^;]+);base64,/);return m?((m[1].split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg'):'jpg'};
  function cfg(){if(typeof githubLoadConfig==='function')return githubLoadConfig();try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}}
  function check(c){if(typeof githubRequireConfig==='function')return githubRequireConfig(c);const miss=[];['owner','repo','branch','token'].forEach(k=>{if(!c[k])miss.push(k)});if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));}
  function root(c){return String(c.root||'kapaspont').replace(/^\/+|\/+$/g,'')||'kapaspont'}
  function fpath(c,p){return root(c)+'/'+String(p||'').replace(/^\/+/, '')}
  function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
  async function gh(c,url,opts){const res=await fetch(url,{...(opts||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opts&&opts.headers)||{})}});const txt=await res.text();let data;try{data=txt?JSON.parse(txt):null}catch(e){data={message:txt}}if(!res.ok){const er=new Error((data&&data.message)||('GitHub API hiba: '+res.status));er.status=res.status;throw er}return data}
  async function put(c,p,b64,msg,mode){
    if(!b64||String(b64).length<8)throw new Error('Üres fájlt nem mentek: '+p);
    const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);
    if(mode==='create'){
      return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg||'KapásPont új fájl',content:b64,branch:c.branch})});
    }
    let lastErr=null;
    for(let attempt=1;attempt<=4;attempt++){
      let sha=null;
      try{const old=await gh(c,url+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());sha=old&&old.sha}catch(e){if(!String(e.message||'').includes('Not Found'))lastErr=e}
      try{const body={message:msg||'KapásPont stabil mentés',content:b64,branch:c.branch};if(sha)body.sha=sha;return await gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
      catch(e){lastErr=e;const m=String(e.message||'');if(m.includes('does not match')||m.includes('is at')||e.status===409){log('GitHub SHA ütközés, újrapróbálás: '+p+' ('+attempt+'/4)');await new Promise(r=>setTimeout(r,650*attempt));continue}throw e}
    }
    throw lastErr||new Error('Nem sikerült menteni: '+p);
  }
  function thumb(dataUrl){return new Promise(resolve=>{try{const img=new Image();img.onload=()=>{try{const max=180;let w=img.width,h=img.height;const r=Math.min(1,max/Math.max(w,h));w=Math.max(1,Math.round(w*r));h=Math.max(1,Math.round(h*r));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.38))}catch(e){resolve('')}};img.onerror=()=>resolve('');img.src=dataUrl}catch(e){resolve('')}})}
  async function sanitize(db,c){
    const out=JSON.parse(JSON.stringify(db||{}));
    const imgs=[];
    async function add(dataUrl,rel,label){if(!String(dataUrl||'').startsWith('data:image/'))return null;const p=fpath(c,rel+'.'+ext(dataUrl));imgs.push({path:p,base64:ib64(dataUrl),label});return {storage:'github',path:p,relativePath:rel+'.'+ext(dataUrl),thumb:await thumb(dataUrl),bytes:Math.round(ib64(dataUrl).length*0.75),createdAt:new Date().toISOString()}}
    for(const s of (out.sessions||[])){
      const base='images/sessions/'+(s.date||new Date().toISOString().slice(0,10))+'/'+slug(s.id||s.location||Date.now());let i=0;
      for(const ca of (s.catches||[])){i++;if(ca.photo&&String(ca.photo).startsWith('data:image/')){const r=await add(ca.photo,base+'_catch_'+pad(i),'fogás kép');if(r){ca.photo=r.thumb;ca.photoRef=r;ca.photoPath=r.path;ca.photoStorage='github'}}}
      let j=0;for(const ev of (s.events||[])){j++;if(ev.photo&&String(ev.photo).startsWith('data:image/')){const r=await add(ev.photo,base+'_event_'+pad(j),'esemény kép');if(r){ev.photo=r.thumb;ev.photoRef=r;ev.photoPath=r.path;ev.photoStorage='github'}}}
    }
    out.githubImageFiles=imgs.map(x=>({path:x.path,label:x.label}));
    return {db:out,imgs};
  }
  function storage(db,imgCount){let s='';try{s=JSON.stringify(db||{})}catch(e){}return {bytes:s.length,localBytes:s.length,fishDbBytes:0,imageBytes:0,imageCount:imgCount||0,quota:52428800,pct:Math.round((s.length/52428800)*100),sessions:(db.sessions||[]).length,locations:(db.locations||[]).length,baits:(db.baits||[]).length,gear:(db.gear||[]).length,setups:(db.setups||[]).length,mapPoints:(db.sessions||[]).reduce((a,x)=>a+(x.mapPoints||[]).length,0)}}
  async function sync(auto){
    if(running){toast('Már fut egy GitHub mentés. Várd meg, amíg befejeződik.');log('Második mentés blokkolva: az előző még fut.');return;}
    running=true;
    try{
      const c=cfg();check(c);if(typeof githubClearLog==='function')githubClearLog();log('Stabil GitHub mentés indul.');
      const local=typeof getDB==='function'?getDB():{};const pack=await sanitize(local,c);
      for(const im of pack.imgs){await put(c,im.path,im.base64,'KapásPont kép mentés')}
      const backup={schemaVersion:4,backupType:'github-sync-full',app:'KapásPont',appVersion:'v29.2',release:'append-only-session-files',exported:new Date().toISOString(),storage:storage(pack.db,pack.imgs.length),fishImageAssets:[],...pack.db};
      const js=JSON.stringify(backup,null,2);if(js.length<100)throw new Error('Túl kicsi JSON mentés, nem írom felül a backupot.');
      const ts=stamp();
      await put(c,fpath(c,'backups/full_backup_'+ts+'.json'),enc(js),'KapásPont időbélyeges backup','create');
      for(const s of (pack.db.sessions||[])){const p=fpath(c,'sessions/'+(s.date||'datum-nelkul')+'_'+slug(s.location||'hely')+'_'+slug(s.id)+'_'+ts+'.json');await put(c,p,enc(JSON.stringify({schemaVersion:2,backupType:'session',app:'KapásPont',exported:new Date().toISOString(),session:s},null,2)),'KapásPont horgászat mentés','create')}
      await put(c,fpath(c,'latest/full_backup_latest.json'),enc(js),'KapásPont latest backup frissítés');
      const man={schemaVersion:2,created:new Date().toISOString(),app:'KapásPont',sessionCount:(pack.db.sessions||[]).length,imageCount:pack.imgs.length,latest:fpath(c,'latest/full_backup_latest.json'),backup:fpath(c,'backups/full_backup_'+ts+'.json')};await put(c,fpath(c,'manifest.json'),enc(JSON.stringify(man,null,2)),'KapásPont manifest frissítés');
      toast('Mentés kész: '+new Date().toLocaleString('hu-HU'));log('Mentés kész. Automatikus háttérmentés kikapcsolva, session fájlok időbélyeggel.');if(typeof renderStorageOverview==='function')renderStorageOverview();
    }catch(e){console.error(e);toast('Mentési hiba: '+e.message);log('Mentési hiba: '+e.message)}
    finally{running=false;}
  }
  function install(){
    if(typeof getDB!=='function'){setTimeout(install,250);return}
    window.githubScheduleAutoBackup=function(){log('Automatikus GitHub háttérmentés kihagyva. Kézi mentés használandó.');};
    window.githubSyncNow=function(auto){return sync(false)};
    try{const c=cfg();c.auto=false;localStorage.setItem('kapaspont_github_sync',JSON.stringify(c));}catch(e){}
    log('Stabil GitHub mentés aktív: auto mentés kikapcsolva, session append-only.');
  }
  install();
})();