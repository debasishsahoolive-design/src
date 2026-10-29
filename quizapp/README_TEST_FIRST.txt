Mathematics Hub QuizApp V3 — SHARED ENGINE TEST BUILD

Extracted from Mathematics_Hub_V3_ALL_Sets_Fixed.html.
Upload four files to the public GitHub src/quizapp/ folder.
Load BOTH adapter scripts once from Blogger theme (portal and chapter).
Each adapter activates only when its matching container exists.

Portal page HTML:
<div data-mode="portal"></div>

Chapter post HTML:
<div data-mode="chapter" data-class="Class_11" data-chapter="Ch - 2" data-set="ALL"></div>

Add before </body> in Blogger theme (XML requires escaped ampersands in URLs):
<script defer="defer" src="https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@main/quizapp/quizapp-v3-portal.js"></script>
<script defer="defer" src="https://cdn.jsdelivr.net/gh/debasishsahoolive-design/src@main/quizapp/quizapp-v3-chapter.js"></script>

CAUTION: Not browser-tested; do not replace working portal on main site.
Test class/chapter/set selection, loading, shuffling, submission, Responses, report and PDF.
jsDelivr CDN may cache branch URLs; versioned release URLs are preferable after testing.
