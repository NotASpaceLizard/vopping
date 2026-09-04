# Test Plan — S5: Reorder via up/down buttons

**STATUS: FORMAL PASS COMPLETE, PASS (all S5-relevant assertions, part of a 67/67 combined
Sprint 1 run), zero defects in currently-testable mechanics — NOT YET DONE.** Same
density-picker-CSS-follow-up gate as S1/S2 (BACKLOG.md Tracked follow-up note, QA finding M3) —
button sizing fit isn't locked yet, so Status stays open until that follow-up pass lands and is
Tester-verified. Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`.

**Story:** As a user, I want to move an item up or down using buttons, so that I can manually
arrange my list without relying on drag-and-drop.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** each row has Up/Down buttons;
click swaps with immediate neighbor; top row's Up and bottom row's Down are disabled/no-op;
swap updates persisted order immediately, survives refresh; each swap is one of the four S6
undo-eligible types. Button sizing must fit whatever row height the PO ultimately picks from
density-picker.html — **same TBD as S1, not evaluated here as pass/fail; the swap mechanic
itself doesn't depend on the outcome.**

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

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC5.1 | `isDisabled() === true` | Pass |
| TC5.2 | `isDisabled() === true` | Pass |
| TC5.3 | `Milk,Eggs,Bread` → `Milk,Bread,Eggs` (Eggs/Bread swapped, Milk untouched) | Pass |
| TC5.4 | Post-undo order `JSON.stringify` identical to pre-swap order | Pass |
| TC5.5 | Covered as part of the broader reload-persistence check in S1-render-add-persistence.md (raw storage diff across the full mutation history, which includes this swap) | Pass |

**Overall verdict: PASS, 0 defects in S5.** Part of the combined 67/67 Sprint 1 run — see
`REGRESSION_LOG.md` (2026-09-04 row).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`. Full raw transcript in
`test-plans/S6-undo.md`. S5-specific lines:
```
PASS - S5 first row Up button disabled
PASS - S5 last row Down button disabled
PASS - S5 down-swap reorders adjacent rows :: Milk,Eggs,Bread -> Milk,Bread,Eggs
PASS - S6 undo reverses a reorder swap (self-inverse)
```
