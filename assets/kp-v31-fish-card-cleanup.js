(function(){
  if(window.KP_V31_FISH_CARD_CLEANUP)return;
  window.KP_V31_FISH_CARD_CLEANUP=true;
  function addStyle(){
    if(document.getElementById('kp-v31-fish-clean-style'))return;
    const s=document.createElement('style');
    s.id='kp-v31-fish-clean-style';
    s.textContent=`
      #fish-image-manager,.fish-image-manager,.fish-gallery-panel,.fish-image-tools,
      [id*="fish-image" i]:not(.fish-detail-img),[class*="fish-image-tools" i],
      .image-manager-card,.fish-manager-card{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important;}
      #page-fish .fish-card,#page-fish .fish-big-card,#page-fish .fish-detail-card{display:block!important;}
    `;
    document.head.appendChild(s);
  }
  function cleanup(){
    addStyle();
    const page=document.getElementById('page-fish')||document.body;
    page.querySelectorAll('button,label,div,section,article').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt.includes('Feltöltés')&&txt.includes('Megnyitás')&&txt.includes('Alap kép')){
        let card=el;
        for(let i=0;i<4&&card&&card.parentElement;i++){
          const t=(card.textContent||'').replace(/\s+/g,' ').trim();
          if(t.includes('Feltöltés')&&t.includes('Megnyitás')&&t.includes('Alap kép'))break;
          card=card.parentElement;
        }
        if(card){card.style.display='none';card.style.visibility='hidden';card.style.height='0';card.style.overflow='hidden';card.style.margin='0';card.style.padding='0';card.setAttribute('data-kp-hidden-old-fish-uploader','1');}
      }
    });
    page.querySelectorAll('*').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt.startsWith('Megjegyzés: saját feltöltött kép')||txt.includes('saját feltöltött kép ezen az eszközön offline is megmarad')){
        el.style.display='none';el.setAttribute('data-kp-hidden-old-fish-note','1');
      }
    });
  }
  const oldRenderFish=window.renderFish;
  if(typeof oldRenderFish==='function')window.renderFish=function(){const r=oldRenderFish.apply(this,arguments);setTimeout(cleanup,80);return r};
  const oldShowPage=window.showPage;
  if(typeof oldShowPage==='function')window.showPage=function(id){const r=oldShowPage.apply(this,arguments);setTimeout(cleanup,120);return r};
  function boot(){cleanup()}
  boot();setInterval(boot,1500);
})();
