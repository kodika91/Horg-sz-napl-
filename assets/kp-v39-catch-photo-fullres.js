/* ============================================================================
 * KapásPont · v39 · Éles fogásfotó behozása (GitHub eredeti a thumbnail helyett)
 * ----------------------------------------------------------------------------
 * MIÉRT:
 *   A fogásfotó feltöltője (kp-v38-session-photo-to-github) a NAGY, éles képet
 *   a GitHubra tölti (c.photoPath / c.photoRef.path), a fogásban viszont csak
 *   egy 360px-es thumbnail marad (c.photo, base64). Megnyitáskor és nagyításkor
 *   az app ezt a pici képet nagyítja fel -> pixeles.
 *
 * MIT CSINÁL EZ A PATCH:
 *   A fogás megnyitásakor (session-detail nézet) minden képnél megnézi, van-e
 *   GitHub-os eredeti (photoPath / photoRef.path). Ha van, letölti az ÉLES
 *   eredetit a GitHubról és lecseréli a thumbnailt. Amíg a nagy betölt, a
 *   thumbnail látszik (nincs üres hely), majd élesre vált.
 *
 *   Letöltött eredetiket gyorsítótárazza (egy képet csak egyszer tölt le),
 *   és objectURL-t használ, hogy ne hizlalja a memóriát feleslegesen.
 *
 * BEILLESZTÉS (index.html, az addScript sorok közé, a v38 GitHub-feltöltő UTÁN):
 *   addScript('kp-v39-catch-photo-fullres','assets/kp-v39-catch-photo-fullres.js?v=20260520-39');
 *
 * FONTOS: ha az IndexedDB-s patch (kp-v38-catch-photo-indexeddb) be van kötve,
 * azt VEDD KI az index.html-ből, mert az a c.photo mezőbe 'idb:'-t ír és
 * ütközik ezzel a GitHub-os úttal.
 * ==========================================================================*/
