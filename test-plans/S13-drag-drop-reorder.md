# Test Plan — S13: Drag-and-drop reorder (supersedes S5's Up/Down buttons)

**STATUS: DONE — re-formally executed 2026-09-09 after QA finding C1's fix, PASS (219/219 combined
run: 67 Sprint-1 + 81 Sprint-2 + 26 Sprint-3 regression re-confirmed + 45 S13-specific checks), zero
defects.** **This is the current citation of record for S13's Done flip — supersedes the 216/216 row
below (same day), which had a real coverage gap (see "QA finding C1" section below), not just a
routine re-run.** Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js`
(Tester-independent — supersedes Developer's own self-check scripts as citation of record per
playbook, AND supersedes the three prior canonical scripts
[`vopping-tests-tester-s1-s2-s5-density-formal.js`, `vopping-tests-tester-s7-s10-formal.js`,
`vopping-tests-tester-s14-s16-s17-formal.js`] as citation of record for the regression-baseline
checks they used to own — those three now hang Playwright if run as-is, since they probe DOM
elements S13 physically removes; not a defect in this pass, a stale artifact of a superseded UI
mechanism).

## QA finding C1 — stale DOM reference in `beginDrag()`, fixed sha `90983e3`, re-verified 2026-09-09

QA's adversarial review found `beginDrag()` holding a DOM reference (`li`) captured up to 450ms
earlier at `pointerdown` time. Its own cross-row commit guarantee (`commitEditor()`, called at the
top of `beginDrag()`) can trigger a full `render()` in between — which replaces the list's entire
`innerHTML` — after which that captured `li` is stale for the rest of the gesture. Developer's fix
re-fetches the row element fresh by id immediately after the commit (same "never trust a reference
across a render" discipline the function's own `idx` re-lookup already followed), and separately
hardened M18 (a document-level `pointerup`/`pointercancel` fallback for when `setPointerCapture`
silently isn't honored, same stuck-state failure family as C1). Developer's own self-check: 32/32
passing, zero regressions on my existing 67/172-check scratch suites.

**A real, important gap in my OWN prior formal pass, disclosed rather than glossed over:** the
216/216 run below already contained TC13.11, which exercises this EXACT sequence (open a note editor
on row A, don't commit, start a drag-pickup on row B) — but it only asserted that row A's draft got
committed, never checking WHICH element actually received the `dragging` class. That gap meant
TC13.11 kept passing even against the pre-fix, genuinely buggy code — a silent failure with zero
thrown error, so a check that only watches for errors/wrong-data would never have caught it either.
**Fixed by strengthening TC13.11** to also assert the LIVE row (re-queried fresh by id, exactly what
a real user's screen shows) is the one that gets `dragging`, and by **adding TC13.27** as a dedicated
aisle-editor variant (C1's root cause applies identically regardless of which field's editor was
open — covering both, not assuming one stands in for the other).

**Independently settling QA-vs-Developer's discrepancy over the exact failure mode:** QA's own trace
expected a thrown, catchable exception; Developer's repro instead found a silent stale-clone bug.
Rather than trusting either account, I independently reproduced BOTH the pre-fix and post-fix
behavior myself: extracted the pre-fix `script.js`/`index.html`/`style.css` via
`git show 8b17aac:<file>` (script.js's parent commit, immediately before the `90983e3` fix) into an
isolated temp copy (`c:/tmp/pw-test/vopping-c1-repro-old/`) that never touches the live project
files, then ran the exact QA sequence against it. **Confirmed independently: zero thrown page/console
errors pre-fix, and the LIVE row B never got the `dragging` class** (a genuine stale detached clone
got it instead) — matching Developer's disclosed account, not QA's original thrown-exception trace.
Root cause of the discrepancy, confirmed directly: `listRoot.innerHTML = html` only detaches the OLD
`<ul>` (the direct child of `#list-root`) from the live document — the stale `<li>`'s own
`parentNode` (that now-orphaned old `<ul>`) stays non-null, so `insertBefore` succeeds silently into
a dead, invisible subtree rather than throwing. Post-fix, the same repro shows zero errors AND the
live row correctly getting `dragging`. Script:
`c:\tmp\pw-test\vopping-c1-independent-repro.js`; full transcript below.

---

