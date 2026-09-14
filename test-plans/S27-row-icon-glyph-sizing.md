# Test Plan — S27: equalize row-icon glyph rendered heights up to the note glyph (per-glyph sizing)

**STATUS: DONE — formally executed 2026-09-11, RE-VERIFIED against the FINAL build 2026-09-14, PASS
(7/7 S27-specific G1–G4; 308/308 full suite), 0 defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 13, plus the TC20.5 retrofit in Part 6).
Full transcript: `c:\tmp\pw-test\s1-s27-run2-afcd725.log` (supersedes the 294/294 `s1-s27-run1.log`).
Independent Tester combined S26+S27 formal pass, originally against sha `7f6a327` and RE-CONFIRMED
clean against the FINAL build sha `afcd725` — S27's own code is byte-unchanged from 7f6a327; the +14
checks to the 308 total are purely ADDITIVE coverage for the post-7f6a327 undo-toast (Part 15) + iOS
aisle-picker round-3/round-4 (Part 16) fixes, none of which touch S27's per-glyph sizing.

**Story:** As a user, I want all the per-row icons made a bit bigger — matching the note icon's size,
which already looks right — so every row control is comfortably tappable and visually consistent.

**Acceptance criteria (from the LOCKED BACKLOG.md S27 row):** every row icon already renders at the
identical `.icon-btn` box size (~19.5px); the note glyph (U+1F5CB) only LOOKS bigger due to
heavier/fuller glyph metrics, so a uniform font-size bump is a NO-OP. "Match the note icon" therefore
means PER-GLYPH font-size tuning of the OTHER glyphs (edit ✎, Up ▲, Down ▼, delete ✕, and S26's aisle
glyph) to equalize their RENDERED height toward the note glyph's, GLYPH-ONLY within the fixed ~19.5px
`.icon-btn` boxes (box-enlargement is the overflow risk to avoid). Desktop pass/fail pinned to
**G1–G4**; rendered-glyph-HEIGHT parity is LOOSE corroboration only, never the gate (U+1F5CB is
device-unstable — the S7 caveat), so the on-device visual "match" is the NB-6 real-device signal.
QA folds: **M26** (S26's aisle glyph is NOT an `.icon-btn` — it is the `.aisle-glyph` overlay span, so
its sizing is scoped to that overlay, not the icon-btn box), **N16** (retain a base `.icon-btn`
font-size fallback when per-glyph rules are added).

**G1–G4 (the desktop gate):** **G1** — the tuned `.icon-btn` boxes stay ~19.5px in BOTH width and
height (±0.5px); glyph-only, no box resize (the load-bearing overflow-safety constraint; scope = the 4
real tuned `.icon-btn`s, not the aisle overlay). **G2** — per-glyph tuning is applied: the non-note
glyph font-sizes are NO LONGER all equal to the pre-S27 uniform 1.15rem (Up/Down may legitimately
share a size). **G3** — each tuned non-note glyph's computed font-size ≥ the 1.15rem baseline
(enlargement UP, never down). **G4** — no row-height growth, no data-model/undo interaction.

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, FINAL build sha `afcd725` (S27's own code byte-unchanged from `7f6a327`).

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Prior testability-check landed at Lock (TESTABLE, zero blocking; G1–G4 folded in). NB-6: the on-device
visual match to the note glyph is a REAL-DEVICE signal, NOT asserted in Chromium (a tight
height-parity gate would both false-fail a correctly phone-tuned build and false-pass a wrong one, per
the U+1F5CB device-instability finding). S27's tuning is GLYPH-AGNOSTIC — it tunes whatever glyph S26
shipped (U+2316 ⌖) to the note height, so its coverage does not depend on the glyph pick.

## Test cases (Part 13)
| ID | Covers AC | Expected |
|----|-----------|----------|
| S27 G1 | box unchanged | the 4 tuned `.icon-btn`s (edit/up/down/delete) keep ~19.5px in BOTH width & height (±0.5) |
| S27 G2 | per-glyph applied | the non-note glyph font-sizes are NO LONGER all equal to 1.15rem/18.4px |
| S27 G3 | enlarge up | each tuned non-note glyph font-size ≥ the 1.15rem/18.4px baseline |
| S27 G4 | no growth | a plain row with the enlarged glyphs is still single-line (~36px); pure CSS, no data-model interaction |
| S27.5 | shipped values | note-toggle stays 1.15rem/18.4px (reference, NOT overridden); edit+delete 1.35rem/21.6px; up+down SHARE 1.28rem/20.48px |
| S27.6 | M26 aisle overlay | the S26 aisle glyph is tuned via the `.aisle-glyph` OVERLAY span's own font-size (1.35rem/21.6px), NOT an `.icon-btn` box |
| S27.7 | N16 base fallback | the base `.icon-btn` 1.15rem fallback is retained — note-toggle (no per-glyph override) renders at the 18.4px base |

**Retrofit supporting S27:** TC20.5 (S20's "glyph ~1.15rem/18.4px" is superseded by S27's per-glyph
tuning — the delete glyph is now 1.35rem/21.6px, still ≥ the S20 baseline; assertion relaxed to
`≥18px`).

## Results
**7/7 PASS (Part 13), 0 defects.** Measured computed font-sizes: note-toggle **18.4px** (1.15rem,
reference, not overridden), edit **21.6px** (1.35rem), Up **20.48px** and Down **20.48px** (shared
1.28rem), delete **21.6px** (1.35rem), aisle overlay glyph **21.6px** (1.35rem on `.aisle-glyph`, per
M26). G1: all four tuned `.icon-btn`s measured 19.5×19.5px (±0.5). G2: the non-note set {21.6, 20.48,
20.48, 21.6} is not all-equal-to-18.4 → per-glyph tuning confirmed. G3: every tuned value ≥ 18.4px. G4:
a plain row stayed 36.17px single-line (no growth), pure CSS (no undo/data-model surface). N16: the
base 1.15rem fallback survives — note-toggle carries no override and renders at the 18.4px base.

**Overflow (shared with S26):** the combined M24/R7 re-check
(`vopping-worst-case-row-s26-s27-closure.js`, 9/9 PASS) confirms S27's fixed-box constraint holds — no
horizontal overflow at 320/360/375/390px, row height 36.17px unchanged. S27's glyph-only enlargement
cannot worsen horizontal fit.

**Overall verdict: PASS (7/7 S27-specific G1–G4; 308/308 full suite), 0 defects.** See
`REGRESSION_LOG.md` 2026-09-14 row (308 total — the current canonical figure), script
`vopping-tests-tester-s1-s27-formal.js`.

**FINAL-build re-verification (afcd725), 2026-09-14:** the full S1-S27 suite was extended in place
(Parts 15 undo-toast + 16 round-3/round-4) and re-run against `afcd725` → **308/308 PASS, 0 defects,
zero console/page errors**. S27's own Part 13 (G1-G4 + S27.5-S27.7) and the TC20.5 retrofit in Part 6
re-confirmed clean and byte-unchanged: measured font-sizes note-toggle 18.4px (reference), edit/delete
21.6px, up/down 20.48px (shared), aisle overlay glyph 21.6px; all 4 tuned `.icon-btn`s held 19.5×19.5px;
no row growth. No S27 defect, reopen, or regression.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` → `c:\tmp\pw-test\s1-s27-run2-afcd725.log`
(Part 13; supersedes the 294/294 `s1-s27-run1.log`). Zero console/page errors, zero dialogs, zero
non-`file://` network requests.
