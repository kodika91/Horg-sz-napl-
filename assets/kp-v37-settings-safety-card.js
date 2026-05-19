(function(){
  if(window.KP_V37_SETTINGS_SAFETY_CARD)return;
  window.KP_V37_SETTINGS_SAFETY_CARD=true;

  function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){}}
  function refresh(){['updateHome','renderSpotFinder','renderSessionsList','renderStorageOverview','renderActiveSessionHome','renderLocations'].forEach(function(fn){try{window[fn]&&window[fn]()}catch(e){}})}

  if(typeof window.kpRestoreLocalSafetyBackup!=='function'){
    window.kpRestoreLocalSafetyBackup=function(){
      try{
        var raw=localStorage.getItem(DB_KEY+'_safety_restore_latest')||localStorage.getItem(DB_KEY+'_before_github_restore');
        if(!raw){toast('Nincs helyi biztonsági mentés.');return;}
        var ok=confirm('Visszatöltsem a legutóbbi helyi biztonsági mentést?');
        if(!ok)return;
        localStorage.setItem(DB_KEY,raw);
        try{if(typeof migrateDB==='function')migrateDB()}catch(e){}
        refresh();
        toast('Biztonsági mentés visszatöltve.');
      }catch(e){toast('Biztonsági mentés visszatöltési hiba: '+e.message)}
    };
  }

  function makeCard(){
    var wrap=document.createElement('div');
    wrap.id='kp-safety-restore-card';
    wrap.className='card';
    wrap.style.margin='18px 0';
    wrap.style.padding='22px';
    wrap.style.borderRadius='22px';
    wrap.style.background='rgba(255,252,248,.94)';
    wrap.style.boxShadow='0 8px 24px rgba(58,39,18,.08)';
    wrap.style.border='1px solid rgba(120,100,70,.12)';

    var h=document.createElement('h3');
    h.textContent='Biztonsági mentés';
    h.style.margin='0 0 10px 0';
    h.style.fontSize='20px';
    h.style.fontWeight='900';

    var p=document.createElement('p');
    p.textContent='GitHub visszatöltés előtt automatikus helyi mentés készül. Ezzel visszaállítható a korábbi telefonos állapot.';
    p.style.margin='0 0 16px 0';
    p.style.fontSize='14px';
    p.style.lineHeight='1.45';
    p.style.color='var(--text2,#8a735f)';

    var b=document.createElement('button');
    b.type='button';
    b.textContent='Biztonsági mentés visszatöltése';
    b.style.width='100%';
    b.style.minHeight='54px';
    b.style.border='0';
    b.style.borderRadius='18px';
    b.style.background='linear-gradient(135deg,#2e8b77,#3f7f45)';
    b.style.color='#fff';
    b.style.fontWeight='900';
    b.style.fontSize='16px';
    b.onclick=window.kpRestoreLocalSafetyBackup;

    wrap.appendChild(h);wrap.appendChild(p);wrap.appendChild(b);
    return wrap;
  }

  function smallContainer(el){
    var cur=el;
    for(var i=0;i<6&&cur&&cur.parentElement;i++){
      var txt=(cur.textContent||'').toLowerCase();
      var r=cur.getBoundingClientRect();
      if(r.width>250&&r.height>60&&txt.length<900){return cur;}
      cur=cur.parentElement;
    }
    return el;
  }

  function findBlockByText(word){
    var nodes=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,div,section,article'));
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      var txt=(el.textContent||'').toLowerCase().replace(/\s+/g,' ').trim();
      if(txt===word||txt.indexOf(word)>-1){
        var r=el.getBoundingClientRect();
        if(r.width>0&&r.height>0)return smallContainer(el);
      }
    }
    return null;
  }

  function hideCsv(){
    [].slice.call(document.querySelectorAll('div,section,article')).forEach(function(el){
      var txt=(el.textContent||'').toLowerCase().replace(/\s+/g,' ');
      var r=el.getBoundingClientRect();
      if(r.width>250&&txt.length<900&&(txt.indexOf('csv export')>-1||txt.indexOf('csv letöltése')>-1))el.style.display='none';
    });
  }

  function insertCard(){
    if(document.getElementById('kp-safety-restore-card'))return;
    var importBlock=findBlockByText('importálás');
    var jsonBlock=findBlockByText('json mentés');
    var pdfBlock=findBlockByText('túraösszesítő export');
    var card=makeCard();
    if(importBlock&&importBlock.parentNode){importBlock.parentNode.insertBefore(card,importBlock);return;}
    if(jsonBlock&&jsonBlock.parentNode&&jsonBlock.nextSibling){jsonBlock.parentNode.insertBefore(card,jsonBlock.nextSibling);return;}
    if(pdfBlock&&pdfBlock.parentNode&&pdfBlock.nextSibling){pdfBlock.parentNode.insertBefore(card,pdfBlock.nextSibling);return;}
  }

  function run(){try{hideCsv();insertCard()}catch(e){console.log('[KP v37]',e)}}
  var oldShow=window.showPage;
  if(typeof oldShow==='function'&&!oldShow.KP_V37_SETTINGS_WRAPPED){
    window.showPage=function(){var r=oldShow.apply(this,arguments);setTimeout(run,150);setTimeout(run,800);return r};
    window.showPage.KP_V37_SETTINGS_WRAPPED=true;
  }
  setTimeout(run,400);setTimeout(run,1200);setTimeout(run,2500);setInterval(run,2000);
})();