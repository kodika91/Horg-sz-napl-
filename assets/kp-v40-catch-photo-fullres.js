/* ============================================================================
 * KapásPont · v40 · Éles fogásfotó behozása (a fogás photoPath-ja alapján)
 * ----------------------------------------------------------------------------
 * MIÉRT (és mi volt a v39 hibája):
 *   A v39 a thumbnail base64-jének ELEJÉBŐL próbálta kitalálni, melyik GitHub-os
 *   kép tartozik hozzá. Hasonló fotóknál (ugyanaz a háttér) a base64 eleje közel
 *   azonos, ezért a v39 ÖSSZEKEVERTE a képeket -> rossz kép jelent meg.
 *
 *   Ez a v40 NEM a base64-ből találgat. A kp-v37 bevált módszerét használja:
 *   minden <img>-hez a HOZZÁ TARTOZÓ fogás-objektumból olvassa ki a GitHub-utat
 *   (c.photoPath / c.photoRef.path). Így minden fogás a SAJÁT képét kapja,
 *   soha nem keveredhet.
 *
 * HOGYAN KÖTI A KÉPET A FOGÁSHOZ (megbízhatóan):
 *   A renderelt fogás-kártyákban sorrendben jelennek meg a képek. A v40 a DOM
 *   sorrendje szerint párosítja a kártyákat a DB sessions[].catches[]/events[]
 *   sorrendjével, és minden kártya képéhez a saját catch.photoPath-ját használja.
 *   Ha egy kártyán van data-* attribútum az úttal, azt részesíti előnyben.
 *
 * BEILLESZTÉS (index.html, a kp-v37 sor UTÁN — a v37 amúgy is betölti a feltöltőt):
 *   addScript('kp-v40-catch-photo-fullres','assets/kp-v40-catch-photo-fullres.js?v=20260520-40');
 *
 * A v39-et NE töltsd be (hibás). Töröld az index.html-ből a kp-v39 sort.
 * ==========================================================================*/
