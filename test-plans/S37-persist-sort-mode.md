# Test Plan — S37: persist the selected sort mode across reload

**STATUS: DONE (desktop-verifiable AC) — independent Tester formal pass 2026-09-17, PASS as part of the
combined 516/516 Sprint-8 run (Part 26), zero defects; reproduced twice.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 26); transcripts
`c:/tmp/pw-test/s37-s39-runA.log` + `s37-s39-runB.log` (both 516/516). See `REGRESSION_LOG.md`'s
2026-09-17 row for the cumulative ledger. **No NB-6 device gate — S37 is fully desktop-verifiable.**

**Story:** As a user, I want the app to remember which sort view I chose (Manual / Alphabetical /
By Aisle) so that reopening or refreshing my list keeps my chosen view instead of snapping back to
Manual every time.

**Acceptance criteria (condensed from BACKLOG.md S37 row, locked):** on every sort change persist the
selected mode to a DEDICATED localStorage record (`vopping-sort-v1`, one-key-per-feature, deliberately
NOT folded into `vopping-list-state-v1`). On load, BEFORE the first render, restore the persisted mode
into the in-memory `sortMode` var AND set `#sort-select`'s value to match (control + rendered view
agree from the first paint). Defensive parse (R1 posture): accept ONLY `manual` / `alpha` / `aisle`;
a missing key, unparseable value, or any other string falls back to `manual`, never throwing before
render. **VIEW-ONLY invariant preserved (S9 core):** persisting the mode must never touch `state.items`
order — `getSortedItems()` still returns a `.slice()`d copy, and S19 Up/Down still operate on the true
`state.items` order. This retires S9's old "sort selection need not persist / reload returns to Manual"
line (S9 TC9.7 was INVERTED in place; TC9.3's group-order observable was separately superseded by S39).

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://`. Build under
test: working tree (uncommitted, push HELD). Relevant code: `SORT_KEY='vopping-sort-v1'`,
`loadSortMode()` (exact whitelist + try/catch), `saveSortMode()`, the restore `sortMode =
loadSortMode(); sortSelect.value = sortMode;` placed AFTER the `#sort-select` capture and BEFORE the
sole bootstrap `render()`, and `saveSortMode(sortMode)` on the `change` handler.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, 390×700.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| S37.1 | persist-on-change | selecting alpha/aisle/manual writes that exact string to `vopping-sort-v1` |
| S37.2 | orthogonal key | the mode lives only in `vopping-sort-v1`; `vopping-list-state-v1` has no `sortMode`/`sort` field |
| S37.3 | restore-before-first-render (aisle) | after reload `#sort-select`='aisle' AND By-Aisle group headers are already rendered, no interaction |
| S37.4 | restore (alpha) | after reload `#sort-select`='alpha', list renders A–Z, and NO aisle group headers present |
| S37.5 | defensive parse | unknown / wrong-case (`ALPHA`,`Aisle`) / empty / JSON / `manualx` / absent key all fall back to Manual |
| S37.5b | no throw before render | the defensive-parse battery produces ZERO new console/page errors |
| S37.6 | view-only invariant (S9 core) | items array byte-identical across a persisted-sort reload |
| S37.7 | S19 unaffected | after a restored sort, S19 Up/Down in Manual still reorders the true `state.items` order |

## Results
All 8 checks PASS (Part 26 of the combined suite). Verbatim PASS lines:
```
PASS - S37.1 (persist-on-change) each sort selection writes its own vopping-sort-v1 record (alpha/aisle/manual)
PASS - S37.2 (orthogonal key) the sort mode lives in its OWN vopping-sort-v1 key, never folded into vopping-list-state-v1
PASS - S37.3 (restore-before-first-render, aisle) after reload #sort-select reads "aisle" AND the By-Aisle grouping is already rendered
PASS - S37.4 (restore alpha, control+view agree) after reload #sort-select reads "alpha", the list renders alphabetically, and NO aisle group headers
PASS - S37.5 (defensive parse) an unknown / wrong-case / empty / JSON / absent vopping-sort-v1 value all fall back to Manual
PASS - S37.5b (no throw before render) the defensive-parse restore battery produced ZERO new console/page errors
PASS - S37.6 (view-only invariant, S9 core) persisting + restoring a non-Manual sort never rewrites state.items order/content
PASS - S37.7 (S19 unaffected) after a restored sort, S19 Up/Down in Manual still reorders the true state.items order
```

**Overall verdict: PASS, 0 defects in S37; fully desktop-verifiable (no NB-6 device gate).**

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 26). Reproduced twice —
transcripts `c:/tmp/pw-test/s37-s39-runA.log` and `c:/tmp/pw-test/s37-s39-runB.log`, both 516/516,
zero console/page errors, zero dialogs, zero non-`file://` requests.
