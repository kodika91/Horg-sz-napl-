// kp-mod-photo-idb.js — base64 képek IndexedDB-ben, localStorage slim
// v1.3 · minden beágyazott data:image kiszedése IndexedDB-be
(function(){
'use strict';
if(window.KP_MOD_PHOTO_IDB_V13)return;
window.KP_MOD_PHOTO_IDB_V13=true;

const IDB_NAME='kp_photos';
const IDB_STORE='photos';
const MAIN_DB_KEY='horgaszpro_v0230';
const MARKER='__kpPhotoIdbKey';
let _idb=null;
const _cache=Object.create(null);

function dbg(type,msg,data){
  try{if(window.KP_STORAGE_DEBUG&&typeof window.KP_STORAGE_DEBUG.log==='function')window.KP_STORAGE_DEBUG.log(type,msg,data||{});}catch(e){}
  try{console[type==='ERR'?'error':type==='WARN'?'warn':'log']('[KP photo IDB]',msg,data||'');}catch(e){}
}
function strLen(v){try{return String(v==null?'':v).length}catch(e){return -1}}
function kb(chars){return Math.round(((Number(chars)||0)*2)/1024)+' KB'}
function isQuota(e){return !!e&&(e.name==='QuotaExceededError'||String(e&&e.message||e).toLowerCase().indexOf('quota')>=0||String(e&&e.message||e).toLowerCase().indexOf('tár')>=0)}
function isB64(v){return typeof v==='string'&&v.startsWith('data:image');}
function genKey(){return 'kp_p_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}
function dbKey(){try{return window.DB_KEY||MAIN_DB_KEY}catch(e){return MAIN_DB_KEY}}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function makeMarker(key){const o={};o[MARKER]=key;return o;}
function isMarker(o){return !!(o&&typeof o==='object'&&!Array.isArray(o)&&o[MARKER]);}

function jsonInfo(o){
  const out={};
  try{const s=JSON.stringify(o||{});out.jsonChars=s.length;out.jsonKB=kb(s.length);}catch(e){out.jsonError=String(e&&e.message||e)}
  try{
    out.keys=o&&typeof o==='object'?Object.keys(o).slice(0,30):[];
    out.sessions=Array.isArray(o&&o.sessions)?o.sessions.length:0;
    out.baits=Array.isArray(o&&o.baits)?o.baits.length:0;
    out.gear=Array.isArray(o&&o.gear)?o.gear.length:0;
    out.scoutSpots=Array.isArray(o&&o.scoutSpots)?o.scoutSpots.length:0;
    out.fishImages=o&&o.fishImages&&typeof o.fishImages==='object'?Object.keys(o.fishImages).length:0;
    let photoCount=0,photoChars=0,markerCount=0;
    const scan=(x,d)=>{
      if(!x||d>12)return;
      if(typeof x==='string'){if(isB64(x)){photoCount++;photoChars+=x.length;}return;}
      if(Array.isArray(x)){for(let i=0;i<x.length;i++)scan(x[i],d+1);return;}
      if(typeof x==='object'){
        if(isMarker(x)){markerCount++;return;}
        Object.keys(x).forEach(k=>scan(x[k],d+1));
      }
    };
    scan(o,0);out.photoCount=photoCount;out.photoKB=kb(photoChars);out.idbMarkers=markerCount;
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

function stripHeavyStaticImages(target){
  if(!target||typeof target!=='object')return target;
  if('fishImages' in target){
    const n=target.fishImages&&typeof target.fishImages==='object'?Object.keys(target.fishImages).length:0;
    if(n)dbg('INFO','fishImages törlés slim DB-ből',{count:n});
    target.fishImages={};
  }
  return target;
}

function extractAllDataImages(orig,slim,path,stats,seen){
  if(!orig||!slim)return;
  if(!seen)seen=new WeakSet();
  if(typeof orig==='object'){
    if(seen.has(orig))return;
    seen.add(orig);
  }
  if(Array.isArray(orig)&&Array.isArray(slim)){
    for(let i=0;i<orig.length;i++){
      if(isB64(orig[i])){
        const key=genKey();
        _cache[key]=orig[i];
        slim[i]=makeMarker(key);
        stats.count++;stats.chars+=orig[i].length;
        idbSet(key,orig[i]).catch(e=>dbg('WARN','IDB async mentési hiba',{path:path+'['+i+']',key:key,error:String(e&&e.message||e)}));
      }else extractAllDataImages(orig[i],slim[i],path+'['+i+']',stats,seen);
    }
    return;
  }
  if(typeof orig==='object'&&typeof slim==='object'){
    Object.keys(orig).forEach(k=>{
      if(k==='fishImages')return;
      const v=orig[k];
      if(isB64(v)){
        const existingKey=orig.photoIdbKey&&k==='photo'?orig.photoIdbKey:null;
        const key=existingKey||genKey();
        if(k==='photo'&&!orig.photoIdbKey)orig.photoIdbKey=key;
        _cache[key]=v;
        // Régi kompatibilitás: photo mezőnél marad a photoIdbKey + photo törlés.
        // Minden más beágyazott képnél marker objektum kerül a JSON-ba.
        if(k==='photo'){
          slim.photoIdbKey=key;
          delete slim.photo;
        }else{
          slim[k]=makeMarker(key);
        }
        stats.count++;stats.chars+=v.length;
        idbSet(key,v).catch(e=>dbg('WARN','IDB async mentési hiba',{path:path+'.'+k,key:key,error:String(e&&e.message||e)}));
      }else{
        extractAllDataImages(v,slim[k],path+'.'+k,stats,seen);
      }
    });
  }
}

function slimDbForStorage(db){
  if(!db||typeof db!=='object')return db;
  dbg('INFO','slimDbForStorage indul',{before:jsonInfo(db)});
  let slim;
  try{slim=JSON.parse(JSON.stringify(db));}catch(e){dbg('ERR','DB másolás sikertelen',{error:String(e&&e.message||e),before:jsonInfo(db)});return stripHeavyStaticImages(db);}
  stripHeavyStaticImages(slim);
  const stats={count:0,chars:0};
  extractAllDataImages(db,slim,'db',stats);
  dbg('INFO','slimDbForStorage kész',{extractedPhotos:stats.count,extractedKB:kb(stats.chars),after:jsonInfo(slim)});
  return slim;
}
window.kpSlimDbForStorage=slimDbForStorage;

function injectPhotos(db){
  if(!db||typeof db!=='object')return;
  let injected=0;
  const walk=(obj,parent,key,depth)=>{
    if(!obj||depth>12)return;
    if(isMarker(obj)){
      const v=_cache[obj[MARKER]];
      if(v&&parent){parent[key]=v;injected++;}
      return;
    }
    if(Array.isArray(obj)){for(let i=0;i<obj.length;i++)walk(obj[i],obj,i,depth+1);return;}
    if(typeof obj==='object'){
      // Régi photo/photoIdbKey forma visszatöltése
      if(!obj.photo&&obj.photoIdbKey&&_cache[obj.photoIdbKey]){obj.photo=_cache[obj.photoIdbKey];injected++;}
      Object.keys(obj).forEach(k=>walk(obj[k],obj,k,depth+1));
    }
  };
  walk(db,null,null,0);
  if(injected)dbg('INFO','fotók visszatöltve memóriába',{injected:injected});
}

async function loadCache(){
  try{const all=await idbGetAll();Object.assign(_cache,all);dbg('INFO','IDB cache betöltve',{count:Object.keys(_cache).length});}
  catch(e){dbg('WARN','IDB cache betöltés hiba',{error:String(e&&e.message||e)});}
}
function rerender(){['renderSessionsList','renderActiveSessionHome','updateHome','renderStorageOverview'].forEach(fn=>{try{window[fn]&&window[fn]();}catch(e){dbg('WARN','rerender hiba',{fn:fn,error:String(e&&e.message||e)})}});}

function installIntercepts(){
  if(typeof window.saveDB==='function'&&!window.saveDB.__kpPhotoIdbV13){
    const orig=window.saveDB;
    window.saveDB=function(db){
      dbg('INFO','saveDB intercept hívva',{incoming:jsonInfo(db)});
      const slim=slimDbForStorage(db);
      dbg('INFO','saveDB intercept továbbad slim DB-t',{slim:jsonInfo(slim)});
      return orig.call(this,slim);
    };
    window.saveDB.__kpPhotoIdb=true;
    window.saveDB.__kpPhotoIdbV13=true;
    dbg('INFO','saveDB intercept telepítve',{version:'v1.3'});
  }
  if(typeof window.getDB==='function'&&!window.getDB.__kpPhotoIdbV13){
    const orig=window.getDB;
    window.getDB=function(){const db=orig.call(this);injectPhotos(db);return db;};
    window.getDB.__kpPhotoIdb=true;
    window.getDB.__kpPhotoIdbV13=true;
    dbg('INFO','getDB intercept telepítve',{version:'v1.3'});
  }
}

function cleanupExistingLocalStorageDb(){
  try{
    const key=dbKey();
    const raw=localStorage.getItem(key);
    dbg('INFO','cleanupExistingLocalStorageDb ellenőrzés',{key:key,rawKB:kb(strLen(raw)),hasDataImage:!!(raw&&raw.indexOf('data:image')>=0),hasMarker:!!(raw&&raw.indexOf(MARKER)>=0)});
    if(!raw||raw.indexOf('data:image')<0)return;
    const parsed=JSON.parse(raw);
    dbg('INFO','cleanup parse OK',{parsed:jsonInfo(parsed)});
    const slim=slimDbForStorage(parsed);
    const slimJson=JSON.stringify(slim||{});
    dbg('INFO','cleanup setItem előtt',{key:key,slimKB:kb(strLen(slimJson)),slim:jsonInfo(slim)});
    try{
      localStorage.setItem(key,slimJson);
      dbg('INFO','cleanup setItem OK',{key:key});
      toast('Telefonos tárhely javítva: a képek IndexedDB-be kerültek.');
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
dbg('INFO','kp-mod-photo-idb betöltve',{version:'v1.3-all-data-image-to-idb'});
})();
