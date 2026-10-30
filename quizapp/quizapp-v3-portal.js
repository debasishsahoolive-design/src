/* Mathematics Hub V3 Overall Assessment Portal: registration-first adapter. */
(function () {
  'use strict';
  function boot() {
    var host = document.querySelector('[data-mode="portal"]');
    if (!host || host.dataset.mhPortalInitialized === '1') return;
    if (!window.__MH_V3_CORE_READY__) {
      document.addEventListener('mh:v3:core-ready', boot, {once:true}); return;
    }
    var dash = host.querySelector('#dh-quiz-config-dashboard');
    var count = host.querySelector('#dh-student-pool-count');
    var start = host.querySelector('#dh-start-quiz-btn');
    var hint = host.querySelector('#dh-available-pool-hint');
    if (!dash || !count || !start || !hint) return;
    host.dataset.mhPortalInitialized = '1';
    host.setAttribute('data-mh-v3-portal', '');
    host.classList.add('mh-portal-registering');
    var title = dash.querySelector('.dh-dashboard-title');
    if (title) title.textContent = 'Overall Assessment Portal';
    var subtitle = dash.querySelector('.dh-dashboard-subtitle');
    if (subtitle) subtitle.textContent = 'Choose your class, chapter and set while preparing your student details.';
    var note = document.createElement('p');
    note.className = 'mh-v3-portal-note';
    note.setAttribute('role','status'); note.setAttribute('aria-live','polite');
    hint.parentNode.insertBefore(note, hint.nextSibling);
    function lock(message) {
      count.disabled = true; start.disabled = true;
      note.classList.remove('mh-v3-portal-note-ready');
      note.textContent = message;
    }
    lock('Select your class, chapter and question set to load questions.');
    var cls = host.querySelector('#dh-class-select');
    var chapter = host.querySelector('#dh-chapter-select');
    var set = host.querySelector('#dh-set-select');
    [cls, chapter, set].forEach(function (el) {
      if (!el) return;
      // Capture-phase lock runs before the inline onchange starts an asynchronous request.
      el.addEventListener('change', function () {
        lock(el === cls ? 'Loading chapters… You can enter your details now.' :
             el === chapter ? 'Loading question sets… You can enter your details now.' :
             'Loading question pool… You can enter your details now.');
      }, true);
    });
    document.addEventListener('mh:v3:pool-state', function (event) {
      if (!host.isConnected || document.body.classList.contains('dh-quiz-active')) return;
      var d = event.detail || {};
      if (d.state === 'loading') lock('Loading question pool… You can enter your details now.');
      else if (d.state === 'error') lock('Unable to load questions. Please reselect the question set.');
      else if (d.state === 'ready') {
        var available = Number(d.available) || 0;
        if (!available) {lock('No questions available for this selection.'); return;}
        count.disabled = false; start.disabled = false;
        count.max = String(Math.min(30,available));
        note.textContent = '✓ Question pool ready · ' + available + ' available';
        note.classList.add('mh-v3-portal-note-ready');
        if (subtitle) subtitle.textContent = 'Enter your details, choose the number of questions, and begin your assessment.';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
