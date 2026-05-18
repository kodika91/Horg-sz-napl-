(function(){
  if(window.KP_V35_HOME_BAN_RENDER_TEXT)return;
  window.KP_V35_HOME_BAN_RENDER_TEXT=true;

  var data={
    'Ponty':['ponty','assets/fish/ponty.jpg','Máj. 4 – Máj. 29'],
    'Compó':['compó','assets/fish/compó.jpg','Máj. 4 – Jún. 13'],
    'Szilvaorrú keszeg':['szilvaorru','assets/fish/szilvaorru.jpg','Ápr. 15 – Máj. 29'],
    'Paduc':['paduc','assets/fish/paduc.jpg','Ápr. 15 – Máj. 29'],
    'Márna':['marna','assets/fish/marna.jpg','Ápr. 15 – Máj. 29'],
    'Jászkeszeg':['jászkeszeg','assets/fish/jászkeszeg.jpg','Ápr. 15 – Máj. 29'],
    'Fejes domolykó':['domolyko','assets/fish/domolyko.jpg','Ápr. 15 – Máj. 29'],
    'Domolykó':['domolyko','assets/fish/domolyko.jpg','Ápr. 15 – Máj. 29'],
    'Kősüllő':['kosullo','assets/fish/kosullo.jpg','Már. 1 – Jún. 30'],
    'Harcsa':['harcsa','assets/fish/harcsa.jpg','Máj. 4 – Jún. 13']
  };

  function addStyle(){
    if(document.getElementById('kp-v35-home-ban-style'))return;
    var s=document.createElement('style');
    s.id='kp-v35-home-ban-style';
    s.textContent='#ban-alert.kp-v35-wrap{padding:14px!important;align-items:flex-start!important}.kp-v35-box{width:100%}.kp-v35-title{font-size:15px;font-weight:900;color:var(--danger,#a03030);margin-bottom:6px}.kp-v35-sub{font-size:11px;line-height:1.4;color:#8a4b4b;margin-bottom:12px;font-weight:600}.kp-v35-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.kp-v35-card{border:1px solid rgba(160,48,48,.18);border-radius:16px;background:rgba(255,252,248,.94);overflow:hidden;box-shadow:0 6px 18px rgba(58,39,18,.08);cursor:pointer;text-align:left;padding:0}.kp-v35-img{height:74px;background:#eadfce;overflow:hidden;display:flex;align-items:center;justify-content:center}.kp-v35-img img{width:100%;height:100%;object-fit:cover}.kp-v35-body{padding:8px 9px 10px}.kp-v35-name{font-size:12px;font-weight:900;color:var(--text,#2a2018);line-height:1.15}.kp-v35-rule{font-size:10px;font-weight:800;color:var(--danger,#a03030);margin-top:5px;line-height:1.25}.kp-v35-more{margin-top:10px;width:100%;min-height:42px;border:none;border-radius:14px;background:linear-gradient(135deg,var(--danger,#a03030),#b75b3b);color:#fff;font-weight:900;font-size:12px}@media(min-width:640px){.kp-v35-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  function namesFromText(t){
    t=String(t||'');
    var a=t.indexOf('alatt:');
    var b=t.indexOf('. A helyi');
    if(a<0||b<0||b<=a)return [];
    return t.slice(a+6,b).split(',').map(function(x){return x.trim()}).filter(Boolean);
  }

  function card(name){
    var d=data[name]||['','', 'Aktív tilalom'];
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='kp-v35-card';
    var imgbox=document.createElement('div');
    imgbox.className='kp-v35-img';
    if(d[1]){var im=document.createElement('img');im.src=d[1];im.alt=name;imgbox.appendChild(im);}else{imgbox.textContent='🐟';}
    var body=document.createElement('div');body.className='kp-v35-body';
    var n=document.createElement('div');n.className='kp-v35-name';n.textContent=name;
    var r=document.createElement('div');r.className='kp-v35-rule';r.textContent=d[2];
    body.appendChild(n);body.appendChild(r);btn.appendChild(imgbox);btn.appendChild(body);
    btn.addEventListener('click',function(){if(d[0]&&typeof window.openFishDetail==='function')window.openFishDetail(d[0]);});
    return btn;
  }

  function render(){
    var alert=document.getElementById('ban-alert');
    var el=document.getElementById('ban-text');
    if(!alert||!el)return;
    if(el.querySelector('.kp-v35-box'))return;
    var list=namesFromText(el.textContent);
    if(!list.length)return;
    addStyle();
    alert.classList.add('kp-v35-wrap');
    el.textContent='';
    var box=document.createElement('div');box.className='kp-v35-box';
    var title=document.createElement('div');title.className='kp-v35-title';title.textContent='⚠️ Aktív tilalmi időszak!';
    var sub=document.createElement('div');sub.className='kp-v35-sub';sub.textContent='Jelenleg '+list.length+' halfaj érintett. Koppints a halfajra a részletekhez. A helyi horgászrend eltérhet.';
    var grid=document.createElement('div');grid.className='kp-v35-grid';
    list.slice(0,6).forEach(function(n){grid.appendChild(card(n));});
    box.appendChild(title);box.appendChild(sub);box.appendChild(grid);
    if(list.length>6){var more=document.createElement('button');more.type='button';more.className='kp-v35-more';more.textContent='Összes tilalmi hal megnyitása';more.addEventListener('click',function(){if(typeof window.showPage==='function')window.showPage('fish');setTimeout(function(){if(typeof window.setFishFilter==='function')window.setFishFilter('banned');},250);});box.appendChild(more);}
    el.appendChild(box);
  }

  function run(){render();setTimeout(render,300);setTimeout(render,900);}
  run();
  setInterval(run,1600);
})();
