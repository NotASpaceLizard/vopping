# Test Plan — S7: Per-item text notes

**STATUS: DONE — formally executed 2026-09-08, PASS (154/154 combined run: 74 Sprint-1 regression
re-confirmed + 80 new S7-S10 checks), zero defects.** This "DONE" is scoped to this story's own
functional AC/testing, which is fully closed — **BACKLOG.md's Status column for S7 is separately
held at "In Review," not "Done,"** by the cross-story Tracked follow-up #2 gate (QA finding R7,
crowded-row review): that gate stays open until S13/S14 actually ship and Tester re-verifies the
row is no longer the crowded one the PO flagged. Don't read this file's DONE banner as implying
BACKLOG.md's overall Status is also Done — check BACKLOG.md's S7 row directly for that. Citation of
record: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js` (Tester-independent — supersedes Developer's
own self-check `vopping-s7-s10-verify.js` as citation of record per playbook). This file holds the
canonical full transcript for that script (cross-referenced by S8/S9/S10's own files rather than
duplicated, same convention as Sprint 1's `S6-undo.md`/`S5-reorder-buttons.md` arrangement).

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
verified by Tester — this is that verification pass. **Update, 2026-09-08:** Developer's own
independent re-verification pass found and fixed 2 real bugs in the shared note/aisle editor code
(pushed, sha `f9f097d`), both in the shared mechanism S7/S8 have in common: (1) `openEditor()`
previously discarded an already-open editor's uncommitted draft when a second editor was opened
before the first committed — now commits it synchronously first; (2) the delegated `focusout`
commit previously ran synchronously, which could destroy (via its `render()` rebuild) the very
element an in-flight click on a *different* nested control was about to hit, silently swallowing
that tap — now deferred via `setTimeout(0)` so the current click finishes dispatching first. TC7.15-
TC7.17 below were added specifically to close out these two fixes with dedicated regression
coverage, not just re-test the original AC as drafted.

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
| TC7.11 | Draft is not silently discarded by an unrelated re-render (see Results note — refined from the original "stays open" framing once actually run) | Open note edit on row A, type a draft, do NOT commit; trigger a mutation on row B (e.g. cross it off) | Row A's draft is correctly committed/saved, not silently lost — see Results |
| TC7.12 | Row height is content-driven | Compare row height with no note vs. with a non-empty note | No-note row height == S1/S2's locked single-line height; note-bearing row may be taller |
| TC7.13 | Clearing an existing note | Edit an existing note to empty, commit | Reverts to the discreet "add note" affordance, no clutter |
| TC7.14 | No reload required | Save a note | Displays immediately, no page reload triggered |
| TC7.15 | Editor auto-focuses on open (added 2026-09-08, closes a real bug caught in Developer's re-verification) | Tap the note affordance | The revealed note-input receives keyboard focus immediately (cursor at end), no second tap needed to start typing |
| TC7.16 | Opening a second editor commits the first's draft, doesn't discard it (added 2026-09-08, closes a real bug: previously overwriting `editingField` silently dropped an uncommitted draft) | Open note edit on row A, type a draft, do NOT commit; without clicking away first, tap the aisle-toggle on row B (or row A) to open a second editor | Row A's note draft is saved (not discarded) before the second editor opens; row A's note now shows the typed text |
| TC7.17 | Tap on another nested control while an editor is open elsewhere works on the FIRST tap (added 2026-09-08, closes a real bug: a synchronous focusout-commit's re-render could destroy the very element an in-flight click was targeting, requiring a second tap) | Open a note editor on row A (don't commit); in one tap, click a different row B's Delete (or Up/Down) button | Row B's delete/swap fires immediately on that first tap — not silently swallowed, no second tap required |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC7.1 | Only the discreet add-note icon shown, no `.row-meta` div, when note is empty | Pass |
| TC7.2 | Tapping the affordance reveals `[data-role="note-input"]` | Pass |
| TC7.3 | Enter commits: `.note-display` shows "half gallon", input closes, empty-icon gone once set | Pass |
| TC7.4 | Tap-elsewhere (focusout, now deferred via `setTimeout(0)`) commits identically: `.note-display` shows "cold aisle" | Pass |
| TC7.5 | Raw storage note values identical pre/post reload | Pass |
| TC7.6 | 300-char note: zero horizontal overflow at 320/360/375/390px; full text present, not truncated | Pass (5/5 sub-checks) |
| TC7.7 | Whitespace-only note reverts to discreet affordance, no `.row-meta` | Pass |
| TC7.8 | `aria-checked` unchanged before/after opening AND typing in the note editor | Pass |
| TC7.9 | Undo-button disabled state identical before/after a note edit (`before=false after=false` — Undo was already enabled from the seed add, note edit didn't touch it either way) | Pass |
| TC7.10 | Cross off A, commit a note on B, Undo — reverses A's cross-off only | Pass |
| TC7.11 | **Refined finding, not a defect:** every reachable "unrelated mutation elsewhere" in this app requires a click, and any click first blurs whatever editor is open (standard browser focus behavior) — which the 2026-09-08 fix now correctly commits (deferred via `setTimeout(0)`) rather than losing. So "survives" in practice means "gets saved, never silently discarded," confirmed directly: draft text `"2% - uncommitted draft"` appears verbatim in `.note-display` after the unrelated mutation settles. This is a *stronger* guarantee than the original "stays open as a draft" framing anticipated, not a gap — recommend Scrum Master update BACKLOG.md's S7 AC wording to say "committed," not "intact as a draft," next time this row is touched (non-blocking, cosmetic doc-accuracy note). | Pass |
| TC7.12 | Plain row 39.8px (locked single-line height); note-bearing row 157.6px (grows to fit) | Pass |
| TC7.13 | Clearing an existing note reverts to the discreet affordance | Pass |
| TC7.14 | No navigation occurred across the whole run (`page.url()` unchanged throughout) | Pass |
| TC7.15 | `document.activeElement` is the new `note-input`, immediately after opening | Pass |
| TC7.16 | **Closes real bug fixed 2026-09-08.** Opening a second editor (aisle, different row) while a note draft was uncommitted correctly committed the note first — `.note-display` shows `"sourdough - uncommitted"`, not discarded | Pass |
| TC7.17 | **Closes real bug fixed 2026-09-08.** A single click on a different row's Delete while a note editor was open elsewhere fired immediately (count 3→2), not swallowed | Pass |

**Overall verdict: PASS, 0 defects in S7.** Full 154/154 combined regression re-run (74 Sprint-1 +
80 new S7-S10) — see `REGRESSION_LOG.md`'s 2026-09-08 row (current canonical figure).

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js` (covers S1-S6/S12 regression + S7-S10
in one run — this file holds the canonical full transcript, cross-referenced by S8/S9/S10's own
files rather than duplicated):
```
cd /c/tmp/pw-test && node vopping-tests-tester-s7-s10-formal.js
```
Part 1 (Sprint-1 regression, 74/74, ported verbatim from `vopping-tests-tester-s1-s2-s5-density-
formal.js`) reconfirmed clean with zero changes to any of its 74 assertions — full transcript
omitted here to avoid duplicating ~74 lines already archived verbatim in `S5-reorder-buttons.md`'s
Commands section; only the delta (this run's own header/footer) is worth restating:
```
---- Part 1 (Sprint-1 regression) subtotal: 74/74 ----
```
Part 2, S7-specific lines (verbatim, in execution order):
```
PASS - TC7.1 discreet add-note affordance shown when no note, no row-meta clutter
PASS - TC7.2 tapping the note affordance reveals a text input
PASS - TC7.15 opening the note editor auto-focuses the new input :: {"tag":"INPUT","role":null,"dataRole":"note-input","liId":0,"isLiItself":false}
PASS - TC7.3 commit via Enter saves note, displays it, closes input :: got=half gallon
PASS - TC7.3b note icon affordance is gone once note has a value
PASS - TC7.13 clearing an existing note reverts to discreet add-note affordance
PASS - TC7.4 commit via focusout (tap elsewhere) saves the note :: got=cold aisle
PASS - TC7.7 whitespace-only note trims to empty, reverts to discreet affordance
PASS - TC7.6 long note (300 chars) causes no horizontal overflow at 320px :: overflow=0
PASS - TC7.6 long note (300 chars) causes no horizontal overflow at 360px :: overflow=0
PASS - TC7.6 long note (300 chars) causes no horizontal overflow at 375px :: overflow=0
PASS - TC7.6 long note (300 chars) causes no horizontal overflow at 390px :: overflow=0
PASS - TC7.6 long note is not truncated - full text present in the DOM :: len=300
PASS - TC7.12 no-note row stays at the locked single-line height :: h=39.78125
PASS - TC7.12 note-bearing row grows taller than the plain row :: plain=39.78125 note=157.5625
PASS - TC7.8 opening/typing in the note editor does NOT cross off the row :: before=false afterOpen=false afterType=false
PASS - TC7.9 note edit itself does not change Undo button state :: before=false after=false
PASS - TC7.10 note edit does not clobber a pending undo target - Undo still reverses the earlier cross-off
PASS - TC7.11 draft is correctly committed (not silently discarded) when an unrelated action elsewhere blurs the open editor :: got=2% - uncommitted draft
PASS - TC7.16 opening a second editor commits the first draft instead of discarding it :: got=sourdough - uncommitted
PASS - TC7.17 tapping a different row's Delete while an editor is open elsewhere fires on the FIRST tap :: before=3 after=2
PASS - TC7.14 note edits never require a page reload :: file:///C:/Users/d-david.m.sheldon/OneDrive%20-%20afs.com/Documents/vibeCode/vopping/index.html
PASS - TC7.5 notes persist to localStorage and survive refresh
```
Final summary line for the entire combined run (Sprint-1 + all of S7-S10):
```
154/154 passed

Console/page errors captured across entire run: none
Dialogs captured across entire run: none
Non-local network requests: 0
```
Full S8/S9/S10-specific lines are in their own files' Commands sections, cross-referencing back to
this script rather than duplicating this preamble.
