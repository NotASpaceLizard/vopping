# Test Plan — S15: In-place item-name editing

**STATUS: DONE — formally executed 2026-09-09, PASS (246/246 combined run: 67 Sprint-1 + 81 Sprint-2
+ 26 Sprint-3 (S14/S16/S17) + 45 S13 regression baseline re-confirmed clean + 27 new S15-specific
checks), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js` (Tester-independent — supersedes Developer's
own self-check as citation of record per playbook). **Note on the script filename:** this is the
same evolving combined suite that has been the citation of record since S13; it was named for S13
when authored (the name was never a literal scope enumeration — its Part 1 already covers S1-S6/S12,
Part 2 S7-S10, Part 3 S14/S16/S17) and has now been **extended in place with a new Part 5** for S15,
exactly the "same script, updated in place" pattern S13's own 216→219 re-verification used. Every
prior citation of that filename remains valid. Full canonical transcript for this run:
`c:/tmp/pw-test/s1-s15-run2.log`.

**Story:** As a user, I want to edit an item's own name/text in place, so that I can fix a typo or
add a quick detail (e.g. "zucchini" → "2 zucchini") without deleting and re-adding the item and
losing its position, note, aisle, or crossed-off state.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-08):** editing an item's own text
is supported directly on the row, without delete+recreate; the edited text persists to localStorage
immediately (no reload); the item's **position, crossed-off state, note, and aisle are all
preserved** across the edit. A **blank/whitespace-only edit reverts to the item's original text
unchanged** (no accidental deletion via an emptied edit — same trim-and-revert precedent as S1/S7,
but for names it reverts rather than clears, since a name can never legitimately be empty). No
de-duplication check against other item names (project-wide no-dedup policy, S1/S4).

**Developer-sanity-check + QA findings folded into the locked AC (all resolved, no PO input needed
except the two PO decisions noted):**
- **(a) No S10 frequency-counter interaction, in either direction** — editing an item's text does
  NOT observe/touch S10's separate frequency counter (avoids the fragmentation risk of "zucchini" →
  "2 zucchini" creating two counter entries); same arm's-length treatment S7/S8's note/aisle edits
  already get.
- **(b) Live re-sort on commit (S9's QA-M2 guarantee, extended)** — editing an item's text while a
  non-Manual sort is active immediately re-renders the item at its newly-correct position within
  that sort.
- **QA finding R11 (folded in):** that re-sort trigger reads the item's **last-committed name, never
  the live in-progress draft** still being typed — same precedent S8/S9's grouping-key logic
  established (reads committed `item.aisle`, never a live draft). The row does NOT relocate on every
  keystroke; it snaps to its new position only once the edit commits (blur/Enter). This closes off
  the self-triggered variant of S7/S8's already-twice-fixed focus-loss-on-render bug.
- **PO decision (from `s15-edit-gesture-picker.html`, Option 3):** the edit gesture is a **dedicated
  edit-icon/button, NOT double-tap or long-press** (long-press is claimed by S13's drag-pickup). The
  icon uses the **pencil glyph (✎)**, freed from S7's note-toggle (which moved to a different glyph).
  PO-confirmed pick, 2026-09-08.
- **QA finding M16 (folded in):** tapping this story's own edit-icon performs ONLY the edit-open
  action and must NOT also trigger the row's whole-row cross-off toggle (same nested-control
  precedence rule S2/S3/S5/S7/S8/S13 each state for their own controls).
- **QA finding M17 (folded in):** this edit-icon is a nested per-row icon control, so it is in scope
  for S14's ~25% shrink — Developer applies the shrink at S15's own implementation time (S14 shipped
  before this icon existed).
- **QA finding R10 (PO-accepted as-is):** renaming an item can make its OLD name transiently resurface
  as an S10 suggestion chip — a KNOWN, ACCEPTED, low-stakes behavior, not a bug; no logic required.
  Not a testable gate for this story.

**Tester's testability-check requirements (folded into locked AC, 2026-09-08):**
1. Regardless of implementation approach, the name editor must satisfy the same two guarantees S7/S8's
   editors provide: **(i)** an in-progress name-edit draft survives a re-render triggered by an
   unrelated action with its draft text intact (not reverted/lost); **(ii)** opening this row's name
   editor, or a drag-pickup starting elsewhere (S13), or opening a different row's editor, correctly
   **commits (never silently discards)** whatever edit was in progress.
2. **Mutual exclusivity** — only one editor open at a time per row; opening any editor (note, aisle,
   or now name) commits whatever was previously open. Name is a **third editor type** in that set.
3. **Truncation after editing** — committing an edit does not change how the item name renders: same
   single-line/ellipsis truncation as the locked row-density spec (S1/S2); no multi-line wrapping the
   way S7's notes wrap. While the editor is open, the input shows the in-progress text in full.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-09 (pushed sha `10c804e`), Developer self-verified (33/33 S15-specific + 219/219 regression).
Reuses S7/S8's shared editor infrastructure — `'name'` added as a third `editingField` type;
`saveName()` writes `state.items[idx].name` only when the trimmed draft is non-empty (blank reverts),
never calls `incrementFrequency`/`setLastAction`. The edit affordance is an always-present
`[data-role="name-toggle"]` icon-btn (glyph U+270E ✎); the in-place editor is
`[data-role="name-input"]` / `.name-input`, which takes over the same primary-line flex slot as
`.item-name` (`flex:1; min-width:0`) with no second-line growth.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`, viewport 390×700. Same
combined-suite harness as the S13 formal pass; Part 5 (this story) appended.

