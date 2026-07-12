/* kp-mod-catches-canonical.js — fogások egységes tárolása adatvesztés nélkül
 * A régi catches / fogások / fogasok tömböket egyetlen canonical `catches`
 * tömbbe migrálja. Migráció előtt helyi biztonsági másolat készül.
 */
(function(){
'use strict';
if(window.KP_CATCHES_CANONICAL_V1)return;
window.KP_CATCHES_CANONICAL_V1=true;

var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();
var BACKUP_KEY=DB_KEY+'_before_catches_canonical_v1';
var originalGetDB=typeof window.getDB==='function'?window.getDB:null;
var originalSaveDB=typeof window.saveDB==='function'?window.saveDB:null;
var busy=false;

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return String(v==null?'':v).trim()}
function num(v){if(v==null||v==='')return null;var n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
function stamp(o){return text(o&&(o.updatedAt||o.modifiedAt||o.createdAt||o.time||o.ido))}
function catchId(c){return text(c&&(c.id||c.uuid||c.catchId))}
function fish(c){return text(c&&(c.fish||c.hal))}
function weight(c){var v=c&&(c.weightKg!=null?c.weightKg:(c.weight!=null?c.weight:c.suly));return num(v)}
function length(c){var v=c&&(c.lengthCm!=null?c.lengthCm:(c.length!=null?c.length:c.hossz));return num(v)}
function photo(c){return text(c&&(c.photoPath||(c.photoRef&&c.photoRef.path)||c.photo))}
function time(c){return text(c&&(c.time||c.ido||c.createdAt)).slice(0,19)}
function count(c){var n=num(c&&(c.count!=null?c.count:(c.db!=null?c.db:c.quantity)));return n&&n>0?Math.round(n):1}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}

/* A csali és a módszer szándékosan nincs a tartalék kulcsban: szerkesztéskor
 * éppen ezek változhatnak. Az ID az elsődleges azonosító. */
function fallbackKey(c){
  return [norm(fish(c)),time(c),weight(c)==null?'':weight(c),length(c)==null?'':length(c),photo(c)].join('|');
}
function key(c,index){var id=catchId(c);return id?'id:'+id:'fallback:'+fallbackKey(c)+(fallbackKey(c)==='||||'?'|'+index:'')}
function mergeFields(a,b){
  a=a||{};b=b||{};
  var at=stamp(a),bt=stamp(b),bNewer=!!(bt&&(!at||bt>=at));
  var older=bNewer?a:b,newer=bNewer?b:a;
  var out={};
  Object.keys(older).forEach(function(k){var v=older[k];if(v!==undefined&&v!==null&&v!=='')out[k]=v});
  Object.keys(newer).forEach(function(k){var v=newer[k];if(v!==undefined&&v!==null&&v!=='')out[k]=v});
  var f=fish(out);if(f){out.fish=f;out.hal=f}
  var bait=text(out.bait||out.csali);if(bait){out.bait=bait;out.csali=bait}
  var method=text(out.method||out.modszer);if(method){out.method=method;out.modszer=method}
  var w=weight(out);if(w!=null){out.weight=w;out.weightKg=w}
  var l=length(out);if(l!=null){out.length=l;out.lengthCm=l}
  return out;
}
function canonicalCatches(session){
  var sources=[arr(session&&session.catches),arr(session&&session['fogások']),arr(session&&session.fogasok)];
  var out=[],pos={};
  sources.forEach(function(list){list.forEach(function(c,i){if(!c||typeof c!=='object')return;var k=key(c,i);if(pos[k]==null){pos[k]=out.length;out.push(c)}else out[pos[k]]=mergeFields(out[pos[k]],c)})});
  return out;
}
function recalc(session){
  var totalCount=0,totalWeight=0;
  arr(session.catches).forEach(function(c){var n=count(c),w=weight(c)||0;totalCount+=n;totalWeight+=w*n});
  session.catchCount=totalCount;
  session.totalWeight=Math.round(totalWeight*1000)/1000;
}
function canonicalizeDb(db){
  if(!db||typeof db!=='object')return {db:db||{},changed:false,merged:0};
  var changed=false,merged=0;
  arr(db.sessions).forEach(function(s){
    if(!s||typeof s!=='object')return;
    var before=arr(s.catches).length+arr(s['fogások']).length+arr(s.fogasok).length;
    var canonical=canonicalCatches(s);
    var hadAliases=Object.prototype.hasOwnProperty.call(s,'fogások')||Object.prototype.hasOwnProperty.call(s,'fogasok');
    var oldJson='';try{oldJson=JSON.stringify(arr(s.catches))}catch(e){}
    var newJson='';try{newJson=JSON.stringify(canonical)}catch(e){}
    s.catches=canonical;
    if(Object.prototype.hasOwnProperty.call(s,'fogások'))delete s['fogások'];
    if(Object.prototype.hasOwnProperty.call(s,'fogasok'))delete s.fogasok;
    recalc(s);
    if(hadAliases||oldJson!==newJson){changed=true;merged+=Math.max(0,before-canonical.length);s.updatedAt=new Date().toISOString();s.modifiedAt=s.updatedAt}
  });
  if(changed){db._meta=Object.assign({},db._meta||{},{canonicalCatchesAt:new Date().toISOString(),canonicalCatchesVersion:1,canonicalMergedEntries:merged})}
  return {db:db,changed:changed,merged:merged};
}
function rawRead(){
  try{if(originalGetDB)return originalGetDB()}catch(e){}
  try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}
}
function backupOnce(snapshot){
  if(!snapshot)return;
  try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify({createdAt:new Date().toISOString(),reason:'before catches canonical migration',data:snapshot}))}catch(e){console.warn('[canonical-catches] backup hiba',e)}
}
function rawSave(db){
  if(originalSaveDB)return originalSaveDB(db);
  localStorage.setItem(DB_KEY,JSON.stringify(db||{}));
}
function saveCanonical(db){
  if(busy)return rawSave(db);
  busy=true;
  try{
    var before=clone(db);
    var r=canonicalizeDb(db);
    if(r.changed)backupOnce(before);
    return rawSave(r.db);
  }finally{busy=false}
}
window.getDB=function(){var r=canonicalizeDb(rawRead());return r.db};
window.saveDB=function(db){return saveCanonical(db)};

function migratePersisted(){
  if(busy)return;
  var db=rawRead();
  var before=clone(db);
  var r=canonicalizeDb(db);
  if(!r.changed)return;
  backupOnce(before);
  busy=true;
  try{rawSave(r.db);console.log('[canonical-catches] migrálva, összevont bejegyzések:',r.merged)}
  catch(e){console.error('[canonical-catches] migrációs mentési hiba',e)}
  finally{busy=false}
  ['renderSessionsList','renderActiveSessionHome','updateHome','renderSessionDetail','renderSessions','renderStatistics','KP_RENDER_STATS'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}});
}

migratePersisted();
setTimeout(migratePersisted,800);
setTimeout(migratePersisted,2200);
setInterval(migratePersisted,5000);
})();
