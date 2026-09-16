# Settings Icon Picker (all app icons) — Feature Specification

**Status:** sliced by the Scrum Master, 2026-09-16, into S33 (foundation) + S34 (picker UI).
Pre-Lock review DONE (Developer feasibility / Tester testability / QA hazard): QA returned a HOLD
with 2 Real findings (**R17**, **R18**) plus minors (M31–M34) and nitpicks (N18–N20); the Developer
and Tester added sharpenings. ALL of those are now folded into the acceptance criteria below
(SM, 2026-09-16) — the finding-by-finding ledger is **§8 (Pre-Lock review resolutions)**, which QA
re-reads to confirm R17/R18 are closed. **UPDATE 2026-09-16 — QA's re-read came back CLEAR:**
R17a/R17b + R18 confirmed closed at f6e08c3, plus a Tester implementation note **N23** on the
non-emoji guard (§4/§8). **S33 + S34 are now LOCKED (2026-09-16) — ready to build (S33 foundation
first, then S34).** Supersedes the old pre-agreed
U+2B4D→U+21AF blind-swap fallback.

## Goal
A panel in the existing Settings menu (S21 shell) that lists every icon-bearing action in the app,
each showing its current glyph plus a "change" affordance. Tapping "change" presents a
candidate-glyph palette; the PO picks one — seeing live **on their actual phone** which candidates
render vs. which show a tofu box — and the choice **persists in localStorage** and is applied
**everywhere that icon is drawn**. This is the durable fix for the recurring iOS-glyph-tofu problem
(most recently U+2B4D on the Auto-aisle button, S31/S32) that has dogged the project as one-off
"placeholder pending PO pick" guesses.

## Context / constraints
- Single-user, **fully offline**, plain HTML/CSS/JS + localStorage. Primary device: **Safari/iOS on
  a phone**, deployed via GitHub Pages (`NotASpaceLizard/vopping`).
- **No emoji** — plain monochrome Unicode symbol/dingbat glyphs only, the family the PO has stood by
  across S7/S16/S26. The picker must never offer colored-emoji pictographs.
- **Real-device signal (NB-6):** on-device glyph rendering is a real-device acceptance signal;
  desktop verifies structure/persistence/apply-everywhere only. The whole point of the picker is that
  the PO can SEE tofu vs. real glyph in it, on their phone.
- **Do not regress:** S26/S27 row density + icon layout; the R14 render-timing / focus fixes; the
  settings-menu machinery (S21 shell, S23 create/rename/delete aisles); the S31/S32 auto-aisle
  function (already confirmed working on-device — only its glyph presentation is at issue).

## 1. Icon inventory (the full real set, read from the code 2026-09-16)
Every glyph-bearing action. Each becomes a registry entry keyed by a **stable action-id** (below).

| action-id | Current glyph | Codepoint | Where drawn | Notes |
|---|---|---|---|---|
| `settings-gear` | ⚙ | U+2699 | `index.html` `#settings-btn` | S21 placeholder "pending PO pick"; may render emoji-styled on iOS |
| `settings-close` | ✕ | U+2715 | `index.html` `.settings-close` | |
| `auto-aisle-run` | ⭍ | U+2B4D | `index.html` `#auto-aisle-btn` span | **TOFUS on iOS** — the trigger for this feature (S31) |
| `note-toggle` | 🗋 | U+1F5CB | `script.js` `NOTE_TOGGLE_ICON_GLYPH` (renderList, "Add note") | astral-plane; PO accepted "not exactly rendering as expected"; collapsed vs U+1F5CE on PO's Windows (S7) |
| `name-edit` | ✎ | U+270E | `script.js` `NAME_EDIT_ICON_GLYPH` (renderList, "Edit item") | S15; proven-rendering |
| `move-up` | ▲ | U+25B2 | `script.js` renderList `data-role="up"` | S19; proven-rendering |
| `move-down` | ▼ | U+25BC | `script.js` renderList `data-role="down"` | S19; proven-rendering |
| `delete-item` | ✕ | U+2715 | `script.js` `.delete-btn` `data-role="delete"` | shares the glyph with `settings-close` but is a distinct action-id |
| `aisle-marker` | ⌖ | U+2316 | `script.js` `AISLE_ICON_GLYPH` (`.aisle-glyph` overlay) | S26; PO-picked **on-device** — proven-rendering |
| `auto-detect-option` | ⭍ | U+2B4D | `script.js` `AUTODETECT_ICON_GLYPH` (aisle `<select>` option) | **TOFUS on iOS**; lives inside a native `<option>` (iOS picker wheel — a *different* render context from a button) (S32) |

