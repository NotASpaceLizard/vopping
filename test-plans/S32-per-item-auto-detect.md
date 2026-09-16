# Test Plan — S32: per-item "Auto-detect" option in the aisle `<select>`

**STATUS: Tester formal PASS 2026-09-15 (404/404 combined suite; Part 21 = 9/9 S32 checks), 0 defects — DESKTOP-verifiable AC fully green. Done-flip pending the PO's parallel on-device NB-6 confirm (the ⭍ option glyph + the on-device ⌖-picker interaction).**

**Story:** As the app owner, when I open an item's aisle picker I want an "Auto-detect" choice at the top that guesses this one item's aisle for me — filling it in (or correcting it) on the spot — without it becoming a learned preference, and without ever wiping an aisle it can't improve.

**Acceptance criteria (verbatim, BACKLOG.md):** "**S32** — the per-item "⭍ Auto-detect" option inside the ⌖ aisle `<select>` (structural reserved-value detection à la S24's sentinel; rides the existing R14-safe change→`saveAisle`→`render()` path; MAY overwrite but never records a learning override; NB-6 device gate on the option glyph). Depends on S29 + S30."

**Deliverable under test:** `script.js` — the `AUTODETECT_VALUE`/`AUTODETECT_LABEL`/`AUTODETECT_ICON_GLYPH` constants; the `<option value="__VOPPING_AUTODETECT__" data-autodetect="1">` rendered as the TOP option (index 0, above no-aisle, sentinel still LAST); the delegated `change` handler's `isAutodetect` branch (structural `data-autodetect` detection, never by label/value string); the tier-5 NO-MATCH GUARD; N12 in `validateAisleName` reserving the "Auto-detect" name. Working-tree build, pushed sha `3ac58fb`.

**Locked behavior:** Auto-detect is detected STRUCTURALLY (`data-autodetect="1"`), never by its label/value — and it is NEVER `selected` (the item's real aisle option carries selection). Selecting it runs `matchAisle(item.name)`: an ACTUAL match (tiers 1-4, non-empty aisle) is written through the SAME `saveAisle(id, aisle, {viaAuto:true})` → `render()` path — MAY overwrite an existing aisle (explicit per-item request) but records NO learning override; a tier-5 NO-MATCH writes NOTHING (it must not clear an aisle it couldn't improve) and `render()` alone resets the transient Auto-detect selection back to the current aisle. No new render/commit seam (rides S24/R14; the round-4 focus-restore skip + the R14 deferred-focusout guard both key on `data-role="aisle-select"`, unchanged). Non-undoable (PO Q1 / N17). N12: a user aisle name that normalizes to "Auto-detect" is rejected as reserved (belt-and-suspenders — detection is structural anyway; the label carries a glyph so a plain "Auto-detect" also fails normalize-match).

**Tooling:** Playwright (`channel:chrome`, headless, `file://`). The `aisleSelectInfo` helper was extended to capture `data-autodetect`; the retrofit of the 4 stale option-order assertions (TC8.2/TC8.2b/TC22.9/TC23.3b — 19→20 options, no-aisle now index 1) is logged in REGRESSION_LOG.md. Selecting Auto-detect is driven via the real delegated `change` path (raw-dispatch, same as a hand pick). Dictionary fixtures: apple→Produce (match), goat→tier 5 (no match). Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 21).

## Testability review summary (for scrum-master)
Deterministic via the real change path + `getOverrides`/`rawStorage`/`aisleSelectInfo`. The two subtle guarantees are asserted directly: (1) the overwrite path is proven with a DIFFERING pre-set aisle established via the `viaAuto` seam (so no override pre-exists to mask the matcher's own result), and (2) the NO-MATCH GUARD is proven by a tier-5 item keeping its existing aisle AND the picker resetting to it (not stuck on the transient option). The ⭍ option glyph render + the on-device native-picker interaction are the NB-6 signals — asserted here only structurally (`data-autodetect`, selected-value reset); the on-device confirm is the PO's, running in parallel.

## Test cases (→ Part 21 checks S32.1–S32.9)
| ID | Covers | Expected |
|----|--------|----------|
| S32.1 | structural top option | option[0] `data-autodetect="1"`, value `__VOPPING_AUTODETECT__`, label carries ⭍, NEVER selected |
| S32.2–S32.3 | select → matcher + `viaAuto`, no learning | apple → Produce set; no `apple` override |
| S32.4–S32.5 | MAY overwrite on a match | pre-set "Bakery" (no override) → Auto-detect overwrites to "Produce"; still no override |
| S32.6–S32.7 | NO-MATCH GUARD | tier-5 goat keeps "Bakery" (writes nothing, no override); picker resets to "Bakery", not stuck on Auto-detect |
| S32.8 | N12 reserved name | creating an aisle named "Auto-detect" is rejected inline, not added |
| S32.9 | R14-safe, no new seam | Auto-detect on row A commits its match AND flushes an open note draft on row B; both selects survive; zero errors |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S32.1–S32.9 | as above | as above (verbatim PASS lines in the transcript; e.g. S32.6 goat stays "Bakery" + no override, S32.7 select value resets to "Bakery") | **PASS (9/9)** |

**Overall verdict:** PASS (9/9 S32-specific). Full regression re-run clean: `vopping-tests-tester-s1-s27-formal.js` 404/404 (see REGRESSION_LOG.md 2026-09-15 S31+S32 row) — including the 4 in-place option-order retrofits (stale-BY-DESIGN, not defects). Zero console/page errors, zero dialogs, zero non-`file://` requests. **Scope note (NB-6):** the ⭍ option glyph render + the on-device ⌖-picker interaction are real-device signals, asserted here only via desktop structural proxies — the on-device confirm is the PO's, running in parallel; the Done-flip waits on it.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s1-s32-run1.log` (Part 21 block).
