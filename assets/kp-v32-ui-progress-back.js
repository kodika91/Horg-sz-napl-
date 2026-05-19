(function(){
  if(window.KP_V32_UI_PROGRESS_BACK)return;
  window.KP_V32_UI_PROGRESS_BACK=true;
  let saving=false,lastSyncFn=null,hideTimer=null;
  function css(){
    if(document.getElementById('kp-v32-ui-style'))return;
    const s=document.createElement('style');
    s.id='kp-v32-ui-style';
    s.textContent=`
      #kp-save-overlay{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(17,25,21,.46);backdrop-filter:blur(10px);padding:18px;}
      #kp-save-overlay.show{display:flex;}
      .kp-save-card{width:min(92vw,420px);background:rgba(250,248,242,.96);border:1px solid rgba(80,110,80,.22);border-radius:24px;box-shadow:0 20px 70px rgba(20,35,25,.26);padding:22px;text-align:center;color:var(--text,#253027);}
      .kp-save-spinner{width:52px;height:52px;border-radius:50%;border:5px solid rgba(80,125,87,.18);border-top-color:var(--water,#2e7b6f);margin:0 auto 14px;animation:kpSpin .9s linear infinite;}
      @keyframes kpSpin{to{transform:rotate(360deg)}}
      .kp-save-title{font-size:20px;font-weight:900;margin-bottom:8px;}.kp-save-sub{font-size:14px;line-height:1.45;color:var(--muted,#6f6a60);}
      .kp-save-progress{height:9px;background:rgba(80,125,87,.13);border-radius:999px;overflow:hidden;margin-top:16px;}.kp-save-progress span{display:block;height:100%;width:45%;background:linear-gradient(90deg,var(--water,#2e7b6f),var(--moss,#557b44));border-radius:999px;animation:kpProgress 1.2s ease-in-out infinite;}@keyframes kpProgress{0%{transform:translateX(-110%)}100%{transform:translateX(240%)}}
      #kp-top-back{position:fixed;left:14px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:9990;display:none;align-items:center;gap:7px;border:1px solid rgba(60,90,65,.18);background:rgba(250,248,242,.88);backdrop-filter:blur(14px);border-radius:999px;color:var(--water,#2e7b6f);font-weight:900;padding:9px 12px;box-shadow:0 8px 28px rgba(30,45,35,.14);font-size:14px;}#kp-top-back.show{display:flex;}#kp-top-back i{font-size:18px;}
      @media(max-width:640px){#kp-top-back{left:10px;top:calc(env(safe-area-inset-top,0px) + 8px);padding:8px 10px;font-size:13px}.kp-save-card{border-radius:22px;padding:20px}}
    `;
    document.head.appendChild(s);
  }
  function loadProtectedFishCards(){
    if(!document.getElementById('kp-v33-protected-fish-cards')){
      var s=document.createElement('script');
      s.id='kp-v33-protected-fish-cards';
      s.src='assets/kp-v33-protected-fish-cards.js?v=20260518-33';
      s.defer=false;
      document.body.appendChild(s);
    }
    if(!document.getElementById('kp-v35-home-ban-render')){
      var s2=document.createElement('script');
      s2.id='kp-v35-home-ban-render';
      s2.src='assets/kp-v35-home-ban-render.js?v=20260519-35b';
      s2.defer=false;
      document.body.appendChild(s2);
    }
  }
  function overlay(){let o=document.getElementById('kp-save-overlay');if(o)return o;o=document.createElement('div');o.id='kp-save-overlay';o.innerHTML='<div class="kp-save-card"><div class="kp-save-spinner"></div><div class="kp-save-title">GitHub mentés folyamatban</div><div class="kp-save-sub">Képek és naplóadatok feltöltése. Ne zárd be az appot, amíg be nem fejeződik.</div><div class="kp-save-progress"><span></span></div></div>';document.body.appendChild(o);return o;}
  function showSaving(msg){saving=true;css();clearTimeout(hideTimer);const o=overlay();if(msg)o.querySelector('.kp-save-sub').textContent=msg;o.classList.add('show');hideTimer=setTimeout(hideSaving,90000)}
  function hideSaving(){saving=false;clearTimeout(hideTimer);const o=document.getElementById('kp-save-overlay');if(o)o.classList.remove('show')}
  window.kpShowSaving=showSaving;window.kpHideSaving=hideSaving;
  function isFinishMsg(msg){const t=String(msg||'').toLowerCase();return t.includes('mentés kész')||t.includes('mentési hiba')||t.includes('github backup kész')||t.includes('új github backup kész')||t.includes('backup kész');}
  function patchToast(){if(window.__kpV32ToastPatched)return;const old=window.showToast;if(typeof old!=='function')return;window.showToast=function(msg){if(isFinishMsg(msg))setTimeout(hideSaving,550);return old.apply(this,arguments)};window.__kpV32ToastPatched=true;}
  function patchLog(){if(window.__kpV32LogPatched)return;const old=window.githubLog;if(typeof old!=='function')return;window.githubLog=function(msg){if(isFinishMsg(msg)||String(msg||'').toLowerCase().includes('mentés kész'))setTimeout(hideSaving,650);return old.apply(this,arguments)};window.__kpV32LogPatched=true;}
  function patchSync(){if(typeof window.githubSyncNow!=='function')return;if(window.githubSyncNow===lastSyncFn&&window.__kpV32SyncPatched)return;const old=window.githubSyncNow;lastSyncFn=old;window.githubSyncNow=function(){showSaving('GitHub mentés folyamatban. Új backup fájl készül, a régi mentések nem íródnak felül.');try{const r=old.apply(this,arguments);if(r&&typeof r.then==='function')return r.finally(()=>setTimeout(hideSaving,700));setTimeout(hideSaving,16000);return r;}catch(e){setTimeout(hideSaving,700);throw e;}};window.__kpV32SyncPatched=true;lastSyncFn=window.githubSyncNow;}
  document.addEventListener('click',function(e){const b=e.target&&e.target.closest&&e.target.closest('button');if(!b)return;const t=(b.textContent||'').toLowerCase();if(t.includes('mentés githubra most'))showSaving('GitHub mentés folyamatban. Feltöltés és új backup fájl készítése…');},true);
  function backBtn(){css();let b=document.getElementById('kp-top-back');if(!b){b=document.createElement('button');b.id='kp-top-back';b.type='button';b.innerHTML='<i class="ti ti-arrow-left"></i><span>Vissza</span>';document.body.appendChild(b);b.onclick=function(){try{const cur=document.querySelector('.page.active,.page.show,[id^="page-"].active');const id=cur&&cur.id?cur.id.replace(/^page-/,''):'';if(id&&id!=='home'){if(typeof showPage==='function')showPage('home');else location.hash='home';window.scrollTo({top:0,behavior:'smooth'});return;}window.scrollTo({top:0,behavior:'smooth'});}catch(e){try{window.history.back()}catch(_){}}};}return b;}
  function activePageId(){const p=document.querySelector('.page.active,.page.show,[id^="page-"].active');return p&&p.id?p.id.replace(/^page-/,''):'';}
  function updateBack(){const b=backBtn();const id=activePageId();const should=id&&id!=='home'&&id!=='new-session';b.classList.toggle('show',!!should);const label=id==='fish'?'Halfajokból vissza':id==='session-detail'?'Túrából vissza':'Vissza';const span=b.querySelector('span');if(span)span.textContent=label;}
  const oldShow=window.showPage;if(typeof oldShow==='function'){window.showPage=function(){const r=oldShow.apply(this,arguments);setTimeout(()=>{updateBack();patchToast();patchLog();patchSync();loadProtectedFishCards();},80);return r;};}
  function boot(){css();backBtn();updateBack();patchToast();patchLog();patchSync();loadProtectedFishCards();}
  boot();setInterval(()=>{updateBack();patchToast();patchLog();patchSync();loadProtectedFishCards();if(!saving){const o=document.getElementById('kp-save-overlay');if(o)o.classList.remove('show')}},900);
})();