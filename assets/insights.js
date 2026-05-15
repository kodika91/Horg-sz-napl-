(function(){
  function addStyle(){
    if(document.getElementById('insights-style')) return;
    var s=document.createElement('style');
    s.id='insights-style';
    s.textContent='.insights-entry{display:block;width:calc(100% - 32px);max-width:720px;margin:14px auto 18px;border:1px solid rgba(40,90,70,.18);background:#fbfaf4;color:#24301f;border-radius:20px;padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,.08);font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:left}.insights-entry strong{display:block;font-size:18px;margin-bottom:4px}.insights-entry span{display:block;font-size:13px;color:#746858;line-height:1.35}.insights-panel{position:fixed;inset:0;display:none;z-index:100000;background:rgba(0,0,0,.42);padding:20px 12px;overflow:auto}.insights-panel.show{display:flex;align-items:flex-start;justify-content:center}.insights-card{width:min(880px,100%);background:#fbfaf4;border-radius:24px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.28);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#24301f}.insights-head{background:linear-gradient(135deg,#244238,#3f7e72);color:#fff;padding:18px;display:flex;justify-content:space-between;gap:12px}.insights-head h2{margin:0;font-size:21px}.insights-head p{margin:5px 0 0;font-size:13px;opacity:.88}.insights-close{border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.16);color:#fff;border-radius:14px;padding:8px 11px;font-weight:800}.insights-body{padding:16px}.insights-box{background:#fff;border:1px solid #e4e5dd;border-radius:18px;padding:14px;margin-bottom:12px}.insights-box h3{margin:0 0 8px;font-size:16px}.insights-box ul{margin:0;padding-left:20px;line-height:1.55}.insights-note{background:#f0eadb;border-left:5px solid #3f7e72;border-radius:14px;padding:12px;line-height:1.45}';
    document.head.appendChild(s);
  }
  function readSummary(){
    var keys=[];
    for(var i=0;i<localStorage.length;i++) keys.push(localStorage.key(i));
    var likely=keys.filter(function(k){return /fog|catch|naplo|napló|session|horg|fish|hal/i.test(k);});
    return {all:keys.length,likely:likely.slice(0,8)};
  }
  function openPanel(){
    addStyle();
    var info=readSummary();
    var panel=document.getElementById('insights-panel');
    if(!panel){
      panel=document.createElement('div');
      panel.id='insights-panel';
      panel.className='insights-panel';
      panel.innerHTML='<div class="insights-card"><div class="insights-head"><div><h2>Elemzések / Tanulságok</h2><p>A meglévő naplóadatokból készülő összegző modul.</p></div><button class="insights-close" type="button">Bezár</button></div><div class="insights-body"></div></div>';
      document.body.appendChild(panel);
      panel.querySelector('.insights-close').onclick=function(){panel.classList.remove('show')};
      panel.onclick=function(e){if(e.target===panel)panel.classList.remove('show')};
    }
    var list=info.likely.length?info.likely.map(function(k){return '<li>'+k+'</li>';}).join(''):'<li>Még nem találtam kiolvasható naplókulcsot ezen az eszközön.</li>';
    panel.querySelector('.insights-body').innerHTML='<div class="insights-box"><h3>Adatellenőrzés</h3><ul><li>Helyi tárhely kulcsok száma: '+info.all+'</li>'+list+'</ul></div><div class="insights-box"><h3>Következő lépés</h3><div class="insights-note">A modul már külön menüpontként működik. A következő finomításban a pontos fogás-, csali- és helyszínmezőkre kötöm rá, hogy valódi tanulságokat számoljon.</div></div>';
    panel.classList.add('show');
  }
  function visible(el){
    if(!el || !el.getBoundingClientRect) return false;
    var r=el.getBoundingClientRect();
    return r.width>120 && r.height>80 && r.bottom>0 && r.top<window.innerHeight;
  }
  function target(){
    var selectors=['main','.page.active','.view.active','.screen.active','.content','.page-content','.more-page','.settings','section'];
    for(var i=0;i<selectors.length;i++){
      var nodes=document.querySelectorAll(selectors[i]);
      for(var j=0;j<nodes.length;j++) if(visible(nodes[j])) return nodes[j];
    }
    return document.body;
  }
  function mount(){
    addStyle();
    var old=document.getElementById('insights-btn');
    if(old) old.remove();
    if(document.getElementById('insights-entry')) return;
    var b=document.createElement('button');
    b.id='insights-entry';
    b.className='insights-entry';
    b.type='button';
    b.innerHTML='<strong>Elemzések / Tanulságok</strong><span>Naplóadatok összegzése és horgászati minták.</span>';
    b.onclick=openPanel;
    target().appendChild(b);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  setTimeout(mount,1200);
  setTimeout(mount,3000);
  document.addEventListener('click',function(){setTimeout(mount,350)},true);
})();
