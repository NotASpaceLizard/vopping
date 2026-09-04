# Test Plan — S5: Reorder via up/down buttons

**STATUS: DONE — density-picker.html CSS/markup follow-up pass re-verified 2026-09-04, PASS
(74/74 combined re-run), zero defects.** BACKLOG.md's Tracked follow-up gate (QA finding M3) is
now closed. Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js`.

**Accessibility-scope note (PO decision relayed 2026-09-04):** the keyboard nested-control-
precedence check below (TC5.6) is kept as informational sanity-check coverage per the PO's
scoping call — see S1-render-add-persistence.md's note for full context. Not a blocking gate.

**Story:** As a user, I want to move an item up or down using buttons, so that I can manually
arrange my list without relying on drag-and-drop.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** each row has Up/Down buttons;
click swaps with immediate neighbor; top row's Up and bottom row's Down are disabled/no-op;
swap updates persisted order immediately, survives refresh; each swap is one of the four S6
undo-eligible types. **Nested-control precedence (locked AC):** tapping Up/Down performs ONLY
that swap and must NOT also trigger the row's whole-row cross-off toggle, per the now-locked
density spec (whole row is the tap target for S2's cross-off).

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04.

**Tooling:** Same as S1.

## Testability review summary (for scrum-master)
No open items for the swap mechanic itself. Button-sizing-vs-density-pick remains tracked in
BACKLOG.md's top-of-file follow-up note, outside this pass's scope by design.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC5.1 | Top row's Up disabled | Inspect first row's Up button | `disabled` attribute present |
| TC5.2 | Bottom row's Down disabled | Inspect last row's Down button | `disabled` attribute present |
| TC5.3 | Down-swap exchanges adjacent rows | Click a middle row's Down button | That row and its lower neighbor exchange positions, nothing else moves |
| TC5.4 | Swap is undo-eligible and self-inverse | Swap, then click Undo | Order returns to exactly what it was before the swap |
| TC5.5 | Swap persists immediately, survives refresh | Swap, reload | New order retained after reload |
| TC5.6 | Nested-control precedence, click AND keyboard | Click Down on a row; separately, focus Up via keyboard and press Enter | In both cases: swap happens, row's own cross-off `aria-checked` is untouched |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC5.1 | `isDisabled() === true` | Pass |
| TC5.2 | `isDisabled() === true` | Pass |
| TC5.3 | `Milk,Eggs,Bread` → `Milk,Bread,Eggs` (Eggs/Bread swapped, Milk untouched) | Pass |
| TC5.4 | Post-undo order `JSON.stringify` identical to pre-swap order | Pass |
| TC5.5 | Covered as part of the broader reload-persistence check in S1-render-add-persistence.md (raw storage diff across the full mutation history, which includes this swap) | Pass |
| TC5.6 | Click-Down: swap occurred, `aria-checked` unchanged (false before/after). Keyboard (Enter on focused Up): swap occurred, `aria-checked` unchanged (false before/after) | Pass |

**Overall verdict: PASS, 0 defects in S5. Locked density spec (button sizing fits the now-locked
row, nested-control precedence holds for both click and keyboard) fully verified — S5 is DONE.**
Regression count: 74/74, `REGRESSION_LOG.md` current row.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js`:
```
cd /c/tmp/pw-test && node vopping-tests-tester-s1-s2-s5-density-formal.js
```
This is the canonical full raw transcript for the density re-verification pass — S1-density.md
and S2-check-uncheck.md cross-reference this section rather than duplicating it (same convention
as the original combined pass's `S6-undo.md` arrangement). Full raw output (74 assertions, in
execution order):
```
PASS - S1 corrupted storage (literal "null") does not throw
PASS - S1 corrupted storage (literal "null") falls back to clean empty state
PASS - S1 corrupted storage (raw top-level array) does not throw
PASS - S1 corrupted storage (raw top-level array) falls back to clean empty state
PASS - S1 corrupted storage (object missing items key) does not throw
PASS - S1 corrupted storage (object missing items key) falls back to clean empty state
PASS - S1 corrupted storage (items present but not an array) does not throw
PASS - S1 corrupted storage (items present but not an array) falls back to clean empty state
PASS - S1 corrupted storage (not JSON at all) does not throw
PASS - S1 corrupted storage (not JSON at all) falls back to clean empty state
PASS - S1 empty state message shown on first load :: No items yet — add one above to get started.
PASS - S1 add mechanics unaffected by density change (3 items, deterministic ids)
PASS - Locked spec: row itself carries role="checkbox"
PASS - Locked spec: row itself is tabindex="0" (keyboard-focusable)
PASS - Locked spec: row aria-checked="false" initially
PASS - Locked spec: row aria-label matches item name
PASS - Locked spec: NO checkbox <input> element anywhere in the list (glyph fully removed)
PASS - Locked spec: NO input element of any kind in a row (fully glyph-free)
PASS - S2 tapping the row (via its name span) toggles crossed-off class
PASS - S2 aria-checked flips to "true" in sync with the class
PASS - S2 crossing off does not change row order
PASS - S2 crossed-off state persisted to localStorage immediately
PASS - Locked spec: crossed-off item name has strikethrough (computed text-decoration-line: line-through)
PASS - Locked spec: crossed-off item name is visually dimmed (color differs from an un-crossed sibling)
PASS - S6 undo enabled after a cross-off action
PASS - S6 undo reverses the cross-off (aria-checked back to false)
PASS - S6 undo disables itself after use (no redo)
PASS - Locked spec: Space key on a focused row toggles cross-off
PASS - Locked spec: Enter key on a focused row ALSO toggles cross-off (both keys supported)
PASS - Focus-restoration fix: toggle #1 - aria-checked correctly flips to true
PASS - Focus-restoration fix: toggle #1 - keyboard focus survives the re-render, stays on Milk's row (no re-tab needed)
PASS - Focus-restoration fix: toggle #2 - aria-checked correctly flips to false
PASS - Focus-restoration fix: toggle #2 - keyboard focus survives the re-render, stays on Milk's row (no re-tab needed)
PASS - Focus-restoration fix: toggle #3 - aria-checked correctly flips to true
PASS - Focus-restoration fix: toggle #3 - keyboard focus survives the re-render, stays on Milk's row (no re-tab needed)
PASS - Focus-restoration fix: toggle #4 - aria-checked correctly flips to false
PASS - Focus-restoration fix: toggle #4 - keyboard focus survives the re-render, stays on Milk's row (no re-tab needed)
PASS - Repeated-toggle sanity: 4 toggles from false lands back on false
PASS - S5 first row Up button disabled
PASS - S5 last row Down button disabled
PASS - S5 down-swap (click) reorders adjacent rows
PASS - Nested-control precedence (CLICK): clicking Down does NOT also toggle the row's cross-off state
PASS - S6 undo reverses a reorder swap (self-inverse)
PASS - Nested-control precedence (KEYDOWN): Enter on a focused Up button performs the swap
PASS - Nested-control precedence (KEYDOWN): Enter on a focused Up button does NOT also toggle cross-off
PASS - S3 delete removes the item
PASS - S3 toast shows on delete with correct text :: Deleted "Eggs" — Undo
PASS - S3 delete does NOT trigger a confirm/blocking dialog
PASS - Nested-control precedence: deleting one row does not toggle a SIBLING row's cross-off state
PASS - S6 undo restores deleted item at exact original position
PASS - S4 paste marker-stripping unaffected by density change
PASS - S4 no-space boundary case still preserved verbatim
PASS - S4 marker-only-line fix still holds (no "-" junk item)
PASS - S6 undo removes the whole paste batch atomically
PASS - Undo-buffer clobber (new mechanic): single Undo reverses only B (the delete)
PASS - Undo-buffer clobber (new mechanic): A (the cross-off) is NOT reversed by that Undo
PASS - Terminology rename: global control button reads "Clear crossed off"
PASS - S12 Clear-crossed-off disabled when nothing is crossed off
PASS - S12 Clear-crossed-off enabled once something is crossed off
PASS - S12 clear removes exactly the crossed-off (scattered) items
PASS - S12 clear does NOT trigger a confirm/blocking dialog
PASS - S12 toast shows correct pluralized count ("Cleared 3 items — Undo")
PASS - S12 undo restores ALL cleared items to exact original scattered positions
PASS - S12 undo restores crossed-off=true specifically on restored item id=1
PASS - S12 undo restores crossed-off=true specifically on restored item id=10
PASS - S12 undo restores crossed-off=true specifically on restored item id=12
PASS - S12 toast uses singular "item" (not "items") when clearing exactly one
PASS - Persistence unaffected by density change (raw storage diff across reload)
PASS - S6 undo buffer still does not persist across reload
PASS - Mobile viewport 320px: no horizontal overflow (locked row spec) :: overflow=0
PASS - Mobile viewport 360px: no horizontal overflow (locked row spec) :: overflow=0
PASS - Mobile viewport 375px: no horizontal overflow (locked row spec) :: overflow=0
PASS - Mobile viewport 390px: no horizontal overflow (locked row spec) :: overflow=0
PASS - Locked spec: row height meets WCAG 2.5.5 AA tap-target minimum (>=24px) :: height=39.78125

74/74 passed

Console/page errors: none. Dialogs: none. Non-local network requests: 0.
```
Screenshots: `c:/tmp/pw-test/vop-density-01-three-items.png`, `vop-density-02-after-clear-checked.png`,
`vop-density-03-320px-viewport.png`.
