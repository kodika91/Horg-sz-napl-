/* V19 · Aktív horgászat fotólimit / localStorage tárhely hotfix
   Ok: a fogásfotók data:image base64 szövegként kerülnek localStorage-ba, ezért iPhone/Safari alatt pár nagyobb kép után elérhető a kvóta.
   Javítás: fogásfotók erősebb tömörítése + meglévő nagy fogás/esemény képek automatikus optimalizálása. */
(function(){
  const MAX_SIDE=720;
  const JPEG_Q=0.62;
  const OPTIMIZE_THRESHOLD=220000; // dataURL karakterszám felett tömörítjük újra

  function toast(msg){try{window.showToast?window.showToast(msg):console.log('[V19]',msg)}catch(e){console.log('[V19]',msg)}}
  function isDataImg(v){return typeof v==='string' && v.startsWith('data:image/');}
  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
  function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
  async function compressDataUrl(src,maxSide=MAX_SIDE,q=JPEG_Q){
    const img=await loadImage(src);
    let w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
    if(!w||!h)return src;
    const ratio=Math.min(1,maxSide/Math.max(w,h));
    const cw=Math.max(1,Math.round(w*ratio));
    const ch=Math.max(1,Math.round(h*ratio));
    const c=document.createElement('canvas'); c.width=cw; c.height=ch;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#f7f4ee'; ctx.fillRect(0,0,cw,ch);
    ctx.drawImage(img,0,0,cw,ch);
    const out=c.toDataURL('image/jpeg',q);
    return out.length<src.length?out:src;
  }
  async function compressFile(file){
    const raw=await fileToDataUrl(file);
    return await compressDataUrl(raw,MAX_SIDE,JPEG_Q);
  }

  function setModalPhoto(type,data){
    if(type==='bait'){
      const hid=document.getElementById('bf-photo'); if(hid)hid.value=data;
      const prev=document.getElementById('bf-photo-prev'); if(prev)prev.outerHTML=`<img src="${data}" class="photo-preview-small" id="bf-photo-prev">`;
    }
    if(type==='gear'){
      window.currentGearPhoto=data;
      const hid=document.getElementById('gf-photo'); if(hid)hid.value=data;
      const wrap=document.getElementById('gf-photo-prev-wrap'); if(wrap)wrap.innerHTML=`<img src="${data}" class="gear-photo-preview" id="gf-photo-prev">`;
    }
    if(type==='activeCatch'){
      const hid=document.getElementById('ac-photo'); if(hid)hid.value=data;
      const wrap=document.getElementById('ac-photo-prev-wrap'); if(wrap)wrap.innerHTML=`<img src="${data}" class="catch-photo-preview" alt="Fogás fotó">`;
    }
    if(type==='editCatch'){
      const hid=document.getElementById('ec-photo'); if(hid)hid.value=data;
      const wrap=document.getElementById('ec-photo-prev-wrap'); if(wrap)wrap.innerHTML=`<img src="${data}" class="catch-photo-preview" alt="Fogás fotó">`;
    }
  }

  function patchHandleModalPhoto(){
    if(window.__v19PhotoPatchApplied)return;
    const original=window.handleModalPhoto;
    window.handleModalPhoto=async function(input,type){
      try{
        const file=input && input.files && input.files[0];
        if(!file)return;
        if(!file.type || !file.type.startsWith('image/')){toast('Csak képfájlt lehet csatolni.');return;}
        const data=await compressFile(file);
        setModalPhoto(type,data);
        const kb=Math.round(data.length*0.75/1024);
        toast('Kép betöltve és tömörítve. Méret: kb. '+kb+' KB');
      }catch(e){
        console.warn('[V19] fotó tömörítés hiba, eredeti kezelő fut:',e);
        if(typeof original==='function')return original(input,type);
        toast('A kép betöltése nem sikerült.');
      }
    };
    window.__v19PhotoPatchApplied=true;
  }

  async function optimizeStoredPhotos(){
    try{
      if(typeof window.getDB!=='function' || typeof window.saveDB!=='function')return;
      const db=window.getDB();
      let changed=0, savedChars=0;
      for(const s of (db.sessions||[])){
        for(const c of (s.catches||[])){
          if(isDataImg(c.photo) && c.photo.length>OPTIMIZE_THRESHOLD){
            const before=c.photo.length;
            c.photo=await compressDataUrl(c.photo,MAX_SIDE,JPEG_Q);
            if(c.photo.length<before){changed++; savedChars+=before-c.photo.length;}
          }
        }
        for(const e of (s.events||[])){
          if(isDataImg(e.photo) && e.photo.length>OPTIMIZE_THRESHOLD){
            const before=e.photo.length;
            e.photo=await compressDataUrl(e.photo,MAX_SIDE,JPEG_Q);
            if(e.photo.length<before){changed++; savedChars+=before-e.photo.length;}
          }
        }
      }
      if(changed){
        window.saveDB(db);
        try{window.renderStorageOverview&&window.renderStorageOverview();window.renderActiveSessionHome&&window.renderActiveSessionHome();window.renderSessionDetail&&window.renderSessionDetail();}catch(e){}
        toast('Fotótár optimalizálva: '+changed+' kép, kb. '+Math.round(savedChars*0.75/1024)+' KB felszabadítva.');
      }
    }catch(e){console.warn('[V19] meglévő képek optimalizálása sikertelen:',e);}
  }

  function boot(){
    patchHandleModalPhoto();
    setTimeout(patchHandleModalPhoto,1200);
    setTimeout(optimizeStoredPhotos,1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.v19OptimizeSessionPhotos=optimizeStoredPhotos;
})();
