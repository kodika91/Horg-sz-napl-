/* ============================================================================
 * KapásPont · v38 · Fogásfotók IndexedDB tárolása + migráció
 * ----------------------------------------------------------------------------
 * MIÉRT:
 *   A fogásfotók eddig base64 (data:image...) formában a teljes adatbázis
 *   JSON-jába ágyazva, a localStorage DB_KEY kulcsába mentődtek. A localStorage
 *   kemény ~5 MB korlátja miatt néhány fotó után a saveDB() QuotaExceededError-t
 *   dobott: nem lehetett új, fotós bejegyzést menteni, és a régi adat is
 *   sérülhetett / nem töltődött vissza.
 *
 * MIT CSINÁL EZ A PATCH:
 *   - A fogásfotók Blobként egy külön IndexedDB-be kerülnek (nem a localStorage-ba).
 *   - A fogás objektumban a nagy base64 helyett csak egy rövid azonosító marad
 *     (photoId). Így a DB_KEY JSON apró marad -> soha nem telik be.
 *   - Megjelenítéskor a photoId-ből objectURL-t tölt vissza (gyorsítótárral).
 *   - MIGRÁCIÓ: a már meglévő base64 photo mezőket egyszer áthelyezi
 *     IndexedDB-be, így a régi képeid megmaradnak és újra láthatóvá válnak.
 *
 * BEILLESZTÉS (index.html, az addScript sorok közé, a v37 UTÁN):
 *   addScript('kp-v38-catch-photo-indexeddb','assets/kp-v38-catch-photo-indexeddb.js?v=20260520-38');
 *
 * Önállóan fut, nem módosítja az app.html-t. Nem függ attól, melyik app-verzió
 * van betöltve. Idempotens: kétszeri betöltés sem okoz kárt.
 * ==========================================================================*/
