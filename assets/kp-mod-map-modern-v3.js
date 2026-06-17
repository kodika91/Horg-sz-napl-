// kp-mod-map-modern-v3.js — világos térképréteg + appon belüli navigáció
(function(){
'use strict';
if(window.KP_MOD_MAP_MODERN_V3)return;
window.KP_MOD_MAP_MODERN_V3=true;

var state={mode:'all',selected:null,search:'',sort:'recent'};
var map=null,markers=[],routeLayer=null,userMarker=null,bootObserver=null;

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function arr(v){return Array.isArray(v)?v:[]}
function num(v){if(v==null||v==='')return null;var n=Number(String(v).replace(',','.'));return Number.isFinite(n)?n:null}
function db(){try{return typeof getDB==='function'?getDB():JSON.parse(localStorage.getItem(window.DB_KEY||'horgaszpro_v0230')||'{}')}catch(e){return {}}}
function toast(m){try{typeof showToast==='function'?showToast(m):console.log('[map]',m)}catch(e){}}
function dval(v){var d=new Date(v);return isNaN(d.getTime())?null:d}
function dateText(v){var d=dval(v);return d?d.toLocaleDateString('hu-HU'):''}
function fmt(v){return (Number(v)||0).toLocaleString('hu-HU',{maximumFractionDigits:1})}
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'')}
function uniqueStrings(list){var seen={};return arr(list).filter(function(v){if(typeof v!=='string'||!v)return false;if(seen[v])return false;seen[v]=1;return true})}

