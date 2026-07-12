/* kp-mod-catches-canonical.js — fogások egységes tárolása adatvesztés nélkül
 * v2: a külön ID-t kapott, de azonos tényleges fogásokat is összevonja.
 */
(function(){
'use strict';
if(window.KP_CATCHES_CANONICAL_V2)return;
window.KP_CATCHES_CANONICAL_V2=true;
window.KP_CATCHES_CANONICAL_V1=true;

var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();
var BACKUP_KEY=DB_KEY+'_before_catches_canonical_v2';
var originalGetDB=typeof window.getDB==='function'?window.getDB:null;
var originalSaveDB=typeof window.saveDB==='function'?window.saveDB:null;
var busy=false;

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return String(v==null?'':v).trim()}
function num(v){if(v==null||v==='')return null;var n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function catchId(c){return text(c&&(c.id||c.uuid||c.catchId))}
function fish(c){return text(c&&(c.fish||c.hal||c.fishName||c.halfaj))}
function bait(c){return text(c&&(c.bait!=null?c.bait:c.csali))}
function method(c){return text(c&&(c.method!=null?c.method:c.modszer))}
function weight(c){var v=c&&(c.weightKg!=null?c.weightKg:(c.weight!=null?c.weight:c.suly));return num(v)}
function length(c){var v=c&&(c.lengthCm!=null?c.lengthCm:(c.length!=null?c.length:c.hossz));return num(v)}
function count(c){var n=num(c&&(c.count!=null?c.count:(c.db!=null?c.db:c.quantity)));return n&&n>0?Math.round(n):1}
function photo(c){return text(c&&(c.photoPath||(c.photoRef&&c.photoRef.path)||c.photo))}
function clock(c){var v=text(c&&(c.time||c.ido||c.catchTime||c.createdAt));var m=v.match(/(?:T|^)(\d{2}:\d{2})/);return m?m[1]:v.slice(0,5)}
function changedStamp(c){return text(c&&(c.updatedAt||c.modifiedAt||c.editedAt||c.createdAt))}
function createdMs(c){var v=text(c&&c.createdAt),n=v?Date.parse(v):NaN;return Number.isFinite(n)?n:null}
function sameNum(a,b){return (a==null&&b==null)||(a!=null&&b!=null&&Math.abs(a-b)<0.0001)}
function fallbackKey(c){return [norm(fish(c)),clock(c),weight(c)==null?'':weight(c),length(c)==null?'':length(c),count(c),photo(c)].join('|')}
function directKey(c,index){var id=catchId(c);return id?'id:'+id:'fallback:'+fallbackKey(c)+(fallbackKey(c)==='||||1|'?'|'+index:'')}

function sameLogicalCatch(a,b){
  if(!a||!b)return false;
  if(catchId(a)&&catchId(a)===catchId(b))return true;
  if(!norm(fish(a))||norm(fish(a))!==norm(fish(b)))return false;
  if(count(a)!==count(b)||!sameNum(weight(a),weight(b))||!sameNum(length(a),length(b)))return false;
  var ma=norm(method(a)),mb=norm(method(b));if(ma&&mb&&ma!==mb)return false;
  var pa=photo(a),pb=photo(b);if(pa&&pb&&pa!==pb)return false;if(pa&&pb&&pa===pb)return true;
  var ta=clock(a),tb=clock(b);if(ta&&tb&&ta===tb&&(weight(a)!=null||length(a)!=null))return true;
  var ca=createdMs(a),cb=createdMs(b);if(ca!=null&&cb!=null&&Math.abs(ca-cb)<=120000&&(weight(a)!=null||length(a)!=null))return true;
  return false;
}

function mergeFields(a,b){
  a=a||{};b=b||{};
  var at=changedStamp(a),bt=changedStamp(b),bNewer=!!(bt&&(!at||bt>=at));
  var older=bNewer?a:b,newer=bNewer?b:a,out={};
  Object.keys(older).forEach(function(k){if(older[k]!==undefined)out[k]=older[k]});
  Object.keys(newer).forEach(function(k){if(newer[k]!==undefined)out[k]=newer[k]});
  var f=fish(out);if(f){out.fish=f;out.hal=f}
  var ba=bait(out);out.bait=ba;out.csali=ba;
  var me=method(out);out.method=me;out.modszer=me;
  var w=weight(out);if(w!=null){out.weight=w;out.weightKg=w}
  var l=length(out);if(l!=null){out.length=l;out.lengthCm=l}
  out.count=count(out);
  return out;
}

function canonicalCatches(session){
  var sources=[arr(session&&session.catches),arr(session&&session['fogások']),arr(session&&session.fogasok)],out=[],byKey={};
  sources.forEach(function(list){list.forEach(function(c,i){
    if(!c||typeof c!=='object')return;
    var k=directKey(c,i),pos=byKey[k];
    if(pos==null){pos=-1;for(var j=0;j<out.length;j++){if(sameLogicalCatch(out[j],c)){pos=j;break}}}
    if(pos==null||pos<0){byKey[k]=out.length;out.push(c)}else{out[pos]=mergeFields(out[pos],c);byKey[k]=pos}
  })});
  return out;
}
function recalc(session){var totalCount=0,totalWeight=0;arr(session.catches).forEach(function(c){var n=count(c),w=weight(c)||0;totalCount+=n;totalWeight+=w*n});session.catchCount=totalCount;session.totalWeight=Math.round(totalWeight*1000)/1000}
function canonicalizeDb(db){
  if(!db||typeof db!=='object')return {db:db||{},changed:false,merged:0};
  var changed=false,merged=0;
  arr(db.sessions).forEach(function(s){
    if(!s||typeof s!=='object')return;
    var before=arr(s.catches).length+arr(s['fogások']).length+arr(s.fogasok).length,oldJson='';try{oldJson=JSON.stringify(arr(s.catches))}catch(e){}
    var canonical=canonicalCatches(s),newJson='';try{newJson=JSON.stringify(canonical)}catch(e){}
    var hadAliases=Object.prototype.hasOwnProperty.call(s,'fogások')||Object.prototype.hasOwnProperty.call(s,'fogasok');
    s.catches=canonical;if(Object.prototype.hasOwnProperty.call(s,'fogások'))delete s['fogások'];if(Object.prototype.hasOwnProperty.call(s,'fogasok'))delete s.fogasok;recalc(s);
    if(hadAliases||oldJson!==newJson){changed=true;merged+=Math.max(0,before-canonical.length);s.updatedAt=new Date().toISOString();s.modifiedAt=s.updatedAt}
  });
  if(changed)db._meta=Object.assign({},db._meta||{},{canonicalCatchesAt:new Date().toISOString(),canonicalCatchesVersion:2,canonicalMergedEntries:merged});
  return {db:db,changed:changed,merged:merged};
}
function rawRead(){try{if(originalGetDB)return originalGetDB()}catch(e){}try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
function backupOnce(snapshot){if(!snapshot)return;try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify({createdAt:new Date().toISOString(),reason:'before catches canonical v2 migration',data:snapshot}))}catch(e){console.warn('[canonical-catches] backup hiba',e)}}
function rawSave(db){if(originalSaveDB)return originalSaveDB(db);localStorage.setItem(DB_KEY,JSON.stringify(db||{}))}
function saveCanonical(db){if(busy)return rawSave(db);busy=true;try{var before=clone(db),r=canonicalizeDb(db);if(r.changed)backupOnce(before);return rawSave(r.db)}finally{busy=false}}
window.getDB=function(){return canonicalizeDb(rawRead()).db};window.saveDB=function(db){return saveCanonical(db)};
function refresh(){['renderSessionsList','renderActiveSessionHome','updateHome','renderSessionDetail','renderSessions','renderStatistics','renderStats','KP_RENDER_STATS'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}})}
function migratePersisted(force){if(busy)return;var db=rawRead(),before=clone(db),r=canonicalizeDb(db);if(!r.changed&&!force)return;if(r.changed)backupOnce(before);busy=true;try{rawSave(r.db);if(r.changed)console.log('[canonical-catches-v2] összevont bejegyzések:',r.merged)}catch(e){console.error('[canonical-catches-v2] migrációs mentési hiba',e)}finally{busy=false}refresh()}
window.kpCanonicalizeCatches=function(){migratePersisted(true)};
migratePersisted();setTimeout(migratePersisted,700);setTimeout(migratePersisted,1800);setInterval(migratePersisted,5000);
})();