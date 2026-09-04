# Test Plan — S4: Paste-to-ingest bulk add

**STATUS: DONE — re-verified 2026-09-04 after Developer's fix, PASS (69/69, includes 2 new
fix-verification checks added for this re-run), zero defects remaining.** The TC4.3 defect found
during the original 2026-09-04 formal pass (below) has been fixed by Developer and independently
re-verified against the live app — see "Re-verification" section at the end of this file. Original
pass and defect write-up left intact, not silently edited, per this project's transparency
convention. Citation of record: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`.

**Story:** As a user, I want to paste freeform text into a box and have it add one item per
line, so that I don't have to type each item individually.

**Acceptance criteria (verbatim, BACKLOG.md, locked 2026-09-04):** separate textarea + Add
control; splits on `\r?\n`; strips a fixed, small set of leading list-marker glyphs (`-`, `*`,
`•`, or `N.`/`N)`) followed by whitespace, then trims — real ingredient parsing is explicitly out
of scope (S11, parked); blank lines skipped, no empty rows; whole-blank input (zero non-blank
lines) is a no-op, same as S1's single-add precedent — textarea left exactly as typed; new items
append at the end, preserving pasted order; textarea clears only on a successful (non-zero-item)
ingest; whole paste operation counts as ONE atomic action for S6's undo — **this clause was
flagged at testability-check time as not independently verifiable until S6 shipped; now verified
directly, see TC4.7.**

**Deliverable under test:** `index.html`/`script.js`/`style.css`, `file://` URL. Implemented
2026-09-04.

**Tooling:** Same as S1.

## Testability review summary (for scrum-master)
Both gaps flagged pre-lock are resolved: the blank-paste no-op behavior is now explicit in
BACKLOG.md (and verified below), and the S6 forward-reference is closed now that S6 exists.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC4.1 | Marker-stripping, all four glyph forms | Paste `- Chicken`, `1. Rice`, `* Paper towels`, `2) Coffee`, `Plain Item` | Items added as `Chicken`, `Rice`, `Paper towels`, `Coffee`, `Plain Item` (markers stripped, not left in the name) |
| TC4.2 | Marker regex requires whitespace after the glyph (boundary case) | Paste `-NoSpaceMarker` and `•NoSpaceBullet` (no space after the glyph) | Added verbatim, NOT stripped — `-NoSpaceMarker`/`•NoSpaceBullet` |
| TC4.3 | A line that's only a marker+space, nothing after (boundary case) | Paste a line `"- "` (dash, space, nothing) | Intent: no real item created (pure formatting noise, nothing to ingest). **Actual/found:** see Findings — a literal `"-"` item IS created. |
| TC4.4 | Blank lines skipped | Paste text with blank lines interspersed | No empty rows |
| TC4.5 | Textarea clears only on successful ingest | Paste valid lines, submit | Textarea empty afterward |
| TC4.6 | Whole-blank paste is a no-op | Paste only whitespace/blank lines, submit | Item count unchanged; textarea left exactly as typed (not cleared) |
| TC4.7 | Whole batch is ONE atomic undo action | Paste multiple lines, click Undo once | ALL pasted items removed in that single Undo, not one at a time |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC4.1 | All 5 target names present in rendered list | Pass |
| TC4.2 | Both `-NoSpaceMarker` and `•NoSpaceBullet` present verbatim, unstripped | Pass |
| TC4.3 | No blank-*string* item in rendered list — technically Pass as literally scripted, **but see Findings: this assertion was checking the wrong thing** | Pass (as scripted) / see Findings |
| TC4.4 | Confirmed as part of TC4.1's same run (blank/whitespace-only lines interspersed, no gaps) | Pass |
| TC4.5 | `pasteInputVal === ''` after successful ingest | Pass |
| TC4.6 | Item count unchanged; textarea value still contains the typed whitespace/newlines | Pass |
| TC4.7 | Single Undo click removed all 3 pasted items (Chicken/Rice/Paper towels/Coffee/Plain Item minus the boundary-case lines from TC4.2/4.3, which were part of the same paste batch) back to the pre-paste 3-item baseline | Pass |

**Overall verdict: PASS on all scripted assertions (7/7 in this file's own scope), but 1 MINOR
defect found and disclosed below that the original scripted assertion didn't target.** Part of
the combined 67/67 Sprint 1 run — see `REGRESSION_LOG.md` (2026-09-04 row); the 67/67 figure
reflects that every assertion AS WRITTEN passed, not that zero real issues exist — see Findings.

## Findings — MINOR defect, disclosed 2026-09-04 (Tester) — FIXED, see Re-verification below

**A paste line consisting of ONLY a marker glyph plus trailing whitespace (nothing else) creates
a spurious junk item literally named after the marker, instead of being skipped as pure
formatting noise.** Root cause, confirmed by isolating `parsePasteLines()`'s logic directly (not
just observed via the UI): the function's *first* `.trim()` (checking whether the raw line is
"blank") consumes any trailing whitespace before the marker-stripping regex ever runs. The
marker-stripping regex (`/^(?:[-*•]|\d+[.)])\s+/`) requires a marker character immediately
followed by `\s+` to match and strip — but by the time it runs, that trailing whitespace is
already gone, so a marker-only line is indistinguishable from "a real item whose name happens to
be a single dash/asterisk/etc." and is pushed onto the list verbatim, unstripped.

**Confirmed systemic across all four marker forms**, isolated directly against the exact
`LEADING_LIST_MARKER_RE` regex and trim/strip sequence from `script.js`:
```
node -e "... parsePasteLines('- \n1. \n* \n2) \nReal Item') ..."
-> ["-","1.","*","2)","Real Item"]
```
Pasting `- `, `1. `, `* `, or `2) ` (marker + trailing space, no other content) each produce a
junk item named `-`, `1.`, `*`, or `2)` respectively.

