# Test Plan — S36: new "International" aisle (taxonomy 18→19 + v3 versioned re-seed migration + dictionary population)

**STATUS: DONE — formally executed 2026-09-16, PASS (441/441 combined suite; Part 23 = 15/15 S36 checks), 0 defects.**

**Story:** As a user, I want an International aisle — with my tortillas, kosher staples, and other international foods — added to my store layout, so that those items auto-group where I actually find them in the store.

**Acceptance criteria (verbatim, BACKLOG.md S36):** **(A) Taxonomy + migration** — add `International` to `AISLE_STARTER_LIST` at a sensible store-walk position (between `Condiments & Sauces` and `Snacks & Candy`); taxonomy 18 (17 real + `Other`) → 19 (18 real + `Other`). Bump `AISLE_SEED_VERSION` 2→3. Add a NEW once-only version-gated migration (mirroring `migrateAislesV2`) that UNIONS `International` into `state.aisles`: runs EXACTLY once per device; N13 no-resurrect; merge-not-duplicate (union by normalized key); never drops user aisles; never re-maps any `item.aisle` (pure additive union, NO rename/re-tag); R1-defensive. **DATA-SAFETY-CRITICAL fix (QA hazard focus):** pin each version step to its OWN literal target — V2 gated `>=2`/stamps `=2`, V3 gated `>=3`/stamps `=3` — run V2 then V3 after `loadState()`; `AISLE_SEED_VERSION` becomes only the highest/current marker (3). The locked guarantee: V2's union NEVER re-runs, no user-deleted v2 starter is ever resurrected, and V3 runs exactly once. **(B) Dictionary population** — add an `International` key: `tortilla`/`corn tortilla`/`flour tortilla` (+ aliases) MOVED OUT of Bakery (a canonical lives in exactly one aisle); `taco shells`, `tostadas`; kosher `matzah`/`matzo`, `gefilte fish`, `Manischewitz`; a modest international set. Naan/pita/flatbread STAY in Bakery. Well-placed items NOT aggressively re-homed. `validateDictionary()` passes after the move (no leftover duplicate `tortilla` canonical in Bakery). Depends on S28 + S29 (both Done); sequenced AFTER S35.

**Deliverable under test:** working-tree build (uncommitted at pass time — push HELD). `script.js`: `International` added to `AISLE_STARTER_LIST` at store-walk index 12; `AISLE_SEED_VERSION = 3`; `migrateAislesV2` re-pinned to the LITERAL gate `>= 2` / stamp `= 2`; a NEW `migrateAislesV3(st)` pinned to the LITERAL gate `>= 3` / stamp `= 3` (pure additive union of `AISLE_V3_NEW_STARTERS = ['International']`, no rename); `migrateAislesV3(state)` called right after `migrateAislesV2(state)` post-`loadState()`. `aisle-dictionary.js`: a new `International` key (between Condiments & Sauces and Snacks & Candy) with the tortilla move + kosher/taco/international set. `matchAisle`/`validateDictionary`/`assertSeedDictParity` themselves are unchanged (S29). STORAGE_KEY `vopping-list-state-v1`.

**Fixture contract:** raw persisted `state` objects written to `localStorage['vopping-list-state-v1']` pre-load; assertions read the re-serialized state after load (init runs `loadState → migrateAisles → migrateAislesV2 → migrateAislesV3 → saveState`). "Already migrated for step N" = `typeof st.seedVersion === 'number' && st.seedVersion >= N` (V2: N=2, V3: N=3). A FRESH state has no `seedVersion` (both steps run, stamping up to 3). The hook exposes `SEED_VERSION` (=3).

