Mathematics Hub V13.6 — Adaptive Assessment Summary + Full Review new page

INSTALLATION
1. Back up your currently working V13.5 quizapp/mh-v13-isolated-print.js.
2. Replace that one GitHub file with mh-v13-isolated-print-v13.6.js (rename to mh-v13-isolated-print.js in the repository).
3. Update the ONE existing Blogger script URL to reference the new GitHub commit or immutable version.
4. Do not load V13.5 and V13.6 together. Hard-refresh and test privately first.

PRINT-ONLY CHANGES
- The summary is compacted for A4 portrait.
- A recognized 4-column question-result table with 1–15 rows stays one table.
- A recognized 4-column question-result table with 16–30 rows is split into two equal side-by-side tables.
- Full Review starts on a fresh page, while long solution cards may continue across later pages.
- MathJax CHTML loading, expression recovery and verification are preserved.

IMPORTANT LIMITATIONS
- This patch can recognize a table only if it has four columns headed approximately Q./Question, Your/Answer/Choice, Key/Correct and Status/Result, and numeric question rows. Otherwise it leaves the table unchanged, avoiding destructive guesses.
- No example of the actual summary HTML was supplied; therefore the 8-column transformation is not yet confirmed against the deployed DOM.
- Exact page-one fit depends on actual summary content, browser, printer settings and scaling. Confirm with a real 30-question PDF before release.
- The adapter does not enforce the maximum 30 questions or the Full Review score restriction; these existing controls must remain in the assessment/backend code.
- The print adapter is not a security boundary: the backend must enforce access to answers/solutions.

TEST CHECKLIST
[ ] 10 questions: one 4-column summary, Full Review begins page 2.
[ ] 16 questions: 8 columns (8 + 8), review begins page 2.
[ ] 30 questions: 8 columns (15 + 15), entire summary fits page 1.
[ ] Matrices, symbols, options, correct-answer marks and solutions print correctly.
[ ] Summary-only printing does not create an extra blank page.
[ ] Existing score lock, submit-only printing, scoring and shuffle are unaffected.

No changes to Core JS, Apps Script, Blogger theme or quiz CSS. Browser validation pending.
