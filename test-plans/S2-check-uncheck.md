# Test Plan — S2: Cross off (check/uncheck) an item

**STATUS: DONE — density-picker.html CSS/markup follow-up pass re-verified 2026-09-04, PASS
(74/74 combined re-run), zero defects.** BACKLOG.md's Tracked follow-up gate (QA finding M3) is
now closed. Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js`.

**Accessibility-scope note (PO decision relayed 2026-09-04):** keyboard-only/screen-reader
coverage below (ARIA role/attributes, keyboard toggle, focus-restoration across re-render) is
kept as informational sanity-check coverage, not a required blocking gate going forward — see
S1-render-add-persistence.md's identical note for the full context. It passed, which is good to
know, but no further investment is planned here per the PO's explicit scope call.

**Story:** As a user, I want to cross an item off, so that I can mark it as already in my cart
without deleting it from the list.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** tap/click target toggles
crossed-off status. **Row density/interaction — LOCKED (PO's final pick):** the tap target is the
ENTIRE row, not a separate checkbox — no checkbox or dot glyph of any kind; crossed-off rows are
shown via strikethrough + dimmed item-name text only. **Nested-control precedence:** the row's own
cross-off toggle fires ONLY when a tap doesn't land on a more specific interactive control already
inside the row (delete, up/down) — those controls' own taps perform only their own action and must
NOT also toggle the row's crossed-off state. Crossed-off items stay in the list; toggling updates
localStorage immediately, no reload; crossing off/on does NOT change row position; undo-eligible
(S6).

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Original
toggle mechanic (checkbox-based) implemented 2026-09-04; replaced with the whole-row/ARIA
mechanic 2026-09-04 same day, per the locked density spec.

**Tooling:** Same as S1 — Playwright via `channel: 'chrome'`.

## Testability review summary (for scrum-master)
No open items. The density-CSS gate is now closed. "Visually distinct" is verified both via the
`checked` class and via actual computed style (`text-decoration-line`, dimmed color), not just the
class name, since the visual treatment is now the locked spec rather than a placeholder.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC2.1 | Row itself carries checkbox ARIA semantics | Inspect a row's attributes | `role="checkbox"`, `tabindex="0"`, `aria-checked`, `aria-label` matching the item name |
| TC2.2 | No checkbox glyph of any kind | Inspect row markup | Zero `<input>` elements anywhere in the row |
| TC2.3 | Tapping the row toggles cross-off | Click the row's name text (not a nested button) | `checked` class + `aria-checked` both flip to true |
| TC2.4 | No reposition on cross-off | Compare row-name order before/after | Identical order |
| TC2.5 | Persists immediately, correct raw shape | Cross off an item, read `localStorage` directly | That item's `checked: true` in the stored `items` array immediately |
| TC2.6 | Locked visual spec: strikethrough + dimmed | Cross off an item, read computed style | `text-decoration-line: line-through`; color visibly differs from an un-crossed sibling |
| TC2.7 | Nested-control precedence (CLICK) | Click Up/Down/Delete on a row | Only that control's own action fires; the row's own cross-off state is untouched |
| TC2.8 | Nested-control precedence (KEYBOARD) | Focus Up button via keyboard, press Enter | Swap performed; row's cross-off state untouched (native button click doesn't double-fire the row's delegated toggle) |
| TC2.9 | Keyboard toggle | Focus a row, press Space; press Enter | Both keys toggle cross-off |
| TC2.10 | Repeated keyboard toggle survives re-render (focus-restoration fix) | Focus a row, press Space 4 times in a row without re-focusing | Each toggle succeeds; keyboard focus stays on the same row after every re-render |
| TC2.11 | Undo-eligible | Cross off, click Undo | Reverts (see S6-undo.md) |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC2.1 | `role="checkbox"`, `tabindex="0"`, `aria-checked="false"` initially, `aria-label="Milk"` | Pass |
| TC2.2 | 0 `<input>` elements found in `.items` | Pass |
| TC2.3 | class + `aria-checked` both → true after clicking `.item-name` | Pass |
| TC2.4 | `namesBefore === namesAfterCheck` (JSON-identical) | Pass |
| TC2.5 | Raw storage read immediately after click confirms `checked: true` for that id | Pass |
| TC2.6 | `text-decoration-line: line-through`; `rgb(153,153,153)` (crossed) vs `rgb(221,221,221)` (not crossed) | Pass |
| TC2.7 | Clicking Down swapped the row but left `aria-checked` unchanged (`false` before and after) | Pass |
| TC2.8 | Enter on a focused Up button performed the swap; `aria-checked` unchanged (`false` before and after) | Pass |
| TC2.9 | Space flips to true; subsequent Enter flips back to false | Pass |
| TC2.10 | 4 consecutive Space presses: true→false→true→false, correctly alternating; `document.activeElement` remained the same row's `<li>` (by `data-id`) after every single re-render, no re-tab needed | Pass |
| TC2.11 | Cross-referenced in S6-undo.md — undo correctly reverses the cross-off, `aria-checked` back to `false` | Pass |

**Overall verdict: PASS, 0 defects in S2. Locked density spec fully implemented and verified —
S2 is DONE.** Regression count: 74/74, `REGRESSION_LOG.md` current row.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js`. Full raw transcript
archived in `S5-reorder-buttons.md`'s Commands section. S2-specific lines:
```
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
PASS - Locked spec: Space key on a focused row toggles cross-off
PASS - Locked spec: Enter key on a focused row ALSO toggles cross-off (both keys supported)
PASS - Focus-restoration fix: toggle #1 through #4 - aria-checked correctly flips each time, keyboard focus survives every re-render, stays on the same row (no re-tab needed)
PASS - Nested-control precedence (CLICK): clicking Down does NOT also toggle the row's cross-off state
PASS - Nested-control precedence (KEYDOWN): Enter on a focused Up button does NOT also toggle cross-off
```
Screenshot: `c:/tmp/pw-test/vop-density-01-three-items.png`.
