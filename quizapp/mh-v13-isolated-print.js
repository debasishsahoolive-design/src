/* Mathematics Hub V13 — isolated report printing adapter.
 * Install AFTER quizapp-v3-core.js. No external PDF services or libraries.
 * Opens a dedicated, same-origin print document, independent of Blogger @media print.
 */
(function () {
  'use strict';
  if (window.__MH_V13_PRINT_INSTALLED__) return;
  window.__MH_V13_PRINT_INSTALLED__ = true;

  function safePart(value) {
    return String(value || 'Unknown').trim().replace(/[^\w\- ]+/g, '_').replace(/\s+/g, '_').slice(0, 75);
  }
  function filename(kind) {
    const chapter = localStorage.getItem('dh_chapter') || document.getElementById('dh-chapter-select')?.value || 'Chapter';
    const set = localStorage.getItem('dh_set') || document.getElementById('dh-set-select')?.value || 'Set';
    const student = localStorage.getItem('dh_student_name') || document.getElementById('dh-student-name')?.value || 'Student';
    const d = new Date();
    const stamp = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('') + '_' + [d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join('');
    return [kind,safePart(chapter),safePart(set),safePart(student),stamp].join('_');
  }
  const PRINT_CSS = `
    @page { size:A4; margin:12mm; }
    html, body { margin:0; padding:0; background:#fff; color:#172033; font:14px/1.6 Arial,'Segoe UI',sans-serif; }
    *, *::before, *::after { box-sizing:border-box; }
    .mh-print-toolbar { padding:12px; margin:0 0 18px; background:#eef6ff; border:1px solid #bfdbfe; border-radius:8px; }
    .mh-print-toolbar button { cursor:pointer; padding:8px 16px; border:0; border-radius:6px; background:#075985; color:#fff; font-weight:bold; }
    .mh-print-panel { width:100%; max-width:100%; margin:0 0 18px; padding:0; color:#172033; background:#fff; }
    .dh-report-card-review { break-inside:avoid-page; page-break-inside:avoid; margin:0 0 14px !important; }
    .dh-review-question-header { display:flex; flex-direction:column; align-items:stretch; gap:7px; }
    .dh-review-question-status { align-self:flex-start; width:auto; }
    .q-text { min-width:0; overflow-wrap:break-word; }
    img { max-width:100% !important; height:auto; }
    mjx-container { color:#111827 !important; }
    mjx-container[display='true'] { display:block; overflow:visible !important; max-width:100%; }
    .mh-math-overflow { overflow:visible !important; max-width:100%; }
    .dh-print-actions, .print-hide, button { display:none !important; }
    .mh-print-toolbar, .mh-print-toolbar button { display:block !important; }
    @media print {
      .mh-print-toolbar, .mh-print-toolbar * { display:none !important; }
      body { margin:0 !important; }
      .mh-print-panel { break-inside:auto; }
      .dh-report-card-review { break-inside:avoid-page; }
      table { border-collapse:collapse; max-width:100%; }
      tr { break-inside:avoid; }
      * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  `;
  function copyMathJaxStyles(source, dest) {
    // MathJax CHTML injects style tags and @font-face rules in the host page.
    for (const node of source.querySelectorAll('style')) {
      const txt = node.textContent || '';
      if (/mjx-|MathJax|MJXZERO|@font-face/i.test(txt)) {
        const style = dest.createElement('style');
        style.textContent = txt;
        dest.head.appendChild(style);
      }
    }
    // Copy MathJax-related stylesheet links only; avoid Blogger's global print CSS.
    for (const link of source.querySelectorAll('link[rel="stylesheet"]')) {
      if (/mathjax/i.test(link.href || '')) {
        const clone = dest.createElement('link');
        clone.rel = 'stylesheet';
        clone.href = link.href;
        dest.head.appendChild(clone);
      }
    }
  }
  async function openPrint(kind, ids) {
    const panels = ids.map(id=>document.getElementById(id));
    if (panels.some(p=>!p)) { alert('The report is not ready. Please submit the assessment first.'); return; }
    // Open immediately in the user click stack, before awaiting MathJax.
    const popup = window.open('', '_blank');
    if (!popup) { alert('Please allow pop-ups for Mathematics Hub to print the report.'); return; }
    const pd = popup.document;
    pd.open();
    pd.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preparing report</title></head><body><p>Preparing your report…</p></body></html>');
    pd.close();
    try {
      if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise(panels);
      if (document.fonts?.ready) await document.fonts.ready;
      if (popup.closed) return;
      pd.title = filename(kind);
      pd.body.replaceChildren();
      copyMathJaxStyles(document, pd);
      const style = pd.createElement('style');
      style.textContent = PRINT_CSS;
      pd.head.appendChild(style);
      const toolbar = pd.createElement('div');
      toolbar.className = 'mh-print-toolbar';
      const text = pd.createElement('span');
      text.textContent = 'Report ready. Choose “Save as PDF” in the browser print dialog. ';
      toolbar.appendChild(text);
      const btn = pd.createElement('button');
      btn.textContent = 'Print / Save PDF';
      btn.addEventListener('click', () => popup.print());
      toolbar.appendChild(btn);
      pd.body.appendChild(toolbar);
      for (const panel of panels) {
        const clone = pd.importNode(panel, true); // Copies already-rendered MathJax nodes, not raw LaTeX.
        clone.removeAttribute('id');
        clone.classList.add('mh-print-panel');
        clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
        pd.body.appendChild(clone);
      }
      const images = Array.from(pd.images);
      await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload=resolve; img.onerror=resolve; setTimeout(resolve,5000); })));
      if (pd.fonts?.ready) await Promise.race([pd.fonts.ready, new Promise(resolve=>setTimeout(resolve,5000))]);
      // A manual button remains in the new tab if the browser blocks automatic print.
      if (!popup.closed) { popup.focus(); popup.print(); }
    } catch (err) {
      console.error('MH V13 isolated print error:', err);
      if (!popup.closed) {
        const p = pd.createElement('p');
        p.textContent = 'Could not prepare the report. Close this tab and try again.';
        pd.body.appendChild(p);
      }
    }
  }
  window.printSummaryOnly = function () { return openPrint('Summary', ['dh-summary-report-card-panel']); };
  window.printFullReview = function () { return openPrint('FullReview', ['dh-summary-report-card-panel','dh-full-review-report-panel']); };
})();
