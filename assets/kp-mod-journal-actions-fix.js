/* kp-mod-journal-actions-fix.js — ideiglenesen kikapcsolva
 * A korábbi hotfix beavatkozott a kattintásokba/navigációba, ezért most no-op.
 * A Napló műveleteket külön, tesztelt modulban kell visszatenni.
 */
(function(){
'use strict';
window.KP_JOURNAL_ACTIONS_FIX_DISABLED=true;
console.log('[journal-actions-fix] disabled to restore navigation');
})();
