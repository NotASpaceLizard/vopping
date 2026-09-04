# Test Plan — S1: Render list + single-item add + localStorage persistence

**STATUS: DONE — density-picker.html CSS/markup follow-up pass re-verified 2026-09-04, PASS
(74/74 combined re-run), zero defects.** BACKLOG.md's Tracked follow-up gate (QA finding M3) is
now closed: the PO's final pick (whole row is the tap target, no checkbox glyph, strikethrough+dim
crossed-off state) has been implemented by Developer and independently re-verified below. Citation
of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s2-s5-density-formal.js` — supersedes the prior
`vopping-tests-tester-s1-s6-s12-formal.js` (67/69-era placeholder-layout pass) for S1's own
Done-gate. See "Density re-verification, 2026-09-04" section below for the full new evidence.

**Accessibility-scope note (PO decision relayed 2026-09-04):** this pass includes ARIA/keyboard
checks (role, tabindex, aria-checked/label, focus-restoration) because Developer built them and I
had already written/run them before this scoping call landed. Per the PO, keyboard-only/
screen-reader coverage is **not a required gate going forward** — real user base doesn't need it.
These checks are kept as informational sanity-check coverage (they pass, which is good to know),
not as a blocking requirement — no further investment planned here, and a future failure in this
specific area would not by itself block a story's Done status. The one real accessibility
requirement going forward is a colorblind-safe palette wherever color conveys state (not
applicable to S1's own row markup, which uses strikethrough+dim rather than color).

**Story:** As a user, I want to see my grocery list and add items to it one at a time, so that
I can build up what I need to buy and have it survive closing and reopening the app.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** empty state with a clear
"no items yet" message on first load; always-visible text input + Add control, Enter also
submits; empty/whitespace-only submit is a no-op; new items appear immediately, no reload;
full item list persists to localStorage on every mutation as one object `{ items: [...], nextId:
N }` (not a bare array), survives an ordinary refresh in exact prior order; single-user/fully
offline, no network calls of any kind; no de-duplication (same name twice creates two independent
rows); defensive load-time guard — any parse failure or shape mismatch (not a plain object, or
`items` not an array) falls back to `{ items: [], nextId: 0 }` and never throws before the render
loop runs. **Row density/interaction — LOCKED (PO's final pick from `density-picker.html`):** the
entire row is the tap target for crossing an item off (Option C), no checkbox or dot glyph of any
kind (Option D); crossed-off state is strikethrough + dimmed item-name text only.

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Add/render/persist mechanics implemented 2026-09-04; row markup/CSS updated to the locked density
spec 2026-09-04 (checkbox removed, whole `<li>` carries `role="checkbox"`/`tabindex="0"`/
`aria-checked`/`aria-label`, event delegation updated for nested-control precedence).

**Tooling:** Playwright (`playwright-core` 1.62.1, already installed at `c:\tmp\pw-test\node_modules`),
driven via `chromium.launch({ channel: 'chrome' })` against the system-installed Chrome — Playwright's
own bundled-Chromium download is blocked by an org network restriction (403), same workaround
already in use for vacking (`drive.js`) and this project's own Developer self-check.

## Testability review summary (for scrum-master)
No open items. Prior testability-check pass (pre-lock) is fully resolved — no unverifiable AC
remained by lock time.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC1.1 | Empty state on first load | Fresh load, no saved data | `.empty-state` message present, not a blank screen |
| TC1.2 | Whitespace-only submit no-op | Fill `#add-input` with `"   "`, press Enter | 0 rows created |
| TC1.3 | Add via Enter | Fill valid name, press Enter | 1 row created, input clears |
| TC1.4 | Add via button click | Click submit button with valid name | Row created |
| TC1.5 | Deterministic incrementing ids | Add 3 items in sequence | ids exactly 0, 1, 2 |
| TC1.6 | No de-duplication | Add "Milk" twice | 4th row created, distinct id from the original |
| TC1.7 | HTML/script content in item name is escaped, not executed | Add an item named with `<script>`/`&`/quotes | Renders as literal text; no script execution; no `<script>` tag in DOM |
| TC1.8 | Storage-corruption guard — 5 malformed values | Set `vopping-list-state-v1` to literal `"null"`, a raw array, an object missing `items`, an object where `items` isn't an array, and non-JSON garbage; reload each | No throw, no console/page error; falls back to clean empty state each time |
| TC1.9 | Malformed `nextId` is coerced, not treated as full corruption | Set state to a valid `items` array but a non-numeric `nextId`; reload | No throw; existing items preserved (not wiped) |
| TC1.10 | Persists on every mutation, raw storage shape correct | Perform several mutations, read `localStorage` directly | Value is one JSON object `{ items: Array, nextId: Number }`, not a bare array |
| TC1.11 | Survives refresh in exact prior order | Reload after mutations | `items` array identical pre/post reload |
| TC1.12 | No network calls of any kind | Monitor all `page.on('request')` events across the full run | Zero non-`file://` requests; only the app's own local asset loads appear |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC1.1 | `emptyText="No items yet — add one above to get started."` | Pass |
| TC1.2 | count=0 | Pass |
| TC1.3 | count=1, input value="" | Pass |
| TC1.4 | Eggs id=1, Bread id=2 created via button click | Pass |
| TC1.5 | Milk=0, Eggs=1, Bread=2 | Pass |
| TC1.6 | 4 rows, dup id=3 ≠ original id=0 | Pass |
| TC1.7 | `window.__xss` never set; rendered text exactly matches raw name incl. `<script>` tag as literal text; 0 `<script>` elements in `.items` | Pass |
| TC1.8 | All 5 corrupted values: 0 new console/page errors, empty state shown, count=0, each | Pass (10/10 sub-checks) |
| TC1.9 | 0 new errors; `["Preserved Item"]` still rendered, not wiped | Pass (2/2 sub-checks) |
| TC1.10 | `{"items":[...],"nextId":18}` — correct shape confirmed via direct `localStorage.getItem` read | Pass |
| TC1.11 | Pre/post-reload `items` arrays byte-identical (JSON diff) | Pass |
| TC1.12 | Only `file:///.../index.html`, `style.css`, `script.js` requests captured (repeated across multiple `goto`/`reload` calls in the script) — zero external/backend calls | Pass |

