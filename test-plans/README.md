# Test Plans — conventions

Owned by: **Tester**. One file per story: `S<N>-slug.md`. Never edits
`script.js`/`style.css`/`index.html`.

## Accessibility scope (PO decision, relayed by Orchestrator, 2026-09-04)

Keyboard-only/screen-reader coverage is **not a required test gate** going forward — the PO's
real user base doesn't need it. Whatever ARIA/keyboard-focus behavior Developer builds (e.g.
S1/S2/S5's `role="checkbox"`/`tabindex`/`aria-checked`/focus-restoration work) is fine to sanity-
check if it's already covered in an existing pass, but don't invest further effort expanding this
coverage, and don't block a story's Done status on a gap here. **The one real accessibility
requirement is a colorblind-safe palette wherever color conveys state** (Okabe-Ito, per the
playbook's §7 — same standing PO preference as vacking) — relevant starting Sprint 2 if S8/S9's
aisle grouping introduces any color-coding; not applicable to Sprint 1's strikethrough+dim-based
crossed-off state.

This folder is empty until there's a locked (or at least drafted)
backlog to write plans against — see `TEAM_LOG.md` / `BACKLOG.md` at
the project root for current state. Per the playbook
(`AGENTIC_ORCHESTRATION_PLAYBOOK.md`, §2/§section on Tester), the shape
of the pipeline each story goes through before a test-plan file even
exists:

```
Scrum Master sanity-check → Developer sanity-check → Tester testability-check
    → QA per-story gate → Scrum Master locks AC → Developer implements
    → Tester formal test pass → close (Done, with regression count cited)
```

Two Tester touch-points per story:
1. **Testability pre-check** (before AC is locked): read the draft AC,
   confirm every criterion is actually verifiable (concrete, observable,
   no subjective/unmeasurable wording). Report gaps to the Orchestrator
   for routing back to Scrum Master — don't silently write around an
   unverifiable AC.
2. **Formal test pass** (after Developer implements): full test-plan
   file, executed results, regression re-run, cited count.

## File template

```markdown
# Test Plan — S<N>: <title>

**STATUS: <current lifecycle stage — see list below>.**

**Story:** <as a user, I want... so that...>

**Acceptance criteria (verbatim, BACKLOG.md):** <copy, don't paraphrase>

**Deliverable under test:** index.html/script.js, opened via file:// URL.
<Implemented / Not yet implemented — state plainly>

**Tooling:** Playwright (or whatever this project settles on), <setup note>

## Testability review summary (for scrum-master)
<pre-check notes: any AC item flagged as unverifiable-as-written, and why>

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|

## Results
| AC # | Test Case | Steps/Command | Expected | Actual | Pass/Fail |
|------|-----------|----------------|----------|--------|-----------|

**Overall verdict:** PASS (x/y) — cite regression baseline re-run here too,
with script name(s) and count(s), e.g. "Full regression baseline re-run
clean: S1-S3 vopping-tests.js 18/18."

## Commands run and output
<script path, invocation, raw pass/fail output, screenshot paths>
```

### STATUS banner discipline — this is the #1 thing that went wrong in vacking

vacking's QA sweep (see `QA_FINDINGS.md` R8/R9 there) found roughly half
its test-plan corpus had a top-of-file STATUS banner frozen at an
earlier lifecycle stage (e.g. "awaiting implementation") while the
Results table beneath it showed a fully executed, passing run — because
the banner is hand-typed prose and nothing forces it to move in lockstep
with the table underneath it.

**Rule going forward:** every time the Results table changes, the STATUS
line is the *first* edit, not an afterthought. Controlled vocabulary for
the STATUS line (pick one, don't invent new phrasing):
- `NOT STARTED — no build exists yet`
- `TESTABILITY REVIEW IN PROGRESS — AC not yet locked`
- `AWAITING IMPLEMENTATION — AC locked, Developer has not delivered`
- `FORMAL PASS IN PROGRESS`
- `DONE — formally executed <date>, PASS (x/y), <n> defects`
- `REOPENED — <reason>, see dated note below`

If a file's STATUS and Results ever disagree, that disagreement is a bug
in this folder and gets fixed the moment it's noticed, not batched for
later.

## Regression count — canonical source

`REGRESSION_LOG.md` in this same folder is the single running ledger.
**State the count from that file, not from memory or from a single
story's own Results table.** Every entry there names the script and the
pass/story it came from. When the Orchestrator or anyone else asks "what's
the current regression count," the answer is "check REGRESSION_LOG.md,"
not a recomputation.

## Test scripts

Playwright test scripts for this project should live under
`c:\tmp\pw-test\` (same convention as vacking), named
`vopping-tests-...js` to avoid collisions with vacking's own scripts in
that shared temp folder.

## Known implementation details (Developer sanity-check, Sprint 1, relayed by
Orchestrator 2026-09-04) — build these into S1-S6 assertions once AC locks

These are concrete decisions from Developer's own sanity-check pass, not yet
implemented but locked-in-intent. Capturing here now so they're on hand at
formal-test-plan time rather than relying on chat memory:

- **Item ids:** simple incrementing counter, not UUIDs — deterministic, so
  assert on *exact* ids (e.g. "item 3 has id 3"), not just "an id exists."
- **Storage shape:** one object `{ items: [...], nextId: N }` under a single
  localStorage key — not a raw top-level array. This is what makes the
  storage-corruption guard (see regression watch-list below) actually work:
  an object-shape check (`typeof parsed === 'object' && parsed && Array.isArray(parsed.items)`
  or equivalent) correctly rejects `JSON.parse("null")` (vacking R1/R2) AND
  a corrupted/wrong-shape value like a raw array or `{}` with no `items` key.
  When writing the storage-corruption test cases, cover: literal `"null"`,
  `"[]"` (array, not the expected object), `"{}"` (object but missing
  `items`), and a malformed `nextId` (string instead of number) — not just
  the single `"null"` case vacking's own findings centered on.
- **S5/S6 reorder-undo:** a swap's undo is just performing the identical
  adjacent-swap again — it's its own inverse, no array snapshot needed.
  Assertion is simply: swap happened (positions i/i+1 exchanged) → Undo →
  positions restored to exact original order. No need for a full pre/post
  array diff test.
- **S6 undo-buffer shape:** tagged union, one shape per action type —
  `add` (created id(s) — plural for an S4 paste-batch, singular for an S1
  single add), `check` (id + prior boolean value), `delete` (full item
  object + original index — this is what satisfies S3's AC requirement to
  "retain enough state to fully restore... at its original position," so
  that AC item's real assertion point is: after S6 exists, delete → Undo →
  item reappears at its exact original index, not appended at the end),
  `reorder` (the two swapped ids). Useful for writing S6's own test cases
  concretely per action type once implementation lands.
- **S4 paste-split:** `\r?\n`-aware — handles Windows-style CRLF line
  endings from pasted text, not just `\n`. Worth a dedicated test case
  (paste text containing `\r\n` line endings, confirm correct per-line
  split, no stray `\r` character trailing into an item name).

## Known implementation details (Developer sanity-check, Sprint 2, relayed by
Orchestrator 2026-09-04) — build these into S7-S10 assertions once AC locks and implementation lands

- **S7/S8 shared inline-edit mechanism:** note and aisle editing both use the
  same underlying widget, committed via a delegated `focusout` listener (not
  `blur`, which doesn't bubble and so can't be handled via delegation the way
  the rest of this app's event handling already works). **Real landmine
  flagged by Developer, worth a dedicated test:** an in-progress edit (typed
  but not yet committed) must survive a re-render triggered by an unrelated
  action (e.g. checking off a different row while a note field is open and
  mid-edit) without losing the draft — same capture/restore pattern as the
  S1/S2/S5 focus-preservation fix, just for an editable value instead of
  keyboard focus alone. Developer's asked Scrum Master to add this as an
  explicit AC clause so it's a locked guarantee, not just an implementation
  detail — check whether that clause landed before writing S7/S8's test
  cases; if so, this needs its own test (open note edit on row A, type a
  draft, don't commit, trigger a mutation on row B, confirm row A's draft
  text is still exactly what was typed, not reverted/lost).
- **S8 aisle input:** plain `<input list="aisle-options">` + `<datalist>` —
  no custom dropdown widget. Free-text entry is just typing into the input
  normally (datalist never restricts input, only offers suggestions), so
  "accepts arbitrary free text" is satisfied by the native element itself,
  not something Developer had to build. No color-coding on aisle tags in
  this first pass (plain text) — the colorblind-palette requirement (see
  Accessibility scope, above) does NOT apply yet; only relevant if/when a
  future pass adds color-coded aisle tags.
- **S9 sort is a derived view, never a mutation:** rendering goes through a
  `getSortedItems()`-style function that computes a sorted view from
  `state.items` without touching the underlying array — `state.items`
  itself is never `.sort()`-ed in place. This is exactly what S9's own AC
  asks to be tested ("testable by sorting, reloading, and diffing the
  stored array") — write that test literally: sort by Alphabetical or By
  Aisle, reload, and diff the raw `localStorage` `items` array against its
  pre-sort content. This also doubles as a regression guard against a
  future edit that reaches for `.sort()` directly on the real array instead
  of going through the derived-view function.
- **S10 shared add-path:** both S1's single-add and S4's paste-ingest funnel
  through one shared `pushNewItem()`-style helper where the frequency
  counter actually increments, using one normalization helper
  (`trim().toLowerCase()`) consistently as both the counter key AND the
  on-list-presence comparison (deciding whether a suggestion should be
  hidden because it's already on the list). Worth a test that explicitly
  exercises BOTH add paths and confirms they increment the SAME counter
  entry identically (e.g. add "Milk" via single-add, add "milk" via paste,
  confirm the counter for the normalized key is 2, not two separate
  entries at 1 each) — don't just test one path and assume the other
  matches.
- **S7/S8 accessibility scope confirmed:** per the PO's scoping decision
  (see Accessibility scope, above), the new note/aisle-edit affordances are
  plain click/tap-only with no keyboard/ARIA machinery — this is consistent
  with scope, not a gap to flag or test for.

## Regression watch-list (carried over from vacking's real findings —
categories to actively probe for on this project, not just wait to trip over)

vacking's QA findings (`QA_FINDINGS.md` at the vacking project root)
surfaced real bug classes worth treating as standing regression checks
here too, even though this is a different app:

- **Storage-corruption crashes** (vacking R1/R2): any `raw ? JSON.parse(raw) : {}`-style
  loader that doesn't validate the *parsed* result is actually the
  expected type (object/array), not just that `raw` was truthy.
  `JSON.parse("null")` succeeds and returns `null` — a classic silent
  landmine. vopping is localStorage-only too, so this class applies
  directly. Test with deliberately corrupted storage values, not just
  clean happy-path data.
- **Mobile viewport overflow from flex children without `min-width:0`**
  (vacking MV-1/MV-3): any `display:flex` container (header controls,
  item rows with multiple action buttons) needs an explicit check at
  narrow widths (320/360/375/390px) — a flex child's default
  `min-width:auto` can hold a container open past the viewport even
  when its content could otherwise shrink/wrap.
- **Tap-target size** (vacking MV-2): this PO's stated pain point for
  *this* project is specifically excessive scrolling from oversized tap
  targets, which is the inverse-flavor of the same category — so both
  directions matter here: undersized checkboxes/controls (accessibility
  floor, ~24x24 CSS px minimum) AND oversized rows driving scroll. Any
  row-density spec picked via `density-picker.html` should get measured
  against both floors, not just eyeballed.
- **Missing confirm dialogs on destructive actions** (vacking R7): any
  delete-type action (remove item, clear list, etc.) needs an explicit
  check for whether a confirm step exists and whether it's proportionate
  to the action's blast radius — and if a product decision says "no
  confirm for X," that decision should be traceable to a QUESTIONS.md
  resolution, not just assumed.
