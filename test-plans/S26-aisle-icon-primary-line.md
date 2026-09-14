# Test Plan — S26: per-item aisle affordance as a primary-line icon (density fix)

**STATUS: DONE — formally executed 2026-09-11, RE-VERIFIED against the FINAL build 2026-09-14, PASS
(11/11 S26-specific; 308/308 full suite), 0 defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 12, plus the S26 retrofits folded into
Parts 2/3/5/6). Full transcript: `c:\tmp\pw-test\s1-s27-run2-afcd725.log` (supersedes the 294/294
`s1-s27-run1.log`). Independent Tester combined S26+S27 formal pass, originally against sha `7f6a327`
and RE-CONFIRMED clean against the FINAL build sha `afcd725` — S26's own code is byte-unchanged from
7f6a327; the +14 checks to the 308 total are purely ADDITIVE coverage for the post-7f6a327 undo-toast
(Part 15) + iOS aisle-picker round-3/round-4 (Part 16) fixes, none of which touch S26's DOM/CSS.

**Story:** As a user shopping on my phone, I want the per-item aisle affordance hidden behind an icon
on the item's primary line (in line with the note/edit/up/down/delete icons) instead of an
always-visible dropdown, so an aisle-less item stays a SINGLE line and I stop losing ~half my screen's
item density to an empty second row on every item.

