/* Mathematics Hub QuizApp V3 - portal adapter. Core creates the interface. */
(function(){
  function boot(){
    var host=document.querySelector('[data-mode="portal"]');
    if(!host)return;
    host.setAttribute('data-mh-v3-portal','');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
