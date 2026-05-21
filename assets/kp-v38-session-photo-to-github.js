/* ============================================================================
 * KapásPont · kp-v38-session-photo-to-github.js  (v42 javítás: tartalom-alapú párosítás)
 * ----------------------------------------------------------------------------
 * Ez a fájl a meglévő feltöltő TELJES cseréje. Megtartja az eredeti működést
 * (auto-feltöltés GitHubra, tömörítés, thumbnail), de KÉT dolgot javít:
 *
 *  1) PÁROSÍTÁS (a fő hiba): az eredeti linkDb "első szabad fogást keresett",
 *     ami gyors egymásutánban rögzített fogásoknál ÖSSZEKEVERTE a képeket.
 *     Most a feltöltött kép a HOZZÁ TARTOZÓ fogáshoz kötődik, a fogás photo
 *     mezőjének TELJES base64 egyezése alapján (a kép tartalma az azonosító).
 *     Több párhuzamos feltöltés is helyesen párosul.
 *
 *  2) ÉLES MEGJELENÍTÉS: a fogásnézetben a pixeles thumbnail helyett a
 *     GitHub-os eredetit hozza be, a fogás SAJÁT photoPath-ja alapján.
 *
 * A korábbi kísérleti patcheket (kp-v39, kp-v40, kp-v41) NE töltsd be — ez a
 * fájl mindent elvégez. Ezt a fájlt töltsd fel az assets/ mappába ugyanezen a
 * néven (felülírja a régit).
 * ==========================================================================*/
(function(){
if(window.KP_V38_SESSION_PHOTO_TO_GITHUB)return;window.KP_V38_SESSION_PHOTO_TO_GITHUB=true;
const DEF={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
const MAX_SIDE=2048,MAX_MB=3,THUMB_SIDE=360;
const pending=[];let patched=false;
const origRead=FileReader.prototype.readAsDataURL;
const pad=n=>String(n).padStart(2,'0');
const slug=s=>String(s||'kep').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'kep';
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[KP kép]',m)}catch(e){console.log('[KP kép]',m)}}
function cfg(){let c={};try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){}return{owner:c.owner||DEF.owner,repo:c.repo||DEF.repo,branch:c.branch||DEF.branch,root:String(c.root||DEF.root).replace(/^\/+|\/+$/g,'')||DEF.root,token:(c.token||localStorage.getItem('v18_github_token')||'').trim()}}
function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
async function gh(c,url,opt){const r=await fetch(url,{...(opt||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opt&&opt.headers)||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch(e){d={message:t}}if(!r.ok){const er=new Error((d&&d.message)||('GitHub API hiba: '+r.status));er.status=r.status;throw er}return d}
async function get(c,p){try{return await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now())}catch(e){if(e.status===404)return null;throw e}}
async function put(c,p,b64,msg){const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);let sha=null;try{const old=await get(c,p);sha=old&&old.sha}catch(e){}const body={message:msg||'KapásPont kép mentés',content:b64,branch:c.branch};if(sha)body.sha=sha;return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function blobToB64(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;origRead.call(fr,b)})}
function imgInfo(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>res({url:u,img:im,w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>rej(new Error('A képet nem tudta beolvasni a böngésző.'));im.src=u})}
function canvasBlob(c,q){return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Képtömörítési hiba')),'image/jpeg',q))}
async function compress(file,maxSide,maxMb,q0){const ii=await imgInfo(file);let w=ii.w,h=ii.h;const sc=Math.min(1,maxSide/Math.max(w,h));w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(ii.img,0,0,w,h);let q=q0,b=await canvasBlob(cv,q);const qMin=(q0>=.9)?.72:.42;while(maxMb&&b.size>maxMb*1024*1024&&q>qMin){q-=.06;b=await canvasBlob(cv,q)}return b}
function blobDataUrl(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result));fr.onerror=rej;origRead.call(fr,b)})}
function makePath(file){const d=new Date();const day=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());const ts=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'_'+Math.random().toString(36).slice(2,7);return cfg().root+'/images/sessions/'+day+'/'+ts+'_'+slug(file.name).replace(/\.(jpg|jpeg|png|webp|heic|heif)$/i,'')+'.jpg'}

/* ---- A kulcs: minden feltöltött item eltárolja a SAJÁT thumbnailjét.
   A thumbnail (base64) UGYANAZ, amit az app a fogás photo mezőjébe tett,
   ezért pontos kulcsként szolgál a párosításhoz. ---- */
async function queue(file){
  const c=cfg();
  if(!c.token){toast('GitHub token hiányzik, ezért a kép csak helyben marad.');return}
  if(!file||!String(file.type||'').startsWith('image/'))return;
  if(file.size>35*1024*1024){toast('A kép túl nagy. Maximum 35 MB.');return}
  const item={path:makePath(file),thumb:'',done:false,used:false,created:Date.now()};
  pending.push(item);
  try{
    const full=await compress(file,MAX_SIDE,MAX_MB,.92);
    const thumb=await compress(file,THUMB_SIDE,.18,.55);
    item.thumb=await blobDataUrl(thumb);
    await put(c,item.path,await blobToB64(full),'KapásPont túra/fogás kép mentés');
    item.done=true;item.bytes=full.size;
    toast('Kép GitHubra mentve.');
    setTimeout(linkDb,150);setTimeout(linkDb,800);setTimeout(linkDb,2000);
  }catch(e){item.error=e.message;toast('GitHub képfeltöltési hiba: '+e.message)}
}
document.addEventListener('change',e=>{const inp=e.target;if(!inp||inp.type!=='file'||!inp.files||!inp.files[0])return;const f=inp.files[0];if(String(f.type||'').startsWith('image/'))queue(f)},true);