**Out of scope (no glyph):** Undo and "Clear crossed off" are text-label buttons; Add / Add all /
Paste a list / Save / Rename / Delete (settings) and the sort `<select>` are text. A *glyph* picker
has nothing to change on them. (If the PO ever wants those relabeled, that is a separate ask.)

**Shared-concept note (see Open item Q4):** `auto-aisle-run` and `auto-detect-option` are the same
"auto" concept and share today's default (U+2B4D). Whether the picker treats them as ONE entry (one
pick fixes both) or TWO independently-pickable entries is a genuine PO fork — they render in
different contexts (a button vs. an iOS picker-wheel `<option>`), so a glyph safe in one is not
guaranteed safe in the other.

## 2. Central icon registry (one source of truth)
- One in-code object maps `action-id → { default glyph, human label for the picker, [candidate set] }`.
  The `default` values are exactly the current glyphs in §1 (so with no override stored, the app
  renders byte-identically to today — this is the non-regression contract).
- A single accessor — `iconFor(actionId)` — returns the **effective** glyph: the stored override if
  present and non-empty, else the registry default. **Every** draw-site pulls its glyph from
  `iconFor()`, so a pick applies everywhere consistently and no glyph literal survives outside the
  registry.
- **Static glyphs too — `applyStaticIcons()` (Developer sharpening, folded 2026-09-16):** three
  glyphs live in static `index.html` (`settings-gear` `#settings-btn` L21, `settings-close`
  `.settings-close` in the settings header L88, `auto-aisle-run` the nested
  `<span aria-hidden="true">` inside `#auto-aisle-btn` L62). script.js MUST own a single
  `applyStaticIcons()` that sets those three elements' glyph from `iconFor()` and runs **at init AND
  on every override write**. Neither `render()`/`renderList()` nor `renderSettings()` touches these:
  `renderSettings()` rebuilds ONLY `#settings-body`, so `settings-close` (header) and `settings-gear`
  are not covered by it, and the auto-aisle button is outside the list. Two specific hazards this
  setter must respect:
  - **N18 / Dev-1 — the `auto-aisle-run` write targets the nested aria-hidden span, NEVER
    `#auto-aisle-btn.textContent`** (the button's textContent also holds the `' Auto-aisle'` label; a
    `textContent` write would wipe the label). S33 MUST add a selector hook (id / class / data-attr)
    on that inner `<span>` and target it.
  - **N19** — the static setter uses `.textContent` on each of the three nodes (a static glyph, not
    innerHTML), so `applyStaticIcons()` is what covers header close/gear that `renderSettings()`'s
    `#settings-body` rebuild does not.
- **N20 — accessible names stay glyph-independent.** Changing a glyph MUST NOT change any accessible
  name: `#settings-btn` `aria-label="Settings"`, `#auto-aisle-btn`'s `' Auto-aisle'` text label,
  `.settings-close` `aria-label`, the aisle `<select>` `aria-label="Aisle"`, and every glyph carried
  in an `aria-hidden` span all remain as-is; the glyph is decorative to the a11y tree.
- **Unknown/stale action-ids** in storage are ignored; a known id with no override falls back to
  default. **Pinned fallback (Tester sharpening):** `iconFor('<unregistered-id>')` returns a single
  defined module-level constant `FALLBACK_GLYPH` (pin: `□` U+25A1, a plain BMP Geometric-Shapes
  glyph) — never `undefined`, never a throw. This path is defensive-only (all real draw-sites pass a
  registered id); it exists so a future/typo'd id degrades to a visible neutral box, not a crash
  (assertion **R-NOTHROW**).
