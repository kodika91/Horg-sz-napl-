/* ============================================================================
 * KapásPont · kp-v38-session-photo-to-github.js  (v51: src-alapú párosítás)
 * ----------------------------------------------------------------------------
 * v51 változások:
 *   - tagDetailImages() index-alapú párosítás helyett src (base64) -> photoPath
 *     szótárat használ: nem téved el, ha a DOM-sorrend és az adatsorrend eltér.
 *   - v30 hookImages() no-op lett, v37 kikerült az index.html-ből.
 *     Egyetlen képnagyító marad: #kp-v50-view (ez a fájl).
 * ==========================================================================*/
(function(){
if(window.KP_V38_SESSION_PHOTO_TO_GITHUB)return;window.KP_V38_SESSION_PHOTO_TO_GITHUB=true;
const DEF={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
const MAX_SIDE=2048,MAX_MB=3;
const pad=n=>String(n).padStart(2,'0');
const slug=s=>String(s||'kep').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'kep';
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[KP kep]',m)}catch(e){console.log('[KP kep]',m)}}
function cfg(){let c={};try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}')}catch(e){}return{owner:c.owner||DEF.owner,repo:c.repo||DEF.repo,branch:c.branch||DEF.branch,root:String(c.root||DEF.root).replace(/^\/+|\/+$/g,'')||DEF.root,token:(c.token||localStorage.getItem('v18_github_token')||'').trim()}}
function apiPath(p){return String(p).split('/').map(encodeURIComponent).join('/')}
async function gh(c,url,opt){const r=await fetch(url,{...(opt||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((opt&&opt.headers)||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch(e){d={message:t}}if(!r.ok){const er=new Error((d&&d.message)||('GitHub API hiba: '+r.status));er.status=r.status;throw er}return d}
async function getSha(c,p){try{const d=await gh(c,'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p)+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now());return d&&d.sha}catch(e){return null}}
async function put(c,p,b64,msg){const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(p);const sha=await getSha(c,p);const body={message:msg||'KapasPont kep mentes',content:b64,branch:c.branch};if(sha)body.sha=sha;return gh(c,url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function blobToB64(b){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(b)})}
function imgInfo(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>res({url:u,img:im,w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>rej(new Error('A kepet nem tudta beolvasni a bongeszo.'));im.src=u})}
function canvasBlob(cv,q){return new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('Keptomoritesi hiba')),'image/jpeg',q))}
async function compress(file){const ii=await imgInfo(file);let w=ii.w,h=ii.h;const sc=Math.min(1,MAX_SIDE/Math.max(w,h));w=Math.max(1,Math.round(w*sc));h=Math.max(1,Math.round(h*sc));const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(ii.img,0,0,w,h);let q=.92,b=await canvasBlob(cv,q);while(b.size>MAX_MB*1024*1024&&q>.72){q-=.06;b=await canvasBlob(cv,q)}return b}
function makePath(file){const d=new Date();const day=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());const ts=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'_'+Math.random().toString(36).slice(2,7);return cfg().root+'/images/sessions/'+day+'/'+ts+'_'+slug(file.name).replace(/\.(jpg|jpeg|png|webp|heic|heif)$/i,'')+'.jpg'}

function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return {}}}
function savedb(d){try{if(typeof saveDB==='function')saveDB(d);else if(window.DB_KEY)localStorage.setItem(window.DB_KEY,JSON.stringify(d))}catch(e){console.warn(e)}}

const PATHMAP={};   // 900px base64 -> github path

function wrapPhotoHandlers(){
  if(typeof window.handleModalPhoto==='function' && !window.handleModalPhoto.__kp){
    const orig=window.handleModalPhoto;
    window.handleModalPhoto=function(input,type){
      const file=input&&input.files&&input.files[0];
      if(file && (type==='activeCatch'||type==='editCatch') && String(file.type||'').startsWith('image/')){ startUpload(file); }
      return orig.apply(this,arguments);
    };
    window.handleModalPhoto.__kp=true;
  }
  if(typeof window.handleCatchPhoto==='function' && !window.handleCatchPhoto.__kp){
    const orig2=window.handleCatchPhoto;
    window.handleCatchPhoto=function(i,input){
      const file=input&&input.files&&input.files[0];
      if(file && String(file.type||'').startsWith('image/')){ startUpload(file); }
      return orig2.apply(this,arguments);
    };
    window.handleCatchPhoto.__kp=true;
  }
}

function make900(file){
  return new Promise((res,rej)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{let w=img.width,h=img.height;const scale=Math.min(1,900/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const cv=document.createElement('canvas');cv.width=w;cv.height=h;const ctx=cv.getContext('2d');ctx.drawImage(img,0,0,w,h);res(cv.toDataURL('image/jpeg',0.8));};
      img.onerror=rej;img.src=e.target.result;
    };
    reader.onerror=rej;reader.readAsDataURL(file);
  });
}

async function startUpload(file){
  const c=cfg();
  if(!c.token){toast('GitHub token hianyzik, a kep csak helyben marad.');return}
  if(file.size>35*1024*1024){toast('A kep tul nagy. Maximum 35 MB.');return}
  try{
    const key=await make900(file);
    const path=makePath(file);
    const blob=await compress(file);
    await put(c,path,await blobToB64(blob),'KapasPont fogas kep');
    PATHMAP[key]=path;
    toast('Kep GitHubra mentve.');
    setTimeout(linkDb,150);setTimeout(linkDb,800);setTimeout(linkDb,2000);
  }catch(e){toast('GitHub kepfeltoltesi hiba: '+(e.message||e))}
}

function attach(o,path){if(!o||o.photoPath)return false;o.photoPath=path;o.photoStorage='github';o.photoRef={storage:'github',path:path,createdAt:new Date().toISOString()};return true;}
function linkDb(){
  const keys=Object.keys(PATHMAP);if(!keys.length)return;
  const d=getdb();let changed=false;const sessions=(d.sessions)||[];
  for(let si=sessions.length-1;si>=0;si--){
    const s=sessions[si];if(!s)continue;
    const cs=(s.catches)||[];
    for(let i=cs.length-1;i>=0;i--){const ca=cs[i];if(ca&&!ca.photoPath&&ca.photo&&PATHMAP[ca.photo]){if(attach(ca,PATHMAP[ca.photo]))changed=true;}}
    const ev=(s.events)||[];
    for(let i=ev.length-1;i>=0;i--){const e=ev[i];if(e&&!e.photoPath&&e.photo&&PATHMAP[e.photo]){if(attach(e,PATHMAP[e.photo]))changed=true;}}
    if(s.photo&&!s.photoPath&&PATHMAP[s.photo]){if(attach(s,PATHMAP[s.photo]))changed=true;}
  }
  if(changed){savedb(d);try{typeof renderSessionDetail==='function'&&renderSessionDetail()}catch(e){}try{typeof renderActiveSessionHome==='function'&&renderActiveSessionHome()}catch(e){}}
}

['saveActiveCatch','saveSessionCatch','addActiveCatch','renderSessionDetail','renderActiveSessionHome'].forEach(fn=>{const old=window[fn];if(typeof old==='function'&&!old.__kp38){const nw=function(){const r=old.apply(this,arguments);setTimeout(linkDb,150);setTimeout(linkDb,700);return r};nw.__kp38=true;window[fn]=nw}});
setInterval(function(){wrapPhotoHandlers();linkDb();},2000);
wrapPhotoHandlers();

/* ====== eles megjelenites + sajat nagyito ====== */
const _urlCache={},_inflight={};
function pathOf(o){return o&&(o.photoPath||(o.photoRef&&(o.photoRef.path||o.photoRef.relativePath))||'')}
function loadFull(path){
  if(!path)return Promise.resolve(null);
  if(_urlCache[path])return Promise.resolve(_urlCache[path]);
  if(_inflight[path])return _inflight[path];
  const c=cfg();if(!c.token)return Promise.resolve(null);
  const url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+apiPath(path)+'?ref='+encodeURIComponent(c.branch);
  const p=fetch(url,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}})
    .then(r=>{if(!r.ok)throw new Error('GitHub '+r.status);return r.json()})
    .then(d=>{const raw=String((d&&d.content)||'').replace(/\n/g,'');if(!raw)throw new Error('ures');const bin=atob(raw),len=bin.length,bytes=new Uint8Array(len);for(let i=0;i<len;i++)bytes[i]=bin.charCodeAt(i);const lower=path.toLowerCase();const type=lower.endsWith('.png')?'image/png':lower.endsWith('.webp')?'image/webp':'image/jpeg';const u=URL.createObjectURL(new Blob([bytes],{type}));_urlCache[path]=u;delete _inflight[path];return u})
    .catch(e=>{delete _inflight[path];console.warn('[KP] eles nem toltheto:',e&&e.message||e);return null});
  _inflight[path]=p;return p;
}
function activeSession(d){const ss=(d.sessions)||[];const id=d&&d.activeSessionId;if(id!=null){const b=ss.filter(s=>s&&String(s.id)===String(id))[0];if(b)return b;}
  if(typeof currentSessionDetailId!=='undefined'&&currentSessionDetailId!=null){const b2=ss.filter(s=>s&&String(s.id)===String(currentSessionDetailId))[0];if(b2)return b2;}
  return ss[ss.length-1]||null;}
function tagDetailImages(){
  const wrap=document.getElementById('session-detail-wrap')||document;
  const imgs=wrap.querySelectorAll('.catch-photo-preview, #session-detail-wrap img');
  if(!imgs.length)return;
  const d=getdb();const s=activeSession(d);if(!s)return;
  const pathMap={};
  (s.catches||[]).forEach(c=>{if(c&&c.photo&&pathOf(c))pathMap[c.photo]=pathOf(c);});
  (s.events||[]).forEach(e=>{if(e&&e.photo&&pathOf(e))pathMap[e.photo]=pathOf(e);});
  if(s.photo&&pathOf(s))pathMap[s.photo]=pathOf(s);
  Array.prototype.forEach.call(imgs,function(img){
    if(img.dataset.full)return;
    const src=img.getAttribute('src')||img.src||'';
    if(src&&pathMap[src])img.dataset.full=pathMap[src];
  });
}
function ownViewer(){let v=document.getElementById('kp-v50-view');if(v)return v;v=document.createElement('div');v.id='kp-v50-view';v.style.cssText='position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.9);padding:10px';v.innerHTML='<div style="position:relative;width:96vw;height:88dvh;display:flex;align-items:center;justify-content:center"><button id="kp-v50-x" style="position:absolute;right:8px;top:8px;border:0;border-radius:50%;width:42px;height:42px;background:rgba(0,0,0,.55);color:#fff;font-size:26px;z-index:2">&times;</button><div id="kp-v50-spin" style="position:absolute;color:#cfe;font-size:13px">Eles kep betoltese...</div><img alt="Fogas foto" style="max-width:100%;max-height:100%;object-fit:contain;display:block;border-radius:14px"></div>';document.body.appendChild(v);v.addEventListener('click',e=>{if(e.target===v||e.target.id==='kp-v50-x')v.style.display='none'});return v;}
function openOwn(img){const v=ownViewer();const out=v.querySelector('img');const spin=v.querySelector('#kp-v50-spin');out.src=img.getAttribute('src')||'';v.style.display='flex';const path=img.dataset.full;if(path){spin.style.display='block';loadFull(path).then(u=>{if(u)out.src=u;spin.style.display='none'}).catch(()=>spin.style.display='none')}else{spin.style.display='none'}}
document.addEventListener('click',function(e){
  const img=e.target&&e.target.closest?e.target.closest('#session-detail-wrap img,.catch-photo-preview'):null;
  if(img){ tagDetailImages(); if(img.dataset.full){ e.stopImmediatePropagation();e.preventDefault();openOwn(img);return false; } }
  setTimeout(tagDetailImages,150);
},true);
setInterval(tagDetailImages,1500);

console.log('[KP v51] src-alapu parositas + sajat eles nagyito aktiv');
})();
