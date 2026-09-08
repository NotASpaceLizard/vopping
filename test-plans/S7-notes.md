# Test Plan — S7: Per-item text notes

**STATUS: FORMAL PASS IN PROGRESS — test cases drafted 2026-09-08 against locked AC; Developer is
independently re-verifying their Sprint-2 implementation right now, execution against the live app
is pending that re-verification landing (or Orchestrator sign-off to proceed against the current
build as-is).** No `script.js`/`style.css` files were read or edited to produce this draft — cases
below are derived from BACKLOG.md's locked AC plus `test-plans/README.md`'s "Known implementation
details (Sprint 2)" section only.

**Story:** As a user, I want to attach a short free-text note to an item (e.g. "half gallon",
"red"), so that I can capture size/color/brand detail without cluttering the item name itself.

**Acceptance criteria (condensed from BACKLOG.md, locked):** optional per-row note field; a small
per-row affordance (e.g. tap a note icon) reveals a text input; typing + confirming (blur/focusout
or Enter) saves it; non-empty note displays alongside/below the item name; empty note shows no
clutter by default (discreet "add note" affordance only, not an always-visible empty field); note
persists via localStorage alongside the item, survives refresh; no enforced hard character limit —
layout must not break with a long note (wraps within the row, never overflows/clips); **editing or
clearing a note is explicitly NOT covered by S6's undo buffer** — a deliberate scope boundary, not
an oversight; per QA finding M1, editing a note also does NOT clobber whatever undo-eligible action
was already pending from S1/S2/S3/S5; a whitespace-only note trims to empty on save and reverts to
the discreet "add note" affordance (QA finding M6 precedent). **Developer sanity-check finding
(landed in BACKLOG.md's S7 row):** an in-progress note edit must survive a re-render triggered by
an unrelated action (Undo, another row's reorder, a new add), with its draft text intact, not
silently discarded — same capture-before-rebuild/restore-after pattern as S1/S2/S5's
focus-preservation fix. **Sprint-2 sanity-check additions (scrum-master, landed):** (1) the
note-edit affordance is a nested control per S2's precedence rule — tapping it fires ONLY the
note-edit action, never also the row's whole-row cross-off toggle; (2) this additive row content is
not in tension with S1/S2's "crossed-off indicator is strikethrough+dim only" phrase, which
describes the cross-off indicator specifically, not a ban on other row content; (3) a row with a
non-empty note may grow to a second line to fit it; a row with no note stays exactly as tall as
S1/S2's locked single-line spec.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer reports this implemented as of 2026-09-04 (end of prior session); not yet independently
verified by Tester — this is that verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'` — same setup as Sprint 1.

## Testability review summary (for scrum-master)

Re-reviewed 2026-09-08 against the currently-locked AC text (no changes needed at this pre-check
stage — S7's Status is already "Locked" in BACKLOG.md, meaning this gate already passed once
before the wind-down). One item worth flagging for awareness, not blocking: the AC's "no enforced
hard character limit" clause is verifiable directly (paste/type a long string, assert no overflow),
but "long" isn't numerically defined — TC7.6 below picks a concrete length (300 chars) as a
reasonable stand-in; if Developer's own testing used a different length, note it in Results rather
than treating a differing choice as a defect.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC7.1 | Discreet empty-state affordance | Row with no note set | Only a small "add note" affordance shown; no empty input/field visibly always-on |
| TC7.2 | Affordance reveals input | Tap the note affordance | A text input appears, ready for typing |
| TC7.3 | Commit via Enter | Type a note, press Enter | Note saved; displays alongside/below item name; input closes back to display state |
| TC7.4 | Commit via focusout (tap elsewhere) | Type a note, tap elsewhere on the page (not Enter) | Note saved identically to the Enter path |
| TC7.5 | Persists, survives refresh | Save a note, reload the page | Same note text still present on the same item after reload |
| TC7.6 | Long note wraps, doesn't overflow/clip | Save a ~300-char note | Row wraps to fit; no horizontal overflow at 320/360/375/390px; text not visually clipped |
| TC7.7 | Whitespace-only note reverts to empty | Type only spaces into the note field, commit | Reverts to the discreet "add note" affordance; nothing rendered as a saved note |
| TC7.8 | Nested-control precedence | Tap the note affordance / type in the open note input | Only the note-edit action fires; row's own cross-off `aria-checked`/class is untouched |
| TC7.9 | Not undo-eligible | Save/edit/clear a note, inspect Undo control | Undo button state (enabled/disabled) is unaffected by the note edit itself |
| TC7.10 | Does not clobber a pending undo target (QA M1) | Cross off item A (undo-eligible), then edit+commit a note on item B, then click Undo | Undo reverses A's cross-off, not anything related to B's note |
| TC7.11 | Draft survives unrelated re-render | Open note edit on row A, type a draft, do NOT commit; trigger a mutation on row B (e.g. cross it off) | Row A's note input is still open with the exact draft text intact, not reverted/lost |
| TC7.12 | Row height is content-driven | Compare row height with no note vs. with a non-empty note | No-note row height == S1/S2's locked single-line height; note-bearing row may be taller |
| TC7.13 | Clearing an existing note | Edit an existing note to empty, commit | Reverts to the discreet "add note" affordance, no clutter |
| TC7.14 | No reload required | Save a note | Displays immediately, no page reload triggered |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC7.1 | *pending execution* | |
| TC7.2 | *pending execution* | |
| TC7.3 | *pending execution* | |
| TC7.4 | *pending execution* | |
| TC7.5 | *pending execution* | |
| TC7.6 | *pending execution* | |
| TC7.7 | *pending execution* | |
| TC7.8 | *pending execution* | |
| TC7.9 | *pending execution* | |
| TC7.10 | *pending execution* | |
| TC7.11 | *pending execution* | |
| TC7.12 | *pending execution* | |
| TC7.13 | *pending execution* | |
| TC7.14 | *pending execution* | |

**Overall verdict:** PENDING — not yet executed. Will run as part of a combined Sprint 2
formal-pass script (planned: cover S7-S10 in one script, same convention as Sprint 1's combined
`vopping-tests-tester-s1-s6-s12-formal.js`) once Developer confirms their re-verification pass is
complete, then cite the result in `REGRESSION_LOG.md` as a new row.

## Commands run and output
Not yet run. Planned script location: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`.
