/* Mathematics Hub V13.6.1 Android DEV bridge fix — adaptive summary and review page break for isolated report printing with MathJax 3 CHTML.
 * Adapter only. Test privately; no scoring or backend changes.
 */
(function () {
  'use strict';
  if (window.__MH_V1361_PRINT_INSTALLED__) return;
  window.__MH_V1361_PRINT_INSTALLED__ = true;

  // Approved homepage light-mode logo reference; print copies only.
  // Check the asset visually before promoting this DEV change to production.
  const REPORT_LOGO_URL = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3ONJWQovB4I871oWpfcqXRYJuU_g30ObriWn8So_7wgHWQXW6mJYO_IdS_ysQ3ENBQGc-ZknlCELvBODyGywJ7teXstdo0eZJusPM5BSSRw50X77EcjLJoe5WQfkEMvei9ZynS0pzAv2UFQZzJM33bI8qgAAcEZpjRiHeVCiFl2DGgd7qKk5N_qkre9z-/s1600/image.png';
  const MATHJAX_URL = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  const CSS = `
    @page { size:A4; margin:12mm; }
    html,body { background:#fff!important; color:#172033!important; margin:0!important; padding:0!important; font:14px/1.55 Arial,'Segoe UI',sans-serif; }
    *,*::before,*::after {box-sizing:border-box}
    .mh-print-toolbar {padding:10px;background:#eef6ff;border:1px solid #bfdbfe;margin-bottom:12px}
    .mh-print-toolbar button {background:#075985;color:#fff;padding:8px 12px;border:0;cursor:pointer}
    .mh-print-panel {display:block!important;visibility:visible!important;width:100%!important;max-width:100%!important;margin:0 0 16px!important;padding:0!important;background:#fff!important;color:#172033!important;box-shadow:none!important}
    .dh-report-brand-header {display:flex!important;align-items:center!important;gap:12px!important}
    .dh-report-ds-logo,.dh-report-brand-header img {width:64px!important;height:64px!important;max-width:64px!important;max-height:64px!important;object-fit:contain!important;flex:0 0 64px!important;margin:0!important}
    /* V13.5: long review cards must be allowed to continue onto the next page.
       Avoiding a whole card causes excessive gaps and unpredictable pagination. */
    .dh-report-card-review {break-inside:auto!important;page-break-inside:auto!important;margin-bottom:12px!important;background:#fff!important;color:#172033!important}
    /* Keep short units together, but allow oversized matrices/content to flow. */
    .dh-report-card-review > :first-child {break-after:avoid-page;page-break-after:avoid}
    .dh-report-card-review .q-text {break-inside:avoid-page;page-break-inside:avoid}
    .dh-report-card-review mjx-container {break-inside:avoid-page;page-break-inside:avoid}
    .dh-report-card-review mjx-container[display='true'] {break-inside:avoid-page;page-break-inside:avoid}
    .dh-report-card-review li, .dh-report-card-review .option, .dh-report-card-review .quiz-option,
    .dh-report-card-review .dh-option, .dh-report-card-review .dh-report-option {
      break-inside:avoid-page;page-break-inside:avoid;
    }
    .dh-report-card-review h1,.dh-report-card-review h2,.dh-report-card-review h3,
    .dh-report-card-review h4 {break-after:avoid-page;page-break-after:avoid}
    .dh-report-card-review .explanation,.dh-report-card-review .dh-explanation,
    .dh-report-card-review .solution {break-inside:avoid-page;page-break-inside:avoid}
    .dh-report-card-review table tr {break-inside:avoid-page;page-break-inside:avoid}
    /* Avoid leaving the review section title alone at the bottom of a page. */
    #dh-full-review-report-panel > h1,#dh-full-review-report-panel > h2,
    #dh-full-review-report-panel > h3 {break-after:avoid-page;page-break-after:avoid}

    /* V13.6: print-only summary typography and two-table layout. */
    .mh-summary-print {font-size:12px!important;line-height:1.3!important}
    .mh-summary-print .dh-report-brand-header {margin-bottom:5px!important}
    .mh-summary-print .dh-report-ds-logo,.mh-summary-print .dh-report-brand-header img {width:48px!important;height:48px!important;max-width:48px!important;max-height:48px!important;flex-basis:48px!important}
    .mh-summary-print h1,.mh-summary-print h2,.mh-summary-print h3 {margin:5px 0!important;line-height:1.2!important}
    .mh-summary-print p {margin:3px 0!important}
    .mh-summary-print table {width:100%!important;border-collapse:collapse!important;table-layout:fixed!important;font-size:10.5px!important;line-height:1.2!important}
    .mh-summary-print th,.mh-summary-print td {padding:3px 4px!important;vertical-align:middle!important;overflow-wrap:anywhere}
    .mh-summary-print tr {break-inside:avoid-page!important;page-break-inside:avoid!important}
    .mh-summary-print .mh-summary-pair {display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:9px!important;align-items:start!important;width:100%!important}
    .mh-summary-print .mh-summary-pair table {min-width:0!important;font-size:9.5px!important}
    .mh-summary-print .mh-summary-pair th:nth-child(1),.mh-summary-print .mh-summary-pair td:nth-child(1){width:14%!important}
    .mh-summary-print .mh-summary-pair th:nth-child(2),.mh-summary-print .mh-summary-pair td:nth-child(2){width:23%!important}
    .mh-summary-print .mh-summary-pair th:nth-child(3),.mh-summary-print .mh-summary-pair td:nth-child(3){width:19%!important}
    .mh-summary-print .mh-summary-pair th:nth-child(4),.mh-summary-print .mh-summary-pair td:nth-child(4){width:44%!important}
    .mh-summary-print .mh-summary-pair th,.mh-summary-print .mh-summary-pair td {padding:3px 2px!important}
    .mh-review-print {break-before:page!important;page-break-before:always!important}
    @media print {.mh-review-print {break-before:page!important;page-break-before:always!important}}
    .q-text {overflow-wrap:break-word;min-width:0}
    img {max-width:100%;height:auto}
    mjx-container {color:#111827!important;visibility:visible!important}
    mjx-container[display='true'] {display:block!important;max-width:100%;overflow:visible!important}
    .mh-math-overflow {overflow:visible!important}
    .dh-print-actions,.print-hide,.mh-print-panel button,[onclick*='printSummaryOnly'],[onclick*='printFullReview'],[onclick*='location.reload'] {display:none!important}
    @media print {.mh-print-toolbar{display:none!important} table{border-collapse:collapse;max-width:100%} tr{break-inside:avoid} *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `;
  function safePart(value) {return String(value || 'Unknown').trim().replace(/[^\w\- ]+/g,'_').replace(/\s+/g,'_').slice(0,75)}
  function filename(kind) {
    const chapter=localStorage.getItem('dh_chapter')||document.getElementById('dh-chapter-select')?.value||'Chapter';
    const set=localStorage.getItem('dh_set')||document.getElementById('dh-set-select')?.value||'Set';
    const student=localStorage.getItem('dh_student_name')||document.getElementById('dh-student-name')?.value||'Student';
    const d=new Date();const stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${[d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,'0')).join('')}`;
    return [kind,safePart(chapter),safePart(set),safePart(student),stamp].join('_');
  }
  function mathItems() {const list=window.MathJax?.startup?.document?.math;return list?Array.from(list):[]}
  function sourceFor(container,items) {
    const item=items.find(it=>it.typesetRoot===container||it.typesetRoot?.contains?.(container));
    if(item && typeof item.math==='string' && item.math.trim()) {
      const delim=item.display?['\\[','\\]']:['\\(','\\)'];
      return delim[0]+item.math+delim[1];
    }
    // MathJax CHTML normally includes accessible MathML. The MathML input
    // component is part of tex-mml-chtml.js, so it can be typeset independently.
    const mml=container.querySelector('mjx-assistive-mml math');
    if(mml) return new XMLSerializer().serializeToString(mml);
    return null;
  }
  function synchronizeReportLogo(panel) {
    // Update only the cloned print panel; never mutate the live assessment page.
    const header = panel.querySelector('.dh-report-brand-header');
    if (!header) return;
    const logo = header.querySelector('img.dh-report-ds-logo, img');
    if (!logo) return;
    const previousSrc = logo.getAttribute('src');
    logo.setAttribute('src', REPORT_LOGO_URL);
    logo.setAttribute('alt', 'Mathematics Hub DS logo');
    logo.setAttribute('referrerpolicy', 'no-referrer');
    logo.addEventListener('error', () => {
      // Keep the existing report logo rather than printing an empty image.
      if (previousSrc) logo.setAttribute('src', previousSrc);
    }, { once: true });
  }

  function removeActions(panel) {
    panel.querySelectorAll('button,.dh-print-actions,.print-hide,[onclick*="print"],[onclick*="reload"]').forEach(el=>el.remove());
  }
  function topLevelMath(root) {
    return Array.from(root.querySelectorAll('mjx-container')).filter(el => !el.parentElement?.closest('mjx-container'));
  }
  function insertOriginalMath(source,clone,items) {
    // MathJax can contain nested containers. Count only top-level expressions.
    const from=topLevelMath(source);
    const to=topLevelMath(clone);
    if(from.length!==to.length) throw Error('MathJax element counts differ between source and report.');
    for(let i=0;i<from.length;i++) {
      const raw=sourceFor(from[i],items);
      if(!raw) throw Error(`Original mathematics unavailable for expression ${i+1}.`);
      // Text node prevents accidental HTML injection from source TeX.
      const slot=clone.ownerDocument.createElement('span');
      slot.className='mh-math-slot';
      slot.dataset.mhMathIndex=String(i+1);
      slot.textContent=raw;
      to[i].replaceWith(slot);
    }
    return from.length;
  }

  // Only transform a recognizable four-column question-result table. Other
  // tables (scores, student metadata, etc.) are left entirely untouched.
  function adaptSummaryTable(panel) {
    panel.classList.add('mh-summary-print');
    const tables=Array.from(panel.querySelectorAll('table'));
    const candidates=tables.map(table=>{
      const rows=Array.from(table.rows);
      if(rows.length<2) return null;
      const first=rows[0];
      if(first.cells.length!==4) return null;
      const headings=Array.from(first.cells).map(c=>c.textContent.trim().toLowerCase());
      const headingText=headings.join(' ');
      if(!/(?:question|display|q\.?\s*(?:no|number)?|q\s*#)/i.test(headings[0])) return null;
      if(!/(?:answer|choice|response|selected|your)/.test(headingText)) return null;
      if(!/(?:key|correct|official)/.test(headingText)) return null;
      if(!/(?:status|result)/.test(headingText)) return null;
      const bodyRows=rows.slice(1).filter(r=>r.cells.length===4 && /^\s*(?:q(?:uestion)?\s*[.:-]?\s*)?\d{1,2}\s*[.):]?\s*$/i.test(r.cells[0].textContent));
      if(bodyRows.length!==rows.length-1) return null;
      return {table,rows,bodyRows};
    }).filter(Boolean);
    if(candidates.length!==1) {
      console.info('MH V13.6.1: summary table structure not recognized; preserving original layout.');
      return;
    }
    const {table,rows,bodyRows}=candidates[0];
    const count=bodyRows.length;
    if(count<=15 || count>30) return;
    const doc=panel.ownerDocument;
    const wrap=doc.createElement('div');wrap.className='mh-summary-pair';
    const middle=Math.ceil(count/2);
    for(const section of [bodyRows.slice(0,middle),bodyRows.slice(middle)]) {
      const half=doc.createElement('table');
      const head=doc.createElement('thead');head.appendChild(rows[0].cloneNode(true));half.appendChild(head);
      const body=doc.createElement('tbody');
      section.forEach(row=>body.appendChild(row.cloneNode(true)));
      half.appendChild(body);wrap.appendChild(half);
    }
    table.replaceWith(wrap);
    console.info(`MH V13.6.1: summary arranged into two tables (${middle} + ${count-middle}).`);
  }

  async function waitForAssets(doc) {
    await Promise.all(Array.from(doc.images).map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;setTimeout(resolve,5000)})));
    if(doc.fonts?.ready) await Promise.race([doc.fonts.ready,new Promise(resolve=>setTimeout(resolve,7000))]);
  }
  async function loadMathJax(popup,doc) {
    // Keep the same TeX macros and delimiter conventions as the Blogger theme.
    popup.MathJax={
      tex:{inlineMath:[['$','$'],['\\(','\\)']],displayMath:[['$$','$$'],['\\[','\\]']],processEscapes:true,macros:{textbf:['\\mathbf{#1}',1],bm:['\\mathbf{#1}',1]}},
      options:{processHtmlClass:'tex2jax_process'},
      startup:{typeset:false}
    };
    await new Promise((resolve,reject)=>{
      const script=doc.createElement('script');script.src=MATHJAX_URL;
      const timeout=setTimeout(()=>reject(Error('MathJax did not load within 20 seconds.')),20000);
      script.onload=()=>{clearTimeout(timeout);resolve()};
      script.onerror=()=>{clearTimeout(timeout);reject(Error('MathJax library failed to load in the report window.'))};
      doc.head.appendChild(script);
    });
    if(!popup.MathJax?.typesetPromise) throw Error('MathJax CHTML typesetting is unavailable in the report window.');
    if(popup.MathJax.startup?.promise) await popup.MathJax.startup.promise;
  }
  async function openPrint(kind,ids) {
    const panels=ids.map(id=>document.getElementById(id));
    if(panels.some(p=>!p)){alert('Report not ready. Submit the assessment first.');return}
    const popup=window.open('','_blank');
    if(!popup){alert('Allow pop-ups for Mathematics Hub to print the report.');return}
    const doc=popup.document;
    doc.open();doc.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preparing report</title></head><body><p id="mh-progress">Preparing mathematical report…</p></body></html>');doc.close();
    try {
      if(window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
      if(window.MathJax?.typesetPromise) await window.MathJax.typesetPromise(panels);
      if(popup.closed)return;
      doc.title=filename(kind);
      const items=mathItems();
      const copies=[];let expected=0;
      for(const panel of panels){
        const clone=doc.importNode(panel,true);clone.removeAttribute('id');clone.classList.add('mh-print-panel','tex2jax_process');removeActions(clone);synchronizeReportLogo(clone);
        expected+=insertOriginalMath(panel,clone,items);
        if(panel.id==='dh-summary-report-card-panel') adaptSummaryTable(clone);
        if(panel.id==='dh-full-review-report-panel') clone.classList.add('mh-review-print');
        copies.push(clone);
      }
      doc.body.replaceChildren();
      const style=doc.createElement('style');style.textContent=CSS;doc.head.appendChild(style);
      const androidBridge = typeof popup.MHAndroidPrint?.savePdf === 'function';
      const toolbar=doc.createElement('div');toolbar.className='mh-print-toolbar';toolbar.append(androidBridge ? 'Report ready. Use Android Print / Save PDF. ' : 'Report ready. Select Save as PDF in the browser print dialog. ');
      const btn=doc.createElement('button');btn.textContent='Print / Save PDF';btn.addEventListener('click',()=>{ if(androidBridge) popup.MHAndroidPrint.savePdf(doc.title); else popup.print(); });toolbar.appendChild(btn);doc.body.appendChild(toolbar);
      copies.forEach(c=>doc.body.appendChild(c));
      if(expected) {
        await loadMathJax(popup,doc);
        await popup.MathJax.typesetPromise(copies);
        const slots=Array.from(doc.querySelectorAll('.mh-print-panel .mh-math-slot'));
        const rendered=slots.filter(slot => topLevelMath(slot).length === 1 && !slot.querySelector('mjx-merror')).length;
        if(slots.length!==expected || rendered!==expected) throw Error(`MathJax rendering incomplete: expected ${expected}, found ${rendered} (slots ${slots.length}).`);
        if(doc.querySelector('.mh-print-panel mjx-merror')) throw Error('MathJax reported a mathematical rendering error.');
      }
      await waitForAssets(doc);
      if(!popup.closed){popup.focus();if(androidBridge) popup.MHAndroidPrint.savePdf(doc.title); else popup.print()}
    }catch(err){
      console.error('MH V13.6.1 print error:',err);
      if(!popup.closed){const msg=doc.createElement('p');msg.style.cssText='color:#b91c1c;font:600 15px/1.5 Arial;padding:16px;border:1px solid #fca5a5;';msg.textContent=`PDF printing stopped to prevent an incomplete mathematics report: ${err.message}`;doc.body.prepend(msg)}
    }
  }
  window.printSummaryOnly=()=>openPrint('Summary',['dh-summary-report-card-panel']);
  window.printFullReview=()=>openPrint('FullReview',['dh-summary-report-card-panel','dh-full-review-report-panel']);
})();
