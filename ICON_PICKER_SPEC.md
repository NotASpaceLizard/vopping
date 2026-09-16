# Settings Icon Picker (all app icons) — Feature Specification

**Status:** sliced by the Scrum Master, 2026-09-16, into S33 (foundation) + S34 (picker UI).
Awaiting the standard pre-Lock review (Developer feasibility / Tester testability / QA hazard)
before Lock and build. Supersedes the old pre-agreed U+2B4D→U+21AF blind-swap fallback.

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
- **Static glyphs too:** three glyphs live in static `index.html` (`settings-gear`,
  `settings-close`, `auto-aisle-run`). For "applies everywhere," script.js must set those elements'
  glyph from `iconFor()` at init (and on any change) rather than trusting the hardcoded HTML — OR the
  registry is the sole writer and the HTML holds only a neutral placeholder. Developer's call on
  mechanism; the guarantee is that a picked glyph shows on those three too, not just the JS-rendered
  row icons.
- Unknown/stale action-ids in storage are ignored; a known id with no override falls back to default.

## 3. Persistence
- New localStorage key **`vopping-icons-v1`**, an object `{ "<action-id>": "<glyph>" }` holding only
  the actions the PO has actively changed (sparse — absent id ⇒ use default).
- **Defensive parse (R1 posture used across this app):** never throw before render. On parse failure
  / `null` / non-object / an entry whose value isn't a usable non-empty string, fall back to an empty
  override map (⇒ all defaults). Unknown keys and glyphs for unknown ids are dropped silently.
- **Reset:** a per-action "reset to default" affordance and/or a single "reset all icons to default"
  (clears the key). Worth including so a PO who paints themselves into a tofu corner can always get
  back to a known-rendering baseline.
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

**Proposed per-action candidate sets (starting point for the PO's on-device pick — not final):**
- `auto-aisle-run` / `auto-detect-option` (needs a *rendering* replacement for U+2B4D): ↯ U+21AF ·
  ⌁ U+2301 · ⚡ (only if it renders monochrome, else drop) · ✦ U+2726 · ✧ U+2727 · ✳ U+2733 · ✷
  U+2737 · ⟳ U+27F3 · ⊛ U+229B · ★ U+2605. (⭍ stays available so the PO can confirm it's the tofu.)
- `settings-gear`: ⚙ U+2699 · ⛭ U+26ED · ☰ U+2630 · ⋮ U+22EE · ⚒ U+2692 · ✜ U+271C.
- `note-toggle`: ✎ U+270E · ✐ U+2790-adjacent (verify) · ☰ U+2630 · ▤ U+25A4 · ≡ U+2261 · ✍ U+270D
  · ⊞ U+229E.
- `name-edit`: ✎ U+270E · ✏ (verify monochrome) · ✐ · ✍ U+270D.
- `move-up` / `move-down`: ▲/▼ U+25B2/25BC · ↑/↓ U+2191/2193 · ⌃/⌄ U+2303/2304 · ∧/∨ U+2227/2228 ·
  ‹/› .
- `delete-item`: ✕ U+2715 · ✗ U+2717 · × U+00D7 · ⌫ U+232B · ⊘ U+2298 · ⦸ U+29B8.
- `settings-close`: ✕ U+2715 · ✗ U+2717 · × U+00D7 · ⨯ U+2A2F.
- `aisle-marker`: ⌖ U+2316 · ⚑ U+2691 · ⚐ U+2690 · ◉ U+25C9 · ⊚ U+229A · ▣ U+25A3 · ⌂ U+2302.

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
- A per-action reset and/or a global "reset all icons to default".
- Must reuse the S21/S23 settings machinery and its focus-preservation pattern; introduce no per-row
  render seam and no new R14-class hazard.

## 6. Edge cases / non-regression
- No-override / corrupt-key ⇒ every icon renders exactly as today (the registry-default contract).
- An override set to an empty/whitespace string is treated as "no override" (fall back to default) —
  never render a blank control.
- The three static-HTML glyphs must honor overrides too (see §2), not just the JS-drawn row icons.
- Changing `delete-item` must not change `settings-close` and vice-versa (distinct ids, same current
  glyph).
- `auto-detect-option` renders inside a native `<option>`; the same glyph may render differently in
  the iOS picker wheel than on the `auto-aisle-run` button — hence Q4 and the per-context NB-6 signal.
- Do not touch S26/S27 row density, R14 timing, or S23 aisle-CRUD behavior.

## 7. Suggested slicing (finalized by SM)
- **S33** — Central icon registry + persisted override resolution (`iconFor()`, `vopping-icons-v1`,
  defensive parse, static+JS draw-sites routed through it). **No visible change** (defaults render
  identically); the regression-safety foundation.
- **S34** — Settings "Icons" panel: per-action "Change" + candidate palette (plain Unicode, several
  known-iOS-safe) + reset-to-default; applies + persists live; the PO picks the `auto-aisle-run`
  (and any other) glyph on-device. Resolves the U+2B4D tofu. Depends on S33.
- **Sequence:** S33 → S34.

## Open items for the PO (surface via Orchestrator)
1. **Q4:** treat `auto-aisle-run` (S31 button) and `auto-detect-option` (S32 picker-wheel option) as
   ONE shared pickable icon (one pick fixes both) or TWO independently-pickable entries? They render
   in different contexts. **SM recommendation:** TWO entries sharing one default glyph + one candidate
   set, so the PO *can* pick the same glyph for both but *may* diverge if the picker wheel needs a
   different one. Blocks S33/S34 Lock only; safe working default = two entries.
