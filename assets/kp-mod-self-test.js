/* kp-mod-self-test.js — KapásPont nem destruktív diagnosztika
 * v1.0 · Nem módosít adatot. Konzolba és window.kpRunSelfTest() alá ad állapotjelentést.
 */
(function(){
'use strict';
if(window.KP_SELF_TEST_V1)return;
window.KP_SELF_TEST_V1=true;

function ok(v){return !!v}
function safe(fn){try{return fn()}catch(e){return {error:String(e&&e.message||e)}}}
function dbKey(){return window.DB_KEY||'horgaszpro_v0230'}
function db(){return safe(function(){return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(dbKey())||'{}')})}
function arr(x){return Array.isArray(x)?x:[]}
function countCatches(d){return arr(d.sessions).reduce((a,s)=>a+arr(s&&s.catches).length+arr(s&&s.fogasok).length+arr(s&&s['fogások']).length,0)}
function test(){
  const d=db();
  const report={
    version:'kp-self-test-v1.0',
    time:new Date().toISOString(),
    loader:{
      pageTitle:document.title,
      scripts:Array.from(document.scripts).filter(s=>/kp-mod-|v1-image|kp-v27/.test(s.src||'')).map(s=>s.id||s.src.split('/').pop())
    },
    core:{
      DB_KEY:dbKey(),
      hasGetDB:typeof getDB==='function',
      hasSaveDB:typeof saveDB==='function',
      hasShowToast:typeof showToast==='function',
      sessions:arr(d.sessions).length,
      catches:countCatches(d),
      locations:arr(d.locations).length,
      scoutSpots:arr(d.scoutSpots).length,
      baits:arr(d.baits).length,
      gear:arr(d.gear).length
    },
    modules:{
      sync:ok(window.KP_MOD_SYNC_V39),
      restoreButtonFix:ok(window.KP_GH_RESTORE_BTN_FIX_V1),
      lateCatchSave:ok(window.KP_SESSION_CATCH_LATE_SAVE_FIX_V11)||ok(window.KP_SESSION_CATCH_LATE_SAVE_FIX_V1),
      fishDetailScroll:ok(window.KP_FISH_DETAIL_SCROLL_FIX_V1),
      baitCombo:ok(window.KP_CATCH_BAIT_COMBO_V11)||ok(window.KP_CATCH_BAIT_COMBO_V1),
      baitImageFix:ok(window.KP_BAIT_FORM_IMAGE_UPLOAD_FIX_V11)||ok(window.KP_BAIT_FORM_IMAGE_UPLOAD_FIX_V1),
      baitFormScroll:ok(window.KP_BAIT_FORM_SCROLL_FIX_V1),
      mobileModalScroll:ok(window.KP_MOBILE_MODAL_SCROLL_FIX_V14)||ok(window.KP_MOBILE_MODAL_SCROLL_FIX_V13)||ok(window.KP_MOBILE_MODAL_SCROLL_FIX_V12),
      spotNavPagehide:ok(window.KP_SPOT_NAV_PAGEHIDE_V1),
      mobileCenter:ok(window.KP_MOBILE_LAYOUT_CENTER_FIX_V1)
    },
    debugFunctions:{
      kpLateCatchSaveDebug:typeof window.kpLateCatchSaveDebug==='function'?safe(()=>window.kpLateCatchSaveDebug()):false,
      kpFishDetailScrollDebug:typeof window.kpFishDetailScrollDebug==='function'?safe(()=>window.kpFishDetailScrollDebug()):false,
      kpBaitImageUploadDebug:typeof window.kpBaitImageUploadDebug==='function'?safe(()=>window.kpBaitImageUploadDebug()):false,
      kpCatchModalScrollDebug:typeof window.kpCatchModalScrollDebug==='function'?safe(()=>window.kpCatchModalScrollDebug()):false,
      kpBaitFormScrollDebug:typeof window.kpBaitFormScrollDebug==='function'?safe(()=>window.kpBaitFormScrollDebug()):false
    },
    syncFunctions:{
      githubSyncNow:typeof window.githubSyncNow==='function',
      kpRestoreLatestGithubBackup:typeof window.kpRestoreLatestGithubBackup==='function',
      githubRestoreLatestFromRepo:typeof window.githubRestoreLatestFromRepo==='function'
    }
  };
  console.group('[KapásPont self-test]');
  console.log(report);
  console.groupEnd();
  return report;
}
window.kpRunSelfTest=test;
setTimeout(test,1800);
console.log('[self-test] aktív · futtasd konzolból: kpRunSelfTest()');
})();
