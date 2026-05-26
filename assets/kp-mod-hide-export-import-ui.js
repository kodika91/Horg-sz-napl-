// kp-mod-hide-export-import-ui.js — felesleges export/import/törlés blokkok elrejtése
// v1.0 · JSON/CSV export, JSON import és Adatok törlése kártyák eltávolítása
(function(){
'use strict';
if(window.KP_MOD_HIDE_EXPORT_IMPORT_UI_V1)return;
window.KP_MOD_HIDE_EXPORT_IMPORT_UI_V1=true;

const HIDE_TEXTS=[
  'JSON mentés',
  'JSON letöltése',
  'CSV export',
  'CSV letöltése',
  'Importálás',
  'JSON betöltése',
  'Adatok törlése',
  'Összes törlése'
];

function norm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase();}
function hasHideText(el){
  const t=norm(el&&el.innerText||el&&el.textContent||'');
  return HIDE_TEXTS.some(x=>t.includes(norm(x)));
}
function cardRoot(el){
  let cur=el;
  for(let i=0;i<8&&cur&&cur!==document.body;i++,cur=cur.parentElement){
    const txt=norm(cur.innerText||cur.textContent||'');
    const cls=String(cur.className||'').toLowerCase();
    const looksCard=cls.includes('card')||cls.includes('panel')||cls.includes('section')||cls.includes('export')||cls.includes('import')||cls.includes('danger')||cur.tagName==='SECTION';
    const hasButton=!!cur.querySelector('button,.btn,a');
    if(looksCard&&hasButton&&txt.length<900)return cur;
  }
  cur=el;
  for(let i=0;i<6&&cur&&cur!==document.body;i++,cur=cur.parentElement){
    if(cur.children&&cur.children.length>=1&&cur.getBoundingClientRect){
      const r=cur.getBoundingClientRect();
      if(r.width>250&&r.height>55&&r.height<420)return cur;
    }
  }
  return el;
}
function hideExportImportDeleteBlocks(){
  let removed=0;
  const candidates=[...document.querySelectorAll('section,article,.card,.panel,.export,.import,.danger,div,button,a')];
  candidates.forEach(el=>{
    if(!el||el.__kpHideChecked)return;
    const txt=norm(el.innerText||el.textContent||'');
    if(!txt)return;
    if(hasHideText(el)){
      const root=cardRoot(el);
      if(root&&!root.__kpHiddenExportImport){
        root.__kpHiddenExportImport=true;
        root.style.display='none';
        root.setAttribute('data-kp-hidden','export-import-delete');
        removed++;
      }
    }
    el.__kpHideChecked=true;
  });
  if(removed)console.log('[KapásPont] felesleges export/import/törlés blokkok elrejtve:',removed);
}

function installObserver(){
  try{
    const mo=new MutationObserver(()=>hideExportImportDeleteBlocks());
    mo.observe(document.body,{childList:true,subtree:true});
  }catch(e){}
}

setTimeout(hideExportImportDeleteBlocks,300);
setTimeout(hideExportImportDeleteBlocks,900);
setTimeout(hideExportImportDeleteBlocks,1800);
setTimeout(hideExportImportDeleteBlocks,3500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hideExportImportDeleteBlocks();installObserver();});
else installObserver();
console.log('[KapásPont] export/import UI hide modul aktív.');
})();
