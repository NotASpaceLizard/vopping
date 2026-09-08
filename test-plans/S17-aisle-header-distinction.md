# Test Plan — S17: More visual distinction for aisle group headers

**STATUS: DONE — formally executed 2026-09-08, PASS (180/180 combined run: 74 Sprint-1 + 80
Sprint-2 regression re-confirmed + 26 new S14/S16/S17 checks), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js`. Full canonical transcript archived in
`S14-shrink-buttons.md`'s Commands section, cross-referenced here rather than duplicated.

**Story:** As a user, when I'm sorting my list by aisle, I want the aisle group headers to stand
out more clearly from item rows, so that I can tell at a glance where one aisle's group ends and
the next begins.

**Acceptance criteria (condensed from BACKLOG.md, Locked):** PO explicitly delegated the exact
visual treatment (spacing/font-weight/font-size/font-family, or some mix) to Developer — no
decision-tool pass needed, PO said "I'm not picky." If any color-coding is introduced it must be
colorblind-safe (Okabe-Ito); plain non-color treatment (spacing/weight/size/font alone) also fully
satisfies this story — color is not itself required. **Developer sanity-check finding, folded in
directly:** aisle group headers must NOT inherit the tap-row cursor/active-state affordances (e.g.
pointer cursor, tap-highlight) that item rows use for their whole-row cross-off tap target — headers
are not clickable/tappable rows themselves.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer implemented and self-verified 2026-09-08, pushed sha `606285f`; this is the independent
Tester verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Testability-check landed clean 2026-09-08, no gaps. Verified against the shipped code prior to
this story landing that the "latent cursor/active-state bug" the Developer sanity-check flagged was
real and reproducible (the pre-S17 `.items li` rule applied indiscriminately to every `<li>`,
including the group-header row, since it carried no distinguishing exclusion) — confirms the AC's
own framing was accurate, not a hypothetical.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC17.1 | Measurably more visual distinction | Compare a group header's computed style to a plain item row's | Differs in at least one of font-weight/text-transform/background |
| TC17.2 | No tap-row cursor | Inspect a group header's computed `cursor` | Not `pointer` |
| TC17.3 | No active-state tap highlight | Simulate a press (mousedown) on a group header | Background unchanged from resting state |
| TC17.4 | Not a clickable row | Inspect for `data-id`/`aria-checked`; force-click it | Neither attribute present; click is a true no-op (item count unchanged) |
| TC17.5 | No per-aisle color-coding | Compare computed color across headers for different aisles | All identical — one uniform color, not per-aisle differentiation (Okabe-Ito N/A) |
| TC17.6 | First-header margin fix | Compare top margin of the first group header vs. later ones | First is 0; later ones have a real gap |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC17.1 | Header: `font-weight:700, text-transform:uppercase, background:rgb(42,42,42)` vs. row: `font-weight:400, background:transparent` | Pass |
| TC17.2 | Header `cursor: default` (row: `pointer`) | Pass |
| TC17.3 | Background identical before/after simulated press (`rgb(42,42,42)` both times) | Pass |
| TC17.4 | No `data-id`/`aria-checked` attributes; item count unchanged after a forced click | Pass (2/2 sub-checks) |
| TC17.5 | All 3 headers (Dairy, Produce, Unassigned) computed the same color `rgb(77,166,255)` | Pass |
| TC17.6 | Margins: `["0px","9.6px","9.6px"]` — first zero, rest consistent | Pass |

**Overall verdict: PASS, 0 defects in S17.** Part of the combined 180/180 run — see
`REGRESSION_LOG.md`'s 2026-09-08/180-total row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js`. Full raw transcript archived in
`S14-shrink-buttons.md`'s Commands section. S17-specific lines (verbatim, in execution order):
```
PASS - TC17.1 group header has measurably more visual distinction than a plain item row :: {"header":{"fontWeight":"700","cursor":"default","textTransform":"uppercase","backgroundColor":"rgb(42, 42, 42)"},"row":{"fontWeight":"400","cursor":"pointer","backgroundColor":"rgba(0, 0, 0, 0)"}}
PASS - TC17.2 group header does NOT use the tap-row pointer cursor :: cursor=default
PASS - TC17.3 group header background does NOT change on press (no :active tap-highlight) :: resting=rgb(42, 42, 42) onPress=rgb(42, 42, 42)
PASS - TC17.4 group header carries no data-id/aria-checked and clicking it is a true no-op
PASS - TC17.5 all group headers use the SAME uniform color regardless of which aisle (not per-aisle color-coding, Okabe-Ito N/A) :: ["rgb(77, 166, 255)","rgb(77, 166, 255)","rgb(77, 166, 255)"]
PASS - TC17.6 first group header has zero top margin; later headers have a real gap above them :: ["0px","9.6px","9.6px"]
```

**Note:** per S16's own row, the PO plans to hand-pick the real icon for S16's icon-only
edit-aisle affordance later (currently a placeholder glyph) — unrelated to this story's own visual
treatment but tracked here too since both live in the same By-Aisle-sort view.
