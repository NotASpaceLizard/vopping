# Test Plan — S8: Aisle/category designation

**STATUS: DONE — formally executed 2026-09-08, PASS (154/154 combined run: 74 Sprint-1 regression
re-confirmed + 80 new S7-S10 checks), zero defects.** This "DONE" is scoped to this story's own
functional AC/testing, which is fully closed. Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full canonical
transcript archived in `S7-notes.md`'s Commands section, cross-referenced here rather than
duplicated.

**Tracked follow-up #2 gate (QA finding R7, crowded-row review) — CLOSED, 2026-09-09,** same
cross-story gate as S7's, closed by the same evidence (this gate spans both stories together, since
the PO's original complaint was about the combined note+aisle+delete+Up/Down row, not either
story's field in isolation). Full closure evidence — the real worst-case-row measurement against the
live post-S13+S14 app, both crowding axes checked, 17/17 checks passed, screenshots included — is
recorded in `S7-notes.md`'s "Worst-case-row closure evidence, 2026-09-09" section, not duplicated
here. Script: `c:\tmp\pw-test\vopping-worst-case-row-s13-s14-closure.js`.

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
this is that verification pass. **Update, 2026-09-08:** same as noted on S7-notes.md — Developer's
own re-verification pass found and fixed 2 real bugs in the shared note/aisle editor code (pushed,
sha `f9f097d`): the open-a-second-editor draft-discard bug, and the synchronous-focusout-commit
race that could swallow a tap on a different nested control. TC8.16-TC8.18 close those out for the
aisle side of the same shared mechanism.

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
| TC8.8 | Draft is not silently discarded by an unrelated re-render (see Results note, same refinement as S7's TC7.11) | Open aisle edit on row A, type a draft, don't commit; mutate row B | Row A's draft is correctly committed/saved, not silently lost — see Results |
| TC8.9 | Normalized suggestion dedup | Type "Produce" on item 1, "produce" on item 2, "Produce " (trailing space) on item 3 | Datalist shows exactly ONE merged suggestion entry for this aisle, not three |
| TC8.10 | Dynamic suggestion pool | Type a custom aisle ("Farmers Market") on item 1, then open the datalist while editing item 2 | "Farmers Market" now appears as an offered suggestion |
| TC8.11 | Chronological tie-break casing | Type "produce" on item 1 (first), "Produce" on item 2 (later) | Merged suggestion entry displays "produce" (first-entered casing) |
| TC8.12 | Normalization is comparison-only | Type "PRODUCE" on an item that groups with others typed as "produce" elsewhere | This item's own stored/displayed aisle text remains exactly "PRODUCE", never rewritten |
| TC8.13 | Nested-control precedence | Tap the aisle affordance/datalist on a row | Only the aisle-edit action fires; row's cross-off state untouched |
| TC8.14 | Row height content-driven | Compare a row with neither note nor aisle vs. one with an aisle set | No-note/no-aisle row == locked single-line height; aisle-bearing row may grow |
| TC8.15 | No color-coding in this pass | Inspect aisle tag rendering | Plain text only, no color-only state encoding present (Okabe-Ito requirement N/A until/unless color is added later) |
| TC8.16 | Editor auto-focuses on open (added 2026-09-08, same fix as S7's TC7.15 — shared editor mechanism) | Tap the aisle affordance | The revealed aisle-input receives keyboard focus immediately (cursor at end) |
| TC8.17 | Opening a second editor commits the first's draft, doesn't discard it (added 2026-09-08, same fix as S7's TC7.16) | Open aisle edit on row A, type a draft, do NOT commit; without clicking away first, tap the note-toggle on row B (or row A) to open a second editor | Row A's aisle draft is saved (not discarded) before the second editor opens |
| TC8.18 | Tap on another nested control while an editor is open elsewhere works on the FIRST tap (added 2026-09-08, same fix as S7's TC7.17) | Open an aisle editor on row A (don't commit); in one tap, click a different row B's Delete (or Up/Down) button | Row B's delete/swap fires immediately on that first tap, no second tap required |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC8.1 | Tapping the affordance reveals `[data-role="aisle-input"]` | Pass |
| TC8.2 | Datalist contains all 9 starter values (Produce, Dairy, Meat/Seafood, Bakery, Frozen, Pantry, Beverages, Household, Other) | Pass |
| TC8.3 | "Farmers Market" (not in starter set) saved exactly as typed | Pass |
| TC8.4 | Raw storage aisle values identical pre/post reload | Pass |
| TC8.5 | Unset aisle stored as `""` (empty string), consistently | Pass |
| TC8.6 | Undo-button disabled state identical before/after an aisle edit (`before=false after=false`) | Pass |
| TC8.7 | Cross off A, commit an aisle on B, Undo — reverses A's cross-off only | Pass |
| TC8.8 | **Same refined finding as S7's TC7.11** (not a defect): the aisle draft `"Dairy - draft"` is correctly committed via the deferred focusout-commit when an unrelated mutation elsewhere blurs the open editor, confirmed verbatim in `.aisle-tag` afterward | Pass |
| TC8.9 | "Produce"/"produce"/"Produce " (trailing space) collapse into exactly one datalist entry | Pass |
| TC8.10 | A custom free-typed aisle ("Farmers Market") appears as an offered suggestion on a later item | Pass |
| TC8.11 | Chronological tie-break: "back porch" (typed first) is the casing that displays in the merged entry, "Back Porch" does not | Pass |
| TC8.12 | The item typed as "Back Porch" keeps that exact casing stored/displayed — normalization never rewrote it | Pass |
| TC8.13 | `aria-checked` unchanged before/after opening the aisle editor | Pass |
| TC8.14 | No-note/no-aisle row 39.8px (locked height); aisle-bearing row 70.2px (grows to fit) | Pass |
| TC8.15 | Aisle tag computed color is one uniform value (`rgb(77, 166, 255)`) regardless of which aisle — not per-aisle color-coding | Pass |
| TC8.16 | `document.activeElement` is the new `aisle-input`, immediately after opening | Pass |
| TC8.17 | **Closes real bug fixed 2026-09-08.** Opening a second editor (note, different row) while an aisle draft was uncommitted correctly committed it first — confirmed via the note case (`"placeholder for TC8.17"` saved), same shared mechanism as TC7.16 | Pass |
| TC8.18 | **Closes real bug fixed 2026-09-08.** A single click on a different row's Delete while an aisle editor was open elsewhere fired immediately (count 3→2), not swallowed | Pass |

**Overall verdict: PASS, 0 defects in S8.** Part of the combined 154/154 run — see
`REGRESSION_LOG.md`'s 2026-09-08 row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full raw transcript (Sprint-1
regression + all of S7-S10) archived in `S7-notes.md`'s Commands section. S8-specific lines
(verbatim, in execution order):
```
PASS - TC8.1 tapping the aisle affordance reveals an input
PASS - TC8.2 static starter suggestions present in the datalist :: ["Produce","Dairy","Meat/Seafood","Bakery","Frozen","Pantry","Beverages","Household","Other"]
PASS - TC8.16 opening the aisle editor auto-focuses the new input :: {"tag":"INPUT","role":null,"dataRole":"aisle-input","liId":0,"isLiItself":false}
PASS - TC8.3 arbitrary free text is accepted and saved exactly as typed :: got=Farmers Market
PASS - TC8.10 a custom free-typed aisle becomes an offered suggestion for later items :: ["Produce","Dairy","Meat/Seafood","Bakery","Frozen","Pantry","Beverages","Household","Other","Farmers Market"]
PASS - TC8.4 aisle persists to localStorage and survives refresh
PASS - TC8.5 unset aisle is represented consistently (empty string) :: got=""
PASS - TC8.13 nested-control precedence: opening the aisle editor does NOT cross off the row
PASS - TC8.9 normalized comparison collapses "Produce"/"produce"/"Produce " into ONE suggestion entry :: ["Produce","Dairy","Meat/Seafood","Bakery","Frozen","Pantry","Beverages","Household","Other"]
PASS - TC8.11 chronological tie-break: merged suggestion displays first-entered casing ("back porch") :: ["Produce","Dairy","Meat/Seafood","Bakery","Frozen","Pantry","Beverages","Household","Other","back porch"]
PASS - TC8.12 normalization never rewrites an individual item's own stored aisle text :: got=Back Porch
PASS - TC8.6 aisle edit itself does not change Undo button state :: before=false after=false
PASS - TC8.7 aisle edit does not clobber a pending undo target
PASS - TC8.8 aisle draft is correctly committed (not silently discarded) when an unrelated action elsewhere blurs the open editor :: got=Dairy - draft
PASS - TC8.17 opening a second editor commits the first draft (note) instead of discarding it :: got=placeholder for TC8.17
PASS - TC8.18 tapping a different row's Delete while an aisle editor is open elsewhere fires on the FIRST tap :: before=3 after=2
PASS - TC8.14 no-note/no-aisle row stays at the locked single-line height, aisle-bearing row grows :: plain=39.78125 aisle=70.21875
PASS - TC8.15 aisle tag uses one uniform color, not per-aisle color-coding (Okabe-Ito requirement N/A) :: color=rgb(77, 166, 255)
```
