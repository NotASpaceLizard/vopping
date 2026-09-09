# Test Plan — S9: Sort view (manual/alphabetical/by-aisle)

**STATUS: DONE — formally executed 2026-09-08, PASS (154/154 combined run: 74 Sprint-1 regression
re-confirmed + 80 new S7-S10 checks), zero defects.** Citation of record (as of that pass):
`c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full canonical transcript archived in
`S7-notes.md`'s Commands section, cross-referenced here rather than duplicated. This DONE verdict
stands unchanged — see the dated note immediately below for TC9.8/TC9.9's own later rewrite.

**Dated update, 2026-09-09 (S13 shipped — TC9.8/TC9.9 rewritten, not retired):** S13's drag-and-drop
reorder physically removed S5's `[data-role="up"/"down"]` buttons, which TC9.8 ("Up/Down hidden in
non-Manual") and TC9.9 ("Up/Down reappear in Manual") directly probed. Unlike S5's own test cases
(fully retired — see `S5-reorder-buttons.md`'s dated note), this story's underlying guarantee — that
manual-order-only reordering is gated by sort mode — is still a real, live requirement (BACKLOG.md's
S9 AC still states it, now pointed at S13's drag mechanic instead of S5's buttons; see S9's own
forward-reference note anticipating exactly this update). So TC9.8/TC9.9 are REWRITTEN in place,
not dropped: both now assert drag-pickup's own arm/no-arm behavior via a real
pointerdown-then-wait-past-the-450ms-delay probe, gated on `sortMode`, instead of checking button
visibility. Re-verified clean as part of the same combined pass that formally verified S13 itself —
citation of record for the current regression baseline is now
`c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js` (`REGRESSION_LOG.md`'s 2026-09-09 row),
superseding the 2026-09-08 `…s7-s10-formal.js` citation above for TC9.8/TC9.9 specifically (every
other TC9.x assertion is unchanged and re-confirmed clean in the same run). Full transcript:
`S13-drag-drop-reorder.md`'s Commands section.

**Story:** As a user, I want to view my list sorted by aisle or alphabetically, in addition to my
own manual order, so that I can shop more efficiently by store layout or find an item quickly.

**Acceptance criteria (condensed from BACKLOG.md, locked):** sort control offers at minimum
Manual (default — S5's up/down order), Alphabetical (A-Z by name), and By Aisle (grouped using
S8's field, "Unassigned" grouped last, alphabetical order as the secondary/tie-break both between
groups and within each group). **Sorting is view-only** — changes only on-screen render order,
never rewrites the underlying stored array/order in localStorage; switching back to Manual, or
simply reloading, always returns to the exact same manual order as before any sort, zero data
mutation from having sorted — this is what implements the project's "list only changes when items
are added/removed" guardrail, testable by sorting, reloading, and diffing the stored array.
Whenever a non-Manual sort is active, S5's Up/Down buttons are hidden/disabled per row and
reappear automatically back in Manual; check/uncheck, delete, and note/aisle editing remain fully
available in every sort mode. **Grouping uses S8's normalized (trimmed, case-folded) aisle
comparison (QA finding R6)** so casing/whitespace differences never fragment a group. **QA finding
M2 (resolved):** a newly-added item (S1 single add, S4 paste-ingest, or S10 suggestion-tap) appears
immediately at its correctly-computed position within whichever sort is currently active, not only
at the true end of the underlying manual array. Current sort selection does not need to persist
across reload — reload always returns to Manual view (decided directly, low-stakes default).
**Known implementation detail (Developer, README):** rendering goes through a
`getSortedItems()`-style derived-view function; `state.items` itself is never `.sort()`-ed in
place.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer reports this implemented as of 2026-09-04; not yet independently verified by Tester —
this is that verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Re-reviewed 2026-09-08. No open items. This story's own AC explicitly names its own test method
("testable by sorting, reloading, and diffing the stored array") — TC9.4/TC9.5 below implement
that literally, per the README's standing instruction to do so rather than settling for an
on-screen-order-only check. QA finding M2's three add-paths (S1, S4, S10) are all independently
testable now that S1/S4 are Done and S10's own test plan is drafted this same session (TC9.16
cross-references S10-frequency-suggestions.md's own suggestion-tap mechanic rather than
re-specifying it).

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC9.1 | Manual is default | Fresh load / no sort chosen yet | Manual (S5 order) is the active view |
| TC9.2 | Alphabetical sort order | Select Alphabetical with several items | Rendered order is A-Z by item name |
| TC9.3 | By-Aisle sort order | Select By Aisle with items across several aisles | Grouped by aisle; within each group, items A-Z; groups themselves in A-Z order except Unassigned |
| TC9.4 | View-only proof — Alphabetical | Sort Alphabetical, reload, diff raw `localStorage` `items` array against its pre-sort content | Byte-identical — zero mutation from having sorted |
| TC9.5 | View-only proof — By Aisle | Sort By Aisle, reload, diff raw `items` array against pre-sort content | Byte-identical — zero mutation |
| TC9.6 | Manual order preserved after a non-Manual sort | Sort Alphabetical, then switch back to Manual | Exact same manual order as before sorting, no reordering artifact |
| TC9.7 | Sort selection doesn't persist | Select a non-Manual sort, reload | View returns to Manual regardless of what was last active |
| TC9.8 | (Rewritten 2026-09-09 for S13 — see note below) Manual-order-only reorder is unavailable while a non-Manual sort is active | Switch to Alphabetical or By Aisle; attempt a real press-and-hold-past-the-pickup-delay on a row | Zero `[data-role=up]`/`[data-role=down]` elements exist (now unconditionally true in every mode, not just non-Manual); drag-pickup never arms (no `dragging` class appears) |
| TC9.9 | (Rewritten 2026-09-09 for S13 — see note below) Manual-order-only reorder becomes available again in Manual | Switch back to Manual from a non-Manual sort; attempt the same press-and-hold probe | Drag-pickup successfully arms (`dragging` class appears) once back in Manual |
| TC9.10 | Check/uncheck available in every mode | Cross off an item while in Alphabetical, then in By Aisle | Toggle works identically in both modes |
| TC9.11 | Delete available in every mode | Delete an item while in Alphabetical, then in By Aisle | Delete works identically in both modes |
| TC9.12 | Note/aisle editing available in every mode | Edit a note and an aisle while in a non-Manual sort | Both edits work identically to Manual mode |
| TC9.13 | Normalized grouping | Items with aisle "Produce", "produce", "Produce " (trailing space) | All three land in the SAME group under By-Aisle sort, not three separate groups |
| TC9.14 | QA M2 — S1 single-add | While Alphabetical is active, add a new item via S1's single-add whose name sorts mid-list | New item appears immediately at its correct alphabetical slot, not at the raw array's end |
| TC9.15 | QA M2 — S4 paste-ingest | While By Aisle is active, paste several new items with varying/no aisles | Each appears immediately in its correct aisle group, not clustered at the end |
| TC9.16 | QA M2 — S10 suggestion-tap | While Alphabetical is active, tap a frequency-suggestion chip (see S10-frequency-suggestions.md) | New item appears immediately at its correct alphabetical slot |
| TC9.17 | Unassigned grouping | Several items with no aisle set, mixed with items that have aisles, under By-Aisle sort | Unassigned items form their own group, always last, alphabetized within that group |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC9.1 | Manual active on load (`#sort-select` value `"manual"`) | Pass |
| TC9.2 | Alphabetical: `["Apple","Bread","Milk","Zucchini"]` | Pass |
| TC9.3 | By-Aisle groups: `["Dairy","Produce","Unassigned"]`; within-Produce order Apple before Zucchini | Pass (2/2 sub-checks) |
| TC9.4 | Raw `items` array byte-identical pre-sort vs. post-Alphabetical-sort-then-reload | Pass |
| TC9.5 | Raw `items` array byte-identical pre-sort vs. post-By-Aisle-sort-then-reload | Pass |
| TC9.6 | Manual order identical before and after a round-trip through Alphabetical | Pass |
| TC9.7 | `#sort-select` reads `"manual"` after reload, regardless of last-active sort | Pass |
| TC9.8 | (Rewritten 2026-09-09) Zero `[data-role=up]`/`[data-role=down]` elements anywhere while Alphabetical is active (now trivially true in every mode, S13 removed them entirely — re-confirmed, not assumed); a real pointerdown+wait-past-450ms probe on a row never produces the `dragging` class while Alphabetical is active | Pass (2/2 sub-checks) |
| TC9.9 | (Rewritten 2026-09-09) A real pointerdown+wait-past-450ms probe on a row DOES produce the `dragging` class once switched back to Manual — drag-pickup successfully arms again | Pass |
| TC9.10 | Cross-off toggle works correctly while Alphabetical is active | Pass |
| TC9.11 | Delete works correctly while Alphabetical is active | Pass |
| TC9.12 | Note editing works correctly while Alphabetical is active (`"sorted-mode note"` saved) | Pass |
| TC9.13 | "Produce"/"produce"/"Produce " collapse into exactly ONE `.aisle-group-header` | Pass |
| TC9.14 | Single-added "Mango" lands correctly slotted alphabetically, not appended at the end | Pass |
| TC9.15 | Paste-ingested "Banana"/"Walnuts" both land at correct alphabetical slots immediately | Pass |
| TC9.16 | A frequency-suggestion chip tap ("Kiwi") lands at its correct alphabetical slot immediately | Pass |
| TC9.17 | Unassigned group renders last, alphabetized within itself, contains Bread | Pass |

