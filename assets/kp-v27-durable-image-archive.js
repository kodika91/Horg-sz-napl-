(function(){
  if(window.KP_V27_DURABLE_IMAGES_BOOT)return;
  window.KP_V27_DURABLE_IMAGES_BOOT=true;
  function add(src,id){
    if(id&&document.getElementById(id))return;
    var s=document.createElement('script');
    if(id)s.id=id;
    s.src=src;
    s.defer=false;
    document.body.appendChild(s);
  }
  add('https://raw.githubusercontent.com/kodika91/Horg-sz-napl-/94e999c02fdeb1834c317e434fe2dd5083d78080/assets/kp-v27-durable-image-archive.js','kp-v27-durable-image-archive-original');
  add('assets/kp-v27-github-restore-guard.js?v=20260517-274','kp-v27-github-restore-guard');
  add('assets/kp-v28-season-weather.js?v=20260517-281','kp-v28-season-weather');
  add('assets/kp-v29-stable-github-sync.js?v=20260517-29','kp-v29-stable-github-sync');
})();