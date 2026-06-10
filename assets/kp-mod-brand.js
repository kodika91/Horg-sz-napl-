// kp-mod-brand.js — "Vízparti Napló" név + természet logó + évszakkövető magyar víz-fotó + sidebar fejléc
// Biztonságos: csak látható szöveget cserél és CSS-t ad; kódhoz/kulcsokhoz nem nyúl.
(function(){
  if(window.KP_MOD_BRAND_V1)return;
  window.KP_MOD_BRAND_V1=true;

  var NAME='Vízparti Napló';
  var OLD=/KapásPont/g;
  var LOGO='<svg class="kp-nature" viewBox="0 0 512 512" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<defs>'+
    '<linearGradient id="kpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc0cf"/><stop offset=".55" stop-color="#2c6e7a"/><stop offset="1" stop-color="#1f5560"/></linearGradient>'+
    '<linearGradient id="kpHb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e9b62"/><stop offset="1" stop-color="#345a40"/></linearGradient>'+
    '<linearGradient id="kpHf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a7c59"/><stop offset="1" stop-color="#2e5038"/></linearGradient>'+
    '<radialGradient id="kpSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffeeb0"/><stop offset="1" stop-color="#f4c25a"/></radialGradient>'+
    '<clipPath id="kpR"><rect width="512" height="512" rx="112"/></clipPath>'+
    '</defs>'+
    '<g clip-path="url(#kpR)">'+
    '<rect width="512" height="512" fill="url(#kpSky)"/>'+
    '<circle cx="350" cy="156" r="60" fill="url(#kpSun)"/>'+
    '<circle cx="350" cy="156" r="86" fill="#ffeeb0" opacity=".14"/>'+
    '<path d="M0 300 Q150 224 300 288 T512 276 V512 H0 Z" fill="url(#kpHb)"/>'+
    '<path d="M0 366 Q176 296 344 352 T512 344 V512 H0 Z" fill="url(#kpHf)"/>'+
    '<rect y="404" width="512" height="108" fill="#1b4a55"/>'+
    '<rect x="334" y="404" width="34" height="108" fill="#ffeeb0" opacity=".16"/>'+
    '<g stroke="#cdeaef" stroke-width="6" stroke-linecap="round" fill="none" opacity=".5">'+
    '<path d="M64 442 q24 -12 48 0 t48 0"/><path d="M300 472 q24 -12 48 0 t48 0"/><path d="M150 490 q24 -12 48 0 t48 0"/>'+
    '</g></g></svg>';

  // Évszakkövető magyar víz-fotók (Unsplash, szabad felhasználás). Tartalék: gradiens.
  var SPRING='https://images.unsplash.com/photo-1693242285155-e8d3793e92b9?w=1280&q=70&auto=format&fit=crop'; // Balaton, zöld part
  var SUMMER='https://images.unsplash.com/photo-1777833021034-c5e230d8ded3?w=1280&q=70&auto=format&fit=crop'; // Tisza-tó, türkiz
  var AUTUMN='https://images.unsplash.com/photo-1530656409552-a0c542bb3dc9?w=1280&q=70&auto=format&fit=crop'; // Tisza, őszi
  var WINTER='https://images.unsplash.com/photo-1720814687735-e5a6b53311ad?w=1280&q=70&auto=format&fit=crop'; // havas folyópart
  var FALLBACK='linear-gradient(135deg, #6cc0cf 0%, #2c6e7a 52%, #1f5560 100%)';
  var OVERLAY='linear-gradient(180deg, rgba(18,46,55,.28) 0%, rgba(18,46,55,.60) 100%)';

  function injectStyle(){
    if(document.getElementById('kp-brand-style'))return;
    var s=document.createElement('style');
    s.id='kp-brand-style';
    s.textContent=
      /* --- Sidebar márka-sarok: háttér + vízcsík + logó-keret --- */
      '.sidebar-brand{background:linear-gradient(135deg, rgba(44,110,122,.18) 0%, rgba(74,124,89,.12) 55%, transparent 100%)!important;border-bottom:1px solid var(--border)!important;position:relative!important;padding-bottom:18px!important}'+
      '.sidebar-brand::after{content:""!important;position:absolute!important;left:18px!important;right:18px!important;bottom:0!important;height:2px!important;background:linear-gradient(90deg,transparent,var(--water2,#3a8a99),transparent)!important;opacity:.45!important}'+
      '.brand-logo{width:46px!important;height:46px!important;padding:0!important;overflow:hidden!important;border-radius:13px!important;box-shadow:0 6px 16px rgba(44,110,122,.32)!important}'+
      '.brand-logo>.kp-logo-mark,.brand-logo>svg:not(.kp-nature),.brand-logo>i,.brand-logo>span{display:none!important}'+
      '.brand-logo>.kp-nature{display:block!important;width:100%!important;height:100%!important}'+
      '.brand-text .name{color:var(--water,#2c6e7a)!important;letter-spacing:.01em!important}'+
      '.brand-text .sub{color:var(--text3,#a08060)!important}'+
      /* --- Évszakos fotó-változó --- */
      ':root[data-season="spring"]{--kp-banner:url("'+SPRING+'")}'+
      ':root[data-season="summer"]{--kp-banner:url("'+SUMMER+'")}'+
      ':root[data-season="autumn"]{--kp-banner:url("'+AUTUMN+'")}'+
      ':root[data-season="winter"]{--kp-banner:url("'+WINTER+'")}'+
      /* --- Főoldali fejléc-banner: évszakkövető magyar víz-fotó (tartalék gradiens) --- */
      '.main-area:has(#page-home.active) .top-bar.compact{'+
        'background:'+
          OVERLAY+','+
          'var(--kp-banner, '+FALLBACK+') center / cover no-repeat,'+
          FALLBACK+
        '!important;'+
        'background-color:#1f5560!important;'+
      '}'+
      '.main-area:has(#page-home.active) .top-bar.compact .top-bar-title{color:#fff!important;text-shadow:0 2px 16px rgba(0,0,0,.45)!important}'+
      '.main-area:has(#page-home.active) .top-bar.compact .top-bar-title *{color:#fff!important}';
    document.head.appendChild(s);
  }

  function replaceText(root){
    if(!root)return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
    var n;
    while(n=w.nextNode()){
      if(n.nodeValue && n.nodeValue.indexOf('KapásPont')>=0){
        n.nodeValue=n.nodeValue.replace(OLD,NAME);
      }
    }
  }

  function apply(){
    try{ if(document.title!==NAME) document.title=NAME; }catch(e){}
    document.querySelectorAll('.brand-text,.sidebar-brand,.top-bar-title,.kapaspont-brand,.brand-name,.app-name').forEach(replaceText);
    document.querySelectorAll('.brand-logo').forEach(function(el){
      if(!el.querySelector('.kp-nature')) el.insertAdjacentHTML('beforeend',LOGO);
    });
  }

  injectStyle();
  apply();
  setInterval(function(){injectStyle();apply();},2000);
})();
