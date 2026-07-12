/* kp-mod-canonical-storage.js — egyetlen, tartós naplóadat-modell
 * Minden DB-írás előtt canonicalizál: csak session.catches marad,
 * fix session/catch ID, egy rekord = egy hal, számított összesítők.
 */
(function(){
'use strict';
if(window.KP_CANONICAL_STORAGE_V1)return;
window.KP_CANONICAL_STORAGE_V1=true;

var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();
var TOMBSTONE_KEY=DB_KEY+'_catch_tombstones_v1';
var BACKUP_KEY=DB_KEY+'_before_canonical_storage_v1';
var rawSet=Storage.prototype.setItem;
var rawGet=Storage.prototype.getItem;
var writing=false;

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return String(v==null?'':v).trim()}
function num(v){if(v==null||v==='')return 0;var n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:0}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function uid(prefix){try{if(crypto&&crypto.randomUUID)return prefix+'_'+crypto.randomUUID()}catch(e){}return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,12)}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
function stamp(o){var s=text(o&&(o.updatedAt||o.modifiedAt||o.editedAt||o.createdAt));var n=Date.parse(s);return Number.isFinite(n)?n:0}
function catchId(c){return text(c&&(c.id||c.catchId||c.recordId||c.uuid))}
function sessionId(s){return text(s&&(s.id||s.sessionId||s.uuid))}
function fish(c){return text(c&&(c.fish||c.hal||c.fishName||c.halfaj))}
function baitName(v){var n=norm(v);if(n==='sneci')return 'Csalihal';if(n==='popupbojli')return 'Promix Pop Up Pellet';return text(v)}
function bait(c){return baitName(c&&(c.bait!=null?c.bait:c.csali))}
function weight(c){return num(c&&(c.weightKg!=null?c.weightKg:(c.weight!=null?c.weight:c.suly)))}
function length(c){return num(c&&(c.lengthCm!=null?c.lengthCm:(c.length!=null?c.length:c.hossz)))}
function time(c){return text(c&&(c.time||c.ido||c.catchTime)).slice(0,5)}
function photo(c){return text(c&&(c.photoPath||(c.photoRef&&c.photoRef.path)||c.photoIdbKey))}
function method(c){return text(c&&(c.method!=null?c.method:c.modszer))}
function loadTombstones(){try{return JSON.parse(rawGet.call(localStorage,TOMBSTONE_KEY)||'{}')||{}}catch(e){return {}}}
function saveTombstones(t){try{rawSet.call(localStorage,TOMBSTONE_KEY,JSON.stringify(t||{}))}catch(e){}}

