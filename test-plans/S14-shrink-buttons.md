# Test Plan — S14: Shrink row-control buttons ~25%

**STATUS: DONE — formally executed 2026-09-08, PASS (180/180 combined run: 74 Sprint-1 + 80
Sprint-2 regression re-confirmed + 26 new S14/S16/S17 checks), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js` (Tester-independent — supersedes
Developer's own self-check as citation of record per playbook). This file holds the canonical full
transcript for that script's Part 3 (S14/S16/S17), cross-referenced by S16/S17's own files rather
than duplicated.

**Story:** As a user, I want the remaining per-row control buttons to be about 25% smaller, so
that removing the Up/Down buttons (S13) actually frees up usable row space instead of leaving it
empty.

**Acceptance criteria (condensed from BACKLOG.md, Locked):** uniform ~25% size reduction on the
row's nested icon/button controls — note-toggle (S7), aisle-toggle (S8), delete (S3), S13's
drag-handle if a dedicated one exists (S13 not yet shipped), and S16's new icon-only edit-aisle
affordance (cross-reference M14, added after this story locked); does NOT affect item-name/
note-display/aisle-tag text size, nor either tag's own surrounding chrome (moot — neither has any);
visual/sizing-only, no functional/behavioral change to any control's action. PO explicitly accepted
controls landing under the informational 24px tap-target floor as a tradeoff (26px × 0.75 =
19.5px) — not a violation to re-flag.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer implemented and self-verified 2026-09-08 (15/15 new checks across S14/S16/S17 combined,
0 console errors, both prior regression suites re-confirmed clean), pushed sha `606285f`; this is
the independent Tester verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Testability-check landed clean 2026-09-08, no gaps — see BACKLOG.md's S14 row. Verified against the
actual shipped CSS: `.items .icon-btn` is now `width: 19.5px; height: 19.5px` (was 26px), confirming
the AC's own stated math exactly.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC14.1 | Uniform ~25% shrink on note-toggle/aisle-toggle/delete | Measure each control's bounding box | Each ~19.5×19.5px (26px baseline × 0.75) |
| TC14.2 | Item-name text size untouched | Compare `.item-name` computed font-size to the shrunk icon-btn's | Different values — text sizing unaffected |
| TC14.3 | Note-display/aisle-tag text size untouched | Compare `.note-display`/`.aisle-tag` computed font-size to the icon-btn's | Both larger than the icon-btn's font-size — unaffected |
| TC14.4 | No functional/behavioral change | Click the shrunk delete button | Still deletes correctly |
| TC14.5 | Cross-reference M14: S16's new icon-only affordance also shrinks | Measure that affordance's bounding box while sorted By Aisle | ~19.5×19.5px, same as the other controls |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC14.1 | note-toggle/aisle-toggle/delete all measured exactly 19.5×19.5px | Pass (3/3 sub-checks) |
| TC14.2 | `.item-name` font-size 16px vs. icon-btn's 9.6px | Pass |
| TC14.3 | `.aisle-tag`/`.note-display` font-size 12.48px vs. icon-btn's 9.6px | Pass |
| TC14.4 | Delete count decremented correctly on click | Pass |
| TC14.5 | S16's icon-only affordance measured 19.5×19.5px while sorted By Aisle | Pass |

**Overall verdict: PASS, 0 defects in S14.** Part of the combined 180/180 run — see
`REGRESSION_LOG.md`'s 2026-09-08/180-total row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js` (covers full Sprint-1 + Sprint-2
regression + S14/S16/S17 in one run):
```
node /c/tmp/pw-test/vopping-tests-tester-s14-s16-s17-formal.js
```
Part 1 (Sprint-1, 74/74) and Part 2 (Sprint-2, 80/80) reconfirmed clean with zero changes to either
suite — full transcripts already archived verbatim in `S5-reorder-buttons.md` and `S7-notes.md`
respectively, not duplicated here. Part 3, S14-specific lines (verbatim, in execution order):
```
PASS - TC14.1a note-toggle icon-btn shrunk to ~19.5px :: {"x":242.9375,"y":407.765625,"width":19.5,"height":19.5}
PASS - TC14.1b aisle-toggle icon-btn shrunk to ~19.5px :: {"x":268.828125,"y":407.765625,"width":19.5,"height":19.5}
PASS - TC14.1c delete icon-btn shrunk to ~19.5px :: {"x":346.5,"y":407.765625,"width":19.5,"height":19.5}
PASS - TC14.2 item-name text size is untouched by the icon shrink (differs from the shrunk icon-btn's own font-size) :: item-name=16px icon-btn=9.6px
PASS - TC14.3 aisle-tag/note-display text size unaffected by the icon shrink (both larger than the icon-btn's font-size) :: aisleTag=12.48px noteDisplay=12.48px iconBtn=9.6px
PASS - TC14.4 shrunk delete button is still fully functional (click still deletes)
PASS - TC14.5 S16's icon-only edit-aisle affordance (while sorted By Aisle) is ALSO shrunk to ~19.5px (M14 cross-reference) :: {"x":320.609375,"y":305.203125,"width":19.5,"height":19.5}
```
Final summary line for the entire combined run (Sprint-1 + Sprint-2 + S14/S16/S17):
```
180/180 passed

Console/page errors captured across entire run: none
Dialogs captured across entire run: none
Non-local network requests: 0
```
Full S16/S17-specific lines are in their own files' Commands sections.
