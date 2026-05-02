const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const STORE = 'horgasz_naplo_pro_mobile_v1';

const labels = {
  baits: 'Csalik', hooks: 'Horgok', lines: 'Zsinórok', groundbaits: 'Etetőanyagok',
  methods: 'Módszerek', accessories: 'Egyéb felszerelés'
};

let state = loadState();
let currentView = 'newLog';
let draft = emptyDraft();
let selectedDb = 'baits';
let currentWeather = null;
let currentLocationName = '';

function loadState(){
  const saved = localStorage.getItem(STORE);
  const base = saved ? JSON.parse(saved) : structuredClone(SEED_DATA);
  base.logs ||= [];
  base.db ||= {};
  Object.keys(labels).forEach(k => base.db[k] ||= []);
  base.waters ||= [];
  base.fish ||= [];
  return base;
}
function saveState(){ localStorage.setItem(STORE, JSON.stringify(state)); }
function esc(v){return (v ?? '').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function uid(prefix){return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,7)}
function fileData(file){return new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});}
function imgFallback(){return 'assets/items/placeholder.svg'}
function wIcon(c){ if([0,1].includes(c))return'☀️'; if([2,3].includes(c))return'⛅'; if(c>=51&&c<70)return'🌧️'; if(c>=71)return'❄️'; return'☁️'; }
function dir(d){return ['É','ÉK','K','DK','D','DNy','Ny','ÉNy'][Math.round((d||0)/45)%8]}
function findDb(kind,id){return state.db[kind]?.find(x=>x.id===id)}
function findWater(id){return state.waters.find(x=>x.id===id)}
function findFish(id){return state.fish.find(x=>x.id===id)}
function sum(arr, fn){return arr.reduce((a,x)=>a+(Number(fn(x))||0),0)}
function formatKg(v){return (Math.round((Number(v)||0)*100)/100).toString()}
function emptyDraft(){
  const now = new Date();
  return { id:null, date: now.toISOString().slice(0,10), time: now.toTimeString().slice(0,5), water:'', lat:'', lon:'', locality:'', method:'', note:'',
    waterState:{temp:'', color:'Enyhén zavaros', level:'Átlagos', wind:'Gyenge', flow:'Nincs'}, bait:'', hook:'', mainLine:'', leaderLine:'', groundbait:'', accessory:'', catches:[], photos:[], weather:null };
}

