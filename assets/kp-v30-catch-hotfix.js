/* ============================================================================
 * KapásPont · kp-v30-catch-hotfix.js  (v44 javítás: lista nem ugrál gépelés közben)
 * ----------------------------------------------------------------------------
 * Ez a fájl a meglévő kp-v30 TELJES cseréje. Minden eredeti működés megmarad
 * (fotó-nagyító, csali/módszer javaslatok, modal-fix). EGY dolgot javít:
 *
 *   A korábbi verzió 2 másodpercenként (setInterval) újraépítette a csali/
 *   módszer datalistát. Amíg lassan választottál vagy gépeltél egy mezőben,
 *   a lista "a lábad alatt" frissült -> ugrált, újra feldobta a javaslatokat.
 *
 *   Most a periodikus frissítés KIHAGYJA az újraépítést, amíg egy beviteli
 *   mezőben (input/select/textarea) van a fókusz. Amint elhagyod a mezőt,
 *   egyszer frissít. Így gépelés közben stabil marad.
 *
 * Ezt a fájlt töltsd fel az assets/ mappába ugyanezen a néven (felülírja a régit).
 * ==========================================================================*/
(function(){
  if(window.KP_V30_CATCH_HOTFIX)return;
  window.KP_V30_CATCH_HOTFIX=true;
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uniq=a=>[...new Set(a.map(x=>String(x||'').trim()).filter(Boolean).filter(x=>x.toLowerCase()!=='match'))];
  function getdb(){try{return typeof getDB==='function'?getDB():{}}catch(e){return {}}}
  function baits(){const d=getdb();return uniq(['Csonti','Pinki','Giliszta','Kukorica','Aqua Garant 2,5 mm',...(d.baits||[]).map(x=>x.name),...(d.sessions||[]).flatMap(s=>(s.catches||[]).map(c=>c.bait))]).sort((a,b)=>a.localeCompare(b,'hu'))}
  function methods(){const d=getdb();return uniq(['Feeder','Method feeder','Matchbot','Úszós','Rakós','Spicc','Pergetés','Bojlis','Harcsázás',...(d.sessions||[]).flatMap(s=>[s.method,...(s.catches||[]).map(c=>c.method)])]).sort((a,b)=>a.localeCompare(b,'hu'))}
  function list(id,arr){let el=document.getElementById(id);if(!el){el=document.createElement('datalist');el.id=id;document.body.appendChild(el)}const html=arr.map(v=>'<option value="'+esc(v)+'"></option>').join('');if(el.innerHTML!==html)el.innerHTML=html}

  /* ---- ÚJ: ne frissítsünk, amíg a felhasználó beviteli mezőben van ---- */
  function inEditableField(){
    const el=document.activeElement;
    if(!el)return false;
    const tag=(el.tagName||'').toLowerCase();
    if(tag==='input'||tag==='select'||tag==='textarea')return true;
    if(el.isContentEditable)return true;
    return false;
  }
  let deferredRefresh=false;

  function refresh(){
    // ha épp egy mezőben vagy, NE építsük újra a listát (különben ugrál);
    // megjegyezzük, hogy később kell egy frissítés
    if(inEditableField()){ deferredRefresh=true; return; }
    list('bait-options',baits());
    list('method-options',methods());
    document.querySelectorAll('#ac-bait,input[list="bait-options"]').forEach(i=>i.setAttribute('list','bait-options'));
    document.querySelectorAll('#ac-method,input[placeholder*="Feeder"],input[placeholder*="Match"],input[placeholder*="módszer" i]').forEach(i=>i.setAttribute('list','method-options'));
  }
  // amikor elhagysz egy mezőt, ha közben halasztottunk, frissítsünk egyszer
  document.addEventListener('focusout',function(){
    setTimeout(function(){ if(deferredRefresh && !inEditableField()){ deferredRefresh=false; refresh(); } },150);
  },true);

  const oldUpdate=window.updateDatalists;window.updateDatalists=function(){try{oldUpdate&&oldUpdate.apply(this,arguments)}catch(e){}refresh()};
  function cfg(){try{return typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||'{}')}catch(e){return {}}}
  async function loadGithubImage(path){const c=cfg(); if(!path||!c.owner||!c.repo||!c.branch||!c.token)return null;const api=String(path).split('/').map(encodeURIComponent).join('/');const r=await fetch('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+api+'?ref='+encodeURIComponent(c.branch),{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}});if(!r.ok)return null;const d=await r.json(); const raw=String(d.content||'').replace(/\n/g,''); if(!raw)return null;const bin=atob(raw); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const type=path.toLowerCase().endsWith('.png')?'image/png':path.toLowerCase().endsWith('.webp')?'image/webp':'image/jpeg';return URL.createObjectURL(new Blob([bytes],{type}));}
  function findOriginalForImg(img){const src=img&&img.src||''; const d=getdb();for(const s of (d.sessions||[])){for(const c of (s.catches||[])){if(!c)continue;const small=String(c.photo||'');if(src===small || src.endsWith(small.slice(-60)) || (small&&src.startsWith('data:image')&&small.startsWith('data:image')&&src.slice(0,80)===small.slice(0,80))){return c.photoPath || (c.photoRef&&c.photoRef.path) || (c.photoRef&&c.photoRef.relativePath) || small;}}}return src;}
  function style(){if(document.getElementById('kp-v30-style'))return;const s=document.createElement('style');s.id='kp-v30-style';s.textContent='#kp-img-view{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.86);padding:10px}#kp-img-view.show{display:flex}#kp-img-view .box{position:relative;width:96vw;height:88dvh;background:#101816;border-radius:20px;overflow:hidden;display:flex;align-items:center;justify-content:center}#kp-img-view img{width:100%;height:100%;display:block;object-fit:contain;image-rendering:auto}#kp-img-view .x{position:absolute;right:10px;top:10px;border:0;border-radius:50%;width:38px;height:38px;background:rgba(0,0,0,.42);color:#fff;font-size:28px;z-index:2}.kp-sug{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.kp-sug button{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:6px 9px;font-weight:800;color:var(--moss)}.catch-photo-preview,#session-detail-wrap img{cursor:zoom-in}';document.head.appendChild(s)}
  function viewer(){let v=document.getElementById('kp-img-view');if(v)return v;v=document.createElement('div');v.id='kp-img-view';v.innerHTML='<div class="box"><button class="x">×</button><img alt="Fogás fotó"></div>';document.body.appendChild(v);v.addEventListener('click',e=>{if(e.target===v||e.target.className==='x')v.classList.remove('show')});return v}
  async function openImgFromElement(img){if(!img)return;const v=viewer();const out=v.querySelector('img');out.src=img.src;v.classList.add('show');const orig=findOriginalForImg(img);if(orig && !String(orig).startsWith('data:image') && orig!==img.src){try{const blob=await loadGithubImage(orig);if(blob)out.src=blob}catch(e){console.warn('Nagy kép nem tölthető:',e)}}}
  function hookImages(){document.querySelectorAll('#session-detail-wrap img,.catch-photo-preview').forEach(img=>{if(img.dataset.kpV30)return;img.dataset.kpV30='1';img.title='Koppints a nagyításhoz';img.addEventListener('click',e=>{e.stopPropagation();openImgFromElement(img)})})}
  function modalFix(){const b=document.getElementById('ac-bait'),m=document.getElementById('ac-method');if(b){b.setAttribute('list','bait-options');b.placeholder='pl. Csonti'}if(m){m.setAttribute('list','method-options');m.placeholder='pl. Matchbot / Feeder'}if((b||m)&&!document.querySelector('.kp-sug')){const row=document.createElement('div');row.className='kp-sug';row.innerHTML=['Csonti','Pinki','Aqua Garant 2,5 mm','Matchbot','Feeder','Method feeder'].map(x=>'<button type="button">'+esc(x)+'</button>').join('');(b||m).closest('.event-form-grid')?.after(row);row.onclick=e=>{const x=e.target.closest('button');if(!x)return;const v=x.textContent.trim();if(['Matchbot','Feeder','Method feeder'].includes(v)&&m)m.value=v;else if(b)b.value=v}}
  }
  const oldAdd=window.addActiveCatch;if(typeof oldAdd==='function')window.addActiveCatch=function(){const r=oldAdd.apply(this,arguments);setTimeout(()=>{refresh();modalFix()},100);return r};
  const oldDetail=window.renderSessionDetail;if(typeof oldDetail==='function')window.renderSessionDetail=function(){const r=oldDetail.apply(this,arguments);setTimeout(hookImages,100);return r};
  const oldRC=window.renderCatches;if(typeof oldRC==='function')window.renderCatches=function(){const r=oldRC.apply(this,arguments);setTimeout(()=>{refresh();hookImages()},100);return r};
  function boot(){style();refresh();hookImages();modalFix()}
  boot();
  /* ---- ÚJ: a periodikus boot KIHAGYJA a munkát, ha beviteli mezőben vagy ----
     (a refresh() amúgy is védett, de a hookImages/modalFix DOM-bütykölést sem
     akarjuk gépelés közben, mert az is okozhat fókusz-ugrást) */
  setInterval(function(){ if(inEditableField())return; boot(); },2500);
})();
