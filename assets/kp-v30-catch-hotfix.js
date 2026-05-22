/* ============================================================================
 * KapásPont · kp-v30-catch-hotfix.js  (v44 javítás: lista nem ugrál gépelés közben)
 * ----------------------------------------------------------------------------
 * Ez a fájl a meglévő kp-v30 TELJES cseréje. Minden eredeti működés megmarad
 * (csali/módszer javaslatok, modal-fix). EGY dolgot javít:
 *
 *   A korábbi verzió 2 másodpercenként (setInterval) újraépítette a csali/
 *   módszer datalistát. Amíg lassan választottál vagy gépeltél egy mezőben,
 *   a lista "a lábad alatt" frissült -> ugrált, újra feldobta a javaslatokat.
 *
 *   Most a periodikus frissítés KIHAGYJA az újraépítést, amíg egy beviteli
 *   mezőben (input/select/textarea) van a fókusz. Amint elhagyod a mezőt,
 *   egyszer frissít. Így gépelés közben stabil marad.
 *
 * v51: hookImages() no-op – a képnéző kizárólag kp-v38 feladata.
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
    if(inEditableField()){ deferredRefresh=true; return; }
    list('bait-options',baits());
    list('method-options',methods());
    document.querySelectorAll('#ac-bait,input[list="bait-options"]').forEach(i=>i.setAttribute('list','bait-options'));
    document.querySelectorAll('#ac-method,input[placeholder*="Feeder"],input[placeholder*="Match"],input[placeholder*="módszer" i]').forEach(i=>i.setAttribute('list','method-options'));
  }
  document.addEventListener('focusout',function(){
    setTimeout(function(){ if(deferredRefresh && !inEditableField()){ deferredRefresh=false; refresh(); } },150);
  },true);

  const oldUpdate=window.updateDatalists;window.updateDatalists=function(){try{oldUpdate&&oldUpdate.apply(this,arguments)}catch(e){}refresh()};
  function style(){if(document.getElementById('kp-v30-style'))return;const s=document.createElement('style');s.id='kp-v30-style';s.textContent='.kp-sug{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.kp-sug button{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:6px 9px;font-weight:800;color:var(--moss)}.catch-photo-preview,#session-detail-wrap img{cursor:zoom-in}';document.head.appendChild(s)}
  function hookImages(){/* v38 kezeli a képnézőt – onclick-et ide ne adjunk */}
  function modalFix(){const b=document.getElementById('ac-bait'),m=document.getElementById('ac-method');if(b){b.setAttribute('list','bait-options');b.placeholder='pl. Csonti'}if(m){m.setAttribute('list','method-options');m.placeholder='pl. Matchbot / Feeder'}if((b||m)&&!document.querySelector('.kp-sug')){const row=document.createElement('div');row.className='kp-sug';row.innerHTML=['Csonti','Pinki','Aqua Garant 2,5 mm','Matchbot','Feeder','Method feeder'].map(x=>'<button type="button">'+esc(x)+'</button>').join('');(b||m).closest('.event-form-grid')?.after(row);row.onclick=e=>{const x=e.target.closest('button');if(!x)return;const v=x.textContent.trim();if(['Matchbot','Feeder','Method feeder'].includes(v)&&m)m.value=v;else if(b)b.value=v}}
  }
  const oldAdd=window.addActiveCatch;if(typeof oldAdd==='function')window.addActiveCatch=function(){const r=oldAdd.apply(this,arguments);setTimeout(()=>{refresh();modalFix()},100);return r};
  const oldDetail=window.renderSessionDetail;if(typeof oldDetail==='function')window.renderSessionDetail=function(){const r=oldDetail.apply(this,arguments);setTimeout(hookImages,100);return r};
  const oldRC=window.renderCatches;if(typeof oldRC==='function')window.renderCatches=function(){const r=oldRC.apply(this,arguments);setTimeout(()=>{refresh();hookImages()},100);return r};
  function boot(){style();refresh();hookImages();modalFix()}
  boot();
  setInterval(function(){ if(inEditableField())return; boot(); },2500);
})();
