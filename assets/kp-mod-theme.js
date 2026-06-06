(function(){
  if(window.KP_MOD_THEME_V1)return;
  window.KP_MOD_THEME_V1=true;

  var css=`
/* ── ENHANCED DESIGN TOKENS ────────────────────────────── */
:root{
  --r:18px;
  --r-sm:13px;
  --r-xs:8px;
  --shadow:rgba(35,22,5,.09);
  --shadow2:rgba(35,22,5,.17);
  --border:rgba(105,84,48,.12);
  --border2:rgba(105,84,48,.24);
}

/* ── BODY GRADIENT HÁTTÉR ──────────────────────────────── */
body{
  background:linear-gradient(160deg,#ebe6da 0%,#e4ddd0 55%,#dbd2c0 100%) fixed !important;
}

/* ── SIDEBAR ─────────────────────────────────────────────────── */
.sidebar{
  background:rgba(252,250,246,.95) !important;
  backdrop-filter:blur(28px) saturate(1.5) !important;
  -webkit-backdrop-filter:blur(28px) saturate(1.5) !important;
  border-right:1px solid rgba(105,84,48,.10) !important;
  box-shadow:5px 0 32px rgba(35,22,5,.12) !important;
}
.sidebar-brand{
  border-bottom:1px solid rgba(105,84,48,.09) !important;
}
.brand-logo{
  box-shadow:0 4px 14px rgba(44,110,122,.38) !important;
  border-radius:13px !important;
}
.nav-item-side{
  border-radius:13px !important;
  padding:11px 14px !important;
  font-size:14px !important;
  transition:all .18s cubic-bezier(.4,0,.2,1) !important;
}
.nav-item-side:hover{
  background:rgba(105,84,48,.06) !important;
}
.nav-item-side.active{
  background:linear-gradient(135deg,rgba(44,110,122,.13),rgba(44,110,122,.05)) !important;
  border-color:rgba(44,110,122,.22) !important;
  box-shadow:0 2px 10px rgba(44,110,122,.10) !important;
}
.new-session-btn-side{
  border-radius:14px !important;
  box-shadow:0 5px 20px rgba(44,110,122,.34) !important;
  font-weight:700 !important;
  letter-spacing:.01em !important;
}

/* ── TOP BAR ───────────────────────────────────────────────────── */
.top-bar{
  background:rgba(252,250,246,.94) !important;
  backdrop-filter:blur(28px) saturate(1.4) !important;
  -webkit-backdrop-filter:blur(28px) saturate(1.4) !important;
  box-shadow:0 2px 20px rgba(35,22,5,.08) !important;
  border-bottom:1px solid rgba(105,84,48,.09) !important;
}
.tb-btn{
  border-radius:11px !important;
  transition:all .16s !important;
  font-weight:600 !important;
}
.tb-btn.primary{
  box-shadow:0 4px 16px rgba(44,110,122,.30) !important;
}

/* ── MAIN CTA GOMB ───────────────────────────────────────────────── */
.main-cta{
  border-radius:24px !important;
  padding:22px 26px !important;
  background:linear-gradient(135deg,#1e5c6a 0%,#2a6e7e 38%,#38a0b5 100%) !important;
  box-shadow:0 10px 38px rgba(30,92,106,.42),0 2px 0 rgba(255,255,255,.16) inset !important;
  transition:all .25s cubic-bezier(.4,0,.2,1) !important;
}
.main-cta:hover{
  transform:translateY(-4px) !important;
  box-shadow:0 20px 56px rgba(30,92,106,.52),0 2px 0 rgba(255,255,255,.16) inset !important;
}
.main-cta:active{transform:translateY(-1px) !important;}
.cta-icon-wrap{
  width:58px !important; height:58px !important;
  border-radius:16px !important;
  background:rgba(255,255,255,.20) !important;
  border:1.5px solid rgba(255,255,255,.30) !important;
  font-size:29px !important;
  box-shadow:0 4px 14px rgba(0,0,0,.14) inset !important;
}
.cta-text .cta-title{
  font-size:21px !important;
  letter-spacing:-.01em !important;
}

/* ── STAT KÁRTYÁK ──────────────────────────────────────────────────── */
.stat-grid{gap:12px !important;}
.stat-card{
  border-radius:22px !important;
  padding:20px !important;
  background:linear-gradient(150deg,#fdfaf6 0%,#f3ece0 100%) !important;
  border:1px solid rgba(105,84,48,.09) !important;
  box-shadow:0 3px 16px rgba(35,22,5,.09),0 1px 0 rgba(255,255,255,.88) inset !important;
  transition:all .22s cubic-bezier(.4,0,.2,1) !important;
}
.stat-card:hover{
  transform:translateY(-6px) scale(1.015) !important;
  box-shadow:0 18px 46px rgba(35,22,5,.17),0 1px 0 rgba(255,255,255,.88) inset !important;
  border-color:rgba(44,110,122,.18) !important;
}
.stat-icon{
  width:46px !important; height:46px !important;
  border-radius:14px !important;
  margin-bottom:14px !important;
  box-shadow:0 2px 10px rgba(35,22,5,.12) !important;
}
.stat-value{
  font-size:30px !important;
  font-weight:800 !important;
  letter-spacing:-.03em !important;
}
.stat-label{font-weight:600 !important;}

/* ── SESSION LISTA ────────────────────────────────────────────────── */
.session-item{
  border-radius:20px !important;
  padding:16px 18px !important;
  background:linear-gradient(148deg,#faf8f4,#f2ebe0) !important;
  border:1px solid rgba(105,84,48,.09) !important;
  box-shadow:0 2px 10px rgba(35,22,5,.07),0 1px 0 rgba(255,255,255,.82) inset !important;
  transition:all .22s cubic-bezier(.4,0,.2,1) !important;
  margin-bottom:10px !important;
}
.session-item:hover{
  transform:translateX(5px) !important;
  box-shadow:0 8px 30px rgba(35,22,5,.15),0 1px 0 rgba(255,255,255,.82) inset !important;
  border-color:rgba(44,110,122,.22) !important;
}
.session-date-box{
  border-radius:14px !important;
  background:linear-gradient(145deg,#ede8de,#f3ece0) !important;
  box-shadow:0 1px 4px rgba(35,22,5,.08) !important;
}
.sdb-day{font-size:24px !important;font-weight:800 !important;}
.sc-count{font-size:24px !important;font-weight:800 !important;}
.session-thumb,.session-thumb-placeholder{border-radius:14px !important;}
.session-thumb-placeholder{
  background:linear-gradient(135deg,#e8e0d2,#f2ece0) !important;
}

/* ── IDŐJÁRÁS FORECAST GRID ──────────────────────────────────────────── */
.forecast-item{
  border-radius:18px !important;
  padding:13px 8px !important;
  transition:all .18s cubic-bezier(.4,0,.2,1) !important;
}
.forecast-item:hover{
  transform:translateY(-4px) scale(1.04) !important;
}
.forecast-temp{font-size:17px !important;font-weight:800 !important;letter-spacing:-.02em !important;}
.forecast-hour{font-weight:700 !important;letter-spacing:.02em !important;}
.forecast-wrap{border-top:1px solid rgba(255,255,255,.22) !important;margin-top:14px !important;padding-top:14px !important;}

/* ── HELYSZÍN KÁRTYA ────────────────────────────────────────────────────── */
.loc-card{
  border-radius:18px !important;
  padding:15px 17px !important;
  background:linear-gradient(148deg,#fdfaf6,#f3ede2) !important;
  border:1px solid rgba(105,84,48,.09) !important;
  box-shadow:0 2px 10px rgba(35,22,5,.07),0 1px 0 rgba(255,255,255,.82) inset !important;
  transition:all .20s cubic-bezier(.4,0,.2,1) !important;
  margin-bottom:10px !important;
}
.loc-card:hover{
  transform:translateX(4px) !important;
  box-shadow:0 8px 28px rgba(35,22,5,.13) !important;
  border-color:rgba(44,110,122,.20) !important;
}

/* ── HAL KÁRTYA ────────────────────────────────────────────────────────── */
.fish-card{
  border-radius:20px !important;
  box-shadow:0 3px 14px rgba(35,22,5,.09),0 1px 0 rgba(255,255,255,.7) inset !important;
  transition:all .20s cubic-bezier(.4,0,.2,1) !important;
}
.fish-card:hover{
  transform:translateY(-5px) !important;
  box-shadow:0 14px 36px rgba(35,22,5,.16) !important;
}

/* ── FORM INPUT ────────────────────────────────────────────────────────── */
input[type=text],input[type=number],input[type=date],
input[type=time],select,textarea{
  border-radius:13px !important;
  border:1.5px solid rgba(105,84,48,.17) !important;
  background:rgba(253,251,247,.92) !important;
  transition:border-color .16s,box-shadow .16s !important;
}
input[type=text]:focus,input[type=number]:focus,input[type=date]:focus,
input[type=time]:focus,select:focus,textarea:focus{
  border-color:rgba(44,110,122,.46) !important;
  box-shadow:0 0 0 3.5px rgba(44,110,122,.12) !important;
  outline:none !important;
}

/* ── TAGS / CHIP ───────────────────────────────────────────────────────── */
.tag{
  border-radius:999px !important;
  padding:4px 12px !important;
  font-weight:600 !important;
}

/* ── GOMBOK ────────────────────────────────────────────────────────────── */
.btn,.btn-primary,.btn-secondary,.btn-outline{
  border-radius:13px !important;
  font-weight:600 !important;
  transition:all .18s cubic-bezier(.4,0,.2,1) !important;
}
.w-btn{
  border-radius:11px !important;
  font-weight:600 !important;
  transition:all .16s !important;
}
.btn-danger-outline{
  border-radius:13px !important;
}

/* ── MOBIL NAV ───────────────────────────────────────────────────────────── */
.mobile-nav{
  background:rgba(252,250,246,.96) !important;
  backdrop-filter:blur(28px) saturate(1.4) !important;
  -webkit-backdrop-filter:blur(28px) saturate(1.4) !important;
  border-top:1px solid rgba(105,84,48,.10) !important;
  box-shadow:0 -5px 26px rgba(35,22,5,.12) !important;
}
.mn-item{
  transition:color .16s !important;
  border-radius:10px !important;
}
.mn-item.active{color:var(--water) !important;}
.mn-item.active i{color:var(--water) !important;}

/* ── OLDAL TARTALOM ────────────────────────────────────────────────────────── */
.page-content{padding:24px !important;}
@media(max-width:640px){.page-content{padding:16px 14px !important;}}

/* ── SECTION HEADER ──────────────────────────────────────────────────────────── */
.section-label{
  font-size:12px !important;
  font-weight:700 !important;
  letter-spacing:.07em !important;
  text-transform:uppercase !important;
}

/* ── MODAL / SHEET ─────────────────────────────────────────────────────────── */
.modal-overlay,.sheet-overlay{
  backdrop-filter:blur(10px) !important;
  -webkit-backdrop-filter:blur(10px) !important;
}

/* ── TILALMI FIGYELMEZTETÉS ─────────────────────────────────────────────────── */
.ban-alert{border-radius:18px !important;}

/* ── FANCY IKON ────────────────────────────────────────────────────────────── */
.fancy-icon{box-shadow:0 3px 12px rgba(35,22,5,.13) !important;}

/* ── SECTION TARTALOM KÁRTYA ────────────────────────────────────────────────────── */
.content-card,.detail-card,.form-card{
  border-radius:22px !important;
  box-shadow:0 3px 18px rgba(35,22,5,.09),0 1px 0 rgba(255,255,255,.8) inset !important;
  border:1px solid rgba(105,84,48,.09) !important;
}

/* ── AKTÍV HORGAŐZAT KÁRTYA ───────────────────────────────────────────────────────────────── */
#active-session-home .session-item,
.active-session-card{
  border-radius:22px !important;
  border-color:rgba(44,110,122,.26) !important;
  box-shadow:0 6px 24px rgba(44,110,122,.18),0 1px 0 rgba(255,255,255,.8) inset !important;
}
`;

  var st=document.createElement('style');
  st.id='kp-mod-theme-v1';
  st.textContent=css;
  document.head.appendChild(st);
})();
