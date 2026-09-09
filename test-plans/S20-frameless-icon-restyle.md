# Test Plan — S20: Frameless icon restyle (glyph fills the footprint)

**STATUS: TESTABILITY REVIEW IN PROGRESS — AC not yet locked.** Testability-check pass on the AC
drafted 2026-09-09; Developer's sanity-check already landed. Not yet implemented — no formal pass
exists yet. This is the pre-implementation Tester touch-point; the executed formal pass and Results
table come after Developer implements.

**Story:** As a user, I want the row control buttons to look bigger and be easier to tap without the
row getting any taller, so that the row stays comfortable even after the Up/Down buttons come back
and crowd it.

**Acceptance criteria (condensed from BACKLOG.md, drafted 2026-09-09 — PO's own idea to ease S19's
reintroduced crowding):**
- **Scope: every per-row icon control** — Up and Down (S5/S19), delete (S3), note-toggle (S7),
  aisle-toggle (S8), S15's edit-icon, and S16's icon-only aisle-sort affordance (the full `.icon-btn`
  set). **Remove the square button outline/chrome** (border, background, box) and **scale the glyph up
  to fill the button's existing footprint.**
- **Net effect (the PO's whole point):** the glyph appears larger and reads as a bigger, more tappable
  target WITHOUT increasing the button footprint or the row height — the footprint stays exactly
  whatever S14's ~25% shrink left it. PO's words: "the appearance of a bigger button without the size
  of the button actually changing."
- **Does NOT undo S14** — keeps S14's footprint reduction intact; only changes the chrome (removed)
  and glyph size (enlarged to fill) within that same footprint.
- **Out of scope — the text tags:** the populated-state `.note-display`/`.aisle-tag` affordances are
  text, not "a tiny icon in a square button," so this doesn't apply to them (same boundary S14 drew).
- **No functional/behavioral change** to any control's action — visual/styling only.
- **Accessibility:** the enlarged glyph must still read clearly as an actionable control; any glyph
  carrying a color treatment (e.g. S16's accent-colored U+2691 flag) stays colorblind-safe/Okabe-Ito;
  plain non-color glyphs also satisfy this. Tap-target footprint is unchanged (already sub-24px
  post-S14, a PO-accepted tradeoff) — a larger-appearing glyph can only help effective tappability.
- **No decision-tool mockup needed** — a direct, unambiguous PO instruction, not an open subjective
  call.

## Testability review summary (for scrum-master)

**Verdict: S20's AC is testable. One narrow clarification recommended before Lock (non-blocking,
technical-shape, no PO input needed) — to pin a deterministic pass/fail line for the one
slightly-soft phrase ("scale the glyph to fill the footprint").**

The load-bearing, unambiguous, directly-measurable criteria — which are exactly the ones that matter
most — are fully testable:

1. **Chrome removed — testable via computed style.** For every `.icon-btn` in the control set, assert
   `border-style: none` (or `border-width: 0`) and a transparent/none `background` (`background-color`
   resolves to `rgba(0,0,0,0)`/transparent). Unambiguous.
2. **Footprint and row height unchanged — testable and load-bearing (this IS the PO's "without the
   size actually changing").** Assert each `.icon-btn`'s computed `width`/`height`/`min-width` still
   equals S14's value (19.5px, read directly from the shipped CSS, not guessed), and the row's total
   height is unchanged before/after S20 for an identical item. This is the core guarantee and it is
   crisply measurable.
3. **Out-of-scope text tags unchanged — testable.** Assert `.note-display`/`.aisle-tag` computed
   styling is unaffected (they keep whatever chrome they had — currently none).
4. **No functional/behavioral change — testable.** Each restyled control still fires its own action
   (delete deletes, note/aisle/edit toggles open their editors, Up/Down swap) — a full nested-control
   re-run.
5. **Accessibility color-safety — the concrete part is testable.** Assert S16's aisle-sort icon keeps
   its accent-color treatment and that the value is still the locked Okabe-Ito color (computed
   `color`), unchanged by the chrome removal. ("Reads clearly as an actionable control" is a visual/PO
   judgment, not an automated gate, consistent with this project's narrow accessibility scope — I'll
   capture a screenshot for the PO rather than assert it programmatically.)

**Recommended clarification (one, narrow — route to Scrum Master):**
- **T1 — pin the pass/fail line for "scale the glyph up to fill the footprint."** "Fill the footprint"
  is the one phrase without a crisp automated threshold. Recommend stating the deterministic testable
  form: the glyph's computed `font-size` is **materially larger than the pre-S20 value** (i.e., it
  actually increased, not merely stayed the same), with the **exact fill ratio a Developer-level
  tuning detail, not PO-locked** — the same "exact px is Developer's call" treatment S14's ~25% figure
  and S13's delay/edge-zone constants already got. Paired with the footprint-unchanged assertion (2
  above), that gives a fully deterministic test ("chrome gone + glyph enlarged + footprint identical")
  without forcing the PO to specify an exact glyph size. Also recommend confirming "box" in "remove
  the square outline/chrome (border, background, box)" is read as border+background+any box-shadow,
  while the explicit footprint-preservation clause keeps `width`/`height`/`min-width`/padding-driven
  footprint at 19.5px — so "remove the box" is not misread as shrinking the tap target. Both are
  one-sentence, no-PO-input clarifications.

**Note on sequencing vs. S19's deferred worst-case measurement:** S20 changes each icon's appearance
but explicitly NOT its footprint, so it does not by itself change whether the 6-icon worst-case row
fits at 320px — but because S20 restyles the same controls, the single definitive worst-case-row
measurement flagged on S19's formal pass should be taken against the final **post-S19+S20** layout, so
it reflects exactly what ships. No separate S20 measurement needed.

## Planned test approach (pre-implementation draft — refined against the shipped build at formal-pass time)
- TC20.1 Every `.icon-btn` in the set has border removed (computed `border-style: none`/width 0).
- TC20.2 Every `.icon-btn` has a transparent/none background.
- TC20.3 Footprint unchanged: each `.icon-btn` computed width/height/min-width still 19.5px (S14 value).
- TC20.4 Row height unchanged before/after S20 for an identical item (single-line and worst-case rows).
- TC20.5 Glyph enlarged: computed `font-size` on the glyph is materially larger than the pre-S20 value.
- TC20.6 Text tags out of scope: `.note-display`/`.aisle-tag` styling unaffected.
- TC20.7 No behavioral change: each restyled control still fires its own action (full nested-control re-run).
- TC20.8 S16 aisle-sort icon keeps its accent color, still the locked Okabe-Ito value; + screenshot for PO visual sign-off.
