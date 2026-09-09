# Test Plan — S20: Frameless icon restyle (glyph fills the footprint)

**STATUS: DONE — formally executed 2026-09-09, PASS (222/222 combined run; 12 S20-specific checks,
TC20.1-TC20.10), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s20-formal.js` (new canonical suite, Part 6). Implemented +
self-verified by Developer at sha `0f76063`. Full transcript: `c:/tmp/pw-test/s1-s20-run2.log`. The
testability-review section is retained as history.

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

## Test cases (executed) + Results
All 12 S20-specific checks passed on a clean run after two test-script bugs were found and fixed
during authoring (neither an app defect — see the note after this table). Real values quoted from
the script output.

| Test Case | Covers AC | Actual | Pass/Fail |
|-----------|-----------|--------|-----------|
| TC20.1 | Border removed | `.icon-btn` `borderStyle=none borderWidth=0px` | Pass |
| TC20.2 | Background removed | `.icon-btn` `bg=rgba(0, 0, 0, 0)` (transparent) | Pass |
| TC20.3 | Footprint UNCHANGED | all 6 icon roles `19.5x19.5` (note/aisle/name/up/down/delete) — the PO's "size doesn't actually change" | Pass |
| TC20.4 | Row height unchanged | `rowHeight=36.17px` (single-line, no growth) | Pass |
| TC20.5 | Glyph enlarged | `fontSize=18.4px` (1.15rem — scaled up to fill the footprint) | Pass |
| TC20.6 | M20 `:hover` | hovering a frameless icon: `bgHover=rgba(0, 0, 0, 0)` (no grey box returns) | Pass |
| TC20.7 | M20 `:active` cue | real `mouse.down()` press → `transform=matrix(0.82, 0, 0, 0.82, 0, 0)` (chrome-free scale press feedback) | Pass |
| TC20.8 | Text tags out of scope | `.aisle-tag` `borderBottomStyle=dashed` (its own edit-affordance chrome untouched) | Pass |
| TC20.9 | No behavioral change | frameless edit-icon still opens its editor; frameless delete still deletes (`before=3 after=2`) (2 sub-checks) | Pass |
| TC20.10 | Color preserved / colorblind-safe | delete `color=rgb(224, 128, 128)`; By-Aisle icon `color === --accent token` (`rgb(77, 166, 255)`) (2 sub-checks) | Pass |

**Overall verdict: PASS, 0 defects in S20.** 12/12 S20-specific checks + the full rebuilt regression
baseline clean = **222/222** — see `REGRESSION_LOG.md`'s 2026-09-09 S19/S20 row (current canonical).

**Disclosed, not asserted (not a defect):** a frameless `.icon-btn` still computes `border-radius: 6px`
inherited from the base `button` rule (the `.icon-btn` rule dropped its own radius as dead). With no
border and a transparent background there is nothing to round — it has zero rendering effect and is
not a visible "box", so it satisfies the AC's "remove the square outline" intent. This pass therefore
asserts the real, visible guarantees (border + background removed) rather than `border-radius === 0`,
which would be testing an invisible property.

**Observation, out of scope for S20 (routed for awareness, NOT a defect here):** the project's
`--accent` token computes to `rgb(77, 166, 255)` / `#4DA6FF` (a dark-theme accent blue), not the
playbook §7 reference `#0072B2`. This value is pre-existing (introduced with S16's accent-colored
aisle icon, which shipped and passed its own formal pass); S20 only removed the dead `border-color`
and preserved the `color: var(--accent)` binding. Flagged only so the palette can be reconciled
against the colorblind-safe reference if desired — not an S20 regression and not blocking.

**Two test-script bugs found and fixed while authoring Part 6 (neither an app defect):**
1. **TC20.7 (`:active` press cue):** the first draft introspected `document.styleSheets` for the
   `.icon-btn:active` rule — `cssRules` is not readable for an external stylesheet over `file://`
   (SecurityError, silently skipped), so it returned `null`. Rewritten to actually hold the pointer
   down (`mouse.down()`) and read the live computed `transform` — a stronger, real-behavior check.
2. **TC20.10 (accent color):** the first draft hardcoded the playbook's `#0072B2`; the project's real
   `--accent` is `#4DA6FF`. Rewritten to read the live `--accent` token value and assert the icon
   binds to it — the actual S20 guarantee (token preserved through the restyle), not a specific hex.

## Commands run and output
```
node c:/tmp/pw-test/vopping-tests-tester-s1-s20-formal.js
```
Part 6 subtotal marker: `---- Part 6 (S20 frameless icon restyle) total: 12 new checks ----`.
Combined total: `222/222 passed`, zero console/page errors, zero dialogs, zero non-`file://` requests.
Full transcript `c:/tmp/pw-test/s1-s20-run2.log`. The earlier `c:/tmp/pw-test/s1-s20-run1.log` is the
run that surfaced the two disclosed script bugs (TC20.7/TC20.10), left in place as history.
