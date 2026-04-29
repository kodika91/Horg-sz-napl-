const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORE = 'horgasz_naplo_pro_layout_v4';

const DEFAULT_METHODS = [
  {name:'Method feeder', category:'Finomszerelékes fenekező', note:'Method kosárral, pellet/wafter csalikkal.', img:'assets/waters/derito-to.webp'},
  {name:'Feeder', category:'Fenekező', note:'Kosaras, rezgőspicces horgászat.', img:'assets/waters/tisza-to.webp'},
  {name:'Picker', category:'Finom feeder', note:'Rövid feeder bot, kisebb vizekre.', img:'assets/waters/holtag.webp'},
  {name:'Fenekező', category:'Általános', note:'Aljzaton felkínált csali.', img:'assets/waters/csatorna.webp'},
  {name:'Úszós', category:'Úszós', note:'Álló- vagy folyóvízi úszós módszer.', img:'assets/waters/balaton.webp'},
  {name:'Matchbotos', category:'Úszós', note:'Távolabbi úszós horgászat matchbottal.', img:'assets/waters/rsd.webp'},
  {name:'Bolognai', category:'Folyóvízi úszós', note:'Hosszú gyűrűs botos úsztatás.', img:'assets/waters/felso-duna.webp'},
  {name:'Spiccbotos', category:'Úszós', note:'Egyszerű, orsó nélküli horgászat.', img:'assets/waters/holtag.webp'},
  {name:'Rakós botos', category:'Verseny / úszós', note:'Precíz helyben horgászat rakós bottal.', img:'assets/waters/intenziv-viz.webp'},
  {name:'Bojlis', category:'Pontyos', note:'Nagytestű pontyra, amurra.', img:'assets/fish/ponty.webp'},
  {name:'Pergetés', category:'Ragadozóhalas', note:'Műcsalis kereső horgászat.', img:'assets/fish/csuka.webp'},
  {name:'Dropshot', category:'Ragadozóhalas', note:'Finom gumihalas módszer.', img:'assets/fish/suger.webp'},
  {name:'UL pergetés', category:'Ragadozóhalas', note:'Ultra light műcsalis horgászat.', img:'assets/fish/suger.webp'},
  {name:'Harcsázás', category:'Ragadozóhalas', note:'Speciális erős felszerelés harcsára.', img:'assets/fish/harcsa.webp'},
  {name:'Legyezés', category:'Műlegyes', note:'Műléggyel történő horgászat.', img:'assets/waters/hegyi-patak.webp'},
  {name:'Mártogatás', category:'Ragadozóhalas', note:'Part menti, akadós helyek átvizsgálása.', img:'assets/waters/zala.webp'}
];
const DEFAULTS = {
  logs: [], customWaters: [],
  baits: [
    {name:'Carp Expert Wafter 8mm – Eper', category:'Wafter', note:'Method/feeder csali.', img:'assets/fish/ponty.webp'},
    {name:'Promix Ribbed Wafter – Fokhagyma', category:'Wafter', note:'Bordázott lebegő csali.', img:'assets/fish/amur.webp'},
    {name:'SBS Wafter 6mm – Ananász', category:'Wafter', note:'Édes, feltűnő csali.', img:'assets/fish/karasz.webp'},
    {name:'Dovit Wafter 8mm – Mézes', category:'Wafter', note:'Pontyos-amúros csali.', img:'assets/fish/deverkeszeg.webp'}
  ],
  feeds: [
    {name:'Promix Method Mix – Édes', category:'Method mix', note:'Method kosárhoz.', img:'assets/waters/intenziv-viz.webp'},
    {name:'Pontyos fűszeres etető', category:'Etetőanyag', note:'Ponty, kárász, dévér.', img:'assets/waters/banyato.webp'},
    {name:'Pellet mix 2mm', category:'Pellet', note:'Method kosárhoz és alapozáshoz.', img:'assets/waters/tisza-to.webp'}
  ],
  hooks: [
    {name:'Guru QM1 – 12', category:'Method horog', size:'12', note:'Wafterhez, csalitüskéhez.', img:'assets/fish/ponty.webp'},
    {name:'Owner 50355 – 12', category:'Feeder horog', size:'12', note:'Univerzális feeder horog.', img:'assets/fish/karasz.webp'},
    {name:'Preston PR363 – 14', category:'Feeder horog', size:'14', note:'Finomabb előkéhez.', img:'assets/fish/deverkeszeg.webp'},
    {name:'Korda Wide Gape – 10', category:'Bojlis horog', size:'10', note:'Erős pontyos horog.', img:'assets/fish/amur.webp'}
  ],
  methods: DEFAULT_METHODS
};
let state = JSON.parse(localStorage.getItem(STORE) || 'null') || DEFAULTS;
for (const k of Object.keys(DEFAULTS)) if (!state[k]) state[k] = DEFAULTS[k];
if (!state.methods || state.methods.length < 8) state.methods = DEFAULT_METHODS;
let draft = freshDraft();
function freshDraft(){ return {water:null, waterImg:null, coords:'', weather:null, baits:[], feeds:[], hooks:[], photos:[], catches:[]}; }
function save(){ localStorage.setItem(STORE, JSON.stringify(state)); }
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fileToData(file){return new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(file);});}
function allWaters(){return [...WATER_DATA, ...(state.customWaters||[])];}
function parseCoords(txt){let m=(txt||'').match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);return m?{lat:+m[1],lon:+m[2]}:null;}
function todayISO(){return new Date().toISOString().slice(0,10)}
function timeNow(){let d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}

