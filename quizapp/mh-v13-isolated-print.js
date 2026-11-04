/* Mathematics Hub V13.1 — isolated report printing, MathJax SVG/CHTML preservation.
 * Load after the existing quizapp-v3-core.js. No assessment logic changes.
 */
(function () {
  'use strict';
  if (window.__MH_V131_PRINT_INSTALLED__) return;
  window.__MH_V131_PRINT_INSTALLED__ = true;
  function safePart(v) { return String(v || 'Unknown').trim().replace(/[^\w\- ]+/g,'_').replace(/\s+/g,'_').slice(0,75); }
  function filename(kind) {
    const chapter=localStorage.getItem('dh_chapter')||document.getElementById('dh-chapter-select')?.value||'Chapter';
    const set=localStorage.getItem('dh_set')||document.getElementById('dh-set-select')?.value||'Set';
    const student=localStorage.getItem('dh_student_name')||document.getElementById('dh-student-name')?.value||'Student';
    const d=new Date();
    const stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${[d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,'0')).join('')}`;
    return [kind,safePart(chapter),safePart(set),safePart(student),stamp].join('_');
  }
  const CSS=`
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
    .dh-print-actions,.print-hide { display:none!important; }
    @media print {
      .mh-print-toolbar { display:none!important; }
      table { border-collapse:collapse; max-width:100%; }
      tr { break-inside:avoid; }
      * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  `;
  function copyMathStyles(source,dest) {
    // MathJax CHTML often uses dynamically injected styles, not external links.
    for (const node of source.querySelectorAll('style')) {
      const txt=node.textContent||'';
      if (/mjx-|MathJax|MJXZERO|@font-face/i.test(txt)) {
        const s=dest.createElement('style'); s.textContent=txt; dest.head.appendChild(s);
      }
    }
    for (const link of source.querySelectorAll('link[rel="stylesheet"]')) {
      if (/mathjax/i.test(link.href||'')) {
        const l=dest.createElement('link'); l.rel='stylesheet'; l.href=link.href; dest.head.appendChild(l);
      }
    }
  }
  function copySvgGlobalCache(source,dest) {
    // MathJax SVG uses <use href="#MJX-...">; glyph definitions live OUTSIDE the report.
    // Without this cache, matrices and other formulas disappear in the new document.
    const cache=source.querySelector('svg#MJX-SVG-global-cache');
    if (cache) {
      const copied=dest.importNode(cache,true);
      copied.style.cssText='position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;';
      dest.body.insertBefore(copied,dest.body.firstChild);
    }
    // Some MathJax configurations use other SVG caches or inline definitions.
    source.querySelectorAll('svg[id*="MJX"][id*="cache"]').forEach(svg=>{
      if (svg.id==='MJX-SVG-global-cache'||dest.getElementById(svg.id)) return;
      const copied=dest.importNode(svg,true);
      copied.style.cssText='position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;';
      dest.body.insertBefore(copied,dest.body.firstChild);
    });
  }
  function countMath(panels) { return panels.reduce((n,p)=>n+p.querySelectorAll('mjx-container').length,0); }
  async function openPrint(kind,ids) {
    const panels=ids.map(id=>document.getElementById(id));
    if (panels.some(p=>!p)) { alert('Report not ready. Submit the assessment first.'); return; }
    const popup=window.open('','_blank');
    if (!popup) { alert('Allow pop-ups for Mathematics Hub to print the report.'); return; }
    const pd=popup.document;
    pd.open(); pd.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preparing report</title></head><body><p>Preparing report and mathematical expressions…</p></body></html>'); pd.close();
    try {
      if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
      if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise(panels);
      if (document.fonts?.ready) await document.fonts.ready;
      if (popup.closed) return;
      pd.title=filename(kind);
      pd.body.replaceChildren();
      copyMathStyles(document,pd);
      const style=pd.createElement('style'); style.textContent=CSS; pd.head.appendChild(style);
      copySvgGlobalCache(document,pd);
      const toolbar=pd.createElement('div'); toolbar.className='mh-print-toolbar';
      toolbar.append('Report ready. Select Save as PDF in the browser print dialog. ');
      const btn=pd.createElement('button'); btn.textContent='Print / Save PDF'; btn.addEventListener('click',()=>popup.print()); toolbar.appendChild(btn); pd.body.appendChild(toolbar);
      for (const panel of panels) {
        const clone=pd.importNode(panel,true);
        clone.removeAttribute('id'); clone.classList.add('mh-print-panel');
        // Do NOT remove descendant IDs: MathJax SVG may reference them via <use href="#...">.
        pd.body.appendChild(clone);
      }
      const sourceMath=countMath(panels), printMath=pd.querySelectorAll('.mh-print-panel mjx-container').length;
      if (sourceMath!==printMath) throw new Error(`MathJax transfer mismatch: ${sourceMath} source vs ${printMath} print`);
      const uses=Array.from(pd.querySelectorAll('.mh-print-panel mjx-container use'));
      const missing=uses.filter(u=>{
        const href=u.getAttribute('href')||u.getAttribute('xlink:href')||'';
        return href.startsWith('#')&&!pd.getElementById(href.slice(1));
      });
      if (missing.length) {
        console.error('MathJax SVG glyph definitions missing:',missing.length);
        const warn=pd.createElement('p'); warn.style.color='#b91c1c'; warn.textContent='Some mathematical symbols could not be prepared. Please do not save this PDF; report the issue.';
        toolbar.appendChild(warn);
        return;
      }
      const images=Array.from(pd.images);
      await Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;setTimeout(resolve,5000);} )));
      if(pd.fonts?.ready) await Promise.race([pd.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]);
      if(!popup.closed){popup.focus();popup.print();}
    } catch(err) {
      console.error('MH V13.1 print error:',err);
      if(!popup.closed){const p=pd.createElement('p');p.textContent='Could not prepare a complete mathematical report. Please close this tab and try again.';pd.body.appendChild(p);}
    }
  }
  window.printSummaryOnly=()=>openPrint('Summary',['dh-summary-report-card-panel']);
  window.printFullReview=()=>openPrint('FullReview',['dh-summary-report-card-panel','dh-full-review-report-panel']);
})();
