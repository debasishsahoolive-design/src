Mathematics Hub — V13 Isolated Report Printing (TEST ONLY)

PURPOSE
Fix both blank Chrome print previews without modifying the existing global @media print CSS, scoring, timer, or backend.

INSTALLATION
1. Keep your current quizapp-v3-core.js and quizapp-v3-style.css unchanged.
2. Upload mh-v13-isolated-print.js to GitHub alongside the core script.
3. Load it AFTER quizapp-v3-core.js in your private Blogger test page/theme:
   <script src="YOUR_RAW_GITHUB_URL/mh-v13-isolated-print.js"></script>
   Use a version-pinned URL if possible to avoid cache confusion.
4. Reload, submit an assessment, click Print Summary or Print Full Review Card.
5. A separate report tab opens. Chrome's print dialog should open; select Destination > Save as PDF.
   If the dialog is blocked, click the Print / Save PDF button in that tab.

DESIGN / SECURITY
- No external libraries, third-party PDF upload, or data transmission.
- Uses existing evaluated report HTML with already-rendered MathJax.
- Copies MathJax-only styles into an isolated same-origin document.
- Avoids the Blogger global body * {visibility:hidden!important} print rule.
- The popup holds student name and email; users should close it after saving.
- Browser print dialog cannot be bypassed using window.print().
- This is a browser-side presentation feature, NOT an access-control boundary.

IMPORTANT
- This version is a test build; validate 2x2 and 3x3 matrices and pagination.
- Chrome may require allowing pop-ups.
- A browser may choose a different PDF filename; the tab title supplies the suggested name.
- Rollback: remove the adapter script tag. Original Core JS and CSS remain unchanged.
- Do not deploy publicly until both print buttons pass testing.