$$('nav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function switchView(v){$$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$$('.view').forEach(x=>x.classList.remove('show'));$('#view-'+v).classList.add('show');render(v);}

function weatherCodeText(code){const m={0:'Derült',1:'Többnyire derült',2:'Részben felhős',3:'Borult',45:'Köd',48:'Zúzmarás köd',51:'Gyenge szitálás',53:'Szitálás',55:'Erős szitálás',61:'Gyenge eső',63:'Eső',65:'Erős eső',71:'Gyenge hó',73:'Hó',75:'Erős hó',80:'Zápor',81:'Zápor',82:'Erős zápor',95:'Zivatar',96:'Zivatar jéggel',99:'Erős zivatar jéggel'};return m[code]||'Időjárás kód: '+code;}
function weatherIcon(code){if([0,1].includes(code))return '☀️'; if([2,3].includes(code))return '⛅'; if([45,48].includes(code))return '🌫️'; if(code>=51&&code<=65)return '🌧️'; if(code>=71&&code<=75)return '❄️'; if(code>=80&&code<=82)return '🌦️'; if(code>=95)return '⛈️'; return '🌤️';}
function directionText(deg){if(deg==null)return '--';const dirs=['É','ÉK','K','DK','D','DNY','NY','ÉNY'];return dirs[Math.round(((deg%360)/45))%8]+` (${Math.round(deg)}°)`;}
function moonPhase(date=new Date()){const lp=2551443,now=date.getTime()/1000,nm=new Date('2001-01-24T13:07:00Z').getTime()/1000,ph=((now-nm)%lp)/lp,names=['Újhold','Növő holdsarló','Első negyed','Növő hold','Telihold','Fogyó hold','Utolsó negyed','Fogyó holdsarló'];return {name:names[Math.floor(ph*8+.5)%8],illumination:Math.round((1-Math.cos(ph*2*Math.PI))/2*100)};}
function nearestIndex(times,t){let trg=new Date(t||Date.now()).getTime(),best=0,d=Infinity;(times||[]).forEach((x,i)=>{let dd=Math.abs(new Date(x).getTime()-trg);if(dd<d){d=dd;best=i}});return best;}
async function getWeather(lat,lon){
  const cur='temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,showers,weather_code,cloud_cover,surface_pressure,pressure_msl,wind_speed_10m,wind_gusts_10m,wind_direction_10m';
  const hourly='temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,precipitation,weather_code,cloud_cover,surface_pressure,pressure_msl,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,is_day';
  const daily='sunrise,sunset,daylight_duration,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max';
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${cur}&hourly=${hourly}&daily=${daily}&forecast_days=3&timezone=auto&wind_speed_unit=kmh&precipitation_unit=mm`;
  const r=await fetch(url); if(!r.ok) throw new Error('weather'); const j=await r.json();
  const h=j.hourly||{}, c=j.current||{}, i=nearestIndex(h.time,c.time);
  const hourlyRows=(h.time||[]).slice(i,i+12).map((t,ix)=>({time:t,temp:h.temperature_2m?.[i+ix],code:h.weather_code?.[i+ix],precipProb:h.precipitation_probability?.[i+ix],wind:h.wind_speed_10m?.[i+ix],windDir:h.wind_direction_10m?.[i+ix],pressure:h.pressure_msl?.[i+ix]}));
  return {provider:'Open-Meteo',lat,lon,timezone:j.timezone,elevation:j.elevation,fetchedAt:new Date().toISOString(),time:c.time,temp:c.temperature_2m,feels:c.apparent_temperature,humidity:c.relative_humidity_2m,precip:c.precipitation,rain:c.rain,showers:c.showers,code:c.weather_code,weatherText:weatherCodeText(c.weather_code),cloud:c.cloud_cover,surfacePressure:c.surface_pressure,pressure:c.pressure_msl,wind:c.wind_speed_10m,gust:c.wind_gusts_10m,windDir:c.wind_direction_10m,precipProb:h.precipitation_probability?.[i]??null,uv:h.uv_index?.[i]??null,isDay:h.is_day?.[i]??null,daily:j.daily||{},hourly:hourlyRows,moon:moonPhase(new Date()),sourceUrl:url};
}
function weatherPanel(w){
  if(!w) return `<div class="weatherBox"><div class="weatherMain"><div class="sun">🌦️</div><div><div class="temp">--°C</div><small>Nincs lekért időjárás</small></div></div><button class="btn blue full" id="weatherBtnInline">Időjárás lekérése</button></div>`;
  return `<div class="weatherBox"><div class="weatherMain"><div class="sun">${weatherIcon(w.code)}</div><div><div class="temp">${w.temp??'--'}°C</div><b>${esc(w.weatherText||'')}</b><br><small>${esc(w.time||'')} · ${esc(w.provider)}</small></div><div class="weatherMetrics"><span>🌡️ Hőérzet <b>${w.feels??'--'}°C</b></span><span>💨 Szél <b>${w.wind??'--'} km/h</b></span><span>🧭 Irány <b>${directionText(w.windDir)}</b></span><span>💧 Pára <b>${w.humidity??'--'}%</b></span><span>📉 Légnyomás <b>${w.pressure??'--'} hPa</b></span><span>☁️ Felhő <b>${w.cloud??'--'}%</b></span><span>🌧️ Csapadék <b>${w.precip??'--'} mm</b></span><span>🌬️ Széllökés <b>${w.gust??'--'} km/h</b></span><span>🔆 UV <b>${w.uv??'--'}</b></span><span>🌙 Hold <b>${w.moon?.name||'--'} ${w.moon?.illumination??'--'}%</b></span></div></div><div class="hourly">${(w.hourly||[]).slice(0,6).map(h=>`<div class="hour"><small>${new Date(h.time).toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})}</small><span class="ico">${weatherIcon(h.code)}</span><b>${h.temp??'--'}°C</b><br><small>${h.wind??'--'} km/h<br>${h.precipProb??'--'}%</small></div>`).join('')}</div></div>`;
}
function weatherSummary(w){return w?`${w.temp}°C, ${w.weatherText}, szél ${w.wind} km/h ${directionText(w.windDir)}, pára ${w.humidity}%, légnyomás ${w.pressure} hPa`:'nincs időjárás';}
function setSideWeather(w){$('#sideWeather').innerHTML=w?`<small>🌦️ Jelenlegi időjárás</small><h2>${w.temp}°C</h2><p>${esc(w.weatherText)}<br>Szél: ${w.wind} km/h<br>Légnyomás: ${w.pressure} hPa<br>Páratartalom: ${w.humidity}%</p>`:`<small>🌦️ Jelenlegi időjárás</small><h2>--°C</h2><p>GPS vagy koordináta után lekérhető.</p>`;}

function renderNew(){
  const waters=allWaters();
  $('#view-new').innerHTML=`<div class="layout"><div class="leftCol">
    <div class="panel"><h2 class="section-title">Új horgászat rögzítése</h2><div class="entry-grid">
      <div><h3>Alap adatok</h3>
        <div class="form-row"><label>Dátum</label><input id="date" type="date" value="${todayISO()}"></div>
        <div class="form-row"><label>Idő</label><input id="time" type="time" value="${timeNow()}"></div>
        <div class="form-row"><label>Helyszín</label><select id="waterSelect"><option value="">Válassz...</option>${waters.map(w=>`<option value="${esc(w.name)}">${esc(w.name)}</option>`).join('')}</select></div>
        <button class="btn primary" id="gpsBtn">GPS lekérése</button><p class="coords" id="coordText">Koordináta: nincs</p>
        <input id="coords" placeholder="47.2487, 18.6208" style="margin-bottom:10px">
        <div class="form-row"><label>Módszer</label><select id="method"><option value="">Válassz módszert...</option>${state.methods.map(m=>`<option>${esc(m.name)}</option>`).join('')}</select></div>
        <label class="field">Megjegyzés<textarea id="note" placeholder="Reggel óta aktívak a halak..."></textarea></label>
      </div>
      <div><h3>Időjárás (a nap folyamán)</h3><div id="weatherHere">${weatherPanel(draft.weather)}</div><button class="btn blue full" id="weatherBtn">Időjárás lekérése koordinátához</button></div>
      <div><h3>Vízállapot</h3>
        <label class="field">Víz hőmérséklet <input id="waterTemp" type="number" step="0.1" placeholder="16.5"></label>
        <label class="field">Víz színe <select id="waterColor"><option>Átlátszó</option><option>Enyhén zavaros</option><option>Zavaros</option><option>Erősen zavaros</option></select></label>
        <label class="field">Víz szintje <select id="waterLevel"><option>Alacsony</option><option selected>Átlagos</option><option>Magas</option><option>Áradó</option><option>Apadó</option></select></label>
        <label class="field">Szél erősség <select id="windFeel"><option>Szélcsend</option><option selected>Gyenge</option><option>Közepes</option><option>Erős</option></select></label>
        <label class="field">Áramlás <select id="current"><option>Nincs</option><option>Gyenge</option><option>Közepes</option><option>Erős</option></select></label>
      </div>
    </div></div>
    <div class="panel"><div class="entry-grid">
      ${pickBlock('Csali kiválasztása','baits',state.baits)}
      ${pickBlock('Horog kiválasztása','hooks',state.hooks)}
      <div><h3>Egyéb felszerelés</h3>
        <label class="field"><input type="checkbox" id="leaderOn"> Előkezsinór <select id="leader"><option>0.20 mm fluorocarbon</option><option>0.18 mm fluorocarbon</option><option>0.22 mm monofil</option></select></label>
        <label class="field"><input type="checkbox" id="mainLineOn"> Főzsinór <select id="mainLine"><option>0.25 mm monofil</option><option>0.22 mm fonott</option><option>0.28 mm monofil</option></select></label>
        <label class="field"><input type="checkbox" id="weightOn"> Ólom / kosár <select id="weight"><option>30 g method kosár</option><option>40 g method kosár</option><option>60 g feeder kosár</option></select></label>
        <label class="field"><input type="checkbox" id="feedOn"> Etetőanyag <select id="feedSelect">${state.feeds.map(f=>`<option>${esc(f.name)}</option>`).join('')}</select></label>
        <div class="tagRow"><span class="tag">Method kosár</span><span class="tag">Gyorskapocs</span><span class="tag">Gubancgátló</span></div>
      </div>
    </div></div>
    <div class="panel"><div class="entry-grid">
      <div><h3>Kiválasztott csalik</h3><div id="selBaits" class="tagRow"></div></div>
      <div><h3>Kiválasztott horgok</h3><div id="selHooks" class="tagRow"></div></div>
      <div><h3>Fogás fotók</h3><input id="tripPhotos" type="file" accept="image/*" multiple><div id="photoPrev" class="gallery"><div class="addPhoto">+<br>Kép hozzáadása</div></div></div>
    </div></div>
    <div class="panel"><h3>Saját vízterület hozzáadása</h3><div class="entry-grid"><label class="field">Név<input id="customWaterName"></label><label class="field">Kép<input id="customWaterPhoto" type="file" accept="image/*"></label><button class="btn primary" id="addCustomWater">Saját hely mentése</button></div></div>
    <div style="display:flex;gap:12px;justify-content:flex-end"><button class="btn" id="cancelBtn">Mégsem</button><button class="btn primary" id="saveLog">Mentés</button></div>
  </div><aside class="rightCol">
    <div class="panel rightList"><h3>Naplóim</h3>${(state.logs||[]).slice(0,3).map(logMini).join('') || '<p>Még nincs mentett napló.</p>'}<button class="btn full" onclick="switchView('logs')">További naplók betöltése</button></div>
    <div class="panel"><h3>Statisztikák</h3>${statCards()}</div>
    <div class="panel"><h3>Adatbázis – csalik</h3><div class="dbCards">${state.baits.slice(0,4).map(i=>miniCard(i,'')).join('')}</div><p><small>Csalik, etetőanyagok, horgok és módszerek külön menüpontban bővíthetők.</small></p></div>
  </aside></div>
  <div class="footerStrip"><div>📍 GPS alapú helymeghatározás</div><div>🌦️ Időjárás órás bontással</div><div>🗄️ Szerkeszthető adatbázis</div><div>📷 Saját fogásfotók</div><div>📒 Napló visszanézés</div><div>☁️ JSON export/import</div></div>`;
  bindNew();
}
function pickBlock(title,key,items){return `<div><h3>${title}</h3><input class="search" placeholder="Keresés..." data-search="pick-${key}"><div class="miniGrid" id="pick-${key}">${items.map(i=>miniCard(i,key)).join('')}</div></div>`;}
function miniCard(i,key){return `<div class="miniCard" data-key="${key}" data-name="${esc(i.name)}"><img src="${i.img}"><b>${esc(i.name)}</b><small>${esc(i.category||i.size||'')}</small></div>`;}
function logMini(l){return `<div class="listItem"><img src="${(l.photos&&l.photos[0])||l.waterImg||'assets/waters/csatorna.webp'}"><div><b>${esc(l.date)} – ${esc(l.water)}</b><br><small>${esc(l.method||'')} · ${l.photos?.length||0} kép<br>${esc(l.weather?l.weather.temp+'°C':'nincs időjárás')}</small></div><button onclick="showLog(${l.id})">›</button></div>`;}
function statCards(){const logs=state.logs||[];return `<div class="statCards"><div class="statCard"><small>Összes horgászat</small><br><b>${logs.length}</b></div><div class="statCard"><small>Mentett kép</small><br><b>${logs.reduce((a,l)=>a+(l.photos?.length||0),0)}</b></div><div class="statCard"><small>Módszer</small><br><b>${new Set(logs.map(l=>l.method).filter(Boolean)).size}</b></div></div>`;}
function bindNew(){
  $('#waterSelect').onchange=e=>{const w=allWaters().find(x=>x.name===e.target.value); if(w){draft.water=w.name;draft.waterImg=w.img; if(w.lat&&w.lon){$('#coords').value=`${w.lat}, ${w.lon}`;$('#coordText').textContent='Koordináta: '+$('#coords').value;}}};
  $('#coords').oninput=e=>{$('#coordText').textContent='Koordináta: '+(e.target.value||'nincs')};
  $('#gpsBtn').onclick=()=>{ if(!navigator.geolocation) return alert('A böngésző nem támogatja a GPS-t.'); navigator.geolocation.getCurrentPosition(pos=>{const v=`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;$('#coords').value=v;$('#coordText').textContent='Koordináta: '+v;},()=>alert('Nem sikerült GPS pozíciót kérni. Engedélyezd a helymeghatározást.')); };
  async function loadW(){const c=parseCoords($('#coords').value); if(!c)return alert('Adj meg koordinátát vagy kérd le GPS-sel.'); try{draft.weather=await getWeather(c.lat,c.lon);$('#weatherHere').innerHTML=weatherPanel(draft.weather);setSideWeather(draft.weather);}catch(e){alert('Az időjárás lekérése nem sikerült. Internet kell hozzá.');}}
  $('#weatherBtn').onclick=loadW;
  document.addEventListener('click', e=>{ if(e.target && e.target.id==='weatherBtnInline') loadW(); }, {once:true});
  $$('.miniCard[data-key]').forEach(c=>c.onclick=()=>{const k=c.dataset.key,n=c.dataset.name;if(!k)return;c.classList.toggle('selected');const arr=draft[k]; if(c.classList.contains('selected')) arr.push(n); else {let i=arr.indexOf(n); if(i>=0)arr.splice(i,1);} updateSelections();});
  $$('[data-search]').forEach(inp=>inp.oninput=()=>filterCards('#'+inp.dataset.search, inp.value));
  $('#tripPhotos').onchange=async e=>{draft.photos=[];for(const f of e.target.files) draft.photos.push(await fileToData(f)); $('#photoPrev').innerHTML=draft.photos.map(p=>`<img src="${p}">`).join('')+'<div class="addPhoto">+<br>Kép hozzáadása</div>';};
  $('#addCustomWater').onclick=async()=>{const name=$('#customWaterName').value.trim(); if(!name)return alert('Adj nevet a saját helynek.'); const f=$('#customWaterPhoto').files[0]; const img=f?await fileToData(f):'assets/waters/csatorna.webp'; const c=parseCoords($('#coords').value)||{}; state.customWaters.push({name,img,lat:c.lat||'',lon:c.lon||''}); save(); alert('Saját hely mentve.'); renderNew();};
  $('#saveLog').onclick=()=>{const equipment={leader:$('#leaderOn').checked?$('#leader').value:'',mainLine:$('#mainLineOn').checked?$('#mainLine').value:'',weight:$('#weightOn').checked?$('#weight').value:'',feed:$('#feedOn').checked?$('#feedSelect').value:''}; const log={id:Date.now(),date:$('#date').value,time:$('#time').value,water:draft.water||$('#waterSelect').value||$('#customWaterName').value||'Nincs megadva',waterImg:draft.waterImg||findWaterImg(draft.water||$('#waterSelect').value),coords:$('#coords').value,method:$('#method').value,note:$('#note').value,weather:draft.weather,waterState:{temp:$('#waterTemp').value,color:$('#waterColor').value,level:$('#waterLevel').value,windFeel:$('#windFeel').value,current:$('#current').value},baits:[...draft.baits],hooks:[...draft.hooks],feeds:equipment.feed?[equipment.feed]:[],equipment,photos:[...draft.photos]}; state.logs.unshift(log); save(); draft=freshDraft(); switchView('logs');};
  $('#cancelBtn').onclick=()=>{draft=freshDraft();renderNew();};
}
function updateSelections(){ $('#selBaits').innerHTML=draft.baits.map(x=>`<span class="tag">${esc(x)}</span>`).join('')||'<small>Nincs kiválasztva</small>'; $('#selHooks').innerHTML=draft.hooks.map(x=>`<span class="tag">${esc(x)}</span>`).join('')||'<small>Nincs kiválasztva</small>'; }
function filterCards(sel,q){q=(q||'').toLowerCase();$$(sel+' [data-name]').forEach(c=>c.style.display=c.dataset.name.toLowerCase().includes(q)?'':'none');}
function findWaterImg(n){let w=allWaters().find(x=>x.name===n);return w?w.img:'assets/waters/csatorna.webp';}

