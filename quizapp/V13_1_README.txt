Mathematics Hub — V13.1 isolated PDF printing adapter

INSTALL (PRIVATE TEST THEME ONLY)
1. Back up the working V13 adapter and Core JS.
2. Upload mh-v13-isolated-print.js to the quizapp/ folder in GitHub.
3. Replace the OLD V13 adapter script reference with the NEW commit-pinned one:
   <script defer='defer' src='https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@YOUR_NEW_COMMIT/quizapp/mh-v13-isolated-print.js'/>
4. Keep existing Core JS and CSS unchanged. Load adapter AFTER Core JS.
5. Hard refresh and test both Print Summary and Print Full Review.
6. Compare MathJax matrices, brackets, options, and logo with on-screen report.

CHANGES
- Copies MathJax SVG global glyph cache into the isolated print document.
- Preserves MathJax IDs used by SVG <use> references.
- Copies dynamically injected MathJax styles for CHTML output.
- Waits for MathJax typesetting, images, and fonts.
- Stops automatic printing if SVG glyph definitions are missing.
- Constrains DS logo to 64px and keeps light A4 print styling.
- No change to scoring, timer, shuffling, verification, or original CSS.

IMPORTANT
This is a test patch. Browser print output is not yet verified. Use Chrome Save as PDF.
A browser cannot silently download PDFs through window.print().
If equations are still missing, please provide the resulting PDF and browser console messages.
