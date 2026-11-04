/* Mathematics Hub V13.3 — isolated report printing with MathJax 3 CHTML.
 * Adapter only. Test privately; no scoring or backend changes.
 */
(function () {
  'use strict';
  if (window.__MH_V133_PRINT_INSTALLED__) return;
  window.__MH_V133_PRINT_INSTALLED__ = true;

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
    .dh-report-card-review {break-inside:avoid-page;page-break-inside:avoid;margin-bottom:12px!important;background:#fff!important;color:#172033!important}
    .q-text {overflow-wrap:break-word;min-width:0}
    img {max-width:100%;height:auto}
    mjx-container {color:#111827!important;visibility:visible!important}
    mjx-container[display='true'] {display:block!important;max-width:100%;overflow:visible!important}
    .mh-math-overflow {overflow:visible!important}
    .dh-print-actions,.print-hide,button,[onclick*='printSummaryOnly'],[onclick*='printFullReview'],[onclick*='location.reload'] {display:none!important}
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
  function removeActions(panel) {
    panel.querySelectorAll('button,.dh-print-actions,.print-hide,[onclick*="print"],[onclick*="reload"]').forEach(el=>el.remove());
  }
  function insertOriginalMath(source,clone,items) {
    const from=Array.from(source.querySelectorAll('mjx-container'));
    const to=Array.from(clone.querySelectorAll('mjx-container'));
    if(from.length!==to.length) throw Error('MathJax element counts differ between source and report.');
    for(let i=0;i<from.length;i++) {
      const raw=sourceFor(from[i],items);
      if(!raw) throw Error(`Original mathematics unavailable for expression ${i+1}.`);
      // Text node prevents accidental HTML injection from source TeX.
      to[i].replaceWith(clone.ownerDocument.createTextNode(raw));
    }
    return from.length;
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
        const clone=doc.importNode(panel,true);clone.removeAttribute('id');clone.classList.add('mh-print-panel','tex2jax_process');removeActions(clone);
        expected+=insertOriginalMath(panel,clone,items);copies.push(clone);
      }
      doc.body.replaceChildren();
      const style=doc.createElement('style');style.textContent=CSS;doc.head.appendChild(style);
      const toolbar=doc.createElement('div');toolbar.className='mh-print-toolbar';toolbar.append('Report ready. Select Save as PDF in the browser print dialog. ');
      const btn=doc.createElement('button');btn.textContent='Print / Save PDF';btn.addEventListener('click',()=>popup.print());toolbar.appendChild(btn);doc.body.appendChild(toolbar);
      copies.forEach(c=>doc.body.appendChild(c));
      if(expected) {
        await loadMathJax(popup,doc);
        await popup.MathJax.typesetPromise(copies);
        const rendered=doc.querySelectorAll('.mh-print-panel mjx-container').length;
        if(rendered!==expected) throw Error(`MathJax rendering incomplete: expected ${expected}, found ${rendered}.`);
        if(doc.querySelector('.mh-print-panel mjx-merror')) throw Error('MathJax reported a mathematical rendering error.');
      }
      await waitForAssets(doc);
      if(!popup.closed){popup.focus();popup.print()}
    }catch(err){
      console.error('MH V13.3 print error:',err);
      if(!popup.closed){const msg=doc.createElement('p');msg.style.cssText='color:#b91c1c;font:600 15px/1.5 Arial;padding:16px;border:1px solid #fca5a5;';msg.textContent=`PDF printing stopped to prevent an incomplete mathematics report: ${err.message}`;doc.body.prepend(msg)}
    }
  }
  window.printSummaryOnly=()=>openPrint('Summary',['dh-summary-report-card-panel']);
  window.printFullReview=()=>openPrint('FullReview',['dh-summary-report-card-panel','dh-full-review-report-panel']);
})();
