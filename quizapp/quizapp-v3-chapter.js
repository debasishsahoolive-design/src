/* Mathematics Hub QuizApp V3 - chapter adapter; load after core.js. */
(function () {
  'use strict';

  function boot() {
    var host = document.querySelector('.mh-chapter-quiz[data-mode="chapter"]');
    if (!host || host.dataset.mhChapterInitialized === '1') return;

    function showFailure(message, error) {
      host.classList.add('mh-chapter-ready');
      var note = host.querySelector('.mh-v3-chapter-note');
      if (!note) {
        note = document.createElement('p');
        note.className = 'mh-v3-chapter-note';
        host.insertBefore(note, host.firstChild);
      }
      note.textContent = 'Chapter setup failed: ' + message;
      var input = host.querySelector('#dh-student-pool-count');
      var button = host.querySelector('#dh-start-quiz-btn');
      if (input) input.disabled = true;
      if (button) button.disabled = true;
      if (error) console.error('QuizApp V3 chapter:', error);
    }

    if (!window.__MH_V3_CORE_READY__) {
      document.addEventListener('mh:v3:core-ready', boot, { once: true });
      return;
    }
    if (!host.querySelector('#dh-class-select')) {
      showFailure('Quiz interface was not created. Check for duplicate core scripts or another quiz container on this page.');
      return;
    }

    host.dataset.mhChapterInitialized = '1';
    // Show registration immediately while chapter metadata and questions load.
    host.classList.add('mh-chapter-registering');
    var cls = host.dataset.class || '';
    var ch = host.dataset.chapter || '';
    var set = host.dataset.set || 'ALL';
    var classEl = host.querySelector('#dh-class-select');
    var chapterEl = host.querySelector('#dh-chapter-select');
    var setEl = host.querySelector('#dh-set-select');
    var note = document.createElement('p');
    note.className = 'mh-v3-chapter-note';
    note.textContent = 'Loading chapter quiz\u2026';
    host.insertBefore(note, host.firstChild);
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    note.textContent = 'Loading question pool… You can enter your details now.';

    var dash = host.querySelector('#dh-quiz-config-dashboard');
    if (dash) {
      var fields = dash.querySelector('.dh-dashboard-fields');
      if (fields) fields.style.setProperty('display', 'none', 'important');
      var subtitle = dash.querySelector('.dh-dashboard-subtitle');
      if (subtitle) subtitle.textContent = 'Enter your details while we prepare the questions.';
      var steps = dash.querySelector('.dh-dashboard-steps');
      if (steps) steps.style.display = 'none';
    }
    var countInput = host.querySelector('#dh-student-pool-count');
    var startButton = host.querySelector('#dh-start-quiz-btn');
    var poolHint = host.querySelector('#dh-available-pool-hint');
    if (countInput) countInput.disabled = true;
    if (startButton) startButton.disabled = true;
    if (poolHint) poolHint.textContent = 'Loading question pool…';

    function select(el, val) {
      if (!el) return false;
      var match = Array.from(el.options).find(function (o) { return o.value === val; });
      if (!match) return false;
      el.value = match.value;
      return true;
    }

    (async function () {
      try {
        if (!select(classEl, cls)) throw Error('Class not found: ' + cls);
        if (typeof dh_loadMetadata !== 'function') throw Error('Metadata loader unavailable');
        await dh_loadMetadata();
        if (!select(chapterEl, ch)) throw Error('Chapter not found: ' + ch);
        if (typeof dh_loadSets !== 'function') throw Error('Set loader unavailable');
        await dh_loadSets(); // Core already loads the initial question pool.
        var initiallySelectedSet = setEl.value;
        if (!select(setEl, set)) throw Error('Set not found: ' + set);
        // Refetch only when the requested set differs from the set loaded by core.
        // For a chapter with one set, 'ALL' and that one set have the same pool.
        var availableSets = Array.from(setEl.options).map(function (o) { return o.value; })
          .filter(function (v) { return v && v !== 'ALL'; });
        var samePool = initiallySelectedSet === set ||
          (set === 'ALL' && availableSets.length === 1 && initiallySelectedSet === availableSets[0]);
        if (!samePool) {
          if (typeof dh_filterPoolHint !== 'function') throw Error('Question pool loader unavailable');
          await dh_filterPoolHint();
        }

        classEl.disabled = true;
        chapterEl.disabled = true;
        setEl.disabled = true;
        // The core updates the pool hint after question retrieval finishes.
        // Unlock only if the confirmed pool contains at least one question.
        var hintText = poolHint ? poolHint.textContent : '';
        var match = hintText.match(/Available pool:\s*(\d+)\s*questions?/i);
        var available = match ? Number(match[1]) : 0;
        if (!available) throw Error('Question pool is unavailable. Please refresh to retry.');
        if (countInput) {
          countInput.max = String(Math.min(30, available));
          countInput.value = String(Math.min(10, available));
          countInput.disabled = false;
        }
        if (startButton) startButton.disabled = false;
        // Keep the page uncluttered: move the ready indicator beside the pool count.
        note.textContent = '✓ Question pool ready · ' + available + ' available';
        note.classList.add('mh-v3-chapter-note-ready');
        if (poolHint && poolHint.parentNode) {
          poolHint.parentNode.insertBefore(note, poolHint.nextSibling);
        } else if (countInput && countInput.parentNode) {
          countInput.parentNode.appendChild(note);
        }
        if (dash) {
          var readySubtitle = dash.querySelector('.dh-dashboard-subtitle');
          if (readySubtitle) readySubtitle.textContent = 'Enter your details, choose the number of questions, and begin your assessment.';
        }
        // Reveal only after all chapter-specific changes are complete.
        host.classList.add('mh-chapter-ready');
      } catch (err) {
        showFailure(err.message, err);
      }
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
