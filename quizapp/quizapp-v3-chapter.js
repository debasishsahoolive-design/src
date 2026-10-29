(function(){
  function boot(){
    if(window.__MH_V3_ADAPTER_STARTED__)return;
    var host=document.querySelector('[data-mode="chapter"]');
    if(!host)return;
    window.__MH_V3_ADAPTER_STARTED__=true;
    host.setAttribute('data-mh-v3-host','');
    var base=window.MH_V3_ASSET_BASE || 'https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@main/quizapp/';
    var link=document.createElement('link');link.rel='stylesheet';link.href=base+'quizapp-v3-style.css';document.head.appendChild(link);
    var script=document.createElement('script');script.src=base+'quizapp-v3-core.js';
    script.onload=function(){(async function(){
      var cls=host.dataset.class||'Class_11', ch=host.dataset.chapter||'', set=host.dataset.set||'ALL';
      var classEl=document.getElementById('dh-class-select'), chapterEl=document.getElementById('dh-chapter-select'),setEl=document.getElementById('dh-set-select');
      var notice=document.createElement('p');notice.className='mh-v3-chapter-note';notice.textContent='Loading chapter quiz…';host.insertBefore(notice,host.firstChild);
      function select(el,value){if(!el)return false;var match=Array.from(el.options).find(function(o){return o.value===value||o.textContent.trim()===value;});if(!match)return false;el.value=match.value;return true;}
      try{
        if(!select(classEl,cls))throw Error('Class not found: '+cls);
        await dh_loadMetadata();
        if(!select(chapterEl,ch))throw Error('Chapter not found: '+ch);
        await dh_loadSets();
        if(!select(setEl,set))throw Error('Set not found: '+set);
        await dh_filterPoolHint();
        classEl.disabled=true;chapterEl.disabled=true;setEl.disabled=true;
        var dashboard=document.getElementById('dh-quiz-config-dashboard');
        if(dashboard){var fields=dashboard.querySelector('.dh-dashboard-fields');if(fields)fields.style.setProperty('display','none','important');}
        notice.textContent='Chapter '+ch+' · '+(set==='ALL'?'All Sets':set)+' — enter your details to begin.';
      }catch(e){notice.textContent='Chapter setup failed: '+e.message;console.error(e);}
    })();};
    script.onerror=function(){host.textContent='QuizApp V3 could not load its shared engine. Please check the asset URL.';};
    document.head.appendChild(script);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
