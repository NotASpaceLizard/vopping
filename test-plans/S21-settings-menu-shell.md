# Test Plan — S21: settings menu shell

**STATUS: DONE — formally executed 2026-09-10, PASS (11/11), 0 defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s25-formal.js` (Part 10). Full transcript:
`c:\tmp\pw-test\s1-s25-run2.log`. Independent Tester formal pass against pushed sha `027672a`.

**Story:** As a user, I want a settings menu I can open from the top of the app, so that
less-frequent actions and future features have a home without cluttering the main shopping screen.

**Acceptance criteria (condensed from BACKLOG.md, Locked 2026-09-10):** a settings entry point in the
existing top header opens/closes a panel that can host feature controls; the panel's first real
content is S23's aisle management (this story delivers the frame + open/close + a mount point). Close
mechanism (NB-5): explicit X control AND a tap on the scrim/outside the panel (Escape optional).
Phone-first: usable at 320/360/375/390px. Any glyph is a plain monochrome Unicode symbol (placeholder,
PO pick pending). Any text input the shell introduces must be font-size ≥16px (iOS guard).

**Deliverable under test:** `index.html`/`script.js`/`style.css` via `file://`, sha `027672a`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, viewport 390×700.

## Testability review summary (for scrum-master)
Testability-check (NB-5) asked the AC to name the close mechanism — it now does (X + scrim/outside).
All S21 clauses reduce to DOM/visibility assertions. The `#settings-btn` glyph is treated
glyph-agnostically (placeholder, PO pick pending — same convention as S16/S7): asserted present and
monochrome-text, not asserted as a specific character.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| TC21.1 | entry point | `#settings-btn` exists in the header |
| TC21.2 | open | tapping it makes the hidden overlay visible; panel `role="dialog"` |
| TC21.3 | mounts feature content | panel hosts S23's create field + manage list |
| TC21.8 | glyph | entry point renders a monochrome text glyph (placeholder ⚙, not asserted as a requirement) |
| TC21.4 | close via X (NB-5) | the explicit X control closes the panel |
| TC21.5 | close via scrim (NB-5) | a tap on the scrim/outside closes the panel |
| TC21.6 | iOS proxy (NB-6) | every text input the shell introduces has computed font-size ≥16px |
| TC21.7 ×4 | phone-first | no horizontal overflow with the panel open at 320/360/375/390px |

## Results
**11/11 PASS, 0 defects.** Panel opens (hidden→visible, `role="dialog"`), hosts the S23 create
field + manage list, closes cleanly via BOTH the X control and a scrim tap. Zero inputs below 16px in
the overlay. Zero horizontal overflow with the panel open at all four widths. Entry-point glyph
present (⚙, glyph-agnostic).

**Overall verdict: PASS (11/11), 0 defects.** Full suite: 268/269 (the lone fail is defect D1 on
S23, unrelated to S21) — see `REGRESSION_LOG.md` 2026-09-10 row, script
`vopping-tests-tester-s1-s25-formal.js`.

## Commands run and output
`node vopping-tests-tester-s1-s25-formal.js` → `c:\tmp\pw-test\s1-s25-run2.log` (Part 10). Zero
console/page errors, zero dialogs, zero non-`file://` network requests.