- **M32 — parse the override map ONCE, not per-icon per-render.** `renderList` is a hot path
  (`iconFor()` fires for every glyph on every row on every render). The `vopping-icons-v1` map is
  parsed a single time at init into an in-memory object; `iconFor()` reads that object; writes update
  BOTH localStorage and the in-memory object. No `localStorage.getItem` / `JSON.parse` per
  `iconFor()` call.

## 3. Persistence
- New localStorage key **`vopping-icons-v1`**, an object `{ "<action-id>": "<glyph>" }` holding only
  the actions the PO has actively changed (sparse — absent id ⇒ use default).
- **Defensive parse (R1 posture used across this app):** never throw before render. On parse failure
  / `null` / **a top-level array (M31 — `typeof [] === 'object'`, so a non-object check alone lets an
  array through; explicitly `Array.isArray()`-reject it, matching the three existing parsers: state,
  frequency, and the S30 personal-override map)** / any other non-plain-object, fall back to an empty
  override map (⇒ all defaults). Unknown keys and glyphs for unknown ids are dropped silently.
- **R17b — CONTENT constraint on each override value (must-fix, gates Lock).** SHAPE alone (a
  non-empty string) is NOT enough: `vopping-icons-v1` is hand-editable, so a corrupt/typo'd value
  could carry markup or junk. Before an entry is accepted into the in-memory map, its value must pass
  ALL of: (a) `typeof === 'string'`; (b) non-empty after `trim()`; (c) length within a small cap in
  UTF-16 code units (pin: `≤ 8` — ample for one base glyph plus a variation selector / surrogate pair
  / combining mark, far below anything markup-shaped); (d) contains no ASCII control chars (C0/C1) and
  none of `< > & " '`. An entry failing any check is DROPPED (that id falls back to its default) — the
  rest of the map still loads. This is defense-in-depth WITH R17a (draw-site escaping, §6), not
  instead of it: escaping neutralizes markup at render, and the content constraint keeps a clearly-bad
  value from ever being shown at all (escaped-gibberish included).
- **Reset — PINNED to BOTH (Tester sharpening: pin the reset scope):** ship a per-action "reset to
  default" affordance AND a single "reset all icons to default" (clears the whole key). Per-action so
  the PO can undo one bad pick without losing good ones; reset-all so a PO who paints themselves into
  a tofu corner across several actions can always get back to the known-rendering baseline in one tap.
  Both re-apply everywhere live (test-hook seams `resetIcon(id)` / `resetAll()`, §8).
- Writes persist immediately and re-apply everywhere (re-render the list + re-set the static glyphs)
  with no reload.

## 4. Candidate palette (curated, plain Unicode, several known-iOS-safe)
The palette is the point: **a palette of all-tofu candidates is useless.** It must include glyphs
that actually render on iOS system fonts so the PO has working choices. The team proposes the
palette; the PO confirms the final pick **per action, on-device** (NB-6).

**Evidence-based curation (from THIS project's own device history — the strongest signal available;
desktop cannot verify iOS rendering):**
- **Proven to render on the PO's device** (shipped and accepted): ⚑ U+2691 (S16), ⌖ U+2316 (S26,
  PO-picked on-device), ✎ U+270E (S15), ▲ U+25B2 / ▼ U+25BC (S19), ✕ U+2715 (delete/close). Anchor
  every candidate set on glyphs from the **same Unicode blocks** as these.
- **Known-bad here:** ⭍ U+2B4D (tofu), 🗋/🗎 U+1F5CB/U+1F5CE (astral-plane; collapsed/indistinct on
  the PO's Windows). **Avoid** the *Miscellaneous Symbols and Arrows* block (U+2B00–2BFF, where
  U+2B4D lives) and astral-plane pictographs (U+1F300+).
- **Prefer** BMP blocks: Dingbats (U+2700–27BF), Geometric Shapes (U+25A0–25FF), Miscellaneous
  Symbols (U+2600–26FF), Arrows (U+2190–21FF), Miscellaneous Technical (U+2300–23FF).