**Original formal pass, 2026-09-09 (superseded above for the citation-of-record slot, left intact as
history per this project's transparency convention):** Pushed sha `33deddf` (part of `635f906`),
Developer self-verified first (27/27 new checks, zero unexpected regressions) — this was the
independent Tester formal pass on top of that, before C1's fix existed.

Drafted ahead of implementation on 2026-09-09 while Developer started building — the draft's 26
cases were checked directly against the shipped `script.js`/`style.css` before this formal pass ran
(drag surface confirmed as the whole row, no dedicated handle; undo shape confirmed as
`{type:'reorder',id,fromIndex,toIndex}`; constants read directly from source: 450ms pickup delay,
10px jitter tolerance, 56px auto-scroll edge zone, 14px/frame scroll speed) and refined into the 42
concrete assertions below — a few draft cases split into multiple sub-assertions once actually
scripted (e.g. TC13.1/TC13.9 each cover more than one observable fact), which is why the final count
(42) differs from the draft's nominal 26 case IDs; no draft case was dropped.

**Story:** As a user, I want to reorder items by dragging them, so that I can rearrange my list to
match my store's layout without dedicated Up/Down buttons taking up row space.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-08):** press-and-hold with a
deliberate pickup delay (exact duration is a Developer-level tuning detail, not PO-locked) initiates
drag mode; must be long enough that ordinary scrolling and tapping other nested controls never
accidentally trigger a pickup; a quick tap below that threshold still performs the existing
whole-row cross-off toggle (S2) unchanged; every other nested control still performs only its own
action. Dragging inserts at an arbitrary new position (not neighbor-only like S5), persisted
immediately on drop. Implemented via Pointer Events (not touch-only), so it's automatable via
Playwright. No dedicated drag-handle is required by this AC — whole-row-press vs. a dedicated handle
icon is a Developer-level choice.

**Resolved technical-shape decisions (Tester's testability-check, 2026-09-08, folded into locked AC
directly):**
1. **Drop-position rule:** a live placeholder/insertion-point indicator moves as the drag hovers;
   above vs. below the midpoint of the currently-hovered row determines insert-before vs.
   insert-after; release commits to wherever the placeholder sits at that moment.
2. **Jitter tolerance during pickup delay:** touch point must stay within a small movement
   tolerance (Developer-level px value) for the full delay; exceeding it before the delay elapses
   cancels the pickup (treated as an ordinary scroll, no drag begins) — the delay timer does NOT
   resume on a later hold, it restarts fresh from a new press.
3. **Drop released outside the list's scrollable bounds:** commits to the nearest valid boundary
   (top of list if released above, bottom if released below) — never a silent no-op/cancel; like
   any drag-drop reorder, undo-recoverable.
4. **QA finding R9 — `pointercancel` aborts entirely:** item returns to its original position,
   nothing committed, no undo entry created; `pointercancel` is never treated as an implicit drop.

**Additional folded-in requirements:**
- Starting a drag-pickup on one row must commit (never silently discard) an in-progress note/aisle
  draft still open on a different row — same cross-row commit-on-unrelated-action guarantee S7/S8
  already require, now extended to cover drag-pickup as one more "unrelated action."
- Hidden/disabled during any non-Manual sort (S9) — drag is manual-order-only — reappears
  automatically back in Manual, same as S5's buttons were.
- Each drag-drop reorder is undo-eligible (same `reorder` type S5's swaps used); undo restores the
  item to its exact prior position.
- **QA gate findings M9-M12, M15 (all folded in directly, resolved, no PO input needed):**
  - **M9:** a row with its own note/aisle/name editor currently open cannot be drag-picked-up — the
    press-and-hold is captured by the open editor's input as ordinary text interaction; the row must
    first auto-commit/close its editor (e.g. tap elsewhere) before it becomes drag-eligible again.
  - **M10:** the same press-and-hold-with-jitter-tolerance gate applies identically regardless of
    which drag-surface Developer picked (whole-row or dedicated handle) — no instant-pickup
    shortcut for a dedicated handle.
  - **M11:** a drag that ends with the item released back at its exact original position is a
    no-op — no undo-buffer entry is created (consistent with add/delete's own no-op precedents).
  - **M15 (tie-break vs. rule 3 above):** when M11's same-position case and rule 3's
    out-of-bounds-boundary-commit case coincide (e.g. nudging the top item just above the list and
    releasing — nearest boundary is position 0, which is also its original spot) — **M11's no-op
    wins**: list order is unchanged, and critically no undo-buffer entry is created (a spurious
    entry here would clobber whatever undo-eligible action was already pending before the drag).
  - **M12:** once a drag is actively underway (post-pickup, distinct from the arming delay before
    pickup begins), normal touch-scrolling is suppressed — only the auto-scroll-near-edge mechanic
    (below) scrolls during an active drag; suppression ends the instant the drag ends (drop, cancel,
    or `pointercancel`).
- **PO decision — auto-scroll is REQUIRED, not optional:** dragging the held item near the top or
  bottom edge of the visible viewport auto-scrolls the list in that direction, continuing for as
  long as the drag stays near that edge (exact trigger-zone size/speed are Developer-level tuning
  details).
- **Accessibility:** touch-only drag-and-drop with no keyboard equivalent is accepted, consistent
  with this project's already-settled out-of-scope keyboard/screen-reader stance — not a gap to
  test for, just confirm it's absent by design, not by omission.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-09 (pushed sha `33deddf`) — whole-row drag surface (no dedicated handle icon), three-phase
`dragArm`/`dragState` machine, raw Pointer Events throughout. Independently formally verified below.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`. AC explicitly requires
Pointer Events (not touch-only) specifically so this is automatable — drag simulation via
`dispatchEvent`-level `pointerdown`/`pointermove`/`pointerup`/`pointercancel` sequences, not
Playwright's higher-level mouse-only drag helper, so `pointercancel` (TC13.9 below) is actually
reachable.

## Testability review summary (for scrum-master)
Already closed, 2026-09-08 — three gaps found and resolved directly in BACKLOG.md's S13 row (see
"Resolved technical-shape decisions" above), then QA's own gate pass added R9/M9-M12/M15, all
folded in and re-confirmed contradiction-free at Lock time. No open items. **Resolved, 2026-09-09:**
Developer's drag-surface choice is the whole row (no dedicated handle icon) — confirmed directly
against the shipped `script.js` before writing the formal-pass script, so TC13.1/TC13.10/TC13.17
below are all exercised against the row element itself.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC13.1 | Pickup delay gates drag start | Press down on a row (whichever drag surface Developer ships), hold past the delay, then move | Drag mode begins only after the delay elapses, not on `pointerdown` alone |
| TC13.2 | Quick tap below delay still cross-offs | Press and release well under the delay threshold, no significant movement | Row's whole-row cross-off toggle (S2) fires normally; no drag initiated |
| TC13.3 | Jitter tolerance cancels an in-progress pickup | Press down, move beyond the jitter tolerance before the delay elapses, release | No drag begins; treated as an ordinary scroll gesture |
| TC13.4 | Delay restarts fresh, does not resume | Press, move past jitter tolerance (cancelling pickup), then press again immediately | Second press's delay timer starts from zero, not from wherever the first attempt left off |
| TC13.5 | Drop-position rule — insert-before via midpoint | Drag an item to hover in the upper half of a target row, release | Item inserted BEFORE that row |
| TC13.6 | Drop-position rule — insert-after via midpoint | Drag an item to hover in the lower half of a target row, release | Item inserted AFTER that row |
| TC13.7 | Drop outside bounds (above) commits to top boundary | Drag an item and release above the list's top edge | Item lands at position 0; not a no-op, not cancelled |
| TC13.8 | Drop outside bounds (below) commits to bottom boundary | Drag an item and release below the list's bottom edge | Item lands at the last position; not a no-op, not cancelled |
| TC13.9 | `pointercancel` aborts cleanly (QA R9) | Begin a drag (past pickup delay, item lifted), then dispatch `pointercancel` instead of `pointerup` | Item returns to its exact original position; nothing committed to storage; no undo-buffer entry created |
| TC13.10 | Drag surface uses Pointer Events, not touch-only | Inspect event listeners / dispatch synthetic `pointerdown`/`pointermove`/`pointerup` | Drag responds correctly to Pointer Events directly (not gated behind a touch-only listener) |
| TC13.11 | Starting a drag-pickup commits a pending draft elsewhere (cross-row commit); **strengthened 2026-09-09 to also close QA finding C1** | Open a note editor on row A, type a draft, don't commit; begin a drag-pickup on row B | Row A's draft is committed (not discarded) before/as row B's drag begins; the LIVE row B (not a stale detached clone) actually receives the `dragging` class |
| TC13.12 | Hidden/disabled during non-Manual sort | Switch to Alphabetical or By-Aisle sort | Drag is unavailable (no pickup possible) on any row |
| TC13.13 | Reappears in Manual | Switch back to Manual from a non-Manual sort | Drag is available again |
| TC13.14 | Undo-eligible, restores exact prior position | Drag an item to a new position, click Undo | Order returns to exactly what it was before the drag |
| TC13.15 | M9 — open editor blocks pickup on that row | Open a note/aisle editor on a row, attempt a press-and-hold on that same row without committing first | No drag begins; press-and-hold is captured as ordinary text-input interaction instead |
| TC13.16 | M9 — row becomes drag-eligible again once editor auto-commits | Close/commit the editor from TC13.15 (e.g. tap elsewhere), then press-and-hold the same row | Drag now initiates normally |
| TC13.17 | M10 — no instant-pickup shortcut regardless of drag-surface choice | Whichever surface Developer shipped, press down and release before the delay elapses | No drag begins even on a dedicated handle — same delay/jitter gate applies uniformly |
| TC13.18 | M11 — same-position drop is a true no-op | Pick up an item, drag it around, release it back at its exact original position | List order unchanged; Undo button's enabled/disabled state is unaffected — no new undo-buffer entry created |
| TC13.19 | M15 — no-op wins the tie-break vs. boundary-commit | Pick up the top item, drag it just above the list's top edge (both M11's same-position and rule 3's boundary-commit would apply), release | Item lands back at position 0 (unchanged order) AND no undo-buffer entry is created — confirm by checking Undo still targets whatever action was pending before this drag, not the drag itself |
| TC13.20 | M12 — scroll suppressed during active drag | While an item is actively picked up (post-pickup), attempt an ordinary scroll gesture away from any edge-triggered auto-scroll zone | Page/list does not scroll from the ordinary gesture during the active drag |
| TC13.21 | M12 — suppression ends when drag ends | End the drag (normal drop), then attempt an ordinary scroll | Scrolling works normally again immediately after the drag ends |
| TC13.22 | Auto-scroll near top edge | Drag an item near the top edge of the visible viewport and hold there | List auto-scrolls upward continuously while held in that zone |
| TC13.23 | Auto-scroll near bottom edge | Drag an item near the bottom edge of the visible viewport and hold there | List auto-scrolls downward continuously while held in that zone |
| TC13.24 | Persists immediately, survives refresh | Drag-reorder an item, reload | New order retained after reload |
| TC13.25 | Nested-control precedence unaffected | Tap delete/note-toggle/aisle-toggle on a row (below drag's pickup-delay threshold) | Each control's own action still fires correctly; no accidental drag pickup |
| TC13.26 | Accessibility scope confirmed N/A | Inspect for any keyboard-equivalent drag mechanism | None present — correctly out of scope, not a gap |
| TC13.27 | **(NEW, 2026-09-09)** Closes QA finding C1's aisle-editor variant | Open an AISLE editor on row A, type a draft, don't commit; begin a drag-pickup on row B | Row A's aisle draft is committed (not discarded); the LIVE row B actually receives the `dragging` class |

## Results
All 42 checks below passed on the first clean run after one script-authoring bug was found and
fixed during writing (not a defect in the app — see the note after this table). Real values quoted
directly from the script's own output.

| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC13.1 | Drag does not begin before the delay; begins once the 450ms delay has elapsed (2 sub-checks) | Pass |
| TC13.2 | Quick tap well under the delay: `before=false after=true` — ordinary cross-off fires unchanged | Pass |
| TC13.3 | Jitter (>10px) during the delay cancels the pickup; list order left untouched (2 sub-checks) | Pass |
| TC13.4 | A later press starts its own fresh 450ms delay — does not inherit any remaining time from an earlier cancelled arm (2 sub-checks) | Pass |
| TC13.5 | Dropping below a row's midpoint inserts AFTER it (`after=[1,2,0,3,4]`); trailing click does not also cross off (`before=false after=false`) (2 sub-checks) | Pass |
| TC13.6 | Dropping above a row's midpoint inserts BEFORE it (`after=[0,4,1,2,3]`) | Pass |
| TC13.7 | Releasing above the list clamps to index 0 (`[3,0,1,2,4]`) | Pass |
| TC13.8 | Releasing below the list clamps to the last index (`[1,2,3,4,0]`) | Pass |
| TC13.9 | `pointercancel`: order unchanged, Undo state unchanged (`true`→`true`), dragging/placeholder visuals cleaned up, no trailing click fires (4 sub-checks) | Pass |
| TC13.10 | Confirmed structurally — every TC13 check in the script drives the app via dispatched `PointerEvent` alone, zero Playwright-mouse-API calls, and the app responds correctly throughout | Pass |
| TC13.11 | Cross-row commit: Milk's draft note correctly saved as `"half gallon - draft"` before/as a different row's pickup begins; **strengthened check confirms the LIVE row B (`liveDragRowDragging=true`), not a stale clone, gets `dragging` — this closes QA finding C1** (2 sub-checks) | Pass |
| TC13.12 | Drag never arms while Alphabetical sort is active | Pass |
| TC13.13 | Drag becomes available again once back in Manual sort | Pass |
| TC13.14 | A real drag changes order, creates an undo-eligible action, and Undo restores the exact prior order (3 sub-checks) | Pass |
| TC13.15 | (M9) A row with its own open note editor cannot be drag-picked-up (press-and-hold on `.item-name` while open) | Pass |
| TC13.16 | (M9) The same row becomes drag-eligible again immediately once its editor commits | Pass |
| TC13.17 | (M10) Both the item-name area and blank row space respect the identical delay — no instant-pickup shortcut anywhere on the row (2 sub-checks) | Pass |
| TC13.18 | (M11) Same-position drop: order unchanged, Undo state unchanged (`true`→`true`, i.e. no new entry), and the trailing click does not also cross off (3 sub-checks) | Pass |
| TC13.19 | (M15) Nudging the TOP item above the list lands back at position 0 (`after=[0,1,2,3,4]`) AND creates no undo entry (`true`→`true`) — no-op wins the tie-break against the boundary-commit rule (2 sub-checks) | Pass |
| TC13.20 | (M12) `#list-root`'s computed `touch-action` goes from `auto` to `none` the moment a drag becomes active | Pass |
| TC13.21 | (M12) `touch-action` reverts away from `none` the instant the drag ends | Pass |
| TC13.22 | Holding near the bottom viewport edge auto-scrolls down (`before=0 during=434`) | Pass |
| TC13.23 | Holding near the top viewport edge auto-scrolls up (`before=400 during=0`); the scroll loop actually stops once the drag ends (2 sub-checks) | Pass |
| TC13.24 | Drag result persists to localStorage immediately and survives a reload (`after=[1,2,0]`, matches post-reload) (2 sub-checks) | Pass |
| TC13.25 | Press-and-hold on Delete never arms a pickup; Delete still performs its own action (2 sub-checks) | Pass |
| TC13.26 | No keyboard-equivalent reorder mechanism exists — confirmed absent by design, consistent with project-wide accessibility scope | Pass |
| TC13.27 | Aisle variant of C1's closure: `Eggs`'s draft aisle correctly saved as `"Pantry - draft"` before/as row B's pickup begins; the LIVE row B (`liveDragRow2Dragging=true`) gets `dragging`, not a stale clone (2 sub-checks) | Pass |

**Overall verdict: PASS, 0 defects in S13.** 45/45 S13-specific checks passed (42 original + 1 new
sub-check strengthening TC13.11 + 2 new checks in TC13.27), plus the full 174-check regression
baseline (67 Sprint-1 + 81 Sprint-2 + 26 Sprint-3) re-confirmed clean in the same run —
**219/219 total**, matching the script's own single printed total exactly. Zero console/page
errors, zero dialogs, zero non-`file://` network requests across the entire run. Regression count:
219/219, `REGRESSION_LOG.md`'s current canonical row — S13 is DONE, this time closing QA finding C1
with dedicated, verified-against-the-real-bug coverage rather than a check that happened to pass for
the wrong reason.

**Script-authoring bug found and fixed while writing this pass (not an app defect):** the first
draft of TC13.15 assumed row id=0 (Milk) still had an empty note and its `note-toggle` icon-btn
present, but TC13.11 (earlier in the same run) had already committed a real note onto that same row
via the cross-row commit-on-pickup test and never cleared it back out — so by TC13.15 the row
correctly showed `.note-display` instead (per S7's own already-verified behavior), and the script's
own locator wait for the no-longer-present icon-btn timed out. Fixed by clearing Milk's note back to
empty immediately after TC13.11's assertion, before TC13.12 onward run. Disclosing this because it's
exactly the kind of test-script bookkeeping mistake this project's transparency convention exists to
surface, not because it reflects on the app itself — the underlying S7 behavior it tripped over
(note-toggle icon disappears once a note has a value) is correct and already covered by Part 2's own
TC7.3b.

## Commands run and output

**Current canonical run (219/219, closes QA finding C1):**
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js`, updated in place (TC13.11 strengthened,
TC13.27 added) rather than replaced, same file/citation as before:
```
node c:/tmp/pw-test/vopping-tests-tester-s1-s13-formal.js
```
Part-subtotal markers from the actual run (in execution order):
```
---- Part 1 (Sprint-1 regression, retrofitted 74->67) subtotal: 67/67 ----
---- Part 2 (S7 notes) subtotal so far: 23 checks ----
---- Part 2 (S7+S8) subtotal so far: 41 checks ----
---- Part 2 (S7+S8+S9 so far) subtotal: 60 checks ----
---- Part 2 (S7+S8+S9+S10) total: 81 new checks ----
---- Part 3 (S14+S16+S17) total: 26 new checks ----
---- Part 4 (S13 drag-and-drop) total: 45 new checks ----
```
Key new/changed lines (verbatim):
```
PASS - TC13.11 starting a drag-pickup on another row commits a still-open note draft on a DIFFERENT row, never silently discards it :: {"id":0,"name":"Milk","checked":false,"note":"half gallon - draft","aisle":""}
PASS - TC13.11 (closes QA C1) the LIVE, visible dragged row - not a stale detached clone left behind by the cross-row commit's render() - actually receives the dragging class :: liveDragRowDragging=true
PASS - TC13.27 (closes QA C1, aisle-editor variant) starting a drag-pickup on another row commits a still-open AISLE draft on a DIFFERENT row, never silently discards it :: {"id":1,"name":"Eggs","checked":false,"note":"","aisle":"Pantry - draft"}
PASS - TC13.27 (closes QA C1, aisle-editor variant) the LIVE, visible dragged row actually receives the dragging class, not a stale detached clone :: liveDragRow2Dragging=true
```
Final summary line:
```
219/219 passed

Console/page errors captured across entire run: none
Dialogs captured across entire run: none
Non-local network requests: 0
```
Full raw transcript archived at `c:/tmp/pw-test/s1-s13-run3-c1fix.log` (canonical copy going
forward, superseding `s1-s13-run2.log`, which is left in place as history).

**Independent C1 exception-vs-silent-bug repro (settles the QA/Developer discrepancy):**
Script: `c:\tmp\pw-test\vopping-c1-independent-repro.js` — runs the exact QA sequence against an
isolated temp copy of the pre-fix code (`git show 8b17aac:<file>`, never touches the live project
files) and separately against the current post-fix project files:
```
node c:/tmp/pw-test/vopping-c1-independent-repro.js
```
Output (verbatim):
```
==== PRE-FIX (commit 8b17aac, isolated temp copy) ====
Page errors thrown during the gesture: NONE
Console errors during the gesture: none
LIVE row B (the one the user would actually see) has "dragging" class: false
Row A's draft note got committed (cross-row commit guarantee): {"id":0,"name":"Milk","checked":false,"note":"uncommitted draft","aisle":""}

==== POST-FIX (current project files, sha 90983e3) ====
Page errors thrown during the gesture: NONE
Console errors during the gesture: none
LIVE row B (the one the user would actually see) has "dragging" class: true
Row A's draft note got committed (cross-row commit guarantee): {"id":0,"name":"Milk","checked":false,"note":"uncommitted draft","aisle":""}

==== VERDICT ====
PRE-FIX: threw an exception = false | live row got 'dragging' = false
CONFIRMED (independently, this environment): the pre-fix bug is a SILENT STALE-CLONE failure,
NOT a thrown exception. ...
POST-FIX: zero errors AND the live row correctly gets 'dragging' = true -> fix CONFIRMED working
```

**Original (superseded) 216/216 run:** full raw transcript archived at
`c:/tmp/pw-test/s1-s13-run2.log`, left in place as history per this project's transparency
convention — not the current citation, see the STATUS banner above.
