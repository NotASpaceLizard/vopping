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
| 2026-09-04 | S1, S2, S3, S4, S5, S6, S12 (Sprint 1, first formal pass) | `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js` (Tester-independent — supersedes Developer's self-check `vopping-selfcheck.js` as citation of record per playbook) | 67/67 assertions passed, single script run, no prior baseline to re-run against (first formal pass of the project) | 67 | No arithmetic required — this is the script's own single printed total ("67/67 passed"), quoted directly, not summed from sub-parts. Zero console/page errors, zero confirm/alert dialogs, zero external network requests (only the app's own local file:// asset loads). One MINOR non-blocking defect found and disclosed separately (does not affect this pass/fail count, which reflects assertions-as-written): a paste line consisting of only a marker glyph + trailing whitespace creates a spurious junk item — see `S4-paste-ingest.md` Findings section. Full raw transcript archived in `S6-undo.md` (canonical copy, cross-referenced by all other Sprint-1 files rather than duplicated). SUPERSEDED by the row below, same day — do not cite this row going forward. |
| 2026-09-04 | S1-S6, S12 (Sprint 1, re-verification after Developer's S4 marker-regex fix) | Same script, `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js` (updated in place with 2 new fix-verification checks for TC4.3, then re-run in full) | 69/69 assertions passed (67 original + 2 new checks added for this re-run; zero regressions in the other 67) | 69 | Again the script's own single printed total ("69/69 passed"), quoted directly. The TC4.3 defect from the prior row is now fixed and closed — see `S4-paste-ingest.md`'s "Re-verification, 2026-09-04" section. SUPERSEDED by the row below, same day — do not cite this row going forward. |
| 2026-09-04 | S1, S2, S5 (density-picker.html CSS/markup follow-up pass, closes BACKLOG.md's Tracked follow-up gate / QA finding M3) + full S1-S6/S12 regression re-run | New script, `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js` (independent rewrite, not a copy — the toggle mechanic fundamentally changed: checkbox removed, whole `<li>` is now the tap/keyboard target with `role="checkbox"`/`aria-checked`/`aria-label`) | 74/74 assertions passed | 74 | **Current canonical figure — cite this row.** Script's own single printed total ("74/74 passed"), quoted directly. Covers: ARIA correctness, zero checkbox glyph, strikethrough+dim computed-style verification, nested-control precedence for both click and keyboard, a repeated-keyboard-toggle test targeting Developer's self-caught focus-restoration fix, terminology rename ("Clear crossed off"), S12 toast text/pluralization (newly verified, not new behavior), tap-target-size (>=24px) and mobile-overflow re-checks now that the row spec is locked rather than a placeholder, plus a full functional regression re-run (add/delete/paste/reorder/undo/clear-checked) — zero regressions anywhere. Per PO scoping decision (2026-09-04, relayed by Orchestrator): the ARIA/keyboard-specific checks in this count are informational sanity-check coverage, not a required blocking gate going forward — see `test-plans/README.md`'s "Accessibility scope" note. Full transcript: `S5-reorder-buttons.md`'s Commands section (canonical copy for this script). |

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