**FROZEN per-action candidate sets (Tester sharpening — frozen 2026-09-16; S34 cannot be Lock-ready
with an open palette).** These are THE shipped candidates; the PO still picks *among* them on-device
(that is the point), but the SET no longer changes. Curated plain-Unicode, iOS-safe symbol/dingbat
glyphs, NO emoji, BMP-preferred, avoiding U+2B00–2BFF and astral U+1F300+ (the freeze also resolved
the earlier draft's hedged entries: dropped ⚡ U+26A1 and ✏ U+270F as emoji-presentation-default, and
the vague "✐/verify" and "‹/›" placeholders):
- `auto-aisle-run` / `auto-detect-option` (needs a *rendering* replacement for U+2B4D): ↯ U+21AF ·
  ⌁ U+2301 · ✦ U+2726 · ✧ U+2727 · ✳ U+2733 · ✷ U+2737 · ⟳ U+27F3 · ⊛ U+229B · ★ U+2605 ·
  **⭍ U+2B4D (intentionally retained + WHITELISTED — see the non-emoji/avoid guard below — so the PO
  can confirm on-device that it is the tofu one).**
- `settings-gear`: ⚙ U+2699 · ⛭ U+26ED · ☰ U+2630 · ⋮ U+22EE · ⚒ U+2692 · ✜ U+271C.
- `note-toggle`: ✎ U+270E · ☰ U+2630 · ▤ U+25A4 · ≡ U+2261 · ✍ U+270D · ⊞ U+229E.
- `name-edit`: ✎ U+270E · ✍ U+270D.
- `move-up` / `move-down`: ▲/▼ U+25B2/25BC · ↑/↓ U+2191/2193 · ⌃/⌄ U+2303/2304 · ∧/∨ U+2227/2228.
- `delete-item`: ✕ U+2715 · ✗ U+2717 · × U+00D7 · ⌫ U+232B · ⊘ U+2298 · ⦸ U+29B8.
- `settings-close`: ✕ U+2715 · ✗ U+2717 · × U+00D7 · ⨯ U+2A2F.
- `aisle-marker`: ⌖ U+2316 · ⚑ U+2691 · ⚐ U+2690 · ◉ U+25C9 · ⊚ U+229A · ▣ U+25A3 · ⌂ U+2302.

**Non-emoji / avoid-block guard on the frozen palette (Tester sharpening).** A guard asserts no
candidate is a colored-emoji pictograph — keying on EMOJI-PRESENTATION-DEFAULT (`Emoji_Presentation=Yes`, or a glyph carrying a VS16 U+FE0F selector), **NOT** mere RGI-emoji / `Emoji=Yes` membership (**N23**, Tester implementation note): several text-default dingbats in the frozen palette (✳ U+2733, ✷ U+2737, ✦ U+2726, ✧ U+2727, ★ U+2605) ARE `Emoji=Yes` members but default to TEXT presentation, so an RGI-membership guard would false-fail the very candidates it exists to bless — and none falls in
U+2B00–2BFF or astral U+1F300+ — with ONE explicit WHITELIST entry: **⭍ U+2B4D**, the intentionally
retained tofu-confirm candidate, exempted from the avoid-U+2B00–2BFF rule the same way the auto-aisle
lemon→'difficult' entry is exempted in `AUTO_AISLE_INTEGRITY_WHITELIST` (a deliberate, documented
carve-out, not a leak). The note-toggle DEFAULT `🗋` U+1F5CB (astral) is not a candidate — it stays
only as the current default under the §2 byte-identical contract; the note-toggle candidate SET is
BMP.

**M34 — render each palette candidate in the target draw-site's own font/size.** A candidate is
previewed at the exact font-family and font-size of the slot it will occupy (a glyph that fits at the
header-gear size may overflow at the ~19.5px row-icon box), so the PO's on-device tofu-vs-real read is
made under real rendering conditions, not a generic palette size.

