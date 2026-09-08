# Test Plan — S9: Sort view (manual/alphabetical/by-aisle)

**STATUS: FORMAL PASS IN PROGRESS — test cases drafted 2026-09-08 against locked AC; Developer is
independently re-verifying their Sprint-2 implementation right now, execution against the live app
is pending that re-verification landing (or Orchestrator sign-off to proceed against the current
build as-is).** Derived from BACKLOG.md's locked AC plus `test-plans/README.md`'s "Known
implementation details (Sprint 2)" section only — no `script.js` read yet. Depends on S8's aisle
field existing (sequenced after S8 in BACKLOG.md for exactly that reason) — S8's own test plan is
drafted alongside this one this session.

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
| TC9.8 | Up/Down hidden/disabled in non-Manual modes | Switch to Alphabetical or By Aisle | Every row's Up/Down buttons are hidden or disabled |
| TC9.9 | Up/Down reappear in Manual | Switch back to Manual from a non-Manual sort | Up/Down buttons visible/enabled again (respecting top/bottom disabled-edge rule) |
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
| TC9.1 | *pending execution* | |
| TC9.2 | *pending execution* | |
| TC9.3 | *pending execution* | |
| TC9.4 | *pending execution* | |
| TC9.5 | *pending execution* | |
| TC9.6 | *pending execution* | |
| TC9.7 | *pending execution* | |
| TC9.8 | *pending execution* | |
| TC9.9 | *pending execution* | |
| TC9.10 | *pending execution* | |
| TC9.11 | *pending execution* | |
| TC9.12 | *pending execution* | |
| TC9.13 | *pending execution* | |
| TC9.14 | *pending execution* | |
| TC9.15 | *pending execution* | |
| TC9.16 | *pending execution* | |
| TC9.17 | *pending execution* | |

**Overall verdict:** PENDING — not yet executed. Planned as part of the same combined Sprint 2
formal-pass script as S7/S8/S10 (`vopping-tests-tester-s7-s10-formal.js`).

## Commands run and output
Not yet run.
