# Test Plan — S8: Aisle/category designation

**STATUS: FORMAL PASS IN PROGRESS — test cases drafted 2026-09-08 against locked AC; Developer is
independently re-verifying their Sprint-2 implementation right now, execution against the live app
is pending that re-verification landing (or Orchestrator sign-off to proceed against the current
build as-is).** Derived from BACKLOG.md's locked AC plus `test-plans/README.md`'s "Known
implementation details (Sprint 2)" section only — no `script.js` read yet.

**Story:** As a user, I want to assign an aisle/category to an item, either from a short suggested
list or my own custom free text, so that I can group my shopping by store layout.

**Acceptance criteria (condensed from BACKLOG.md, locked):** optional per-row aisle field, inline
editable similar to S7's note field; a starter set of suggested values offered via
dropdown/datalist (exact wording is a Developer-level content detail, not locked); also accepts
arbitrary free text — suggestions are a convenience, never a closed enum; optional, unset items
are treated as "Unassigned" for S9's sort-by-aisle grouping; persists via localStorage; **editing
aisle is explicitly NOT covered by S6's undo buffer**, same scope boundary as S7's note field, and
per QA finding M1 does not clobber a pending undo target either; **aisle-value comparisons for
S9's grouping and for suggestion-matching use a normalized form (trimmed, case-folded)** — QA
finding R6, same normalization approach S10 uses for item names — normalization is
comparison-only and never rewrites what's actually stored/displayed for an individual item's own
aisle text. **Scrum-master clarification (locked):** the dropdown/datalist is NOT purely the
static starter set — it also includes every distinct free-typed aisle value already used elsewhere
on the list (so a custom name typed on one item becomes reusable/suggested for later items); dedup
for that dynamic pool uses the same normalized comparison ("Produce"/"produce" collapse into ONE
suggestion entry); tie-break for which casing displays in the merged entry: whichever was entered
chronologically first. **Developer sanity-check finding (landed, same pattern as S7):** an
in-progress aisle edit must survive a re-render triggered by an unrelated action, draft text
intact, not silently discarded. **Accessibility note:** if aisle groups get any color-coded
treatment at implementation time, must be colorblind-safe (Okabe-Ito); plain text labels with no
color-coding fully satisfy this story's AC as written — per README's Known Implementation Details,
this first pass uses a plain `<input list>` + `<datalist>`, no color-coding, so this requirement is
N/A for this pass specifically (tracked for if/when a future pass adds color). **Sprint-2
sanity-check addition (landed):** the aisle-edit affordance/dropdown is a nested control per S2's
precedence rule — tapping it fires ONLY the aisle-edit action, never also the row's cross-off
toggle. Same row-height allowance as S7.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer reports this implemented as of 2026-09-04; not yet independently verified by Tester —
this is that verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Re-reviewed 2026-09-08. BACKLOG.md's S8 row already documents a "Clarifying Tester's
testability-check question, 2026-09-04" that Scrum Master answered directly (confirming the dynamic
suggestion-pool reading and the chronological tie-break rule) — that loop is closed, both are
concretely testable and are written into TC8.10/TC8.11 below. No new unverifiable items found.
One forward-reference stays open by design: "unset items are treated as Unassigned for S9's
grouping" is only independently verifiable once S9 exists — S9's own test plan (this same session)
now exists too, so TC8.5 here checks only the aisle-side data representation (empty/absent value),
while S9-sort-view.md's TC9.17 is the actual grouping-behavior assertion; not duplicating the same
check in both files.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC8.1 | Optional field, inline editable | Tap the aisle affordance on a row | Input + datalist appears, same interaction shape as S7's note editor |
| TC8.2 | Static starter suggestions present | Open the datalist with no custom aisles yet typed anywhere | The starter set (Produce/Dairy/etc., exact wording not locked) appears as options |
| TC8.3 | Free text accepted | Type an arbitrary value not in the starter set, commit | Saves exactly as typed; not rejected, not coerced to a suggestion |
| TC8.4 | Persists, survives refresh | Set an aisle, reload | Same aisle value present on the same item after reload |
| TC8.5 | Unset aisle representation | Inspect an item with no aisle ever set | Aisle field/data represents "no aisle set" consistently (e.g. empty string), readable by S9's grouping logic |
| TC8.6 | Not undo-eligible | Set/edit/clear an aisle, inspect Undo control | Undo state unaffected by the aisle edit itself |
| TC8.7 | Does not clobber pending undo target | Cross off item A, then edit+commit an aisle on item B, then click Undo | Undo reverses A's cross-off only |
| TC8.8 | Draft survives unrelated re-render | Open aisle edit on row A, type a draft, don't commit; mutate row B | Row A's draft text still intact, input still open |
| TC8.9 | Normalized suggestion dedup | Type "Produce" on item 1, "produce" on item 2, "Produce " (trailing space) on item 3 | Datalist shows exactly ONE merged suggestion entry for this aisle, not three |
| TC8.10 | Dynamic suggestion pool | Type a custom aisle ("Farmers Market") on item 1, then open the datalist while editing item 2 | "Farmers Market" now appears as an offered suggestion |
| TC8.11 | Chronological tie-break casing | Type "produce" on item 1 (first), "Produce" on item 2 (later) | Merged suggestion entry displays "produce" (first-entered casing) |
| TC8.12 | Normalization is comparison-only | Type "PRODUCE" on an item that groups with others typed as "produce" elsewhere | This item's own stored/displayed aisle text remains exactly "PRODUCE", never rewritten |
| TC8.13 | Nested-control precedence | Tap the aisle affordance/datalist on a row | Only the aisle-edit action fires; row's cross-off state untouched |
| TC8.14 | Row height content-driven | Compare a row with neither note nor aisle vs. one with an aisle set | No-note/no-aisle row == locked single-line height; aisle-bearing row may grow |
| TC8.15 | No color-coding in this pass | Inspect aisle tag rendering | Plain text only, no color-only state encoding present (Okabe-Ito requirement N/A until/unless color is added later) |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC8.1 | *pending execution* | |
| TC8.2 | *pending execution* | |
| TC8.3 | *pending execution* | |
| TC8.4 | *pending execution* | |
| TC8.5 | *pending execution* | |
| TC8.6 | *pending execution* | |
| TC8.7 | *pending execution* | |
| TC8.8 | *pending execution* | |
| TC8.9 | *pending execution* | |
| TC8.10 | *pending execution* | |
| TC8.11 | *pending execution* | |
| TC8.12 | *pending execution* | |
| TC8.13 | *pending execution* | |
| TC8.14 | *pending execution* | |
| TC8.15 | *pending execution* | |

**Overall verdict:** PENDING — not yet executed. Planned as part of the same combined Sprint 2
formal-pass script as S7/S9/S10 (`vopping-tests-tester-s7-s10-formal.js`).

## Commands run and output
Not yet run.