/* A FileReader felülírás: a fogás photo mezőjébe a 360px-es base64 thumbnail
   kerül (kis méret). Ez UGYANAZ a thumbnail, amit a feltöltött item is tárol,
   így a párosítás pontos lesz. */
if(!patched){patched=true;FileReader.prototype.readAsDataURL=function(blob){if(blob&&String(blob.type||'').startsWith('image/')){const self=this;compress(blob,THUMB_SIDE,.18,.55).then(b=>blobDataUrl(b)).then(url=>{try{Object.defineProperty(self,'result',{value:url,configurable:true})}catch(e){}const ev={target:self,currentTarget:self,type:'load'};if(typeof self.onload==='function')self.onload(ev);if(typeof self.onloadend==='function')self.onloadend(ev)}).catch(()=>origRead.call(self,blob));return}return origRead.call(this,blob)}}

function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return {}}}
function savedb(d){try{if(typeof saveDB==='function')saveDB(d);else if(window.DB_KEY)localStorage.setItem(window.DB_KEY,JSON.stringify(d))}catch(e){console.warn(e)}}

/* ====== JAVÍTOTT PÁROSÍTÁS: TARTALOM-ALAPÚ (nem "első szabad") ============
   Minden feltöltött item-et ahhoz a fogáshoz kötünk, amelynek photo mezője
   PONTOSAN egyezik az item thumbnailjével. Így soha nem keveredik össze. */
function attach(obj,it){
  if(!obj||!it)return false;
  obj.photoPath=it.path;
  obj.photoStorage='github';
  obj.photoRef={storage:'github',path:it.path,thumb:it.thumb||'',bytes:it.bytes||0,createdAt:new Date().toISOString()};
  // a photo mezőt MEGTARTJUK thumbnailként (kis méret), hogy offline is legyen előnézet
  if(!obj.photo) obj.photo=it.thumb||'';
  it.used=true;
  return true;
}
function linkDb(){
  let changed=false;
  const d=getdb();
  const sessions=(d.sessions)||[];
  // minden KÉSZ, még fel nem használt feltöltést megpróbálunk pontos egyezéssel kötni
  for(let k=0;k<pending.length;k++){
    const it=pending[k];
    if(!it.done||it.used||!it.thumb)continue;
    let hit=false;
    for(let si=sessions.length-1;si>=0&&!hit;si--){
      const s=sessions[si]; if(!s)continue;
      const cs=(s.catches)||[];
      for(let i=cs.length-1;i>=0&&!hit;i--){
        const ca=cs[i];
        if(ca && !ca.photoPath && String(ca.photo||'')===it.thumb){ hit=attach(ca,it); }
      }
      const ev=(s.events)||[];
      for(let i=ev.length-1;i>=0&&!hit;i--){
        const e=ev[i];
        if(e && !e.photoPath && String(e.photo||'')===it.thumb){ hit=attach(e,it); }
      }
      if(!hit && s.photo && !s.photoPath && String(s.photo)===it.thumb){ hit=attach(s,it); }
    }
    if(hit)changed=true;
  }
  if(changed){
    savedb(d);
    try{typeof renderStorageOverview==='function'&&renderStorageOverview()}catch(e){}
    try{typeof renderSessionDetail==='function'&&renderSessionDetail()}catch(e){}
    try{typeof renderActiveSessionHome==='function'&&renderActiveSessionHome()}catch(e){}
  }
  // takarítás: a régóta kész, de soha nem párosított itemeket egy idő után elengedjük
  const now=Date.now();
  for(let k=0;k<pending.length;k++){const it=pending[k];if(it.done&&!it.used&&now-it.created>120000)it.used=true;}
}

/* a fogásmentő/eseménymentő után párosítunk (a felület ekkor írta be a photo-t) */
['addActiveCatch','saveActiveCatch','saveSessionCatch','saveActiveSession','saveSession','addSessionEvent','addActiveEvent','renderSessionDetail','renderActiveSessionHome'].forEach(fn=>{const old=window[fn];if(typeof old==='function'&&!old.__kp38photo){const nw=function(){const r=old.apply(this,arguments);setTimeout(linkDb,200);setTimeout(linkDb,900);return r};nw.__kp38photo=true;window[fn]=nw}});
setInterval(linkDb,2500);

