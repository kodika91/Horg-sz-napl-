
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const STORE='horgasz_naplo_pro_v4'; let state=loadState(), liveWeather=null;
function upgradeAssets(st){
  const seedFish=Object.fromEntries(SEED_DATA.fish.map(x=>[x.id,x.image]));
  const seedWaters=Object.fromEntries(SEED_DATA.waters.map(x=>[x.id,x.image]));
  (st.fish||[]).forEach(f=>{ if(!f.image || f.image.endsWith('.svg')) f.image=seedFish[f.id]||f.image; });
  (st.waters||[]).forEach(w=>{ if(!w.image || w.image.endsWith('.svg')) w.image=seedWaters[w.id]||w.image; });
  return st;
}
function loadState(){let s=localStorage.getItem(STORE);return upgradeAssets(s?JSON.parse(s):{...structuredClone(SEED_DATA),logs:[]})}

function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function esc(s){return (s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function fileData(f){return new Promise(res=>{let r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f)})}
function isClosed(f,date=new Date()){if(!f.closedStart||!f.closedEnd)return false;let y=date.getFullYear(),[sm,sd]=f.closedStart.split('-').map(Number),[em,ed]=f.closedEnd.split('-').map(Number);let s=new Date(y,sm-1,sd),e=new Date(y,em-1,ed,23,59,59);return e<s?date>=s||date<=e:date>=s&&date<=e}
function optGrouped(arr,ph='Válassz'){let g={};arr.forEach(x=>(g[x.category||'Egyéb']??=[]).push(x));return `<option value="">${ph}</option>`+Object.entries(g).map(([k,items])=>`<optgroup label="${esc(k)}">${items.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}
function find(k,id){return state.db[k]?.find(x=>x.id===id)} function imgP(){return 'assets/items/placeholder.svg'}
// Initialize the application and bind navigation handlers.
function init(){
  // Attach click handlers to all navigation buttons. The new layout uses
  // buttons with the class "nav-item" instead of anchor elements.
  $$('.nav-item').forEach(b => b.onclick = () => show(b.dataset.view));
  // Render the ticker with current closed fish species.
  renderTicker();
  // Render all views on startup so cached data is available.
  renderAll();
  // Register the service worker if supported.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
// Show a particular view by toggling visibility and updating the navigation state.
function show(v) {
  // Mark the active navigation button.
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  // Show the requested view and hide others.
  $$('.view').forEach(x => x.classList.toggle('active', x.id === v));
  // When creating a new log, display logs and stats alongside the form in a two‑pane layout.
  const main = $('.main-content');
  main.classList.toggle('two-pane', v === 'newLog');
  if (v === 'newLog') {
    $('#logs').classList.add('active');
    $('#stats').classList.add('active');
  } else {
    $('#logs').classList.remove('active');
    $('#stats').classList.remove('active');
  }
  // Render the appropriate view.
  renderView(v);
}
// Render all views that are supported by the application. Additional views such as
// "gear" (fishing gear listing) and "about" have been added to the end.
function renderAll() {
  ['newLog','logs','locations','fish','bans','baits','groundbaits','hooks','lines','methods','accessories','stats','backup','gear','about'].forEach(renderView);
}
// Render the requested view based on its identifier.
function renderView(v) {
  if (v === 'newLog') renderNewLog();
  if (v === 'logs') renderLogs();
  if (v === 'locations') renderLocations();
  if (v === 'fish') renderFish();
  if (v === 'bans') renderBans();
  if (['baits','groundbaits','hooks','lines','methods','accessories'].includes(v)) renderDb(v);
  if (v === 'stats') renderStats();
  if (v === 'backup') renderBackup();
  // In the new design, "gear" simply lists the available baits as a generic equipment view.
  if (v === 'gear') renderDb('baits');
  // The "about" view is static content defined in index.html and does not require rendering.
}
// Render a ticker showing currently closed fish species into the sidebar.
function renderTicker() {
  const closed = state.fish.filter(f => isClosed(f)).slice(0, 8).map(f => f.name);
  const el = $('#navWeather');
  if (!el) return;
  el.innerHTML = closed.length
    ? '⛔ Aktuális tilalom: ' + closed.join(' • ')
    : '✅ Jelenleg nincs kiemelt fajlagos tilalom';
}
function renderNewLog(log=null){let v=$('#newLog');v.innerHTML=`<section class="panel"><h2>${log?'Napló szerkesztése':'Új horgászat rögzítése'}</h2><div class="new-layout"><div><h3>Alap adatok</h3><div class="two"><div><label>Dátum</label><input id="date" type="date" value="${log?.date||new Date().toISOString().slice(0,10)}"></div><div><label>Idő</label><input id="time" type="time" value="${log?.time||new Date().toTimeString().slice(0,5)}"></div></div><label>Helyszín</label><select id="water">${state.waters.map(w=>`<option value="${w.id}" ${log?.water===w.id?'selected':''}>${esc(w.name)}</option>`).join('')}</select><div class="toolbar"><button class="primary" id="gps">GPS + élő időjárás</button><button class="secondary" id="weatherFromCoords">Időjárás koordinátából</button></div><div class="two"><div><label>Szélesség</label><input id="lat" value="${log?.lat||''}"></div><div><label>Hosszúság</label><input id="lon" value="${log?.lon||''}"></div></div><label>Módszer</label><select id="method">${optGrouped(state.db.methods,'Módszer kiválasztása')}</select><label>Megjegyzés</label><textarea id="note">${esc(log?.note||'')}</textarea></div><div><h3>Időjárás</h3><div id="weatherBox" class="panel"></div></div><div><h3>Vízállapot</h3><label>Víz hőmérséklet</label><input id="waterTemp" value="${esc(log?.waterState?.temp||'')}"><label>Víz színe</label><select id="waterColor">${['Tiszta','Enyhén zavaros','Zavaros','Algás'].map(x=>`<option ${log?.waterState?.color===x?'selected':''}>${x}</option>`).join('')}</select><label>Vízszint</label><select id="waterLevel">${['Alacsony','Átlagos','Magas','Áradó','Apadó'].map(x=>`<option ${log?.waterState?.level===x?'selected':''}>${x}</option>`).join('')}</select><label>Áramlás</label><select id="flow">${['Nincs','Gyenge','Közepes','Erős'].map(x=>`<option ${log?.waterState?.flow===x?'selected':''}>${x}</option>`).join('')}</select></div></div></section><section class="triple"><div class="panel"><h3>Csali</h3><input class="search" id="baitSearch"><div id="baitPick" class="card-grid"></div></div><div class="panel"><h3>Horog</h3><input class="search" id="hookSearch"><div id="hookPick" class="card-grid"></div></div><div class="panel"><h3>Zsinór / etetőanyag</h3><label>Főzsinór</label><select id="mainLine">${optGrouped(state.db.lines.filter(x=>(x.category||'').includes('Fő')),'Főzsinór')}</select><label>Előkezsinór</label><select id="leaderLine">${optGrouped(state.db.lines.filter(x=>(x.category||'').includes('Elő')),'Előkezsinór')}</select><label>Etetőanyag</label><select id="groundbait">${optGrouped(state.db.groundbaits,'Etetőanyag')}</select><label>Egyéb felszerelés</label><select id="accessory">${optGrouped(state.db.accessories,'Egyéb')}</select></div></section><section class="panel"><h3>Fotók</h3><input id="photos" type="file" accept="image/*" multiple><div id="photoPreview" class="photo-grid"></div></section><section class="panel"><button class="primary" id="saveLog">${log?'Módosítás mentése':'Napló mentése'}</button> ${log?'<button class="secondary" id="cancelEdit">Vissza</button>':''}</section>`;
['method','mainLine','leaderLine','groundbait','accessory'].forEach(id=>{$('#'+id).value=log?.[id]||''}); liveWeather=log?.weather||liveWeather; renderWeather(); let sel={bait:log?.bait||'',hook:log?.hook||''}; picker('baits','baitPick','baitSearch',sel,'bait'); picker('hooks','hookPick','hookSearch',sel,'hook'); $('#gps').onclick=getGPS; $('#weatherFromCoords').onclick=()=>fetchWeather(parseFloat($('#lat').value),parseFloat($('#lon').value)); $('#photos').onchange=async()=>{let box=$('#photoPreview');box.innerHTML='';for(let f of $('#photos').files)box.innerHTML+=`<img src="${await fileData(f)}">`}; $('#saveLog').onclick=async()=>saveLog(sel,log); if($('#cancelEdit'))$('#cancelEdit').onclick=()=>show('logs'); if(log?.photos)$('#photoPreview').innerHTML=log.photos.map(p=>`<img src="${p}">`).join('')}
function picker(kind,boxId,searchId,sel,key){function draw(){let q=$('#'+searchId).value.toLowerCase();$('#'+boxId).innerHTML=state.db[kind].filter(x=>(x.name+x.category+x.note).toLowerCase().includes(q)).map(x=>`<div class="item-card ${sel[key]===x.id?'selected':''}" data-id="${x.id}"><img src="${x.image||imgP()}"><h4>${esc(x.name)}</h4><small>${esc(x.category||'')}</small><p>${esc(x.note||'')}</p></div>`).join('');$$('#'+boxId+' .item-card').forEach(c=>c.onclick=()=>{sel[key]=c.dataset.id;draw()})}$('#'+searchId).oninput=draw;draw()}
async function saveLog(sel,existing){let photos=[...(existing?.photos||[])];for(let f of $('#photos').files)photos.push(await fileData(f));let obj={id:existing?.id||'log-'+Date.now(),date:$('#date').value,time:$('#time').value,water:$('#water').value,lat:$('#lat').value,lon:$('#lon').value,method:$('#method').value,note:$('#note').value,waterState:{temp:$('#waterTemp').value,color:$('#waterColor').value,level:$('#waterLevel').value,flow:$('#flow').value},bait:sel.bait,hook:sel.hook,mainLine:$('#mainLine').value,leaderLine:$('#leaderLine').value,groundbait:$('#groundbait').value,accessory:$('#accessory').value,weather:liveWeather,photos}; if(existing)state.logs=state.logs.map(l=>l.id===existing.id?obj:l); else state.logs.unshift(obj);save();show('logs')}
function wIcon(c){if([0,1].includes(c))return'☀️';if([2,3].includes(c))return'⛅';if(c>=51&&c<70)return'🌧️';if(c>=71)return'❄️';return'☁️'} function dir(d){return ['É','ÉK','K','DK','D','DNy','Ny','ÉNy'][Math.round((d||0)/45)%8]}
function getGPS(){navigator.geolocation.getCurrentPosition(p=>{$('#lat').value=p.coords.latitude.toFixed(6);$('#lon').value=p.coords.longitude.toFixed(6);fetchWeather(p.coords.latitude,p.coords.longitude)},e=>alert('GPS engedély szükséges: '+e.message),{enableHighAccuracy:true,timeout:13000})}
async function fetchWeather(lat,lon){if(isNaN(lat)||isNaN(lon)){alert('Hiányzó vagy hibás koordináta.');return}let url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&forecast_days=1&timezone=auto`;let r=await fetch(url);liveWeather=await r.json();renderWeather()}
function renderWeather(){let box=$('#weatherBox');if(!box)return;if(!liveWeather){box.innerHTML='<p>Még nincs lekért időjárás.</p>';return}let c=liveWeather.current,h=liveWeather.hourly;box.innerHTML=`<div class="weather-now"><div class="weather-symbol">${wIcon(c.weather_code)}</div><div><div class="temp">${c.temperature_2m}°C</div><b>Hőérzet: ${c.apparent_temperature}°C</b></div></div><div class="kpis"><div class="kpi">💨 Szél <b>${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}</b></div><div class="kpi">🌬️ Lökés <b>${c.wind_gusts_10m} km/h</b></div><div class="kpi">📉 Légnyomás <b>${c.pressure_msl} hPa</b></div><div class="kpi">💧 Páratartalom <b>${c.relative_humidity_2m}%</b></div><div class="kpi">☁️ Felhőzet <b>${c.cloud_cover}%</b></div><div class="kpi">🌧️ Csapadék <b>${c.precipitation} mm</b></div></div><h4>24 órás bontás</h4><div class="hourly">${h.time.slice(0,24).map((t,i)=>`<div class="hour"><b>${t.slice(11,16)}</b><div class="ico">${wIcon(h.weather_code[i])}</div><div>${h.temperature_2m[i]}°C</div><small>${h.pressure_msl[i]} hPa</small><br><small>${h.wind_speed_10m[i]} km/h ${dir(h.wind_direction_10m[i])}</small></div>`).join('')}</div>`;$('#sideWeather').innerHTML=`<div class="weather-icon">${wIcon(c.weather_code)}</div><div><b>${c.temperature_2m}°C</b><span>Szél: ${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}<br>Légnyomás: ${c.pressure_msl} hPa<br>Páratartalom: ${c.relative_humidity_2m}%</span></div>`}
function renderWeather(){
  let box = $('#weatherBox');
  if(!box) return;
  if(!liveWeather){
    box.innerHTML = '<p>Még nincs lekért időjárás.</p>';
    return;
  }
  let c = liveWeather.current, h = liveWeather.hourly;
  box.innerHTML = `<div class="weather-now"><div class="weather-symbol">${wIcon(c.weather_code)}</div><div><div class="temp">${c.temperature_2m}°C</div><b>Hőérzet: ${c.apparent_temperature}°C</b></div></div><div class="kpis"><div class="kpi">💨 Szél <b>${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}</b></div><div class="kpi">🌬️ Lökés <b>${c.wind_gusts_10m} km/h</b></div><div class="kpi">📉 Légnyomás <b>${c.pressure_msl} hPa</b></div><div class="kpi">💧 Páratartalom <b>${c.relative_humidity_2m}%</b></div><div class="kpi">☁️ Felhőzet <b>${c.cloud_cover}%</b></div><div class="kpi">🌧️ Csapadék <b>${c.precipitation} mm</b></div></div><h4>24 órás bontás</h4><div class="hourly">${h.time.slice(0,24).map((t,i) => `<div class="hour"><b>${t.slice(11,16)}</b><div class="ico">${wIcon(h.weather_code[i])}</div><div>${h.temperature_2m[i]}°C</div><small>${h.pressure_msl[i]} hPa</small><br><small>${h.wind_speed_10m[i]} km/h ${dir(h.wind_direction_10m[i])}</small></div>`).join('')}</div>`;
  // Update sidebar weather if the element exists.
  const side = $('#sideWeather');
  if (side) {
    side.innerHTML = `<div class="weather-icon">${wIcon(c.weather_code)}</div><div><b>${c.temperature_2m}°C</b><span>Szél: ${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}<br>Légnyomás: ${c.pressure_msl} hPa<br>Páratartalom: ${c.relative_humidity_2m}%</span></div>`;
  }
}
function renderLogs(){$('#logs').innerHTML=`<section class="panel"><h2>Mentett horgászatok</h2><div class="log-grid">${state.logs.map(l=>{let img=l.photos?.[0]||state.waters.find(w=>w.id===l.water)?.image||imgP(),c=l.weather?.current;return `<article class="log-card"><img src="${img}"><div class="body"><span class="log-time">${l.date} ${l.time}</span><h3>${esc(state.waters.find(w=>w.id===l.water)?.name||'Helyszín')}</h3><p>${esc(find('methods',l.method)?.name||'')} • ${c?`${c.temperature_2m}°C • ${c.pressure_msl} hPa`:'nincs időjárás'}</p><button class="primary" data-open="${l.id}">Megnyitás</button> <button class="secondary" data-edit="${l.id}">Szerkesztés</button> <button class="danger" data-del="${l.id}">Törlés</button></div></article>`}).join('')||'<p>Nincs mentett napló.</p>'}</div></section>`;$$('[data-open]').forEach(b=>b.onclick=()=>openLog(b.dataset.open));$$('[data-edit]').forEach(b=>b.onclick=()=>renderNewLog(state.logs.find(l=>l.id===b.dataset.edit)));$$('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Törlöd a naplót?')){state.logs=state.logs.filter(l=>l.id!==b.dataset.del);save();renderLogs()}})}
function openLog(id){let l=state.logs.find(x=>x.id===id),c=l.weather?.current,h=l.weather?.hourly;$('#modalBody').innerHTML=`<h2>${l.date} ${l.time} – ${esc(state.waters.find(w=>w.id===l.water)?.name||'')}</h2><div class="detail-grid"><div class="panel"><h3>Horgászat adatai</h3><p><b>GPS:</b> ${esc(l.lat)}, ${esc(l.lon)}</p><p><b>Módszer:</b> ${esc(find('methods',l.method)?.name||'')}</p><p><b>Csali:</b> ${esc(find('baits',l.bait)?.name||'')}<br><b>Horog:</b> ${esc(find('hooks',l.hook)?.name||'')}<br><b>Főzsinór:</b> ${esc(find('lines',l.mainLine)?.name||'')}<br><b>Előke:</b> ${esc(find('lines',l.leaderLine)?.name||'')}<br><b>Etetőanyag:</b> ${esc(find('groundbaits',l.groundbait)?.name||'')}</p><p><b>Vízállapot:</b> ${esc(Object.values(l.waterState||{}).join(' • '))}</p><p>${esc(l.note||'')}</p></div><div class="panel"><h3>Mentéskori időjárás</h3>${c?`<div class="big-weather"><div class="kpi">🌡️ Hőmérséklet <b>${c.temperature_2m}°C</b></div><div class="kpi">📉 Légnyomás <b>${c.pressure_msl} hPa</b></div><div class="kpi">💨 Szél <b>${c.wind_speed_10m} km/h ${dir(c.wind_direction_10m)}</b></div><div class="kpi">💧 Páratartalom <b>${c.relative_humidity_2m}%</b></div></div>`:'Nincs időjárás.'}</div></div>${h?`<div class="panel"><h3>24 órás időjárásnapló</h3><div class="hourly">${h.time.slice(0,24).map((t,i)=>`<div class="hour"><b>${t.slice(11,16)}</b><div class="ico">${wIcon(h.weather_code[i])}</div><div>${h.temperature_2m[i]}°C</div><small>${h.pressure_msl[i]} hPa</small><br><small>${h.wind_speed_10m[i]} km/h ${dir(h.wind_direction_10m[i])}</small></div>`).join('')}</div></div>`:''}<div class="panel"><h3>Képek</h3><div class="photo-grid">${(l.photos||[]).map(p=>`<img src="${p}">`).join('')||'Nincs kép.'}</div></div>`;modal.showModal()}
function renderFish(){$('#fish').innerHTML='<section class="panel"><h2>Halfajok – tudásbázis</h2><input class="search" id="fishSearch" placeholder="Keresés"><div id="fishGrid" class="card-grid"></div></section>';function draw(){let q=$('#fishSearch').value.toLowerCase();$('#fishGrid').innerHTML=state.fish.filter(f=>(f.name+f.latin+f.origin+f.group).toLowerCase().includes(q)).map(f=>`<div class="image-card" data-id="${f.id}"><img src="${f.image}"><span class="badge ${isClosed(f)||f.dailyLimit==='0'?'red':f.invasive?'orange':'green'}">${f.dailyLimit==='0'?'VÉDETT':isClosed(f)?'TILOS':f.invasive?'INVÁZIÓS':'OK'}</span><div class="card-name">${esc(f.name)}<small>${esc(f.latin)}</small></div></div>`).join('');$$('#fishGrid .image-card').forEach(c=>c.onclick=()=>fishModal(c.dataset.id))}$('#fishSearch').oninput=draw;draw()}
function fishModal(id){let f=state.fish.find(x=>x.id===id);$('#modalBody').innerHTML=`<h2>${esc(f.name)}</h2><img style="width:100%;max-height:420px;object-fit:cover;border-radius:18px" src="${f.image}"><p><i>${esc(f.latin)}</i></p><p><b>Eredet:</b> ${esc(f.origin)} | <b>Kategória:</b> ${esc(f.group)}</p><p><b>Tilalom:</b> ${esc(f.closedStart||'-')} – ${esc(f.closedEnd||'-')}</p><p><b>Méret:</b> ${esc(f.minSize||'-')} | <b>Napi limit:</b> ${esc(f.dailyLimit||'-')}</p><p>${esc(f.ruleNote)}</p>`;modal.showModal()}
function renderBans(){$('#bans').innerHTML='<section class="panel"><h2>Szerkeszthető tilalmi adatbázis</h2><input class="search" id="banSearch" placeholder="Keresés"><table><thead><tr><th>Hal</th><th>Kezdet</th><th>Vége</th><th>Méret</th><th>Limit</th><th>Állapot</th><th></th></tr></thead><tbody id="banRows"></tbody></table></section>';function draw(){let q=$('#banSearch').value.toLowerCase();$('#banRows').innerHTML=state.fish.filter(f=>(f.name+f.latin).toLowerCase().includes(q)).map(f=>`<tr><td><b>${esc(f.name)}</b><br><small>${esc(f.latin)}</small></td><td>${esc(f.closedStart||'')}</td><td>${esc(f.closedEnd||'')}</td><td>${esc(f.minSize||'')}</td><td>${esc(f.dailyLimit||'')}</td><td>${f.dailyLimit==='0'?'Védett':isClosed(f)?'TILOS most':'OK'}</td><td><button class="secondary" data-edit-ban="${f.id}">Szerkesztés</button></td></tr>`).join('');$$('[data-edit-ban]').forEach(b=>b.onclick=()=>editFishRule(b.dataset.editBan))}$('#banSearch').oninput=draw;draw()}
function editFishRule(id){let f=state.fish.find(x=>x.id===id);$('#modalBody').innerHTML=`<h2>${esc(f.name)} szabályai</h2><label>Tilalom kezdete MM-NN</label><input id="fs" value="${esc(f.closedStart||'')}"><label>Tilalom vége MM-NN</label><input id="fe" value="${esc(f.closedEnd||'')}"><label>Méret</label><input id="fm" value="${esc(f.minSize||'')}"><label>Limit</label><input id="fl" value="${esc(f.dailyLimit||'')}"><label>Megjegyzés</label><textarea id="fn">${esc(f.ruleNote||'')}</textarea><button class="primary" id="saveRule">Mentés</button>`;$('#saveRule').onclick=()=>{f.closedStart=$('#fs').value;f.closedEnd=$('#fe').value;f.minSize=$('#fm').value;f.dailyLimit=$('#fl').value;f.ruleNote=$('#fn').value;save();renderTicker();modal.close();renderBans();renderFish()};modal.showModal()}
function renderLocations(){renderImageDb('locations',state.waters,'Helyszínek')}
function renderImageDb(view,arr,title){$('#'+view).innerHTML=`<section class="panel"><h2>${title}</h2><div class="two"><input id="wn" placeholder="Saját hely neve"><input id="wc" placeholder="Koordináta"></div><input id="wi" type="file" accept="image/*"><button class="primary" id="wa">Hely hozzáadása</button><hr><input class="search" id="${view}Search" placeholder="Keresés"><div id="${view}Grid" class="card-grid"></div></section>`;function draw(){let q=$('#'+view+'Search').value.toLowerCase();$('#'+view+'Grid').innerHTML=arr.filter(x=>(x.name+(x.coords||'')).toLowerCase().includes(q)).map(x=>`<div class="image-card"><img src="${x.image}"><div class="card-name">${esc(x.name)}<small>${esc(x.coords||'')}</small></div></div>`).join('')}$('#'+view+'Search').oninput=draw;draw();$('#wa').onclick=async()=>{let f=$('#wi').files[0];state.waters.push({id:'water-'+Date.now(),name:$('#wn').value||'Saját hely',coords:$('#wc').value,image:f?await fileData(f):'assets/water/balaton.jpg',note:''});save();renderLocations()}}
const labels={baits:'Csalik',groundbaits:'Etetőanyagok',hooks:'Horgok',lines:'Zsinórok',methods:'Módszerek',accessories:'Egyéb felszerelés'};
function renderDb(kind){$('#'+kind).innerHTML=`<section class="database"><div class="panel sticky"><h2>${labels[kind]}</h2><label>Név</label><input id="dn"><label>Kategória / méret</label><input id="dc"><label>Megjegyzés</label><textarea id="dt"></textarea><label>Kép</label><input id="di" type="file" accept="image/*"><button class="primary" id="da">Hozzáadás</button></div><div class="panel"><input class="search" id="ds" placeholder="Keresés"><div id="dl"></div></div></section>`;let arr=state.db[kind];function draw(){let q=$('#ds').value.toLowerCase();$('#dl').innerHTML=arr.filter(x=>(x.name+x.category+x.note).toLowerCase().includes(q)).map(x=>`<div class="list-row"><div><b>${esc(x.name)}</b><small>${esc(x.category||'')}</small><p>${esc(x.note||'')}</p></div><div><button class="secondary" data-ed="${x.id}">Szerkesztés</button> <button class="danger" data-rm="${x.id}">Törlés</button></div></div>`).join('');$$('[data-rm]').forEach(b=>b.onclick=()=>{state.db[kind]=state.db[kind].filter(x=>x.id!==b.dataset.rm);save();renderDb(kind)});$$('[data-ed]').forEach(b=>b.onclick=()=>editDb(kind,b.dataset.ed))}$('#ds').oninput=draw;$('#da').onclick=async()=>{let f=$('#di').files[0];arr.push({id:kind+'-'+Date.now(),name:$('#dn').value||'Névtelen',category:$('#dc').value,note:$('#dt').value,image:f?await fileData(f):''});save();renderDb(kind)};draw()}
function editDb(kind,id){let it=state.db[kind].find(x=>x.id===id);$('#modalBody').innerHTML=`<h2>Szerkesztés</h2><label>Név</label><input id="en" value="${esc(it.name)}"><label>Kategória</label><input id="ec" value="${esc(it.category||'')}"><label>Megjegyzés</label><textarea id="et">${esc(it.note||'')}</textarea><label>Új kép</label><input id="ei" type="file" accept="image/*"><button class="primary" id="es">Mentés</button>`;$('#es').onclick=async()=>{it.name=$('#en').value;it.category=$('#ec').value;it.note=$('#et').value;let f=$('#ei').files[0];if(f)it.image=await fileData(f);save();modal.close();renderDb(kind);renderNewLog()};modal.showModal()}
function renderStats(){$('#stats').innerHTML=`<section class="panel"><h2>Statisztika</h2><div class="triple"><div class="panel"><b>Naplók</b><div class="temp">${state.logs.length}</div></div><div class="panel"><b>Halfajok</b><div class="temp">${state.fish.length}</div></div><div class="panel"><b>Adatbázis elemek</b><div class="temp">${Object.values(state.db).reduce((a,b)=>a+b.length,0)}</div></div></div></section>`}
function renderBackup(){$('#backup').innerHTML='<section class="panel"><h2>Export / Import</h2><button class="primary" id="ex">Export JSON</button><label>Import JSON</label><input id="im" type="file" accept="application/json"></section>';$('#ex').onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='horgasz-naplo-pro-mentes.json';a.click()};$('#im').onchange=()=>{let r=new FileReader();r.onload=()=>{state=JSON.parse(r.result);save();renderAll();renderTicker();alert('Import kész.')};r.readAsText($('#im').files[0])}}

