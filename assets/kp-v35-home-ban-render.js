(function(){
  if(window.KP_V35_HOME_BAN_RENDER)return;
  window.KP_V35_HOME_BAN_RENDER=true;

  function text(v){return String(v==null?'':v)}
  function addStyle(){
    if(document.getElementById('kp-v35-home-ban-style'))return;
    var s=document.createElement('style');
    s.id='kp-v35-home-ban-style';
    s.textContent=''
      +'#ban-alert.kp-v35-wrap{padding:14px!important;align-items:flex-start!important}'
      +'.kp-v35-box{width:100%}'
      +'.kp-v35-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:900;color:var(--danger,#a03030);margin-bottom:6px}'
      +'.kp-v35-sub{font-size:11px;line-height:1.4;color:#8a4b4b;margin-bottom:12px;font-weight:600}'
      +'.kp-v35-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}'
      +'.kp-v35-card{border:1px solid rgba(160,48,48,.18);border-radius:16px;background:rgba(255,252,248,.94);overflow:hidden;box-shadow:0 6px 18px rgba(58,39,18,.08);cursor:pointer;text-align:left;padding:0}'
      +'.kp-v35-img{height:74px;background:linear-gradient(135deg,#efe5d7,#e6d7c3);overflow:hidden;display:flex;align-items:center;justify-content:center}'
      +'.kp-v35-img img{width:100%;height:100%;object-fit:cover;display:block}'
      +'.kp-v35-ph{font-size:28px;color:var(--text4,#b99d7a)}'
      +'.kp-v35-body{padding:8px 9px 10px}'
      +'.kp-v35-name{font-size:12px;font-weight:900;color:var(--text,#2a2018);line-height:1.15}'
      +'.kp-v35-rule{font-size:10px;font-weight:800;color:var(--danger,#a03030);margin-top:5px;line-height:1.25}'
      +'.kp-v35-more{margin-top:10px;width:100%;min-height:42px;border:none;border-radius:14px;background:linear-gradient(135deg,var(--danger,#a03030),#b75b3b);color:#fff;font-weight:900;font-size:12px}'
      +'@media(min-width:640px){.kp-v35-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  function fishImg(f){
    try{
      if(typeof window.getFishImage==='function'){
        var fi=window.getFishImage(f);
        if(fi&&fi.src)return fi.src;
      }
    }catch(e){}
    return f&&f.img?f.img:'';
  }

  function buildCard(f){
    var card=document.createElement('button');
    card.type='button';
    card.className='kp-v35-card';
    card.dataset.fishId=text(f.id);

    var imgWrap=document.createElement('div');
    imgWrap.className='kp-v35-img';
    var src=fishImg(f);
    if(src){
      var img=document.createElement('img');
      img.src=src;
      img.alt=text(f.name);
      imgWrap.appendChild(img);
    }else{
      var ph=document.createElement('div');
      ph.className='kp-v35-ph';
      ph.textContent='🐟';
      imgWrap.appendChild(ph);
    }

    var body=document.createElement('div');
    body.className='kp-v35-body';
    var name=document.createElement('div');
    name.className='kp-v35-name';
    name.textContent=text(f.name);
    var rule=document.createElement('div');
    rule.className='kp-v35-rule';
    rule.textContent=text(f.ban||'Aktív tilalom');
    body.appendChild(name);
    body.appendChild(rule);
    card.appendChild(imgWrap);
    card.appendChild(body);
    card.addEventListener('click',function(){
      if(typeof window.openFishDetail==='function')window.openFishDetail(f.id);
    });
    return card;
  }

  function render(){
    try{
      if(!Array.isArray(window.FISH_DB)||typeof window.isBanned!=='function')return;
      var active=window.FISH_DB.filter(function(f){return window.isBanned(f)});
      var alert=document.getElementById('ban-alert');
      var textEl=document.getElementById('ban-text');
      if(!alert||!textEl)return;
      if(!active.length){alert.style.display='none';return;}
      addStyle();
      alert.style.display='flex';
      alert.classList.add('kp-v35-wrap');
      textEl.textContent='';
      var box=document.createElement('div');
      box.className='kp-v35-box';
      var title=document.createElement('div');
      title.className='kp-v35-title';
      title.textContent='⚠️ Aktív tilalmi időszak!';
      var sub=document.createElement('div');
      sub.className='kp-v35-sub';
      sub.textContent='Jelenleg '+active.length+' halfaj érintett. Koppints a halfajra a részletekhez. A helyi horgászrend eltérhet.';
      var grid=document.createElement('div');
      grid.className='kp-v35-grid';
      active.slice(0,6).forEach(function(f){grid.appendChild(buildCard(f))});
      box.appendChild(title);
      box.appendChild(sub);
      box.appendChild(grid);
      if(active.length>6){
        var more=document.createElement('button');
        more.type='button';
        more.className='kp-v35-more';
        more.textContent='Összes tilalmi hal megnyitása';
        more.addEventListener('click',function(){
          if(typeof window.showPage==='function')window.showPage('fish');
          setTimeout(function(){
            if(typeof window.setFishFilter==='function')window.setFishFilter('banned');
          },250);
        });
        box.appendChild(more);
      }
      textEl.appendChild(box);
    }catch(e){console.warn('[KP v35] főoldali tilalom kártya hiba',e)}
  }

  function hook(){
    var old=window.checkBans;
    if(typeof old==='function'&&!old.KP_V35_WRAPPED){
      var wrapped=function(){
        var r=old.apply(this,arguments);
        setTimeout(render,20);
        return r;
      };
      wrapped.KP_V35_WRAPPED=true;
      window.checkBans=wrapped;
    }
    render();
  }

  hook();
  setTimeout(hook,500);
  setTimeout(render,1200);
  setTimeout(render,2500);
})();
