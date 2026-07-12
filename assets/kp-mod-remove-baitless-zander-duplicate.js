/* Egyszeri adatjavítás: csali nélküli, duplikált süllőfogás eltávolítása.
 * Csak akkor töröl, ha ugyanabban a túrában található egy csalis süllő is,
 * amelynek súlya és hossza megegyezik a csali nélküli rekordéval.
 */
(function(){
'use strict';
if(window.KP_REMOVE_BAITLESS_ZANDER_DUPLICATE_V1)return;
window.KP_REMOVE_BAITLESS_ZANDER_DUPLICATE_V1=true;

var MARKER='kp_cleanup_baitless_zander_duplicate_v1';
var DB_KEY=(function(){try{return window.DB_KEY||'horgaszpro_v0230'}catch(e){return 'horgaszpro_v0230'}})();

function text(v){return String(v==null?'':v).trim()}
function norm(v){return text(v).toLowerCase().replace(/[áéíóöőúüű]/g,function(c){return {'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u'}[c]}).replace(/[^a-z0-9]+/g,'')}
function fishName(c){return text(c&&(c.fish||c.hal||c.fishName||c.halfaj||c.species))}
function baitName(c){return text(c&&(c.bait||c.csali||c.baitName))}
function num(v){if(v==null||v==='')return null;var n=Number(String(v).replace(',','.').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:null}
function weight(c){var v=c&&(c.weightKg!=null?c.weightKg:(c.weight!=null?c.weight:c.suly));return num(v)}
function length(c){var v=c&&(c.lengthCm!=null?c.lengthCm:(c.length!=null?c.length:c.hossz));return num(v)}
function sameMeasure(a,b){
  var aw=weight(a),bw=weight(b),al=length(a),bl=length(b);
  var weightSame=(aw==null&&bw==null)||(aw!=null&&bw!=null&&Math.abs(aw-bw)<0.0001);
  var lengthSame=(al==null&&bl==null)||(al!=null&&bl!=null&&Math.abs(al-bl)<0.0001);
  return weightSame&&lengthSame;
}
function getDB(){try{return typeof window.getDB==='function'?window.getDB():JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch(e){return {}}}
function saveDB(db){
  try{if(typeof window.saveDB==='function'){window.saveDB(db);return true}}catch(e){}
  try{localStorage.setItem(DB_KEY,JSON.stringify(db));return true}catch(e){return false}
}
function refresh(){['renderSessionsList','renderActiveSessionHome','updateHome','renderStorageOverview','renderSessionDetail','renderSessions','renderStats','renderStatistics'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]()}catch(e){}})}
function run(){
  try{if(localStorage.getItem(MARKER)==='done')return}catch(e){}
  var db=getDB();
  var sessions=Array.isArray(db.sessions)?db.sessions:[];
  var removed=[];
  sessions.forEach(function(session){
    var catches=Array.isArray(session.catches)?session.catches:[];
    var baited=catches.filter(function(c){return norm(fishName(c))==='sullo'&&baitName(c)!==''});
    if(!baited.length)return;
    var kept=[];
    catches.forEach(function(c){
      var isTarget=norm(fishName(c))==='sullo'&&baitName(c)===''&&baited.some(function(b){return sameMeasure(c,b)});
      if(isTarget){removed.push({sessionId:session.id||session.uuid||'',catchId:c.id||c.uuid||'',fish:fishName(c)});return;}
      kept.push(c);
    });
    if(kept.length!==catches.length){
      session.catches=kept;
      if(Array.isArray(session.fogasok))session.fogasok=kept;
      if(Array.isArray(session['fogások']))session['fogások']=kept;
      session.updatedAt=new Date().toISOString();
      session.modifiedAt=session.updatedAt;
    }
  });
  if(removed.length){
    saveDB(db);
    refresh();
    console.log('[zander-cleanup] csali nélküli duplikált süllő törölve',removed);
    try{if(typeof window.showToast==='function')window.showToast('A csali nélküli duplikált süllőfogás törölve.')}catch(e){}
  }
  try{localStorage.setItem(MARKER,'done')}catch(e){}
}
setTimeout(run,900);
setTimeout(run,2200);
})();