## Testability review summary (for scrum-master)
Closed at Lock, 2026-09-08 — three gaps found and resolved directly in BACKLOG.md's S15 row (see
"Tester's testability-check requirements" above), then QA's gate added R10/R11/M16/M17, all folded in
and re-confirmed contradiction-free at Lock. No open items. Implementation approach was left as
Developer's choice; Developer reused S7/S8's shared editor infrastructure, so the guarantees in
testability item (1) are re-verified here regardless (TC15.12/TC15.14/TC15.15) — a shared
implementation still gets independent coverage rather than assuming S7/S8's passing tests carry over.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC15.1 | Dedicated edit-icon, not double-tap/long-press | Inspect the row for an edit affordance; single-click it; separately double-tap the item name | A pencil (✎) `name-toggle` icon is always present on every row; single-clicking it opens the in-place editor; a double-tap on the name does NOT open any editor (gesture ruled out) |
| TC15.2 | In-place editor on the primary line, no second-line growth | Open a name editor on an item with no note/aisle | The `.name-input` renders in-place on the primary line (direct `<li>` child, replacing `.item-name`); no `.row-meta` second line appears; row stays a single line |
| TC15.3 | Persists immediately, updates display, no reload | Rename an item, commit (Enter) | New name written to localStorage immediately and reflected in the on-row display; no reload needed |
| TC15.4 | Position, crossed-off, note, aisle preserved | Give a middle item a note + aisle + cross it off, then rename it | id stays at its exact position; name updated; `checked`/`note`/`aisle` all unchanged |
| TC15.5 | Blank/whitespace reverts to original | Open editor, clear to empty (and separately to whitespace-only), commit | Name reverts to the original unchanged; item NOT deleted; count unchanged |
| TC15.6 | No S10 frequency-counter interaction | Snapshot the frequency counter, rename "Zucchini" → "2 Zucchini", snapshot again | Frequency counter byte-identical before/after — no new/duplicate entry, no decrement |
| TC15.7 | No S6 undo interaction | Cross off row B (undo targets that check), rename row A, then Undo | Name edit doesn't change Undo state or create an entry; Undo still reverses the earlier cross-off; the renamed name persists (the edit wasn't itself undone) |
| TC15.8 | R11 — re-sort reads committed name, not live draft | Under Alphabetical sort, open a row's editor and type a new name letter-by-letter | Row does NOT relocate while typing (order unchanged); editor keeps focus (not re-rendered out from under the cursor) |
| TC15.9 | R11 companion — re-sorts on COMMIT | Commit the TC15.8 edit | Row immediately relocates to its newly-correct alphabetical slot |
| TC15.10 | M9 — same-row drag block extends to name editor | Open a row's name editor, then press-and-hold past the pickup delay on that same row | No drag arms (same-row block covers the name editor via the generic `editingField.id===id` guard) |
| TC15.11 | M9 — row drag-eligible again after commit | Commit the editor, then press-and-hold the same row | Drag arms normally again |
| TC15.12 | S13 cross-row commit extends to name editor | Open a name editor on row A (draft, uncommitted), begin a drag-pickup on row B | Row A's name draft is committed (not discarded); the LIVE row B (not a stale clone) receives `dragging` |
| TC15.13 | M16 — nested-control precedence | Tap the edit-icon | Editor opens; the row's cross-off state is NOT toggled |
| TC15.14 | Mutual exclusivity (name as a third editor type) | Open a note editor (draft), then open the name editor; separately, open a name editor (draft), then open the aisle editor | Opening the name editor commits the open note draft; opening the aisle editor commits the open name draft — never silently discarded |
| TC15.15 | Draft survives an unrelated action (testability 1(i)) | Open a name editor (draft), then cross off a DIFFERENT row | The in-progress name draft is committed (not reverted/lost) |
| TC15.16 | Saved-name truncation unchanged (testability 3) | Commit a very long name | No `.row-meta` second line introduced (names truncate, not wrap, unlike notes); `.item-name` keeps `white-space:nowrap` (locked density spec) |

