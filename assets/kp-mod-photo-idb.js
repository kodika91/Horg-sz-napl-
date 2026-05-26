// kp-mod-photo-idb.js — base64 fotók IndexedDB-ben, localStorage slim
// v1.2 · részletes iOS tárhely diagnosztika
(function(){
'use strict';
if(window.KP_MOD_PHOTO_IDB_V12)return;
window.KP_MOD_PHOTO_IDB_V12=true;

const IDB_NAME='kp_photos';
const IDB_STORE='photos';
const MAIN_DB_KEY='horgaszpro_v0230';
let _idb=null;
const _cache=Object.create(null);

function dbg(type,msg,data){
  try{if(window.KP_STORAGE_DEBUG&&typeof window.KP_STORAGE_DEBUG.log==='function')window.KP_STORAGE_DEBUG.log(type,msg,data||{});}catch(e){}
  try{console[type==='ERR'?'error':type==='WARN'?'warn':'log']('[KP photo IDB]',msg,data||'');}catch(e){}
}
function strLen(v){try{return String(v==null?'':v).length}catch(e){return -1}}
function kb(chars){return Math.round(((Number(chars)||0)*2)/1024)+' KB'}
function isQuota(e){return !!e&&(e.name==='QuotaExceededError'||String(e&&e.message||e).toLowerCase().indexOf('quota')>=0||String(e&&e.message||e).toLowerCase().indexOf('tár')>=0)}
function jsonInfo(o){
  const out={};
  try{
    const s=JSON.stringify(o||{});
    out.jsonChars=s.length;out.jsonKB=kb(s.length);
  }catch(e){out.jsonError=String(e&&e.message||e)}
  try{
    out.keys=o&&typeof o==='object'?Object.keys(o).slice(0,30):[];
    out.sessions=Array.isArray(o&&o.sessions)?o.sessions.length:0;
    out.baits=Array.isArray(o&&o.baits)?o.baits.length:0;
    out.gear=Array.isArray(o&&o.gear)?o.gear.length:0;
    out.scoutSpots=Array.isArray(o&&o.scoutSpots)?o.scoutSpots.length:0;
    out.fishImages=o&&o.fishImages&&typeof o.fishImages==='object'?Object.keys(o.fishImages).length:0;
    let photoCount=0,photoChars=0;
    const scan=(x,d)=>{
      if(!x||d>6)return;
      if(typeof x==='string'){if(x.indexOf('data:image')===0){photoCount++;photoChars+=x.length;}return;}
      if(Array.isArray(x)){for(let i=0;i<Math.min(x.length,500);i++)scan(x[i],d+1);return;}
      if(typeof x==='object')Object.keys(x).slice(0,120).forEach(k=>scan(x[k],d+1));
    };
    scan(o,0);out.photoCount=photoCount;out.photoKB=kb(photoChars);
  }catch(e){out.infoError=String(e&&e.message||e)}
  return out;
}

function openIdb(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    try{
      const req=indexedDB.open(IDB_NAME,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(IDB_STORE))req.result.createObjectStore(IDB_STORE);};
      req.onsuccess=()=>{_idb=req.result;dbg('INFO','IndexedDB megnyitva',{name:IDB_NAME,store:IDB_STORE});res(_idb);};
      req.onerror=()=>{dbg('ERR','IndexedDB megnyitási hiba',{error:String(req.error&&req.error.message||req.error)});rej(req.error);};
    }catch(e){dbg('ERR','IndexedDB open kivétel',{error:String(e&&e.message||e)});rej(e);}
  });
}

function idbSet(key,val){return openIdb().then(db=>new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(val,key);tx.oncomplete=()=>{dbg('INFO','IDB kép mentve',{key:key,valueKB:kb(strLen(val))});res();};tx.onerror=()=>{dbg('WARN','IDB kép mentési hiba',{key:key,error:String(tx.error&&tx.error.message||tx.error)});rej(tx.error);};}));}

function idbGetAll(){return openIdb().then(db=>new Promise((res,rej)=>{const tx=db.transaction(IDB_STORE,'readonly');const out={};const req=tx.objectStore(IDB_STORE).openCursor();req.onsuccess=e=>{const cur=e.target.result;if(cur){out[cur.key]=cur.value;cur.continue();}else res(out);};req.onerror=()=>rej(req.error);}));}

function isB64(v){return typeof v==='string'&&v.startsWith('data:image');}
function genKey(){return 'kp_p_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}
function dbKey(){try{return window.DB_KEY||MAIN_DB_KEY}catch(e){return MAIN_DB_KEY}}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}

function stripHeavyStaticImages(target){
  if(!target||typeof target!=='object')return target;
  if('fishImages' in target){
    const n=target.fishImages&&typeof target.fishImages==='object'?Object.keys(target.fishImages).length:0;
    if(n)dbg('INFO','fishImages törlés slim DB-ből',{count:n});
    target.fishImages={};
  }
  return target;
}

