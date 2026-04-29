
const $ = (s, root=document)=>root.querySelector(s);
const $$ = (s, root=document)=>[...root.querySelectorAll(s)];
const LS = "horgasz_naplo_pro_db_v2";
let state = loadState();
let liveWeather = null;
let currentPos = null;

function loadState(){
  const saved = localStorage.getItem(LS);
  if(saved) return JSON.parse(saved);
  return {
    db: structuredClone(INITIAL_DB),
    fish: structuredClone(FISH_DATA),
    waters: structuredClone(WATER_DATA),
    logs: [],
    customImages: {}
  };
}
function saveState(){ localStorage.setItem(LS, JSON.stringify(state)); }
function fileToDataURL(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }

function init(){
  $$(".nav").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
  renderAll();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
}
function showView(view){
  $$(".nav").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
  $$(".view").forEach(v=>v.classList.toggle("active", v.id===view));
  renderView(view);
}
function renderAll(){
  ["newLog","logs","locations","fish","bans","baits","groundbaits","hooks","lines","methods","accessories","stats","backup"].forEach(renderView);
}
function renderView(view){
  if(view==="newLog") renderNewLog();
  if(view==="logs") renderLogs();
  if(view==="locations") renderLocations();
  if(view==="fish") renderFish();
  if(view==="bans") renderBans();
  if(["baits","groundbaits","hooks","lines","methods","accessories"].includes(view)) renderDatabase(view);
  if(view==="stats") renderStats();
  if(view==="backup") renderBackup();
}
function options(arr, placeholder="Válassz"){
  return `<option value="">${placeholder}</option>` + arr.map(x=>`<option value="${x.id}">${x.name}${x.category?` – ${x.category}`:""}</option>`).join("");
}
function renderNewLog(){
  const v=$("#newLog");
  v.innerHTML = `
  <section class="panel"><h2>Új horgászat rögzítése</h2>
    <div class="new-grid">
      <div>
        <h3>Alap adatok</h3>
        <div class="row"><div><label>Dátum</label><input id="logDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div><label>Idő</label><input id="logTime" type="time" value="${new Date().toTimeString().slice(0,5)}"></div></div>
        <label>Helyszín</label><select id="logWater">${options(state.waters,"Helyszín választása")}</select>
        <div class="toolbar"><button class="primary" id="gpsBtn">GPS + időjárás lekérés</button><button class="secondary" id="manualWeatherBtn">Időjárás frissítése koordinátából</button></div>
        <div class="row"><div><label>Szélesség</label><input id="lat" placeholder="47.2487"></div><div><label>Hosszúság</label><input id="lon" placeholder="18.6208"></div></div>
        <label>Módszer</label><select id="logMethod">${options(state.db.methods,"Módszer választása")}</select>
        <label>Megjegyzés</label><textarea id="logNote" placeholder="Reggel óta aktívak a halak..."></textarea>
      </div>
      <div>
        <h3>Időjárás a nap folyamán</h3>
        <div id="weatherBox" class="panel">Még nincs lekérve időjárás.</div>
      </div>
      <div>
        <h3>Vízállapot</h3>
        <label>Víz hőmérséklet</label><input id="waterTemp" placeholder="16.5 °C">
        <label>Víz színe</label><select id="waterColor"><option>Enyhén zavaros</option><option>Tiszta</option><option>Zavaros</option><option>Algás</option></select>
        <label>Víz szintje</label><select id="waterLevel"><option>Átlagos</option><option>Alacsony</option><option>Magas</option><option>Áradó</option><option>Apadó</option></select>
        <label>Szél erőssége a parton</label><select id="windFeeling"><option>Gyenge</option><option>Közepes</option><option>Erős</option><option>Viharos</option></select>
        <label>Áramlás</label><select id="flow"><option>Nincs</option><option>Gyenge</option><option>Közepes</option><option>Erős</option></select>
      </div>
    </div>
  </section>
  <section class="subgrid">
    <div class="panel"><h3>Csali kiválasztása</h3><input class="search" id="baitSearch" placeholder="Keresés csalik között"><div id="baitPick" class="card-grid"></div><div id="selBait" class="pick-row"></div></div>
    <div class="panel"><h3>Horog kiválasztása</h3><input class="search" id="hookSearch" placeholder="Keresés horgok között"><div id="hookPick" class="card-grid"></div><div id="selHook" class="pick-row"></div></div>
    <div class="panel"><h3>Egyéb felszerelés</h3>
      <label>Főzsinór</label><select id="mainLine">${options(state.db.lines.filter(x=>x.category.includes("Fő")),"Főzsinór")}</select>
      <label>Előkezsinór</label><select id="leaderLine">${options(state.db.lines.filter(x=>x.category.includes("Elő")),"Előkezsinór")}</select>
      <label>Etetőanyag</label><select id="logGroundbait">${options(state.db.groundbaits,"Etetőanyag")}</select>
      <label>Egyéb aprócikkek</label><select id="logAccessory">${options(state.db.accessories,"Aprócikk")}</select>
    </div>
  </section>
  <section class="panel"><h3>Képek</h3><input id="logImages" type="file" accept="image/*" multiple><div id="imagePreview" class="card-grid"></div></section>
  <section class="panel"><button class="primary" id="saveLog">Mentés</button> <button class="secondary" onclick="renderNewLog()">Mégsem</button></section>
  `;
  $("#gpsBtn").onclick = getGPSWeather;
  $("#manualWeatherBtn").onclick = ()=>getWeatherFromInputs();
  $("#saveLog").onclick = saveLog;
  setupPicker("bait", state.db.baits, "#baitPick", "#selBait", "#baitSearch");
  setupPicker("hook", state.db.hooks, "#hookPick", "#selHook", "#hookSearch");
  $("#logImages").onchange = previewImages;
  renderWeatherBox();
}
let selected = {bait:null, hook:null};
function setupPicker(key, arr, boxSel, outSel, searchSel){
  const render=()=>{
    const q=$(searchSel).value.toLowerCase();
    $(boxSel).innerHTML = arr.filter(x=>(x.name+x.category+x.note).toLowerCase().includes(q)).map(x=>`
      <div class="card item-card ${selected[key]===x.id?'selected':''}" data-id="${x.id}">
        ${x.image?`<img src="${x.image}">`:`<img src="assets/items/placeholder.svg">`}
        <div class="body"><b>${x.name}</b><br><small>${x.category||""}</small><p>${x.note||""}</p></div>
      </div>`).join("");
    $$(boxSel+" .card").forEach(c=>c.onclick=()=>{selected[key]=c.dataset.id; render(); $(outSel).innerHTML=`<span class="pill">${arr.find(x=>x.id===selected[key])?.name||""}</span>`;});
  };
  $(searchSel).oninput=render; render();
}
async function previewImages(){
  const box=$("#imagePreview"); box.innerHTML="";
  for(const f of this.files){
    const src=await fileToDataURL(f);
    box.insertAdjacentHTML("beforeend",`<div class="card"><img style="width:100%;height:150px;object-fit:cover" src="${src}"></div>`);
  }
}
async function getGPSWeather(){
  if(!navigator.geolocation){ alert("A böngésző nem támogatja a GPS-t."); return; }
  navigator.geolocation.getCurrentPosition(async pos=>{
    currentPos={lat:pos.coords.latitude, lon:pos.coords.longitude};
    $("#lat").value=currentPos.lat.toFixed(6); $("#lon").value=currentPos.lon.toFixed(6);
    await fetchWeather(currentPos.lat,currentPos.lon);
  }, err=>alert("GPS engedély szükséges: "+err.message), {enableHighAccuracy:true,timeout:12000});
}
async function getWeatherFromInputs(){
  const lat=parseFloat($("#lat").value), lon=parseFloat($("#lon").value);
  if(isNaN(lat)||isNaN(lon)){ alert("Adj meg érvényes koordinátát."); return; }
  currentPos={lat,lon}; await fetchWeather(lat,lon);
}
async function fetchWeather(lat,lon){
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&forecast_days=1&timezone=auto`;
  const res=await fetch(url); const data=await res.json();
  liveWeather=data; renderWeatherBox();
  $("#sideWeather").innerHTML=`<b>Jelenlegi időjárás</b><div>🌡️ ${data.current.temperature_2m} °C</div><div>💨 ${data.current.wind_speed_10m} km/h</div><div>📍 ${lat.toFixed(4)}, ${lon.toFixed(4)}</div>`;
}
function degToDir(d){ const dirs=["É","ÉK","K","DK","D","DNy","Ny","ÉNy"]; return dirs[Math.round(d/45)%8]; }
function codeIcon(c){ if([0,1].includes(c))return"☀️"; if([2,3].includes(c))return"⛅"; if(c>=51&&c<70)return"🌧️"; if(c>=71)return"❄️"; return"☁️"; }
function renderWeatherBox(){
  const box=$("#weatherBox"); if(!box) return;
  if(!liveWeather){ box.innerHTML="Még nincs lekérve időjárás."; return; }
  const c=liveWeather.current, h=liveWeather.hourly;
  const hours=h.time.slice(0,24).filter((_,i)=>i%3===0).slice(0,8).map((t,i)=>{
    const idx=i*3; return `<div class="hour"><b>${t.slice(11,16)}</b><div class="ico">${codeIcon(h.weather_code[idx])}</div><div>${h.temperature_2m[idx]}°C</div><small>${h.wind_speed_10m[idx]} km/h ${degToDir(h.wind_direction_10m[idx])}</small></div>`;
  }).join("");
  box.innerHTML=`
    <div class="weather-main"><div class="sun">${codeIcon(c.weather_code)}</div>
    <div><h2>${c.temperature_2m}°C</h2><div>Hőérzet: ${c.apparent_temperature}°C</div>
    <div class="weather-kpis">
      <span>💨 Szél: ${c.wind_speed_10m} km/h ${degToDir(c.wind_direction_10m)}</span>
      <span>🌬️ Lökés: ${c.wind_gusts_10m} km/h</span>
      <span>💧 Páratartalom: ${c.relative_humidity_2m}%</span>
      <span>📉 Légnyomás: ${c.pressure_msl} hPa</span>
      <span>☁️ Felhőzet: ${c.cloud_cover}%</span>
      <span>🌧️ Csapadék: ${c.precipitation} mm</span>
    </div></div></div><div class="hourly">${hours}</div>`;
}
async function saveLog(){
  const imgs=[];
  for(const f of $("#logImages").files) imgs.push(await fileToDataURL(f));
  const log={
    id:"log-"+Date.now(), date:$("#logDate").value, time:$("#logTime").value,
    water:$("#logWater").value, lat:$("#lat").value, lon:$("#lon").value,
    method:$("#logMethod").value, note:$("#logNote").value,
    waterState:{temp:$("#waterTemp").value,color:$("#waterColor").value,level:$("#waterLevel").value,wind:$("#windFeeling").value,flow:$("#flow").value},
    bait:selected.bait, hook:selected.hook, mainLine:$("#mainLine").value, leaderLine:$("#leaderLine").value,
    groundbait:$("#logGroundbait").value, accessory:$("#logAccessory").value,
    weather:liveWeather, images:imgs
  };
  state.logs.unshift(log); saveState(); alert("Napló mentve."); showView("logs");
}
function nameBy(path,id){ const parts=path.split("."); let obj=state; for(const p of parts)obj=obj[p]; return obj.find(x=>x.id===id)?.name || ""; }

function renderLogs(){
  $("#logs").innerHTML=`<section class="panel"><h2>Naplóim</h2><div class="log-list">${state.logs.map(l=>{
    const img=l.images?.[0]||"assets/water/"+(state.waters.find(w=>w.id===l.water)?.id||"balaton")+".jpg";
    return `<div class="log-card" data-id="${l.id}"><img src="${img}"><div><b>${l.date} ${l.time} – ${state.waters.find(w=>w.id===l.water)?.name||"Ismeretlen hely"}</b><p>${nameBy("db.methods",l.method)} • ${l.weather?.current?.temperature_2m??"?"}°C</p><small>${l.note||""}</small></div></div>`
  }).join("")||"Nincs mentett napló."}</div></section>`;
  $$("#logs .log-card").forEach(c=>c.onclick=()=>showLog(c.dataset.id));
}
function showLog(id){
  const l=state.logs.find(x=>x.id===id); if(!l)return;
  const w=l.weather?.current;
  $("#modalBody").innerHTML=`<h2>${l.date} ${l.time}</h2>
  <p><b>Hely:</b> ${state.waters.find(x=>x.id===l.water)?.name||""} (${l.lat}, ${l.lon})</p>
  <p><b>Módszer:</b> ${nameBy("db.methods",l.method)}</p>
  <p><b>Csali:</b> ${nameBy("db.baits",l.bait)} | <b>Horog:</b> ${nameBy("db.hooks",l.hook)}</p>
  <p><b>Főzsinór:</b> ${nameBy("db.lines",l.mainLine)} | <b>Előke:</b> ${nameBy("db.lines",l.leaderLine)}</p>
  <p><b>Etetőanyag:</b> ${nameBy("db.groundbaits",l.groundbait)}</p>
  <p><b>Időjárás:</b> ${w?`${w.temperature_2m}°C, ${w.wind_speed_10m} km/h ${degToDir(w.wind_direction_10m)}, ${w.pressure_msl} hPa`:"nincs mentve"}</p>
  <p><b>Megjegyzés:</b> ${l.note||""}</p>
  <div class="card-grid">${(l.images||[]).map(i=>`<img style="width:100%;border-radius:8px" src="${i}">`).join("")}</div>`;
  modal.showModal();
}
function renderLocations(){ renderImageGrid("locations", state.waters, true); }
function renderFish(){ renderImageGrid("fish", state.fish, false, item=>showFish(item)); }
function renderImageGrid(view, arr, canAdd=false, clickFn=null){
  const add = canAdd ? `<section class="panel"><h3>Saját helyszín hozzáadása</h3><div class="row"><input id="newWaterName" placeholder="Név"><input id="newWaterCoords" placeholder="Koordináta"></div><input id="newWaterImage" type="file" accept="image/*"><button class="primary" id="addWater">Hozzáadás</button></section>`:"";
  $("#"+view).innerHTML=`${add}<section class="panel"><input class="search" id="${view}Search" placeholder="Keresés"><div class="card-grid" id="${view}Grid"></div></section>`;
  const draw=()=>{
    const q=$("#"+view+"Search").value.toLowerCase();
    $("#"+view+"Grid").innerHTML=arr.filter(x=>(x.name+(x.latin||x.subtitle||"")).toLowerCase().includes(q)).map(x=>`
      <div class="image-card" data-id="${x.id}">
        <img src="${x.image}"><div class="card-title">${x.name}<small>${x.latin||x.subtitle||""}</small></div><div class="badge">🎣</div>
      </div>`).join("");
    $$("#"+view+"Grid .image-card").forEach(c=>c.onclick=()=>{const item=arr.find(x=>x.id===c.dataset.id); if(clickFn) clickFn(item);});
  };
  $("#"+view+"Search").oninput=draw; draw();
  if(canAdd) $("#addWater").onclick=async()=>{
    const f=$("#newWaterImage").files[0]; const img=f?await fileToDataURL(f):"";
    state.waters.push({id:"water-"+Date.now(), name:$("#newWaterName").value||"Saját hely", subtitle:$("#newWaterCoords").value, coords:$("#newWaterCoords").value, image:img});
    saveState(); renderLocations();
  };
}
function showFish(f){
  $("#modalBody").innerHTML=`<h2>${f.name}</h2><img style="width:100%;border-radius:10px" src="${f.image}"><p><i>${f.latin}</i></p><p><b>Tilalom:</b> ${f.closedSeason}</p><p><b>Méretkorlátozás:</b> ${f.minSize||"ellenőrizendő"}</p><p><b>Napi limit:</b> ${f.dailyLimit||"ellenőrizendő"}</p><p>${f.description}</p>`;
  modal.showModal();
}
function renderBans(){
  $("#bans").innerHTML=`<section class="panel"><h2>Aktuális tilalmak</h2><p>Az itt szereplő adatok induló tudásbázis-adatok. Helyi horgászrend szerint ellenőrizendők.</p><table class="table"><tr><th>Halfaj</th><th>Tilalom</th><th>Méret</th></tr>${state.fish.map(f=>`<tr><td>${f.name}</td><td>${f.closedSeason}</td><td>${f.minSize||""}</td></tr>`).join("")}</table></section>`;
}
const labels = {baits:"Csalik",groundbaits:"Etetőanyagok",hooks:"Horgok",lines:"Zsinórok",methods:"Módszerek",accessories:"Egyéb felszerelés"};
function renderDatabase(kind){
  const arr=state.db[kind];
  $("#"+kind).innerHTML=`<section class="panel database-layout">
    <div class="form-panel"><h2>${labels[kind]} adatbázis</h2>
      <label>Név</label><input id="${kind}Name">
      <label>Kategória / méret</label><input id="${kind}Cat">
      <label>Megjegyzés</label><textarea id="${kind}Note"></textarea>
      <label>Kép</label><input id="${kind}Img" type="file" accept="image/*">
      <button class="primary" id="${kind}Add">Hozzáadás</button>
    </div>
    <div><input class="search" id="${kind}Search" placeholder="Keresés"><div class="card-grid" id="${kind}List"></div></div>
  </section>`;
  const draw=()=>{
    const q=$("#"+kind+"Search").value.toLowerCase();
    $("#"+kind+"List").innerHTML=arr.filter(x=>(x.name+x.category+x.note).toLowerCase().includes(q)).map(x=>`
      <div class="card item-card"><div class="body">
        ${x.image?`<img src="${x.image}">`:""}
        <b>${x.name}</b><br><small>${x.category||""}</small><p>${x.note||""}</p>
        <button class="secondary" data-edit="${x.id}">Szerkesztés</button> <button class="danger" data-del="${x.id}">Törlés</button>
      </div></div>`).join("");
    $$(`#${kind}List [data-del]`).forEach(b=>b.onclick=()=>{state.db[kind]=state.db[kind].filter(x=>x.id!==b.dataset.del); saveState(); renderDatabase(kind);});
    $$(`#${kind}List [data-edit]`).forEach(b=>b.onclick=()=>editDb(kind,b.dataset.edit));
  };
  $("#"+kind+"Search").oninput=draw;
  $("#"+kind+"Add").onclick=async()=>{
    const f=$("#"+kind+"Img").files[0];
    const item={id:kind+"-"+Date.now(),name:$("#"+kind+"Name").value||"Névtelen",category:$("#"+kind+"Cat").value,note:$("#"+kind+"Note").value,image:f?await fileToDataURL(f):""};
    state.db[kind].push(item); saveState(); renderDatabase(kind);
  };
  draw();
}
function editDb(kind,id){
  const item=state.db[kind].find(x=>x.id===id);
  $("#modalBody").innerHTML=`<h2>Szerkesztés</h2><label>Név</label><input id="editName" value="${item.name}"><label>Kategória</label><input id="editCat" value="${item.category||""}"><label>Megjegyzés</label><textarea id="editNote">${item.note||""}</textarea><label>Új kép</label><input id="editImg" type="file" accept="image/*"><button class="primary" id="saveEdit">Mentés</button>`;
  $("#saveEdit").onclick=async()=>{item.name=$("#editName").value;item.category=$("#editCat").value;item.note=$("#editNote").value;const f=$("#editImg").files[0]; if(f)item.image=await fileToDataURL(f); saveState(); modal.close(); renderDatabase(kind);};
  modal.showModal();
}
function renderStats(){
  $("#stats").innerHTML=`<section class="panel"><h2>Statisztikák</h2><div class="subgrid"><div class="panel"><b>Összes horgászat</b><h2>${state.logs.length}</h2></div><div class="panel"><b>Mentett képek</b><h2>${state.logs.reduce((a,l)=>a+(l.images?.length||0),0)}</h2></div><div class="panel"><b>Saját adatbázis elemek</b><h2>${Object.values(state.db).reduce((a,b)=>a+b.length,0)}</h2></div></div></section>`;
}
function renderBackup(){
  $("#backup").innerHTML=`<section class="panel"><h2>Export / Import</h2><p>A teljes telefonos/böngészős adatbázist JSON fájlba mentheted, később visszatöltheted.</p><button class="primary" id="exportBtn">Export JSON</button><label>Import JSON</label><input id="importFile" type="file" accept="application/json"></section>`;
  $("#exportBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="horgasz-naplo-mentes.json";a.click();};
  $("#importFile").onchange=()=>{const f=$("#importFile").files[0];const r=new FileReader();r.onload=()=>{state=JSON.parse(r.result);saveState();renderAll();alert("Import kész.");};r.readAsText(f);};
}
init();
