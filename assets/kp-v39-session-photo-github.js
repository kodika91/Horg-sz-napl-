(function(){
if(window.KP_V39_SESSION_PHOTO_GITHUB)return;window.KP_V39_SESSION_PHOTO_GITHUB=true;
const DATA={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
const FULL_MB=1.2,FULL_SIDE=1600,THUMB_SIDE=360;
let pending=[],uploading=false,origRead=FileReader.prototype.readAsDataURL;
const slug=s=>String(s||'kep').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'kep';
const pad=n=>String(n).padStart(2,'0');
const enc=s=>btoa(unescape(encodeURIComponent(String(s||''))));
function cfg(){let c={};try{c=typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||'{}')}catch(e){}return{owner:DATA.owner,repo:DATA.repo,branch:c.branch||DATA.branch,root:(c.root||DATA.root).replace(/^\/+|\/+$/g,''),token:(c.token||localStorage.getItem('v18_github_token')||'').trim()}}
function api(c,p){return 'https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+p.split('/').map(encodeURIComponent).join('/')}
async function gh(c,u,o){let r=await fetch(u,{...(o||{}),headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28',...((o&&o.headers)||{})}}),t=await r.text(),d;try{d=t?JSON.parse(t):null}catch(e){d={message:t}}if(!r.ok){let er=new Error((d&&d.message)||('GitHub hiba '+r.status));er.status=r.status;throw er}return d}
async function get(c,p){try{return await gh(c,api(c,p)+'?ref='+c.branch+'&t='+Date.now())}catch(e){if(e.status===404)return null;throw e}}
async function put(c,p,b64,msg){let old=await get(c,p),body={message:msg,content:b64,branch:c.branch};if(old&&old.sha)body.sha=old.sha;return gh(c,api(c,p),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function toB64(b){return new Promise((res,rej)=>{let fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;origRead.call(fr,b)})}
function loadImg(f){return new Promise((res,rej)=>{let u=URL.createObjectURL(f),im=new Image();im.onload=()=>res({u,im,w:im.naturalWidth,h:im.naturalHeight});im.onerror=()=>rej(new Error('A képet nem tudta beolvasni a böngésző.'));im.src=u})}
function cblob(c,q){return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Tömörítési hiba')),'image/jpeg',q))}
async function compress(f,maxSide,maxMb,q0){let ii=await loadImg(f),w=ii.w,h=ii.h,s=Math.min(1,maxSide/Math.max(w,h));w=Math.max(1,Math.round(w*s));h=Math.max(1,Math.round(h*s));let cv=document.createElement('canvas');cv.width=w;cv.height=h;let x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(ii.im,0,0,w,h);let q=q0,b=await cblob(cv,q);while(maxMb&&b.size>maxMb*1024*1024&&q>.42){q-=.08;b=await cblob(cv,q)}return b}
function blobDataUrl(b){return new Promise((res,rej)=>{let fr=new FileReader();fr.onload=()=>res(String(fr.result));fr.onerror=rej;origRead.call(fr,b)})}
function status(m){try{typeof showToast==='function'&&showToast(m)}catch(e){}console.log('[KP v39]',m)}
async function uploadPending(p){let c=cfg();if(!c.token)throw new Error('GitHub token hiányzik.');let full=await compress(p.file,FULL_SIDE,FULL_MB,.82),thumb=await compress(p.file,THUMB_SIDE,.18,.55);p.thumb=await blobDataUrl(thumb);let b64=await toB64(full);await put(c,p.path,b64,'KapásPont túra/fogás kép mentés');p.done=true;p.bytes=full.size;status('Kép GitHubra mentve.');linkPendingToDb()}
function makePath(file){let d=new Date(),date=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),ts=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'_'+Math.random().toString(36).slice(2,7);return cfg().root+'/images/sessions/'+date+'/'+ts+'_'+slug(file.name).replace(/_jpe?g$|_png$|_webp$/,'')+'.jpg'}
function queueFile(file,input){if(!file||!String(file.type||'').startsWith('image/'))return;if(file.size>35*1024*1024){status('A kép túl nagy. Maximum 35 MB.');return}let p={file,input,path:makePath(file),created:Date.now(),done:false,used:false,thumb:null};pending.push(p);uploadPending(p).catch(e=>{p.error=e.message;status('Kép GitHub mentési hiba: '+e.message)});return p}
document.addEventListener('change',e=>{let inp=e.target;if(inp&&inp.type==='file'&&inp.files&&inp.files[0]&&String(inp.files[0].type||'').startsWith('image/'))queueFile(inp.files[0],inp)},true);
FileReader.prototype.readAsDataURL=function(blob){if(blob&&String(blob.type||'').startsWith('image/')&&!blob.__kpV39Internal){let self=this;compress(blob,THUMB_SIDE,.18,.55).then(b=>blobDataUrl(b)).then(url=>{try{Object.defineProperty(self,'result',{value:url,configurable:true})}catch(e){self._kpResult=url}let ev={target:self,currentTarget:self,type:'load'};if(typeof self.onload==='function')self.onload(ev);if(typeof self.onloadend==='function')self.onloadend(ev)}).catch(()=>origRead.call(self,blob));return}return origRead.call(this,blob)};
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY||'kapaspont_db')||'{}')}catch(e){return {}}}
function save(d){try{if(typeof saveDB==='function'){saveDB(d);return}if(window.DB_KEY)localStorage.setItem(window.DB_KEY,JSON.stringify(d))}catch(e){console.warn(e)}}
function countCatches(d){let n=0;(d.sessions||[]).forEach(s=>n+=(s.catches||[]).length);return n}
function candidate(){return pending.find(p=>p.done&&!p.used)||pending.find(p=>!p.used)}
function attach(obj,p){if(!obj||!p)return false;obj.photo=p.thumb||obj.photo||'';obj.photoPath=p.path;obj.photoStorage='github';obj.photoRef={storage:'github',path:p.path,thumb:p.thumb||obj.photo||'',bytes:p.bytes||0,createdAt:new Date().toISOString()};p.used=true;return true}
function linkPendingToDb(){let d=db(),changed=false,p=candidate();if(!p)return;let sessions=d.sessions||[];for(let si=sessions.length-1;si>=0&&!changed;si--){let s=sessions[si];let cs=s.catches||[];for(let i=cs.length-1;i>=0;i--){let c=cs[i];if(c&&c.photo&&!c.photoPath){changed=attach(c,p);break}}
let evs=s.events||[];for(let i=evs.length-1;i>=0&&!changed;i--){let ev=evs[i];if(ev&&ev.photo&&!ev.photoPath)changed=attach(ev,p)}}
if(changed){save(d);try{typeof renderStorageOverview==='function'&&renderStorageOverview();typeof renderSessionDetail==='function'&&renderSessionDetail()}catch(e){}status('A kép helyben csak kis előnézetként maradt, az eredeti GitHubon van.')}}
['addActiveCatch','saveActiveSession','saveSession','addSessionEvent','addActiveEvent'].forEach(fn=>{let old=window[fn];if(typeof old==='function'&&!old.__kp39){let nw=function(){let r=old.apply(this,arguments);setTimeout(linkPendingToDb,500);setTimeout(linkPendingToDb,1800);return r};nw.__kp39=true;window[fn]=nw}});
setInterval(linkPendingToDb,2500);
status('Túra/fogás kép GitHub hotfix aktív.');
})();