function renderLogs(){const logs=state.logs||[];$('#view-logs').innerHTML=`<div class="panel"><h2>Naplóim</h2>${logs.length?'':'<p>Még nincs mentett horgászat.</p>'}<div class="listFull">${logs.map(l=>`<div class="row"><img src="${(l.photos&&l.photos[0])||l.waterImg||findWaterImg(l.water)}"><div><b>${esc(l.date)} ${esc(l.time)} – ${esc(l.water)}</b><br><small>${esc(l.method||'nincs módszer')} · ${esc(l.coords||'nincs GPS')}</small><br><small>${esc(weatherSummary(l.weather))}</small></div><div><button class="btn primary" onclick="showLog(${l.id})">Megnyitás</button><button class="btn danger" onclick="deleteLog(${l.id})">Törlés</button></div></div>`).join('')}</div></div>`;}
function showLog(id){const l=state.logs.find(x=>x.id===id); if(!l)return; modal(`<h2>${esc(l.date)} ${esc(l.time)} – ${esc(l.water)}</h2><p><b>Módszer:</b> ${esc(l.method||'')}</p><p><b>Koordináta:</b> ${esc(l.coords||'')}</p><h3>Mentéskori időjárás</h3>${weatherPanel(l.weather)}<h3>Vízállapot</h3><p>${esc(Object.entries(l.waterState||{}).map(([k,v])=>k+': '+v).join(' · '))}</p><h3>Felszerelés</h3><p><b>Csalik:</b> ${esc((l.baits||[]).join(', '))}</p><p><b>Horgok:</b> ${esc((l.hooks||[]).join(', '))}</p><p><b>Etetőanyag:</b> ${esc((l.feeds||[]).join(', '))}</p><p><b>Egyéb:</b> ${esc(Object.values(l.equipment||{}).filter(Boolean).join(', '))}</p><h3>Megjegyzés</h3><p>${esc(l.note||'')}</p><h3>Képek</h3><div class="gallery">${(l.photos||[]).map(p=>`<img src="${p}">`).join('')||'<p>Nincs kép.</p>'}</div>`);}
function deleteLog(id){if(confirm('Törlöd ezt a naplót?')){state.logs=state.logs.filter(l=>l.id!==id);save();renderLogs();}}

