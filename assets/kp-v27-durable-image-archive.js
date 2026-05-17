(function(){
  if(window.KP_V27_DURABLE_IMAGES)return;
  window.KP_V27_DURABLE_IMAGES=true;
  const V='v27.0';
  const log=m=>{try{console.log('[KapásPont '+V+'] '+m)}catch(e){}};
  const toast=m=>{try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}};
  const esc=v=>{try{return typeof escText==='function'?escText(v):String(v||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}catch(e){return String(v||'')}};
  const escJ=v=>String(v||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  function cfg(){
    if(typeof githubLoadConfig==='function')return githubLoadConfig();
    try{return JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){return {}}
  }
  function requireCfg(c){
    if(typeof githubRequireConfig==='function')return githubRequireConfig(c);
    const miss=[]; if(!c.owner)miss.push('owner'); if(!c.repo)miss.push('repo'); if(!c.branch)miss.push('branch'); if(!c.token)miss.push('token');
    if(miss.length)throw new Error('Hiányzó GitHub beállítás: '+miss.join(', '));
  }
  const sanitize=v=>String(v||'adat').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'adat';
  const pathJoin=(c,p)=>typeof githubPath==='function'?githubPath(c,p):((String(c.root||'').replace(/^\/+|\/+$/g,'')?String(c.root).replace(/^\/+|\/+$/g,'')+'/':'')+p.replace(/^\//,''));
  const b64=data=>(String(data||'').match(/^data:[^;]+;base64,(.+)$/)||[])[1]||'';
  function ext(data){const m=String(data||'').match(/^data:([^;]+);base64,/);return m?((m[1].split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg'):'jpg'}
  const resizeP=(file,max,q)=>new Promise((res,rej)=>{try{resizeImage(file,max,q,d=>res(d))}catch(e){rej(e)}});
  function thumbP(dataUrl){return new Promise(resolve=>{try{const img=new Image();img.onload=()=>{const max=360;let w=img.width,h=img.height;const r=Math.min(1,max/Math.max(w,h));w=Math.round(w*r);h=Math.round(h*r);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.55))};img.onerror=()=>resolve('');img.src=dataUrl}catch(e){resolve('')}})}
  async function putFile(c,path,content,msg){
    if(typeof githubPutFile==='function')return githubPutFile(c,path,content,msg||'KapásPont kép mentés');
    const apiPath=path.split('/').map(encodeURIComponent).join('/');
    async function req(url,opts={}){const res=await fetch(url,{...opts,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...(opts.headers||{})}});const txt=await res.text();let d;try{d=txt?JSON.parse(txt):null}catch(e){d={message:txt}}if(!res.ok)throw new Error((d&&d.message)||('GitHub API hiba: '+res.status));return d}
    let sha=null;try{const d=await req('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath+'?ref='+encodeURIComponent(c.branch));sha=d&&d.sha}catch(e){if(!String(e.message||'').includes('Not Found'))throw e}
    const body={message:msg||'KapásPont kép mentés',content,branch:c.branch};if(sha)body.sha=sha;
    return req('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }
  async function uploadSpotPhoto(file,spotId){
    const c=cfg();requireCfg(c);
    const large=await resizeP(file,1600,0.78);
    const thumb=await thumbP(large);
    const id='photo_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    const day=new Date().toISOString().slice(0,10);
    const rel='images/scoutspots/'+day+'/'+sanitize(spotId)+'_'+sanitize(id)+'.'+ext(large);
    const full=pathJoin(c,rel);
    await putFile(c,full,b64(large),'KapásPont helykereső fotó mentés');
    return {id,storage:'github',path:full,relativePath:rel,thumb,createdAt:new Date().toISOString(),bytes:Math.round(b64(large).length*0.75),name:file.name||''};
  }
  window.spotFinderReadPhotos=async function(input){
    const files=[...(input.files||[])].filter(f=>f.type&&f.type.startsWith('image/'));
    if(!files.length){toast('Nem képfájlt választottál.');return}
    const sid=(document.getElementById('sf-id')?.value)||('spot_'+Date.now());
    if(document.getElementById('sf-id')&&!document.getElementById('sf-id').value)document.getElementById('sf-id').value=sid;
    try{requireCfg(cfg())}catch(e){toast('A képek tartós mentéséhez előbb állítsd be a GitHub mentést. A fotókat nem mentettem a böngészőbe, hogy ne teljen meg a tárhely.');input.value='';return}
    toast('Fotók feltöltése GitHubra…');
    let ok=0;
    for(const f of files){try{const rec=await uploadSpotPhoto(f,sid);spotFinderDraftPhotos.push(rec);ok++;renderSpotFinderPhotoPreview()}catch(e){console.error(e);toast('Egy fotó feltöltése sikertelen: '+e.message)}}
    input.value='';
    toast(ok+' fotó GitHubra mentve. A böngészőben csak kis előnézet maradt.');
  };
  window.renderSpotFinderPhotoPreview=function(){
    const el=document.getElementById('sf-photo-preview');if(!el)return;
    if(!spotFinderDraftPhotos.length){el.innerHTML='<div class="spot-photo-empty">Még nincs csatolt fotó.</div>';return}
    el.innerHTML=spotFinderDraftPhotos.map((p,i)=>'<div style="position:relative"><img class="spot-photo-thumb" src="'+(p.thumb||p.data||'')+'" alt="Hely fotó"><button title="Fotó törlése" onclick="spotFinderRemovePhoto('+i+')" style="position:absolute;right:-5px;top:-7px;width:22px;height:22px;border-radius:50%;background:var(--danger);color:white;font-size:12px">×</button><div style="font-size:9px;color:var(--moss);font-weight:700;text-align:center;margin-top:2px">GitHub</div></div>').join('');
  };
  window.spotFinderSave=function(){
    const db=getDB();if(!db.scoutSpots)db.scoutSpots=[];
    const id=(document.getElementById('sf-id')?.value||'').trim()||('spot_'+Date.now());
    const name=(document.getElementById('sf-name')?.value||'').trim();
    const note=(document.getElementById('sf-note')?.value||'').trim();
    const gps=(document.getElementById('sf-gps')?.value||'').trim();
    const p=spotFinderGetFormPoint();
    if(!p){toast('Előbb rögzíts GPS pontot.');return}
    if(!name){toast('Adj rövid nevet a helynek.');return}
    const photos=(spotFinderDraftPhotos||[]).map(x=>({id:x.id,storage:x.storage||'github',path:x.path||'',relativePath:x.relativePath||'',thumb:x.thumb||'',createdAt:x.createdAt||new Date().toISOString(),bytes:x.bytes||0,name:x.name||''}));
    const payload={id,name,gps:gps||Number(p.lat).toFixed(5)+'°N, '+Number(p.lon).toFixed(5)+'°E',lat:Number(p.lat),lon:Number(p.lon),note,photos,updatedAt:new Date().toISOString()};
    const ix=db.scoutSpots.findIndex(s=>s.id===payload.id);
    if(ix>=0){payload.createdAt=db.scoutSpots[ix].createdAt||payload.updatedAt;db.scoutSpots[ix]=payload}else{payload.createdAt=new Date().toISOString();db.scoutSpots.unshift(payload)}
    saveDB(db);spotFinderClearForm();renderSpotFinder();toast('Helykereső pont mentve tartós GitHub képhivatkozásokkal.');
  };
  window.renderSpotFinderList=function(){
    const el=document.getElementById('spotfinder-list');if(!el)return;
    const db=getDB();const list=[...(db.scoutSpots||[])].sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
    if(!list.length){el.innerHTML='<div class="empty-state"><i class="ti ti-map-search empty-icon"></i><div class="empty-title">Még nincs mentett hely</div><div class="empty-sub">Bejárás közben nyomd meg a „Jelenlegi hely rögzítése” gombot, majd írd be a rövid nevet és megjegyzést.</div></div>';return}
    el.innerHTML=list.map(s=>{const photos=s.photos||[];return '<div class="spot-card"><div><div class="spot-card-name">'+esc(s.name||'Névtelen hely')+'</div><div class="spot-card-meta"><i class="ti ti-current-location"></i> '+esc(s.gps||'')+' · '+esc(spotFinderFormatDate(s.updatedAt||s.createdAt))+' · '+photos.length+' fotó</div>'+(s.note?'<div class="spot-card-note">'+esc(s.note)+'</div>':'')+(photos.length?'<div class="spot-photo-preview-grid">'+photos.slice(0,4).map(p=>'<img class="spot-photo-thumb" src="'+(p.thumb||p.data||'')+'" alt="Hely fotó">').join('')+(photos.length>4?'<div class="spot-photo-empty">+'+(photos.length-4)+' fotó</div>':'')+'</div>':'')+'</div><div class="spot-card-actions"><button class="btn-secondary" onclick="spotFinderEdit(\''+escJ(s.id)+'\')"><i class="ti ti-edit"></i> Szerkesztés</button><button class="btn-secondary" onclick="spotFinderOpenMap(\''+escJ(s.id)+'\')"><i class="ti ti-map-pin"></i> Térkép</button><button class="btn-danger-outline" onclick="spotFinderDelete(\''+escJ(s.id)+'\')"><i class="ti ti-trash"></i></button></div></div>'}).join('');
  };
  window.spotFinderEdit=function(id){
    const db=getDB();const s=(db.scoutSpots||[]).find(x=>x.id===id);if(!s)return;
    document.getElementById('sf-id').value=s.id||'';document.getElementById('sf-name').value=s.name||'';document.getElementById('sf-gps').value=s.gps||'';document.getElementById('sf-note').value=s.note||'';document.getElementById('sf-lat').value=s.lat||'';document.getElementById('sf-lon').value=s.lon||'';
    spotFinderDraftPhotos=[...(s.photos||[])];renderSpotFinderPhotoPreview();renderSpotFinderMap();window.scrollTo(0,0);
  };
  window.kpV27MigrateSpotPhotosToGithub=async function(){
    const c=cfg();requireCfg(c);const db=getDB();let changed=0;
    for(const spot of (db.scoutSpots||[])){
      const photos=[];
      for(const p of (spot.photos||[])){
        if(p&&p.data&&String(p.data).startsWith('data:image/')){
          const th=await thumbP(p.data);const id=p.id||('photo_'+Date.now()+'_'+Math.random().toString(36).slice(2,8));const day=(spot.createdAt||new Date().toISOString()).slice(0,10);const rel='images/scoutspots/'+day+'/'+sanitize(spot.id||spot.name)+'_'+sanitize(id)+'.'+ext(p.data);const full=pathJoin(c,rel);
          await putFile(c,full,b64(p.data),'KapásPont régi helykereső fotó migrálás');
          photos.push({id,storage:'github',path:full,relativePath:rel,thumb:th,createdAt:p.createdAt||new Date().toISOString(),bytes:Math.round(b64(p.data).length*0.75),name:p.name||''});changed++;
        }else photos.push(p);
      }
      spot.photos=photos;
    }
    if(changed){saveDB(db);if(typeof renderSpotFinder==='function')renderSpotFinder();toast(changed+' régi helykereső fotó GitHubra migrálva.')}
    return changed;
  };
  const oldFind=window.githubFindDataUrlImages;
  window.githubFindDataUrlImages=function(db,fishAssets){
    const base=oldFind?oldFind(db,fishAssets):[];const seen=new Set(base.map(a=>a.path));
    function add(dataUrl,basePath,label){const m=String(dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);if(!m)return;const ex=(m[1].split('/')[1]||'jpg').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,'')||'jpg';const p=basePath+'.'+ex;if(seen.has(p))return;seen.add(p);base.push({path:p,base64:m[2],label})}
    (db.scoutSpots||[]).forEach(s=>{const d=String(s.createdAt||s.updatedAt||new Date().toISOString()).slice(0,10);const sid=sanitize(s.id||s.name);(s.photos||[]).forEach((p,i)=>add(p.data,'images/scoutspots/'+d+'/'+sid+'_legacy_'+String(i+1).padStart(2,'0'),'helykereső kép'))});
    return base;
  };
  log('Tartós GitHub képarchívum aktív a Helykeresőben.');
})();
