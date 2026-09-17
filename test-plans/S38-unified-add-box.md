# Test Plan — S38: ONE unified add box (single item OR multi-line paste)

**STATUS: DONE (desktop-verifiable AC) — independent Tester formal pass 2026-09-17, PASS as part of the
combined 516/516 Sprint-8 run (Part 27), zero defects; reproduced twice.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 27); transcripts
`c:/tmp/pw-test/s37-s39-runA.log` + `s37-s39-runB.log` (both 516/516). See `REGRESSION_LOG.md`'s
2026-09-17 row. **NB-6 device-only signals ride the PO's on-device check — see the note below.**

**Story:** As a user, I want ONE add box that handles both a single typed item and a multi-line paste,
so that I don't have to choose between two separate add controls for what is really the same action.

**Acceptance criteria (condensed from BACKLOG.md S38 row, locked):** consolidate S1's always-visible
single-add field and S4's separate collapsible "Paste a list" panel into ONE always-visible field.
REMOVE the `<details class="paste-panel">` + `#paste-form`/`#paste-input`/"Add all" and its submit
handler. The one control accepts one-or-many: a single line + Enter/Add creates one item; a multi-line
paste creates many. BOTH paths route through S4's EXISTING `parsePasteLines()` (`\r?\n` split, blank
lines skipped, `LEADING_LIST_MARKER_RE` leading-marker strip, no de-dup) then a single batched add.
One add gesture == ONE S6 undo action (single add and the whole multi-line paste each snapshot as one
`{type:'add', ids:[…]}`). Empty/whitespace-only input stays a no-op. S10 frequency increments on BOTH
paths (via `createItem()`). **Build decision (Dev, confirmed):** the unified field is a
`<textarea id="add-input" rows="1">` so a paste retains its newlines — plain Enter submits (one item,
or a whole multi-line paste as one batch); Shift+Enter inserts a literal newline. Do NOT regress S1's
add/persist, S4's marker-strip/blank-skip parsing, or S6's single-slot undo.

**Deliverable under test:** `index.html` (textarea replaces the `<input>`; paste panel removed),
`script.js` (`submitAdd()` routes both paths through `addPastedItems()`; the `#add-input` keydown
handler submits on plain Enter, newline on Shift+Enter; `pasteForm`/`pasteInput` refs + handler
removed), `style.css` (`.add-form textarea`). Opened via `file://`.

**Tooling:** Playwright (`playwright-core`), `channel: 'chrome'`, headless, 390×700.

## Test cases
| ID | Covers AC | Expected |
|----|-----------|----------|
| S38.1 | clean init after panel removal | no `.paste-panel`/`#paste-form`/`#paste-input`; `#add-input` is a `<textarea>`; no null-ref throw at init |
| S38.2 | single line + Enter = one | one item added, field cleared |
| S38.3 | single via Add button | Add button submits one typed line as one item |
| S38.4 | paste adds many (verbatim S4) | multi-line via Enter → Chicken/Rice/Paper towels/Coffee/Plain Item/Indented Marker, `-NoSpaceMarker` verbatim, no bare `-` junk |
| S38.5 | no de-dup (M5) | pasting the same line twice creates two items |
| S38.6 | whitespace-only no-op | submitting only blank/whitespace lines adds nothing |
| S38.7 | typed-line marker-strip | `- Bananas` typed on one line strips to `Bananas` (shared ingest, accepted per AC) |
| S38.8 | single add = one S6 undo | one Undo removes the single add |
| S38.9 | multi-line paste = ONE atomic S6 batch | a 3-line paste + one Undo removes the whole batch |
| S38.10 | S10 frequency on BOTH paths | single add and paste each increment the frequency counter (yogurt 1→2, kale 1) |
| S38.11 | Shift+Enter = newline, no submit | Shift+Enter inserts `\n`, adds no item mid-compose |
| S38.12 | compose-then-submit | plain Enter after a Shift+Enter compose submits the whole multi-line as one batch |

## Results
All 12 checks PASS (Part 27 of the combined suite). Verbatim PASS lines:
```
PASS - S38.1 (clean init after paste-panel removal) ... #add-input is a <textarea> ... init threw NO console/page error
PASS - S38.2 (single line + Enter = one item) ... adds exactly one item and clears the field
PASS - S38.3 (Add button = one item too) ...
PASS - S38.4 (paste adds many, verbatim S4 ingest) ... -NoSpaceMarker kept verbatim, no bare "-" junk row
PASS - S38.5 (no de-dup, M5) pasting the same line twice creates two independent items
PASS - S38.6 (whitespace-only = no-op) submitting only whitespace/blank lines adds NO item
PASS - S38.7 (typed-line marker-strip) "- Bananas" is stripped to "Bananas"
PASS - S38.8 (single add = one S6 undo action) one Undo removes it
PASS - S38.9 (multi-line paste = ONE S6 undo batch) ... ONE Undo removes the WHOLE batch atomically
PASS - S38.10 (S10 frequency on BOTH paths) ... yogurt 1->2, kale newly 1
PASS - S38.11 (Shift+Enter = newline, no submit) ... adds NO item mid-compose
PASS - S38.12 (compose-then-submit) ... submits the whole multi-line value as one batch (two items)
```

**Overall verdict: PASS, 0 defects in S38.**

## NB-6 (device-only — NOT asserted on desktop; rides the PO's on-device check)
The desktop pass exercises the STRUCTURAL behavior (textarea, Enter/Shift+Enter keydown, batched
ingest, undo, frequency) via `page.fill`/`page.press`/`page.keyboard`. Two things can only be
confirmed on the PO's iPhone: (1) a REAL iOS clipboard **paste** event delivering newline-bearing
text into the `<textarea>` (Playwright sets `.value` / types; it does not synthesize the OS paste),
and (2) the iOS soft-keyboard **Return/Go** key behavior on a `<textarea>` (submit vs newline). These
ride the PO's on-device acceptance signal in parallel, per the NB-6 convention.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s27-formal.js` (Part 27). The Part-1/Part-2 S4-paste
regression cases (S4 marker-strip + TC9.15/TC10.2/TC10.3/TC10.9) were RETROFITTED in place from the
removed `#paste-form`/`#paste-input` to the unified `#add-input` and re-confirmed clean in the same
run. Reproduced twice — `c:/tmp/pw-test/s37-s39-runA.log` and `s37-s39-runB.log`, both 516/516, zero
console/page errors, zero dialogs, zero non-`file://` requests.