## Results
All 27 S15-specific checks below passed on a clean run after two script-authoring bugs were found and
fixed during writing (neither an app defect — see the note after this table). Real values quoted
directly from the script's own output.

| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC15.1 | `toggles=3 rows=3 glyph="✎"`; single-click opens the editor; a double-tap on the name opens nothing (3 sub-checks) | Pass |
| TC15.2 | `.name-input` is a direct `<li>` child replacing `.item-name`; `editing=41.36 plain=36.17 rowMeta=0` — no second line, only the input's own chrome on the same primary line (2 sub-checks) | Pass |
| TC15.3 | `stored=Whole Milk`, `display=Whole Milk` — immediate, no reload (2 sub-checks) | Pass |
| TC15.4 | `order=[0,1,2]` unchanged, `name=Large Eggs`; `{"checked":true,"note":"a dozen","aisle":"Dairy"}` all preserved (2 sub-checks) | Pass |
| TC15.5 | Emptied edit: `name=Milk count=3` (reverted, not deleted); whitespace-only edit: `name=Milk` (reverted) (2 sub-checks) | Pass |
| TC15.6 | Frequency counter byte-identical before/after renaming "Zucchini"→"2 Zucchini" (`zucchini` count still 1, no `2 zucchini` key) | Pass |
| TC15.7 | Undo state unchanged by the name edit (`before=false after=false`); post-edit Undo reverses the cross-off (`eggsAria=false`); renamed `name=Whole Milk` persists (3 sub-checks) | Pass |
| TC15.8 | (R11) Typing "Aardvark" under Alphabetical: `order=[1,3,2,0]` unchanged during the draft; editor keeps focus (`dataRole=name-input liId=0`) | Pass |
| TC15.9 | (R11) On commit, row relocates: `order=[0,1,3,2]`, `names=["Aardvark","Apple","Bread","Mango"]` | Pass |
| TC15.10 | (M9) `dragging=false` — a row with its own name editor open cannot be drag-picked-up | Pass |
| TC15.11 | (M9) `dragging=true` — drag-eligible again once the name editor commits | Pass |
| TC15.12 | Cross-row commit: `name=Milk - draft` saved before/as row B's pickup begins; `dragging=true` on the LIVE row B, not a stale clone (2 sub-checks) | Pass |
| TC15.13 | (M16) `before=false after=false editorOpen=true` — edit-icon opens the editor without crossing off | Pass |
| TC15.14 | Opening the name editor commits an open note draft (`note=note draft`, name editor then open); opening the aisle editor commits an open name draft (`name=Renamed Milk`) (2 sub-checks) | Pass |
| TC15.15 | `name=Milk - in progress draft` — an unrelated cross-off elsewhere commits (never discards) the open name draft | Pass |
| TC15.16 | `rowMeta=0` (long name does not wrap to a second line); `whiteSpace=nowrap` on `.item-name` (2 sub-checks) | Pass |

**Overall verdict: PASS, 0 defects in S15.** 27/27 S15-specific checks passed, plus the full
219-check regression baseline (67 Sprint-1 + 81 Sprint-2 + 26 Sprint-3 + 45 S13) re-confirmed clean
in the same run — **246/246 total**, matching the script's own single printed total exactly. Zero
console/page errors, zero dialogs, zero non-`file://` network requests across the entire run.
Regression count: 246/246, `REGRESSION_LOG.md`'s current canonical row.