/* ====== ÉLES MEGJELENÍTÉS (a fogás SAJÁT photoPath-ja alapján) ============ */
const _urlCache={}, _inflight={};
function pathOf(o){return o&&(o.photoPath||(o.photoRef&&(o.photoRef.path||o.photoRef.relativePath))||'')}
function loadFull(path){
  if(!path)return Promise.resolve(null);
  if(_urlCache[path])return Promise.resolve(_urlCache[path]);
  if(_inflight[path])return _inflight[path];
  const c=cfg(); if(!c.token)return Promise.resolve(null);
  const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(path)+'?ref='+encodeURIComponent(c.branch);
  const p=fetch(url,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}})
    .then(r=>{if(!r.ok)throw new Error('GitHub '+r.status);return r.json()})
    .then(d=>{const raw=String((d&&d.content)||'').replace(/\n/g,'');if(!raw)throw new Error('üres');const bin=atob(raw),len=bin.length,bytes=new Uint8Array(len);for(let i=0;i<len;i++)bytes[i]=bin.charCodeAt(i);const lower=path.toLowerCase();const type=lower.endsWith('.png')?'image/png':lower.endsWith('.webp')?'image/webp':'image/jpeg';const u=URL.createObjectURL(new Blob([bytes],{type}));_urlCache[path]=u;delete _inflight[path];return u})
    .catch(e=>{delete _inflight[path];console.warn('[KP kép] éles nem tölthető ('+path+'):',e&&e.message||e);return null});
  _inflight[path]=p;return p;
}
function pathForThumbExact(thumbSrc){
  if(!thumbSrc||thumbSrc.indexOf('data:image')!==0)return null;
  const d=getdb(),sessions=(d.sessions)||[];
  for(let si=0;si<sessions.length;si++){
    const s=sessions[si];if(!s)continue;
    const arrs=[s.catches||[],s.events||[]];
    for(let a=0;a<arrs.length;a++){const arr=arrs[a];for(let i=0;i<arr.length;i++){const o=arr[i];if(o&&String(o.photo||'')===thumbSrc){const p=pathOf(o);if(p)return p}}}
    if(String(s.photo||'')===thumbSrc){const ps=pathOf(s);if(ps)return ps}
  }
  return null;
}
/* A fogáslista képein: ráírjuk az éles GitHub-utat data-full-ba (amíg a base64
   thumbnail még tiszta), és lecseréljük a thumbnailt élesre. A data-full marad,
   így a nagyító biztosan tudja, melyik az éles kép. */
function upgradeImages(){
  const imgs=document.querySelectorAll('#session-detail-wrap img, .catch-photo-preview');
  Array.prototype.forEach.call(imgs,function(img){
    const src=img.getAttribute('src')||'';
    // az utat akkor is rögzítjük, ha már lecseréltük a képet (a nagyítóhoz kell)
    if(!img.dataset.full && src.indexOf('data:image')===0){
      const path=pathForThumbExact(src);
      if(path) img.dataset.full=path;
    }
    if(img.dataset.kpFull)return;
    if(src.indexOf('data:image')!==0)return;
    const path=img.dataset.full||pathForThumbExact(src);
    if(!path)return;
    img.dataset.kpFull='1';
    loadFull(path).then(u=>{if(u){img.src=u}else{img.dataset.kpFull=''}});
  });
}

/* A NAGYÍTÓ nézet (#kp-img-view) éles képpel: amikor a nagyító megnyílik,
   megnézzük, melyik thumbnailt kattintották meg, és a hozzá tartozó data-full
   (vagy a base64-ből visszakeresett) úttal töltjük be az éles képet. */
function upgradeViewer(){
  const v=document.getElementById('kp-img-view');
  if(!v||!v.classList.contains('show'))return;
  const out=v.querySelector('img');
  if(!out||out.dataset.kpFull)return;
  const src=out.getAttribute('src')||'';
  // ha már blob: (éles), kész
  if(src.indexOf('blob:')===0){out.dataset.kpFull='1';return;}
  if(src.indexOf('data:image')!==0)return;
  const path=pathForThumbExact(src);
  if(!path)return;
  out.dataset.kpFull='1';
  loadFull(path).then(u=>{if(u){out.src=u}else{out.dataset.kpFull=''}});
}

/* Amikor egy fogáskép thumbnailjére kattintasz, a nagyító megnyitása UTÁN
   beletöltjük az éles képet. A data-full-t használjuk, ha van. */
document.addEventListener('click',function(e){
  const img=e.target&&e.target.closest?e.target.closest('#session-detail-wrap img,.catch-photo-preview'):null;
  if(img){
    const path=img.dataset.full||pathForThumbExact(img.getAttribute('src')||'');
    if(path){
      // megnyitás után a nagyító képét élesre cseréljük
      setTimeout(function(){
        const v=document.getElementById('kp-img-view');
        const out=v&&v.querySelector('img');
        if(out){out.dataset.kpFull='1';loadFull(path).then(u=>{if(u)out.src=u});}
      },120);
      setTimeout(upgradeViewer,400);
    }
  }
  setTimeout(function(){upgradeImages();upgradeViewer();},150);
  setTimeout(function(){upgradeImages();upgradeViewer();},600);
},true);

setInterval(function(){upgradeImages();upgradeViewer();},1500);

console.log('[KP] session photo GitHub upload + tartalom-alapú párosítás + éles megjelenítés aktív');
})();
