/* kp-mod-fish-detail-scroll-fix.js — Halfaj részletes kártya mobil görgetés javítás
 * v1.0 · Csak halfaj részlet / megnyitott hal kártya esetén aktiválódik.
 * Cél: telefonon ne a háttér, hanem a megnyitott halfaj kártya görögjön.
 */
(function(){
'use strict';
if(window.KP_FISH_DETAIL_SCROLL_FIX_V1)return;
window.KP_FISH_DETAIL_SCROLL_FIX_V1=true;

let locked=false, activePanel=null, activeScroll=null, lastY=null;
function qs(s,r=document){return r.querySelector(s)}
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function text(el){return String(el&&el.textContent||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function visible(el){
  if(!el||!el.isConnected)return false;
  const st=getComputedStyle(el);
  if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0')return false;
  const r=el.getBoundingClientRect();
  return r.width>120&&r.height>120;
}
function isFishPage(){
  const p=qs('#page-fish');
  if(p&&p.classList&&p.classList.contains('active'))return true;
  const title=text(qs('.top-bar-title')||document.body);
  return title.includes('halfaj')||title.includes('halak')||title.includes('hal');
}
function isDetailPanel(el){
  if(!el||!visible(el))return false;
  const cls=String(el.className||'')+' '+String(el.id||'');
  const t=text(el);
  const hasDetailClass=/fish-detail|fish-modal|detail|modal|dialog|sheet|drawer|popup/i.test(cls);
  const hasFishDetailWords=t.includes('tilalmi')||t.includes('méretkorlátozás')||t.includes('meretkorlatozas')||t.includes('latin')||t.includes('azonosítás')||t.includes('azonositas')||t.includes('élőhely')||t.includes('elohely')||t.includes('védett')||t.includes('vedett');
  const hasHero=!!qs('.fish-detail-hero,.fish-detail-img,.fish-detail-title,.fish-id-overview,.fish-id-block,.fish-detail-section',el);
  return (hasDetailClass&&hasFishDetailWords)||hasHero;
}
function findFishDetailPanel(){
  const direct=qsa('.modal,.modal-content,.modal-body,.sheet,.bottom-sheet,.drawer,.dialog,[role="dialog"],.fish-detail,.fish-detail-card,.fish-detail-panel,.fish-card-detail')
    .filter(isDetailPanel);
  if(direct.length){
    return direct.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
  }
  const title=qs('.fish-detail-title,.fish-name-sci,.fish-name');
  if(title){
    let n=title;
    for(let i=0;n&&n!==document.body&&i<12;i++,n=n.parentElement){
      if(isDetailPanel(n))return n;
    }
  }
  return null;
}
function findScroll(panel){
  if(!panel)return null;
  const named=['.modal-body','.modal-content','.sheet-body','.drawer-body','.dialog-body','.fish-detail-body','.fish-detail-content'];
  for(const s of named){const el=qs(s,panel);if(el&&visible(el))return el;}
  return panel;
}
function lockBody(){
  if(locked)return;
  document.documentElement.classList.add('kp-fish-detail-lock');
  document.body.classList.add('kp-fish-detail-lock');
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  locked=true;
}
function unlockBody(){
  if(!locked)return;
  document.documentElement.classList.remove('kp-fish-detail-lock');
  document.body.classList.remove('kp-fish-detail-lock');
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
  if(activePanel)activePanel.classList.remove('kp-fish-detail-panel-active');
  if(activeScroll){
    activeScroll.classList.remove('kp-fish-detail-scroll-area');
    activeScroll.style.overflowY='';
    activeScroll.style.webkitOverflowScrolling='';
    activeScroll.style.overscrollBehavior='';
    activeScroll.style.touchAction='';
    activeScroll.style.maxHeight='';
    activeScroll.style.paddingBottom='';
  }
  activePanel=null;activeScroll=null;locked=false;
}
function ensureSpacer(sc){
  if(!sc||sc.querySelector(':scope > .kp-fish-detail-scroll-spacer'))return;
  const sp=document.createElement('div');
  sp.className='kp-fish-detail-scroll-spacer';
  sp.style.cssText='height:150px;min-height:150px;pointer-events:none';
  sc.appendChild(sp);
}
function activate(panel){
  activePanel=panel;
  activeScroll=findScroll(panel)||panel;
  panel.classList.add('kp-fish-detail-panel-active');
  const vh=(window.visualViewport&&window.visualViewport.height)||window.innerHeight||700;
  activeScroll.classList.add('kp-fish-detail-scroll-area');
  activeScroll.style.overflowY='auto';
  activeScroll.style.webkitOverflowScrolling='touch';
  activeScroll.style.overscrollBehavior='contain';
  activeScroll.style.touchAction='pan-y';
  activeScroll.style.maxHeight=Math.max(320,Math.floor(vh-18))+'px';
  activeScroll.style.paddingBottom='max(160px, calc(130px + env(safe-area-inset-bottom)))';
  ensureSpacer(activeScroll);
  lockBody();
}
function update(){
  const panel=findFishDetailPanel();
  if(panel)activate(panel); else unlockBody();
}
function canScroll(el,dy){
  if(!el)return false;
  if(el.scrollHeight<=el.clientHeight+4)return false;
  if(dy<0&&el.scrollTop<=0)return false;
  if(dy>0&&el.scrollTop+el.clientHeight>=el.scrollHeight-2)return false;
  return true;
}
document.addEventListener('touchstart',function(e){lastY=e.touches&&e.touches[0]?e.touches[0].clientY:null;setTimeout(update,0);},{passive:true,capture:true});
document.addEventListener('touchmove',function(e){
  if(!locked)return;
  const y=e.touches&&e.touches[0]?e.touches[0].clientY:null;
  const dy=(lastY==null||y==null)?0:(lastY-y);
  lastY=y;
  if(activeScroll&&activePanel&&activePanel.contains(e.target)&&canScroll(activeScroll,dy))return;
  e.preventDefault();
},{passive:false,capture:true});
document.addEventListener('click',function(){setTimeout(update,80);setTimeout(update,350);setTimeout(update,900);},true);
window.addEventListener('resize',function(){setTimeout(update,100)});
if(window.visualViewport)visualViewport.addEventListener('resize',function(){setTimeout(update,100)});
window.addEventListener('orientationchange',function(){setTimeout(update,350)});
setInterval(update,800);
(function style(){
  if(qs('#kp-fish-detail-scroll-fix-css'))return;
  const st=document.createElement('style');
  st.id='kp-fish-detail-scroll-fix-css';
  st.textContent='html.kp-fish-detail-lock,body.kp-fish-detail-lock{overscroll-behavior:none!important}.kp-fish-detail-panel-active{overscroll-behavior:contain!important}.kp-fish-detail-scroll-area{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;scroll-padding-bottom:160px!important}.kp-fish-detail-scroll-area input,.kp-fish-detail-scroll-area textarea,.kp-fish-detail-scroll-area select,.kp-fish-detail-scroll-area button{touch-action:manipulation!important}.kp-fish-detail-scroll-spacer{display:block!important}';
  document.head.appendChild(st);
})();
setTimeout(update,500);setTimeout(update,1500);
window.kpFishDetailScrollDebug=function(){const p=findFishDetailPanel();return{fishPage:isFishPage(),panel:p?(p.id||p.className||p.tagName):null,scroll:activeScroll?(activeScroll.id||activeScroll.className||activeScroll.tagName):null,locked,scrollTop:activeScroll&&activeScroll.scrollTop,scrollHeight:activeScroll&&activeScroll.scrollHeight,clientHeight:activeScroll&&activeScroll.clientHeight}};
console.log('[fish-detail-scroll-fix] v1.0 aktív');
})();
