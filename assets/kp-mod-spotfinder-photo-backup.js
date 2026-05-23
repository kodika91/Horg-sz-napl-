/* kp-mod-spotfinder-photo-backup.js — SpotFinder helyfotó mentés/visszatöltés védelem
 * v1.0 · Nem törli a meglévő fotókezelést, csak megerősíti a mentési struktúrát.
 * Cél: minden mentett horgászhely a képeivel együtt kerüljön a DB-be, GitHub backupba és restore után is visszanézhető legyen.
 */
(function(){
'use strict';
if(window.KP_SF_PHOTO_BACKUP_V1)return;
window.KP_SF_PHOTO_BACKUP_V1=true;

function getdb(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY)||'{}')}catch(e){return{}}}
function savedb(d){try{if(typeof saveDB==='function')saveDB(d);else localStorage.setItem(window.DB_KEY,JSON.stringify(d||{}));}catch(e){console.warn('[sf-photo-backup]',e)}}
function arr(x){return Array.isArray(x)?x:[]}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[sf-photo-backup]',m)}catch(e){}}

function clonePhotos(photos){
  return arr(photos).map(function(p){
    return {
      id:p&&p.id || ('sfphoto_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)),
      idb:!!(p&&p.idb),
      createdAt:p&&p.createdAt || new Date().toISOString(),
      data:p&&p.data || ''
    };
  });
}

function normalizeSpotPhotoBackup(db){
  db=db||{};
  db.scoutSpots=arr(db.scoutSpots);
  db.locations=arr(db.locations);
  var changed=false;

  db.scoutSpots.forEach(function(s){
    if(!s||!s.id)return;
    s.photos=clonePhotos(s.photos);
    var locId='sfloc_'+s.id;
    var loc=db.locations.find(function(l){return l&&l.id===locId});
    if(!loc){
      loc={
        id:locId,
        name:s.name||'Névtelen hely',
        type:'Ismeretlen',
        county:'',
        settlement:'',
        gps:s.gps||'',
        lat:s.lat,
        lon:s.lon,
        note:s.note||'',
        feedingPoint:'',
        castDirection:'',
        bottomNote:'',
        last:'',
        sessions:0,
        catchCount:0,
        totalWeight:0,
        favorite:false,
        fromSpotFinder:true,
        createdAt:s.createdAt||s.updatedAt||new Date().toISOString(),
        updatedAt:s.updatedAt||new Date().toISOString()
      };
      db.locations.push(loc);
      changed=true;
    }
    var photos=clonePhotos(s.photos);
    var thumb=(photos.find(function(p){return p&&p.data})||{}).data||'';
    var next={
      spotFinderId:s.id,
      fromSpotFinder:true,
      spotPhotos:photos,
      photos:photos,
      photoCount:photos.length,
      spotPhotoThumb:thumb,
      name:s.name||loc.name||'',
      lat:s.lat,
      lon:s.lon,
      gps:s.gps||loc.gps||'',
      note:s.note||loc.note||'',
      updatedAt:s.updatedAt||loc.updatedAt||new Date().toISOString()
    };
    Object.keys(next).forEach(function(k){
      var a=JSON.stringify(loc[k]);
      var b=JSON.stringify(next[k]);
      if(a!==b){loc[k]=next[k];changed=true;}
    });
  });
  return changed;
}

window.kpNormalizeSpotFinderPhotoBackup=function(){
  var db=getdb();
  var changed=normalizeSpotPhotoBackup(db);
  if(changed){savedb(db);}
  return changed;
};

/* Mentés után automatikusan átmásolja a képeket a locations rekordba is. */
var oldSave=window.spotFinderSave;
if(typeof oldSave==='function'&&!oldSave.KP_SF_PHOTO_BACKUP_WRAPPED){
  window.spotFinderSave=function(){
    var r=oldSave.apply(this,arguments);
    setTimeout(function(){
      try{window.kpNormalizeSpotFinderPhotoBackup();}catch(e){console.warn('[sf-photo-backup] normalize after save',e)}
    },80);
    return r;
  };
  window.spotFinderSave.KP_SF_PHOTO_BACKUP_WRAPPED=true;
}

/* Render/restore után is végigfuttatja, hogy régi backupból visszatöltött spotoknál is helyreálljon a kapcsolat. */
var oldRender=window.renderSpotFinder;
if(typeof oldRender==='function'&&!oldRender.KP_SF_PHOTO_BACKUP_WRAPPED){
  window.renderSpotFinder=function(){
    try{window.kpNormalizeSpotFinderPhotoBackup();}catch(e){}
    return oldRender.apply(this,arguments);
  };
  window.renderSpotFinder.KP_SF_PHOTO_BACKUP_WRAPPED=true;
}

setTimeout(function(){try{window.kpNormalizeSpotFinderPhotoBackup();}catch(e){}},1200);
setTimeout(function(){try{window.kpNormalizeSpotFinderPhotoBackup();}catch(e){}},3500);
console.log('[sf-photo-backup] SpotFinder képmentés-védelem aktív.');
})();