**Severity: Minor, not blocking.** This is a real, reproducible bug, but: (1) it requires a
specific paste-formatting artifact (a marker with trailing whitespace and literally nothing
else on that line) that's plausible but not the common case for real recipe/notes text; (2) the
junk item is easy to spot and delete manually (S3 delete already works fine on it); (3) it doesn't
corrupt data, crash anything, or affect other items. Not treating this as blocking S4's Done
status, but disclosing per the team's standing transparency norm rather than letting a
technically-passing-but-mis-targeted scripted assertion stand uncorrected. My original TC4.3
assertion checked for an empty-*string* item (`n.trim() === ''`), which is a different, narrower
condition than "no real item was created" — the marker-only junk item is non-empty text (`"-"`
is not `""`), so it slipped past that specific check. Recommend either: (a) Developer moves the
initial "is this line blank" trim-check to run on the *post-marker-strip* result only (drop the
pre-strip early-exit), so a marker-only line is correctly recognized as empty after stripping; or
(b) Scrum Master rules this out of scope / low-priority-fix-later, since AC never explicitly
promised this specific boundary case. Either is a reasonable call — flagging for a decision, not
prescribing one.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s1-s6-s12-formal.js`. Full raw transcript in
`test-plans/S6-undo.md`. S4-specific lines:
```
PASS - S4 paste strips leading markers (-, 1., *, 2)) correctly :: ["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","-","•NoSpaceBullet"]
PASS - S4 marker regex requires whitespace after marker - "-NoSpaceMarker" is NOT stripped
PASS - S4 marker regex requires whitespace after marker - "•NoSpaceBullet" is NOT stripped
PASS - S4 a line that is ONLY a marker+space (nothing after) produces no empty/blank item
PASS - S4 textarea clears after successful ingest :: value=""
PASS - S4 whole-blank paste is a no-op (count unchanged)
PASS - S4 whole-blank paste leaves textarea exactly as typed
PASS - S6 undo removes the WHOLE paste batch in one atomic action :: Milk,Eggs,Bread
```
Screenshot: `c:/tmp/pw-test/vop-tester-05-after-paste.png`.

**Correction to the note that previously appeared here (2026-09-04, same day, before this file's
Findings section above was written):** an earlier draft of this file rationalized the `"-"` entry
visible in the TC4.1 raw output array as a harmless "log artifact." That was wrong, not just
stale — it was the real bug, described accurately in the Findings section above once the root
cause was actually isolated and traced. Left as a visible, dated correction rather than silently
deleted, per this project's own transparency convention (same convention vacking's QA_FINDINGS.md
uses for its own corrections).

## Re-verification, 2026-09-04 (same day) — Developer's fix confirmed

Developer fixed the root cause: widened `LEADING_LIST_MARKER_RE` from
`/^(?:[-*•]|\d+[.)])\s+/` to `/^(?:[-*•]|\d+[.)])(?:\s+|$)/` — a marker glyph now also matches
when followed by end-of-string (i.e. nothing, because the pre-strip `.trim()` already consumed
any trailing whitespace), not only when followed by real trailing whitespace. Narrower than my
own suggested alternative (reordering the trim/strip sequence) — Developer's own stated reasoning
(in `script.js`'s inline comment) is that restructuring the trim order would risk breaking the
already-working "marker preceded by leading whitespace" case (e.g. `"  - Milk"`), which currently
relies on that pre-strip trim to align the regex's `^` anchor. Reasonable call; verified it holds.

**Independently re-verified two ways:**
1. **Isolated logic trace** (not just live-app behavior) against the exact new regex:
   ```
   node -e "... parsePasteLines('- \n1. \n* \n2) \n-\n-NoSpaceMarker\n•NoSpaceBullet\n- Milk\n  - Indented Marker\nReal Item') ..."
   -> ["-NoSpaceMarker","•NoSpaceBullet","Milk","Indented Marker","Real Item"]
   ```
   All marker-only lines (`"- "`, `"1. "`, `"* "`, `"2) "`, `"-"`) correctly produce no item;
   no-space boundary cases still correctly preserved verbatim; a marker preceded by leading
   whitespace (`"  - Indented Marker"`) still correctly strips to `"Indented Marker"` — no
   regression on the case Developer specifically preserved for.
2. **Live re-run of the full formal-pass script** (not just the isolated snippet above), adding
   two new checks (TC4.3's precise re-check, plus the indented-marker regression case) to the same
   script that produced the original 67/67 result — result: **69/69 passed**, zero new failures
   anywhere else in the suite (full Sprint 1 regression re-confirmed clean in the same run, not
   just the S4 slice).
   ```
   PASS - S4 TC4.3 FIX VERIFIED: marker-only lines ("- ","1. ","* ","2) ","-") no longer create junk marker-residue items :: residue found=[] allNames=["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","•NoSpaceBullet","Indented Marker"]
   PASS - S4 regression: marker preceded by leading whitespace still strips correctly ("  - Indented Marker") :: ["Milk","Eggs","Bread","Chicken","Rice","Paper towels","Coffee","Plain Item","-NoSpaceMarker","•NoSpaceBullet","Indented Marker"]
   ```

**Verdict: defect closed, no regressions. S4 moves to DONE.** Updated cumulative regression count
(69/69) recorded in `REGRESSION_LOG.md`, 2026-09-04 (second row) — cite that row going forward,
not the original 67/67 row, which is left in place as history rather than overwritten.
