MATHEMATICS HUB — V13.2 ISOLATED PRINT ADAPTER (TEST ONLY)

Changes:
- Reconstruct MathJax expressions as SVG from the original MathJax TeX registry.
- Check that all expected SVG containers and glyph references exist before printing.
- Remove report action buttons from PDF.
- Keep existing Core JS, CSS, scoring and Apps Script unchanged.

Installation:
1. Back up existing mh-v13-isolated-print.js and GitHub commit reference.
2. Upload this new mh-v13-isolated-print.js into GitHub /quizapp/.
3. Replace the old adapter script tag (do not add a second adapter).
4. Use a fresh GitHub commit SHA in your Blogger theme:
<script defer='defer' src='https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@YOUR_NEW_COMMIT/quizapp/mh-v13-isolated-print.js'/>
5. Keep the existing quizapp-v3-core.js and quizapp-v3-style.css unchanged.
6. Run a private-theme test with 2x2 and 3x3 matrices and check every equation and option in the PDF.

LIMITATIONS:
- Requires MathJax.tex2svgPromise and the MathJax original math-item registry.
- If either is unavailable, printing stops with a visible error instead of silently generating an incomplete PDF.
- This patch is syntax-checked, NOT browser-tested. MathJax font cache and complex matrices must be verified.
- Chrome Print / Save as PDF remains necessary; browser JS cannot silently save via window.print().
- Chrome header/footer can be turned off in print dialog.
- Roll back to the previous GitHub commit if a test fails.
