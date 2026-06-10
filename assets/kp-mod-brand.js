// kp-mod-brand.js — "Vízparti Napló" név + természet logó + évszakkövető fotó-banner
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

  // Évszakkövető tájfotók (Unsplash, szabad felhasználás). Tartalék: gradiens.
  var SPRING='https://images.unsplash.com/photo-1588676509970-63fe490c3712?w=1280&q=70&auto=format&fit=crop';
  var SUMMER='https://images.unsplash.com/photo-1596003903067-bf5762ad5c19?w=1280&q=70&auto=format&fit=crop';
  var AUTUMN='https://images.unsplash.com/photo-1496060169243-453fde45943b?w=1280&q=70&auto=format&fit=crop';
  var WINTER='https://images.unsplash.com/photo-1511489731872-324afc650052?w=1280&q=70&auto=format&fit=crop';
  var FALLBACK='linear-gradient(135deg, #6cc0cf 0%, #2c6e7a 52%, #1f5560 100%)';
  var OVERLAY='linear-gradient(180deg, rgba(18,46,55,.28) 0%, rgba(18,46,55,.60) 100%)';

  function injectStyle(){
    if(document.getElementById('kp-brand-style'))return;
    var s=document.createElement('style');
    s.id='kp-brand-style';
    s.textContent=
      /* --- Oldalsáv márka-panel + logó --- */
      '.sidebar-brand{background:linear-gradient(135deg,var(--season-soft,rgba(44,110,122,.14)),transparent)!important}'+
      '.brand-logo{padding:0!important;overflow:hidden!important;border-radius:12px!important;box-shadow:0 4px 12px var(--shadow,rgba(60,40,10,.18))!important}'+
      '.brand-logo>.kp-logo-mark,.brand-logo>svg:not(.kp-nature),.brand-logo>i,.brand-logo>span{display:none!important}'+
      '.brand-logo>.kp-nature{display:block!important;width:100%!important;height:100%!important}'+
      /* --- Évszakos fotó-változó --- */
      ':root[data-season="spring"]{--kp-banner:url("'+SPRING+'")}'+
      ':root[data-season="summer"]{--kp-banner:url("'+SUMMER+'")}'+
      ':root[data-season="autumn"]{--kp-banner:url("'+AUTUMN+'")}'+
      ':root[data-season="winter"]{--kp-banner:url("'+WINTER+'")}'+
      /* --- Főoldali fejléc-banner: évszakkövető valódi fotó (tartalék gradiens) --- */
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
