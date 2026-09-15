# Test Plan — S30: personal override map / learning (matcher tier 1)

**STATUS: DONE — formally executed 2026-09-15, PASS (379/379 combined suite; Part 19 = 34/34 S30 checks), 0 defects.**

**Story:** As the app owner, I want the app to LEARN from my hand aisle picks — recording each non-empty hand pick as a personal override that the matcher then honors ahead of the bundled dictionary — persisted offline, cascading with my aisle renames/deletes, so a wrong dictionary guess is never repeated once I have corrected it, and a later on-demand auto-run (S31/S32) fills empties from what I have taught it.

**Acceptance criteria (verbatim, BACKLOG.md):** "**S30** — a persisted personal-override map (its own localStorage key, defensive parse) recorded ONLY on hand picks; adds matcher tier 1; S23 rename/delete cascades into it; matcher-assigned aisles get added to `state.aisles`. Clear-to-no-aisle is NOT learned (Q2 = no); non-empty hand picks only. Depends on S29."

**PO decision resolved for this pass (2026-09-15, relayed by Orchestrator):** the open clear-override question — should a hand clear-to-no-aisle of an item that had a prior learned override FORGET that override — is answered **KEEP**: a hand clear leaves any prior learned override intact (a later fill-empty auto-run re-fills via tier 1). Build is FINAL as-is, no Dev tweak. (This is distinct from Q2, which governs whether a clear *records a new* override — it does not.)

**Deliverable under test:** `script.js` (working-tree build, uncommitted at pass time) — `OVERRIDES_KEY = 'vopping-overrides-v1'`; `loadOverrides`/`saveOverrides`/`parseOverrideState` (R1-posture defensive parse); `recordOverride` (non-empty only, Q2); `matchAisle` tier-1 defaulting to the persisted module `overrides` map (injectable `opts.overrides` for tests); `saveAisle`'s single-choke-point record-on-hand-pick with `{viaAuto:true}` suppression; `renameAisleByKey`/`deleteAisleByKey` override cascades (M28: rename updates the target, delete DROPS — never blanks); `ensureAisleExists` (R15). Test hooks added to `window.__voppingAutoAisle`: `getOverrides()` (snapshot) and `setItemAisle(id, aisle, viaAuto)` (the S31/S32 auto-write seam). No new UI (the ⭍/⌖ affordances are S31/S32).

**Precedence reminder (S29):** tier 1 personal override (dictionary-independent) → tier 2 canonical-exact → tier 3 alias-exact → tier 4 whole-token → tier 5 no-match. S30 populates tier 1 from real hand picks.

**Tooling:** Playwright (`channel:chrome`, headless, `file://`). Real DOM drives every learning path — hand picks and clears via the delegated `change` handler (raw-dispatch `focus`+set-value+`change`, faithful to the event the handler receives and never a no-op-skip like `selectOption` on an unchanged value), the sentinel `__VOPPING_ADD_NEW_AISLE__` new-aisle create flow, and the Settings rename/delete buttons; override state is read back via `window.__voppingAutoAisle.getOverrides()` and directly from the `vopping-overrides-v1` localStorage key. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 19). Dictionary fixtures (milk/eggs/yogurt→Dairy & Eggs tier 2, banana→Produce tier 2, "protein powder"→tier 5) were verified against `aisle-dictionary.js` before asserting.

## Testability review summary (for scrum-master)
Every clause is deterministic via the exposed hook + real DOM. The Q2/clear semantics are asserted by KEY PRESENCE/ABSENCE, not the weaker `value !== ''` the Developer's self-check (`vop-s30-verify.js`) used — the clear-KEEP decision and the delete-DROP invariant are exactly the cases a `!== ''` check cannot distinguish (a kept key and an absent key both satisfy `!== ''`). "Recorded only on hand picks" is proven by contrasting the real `change` path against the `setItemAisle(viaAuto=true)` auto-write seam. Cascades are exercised through the actual Settings rename/delete UI, not by poking the map. No unverifiable wording.

## Test cases (→ Part 19 checks S30.1–S30.34)
| ID | Covers | Expected |
|----|--------|----------|
| S30.1–S30.4 | learn on hand pick + persist + survive reload + tier 1 | milk→"Dairy & Eggs" recorded, written to `vopping-overrides-v1`, survives reload, `matchAisle("Milk")` now tier 1 |
| S30.5–S30.6 | tier 1 BEATS the dictionary (divergent aisle) | banana baseline {Produce,2}; after hand pick "Snacks & Candy" → {Snacks & Candy, tier 1} |
| S30.7–S30.9 | learn ONLY on a hand pick | `setItemAisle(id,"Bakery",viaAuto=true)` sets aisle but records nothing; a later hand pick DOES learn |
| S30.10–S30.15 | **PO clear-decision KEEP (Q2)** | learned eggs→"Dairy & Eggs"; hand clear sets item `''` yet KEEPS the override (key present, still tier 1 for re-fill); a never-learned item's clear records nothing (no `''`-override) |
| S30.16–S30.21 | custom-aisle create learns + R15 | "protein powder" tier 5 → create "Supplements" learns + tier 1 + added to `state.aisles`; R15 auto-assign of an absent "Ghost Aisle" adds it to `state.aisles` without learning |
| S30.22–S30.27 | R1 defensive-parse corruption battery | not-JSON / array / null / number → EMPTY map, no crash, no new console errors; MIXED object drops non-string value + `''` value + `''` key, keeps valid string→string pairs |
| S30.28–S30.30 | S23 RENAME cascade | rename "Dairy & Eggs"→"Chilled" updates override TARGET (yogurt→"Chilled") + item retag (NB-2) + persists |
| S30.31–S30.34 | S23 DELETE cascade (M28) + dictionary fallback | delete "Chilled" DROPS the override (never blanks to `''`); `matchAisle("yogurt")` falls back to the static dictionary → {Dairy & Eggs, 2}; persisted |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S30.1–S30.34 | as above | as above (verbatim PASS lines in the transcript; key evidence: S30.12 `{"eggs":"Dairy & Eggs"}` present after clear + S30.14 tier 1; S30.31 `{}` after delete + S30.33 {Dairy & Eggs,2} dictionary fallback; S30.27 selective drop → `{"good":"Bakery","ok2":"Produce"}`) | **PASS (34/34)** |

**Overall verdict:** PASS (34/34 S30-specific). Full regression baseline re-run clean: `vopping-tests-tester-s1-s27-formal.js` 379/379 (see REGRESSION_LOG.md 2026-09-15 S30 row; 345 S1-S29 baseline all re-confirmed, zero regressions — S30 is a purely additive learning layer, no mechanism retired). Zero console/page errors, zero dialogs, zero non-`file://` requests. Scope note: S30 is desktop-verifiable (persistence + matcher tier + cascade logic); it carries NO NB-6 device signal — the ⭍ list-run button + the ⌖ per-item Auto-detect option arrive at S31/S32.

**Zero test-authoring bugs this pass** — the exact-value fixtures were verified against `aisle-dictionary.js` before asserting, and the clear/delete assertions were written as key-presence checks specifically to avoid the `!== ''` weakness flagged in the Developer's self-check.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s1-s30-run1.log` (Part 19 block). Each S30 PASS line prints the override-map snapshot / stored-localStorage value / `{aisle,tier,matchedText}` it asserted. Developer self-check `c:\tmp\pw-test\vop-s30-verify.js` (8 scenarios) is superseded by this independent Part-19 pass as the citation of record per the playbook.
