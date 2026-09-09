# Test Plan — S19: Restore Up/Down buttons (remove drag-and-drop)

**STATUS: DONE — formally executed 2026-09-09, PASS (222/222 combined run; 13 S19-specific checks,
TC19.1-TC19.10), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s20-formal.js` (new canonical suite, Part 4 — rebuilt from the
drag-era s1-s13 suite, which is retired since S19 removes the drag behavior its TC13.* cases asserted).
Implemented + self-verified by Developer at sha `0f76063` (net −286 lines). Full transcript:
`c:/tmp/pw-test/s1-s20-run2.log`. The authoritative 6-icon worst-case-row measurement (this story's
formal-pass deliverable, also discharging the deferred S7/S8 closure) ran clean — see "Worst-case-row
measurement result" below. The testability-review section is retained as history.

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

## Test cases (executed)
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC19.1 | Up/Down restored | Every row has `[data-role=up]`/`[data-role=down]` in Manual sort, glyphs ▲/▼ |
| TC19.2 | Down-swap | Clicking Down swaps a row with its lower neighbor, nothing else moves |
| TC19.3 | Up-swap | Clicking Up swaps a row with its upper neighbor |
| TC19.4 | Top-Up disabled | Top row's Up is `disabled` AND a forced (synthetic) click is a no-op |
| TC19.5 | Bottom-Down disabled | Bottom row's Down is `disabled` AND a forced click is a no-op |
| TC19.6 | Persist + refresh | A swap persists to localStorage immediately and survives a reload |
| TC19.7 | Undo self-inverse | A swap is S6-undo-eligible; Undo restores the exact prior order |
| TC19.8 | Nested-control precedence | Clicking Up/Down performs only the swap, never crosses off the row |
| TC19.9 | Drag removed entirely | A full press-hold-move-release reorders nothing; no `.dragging`/`.drag-placeholder`; no stuck `touch-action:none` |
| TC19.10 | S2 unaffected | Whole-row cross-off tap still works after the drag removal |

Sort-mode gating (Up/Down hidden in non-Manual, present in Manual) is verified in Part 2's rewritten
TC9.8/TC9.9 (see `S9-sort-view.md`'s dated note) rather than duplicated here.

## Results
All 13 S19-specific checks passed on a clean run. Real values quoted from the script output.

| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC19.1 | `up=5 down=5 glyphs=▲/▼` | Pass |
| TC19.2 | Down on index 1: `after=[0,2,1,3,4]` | Pass |
| TC19.3 | Up on index 2: `after=[0,2,1,3,4]` | Pass |
| TC19.4 | top Up `disabled=true`, forced click `order=[0,1,2,3,4]` unchanged | Pass |
| TC19.5 | bottom Down `disabled=true`, forced click `order=[0,1,2,3,4]` unchanged | Pass |
| TC19.6 | `stored=[1,0,2,3,4] dom=[1,0,2,3,4]`; after reload `[1,0,2,3,4]` (2 sub-checks) | Pass |
| TC19.7 | `before=[0,1,2] moved=[1,0,2] undone=[0,1,2]` | Pass |
| TC19.8 | Down click: `aria-checked before=false after=false` | Pass |
| TC19.9 | press-hold-move-release: `after==before` order, `.dragging/.drag-placeholder count=0`, `touch-action mid=auto after=auto` (3 sub-checks) | Pass |
| TC19.10 | whole-row tap crosses off (`aria-checked=true`) | Pass |

**Overall verdict: PASS, 0 defects in S19.** 13/13 S19-specific checks + the full rebuilt regression
baseline clean = **222/222** — see `REGRESSION_LOG.md`'s 2026-09-09 S19/S20 row (current canonical).

## Worst-case-row measurement result (authoritative — the PO's headline, also discharges the deferred S7/S8 closure)
Real DOM measurement + screenshots at 320/360/375/390px (R7's method), post-S19+S20 (sha `0f76063`),
script `c:\tmp\pw-test\vopping-worst-case-row-6icon-closure.js` (10/10 passed, zero console errors):

- **Axis B — both fields EMPTY, Manual sort = the true 6-icon max-crowding case** (`note-toggle`,
  `aisle-toggle`, S15 `name-toggle`, S19 `up`, S19 `down`, `delete`): **the row FITS CLEANLY on a
  single line at all four widths — zero horizontal overflow, no wrapping, row height 36.17px
  (unchanged).** Item-name space: 117px @320px, 157px @360px, 172px @375px, 187px @390px — the PO's
  "~20 characters even with Up/Down + the edit button" estimate holds. Screenshots
  `vop-worstcase-6icon-axisB-empty-{320,360,375,390}px.png`.
- **Axis A — both note AND aisle SET:** the note/aisle icons hide (content moves to the second line),
  leaving 4 primary-line icons; the two-line row (66.61px) also has zero horizontal overflow at all
  widths. Screenshots `vop-worstcase-6icon-axisA-set-{320,360,375,390}px.png`.

**Bottom line: the reintroduced crowding fits within the locked no-horizontal-overflow guardrail at
every supported width, comfortably, without even needing to wrap.** This supersedes the pre-S15/S19
`vopping-worst-case-row-s13-s14-closure.js` evidence and closes the S7/S8 deferred re-measurement.
Transcript: `c:/tmp/pw-test/worstcase-6icon-closure.log`.

## Commands run and output
Formal pass (S19 is Part 4 of the combined suite):
```
node c:/tmp/pw-test/vopping-tests-tester-s1-s20-formal.js
```
Part 4 subtotal marker: `---- Part 4 (S19 Up/Down restored, drag removed) total: 13 new checks ----`.
Combined total: `222/222 passed`, zero console/page errors, zero dialogs, zero non-`file://` requests.
Full transcript `c:/tmp/pw-test/s1-s20-run2.log`. Worst-case measurement:
`node c:/tmp/pw-test/vopping-worst-case-row-6icon-closure.js` → `10/10 passed`, transcript
`c:/tmp/pw-test/worstcase-6icon-closure.log`.
