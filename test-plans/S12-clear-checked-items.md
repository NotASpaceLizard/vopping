# Test Plan — S12: Clear all checked items in one tap

**STATUS: DONE — formally executed 2026-09-04, PASS (all S12-relevant assertions, part of a
67/67 combined Sprint 1 run), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`.

**Story:** As a user, I want to clear all checked items off my list in one tap, so that I can
quickly reset for a new shopping trip without deleting each checked item one at a time.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** page-level "Clear checked
items" control removes every currently-checked item in one action; unchecked items completely
unaffected (content and position); zero-checked is a no-op (disabled or silent no-op, either
acceptable); no confirmation dialog (undo is the safety net, mirrors S3's precedent); undo-eligible
as ONE atomic action — clearing N and pressing Undo restores all N at once to exact prior position
AND checked state — **flagged at testability-check time as not independently verifiable until S6
shipped; S6 now exists, verified directly below**; does NOT change S10's historical frequency
counter in either direction — **flagged at testability-check time as a doc-consistency gap (this
clause lacked S6's-bulk-undo-clause's sibling hedge); still not independently verifiable, S10
doesn't exist until Sprint 2 — correctly out of this pass's scope, true by construction per
Developer's own code comment (`clearCheckedItems()` never reads/writes the not-yet-built S10
storage key at all); deferred, tracked here, to be closed out at S10's own formal pass.**

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04, reusing S3's `{item, index}` removal/restore machinery generalized to N entries.

**Tooling:** Same as S1.

## Testability review summary (for scrum-master)
The bulk-undo forward-reference gap flagged pre-lock is now closed (S6 shipped in this same
batch). The S10-counter forward-reference gap remains correctly open and tracked — will close at
S10's own formal pass in Sprint 2, not before.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC12.1 | Disabled when nothing checked | Fresh list, nothing checked | `#clear-checked-btn` disabled |
| TC12.2 | Enabled once something is checked | Check any item | Button enabled |
| TC12.3 | Removes exactly the checked (non-contiguous) items | Check scattered indices (e.g. 1, 3, 5 of 8), click Clear | Only those items removed; others' content/position unchanged |
| TC12.4 | No confirmation dialog | Click Clear with items checked | Zero dialogs fired |
| TC12.5 | Undo restores all N to exact original scattered positions | Click Undo after a bulk clear | All removed items reappear at their original indices |
| TC12.6 | Undo restores checked=true specifically on the restored items | Same as TC12.5, inspect each restored item's checked state | Each restored item shows `checked` again, not reset to unchecked |
| TC12.7 | Never-checked items completely unaffected | Same flow, inspect items that were never checked | Identical content and position throughout |
| TC12.8 | True no-op when disabled (forced click) | Force-click the disabled button via JS | List completely unchanged |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC12.1 | `isDisabled() === true` | Pass |
| TC12.2 | `isDisabled() === false` after checking indices 1,3,5 | Pass |
| TC12.3 | pre=`Milk,Eggs,Bread,Chicken,Rice,Paper towels,Coffee,Plain Item` post=`Milk,Bread,Rice,Coffee,Plain Item` — exactly indices 1,3,5 (Eggs, Chicken, Paper towels) removed | Pass |
| TC12.4 | `dialogs.length` unchanged across the click | Pass |
| TC12.5 | Post-undo list identical to pre-clear list (all 8 names, original order) | Pass |
| TC12.6 | All 3 restored items (ids 1, 13, 15) individually confirmed `checked === true` | Pass |
| TC12.7 | Items at indices 0, 2, 4 (never checked) identical before/after the whole clear+undo cycle | Pass |
| TC12.8 | Item count unchanged after forced click on the disabled button | Pass |

**Overall verdict: PASS, 0 defects in S12.** Part of the combined 67/67 Sprint 1 run — see
`REGRESSION_LOG.md` (2026-09-04 row).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`. Full raw transcript in
`test-plans/S6-undo.md`. S12-specific lines:
```
PASS - S12 Clear-checked disabled when nothing is checked
PASS - S12 Clear-checked enabled once something is checked
PASS - S12 clear removes exactly the checked (scattered) items :: pre=Milk,Eggs,Bread,Chicken,Rice,Paper towels,Coffee,Plain Item post=Milk,Bread,Rice,Coffee,Plain Item
PASS - S12 clear does NOT trigger a confirm/blocking dialog
PASS - S12 undo restores ALL cleared items to their exact original scattered positions
PASS - S12 undo restores checked=true specifically on restored item id=1
PASS - S12 undo restores checked=true specifically on restored item id=13
PASS - S12 undo restores checked=true specifically on restored item id=15
PASS - S12 items that were never checked are completely unaffected in content/position
PASS - S12 Clear-checked disabled again once nothing is checked
PASS - S12 forced click on disabled Clear-checked is a true no-op
```
Screenshots: `c:/tmp/pw-test/vop-tester-06-after-clear-checked.png`, `vop-tester-07-after-clear-checked-undo.png`.