function init(){
  bindNav();
  show('newLog');
  renderRightRail();
  $('#quickSave').onclick = () => saveLog();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
function bindNav(){
  $$('.nav-btn').forEach(btn => btn.onclick = () => show(btn.dataset.view));
}
function show(view){
  currentView = view;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const map = { newLog: renderNewLog, logs: renderLogs, catches: renderCatches, locations: renderLocations, stats: renderStats, gear: renderGear, database: renderDatabase, settings: renderSettings, backup: renderBackup };
  (map[view] || renderNewLog)();
  renderRightRail();
  window.scrollTo({top:0, behavior:'smooth'});
}

function renderNewLog(){
  const c = $('#content');
  c.innerHTML = `
    <section class="panel">
      <h2 class="section-title">Új horgászat rögzítése</h2>
      <div class="grid-3">
        <div>
          <div class="field"><label>Dátum</label><input id="date" type="date" value="${esc(draft.date)}"></div>
          <div class="field"><label>Idő</label><input id="time" type="time" value="${esc(draft.time)}"></div>
          <div class="field"><label>Helyszín / tó</label><select id="water">${waterOptions(draft.water)}</select></div>
          <div class="toolbar"><button class="primary" id="gpsBtn">GPS lekérése</button><button class="secondary" id="weatherBtn">Időjárás koordinátából</button></div>
          <div class="status-line" id="gpsLine">${draft.lat ? `📍 ${esc(draft.lat)}, ${esc(draft.lon)} ${draft.locality ? ' – ' + esc(draft.locality) : ''}` : 'GPS még nincs lekérve.'}</div>
          <div class="grid-2"><div class="field"><label>Szélesség</label><input id="lat" value="${esc(draft.lat)}"></div><div class="field"><label>Hosszúság</label><input id="lon" value="${esc(draft.lon)}"></div></div>
          <div class="field"><label>Módszer</label><select id="method">${dbOptions('methods', draft.method, 'Módszer kiválasztása')}</select></div>
          <div class="field"><label>Megjegyzés</label><textarea id="note">${esc(draft.note)}</textarea></div>
        </div>
        <div>
          <h3 class="section-title">Időjárás</h3>
          <div id="weatherBox">${weatherMarkup(draft.weather || currentWeather)}</div>
        </div>
        <div>
          <h3 class="section-title">Vízállapot</h3>
          <div class="field"><label>Víz hőmérséklet</label><input id="waterTemp" value="${esc(draft.waterState.temp)}" placeholder="pl. 16.5 °C"></div>
          <div class="field"><label>Víz színe</label><select id="waterColor">${simpleOptions(['Tiszta','Enyhén zavaros','Zavaros','Algás'], draft.waterState.color)}</select></div>
          <div class="field"><label>Vízszint</label><select id="waterLevel">${simpleOptions(['Alacsony','Átlagos','Magas','Áradó','Apadó'], draft.waterState.level)}</select></div>
          <div class="field"><label>Szél erősség</label><select id="waterWind">${simpleOptions(['Szélcsend','Gyenge','Közepes','Erős'], draft.waterState.wind)}</select></div>
          <div class="field"><label>Áramlás</label><select id="flow">${simpleOptions(['Nincs','Gyenge','Közepes','Erős'], draft.waterState.flow)}</select></div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="grid-3">
        <div><h3 class="section-title">Csali kiválasztása</h3><input id="baitSearch" placeholder="Keresés csalik között..."><div id="baitPick" class="picker-grid"></div></div>
        <div><h3 class="section-title">Horog kiválasztása</h3><input id="hookSearch" placeholder="Keresés horgok között..."><div id="hookPick" class="picker-grid"></div></div>
        <div>
          <h3 class="section-title">Egyéb felszerelés</h3>
          <div class="field"><label>Előkezsinór</label><select id="leaderLine">${dbOptions('lines', draft.leaderLine, 'Előkezsinór')}</select></div>
          <div class="field"><label>Főzsinór</label><select id="mainLine">${dbOptions('lines', draft.mainLine, 'Főzsinór')}</select></div>
          <div class="field"><label>Etetőanyag</label><select id="groundbait">${dbOptions('groundbaits', draft.groundbait, 'Etetőanyag')}</select></div>
          <div class="field"><label>Egyéb aprócikk</label><select id="accessory">${dbOptions('accessories', draft.accessory, 'Kiegészítő')}</select></div>
          <p><span class="pill">Method kosár</span> <span class="pill">Gyorskapocs</span> <span class="pill">Gubancgátló</span></p>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="grid-2">
        <div>
          <h3 class="section-title">Fogás adatai</h3>
          <div class="grid-2"><div class="field"><label>Halfaj</label><select id="catchFish">${fishOptions()}</select></div><div class="field"><label>Darab</label><input id="catchCount" type="number" min="1" value="1"></div></div>
          <div class="grid-2"><div class="field"><label>Súly (kg)</label><input id="catchWeight" type="number" step="0.01"></div><div class="field"><label>Hossz (cm)</label><input id="catchLength" type="number" step="1"></div></div>
          <button class="primary" id="addCatch">+ Fogás hozzáadása</button>
        </div>
        <div><h3 class="section-title">Rögzített fogások</h3><div id="catchList">${catchTable()}</div></div>
      </div>
    </section>

    <section class="panel">
      <h3 class="section-title">Képek</h3>
      <input id="photos" type="file" accept="image/*" multiple>
      <div id="photoPreview" class="photo-grid">${draft.photos.map(p=>`<img src="${p}" alt="Horgászat képe">`).join('')}</div>
    </section>

    <section class="panel toolbar">
      <button class="secondary" id="cancelDraft">Mégsem</button>
      <button class="primary" id="saveLog">Mentés</button>
    </section>`;

  bindDraftInputs();
  renderPicker('baits','baitPick','baitSearch','bait');
  renderPicker('hooks','hookPick','hookSearch','hook');
}
function simpleOptions(arr, value){return arr.map(x=>`<option ${x===value?'selected':''}>${esc(x)}</option>`).join('')}
function waterOptions(value){return `<option value="">Helyszín kiválasztása</option>` + state.waters.map(w=>`<option value="${w.id}" ${w.id===value?'selected':''}>${esc(w.name)}</option>`).join('')}
function dbOptions(kind, value, ph){return `<option value="">${ph}</option>` + (state.db[kind]||[]).map(x=>`<option value="${x.id}" ${x.id===value?'selected':''}>${esc(x.name)}</option>`).join('')}
function fishOptions(){return `<option value="">Halfaj</option>` + state.fish.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}
function bindDraftInputs(){
  ['date','time','water','lat','lon','method','note','waterTemp','waterColor','waterLevel','waterWind','flow','leaderLine','mainLine','groundbait','accessory'].forEach(id=>{
    const el = $('#'+id); if(!el) return;
    el.oninput = el.onchange = () => pullDraft();
  });
  $('#gpsBtn').onclick = getGPS;
  $('#weatherBtn').onclick = () => {pullDraft(); fetchWeatherAndLocation(parseFloat(draft.lat), parseFloat(draft.lon));};
  $('#addCatch').onclick = addCatch;
  $('#photos').onchange = async () => { for (const f of $('#photos').files) draft.photos.push(await fileData(f)); renderNewLog(); };
  $('#saveLog').onclick = saveLog;
  $('#cancelDraft').onclick = () => { if(confirm('Törlöd a jelenlegi űrlapot?')){ draft = emptyDraft(); currentWeather=null; currentLocationName=''; renderNewLog(); }};
}
function pullDraft(){
  draft.date=$('#date')?.value||draft.date; draft.time=$('#time')?.value||draft.time; draft.water=$('#water')?.value||'';
  draft.lat=$('#lat')?.value||''; draft.lon=$('#lon')?.value||''; draft.method=$('#method')?.value||''; draft.note=$('#note')?.value||'';
  draft.waterState={ temp:$('#waterTemp')?.value||'', color:$('#waterColor')?.value||'', level:$('#waterLevel')?.value||'', wind:$('#waterWind')?.value||'', flow:$('#flow')?.value||'' };
  draft.leaderLine=$('#leaderLine')?.value||''; draft.mainLine=$('#mainLine')?.value||''; draft.groundbait=$('#groundbait')?.value||''; draft.accessory=$('#accessory')?.value||'';
}
function renderPicker(kind, boxId, searchId, draftKey){
  const draw = () => {
    const q = ($('#'+searchId).value||'').toLowerCase();
    $('#'+boxId).innerHTML = (state.db[kind]||[]).filter(x => `${x.name} ${x.category||''} ${x.note||''}`.toLowerCase().includes(q)).slice(0,30).map(x=>`
      <article class="item-card ${draft[draftKey]===x.id?'selected':''}" data-id="${x.id}">
        <img src="${x.image||imgFallback()}" alt="${esc(x.name)}"><div class="body"><strong>${esc(x.name)}</strong><small>${esc(x.category||'')}</small></div>
      </article>`).join('') || '<div class="empty">Nincs találat.</div>';
    $$('#'+boxId+' .item-card').forEach(card => card.onclick = () => {draft[draftKey]=card.dataset.id; draw();});
  };
  $('#'+searchId).oninput = draw; draw();
}
function addCatch(){
  pullDraft();
  const fish = $('#catchFish').value;
  if(!fish) return alert('Válassz halfajt.');
  draft.catches.push({id:uid('catch'), fish, count:$('#catchCount').value||1, weight:$('#catchWeight').value||'', length:$('#catchLength').value||''});
  renderNewLog();
}
function catchTable(){
  if(!draft.catches.length) return '<div class="empty">Még nincs hozzáadott fogás.</div>';
  return `<table class="catch-table"><thead><tr><th>Halfaj</th><th>Db</th><th>Súly</th><th>Hossz</th><th></th></tr></thead><tbody>${draft.catches.map(c=>`<tr><td>${esc(findFish(c.fish)?.name||'')}</td><td>${esc(c.count)}</td><td>${esc(c.weight)} kg</td><td>${esc(c.length)} cm</td><td><button class="danger" onclick="removeCatch('${c.id}')">×</button></td></tr>`).join('')}</tbody></table>`;
}
function removeCatch(id){draft.catches=draft.catches.filter(c=>c.id!==id); renderNewLog();}

async function getGPS(){
  if(!navigator.geolocation) return alert('A böngésző nem támogatja a GPS lekérést.');
  navigator.geolocation.getCurrentPosition(async pos=>{
    draft.lat = pos.coords.latitude.toFixed(6); draft.lon = pos.coords.longitude.toFixed(6);
    $('#lat').value = draft.lat; $('#lon').value = draft.lon;
    $('#gpsLine').textContent = `📍 ${draft.lat}, ${draft.lon} – helyszín keresése...`;
    await fetchWeatherAndLocation(Number(draft.lat), Number(draft.lon));
  }, err=>alert('GPS engedély szükséges: '+err.message), {enableHighAccuracy:true,timeout:15000});
}
async function fetchWeatherAndLocation(lat,lon){
  if(Number.isNaN(lat)||Number.isNaN(lon)) return alert('Hiányzó vagy hibás koordináta.');
  await Promise.allSettled([fetchWeather(lat,lon), fetchLocation(lat,lon)]);
  draft.weather = currentWeather; draft.locality = currentLocationName;
  $('#gpsLine').textContent = `📍 ${draft.lat}, ${draft.lon}${draft.locality ? ' – ' + draft.locality : ''}`;
  $('#weatherBox').innerHTML = weatherMarkup(draft.weather);
  renderSideWeather();
}
async function fetchWeather(lat,lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code&forecast_days=1&timezone=auto`;
  const r = await fetch(url); currentWeather = await r.json();
}
async function fetchLocation(lat,lon){
  const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=hu`);
  const d = await r.json(); currentLocationName = d.locality || d.city || d.principalSubdivision || '';
}
function weatherMarkup(w){
  if(!w) return '<div class="empty">Még nincs lekért időjárás.</div>';
  const c=w.current,h=w.hourly;
  return `<div class="weather-card"><div class="weather-icon">${wIcon(c.weather_code)}</div><div><div class="weather-temp">${c.temperature_2m}°C</div><strong>Hőérzet: ${c.apparent_temperature}°C</strong></div></div>
    <div class="kpi-grid"><div class="kpi"><small>Szél</small><b>${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}</b></div><div class="kpi"><small>Páratartalom</small><b>${c.relative_humidity_2m}%</b></div><div class="kpi"><small>Légnyomás</small><b>${c.pressure_msl} hPa</b></div><div class="kpi"><small>Csapadék</small><b>${c.precipitation} mm</b></div><div class="kpi"><small>Felhőzet</small><b>${c.cloud_cover}%</b></div><div class="kpi"><small>Lökés</small><b>${c.wind_gusts_10m} km/h</b></div></div>
    <h4>Óránként</h4><div class="hourly">${h.time.slice(0,8).map((t,i)=>`<div class="hour"><b>${t.slice(11,16)}</b><div>${wIcon(h.weather_code[i])}</div><small>${h.temperature_2m[i]}°C</small></div>`).join('')}</div>`;
}
function renderSideWeather(){
  const w = currentWeather || draft.weather;
  $('#sideWeather').innerHTML = w ? `<small>${esc(draft.locality || 'Jelenlegi hely')}</small><div class="weather-card"><div class="weather-icon">${wIcon(w.current.weather_code)}</div><div><strong>${w.current.temperature_2m}°C</strong><br><span>${w.current.wind_speed_10m} km/h ${dir(w.current.wind_direction_10m)}</span><br><span>${w.current.pressure_msl} hPa</span></div></div>` : '<small>Jelenlegi időjárás</small><strong>GPS után töltődik</strong>';
}

