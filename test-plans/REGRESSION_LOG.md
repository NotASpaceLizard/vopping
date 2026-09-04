# Regression Log — canonical running count

Owned by: **Tester**, this file only. This is the single source of truth
for "what's the current cumulative regression count" — cite this file,
not a memory of a number, not a single story's own Results table. vacking
had real citation-drift incidents (149 vs 160, 41 vs 40/42, 283 vs
282/300/351 — see its `QA_FINDINGS.md` R10) every time a number got
restated from memory instead of from a ledger like this one.

**Rule:** once an independent Tester formal-pass script exists for a
story, it becomes the citation of record for that story's test count —
supersedes any Developer self-verification script for that slot. Every
row below names the exact script file and the count it produced. If a
script is re-run later and a number changes, add a new row (dated) —
don't overwrite the old one silently.

## Ledger

| Date | Story/Scope | Script | Result | Cumulative total | Notes |
|------|-------------|--------|--------|-------------------|-------|
| — | — | — | — | 0 | No stories implemented yet; backlog not drafted. Ledger opened 2026-09-04 in advance of any formal passes. |
| 2026-09-04 | S1, S2, S3, S4, S5, S6, S12 (Sprint 1, first formal pass) | `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js` (Tester-independent — supersedes Developer's self-check `vopping-selfcheck.js` as citation of record per playbook) | 67/67 assertions passed, single script run, no prior baseline to re-run against (first formal pass of the project) | 67 | No arithmetic required — this is the script's own single printed total ("67/67 passed"), quoted directly, not summed from sub-parts. Zero console/page errors, zero confirm/alert dialogs, zero external network requests (only the app's own local file:// asset loads). One MINOR non-blocking defect found and disclosed separately (does not affect this pass/fail count, which reflects assertions-as-written): a paste line consisting of only a marker glyph + trailing whitespace creates a spurious junk item — see `S4-paste-ingest.md` Findings section. Full raw transcript archived in `S6-undo.md` (canonical copy, cross-referenced by all other Sprint-1 files rather than duplicated). |

## How to add a row

1. Run the formal-pass script for the story (or the combined regression
   re-run script covering multiple prior stories).
2. Record: date, story ID(s) covered, exact script filename (full path
   if it lives outside this repo, e.g. `c:\tmp\pw-test\vopping-tests-...js`),
   raw pass/fail count for *that run*, and the new running cumulative
   total.
3. If the cumulative total requires arithmetic across multiple scripts
   (e.g. summing several stories' own counts), show the addition inline
   in the Notes column so it's checkable, not just asserted — vacking's
   R10 finding was exactly an uncaught arithmetic slip that propagated
   into 8 separate downstream citations because nobody could re-derive
   it from the ledger row itself.
4. When citing this total anywhere else (chat, TEAM_LOG.md, a story's
   own Results table), name this file and the row's date/script — e.g.
   "193/193 per REGRESSION_LOG.md, 2026-09-10 row, vopping-tests-s1-s3-formal.js."