(function(){
  if(window.KP_V38_CATCH_PHOTO_IDB) return;
  window.KP_V38_CATCH_PHOTO_IDB=true;

  /* ---- IndexedDB tároló a fogásfotóknak ---- */
  var IDB_NAME='kapaspont_catch_photos';
  var IDB_STORE='photos';
  var _dbp=null;

  function openDB(){
    if(_dbp) return _dbp;
    _dbp=new Promise(function(resolve,reject){
      var req=indexedDB.open(IDB_NAME,1);
      req.onupgradeneeded=function(){
        var db=req.result;
        if(!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess=function(){ resolve(req.result); };
      req.onerror=function(){ reject(req.error); };
    });
    return _dbp;
  }
  function idbPut(key,blob){
    return openDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx=db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE).put(blob,key);
        tx.oncomplete=function(){ resolve(key); };
        tx.onerror=function(){ reject(tx.error); };
      });
    });
  }
  function idbGet(key){
    return openDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx=db.transaction(IDB_STORE,'readonly');
        var rq=tx.objectStore(IDB_STORE).get(key);
        rq.onsuccess=function(){ resolve(rq.result||null); };
        rq.onerror=function(){ reject(rq.error); };
      });
    });
  }
  function idbDelete(key){
    return openDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx=db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE)['delete'](key);
        tx.oncomplete=function(){ resolve(true); };
        tx.onerror=function(){ reject(tx.error); };
      });
    });
  }

  /* ---- Segédfüggvények ---- */
  function isDataUrl(s){ return typeof s==='string' && s.indexOf('data:image')===0; }
  function isPhotoId(s){ return typeof s==='string' && s.indexOf('idb:')===0; }
  function newId(){ return 'idb:'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9); }

  function dataUrlToBlob(dataUrl){
    var parts=String(dataUrl).split(',');
    var mime=((parts[0]||'').match(/data:(.*?);base64/)||[])[1]||'image/jpeg';
    var bin=atob(parts[1]||'');
    var len=bin.length, arr=new Uint8Array(len);
    for(var i=0;i<len;i++) arr[i]=bin.charCodeAt(i);
    return new Blob([arr],{type:mime});
  }

  /* objectURL gyorsítótár, hogy ne készítsünk ugyanahhoz a képhez többször */
  var _urlCache={};
  function urlFor(photoId){
    if(_urlCache[photoId]) return Promise.resolve(_urlCache[photoId]);
    return idbGet(photoId).then(function(blob){
      if(!blob) return null;
      var url=URL.createObjectURL(blob);
      _urlCache[photoId]=url;
      return url;
    });
  }

  /* ---- A fotó eltárolása: data:image base64 -> IndexedDB Blob, visszaad egy photoId-t ---- */
  function storeDataUrl(dataUrl){
    var id=newId();
    var blob=dataUrlToBlob(dataUrl);
    return idbPut(id,blob).then(function(){ return id; });
  }

  /* ============================================================================
   * 1) MENTÉS ELFOGÁSA
   *   A saveDB() futása ELŐTT minden fogás base64 photo-ját kiemeljük
   *   IndexedDB-be, és a JSON-ban csak a photoId marad. Mivel a saveDB szinkron,
   *   a base64 -> photoId cserét egy "előfeldolgozó" wrapper végzi a
   *   saveActiveCatch / saveDB köré.
   * ==========================================================================*/

  /* Egy adatbázis-objektum összes base64 fotóját kiemeli IDB-be (aszinkron),
     a db-t helyben módosítja: c.photo = photoId. */
  function externalizeDB(db){
    var jobs=[];
    if(db && Array.isArray(db.sessions)){
      db.sessions.forEach(function(s){
        if(!s || !Array.isArray(s.catches)) return;
        s.catches.forEach(function(c){
          if(c && isDataUrl(c.photo)){
            var data=c.photo;
            jobs.push(storeDataUrl(data).then(function(id){ c.photo=id; }));
          }
        });
      });
    }
    return Promise.all(jobs);
  }

  /* saveDB köré: kiemeljük a base64-eket, majd lefuttatjuk az eredeti saveDB-t.
     Ha az externalizálás bármiért elbukna, az eredeti viselkedés marad
     (nem rontunk a jelenlegi állapoton). */
  function wrapSaveDB(){
    if(typeof window.saveDB!=='function' || window.saveDB.__kpV38) return;
    var orig=window.saveDB;
    var wrapped=function(db){
      try{
        // gyors út: ha nincs egyetlen base64 sem, ne csináljunk aszinkron kört
        var hasBase64=false;
        if(db && Array.isArray(db.sessions)){
          for(var i=0;i<db.sessions.length && !hasBase64;i++){
            var s=db.sessions[i];
            if(s && Array.isArray(s.catches)){
              for(var j=0;j<s.catches.length;j++){
                if(s.catches[j] && isDataUrl(s.catches[j].photo)){ hasBase64=true; break; }
              }
            }
          }
        }
        if(!hasBase64){ return orig.call(this,db); }
        // van base64: előbb kiemeljük, utána mentünk
        externalizeDB(db).then(function(){
          try{ orig.call(window,db); }
          catch(e){ console.error('[KP v38] saveDB hiba externalizálás után:',e); }
        })['catch'](function(e){
          console.error('[KP v38] externalizálás sikertelen, mentés base64-gyel:',e);
          try{ orig.call(window,db); }catch(e2){ console.error(e2); }
        });
        return;
      }catch(e){
        console.error('[KP v38] saveDB wrapper hiba:',e);
        return orig.call(this,db);
      }
    };
    wrapped.__kpV38=true;
    window.saveDB=wrapped;
  }

  /* ============================================================================
   * 2) MEGJELENÍTÉS JAVÍTÁSA
   *   A renderelők <img src="idb:..."> elemeket írnak ki (mert a photo most már
   *   photoId). Ezeket utólag feloldjuk: a photoId-ből objectURL-t töltünk,
   *   és beállítjuk az img tényleges src-jét. A base64-es (még nem migrált)
   *   képek változatlanul működnek.
   * ==========================================================================*/
  function resolveImages(root){
    var scope=root&&root.querySelectorAll?root:document;
    var imgs=scope.querySelectorAll('img[src^="idb:"]');
    imgs.forEach(function(img){
      var id=img.getAttribute('src');
      if(!id || img.dataset.kpV38Resolving) return;
      img.dataset.kpV38Resolving='1';
      urlFor(id).then(function(url){
        if(url){ img.src=url; }
        else { img.removeAttribute('src'); img.dataset.kpV38Missing='1'; }
      })['catch'](function(){ img.dataset.kpV38Resolving=''; });
    });
  }

  /* Akkor is fusson, ha a renderelőket az app a v38 betöltése előtt cserélte ki:
     figyeljük a DOM-ot és kattintásokat. */
  function hookRenderers(){
    ['renderCatches','renderSessionDetail','renderActiveSessionHome','updateHome'].forEach(function(name){
      var orig=window[name];
      if(typeof orig==='function' && !orig.__kpV38){
        var wrapped=function(){
          var r=orig.apply(this,arguments);
          setTimeout(function(){ resolveImages(document); },30);
          return r;
        };
        wrapped.__kpV38=true;
        window[name]=wrapped;
      }
    });
  }

  /* ============================================================================
   * 3) EGYSZERI MIGRÁCIÓ
   *   A localStorage-ban már bent lévő base64 fotókat egyszer áthelyezzük
   *   IndexedDB-be, és lementjük a kisebb DB-t. Ezzel azonnal felszabadul a hely
   *   és a régi képek újra láthatók.
   * ==========================================================================*/
  var MIGRATION_FLAG='kp_v38_catch_photo_migrated';

  function runMigrationOnce(){
    try{
      if(localStorage.getItem(MIGRATION_FLAG)==='1') return;
      if(typeof window.getDB!=='function' || typeof window.saveDB!=='function') return;

      var db=window.getDB();
      var pending=[];
      if(db && Array.isArray(db.sessions)){
        db.sessions.forEach(function(s){
          if(!s || !Array.isArray(s.catches)) return;
          s.catches.forEach(function(c){
            if(c && isDataUrl(c.photo)){
              var data=c.photo;
              pending.push(storeDataUrl(data).then(function(id){ c.photo=id; }));
            }
          });
        });
      }

      if(pending.length===0){
        localStorage.setItem(MIGRATION_FLAG,'1');
        return;
      }

      console.log('[KP v38] Migráció: '+pending.length+' fogásfotó áthelyezése IndexedDB-be…');
      Promise.all(pending).then(function(){
        try{
          // FONTOS: itt az EREDETI saveDB-t hívjuk, mert a db már photoId-ket
          // tartalmaz, nincs több base64 kiemelni való.
          var save=window.saveDB.__kpV38 ? null : window.saveDB;
          if(window.saveDB.__kpV38){
            // a wrapped saveDB is jó: base64 már nincs, így a gyors ágon megy
            window.saveDB(db);
          } else {
            window.saveDB(db);
          }
          localStorage.setItem(MIGRATION_FLAG,'1');
          console.log('[KP v38] Migráció kész. A localStorage felszabadult.');
          if(typeof window.showToast==='function') window.showToast('Régi fogásfotók áthelyezve, a tárhely felszabadult.');
          // frissítsük a megjelenítést
          ['renderSessionDetail','renderCatches','updateHome'].forEach(function(n){ try{ typeof window[n]==='function' && window[n](); }catch(e){} });
          setTimeout(function(){ resolveImages(document); },80);
        }catch(e){
          console.error('[KP v38] Migrációs mentés hiba:',e);
        }
      })['catch'](function(e){
        console.error('[KP v38] Migráció sikertelen:',e);
      });
    }catch(e){
      console.error('[KP v38] Migráció kivétel:',e);
    }
  }

  /* ============================================================================
   * BOOT
   * ==========================================================================*/
  function boot(){
    wrapSaveDB();
    hookRenderers();
    resolveImages(document);
    runMigrationOnce();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot);
  } else {
    boot();
  }
  // a renderelők és a DOM később is változhatnak (az app sok mindent késleltetve tölt)
  var ticks=0;
  var iv=setInterval(function(){
    ticks++;
    wrapSaveDB();
    hookRenderers();
    resolveImages(document);
    if(ticks>=15) clearInterval(iv); // ~30 mp után már stabil az app
  },2000);

  // kattintás után is oldjuk fel az újonnan megjelenő képeket
  document.addEventListener('click',function(){ setTimeout(function(){ resolveImages(document); },120); },true);

  // külső használatra
  window.kpV38ResolveImages=function(){ resolveImages(document); };
})();
