/* V18.1 · Képkezelő: halfaj/felszerelés/csali képek külön GitHub mappába + image-index.json */
(function(){
  const CFG={
    repo:'kodika91/Horg-sz-napl-',
    branch:'main',
    indexPath:'assets/image-index.json',
    minW:800,
    minH:500,
    maxMB:5,
    cats:{fish:'assets/fish',gear:'assets/gear',bait:'assets/bait',places:'assets/places'},
    subcats:{
      fish:[['general','Halfaj']],
      gear:[['rod','Bot'],['reel','Orsó'],['line','Zsinór'],['hook','Horog'],['leader','Előke'],['feeder','Kosár / feeder kosár'],['float','Úszó'],['tool','Kiegészítő / eszköz'],['other','Egyéb felszerelés']],
      bait:[['bait','Csali'],['groundbait','Etetőanyag'],['pellet','Pellet'],['aroma','Aroma'],['seed','Mag / főtt mag'],['live','Élő csali'],['other','Egyéb csali']],
      places:[['general','Helyszín']]
    }
  };
  const STORE={token:'v18_github_token',index:'v18_image_index_cache'};
  let selectedFile=null, selectedImage=null, imageIndex=null;

  function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'kep';}
  function ext(name,type){const n=String(name||'').toLowerCase(); if(n.endsWith('.png'))return 'png'; if(n.endsWith('.webp'))return 'webp'; return type==='image/png'?'png':type==='image/webp'?'webp':'jpg';}
  function qs(s,r=document){return r.querySelector(s)}
  function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
  function status(msg,type='warn'){const el=qs('#v18-im-status'); if(!el)return; el.className='v18-im-status show '+type; el.textContent=msg;}
  function getToken(){return (localStorage.getItem(STORE.token)||'').trim()}
  function setToken(v){if(v) localStorage.setItem(STORE.token,v.trim())}
  function subFolder(cat){const s=qs('#v18-im-subcat')?.value||'general'; return s==='general'?'':('/'+slug(s));}
  function subLabel(cat,sub){const list=CFG.subcats[cat]||[]; const row=list.find(x=>x[0]===sub); return row?row[1]:sub;}

  async function loadIndex(){
    if(imageIndex) return imageIndex;
    try{
      const r=await fetch(CFG.indexPath+'?v='+(Date.now()),{cache:'no-store'});
      if(r.ok){ imageIndex=await r.json(); localStorage.setItem(STORE.index,JSON.stringify(imageIndex)); return imageIndex; }
    }catch(e){}
    try{imageIndex=JSON.parse(localStorage.getItem(STORE.index)||'{}')}catch(e){imageIndex={}}
    imageIndex=Object.assign({version:1,updatedAt:null,fish:{},gear:{},bait:{},places:{},meta:{}},imageIndex||{});
    return imageIndex;
  }

  async function ghGet(path,token){
    const r=await fetch(`https://api.github.com/repos/${CFG.repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${CFG.branch}`,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'}});
    if(r.status===404)return null;
    if(!r.ok)throw new Error('GitHub lekérés hiba: '+r.status);
    return await r.json();
  }
  async function ghPut(path,contentB64,message,token,sha){
    const body={message,content:contentB64,branch:CFG.branch}; if(sha)body.sha=sha;
    const r=await fetch(`https://api.github.com/repos/${CFG.repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{
      method:'PUT',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(body)
    });
    if(!r.ok){let t='';try{t=await r.text()}catch(e){} throw new Error('GitHub mentés hiba: '+r.status+' '+t.slice(0,220));}
    return await r.json();
  }
  function fileToB64(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(file);});}
  function textB64(txt){return btoa(unescape(encodeURIComponent(txt)));}
  function imgLoad(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>res({url,img,w:img.naturalWidth,h:img.naturalHeight});img.onerror=rej;img.src=url;});}

  function collectTargets(cat){
    const arr=[];
    if(cat==='fish' && Array.isArray(window.FISH_DB)) window.FISH_DB.forEach(f=>arr.push({id:slug(f.id||f.name||f.hu||f.latin),name:f.name||f.hu||f.latin||f.id}));
    if(cat==='gear') ['GEAR_DB','gearDB','GEAR'].forEach(k=>{ if(Array.isArray(window[k])) window[k].forEach(x=>arr.push({id:slug(x.id||x.name||x.title),name:x.name||x.title||x.id})); });
    if(cat==='bait') ['BaitsDB','BAIT_DB','baitDB','BAITS'].forEach(k=>{ if(Array.isArray(window[k])) window[k].forEach(x=>arr.push({id:slug(x.id||x.name||x.title),name:x.name||x.title||x.id})); });
    if(cat==='fish') qsa('.fish-card .fish-name-sci').forEach(e=>arr.push({id:slug(e.textContent),name:e.textContent.trim()}));
    if(cat==='gear') qsa('#page-gear .item-name,.gear-card .item-name,.gear-name').forEach(e=>arr.push({id:slug(e.textContent),name:e.textContent.trim()}));
    if(cat==='bait') qsa('#page-baits .item-name,.bait-card .item-name,.bait-name').forEach(e=>arr.push({id:slug(e.textContent),name:e.textContent.trim()}));
    if(cat==='places') qsa('#page-locations .loc-name,.location-name,.spot-name').forEach(e=>arr.push({id:slug(e.textContent),name:e.textContent.trim()}));
    const m=new Map(); arr.filter(x=>x.name).forEach(x=>m.set(x.id,x)); return Array.from(m.values()).sort((a,b)=>a.name.localeCompare(b.name,'hu'));
  }

  function fillSubcatSelect(){
    const cat=qs('#v18-im-cat')?.value||'fish'; const sel=qs('#v18-im-subcat'); if(!sel)return;
    const list=CFG.subcats[cat]||[['general','Általános']];
    sel.innerHTML=list.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('');
    const wrap=qs('#v18-im-subcat-wrap'); if(wrap)wrap.style.display=(cat==='gear'||cat==='bait')?'grid':'none';
  }
  function fillTargetSelect(){
    const cat=qs('#v18-im-cat')?.value||'fish'; const sel=qs('#v18-im-target'); if(!sel)return;
    fillSubcatSelect();
    const targets=collectTargets(cat); sel.innerHTML='<option value="">Válassz elemet…</option>'+targets.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')+'<option value="__custom">+ Egyedi azonosító megadása</option>';
    qs('#v18-im-custom-wrap').style.display='none';
  }
  function preview(){
    const box=qs('#v18-preview-img'), meta=qs('#v18-preview-meta'), name=qs('#v18-preview-name');
    const target=qs('#v18-im-target'); const custom=qs('#v18-im-custom'); const cat=qs('#v18-im-cat')?.value||'fish'; const sub=qs('#v18-im-subcat')?.value||'general';
    const id=target?.value==='__custom'?slug(custom?.value):target?.value;
    name.textContent=id||'Nincs kiválasztott cél';
    const folder=(CFG.cats[cat]||'assets/images')+(sub==='general'?'':'/'+slug(sub));
    if(selectedImage){box.innerHTML=`<img src="${selectedImage.url}" alt="előnézet">`; meta.textContent=`${selectedImage.w}×${selectedImage.h}px · ${(selectedFile.size/1024/1024).toFixed(2)} MB · ${subLabel(cat,sub)} · ${folder}`;}
    else{box.innerHTML='<i class="ti ti-photo"></i>'; meta.textContent='Minimum 800×500 px, max. 5 MB · mentés: '+folder;}
  }

  function injectPanel(){
    if(qs('#v18-image-manager'))return;
    const page=qs('#page-settings')||qs('[id*="settings"]')||document.body;
    const wrap=document.createElement('div'); wrap.id='v18-image-manager'; wrap.className='v18-image-manager';
    wrap.innerHTML=`
      <div class="v18-im-head"><div><div class="v18-im-title">Képkezelő</div><div class="v18-im-sub">Halfajokhoz, felszerelésekhez, csalikhoz és helyekhez tudsz képet feltölteni külön GitHub mappába. Nem az indexbe kerül.</div></div></div>
      <div class="v18-im-grid">
        <div class="v18-im-field"><label>Kategória</label><select id="v18-im-cat"><option value="fish">Halfajok</option><option value="gear">Felszerelés</option><option value="bait">Csali / etetőanyag</option><option value="places">Helyszín</option></select></div>
        <div class="v18-im-field" id="v18-im-subcat-wrap"><label>Alkategória</label><select id="v18-im-subcat"></select></div>
        <div class="v18-im-field"><label>Cél elem</label><select id="v18-im-target"></select></div>
        <div class="v18-im-field" id="v18-im-custom-wrap" style="display:none"><label>Egyedi azonosító</label><input id="v18-im-custom" placeholder="pl. feederbot_390 vagy szilvaorru_keszeg"></div>
        <div class="v18-im-field"><label>GitHub token</label><input id="v18-im-token" type="password" placeholder="Fine-grained token: Contents read/write"></div>
        <div class="v18-im-file"><input id="v18-im-file" type="file" accept="image/jpeg,image/png,image/webp"><div class="v18-im-sub">Követelmény: minimum ${CFG.minW}×${CFG.minH}px, maximum ${CFG.maxMB} MB. A felszerelés és csali alkategória szerint külön almappába kerül.</div></div>
        <div class="v18-im-preview"><div class="v18-preview-card"><div class="v18-preview-img" id="v18-preview-img"><i class="ti ti-photo"></i></div><div class="v18-preview-body"><div class="v18-preview-name" id="v18-preview-name">Nincs kiválasztott cél</div><div class="v18-preview-meta" id="v18-preview-meta">Minimum 800×500 px, max. 5 MB</div></div></div><div class="v18-im-info">A token csak a böngésződ localStorage tárhelyére kerül. GitHub tokenhez legalább Contents: Read and write jogosultság kell ehhez a repóhoz. Ha nincs token, az előnézet működik, de GitHub mentés nem.</div></div>
        <div id="v18-im-status" class="v18-im-status"></div>
        <div class="v18-im-actions"><button class="v18-im-btn primary" id="v18-im-save">Kép feltöltése GitHubra</button><button class="v18-im-btn" id="v18-im-apply">Képek újraalkalmazása</button><button class="v18-im-btn" id="v18-im-refresh">Index újratöltése</button></div>
      </div>`;
    page.appendChild(wrap);
    const token=qs('#v18-im-token'); token.value=getToken();
    qs('#v18-im-cat').addEventListener('change',()=>{fillTargetSelect();preview();});
    qs('#v18-im-subcat').addEventListener('change',preview);
    qs('#v18-im-target').addEventListener('change',e=>{qs('#v18-im-custom-wrap').style.display=e.target.value==='__custom'?'grid':'none';preview();});
    qs('#v18-im-custom').addEventListener('input',preview);
    token.addEventListener('change',()=>setToken(token.value));
    qs('#v18-im-file').addEventListener('change',async e=>{try{selectedFile=e.target.files[0]||null; selectedImage=null; if(!selectedFile){preview();return;} if(!/^image\/(jpeg|png|webp)$/.test(selectedFile.type))throw new Error('Csak JPG, PNG vagy WebP kép tölthető fel.'); if(selectedFile.size>CFG.maxMB*1024*1024)throw new Error('A kép túl nagy. Maximum '+CFG.maxMB+' MB lehet.'); selectedImage=await imgLoad(selectedFile); if(selectedImage.w<CFG.minW||selectedImage.h<CFG.minH)throw new Error(`A kép túl kicsi: ${selectedImage.w}×${selectedImage.h}px. Minimum ${CFG.minW}×${CFG.minH}px kell.`); status('A kép megfelel. Menthető GitHubra.','ok'); preview();}catch(err){selectedImage=null; status(err.message,'err'); preview();}});
    qs('#v18-im-save').addEventListener('click',saveImage);
    qs('#v18-im-apply').addEventListener('click',async()=>{await applyImages();status('Képek újraalkalmazva.','ok')});
    qs('#v18-im-refresh').addEventListener('click',async()=>{imageIndex=null;await loadIndex();await applyImages();status('image-index.json újratöltve.','ok')});
    fillTargetSelect(); preview();
  }

  async function saveImage(){
    try{
      const token=(qs('#v18-im-token')?.value||getToken()).trim(); if(!token)throw new Error('GitHub token szükséges a mentéshez.'); setToken(token);
      if(!selectedFile||!selectedImage)throw new Error('Válassz ki egy megfelelő képet.');
      const cat=qs('#v18-im-cat').value; const sub=qs('#v18-im-subcat')?.value||'general'; const target=qs('#v18-im-target').value; const custom=qs('#v18-im-custom').value;
      const id=target==='__custom'?slug(custom):target; if(!id)throw new Error('Válassz cél elemet vagy adj meg egyedi azonosítót.');
      const filename=id+'.'+ext(selectedFile.name,selectedFile.type); const path=(CFG.cats[cat]||'assets/images')+(sub==='general'?'':'/'+slug(sub))+'/'+filename;
      status('Kép feltöltése folyamatban…','warn');
      const oldFile=await ghGet(path,token); const imgB64=await fileToB64(selectedFile);
      await ghPut(path,imgB64,'Add managed image '+path,token,oldFile&&oldFile.sha);
      status('image-index.json frissítése…','warn');
      let idx=await loadIndex(); idx=Object.assign({version:1,fish:{},gear:{},bait:{},places:{},meta:{}},idx||{}); idx[cat]=idx[cat]||{}; idx.meta=idx.meta||{}; idx[cat][id]=path; idx.meta[cat+':'+id]={subcategory:sub,subcategoryLabel:subLabel(cat,sub),updatedAt:new Date().toISOString()}; idx.updatedAt=new Date().toISOString();
      const oldIdx=await ghGet(CFG.indexPath,token); await ghPut(CFG.indexPath,textB64(JSON.stringify(idx,null,2)+'\n'),'Update managed image index',token,oldIdx&&oldIdx.sha);
      imageIndex=idx; localStorage.setItem(STORE.index,JSON.stringify(idx)); await applyImages(); status('Kép feltöltve és hozzárendelve: '+path,'ok');
    }catch(err){status(err.message||String(err),'err')}
  }

  function setCardImage(card,src){
    const wrap=card.querySelector('.fish-img-wrap,.gear-img-wrap,.bait-img-wrap,.item-img-wrap,.card-img-wrap');
    if(wrap){wrap.innerHTML=`<img class="v18-managed-img" src="${src}" alt="">`; return true;}
    return false;
  }
  async function applyImages(){
    const idx=await loadIndex();
    qsa('.fish-card').forEach(card=>{const n=card.querySelector('.fish-name-sci,.fish-name,.item-name'); const key=slug(n&&n.textContent); const src=idx.fish&&idx.fish[key]; if(src)setCardImage(card,src);});
    qsa('#page-gear .item-list-card,.gear-card').forEach(card=>{const n=card.querySelector('.item-name,.gear-name'); const key=slug(n&&n.textContent); const src=idx.gear&&idx.gear[key]; if(src)setCardImage(card,src);});
    qsa('#page-baits .item-list-card,.bait-card').forEach(card=>{const n=card.querySelector('.item-name,.bait-name'); const key=slug(n&&n.textContent); const src=idx.bait&&idx.bait[key]; if(src)setCardImage(card,src);});
  }

  function boot(){loadIndex().then(applyImages); setTimeout(injectPanel,700); setTimeout(applyImages,1200); document.addEventListener('click',()=>setTimeout(applyImages,80),true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.v18ApplyManagedImages=applyImages;
})();