The shipped picker **doubles as the decision tool** — the PO sees each candidate live in the actual
Settings palette on their phone (tofu vs. real), the same on-device confirmation loop as
`density-picker.html` / `s16-aisle-icon-picker.html` / `s26-aisle-presentation-picker.html`, so a
separate mockup page is optional. A universal shared palette (same candidates for every action) is an
acceptable simpler alternative to per-action sets if the PO prefers — a cheap build-time call.

## 5. Picker UI (in the S21 Settings panel)
- A new `settings-section` (e.g. "Icons") in `renderSettings()`, below the existing "Aisles" section,
  listing every registry action: its human label + its current **effective** glyph + a "Change"
  control.
- "Change" reveals the candidate palette for that action (inline expander or sub-panel — Developer's
  call); tapping a candidate writes the override, applies everywhere immediately, and persists.
- A per-action reset AND a global "reset all icons to default" (both — see §3 reset pin).
- Must reuse the S21/S23 settings machinery and its focus-preservation pattern; introduce no per-row
  render seam and no new R14-class hazard.
- **R18 — the palette must NOT collapse or jump on a candidate tap (must-fix, gates Lock).** The
  picker IS the on-device decision tool: the PO taps candidate after candidate to find one that renders
  on their phone. `renderSettings()` today does a full `settingsBody.innerHTML` rebuild with
  focus-preservation hardcoded to exactly two inputs (`aisle-rename-input`, `aisle-create-input`) and
  NO palette-open / scroll state — so a naive "write override → renderSettings()" would slam the open
  palette shut and lose scroll position on every tap, making the tool unusable. AC: EITHER (a) persist
  an "open-palette action-id" as render state (mirror `settingsEdit`) AND preserve scroll position
  across the rebuild — extend the existing focus-restore block to also re-open that action's palette
  and restore scroll; OR (b) update the changed glyph node(s) in place (the picker's own live-preview
  swatch + the effective-glyph shown on the row) WITHOUT a full `#settings-body` rebuild. Either way,
  after a candidate tap the palette stays open at the same scroll offset.
- **M33 — chosen glyphs get NO per-glyph S27 height tuning, and do NOT add `overflow:hidden` to the
  icon boxes.** A picked glyph inherits the existing per-`data-role` font-size inside the fixed
  ~19.5px icon box as-is; the build adds no glyph-specific size fix-ups. Explicitly do NOT clip the
  icon boxes with `overflow:hidden` — that would hide the exact tofu/overflow signal the PO relies on
  seeing on-device (a clipped tofu box reads as "fine" when it is not).
