# Test Plan — S34: Settings "Icons" picker panel

**STATUS: DONE — formally executed 2026-09-16, reconfirmed @ pushed sha `8322b59`, PASS (483/483 combined suite; Part 25 = 13/13 S34 checks), 0 defects. DESKTOP-verifiable AC (structure/persistence/routing) fully green AND the NB-6 on-device pick is COMPLETE: the PO used this shipped picker on their iPhone to repoint 2 defaults (`auto-aisle-run` → ↯ U+21AF, `note-toggle` → ☰ U+2630), the Dev pushed them at `8322b59`, and this pass reconfirms them at their draw-sites (S33.3b) + in the panel swatches (S34.2).**

**Story:** As the app owner, I want a Settings panel that lists every icon-bearing action with its current glyph and a "Change" affordance opening a curated candidate palette, so I can pick — seeing live on my own phone which candidates render vs. show a tofu box — a glyph that persists and applies everywhere, resolving the recurring iOS-glyph-tofu problem (most recently U+2B4D on the Auto-aisle button).

**Acceptance criteria (verbatim, BACKLOG.md):** "**S34** — the Settings "Icons" panel: each action lists its label + current glyph + a "change" affordance → a curated candidate palette (PLAIN Unicode, NO emoji, several glyphs known to render broadly on iOS) → a pick applies + persists live, with a reset-to-default. The PO picks the `auto-aisle-run` glyph (and any other they want) ON-DEVICE, resolving the U+2B4D tofu; the shipped picker doubles as the on-device decision tool. Depends on S33."

