Mathematics Hub V13.3 — Private test only

1. Keep the existing quizapp-v3-core.js, quizapp-v3-style.css, Apps Script and Blogger theme unchanged.
2. Back up the current mh-v13-isolated-print.js from GitHub.
3. Upload this package's mh-v13-isolated-print.js to the quizapp folder, replacing the previous adapter.
4. Use the NEW commit hash in the existing Blogger jsDelivr script URL:
   <script defer='defer' src='https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@NEW_COMMIT/quizapp/mh-v13-isolated-print.js'/>
5. Do not load multiple versions of the V13 adapter. Hard-refresh your test page.
6. Test both Summary and Full Review with a matrix, inline equations and a long question.
7. If the report shows an error, do not print; share the exact error. Restore the old adapter if needed.

Implementation: reconstructs TeX from MathJax's source registry or accessible MathML,
then re-typesets with MathJax 3 tex-mml-chtml in the isolated window.
It checks MathJax container counts before printing. This is not a guarantee
that every symbol or matrix bracket is correct; inspect the generated PDF.
No external PDF service; MathJax is fetched from the CDN already used by the theme.
Note: The popup and browser print dialog remain necessary; this is not a silent PDF download.
Validation: JavaScript syntax checked; live Blogger/Chrome print not verified.
