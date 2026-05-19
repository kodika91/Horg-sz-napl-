(function(){
  if(window.KP_V37_CATCH_PHOTO_VIEWER_FIX)return;
  window.KP_V37_CATCH_PHOTO_VIEWER_FIX=true;
  function cfg(){try{return typeof githubLoadConfig==='function'?githubLoadConfig():JSON.parse(localStorage.getItem('kapaspont_github_sync')||'{}')}catch(e){return {}}}
  function getdb(){try{return typeof getDB==='function'?getDB():{}}catch(e){return {}}}
  function pathOf(c){return c&&(c.photoPath||(c.photoRef&&c.photoRef.path)||(c.photoRef&&c.photoRef.relativePath)||c.githubPhotoPath||c.imagePath||'')}
  async function loadGh(path){
    var c=cfg(); if(!path||!c.owner||!c.repo||!c.branch||!c.token)return null;
    var api=String(path).split('/').map(encodeURIComponent).join('/');
    var r=await fetch('https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+c.token,'X-GitHub-Api-Version':'2022-11-28'}});
    if(!r.ok)return null;
    var d=await r.json(), raw=String(d.content||'').replace(/\n/g,''); if(!raw)return null;
    var bin=atob(raw), bytes=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    var type=String(path).toLowerCase().endsWith('.png')?'image/png':String(path).toLowerCase().endsWith('.webp')?'image/webp':'image/jpeg';
    return URL.createObjectURL(new Blob([bytes],{type:type}));
  }
  function viewer(){
    var v=document.getElementById('kp-img-view');
    if(!v){v=document.createElement('div');v.id='kp-img-view';v.innerHTML='<div class="box"><button class="x">×</button><img alt="Fogás fotó"></div>';document.body.appendChild(v);v.addEventListener('click',function(e){if(e.target===v||e.target.className==='x')v.classList.remove('show')});}
    return v;
  }
  function findExact(img){
    var src=String((img&&img.currentSrc)||img.src||'');
    var direct=(img.dataset&&(img.dataset.full||img.dataset.fullSrc||img.dataset.path||img.dataset.photoPath))||'';
    if(direct)return direct;
    var d=getdb(), arr=[]; (d.sessions||[]).forEach(function(s){(s.catches||[]).forEach(function(c){if(c)arr.push(c)})});
    for(var i=0;i<arr.length;i++){
      var c=arr[i], p=pathOf(c), small=String(c.photo||c.thumb||c.photoThumb||'');
      if(p && (src===p || src.endsWith(String(p).slice(-80))))return p;
      if(small && src===small)return p||small;
    }
    return src;
  }
  async function open(img){
    var v=viewer(), out=v.querySelector('img'), src=String((img&&img.currentSrc)||img.src||'');
    out.src=src; v.classList.add('show');
    var orig=findExact(img);
    if(orig && !String(orig).startsWith('data:image') && orig!==src){try{var b=await loadGh(orig); if(b)out.src=b;}catch(e){console.warn('[KP v37] nagy kép kihagyva',e)}}
  }
  function hook(){
    document.querySelectorAll('#session-detail-wrap img,.catch-photo-preview').forEach(function(img){
      img.dataset.kpV37='1'; img.title='Koppints a nagyításhoz';
      img.onclick=function(e){e.stopPropagation();e.preventDefault();open(img);return false;};
    });
  }
  function css(){if(document.getElementById('kp-v37-photo-css'))return;var s=document.createElement('style');s.id='kp-v37-photo-css';s.textContent='#kp-img-view{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.86);padding:10px}#kp-img-view.show{display:flex}#kp-img-view .box{position:relative;width:96vw;height:88dvh;background:#101816;border-radius:20px;overflow:hidden;display:flex;align-items:center;justify-content:center}#kp-img-view img{width:100%;height:100%;display:block;object-fit:contain;image-rendering:auto}#kp-img-view .x{position:absolute;right:10px;top:10px;border:0;border-radius:50%;width:38px;height:38px;background:rgba(0,0,0,.42);color:#fff;font-size:28px;z-index:2}';document.head.appendChild(s)}
  function boot(){css();hook()}
  boot();setTimeout(boot,800);setInterval(boot,2000);
})();
