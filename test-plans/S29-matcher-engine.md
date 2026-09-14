# Test Plan — S29: item→aisle dictionary graduation + matcher engine (DOM-free)

**STATUS: DONE — formally executed 2026-09-14, PASS (345/345 combined suite; Part 18 = 26/26 S29 checks), 0 defects.**

**Story:** As the app owner, I want a pure, offline, DOM-free matcher that resolves an item name to its best aisle by a fixed first-hit-wins precedence over a bundled, hand-editable dictionary — resolving the ~68 cross-aisle collisions in the sensible direction and degrading gracefully on a bad hand-edit — so the on-demand auto-aisle triggers (S31/S32) can build on it.

**Acceptance criteria (verbatim, BACKLOG.md):** "**S29** — graduate `AISLE_DICTIONARY.draft.js` into the app (loaded via `<script>` before `script.js`) + build the matcher: two ordered maps (canonical, alias) + a WHOLE-TOKEN tier, first-hit-wins precedence resolving the ~68 cross-aisle collisions, fail-fast integrity asserts + a standing data-integrity test, a DOM-free test hook. Pure engine, no UI. Depends on S28." Plus the pre-Lock R16 fold: "the runtime dictionary-load path must degrade gracefully, never throw — a PO typo in the hand-edited file must not blank the offline page; hard fail-fast is test-only."

**Deliverable under test:** `aisle-dictionary.js` (graduated from the draft — `window.AISLE_DICTIONARY`, 18 keys / 17 real + empty `Other`, 1286 entries, store-walk order) loaded via `<script>` BEFORE `script.js` in `index.html`; `script.js`'s matcher block + the `window.__voppingAutoAisle` hook `{ matchAisle, buildLookup, validateDictionary, assertSeedDictParity, getLookup, STRIP_TOKENS, INTEGRITY_WHITELIST, SEED_VERSION }`. Pure engine, no UI. Working-tree build (uncommitted at pass time).

**Precedence (first-hit-wins):** tier 1 personal override (dictionary-independent) → tier 2 canonical-exact → tier 3 alias-exact → tier 4 whole-token (canonical beats alias, longest wins, leading quantity/unit + trailing descriptor tolerated) → tier 5 no-match (`aisle:''`). `matchAisle(name, opts?)` returns `{aisle, tier, matchedText}`; `opts` = `{ lookup, dictionary, overrides }` (all injectable for tests).

**Tooling:** Playwright (`channel:chrome`, headless, `file://`), DOM-free — every matcher assertion calls `window.__voppingAutoAisle` via `page.evaluate`. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 18). Dictionary facts (canonical vs alias, aisle homes, collisions) were verified against `aisle-dictionary.js` before asserting.

## Testability review summary (for scrum-master)
The exposed hook makes every clause DOM-free and deterministic. The "~68 collisions resolving canonical-first" is verified by concrete, documented representatives (broccoli, shrimp) plus the whole-token anti-example set and the drumstick alias-vs-alias tie, rather than by re-deriving the full 68 (the FIRM tier-order property is what matters, and it is asserted directly). R16 "never throw" is verified on the runtime path (`buildLookup`/`matchAisle`) while the HARD fail-fast is confirmed on `validateDictionary` (test-only). No unverifiable wording.

## Test cases (→ Part 18 checks S29.1–S29.26)
| ID | Covers | Expected |
|----|--------|----------|
| S29.1–S29.2 | tier 2 canonical-exact / tier 3 alias-exact | `apple`→{Produce,2}; `bananas`→{Produce,3} |
| S29.3–S29.4 | tier 4 whole-token (quantity strip / multi-word + trailing descriptor) | `2 lbs organic bananas`→{Produce,4,"bananas"}; `chicken breast (organic)`→{Meat,4,"chicken breast"} |
| S29.5–S29.6 | tier 5 no-match / empty | unknown→{'',5,''}; blank→{'',5} |
| S29.7–S29.8 | 68-collision resolving canonical-first (FIRM t2>t3) | `broccoli`→{Produce,2} (not Frozen); `shrimp`→{Seafood,2} (not Frozen) |
| S29.9 | alias-vs-alias tie, first-write-wins store-walk order | `drumstick`→{Meat,3} (alias in Meat AND Frozen; Meat earlier) |
| S29.10–S29.14 | whole-token anti-examples (substring never matches) | ham/hamburger; corn/popcorn; ice/rice; pepper/peppercorns; oat/goat |
| S29.15–S29.17 | tier-1 override precedence / empty-value-not-learned (Q2) / normalized key | override beats canonical; `""` value falls through; `"  APPLE "` w/ key `apple` → tier 1 |
| S29.18–S29.20 | data-integrity gate PASS (count 1286, 18 keys) + lemon "difficult" whitelist + HARD fail-fast | validateDictionary passes; `difficult`→{Produce,3}; throws on collision/within-dup/non-object |
| S29.21 | seed↔dict parity | `assertSeedDictParity` ok, onlyInStarters=[]/onlyInDict=[] |
| S29.22–S29.24 | R16 degrade seam (never throws / blanks) | empty/null dict → tier 5, empty maps; tier 1 still resolves with no dict; malformed dict skipped; `matchAisle(null|number|undefined)`→tier 5 |
| S29.25–S29.26 | perf proxy + tier short-circuit | buildLookup <25ms, 300 matches <50ms; exact inputs tier 2 (no token scan), substring input tier 4 |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S29.1–S29.26 | as above | as above (verbatim PASS lines in the transcript, incl. perf: buildLookup 2.0ms, 300 matches 0.1ms) | **PASS (26/26)** |

**Overall verdict:** PASS (26/26 S29-specific). Full regression baseline re-run clean: `vopping-tests-tester-s1-s27-formal.js` 345/345 (see REGRESSION_LOG.md 2026-09-14 S28+S29 row). Zero console/page errors, zero dialogs, zero non-`file://` requests. Scope note: this increment is desktop-verifiable (pure engine); NO NB-6 device signal is involved (the ⭍ glyph + ⌖-picker interaction arrive at S31/S32).

**Two test-authoring bugs found+fixed while writing this pass (NOT app defects — the app was correct both times):** S29.4 and S29.26 initially asserted `boneless chicken breast` as a tier-4 token match, but it is a real tier-3 EXACT ALIAS → Meat; re-pointed to `chicken breast (organic)` for a genuine tier-4. (A third fixture fix, matrix(b)'s "Deli"→"Garage", is in the S28 retrofit — Deli became a seeded starter.)

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s1-s29-run2.log` (Part 18 block). Each S29 PASS line prints the `{aisle,tier,matchedText}` (or gate/parity/degrade/perf result) it asserted.
