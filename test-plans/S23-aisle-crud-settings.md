# Test Plan — S23: create / rename / delete aisles in Settings

**STATUS: FORMAL PASS EXECUTED 2026-09-10 — 17/18 PASS, 1 Minor defect OPEN (D1). NOT Done —
S23's Done-flip is blocked pending the D1 fix + re-verify.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 8). Full transcript:
`c:\tmp\pw-test\s1-s25-run2.log`. Independent Tester formal pass against pushed sha `027672a`.

**Story:** As a user, I want to create, rename, and delete aisles from the settings menu, so that my
aisle list matches the store I'm actually shopping in.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-10):** manage `state.aisles` inside
the S21 panel — create, rename, delete. RENAME a real aisle cascades the new string over every item
using it (by NORMALIZED key, NB-2) + updates the entry; RENAME "Other" updates
`state.unassignedLabel` only. DELETE an in-use aisle reverts matching items to `''` (no-aisle bucket,
NB-2 normalized match) + removes the entry, does NOT block. DELETE the "Other" entry drops the label
to a built-in "Unassigned" fallback (no-aisle STATE persists; N11: a real "Other" becomes creatable
again). Create AND rename validation: reject empty/whitespace; reject a normalized duplicate of an
existing entry OR the bucket label OR the S24 sentinel label; rename collision check EXCLUDES the
entry being renamed (M21). Rejection signal (NB-3) + blur reconciliation (M22): on an EXPLICIT commit
of an invalid/colliding name the field STAYS OPEN + a brief inline message is shown (no-op, state
unchanged); on BLUR dismissal without an explicit commit, revert WINS. Create/rename fields font-size
≥16px. Undo/safety (NB-4): CRUD is not undo-eligible (working default).

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, sha `027672a`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Pre-implementation testability-check confirmed all CRUD outcomes + validation rejections are
deterministic state/DOM assertions. NB-2 (normalized cascade) flagged as having teeth — tested
explicitly against a migrated non-canonical value ("produce"). NB-3/M22 dismissal fork tested for
both create and rename. No blocking testability gaps at Lock.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC23.1 / 23.1b | create | new aisle added to `state.aisles` + offered as an option in every per-item select |
| TC23.2 | rename cascade (NB-2) | rename "Produce"→"Fruit" cascades over BOTH canonical "Produce" AND non-canonical "produce" items by normalized key |
| TC23.3 / 23.3b | rename bucket | updates `state.unassignedLabel` only, no item change; the no-aisle option relabels everywhere |
| TC23.4 | delete in-use | matching items → `''`, entry removed, no block |
| TC23.5 / 23.5b | delete bucket label | falls back to "Unassigned"; N11 — a real "Other" becomes creatable after |
| TC23.6 | create dup vs aisle | "dairy" vs "Dairy" rejected — stays open + message, state unchanged |
| TC23.7 | create dup vs bucket | "other" vs "Other" rejected (prevents two-Others ambiguity) |
| TC23.8 | create empty | whitespace-only = no-op |
| TC23.9 | rename exclude-self (M21) | pure re-casing "Dairy"→"DAIRY" accepted, not self-rejected |
| **TC23.10** | **rename dup vs other (NB-3)** | **renaming to a DIFFERENT aisle's name rejected — STAYS OPEN + message, state unchanged** |
| TC23.11 | rename blur revert (M22) | blur dismissal reverts, editor closes, no rename |
| TC23.12 | authoritative set | a deleted starter ("Frozen") does not resurrect on reload |
| TC23.13 / 23.13b | iOS proxy (NB-6) | create + rename inputs font-size ≥16px |
| TC23.14 | undo-neutral (NB-4) | CRUD not undo-eligible, does not clobber a pending undo target |

## Results
**17/18 PASS, 1 Minor defect (D1) — TC23.10 FAILS.**

All create/delete/bucket outcomes, NB-2 normalized cascade, M21 exclude-self, M22 rename-blur-revert,
authoritative-set-no-resurrect, font-size proxies, and undo-neutrality pass. Create-side validation
(TC23.6/23.7/23.8) passes including the correct stay-open + inline message on an explicit invalid
create commit.

**DEFECT D1 (Minor, OPEN) — TC23.10:** On an EXPLICIT commit (Enter/Save) of an invalid/colliding
**rename**, the rename editor does NOT stay open with an inline message — it closes immediately and
reverts, contradicting NB-3 ("explicit invalid commit → field open + state unchanged"). The rename
is still correctly REJECTED (state unchanged, no data corruption), so impact is a missing user-facing
error message on the rename path only. **Asymmetry that pins it:** the CREATE flow correctly stays
open with its message ("That aisle already exists.") on the same class of invalid commit (TC23.6
passes) — so this is an unintended rename-path gap, not a deliberate design choice.
**Root cause (diagnosed):** the Settings `focusout` revert handler (M22, script.js ~1608) lacks the
`activeElement` guard that the row-level editor's `focusout` handler has (script.js ~1363–1365). When
`commitSettingsRename()` re-renders to show the error and re-focuses the fresh rename-input, the OLD
input's removal fires a `focusout` that schedules the deferred M22 revert; because `settingsEdit` is
still the same object (only `.error` was mutated), the deferred revert nulls it and re-renders
without the editor — the blur-revert races and wins over the stay-open. Confirmed deterministically
via `c:\tmp\pw-test\vop-probe-rename.js`: at +10ms already `renameInput=0, renameError=0`; state
stays correctly unchanged; create-side error correctly persists for contrast.
**Suggested fix:** add the same `activeElement`/`role`-in-list guard to the Settings `focusout`
handler (skip the deferred revert while focus is still on a `aisle-rename-input`), mirroring the
row-editor fix that makes S24's TC24.7 pass. Routed to Developer via Orchestrator.

**Overall verdict: 17/18, 1 Minor defect (D1) open — S23 NOT Done until D1 is fixed and TC23.10
re-verifies green.** Everything else in the aisle rework is clean (S21/S22/S24/S25 all pass). Full
suite: 268/269 — see `REGRESSION_LOG.md` 2026-09-10 row, script `vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run2.log` (Part 8). Defect D1
isolated + confirmed via `c:\tmp\pw-test\vop-probe-rename.js`. Zero console/page errors, zero dialogs,
zero non-`file://` network requests.
