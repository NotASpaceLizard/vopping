# Test Plan — S33: central icon registry + iconFor() + persisted override map

**STATUS: DONE — formally executed 2026-09-16, PASS (482/482 combined suite; Part 24 = 28/28 S33 checks), 0 defects. Desktop-verifiable AC fully green. (S33 is the foundation layer — NO visible change; it carries no NB-6 device signal of its own. The on-device glyph pick lands via S34.)**

**Story:** As the app owner, I want every glyph-bearing action in the app to resolve its icon through ONE central registry + a single `iconFor()` accessor backed by a persisted override map, so a glyph pick applies everywhere consistently and — with no override stored — the app renders byte-identically to today (the regression-safety foundation for the S34 picker that fixes the recurring iOS-glyph-tofu problem).

**Acceptance criteria (verbatim, BACKLOG.md):** "**S33** — central icon registry (ONE source of truth: `action-id → DEFAULT glyph`, the current glyphs) + an `iconFor()` accessor routing EVERY draw-site through it (the JS-rendered row icons AND the three static `index.html` glyphs) + a persisted override map (`vopping-icons-v1`, R1-defensive parse, override-else-default resolution). NO visible change — with no override stored, every icon renders byte-identically to today; this is the regression-safety foundation. Prerequisite for S34."

**Deliverable under test:** WORKING-TREE build (uncommitted at pass time; push HELD). `script.js`: `ICON_REGISTRY` (10 actions, `def`/`label`/`candidates`) + `ICON_REGISTRY_ORDER` + `ICONS_KEY = 'vopping-icons-v1'` + `FALLBACK_GLYPH` (U+25A1) + `isValidIconOverride` (R17b content constraint: string / non-empty-trimmed / ≤8 UTF-16 units / no C0-C1 control chars / none of `< > & " '`) + `parseIconOverrides` (R1-defensive, M31 array-reject) + `loadIcons`/`saveIcons` + `iconFor()` + `applyStaticIcons` (writes the 3 `data-static-icon` nodes' `.textContent`) + `applyIcons`/`setIcon`/`resetIcon`/`resetAllIcons` + `window.__voppingIcons` read-through hook. Every draw-site now pulls its glyph via `iconFor()`: the 4 former `*_ICON_GLYPH` constants, the 3 formerly-inline `renderRow` literals (up/down/delete), and the 3 static `index.html` glyphs (gear/close/auto-run, each carrying `data-static-icon`). `index.html`: `data-static-icon` on `#settings-btn`, `.settings-close`, and the auto-aisle `<span class="auto-aisle-glyph">`.

**Locked behavior:** defaults are byte-identical to the pre-S33 shipped glyphs (⚙ / ✕ / ⭍ / U+1F5CB / ✎ / ▲ / ▼ / ✕ / ⌖ / ⭍). A valid stored override wins, else the registry default; an unregistered id → the U+25A1 fallback (never `undefined`, never a throw). `parseIconOverrides` never throws before render: parse failure / null / non-object / top-level array → `{}`; each value must pass the R17b content constraint or that entry is dropped; a glyph stored for an unregistered id is harmless (never consulted). Static glyphs are set from `iconFor()` at init AND on every override write; `.textContent` is inherently markup-safe (R17a escaping is for the innerHTML draw-sites). `delete-item`/`settings-close` share ✕ and `auto-aisle-run`/`auto-detect-option` share ⭍ as DISTINCT ids that never cross-set.

**Tooling:** Playwright (`channel:chrome`, headless, `file://`, 390×700). Draw-site glyphs asserted by REAL DOM `textContent` (per-row via `allTextContents()` over both rows; the 3 static singletons; the auto-detect `<option>` label + its `data-autodetect`/value); effective/override state via `window.__voppingIcons` (`getRegistry`/`getOverrides`/`iconFor`/`setIcon`/`resetAll`) and the raw `vopping-icons-v1` key. Corrupt-store values written directly to the key then reloaded. Expected defaults are code-point-pinned. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 24). Independent Tester authorship — supersedes the Developer self-check `c:\tmp\pw-test\vop-s33-s34-verify.js` as citation of record.

