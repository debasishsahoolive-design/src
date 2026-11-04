/* Mathematics Hub V13.2 — isolated printing with MathJax TeX-to-SVG reconstruction.
 * Adapter only. Load after quizapp-v3-core.js. Do not deploy until PDF math verified.
 */
(function () {
  'use strict';
  if (window.__MH_V132_PRINT_INSTALLED__) return;
  window.__MH_V132_PRINT_INSTALLED__ = true;

  function safePart(v) { return String(v || 'Unknown').trim().replace(/[^\w\- ]+/g, '_').replace(/\s+/g, '_').slice(0, 75); }
  function filename(kind) {
    const chapter = localStorage.getItem('dh_chapter') || document.getElementById('dh-chapter-select')?.value || 'Chapter';
    const set = localStorage.getItem('dh_set') || document.getElementById('dh-set-select')?.value || 'Set';
    const student = localStorage.getItem('dh_student_name') || document.getElementById('dh-student-name')?.value || 'Student';
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${[d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,'0')).join('')}`;
    return [kind,safePart(chapter),safePart(set),safePart(student),stamp].join('_');
  }

  const CSS = `
    @page { size:A4; margin:12mm; }
    html,body { margin:0!important; padding:0!important; background:#fff!important; color:#172033!important; font:14px/1.6 Arial,'Segoe UI',sans-serif; }
    *,*::before,*::after { box-sizing:border-box; }
    .mh-print-toolbar { padding:10px; background:#eef6ff; border:1px solid #bfdbfe; margin-bottom:12px; }
    .mh-print-toolbar button { background:#075985; color:#fff; padding:8px 12px; border:0; cursor:pointer; }
    .mh-print-panel { display:block!important; visibility:visible!important; width:100%!important; max-width:100%!important; margin:0 0 16px!important; padding:0!important; background:#fff!important; color:#172033!important; box-shadow:none!important; }
    .dh-report-brand-header { display:flex!important; align-items:center!important; gap:12px!important; }
    .dh-report-ds-logo,.dh-report-brand-header img { width:64px!important; height:64px!important; max-width:64px!important; max-height:64px!important; object-fit:contain!important; flex:0 0 64px!important; margin:0!important; }
    .dh-report-card-review { break-inside:avoid-page; page-break-inside:avoid; margin-bottom:12px!important; background:#fff!important; color:#172033!important; }
    .q-text { overflow-wrap:break-word; min-width:0; }
    img { max-width:100%; height:auto; }
    mjx-container { color:#111827!important; visibility:visible!important; }
    mjx-container svg { overflow:visible!important; }
    mjx-container[display='true'] { display:block!important; overflow:visible!important; max-width:100%; }
    .mh-math-overflow { overflow:visible!important; }
    .dh-print-actions,.print-hide,button,[onclick*="printSummaryOnly"],[onclick*="printFullReview"],[onclick*="location.reload"],[onclick*="NewTest"] { display:none!important; }
    @media print {
      .mh-print-toolbar { display:none!important; }
      table { border-collapse:collapse; max-width:100%; }
      tr { break-inside:avoid; }
      * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  `;

  function copyMathStyles(source, dest) {
    for (const node of source.querySelectorAll('style')) {
      const txt = node.textContent || '';
      if (/mjx-|MathJax|MJXZERO|@font-face/i.test(txt)) {
        const s = dest.createElement('style'); s.textContent = txt; dest.head.appendChild(s);
      }
    }
  }
  function copySvgGlobalCache(source, dest) {
    for (const svg of source.querySelectorAll('svg#MJX-SVG-global-cache,svg[id*="MJX"][id*="cache"]')) {
      if (svg.id && dest.getElementById(svg.id)) continue;
      const copied = dest.importNode(svg, true);
      copied.style.cssText = 'position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;';
      dest.body.insertBefore(copied, dest.body.firstChild);
    }
  }
  function getMathItems() {
    const math = window.MathJax?.startup?.document?.math;
    if (!math) return [];
    return Array.from(math);
  }
  function itemForRoot(items, root) {
    return items.find(item => item.typesetRoot === root || item.typesetRoot?.contains?.(root));
  }
  async function convertMathInClone(sourcePanel, clonedPanel, dest, items) {
    const originals = Array.from(sourcePanel.querySelectorAll('mjx-container'));
    const targets = Array.from(clonedPanel.querySelectorAll('mjx-container'));
    if (originals.length !== targets.length) throw new Error('Source and copied MathJax counts differ.');
    for (let i = 0; i < originals.length; i++) {
      const item = itemForRoot(items, originals[i]);
      if (!item || typeof item.math !== 'string') {
        throw new Error(`Original TeX unavailable for mathematical expression ${i+1}. Printing stopped to prevent missing formulas.`);
      }
      // Generate SVG in the *original* MathJax environment, then transfer the output.
      const rendered = await window.MathJax.tex2svgPromise(item.math, { display: !!item.display });
      const svgContainer = rendered.matches?.('mjx-container') ? rendered : rendered.querySelector('mjx-container');
      if (!svgContainer || !svgContainer.querySelector('svg')) throw new Error(`SVG rendering failed for expression ${i+1}.`);
      targets[i].replaceWith(dest.importNode(svgContainer, true));
    }
    return originals.length;
  }
  function missingGlyphReferences(doc) {
    return Array.from(doc.querySelectorAll('.mh-print-panel mjx-container use')).filter(u => {
      const href = u.getAttribute('href') || u.getAttribute('xlink:href') || '';
      return href.startsWith('#') && !doc.getElementById(href.slice(1));
    });
  }
  function removeActions(panel) {
    panel.querySelectorAll('button,.dh-print-actions,.print-hide,[onclick*="print"],[onclick*="reload"]').forEach(el => el.remove());
  }
  async function waitForAssets(doc) {
    await Promise.all(Array.from(doc.images).map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 5000);
    })));
    if (doc.fonts?.ready) await Promise.race([doc.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]);
  }
  async function openPrint(kind, ids) {
    const panels = ids.map(id => document.getElementById(id));
    if (panels.some(p => !p)) { alert('Report not ready. Submit the assessment first.'); return; }
    const popup = window.open('', '_blank');
    if (!popup) { alert('Allow pop-ups for Mathematics Hub to print the report.'); return; }
    const pd = popup.document;
    pd.open(); pd.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preparing report</title></head><body><p>Preparing mathematical report…</p></body></html>'); pd.close();
    try {
      if (!window.MathJax?.tex2svgPromise || !window.MathJax?.startup?.document?.math) {
        throw new Error('MathJax TeX-to-SVG or original math registry is unavailable.');
      }
      if (window.MathJax.startup?.promise) await window.MathJax.startup.promise;
      if (window.MathJax.typesetPromise) await window.MathJax.typesetPromise(panels);
      if (document.fonts?.ready) await document.fonts.ready;
      if (popup.closed) return;
      pd.title = filename(kind);
      pd.body.replaceChildren();
      copyMathStyles(document, pd);
      const style = pd.createElement('style'); style.textContent = CSS; pd.head.appendChild(style);
      const toolbar = pd.createElement('div'); toolbar.className = 'mh-print-toolbar';
      toolbar.append('Report prepared. Select Save as PDF in the browser print dialog. ');
      const btn = pd.createElement('button'); btn.textContent = 'Print / Save PDF'; btn.addEventListener('click', () => popup.print()); toolbar.appendChild(btn); pd.body.appendChild(toolbar);
      const items = getMathItems();
      let mathCount = 0;
      for (const panel of panels) {
        const clone = pd.importNode(panel, true);
        clone.removeAttribute('id'); clone.classList.add('mh-print-panel');
        removeActions(clone);
        pd.body.appendChild(clone);
        mathCount += await convertMathInClone(panel, clone, pd, items);
      }
      // tex2svgPromise may have added SVG glyphs to the source document cache.
      copySvgGlobalCache(document, pd);
      const printedMath = pd.querySelectorAll('.mh-print-panel mjx-container svg').length;
      if (printedMath !== mathCount) throw new Error(`Mathematical SVG mismatch: expected ${mathCount}, found ${printedMath}.`);
      const missing = missingGlyphReferences(pd);
      if (missing.length) throw new Error(`${missing.length} SVG glyph references are missing. Printing stopped.`);
      await waitForAssets(pd);
      if (!popup.closed) { popup.focus(); popup.print(); }
    } catch (err) {
      console.error('MH V13.2 print error:', err);
      if (!popup.closed) {
        const message = pd.createElement('p');
        message.style.cssText = 'color:#b91c1c;font:600 15px/1.5 Arial;padding:16px;border:1px solid #fca5a5;';
        message.textContent = `PDF printing stopped to prevent an incomplete mathematics report: ${err.message}`;
        pd.body.prepend(message);
      }
    }
  }
  window.printSummaryOnly = () => openPrint('Summary', ['dh-summary-report-card-panel']);
  window.printFullReview = () => openPrint('FullReview', ['dh-summary-report-card-panel', 'dh-full-review-report-panel']);
})();