function normalizeCatch(raw){
  var c=raw&&typeof raw==='object'?Object.assign({},raw):{};
  var id=catchId(c)||uid('catch');
  c.id=id;c.catchId=id;c.recordId=id;c.uuid=id;
  var f=fish(c);c.fish=f;c.hal=f;
  var b=bait(c);c.bait=b;c.csali=b;
  var m=method(c);c.method=m;c.modszer=m;
  var w=weight(c);c.weight=w;c.weightKg=w;
  var l=length(c);if(l){c.length=l;c.lengthCm=l}
  c.count=1;c.db=1;c.quantity=1;
  if(!c.createdAt)c.createdAt=new Date().toISOString();
  return c;
}
function newer(a,b){return stamp(b)>=stamp(a)?b:a}
function merge(a,b){
  var win=newer(a,b),lose=win===a?b:a,out=Object.assign({},lose,win);
  var id=catchId(a)||catchId(b)||uid('catch');
  out.id=id;out.catchId=id;out.recordId=id;out.uuid=id;
  return normalizeCatch(out);
}
function fingerprint(c){
  return [norm(fish(c)),norm(bait(c)),weight(c).toFixed(3),length(c).toFixed(2),time(c),photo(c),norm(method(c))].join('|');
}
function legacyRepair(list,tombstones){
  var targets={csalihal:true,promixpopuppellet:true},groups={},out=[];
  list.forEach(function(c){
    var k=norm(bait(c));
    if(targets[k]&&Math.abs(weight(c)-1.5)<0.0001){
      var g=norm(fish(c))+'|'+k+'|1.500';(groups[g]||(groups[g]=[])).push(c);
    }else out.push(c);
  });
  Object.keys(groups).forEach(function(g){
    var rows=groups[g];
    if(rows.length<2){out.push(rows[0]);return}
    rows.sort(function(a,b){return stamp(a)-stamp(b)});
    var keep=rows[0];
    for(var i=1;i<rows.length;i++){
      var rid=catchId(rows[i]);if(rid)tombstones[rid]=true;
      keep=merge(keep,rows[i]);
    }
    keep.id=catchId(rows[0]);keep.catchId=keep.id;keep.recordId=keep.id;keep.uuid=keep.id;
    keep.count=1;keep.db=1;keep.quantity=1;keep.weight=1.5;keep.weightKg=1.5;
    out.push(keep);
  });
  return out;
}
function canonicalCatches(s,tombstones){
  var src=[].concat(arr(s.catches),arr(s['fogások']),arr(s.fogasok)),out=[],byId={},byFp={};
  src.forEach(function(raw){
    if(!raw||typeof raw!=='object')return;
    var originalId=catchId(raw);if(originalId&&tombstones[originalId])return;
    var c=normalizeCatch(raw),id=catchId(c),fp=fingerprint(c),pos;
    if(byId[id]!=null)pos=byId[id];
    else if(fp&&byFp[fp]!=null)pos=byFp[fp];
    if(pos==null){pos=out.length;out.push(c);byId[id]=pos;if(fp)byFp[fp]=pos}
    else{var discarded=id;if(discarded&&discarded!==catchId(out[pos]))tombstones[discarded]=true;out[pos]=merge(out[pos],c);byId[id]=pos}
  });
  return legacyRepair(out,tombstones);
}
function canonicalize(db){
  db=db&&typeof db==='object'?db:{};
  if(!Array.isArray(db.sessions))db.sessions=[];
  var tombstones=loadTombstones(),used={},changed=false;
  db.sessions=db.sessions.map(function(raw){
    var s=raw&&typeof raw==='object'?Object.assign({},raw):{};
    var sid=sessionId(s);if(!sid||used[sid]){sid=uid('session');changed=true}
    used[sid]=true;s.id=sid;s.sessionId=sid;s.uuid=sid;
    var old=JSON.stringify(arr(s.catches));
    s.catches=canonicalCatches(s,tombstones);
    if(Object.prototype.hasOwnProperty.call(s,'fogások')){delete s['fogások'];changed=true}
    if(Object.prototype.hasOwnProperty.call(s,'fogasok')){delete s.fogasok;changed=true}
    var total=s.catches.reduce(function(sum,c){return sum+weight(c)},0);
    var cnt=s.catches.length;
    if(num(s.totalWeight)!==total||num(s.catchCount)!==cnt)changed=true;
    s.totalWeight=Math.round(total*1000)/1000;s.catchCount=cnt;
    if(old!==JSON.stringify(s.catches))changed=true;
    return s;
  });
  saveTombstones(tombstones);
  db._meta=Object.assign({},db._meta||{},{canonicalStorageVersion:1,canonicalStorageAt:new Date().toISOString()});
  return {db:db,changed:changed};
}
function persist(db){
  var r=canonicalize(db);
  writing=true;try{rawSet.call(localStorage,DB_KEY,JSON.stringify(r.db))}finally{writing=false}
  return r.db;
}
function backupOnce(raw){try{if(raw&&!rawGet.call(localStorage,BACKUP_KEY))rawSet.call(localStorage,BACKUP_KEY,raw)}catch(e){}}

Storage.prototype.setItem=function(key,value){
  if(this===localStorage&&key===DB_KEY&&!writing){
    backupOnce(rawGet.call(localStorage,DB_KEY));
    try{return persist(JSON.parse(String(value||'{}')))}catch(e){console.error('[canonical-storage] DB írási hiba',e);return rawSet.call(this,key,value)}
  }
  return rawSet.call(this,key,value);
};
window.getDB=function(){try{return canonicalize(JSON.parse(rawGet.call(localStorage,DB_KEY)||'{}')).db}catch(e){return {sessions:[]}}};
window.saveDB=function(db){return persist(db)};
window.kpCanonicalizeDatabase=function(){var d=window.getDB();persist(d);return d};

try{var initial=rawGet.call(localStorage,DB_KEY);if(initial)backupOnce(initial);persist(initial?JSON.parse(initial):{})}catch(e){console.error('[canonical-storage] indulási migráció hiba',e)}
setTimeout(function(){try{persist(window.getDB())}catch(e){}},500);
setTimeout(function(){try{persist(window.getDB())}catch(e){}},1800);
setInterval(function(){try{var d=window.getDB();var raw=JSON.stringify(d);if(raw!==rawGet.call(localStorage,DB_KEY))persist(d)}catch(e){}},5000);
})();
