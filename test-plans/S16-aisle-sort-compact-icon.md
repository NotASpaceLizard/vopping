# Test Plan — S16: Suppress per-row aisle tag when sorting By Aisle

**STATUS: DONE — formally executed 2026-09-08, PASS (180/180 combined run: 74 Sprint-1 + 80
Sprint-2 regression re-confirmed + 26 new S14/S16/S17 checks), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js`. Full canonical transcript archived in
`S14-shrink-buttons.md`'s Commands section, cross-referenced here rather than duplicated.

**Story:** As a user, when I'm sorting my list by aisle, I want the redundant per-row aisle tag
hidden, so that rows don't take up an unnecessary second line when the aisle is already shown as
the group header.

**Acceptance criteria (condensed from BACKLOG.md, Locked):** while By-Aisle sort (S9) is active,
the per-row aisle tag (S8) is suppressed; every other sort mode (Manual, Alphabetical) is
unaffected — full tag renders exactly as S8/S9 already specify. **Self-contradiction found and
resolved during testability-check:** the aisle tag is the ONLY tap-to-edit affordance once an
aisle is set — suppressing it with no replacement would remove the sole entry point to the editor,
contradicting the requirement that editing keeps working in every sort mode. **Resolution
(shipped):** while sorted By Aisle specifically, a minimal icon-only "edit aisle" affordance
replaces the suppressed text tag — tapping it opens the same editor, pre-filled with the item's
real current value (or empty if Unassigned). **QA finding M13:** this same icon-only affordance is
used for BOTH populated and Unassigned items while sorted By Aisle — one consistent icon for the
whole column in this mode, not two different icons depending on each row's state (does not reuse
S8's separate empty-state icon). **QA finding M14:** this new icon is itself a nested per-row icon
control, so it's also in scope for S14's ~25% shrink (see S14-shrink-buttons.md TC14.5). Every
other sort mode's tag-is-the-tap-target behavior is completely unchanged. Row height still follows
the existing content-driven rule (S7/S8) — a row grows only for content it's actually displaying,
so an aisle-only row (no note) must stay single-line while sorted By Aisle, not open an empty
`.row-meta` div. **Per the Orchestrator's heads-up:** the icon-only affordance's glyph
(`AISLE_EDIT_ICON_GLYPH` in script.js) is a deliberate placeholder — the PO plans to hand-pick the
real one later (tracked, non-blocking, on S17's BACKLOG.md row) — so every test case below targets
the icon's `data-role`/class/behavior, never its literal glyph character.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer implemented and self-verified 2026-09-08, pushed sha `606285f`; this is the independent
Tester verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Testability-check found and resolved a genuine self-contradiction (see AC above) before this story
locked — see BACKLOG.md's S16 row for the full resolution history. No open items remain.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC16.1 | Manual sort unaffected | Item with an aisle set, sorted Manual | Full text `.aisle-tag` renders exactly as before |
| TC16.2 | By-Aisle sort suppresses the tag | Same item, switch to By-Aisle sort | `.aisle-tag` gone; icon-only affordance (`.icon-btn[data-role=aisle-toggle]`) present instead |
| TC16.3 | M13 — same icon for Unassigned items | An Unassigned item, sorted By Aisle | Same icon-only affordance shown, not a different empty-state icon |
| TC16.4 | Icon opens editor pre-filled (populated item) | Tap the icon-only affordance on an item with an aisle set | Editor opens with the real current value |
| TC16.5 | Icon opens editor empty (Unassigned item) | Tap the icon-only affordance on an Unassigned item | Editor opens empty |
| TC16.6 | Commit persists, stays icon-only | Commit a new value via the editor while sorted By Aisle | Value persists to storage; row still shows icon-only (not the full tag) |
| TC16.7 | Full tag reappears in other modes | Switch back to Manual after setting an aisle while sorted By Aisle | Full text tag renders with the correct value |
| TC16.8 | No empty second line | Aisle-only item (no note), sorted By Aisle | No `.row-meta` div rendered at all — stays single-line |
| TC16.9 | Note+aisle combination | Item with both note and aisle set, sorted By Aisle | Second line shows only the note, no aisle tag |
| TC16.10 | Nested-control precedence | Tap the icon-only affordance | Row's cross-off state untouched |
| TC16.11 | Editor renders normally once open | Open the editor via the icon-only affordance | Standard `row-meta-input`, unaffected by sort mode |
| TC16.12 | Glyph-agnostic (per Orchestrator's heads-up) | Inspect the icon-only affordance | Identified by `data-role`/class; glyph itself not asserted as a requirement |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC16.1 | Manual sort: `.aisle-tag` text = "Dairy" | Pass |
| TC16.2 | By-Aisle: 0 `.aisle-tag`, 1 icon-only affordance | Pass |
| TC16.3 | Unassigned item: 1 icon-only affordance present, same as populated items | Pass |
| TC16.4 | Editor pre-filled with "Dairy" | Pass |
| TC16.5 | Editor opens empty (`""`) for an Unassigned item | Pass |
| TC16.6 | New value "Bakery" persisted to raw storage; still icon-only after commit | Pass (2/2 sub-checks) |
| TC16.7 | Manual sort after commit: full tag shows "Bakery" | Pass |
| TC16.8 | 0 `.row-meta` elements for an aisle-only, no-note row while sorted By Aisle | Pass |
| TC16.9 | `.row-meta` text = "whole" (note only), 0 `.aisle-tag` inside it | Pass |
| TC16.10 | `aria-checked` unchanged before/after tapping the icon | Pass |
| TC16.11 | `[data-role="aisle-input"]` present and functional once opened | Pass |
| TC16.12 | Icon text content non-empty and consistently addressable via `data-role`; glyph (currently "▤") not treated as a requirement | Pass |

**Overall verdict: PASS, 0 defects in S16 — including the previously-identified self-contradiction,
which is confirmed resolved.** Part of the combined 180/180 run — see `REGRESSION_LOG.md`'s
2026-09-08/180-total row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s14-s16-s17-formal.js`. Full raw transcript archived in
`S14-shrink-buttons.md`'s Commands section. S16-specific lines (verbatim, in execution order):
```
PASS - TC16.1 Manual sort: full text aisle-tag shown exactly as before (unaffected by S16) :: got=Dairy
PASS - TC16.2 By-Aisle sort: full text tag suppressed, icon-only affordance shown instead
PASS - TC16.3 an Unassigned item ALSO shows the same icon-only affordance while sorted By Aisle (M13 - one consistent icon)
PASS - TC16.4 tapping the icon for a populated item opens the editor pre-filled with its real value :: got=Dairy
PASS - TC16.5 tapping the icon for an Unassigned item opens the editor empty :: got=""
PASS - TC16.6a committing a new aisle while sorted By Aisle persists it :: got=Bakery
PASS - TC16.6b after commit, still shows icon-only (not the full tag) since still sorted By Aisle
PASS - TC16.7 switching back to Manual sort: full text tag reappears with the correct value :: got=Bakery
PASS - TC16.8 an aisle-only row (no note) stays single-line while sorted By Aisle (no empty .row-meta div)
PASS - TC16.9 an item with BOTH note and aisle, sorted By Aisle: second line shows only the note, not an aisle tag :: got="whole"
PASS - TC16.10 nested-control precedence: tapping the icon-only aisle affordance does not cross off the row
PASS - TC16.11 the aisle editor itself still renders normally (row-meta-input) once opened while sorted By Aisle
PASS - TC16.12 icon-only affordance identified by data-role/class only, not by its glyph (known placeholder, not asserted) :: glyph=▤
```