function imgCard(item,type){return `<div class="imgCard" data-name="${esc(item.name)}"><img src="${item.img}"><span class="badge">${type==='fish'?'🐟':'🎣'}</span><div class="txt"><b>${esc(item.name)}</b><i>${esc(item.latin||item.category||'')}</i></div></div>`;}
function renderWaters(){const all=allWaters();$('#view-waters').innerHTML=`<div class="panel"><h2>Helyszínek / vízterületek</h2><p>A vízterületek az új naplóban választhatók ki. Saját helyet az Új bejegyzés képernyőn tudsz felvenni képpel és koordinátával.</p><input class="search" id="waterSearch" placeholder="Keresés"><div class="cardGrid" id="waterGrid">${all.map(w=>imgCard(w,'water')).join('')}</div></div>`;$('#waterSearch').oninput=e=>filterCards('#waterGrid',e.target.value);}
function renderFish(){ $('#view-fish').innerHTML=`<div class="panel"><h2>Halfajok tudásbázis</h2><p>Itt a halfajok kártyái és a fontos adatok látszanak. Az Új bejegyzés képernyőben szándékosan nincs halfajválasztó.</p><input class="search" id="fishSearch" placeholder="Keresés"><div class="cardGrid" id="fishGrid">${FISH_DATA.map(f=>imgCard(f,'fish')).join('')}</div></div>`;$('#fishSearch').oninput=e=>filterCards('#fishGrid',e.target.value);$('#fishGrid').onclick=e=>{const c=e.target.closest('.imgCard');if(!c)return;const f=FISH_DATA.find(x=>x.name===c.dataset.name);modal(`<h2>${esc(f.name)}</h2><img src="${f.img}"><p><i>${esc(f.latin)}</i></p><p>${banPill(f)}</p><div class="statCards"><div class="statCard"><small>Tilalmi idő</small><br><b>${esc(f.ban||'nincs adat')}</b></div><div class="statCard"><small>Méret</small><br><b>${esc(f.size||'nincs adat')}</b></div><div class="statCard"><small>Állapot</small><br><b>${isBanNow(f)?'Tilalom alatt':'Nem jelzett tilalom'}</b></div></div><p>${esc(f.info||'')}</p><p><small>Mindig ellenőrizd az adott víz helyi horgászrendjét is.</small></p>`);};}
function isBanNow(f,date=new Date()){const b=f.ban||'';const m=b.match(/(\d{2})[.\-](\d{2}).*?(\d{2})[.\-](\d{2})/); if(!m)return false; const y=date.getFullYear(),start=new Date(y,+m[1]-1,+m[2]),end=new Date(y,+m[3]-1,+m[4],23,59,59); return date>=start&&date<=end;}
function banPill(f){return `<span class="pill ${isBanNow(f)?'red':'green'}">${isBanNow(f)?'Most tilalom alatt':'Jelenleg nincs jelzett tilalom'}</span>`;}
function renderBans(){const banned=FISH_DATA.filter(f=>isBanNow(f));$('#view-bans').innerHTML=`<div class="panel ${banned.length?'banNow':'banOk'}"><h2>Aktuális tilalmak</h2><p>A lista a beépített halfaj-adatbázisban szereplő fajlagos tilalmi időkből számol. Helyi szabályok eltérhetnek.</p>${banned.length?`<div class="listFull">${banned.map(f=>`<div class="row"><img src="${f.img}"><div><b>${esc(f.name)}</b><br><small><i>${esc(f.latin)}</i></small><br>Tilalom: ${esc(f.ban)} · Méret: ${esc(f.size)}</div><span class="pill red">tilalom</span></div>`).join('')}</div>`:'<h3>Ma nincs jelzett fajlagos tilalom a beépített listában.</h3>'}</div>`;}

