/* Mathematics Hub QuizApp V3 - chapter adapter; load after core.js. */
(function(){
  'use strict';
  function boot(){
    var host=document.querySelector('.mh-chapter-quiz[data-mode="chapter"]');
    if(!host || host.dataset.mhChapterInitialized==='1')return;
    if(!window.__MH_V3_CORE_READY__){
      document.addEventListener('mh:v3:core-ready',boot,{once:true});
      return;
    }
    if(!host.querySelector('#dh-class-select')){
      host.textContent='Quiz interface was not created. Check for duplicate core scripts or another quiz container on this page.';
      return;
    }
    host.dataset.mhChapterInitialized='1';
    var cls=host.dataset.class||'', ch=host.dataset.chapter||'', set=host.dataset.set||'ALL';
    var classEl=host.querySelector('#dh-class-select');
    var chapterEl=host.querySelector('#dh-chapter-select');
    var setEl=host.querySelector('#dh-set-select');
    var note=document.createElement('p');note.className='mh-v3-chapter-note';
    note.textContent='Loading chapter quiz\u2026';
    host.insertBefore(note,host.firstChild);
    function select(el,val){
      if(!el)return false;
      var match=Array.from(el.options).find(function(o){return o.value===val;});
      if(!match)return false;
      el.value=match.value;return true;
    }
    (async function(){
      try{
        if(!select(classEl,cls))throw Error('Class not found: '+cls);
        if(typeof dh_loadMetadata!=='function')throw Error('Metadata loader unavailable');
        await dh_loadMetadata();
        if(!select(chapterEl,ch))throw Error('Chapter not found: '+ch);
        await dh_loadSets();
        if(!select(setEl,set))throw Error('Set not found: '+set);
        await dh_filterPoolHint();
        classEl.disabled=true;chapterEl.disabled=true;setEl.disabled=true;
        var dash=host.querySelector('#dh-quiz-config-dashboard');
        if(dash){
          var fields=dash.querySelector('.dh-dashboard-fields');
          if(fields)fields.style.setProperty('display','none','important');
          var subtitle=dash.querySelector('.dh-dashboard-subtitle');
          if(subtitle)subtitle.textContent='Enter your details and choose the number of questions to begin.';
          var steps=dash.querySelector('.dh-dashboard-steps');
          if(steps)steps.style.display='none';
        }
        note.textContent=[cls==='Class_11'?'Class XI':'Class XII',ch,set==='ALL'?'All Sets':set].join(' \u00B7 ');
      }catch(err){note.textContent='Chapter setup failed: '+err.message;console.error('QuizApp V3 chapter:',err);}
    })();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
