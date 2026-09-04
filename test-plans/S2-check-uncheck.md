# Test Plan — S2: Check/uncheck an item

**STATUS: FORMAL PASS COMPLETE, PASS (all S2-relevant assertions, part of a 67/67 combined
Sprint 1 run), zero defects in currently-testable mechanics — NOT YET DONE.** Same
density-picker-CSS-follow-up gate as S1 (BACKLOG.md Tracked follow-up note, QA finding M3) —
checkbox tap-target size isn't locked yet, so Status stays open until that follow-up pass lands
and is Tester-verified. Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`
(supersedes Developer's `vopping-selfcheck.js` per the playbook's standing rule).

**Story:** As a user, I want to check an item off, so that I can mark it as already in my cart
without deleting it from the list.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** tap/click target toggles
checked/unchecked; checked items visually distinct (e.g. strikethrough/dim) but stay in the list;
toggling updates localStorage immediately, no reload; checking/unchecking does NOT change row
position (no auto-move-to-bottom); this action is one of the four S6 undo-eligible types. Row
density (checkbox tap-target size) is an explicit placeholder pending the PO's density-picker.html
pick — **not evaluated here as pass/fail.**

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04.

**Tooling:** Same as S1 — Playwright via `channel: 'chrome'`.

## Testability review summary (for scrum-master)
No open items. AC's "visually distinct" left the specific treatment open ("e.g."); verified via
the `checked` CSS class (which drives strikethrough per `style.css`), not a literal pixel/style
assertion — consistent with how the AC was written.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC2.1 | Toggle applies `.checked` class | Click a row's checkbox | `<li>` gains `checked` class |
| TC2.2 | No reposition on check | Compare row-name order before/after checking | Identical order |
| TC2.3 | Persists immediately, correct raw shape | Check an item, read `localStorage` directly | That item's `checked: true` in the stored `items` array, immediately (no reload needed) |
| TC2.4 | Undo-eligible | Check an item, click Undo | Checked state reverts (see S6-undo.md for the full undo test) |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC2.1 | `eggsChecked === true` after click | Pass |
| TC2.2 | `namesBefore === namesAfterCheck` (JSON-identical) | Pass |
| TC2.3 | Raw storage read immediately after click: `{"items":[{"id":0,"name":"Milk","checked":false},{"id":1,"name":"Eggs","checked":true},{"id":2,"name":"Bread","checked":false}],"nextId":5}` | Pass |
| TC2.4 | Cross-referenced in S6-undo.md — undo correctly reverses the check | Pass |

**Overall verdict: PASS, 0 defects in S2.** Part of the combined 67/67 Sprint 1 run — see
`REGRESSION_LOG.md` (2026-09-04 row).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`. Full raw transcript in
`test-plans/S6-undo.md`. S2-specific lines:
```
PASS - S2 check toggles checked class
PASS - S2 checking does not change row order
PASS - S2 checked state persisted to localStorage immediately (raw shape check) :: {"items":[{"id":0,"name":"Milk","checked":false},{"id":1,"name":"Eggs","checked":true},{"id":2,"name":"Bread","checked":false}],"nextId":5}
```
Screenshot: `c:/tmp/pw-test/vop-tester-03-eggs-checked.png`.
