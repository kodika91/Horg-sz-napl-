// kp-mod-home-layout-fix.js — modern shell, egy felső menü, GPS kompatibilitás
(function(){
'use strict';
if(window.KP_MOD_HOME_LAYOUT_FIX_V2)return;
window.KP_MOD_HOME_LAYOUT_FIX_V2=true;
function addCss(){
  if(document.getElementById('kph-layout-fix-css'))return;
  var s=document.createElement('style');
  s.id='kph-layout-fix-css';
  s.textContent='\
body{background:#061917!important;overflow-x:hidden!important;color:#f4fff9!important}.sidebar,.top-bar,.mobile-header,.mobile-nav,.bottom-nav,.app-header,.hero-header{display:none!important}.main-area{margin-left:0!important;width:100%!important;max-width:none!important}.app-layout{display:block!important;width:100%!important}.page-content{max-width:none!important;width:100%!important;padding:18px 22px 34px!important;margin:0!important;background:#061917!important}.page{max-width:100%!important;overflow-x:hidden;color:#f4fff9!important}.kph-global-nav{position:sticky;top:0;z-index:9999;margin:0;padding:14px 24px;background:rgba(5,22,21,.90);border-bottom:1px solid rgba(174,255,230,.14);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:space-between;gap:18px;color:#f3fff9}.kph-global-brand{display:flex;align-items:center;gap:10px;font-weight:950;font-size:18px;white-space:nowrap}.kph-global-brand i{color:#5dff91;font-size:22px}.kph-global-brand span{color:#f4fff9}.kph-global-links{display:flex;align-items:center;gap:10px;overflow:auto;scrollbar-width:none}.kph-global-links button{border:1px solid rgba(174,255,230,.16);background:rgba(255,255,255,.08);color:#f3fff9;border-radius:18px;padding:11px 15px;font-weight:850;display:flex;align-items:center;gap:8px;white-space:nowrap;box-shadow:0 10px 28px rgba(0,0,0,.18)}.kph-global-links button.active,.kph-global-links button:hover{background:linear-gradient(135deg,rgba(93,255,145,.28),rgba(46,213,255,.14));border-color:rgba(93,255,145,.32)}.kph-global-links button.new-trip{background:linear-gradient(135deg,#5dff91,#2ed5ff)!important;color:#031615!important;border:0!important}.kph-global-links button.new-trip i{color:#031615!important}.kph-global-links i{color:#5dff91}.kph-home .kph-navline{display:none!important}.kph-home .kph-hero{margin-top:0!important}.kph-home{padding-top:0!important}#gps-dot,#gps-text{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}.card,.panel,.kpms-panel,.kpms-kpi,.kpgm-card,.kpgm-overview,.kpbm-card,.kpbm-overview,.kpsfm-list-panel,.kpsfm-map-panel,.session-card,.timeline-card,.location-card,.map-card,.detail-hero,.detail-mode-panel{max-width:100%!important;box-sizing:border-box!important;background:rgba(8,36,33,.82)!important;border-color:rgba(174,255,230,.18)!important;color:#f4fff9!important;box-shadow:0 18px 48px rgba(0,0,0,.24)!important}.kpms-kpi-grid,.kpms-two,.kpms-three,.kpgm-overview-grid,.kpbm-grid,.kpsfm-main{max-width:100%!important}h1,h2,h3,h4,.title,.section-title,.kpms-panel h2,.kpms-kpi-title,.kpms-kpi-val,.kpgm-title,.kpbm-name,.kpsfm-title h1{color:#f4fff9!important}p,small,em,.muted,.subtitle,.kpms-muted,.kpms-kpi-sub,.kpgm-sub,.kpbm-sub,.kpsfm-title p{color:rgba(230,255,248,.76)!important}.weather-card{display:none!important}@media(max-width:900px){.kph-global-nav{padding:12px 14px;align-items:flex-start;flex-direction:column}.kph-global-links{width:100%;padding-bottom:2px}.page-content{padding:12px 14px 28px!important}.kph-hero{margin-left:-14px!important;margin-right:-14px!important;border-radius:0!important}}';
  document.head.appendChild(s);
}
function ensureGpsNodes(){if(!document.getElementById('gps-dot')){var d=document.createElement('span');d.id='gps-dot';d.className='gps-dot';document.body.appendChild(d)}if(!document.getElementById('gps-text')){var t=document.createElement('span');t.id='gps-text';t.textContent='';document.body.appendChild(t)}}
function navItem(id,ico,label,cls){return '<button data-page="'+id+'" '+(cls?'class="'+cls+'"':'')+' onclick="showPage&&showPage(\''+id+'\',this)"><i class="ti '+ico+'"></i>'+label+'</button>'}
function installNav(){
  var nav=document.getElementById('kph-global-nav');
  if(!nav){
    nav=document.createElement('div');nav.id='kph-global-nav';nav.className='kph-global-nav';
    nav.innerHTML='<div class="kph-global-brand"><i class="ti ti-fish"></i><span>Vízparti Napló</span></div><div class="kph-global-links">'+
      navItem('home','ti-home','Főmenü')+navItem('sessions','ti-calendar-stats','Napló')+navItem('spotfinder','ti-map-pin','Helyek')+navItem('gear','ti-bike','Felszerelés')+navItem('baits','ti-ripple','Csalik')+navItem('fish','ti-fish','Halfajok')+navItem('stats','ti-chart-bar','Statisztika')+navItem('map','ti-map','Térkép')+navItem('new-session','ti-plus','Új túra','new-trip')+'</div>';
    document.body.insertBefore(nav,document.body.firstChild);
  }else{
    var links=nav.querySelector('.kph-global-links');
    if(links){
      var nt=links.querySelector('[data-page="new-session"]');
      if(nt)links.appendChild(nt);
      if(!links.querySelector('[data-page="fish"]')){var f=document.createElement('button');f.dataset.page='fish';f.innerHTML='<i class="ti ti-fish"></i>Halfajok';f.onclick=function(){showPage&&showPage('fish',f)};var st=links.querySelector('[data-page="stats"]');links.insertBefore(f,st||null)}
    }
  }
  markActive();
}
function activePage(){var p=document.querySelector('.page.active');if(!p||!p.id)return 'home';return p.id.replace(/^page-/,'')}
function markActive(){var id=activePage();document.querySelectorAll('.kph-global-links button').forEach(function(b){b.classList.toggle('active',b.dataset.page===id)})}
function wrapGps(){var old=window.getLocation;if(typeof old==='function'&&!old.__kphGpsSafe){window.getLocation=function(){ensureGpsNodes();return old.apply(this,arguments)};window.getLocation.__kphGpsSafe=true}}
function wrapShow(){var old=window.showPage;if(typeof old==='function'&&!old.__kphLayoutFixV2){window.showPage=function(id,el){ensureGpsNodes();var r=old.apply(this,arguments);setTimeout(markActive,60);setTimeout(installNav,120);return r};window.showPage.__kphLayoutFixV2=true}}
function tick(){addCss();ensureGpsNodes();installNav();wrapGps();wrapShow();markActive()}
setTimeout(tick,200);setTimeout(tick,800);setTimeout(tick,1600);setInterval(tick,1200);
})();