## Testability review summary (for scrum-master)
All migration clauses are concrete/observable via the persisted `state.aisles` / `state.items` / `state.seedVersion` after load — no subjective wording. The **position guarantee is per-fixture**: a FRESH install seeds `International` IN-SLOT (store-walk index 12, via `AISLE_STARTER_LIST`), whereas an EXISTING device (aisles already present) gets it APPENDED at the tail by the V3 union — the test asserts the correct one per fixture. The N13 hazard is pinned by a realistic deleted-`Deli`-on-a-v2-device fixture (the exact class the SM's hazard note called out). `assertSeedDictParity()` couples the starter-list and dict-key edits (both must add `International`, or parity fails). The tortilla move is proven by both the positive (`tortilla`→International) and the guard (`tortilla chips` still→Snacks & Candy — the move must not over-reach the substring). No unverifiable wording.

## Test cases (→ Part 23 checks S36.1–S36.15)
| ID | Covers | Fixture | Expected |
|----|--------|---------|----------|
| S36.1 | fresh install, in-slot | empty localStorage | "International" once at store-walk index 12 (between Condiments & Sauces and Snacks & Candy); seedVersion 3 |
| S36.2 | v2 device, additive tail union | `{seedVersion:2, 17-aisle set, items}` | "International" appended at tail once; all 17 prior aisles intact/in-order; NO item.aisle re-mapped; seedVersion 2→3 |
| S36.3 | **N13 no-resurrect (THE hazard)** | `{seedVersion:2, 17-aisle set MINUS 'Deli', items}` | "Deli" stays deleted (V2 never re-runs); "International" added once; Meat/Seafood intact; items untouched; seedVersion 3 |
| S36.4 | idempotency | reload after S36.3 | aisles+items byte-identical; seedVersion 3; "Deli" still absent |
| S36.5 | v3 no-resurrect of International itself | `{seedVersion:3, aisles WITHOUT International}` | "International" NOT re-added (V3 gate `>=3` closed) — the user delete sticks |
| S36.6 | merge-not-duplicate (normalized key) | `{seedVersion:2, aisles incl. lowercase 'international'}` | exactly one international-keyed aisle, user's lowercase display preserved, no capital-I duplicate; item untouched |
| S36.7 | pre-S28 device runs BOTH V2 and V3 | `{no seedVersion, old 'Dairy'/'Household'+items}` | Dairy→"Dairy & Eggs" + Household→"Household & Cleaning" renames + item re-tag + v2 union (Meat…) AND V3 "International"; seedVersion→3 (proves V2 stamps LITERAL 2, V3 not skipped) |
| S36.8–S36.10 | tortilla MOVED to International | matcher | tortilla / corn tortilla / flour tortilla (t2) + aliases "tortillas"/"wraps" (t3) → International, no longer Bakery |
| S36.11 | kosher staples | matcher | matzo (t2) / matzah (t3 alias) / gefilte fish (t2) / Manischewitz (t2, case-normalized) → International |
| S36.12 | mexican staples | matcher | taco shells / tostadas → International (t2) |
| S36.13 | **CRITICAL: compound beats bare** | matcher | sesame oil / rice vinegar / rice wine vinegar / plum wine vinegar / rice noodles → International at tier 2 (NOT Condiments via bare oil/vinegar, NOT Pasta via bare rice/noodles) |
| S36.14 | stays-put | matcher | naan/pita/flatbread→Bakery; tortilla chips→Snacks & Candy (move didn't over-reach); garam masala/curry powder→Baking & Spices |
| S36.15 | seed↔dict parity | assertSeedDictParity | ok; onlyInStarters=[] / onlyInDict=[] (18 starters ≡ 18 real dict keys incl. International) |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S36.1–S36.15 | as above | as above (verbatim PASS lines print the re-read `state.aisles`/`items`/`seedVersion` or the `{aisle,tier}` each asserted) | **PASS (15/15)** |

**Overall verdict:** PASS (15/15 S36-specific). Full regression baseline re-run clean: `vopping-tests-tester-s1-s27-formal.js` 441/441 (see REGRESSION_LOG.md's 2026-09-16 S35+S36 row). The S36 taxonomy retrofit of the S28/S29/S22-era baseline (fresh-seed option lists TC8.2/TC22.9, migration union TC22.1, S28.1/S28.5/S28.6/S28.9/S28.10, the S28.11 per-step-literal-gate rewrite, the S29.18 count 1286→1324/18→19 keys) was an in-place FAIL→PASS re-point with no count change. **This increment is DESKTOP-verifiable end to end — NO NB-6 device signal (the International aisle is a data string in a `<select>` option, not a glyph; same class as S28/S29).** Zero test-authoring bugs this pass. Zero console/page errors, zero dialogs, zero non-`file://` requests across both runs.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s35-s36-runA.log` (Part 23 block), reproduced `c:/tmp/pw-test/s35-s36-runB.log`. Each S36 migration PASS line prints its re-read `state.aisles`/`items`/`seedVersion`; each dictionary PASS line prints the `{aisle,tier,matchedText}` it asserted.
