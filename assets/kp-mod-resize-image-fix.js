// kp-mod-resize-image-fix.js — hiányzó resizeImage pótlása
// v1.0 · Csali / etetőanyag képfeltöltéshez, iPhone-kompatibilis hibakezeléssel.
(function(){
'use strict';
if(window.KP_MOD_RESIZE_IMAGE_FIX)return;
window.KP_MOD_RESIZE_IMAGE_FIX=true;

function toast(m){
  try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}
}

window.resizeImage=function resizeImage(file,maxSide,quality,callback){
  if(!file){toast('Nincs kiválasztott kép.');return;}
  maxSide=Number(maxSide)||900;
  quality=Number(quality)||0.8;
  if(typeof callback!=='function'){toast('Képkezelési hiba: hiányzó callback.');return;}

  const reader=new FileReader();
  reader.onload=function(e){
    const img=new Image();
    img.onload=function(){
      try{
        let w=img.naturalWidth||img.width;
        let h=img.naturalHeight||img.height;
        if(!w||!h)throw new Error('Érvénytelen képméret.');

        const scale=Math.min(1,maxSide/Math.max(w,h));
        w=Math.max(1,Math.round(w*scale));
        h=Math.max(1,Math.round(h*scale));

        const cv=document.createElement('canvas');
        cv.width=w;
        cv.height=h;
        const ctx=cv.getContext('2d');
        if(!ctx)throw new Error('Canvas nem elérhető.');

        ctx.fillStyle='#fff';
        ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);

        const data=cv.toDataURL('image/jpeg',quality);
        if(!data||!String(data).startsWith('data:image/'))throw new Error('Képkódolási hiba.');
        callback(data);
      }catch(err){
        console.warn('[KapásPont resizeImage] hiba:',err);
        toast('Képátméretezési hiba. Próbálj egy másik képet vagy kisebb méretet.');
      }
    };
    img.onerror=function(){toast('Képbetöltési hiba. Próbálj egy másik képet.');};
    img.src=e.target.result;
  };
  reader.onerror=function(){toast('Fájlolvasási hiba.');};
  reader.readAsDataURL(file);
};

console.log('[KapásPont] resizeImage hotfix aktív.');
})();
