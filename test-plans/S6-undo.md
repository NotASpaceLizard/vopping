# Test Plan — S6: Single-last-action undo

**STATUS: DONE — formally executed 2026-09-04, PASS (all S6-relevant assertions, part of a
67/67 combined Sprint 1 run), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`.

**Story:** As a user, I want to undo my most recent action, so that I can quickly recover from
an accidental check, delete, add, or reorder without a full history stack.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** single always-visible Undo
control reverses only the most recent of: add (single via S1, or whole paste-batch via S4 as ONE
atomic action), check/uncheck (S2), delete (S3), one up/down swap (S5); single-slot buffer —
any new mutating action overwrites it; not itself undoable (no redo), clears/disables after use;
restores complete prior state (name, checked state, position); transient/in-memory only, does NOT
persist across reload; S9's future sort and S7/S8's future note/aisle edits are explicitly NOT
mutating actions for this buffer (neither create nor clobber a pending target) — not independently
verifiable yet (S7/S8/S9 don't exist), correctly out of this pass's scope; depends on S1-S5 all
existing first.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04 with a tagged-union buffer shape: `{type:'add',ids}`, `{type:'check',id,prevChecked}`,
`{type:'delete',entries:[{item,index}]}` (shared by S3's single-delete and S12's bulk-clear,
generalized to N entries), `{type:'reorder',idA,idB}`.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'` (system Chrome —
Playwright's bundled-Chromium download is blocked by an org network 403, same workaround as
vacking's `drive.js` and Developer's own `vopping-selfcheck.js`).

## Testability review summary (for scrum-master)
No open items for S1-S6/S12's own scope. The S7/S8/S9 forward-references in this story's own AC
remain correctly deferred to those stories' own future formal passes (same convention now applied
consistently across S3/S4/S12's analogous forward-references, per the pre-lock recommendation).

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC6.1 | Undo reverses a check | Check an item, click Undo | Checked state reverts; Undo then disables (no redo) |
| TC6.2 | Undo reverses a reorder swap | Swap two rows, click Undo | Order returns to exact pre-swap state (swap is self-inverse) |
| TC6.3 | Undo restores a delete at exact original position | Delete a middle item, click Undo | Item reappears at its original index |
| TC6.4 | Undo removes a whole paste-batch atomically | Paste N lines, click Undo once | All N removed in that single Undo |
| TC6.5 | Single-slot clobber: newer action overwrites older | Perform action A (check), then action B (delete) before undoing | One Undo reverses ONLY B; A's effect is untouched; buffer then empty (no redo of A) |
| TC6.6 | Undo buffer does not persist across reload | Perform a mutating action, reload, inspect Undo button | Disabled after reload (no stale target survives) |
| TC6.7 | Bulk clear-checked (S12) is undo-eligible as ONE atomic action, restoring position AND checked-state | See S12-clear-checked-items.md | Cross-referenced there in full |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC6.1 | Enabled after check; reverses; disabled after use | Pass |
| TC6.2 | `Milk,Bread,Eggs` (post-swap) → `Milk,Eggs,Bread` (post-undo, matches pre-swap exactly) | Pass |
| TC6.3 | Restored at index 1 (its original position among 3 items) | Pass |
| TC6.4 | 3 pasted items removed in one Undo click, back to pre-paste baseline | Pass |
| TC6.5 | Deleted item (B) restored; the earlier check (A) remained checked, untouched; Undo button disabled after (no redo) | Pass |
| TC6.6 | `undoBtn.isDisabled() === true` immediately after reload | Pass |
| TC6.7 | See S12-clear-checked-items.md — Pass | Pass |

**Overall verdict: PASS, 0 defects in S6.** Part of the combined 67/67 Sprint 1 run.

## Regression reconfirmation, 2026-09-04 (density-picker CSS pass for S1/S2/S5)

S6's own undo mechanics are independent of the toggle-target change (checkbox removed, whole row
now the tap/keyboard target for cross-off) — the undo buffer itself doesn't care how `toggleChecked()`
gets invoked. Re-ran the full suite against the new mechanic (script
`vopping-tests-tester-s1-s2-s5-density-formal.js`, 74/74): undo of a cross-off, a reorder swap, a
delete, a whole paste-batch, and the single-slot clobber semantics (action A then B, one Undo
reverses only B) all re-confirmed clean using the new click-on-row-name / keyboard-Space
interaction instead of the old checkbox click. No regressions. See `S5-reorder-buttons.md`'s
Commands section for the full transcript — that file is now the canonical copy for this script,
same convention this file used for the prior (67/67) script.

## Regression note
This is the canonical full raw transcript for the combined S1-S6/S12 formal pass — every other
S1-S6/S12 test-plan file cross-references this section rather than duplicating it, to avoid the
kind of citation drift vacking hit repeatedly (playbook §Tester, QA finding R10). Canonical
cumulative count recorded in `REGRESSION_LOG.md`, 2026-09-04 row: **67/67**.

## Commands run and output

```
cd /c/tmp/pw-test && node vopping-tests-tester-s1-s6-s12-formal.js
```

