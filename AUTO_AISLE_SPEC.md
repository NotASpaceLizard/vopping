# Auto-Aisle — Feature Specification

**Status:** research complete (PO + Orchestrator, 2026-09-14). Handed to the Scrum Master to slice into stories.

## Goal
Automatically assign aisles to grocery-list items so the user rarely hand-sets one. **On-demand** (never silent-on-add), at two scopes: a whole-list button and a per-item action. The feature **learns from every manual correction** so a wrong guess is never repeated.

## Context / constraints
- Single-user, **fully offline**, plain HTML/CSS/JS + localStorage. Primary device: **Safari/iOS on a phone**. Deployed to the PO's phone via GitHub Pages (`NotASpaceLizard/vopping`).
- Builds on the existing aisle system: per-item `item.aisle` string; persisted `state.aisles` set (S22 `migrateAisles`); case-insensitive `normalize()`; the per-item aisle affordance is the ⌖ (U+2316) collapsed native `<select>` on the row's primary line (S26). Create/rename/delete aisles in Settings (S23); "+ Add new aisle…" from the picker (S24).
- **No emoji icons** — plain Unicode glyphs only. PO is colorblind (Okabe-Ito if color is ever introduced; not expected here).
- Do not regress S26/S27 row layout or the R14 render-timing / focus fixes.

## 1. Aisle taxonomy (expanded to 18)
Store-walk order; **"Other" stays the no-aisle bucket**:

`Produce · Meat · Seafood · Deli · Bakery · Dairy & Eggs · Frozen · Cereal & Breakfast · Canned & Jarred · Pasta, Rice & Grains · Baking & Spices · Condiments & Sauces · Snacks & Candy · Beverages · Household & Cleaning · Personal Care & Health · Pantry · Other`

- **Migration:** extend the existing S22 seeding so the aisle set includes these new starters, **unioned with the user's existing aisles** (never drop user-created/renamed aisles or re-map existing per-item aisles).
- Custom aisles (user-created via S23) coexist with the taxonomy.

## 2. Item→aisle dictionary
- Ships **in-app as a static JS object** (offline). Seed artifact: `AISLE_DICTIONARY.draft.js` → `window.AISLE_DICTIONARY = { "<aisle>": [ { name, aliases: [] } ] }`. ~1,286 items across the 17 real aisles; reconciled for cross-aisle duplicates; PO reviewed/edited Produce (rest to be refined organically).
- **Keep it a readable, hand-editable data file** — the PO edits it directly; do not minify or make it generated-only.
- **Load order:** before `script.js`, so `window.AISLE_DICTIONARY` is available at init.
- The dictionary is a *starting point*, not required to be exhaustive — §3.3 learning + hand edits close the gap over time.

## 3. Behavior

