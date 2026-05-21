/* ============================================================================
 * KapásPont · DIAGNOSZTIKA · fogáskép kattintás nyomon követése
 * ----------------------------------------------------------------------------
 * Ez NEM javítás — csak kiírja a képernyő aljára, mi történik, amikor egy
 * fogásképre koppintasz. Így iPhone-on, konzol nélkül is látjuk a tényt.
 *
 * Mit mutat egy koppintás után:
 *  - hány kattintás-kezelő van a képen
 *  - van-e data-full / photoPath a képhez
 *  - melyik nagyító nyílt meg (#kp-img-view = régi v30/v37, #kp-v38-view = új)
 *  - mi a nagyító képének forrása (thumbnail / blob = éles)
 *
 * BEILLESZTÉS (index.html, a LEGUTOLSÓ addScript sorként):
 *   addScript('kp-diag','assets/kp-diag.js?v=1');
 *
 * Ha megvan a hiba oka, ezt a sort és a fájlt töröld.
 * ==========================================================================*/
(function(){
  if(window.KP_DIAG)return; window.KP_DIAG=true;

  // diagnosztikai sáv a képernyő alján
  var bar=document.createElement('div');
  bar.id='kp-diag-bar';
  bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.92);color:#9fe;font:12px/1.4 monospace;padding:8px 10px;max-height:42vh;overflow:auto;white-space:pre-wrap;border-top:2px solid #2f6';
  bar.textContent='[DIAG] Kész. Koppints egy fogásképre…';
  function ready(){ if(document.body){document.body.appendChild(bar);} else {setTimeout(ready,300);} }
  ready();

  function log(msg){
    var t=new Date().toTimeString().slice(0,8);
    bar.textContent=('['+t+'] '+msg+'\n\n'+bar.textContent).slice(0,4000);
  }

  function srcKind(s){
    s=String(s||'');
    if(s.indexOf('blob:')===0)return 'BLOB (éles, jó)';
    if(s.indexOf('data:image')===0)return 'THUMBNAIL (base64, pixeles)';
    if(!s)return 'üres';
    return 'egyéb: '+s.slice(0,40);
  }

  // megnézzük, milyen kattintás-kezelők ülnek a képen (amennyire JS-ből látható)
  function describeImg(img){
    var hasOnclick = typeof img.onclick==='function';
    var df = img.dataset && img.dataset.full || '';
    return 'img.onclick='+(hasOnclick?'VAN (v37 gyanús)':'nincs')
         + ' | data-full='+(df?('VAN ('+df.slice(-30)+')'):'NINCS')
         + ' | jelenlegi src='+srcKind(img.getAttribute('src'));
  }

  // a fogáskép kattintását CAPTURE-ben figyeljük (csak naplózunk, nem avatkozunk)
  document.addEventListener('click',function(e){
    var img=e.target&&e.target.closest?e.target.closest('#session-detail-wrap img,.catch-photo-preview'):null;
    if(!img)return;
    log('KATTINTÁS fogásképre.\n  '+describeImg(img));
    // figyeljük, mi nyílik meg és mivé válik a nagyító képe
    var checks=0;
    var iv=setInterval(function(){
      checks++;
      var oldV=document.getElementById('kp-img-view');
      var newV=document.getElementById('kp-v38-view');
      var oldOpen=oldV&&(oldV.classList.contains('show')||getComputedStyle(oldV).display!=='none');
      var newOpen=newV&&getComputedStyle(newV).display!=='none';
      var which=newOpen?'ÚJ (#kp-v38-view, jó)':oldOpen?'RÉGI (#kp-img-view, v30/v37)':'egyik sem (még?)';
      var openV=newOpen?newV:oldOpen?oldV:null;
      var imgsrc=openV?srcKind(openV.querySelector('img')&&openV.querySelector('img').getAttribute('src')):'-';
      log('  +'+(checks*400)+'ms: megnyílt nagyító = '+which+' | nagyító képe = '+imgsrc);
      if(checks>=5)clearInterval(iv);
    },400);
  },true);

  log('[DIAG] Figyelés aktív. Nyiss meg egy fogást és koppints a képre.');
})();
