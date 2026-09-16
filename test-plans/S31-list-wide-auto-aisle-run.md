# Test Plan — S31: list-wide "Auto-aisle" fill-empty-only run

**STATUS: Tester formal PASS 2026-09-15 (404/404 combined suite; Part 20 = 16/16 S31 checks), 0 defects — DESKTOP-verifiable AC fully green. Done-flip pending the PO's parallel on-device NB-6 confirm (the ⭍ glyph render).**

**Story:** As the app owner, I want one tap on a list-wide "Auto-aisle" button to fill in the aisle for every item I haven't aisled yet — using what the app knows (my learned picks + the dictionary), never disturbing an aisle I already set — with a clear summary of what happened and a single Undo for the whole run, so I can aisle a fresh list in one action.

**Acceptance criteria (verbatim, BACKLOG.md):** "**S31** — the list-wide "Auto-aisle" header button (in `.sort-controls` next to the sort select; ⭍/↯ + label; fill-empty-ONLY; locked toast summary; single-undo confirmed (Q1 = yes): one undoable action snapshotting `{id, prevAisle}` for the touched empty-only items). Depends on S29 + S30."

**Deliverable under test:** `script.js` `runAutoAisle()` + the `#auto-aisle-btn` click listener isolated in `.sort-controls` (NOT `.global-controls`, NOT a per-row/R14 surface); the `performUndo()` `'aisle-bulk'` branch; `index.html`'s `<button id="auto-aisle-btn">` (`⭍` in an `aria-hidden` span + the "Auto-aisle" text as the accessible name). Working-tree build, pushed sha `3ac58fb`.

**Locked behavior:** eligibility is the INTRINSIC empty aisle `''` only (M30 — a re-created assignable "Other" is a SET aisle and is left alone); a matched empty is assigned via a saveAisle-shape write (+ R15 `ensureAisleExists`) with NO override recorded (auto-writes never learn — S30); the whole run is ONE undoable `'aisle-bulk'` action snapshotting `{id, prevAisle}` for each TOUCHED (matched) item; `setLastAction` runs BEFORE `showToast` (the toast's Undo binds to the run) and clobbers the single S6 slot ONLY when n≥1 changed. Frozen toast strings (no trailing period; `showToast` appends ` — Undo` for the armed forms; `·` = U+00B7 one space each side; em-dash U+2014; "couldn't be matched" invariant, never pluralizes; "Sorted {n}" for all n≥1): n≥1&m=0 → `Sorted {n}`; n≥1&m≥1 → `Sorted {n} · {m} couldn't be matched`; n=0&m≥1 → `{m} couldn't be matched` (feedback-only, `withUndo=false`, toastAction null); eligible=0 → fully silent.

**Tooling:** Playwright (`channel:chrome`, headless, `file://`). Frozen toast strings asserted via code-point escapes (middot U+00B7, em-dash U+2014) so the glyphs are pinned unambiguously. Dictionary fixtures verified against `aisle-dictionary.js`: apple/banana→Produce (t2), milk→Dairy & Eggs (t2), goat/rice/"zzzqqq wubblefloop"→tier 5. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 20).

## Testability review summary (for scrum-master)
Every clause is deterministic. The three toast forms are asserted by exact string (code-point-pinned), and the single-undo/slot semantics are exercised through the real header `#undo-btn` and the real toast `[data-role=toast-undo]` — including the two behaviors a naive test would miss: (a) the bulk action DISPLACES (not stacks on) the single S6 slot, and (b) a stale bulk-toast Undo after a newer action is dismiss-only. The ⭍ glyph RENDER is the sole NB-6 device signal — asserted here only structurally (the button exists, is clickable, fits `.sort-controls` 320-390px); its on-device visual is the PO's parallel confirm.

## Test cases (→ Part 20 checks S31.1–S31.16)
| ID | Covers | Expected |
|----|--------|----------|
| S31.1–S31.3 | fill-empty-ONLY | set aisle untouched; matched empty assigned; no-match empty stays `''` |
| S31.4 | EXACT mixed toast (armed) | `Sorted 1 · 1 couldn't be matched — Undo` |
| S31.5–S31.6 | all-matched | all assigned; EXACT `Sorted 3 — Undo` |
| S31.7–S31.8 | none-matched feedback toast | EXACT `2 couldn't be matched`; NO `[data-role=toast-undo]` button |
| S31.9 | n=0 does not clobber the S6 slot | a prior delete stays undoable via `#undo-btn` |
| S31.10–S31.11 | bulk single-undo (header + toast) | ONE Undo restores all touched items to `''`; toast armed (setLastAction before showToast) |
| S31.12 | bulk DISPLACES the S6 slot | delete→auto→Undo reverses the bulk, the delete stays |
| S31.13 | zero-eligible = silent no-op | no toast, no aisle change, slot untouched |
| S31.14 | stale bulk-toast = dismiss-only | newer action → stale toast Undo only dismisses, aisles unchanged |
| S31.15 | run records NO override | matched item assigned, tier 1 stays clean |
| S31.16 | M29 overflow | `.sort-controls` + ⭍ button no overflow 320/360/375/390px |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S31.1–S31.16 | as above | as above (verbatim PASS lines in the transcript; e.g. S31.4 `got="Sorted 1 · 1 couldn't be matched — Undo"`, S31.7 `got="2 couldn't be matched"`) | **PASS (16/16)** |

**Overall verdict:** PASS (16/16 S31-specific). Full regression re-run clean: `vopping-tests-tester-s1-s27-formal.js` 404/404 (see REGRESSION_LOG.md 2026-09-15 S31+S32 row). Zero console/page errors, zero dialogs, zero non-`file://` requests. **Scope note (NB-6):** the ⭍ glyph render is a real-device signal, asserted here only structurally — the on-device confirm is the PO's, running in parallel; the Done-flip waits on it.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s1-s32-run1.log` (Part 20 block).
