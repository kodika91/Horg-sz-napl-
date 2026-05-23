/* kp-mod-spotfinder-nav.js — kompakt visszatalálás UI */
(function(){
if(window.KP_SPOT_COMPACT_PATCH)return;
window.KP_SPOT_COMPACT_PATCH=true;
function apply(){
const ov=document.getElementById('sf-nav-overlay');
if(!ov)return;
const box=ov.firstElementChild;
if(box){
box.style.padding='8px 10px';
box.style.borderRadius='14px';
box.style.maxWidth='620px';
box.style.boxShadow='0 4px 14px rgba(0,0,0,.18)';
}
ov.style.maxWidth='640px';
ov.style.width='auto';
const title=document.getElementById('sf-nav-name');
if(title){title.style.fontSize='13px';title.style.lineHeight='1.1';title.style.maxWidth='320px';title.style.whiteSpace='nowrap';title.style.overflow='hidden';title.style.textOverflow='ellipsis'}
const dist=document.getElementById('sf-nav-dist');
if(dist){dist.style.fontSize='12px';dist.style.marginTop='2px'}
const follow=document.getElementById('sf-nav-follow');
const stop=document.getElementById('sf-nav-stop');
[follow,stop].forEach(btn=>{if(btn){btn.style.padding='7px 10px';btn.style.fontSize='12px';btn.style.minHeight='34px';btn.style.borderRadius='10px'}})
}
setInterval(apply,800);
setTimeout(apply,300);
})();