**Overall verdict: PASS, 0 defects in S9.** Part of the combined 154/154 run — see
`REGRESSION_LOG.md`'s 2026-09-08 row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full raw transcript (Sprint-1
regression + all of S7-S10) archived in `S7-notes.md`'s Commands section. S9-specific lines
(verbatim, in execution order):
```
PASS - TC9.1 Manual is the default sort on load
PASS - TC9.2 Alphabetical sort orders A-Z by name :: ["Apple","Bread","Milk","Zucchini"]
PASS - TC9.8 Up/Down buttons are absent in Alphabetical mode
PASS - TC9.3 By-Aisle sort groups by aisle, alphabetical within group, Unassigned last :: ["Dairy","Produce","Unassigned"]
PASS - TC9.3b within-group order is alphabetical (Produce group: Apple before Zucchini) :: ["Milk","Apple","Zucchini","Bread"]
PASS - TC9.17 Unassigned group is last and contains Bread
PASS - TC9.13 normalized aisle values collapse into ONE group, not fragmented :: ["Produce"]
PASS - TC9.4 Alphabetical sort never mutates the stored array order (reload diff)
PASS - TC9.5 By-Aisle sort never mutates the stored array order (reload diff)
PASS - TC9.7 reload always returns to Manual regardless of last-active sort
PASS - TC9.6 switching back to Manual restores the exact same manual order
PASS - TC9.9 Up/Down buttons reappear once back in Manual
PASS - TC9.10 check/uncheck works while Alphabetical sort is active
PASS - TC9.11 delete works while Alphabetical sort is active
PASS - TC9.12 note editing works while Alphabetical sort is active :: got=sorted-mode note
PASS - TC9.14 a new item added via single-add lands at its correct alphabetical position immediately :: ["A1","A2","A3","Mango"]
PASS - TC9.15 items added via paste-ingest land at correct alphabetical positions immediately :: ["A1","A2","A3","Banana","Mango","Walnuts"]
PASS - TC9.16 a new item added via a frequency-suggestion chip tap lands at its correct alphabetical position immediately :: ["A1","A2","A3","Banana","Kiwi","Mango","Walnuts"]
```