function renderManage(key,title){const items=state[key]||[];$('#view-'+key).innerHTML=`<div class="panel"><h2>${title} adatbázis</h2><div class="manageGrid"><div><label class="field">Név<input id="mName"></label><label class="field">Kategória / méret<input id="mCat"></label><label class="field">Megjegyzés<textarea id="mNote"></textarea></label><label class="field">Kép<input id="mImg" type="file" accept="image/*"></label><button class="btn primary full" id="mAdd">Hozzáadás</button></div><div><input class="search" id="mSearch" placeholder="Keresés"><div class="miniGrid" id="mGrid">${items.map((i,idx)=>`<div class="miniCard" data-name="${esc(i.name)}"><img src="${i.img}"><b>${esc(i.name)}</b><small>${esc(i.category||i.size||'')}</small><p>${esc(i.note||'')}</p><button class="btn danger" onclick="deleteItem('${key}',${idx})">Törlés</button></div>`).join('')}</div></div></div></div>`;$('#mSearch').oninput=e=>filterCards('#mGrid',e.target.value);$('#mAdd').onclick=async()=>{const name=$('#mName').value.trim();if(!name)return alert('Adj nevet.');const f=$('#mImg').files[0];const img=f?await fileToData(f):(key==='hooks'?'assets/fish/ponty.webp':'assets/waters/intenziv-viz.webp');state[key].push({name,category:$('#mCat').value,note:$('#mNote').value,img});save();renderManage(key,title);};}
function deleteItem(key,idx){if(confirm('Törlöd?')){state[key].splice(idx,1);save();renderManage(key,{baits:'Csalik',feeds:'Etetőanyagok',hooks:'Horgok',methods:'Módszerek'}[key]);}}
function renderStats(){const logs=state.logs||[], meth={};logs.forEach(l=>{if(l.method)meth[l.method]=(meth[l.method]||0)+1});$('#view-stats').innerHTML=`<div class="panel"><h2>Statisztikák</h2>${statCards()}</div><div class="panel"><h3>Módszerek megoszlása</h3>${bars(Object.entries(meth))}</div>`;}
function bars(arr){if(!arr.length)return '<p>Nincs adat.</p>';const max=Math.max(...arr.map(x=>x[1]));return arr.sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="bar"><span>${esc(n)}</span><div><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join('');}
function renderData(){ $('#view-data').innerHTML=`<div class="panel"><h2>Export / Import</h2><p>Az adatok a telefon böngészőjében mentődnek. Exportáld JSON-be, hogy később vissza tudd tölteni.</p><button class="btn primary" id="exportBtn">JSON export</button><label class="field">JSON import<input id="importFile" type="file" accept="application/json"></label><textarea rows="12" style="width:100%">${esc(JSON.stringify(state,null,2))}</textarea></div>`;$('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='horgasz-naplo-mentes.json';a.click();};$('#importFile').onchange=e=>{const f=e.target.files[0];const fr=new FileReader();fr.onload=()=>{state=JSON.parse(fr.result);save();alert('Betöltve.');switchView('logs');};fr.readAsText(f);};}
function modal(html){if(!$('#modal'))document.body.insertAdjacentHTML('beforeend','<div class="modal" id="modal"><div class="modalBox"><button class="btn" onclick="$(\'#modal\').classList.remove(\'show\')">Bezárás</button><div id="modalBody"></div></div></div>');$('#modalBody').innerHTML=html;$('#modal').classList.add('show');}
function render(v){({new:renderNew,logs:renderLogs,waters:renderWaters,baits:()=>renderManage('baits','Csalik'),feeds:()=>renderManage('feeds','Etetőanyagok'),hooks:()=>renderManage('hooks','Horgok'),methods:()=>renderManage('methods','Módszerek'),fish:renderFish,bans:renderBans,stats:renderStats,data:renderData}[v]||renderNew)();}

switchView('new');
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