**Overall verdict (original placeholder-layout pass): PASS, 0 defects in S1.** Superseded as the
Done-gate citation by the density re-verification below — see `REGRESSION_LOG.md` for the current
canonical count (74/74).

## Density re-verification, 2026-09-04 (closes BACKLOG.md's Tracked follow-up gate, QA finding M3)

Developer's CSS/markup pass implementing the PO's locked density pick: checkbox `<input>` removed
entirely; the `<li>` itself now carries `role="checkbox"`, `tabindex="0"`, `aria-checked`,
`aria-label="<item name>"`; crossed-off visual state is strikethrough + dimmed `.item-name` text
only (no glyph). Independently re-verified against the live app (script:
`vopping-tests-tester-s1-s2-s5-density-formal.js`):

| Check | Actual | Pass/Fail |
|-------|--------|-----------|
| Row carries `role="checkbox"` | confirmed | Pass |
| Row is `tabindex="0"` | confirmed | Pass |
| `aria-checked` starts `"false"`, flips to `"true"` in sync with the `checked` class | confirmed | Pass |
| `aria-label` matches the item's name | confirmed | Pass |
| Zero `<input>` elements anywhere in a row (glyph fully removed) | 0 found | Pass |
| Crossed-off `.item-name` has computed `text-decoration-line: line-through` | confirmed | Pass |
| Crossed-off `.item-name` color visibly differs from an un-crossed sibling (dimmed) | `rgb(153,153,153)` vs `rgb(221,221,221)` | Pass |
| Row height meets WCAG 2.5.5 AA tap-target minimum (≥24px) | measured 39.8px | Pass |
| No horizontal overflow at 320/360/375/390px with the new (glyph-free) row markup | 0px overflow at all four | Pass |
| Full S1-S6/S12 regression re-run (add/delete/paste/reorder/undo/clear-checked) | 74/74 | Pass |

Full raw transcript archived in `S5-reorder-buttons.md`'s Commands section (canonical copy for
this script, cross-referenced rather than duplicated across files, same convention as the prior
`S6-undo.md` arrangement).

**Overall verdict: PASS, 0 defects. S1 is DONE.**

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js` (covers S1-S6, S12 in one run):
```
cd /c/tmp/pw-test && node vopping-tests-tester-s1-s6-s12-formal.js
```
Full raw output logged once, in `test-plans/S6-undo.md`'s Commands section, to avoid duplicating
~90 lines of console output across 7 files — cross-reference there for the complete transcript.
S1-specific lines (verbatim from that run):
```
PASS - S1 corrupted storage (literal "null") does not throw :: 0 new error(s)
PASS - S1 corrupted storage (literal "null") falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (raw top-level array) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (raw top-level array) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (object missing items key) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (object missing items key) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (items present but not an array) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (items present but not an array) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 corrupted storage (not JSON at all) does not throw :: 0 new error(s)
PASS - S1 corrupted storage (not JSON at all) falls back to clean empty state :: emptyText=No items yet — add one above to get started. count=0
PASS - S1 malformed nextId (non-number) does not throw
PASS - S1 malformed nextId (non-number) preserves existing items rather than wiping :: ["Preserved Item"]
PASS - S1 empty state message shown on first load (not a blank screen) :: No items yet — add one above to get started.
PASS - S1 whitespace-only submit is a no-op, no blank row
PASS - S1 add via Enter creates a row
PASS - S1 input clears after add
PASS - S1 Milk assigned deterministic id 0 :: id=0
PASS - S1 add via button click, ids increment deterministically (0,1,2) :: eggsId=1 breadId=2
PASS - S1 duplicate name allowed (no de-dup), 4 rows now
PASS - S1 duplicate item gets a distinct id from the original :: original=0 dup=3
PASS - S4/S1 item name with HTML/script content is not executed
PASS - S1 item name with HTML content renders as literal escaped text :: got="<script>window.__xss=true</script> & "quotes" 'apostrophe'"
PASS - S1 no stray <script> tag injected into the DOM
PASS - S1 raw localStorage shape is { items: Array, nextId: Number } after mutation
PASS - S1 list persists across reload in exact order/content (raw storage diff)
```
Screenshots: `c:/tmp/pw-test/vop-tester-01-empty.png`, `vop-tester-02-three-items.png`,
`vop-tester-08-after-reload.png`.