- **Dev-3 / NB-6 — on-device density re-confirm after a row-icon or aisle-marker glyph change.** S27's
  per-`data-role` font-sizes are calibrated to today's glyph metrics inside the fixed ~19.5px box,
  with `note-toggle` as the height reference the others are tuned against. So changing any
  row-drawn glyph (`note-toggle`, `name-edit`, `move-up`, `move-down`, `delete-item`) or the
  `aisle-marker` overlay is a real-device density signal, not just a render-vs-tofu one: the PO
  re-confirms on-device that the new glyph still sits in the row at the calibrated height without
  reintroducing crowding/overflow (the S26/S27 density that R7's gate closed on).

## 6. Edge cases / non-regression
- **R17a — escape the glyph at EVERY draw-site that builds `innerHTML` (must-fix, gates Lock).** Once
  a hand-editable persisted value flows through `iconFor()`, an unescaped concatenation of a
  corrupt/typo'd glyph (a stray `<`, `>`, `"`) could garble or blank the list. Wrap the glyph in
  `escapeHtml()` at every `iconFor()` draw-site that assembles an innerHTML string. Today's JS glyph
  sites that concatenate UNESCAPED and must be fixed when routed through `iconFor()`: `note-toggle`
  (script.js ~L1723), `name-edit` (~L1752), `move-up`/`move-down` (~L1769–70), `delete-item`
  (~L1812), and the `aisle-marker` `.aisle-glyph` overlay (~L1863). The `auto-detect-option`
  `<option>` (~L1844) ALREADY wraps in `escapeHtml()` — that is the pattern to match. Escaping still
  shows a real-or-tofu glyph as-is (it only neutralizes markup), and pairs with the §3 R17b content
  constraint (which drops a clearly-bad value before it is ever shown). The static-HTML glyphs
  (§2 `applyStaticIcons()`) are set via `.textContent`, which is inherently safe — no escaping needed
  there, only at the innerHTML sites.
- No-override / corrupt-key ⇒ every icon renders exactly as today (the registry-default contract).
- An override set to an empty/whitespace string is treated as "no override" (fall back to default) —
  never render a blank control.
- The three static-HTML glyphs must honor overrides too (see §2), not just the JS-drawn row icons.
- Changing `delete-item` must not change `settings-close` and vice-versa (distinct ids, same current
  glyph) — likewise `auto-aisle-run` vs `auto-detect-option`. This is the **R-ISOLATION** assertion
  (§8): a refactor keyed by glyph instead of by action-id would cross-set these and is exactly what
  R-ISOLATION catches.
- `auto-detect-option` renders inside a native `<option>`; the same glyph may render differently in
  the iOS picker wheel than on the `auto-aisle-run` button — hence Q4 and the per-context NB-6 signal.
- Do not touch S26/S27 row density, R14 timing, or S23 aisle-CRUD behavior.

## 7. Suggested slicing (finalized by SM)
- **S33** — Central icon registry + persisted override resolution (`iconFor()`, `vopping-icons-v1`,
  defensive parse incl. R17b content constraint + R1 array-reject, static+JS draw-sites routed through
  it with R17a escaping at every innerHTML site, `applyStaticIcons()` for the three static glyphs,
  parse-once). **No visible change** (defaults render identically); the regression-safety foundation.
  **The `window.__voppingIcons` test hook MUST land WITH S33** (mirroring `window.__voppingAutoAisle`)
  so S33 is verifiable in its own formal pass BEFORE S34's UI exists — surface: `iconFor`,
  `getRegistry`, `getOverrides`, `ICONS_KEY`, `setIcon`, `resetIcon`, `resetAll`, `applyIcons`
  (see §8).
- **S34** — Settings "Icons" panel: per-action "Change" + candidate palette (plain Unicode, several
  known-iOS-safe) + reset-to-default; applies + persists live; the PO picks the `auto-aisle-run`
  (and any other) glyph on-device. Resolves the U+2B4D tofu. Depends on S33.
- **Sequence:** S33 → S34.

## 8. Pre-Lock review resolutions (folded 2026-09-16 — QA re-read checklist)
Every pre-Lock-review finding, with where its AC now lives. QA re-reads this to confirm **R17** and
**R18** are closed before Lock. Story tag in brackets.

**QA Real findings (must-fix, gate Lock):**
- **R17 [S33]** — corrupt hand-edited override could garble/blank the list. Split into two folded
  requirements: **R17a** escape the glyph at every `iconFor()` innerHTML draw-site (§6, with the exact
  script.js line refs; `auto-detect-option` L1844 already does it); **R17b** a CONTENT constraint in
  the parse — string / non-empty-trimmed / length-capped (≤8 UTF-16 units) / no control-or-markup
  chars, else drop that entry to default (§3). Both, together, not either/or.
- **R18 [S34]** — the palette must survive a candidate tap (open state + scroll). Fold: persist an
  open-palette action-id as render state + preserve scroll, OR update the glyph node in place without
  a full `#settings-body` rebuild (§5). Rationale: the picker IS the on-device decision tool.

**QA minors + nitpicks:**
- **M31 [S33]** — R1 corrupt-store matrix includes the top-level-array case (`Array.isArray`-reject),
  matching the 3 existing parsers (§3).
- **M32 [S33]** — parse the override map ONCE at init into an in-memory object; `iconFor()` reads
  that; no per-icon/per-render `localStorage`+`JSON.parse` (§2).
- **M33 [S34]** — chosen glyphs get no per-glyph S27 height tuning, and NO `overflow:hidden` on the
  icon boxes (would clip the tofu signal) (§5).
- **M34 [S34]** — render each palette candidate in the target draw-site's own font/size (§4).
- **N18 [S33]** — the `auto-aisle-run` glyph write targets the nested aria-hidden `<span>`, NOT
  `#auto-aisle-btn.textContent` (which holds `' Auto-aisle'`) (§2).
- **N19 [S33]** — a `.textContent` static setter (`applyStaticIcons()`) covers header close/gear,
  since `renderSettings()` rebuilds only `#settings-body` (§2).
- **N20 [S33]** — accessible names stay glyph-independent (§2).

**Developer sharpenings:**
- **Dev-1 [S33]** — add a selector hook on the `#auto-aisle-btn` inner span; target it, never the
  button textContent (§2, folded with N18).
- **Dev-2 [S33]** — `applyStaticIcons()` owns the 3 static-HTML glyphs; runs at init AND on every
  override write (§2).
- **Dev-3 [S34]** — after any row-icon or aisle-marker glyph change, require an on-device density
  re-confirm (NB-6); `note-toggle` is the S27 height reference (§5).

**Tester sharpenings:**
- **Named AC assertions (S33 primarily; S34 for the UI-driven ones):**
  - **R-DEFAULT** — no override ⇒ `iconFor(id)` === today's glyph for every id (the §2 byte-identical
    contract).
  - **R-OVERRIDE** — a stored override for an id ⇒ `iconFor(id)` returns it (post content-constraint).
  - **R-EVERYWHERE** — an override applies at ALL draw-sites for that id (JS rows + the 3 static
    glyphs).
  - **R-ISOLATION** — distinct ids that share a glyph today (`delete-item` vs `settings-close`;
    `auto-aisle-run` vs `auto-detect-option`) do NOT cross-set; catches a refactor keyed by glyph
    instead of action-id (§6).
  - **R-NOTHROW** — `iconFor('unknown-id')` returns the defined `FALLBACK_GLYPH` (`□` U+25A1) and never
    throws; the defensive parse never throws on any corrupt store (§2/§3).