**Deliverable under test:** WORKING-TREE build (uncommitted at pass time; push HELD). `script.js`: `renderIconsSection()` (appended in `renderSettings()` BELOW the Aisles section) — per-action row = `.icon-swatch[data-role=icon-current]` (current effective glyph, previewed at the draw-site font-size via inline `font-size`, M34) + `.icon-manage-label` + a `[data-role=icon-change]` Change/Done toggle + a `[data-role=icon-reset]` per-action Reset (only when overridden); an expanded `[data-role=icon-palette]` of `.icon-cand[data-role=icon-pick][data-cand=<index>]` candidate buttons (addressed by INDEX, no glyph in a DOM attribute; each `escapeHtml()`'d — R17a); a global `.icon-reset-all-btn[data-role=icon-reset-all]` (disabled when nothing overridden); `settingsIconOpen` open-state + panel `scrollTop` both preserved across the rebuild (R18); `assertPaletteClean`/`isEmojiPresentationDefault` (N23 guard). `style.css`: the Icons panel CSS — swatch/candidate boxes deliberately NOT clipped (M33 `overflow:visible`).

**Locked behavior:** the Icons section renders below Aisles. A candidate tap → `setIcon` → `applyIcons` → `render()` → `renderSettings()` (panel re-render) with `settingsIconOpen` unchanged + scroll pinned (R18: no collapse/jump), applying live to the list row icons / the 3 static glyphs / the auto-detect option and persisting to `vopping-icons-v1`. Picking the registry default clears the override (== reset). Per-action Reset (shown only when overridden) and a global reset-all restore defaults. N23: the frozen palette is validated (not filtered) against an emoji-PRESENTATION-default guard (VS16 U+FE0F, astral ≥U+1F000, or the BMP Emoji_Presentation set) — text-default dingbats pass; the U+2B4D tofu-confirm candidate is whitelisted so the PO can confirm on-device that it IS the tofu. A glyph swap never changes the structural Auto-detect option (`data-autodetect`/reserved value) or the `settings-close` `data-role` (still closes).

**Tooling:** Playwright (`channel:chrome`, headless, `file://`, 390×700). Panel structure/labels/current-glyph/preview-font read from the live DOM; palette candidates compared to `getRegistry().entries[id].candidates` (exact glyphs + order); `overflow` read via `getComputedStyle` (M33). R18 candidate tap dispatched via a DIRECT DOM `.click()` (NOT `page.click()`, which auto-scrolls the off-screen candidate into view and would move the panel itself) so the scroll check isolates the re-render's effect. N23 guard exercised through `assertPaletteClean`/`isEmojiPresentationDefault`. Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 25). Independent Tester authorship — supersedes the Developer self-check `c:\tmp\pw-test\vop-s33-s34-verify.js`.

## Testability review summary (for scrum-master)
Deterministic via the live DOM + the S33 read-through hook. The R18 guarantee is asserted on all three axes at once (palette-stays-open + live-apply + persist) plus a scroll-preservation check that had to be authored carefully (a direct DOM click, since Playwright's auto-scroll-to-click would itself move the panel and mask the app's correct behavior). N23 is proven to key on emoji-PRESENTATION-default (text-default dingbats pass, SPARKLES ✨ caught, U+2B4D whitelisted) — not on mere RGI membership. **NB-6:** which candidate GLYPHS actually render on the PO's iPhone is the PO's on-device acceptance signal — asserted here only via desktop structural proxies (textContent equality, exact candidate membership/order, `data-autodetect`/reserved-value survival, persistence round-trip). The Done-flip waits on the PO's on-device pick.

## Test cases (→ Part 25 checks S34.1–S34.10b)
| ID | Covers | Expected |
|----|--------|----------|
| S34.1 | section placement | "Icons" section present, rendered BELOW "Aisles" |
| S34.2 | per-action rows | 10 rows, each label + current effective glyph + Change control |
| S34.3 | M34 preview | each swatch previewed at its draw-site font-size |
| S34.4 | Change → frozen palette | exact candidate glyphs + order + current-marked |
| S34.5 | M33 no-clip | palette + candidate box overflow:visible (tofu shows honestly) |
| S34.6 | R18 | candidate tap applies live + persists + palette stays open at same scroll |
| S34.7 | per-action Reset | restores default, drops override, palette stays open |
| S34.8 | reset-all | clears every override → defaults, key removed, button disabled |
| S34.9a-c | N23 guard | palette clean; keys on emoji-presentation-default (dingbats pass, ✨ caught); U+2B4D whitelisted |
| S34.10a-b | structural survival | glyph swap keeps auto-detect data-autodetect+value and settings-close data-role (still closes) |

## Results
| Test Case | Expected | Actual | Pass/Fail |
|-----------|----------|--------|-----------|
| S34.1–S34.10b | as above | as above (verbatim PASS lines; e.g. S34.1 ["Aisles","Icons"], S34.4 exact 6-glyph delete palette current-marked ✕, S34.6 open/list=✗/persisted=✗/scroll 100→100, S34.8 overrides→0 + key null + button disabled, S34.9b dingbats all false + ✨ true) | **PASS (13/13)** |

**Overall verdict:** PASS (13/13 S34-specific, reconfirmed @ pushed sha `8322b59`). Full regression re-run clean: `vopping-tests-tester-s1-s27-formal.js` 483/483 (see REGRESSION_LOG.md 2026-09-16 S33+S34 default-retrofit reconfirm row). Reproduced x2, zero console/page errors, zero dialogs, zero non-`file://` requests. **NB-6 CLOSED:** the PO used this picker on their iPhone to pick the 2 iOS-safe defaults (auto-aisle-run ↯, note-toggle ☰); the on-device render is PO-confirmed and the desktop citation reconfirms those defaults route + persist. **One test-authoring bug found + fixed while writing this pass (NOT an app defect):** S34.6's scroll check first used `page.click()`, whose auto-scroll to the off-screen candidate moved the panel and made the pre-click scroll reading stale (the app correctly preserved the post-auto-scroll offset, 833) — rewritten to a direct DOM `.click()` so the check isolates the re-render's effect (now 100→100).

## Commands run and output
`node "c:/tmp/pw-test/vopping-tests-tester-s1-s27-formal.js"` — transcripts `c:/tmp/pw-test/s33-s34-run1.log` + `s33-s34-run2.log` (Part 25 block).
