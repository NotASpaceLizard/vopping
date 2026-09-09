# Test Plan — S19: Restore Up/Down buttons (remove drag-and-drop)

**STATUS: TESTABILITY REVIEW IN PROGRESS — AC not yet locked.** Testability-check pass (this file's
current purpose) on the AC drafted 2026-09-09; Developer's sanity-check already landed. Not yet
implemented — no formal pass exists yet. This is the pre-implementation Tester touch-point (verify
every criterion is concretely verifiable, route gaps to Scrum Master); the executed formal pass and
Results table come after Developer implements.

**Story:** As a user, I want to reorder items with Up/Down buttons again instead of drag-and-drop, so
that reordering actually works on my phone — where the drag gesture loses to the browser's native
scroll.

**Acceptance criteria (condensed from BACKLOG.md, drafted 2026-09-09 — reverts S13's interaction
mechanism back to S5's Up/Down at the UI layer only):**
- **Remove S13's drag-and-drop entirely:** the press-and-hold pickup + delay/jitter arming, the live
  placeholder, the auto-scroll-near-edge mechanic, the Pointer-Events drag machinery, and the
  drag-only CSS (`touch-action:none`/`.drag-active`/`.dragging`/`.drag-placeholder`). The whole-row
  cross-off tap (S2) is unaffected.
- **Restore S5's per-row Up and Down buttons exactly as S5 specified:** click Up/Down swaps with the
  immediate neighbor; the top row's Up and bottom row's Down are disabled/no-op; each swap persists
  the manual array order immediately and survives refresh; each single swap is one of S6's four
  undo-eligible action types and undo restores the exact prior order.
- **Data model unchanged** — S13 preserved S5's persisted manual-order model verbatim, so restoring
  Up/Down needs no data migration; reorder/persistence logic is identical to what S5 shipped.
- **Nested-control precedence (S2):** tapping Up or Down fires ONLY that swap, never the whole-row
  cross-off toggle.
- **Non-Manual sort (S9):** Up/Down are hidden/disabled whenever a non-Manual sort is active and
  reappear in Manual (the same manual-order-only rule S9 always described; S9's clause re-points to
  this story on ship).
- **Crowding is an explicit, PO-accepted tradeoff, NOT a reopening of the R7 crowded-row gate** — the
  PO directly experienced the alternative, saw the crowding, and chose it ("i'll take crowded over
  not working"), confirming ~20 characters of item-name space remain with both Up/Down and the edit
  button present. S20 is the PO's own mitigation. Auto-scroll-during-drag convenience goes away with
  the drag machinery — a weighed, accepted tradeoff, noted so it isn't later mistaken for a
  regression.
- **Escape hatch CLOSED, 2026-09-09** — Developer's diagnosis came back non-trivial (iOS
  `touch-action` latches at `touchstart`), the PO declined the one drag-preserving alternative (a
  dedicated handle at 5 vs 6 icons), so the revert proceeds unconditionally; drag-and-drop is out for
  good.

## Testability review summary (for scrum-master)

**Verdict: S19's AC is testable. One narrow clarification recommended before Lock (non-blocking,
technical-shape, no PO input needed — same category as S13's own R9/R11-style testability additions);
no subjective/unmeasurable criteria otherwise.**

Every functional criterion is concrete and observable, and every one has a directly-reusable test
precedent (S5's original suite and S13's own removal-verification probes):

1. **Drag-and-drop removal — testable behaviorally + structurally.** Assert (a) a press-and-hold past
   the old 450ms pickup delay on a row never arms a drag (no `.dragging` class ever appears — reuse
   the real pointerdown-then-wait probe S13's TC9.8 already established); (b) `.drag-placeholder` /
   `.drag-active` / `.dragging` never appear and `#list-root`'s computed `touch-action` never goes to
   `none` during any gesture; (c) an ordinary touch-scroll is never suppressed. "Removed entirely" is
   verifiable through the absence of these observable side effects — no need to inspect for the source
   code being gone.
2. **Up/Down swap, disabled edges, persistence, undo, nested-control precedence, non-Manual gating** —
   all directly testable and all have exact precedent in S5's own 7 (now-retired) test cases
   (`test-plans/S5-reorder-buttons.md`): assert order swap on click; assert the `disabled` attribute
   on the top Up / bottom Down (S5 used the attribute — I'll assert both the attribute AND a no-op
   click, since the AC says "disabled/no-op"); reload-and-diff for persistence; swap→Undo→exact-order
   for undo self-inverse; `aria-checked` unchanged after an Up/Down click for precedence; presence in
   Manual vs. absence in Alphabetical/By-Aisle for sort gating (the exact inverse of S13's TC9.8/TC9.9,
   which I'll re-point back to Up/Down).

**Recommended clarification (one, narrow — route to Scrum Master):**
- **T1 — pin the deterministic pass/fail line for the PO-accepted crowding.** The AC correctly frames
  crowding as an accepted tradeoff and the "~20 characters" figure as the PO's own observation (not a
  per-character test assertion) — good, that part needs no change. But "accepted crowding" should be
  stated to NOT waive the project's locked no-horizontal-overflow row guardrail (S1/S2 locked spec,
  re-verified on every row-layout change at 320/360/375/390px, with `flex-wrap: wrap` letting controls
  wrap to a second line rather than overflow). That guardrail is the concrete, measurable line the
  formal pass will assert against for the reintroduced crowding — recommend one sentence making
  explicit that it still governs, so "the row is acceptably crowded" has a deterministic test
  (no horizontal overflow at the four locked widths; controls may wrap) rather than resting on the
  soft "~20 chars" estimate. No PO input needed; this is just naming the already-locked guardrail.

**Flagged for this story's own FORMAL pass (not a testability-check gap — on the radar per the
Orchestrator):** restoring Up/Down produces a **true worst-case row of up to 6 primary-line icon
controls on a both-fields-empty item** (note-toggle + aisle-toggle + S15 edit + Up + Down + delete) —
one MORE than R7's original 5-icon worst case, because S15's edit icon is new since the PO last saw
the crowding, and the PO's "~20 chars" estimate may not have accounted for note+aisle icons also
showing on an empty row. The formal pass will **measure that real 6-icon both-fields-empty row at
320px directly** (real DOM measurement + screenshot, the same method the R7 / Tracked-follow-up-#2
gate used), rather than inferring it fits. This one measurement also serves as the **definitive
re-measurement Scrum Master deferred** for the S7/S8 worst-case-row closure evidence, which went stale
when S15 added its edit icon (Axis A 1→2 icons, Axis B 3→4, now up to 6 with Up/Down restored) — so
one post-S19/S20 measurement closes both. Sequenced after S20 ships too, since S20's frameless
restyle changes each icon's appearance (though not its footprint), so the definitive measurement
should reflect the final post-S19+S20 layout.

