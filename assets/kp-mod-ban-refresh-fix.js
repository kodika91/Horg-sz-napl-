// kp-mod-ban-refresh-fix.js — 2026 tilalmi idő frissítés javítás
// v1.0 · HU_FISH_ID_DB_V2 alkalmazása betöltés után + dátum alapú tilalom
(function(){
  'use strict';
  if(window.KP_BAN_REFRESH_FIX_V1)return;
  window.KP_BAN_REFRESH_FIX_V1=true;

  const ROMAN={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
  const HU_MONTHS={
    'jan':1,'januar':1,'január':1,
    'feb':2,'februar':2,'február':2,
    'mar':3,'már':3,'marcius':3,'március':3,
    'apr':4,'ápr':4,'aprilis':4,'április':4,
    'maj':5,'máj':5,'majus':5,'május':5,
    'jun':6,'jún':6,'junius':6,'június':6,
    'jul':7,'júl':7,'julius':7,'július':7,
    'aug':8,'augusztus':8,
    'sze':9,'szept':9,'szeptember':9,
    'okt':10,'oktober':10,'október':10,
    'nov':11,'november':11,
    'dec':12,'december':12
  };
  function clean(s){return String(s||'').trim();}
  function normId(s){return clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');}
  function monthNum(raw){
    const s=clean(raw).replace(/\.$/,'');
    const up=s.toUpperCase();
    if(ROMAN[up])return ROMAN[up];
    return HU_MONTHS[s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')]||HU_MONTHS[s.toLowerCase()]||null;
  }
  function parseBanText(text){
    text=clean(text);
    if(!text || /nincs|nem fogható|védett|helyi szabály/i.test(text))return null;
    const rx=/([IVX]{1,4}|Jan\.?|Feb\.?|Már\.?|Mar\.?|Ápr\.?|Apr\.?|Máj\.?|Maj\.?|Jún\.?|Jun\.?|Júl\.?|Jul\.?|Aug\.?|Sze\.?|Szept\.?|Okt\.?|Nov\.?|Dec\.?)\s*\.?\s*(\d{1,2})\.?/giu;
    const parts=[]; let m;
    while((m=rx.exec(text))!==null){
      const mo=monthNum(m[1]);
      const day=Number(m[2]);
      if(mo&&day)parts.push([mo,day]);
    }
    return parts.length>=2?{start:parts[0],end:parts[1]}:null;
  }
  function inPeriod(start,end,dt){
    if(!start||!end)return false;
    const y=dt.getFullYear();
    const cur=new Date(y,dt.getMonth(),dt.getDate()).getTime();
    let a=new Date(y,start[0]-1,start[1]).getTime();
    let b=new Date(y,end[0]-1,end[1]).getTime();
    if(b<a){
      // évfordulón átnyúló tilalom, pl. október–március
      if(cur>=a)return true;
      a=new Date(y-1,start[0]-1,start[1]).getTime();
    }
    return cur>=a && cur<=b;
  }
  function findFishByV2(x){
    if(!window.FISH_DB||!x)return null;
    const xid=normId(x.id);
    const xn=normId(x.nev);
    return window.FISH_DB.find(f=>normId(f.id)===xid||normId(f.name)===xn||normId(f.latin)===normId(x.latin));
  }
  function applyV2Bans(){
    if(!Array.isArray(window.FISH_DB)||!Array.isArray(window.HU_FISH_ID_DB_V2))return false;
    try{ if(typeof window.applyHuV2==='function') window.applyHuV2(); }catch(e){ console.warn('[KP ban fix] applyHuV2 hiba',e); }
    window.HU_FISH_ID_DB_V2.forEach(x=>{
      const f=findFishByV2(x);
      if(!f)return;
      f.ban=x.tilalmi_ido_2026||f.ban||null;
      f.minSize=x.meret||f.minSize||null;
      f.quota=x.napi_mennyiseg||f.quota||null;
      f.huV2=x;
      const p=parseBanText(f.ban);
      f.banStart=p?p.start:null;
      f.banEnd=p?p.end:null;
    });
    return true;
  }
  window.currentBanState=function(f){
    if(!f)return false;
    const p=(f.banStart&&f.banEnd)?{start:f.banStart,end:f.banEnd}:parseBanText(f.ban);
    return !!(p&&inPeriod(p.start,p.end,new Date()));
  };
  function rerender(){
    try{ if(typeof window.checkBans==='function') window.checkBans(); }catch(e){}
    try{ if(typeof window.renderFishGrid==='function') window.renderFishGrid(); }catch(e){}
    try{ if(typeof window.updateHome==='function') window.updateHome(); }catch(e){}
  }
  function boot(){
    const ok=applyV2Bans();
    if(ok)rerender();
  }
  setTimeout(boot,300);
  setTimeout(boot,1000);
  setTimeout(boot,2500);
  setInterval(boot,60*60*1000);
  window.kpBanRefreshFixDebug=function(){boot();return (window.FISH_DB||[]).filter(window.currentBanState).map(f=>({id:f.id,name:f.name,ban:f.ban,start:f.banStart,end:f.banEnd}));};
})();
