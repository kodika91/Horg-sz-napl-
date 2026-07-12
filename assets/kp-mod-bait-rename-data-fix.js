/* kp-mod-bait-rename-data-fix.js — 2026-07-11 süllő csali Sneci -> Csalihal */
(function(){
'use strict';
if(window.KP_BAIT_RENAME_DATA_FIX_V1)return;
window.KP_BAIT_RENAME_DATA_FIX_V1=true;
var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();
var MARKER='kp_bait_rename_20260711_sullo_v1';
var BACKUP_KEY=DB_KEY+'_before_bait_rename_20260711_sullo_v1';

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return String(v==null?'':v).trim()}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function dateKey(s){return text(s&&(s.date||s.startDate||s.createdAt)).slice(0,10)}
function getdb(){try{return typeof window.getDB==='function'?window.getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
function savedb(d){try{if(typeof window.saveDB==='function'){window.saveDB(d);return true}}catch(e){}try{localStorage.setItem(DB_KEY,JSON.stringify(d));return true}catch(e){return false}}
function backup(db){try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify({createdAt:new Date().toISOString(),reason:'before Sneci to Csalihal correction',data:db}))}catch(e){console.warn('[bait-rename-fix] backup hiba',e)}}
function refresh(){['renderSessionsList','renderSessionDetail','renderActiveSessionHome','updateHome','renderStatistics','renderStats','KP_RENDER_STATS'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}})}
function run(){
  try{if(localStorage.getItem(MARKER)==='done')return}catch(e){}
  var db=getdb(),changed=0;
  arr(db.sessions).forEach(function(s){
    if(dateKey(s)!=='2026-07-11')return;
    arr(s.catches).forEach(function(c){
      if(norm(c&&(c.fish||c.hal))==='sullo'&&norm(c&&(c.bait||c.csali))==='sneci'){
        c.bait='Csalihal';
        c.csali='Csalihal';
        c.updatedAt=new Date().toISOString();
        changed++;
      }
    });
    if(changed){s.updatedAt=new Date().toISOString();s.modifiedAt=s.updatedAt}
  });
  if(changed){backup(db);savedb(db);refresh();console.log('[bait-rename-fix] javított fogások:',changed)}
  try{localStorage.setItem(MARKER,'done')}catch(e){}
}
setTimeout(run,300);
setTimeout(run,1400);
})();
