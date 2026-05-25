/* kp-mod-bait-form-image-upload-fix.js — Csali hozzáadás kép méret + GitHub feltöltés
 * v1.1 · Fontos javítás: nem méretezi át általánosan az appon keresztül feltöltött képeket, csak a Csalik oldali csali képeket.
 */
(function(){
'use strict';
if(window.KP_BAIT_FORM_IMAGE_UPLOAD_FIX_V11)return;
window.KP_BAIT_FORM_IMAGE_UPLOAD_FIX_V11=true;

const CFG={repo:'kodika91/Horg-sz-napl-',branch:'main',indexPath:'assets/image-index.json',folder:'assets/bait/bait',tokenKey:'v18_github_token'};
let pickedFile=null,pickedDataUrl='',pickedAt=0;
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function visible(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el);const r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>20&&r.height>20}
function txt(el){return String(el&&el.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'csali'}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[bait-img]',m)}catch(e){console.log('[bait-img]',m)}}
function isBaitsPage(){const p=qs('#page-baits');if(p&&p.classList&&p.classList.contains('active'))return true;return txt(document.body).includes('csalik')}
function token(){
  const own=(localStorage.getItem(CFG.tokenKey)||'').trim();if(own)return own;
  try{const sync=JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}');return String(sync.token||'').trim()}catch(e){}
  return '';
}
function textB64(t){return btoa(unescape(encodeURIComponent(t)))}
function dataUrlToB64(d){return String(d||'').split(',')[1]||''}
function findPanel(el){
  let n=el;
  for(let i=0;n&&n!==document.body&&i<12;i++,n=n.parentElement){
    const t=txt(n), inputs=n.querySelectorAll('input,textarea,select').length;
    if(visible(n)&&inputs>=2&&(t.includes('csali')||t.includes('etet'))&&(t.includes('mentes')||t.includes('hozzaadas')||t.includes('kep')||t.includes('foto')))return n;
  }
  return qs('#page-baits')||document.body;
}
function findName(panel){
  const candidates=qsa('input,textarea',panel).filter(visible).filter(i=>String(i.type||'').toLowerCase()!=='file');
  let named=candidates.find(i=>/név|nev|name|csali/i.test(String(i.placeholder||'')+' '+String(i.name||'')+' '+String(i.id||''))&&String(i.value||'').trim());
  if(named)return named.value.trim();
  const first=candidates.find(i=>String(i.value||'').trim());
  return first?String(first.value).trim():'';
}
function clearBadInlineOutsideBaits(){
  qsa('img.v18-managed-img').forEach(img=>{
    if(img.closest('#page-baits'))return;
    ['width','height','maxWidth','maxHeight','minWidth','minHeight','flex','borderRadius'].forEach(p=>img.style[p]='');
    img.style.objectFit='cover';
    img.style.display='block';
  });
}
function markThumbs(root=document){
  const scope=(root&&root.closest&&root.closest('#page-baits'))||qs('#page-baits');
  if(!scope)return;
  qsa('.item-icon img.v18-managed-img,.card-icon img.v18-managed-img,.bait-img-wrap img.v18-managed-img,.item-img-wrap img.v18-managed-img,img.photo-preview-small.v18-managed-img',scope).forEach(img=>{
    const inIcon=!!img.closest('.item-icon,.card-icon,.bait-img-wrap,.item-img-wrap');
    if(inIcon){
      img.style.width='100%';img.style.height='100%';img.style.maxWidth='100%';img.style.maxHeight='100%';img.style.minWidth='0';img.style.minHeight='0';img.style.flex='';
    }else{
      img.style.width='48px';img.style.height='48px';img.style.maxWidth='48px';img.style.maxHeight='48px';img.style.minWidth='48px';img.style.minHeight='48px';img.style.flex='0 0 48px';
    }
    img.style.objectFit='cover';img.style.borderRadius='12px';img.style.display='block';
  });
  clearBadInlineOutsideBaits();
}
async function fileToPreparedDataUrl(file){
  const raw=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result));fr.onerror=rej;fr.readAsDataURL(file)});
  try{
    const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=raw});
    const maxSide=1400;
    let w=img.naturalWidth,h=img.naturalHeight;
    const scale=Math.min(1,maxSide/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg',0.86);
  }catch(e){return raw;}
}
async function ghGet(path,tok){
  const r=await fetch(`https://api.github.com/repos/${CFG.repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${CFG.branch}`,{headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json'}});
  if(r.status===404)return null;if(!r.ok)throw new Error('GitHub lekérés hiba: '+r.status);return await r.json();
}
async function ghPut(path,b64,msg,tok,sha){
  const body={message:msg,content:b64,branch:CFG.branch};if(sha)body.sha=sha;
  const r=await fetch(`https://api.github.com/repos/${CFG.repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){let s='';try{s=await r.text()}catch(e){}throw new Error('GitHub mentés hiba: '+r.status+' '+s.slice(0,160));}
  return await r.json();
}
async function uploadForPanel(panel){
  if(!pickedFile||!pickedDataUrl||Date.now()-pickedAt>15*60*1000)return;
  const name=findName(panel);if(!name)return;
  const tok=token();if(!tok){toast('A csali kép helyben megjelenik, de GitHub token nélkül nem tudtam feltölteni.');return;}
  const id=slug(name);const path=`${CFG.folder}/${id}.jpg`;
  try{
    toast('Csali kép feltöltése GitHubra…');
    const old=await ghGet(path,tok);
    await ghPut(path,dataUrlToB64(pickedDataUrl),'Add bait image '+path,tok,old&&old.sha);
    let idx={version:1,fish:{},gear:{},bait:{},places:{},meta:{}};
    try{const oldIdx=await ghGet(CFG.indexPath,tok);if(oldIdx&&oldIdx.content){idx=JSON.parse(decodeURIComponent(escape(atob(String(oldIdx.content||'').replace(/\n/g,'')))));idx.__sha=oldIdx.sha;}}catch(e){}
    idx=Object.assign({version:1,fish:{},gear:{},bait:{},places:{},meta:{}},idx||{});
    idx.bait=idx.bait||{};idx.meta=idx.meta||{};idx.bait[id]=path;idx.meta['bait:'+id]={subcategory:'bait',subcategoryLabel:'Csali',updatedAt:new Date().toISOString()};idx.updatedAt=new Date().toISOString();
    const oldIdx=await ghGet(CFG.indexPath,tok);
    await ghPut(CFG.indexPath,textB64(JSON.stringify(idx,null,2)+'\n'),'Update bait image index',tok,oldIdx&&oldIdx.sha);
    localStorage.setItem('v18_image_index_cache',JSON.stringify(idx));
    if(typeof window.v18ApplyManagedImages==='function')setTimeout(()=>window.v18ApplyManagedImages(),500);
    toast('Csali kép feltöltve és hozzárendelve.');
  }catch(err){console.warn('[bait-img-upload]',err);toast('A csali mentve, de a kép GitHub feltöltése nem sikerült: '+(err&&err.message||err));}
}
function previewLocal(file,input){
  const panel=findPanel(input);
  fileToPreparedDataUrl(file).then(d=>{
    pickedDataUrl=d;pickedFile=file;pickedAt=Date.now();
    let img=panel.querySelector('img.photo-preview-small,img.bait-preview,img.preview,img.v18-managed-img');
    if(!img){
      const box=panel.querySelector('.photo-preview,.image-preview,.preview-box,.item-icon,.card-icon')||input.parentElement;
      img=document.createElement('img');img.className='photo-preview-small v18-managed-img';box&&box.appendChild(img);
    }
    img.src=d;markThumbs(panel);
  });
}
document.addEventListener('change',function(e){
  const input=e.target;
  if(!isBaitsPage()||!input||String(input.type||'').toLowerCase()!=='file')return;
  const file=input.files&&input.files[0];if(!file||!/^image\//.test(file.type||''))return;
  previewLocal(file,input);
},true);
document.addEventListener('click',function(e){
  if(!isBaitsPage())return;
  const b=e.target&&e.target.closest&&e.target.closest('button');if(!b)return;
  if(/mentés|mentes|hozzáadás|hozzaadas|save|add/i.test(String(b.textContent||''))){
    const panel=findPanel(b);setTimeout(()=>uploadForPanel(panel),200);
  }
  setTimeout(()=>markThumbs(),100);setTimeout(()=>markThumbs(),700);
},true);
setInterval(markThumbs,1200);setTimeout(markThumbs,600);setTimeout(markThumbs,1600);
window.kpBaitImageUploadDebug=function(){return{picked:!!pickedFile,hasData:!!pickedDataUrl,token:!!token(),ageSec:pickedAt?Math.round((Date.now()-pickedAt)/1000):null}};
console.log('[bait-form-image-upload-fix] v1.1 aktív · csak csali képeket méretez');
})();