(function(){
  if(window.KP_V39_CATCH_PHOTO_FULLRES) return;
  window.KP_V39_CATCH_PHOTO_FULLRES=true;

  /* ---- GitHub konfiguráció (ugyanúgy olvassa, mint a feltöltő) ---- */
  var DEF={owner:'kodika91',repo:'horgasz-naplo-adatok',branch:'main',root:'kapaspont'};
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
  function apiPath(p){ return String(p).split('/').map(encodeURIComponent).join('/'); }

  /* ---- DB elérés ---- */
  function getdb(){
    try{ return (typeof getDB==='function') ? getDB() : JSON.parse(localStorage.getItem(window.DB_KEY)||'{}'); }
    catch(e){ return {}; }
  }

  /* ---- Éles kép letöltése GitHubról, objectURL gyorsítótárral ---- */
  var _urlCache={};   // path -> objectURL
  var _inflight={};   // path -> Promise (hogy egyszerre csak egyszer töltsük)

  function loadFullFromGithub(path){
    if(!path) return Promise.resolve(null);
    if(_urlCache[path]) return Promise.resolve(_urlCache[path]);
    if(_inflight[path]) return _inflight[path];

    var c=cfg();
    if(!c.token){ return Promise.resolve(null); }

    var url='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)
           +'/contents/'+apiPath(path)+'?ref='+encodeURIComponent(c.branch);

    var p=fetch(url,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}})
      .then(function(r){ if(!r.ok) throw new Error('GitHub kép letöltés: '+r.status); return r.json(); })
      .then(function(d){
        var raw=String((d&&d.content)||'').replace(/\n/g,'');
        if(!raw) throw new Error('üres tartalom');
        var bin=atob(raw), len=bin.length, bytes=new Uint8Array(len);
        for(var i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
        var lower=path.toLowerCase();
        var type=lower.endsWith('.png')?'image/png':lower.endsWith('.webp')?'image/webp':'image/jpeg';
        var objUrl=URL.createObjectURL(new Blob([bytes],{type:type}));
        _urlCache[path]=objUrl;
        delete _inflight[path];
        return objUrl;
      })
      ['catch'](function(e){
        delete _inflight[path];
        console.warn('[KP v39] Éles kép nem tölthető ('+path+'):',e&&e.message||e);
        return null;
      });

    _inflight[path]=p;
    return p;
  }

  /* ---- Egy <img>-hez megkeresi a hozzá tartozó GitHub-os utat ---- */
  /* A thumbnail (img.src, data:image...) alapján megkeressük a DB-ben azt a
     catch/event/session objektumot, amelynek photo mezője ez a thumbnail,
     és kiolvassuk a photoPath / photoRef.path értékét. */
  function findPathForThumb(thumbSrc){
    if(!thumbSrc) return null;
    var db=getdb();
    var sessions=(db&&db.sessions)||[];
    function pick(o){
      if(!o) return null;
      var path=o.photoPath || (o.photoRef && (o.photoRef.path||o.photoRef.relativePath));
      if(!path) return null;
      var thumb=String(o.photo||'');
      // egyezés: pontos, vagy data:image eleje egyezik (a thumbnailt az app
      // néha újrakódolja, ezért az eleje a megbízható összevetés)
      if(thumb===thumbSrc) return path;
      if(thumb.indexOf('data:image')===0 && thumbSrc.indexOf('data:image')===0
         && thumb.slice(0,120)===thumbSrc.slice(0,120)) return path;
      return null;
    }
    for(var si=0; si<sessions.length; si++){
      var s=sessions[si];
      if(!s) continue;
      var c=(s.catches)||[];
      for(var i=0;i<c.length;i++){ var hit=pick(c[i]); if(hit) return hit; }
      var ev=(s.events)||[];
      for(var j=0;j<ev.length;j++){ var hit2=pick(ev[j]); if(hit2) return hit2; }
      var shit=pick(s); if(shit) return shit;
    }
    return null;
  }

  /* ---- A nyitott nézet képeit élesre cseréli ---- */
  function upgradeImages(){
    // a fogás-részletben és a nagyító nézetben lévő képek
    var imgs=document.querySelectorAll(
      '#session-detail-wrap img, .catch-photo-preview, #kp-img-view img, #data-modal img'
    );
    Array.prototype.forEach.call(imgs,function(img){
      if(img.dataset.kpV39Done) return;
      var src=img.getAttribute('src')||'';
      // csak a base64 thumbnaileket nézzük (az éles GitHub-os kép már blob:)
      if(src.indexOf('data:image')!==0) return;

      var path=findPathForThumb(src);
      if(!path) return; // nincs hozzá GitHub-os eredeti -> marad a thumbnail

      img.dataset.kpV39Done='1';
      loadFullFromGithub(path).then(function(objUrl){
        if(objUrl){ img.src=objUrl; img.dataset.kpV39Full='1'; }
        else { img.dataset.kpV39Done=''; } // hiba esetén később újra próbálhatja
      });
    });
  }

  /* ---- Rákötés a renderelőkre + nagyítóra ---- */
  function hook(){
    ['renderSessionDetail','renderCatches','renderActiveSessionHome'].forEach(function(name){
      var orig=window[name];
      if(typeof orig==='function' && !orig.__kpV39){
        var wrapped=function(){
          var r=orig.apply(this,arguments);
          setTimeout(upgradeImages,60);
          setTimeout(upgradeImages,400);
          return r;
        };
        wrapped.__kpV39=true;
        window[name]=wrapped;
      }
    });
  }

  function boot(){ hook(); upgradeImages(); }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();

  // az app sok mindent késleltetve renderel + a nagyító dinamikusan nyílik
  var ticks=0;
  var iv=setInterval(function(){ hook(); upgradeImages(); if(++ticks>=15) clearInterval(iv); },2000);
  // koppintás (nagyítás megnyitása) után is frissítsünk
  document.addEventListener('click',function(){ setTimeout(upgradeImages,150); setTimeout(upgradeImages,600); },true);

  window.kpV39UpgradeImages=upgradeImages;
  console.log('[KP v39] éles fogásfotó behozás aktív');
})();