**Test-authoring note (my call, not an AC matter):** S5's 7 retired test cases become behaviorally
relevant again, but I'll **author fresh S19 cases** rather than un-retire S5's verbatim — the row
context changed materially since S5 (S15's edit icon is new, S14 shrank the controls, and S19 must
also assert drag-and-drop is *gone*, which S5's cases never covered). Fresh cases keep S5's own
history intact as the record of what shipped for its time.

## Planned test approach (pre-implementation draft — refined against the shipped build at formal-pass time)
- TC19.1 Up/Down buttons present on each row (data-role `up`/`down`), Manual sort.
- TC19.2 Down-swap exchanges a row with its lower neighbor; nothing else moves.
- TC19.3 Up-swap exchanges a row with its upper neighbor.
- TC19.4 Top row's Up disabled (attribute) AND a click is a no-op.
- TC19.5 Bottom row's Down disabled (attribute) AND a click is a no-op.
- TC19.6 Swap persists to localStorage immediately and survives refresh.
- TC19.7 Swap is S6-undo-eligible; Undo restores the exact prior order (self-inverse).
- TC19.8 Nested-control precedence: clicking Up/Down does NOT toggle the row's cross-off (`aria-checked` unchanged); keyboard variant too.
- TC19.9 Up/Down hidden/disabled in Alphabetical and By-Aisle; reappear in Manual (re-points S13-era TC9.8/TC9.9 back to Up/Down).
- TC19.10 Drag-and-drop is gone: press-and-hold past the old delay never arms a drag; `.dragging`/`.drag-placeholder`/`.drag-active` never appear; `touch-action` never goes to `none`; ordinary scroll not suppressed.
- TC19.11 Whole-row cross-off tap (S2) still works unchanged.
- TC19.12 (formal-pass measurement) real 6-icon both-fields-empty worst-case row at 320px: no horizontal overflow at 320/360/375/390px (controls may wrap), + screenshot; doubles as the deferred S7/S8 closure re-measurement.