function saveLog(){
  pullDraft();
  if(!draft.date || !draft.water) return alert('A dátum és helyszín kötelező.');
  const obj = structuredClone(draft); obj.id = obj.id || uid('log'); obj.createdAt = obj.createdAt || new Date().toISOString(); obj.updatedAt = new Date().toISOString();
  const i = state.logs.findIndex(l=>l.id===obj.id); if(i>=0) state.logs[i]=obj; else state.logs.unshift(obj);
  saveState(); draft=emptyDraft(); currentWeather=null; currentLocationName=''; show('logs');
}

function renderLogs(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Naplóim</h2>${state.logs.length ? state.logs.map(logCard).join('') : '<div class="empty">Még nincs mentett napló.</div>'}</section>`;
}
function logCard(l){
  const water=findWater(l.water), temp=l.weather?.current?.temperature_2m, count=sum(l.catches||[],c=>c.count), weight=sum(l.catches||[],c=>c.weight);
  return `<article class="log-card"><img src="${l.photos?.[0] || water?.image || 'assets/header.jpg'}" alt="${esc(water?.name||'Helyszín')}"><div><h3>${esc(l.date)} – ${esc(water?.name||'Helyszín')}</h3><p>${esc(l.locality||'')} ${temp!==undefined ? ' • '+temp+'°C' : ''}</p><p>${count} db hal, ${formatKg(weight)} kg</p></div><button class="secondary" onclick="openLog('${l.id}')">Megnyitás</button></article>`;
}
function openLog(id){
  const l=state.logs.find(x=>x.id===id), water=findWater(l.water);
  $('#modalBody').innerHTML = `<h2>${esc(l.date)} ${esc(l.time)} – ${esc(water?.name||'')}</h2><p><b>GPS:</b> ${esc(l.lat)}, ${esc(l.lon)} ${l.locality ? ' – '+esc(l.locality) : ''}</p><p><b>Módszer:</b> ${esc(findDb('methods',l.method)?.name||'')}</p><p><b>Csali:</b> ${esc(findDb('baits',l.bait)?.name||'')}<br><b>Horog:</b> ${esc(findDb('hooks',l.hook)?.name||'')}</p><p>${esc(l.note||'')}</p><h3>Fogások</h3>${logCatchTable(l)}<h3>Képek</h3><div class="photo-grid">${(l.photos||[]).map(p=>`<img src="${p}" alt="">`).join('') || '<div class="empty">Nincs kép.</div>'}</div>`;
  modal.showModal();
}
function logCatchTable(l){
  if(!l.catches?.length) return '<div class="empty">Nincs rögzített fogás.</div>';
  return `<table class="catch-table"><tbody>${l.catches.map(c=>`<tr><td>${esc(findFish(c.fish)?.name||'')}</td><td>${esc(c.count)} db</td><td>${esc(c.weight)} kg</td><td>${esc(c.length)} cm</td></tr>`).join('')}</tbody></table>`;
}
function renderCatches(){
  const catches = state.logs.flatMap(l => (l.catches||[]).map(c=>({...c, log:l})));
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Fogásaim</h2>${catches.length ? `<table class="catch-table"><thead><tr><th>Dátum</th><th>Hal</th><th>Db</th><th>Súly</th><th>Víz</th></tr></thead><tbody>${catches.map(c=>`<tr><td>${esc(c.log.date)}</td><td>${esc(findFish(c.fish)?.name||'')}</td><td>${esc(c.count)}</td><td>${esc(c.weight)} kg</td><td>${esc(findWater(c.log.water)?.name||'')}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Még nincs fogás.</div>'}</section>`;
}
function renderLocations(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Helyszínek</h2><div class="grid-2"><div class="field"><label>Név</label><input id="newWaterName"></div><div class="field"><label>Koordináta / település</label><input id="newWaterCoords"></div></div><div class="field"><label>Kép</label><input id="newWaterImage" type="file" accept="image/*"></div><button class="primary" id="addWater">Hely hozzáadása</button></section><section class="panel"><div class="water-grid">${state.waters.map(w=>`<article class="image-card"><img src="${w.image||'assets/header.jpg'}" alt="${esc(w.name)}"><div class="caption">${esc(w.name)}<small>${esc(w.coords||'')}</small></div></article>`).join('')}</div></section>`;
  $('#addWater').onclick = async()=>{const f=$('#newWaterImage').files[0]; state.waters.push({id:uid('water'), name:$('#newWaterName').value||'Saját hely', coords:$('#newWaterCoords').value, image:f?await fileData(f):'assets/header.jpg'}); saveState(); renderLocations();};
}
function renderStats(){
  const allCatches=state.logs.flatMap(l=>l.catches||[]), totalWeight=sum(allCatches,c=>c.weight), biggest=Math.max(0,...allCatches.map(c=>Number(c.weight)||0));
  const methodCounts=countBy(state.logs, l=>findDb('methods',l.method)?.name||'Ismeretlen');
  const fishCounts=countBy(allCatches, c=>findFish(c.fish)?.name||'Ismeretlen');
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Statisztikák</h2><div class="stat-cards"><div class="stat-card"><small>Összes horgászat</small><strong>${state.logs.length}</strong></div><div class="stat-card"><small>Összes haltömeg</small><strong>${formatKg(totalWeight)} kg</strong></div><div class="stat-card"><small>Legnagyobb hal</small><strong>${formatKg(biggest)} kg</strong></div></div></section><section class="panel"><h3>Módszerek megoszlása</h3>${bars(methodCounts)}</section><section class="panel"><h3>Halfajok megoszlása</h3>${bars(fishCounts)}</section>`;
}
function countBy(arr,fn){const o={}; arr.forEach(x=>{const k=fn(x); o[k]=(o[k]||0)+1}); return o;}
function bars(obj){const max=Math.max(1,...Object.values(obj)); return Object.entries(obj).length?Object.entries(obj).map(([k,v])=>`<div class="bar"><span>${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/max*100)}%"></div></div><b>${v}</b></div>`).join(''):'<div class="empty">Nincs adat.</div>'}
function renderGear(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Felszerelés</h2><div class="grid-2">${Object.keys(labels).map(k=>`<button class="secondary" onclick="selectedDb='${k}';show('database')">${labels[k]}</button>`).join('')}</div></section>`;
}
function renderDatabase(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Adatbázis</h2><div class="db-tabs">${Object.entries(labels).map(([k,v])=>`<button class="db-tab ${selectedDb===k?'active':''}" data-db="${k}">${v}</button>`).join('')}</div><div class="grid-2"><div class="field"><label>Név</label><input id="dbName"></div><div class="field"><label>Kategória / méret / íz</label><input id="dbCategory"></div></div><div class="field"><label>Megjegyzés</label><textarea id="dbNote"></textarea></div><div class="field"><label>Kép</label><input id="dbImage" type="file" accept="image/*"></div><button class="primary" id="addDb">Hozzáadás</button></section><section class="panel"><h3>${labels[selectedDb]}</h3><div class="db-list">${(state.db[selectedDb]||[]).map(x=>`<div class="list-row"><div><strong>${esc(x.name)}</strong><br><small>${esc(x.category||'')}</small><p class="muted">${esc(x.note||'')}</p></div><button class="danger" onclick="deleteDb('${selectedDb}','${x.id}')">Törlés</button></div>`).join('')||'<div class="empty">Üres adatbázis.</div>'}</div></section>`;
  $$('.db-tab').forEach(b=>b.onclick=()=>{selectedDb=b.dataset.db; renderDatabase();});
  $('#addDb').onclick=async()=>{const f=$('#dbImage').files[0]; state.db[selectedDb].push({id:uid(selectedDb), name:$('#dbName').value||'Névtelen', category:$('#dbCategory').value, note:$('#dbNote').value, image:f?await fileData(f):''}); saveState(); renderDatabase();};
}
function deleteDb(kind,id){ if(confirm('Törlöd az elemet?')){ state.db[kind]=state.db[kind].filter(x=>x.id!==id); saveState(); renderDatabase(); }}
function renderSettings(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Beállítások</h2><p class="muted">Ebben a verzióban az adatok a telefon böngészőjében tárolódnak. Használd rendszeresen az Export mentést.</p><button class="secondary" onclick="localStorage.removeItem(STORE);location.reload()">Helyi adatok törlése és alaphelyzet</button></section><section class="panel"><h2 class="section-title">Névjegy</h2><p>GitHub Pages kompatibilis, mobilra optimalizált horgásznapló.</p></section>`;
}
function renderBackup(){
  $('#content').innerHTML = `<section class="panel"><h2 class="section-title">Export / Import</h2><p class="muted">A GitHub Pages nem ad szerveroldali adatbázist, ezért az export/import a biztonsági mentés alapja.</p><button class="primary" id="exportBtn">Export JSON</button><div class="field"><label>Import JSON</label><input id="importFile" type="file" accept="application/json"></div></section>`;
  $('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='horgasz-naplo-pro-mentes.json';a.click();};
  $('#importFile').onchange=()=>{const r=new FileReader();r.onload=()=>{state=JSON.parse(r.result);saveState();alert('Import kész.');show('logs')};r.readAsText($('#importFile').files[0]);};
}
function renderRightRail(){
  const recent=state.logs.slice(0,3);
  const allCatches=state.logs.flatMap(l=>l.catches||[]);
  $('#rightRail').innerHTML = `<section class="panel"><h3 class="section-title">Naplóim</h3>${recent.length?recent.map(logCard).join(''):'<div class="empty">Nincs napló.</div>'}</section><section class="panel"><h3 class="section-title">Statisztikák</h3><div class="stat-cards"><div class="stat-card"><small>Naplók</small><strong>${state.logs.length}</strong></div><div class="stat-card"><small>Halak</small><strong>${sum(allCatches,c=>c.count)}</strong></div><div class="stat-card"><small>Kg</small><strong>${formatKg(sum(allCatches,c=>c.weight))}</strong></div></div></section><section class="panel"><h3 class="section-title">Adatbázis – csalik</h3><div class="picker-grid">${(state.db.baits||[]).slice(0,4).map(x=>`<article class="item-card"><img src="${x.image||imgFallback()}" alt=""><div class="body"><strong>${esc(x.name)}</strong><small>${esc(x.category||'')}</small></div></article>`).join('')}</div></section>`;
}

window.removeCatch=removeCatch; window.openLog=openLog; window.deleteDb=deleteDb;
init();