**Acceptance criteria (from the LOCKED BACKLOG.md S26 row):** a PRESENTATION-only change (S22 stays
Done). The per-item aisle affordance becomes an ICON on the row's PRIMARY line; an item with NO aisle
set renders as a SINGLE line (the aisle `<select>` is no longer forced onto an always-present second
line). R14-safe mechanism = **Option C**: keep the native `<select>` ALWAYS-PRESENT and
always-openable (S22's exact model — the `change`-commit handler and the deferred-`focusout`
`activeElement` guard stay BYTE-FOR-BYTE untouched), but move it OFF `.row-meta` onto the primary line
and collapse it to an `.icon-btn`-sized footprint purely via CSS (`appearance:none`, fixed icon width,
clipped/transparent option text, the PO's glyph U+2316 ⌖ overlaid as a `pointer-events:none` span so a
tap falls THROUGH to the native picker — one tap, no `showPicker()`). N14: never emit an empty
`.row-meta` (+ `.row-meta:empty{display:none}`). Set aisle = "Tag-when-set" (PO Option 1): an inert
`.aisle-tag-set` pill shown Manual/Alpha, SUPPRESSED under By-Aisle (S16 redundant-tag lesson); the
edit affordance stays on the primary line in every sort mode. QA folds: M25 (MEASURE the collapsed
select's real footprint, don't assume `.icon-btn` parity), N14 (empty-`.row-meta`), N15 (glyph a11y).

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, FINAL build sha `afcd725` (S26's own code byte-unchanged from `7f6a327`).

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Prior testability-check landed at Lock (TESTABLE, zero blocking; C1/C2/C3 clarifications folded into
the AC). NB-6 discipline: the tap-through-opens-the-native-picker behavior is a REAL-DEVICE signal,
NOT a desktop gate — the desktop pass asserts only the structural proxies (select present on the
PRIMARY line at the ~19.5px icon footprint, glyph overlay `pointer-events:none`+`aria-hidden`, the
`change`-commit path works, NO reveal-render, the select persists across renders). **C2 canonical
density signal:** an aisle-less+note-less row's height EQUALS the locked single-line reference AND
emits no second-line content — the deterministic signal for the density fix.

## Test cases (Part 12, TC-ids S26.1–S26.11)
| ID | Covers AC | Expected |
|----|-----------|----------|
| S26.1 | primary-line placement | the `<select>` is inside a `.aisle-control` that is a DIRECT `<li>` child, never in `.row-meta` |
| S26.2 | glyph overlay (N15) | `.aisle-glyph` is `pointer-events:none` + `aria-hidden="true"`, non-empty glyph (tap falls through) |
| S26.3 | M25 real footprint | MEASURED `.aisle-control` box ≈ 19.5×19.5px (measured, not assumed icon-btn parity) |
| S26.4 | C2 density | aisle-less+note-less row is single-line — NO `.row-meta`, height ~36px (locked single-line spec) |
| S26.5 | N14 | an empty `.row-meta` computes `display:none` (the `:empty` guard) |
| S26.6 | R14-safe commit | selecting an existing option commits on `change` (persists) |
| S26.7 | R14 structural invariant | the `<select>` persists across an unrelated re-render (never destroyed/recreated to reveal it) |
| S26.8 | Tag-when-set (Manual) | a SET aisle renders an inert `.aisle-tag-set` pill in `.row-meta` (canonical label) + the primary-line select stays |
| S26.9 | Tag-when-set (Alpha) | the set-aisle tag is still shown under Alphabetical sort |
| S26.10 | By-Aisle suppression | the tag is SUPPRESSED under By-Aisle while the primary-line edit select is KEPT (S9/S16 edit-in-every-mode) |
| S26.11 | tag inert | tapping the tag (`data-role="aisle-tag"`, no action branch) does NOT cross the row off |

**Retrofits supporting S26 (folded into the regression baseline, flipped FAIL→PASS in place):** the
S22-era "always-present select on a second line / every row two-line" expectations are superseded —
TC7.1/TC7.12 (single-line-when-empty re-established), TC8.14 (M24: select on primary line, aisle-less
row emits no `.row-meta`), TC16.8/TC16.9 (By-Aisle: control on primary line, tag suppressed),
TC15.2/TC15.16 (a plain row's name editor adds no second line — `.row-meta` count 0), TC20.4 (a plain
row is single-line ~36px again).

## Results
**11/11 PASS (Part 12), 0 defects.** The `<select>` is a primary-line `.aisle-control` direct `<li>`
child (never in `.row-meta`); the glyph overlay is `pointer-events:none`+`aria-hidden`; the collapsed
control MEASURES 19.5×19.5px (real, per M25); an aisle-less+note-less row emits no `.row-meta` and is
36.17px single-line (C2); the `:empty` guard resolves an empty `.row-meta` to `display:none` (N14);
`change`-commit persists and the select survives an unrelated re-render (R14 structural invariant);
Tag-when-set shows the inert pill in Manual/Alpha, is SUPPRESSED under By-Aisle, and the primary-line
edit control is kept in every mode; tapping the tag does not cross the row off.

**M24/R7 overflow re-check — MEASURED, not assumed (per M25):** separate targeted closure script
`c:\tmp\pw-test\vopping-worst-case-row-s26-s27-closure.js` (9/9 PASS). Worst-case primary line =
6 controls (note-toggle + `.aisle-control` select + edit + Up + Down + delete). The collapsed
`.aisle-control` footprint MEASURES exactly **19.5×19.5px at all four widths** (the select fills it at
19.5×19.5px too) — real measurement, NOT `.icon-btn` parity. **Zero horizontal overflow at
320/360/375/390px; row height 36.17px (single line); item-name space 117px@320 → 187px@390.**
Screenshots `c:/tmp/pw-test/vop-worstcase-s26s27-6ctrl-{320,360,375,390}px.png`. This SUPERSEDES the
pre-S22 `vopping-worst-case-row-6icon-closure.js` (which measured the removed free-text aisle-toggle
BUTTON) as the definitive worst-case-row evidence.

**Overall verdict: PASS (11/11 S26-specific; 308/308 full suite), 0 defects.** See `REGRESSION_LOG.md`
2026-09-14 row (308 total — the current canonical figure), script `vopping-tests-tester-s1-s27-formal.js`.

**FINAL-build re-verification (afcd725), 2026-09-14:** the full S1-S27 suite was extended in place
(Parts 15 undo-toast + 16 round-3/round-4) and re-run against `afcd725` → **308/308 PASS, 0 defects,
zero console/page errors**. S26's own Part 12 (S26.1-S26.11) and the S26 layout retrofits (Parts
2/3/5/6) re-confirmed clean and byte-unchanged; the closure script re-confirmed the 19.5×19.5px
`.aisle-control` footprint + zero overflow at all four widths against `afcd725`. No S26 defect,
reopen, or regression.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` → `c:\tmp\pw-test\s1-s27-run2-afcd725.log`
(Part 12; supersedes the 294/294 `s1-s27-run1.log`).
`node "c:/tmp/pw-test/vopping-worst-case-row-s26-s27-closure.js"` → 9/9 PASS (M25 real-footprint
measurement + screenshots). Zero console/page errors, zero dialogs, zero non-`file://` network
requests across both runs.
