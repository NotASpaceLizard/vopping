# Test Plan — S28: versioned one-time aisle re-seed migration (18-aisle Auto-Aisle taxonomy)

**STATUS: DONE — formally executed 2026-09-14, PASS (345/345 combined suite; Part 17 = 11/11 S28 checks), 0 defects.**

**Story:** As the app owner, I want the seeded aisle taxonomy expanded to the Auto-Aisle spec's 18 aisles (17 real + `Other`) on existing devices as well as fresh installs — without losing user-created/renamed aisles, resurrecting deleted starters, or re-mapping item aisles — so the matcher's outputs always resolve to a seeded `<select>` option.

**Acceptance criteria (verbatim, BACKLOG.md):** "**S28** — expand the seeded taxonomy to the spec's 18 aisles (17 real + `Other`) via a VERSIONED one-time re-seed that unions the new starters into the already-seeded state (editing `AISLE_STARTER_LIST` alone is a SILENT no-op — `migrateAisles()` short-circuits on an existing `state.aisles`), without resurrecting user-deleted starters or re-mapping any `item.aisle`; seeded starter names byte-identical (after `normalize()`) to the dictionary keys. Old↔new name drift resolved (Q3 = rename-migration): `Dairy`→`Dairy & Eggs` and `Household`→`Household & Cleaning` rename + one-time re-tag of their items; `Meat/Seafood` kept as a custom aisle with `Meat`+`Seafood` added as new starters. Foundation of the feature."

**Deliverable under test:** `index.html`/`script.js`/`aisle-dictionary.js`, opened via `file://`. Implemented — working-tree build (uncommitted at pass time): `script.js` adds `AISLE_SEED_VERSION=2`, the expanded 18-entry `AISLE_STARTER_LIST` (store-walk order), `migrateAislesV2()` (a post-`loadState()` step self-gated on `state.seedVersion`), `AISLE_V2_NEW_STARTERS`, `AISLE_V2_RENAMES`, and `reseedRenameAisle()`. The legacy `migrateAisles()` (S22) is unchanged — its `Array.isArray(state.aisles)` short-circuit is exactly why the versioned V2 step is separate.

**Tooling:** Playwright (`channel:chrome`, headless, `file://`). Migration verified end-to-end: a raw persisted state is written to `localStorage['vopping-list-state-v1']`, the page is loaded (init runs `loadState → migrateAisles → migrateAislesV2 → saveState`), and the re-read persisted state is asserted. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 17). Storage key confirmed `vopping-list-state-v1`; current `SEED_VERSION=2`.

## Testability review summary (for scrum-master)
All AC clauses are concrete/observable via the persisted `state.aisles` / `state.items` / `state.seedVersion` after load — no subjective wording. "Behind/at-current version" is decided by `typeof seedVersion==='number' && seedVersion>=2`; "runs exactly once" is a byte-identical reload no-op plus a gate-closed fixture. No AC item was unverifiable as written.

## Test cases
| ID | Covers AC | Fixture | Expected |
|----|-----------|---------|----------|
| S28.1 | 17-real store-walk seed + version stamp | fresh (empty localStorage) | `state.aisles` = 17 real starters (Other excluded) in store-walk order; `seedVersion=2` (== hook `SEED_VERSION`) |
| S28.2 | rename Dairy→"Dairy & Eggs" + item re-tag (incl. lowercase variant, NB-2) | pre-S28 device, items `Dairy`/`dairy` | no `dairy`-key aisle remains; `Dairy & Eggs` present; both items → `Dairy & Eggs` |
| S28.3 | rename Household→"Household & Cleaning" + item re-tag | pre-S28 device, item `Household` | no `household`-key aisle; `Household & Cleaning` present; item re-tagged |
| S28.4 | Meat/Seafood kept custom + Meat/Seafood added fresh | pre-S28 device, custom `Meat/Seafood` | `Meat/Seafood` survives (item unchanged); `Meat` AND `Seafood` added as new starters |
| S28.5 | M27 rename-in-place + append order | (same pre-S28 device) | `aisles[1]="Dairy & Eggs"`, `aisles[7]="Household & Cleaning"`; the 10 new starters appended at the tail (not pure store-walk) |
| S28.6 | no item re-map except renames + version stamp | (same pre-S28 device) | carry-over items untouched (`Produce`/`''`); `seedVersion=2` |
| S28.7 | MERGE-not-duplicate when target pre-exists | pre-S28 device with both `Dairy` AND `Dairy & Eggs` | exactly one `Dairy & Eggs` (source merged, entry dropped); both items → `Dairy & Eggs` |
| S28.8 | N13 no-resurrect (deleted rename source) | pre-S28 device, `Dairy`/`Household` deleted | neither `Dairy & Eggs` nor `Household & Cleaning` created |
| S28.9 | N13 no-resurrect (deleted carry-over starters) | (same) | `Beverages`/`Frozen`/`Pantry` NOT re-added; genuinely-new starters ARE added |
| S28.10 | idempotency — runs exactly once | reload after migration | `state.aisles`/`items` byte-identical; `seedVersion` stays 2 |
| S28.11 | seedVersion gate is a hard one-time gate | state already at `seedVersion:2` missing new starters + old `Dairy` | NOT re-migrated: old `Dairy` un-renamed, no new starters unioned, `seedVersion` stays 2 |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S28.1–S28.11 | as above | as above (verbatim PASS lines in the transcript) | **PASS (11/11)** |

**Overall verdict:** PASS (11/11 S28-specific). Full regression baseline re-run clean: `vopping-tests-tester-s1-s27-formal.js` 345/345 (308 retrofitted S1-S27 baseline + 37 new S28/S29). The S28 taxonomy retrofit of the S1-S27 baseline (fresh-seed option lists, migration expectations, collision fixtures, `Dairy`→`Dairy & Eggs`) was an in-place FAIL→PASS re-point with no count change — see REGRESSION_LOG.md's 2026-09-14 S28+S29 row. Zero console/page errors, zero dialogs, zero non-`file://` requests.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s1-s29-run2.log` (Part 17 block). All 11 S28 PASS lines print their re-read `state.aisles`/`items`/`seedVersion` in the detail column.
