# Test Plan — S22: persisted aisle set + per-item native `<select>`

**STATUS: DONE — formally executed 2026-09-10, PASS (19/19 S22-specific), 0 defects.** Citation of
record: `c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 7). Full transcript:
`c:\tmp\pw-test\s1-s25-run2.log`. This is the independent Tester formal pass against the pushed
implementation (sha `027672a`).

**Story:** As a user shopping on my phone, I want to pick an item's aisle from a native dropdown
instead of a text field, so that the app stops zooming in every time I set an aisle, and so my
aisles are a deliberate, reusable set rather than ad-hoc typed text.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-10):** the per-item aisle field is a
persistent native `<select>` picking from `state.aisles` (free-text input + datalist + tag removed);
option order (NB-1) = no-aisle bucket first (labeled `state.unassignedLabel`, default "Other"), then
the real aisles in insertion order, then S24's "+ Add new aisle…" sentinel LAST; `state.aisles`
persists inside the existing state object; migration on first load is map-then-seed (FIRST remap any
item aisle normalizing to the literal "Other" → `''`, THEN seed = 8 starters [Other excluded] ∪
distinct remaining item aisles, deduped case-insensitively, starter casing wins else first-seen);
migration rewrites ONLY the Other→`''` remap on items, never nextId/other fields; idempotent + the
seeded set is authoritative (never re-merged; a deleted starter must not resurrect); the select
matches an item's aisle to its option by NORMALIZED key (dangling-value guard) and canonicalizes on
first edit; R15 group-header/select fallback resolves a missing key to the raw string (never
"undefined"); R14 cross-editor commit safety (a select `change` commits any open editor first; a
dismissed picker flushes a pending editor); iOS guard = the select + every new text input font-size
≥16px; M24 worst-case-row overflow re-check at 320/360/375/390px.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL, pushed
sha `027672a`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Pre-implementation testability-check (2026-09-09/10) confirmed every S22 clause reduces to a
structural/state assertion. **NB-6 discipline observed:** the on-device iOS zoom-elimination and the
native-picker overlay opening are tracked REAL-DEVICE confirmation signals — NOT asserted in
Chromium. The desktop pass verifies only the structural proxies (field is a `<select>`; computed
font-size ≥16px; correct option set/order; the change-commit and migration logic). No blocking
testability gaps remained at Lock.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC22.1 | migration seed | `state.aisles` = 8 starters (Other excluded) ∪ new item aisles, deduped, insertion order |
| TC22.2 | map-then-seed order | items normalizing to "Other" → `''` BEFORE the union; "Other"/"other" never re-enter the set |
| TC22.3 | narrow item rewrite | non-canonical real-aisle values ("produce"/"Bakery ") left verbatim; only Other→`''` touches items |
| TC22.4 | migration scope | nextId + other item fields untouched |
| TC22.5 | bucket label seed | `state.unassignedLabel` = "Other" |
| TC22.6 / 22.6b | dangling-value guard | "produce"→"Produce" option, "Bakery "→"Bakery" option by normalized key |
| TC22.7 | canonicalize-on-first-edit | re-picking rewrites the item to canonical casing |
| TC22.8 | idempotency (NB-7) | reload after migration does not re-mutate aisles/items |
| TC22.9 | fresh install | seed = 8 starters; select = bucket-first + 8 + sentinel-last (10 options) |
| TC22.10 | iOS proxy (NB-6) | `<select>` computed font-size ≥16px |
| TC22.11 | R14 first-interaction | choosing A's aisle while B's note editor is open+dirty commits BOTH on the first interaction |
| TC22.12 | R14 companion | focusing A's select w/o choosing then dismissing leaves A unchanged, still flushes B's note on blur |
| TC22.13 / 22.13b | R15 fallback | dangling stored aisle resolves group header to raw string (never "undefined") + appears as its own selected option |
| TC22.14 ×4 | M24 overflow | worst-case row (long name + note + always-present select) no horizontal overflow at 320/360/375/390px |

## Results
**19/19 PASS, 0 defects.** Verbatim PASS lines archived in `c:\tmp\pw-test\s1-s25-run2.log`
(Part 7). Migration determinism confirmed against a known pre-migration state: resulting
`state.aisles` = `["Produce","Dairy","Meat/Seafood","Bakery","Frozen","Pantry","Beverages","Household","Candy"]`
and item aisles `["produce","Bakery ","","","Candy",""]` exactly as specified. R14 both cases pass
(first-interaction dual-commit; dismiss-companion). R15 renders "GhostAisle" (not "undefined"). M24:
zero horizontal overflow at all four widths.

**Cross-story supersession coverage (also re-verified, cited here):** S22 supersedes the live
mechanisms of Done S8/S9/S16 — the retrofitted regression checks confirming this live in Parts 2/3
of the same script: S8 free-text input/datalist/tag are gone and replaced by the `<select>`
(Part 2 TC8.1–8.14 retrofit); the By-Aisle group label is now "Other" not "Unassigned" (Part 2
TC9.3/9.17); S16's ⚑ icon-only compact affordance is superseded by the inline `<select>` in all
sort modes per M23 (Part 3 TC16.1–16.10 retrofit).

**Overall verdict: PASS (19/19 S22-specific), 0 defects.** Full regression re-run clean:
268/269 across the whole suite (the lone fail is defect D1 on S23, unrelated to S22) — see
`REGRESSION_LOG.md` 2026-09-10 row, script `vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run2.log`. Zero console/page
errors, zero dialogs, zero non-`file://` network requests across the entire run. Migration behavior
independently spot-checked via `c:\tmp\pw-test\vop-probe-s21-s25.js` before authoring assertions.