## Testability review summary (for scrum-master)
Every clause is deterministic via the read-through hook + real DOM. The two subtle guarantees are asserted directly: (1) R-EVERYWHERE checks EVERY row's node (not just row 0) plus the 3 static glyphs, the aisle overlay, and the auto-detect `<option>`; (2) R-ISOLATION uses a DISTINCT sentinel per action, so a shared-glyph pair (delete/settings-close, auto-run/auto-detect) cross-setting would fail immediately. Byte-identity is pinned by code-point, not "looks the same." NB-6 respected: whether a chosen glyph RENDERS on the PO's iPhone is the PO's on-device signal (arrives at S34); this pass proves STRUCTURE / persistence / routing only.

## Test cases (→ Part 24 checks S33.1–S33.13)
| ID | Covers | Expected |
|----|--------|----------|
| S33.1 | registry order/size | 10 actions in spec order |
| S33.2 | R-DEFAULT registry | all 10 defaults byte-identical to today's glyphs |
| S33.3 | R-DEFAULT static three | gear ⚙ / close ✕ / auto-run ⭍ render defaults |
| S33.4 | R-DEFAULT per-row | note/name/up/down/delete/aisle-marker default on BOTH rows |
| S33.5 | R-DEFAULT auto-detect option | "⭍ Auto-detect", data-autodetect=1, reserved value, both rows |
| S33.6 | fresh load | empty override map, no key |
| S33.7 | R-NOTHROW | iconFor(unknown)→U+25A1, registered→default, no throw |
| S33.8a-c | R-OVERRIDE + R-EVERYWHERE | distinct sentinel per action lands at its site on every row + static + auto-detect (live, no reload) |
| S33.9 | persistence | key holds all 10, re-applied everywhere after reload |
| S33.10a-b | R-ISOLATION delete/settings-close | overriding one never changes the other (shared ✕) |
| S33.11a-b | R-ISOLATION auto-run/auto-detect | overriding one never changes the other (shared ⭍ default) |
| S33.12 | R17b + R1 corrupt-store battery | literal null / malformed / bare-string / number / array [M31] / absent / non-string / over-length / control-char / whitespace / unknown-id / MIXED → drop to default, no throw, list intact |
| S33.13 | R17a no-injection | a markup-bearing override injects NOTHING, delete default, no error/dialog |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S33.1–S33.13 | as above | as above (verbatim PASS lines in the transcript; e.g. S33.2 offenders=[], S33.9 before/after=10/10, S33.12 MIXED del=✗ / name=✎ / up=▲, S33.13 injected=0) | **PASS (28/28)** |

**Overall verdict:** PASS (28/28 S33-specific). Full regression re-run clean: `vopping-tests-tester-s1-s27-formal.js` 482/482 (see REGRESSION_LOG.md 2026-09-16 S33+S34 row; the 441 S1-S32/S35/S36 baseline all re-confirmed clean — S33 is a purely additive layer, byte-identical defaults, no mechanism retired). Reproduced x2, zero console/page errors, zero dialogs, zero non-`file://` requests. **Independent NUL-byte re-verify:** a byte-level scan of `script.js`/`index.html`/`style.css` found 0 NUL and 0 stray control bytes (excl. TAB/LF/CR) and `node --check script.js` passes — the Dev's NUL-in-regex fix is confirmed repaired.

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — transcripts `c:/tmp/pw-test/s33-s34-run1.log` + `s33-s34-run2.log` (Part 24 block). Byte scan: `node "c:/tmp/pw-test/vopping-ctrlbyte-scan.js"` → `script.js/index.html/style.css: NUL=0 CR=0 strayControl=0 → CLEAN`.