function slimDbForStorage(db){
  if(!db||typeof db!=='object')return db;
  dbg('INFO','slimDbForStorage indul',{before:jsonInfo(db)});
  let slim;
  try{slim=JSON.parse(JSON.stringify(db));}catch(e){dbg('ERR','DB másolás sikertelen, eredeti objektum slimelése',{error:String(e&&e.message||e),before:jsonInfo(db)});return stripHeavyStaticImages(db);}
  stripHeavyStaticImages(slim);
  let extracted=0;
  const extract=(origArr,slimArr,label)=>{
    if(!Array.isArray(origArr)||!Array.isArray(slimArr))return;
    for(let i=0;i<origArr.length;i++){
      const orig=origArr[i];const s=slimArr[i];
      if(!orig||!s||!isB64(orig.photo))continue;
      if(!orig.photoIdbKey)orig.photoIdbKey=genKey();
      s.photoIdbKey=orig.photoIdbKey;
      _cache[orig.photoIdbKey]=orig.photo;
      extracted++;
      idbSet(orig.photoIdbKey,orig.photo).catch(e=>dbg('WARN','IDB async mentési hiba',{label:label,key:orig.photoIdbKey,error:String(e&&e.message||e)}));
      delete s.photo;
    }
  };
  if(Array.isArray(db.sessions)&&Array.isArray(slim.sessions)){
    for(let i=0;i<db.sessions.length;i++){
      const os=db.sessions[i],ss=slim.sessions[i];if(!os||!ss)continue;
      extract(os.catches,ss.catches,'sessions.catches');
      extract(os['fogások'],ss['fogások'],'sessions.fogások');
      extract(os.fogasok,ss.fogasok,'sessions.fogasok');
    }
  }
  extract(db.gear,slim.gear,'gear');
  extract(db.baits,slim.baits,'baits');
  dbg('INFO','slimDbForStorage kész',{extractedPhotos:extracted,after:jsonInfo(slim)});
  return slim;
}
window.kpSlimDbForStorage=slimDbForStorage;

function injectPhotos(db){
  if(!db||typeof db!=='object')return;
  let injected=0;
  const inj=arr=>{if(!Array.isArray(arr))return;arr.forEach(o=>{if(!o||o.photo||!o.photoIdbKey)return;const v=_cache[o.photoIdbKey];if(v){o.photo=v;injected++;}});};
  if(Array.isArray(db.sessions))db.sessions.forEach(s=>{if(!s)return;inj(s.catches);inj(s['fogások']);inj(s.fogasok);});
  inj(db.gear);inj(db.baits);
  if(injected)dbg('INFO','fotók visszatöltve memóriába',{injected:injected});
}

async function loadCache(){
  try{const all=await idbGetAll();Object.assign(_cache,all);dbg('INFO','IDB cache betöltve',{count:Object.keys(_cache).length});}
  catch(e){dbg('WARN','IDB cache betöltés hiba',{error:String(e&&e.message||e)});}
}

function rerender(){['renderSessionsList','renderActiveSessionHome','updateHome','renderStorageOverview'].forEach(fn=>{try{window[fn]&&window[fn]();}catch(e){dbg('WARN','rerender hiba',{fn:fn,error:String(e&&e.message||e)})}});}

function installIntercepts(){
  if(typeof window.saveDB==='function'&&!window.saveDB.__kpPhotoIdb){
    const orig=window.saveDB;
    window.saveDB=function(db){
      dbg('INFO','saveDB intercept hívva',{incoming:jsonInfo(db)});
      const slim=slimDbForStorage(db);
      dbg('INFO','saveDB intercept továbbad slim DB-t',{slim:jsonInfo(slim)});
      return orig.call(this,slim);
    };
    window.saveDB.__kpPhotoIdb=true;
    dbg('INFO','saveDB intercept telepítve',{});
  }
  if(typeof window.getDB==='function'&&!window.getDB.__kpPhotoIdb){
    const orig=window.getDB;
    window.getDB=function(){const db=orig.call(this);injectPhotos(db);return db;};
    window.getDB.__kpPhotoIdb=true;
    dbg('INFO','getDB intercept telepítve',{});
  }
}

function cleanupExistingLocalStorageDb(){
  try{
    const key=dbKey();
    const raw=localStorage.getItem(key);
    dbg('INFO','cleanupExistingLocalStorageDb ellenőrzés',{key:key,rawKB:kb(strLen(raw)),hasFishImages:!!(raw&&raw.indexOf('fishImages')>=0)});
    if(!raw||raw.indexOf('fishImages')<0)return;
    const parsed=JSON.parse(raw);
    dbg('INFO','cleanup parse OK',{parsed:jsonInfo(parsed)});
    if(!parsed||!parsed.fishImages||!Object.keys(parsed.fishImages||{}).length){dbg('INFO','cleanup nem szükséges: fishImages üres vagy nincs',{});return;}
    const slim=slimDbForStorage(parsed);
    const slimJson=JSON.stringify(slim||{});
    dbg('INFO','cleanup setItem előtt',{key:key,slimKB:kb(strLen(slimJson)),slim:jsonInfo(slim)});
    try{
      localStorage.setItem(key,slimJson);
      dbg('INFO','cleanup setItem OK',{key:key});
      toast('Telefonos tárhely javítva: a nagy halfotó-cache törölve lett a helyi DB-ből.');
    }catch(e){
      dbg(isQuota(e)?'ERR':'WARN','cleanup setItem HIBA',{key:key,errorName:e&&e.name,errorMessage:String(e&&e.message||e),isQuota:isQuota(e),slim:jsonInfo(slim)});
      throw e;
    }
  }catch(e){dbg('ERR','localStorage cleanup hiba',{error:String(e&&e.message||e),name:e&&e.name});}
}

loadCache().then(()=>{installIntercepts();cleanupExistingLocalStorageDb();setTimeout(rerender,150);});
setTimeout(installIntercepts,400);
setTimeout(installIntercepts,1200);
setTimeout(()=>{installIntercepts();cleanupExistingLocalStorageDb();},3000);
dbg('INFO','kp-mod-photo-idb betöltve',{version:'v1.2-storage-diagnostics'});
})();
