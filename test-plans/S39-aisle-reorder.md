# Test Plan — S39: reorder whole aisles from the By-Aisle group headers (absorbs FT3)

**STATUS: DONE (desktop-verifiable AC) — independent Tester formal pass 2026-09-17, PASS as part of the
combined 516/516 Sprint-8 run (Part 28), zero defects; reproduced twice.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 28); transcripts
`c:/tmp/pw-test/s37-s39-runA.log` + `s37-s39-runB.log` (both 516/516). See `REGRESSION_LOG.md`'s
2026-09-17 row. **NB-6 device-only signals ride the PO's on-device check — see the note below.**

**Story:** As a user shopping, I want up/down arrows on each aisle group header (in the By-Aisle view)
to move that whole aisle up or down, so that both my list's aisle order AND the aisle picker follow the
order I actually walk my store — without opening Settings mid-shop.

**Acceptance criteria (condensed from BACKLOG.md S39 row, locked):** each By-Aisle group header gains
up/down controls that move that whole aisle within a PERSISTED order. ONE persisted order (`state.aisles`,
already authoritative for the picker via `getAislePool()`) now drives BOTH (a) the by-aisle grouping
sequence — grouping switched from ALPHABETICAL to `state.aisles` INDEX order, alphabetical tie-break
WITHIN a group unchanged — AND (b) the picker `<select>` option order (FT3's fix). A reorder splices/
swaps the aisle within `state.aisles`, then `saveState()` + `render()`. Reuse the existing U+25B2/U+25BC
registry glyphs (`iconFor('move-up'/'move-down')`, escapeHtml-wrapped). Header carries `data-aisle-key`;
the list click delegation is extended (before the `li[data-id]` early-return) to handle header up/down.
Edge cases: the no-aisle bucket is NOT reorderable and stays pinned last (no arrows); the first real
aisle's Up and the last real aisle's Down are disabled; a newly-created aisle appends at the end; any
R15 dangling value keeps the defensive fallback (never crash, never render `undefined`), ordered after
the known groups. Do NOT regress S16/S17/S26 or the S29 iOS re-open fix / R14. **Build note:** the
reorder swaps with the nearest VISIBLE (item-bearing) neighbor so every tap visibly moves the group;
empty headerless aisles between them keep their slots and ride along. First/last disable is on the
VISIBLE-group basis.

**Deliverable under test:** `script.js` (`moveAisle`/`getVisibleAisleOrder`/`indexInAisles`; the
index-order grouping comparator in `getSortedItems('aisle')`; the header render emitting `data-aisle-key`
+ `.aisle-group-label`/`.aisle-group-controls` with the disabled-neighbor arrows; the click-delegation
header branch; the focus-restore-on-repeat-tap in `renderList`), `style.css`
(`.aisle-group-label`/`.aisle-group-controls`, arrow sizing). Opened via `file://`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, 390×700. NOTE: the headers
now contain the arrow glyphs, so header text is read via the `.aisle-group-label` span (helper
`aisleGroupLabels()`), not the `<li>`'s own textContent.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| S39.1 | reorder drives grouping | initial = state.aisles INDEX order [Produce, Bakery, Dairy & Eggs]; Bakery Up → [Bakery, Produce, Dairy & Eggs] |
| S39.2 | reorder drives picker (FT3) | after reorder the per-item `<select>` options show Bakery before Produce |
| S39.3 | persist across reload | reordered grouping + `state.aisles` order survive a reload |
| S39.4 | first/last disable (visible basis) | first visible group Up disabled, last visible group Down disabled; inner arrows enabled |
| S39.5 | no-aisle bucket last, not reorderable | "Other" renders last, no `data-aisle-key`, no arrows |
| S39.6 | R15 dangling key | "Narnia" renders after known aisles, not reorderable, never "undefined" |
| S39.7 | move past empty aisles | Produce(0) Down swaps with nearest VISIBLE neighbor Dairy & Eggs(5); slots 0↔5, empties ride along |
| S39.8 | focus-restore on repeat tap | after a reorder rebuild, focus is restored onto the same aisle's arrow |
| S39.9a–d | delegation non-regression | cross-off intact; arrow ≠ cross-off; S19 row Up/Down intact; S26 select + S15 name editor intact, no cross-fire |
| S39.10 | view-only for items | a reorder permutes `state.aisles` ONLY; `state.items` byte-identical |

## Results
All 13 checks PASS (Part 28 of the combined suite). Verbatim PASS lines:
```
PASS - S39.1 (reorder drives grouping) initial [Produce, Bakery, Dairy & Eggs]; Bakery Up -> [Bakery, Produce, Dairy & Eggs]
PASS - S39.2 (reorder drives picker, FT3) Bakery now precedes Produce in the dropdown
PASS - S39.3 (persist across reload) grouping stays [Bakery, Produce, Dairy & Eggs] AND state.aisles has Bakery before Produce
PASS - S39.4 (first/last disable, visible-group basis) Bakery Up disabled + Dairy & Eggs Down disabled; inner arrows enabled
PASS - S39.5 (no-aisle bucket last, NOT reorderable) "Other" last, no data-aisle-key, no arrows
PASS - S39.6 (R15 dangling key) "Narnia" after known aisles, not reorderable, never "undefined"
PASS - S39.7 (move past empty aisles = nearest VISIBLE neighbor) [Produce, Dairy & Eggs] -> [Dairy & Eggs, Produce]; slots 0<->5, empties rode along
PASS - S39.8 (focus-restore on repeat tap) Produce moved down one and its Down arrow keeps focus
PASS - S39.9a (delegation: cross-off intact) a tap on an item row still crosses it off in By-Aisle
PASS - S39.9b (delegation: arrow != cross-off) a header arrow reorders but crosses off ZERO rows
PASS - S39.9c (delegation: S19 intact) the row [data-role=down] still moves the item; no collision
PASS - S39.9d (delegation: S26 + S15 intact) select commit + name editor both work, neither crosses off
PASS - S39.10 (view-only for items) an aisle reorder permutes state.aisles ONLY; state.items byte-identical
```

Related retrofit (same run): S9 **TC9.3** was superseded in place — By-Aisle group ORDER is now the
`state.aisles` INDEX order (Produce before Dairy & Eggs), NOT alphabetical; within-group alphabetical
(TC9.3b) and no-aisle-bucket-last (TC9.17) unchanged. TC9.3/TC9.13 header reads switched to the
`.aisle-group-label` span (headers now carry arrows).

**Overall verdict: PASS, 0 defects in S39.**

## NB-6 (device-only — NOT asserted on desktop; rides the PO's on-device check)
The header-arrow path does NOT touch the S29 iOS aisle-picker re-open carve-out (that fires only for
`focusedRole === 'aisle-select'`; the header arrows use `focusedAisleKey`/`aisle-up`/`aisle-down`), and
the desktop pass re-proves S26 select mechanics + focus-restore. The actual iOS picker-reopen
non-regression and R14 focus-timing on the device are real-device signals that ride the PO's on-device
acceptance in parallel, per the NB-6 convention.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 28). Reproduced twice —
`c:/tmp/pw-test/s37-s39-runA.log` and `s37-s39-runB.log`, both 516/516, zero console/page errors, zero
dialogs, zero non-`file://` requests.