- **Test hook lands WITH S33** — `window.__voppingIcons` = { `iconFor`, `getRegistry`,
  `getOverrides`, `ICONS_KEY`, `setIcon`, `resetIcon`, `resetAll`, `applyIcons` }, mirroring
  `window.__voppingAutoAisle`, so S33 is verifiable before S34's UI exists (§7).
- **Palette FROZEN now** — the per-action candidate sets in §4 are frozen (curated plain-Unicode /
  iOS-safe / BMP-preferred / no emoji / avoid U+2B00–2BFF + astral), with **⭍ U+2B4D explicitly
  WHITELISTED** in the non-emoji/avoid guard (deliberate tofu-confirm candidate; same carve-out shape
  as the auto-aisle `lemon→'difficult'` integrity whitelist).
- **Reset scope PINNED** — BOTH per-action reset AND a single reset-all (§3/§5).
- **`iconFor('unknown-id')` PINNED** — returns `FALLBACK_GLYPH` `□` U+25A1, never throws (§2).
- **N23 [S34] (Tester implementation note, added 2026-09-16)** — the non-emoji palette guard MUST
  key on EMOJI-PRESENTATION-DEFAULT (`Emoji_Presentation=Yes`, or a VS16 U+FE0F selector), NOT on
  mere RGI-emoji / `Emoji=Yes` membership: several frozen candidates (✳ U+2733, ✷ U+2737, ✦ U+2726,
  ✧ U+2727, ★ U+2605) are `Emoji=Yes` members that default to TEXT presentation, and an
  RGI-membership guard would false-fail the very candidates it exists to bless (§4).

## Open items for the PO (surface via Orchestrator)
1. **Q4:** treat `auto-aisle-run` (S31 button) and `auto-detect-option` (S32 picker-wheel option) as
   ONE shared pickable icon (one pick fixes both) or TWO independently-pickable entries? They render
   in different contexts. **SM recommendation:** TWO entries sharing one default glyph + one candidate
   set, so the PO *can* pick the same glyph for both but *may* diverge if the picker wheel needs a
   different one. Blocks S33/S34 Lock only; safe working default = two entries.