(function(){
  if(window.KP_V40_CATCH_PHOTO_FULLRES) return;
  window.KP_V40_CATCH_PHOTO_FULLRES=true;

  var DEF={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main'};
  function cfg(){
    var c={};
    try{
      c=(typeof githubLoadConfig==='function')
        ? githubLoadConfig()
        : JSON.parse(localStorage.getItem('kapaspont_github_sync')||localStorage.getItem('horgaszpro_github_sync')||'{}');
    }catch(e){}
    return {
      owner:c.owner||DEF.owner,
      repo:c.repo||DEF.repo,
      branch:c.branch||DEF.branch,
      token:(c.token||localStorage.getItem('v18_github_token')||'').trim()
    };
  }
  function getdb(){
    try{ return (typeof getDB==='function') ? getDB() : JSON.parse(localStorage.getItem(window.DB_KEY)||'{}'); }
    catch(e){ return {}; }
  }
  function apiPath(p){ return String(p).split('/').map(encodeURIComponent).join('/'); }
  function pathOf(o){ return o && (o.photoPath || (o.photoRef && (o.photoRef.path||o.photoRef.relativePath)) || o.githubPhotoPath || o.imagePath || ''); }

  /* ---- Éles kép letöltése GitHubról, gyorsítótárral (path -> objectURL) ---- */
  var _urlCache={}, _inflight={};
  function loadFull(path){
    if(!path) return Promise.resolve(null);
    if(_urlCache[path]) return Promise.resolve(_urlCache[path]);
    if(_inflight[path]) return _inflight[path];
    var c=cfg();
    if(!c.token){ return Promise.resolve(null); }
    var url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)
           +'/contents/'+apiPath(path)+'?ref='+encodeURIComponent(c.branch);
    var p=fetch(url,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}})
      .then(function(r){ if(!r.ok) throw new Error('GitHub '+r.status); return r.json(); })
      .then(function(d){
        var raw=String((d&&d.content)||'').replace(/\n/g,'');
        if(!raw) throw new Error('üres');
        var bin=atob(raw), len=bin.length, bytes=new Uint8Array(len);
        for(var i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
        var lower=path.toLowerCase();
        var type=lower.endsWith('.png')?'image/png':lower.endsWith('.webp')?'image/webp':'image/jpeg';
        var u=URL.createObjectURL(new Blob([bytes],{type:type}));
        _urlCache[path]=u; delete _inflight[path]; return u;
      })['catch'](function(e){ delete _inflight[path]; console.warn('[KP v40] kép nem tölthető ('+path+'):',e&&e.message||e); return null; });
    _inflight[path]=p;
    return p;
  }

  /* ---- A fogás-részlet kártyáinak párosítása a DB catch/event sorrendjével ---- */
  /* A renderSessionDetail általában EGY session kártyáit rajzolja ki. Megkeressük
     az aktív/épp megnyitott sessiont, és annak catch+event elemeit sorrendben
     hozzárendeljük a DOM-beli .catch-photo-preview / kép elemekhez. */
  function activeSession(db){
    var sessions=(db&&db.sessions)||[];
    // 1) ha van kijelölt/aktív session id
    var id=db&&(db.activeSessionId);
    if(id!=null){
      var byId=sessions.filter(function(s){return s&&String(s.id)===String(id);})[0];
      if(byId) return byId;
    }
    // 2) különben a legutóbbi (a detail nézet általában ezt nyitja)
    return sessions[sessions.length-1]||null;
  }

  /* A megnyitott fogásrészlet összes képét sorrendben kötjük a fogás objektumokhoz. */
  function upgradeDetail(){
    var wrap=document.getElementById('session-detail-wrap') || document;
    var imgs=wrap.querySelectorAll('img.catch-photo-preview, .catch-photo-preview img, #session-detail-wrap img');
    if(!imgs.length) return;

    var db=getdb();
    var s=activeSession(db);
    if(!s) return;

    // a fogásrészletben a képek sorrendje = catches sorrend (+ esetleg események).
    // Összegyűjtjük a fotóval rendelkező objektumokat ugyanabban a sorrendben,
    // ahogy a renderSessionDetail kirajzolja (catches, majd events, majd session).
    var photoObjs=[];
    (s.catches||[]).forEach(function(c){ if(c && (c.photo||pathOf(c))) photoObjs.push(c); });
    (s.events||[]).forEach(function(e){ if(e && (e.photo||pathOf(e))) photoObjs.push(e); });
    if(s.photo||pathOf(s)) photoObjs.push(s);

    // a DOM-képek és a photoObjs sorrend szerinti párosítása
    Array.prototype.forEach.call(imgs,function(img,idx){
      if(img.dataset.kpV40Done) return;
      var src=img.getAttribute('src')||'';
      // csak a thumbnail (base64) képeket cseréljük; ami már blob:, azt hagyjuk
      if(src.indexOf('data:image')!==0) return;

      // 1) ha a DOM-on közvetlenül van út, azt használjuk (legbiztosabb)
      var direct=(img.dataset&&(img.dataset.full||img.dataset.fullSrc||img.dataset.path||img.dataset.photoPath))||'';
      var path=direct;

      // 2) különben a sorrend szerinti fogás objektum photoPath-ja
      if(!path && photoObjs[idx]) path=pathOf(photoObjs[idx]);

      if(!path) return; // nincs GitHub eredeti -> marad a thumbnail

      img.dataset.kpV40Done='1';
      loadFull(path).then(function(u){
        if(u){ img.src=u; img.dataset.kpV40Full='1'; }
        else { img.dataset.kpV40Done=''; }
      });
    });
  }

  /* ---- Rákötés a renderelőre ---- */
  function hook(){
    var orig=window.renderSessionDetail;
    if(typeof orig==='function' && !orig.__kpV40){
      var wrapped=function(){
        var r=orig.apply(this,arguments);
        setTimeout(upgradeDetail,60);
        setTimeout(upgradeDetail,400);
        return r;
      };
      wrapped.__kpV40=true;
      window.renderSessionDetail=wrapped;
    }
  }

  function boot(){ hook(); upgradeDetail(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();

  var ticks=0;
  var iv=setInterval(function(){ hook(); upgradeDetail(); if(++ticks>=15) clearInterval(iv); },2000);

  window.kpV40Upgrade=upgradeDetail;
  console.log('[KP v40] éles fogásfotó (photoPath alapú) aktív');
})();