### 3.1 List-wide "Auto-aisle" button
- **Placement:** header, next to the sort control.
- **Presentation:** ⭍ (**U+2B4D**) glyph + a short text label ("Auto-aisle"). If ⭍ fails to render on iOS (tofu box), fall back to ↯ (**U+21AF**). Confirm rendering on the PO's actual device (NB-6).
- **Action:** for every item that currently has **no aisle** (empty / "Other"), run the matcher (§3.4) and assign the best aisle. **Never touch an item that already has an aisle** (manual or previously auto-set).
- **Feedback:** a toast summary, e.g. `Sorted 12 · 3 couldn't be matched.` Unmatched items stay unaisled.
- **Undo:** treat the whole run as **one undoable action** via the existing S6 undo (recommended). *(Team to confirm feasibility; if the single-slot undo can't hold a bulk change, flag it.)*

### 3.2 Per-item auto-aisle
- **Trigger lives inside the existing ⌖ aisle picker** as a top option (e.g. "⭍ Auto-detect"), **NOT a new row icon** — protect the row density won by S26/S27.
- **Action:** run the matcher for that one item and set its aisle. Because this is an explicit per-item request, it **may overwrite** an existing aisle on that item.

### 3.3 Learning — personal override map
- Whenever the user sets/changes an item's aisle **by hand** (via the ⌖ picker: an existing aisle, a new aisle, or clearing to no-aisle) — **not** via an auto-aisle run — record `normalize(item.name) → aisle` in a **persisted personal override map** in localStorage (its own key, alongside existing state).
- This is how **custom aisles** get auto-populated (the built-in dictionary only knows the 17 canonical aisles).
- **Open sub-decision (flag to PO):** should a manual **clear to no-aisle** record an override to `""` (so future auto-runs respect "this item has no aisle"), or should only non-empty picks be learned? Recommendation: learn non-empty picks; treat clear-to-no-aisle as *not* an override (so a later auto-run can still fill it). Confirm with PO.

### 3.4 Matching algorithm & precedence
For a given item name, resolve in this order — **first hit wins**:
1. **Personal override** — exact match on `normalize(name)`.
2. **Dictionary — canonical exact** — `normalize(name)` equals a canonical name.
3. **Dictionary — alias exact** — `normalize(name)` equals an alias.
4. **Dictionary — token/substring** — the normalized item text *contains* a canonical or alias as a whole token (handles "chicken breast" → chicken, and tolerates a leading quantity/unit or trailing descriptor, e.g. "2 lbs organic bananas" → banana). Prefer the **longest / most-specific** match; on ties, **canonical beats alias**.
5. **No match** → leave unaisled ("Other"); counts toward the toast's "couldn't be matched".
- **FIRM requirement:** canonical-exact beats alias (tier 2 before 3), and exact beats substring (2–3 before 4). This is what resolves the **68 alias↔canonical cross-aisle collisions** in the sensible direction (bare "broccoli" → Produce, not Frozen; "shrimp" → Seafood, not Frozen).
- Reuse `normalize()`. Matching must tolerate leading quantities/units, punctuation, and common descriptors; the dictionary already enumerates plural/variant aliases, so heavy stemming is not required, but token matching must not be defeated by a leading "2 lbs " or a trailing "(organic)".

## 4. Data / storage
- `window.AISLE_DICTIONARY`: static, bundled, pushed (part of the app).
- Personal override map: localStorage, persisted with the rest of app state, survives reloads.
- **No network** — everything offline.
- Build a normalized lookup once at load (`name`/`alias` → aisle) so tiers 2–3 are O(1); the substring tier iterates keys only as needed. Must stay fast for a list of dozens of items against ~1,286 entries on a phone.

## 5. Edge cases / notes
- Alias-vs-alias cross-aisle collisions (a term that's an alias in two aisles, canonical in none) are rare — resolve deterministically (first in store-walk order) or flag; low priority.
- NB-6: iOS glyph rendering (⭍) and any native-picker interaction are **real-device** acceptance signals; desktop verifies structure.
- The per-item "Auto-detect" option must not reintroduce the R14 render-timing / picker-reopen behavior (S26 saga).

## 6. Suggested story slicing (SM to finalize)
- **A.** Expand aisle taxonomy + migration (18 aisles, seed extension, preserve user aisles).
- **B.** Ship the dictionary data file + normalized lookup + the matcher (tiers 2–5) with tests.
- **C.** Personal override map (record on manual pick; tier-1 precedence; custom-aisle support).
- **D.** List-wide "Auto-aisle" header button (⭍ + label, fill-empty-only, toast summary, undoable run).
- **E.** Per-item "Auto-detect" option inside the ⌖ picker.
- **Sequence:** A → B → C → (D, E). D and E depend on B + C.

## Open items for the PO (surface via Orchestrator)
1. Bulk auto-aisle run as a single undo (§3.1) — confirm desired, and acceptable if it displaces the current single last-action undo slot.
2. Clear-to-no-aisle as a learned override or not (§3.3).
