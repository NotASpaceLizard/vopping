# Test Plan — S23: create / rename / delete aisles in Settings

**STATUS: DONE — formally executed 2026-09-11, PASS (18/18), 0 open defects. D1 (the sole prior
Minor defect) is FIXED and re-verified green — S23 is clear for its Done-flip.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 8). Full transcript:
`c:\tmp\pw-test\s1-s25-run3-d1fix.log`. D1 re-verify independently corroborated by the multi-delay
probe `c:\tmp\pw-test\vop-probe-rename.js` (transcript `c:\tmp\pw-test\vop-probe-rename-d1fix.log`).
Independent Tester re-pass against the local working-tree code carrying the D1 fix (uncommitted at
re-verify time — expected; the Orchestrator commits after this re-verify). Prior state was the
2026-09-10 pass against pushed sha `027672a` (17/18, D1 open) — see the resolved-defect note below.

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
**18/18 PASS — D1 CLOSED (re-verified 2026-09-11). No open defects.**

All create/delete/bucket outcomes, NB-2 normalized cascade, M21 exclude-self, M22 rename-blur-revert,
authoritative-set-no-resurrect, font-size proxies, and undo-neutrality pass. Create-side validation
(TC23.6/23.7/23.8) passes including the correct stay-open + inline message on an explicit invalid
create commit. **TC23.10 now PASSES**: an EXPLICIT commit (Enter/Save) of an invalid/colliding rename
STAYS OPEN (rename input present, `renInputOpen=1`), shows the inline error ("That aisle already
exists.", `renErr=1`), and leaves state unchanged (`state.aisles` still has "DAIRY", no duplicate
"Bakery"). This now matches the create-side behavior — the asymmetry that pinned D1 is resolved.

Adjacent-path no-regression re-confirmed in the same run: TC23.6 CREATE-invalid still stays open with
its message; TC23.2/TC23.9 VALID rename commits + closes + cascades over items by normalized key;
TC23.11 (M22) blur-DISMISS of a rename still reverts and closes with no rename; TC23.4 delete-in-use
still reverts affected items to the no-aisle bucket (`''`) and removes the entry without blocking.

**DEFECT D1 (Minor) — RESOLVED 2026-09-11 (was OPEN as of the 2026-09-10 pass).** Prior failure: on
an EXPLICIT commit of an invalid/colliding **rename**, the rename editor did not stay open with an
inline message — it closed immediately and reverted, contradicting NB-3 ("explicit invalid commit →
field open + state unchanged"). Rejection itself was always correct (state unchanged, no data
corruption); the gap was a missing user-facing error on the rename path only. **Root cause (confirmed
against the fix):** the Settings `focusout` revert handler (M22) lacked the `activeElement` guard the
row-level editor's `focusout` handler has. When `commitSettingsRename()` re-rendered to show the error
and re-focused the fresh rename-input, the OLD input's removal fired a `focusout` scheduling the
deferred M22 revert; because `settingsEdit` was the same object (only `.error` mutated), the deferred
revert nulled it and re-rendered without the editor — the blur-revert raced and won over the stay-open.
**Fix (Developer, uncommitted at re-verify — script.js ~1614-1622):** the Settings `focusout` handler
now skips the deferred revert while `document.activeElement` is still an `aisle-rename-input` inside
the settings overlay, mirroring the row-editor guard at script.js ~1363-1365. A genuine
blur-to-elsewhere still lands focus outside that control and reverts (M22 preserved — TC23.11 still
passes). **Re-verify evidence:** multi-delay probe `c:\tmp\pw-test\vop-probe-rename.js` now reports
`renameInput=1, renameError=1, errorText="That aisle already exists.", active=aisle-rename-input` at
ALL sampled delays (+10/+30/+60/+120/+250ms) — vs pre-fix `renameInput=0, renameError=0` already at
+10ms — with final aisles unchanged; the create-side error persists for contrast. Transcript:
`c:\tmp\pw-test\vop-probe-rename-d1fix.log`.

**Overall verdict: 18/18 PASS, 0 open defects — S23 is clear for its Done-flip.** Everything in the
aisle rework is clean (S21/S22/S24/S25 all pass). Full suite: 269/269 — see `REGRESSION_LOG.md`
2026-09-11 row, script `vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run3-d1fix.log` (Part 8, 269/269).
D1 re-verify corroborated via `c:\tmp\pw-test\vop-probe-rename.js` → `c:\tmp\pw-test\vop-probe-rename-d1fix.log`.
TC23.10's assertion was strengthened in place to explicitly require the rename input to remain present
(`renInputOpen === 1`), not just the inline error span — so the "STAYS OPEN" clause is asserted
directly, not merely inferred. Zero console/page errors, zero dialogs, zero non-`file://` network
requests across the entire run.