Full raw output (all 67 assertions, in execution order):
```
PASS - S1 corrupted storage (literal "null") does not throw :: 0 new error(s)
PASS - S1 corrupted storage (literal "null") falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (raw top-level array) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (raw top-level array) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (object missing items key) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (object missing items key) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (items present but not an array) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (items present but not an array) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (not JSON at all) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (not JSON at all) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 malformed nextId (non-number) does not throw
PASS - S1 malformed nextId (non-number) preserves existing items rather than wiping :: ["Preserved Item"]
PASS - S1 empty state message shown on first load (not a blank screen) :: No items yet — add one above to get started.
PASS - S1 whitespace-only submit is a no-op, no blank row
PASS - S1 add via Enter creates a row
PASS - S1 input clears after add
PASS - S1 Milk assigned deterministic id 0 :: id=0
PASS - S1 add via button click, ids increment deterministically (0,1,2) :: eggsId=1 breadId=2
PASS - S1 duplicate name allowed (no de-dup), 4 rows now
PASS - S1 duplicate item gets a distinct id from the original :: original=0 dup=3
PASS - S4/S1 item name with HTML/script content is not executed
PASS - S1 item name with HTML content renders as literal escaped text :: got="<script>window.__xss=true</script> & "quotes" 'apostrophe'"
PASS - S1 no stray <script> tag injected into the DOM
PASS - cleanup: back to 3 items (Milk, Eggs, Bread)
PASS - S2 check toggles checked class
PASS - S2 checking does not change row order
PASS - S2 checked state persisted to localStorage immediately (raw shape check) :: {"items":[{"id":0,"name":"Milk","checked":false},{"id":1,"name":"Eggs","checked":true},{"id":2,"name":"Bread","checked":false}],"nextId":5}
PASS - S6 undo enabled after a check action
PASS - S6 undo reverses the check
PASS - S6 undo disables itself after use (no redo)
PASS - S5 first row Up button disabled
PASS - S5 last row Down button disabled
PASS - S5 down-swap reorders adjacent rows :: Milk,Eggs,Bread -> Milk,Bread,Eggs
PASS - S6 undo reverses a reorder swap (self-inverse)
PASS - S3 delete removes the item
PASS - S3 toast shows on delete with correct text :: Deleted "Eggs" — Undo
PASS - S3 delete does NOT trigger a confirm/blocking dialog
PASS - S6 undo restores deleted item at exact original position :: idx=1
PASS - S4 paste strips leading markers (-, 1., *, 2)) correctly :: ["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","-","•NoSpaceBullet"]
PASS - S4 marker regex requires whitespace after marker - "-NoSpaceMarker" is NOT stripped :: ["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","-","•NoSpaceBullet"]
PASS - S4 marker regex requires whitespace after marker - "•NoSpaceBullet" is NOT stripped :: ["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","-","•NoSpaceBullet"]
PASS - S4 a line that is ONLY a marker+space (nothing after) produces no empty/blank item
PASS - S4 textarea clears after successful ingest :: value=""
PASS - S4 whole-blank paste is a no-op (count unchanged)
PASS - S4 whole-blank paste leaves textarea exactly as typed
PASS - S6 undo removes the WHOLE paste batch in one atomic action :: Milk,Eggs,Bread
PASS - Undo-buffer clobber: single Undo reverses only the most recent action (B, the delete)
PASS - Undo-buffer clobber: the earlier action (A, the check) is NOT reversed by that same Undo
PASS - Undo-buffer clobber: buffer is empty after the one Undo (no redo of A available)
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
PASS - S1 raw localStorage shape is { items: Array, nextId: Number } after mutation :: {"items":[{"id":0,"name":"Milk","checked":false},{"id":1,"name":"Eggs","checked":false},{"id":2,"name":"Bread","checked":false},{"id":13,"name":"Chicken","checked":false},{"id":14,"name":"Rice","checked":false},{"id":15,"name":"Paper towels","checked":false},{"id":16,"name":"Coffee","checked":false},{"id":17,"name":"Plain Item","checked":false}],"nextId":18}
PASS - S1 list persists across reload in exact order/content (raw storage diff)
PASS - S6 undo buffer does NOT persist across reload (disabled after reload)
PASS - Mobile viewport 320px: no horizontal overflow (placeholder row markup, structural check only) :: scrollWidth-clientWidth=0
PASS - Mobile viewport 360px: no horizontal overflow (placeholder row markup, structural check only) :: scrollWidth-clientWidth=0
PASS - Mobile viewport 375px: no horizontal overflow (placeholder row markup, structural check only) :: scrollWidth-clientWidth=0
PASS - Mobile viewport 390px: no horizontal overflow (placeholder row markup, structural check only) :: scrollWidth-clientWidth=0

67/67 passed

Console/page errors captured across entire run: none
Dialogs (confirm/alert) captured across entire run: none
Network requests captured across entire run: only file:///.../index.html, style.css, script.js
(the app's own local asset loads from repeated goto/reload calls in the script) - zero external/
backend/third-party requests, consistent with the "fully offline, no network calls" AC.
```

Screenshots: `c:/tmp/pw-test/vop-tester-01-empty.png` through `vop-tester-09-320px-viewport.png`
(9 total).

**Important caveat, disclosed in full in `S4-paste-ingest.md`'s Findings section:** although every
scripted assertion in this run passed as written (67/67), one MINOR real defect was found during
this pass that the original assertion didn't correctly target — a paste line consisting of only a
marker glyph + trailing whitespace creates a spurious junk item (e.g. `"-"`) instead of being
skipped. Not an S6 issue (S6's own undo mechanics are unaffected — undoing such a paste still
correctly removes the junk item along with the rest of that batch); documented against S4 where
it belongs, cross-referenced here for visibility since this file carries the canonical raw
transcript.

**Update, same day (2026-09-04):** the TC4.3 defect above has been fixed by Developer and
independently re-verified. The script this file documents was updated in place with 2 new
fix-verification checks and re-run in full — new total **69/69**, zero regressions elsewhere in
this same transcript. This file's raw-output block above is left as originally captured (the
first, 67/67 run) rather than rewritten, per this project's transparency convention — full detail
of the re-run and its own raw output lines are in `S4-paste-ingest.md`'s "Re-verification,
2026-09-04" section, and the canonical current count is `REGRESSION_LOG.md`'s second 2026-09-04
row (69/69), not this file's original 67/67 figure.
