# Test Plan — S13: Drag-and-drop reorder (supersedes S5's Up/Down buttons)

**STATUS: AWAITING IMPLEMENTATION — AC locked, Developer has not delivered.** Drafted ahead of
implementation while Developer starts building (2026-09-09) — AC is fully Locked in BACKLOG.md
(cleared full doc pipeline, six iterative QA rounds, zero remaining contradictions per QA's
Lock-gate re-read), so every clause below is drafted directly from locked text, not a guess. This
is NOT a fresh testability pre-check — that already ran (2026-09-08, three gaps found and resolved
directly in BACKLOG.md's S13 row) and is closed; this file just turns the now-locked AC into
concrete test cases ahead of time. No Results yet — this section fills in once Developer delivers
and I run the independent formal pass, same pattern as every other story this project.

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

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. **Not yet
implemented** — Developer starting now (2026-09-09). This file will be updated once Developer's
self-verification lands and again once my own independent formal pass runs.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`. AC explicitly requires
Pointer Events (not touch-only) specifically so this is automatable — drag simulation via
`dispatchEvent`-level `pointerdown`/`pointermove`/`pointerup`/`pointercancel` sequences, not
Playwright's higher-level mouse-only drag helper, so `pointercancel` (TC13.9 below) is actually
reachable.

## Testability review summary (for scrum-master)
Already closed, 2026-09-08 — three gaps found and resolved directly in BACKLOG.md's S13 row (see
"Resolved technical-shape decisions" above), then QA's own gate pass added R9/M9-M12/M15, all
folded in and re-confirmed contradiction-free at Lock time. No open items. One thing to watch once
implementation lands: whichever drag-surface choice Developer makes (whole-row vs. dedicated
handle) determines exactly how TC13.1/TC13.10 below get exercised — write the concrete selector
once that choice is visible in the shipped markup, not before.

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
| TC13.11 | Starting a drag-pickup commits a pending draft elsewhere (cross-row commit) | Open a note or aisle editor on row A, type a draft, don't commit; begin a drag-pickup on row B | Row A's draft is committed (not discarded) before/as row B's drag begins |
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

## Results
| AC # | Test Case | Steps/Command | Expected | Actual | Pass/Fail |
|------|-----------|----------------|----------|--------|-----------|
| — | — | — | — | Not yet implemented — fills in after Developer delivers and formal pass runs. | — |

**Overall verdict:** Pending implementation.

## Commands run and output
None yet — script to be written once implementation lands, following this project's convention of
covering full prior regression (currently 180/180 per `REGRESSION_LOG.md`) plus new S13-specific
checks in one combined run.
