(function(){
  function boot(){
    if(window.__MH_V3_ADAPTER_STARTED__)return;
    var host=document.querySelector('[data-mode="portal"]');
    if(!host)return;
    window.__MH_V3_ADAPTER_STARTED__=true;
    host.setAttribute('data-mh-v3-host','');
    var base=window.MH_V3_ASSET_BASE || 'https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@main/quizapp/';
    var link=document.createElement('link');link.rel='stylesheet';link.href=base+'quizapp-v3-style.css';document.head.appendChild(link);
    var script=document.createElement('script');script.src=base+'quizapp-v3-core.js';
    script.onload=function(){/* Portal selectors remain editable. */};
    script.onerror=function(){host.textContent='QuizApp V3 could not load its shared engine. Please check the asset URL.';};
    document.head.appendChild(script);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
