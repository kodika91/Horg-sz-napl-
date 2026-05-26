// kp-mod-photo-idb.js — base64 fotók IndexedDB-ben, localStorage slim
// v1.0 · saveDB/getDB intercept; kpSlimDbForStorage export
(function(){
'use strict';
if(window.KP_MOD_PHOTO_IDB_V1)return;
window.KP_MOD_PHOTO_IDB_V1=true;

const IDB_NAME='kp_photos';
const IDB_STORE='photos';
let _idb=null;
const _cache=Object.create(null);

function openIdb(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    const req=indexedDB.open(IDB_NAME,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(IDB_STORE))req.result.createObjectStore(IDB_STORE);};
    req.onsuccess=()=>{_idb=req.result;res(_idb);};
    req.onerror=()=>rej(req.error);
  });
}

function idbSet(key,val){return openIdb().then(db=>new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(val,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);}));}

function idbGetAll(){return openIdb().then(db=>new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readonly');const out={};const req=tx.objectStore(IDB_STORE).openCursor();req.onsuccess=e=>{const cur=e.target.result;if(cur){out[cur.key]=cur.value;cur.continue();}else res(out);};req.onerror=()=>rej(req.error);}));}

function isB64(v){return typeof v==='string'&&v.startsWith('data:image');}
function genKey(){return 'kp_p_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

function slimDbForStorage(db){
  if(!db||typeof db!=='object')return db;
  let slim;
  try{slim=JSON.parse(JSON.stringify(db));}catch(e){return db;}
  const extract=(origArr,slimArr)=>{
    if(!Array.isArray(origArr)||!Array.isArray(slimArr))return;
    for(let i=0;i<origArr.length;i++){
      const orig=origArr[i];const s=slimArr[i];
      if(!orig||!s||!isB64(orig.photo))continue;
      if(!orig.photoIdbKey)orig.photoIdbKey=genKey();
      s.photoIdbKey=orig.photoIdbKey;
      _cache[orig.photoIdbKey]=orig.photo;
      idbSet(orig.photoIdbKey,orig.photo).catch(e=>console.warn('[KP photo IDB]',e));
      delete s.photo;
    }
  };
  if(Array.isArray(db.sessions)&&Array.isArray(slim.sessions)){
    for(let i=0;i<db.sessions.length;i++){
      const os=db.sessions[i],ss=slim.sessions[i];if(!os||!ss)continue;
      extract(os.catches,ss.catches);
      extract(os['fogások'],ss['fogások']);
      extract(os.fogasok,ss.fogasok);
    }
  }
  extract(db.gear,slim.gear);
  extract(db.baits,slim.baits);
  return slim;
}
window.kpSlimDbForStorage=slimDbForStorage;

function injectPhotos(db){
  if(!db||typeof db!=='object')return;
  const inj=arr=>{if(!Array.isArray(arr))return;arr.forEach(o=>{if(!o||o.photo||!o.photoIdbKey)return;const v=_cache[o.photoIdbKey];if(v)o.photo=v;});};
  if(Array.isArray(db.sessions))db.sessions.forEach(s=>{if(!s)return;inj(s.catches);inj(s['fogások']);inj(s.fogasok);});
  inj(db.gear);inj(db.baits);
}

async function loadCache(){
  try{const all=await idbGetAll();Object.assign(_cache,all);console.log('[KP photo IDB] cache:',Object.keys(_cache).length,'kép');}
  catch(e){console.warn('[KP photo IDB] cache betöltés:',e);}
}

function rerender(){['renderSessionsList','renderActiveSessionHome','updateHome','renderStorageOverview'].forEach(fn=>{try{window[fn]&&window[fn]();}catch(e){}});}

function installIntercepts(){
  if(typeof window.saveDB==='function'&&!window.saveDB.__kpPhotoIdb){
    const orig=window.saveDB;
    window.saveDB=function(db){return orig.call(this,slimDbForStorage(db));};
    window.saveDB.__kpPhotoIdb=true;
  }
  if(typeof window.getDB==='function'&&!window.getDB.__kpPhotoIdb){
    const orig=window.getDB;
    window.getDB=function(){const db=orig.call(this);injectPhotos(db);return db;};
    window.getDB.__kpPhotoIdb=true;
  }
}

loadCache().then(()=>{installIntercepts();setTimeout(rerender,150);});
setTimeout(installIntercepts,400);
setTimeout(installIntercepts,1200);
setTimeout(installIntercepts,3000);
console.log('[KP photo IDB] modul betöltve.');
})();
