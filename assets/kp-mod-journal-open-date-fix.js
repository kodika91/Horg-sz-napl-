// kp-mod-journal-open-date-fix.js — Napló megnyitás és dátummegjelenítés javítása
(function(){
'use strict';
if(window.KP_MOD_JOURNAL_OPEN_DATE_FIX)return;
window.KP_MOD_JOURNAL_OPEN_DATE_FIX=true;

var HU_MONTHS=['Jan','Feb','Már','Ápr','Máj','Jún','Júl','Aug','Sze','Okt','Nov','Dec'];

function escAttr(value){
  return String(value==null?'':value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function dateParts(value){
  var text=String(value||'').trim();
  var match=text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(match){
    var month=Number(match[2]),day=Number(match[3]);
    if(month>=1&&month<=12&&day>=1&&day<=31){
      return {month:HU_MONTHS[month-1],day:day,full:match[1]+'.'+match[2]+'.'+match[3]+'.'};
    }
  }
  var parsed=new Date(text);
  if(Number.isNaN(parsed.getTime()))return null;
  return {
    month:HU_MONTHS[parsed.getMonth()],
    day:parsed.getDate(),
    full:parsed.getFullYear()+'.'+String(parsed.getMonth()+1).padStart(2,'0')+'.'+String(parsed.getDate()).padStart(2,'0')+'.'
  };
}
function patchSessionHtml(){
  var original=window.sessionHTML;
  if(typeof original!=='function'||original.__kpJournalOpenDateFix)return false;
  function fixedSessionHTML(session){
    var html=original.apply(this,arguments);
    var parts=dateParts(session&&session.date);
    if(parts){
      html=html.replace(/<div class="session-date-box"><div class="sdb-month">[\s\S]*?<\/div><div class="sdb-day">[\s\S]*?<\/div><\/div>/,
        '<div class="session-date-box"><div class="sdb-month">'+parts.month+'</div><div class="sdb-day">'+parts.day+'</div></div>');
    }
    var id=session&&session.id!=null?String(session.id):'';
    if(id){
      html=html.replace(/\s+onclick="openSessionDetail\([^\"]*\)"/,
        ' data-session-id="'+escAttr(id)+'" role="button" tabindex="0"');
    }
    return html;
  }
  fixedSessionHTML.__kpJournalOpenDateFix=true;
  fixedSessionHTML.__original=original;
  window.sessionHTML=fixedSessionHTML;
  return true;
}
function patchDetailDate(){
  var tag=document.querySelector('#page-session-detail .detail-meta .tag-water');
  if(!tag)return;
  var parts=dateParts(tag.textContent);
  if(!parts)return;
  tag.innerHTML='<i class="ti ti-calendar"></i>'+parts.full;
}
function patchDetailRenderer(){
  var original=window.renderSessionDetail;
  if(typeof original!=='function'||original.__kpJournalOpenDateFix)return false;
  function fixedRenderSessionDetail(){
    var result=original.apply(this,arguments);
    setTimeout(patchDetailDate,0);
    return result;
  }
  fixedRenderSessionDetail.__kpJournalOpenDateFix=true;
  fixedRenderSessionDetail.__original=original;
  window.renderSessionDetail=fixedRenderSessionDetail;
  return true;
}
function openItem(item){
  var id=item&&item.dataset&&item.dataset.sessionId;
  if(!id)return;
  if(typeof window.openSessionDetail==='function')window.openSessionDetail(id);
}
document.addEventListener('click',function(event){
  var item=event.target.closest&&event.target.closest('.session-item[data-session-id]');
  if(!item)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openItem(item);
},true);
document.addEventListener('keydown',function(event){
  if(event.key!=='Enter'&&event.key!==' ')return;
  var item=event.target.closest&&event.target.closest('.session-item[data-session-id]');
  if(!item)return;
  event.preventDefault();
  openItem(item);
},true);

var tries=0;
var timer=setInterval(function(){
  var a=patchSessionHtml();
  var b=patchDetailRenderer();
  tries++;
  if((a||window.sessionHTML&&window.sessionHTML.__kpJournalOpenDateFix)&&(b||window.renderSessionDetail&&window.renderSessionDetail.__kpJournalOpenDateFix)){
    clearInterval(timer);
    try{if(document.getElementById('page-sessions')&&document.getElementById('page-sessions').classList.contains('active')&&typeof window.renderSessionsList==='function')window.renderSessionsList();}catch(e){}
  }else if(tries>80){clearInterval(timer);}
},100);
})();
