// kp-mod-spotfinder-delete-locations.js
(function(){
'use strict';
if(window.KP_MOD_SPOT_DELETE_LOCATIONS_V1)return;
window.KP_MOD_SPOT_DELETE_LOCATIONS_V1=true;
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY||'horgaszpro_v0230')||'{}')}catch(e){return {};}}
function save(d){try{if(typeof saveDB==='function')saveDB(d);else localStorage.setItem(window.DB_KEY||'horgaszpro_v0230',JSON.stringify(d));}catch(e){console.warn('[spot-delete-loc]',e);}}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log(m)}catch(e){console.log(m)}}
function delList(d){if(!Array.isArray(d.deletedSpotLocationIds))d.deletedSpotLocationIds=[];return d.deletedSpotLocationIds;}
function purge(){var d=db();var list=delList(d);if(!list.length)return;var n=(d.locations||[]).length;d.locations=(d.locations||[]).filter(function(l){return list.indexOf(l.id)<0;});if((d.locations||[]).length!==n)save(d);}
window.kpsfmDeleteLocation=function(id){var d=db();var list=delList(d);if(list.indexOf(id)<0)list.push(id);d.locations=(d.locations||[]).filter(function(l){return String(l.id)!==String(id);});save(d);toast('Hely torolve / elrejtve.');try{if(window.spotFinderMap){window.spotFinderMap.remove();window.spotFinderMap=null;}}catch(e){}if(typeof renderSpotFinder==='function')renderSpotFinder();};
function findLoc(card){var name=((card.querySelector('.kpsfm-place-info b')||{}).textContent||'').trim();var gps=((card.querySelector('.kpsfm-place-info span')||{}).textContent||'').trim();var d=db();var list=delList(d);return (d.locations||[]).find(function(l){return list.indexOf(l.id)<0&&String(l.name||'').trim()===name&&(!gps||String(l.gps||'').trim()===gps);});}
function patch(){purge();document.querySelectorAll('#page-spotfinder .kpsfm-place').forEach(function(card){if(card.__kpLocDel)return;card.__kpLocDel=true;var menu=card.querySelector('.kpsfm-menu');if(!menu||menu.querySelector('.danger'))return;var loc=findLoc(card);if(!loc)return;var b=document.createElement('button');b.className='danger';b.title='Delete location';b.innerHTML='<i class="ti ti-trash"></i>';b.onclick=function(ev){ev.stopPropagation();window.kpsfmDeleteLocation(loc.id);};menu.appendChild(b);});}
function wrap(){var old=window.renderSpotFinder;if(typeof old==='function'&&!old.__kpLocDeletePatch){window.renderSpotFinder=function(){purge();var r=old.apply(this,arguments);setTimeout(patch,150);setTimeout(patch,700);return r;};window.renderSpotFinder.__kpLocDeletePatch=true;}}
setInterval(function(){wrap();patch();},900);setTimeout(function(){wrap();patch();},600);setTimeout(function(){wrap();patch();},1800);console.log('[spot-delete-locations] active');
})();