function normalizeCoords(la,lo){
  la=num(la);lo=num(lo);
  if(la==null||lo==null)return null;

  if(Math.abs(la)>90&&Math.abs(lo)<=90){var t=la;la=lo;lo=t;}
  else if(la>=14&&la<=25&&lo>=44&&lo<=51){var h=la;la=lo;lo=h;}

  if(!Number.isFinite(la)||!Number.isFinite(lo))return null;
  if(Math.abs(la)>90||Math.abs(lo)>180)return null;
  if(la===0||lo===0)return null;
  return {lat:la,lon:lo};
}
function coords(o){
  if(!o||typeof o!=='object')return null;

  var c=normalizeCoords(
    o.lat!=null?o.lat:(o.latitude!=null?o.latitude:(o.gpsLat!=null?o.gpsLat:o.y)),
    o.lon!=null?o.lon:(o.lng!=null?o.lng:(o.longitude!=null?o.longitude:(o.gpsLon!=null?o.gpsLon:o.x)))
  );
  if(c)return c;

  var pairs=[o.gps,o.coords,o.coordinate,o.positionText];
  for(var i=0;i<pairs.length;i++){
    if(typeof pairs[i]!=='string')continue;
    var g=pairs[i].match(/(-?\d+(?:[\.,]\d+)?)\s*[,; ]\s*(-?\d+(?:[\.,]\d+)?)/);
    if(g){c=normalizeCoords(g[1],g[2]);if(c)return c;}
  }

  var geo=Array.isArray(o.coordinates)?o.coordinates:(Array.isArray(o.coords)?o.coords:null);
  if(geo&&geo.length>=2){c=normalizeCoords(geo[1],geo[0]);if(c)return c;}

  var nested=[o.place,o.position,o.coordinateData,o.locationData,o.gpsData];
  for(var j=0;j<nested.length;j++){
    if(nested[j]&&typeof nested[j]==='object'){
      c=coords(nested[j]);
      if(c)return c;
    }
  }
  return null;
}
function validPoint(p){return !!(p&&normalizeCoords(p.lat,p.lon))}
function distKm(a,b,c,d){
  var from=normalizeCoords(a,b),to=normalizeCoords(c,d);
  if(!from||!to)return null;
  var R=6371,r=Math.PI/180;
  var x=Math.sin((to.lat-from.lat)*r/2)**2+Math.cos(from.lat*r)*Math.cos(to.lat*r)*Math.sin((to.lon-from.lon)*r/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function photos(o){
  if(!o||typeof o!=='object')return [];
  var out=[];
  arr(o.photos).forEach(function(p){
    var v=typeof p==='string'?p:(p&&(p.data||p.url||p.src));
    if(v)out.push(v);
  });
  [o.coverImage,o.photo,o.image].forEach(function(v){if(typeof v==='string'&&v)out.push(v)});
  return uniqueStrings(out);
}
function photo(o){return photos(o)[0]||''}
function textValue(v){if(typeof v==='string')return v;if(v&&typeof v==='object')return v.name||v.title||'';return ''}
function sessionLoc(s){return textValue(s.location)||s.locationName||s.place&&s.place.name||s.water||s.spotName||'Ismeretlen hely'}
function sessionAliases(s){return uniqueStrings([sessionLoc(s),textValue(s.location),s.locationName,s.place&&s.place.name,s.water,s.spotName].filter(Boolean).map(norm)).filter(Boolean)}
function sessionWeight(s){if(Number(s.totalWeight)>0)return Number(s.totalWeight);return arr(s.catches).reduce(function(a,c){return a+(Number(c.weight)||0)*(Number(c.count)||1)},0)}
function sessionCount(s){if(Number(s.catchCount)>0)return Number(s.catchCount);return arr(s.catches).reduce(function(a,c){return a+(Number(c.count)||1)},0)}
function placeAliases(x){return uniqueStrings([x.name,x.title,x.location,x.locationName,x.water,x.spotName].filter(Boolean).map(norm)).filter(Boolean)}

function savedPlaces(d){
  var out=[],seenIds={};
  function add(x,i,source){
    if(!x||source==='location'&&x.fromSpotFinder)return;
    var c=coords(x);if(!c)return;
    var id=source+'-'+String(x.id||x.name||i);
    if(seenIds[id])return;seenIds[id]=1;
    out.push({
      id:id,
      source:source,
      name:x.name||x.title||'Horgászhely',
      sub:x.settlement||x.county||x.gps||'Horgászhely',
      lat:c.lat,
      lon:c.lon,
      favorite:!!x.favorite,
      type:x.type||x.waterType||'Horgászhely',
      note:x.note||x.description||'',
      date:x.updatedAt||x.createdAt||'',
      photos:photos(x),
      raw:x,
      aliases:placeAliases(x)
    });
  }
  arr(d.locations).forEach(function(x,i){add(x,i,'loc')});
  arr(d.scoutSpots).forEach(function(x,i){add(x,i,'spot')});
  return out;
}
function buildPlaceNameIndex(places){
  var idx={};
  places.forEach(function(p){p.aliases.forEach(function(a){if(a&&!idx[a])idx[a]=p})});
  return idx;
}
function nearestPlace(places,c,maxKm){
  if(!c)return null;
  var best=null,bestDist=Infinity;
  places.forEach(function(p){var d=distKm(c.lat,c.lon,p.lat,p.lon);if(d!=null&&d<bestDist){bestDist=d;best=p}});
  return bestDist<=maxKm?best:null;
}
function findMatchedPlace(s,places,nameIndex,sessionCoords){
  var aliases=sessionAliases(s);
  for(var i=0;i<aliases.length;i++){if(nameIndex[aliases[i]])return nameIndex[aliases[i]];}
  return nearestPlace(places,sessionCoords,0.15);
}
function latestSessionDate(s){return s.date||s.startDate||s.createdAt||s.updatedAt||''}
function newerDate(a,b){var da=dval(a),dbv=dval(b);if(!dbv)return true;if(!da)return false;return da.getTime()>=dbv.getTime()}

function points(){
  var d=db(),out=[],places=savedPlaces(d),nameIndex=buildPlaceNameIndex(places),groups=[],caughtPlaceIds={};

  arr(d.sessions).forEach(function(s,i){
    if(!s)return;
    var ownCoords=coords(s);
    var matched=findMatchedPlace(s,places,nameIndex,ownCoords);
    var c=matched?{lat:matched.lat,lon:matched.lon}:ownCoords;
    if(!c)return;

    var aliases=sessionAliases(s),primaryAlias=aliases[0]||'';
    var group=null;
    for(var g=0;g<groups.length;g++){
      if(matched&&groups[g].place&&groups[g].place.id===matched.id){group=groups[g];break;}
      if(!matched&&!groups[g].place){
        var sameName=primaryAlias&&groups[g].alias===primaryAlias;
        var sameCoord=distKm(c.lat,c.lon,groups[g].lat,groups[g].lon);
        if(sameName||(sameCoord!=null&&sameCoord<=0.15)){group=groups[g];break;}
      }
    }

    if(!group){
      group={
        id:matched?'catch-'+matched.id:'catch-'+String(s.id||i),
        place:matched||null,
        alias:primaryAlias,
        name:matched?matched.name:sessionLoc(s),
        lat:c.lat,
        lon:c.lon,
        favorite:matched?matched.favorite:false,
        count:0,
        weight:0,
        date:'',
        note:'',
        raw:s,
        sessions:[],
        sessionPhotos:[]
      };
      groups.push(group);
    }

    group.count+=sessionCount(s);
    group.weight+=sessionWeight(s);
    group.sessions.push(s);
    group.sessionPhotos=uniqueStrings(group.sessionPhotos.concat(photos(s)));
    var sd=latestSessionDate(s);
    if(newerDate(sd,group.date)){
      group.date=sd;
      group.note=s.note||s.description||group.note;
      group.raw=s;
    }
    if(matched)caughtPlaceIds[matched.id]=1;
  });

  places.forEach(function(p){
    if(caughtPlaceIds[p.id])return;
    out.push({
      id:p.id,
      kind:'place',
      name:p.name,
      sub:p.sub,
      lat:p.lat,
      lon:p.lon,
      favorite:p.favorite,
      type:p.type,
      note:p.note,
      date:p.date,
      photo:p.photos[0]||'',
      photos:p.photos,
      raw:p.raw
    });
  });

  groups.forEach(function(g){
    var placePics=g.place?g.place.photos:[];
    var allPics=uniqueStrings(placePics.concat(g.sessionPhotos));
    var note=g.note||(g.place&&g.place.note)||'';
    out.push({
      id:g.id,
      kind:'catch',
      name:g.name,
      sub:(dateText(g.date)||'Túra')+' · '+g.count+' hal',
      lat:g.lat,
      lon:g.lon,
      favorite:g.favorite,
      type:'Fogási pont',
      note:note,
      date:g.date,
      weight:g.weight,
      count:g.count,
      photo:allPics[0]||'',
      photos:allPics,
      raw:g.raw,
      sessions:g.sessions,
      place:g.place&&g.place.raw
    });
  });

  var userCoords=normalizeCoords(window.lat,window.lon);
  out=out.filter(validPoint);
  out.forEach(function(p){p.dist=userCoords?distKm(userCoords.lat,userCoords.lon,p.lat,p.lon):null});
  return out;
}
function filtered(){
  var q=state.search.toLowerCase();
  var list=points().filter(function(p){
    if(state.mode==='places'&&p.kind!=='place')return false;
    if(state.mode==='catches'&&p.kind!=='catch')return false;
    if(state.mode==='favorites'&&!p.favorite)return false;
    var hay=[p.name,p.sub,p.type,p.note].join(' ').toLowerCase();
    return !q||hay.indexOf(q)>-1;
  });
  if(state.sort==='near')list.sort(function(a,b){return (a.dist==null?99999:a.dist)-(b.dist==null?99999:b.dist)});
  else list.sort(function(a,b){return (dval(b.date)||0)-(dval(a.date)||0)});
  return list;
}
function summary(list){return{places:list.filter(function(p){return p.kind==='place'}).length,catches:list.filter(function(p){return p.kind==='catch'}).length,fav:list.filter(function(p){return p.favorite}).length,total:list.length}}
function bgStyle(url){return 'style="background-image:url(&quot;'+esc(url)+'&quot;)"'}
function popupPhotos(p){var pics=arr(p.photos).slice(0,3);return pics.length?'<div class="kpmap-popup-photos">'+pics.map(function(src){return '<img src="'+esc(src)+'" alt="">'}).join('')+'</div>':''}
function popupHtml(p){return popupPhotos(p)+'<b>'+esc(p.name)+'</b><br>'+esc(p.type)}
function detailPhotos(p){
  var pics=arr(p.photos);
  if(!pics.length)return '<div class="kpmap-photo empty"></div>';
  return '<div class="kpmap-photo" '+bgStyle(pics[0])+'></div>'+(pics.length>1?'<div class="kpmap-photo-strip">'+pics.slice(1,5).map(function(src){return '<img src="'+esc(src)+'" alt="">'}).join('')+'</div>':'');
}
function render(){
  var page=document.getElementById('page-map');if(!page||!page.classList.contains('active'))return;
  addCss();
  var list=filtered(),sum=summary(list);
  if(!state.selected&&list[0])state.selected=list[0].id;
  var sel=list.find(function(p){return p.id===state.selected})||list[0];
  if(sel)state.selected=sel.id;
  page.innerHTML='<div class="kpmap"><header class="kpmap-head"><div><h1><i class="ti ti-map"></i> Térkép</h1><p>Horgászhelyeim és fogási pontok.</p></div><button class="kpmap-add" id="kpmap-add"><i class="ti ti-plus"></i> Hely hozzáadása</button></header><nav class="kpmap-tabs"><button data-mode="all" class="'+(state.mode==='all'?'active':'')+'"><i class="ti ti-grid-dots"></i> Összes hely</button><button data-mode="places" class="'+(state.mode==='places'?'active':'')+'"><i class="ti ti-map-pin"></i> Horgászhelyeim</button><button data-mode="catches" class="'+(state.mode==='catches'?'active':'')+'"><i class="ti ti-fish"></i> Fogási pontok</button><button data-mode="favorites" class="'+(state.mode==='favorites'?'active':'')+'"><i class="ti ti-star"></i> Kedvencek</button></nav><section class="kpmap-map-wrap"><div id="kpmap-map"></div><div class="kpmap-controls"><button id="kpmap-locate"><i class="ti ti-current-location"></i></button><button id="kpmap-zoom-in">+</button><button id="kpmap-zoom-out">−</button></div><aside class="kpmap-legend"><h3>Jelmagyarázat</h3><p><span class="pin green"></span>Horgászhely</p><p><span class="pin blue"></span>Fogási pont</p><p><span class="pin yellow"></span>Kedvenc hely</p><hr><h3>Szűrés</h3><button data-mode="all">Összes megjelenítése</button><button data-mode="places">Csak horgászhelyek</button><button data-mode="catches">Csak fogások</button><button data-mode="favorites">Csak kedvencek</button></aside><div class="kpmap-counts"><span><i class="ti ti-map-pin"></i><b>'+sum.places+'</b><em>Horgászhely</em></span><span><i class="ti ti-fish"></i><b>'+sum.catches+'</b><em>Fogási pont</em></span><span><i class="ti ti-star"></i><b>'+sum.fav+'</b><em>Kedvenc hely</em></span><span><b>'+sum.total+'</b><em>Összesen</em></span></div></section><section class="kpmap-bottom"><div class="kpmap-list"><div class="kpmap-card-head"><h2>Helyek listája</h2><select id="kpmap-sort"><option value="recent" '+(state.sort==='recent'?'selected':'')+'>Legutóbbi</option><option value="near" '+(state.sort==='near'?'selected':'')+'>Legközelebbi</option></select></div><label class="kpmap-search"><i class="ti ti-search"></i><input id="kpmap-search" value="'+esc(state.search)+'" placeholder="Keresés helyek között..."></label><div class="kpmap-items">'+(list.map(listItem).join('')||'<div class="kpmap-empty">Nincs megjeleníthető pont. A fogási pontokhoz GPS-es hely vagy azonos nevű mentett horgászhely kell.</div>')+'</div></div>'+detail(sel)+'</section></div>';
  wire();
  setTimeout(function(){drawMap(list,sel)},80);
}
function listItem(p){return '<article class="kpmap-item '+(p.id===state.selected?'active':'')+'" data-id="'+esc(p.id)+'"><span class="kpmap-dot '+(p.favorite?'fav':p.kind)+'"><i class="ti '+(p.kind==='catch'?'ti-fish':'ti-map-pin')+'"></i></span><div><b>'+esc(p.name)+'</b><small>'+esc(p.sub)+(p.dist!=null?' · '+p.dist.toFixed(1)+' km':'')+'</small></div><i class="ti ti-chevron-right"></i></article>'}
function detail(p){
  if(!p)return '<article class="kpmap-detail"><div class="kpmap-empty">Válassz ki egy pontot a térképen.</div></article>';
  return '<article class="kpmap-detail">'+detailPhotos(p)+'<span class="kpmap-badge">'+esc(p.type)+'</span><button class="kpmap-star '+(p.favorite?'active':'')+'">☆</button><h2>'+esc(p.name)+'</h2><p><i class="ti ti-map-pin"></i> '+esc(p.sub)+(p.dist!=null?' · '+p.dist.toFixed(1)+' km':'')+'</p><div class="kpmap-info"><div><i class="ti ti-calendar"></i><span>Legutóbbi adat</span><b>'+(dateText(p.date)||'Nincs dátum')+'</b></div><div><i class="ti ti-fish"></i><span>Összes fogás</span><b>'+(p.kind==='catch'?p.count+' db / '+fmt(p.weight)+' kg':'Hely adat')+'</b></div><div><i class="ti ti-route"></i><span>Appon belüli útvonal</span><b>GPS-től pontig</b></div></div><h3>Megjegyzés</h3><p>'+esc(p.note||'Ehhez a ponthoz még nincs külön megjegyzés.')+'</p><div class="kpmap-actions"><button id="kpmap-nav"><i class="ti ti-navigation"></i> Navigálj oda</button><button id="kpmap-more"><i class="ti ti-list"></i> Részletek</button></div></article>';
}
function invalidateMapSize(){
  try{
    if(map&&map._container&&document.body.contains(map._container))map.invalidateSize(true);
  }catch(e){}
}
function scheduleInvalidate(){
  [0,180,500,1050,1950].forEach(function(ms){setTimeout(invalidateMapSize,ms)});
  if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(invalidateMapSize)});
  var boot=document.getElementById('kp-boot-hide');
  if(boot&&typeof MutationObserver!=='undefined'&&!bootObserver){
    bootObserver=new MutationObserver(function(){
      if(!document.getElementById('kp-boot-hide')){
        invalidateMapSize();
        setTimeout(invalidateMapSize,180);
        bootObserver.disconnect();
        bootObserver=null;
      }
    });
    bootObserver.observe(document.head||document.documentElement,{childList:true,subtree:true});
  }
}
function drawMap(list,sel){
  var el=document.getElementById('kpmap-map');if(!el)return;
  if(map){try{map.remove()}catch(e){}map=null;markers=[];routeLayer=null;userMarker=null}
  var validList=arr(list).filter(validPoint);
  var safeSel=sel&&validPoint(sel)?sel:null;
  if(typeof L==='undefined'){drawStaticMap(el,validList);return}
  var center=safeSel?[safeSel.lat,safeSel.lon]:(validList[0]?[validList[0].lat,validList[0].lon]:[47.95,21.38]);
  map=L.map(el,{zoomControl:false}).setView(center,safeSel||validList[0]?12:9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:''}).addTo(map);
  validList.forEach(function(p){
    var icon=L.divIcon({className:'',html:'<div class="kpmap-marker '+(p.favorite?'fav':p.kind)+'"><i class="ti '+(p.kind==='catch'?'ti-fish':'ti-map-pin')+'"></i></div>',iconSize:[34,34],iconAnchor:[17,32]});
    var m=L.marker([p.lat,p.lon],{icon:icon}).addTo(map).bindPopup(popupHtml(p));
    m.on('click',function(){state.selected=p.id;render()});
    markers.push(m);
  });
  if(markers.length&&!safeSel){try{map.fitBounds(L.featureGroup(markers).getBounds().pad(.20))}catch(e){}}
  scheduleInvalidate();
}
function drawStaticMap(el,list){
  var validList=arr(list).filter(validPoint);
  el.innerHTML='<div class="kpmap-static"><b>Térképpontok</b>'+validList.slice(0,12).map(function(p,i){var l=8+((i*23)%82),t=18+((i*37)%62);return '<button class="kpmap-marker-static '+(p.favorite?'fav':p.kind)+'" data-id="'+esc(p.id)+'" style="left:'+l+'%;top:'+t+'%"><i class="ti '+(p.kind==='catch'?'ti-fish':'ti-map-pin')+'"></i></button>'}).join('')+'</div>';
  el.querySelectorAll('[data-id]').forEach(function(b){b.onclick=function(){state.selected=b.dataset.id;render()}});
}
function startInAppNav(p){
  if(!p||!validPoint(p)){toast('Ehhez a ponthoz nincs érvényes GPS-koordináta.');return;}
  function draw(pos){
    var pc=normalizeCoords(pos.lat,pos.lon);if(!pc||!map||typeof L==='undefined')return;
    var from=[pc.lat,pc.lon],to=[p.lat,p.lon];
    if(routeLayer)map.removeLayer(routeLayer);
    if(userMarker)map.removeLayer(userMarker);
    routeLayer=L.polyline([from,to],{color:'#5dff91',weight:5,opacity:.95,dashArray:'10 8'}).addTo(map);
    userMarker=L.circleMarker(from,{radius:8,color:'#ffffff',weight:3,fillColor:'#2ed5ff',fillOpacity:1}).addTo(map).bindPopup('Jelenlegi pozíció');
    map.fitBounds(L.latLngBounds(from,to).pad(.25));
    scheduleInvalidate();
    toast('Útvonal megjelenítve a térképen.');
  }
  var cached=normalizeCoords(window.lat,window.lon);
  if(navigator.geolocation){
    toast('GPS pozíció lekérése…');
    navigator.geolocation.getCurrentPosition(function(pos){window.lat=pos.coords.latitude;window.lon=pos.coords.longitude;draw({lat:window.lat,lon:window.lon})},function(){if(cached){draw(cached);toast('Korábbi GPS pozícióból rajzoltam útvonalat.')}else toast('Nem sikerült GPS pozíciót kérni az útvonalhoz.')},{enableHighAccuracy:true,timeout:12000,maximumAge:0});
  }else if(cached)draw(cached);else toast('A készülék nem adott GPS pozíciót.');
}
function wire(){
  document.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){state.mode=b.dataset.mode;state.selected=null;render()}});
  document.querySelectorAll('.kpmap-item').forEach(function(it){it.onclick=function(){state.selected=it.dataset.id;render()}});
  var search=document.getElementById('kpmap-search');if(search)search.oninput=function(){state.search=search.value;render()};
  var sort=document.getElementById('kpmap-sort');if(sort)sort.onchange=function(){state.sort=sort.value;render()};
  var add=document.getElementById('kpmap-add');if(add)add.onclick=function(){if(typeof showPage==='function')showPage('spotfinder');else toast('A hely hozzáadása a Helyek menüben érhető el.')};
  var zi=document.getElementById('kpmap-zoom-in');if(zi)zi.onclick=function(){if(map)map.zoomIn()};
  var zo=document.getElementById('kpmap-zoom-out');if(zo)zo.onclick=function(){if(map)map.zoomOut()};
  var loc=document.getElementById('kpmap-locate');if(loc)loc.onclick=function(){if(navigator.geolocation)navigator.geolocation.getCurrentPosition(function(pos){var c=normalizeCoords(pos.coords.latitude,pos.coords.longitude);if(!c)return toast('A GPS érvénytelen koordinátát adott.');window.lat=c.lat;window.lon=c.lon;if(map)map.setView([c.lat,c.lon],13);scheduleInvalidate();toast('GPS pozíció frissítve.')},function(){toast('A GPS pozíció nem érhető el.')},{enableHighAccuracy:true,timeout:12000,maximumAge:0})};
  var nav=document.getElementById('kpmap-nav');if(nav)nav.onclick=function(){var p=points().find(function(x){return x.id===state.selected});startInAppNav(p)};
  var more=document.getElementById('kpmap-more');if(more)more.onclick=function(){if(typeof showPage==='function')showPage('spotfinder')};
}
function addCss(){if(document.getElementById('kpmap-css-v3'))return;var s=document.createElement('style');s.id='kpmap-css-v3';s.textContent='\
#page-map{padding:0!important}.kpmap{color:#f4fff9}.kpmap-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.kpmap-head h1{font-size:30px;margin:0 0 6px;display:flex;gap:12px;align-items:center}.kpmap-head p{margin:0;color:rgba(230,255,248,.72)}.kpmap-add{background:linear-gradient(135deg,#17c878,#21d5d5);color:#031715;border:0;border-radius:14px;padding:13px 18px;font-weight:900}.kpmap-tabs{display:flex;gap:14px;overflow:auto;margin-bottom:16px}.kpmap-tabs button{border:1px solid rgba(174,255,230,.16);background:rgba(255,255,255,.06);color:#f4fff9;border-radius:999px;padding:13px 18px;font-weight:900;white-space:nowrap}.kpmap-tabs .active{background:linear-gradient(135deg,rgba(35,201,130,.75),rgba(35,201,160,.28));border-color:rgba(93,255,145,.45)}.kpmap-map-wrap{height:520px;position:relative;border-radius:24px;overflow:hidden;border:1px solid rgba(174,255,230,.16);background:#dbe6df;box-shadow:0 26px 80px rgba(0,0,0,.30)}#kpmap-map{height:100%;width:100%;background:#dbe6df}#kpmap-map .leaflet-tile{filter:saturate(.85) brightness(.98) contrast(1.04)}.kpmap-controls{position:absolute;left:18px;top:140px;z-index:600;display:grid;gap:9px}.kpmap-controls button{width:48px;height:48px;border-radius:13px;border:1px solid rgba(174,255,230,.16);background:rgba(5,24,22,.88);color:#fff;font-size:24px}.kpmap-legend{position:absolute;right:18px;top:18px;z-index:600;width:240px;background:rgba(8,36,33,.88);border:1px solid rgba(174,255,230,.17);border-radius:20px;padding:16px;backdrop-filter:blur(12px)}.kpmap-legend h3{font-size:13px;text-transform:uppercase;margin:0 0 12px;color:#dffdf4}.kpmap-legend p{display:flex;gap:10px;align-items:center}.kpmap-legend button{display:block;width:100%;text-align:left;margin:7px 0;background:rgba(255,255,255,.05);border:0;color:#f4fff9;border-radius:11px;padding:10px}.pin{width:18px;height:18px;border-radius:50%;display:inline-block}.pin.green{background:#27d77f}.pin.blue{background:#1d8ee8}.pin.yellow{background:#ffd400}.kpmap-counts{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:600;display:grid;grid-template-columns:repeat(4,1fr);min-width:560px;background:rgba(8,36,33,.88);border:1px solid rgba(174,255,230,.17);border-radius:18px;overflow:hidden}.kpmap-counts span{padding:14px 18px;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;border-right:1px solid rgba(174,255,230,.10)}.kpmap-counts i{grid-row:1/3;color:#27d77f;font-size:24px}.kpmap-counts b{font-size:22px}.kpmap-counts em{font-style:normal;color:rgba(230,255,248,.70);font-size:12px}.kpmap-marker{width:34px;height:34px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);display:grid;place-items:center;border:2px solid rgba(255,255,255,.95);box-shadow:0 0 26px rgba(0,0,0,.25)}.kpmap-marker i{transform:rotate(45deg);color:#fff}.kpmap-marker.place{background:#20bf6b}.kpmap-marker.catch{background:#207fd5}.kpmap-marker.fav{background:#e5bf12}.kpmap-bottom{display:grid;grid-template-columns:420px 1fr;gap:24px;margin-top:24px}.kpmap-list,.kpmap-detail{background:rgba(8,36,33,.82);border:1px solid rgba(174,255,230,.16);border-radius:22px;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.25)}.kpmap-card-head{display:flex;justify-content:space-between;align-items:center}.kpmap-card-head h2{font-size:17px;margin:0}.kpmap-card-head select,.kpmap-search{background:#082421;color:#f4fff9;border:1px solid rgba(174,255,230,.22);border-radius:13px}.kpmap-card-head select{padding:10px}.kpmap-search{display:flex;gap:8px;align-items:center;padding:0 12px;height:46px;margin:14px 0}.kpmap-search input{background:transparent;border:0;color:#f4fff9;outline:0;width:100%}.kpmap-items{display:grid;gap:10px}.kpmap-item{display:grid;grid-template-columns:44px 1fr 20px;gap:12px;align-items:center;border:1px solid rgba(174,255,230,.10);background:rgba(255,255,255,.04);border-radius:15px;padding:11px;cursor:pointer}.kpmap-item.active{background:rgba(31,201,131,.16);border-color:rgba(31,201,131,.55)}.kpmap-item b{display:block}.kpmap-item small{color:rgba(230,255,248,.68)}.kpmap-dot{width:42px;height:42px;border-radius:50%;display:grid;place-items:center}.kpmap-dot.place{background:#20bf6b}.kpmap-dot.catch{background:#207fd5}.kpmap-dot.fav{background:#e5bf12}.kpmap-photo{height:190px;background:linear-gradient(135deg,#246155,#123b35);background-size:cover;background-position:center;border-radius:18px;margin-bottom:14px}.kpmap-photo-strip{display:flex;gap:8px;overflow:auto;margin:-4px 0 14px;padding-bottom:2px}.kpmap-photo-strip img{width:82px;height:58px;object-fit:cover;border-radius:11px;border:1px solid rgba(174,255,230,.18);flex:0 0 auto}.kpmap-popup-photos{display:flex;gap:5px;margin-bottom:7px;max-width:230px;overflow:hidden}.kpmap-popup-photos img{width:68px;height:48px;object-fit:cover;border-radius:7px}.kpmap-badge{float:right;background:rgba(35,201,130,.20);border:1px solid rgba(93,255,145,.24);color:#baffec;border-radius:999px;padding:7px 11px}.kpmap-star{float:right;margin-right:8px;background:transparent;border:0;color:#ffd400;font-size:28px}.kpmap-detail h2{font-size:24px;margin:20px 0 6px}.kpmap-detail p{color:rgba(230,255,248,.74)}.kpmap-info{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0;border-top:1px solid rgba(174,255,230,.10);border-bottom:1px solid rgba(174,255,230,.10);padding:14px 0}.kpmap-info div{display:grid;gap:4px}.kpmap-info i{color:#31f1af}.kpmap-info span{font-size:12px;color:rgba(230,255,248,.64)}.kpmap-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.kpmap-actions button{border:1px solid rgba(174,255,230,.16);background:rgba(255,255,255,.06);color:#fff;border-radius:14px;padding:13px;font-weight:900}.kpmap-actions button:first-child{background:linear-gradient(135deg,#17c878,#21d5d5);color:#031715;border:0}.kpmap-static{position:relative;height:100%;background:radial-gradient(circle,#8fc9b6,#4d8c7e)}.kpmap-static>b{position:absolute;left:18px;top:18px;color:#06221f}.kpmap-marker-static{position:absolute;width:38px;height:38px;border-radius:50%;border:2px solid #fff;color:#fff}.kpmap-marker-static.place{background:#20bf6b}.kpmap-marker-static.catch{background:#207fd5}.kpmap-marker-static.fav{background:#e5bf12}@media(max-width:980px){.kpmap-head{display:block}.kpmap-add{margin-top:14px}.kpmap-map-wrap{height:480px}.kpmap-legend{display:none}.kpmap-counts{min-width:0;left:14px;right:14px;transform:none;grid-template-columns:repeat(2,1fr)}.kpmap-bottom{grid-template-columns:1fr}.kpmap-info{grid-template-columns:1fr}.kpmap-tabs{padding-bottom:4px}}@media(max-width:560px){#page-map{padding-bottom:90px!important}.kpmap-head h1{font-size:28px}.kpmap-map-wrap{height:430px;border-radius:20px}.kpmap-controls{top:120px;left:12px}.kpmap-controls button{width:44px;height:44px}.kpmap-counts{font-size:12px}.kpmap-counts span{padding:10px}.kpmap-bottom{gap:14px;margin-top:14px}.kpmap-list,.kpmap-detail{padding:14px;border-radius:18px}.kpmap-photo{height:150px}.kpmap-tabs button{padding:12px 15px}}';document.head.appendChild(s)}
window.KP_RENDER_MAP=render;
var old=window.showPage;
if(typeof old==='function'&&!old.__kpMapModernV3){window.showPage=function(id,el){var r=old.apply(this,arguments);setTimeout(function(){if(id==='map')render()},160);return r};window.showPage.__kpMapModernV3=true}
window.addEventListener('resize',function(){setTimeout(invalidateMapSize,80)});
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(invalidateMapSize,80)});
setTimeout(render,800);
})();
