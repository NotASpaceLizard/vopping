# Test Plan — S3: Delete an item

**STATUS: DONE — formally executed 2026-09-04, PASS (all S3-relevant assertions, part of a
67/67 combined Sprint 1 run), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`.

**Story:** As a user, I want to permanently remove an item from the list, so that I can get rid
of something added by mistake or no longer needed, distinct from just checking it off.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** delete control visually/
functionally separate from checkbox; removes item entirely from data model and localStorage
immediately, no reload; no confirmation dialog on individual delete (re-justified 2026-09-04 on
undo-based-mitigation grounds after S12 added a bulk case); deleting is one of the four S6
undo-eligible types, retaining enough state (name, checked state, original position/index) to
fully restore on undo — **this specific clause was flagged at testability-check time as not
independently verifiable until S6 itself ships; S6 now exists, so this pass verifies it directly**
(see TC3.4 below, cross-referenced in full in S6-undo.md); **resolved 2026-09-04 (QA finding R2,
PO Option A):** a brief toast ("Deleted '<item>' — Undo") shown at the moment of deletion, in
addition to the always-visible Undo control, not a new undo-eligibility rule.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04.

**Tooling:** Same as S1.

## Testability review summary (for scrum-master)
The one forward-reference gap flagged pre-lock (undo-retention not verifiable until S6 exists) is
now closed — S6 shipped in the same Sprint 1 batch, verified together in this same run.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC3.1 | Delete removes item immediately | Click a row's delete control | Item gone from DOM, count decrements, no reload |
| TC3.2 | Toast shown with correct text | Delete an item | `#toast` visible, text matches `Deleted "<name>" — Undo` |
| TC3.3 | No confirmation dialog | Delete an item, monitor `page.on('dialog')` | Zero dialogs fired |
| TC3.4 | Undo restores exact original position (closing the forward-reference gap) | Delete a middle item, click Undo | Item reappears at its exact original index, not appended at the end |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC3.1 | count 3→2 immediately after click | Pass |
| TC3.2 | `toastHidden=false`, text=`Deleted "Eggs" — Undo` | Pass |
| TC3.3 | `dialogs.length` unchanged across the delete click | Pass |
| TC3.4 | Post-undo: names array identical to pre-delete AND restored item's index === 1 (its original position, middle of 3) | Pass |

**Overall verdict: PASS, 0 defects in S3.** Part of the combined 67/67 Sprint 1 run — see
`REGRESSION_LOG.md` (2026-09-04 row).

## Regression reconfirmation, 2026-09-04 (density-picker CSS pass for S1/S2/S5)

S2's toggle mechanic changed substantially (checkbox removed, whole row is now the toggle target)
as part of the S1/S2/S5 density-lock follow-up. Re-ran the full suite against the new mechanic
(script `vopping-tests-tester-s1-s2-s5-density-formal.js`, 74/74) — no S3 regression: delete,
toast text, no-dialog, and undo-restores-position all still pass unchanged. Added one new check
not present in the original pass: deleting a row does NOT toggle a SIBLING row's cross-off state
(a nested-control-precedence concern that became more relevant once the whole row became
clickable) — confirmed clean. Full transcript: `S5-reorder-buttons.md`'s Commands section.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`. Full raw transcript in
`test-plans/S6-undo.md`. S3-specific lines:
```
PASS - S3 delete removes the item
PASS - S3 toast shows on delete with correct text :: Deleted "Eggs" — Undo
PASS - S3 delete does NOT trigger a confirm/blocking dialog
PASS - S6 undo restores deleted item at exact original position :: idx=1
```
