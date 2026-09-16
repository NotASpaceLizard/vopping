# Test Plan — S35: dictionary correctness fix pass (data-only)

**STATUS: DONE — formally executed 2026-09-16, PASS (441/441 combined suite; Part 22 = 22/22 S35 checks), 0 defects.**

**Story:** As a user, I want common staples I type by their bare name (cheese, rice, chicken, beef, fish…) to auto-assign to the right aisle, so that the Auto-aisle run and per-item Auto-detect stop dropping them into no-aisle.

**Acceptance criteria (verbatim, BACKLOG.md S35):** add the MISSING bare head-word staples as canonical dictionary entries so a bare item name resolves via the S29 matcher's tier-2 (canonical-exact) path — `cheese`→Dairy & Eggs; `rice`/`pasta`/`noodles`→Pasta, Rice & Grains; `beef`/`steak`/`sausage`→Meat; `fish`→Seafood; `vinegar`→Condiments & Sauces; `batteries`/`battery`→Household & Cleaning; and lower-frequency `pork`→Meat, `oil`→Condiments & Sauces, `cream`→Dairy & Eggs, `juice`→Beverages, `vitamins`→Personal Care & Health. RE-HOME `chicken` to **Meat** by adding a NEW `chicken` CANONICAL in Meat so bare "chicken" resolves to Meat via **canonical-beats-alias** (tier-2 canonical wins over the surviving Canned & Jarred tier-3 `chicken` alias), leaving `canned chicken` (+ its `chicken` alias) in Canned & Jarred untouched. Leave the deliberate judgment-calls (peas, tuna, colby / condensed-milk / broth-stock) untouched. File hygiene: readable/hand-editable, no duplicate canonicals, no new cross-aisle canonical collision. No migration, no localStorage, no UI. Depends on S29 (Done).

**Deliverable under test:** `aisle-dictionary.js` (working-tree build, uncommitted at pass time — push HELD): S35 added the bare head-word canonicals in the named aisles and a NEW `chicken` canonical in Meat (Meat line ~776), leaving `canned chicken` + its `chicken` alias in Canned & Jarred (~4556). `script.js` / the matcher / the UI are UNCHANGED by S35. Verified via the S29 DOM-free hook `window.__voppingAutoAisle`.

**Tooling:** Playwright (`channel:chrome`, headless, `file://`), DOM-free — every matcher assertion calls `window.__voppingAutoAisle.matchAisle` / `.validateDictionary` via `page.evaluate`. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 22). Dictionary facts (aisle homes, canonical-vs-alias for `battery`/`chicken`, the current homes of `olive oil`/`vegetable oil`/`tuna steak`/`chicken broth`/`fish sticks`/`canola oil`) were verified against `aisle-dictionary.js` (working tree) before asserting.

## Testability review summary (for scrum-master)
Every clause is DOM-free and deterministic via the S29 hook. Each new head-word was net-new (verified: none existed as a standalone canonical or alias pre-S35), so the before-state was tier-5 and the after-state is an unambiguous tier-2 — a clean before/after with no collision risk against existing canonicals. The `chicken` re-home asserts **tier 2 specifically** (proving canonical-beats-alias, not incidental). Plural forms (`batteries`) assert on AISLE only (tier depends on the dev's canonical/alias choice — here `battery` canonical + `batteries` alias). The regression clause is verified on the SPECIFIED multi-word entries (immune, since tier 2/3 exact fires before the new bare tier-4 tokens) PLUS three high-risk generic-token compounds (`tuna steak`/`chicken broth`/`fish sticks`) to prove a longer exact canonical beats the new bare head-word. No unverifiable wording.

## Test cases (→ Part 22 checks S35.1–S35.22)
| ID | Covers | Expected |
|----|--------|----------|
| S35.1–S35.9 | new bare canonicals (tier 2) | cheese→Dairy & Eggs; rice/pasta/noodles→Pasta, Rice & Grains; beef/steak/sausage→Meat; fish→Seafood; vinegar→Condiments & Sauces (all tier 2) |
| S35.10 | battery canonical + batteries alias | battery→Household & Cleaning (t2); "batteries"→Household & Cleaning (t3 alias) |
| S35.11–S35.15 | lower-freq bare canonicals (tier 2) | pork→Meat; oil→Condiments & Sauces; cream→Dairy & Eggs; juice→Beverages; vitamins→Personal Care & Health |
| S35.16 | RE-HOME chicken (canonical-beats-alias) | bare "chicken"→Meat at **tier 2** (ahead of the surviving Canned & Jarred tier-3 alias) |
| S35.17 | canned chicken untouched | "canned chicken"→Canned & Jarred at tier 2 (its own canonical) |
| S35.18 | regression: multi-word EXACT unbroken | chicken breast/ground beef→Meat, olive oil/vegetable oil→Condiments & Sauces, heavy cream→Dairy & Eggs (all t2); "canned chicken breast"→Canned & Jarred (t3) |
| S35.19 | compound-beats-bare | tuna steak→Seafood, chicken broth→Canned & Jarred, fish sticks→Frozen (all t2 — a longer exact canonical wins over the new bare head-word) |
| S35.20 | new bare head-words EXTEND tier-4 coverage | canola oil→Condiments & Sauces; chicken parmesan→Meat (tier-4 via the new "chicken" token — improved coverage, Meat not Canned) |
| S35.21 | validateDictionary CLEAN | count 1324 across 19 aisle keys, no throw |
| S35.22 | integrity gate still HARD fail-fast | throws on a canonical-vs-canonical collision (incl. one on the new International key) |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S35.1–S35.22 | as above | as above (verbatim PASS lines with the `{aisle,tier,matchedText}` each asserted, in the transcript) | **PASS (22/22)** |

**Overall verdict:** PASS (22/22 S35-specific). Full regression baseline re-run clean: `vopping-tests-tester-s1-s27-formal.js` 441/441 (see REGRESSION_LOG.md's 2026-09-16 S35+S36 row). Notable actuals: bare `chicken`→`{Meat,2}` while `canned chicken`→`{Canned & Jarred,2}` (the re-home); `chicken parmesan`→`{Meat,4}` (new tier-4 coverage via the bare token, resolving to Meat not Canned). Desktop-verifiable end to end; NO NB-6 device signal (pure data + DOM-free matcher, same class as S29). Zero console/page errors, zero dialogs, zero non-`file://` requests.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — full transcript `c:/tmp/pw-test/s35-s36-runA.log` (Part 22 block), reproduced `c:/tmp/pw-test/s35-s36-runB.log`. Each S35 PASS line prints the `{aisle,tier,matchedText}` (or the integrity `{count,aisleCount,collisionThrew}`) it asserted.
