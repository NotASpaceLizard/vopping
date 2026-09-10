# Test Plan — S25: per-item note field ≥16px (iOS zoom fix)

**STATUS: DONE — formally executed 2026-09-10, PASS (3/3), 0 defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 11). Full transcript:
`c:\tmp\pw-test\s1-s25-run2.log`. Independent Tester formal pass against pushed sha `027672a`.

**Note on story status:** BACKLOG.md's S25 row still reads "Not Started / pre-pipeline" (it entered
the pipeline a stage behind S21–S24), but the fix shipped as part of sha `027672a` (commit message:
"note-field zoom fix"), so its structural proxy is verified here alongside the rest of the rework, per
the Orchestrator's formal-pass scope. The BACKLOG row status is Scrum-Master-owned.

**Story:** As a user, I want the per-item note field to stop making the app zoom in on my phone, so
that adding or editing a note is as smooth as the aisle picker now is.

**Acceptance criteria (condensed from BACKLOG.md draft):** bump the note editor input
(`.row-meta-input`) to font-size ≥16px (was 0.82rem/~13px, below iOS's 16px focus-zoom threshold).
The note STAYS a free-text `<input>` — no select conversion, no data-model change, no commit-model
change; only the font-size. Testability: the desktop pass asserts the note input's computed
font-size ≥16px; on-device zoom-elimination is a non-blocking REAL-DEVICE signal, NOT a desktop gate
(NB-6).

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, sha `027672a`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Trivial, single structural proxy: computed font-size ≥16px on the note input. NB-6 discipline —
on-device zoom is not asserted in Chromium. Scope-guard checks confirm the note stayed a free-text
`<input>` with unchanged commit behavior.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC25.1 | iOS proxy (NB-6) | the per-item note editor input computed font-size ≥16px |
| TC25.2 | scope guard | the note field stays a free-text `<input>` (no select conversion) |
| TC25.3 | behavior unchanged | a note still commits and displays as free text |

## Results
**3/3 PASS, 0 defects.** Note input computed font-size = 16px (`.row-meta-input` at 1rem — S24's
new-aisle reveal input shares this class and is likewise ≥16px, cross-covered by S24 TC24.2). The
note field is an `<input>` (tag = INPUT); a note commits and displays ("half gallon") unchanged.

**Overall verdict: PASS (3/3), 0 defects.** Full suite: 268/269 (the lone fail is defect D1 on S23,
unrelated to S25) — see `REGRESSION_LOG.md` 2026-09-10 row, script
`vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run2.log` (Part 11). Zero
console/page errors, zero dialogs, zero non-`file://` network requests.
