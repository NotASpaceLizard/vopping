# Test Plan — S24: add a new aisle from the item's dropdown

**STATUS: DONE — formally executed 2026-09-10, PASS (9/9), 0 defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 9). Full transcript:
`c:\tmp\pw-test\s1-s25-run2.log`. Independent Tester formal pass against pushed sha `027672a`.

**Story:** As a user, when I'm choosing an item's aisle and the aisle I need isn't in the list yet, I
want to add it without leaving the item, so that I can categorize the item on the spot.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-10):** a sentinel "+ Add new aisle…"
option positioned ALWAYS LAST in the per-item `<select>`, carrying a RESERVED value distinct from any
real aisle; on change it reveals a name-entry input styled ≥16px; on commit → create + persist (via
S23 validation) + assign + re-select the item. The new-aisle field must NOT reuse the removed 'aisle'
editingField path — it is its OWN mechanism ('new-aisle' type). C1 guard: `commitEditor()` must have
an explicit new-aisle branch (revert), never fall through to `saveName()` (which would corrupt the
item name). Revert-on-cancel: capture the PRIOR aisle before the sentinel changes `select.value`; the
revert to that value fires on empty commit, explicit cancel, AND blur — even when the typed name is
empty OR collides (blur = revert wins, M22); only an EXPLICIT commit of a colliding/invalid name
surfaces S23 NB-3's stay-open + inline message. R14: opening the sentinel reveal first flushes any
other open editor.

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, sha `027672a`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Testability-check confirmed the sentinel presence, reveal-input mechanism, create+assign+re-select,
C1 guard, revert-on-blur, and R14 flush are each deterministic DOM/state assertions. The two-step
iOS overlay behavior is a real-device note, not a desktop gate (NB-6). No blocking gaps at Lock.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC24.1 | sentinel | "+ Add new aisle…" is the LAST option, reserved value distinct from any aisle |
| TC24.2 | reveal (own mechanism) | selecting the sentinel reveals a dedicated `new-aisle-input`, auto-focused, ≥16px |
| TC24.3 | not the removed path | no `[data-role=aisle-input]` exists anywhere (own 'new-aisle' mechanism) |
| TC24.4 | valid commit | Enter creates+persists in `state.aisles`, assigns to the item, re-selects on the `<select>` |
| TC24.5 | C1 guard | abandoning a new-aisle draft by blur REVERTS — never corrupts the item name (no saveName fall-through) |
| TC24.6 | revert-on-cancel | empty commit reverts the select to the captured PRIOR aisle, no aisle created |
| TC24.7 | explicit invalid | committing a colliding name ("dairy") stays open + inline error, creates nothing |
| TC24.8 | blur reconciliation (M22) | blur dismissal — even with a colliding typed name — REVERTS; reveal closes; select returns to prior |
| TC24.9 | R14 sentinel | opening the reveal first flushes an open editor on another row (its note commits) |

## Results
**9/9 PASS, 0 defects.** Sentinel is last with the reserved token value; the reveal is the dedicated
`new-aisle-input` (≥16px, auto-focused) and the removed free-text `aisle-input` is absent everywhere.
A valid commit creates "Candy", assigns it, and re-selects it. **C1 guard confirmed:** abandoning a
new-aisle draft by blur reverts and leaves the item NAME intact ("Widget"), no aisle created — the
`commitEditor()` new-aisle branch does not fall through to `saveName()`. Revert-on-cancel (empty
commit) and M22 blur-with-collision both return the select to the captured prior "Dairy". Explicit
colliding commit stays open with the inline error (contrast: the analogous Settings-rename path does
NOT — see S23 defect D1; S24's row-level flow is correct here because its `focusout` handler carries
the `activeElement` guard). R14 sentinel flush commits the other row's note.

**Overall verdict: PASS (9/9), 0 defects.** Full suite: 268/269 (the lone fail is defect D1 on S23,
a Settings-side rename gap, unrelated to S24) — see `REGRESSION_LOG.md` 2026-09-10 row, script
`vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run2.log` (Part 9). Zero
console/page errors, zero dialogs, zero non-`file://` network requests.