// -----------------------------------------------------------------------------
// Modern view overrides
//
// The original implementation of renderNewLog, renderLogs and renderStats lives
// earlier in the file for backward compatibility with the legacy layout. To
// provide the modern UI, we redefine these functions here. In JavaScript, later
// function declarations override earlier ones with the same name. This allows
// us to patch the behavior without modifying the original minified code block.

// Render the form for creating or editing a log entry. In the modern layout
// this function creates a series of panels instead of a complex nested grid.
// When editing an existing log, the inputs are prefilled with its values.
function renderNewLog(log = null) {
  const v = $('#newLog');
  v.innerHTML = `
  <section class="panel">
    <h2>${log ? 'Napló szerkesztése' : 'Új horgászat rögzítése'}</h2>
    <div class="two">
      <div>
        <label>Dátum</label>
        <input id="date" type="date" value="${log?.date || new Date().toISOString().slice(0, 10)}">
      </div>
      <div>
        <label>Idő</label>
        <input id="time" type="time" value="${log?.time || new Date().toTimeString().slice(0, 5)}">
      </div>
    </div>
    <label>Helyszín</label>
    <select id="water">${state.waters.map(w => `<option value="${w.id}" ${log?.water === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select>
    <div class="toolbar">
      <button class="primary" id="gps">GPS + élő időjárás</button>
      <button class="secondary" id="weatherFromCoords">Időjárás koordinátából</button>
    </div>
    <div class="two">
      <div><label>Szélesség</label><input id="lat" value="${log?.lat || ''}"></div>
      <div><label>Hosszúság</label><input id="lon" value="${log?.lon || ''}"></div>
    </div>
    <div id="locationName" class="location-name"></div>
    <label>Módszer</label>
    <select id="method">${optGrouped(state.db.methods, 'Módszer kiválasztása')}</select>
    <label>Megjegyzés</label>
    <textarea id="note">${esc(log?.note || '')}</textarea>
  </section>
  <section class="panel">
    <h3>Időjárás</h3>
    <div id="weatherBox" class="panel"></div>
  </section>
  <section class="panel">
    <h3>Vízállapot</h3>
    <label>Víz hőmérséklet</label>
    <input id="waterTemp" value="${esc(log?.waterState?.temp || '')}">
    <label>Víz színe</label>
    <select id="waterColor">${['Tiszta','Enyhén zavaros','Zavaros','Algás'].map(x => `<option ${log?.waterState?.color === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <label>Vízszint</label>
    <select id="waterLevel">${['Alacsony','Átlagos','Magas','Áradó','Apadó'].map(x => `<option ${log?.waterState?.level === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <label>Áramlás</label>
    <select id="flow">${['Nincs','Gyenge','Közepes','Erős'].map(x => `<option ${log?.waterState?.flow === x ? 'selected' : ''}>${x}</option>`).join('')}</select>
  </section>
  <section class="panel">
    <h3>Csali kiválasztása</h3>
    <input class="search" id="baitSearch">
    <div id="baitPick" class="card-grid"></div>
  </section>
  <section class="panel">
    <h3>Horog kiválasztása</h3>
    <input class="search" id="hookSearch">
    <div id="hookPick" class="card-grid"></div>
  </section>
  <section class="panel">
    <h3>Egyéb felszerelés</h3>
    <label>Főzsinór</label>
    <select id="mainLine">${optGrouped(state.db.lines.filter(x => (x.category || '').includes('Fő')), 'Főzsinór')}</select>
    <label>Előkezsinór</label>
    <select id="leaderLine">${optGrouped(state.db.lines.filter(x => (x.category || '').includes('Elő')), 'Előkezsinór')}</select>
    <label>Etetőanyag</label>
    <select id="groundbait">${optGrouped(state.db.groundbaits, 'Etetőanyag')}</select>
    <label>Egyéb felszerelés</label>
    <select id="accessory">${optGrouped(state.db.accessories, 'Egyéb')}</select>
  </section>
  <section class="panel">
    <h3>Képek</h3>
    <input id="photos" type="file" accept="image/*" multiple>
    <div id="photoPreview" class="card-grid"></div>
  </section>
  <section class="panel">
    <button class="primary" id="saveLog">${log ? 'Módosítás mentése' : 'Napló mentése'}</button>
    ${log ? '<button class="secondary" id="cancelEdit">Vissza</button>' : ''}
  </section>
  `;
  // Restore values for method and gear selects.
  ['method','mainLine','leaderLine','groundbait','accessory'].forEach(id => {
    $('#' + id).value = log?.[id] || '';
  });
  // Preserve previously fetched weather.
  liveWeather = log?.weather || liveWeather;
  renderWeather();
  // Set up pickers for bait and hook.
  const sel = { bait: log?.bait || '', hook: log?.hook || '' };
  picker('baits','baitPick','baitSearch', sel, 'bait');
  picker('hooks','hookPick','hookSearch', sel, 'hook');
  $('#gps').onclick = getGPS;
  $('#weatherFromCoords').onclick = () => {
    const lat = parseFloat($('#lat').value);
    const lon = parseFloat($('#lon').value);
    fetchWeather(lat, lon);
    fetchLocation(lat, lon);
  };
  $('#photos').onchange = async () => {
    let box = $('#photoPreview');
    box.innerHTML = '';
    for (let f of $('#photos').files) {
      box.innerHTML += `<img src="${await fileData(f)}" alt="">`;
    }
  };
  $('#saveLog').onclick = async () => saveLog(sel, log);
  if ($('#cancelEdit')) $('#cancelEdit').onclick = () => show('logs');
  if (log?.photos) {
    $('#photoPreview').innerHTML = log.photos.map(p => `<img src="${p}" alt="">`).join('');
  }
}

// Render the list of saved logs as cards. Each card shows the date/time,
// location and method with optional weather summary. Buttons allow opening,
// editing or deleting an entry.
function renderLogs() {
  const v = $('#logs');
  v.innerHTML = `<div class="panel"><h2>Naplóim</h2><div id="logCards"></div></div>`;
  const container = v.querySelector('#logCards');
  container.innerHTML = state.logs.map(l => {
    const c = l.weather?.current;
    return `
    <article class="log-card">
      <img src="${(l.photos && l.photos[0]) || 'assets/placeholder_light_gray_block.png'}" alt="">
      <div class="body">
        <span class="meta">${l.date} ${l.time}</span>
        <h3>${esc(state.waters.find(w => w.id === l.water)?.name || '')}</h3>
        <p class="meta">${esc(find('methods', l.method)?.name || '')} • ${c ? `${c.temperature_2m}°C, ${c.pressure_msl} hPa` : 'nincs időjárás'}</p>
        <button class="primary" data-open="${l.id}">Megnyitás</button>
        <button class="secondary" data-edit="${l.id}">Szerkesztés</button>
        <button class="danger" data-del="${l.id}">Törlés</button>
      </div>
    </article>`;
  }).join('') || '<p class="panel">Nincs mentett napló.</p>';
  $$('[data-open]').forEach(b => b.onclick = () => openLog(b.dataset.open));
  $$('[data-edit]').forEach(b => b.onclick = () => renderNewLog(state.logs.find(l => l.id === b.dataset.edit)));
  $$('[data-del]').forEach(b => b.onclick = () => {
    if (confirm('Törlöd a naplót?')) {
      state.logs = state.logs.filter(l => l.id !== b.dataset.del);
      save();
      renderLogs();
      renderStats();
    }
  });
}

// Render summary statistics for all logs and display the distribution of methods.
function renderStats() {
  const v = $('#stats');
  // Summaries: number of logs, number of fish species and number of database items.
  const logCount = state.logs.length;
  const fishCount = state.fish.length;
  const dbItems = Object.values(state.db).reduce((a, b) => a + b.length, 0);
  // Compute frequency of each method used in logs.
  const methodCounts = {};
  state.logs.forEach(l => {
    if (!l.method) return;
    const m = find('methods', l.method)?.name || 'Ismeretlen';
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  });
  const totalMethods = Object.values(methodCounts).reduce((a,b) => a + b, 0) || 1;
  v.innerHTML = `
    <div class="stats-panel">
      <h2>Statisztika</h2>
      <div class="stats-summary">
        <div class="summary-item">
          <small>Naplók</small>
          <div class="value">${logCount}</div>
        </div>
        <div class="summary-item">
          <small>Halfajok</small>
          <div class="value">${fishCount}</div>
        </div>
        <div class="summary-item">
          <small>Adatbázis elemek</small>
          <div class="value">${dbItems}</div>
        </div>
      </div>
      <h3>Módszerek megoszlása</h3>
      <div class="stats-chart">
        ${Object.entries(methodCounts).map(([name,cnt]) => {
          const percent = Math.round((cnt / totalMethods) * 100);
          return `
          <div class="bar">
            <div class="bar-label">${esc(name)}</div>
            <div class="bar-graph"><span style="width:${percent}%"></span></div>
            <div class="bar-value">${cnt}</div>
          </div>`;
        }).join('') || '<p>Nincs statisztikai adat.</p>'}
      </div>
    </div>
  `;
}
// Override renderLogs and renderStats with modern implementations to ensure
// they are used instead of the legacy versions defined earlier in this file.
renderLogs = function() {
  const v = $('#logs');
  v.innerHTML = `<div class="panel"><h2>Naplóim</h2><div id="logCards"></div></div>`;
  const container = v.querySelector('#logCards');
  container.innerHTML = state.logs.map(l => {
    const c = l.weather?.current;
    return `
    <article class="log-card">
      <img src="${(l.photos && l.photos[0]) || 'assets/placeholder_light_gray_block.png'}" alt="">
      <div class="body">
        <span class="meta">${l.date} ${l.time}</span>
        <h3>${esc(state.waters.find(w => w.id === l.water)?.name || '')}</h3>
        <p class="meta">${esc(find('methods', l.method)?.name || '')} • ${c ? `${c.temperature_2m}°C, ${c.pressure_msl} hPa` : 'nincs időjárás'}</p>
        <button class="primary" data-open="${l.id}">Megnyitás</button>
        <button class="secondary" data-edit="${l.id}">Szerkesztés</button>
        <button class="danger" data-del="${l.id}">Törlés</button>
      </div>
    </article>`;
  }).join('') || '<p class="panel">Nincs mentett napló.</p>';
  $$('[data-open]').forEach(b => b.onclick = () => openLog(b.dataset.open));
  $$('[data-edit]').forEach(b => b.onclick = () => renderNewLog(state.logs.find(l => l.id === b.dataset.edit)));
  $$('[data-del]').forEach(b => b.onclick = () => {
    if (confirm('Törlöd a naplót?')) {
      state.logs = state.logs.filter(l => l.id !== b.dataset.del);
      save();
      renderLogs();
      renderStats();
    }
  });
};
renderStats = function() {
  const v = $('#stats');
  const logCount = state.logs.length;
  const fishCount = state.fish.length;
  const dbItems = Object.values(state.db).reduce((a, b) => a + b.length, 0);
  const methodCounts = {};
  state.logs.forEach(l => {
    if (!l.method) return;
    const m = find('methods', l.method)?.name || 'Ismeretlen';
    methodCounts[m] = (methodCounts[m] || 0) + 1;
  });
  const totalMethods = Object.values(methodCounts).reduce((a,b) => a + b, 0) || 1;
  v.innerHTML = `
    <div class="stats-panel">
      <h2>Statisztika</h2>
      <div class="stats-summary">
        <div class="summary-item">
          <small>Naplók</small>
          <div class="value">${logCount}</div>
        </div>
        <div class="summary-item">
          <small>Halfajok</small>
          <div class="value">${fishCount}</div>
        </div>
        <div class="summary-item">
          <small>Adatbázis elemek</small>
          <div class="value">${dbItems}</div>
        </div>
      </div>
      <h3>Módszerek megoszlása</h3>
      <div class="stats-chart">
        ${Object.entries(methodCounts).map(([name,cnt]) => {
          const percent = Math.round((cnt / totalMethods) * 100);
          return `
          <div class="bar">
            <div class="bar-label">${esc(name)}</div>
            <div class="bar-graph"><span style="width:${percent}%"></span></div>
            <div class="bar-value">${cnt}</div>
          </div>`;
        }).join('') || '<p>Nincs statisztikai adat.</p>'}
      </div>
    </div>
  `;
};
// -----------------------------------------------------------------------------
// Reverse geocoding helper
//
// Use a free client-side reverse geocode API (BigDataCloud) to find the nearest
// locality for given latitude and longitude. This service is free and does not
// require an API key when called from the browser【357046033244362†L45-L50】.
// It returns a JSON object with fields such as city and locality. We display
// the most specific available name (locality or city) to help the user identify
// where the GPS coordinates correspond to.
async function fetchLocation(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=hu`
    );
    const data = await res.json();
    const loc = data.locality || data.city || data.principalSubdivision || '';
    const el = document.querySelector('#locationName');
    if (el) {
      el.textContent = loc ? `Közeli település: ${loc}` : '';
    }
  } catch (e) {
    const el = document.querySelector('#locationName');
    if (el) el.textContent = '';
  }
}

// Override the GPS helper to also fetch the nearest locality.
function getGPS() {
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const lat = p.coords.latitude;
      const lon = p.coords.longitude;
      // Update coordinate inputs
      $('#lat').value = lat.toFixed(6);
      $('#lon').value = lon.toFixed(6);
      // Fetch weather and location name
      fetchWeather(lat, lon);
      fetchLocation(lat, lon);
    },
    (e) => alert('GPS engedély szükséges: ' + e.message),
    { enableHighAccuracy: true, timeout: 13000 }
  );
}

init();
