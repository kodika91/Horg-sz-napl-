/* kp-mod-catches-canonical.js — tartós napló- és fogásazonosítók
 * v7: egy fogásrekord mindig egyetlen halat jelent. A rekord azonosítója szerkesztéskor
 * változatlan marad, a súly pedig rekordként pontosan egyszer kerül összesítésre.
 */
(function(){
'use strict';
if(window.KP_CATCHES_CANONICAL_V7)return;
window.KP_CATCHES_CANONICAL_V7=true;
window.KP_CATCHES_CANONICAL_V6=true;
window.KP_CATCHES_CANONICAL_V5=true;
window.KP_CATCHES_CANONICAL_V4=true;
window.KP_CATCHES_CANONICAL_V3=true;
window.KP_CATCHES_CANONICAL_V2=true;
window.KP_CATCHES_CANONICAL_V1=true;

var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();
var BACKUP_KEY=DB_KEY+'_before_stable_record_identity_v7';
var originalGetDB=typeof window.getDB==='function'?window.getDB:null;
var originalSaveDB=typeof window.saveDB==='function'?window.saveDB:null;
var busy=false;

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return String(v==null?'':v).trim()}
function num(v){if(v==null||v==='')return null;var n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')}
function uid(prefix){try{if(crypto&&typeof crypto.randomUUID==='function')return prefix+'_'+crypto.randomUUID()}catch(e){}return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,12)}
function dateKey(s){
  var raw=text(s&&(s.date||s.startDate||s.createdAt));
  var m=raw.match(/(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/);
  if(m)return m[1]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[3]).padStart(2,'0');
  var d=new Date(raw);
  if(!isNaN(d.getTime()))return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return raw.slice(0,10).replace(/[./]/g,'-');
}
function sessionId(s){return text(s&&(s.id||s.uuid||s.sessionId))}
function catchId(c){return text(c&&(c.id||c.uuid||c.catchId||c.recordId))}
function fish(c){return text(c&&(c.fish||c.hal||c.fishName||c.halfaj))}
function rawBait(c){return text(c&&(c.bait!=null?c.bait:c.csali))}
function canonicalBaitName(value){var n=norm(value);if(n==='sneci')return 'Csalihal';if(n==='popupbojli')return 'Promix Pop Up Pellet';return text(value)}
function bait(c){return canonicalBaitName(rawBait(c))}
function method(c){return text(c&&(c.method!=null?c.method:c.modszer))}
function weight(c){var v=c&&(c.weightKg!=null?c.weightKg:(c.weight!=null?c.weight:c.suly));return num(v)}
function length(c){var v=c&&(c.lengthCm!=null?c.lengthCm:(c.length!=null?c.length:c.hossz));return num(v)}
function photo(c){return text(c&&(c.photoPath||(c.photoRef&&c.photoRef.path)||c.photo))}
function clock(c){var v=text(c&&(c.time||c.ido||c.catchTime||c.createdAt));var m=v.match(/(?:T|^)(\d{2}:\d{2})/);return m?m[1]:/^\d{2}:\d{2}/.test(v)?v.slice(0,5):''}
function stamp(c){var v=text(c&&(c.updatedAt||c.modifiedAt||c.editedAt||c.createdAt));var n=v?Date.parse(v):NaN;return Number.isFinite(n)?n:0}
function sameNum(a,b){return (a==null&&b==null)||(a!=null&&b!=null&&Math.abs(a-b)<0.0001)}

function normalizeCatch(c){
  c=c&&typeof c==='object'?Object.assign({},c):{};
  var id=catchId(c)||uid('catch');c.id=id;c.catchId=id;c.recordId=id;
  var f=fish(c);if(f){c.fish=f;c.hal=f}
  var ba=bait(c);c.bait=ba;c.csali=ba;
  var me=method(c);c.method=me;c.modszer=me;
  var w=weight(c);if(w!=null){c.weight=w;c.weightKg=w}
  var l=length(c);if(l!=null){c.length=l;c.lengthCm=l}
  c.count=1;c.db=1;c.quantity=1;
  if(!c.createdAt)c.createdAt=new Date().toISOString();
  return c;
}
function newer(a,b){return stamp(b)>=stamp(a)?b:a}
function mergeSameId(a,b){var old=newer(a,b)===b?a:b,nw=newer(a,b),out={};Object.keys(old).forEach(function(k){if(old[k]!==undefined)out[k]=old[k]});Object.keys(nw).forEach(function(k){if(nw[k]!==undefined)out[k]=nw[k]});var id=catchId(a)||catchId(b);out.id=id;out.catchId=id;out.recordId=id;return normalizeCatch(out)}

function likelyTechnicalClone(a,b){
  if(!a||!b||catchId(a)===catchId(b))return false;
  if(norm(fish(a))!==norm(fish(b))||!norm(fish(a)))return false;
  if(!sameNum(weight(a),weight(b))||!sameNum(length(a),length(b)))return false;
  var ca=clock(a),cb=clock(b);if(ca&&cb&&ca===cb)return true;
  var sa=stamp(a),sb=stamp(b);if(sa&&sb&&Math.abs(sa-sb)<=10*60*1000)return true;
  var pa=photo(a),pb=photo(b);if(pa&&pb&&pa===pb)return true;
  return false;
}

function repairKnownWeightDuplicates(session,list){
  if(dateKey(session)!=='2026-07-11')return list;
  var targets={'csalihal':true,'promixpopuppellet':true},groups={},out=[];
  list.forEach(function(c){var key=norm(bait(c));if(targets[key]&&sameNum(weight(c),1.5)){var g=[norm(fish(c)),key,'1.5'].join('|');(groups[g]||(groups[g]=[])).push(c)}else out.push(c)});
  Object.keys(groups).forEach(function(g){var rows=groups[g],stable=rows.slice().sort(function(a,b){return stamp(a)-stamp(b)})[0],merged=rows[0];for(var i=1;i<rows.length;i++)merged=mergeSameId(merged,rows[i]);var id=catchId(stable)||catchId(merged)||uid('catch');merged.id=id;merged.catchId=id;merged.recordId=id;merged.count=1;merged.db=1;merged.quantity=1;merged.weight=1.5;merged.weightKg=1.5;merged._repairedDuplicateAt=new Date().toISOString();out.push(normalizeCatch(merged))});
  return out;
}

function canonicalCatches(session){
  var sources=[arr(session&&session.catches),arr(session&&session['fogások']),arr(session&&session.fogasok)],out=[],byId={};
  sources.forEach(function(list){list.forEach(function(raw){
    if(!raw||typeof raw!=='object')return;
    var c=normalizeCatch(raw),id=catchId(c),pos=byId[id];
    if(pos!=null){out[pos]=mergeSameId(out[pos],c);return}
    pos=-1;for(var i=0;i<out.length;i++){if(likelyTechnicalClone(out[i],c)){pos=i;break}}
    if(pos<0){byId[id]=out.length;out.push(c)}else{var keep=newer(out[pos],c),stableId=catchId(out[pos])||catchId(c);out[pos]=mergeSameId(out[pos],c);out[pos].id=stableId;out[pos].catchId=stableId;out[pos].recordId=stableId;byId[id]=pos;byId[catchId(keep)]=pos}
  })});
  return repairKnownWeightDuplicates(session,out);
}
function recalc(session){var totalWeight=0;arr(session.catches).forEach(function(c){totalWeight+=weight(c)||0});session.catchCount=arr(session.catches).length;session.totalWeight=Math.round(totalWeight*1000)/1000}
function canonicalizeDb(db){
  if(!db||typeof db!=='object')return {db:db||{},changed:false,merged:0,assigned:0};
  var changed=false,merged=0,assigned=0,usedSessions={};
  arr(db.sessions).forEach(function(s){
    if(!s||typeof s!=='object')return;
    var sid=sessionId(s);if(!sid||usedSessions[sid]){sid=uid('session');assigned++;changed=true}s.id=sid;s.sessionId=sid;s.uuid=sid;usedSessions[sid]=true;
    var before=arr(s.catches).length+arr(s['fogások']).length+arr(s.fogasok).length,oldJson='';try{oldJson=JSON.stringify(arr(s.catches))}catch(e){}
    var oldWeight=num(s.totalWeight),oldCount=num(s.catchCount),canonical=canonicalCatches(s),newJson='';try{newJson=JSON.stringify(canonical)}catch(e){}
    var hadAliases=Object.prototype.hasOwnProperty.call(s,'fogások')||Object.prototype.hasOwnProperty.call(s,'fogasok');
    s.catches=canonical;if(Object.prototype.hasOwnProperty.call(s,'fogások'))delete s['fogások'];if(Object.prototype.hasOwnProperty.call(s,'fogasok'))delete s.fogasok;recalc(s);
    if(hadAliases||oldJson!==newJson||!sameNum(oldWeight,num(s.totalWeight))||!sameNum(oldCount,num(s.catchCount))){changed=true;merged+=Math.max(0,before-canonical.length);s.updatedAt=new Date().toISOString();s.modifiedAt=s.updatedAt}
  });
  if(changed)db._meta=Object.assign({},db._meta||{},{stableRecordIdentityAt:new Date().toISOString(),stableRecordIdentityVersion:7,canonicalMergedEntries:merged,assignedStableIds:assigned,oneCatchOneFish:true});
  return {db:db,changed:changed,merged:merged,assigned:assigned};
}
function rawRead(){try{if(originalGetDB)return originalGetDB()}catch(e){}try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
function backupOnce(snapshot){if(!snapshot)return;try{if(!localStorage.getItem(BACKUP_KEY))localStorage.setItem(BACKUP_KEY,JSON.stringify({createdAt:new Date().toISOString(),reason:'before one catch one fish v7 migration',data:snapshot}))}catch(e){console.warn('[stable-identity] backup hiba',e)}}
function rawSave(db){if(originalSaveDB)return originalSaveDB(db);localStorage.setItem(DB_KEY,JSON.stringify(db||{}))}
function saveCanonical(db){if(busy)return rawSave(db);busy=true;try{var before=clone(db),r=canonicalizeDb(db);if(r.changed)backupOnce(before);return rawSave(r.db)}finally{busy=false}}
window.getDB=function(){return canonicalizeDb(rawRead()).db};window.saveDB=function(db){return saveCanonical(db)};
function refresh(){['renderSessionsList','renderActiveSessionHome','updateHome','renderSessionDetail','renderSessions','renderStatistics','renderStats','KP_RENDER_STATS'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}})}
function migratePersisted(force){if(busy)return;var db=rawRead(),before=clone(db),r=canonicalizeDb(db);if(!r.changed&&!force)return;if(r.changed)backupOnce(before);busy=true;try{rawSave(r.db);if(r.changed)console.log('[stable-identity-v7] összevonva:',r.merged,'azonosító kiosztva:',r.assigned)}catch(e){console.error('[stable-identity-v7] migrációs hiba',e)}finally{busy=false}refresh()}
window.kpCanonicalizeCatches=function(){migratePersisted(true)};
migratePersisted();setTimeout(migratePersisted,500);setTimeout(migratePersisted,1600);setInterval(migratePersisted,5000);
})();