**Every point on the coordinator's verification checklist is covered and passing:** dedicated pencil
edit-icon, not double-tap/long-press (TC15.1); in-place input on the primary line with no second-line
growth (TC15.2); blank/whitespace reverts to original (TC15.5); no S10-counter interaction (TC15.6);
no S6-undo interaction (TC15.7); re-sort under non-Manual reads the committed name, not the live
draft — QA finding R11 (TC15.8/TC15.9); and S13's drag guards extend correctly to the name editor —
both the same-row block (TC15.10/TC15.11) and the cross-row commit (TC15.12).

**Two script-authoring bugs found and fixed while writing this pass (neither an app defect):**
1. **TC15.2 tolerance too tight:** the first draft asserted the editing row height was within 3px of
   a plain row's. The `.name-input` element carries its own `padding`/`border`/`background` chrome
   (see `.name-input` in style.css), making it ~5px taller than a bare `.item-name` span on the SAME
   single line — that is not second-line growth (the actual AC guarantee, confirmed by `rowMeta=0`).
   Fixed to assert no `.row-meta` AND a height delta well under a real second line's (~+25px). The
   app behavior was correct throughout.
2. **TC15.9 appended instead of replaced:** the first draft typed the new name via `pressSequentially`
   without clearing the input first — so it appended to the pre-filled current name, producing
   "ZucchiniAardvark". This is correct app UX (the editor pre-fills with the current name and parks
   the cursor at the end); the test just needed to clear the field first. Fixed by `.fill('')` before
   typing. Disclosing both because that is exactly the kind of test-script bookkeeping this project's
   transparency convention exists to surface — same as S13's own disclosed TC13.15 script bug.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js` (combined S1-S15 suite, Part 5 appended
for this story):
```
node c:/tmp/pw-test/vopping-tests-tester-s1-s13-formal.js
```
Part-subtotal markers from the actual run (in execution order):
```
---- Part 1 (Sprint-1 regression, retrofitted 74->67) subtotal: 67/67 ----
---- Part 2 (S7+S8+S9+S10) total: 81 new checks ----
---- Part 3 (S14+S16+S17) total: 26 new checks ----
---- Part 4 (S13 drag-and-drop) total: 45 new checks ----
---- Part 5 (S15 in-place item-name editing) total: 27 new checks ----
```
Key S15 lines (verbatim):
```
PASS - TC15.1 a dedicated edit-icon (pencil U+270E) is always present on every row :: toggles=3 rows=3 glyph="✎"
PASS - TC15.6 renaming an item never touches S10's frequency counter (no new/duplicate entry, no decrement) :: before={"zucchini":{"count":1,...}} after={"zucchini":{"count":1,...}}
PASS - TC15.8 (R11) while typing under Alphabetical sort, the row does NOT relocate on the live draft (order unchanged, editor keeps focus) :: order=[1,3,2,0] active={"dataRole":"name-input","liId":0}
PASS - TC15.9 (R11 companion) committing the edit re-sorts the row to its newly-correct position immediately :: order=[0,1,3,2] names=["Aardvark","Apple","Bread","Mango"]
PASS - TC15.10 (M9) a row with its own NAME editor open cannot be drag-picked-up (same-row block extends to the name editor) :: dragging=false
PASS - TC15.11 (M9) the row becomes drag-eligible again once its name editor commits :: dragging=true
PASS - TC15.12 starting a drag-pickup on another row commits a still-open NAME draft on a DIFFERENT row, never silently discards it :: name=Milk - draft
PASS - TC15.12 the LIVE, visible dragged row actually receives the dragging class (not a stale detached clone) :: dragging=true
```
Final summary line:
```
246/246 passed

Console/page errors captured across entire run: none
Dialogs captured across entire run: none
Non-local network requests: 0
```
Full raw transcript archived at `c:/tmp/pw-test/s1-s15-run2.log` (canonical copy going forward). The
earlier `s1-s15-run1.log` is the run that surfaced the two disclosed script-authoring bugs above,
left in place as history per this project's transparency convention.
