# QA Findings

Ruthless-sweep log for the QA role. One dated section per sweep. Findings are triaged by
severity (Critical / Real / Minor / Nitpick) but not filtered — false positives and trivial
nitpicks are an accepted cost of not missing real problems, per the playbook's own explicit
mandate.

QA does not edit BACKLOG.md/SPRINT_LOG.md/QUESTIONS.md — findings are routed to the
Orchestrator, who decides what gets relayed to Scrum Master (AC-level issues), Tester (coverage
gaps), or the PO (product questions only they can answer — QA never contacts the PO directly).

---

## Sweep 1 — 2026-09-04 (first-ever QA pass, full sweep, docs + design only)

**Scope:** BACKLOG.md, SPRINT_LOG.md, QUESTIONS.md, project-notes.md, density-picker.html. No
live app exists yet (Sprint 1 has not started implementation), so this sweep is entirely a
docs-and-design audit — no Playwright/live-app testing possible this round. Cross-referenced
against vacking's AGENTIC_ORCHESTRATION_PLAYBOOK.md and vacking's own QA_FINDINGS.md (sweep 1) and
BACKLOG.md (S30/S31) for precedent where directly relevant.

**Trigger:** session-start / backlog-just-created, per the playbook's event-based QA gating —
Scrum Master just delivered the first backlog draft (11 stories, S1-S11), nothing has started
implementation.

---

### CRITICAL

None. Nothing is implemented yet, so nothing can be "broken" in the live-app sense vacking's own
Critical bucket means. The closest candidates are pre-emptive design gaps that would plausibly
become Critical/Real live bugs if built exactly as currently specified — listed under REAL below,
several with direct sourced precedent from vacking's own shipped bugs.

---

### REAL

**R1. Neither S1 nor S10 specifies any defensive handling for corrupted/malformed localStorage on
load — and this is not a hypothetical, it is vacking's own already-shipped bug (S30/S31, sourced
from vacking's QA_FINDINGS.md sweep-1 R1/R2 and vacking's BACKLOG.md S30/S31 entries).**

Vacking's crash was a systemic pattern: every storage loader did `raw ? JSON.parse(raw) : {}`
with no check that the *parsed* value was actually an object — `JSON.parse("null")` succeeds and
returns `null`, and the first downstream read (`isIgnored()`, `isDeleted()`, etc.) threw, blanking
the entire page before the list-rendering loop ever ran. Vopping's BACKLOG.md explicitly commits
to "identical architecture to sibling project vacking" for persistence, and S1's AC ("the full item
list... persists to localStorage on every mutation and an ordinary refresh restores the exact
prior list") plus S10's AC (a second, independent localStorage record for the frequency counter)
both describe the load path only in the success case. Neither mentions what happens if the stored
value is malformed JSON, valid-JSON-but-wrong-shape (e.g. `null`, a string, an array where an
object is expected), or simply absent-but-corrupted by a browser extension/sync mechanism — the
exact vacking trigger class. Given this is a *known, already-reproduced* failure mode on the
sibling project using the same storage pattern, it's cheap to close now (a shape-check on parse,
graceful fallback to empty state) and expensive to rediscover later the same way vacking did.
Recommend Scrum Master add explicit AC to S1 (and S10 when it locks) before Developer's
sanity-check treats "load from localStorage" as a solved, no-edge-case step.

**R2. S3 (no delete confirmation) + S6 (single-slot undo instantly clobbered by *any* subsequent
mutating action) combine into a real, plausible in-store permanent-data-loss path with zero
confirmation ever shown.**

S3's reasoning for skipping a confirm dialog is scoped narrowly: "this app has no bulk/destructive
reset action in scope, so there's no higher-stakes bulk case to reserve a confirm for." That
reasoning never weighs S6's own stated fragility: "the undo buffer holds exactly one slot —
performing any new mutating action overwrites it, discarding the ability to undo whatever came
before." Concretely, on a phone, in a store: user accidentally deletes the wrong item (no confirm
shown, none required by design), doesn't notice immediately, and taps *anything else mutating*
first — checks off a different item, deletes another item, bumps something up/down — before
reaching for Undo. The wrongly-deleted item is now gone permanently, with no confirmation dialog
ever having existed anywhere in the chain and no way back. This is a materially different risk
profile from vacking's per-item-delete-with-no-confirm precedent, because vacking's undo (per this
project's own playbook writeup) wasn't described as single-slot-and-trivially-clobbered in the same
breath as its no-confirm-delete policy. Not asking to reopen "no confirm on delete" as a closed
decision unilaterally — flagging that S3's own stated justification doesn't account for S6's
fragility, which is exactly the kind of cross-story AC tension the doc pipeline's QA gate exists to
surface before both stories lock.

**R3. Cross-story product-sense gap: nothing in S1-S11 provides a bulk "clear checked items /
start a new trip" mechanism, yet S10's entire premise depends on items actually leaving the live
list between shopping trips — this is this sweep's strongest "no human actually uses it that way"
smell, structurally the same shape as vacking's cautionary quantity-rows example.**

S10 suggests items you're "missing" — i.e., not currently present anywhere in the live list. That
signal is only meaningful if last week's checked-off milk, eggs, and bread actually get removed
from the list before this week's trip; otherwise they're not "missing," they're just sitting there,
checked, forever, and S10 will never resurface them as suggestions because they never left. The
*only* removal path anywhere in the backlog is S3's one-item-at-a-time delete. For a real weekly
grocery list (10-40 items, most of them checked off by the end of a trip), manually deleting every
checked item one at a time to reset for next week is exactly the kind of tedious, unrealistic
workflow that doesn't match how a person actually would use this app — and it directly undermines
the value of S10, a feature built specifically to reduce trip-to-trip friction. Common
shopping-list apps (Google Keep, AnyList, etc.) universally solve this with a one-tap "clear
checked" action; its total absence here, combined with S10's silent dependency on the list being
periodically emptied, is worth a direct product question to the PO: is manual item-by-item
clearing the intended trip-to-trip workflow, or is a bulk "clear checked" / "new trip" action a
missing 12th story? This is a product question only the PO can answer — routing to Orchestrator,
not proposing a fix myself.

**R4. density-picker.html's four candidate rows only mock up checkbox + item name + aisle tag —
they omit the delete button (S3), up/down buttons (S5), and note/aisle-edit affordances (S7/S8)
that will actually share the same row once built, meaning the PO's pending density pick is being
made against a row that's missing most of its real per-row control set.**

This is *not* a "PO hasn't decided yet" gap (that's a known, deliberate open decision per this
sweep's own brief, correctly not being flagged as unfinished work). It's a fidelity gap in the
decision *tool* itself: S3 requires "a delete control that is visually and functionally separate
from the checkbox," S5 requires "an Up and a Down button" per row, and S7/S8 each require "a small
per-row affordance" for notes/aisle. None of those five additional interactive elements appear
anywhere in density-picker.html's four `renderRow()` implementations — only a checkbox/glyph, name,
and static aisle-tag span are rendered. S5's own AC even flags the risk directly ("button sizing
must fit within whatever locked-down row height the PO ultimately picks... the swap mechanic
itself doesn't depend on the outcome") without resolving whether it *fits*. Vacking's own
mobile-viewport sweep (QA_FINDINGS.md, MV-1/MV-3) already found real, confirmed overflow bugs from
exactly this failure shape — a flex row whose visible mockup didn't anticipate its full eventual
control count, crowding and overflowing specifically at phone widths (MV-3: rename-mode's 5-control
row added 129px of extra overflow beyond baseline). Recommend the comparison tool get a revision
(or at minimum an explicit caveat shown to the PO) demonstrating the row with delete + up/down (+
note/aisle affordances once Sprint 2 nears) present, before today's pick is treated as final/locked
for S1/S2/S5's row markup.

**R5. S4's "added verbatim" paste rule will capture literal bullet/number prefixes on the story's
own primary motivating scenario — pasting an ingredient list copied off a recipe site — producing
item names like "- Milk" or "1. Eggs".**

S4's own framing text is explicit: "paste freeform text... from my Notes app, or an ingredient
list copied off a recipe site." Recipe sites and most notes apps render ingredient/shopping lists
with a leading bullet, dash, or number+period when you copy them as plain text — that's the
overwhelmingly common real-world shape of exactly the input this story is designed around. The AC
says each non-blank line becomes "exactly one new item added verbatim... no quantity/unit
stripping, no aisle-guessing" and explicitly defers messier recipe-text parsing to S11 (correctly
parked, not being second-guessed here). But stripping a leading bullet/number-glyph is a
meaningfully cheaper, different class of cleanup than quantity/unit parsing or aisle-guessing — it's
a fixed, small set of leading-character patterns (`-`, `•`, `*`, `\d+[.)]`), not free-form NLP. As
written, a first-time user pasting their actual recipe-site ingredient list (the story's own
headline example) will very likely end up with a list full of items literally named "- Milk"
instead of "Milk." Worth a design reconsideration before S4 locks — this doesn't require pulling in
any of S11's scope to fix.

**R6. S8/S9 free-text aisle values have no stated case/whitespace normalization for grouping
purposes, unlike S10's explicit handling of the identical class of problem for item names.**

S10's AC is explicit: item names are "matched case-insensitively/trimmed" for the frequency
counter. S8 (aisle is free text, "suggestions are a convenience, never a closed enum") and S9
("grouped using S8's aisle field... 'Unassigned' items grouped last") never state the equivalent
normalization for aisle values. Concretely: a user types "Produce" via the suggested dropdown on
Monday, then free-types "produce" (lowercase) or "Produce " (trailing space) on a later item —
under a naive implementation, S9's By-Aisle sort would treat these as two distinct groups instead
of grouping them together, silently fragmenting what the user clearly intends as one aisle. This
is the same shape of bug S10 already anticipated and closed for item names; S8/S9 should get the
same treatment before Sprint 2's AC locks (Sprint 2 hasn't started implementation, so this is cheap
to fix now).

---

### MINOR

**M1. S6's undo-buffer-clobber rule is ambiguous about whether a non-undoable mutation (S7 note
edit, S8 aisle edit) silently clears the existing undo buffer or leaves it untouched.** S6 says
"performing any new mutating action overwrites [the buffer]." S7/S8 each separately say note/aisle
edits are "explicitly NOT covered by S6's undo buffer... a deliberate scope boundary, not an
oversight" — but "not covered by" is ambiguous between "doesn't create a new undo target, but also
doesn't destroy an existing one" and "isn't itself undoable, but as a mutation it still clobbers
whatever was pending." These have genuinely different real behavior (can I still undo my last
checkbox toggle after stopping to edit a note on a different item, or not?) and neither S6 nor
S7/S8 resolves it. Sprint 2 hasn't started, so cheap to nail down before those stories lock — but
worth deciding now since it also retroactively defines what "mutating action" means for S6 itself.

**M2. S9 doesn't specify render behavior for a live add (S1/S4, or S10's suggestion-tap) while a
non-Manual sort view (Alphabetical/By Aisle) is active.** S9 says check/uncheck, delete, and
note/aisle-editing "remain fully available in every sort mode" but never mentions add. Does a
newly-added item appear immediately at its correct sorted position in the visible non-Manual view,
or only at the true end of the underlying manual array (invisible until the user switches back to
Manual)? Same ambiguity applies to S10's "tap a suggestion to add it... appends to the end" — the
end of what, visually, if By-Aisle is the active view? Untested edge case, not yet locked (Sprint 2
not started).

**M3. S1/S2/S5's "follow-up CSS pass once density-picker.html's pick lands" commitment has no
tracked backlog item enforcing it actually happens before those stories get marked Done.** All
three stories' AC text commits to this ("row markup/CSS will need a follow-up pass once the pick
lands") but BACKLOG.md's Status column and QUESTIONS.md's open row track only the *pick itself*,
not a corresponding "apply the pick to S1/S2/S5" follow-up task. This is exactly the shape of
stale-status drift the playbook's own §6 warns about generally, and that vacking's QA sweep 1
(R8/R9) found at scale in practice (test-plan STATUS banners frozen at an earlier lifecycle stage
than their own bodies). Recommend Scrum Master add an explicit tracked follow-up line so the
density pick landing doesn't get silently absorbed into "S1 is Done" without the CSS actually being
revisited.

**M4. project-notes.md's original requirement ("List persists through refreshes and cache
clearing") appears quietly narrowed by S1's AC ("a full 'clear site data' wipe is an accepted,
non-blocking exception per PO, not a bug to design around") — clearing site data/cache is exactly
what clears localStorage, so this walks back a requirement that was originally stated as a
must-survive case.** The "per PO" attribution has no corresponding entry in QUESTIONS.md's
Answered log, unlike the two other working-default decisions in this same draft (S2's auto-move
default and S10's threshold/signal default), both of which *do* have a tracked
question-and-working-default paper trail. Not asserting this is wrong — narrowing this requirement
for a fully-offline localStorage-only app is a defensible, arguably necessary call — just flagging
that unlike this draft's other two PO-attributed defaults, this one has no paper trail confirming
it was actually sourced from the PO rather than a reasonable-sounding inline justification written
during drafting. Worth a quick confirmation before treating it as fully locked.

**M5. Asymmetric duplicate-name handling: S4 explicitly states no de-duplication against existing
items or within a paste batch; S1 (single-item add) never addresses duplicate-name handling at
all.** Presumably the same "no de-dup" policy applies to S1 too (nothing suggests otherwise), but
it should be stated explicitly for consistency and testability rather than left to be inferred by
extension from S4's text.

**M6. S7 doesn't specify whitespace-only-note-trims-to-no-note behavior, unlike S1's explicit
handling for item names ("submitting empty/whitespace-only input is a no-op, no blank row
created").** A note consisting only of spaces — does it save and display as a note (visually a
blank line), or trim to empty and revert to the discreet "add note" affordance? Not stated. Minor,
cheap to add before Sprint 2 locks.

---

### NITPICK

**N1. S4 doesn't explicitly state CRLF-vs-LF newline handling for pasted text.** Very likely a
non-issue with a `\r?\n`-aware split, but not stated in the AC — more a Tester test-case-coverage
note (try a Notes-app paste with each line ending style) than a Scrum Master AC gap.

**N2. No cross-tab/multiple-simultaneous-instance consideration anywhere** — no `storage` event
listener or equivalent is mentioned, so opening the app in two tabs on the same phone (easy to do
accidentally via "open in new tab" or app-switcher restore behavior) would silently last-write-wins
clobber whichever tab saves last on its next mutation. Plausible but narrow; routing to Tester as a
coverage item rather than an AC blocker.

**N3. Long-disuse mobile-browser storage-eviction risk** — the task brief's own prompt to think
about "re-opening after days" is worth a documented risk acknowledgment: some mobile browsers have
historically applied storage-eviction policies to infrequently-visited sites, which could
theoretically wipe localStorage after a long gap between shopping trips. No code-level mitigation
is realistic for a `file://`/static-host localStorage app (there is no server to back it up to,
and that's an explicit, deliberate scope decision, not a gap) — flagged as an FYI risk, not an
actionable item.

**N4. S10's first-use empty-history state** (no item has hit the threshold yet, "What am I
missing?" presumably shows nothing) isn't explicitly stated in the AC but is an obvious enough
no-op that it doesn't warrant elevation past nitpick.

---

### Confirmed sound (reviewed, no gap found — listed so nobody re-checks these unnecessarily)

- **Persisting to localStorage "on every mutation" rather than relying on `beforeunload`/`unload`
  events** is the right call specifically for mobile use, where backgrounding or an OS-level tab
  kill doesn't reliably fire unload handlers — S1 already specifies the safer of the two options.
- **S6's no-redo / disables-until-fresh-mutation behavior** is unambiguous and directly testable as
  written — no gap found here despite the buffer-clobber ambiguity flagged in M1 above (that's
  about a *different* mutation's effect on the buffer, not this).
- **S9's "sorting never mutates the stored array" guarantee** is explicit and concretely testable
  exactly as written (sort, reload, diff the stored array) — this is a well-specified AC, not just
  an aspiration.
- **S10's cumulative-count-never-decrements-on-delete design**, and its self-disclosed "no
  dismiss/snooze, revisit only if it proves annoying in real use" limitation, are both explicit and
  already correctly flagged by Scrum Master as a deliberate, known tradeoff rather than an
  oversight — no new finding needed here.
- **Zero-network-calls / no-backend / no-sync-of-any-kind stance** is stated consistently across
  project-notes.md's supersession banner, BACKLOG.md's scope note, and S1's own AC — no
  contradiction found anywhere in this doc set on this point.
- **Status vocabulary and Sprint-assignment column** are used consistently across every one of the
  11 rows in BACKLOG.md's table — no invented status labels, no drift between the Priority Queue
  narrative section and the table itself.
- **S11's "explicitly out of scope, do not build" framing** is consistent everywhere it appears
  (BACKLOG.md's story row, its Priority Queue section, and SPRINT_LOG.md's Parked section) — no
  drift, and correctly not treated as a gap by this sweep per its own brief.
- **density-picker.html's own internal accessibility fixes** (the aria-label added to Option B's
  unwrapped checkbox; the role=checkbox/tabindex/keyboard-handling added to Options C/D's
  no-native-control tap rows) are both dated, explained inline in code comments, and correct — this
  is Developer-owned tooling, not a story, and it's in good shape on its own terms.

---

### Scope note

This sweep is docs-and-design only, per the current project state (nothing implemented yet, no
live app to poke at). A live/adversarial pass (the kind that found vacking's 5 real bugs on sweep 1
and 3 more on its mobile-viewport sweep 2) should be re-run once Sprint 1 (S1-S6) actually ships,
per the playbook's own two event-based triggers (session start / backlog-empties-out) — most
directly relevant here: R1's corrupted-localStorage concern and R4's crowded-row-overflow concern
are exactly the two failure shapes vacking's own two sweeps found live, so those two are the
highest-value things to re-test adversarially the moment there's a running app, not just re-read as
docs.

---

## Sweep 2 — 2026-09-08 (Sprint 2 AC-locked pass, first-ever review of S7-S10; docs + shipped code)

**Scope:** BACKLOG.md's locked S7 (notes), S8 (aisle designation), S9 (sort view), S10 (frequency
suggestions) AC text — first QA pass over any of these four, not a re-check. Also cross-referenced
against Developer's already-written implementation (`script.js`, `index.html`, `style.css`) since,
unlike sweep 1, Sprint 2's code already exists (Developer is mid self-verification after the
multi-day pause) — several findings below were confirmed or *downgraded* by actually reading the
code rather than reasoning about the AC text alone. `style.css` has not yet been touched for
S7-S10's new elements (`.row-meta`, `.note-display`, `.aisle-tag`, `.suggestion-chip`, etc. are all
unstyled) — expected per this sweep's own brief, not itself a finding.

**Pre-check requested by Orchestrator: is sweep 1 (above) internally consistent / stale?** Reviewed
in full. It is internally consistent (6 Real / 6 Minor / 4 Nitpick as expected, no contradictions
within the sweep itself) and **not stale in any way that matters** — it's an append-only historical
log by design (per this file's own header and the playbook's §2 doc-ownership split: QA logs
findings here, *resolutions* live in BACKLOG.md/SPRINT_LOG.md, not back-edited into this file).
Cross-verified every sweep-1 Real/Minor finding against BACKLOG.md and SPRINT_LOG.md's "Update,
2026-09-04" entries: **R1, R2, R3, R5, R6 and all six Minors (M1-M6) are explicitly resolved** with
inline citations in BACKLOG.md's S1/S3/S4/S6/S7/S8/S9/S10/S12 rows. **R4 is the one sweep-1 finding
still genuinely open** — SPRINT_LOG.md says so explicitly ("QA's sweep 1 is now fully closed out
except R4... a tooling concern for the Orchestrator/Developer, not a BACKLOG.md AC item"). That's
accurate and not a gap in sweep 1's own log — but see **R7 below**, which is this sweep's finding
that R4's un-closed status has now stopped being a hypothetical tooling nitpick and become a live,
code-confirmed product-sense question now that S7/S8 are actually implemented.

**Trigger:** per-story-adjacent gate, folded into the periodic-sweep trigger — S7-S10's AC just
locked and Developer's implementation already exists; this is the cheapest remaining point to
catch a design smell before Tester's formal pass starts writing test-plans against this AC.

---

### REAL

**R7. Sweep-1's R4 (density-picker.html's mockups omit delete/up-down/note/aisle controls) was left
open as "a tooling concern," but S7/S8's now-real implementation confirms the underlying crowding
concern is materially worse than R4 even described, and it directly undercuts the PO's own density
sign-off.**

Confirmed directly in `script.js`'s `renderRow()` (lines ~633-676): every row's primary line, in
its default empty-note/empty-aisle state, renders **five** nested interactive controls alongside
the item name — a note-toggle icon (✎), an aisle-toggle icon (▤), Up, Down, and Delete — none of
which existed in any of density-picker.html's four candidate mockups (R4's own point: those showed
only a checkbox/glyph + name + static aisle-tag span). The PO's locked pick (whole-row tap, Option
C/D, no checkbox/dot glyph) was made looking at a row with effectively zero of these five controls
present. Developer has already applied a defensive mitigation — `style.css`'s `.items li` carries
`flex-wrap: wrap` with a self-aware comment ("multi-child rows need `flex-wrap: wrap` once a row
gets crowded... more once S7/S8 land") — which should prevent literal overflow/clipping (the exact
failure shape vacking's own MV-3 finding hit). But that closes the *technical* overflow risk, not
the *product* one: whether a row with up to 5 icon buttons crammed beside the name, on a phone,
still "feels right" for fast in-store scanning is exactly the category of subjective call the
playbook (§7) says shouldn't be eyeballed/guessed on the PO's behalf — it's the same shape of
decision density-picker.html itself existed to settle properly rather than guess. Recommend: before
Tester's Sprint 2 formal pass closes S7/S8, get real or emulated-mobile-viewport eyes (PO
preferred, Tester as fallback) on a worst-case row — both note and aisle populated (forces the
second line too) on an item that's neither first nor last (so both Up and Down are enabled,
maximizing primary-line control count) — and confirm it still reads as usable, not merely
non-overflowing. This is R4 actually landing, not a new tooling nitpick.

**R8. S8's dynamic aisle-suggestion pool has two real interpretation choices, already disclosed
candidly by Developer in `script.js` code comments, but never folded back into BACKLOG.md's locked
S8 AC text — so the locked spec and the shipped behavior currently say different things.**

`script.js` lines ~488-500 (Developer's own comment, dated 2026-09-04) explicitly discloses: (1)
"used elsewhere in the list" is implemented as a **live-derived scan** of `state.items`' current
aisle values, not a separately persisted permanent history like S10's frequency counter — a custom
aisle name stops being suggested the moment no current item uses it anymore (delete the last item
with aisle "Wine," and "Wine" vanishes from every other row's datalist, with no code path to bring
it back except retyping it from scratch); and (2) the AC's own term "chronologically first" (for
which casing wins when "Produce" and "produce" merge into one suggestion entry) is actually
implemented as **first-occurrence-in-current-array-order**, not a true edit timestamp — confirmed
via `getAislePool()`'s straight linear scan of `state.items` in stored order. Developer explicitly
flags this as "a rare reordering-perturbs-the-tie-break edge case" with "no functional
consequence" — and that self-assessment is correct (it's cosmetic-only, never rewrites any
individual item's own stored aisle text). Concretely reproducible today with S5's existing Up/Down
buttons alone, no new code needed: type "Produce" on item A, "produce" on item B, confirm the
suggestion pool shows "Produce"; then use Up/Down to move B above A (no aisle retyped on either)
— the pool now shows "produce," despite "chronologically first" reading as if it should still favor
whichever was *typed* first, not whichever currently sits first in the array. Both disclosures are
good practice (exactly the kind of thing the playbook wants surfaced, not hidden) and low-stakes on
their own — but S8's locked AC text still just says "chronologically first" and "already used
elsewhere in the list" with neither caveat, and Tester hasn't started S8's test-plan yet. Recommend
folding both disclosed choices back into S8's AC (or a dated technical note, same pattern S7 used
for its own Developer sanity-check finding) before that happens, so Tester tests against what was
actually built rather than either missing this edge case or mis-flagging the array-order tie-break
as a defect against the literal word "chronologically."

---

### MINOR

**M7. S7 and S8 each separately describe a row growing to fit "a" second line, but neither
addresses what happens when an item has both a non-empty note AND a non-empty aisle at the same
time.** Confirmed via `script.js` (lines 656-670): the actual implementation puts both into one
shared `.row-meta` second line (note-display button, then aisle-tag button, side by side) rather
than two stacked lines — a reasonable choice, but it's a Developer-level default nobody actually
locked. Worth stating explicitly before Tester writes S7/S8's test-plans, same shape as sweep 1's
M6 (two independently-stated rules whose *combination* was never addressed by either story).

**M8. S9's own "resolving QA finding M2" text explicitly names only three add paths (S1 single-add,
S4 paste-ingest, S10 suggestion-tap) as guaranteed to render at their correct position under an
active non-Manual sort — but this undersells what's actually true and shipped.** Traced the
render pipeline end to end: `performUndo()` (restoring a deleted item or a swap), `clearCheckedItems()` /
S12's bulk restore-on-undo, and `saveAisle()` (committing an aisle edit, which can move an item into
a different aisle group) all end in the same general `render()` → full `renderList()` rebuild that
every add path also uses — meaning undo-restore-under-sort and aisle-edit-triggered regrouping
already work correctly today, automatically, as a structural consequence of "always rebuild the
whole list from live state on every render," not because anyone special-cased them the way M2's
text implies was needed for add. Not a functional bug (verified by reading the actual code paths,
not just the AC) — but the locked AC's stated guarantee is narrower than reality, which risks
Tester's S9 test-plan being scoped only to the three explicitly-named paths and never exercising
undo-restore-under-sort or aisle-regroup-under-sort as their own cases, purely because the AC text
never invites it. Recommend broadening M2's resolution language to the general principle already
true in code ("every render, regardless of which mutation triggered it, re-derives sort position
fresh from live state") so Tester's coverage is written from an accurate general statement instead
of an enumerated list that quietly undersells what was built.

---

### NITPICK

**N5. S9 never states that By-Aisle grouping, for a row with an in-progress/uncommitted aisle
edit, uses the item's last-*saved* aisle value rather than the live-typed draft.** Confirmed
already correct in code — `renderList()`'s grouping key reads `item.aisle` (committed state), while
the in-progress text lives in a separate `editingField.draft` that only becomes `item.aisle` on
`commitEditor()` (blur/Enter) — so a row never visually jumps groups mid-keystroke. No risk of this
being wrong (it's a natural consequence of how the two pieces of state are kept separate), just
worth a one-line AC mention for Tester's own coverage notes rather than leaving it entirely
inferred from code.

---

### Confirmed sound (reviewed, no gap found — S7-S10 specific)

- **Nested-control precedence for S7/S8's note-toggle/aisle-toggle affordances** is correctly
  implemented and matches S2/S3/S5's existing precedent exactly — confirmed in `script.js`'s
  delegated click handler (role-based dispatch for `up`/`down`/`delete`/`note-toggle`/
  `aisle-toggle`, explicit `return` before the row's own `toggleChecked` branch can fire).
- **In-progress note/aisle draft survival across an unrelated re-render** (Developer's own
  self-flagged landmine on both S7 and S8) is correctly built — `updateDraft()` deliberately avoids
  a render-per-keystroke, and `renderList()`'s existing focus-capture/restore logic (already proven
  for S1/S2/S5) is reused unchanged, not reimplemented.
- **S10's suggestion-chip list correctly disappears a tapped suggestion on its very next render** —
  `renderSuggestions()` is called from the same general `render()` pipeline every mutation goes
  through, and its filter (`getLiveNameSet()`) is re-evaluated live each time, so no stale/dismissed
  chip can linger after being tapped. Not explicitly stated in S10's AC, but correctly built and
  low enough stakes not to warrant its own finding above Nitpick.
- **Terminology consistency ("crossed off," not "checked")** — checked specifically for S7-S10:
  no user-facing string in either the locked AC text or the shipped `index.html`/`script.js`
  violates this. "Check/uncheck" persists only as internal story-shorthand (S2's own story title,
  S9's AC prose) exactly as it already did pre-Sprint-2 — consistent, not a regression.

---

### Scope note

Unlike sweep 1, Sprint 2 already has real code to check against, which changed this sweep's
shape: two candidate concerns I went in expecting to flag as Real (undo-restore positioning under
an active sort; aisle-edit-triggered regrouping under an active sort) turned out, on tracing the
actual render pipeline, to already work correctly — downgraded to M8 (a documentation-completeness
gap, not a functional one) rather than reported as live risks. Recommend Tester's upcoming S7-S10
formal pass specifically exercise R7's worst-case row (note + aisle both populated, mid-list item)
on a real or emulated narrow phone viewport, and R8's reorder-flips-tie-break-casing scenario,
since both are now concretely reproducible rather than theoretical.

---

## Per-story gate — 2026-09-08 (S13-S17 remediation batch, gating S14 and S17 specifically)

**Trigger:** per-story gate, per Orchestrator's request — S14 (shrink row-control buttons ~25%,
sub-24px accepted as a tradeoff) and S17 (more visually distinct aisle-group headers + fix the
cursor-styling bug on non-clickable header rows) both cleared Tester's testability-check clean,
about to go to Scrum Master for AC lock. First review of either story's AC. (S13/S15/S16 excluded
from this pass per Orchestrator's explicit instruction — still being resolved with Scrum Master,
will come separately.)

**Scope:** BACKLOG.md's S14 and S17 rows, cross-checked against the current live implementation
(`script.js`, `style.css`, `density-picker.html`) the same way Sweep 2 did, not read in isolation —
both stories touch elements sweep 2's R7 already put under a magnifying glass, so the working code
and the already-revised decision-tool artifact were directly relevant evidence, not just the AC
prose.

**Good news up front:** while checking S14, I went in suspecting a real gap — that the PO's
crowded-row review (which produced S13-S18) might have been shown only the "note+aisle both
populated" two-line row as the demonstrated "worst case," when the row with *neither* field set is
actually worse for primary-line icon crowding (the note-toggle/aisle-toggle icons only render while
that field is empty — `!noteVal`/`!aisleVal` in `renderRow()` — so they *vanish* once populated,
meaning an empty-fields row can show 5 primary-line icon-btns where a both-populated row only shows
3 plus a second line). Checked `density-picker.html` directly rather than assuming: it was already
revised 2026-09-08 (tied to sweep 2's own R7) to include sample rows with *both* fields empty
(Eggs/Bananas/Coffee) alongside rows with one field and rows with both — so the PO's actual review
already covered both worst-case axes (horizontal crowding AND vertical height), not just one. No
finding needed here — flagging only so nobody re-derives this same worry from scratch later.

---

### REAL

None for either story.

---

### MINOR

None for either story.

---

### NITPICK

**N6 (S14).** The AC's exclusion clause ("does NOT affect item-name/note/aisle-tag text size")
protects font-size specifically, but S14's inclusion list (note-toggle, aisle-toggle, delete,
S13's drag-handle) names the *empty-state* icon affordances by their `data-role` — it never
explicitly says whether the *populated-state* `.note-display`/`.aisle-tag` buttons' own chrome
(padding, dashed-underline border) is in scope for the 25% reduction too, since those are a
different element from the toggle icons and aren't literally named either way. Checked
`style.css` directly: `.note-display`/`.aisle-tag` already have no fixed width/height, no
border, no background (`border: none; background: transparent`) — just a small padding tied to
font size and a dashed underline — so there isn't really comparable "chrome" there to shrink, and
the ambiguity is close to moot in practice given the current design. Worth one explicit sentence
in the AC anyway (e.g. "does not apply to `.note-display`/`.aisle-tag`'s own padding/underline,
which aren't chrome-sized controls in the same sense") purely so Tester's S14 test-plan has
something explicit to check off rather than inferring it from CSS that could change.

---

### Confirmed sound (reviewed, no gap found)

- **S14's scope list maps cleanly 1:1 onto the current `.icon-btn` class** (note-toggle,
  aisle-toggle-as-empty-affordance, delete-btn, future drag-handle) — no other per-row element
  needs guessing about.
- **S14's sub-24px tap-target tradeoff is a clean, explicit, PO-owned, revisit-only-if-real-problem
  decision** — already fully closed in QUESTIONS.md's Blocking table, nothing left ambiguous.
  Confirmed this doesn't contradict the *whole-row* tap target's own 24px+ guarantee (S1/S2) —
  that's a separate, unaffected element; only the nested icon-btns shrink.
- **S17's self-flagged cursor/active-state bug is real and accurately scoped.** Confirmed directly
  in code: the `aisle-group-header` `<li>` (script.js, `renderList()`) is a plain sibling `<li>`
  inside the same `<ul class="items">` as item rows, with no `data-id` attribute — so it already
  correctly falls through the click handler's `closest('li[data-id]')` guard (no functional
  cross-off risk, purely visual) but *does* inherit `.items li`'s `cursor: pointer` and
  `.items li:active` background from the existing item-row CSS, since nothing distinguishes it
  today. The proposed fix (exclude the header class from those two rules) is exactly right and
  fully closes the bug with no collateral effect on real item rows.
- **S17's empty-state paragraph (`<p class="empty-state">`) was checked for the same
  cursor-inheritance risk** — it's not affected; it renders outside `.items` entirely, not as a
  sibling `<li>`, so none of `.items li`'s rules apply to it regardless of what S17 does.
- **S17's "PO explicitly not picky, no decision-tool needed" carve-out is consistent** with the
  playbook's §7 rule (never guess twice on a *color* accessibility complaint) — this is a
  typography/spacing delegation, not a colorblind-palette guess, and the AC still correctly
  requires Okabe-Ito *if* color-coding is added, so the one case where guessing would be
  inappropriate is still gated properly.

---

### Verdict

Both S14 and S17 clear this gate — **no Real, no Minor findings for either.** Recommend Scrum
Master proceed to lock both as drafted. N6 (S14) is a one-sentence clarity suggestion, cheap to
fold in before lock but not a blocker if Scrum Master judges the current CSS already makes it
moot.

---

## Per-story gate — 2026-09-08 (S13, S15, S16)

**Trigger:** per-story gate, per Orchestrator's request — Tester's testability-check on S13
(drag-and-drop reorder), S15 (in-place item-text editing), and S16 (suppress per-row aisle tag
under By-Aisle sort) is done and clean; all three of Scrum Master's fixes (S13's drop-position/
jitter/out-of-bounds rules; S15's implementation-agnostic editor guarantees; S16's icon-only
By-Aisle edit affordance) hold up to deterministic testing. First review of any of the three.
(S14/S17 already gated separately, above.)

**Scope:** BACKLOG.md's S13/S15/S16 rows as currently written, including every fix folded in from
Developer's sanity-check and Tester's testability-check. None of the three has shipped code yet
(all "Not Started"), so unlike the S7-S10/S14/S17 gates this is a pure AC-text review, same
methodology as sweep 1 — hunting for cross-story interactions and edge cases that a
single-story-at-a-time testability-check pass isn't necessarily scoped to catch.

---

### REAL

**R9 (S13). Pointer Events' `pointercancel` — a gesture interrupted by something other than a
normal release (OS-level gesture takeover, app backgrounding, an incoming call, browser chrome
stealing the touch) — has no stated behavior anywhere in S13's AC.** Tester's testability-check
already nailed down deterministic rules for three release-path scenarios (drop-position rule,
jitter-cancels-during-pickup, drop-outside-scrollable-bounds) — all of which assume the gesture
ends in an ordinary `pointerup`. `pointercancel` is a distinct, first-class Pointer Events case
(exactly why the AC mandates Pointer Events over touch-only listeners in the first place, partly
*for* deterministic testability) that any real implementation must handle *somehow*, and nothing
says whether a cancelled gesture aborts the drag (safe default: item stays at its pre-drag
position, nothing committed) or falls through to whatever the drop-position rule computed at the
moment of cancellation. Given this project's explicit, repeatedly-invoked "no surprise mutations"
guardrail (S2's no-auto-move decision, S9's non-destructive-sort guarantee), an interrupted drag
silently committing a partial reposition would be exactly that kind of surprise. Recommend Scrum
Master add one line: `pointercancel` aborts the drag, item returns to its original position,
nothing is written to localStorage or the undo buffer — before lock, so Tester has something
deterministic to assert (`fire pointercancel mid-drag, confirm order is unchanged`).

**R10 (S15). Editing an item's name can make a still-relevant item invisible to S10's
"currently present" suggestion filter, causing the PRE-edit name to resurface as a suggestion chip
even though the user still has that exact item on their list — reproducible using the story's own
headline example.** S15's AC is explicit and correct that editing text must NOT touch S10's
counter in either direction (avoiding the fragmentation risk of "zucchini"/"2 zucchini" becoming
two counter entries) — but it never considers the *other* place S10 reads live-list membership:
the "not currently present anywhere in the live list" filter that suppresses a suggestion chip for
a name already on the list (case-insensitive/trimmed exact-ish match). Walk the story's own
example: user has "Zucchini" on the list (historical count already at/above threshold from past
trips), edits it in place to "2 Zucchini" per this story's exact intended use case. The item is
still functionally the same grocery item, still on the list — but it no longer matches the string
"Zucchini," so S10's presence-filter no longer suppresses that suggestion, and "Zucchini" can pop
up as a "what am I missing?" chip while the user is looking straight at "2 Zucchini" already
checked into their cart. Not a data-corruption bug — nothing breaks — but it's a real, non-obvious,
concretely-reachable "no human wants this" moment, exactly the class of gap this role exists to
catch before it ships (playbook's own quantity-rows example is the same shape: two independently
correct pieces of logic combining into user-visible nonsense). Flagging as a product question, not
prescribing the fix — plausible options range from "accept it, S10 already has no dismiss/snooze
mechanic and this is a rare/low-stakes annoyance" to "suppress a suggestion whenever ANY edit
history links it to a still-present item," the latter being real added complexity for a corner
case. Recommend routing to the PO via Orchestrator rather than deciding directly, given it touches
S10's already-PO-reviewed suggestion semantics.

---

### MINOR

**M9 (S13 + S15, same underlying gap, both stories' text).** Both stories carefully state what
happens when a conflicting action starts on a *different* row (S13: "starting a drag-pickup on one
row must commit... an in-progress note/aisle draft still open on a different row"; S15: mutual
exclusivity is stated for "same-row or cross-row") — but neither explicitly covers initiating a
drag-pickup (S13) on the very row whose own note/aisle/name editor is *already open on that same
row*. Is a press-and-hold on the row's non-editor area (e.g. the item name, while that row's own
aisle editor is open below it) even a valid drag-pickup surface while an editor is open on the same
row? If so, does starting that drag implicitly commit the same row's own in-progress editor first
(consistent with the cross-row guarantee), or could a row end up being dragged around the list with
an uncommitted draft that then needs to survive the drag's own re-renders — the same
draft-survives-re-render guarantee already required elsewhere, just never connected to this
specific combination? Cheap to state explicitly before either story locks.

**M10 (S13).** The AC's press-and-hold/delay/jitter-tolerance language reads as if the whole row
is the drag-pickup surface (the delay is measured against "tapping the row's other nested
controls," and a quick tap below threshold "still performs the existing whole-row cross-off
toggle") — but a separate sentence frames "whole row vs. a dedicated handle icon" as an open
Developer-level choice. If Developer picks the handle-icon route, does the delay/jitter mechanism
move to apply only to presses starting on that handle (meaning presses elsewhere on the row, no
matter how long held, never arm a drag), and what — if anything — does a quick tap directly on the
handle icon do? The AC's stated guarantees are written for one branch of this choice and never
re-stated for the other.

**M11 (S13).** No stated behavior for a drag dropped back at its exact original position (zero net
order change). This project has an established, repeated precedent for genuine no-ops not touching
the undo buffer or triggering a write (S1's empty/whitespace add, S12's zero-crossed-off clear) —
worth one line confirming a same-position drop follows the same precedent rather than pushing a
trivial no-op reorder onto S6's single undo slot (which would then clobber whatever *real* action
was previously undoable, for a drag that changed nothing).

**M12 (S13).** The AC carefully specifies that touch movement beyond the jitter tolerance *during*
the pickup delay cancels the pickup and falls through to ordinary scrolling — but says nothing
about suppressing native/passive scrolling once a drag is already armed and active, so it doesn't
fight the separately-mandated auto-scroll-near-edge mechanic. Same class of drag-vs-scroll conflict
the AC already reasoned through carefully for the arming phase, left unaddressed for the
active-drag phase — worth a one-line explicit statement (e.g. native scroll is suppressed for the
duration of an active drag; only the controlled auto-scroll mechanic moves the list) so this isn't
left to accidental implementation.

**M13 (S16).** The resolution text ("tapping it opens the same aisle editor, pre-filled with the
item's real current value (or empty, if Unassigned), exactly as if the full tag had been tapped")
reads as if the new icon-only affordance applies uniformly to every item under By-Aisle sort,
including Unassigned ones — but Unassigned items never had the "full text tag" this story is
suppressing/replacing in the first place; they already show S8's pre-existing empty-state
aisle-toggle icon, untouched by this story's stated scope (suppressing the *populated* tag).
Probably functionally equivalent either way (tapping opens the editor correctly regardless), but
it's genuinely ambiguous whether Unassigned rows under By-Aisle sort keep using S8's existing icon
unchanged, or get folded into this story's new element as if they were the same thing — worth
picking one reading explicitly so Tester's test-plan has a single unambiguous target.

**M14 (S14 × S16 cross-reference).** S16 introduces a brand-new per-row icon (the By-Aisle-mode
replacement for the suppressed aisle tag, per M13 above) *after* S14 already locked its own
enumerated shrink-target list (note-toggle, aisle-toggle, delete, S13's drag-handle) — S14's list
predates this icon's existence and doesn't mention it. Since S14 is already gated (see above) and
awaiting lock, worth a one-line cross-reference in either story stating whether this new icon
should ship at S14's already-shrunk size or the original size, so it doesn't quietly fall through
the crack between two stories that were drafted in sequence but not re-synced against each other.

---

### NITPICK

None beyond what M9-M14 already cover at Minor severity — no additional trivial findings surfaced
for this batch.

---

### Confirmed sound (reviewed, no gap found)

- **S13's supersession of S5 is clean** — data model unchanged, only the UI/interaction mechanism
  swaps, consistent with S9's own forward-reference note already anticipating this.
- **S13's three Tester-resolved gaps (drop-position rule, jitter tolerance, out-of-bounds drop) are
  each genuinely deterministic as written** — no ambiguity found in any of the three beyond the
  `pointercancel` gap (R9) which sits outside all three's scope, not a flaw in any of them.
- **S15's frequency-counter arm's-length treatment (does not touch S10's counter in either
  direction) is correctly reasoned and consistent** with S12's existing "counter never decrements on
  removal" precedent — the gap found (R10) is a *different* S10 interaction (live-presence
  filtering), not a flaw in this specific guarantee.
- **S15's truncation/ellipsis clause is unambiguous and consistent** with S1/S2's locked
  single-line row spec — no tension found with S7's note-wrapping precedent, since S15 explicitly
  and correctly distinguishes the two.
- **S16's "note unaffected, row height still content-driven" clause is consistent** with S7/S8's
  existing row-growth rules — no interaction found between this story's aisle-tag suppression and
  note-driven row growth.
- **All three stories' undo-eligibility/non-eligibility calls are consistent** with the top-of-file
  Undo scope note's 2026-09-08 extension (S13 reorder remains undo-eligible; S15 working default
  NOT undo-eligible; S16 has no data mutation of its own) — no drift found between that note and
  each story's own row.
- **S15's icon-pairing-needs-PO-confirmation gap and its undo-eligibility open question are already
  flagged, tracked, and correctly marked as pre-lock blockers by Scrum Master/Tester** — not
  re-flagging either as a new QA finding, just confirming both are real and already caught, so the
  Orchestrator doesn't read their absence above as something I missed.

---

### Verdict

**S13 and S15 each carry one Real finding (R9, R10) worth PO/Orchestrator attention before final
lock** — neither blocks Developer's/Tester's other work in the meantime, same non-blocking carve-out
this project has used for every prior PO-input-needed finding. **S16 has no Real findings**, only
two Minor documentation-clarity items (M13, M14) cheap to fold in before lock. M9-M12 apply to
S13/S15 and are all cheap, narrow AC clarifications, not blockers. Recommend Scrum Master fold in
M9-M14 directly (no PO input needed for any of them), and route R9 and R10 to the PO via
Orchestrator alongside S13's/S15's other already-pending confirmations.

---

## Re-confirmation — 2026-09-08 (S13, R9 fix)

**Trigger:** Orchestrator relayed that Scrum Master accepted R9's recommendation directly and
folded it into S13's AC; asked me to re-confirm S13 against the updated AC so it can move to
Locked.

**R9 — confirmed fully resolved.** BACKLOG.md's S13 row now reads: "a Pointer Events
`pointercancel` (the drag interrupted by something outside the user's control — OS-level gesture
takeover, app backgrounding, etc. — not a normal release) aborts the drag entirely: the item
returns to its original position, nothing is committed, no undo entry is created... a
`pointercancel` is never treated as an implicit drop." This is exactly the deterministic rule R9
asked for — safe default (abort, not partial-commit), explicit about both the position and the
undo-buffer side, and directly Tester-testable as written (fire `pointercancel` mid-drag, assert
order unchanged and no new undo entry). No residual gap in this specific fix.

**Scope check on the rest of the row, since "ready to Lock" is a whole-AC question, not just an
R9 question:** only R9 was folded in. My own **M9-M12** (same per-story gate, same dated section
above) are all still exactly as they were — none have been folded into S13's current text:
- **M9** (same-row drag-pickup vs. that row's own open editor — never addressed, only cross-row is)
- **M10** (whole-row-press vs. dedicated-handle-icon ambiguity in the delay/jitter language)
- **M11** (no stated no-op rule for a drop back at the exact original position)
- **M12** (no stated native-scroll suppression during an *active* drag, only during pickup-arming)

None of these are blockers on their own merits — consistent with my original verdict, they're all
cheap, narrow, no-PO-input-needed clarifications, the same category R9 itself was before Scrum
Master resolved it directly. **Not withholding a recommendation to Lock over them** — that decision
is Scrum Master's, not mine to make unilaterally (per this role's own charter, advisory only) — but
flagging plainly so Locking-with-M9-M12-still-open is a conscious choice, not a silent gap: either
fold them in now (fastest, matches how R9 itself just got handled), or Lock now and track them as
explicit non-blocking follow-ups the way this project already does for several other stories'
open items (e.g. QUESTIONS.md's non-blocking table). Recommend the latter only if Scrum Master
judges the Sprint 3 timeline benefits from not re-looping; either path is defensible.

**Verdict:** R9 — the specific ask — is fully and correctly resolved. Whether S13 as a *whole* is
ready for Lock now depends on whether Scrum Master wants M9-M12 folded in first or tracked as
open follow-ups; no new Real findings surfaced in this re-check.

---

## Re-confirmation — 2026-09-08 (S13, M9-M12 folded in)

**Trigger:** Orchestrator relayed that Scrum Master decided to fold all four Minors (M9-M12) in
now rather than defer, and asked me to re-confirm against the updated AC so S13 can move to
Locked.

**M10 — fully resolved, clean.** "Whichever Developer-level surface choice is made... the same
press-and-hold-with-jitter-tolerance gate applies to that specific surface before a pickup
begins — a dedicated handle does not get an instant-pickup-on-first-touch shortcut." Directly
closes the ambiguity; no surface-dependent special-casing left. (One trivial loose end: what a
quick tap *on* a dedicated handle does, if Developer adds one, is still unstated — but the
obvious/only sensible answer given everything else already specified is "nothing," since a handle
has no other defined action and nested controls already only ever perform their own action. Not
worth blocking Lock over — flagging only so it's a documented non-issue, not a silent one.)

**M11 — fully resolved on its own terms, clean rule, but see below for an interaction it exposes.**
"if a drag ends with the item released back at its exact original position (no net change), this
is a no-op — no undo-buffer entry is created." Correct, consistent with the project's established
no-op precedent (S1 empty add, S12 empty clear).

**M12 — fully resolved, clean, and correctly cross-referenced.** "the only scrolling that happens
during an active drag is the auto-scroll-near-viewport-edge mechanic... suppression ends the
instant the drag ends (drop, cancel, or `pointercancel`)" — explicitly ties back to R9's
`pointercancel` fix by name, good internal consistency between the two.

**M9 — substantively resolved; the rule itself is clear, though its stated justification is
narrower than the rule.** The operative sentence is unconditional and testable: "a row with its
own note/aisle/name editor currently open cannot be drag-picked-up... its editor must first be
committed/closed." That's the real rule and it's fine. The parenthetical reasoning offered
("captured by the open editor's input field as ordinary text-input interaction") only literally
holds for a press landing exactly on the editor's `<input>` — it doesn't, as literally worded,
explain a press-and-hold elsewhere on that same row (e.g. the item name, while a *different*
element on that row has the open editor) the way the rule's own unconditional framing implies it
should cover. Read as a whole, I'm confident the *rule* (row-with-open-editor is fully
drag-ineligible, not just its input field) is the intended and stated policy — this is a wording
precision nitpick on the justification clause, not a gap in the rule. Not blocking.

**New finding surfaced by M11's addition — genuine tension with the pre-existing drop-outside-
bounds rule, worth a one-line tie-break before Lock.**

**M15.** M11 ("dropped back at the exact original position = no-op, no undo entry") and the
earlier, already-locked rule (3) ("Drop released outside the list's own scrollable bounds...
commits to the nearest valid boundary position... **never a silent no-op or cancel**") now
directly overlap for one easily-reachable case: pick up the *first* item, drag the pointer slightly
upward past the list's top boundary (e.g. over the header — rule (3)'s own example), and release.
Nearest valid boundary = top of list = position 0 = that item's own original position. Rule (3)
says this must commit and is "never a silent no-op." M11 says a same-position result *is* a no-op.
Both conditions are true simultaneously here, and the AC doesn't say which rule wins. Not contrived
— "pick up the first/last item, nudge toward the edge, let go" is an entirely ordinary gesture, not
an edge case a shopper would rarely hit. Low-stakes either way (the visible list order is identical
under both readings — this is purely a question of whether a bookkeeping undo-buffer entry gets
created for an action that changed nothing, which only matters for whatever the *next* undo press
would otherwise have reversed), but it is a real, now-textual self-contradiction in the locked-
pending AC, the same "genuine self-contradiction, not just a gap" category Tester's own S16 finding
was treated as needing a real fix, not just a note. Recommend: M11's no-op rule takes precedence
whenever the two conditions coincide (i.e., "never a silent no-op" in rule (3) is about not
*ignoring* an out-of-bounds release — making sure it still resolves to a real, deliberate boundary
position rather than being treated as a cancel — not about forcing an undo-entry when that
resolved position happens to match the original) — but this is Scrum Master's call to make
explicit, not mine to resolve unilaterally.

**Verdict:** M9, M10, M12 confirmed fully resolved and clean (M9/M10 each carry one non-blocking
wording nitpick, noted above for completeness, not as a reason to hold Lock). M11 is correct and
well-specified in isolation but its addition surfaces a genuine, previously-latent conflict with
the pre-existing out-of-bounds rule (M15, new) that should get one explicit tie-break sentence
before this AC locks — otherwise Tester has no way to know which of two contradictory stated rules
to assert for the boundary-item-released-near-edge case. Recommend Scrum Master add that one line
(no PO input needed, same category as everything else folded in on this pass), then S13 should be
clean for Lock.

---

## Final re-confirmation — 2026-09-08 (S13, M15 tie-break folded in — Lock check)

**Trigger:** Orchestrator relayed that Scrum Master adopted the M15 recommendation as-is (M11's
no-op explicitly wins over the boundary-commit rule when both coincide) and asked for one final
pass so S13 can move to Locked.

**M15 — confirmed fully resolved, and well-justified.** The folded-in text doesn't just declare a
winner, it correctly reconciles *why* there's no real conflict of intent: "the boundary rule's own
'never a silent no-op' intent is unaffected, since it was about not silently ignoring an
out-of-bounds drag attempt, not about forcing an undo entry when the visible outcome is provably
unchanged." That's the right read, and it closes the loop cleanly — Tester now has one unambiguous
rule to assert for the boundary-item-near-edge case instead of two contradictory ones.

**Whole-AC coherence check, since this is the Lock gate, not just a single-finding re-check:**
re-read S13 top to bottom with all five rounds of fixes now layered in (original draft → Tester's
3 testability gaps → R9 → M9-M12 → M15) and traced every rule against every other rule for new
interactions, not just the two most recently touched:
- `pointercancel` (R9) vs. the boundary-commit rule: no conflict — R9's "never treated as an
  implicit drop" already unconditionally preempts the boundary rule for cancelled gestures; no
  M15-style tie-break was needed there, and re-checking confirms it still isn't.
- M9 (row-with-open-editor not drag-eligible) vs. the cross-row commit rule: compatible, operate
  at different layers (eligibility-to-attempt vs. what happens on a *different* row) — no overlap.
- M12 (scroll suppression) vs. auto-scroll-near-edge, and vs. M15's boundary/no-op tie-break: "drop"
  (which ends suppression) covers both outcomes of the M15 branch uniformly — no gap.
- M15 itself only had one real overlap to resolve (rule (3), out-of-bounds) — confirmed the
  *ordinary* in-bounds same-position drop (drag it around, put it back exactly where it started,
  release normally) was never actually in tension with anything, since rule (3)'s competing
  "never a silent no-op" language only ever applied to the out-of-bounds case. M15's scope is
  exactly as narrow as it needs to be, nothing left dangling.

**Outstanding items, for the record, not for blocking:** the two wording-only nitpicks noted in
the previous re-confirmation (M9's justification text being narrower than its own rule; M10's
unstated-but-obvious "quick tap on a dedicated handle does nothing" case) remain exactly as
described — neither is a functional gap, both were already explicitly called non-blocking, and
re-reading them fresh in light of everything since folded in doesn't change that assessment.

**Verdict: S13 is clean.** R9, M9, M10, M11, M12, and M15 are all correctly and fully resolved,
no new contradictions found on this full re-read, and the two remaining nitpicks are cosmetic only.
No objection to moving S13 to Locked.

---

## Lock-gate re-read — 2026-09-09 (S15, whole-AC check)

**Trigger:** Orchestrator relayed that Scrum Master folded in the PO's confirmed icon-pairing pick
(pencil moves to S15's new edit affordance, freed from S7's note-toggle) but held Status at "Not
Started" rather than "Locked" — S15 is the one Sprint-3 story whose content settled in pieces over
several rounds (Developer sanity-check, Tester's 3 testability gaps, QA's own R10, now the
icon-pairing confirm) rather than one clean pass, so it never got the whole-AC "zero new
contradictions" Lock-gate re-read the others (S13 especially) got. Same methodology as S13's final
re-confirmation above: trace every round's fixes against every other round, and against every
neighboring story S15 touches, not just the two most recently folded in.

**Rounds traced:** (0) original functional core — in-place edit, position/checked/note/aisle
preserved, blank-reverts-to-original; (1) Developer sanity-check — arm's-length from S10's counter,
live-resort-on-mutation under non-Manual sort, undo-eligibility flagged open; (2) Tester's
testability-check — implementation-approach-agnostic draft-survival/commit guarantees, third-editor
mutual exclusivity, truncation; (3) PO gesture/icon decision — dedicated edit-icon (not
double-tap/long-press), pencil confirmed; (4) QA's R10 — PO accepted the rename/stale-suggestion
quirk as-is; (5) icon-pairing PO-confirmed. Cross-checked against S6's Undo scope note (and its
2026-09-08 extension), S9's sort/grouping rules, S10's suggestion filter, S13's drag-eligibility and
cross-row-commit rules, S14's shrink-scope list, and S16's icon precedent.

---

### REAL

**R11. S15's live-resort-on-mutation guarantee ("editing an item's text while a non-Manual sort is
active immediately re-renders the item at its newly-correct position") doesn't say whether the
re-sort is computed from the live in-progress draft or only the last-committed name — and read
literally via its own worked example, it reproduces a bug class already found and fixed twice in
this exact codebase.** Round 1(b)'s example is "editing 'zucchini' to 'apple' under Alphabetical
sort moves the row to reflect 'apple's new alphabetical position immediately" — worded as an
after-the-fact description, but "immediately" is never pinned to commit-time specifically. If a
naive implementation recomputes sort position from the live keystroke-by-keystroke draft rather than
the committed value, a row under Alphabetical sort could change position on every keystroke while
the user is still typing into that row's own open editor — potentially relocating the very DOM node
the input's focus/cursor lives in mid-type. That's the identical failure shape as S7/S8's
already-twice-fixed "focus loss on render" bug (script.js, per S7/S8's own Implementation-status
notes: "focus loss on opening the editor, and a focusout-triggered re-render that could swallow a
pending click") — except here the disruptive re-render would be self-triggered by the edit itself,
not an unrelated action, so Round 2(1)'s draft-survives-*unrelated*-re-render guarantee doesn't
cover it by its own stated scope. The obviously-intended fix already exists as precedent elsewhere in
this same codebase — sweep 2's N5 confirmed S8/S9's By-Aisle grouping key reads the committed
`item.aisle`, never the live `editingField.draft`, specifically so a row never visually jumps groups
mid-keystroke. S15's AC never states the equivalent for its own Alphabetical-sort case. Concretely
reachable via the story's own headline example (type "zucchini" → "apple" letter by letter under
Alphabetical sort) — not a contrived edge case. Recommend one explicit sentence: re-sort position is
computed from the last-committed name, not the live draft, so a row never relocates while its own
editor is open — matching the existing aisle-grouping precedent. No PO input needed, same
technical-shape category R9 was for S13.

---

### MINOR

**M16. S15's own new edit-icon never actually gets the explicit nested-control-precedence
statement every sibling control in this project has — despite S15's own row text implying it
already does.** S3's delete, S5's up/down, S7's note-toggle, S8's aisle-toggle, and S13's
drag-pickup gesture each get an explicit one-line "tapping this performs only its own action, never
also triggers the row's whole-row cross-off toggle" statement, cross-referencing S2's original rule
by name. S15's row states this requirement for S7's *future replacement glyph* ("Whatever S7 ends up
with, it must not conflict with the row's existing nested-control precedence... — same requirement
already stated for this story's own edit-icon") — but tracing back through S15's own row, that
backward-reference doesn't resolve anywhere; no sentence anywhere in S15's text actually states the
guarantee for S15's own edit-icon. Cheap one-sentence fix, same pattern as every sibling control.

**M17. S15's new edit-icon was never cross-referenced into S14's already-Locked/Done shrink-scope
list, the same way S16's new aisle-icon explicitly was (M14).** S14 enumerates note-toggle (S7),
aisle-toggle (S8), delete (S3), and S13's drag-handle as in-scope for its ~25% shrink, and got an
explicit dated cross-reference added post-Lock when S16's new icon-only aisle affordance was
introduced afterward (M14). S15's edit-icon is the same shape of new nested per-row icon control,
introduced the same day — yet no equivalent cross-reference exists on S14's row for it. The
sequencing rationale on S15's own row ("Sequenced after S13/S14 so the decision-tool mockup reflects
the row's final post-shrink... layout") implies the answer is "ships at S14's already-reduced size,"
and the PO's confirmed pick was plausibly made looking at exactly that — but implying isn't stating,
and M14 needed an explicit sentence for the analogous case on S16. Recommend the same one-line
cross-reference treatment M14 already established.

---

### NITPICK

**N7. S13's cross-row-commit sentence ("starting a drag-pickup on one row must commit... an
in-progress note/aisle draft still open on a different row") still literally enumerates only
"note/aisle," not "name" — inconsistent with M9's already-updated "note/aisle/name editor" phrasing
for the same-row case, folded in later the same day.** Not a functional gap: the guarantee itself is
independently and unambiguously stated from S15's own side (Round 2(1)(ii): a drag-pickup starting
elsewhere correctly commits an in-progress name edit). Purely a wording-completeness mismatch
between two stories describing the same rule — worth a one-word addition to S13's older sentence for
consistency, not because anything is untested or unspecified.

**N8. S13's illustrative list of nested controls immune to its pickup-delay threshold
("whole-row cross-off tap, note/aisle-toggle, delete") predates S15's edit-icon and S16's
icon-only aisle affordance and was never updated to name either.** Already covered in substance —
S13's own governing sentence uses inclusive language ("every other nested control still performs
only its own action"), so both new controls are automatically included by the general rule. The
enumerated list is just a stale, non-exhaustive illustration, same low-stakes shape M14 addressed
for S14's list before it got its cross-reference — flagged only for completeness, not because
anything is actually ambiguous.

---

### Confirmed sound (reviewed, no gap found — S15-specific)

- **R10's resolution (PO accepted the rename/stale-suggestion-chip quirk as-is) is consistent** with
  S10's existing "no dismiss/snooze" self-disclosed limitation and doesn't reopen the
  counter-identity/fragmentation question S15's Developer sanity-check deliberately kept closed —
  no new tension found.
- **Undo-eligibility's working default (NOT undo-eligible, same as S7/S8) is consistent** between
  BACKLOG.md's top-of-file Undo scope note (2026-09-08 extension) and QUESTIONS.md's still-open
  non-blocking row — same text, same status, no drift.
- **M9 (S13's same-row drag-ineligibility rule) already says "note/aisle/name editor," correctly
  anticipating S15** — confirmed no gap on this side of the cross-row/same-row split, only the
  cross-row sentence lags (N7 above).
- **The mutual-exclusivity extension (Tester's testability-check item 2) correctly folds name in as
  a third editor type** alongside note/aisle, consistent with S7/S8's already-tested
  second-editor-commits-first-draft guarantee — no gap, this is a clean extension of existing tested
  behavior.
- **The truncation clause is unambiguous and consistent** with S1/S2's locked row-density spec and
  correctly distinguishes itself from S7's note-wrapping precedent, same distinction QA's earlier
  S13/S15/S16 gate already confirmed sound for a different pair of stories.
- **The deliberate non-locking of S7's specific replacement glyph is not a gap** — confirmed via
  SPRINT_LOG.md (2026-09-08 resume entry) that this is explicitly tracked as a separate, non-blocking
  open item on `s7-note-icon-picker.html`'s side, "not tracked as a BACKLOG.md gate on any
  locked/Done story" — S15's own deferral to that process is accurate, not a silent gap.

---

### Verdict

**S15 is not yet clean for Lock — one Real finding (R11).** R11 is the same technical-shape
category R9 was for S13 (no PO input needed, a one-sentence deterministic rule addition) and is
concretely reachable via the story's own headline example, not a hypothetical. M16/M17 are cheap,
narrow completeness gaps — recommend folding in alongside R11 in one pass (matches how S13 folded
R9+M9-M12 together rather than looping separately), but not blockers on their own if Scrum Master
prefers to track them as non-blocking follow-ups instead. N7/N8 are wording-only, no action required
before Lock. Recommend one more QA re-read after R11 (and M16/M17, if folded in) land, same
"one-more-look" pattern S13 needed before its own final clean verdict — this file's own prior entry
is proof that a single pass rarely catches everything the first time even when the individual
findings are each small.

---

## Final re-confirmation — 2026-09-09 (S15, R11/M16/M17 folded in — Lock check)

**Trigger:** Orchestrator relayed that Scrum Master resolved all three outstanding items from the
above pass (R11, M16, M17) and asked for the final re-read so S15 can move to Locked.

**R11 — confirmed fully resolved, clean.** S15's row now reads: "this re-sort trigger reads the
item's last-committed name, never the live in-progress draft still being typed in the open editor —
same precedent S8/S9's own grouping-key logic already established... While the editor is open and
actively being typed into, the row does NOT relocate on every keystroke; it snaps to its
newly-correct position only once the edit commits (blur/Enter), exactly like every other
mutation-triggered re-sort in this project." This is exactly the deterministic rule asked for —
explicitly commit-time, explicitly not per-keystroke, explicitly named as closing the same
failure shape as S7/S8's already-fixed focus-loss bug. Directly Tester-testable as written (type
into the name editor under Alphabetical sort, assert no position change until blur/Enter).

**M16 — confirmed fully resolved, clean.** The dangling backward-reference is gone — S15's row now
states, in its own right, "tapping this story's own dedicated edit-icon performs ONLY the edit-open
action and must NOT also trigger the row's whole-row cross-off toggle, same nested-control-precedence
rule already established for every other per-row control (S2's original rule, restated on
S3/S5/S7/S8/S13 for their own controls) — now actually stated for this story's edit-icon too, not
left as a dangling reference." Matches the pattern every sibling control already has; no gap left.

**M17 — confirmed fully resolved, clean, and correctly bidirectional.** S15's row: "this edit-icon
is also a nested per-row icon control, so it's in scope for S14's ~25% shrink, same cross-reference
treatment S16's icon already got on S14's own row... Developer applies the shrink to it at S15's own
implementation time, not retroactively to S14." Checked S14's own row for the mirrored note, per
S15's own citation: present and consistent — "S15's new dedicated edit-icon... is likewise a nested
per-row icon control and is also in scope for this ~25% shrink — Developer applies it when S15
itself is implemented, same forward-reference pattern as S16's icon above." Both sides agree, same
shape as S16/M14's already-proven cross-reference pattern.

**Whole-AC coherence check, since this is the Lock gate, not just three isolated fixes:** re-read
S15 top to bottom with all six rounds now layered in (original draft → Developer sanity-check →
Tester's 3 gaps → gesture/icon PO decision → R10 → icon-pairing confirm → R11/M16/M17) and traced
each new fix against the others and against neighboring stories, not just the two most recently
touched:
- R11's fix vs. Tester's testability-check item (1)(i) (draft survives an *unrelated* re-render):
  complementary, not overlapping — (1)(i) covers a different row's action or an unrelated mutation
  disrupting this row's open editor; R11 covers the row's *own* edit self-triggering a disruptive
  re-render. Together they now fully cover both directions of "does this editor survive a
  re-render," with no seam left uncovered.
- M16's fix vs. S13's M9 (row-with-open-editor is drag-ineligible): no interaction — M9 governs
  whether a row with *any* open editor (including now-explicit S15 name editor) can be
  drag-picked-up; M16 governs whether S15's edit-icon itself also fires cross-off. Different
  controls, no overlap.
- M17's fix vs. S16's M14 (same shrink-scope cross-reference pattern): confirmed structurally
  identical, both now correctly forward-referencing from S14's already-Done row — no drift between
  how the two are worded or dated.
- Re-checked R10's resolution and the undo-eligibility open question against all three new fixes:
  neither interacts with re-sort timing, icon precedence, or icon sizing — both remain exactly as
  they were, still correctly open/accepted respectively.

**Outstanding items, for the record, not for blocking:** N7 and N8 (S13 wording-only nitpicks,
exact text below per the Orchestrator's request) remain unactioned and non-blocking — they don't
touch S15 at all, only S13's already-Locked/Done row, and were never a condition of S15's own Lock.

**Verdict: S15 is clean.** R11, M16, and M17 are all correctly and fully resolved, no new
contradictions found on this full re-read, and N7/N8 are unrelated to this story. No objection to
moving S15 to Locked.

---

### N7 / N8 exact text (S13 nitpicks, non-blocking — provided verbatim per Orchestrator's request,
since the prior relay carried only a paraphrase)

**N7.** S13's cross-row-commit sentence ("starting a drag-pickup on one row must commit... an
in-progress note/aisle draft still open on a different row") still literally enumerates only
"note/aisle," not "name" — inconsistent with M9's already-updated "note/aisle/name editor" phrasing
for the same-row case, folded in later the same day. Not a functional gap: the guarantee itself is
independently and unambiguously stated from S15's own side (Round 2(1)(ii): a drag-pickup starting
elsewhere correctly commits an in-progress name edit). Purely a wording-completeness mismatch
between two stories describing the same rule — worth a one-word addition to S13's older sentence for
consistency, not because anything is untested or unspecified.

**N8.** S13's illustrative list of nested controls immune to its pickup-delay threshold
("whole-row cross-off tap, note/aisle-toggle, delete") predates S15's edit-icon and S16's
icon-only aisle affordance and was never updated to name either. Already covered in substance —
S13's own governing sentence uses inclusive language ("every other nested control still performs
only its own action"), so both new controls are automatically included by the general rule. The
enumerated list is just a stale, non-exhaustive illustration, same low-stakes shape M14 addressed
for S14's list before it got its cross-reference — flagged only for completeness, not because
anything is actually ambiguous.

**Suggested one-line fixes, if Scrum Master wants to fold these in (optional, non-blocking):**
- N7: in S13's cross-row-commit sentence, change "an in-progress note/aisle draft still open on a
  different row" to "an in-progress note/aisle/name draft still open on a different row."
- N8: in S13's pickup-delay-immunity sentence, change "tapping the row's other nested controls
  (whole-row cross-off tap, note/aisle-toggle, delete)" to "tapping the row's other nested controls
  (whole-row cross-off tap, note/aisle-toggle, delete, S15's edit-icon, S16's icon-only aisle
  affordance)."

---

## Post-implementation adversarial review — 2026-09-09 (S13, real code vs. locked AC)

**Trigger:** Tester's independent formal pass on S13 landed — 216/216, zero defects. Per the
Orchestrator's request, same methodology as the S7/S8 crowded-row catch: trace the actual shipped
`script.js`/`style.css`/`index.html` against every rule in S13's now-six-rounds-deep locked AC
(drop-position, jitter-tolerance, out-of-bounds clamp, `pointercancel` abort, auto-scroll,
nested-control precedence, cross-row draft-commit, undo-eligibility), not just re-read the AC
prose — plus a specific check on the iOS text-selection fix (`-webkit-user-select`/
`-webkit-touch-callout`) the PO found on their own real device, since that's a real bug our own
process didn't catch.

**Method:** read `beginDrag`/`endDrag`/`updateDragPosition`/`computeInsertionIndex`/the four
delegated `pointerdown`/`pointermove`/`pointerup`/`pointercancel` listeners in full (script.js
~lines 348-620 and 1241-1330), plus `commitEditor`/`saveNote`/`saveAisle`/`openEditor`/`renderList`
(the shared editor/render pipeline S13's cross-row-commit rule depends on), plus the relevant
`style.css` rules (`.items li`, `.items li.dragging`, `.items li.drag-placeholder`,
`#list-root.drag-active`, `.row-meta-input`). Traced execution paths, not just individual clauses
in isolation — this is what surfaced the finding below, which sits at the *intersection* of two
independently-correct, independently-tested mechanisms (S7/S8's shared-editor commit-on-render, and
S13's DOM-reference-carrying drag-arm callback).

---

### CRITICAL

**C1. Starting a drag-pickup on one row while a note/aisle editor is open on a DIFFERENT row throws
an uncaught exception and leaves the list permanently unscrollable until page reload — a real,
easily-reachable crash in code Tester just passed 216/216, found by tracing execution rather than
re-reading the AC.**

Reproduction (ordinary, sequential single-finger phone use — no contrivance, no multi-touch):
1. Tap a note or aisle icon on any item (row B) to open its editor. Do not commit it.
2. Press and hold on a *different* row (row A) for the full pickup delay (450ms) without releasing.

What happens in code: `beginDrag(id, li, pointerId)` (script.js ~line 493) receives `li` — the DOM
node for row A, captured as a closure variable back at `pointerdown` time, 450ms earlier. Its first
action is the cross-row-commit guarantee (locked AC, correctly required): `if (editingField)
commitEditor();` (line 502). Since row B's editor is open, this fires — `commitEditor()` →
`saveNote`/`saveAisle` → `render()` → `renderList()`, which does a full `listRoot.innerHTML = html`
rebuild (line 1050). **This destroys and replaces every `<li>` in the list, including row A's** —
the `li` variable `beginDrag` is holding is now a *detached* node (`li.parentNode` is `null`).
`beginDrag` never re-fetches it. Six lines later, `li.parentNode.insertBefore(placeholder,
li.nextSibling)` (line 511) throws `TypeError: Cannot read properties of null (reading
'insertBefore')`.

The crash happens *after* `listRoot.classList.add('drag-active')` already ran (line 508) but
*before* `dragState` gets assigned (line 516) — so the drag silently fails (no placeholder, no
visual pickup, the item doesn't move, an uncaught error lands in the console) AND `drag-active`
is now stuck on `#list-root` permanently, since only `endDrag()` removes it and `endDrag()` can
never run (nothing ever sets `dragState`, so the `pointerup`/`pointercancel` listeners' `if
(dragState && ...)` guards never fire for the rest of the session). Per `style.css`
(`#list-root.drag-active { touch-action: none; user-select: none; }`), **the entire list becomes
unscrollable and unselectable by touch from that point on, with no user-visible error and no
recovery except reloading the page.**

This is not a contrived edge case — it's the primary real-world scenario the cross-row-commit
guarantee itself exists to handle (a user editing a note, then separately deciding to reorder a
different item without first tapping away to close the note editor) — and it affects BOTH note and
aisle editors symmetrically (`saveNote` and `saveAisle` both call `render()` unconditionally). The
existing defensive comment at line 504 ("the row can't actually vanish between pointerdown and now
— committing an editor doesn't delete rows") reasons correctly about whether the *item* survives in
`state.items` (it does, and `findIndexById` is correctly re-derived fresh at line 503) but doesn't
address the different, actual failure: whether the *DOM element reference* survives a `render()` —
it doesn't, because `renderList()` replaces the entire subtree unconditionally, regardless of
whether the specific item was deleted.

Plausible reason Tester's 216/216 didn't catch this: cross-row-commit and drag-mechanics are each
independently well-tested (per S7/S8's own dedicated regression coverage and S13's own drop-
position/jitter/bounds/pointercancel test cases), but this specific *combination* — starting a
drag-pickup on one row while a **different** row's editor is still open — sits at the intersection
of both and doesn't obviously fall under either area's own test-case list unless someone thought to
combine them explicitly.

**Suggested fix shape (Developer's call on exact implementation, not prescribing it):** re-fetch
`li` fresh from the DOM immediately after the `commitEditor()` call, the same way `idx` is already
freshly re-derived right below it — e.g. `li = listRoot.querySelector('li[data-id="' + id + '"]');`
with a guard for not-found, mirroring the existing `idx === -1` defensive check. Recommend this
blocks S13's Done status until fixed and Tester adds dedicated regression coverage for exactly this
combination (open an editor on row B, drag-pickup row A, confirm no exception and the drag completes
normally) — same "technical-shape, no PO input needed" category as R9/R11, but Critical rather than
Real given it's a confirmed, reproducible crash with a persistent broken-UI side effect in code
about to ship, not an ambiguous rule or a low-stakes cosmetic quirk.

---

### MINOR

**M18. The `try/catch` fallback comment around `li.setPointerCapture(pointerId)` ("unsupported in
this environment - drag still works, just without capture's off-row tolerance") understates the
actual consequence of a capture failure.** Without `setPointerCapture` succeeding, subsequent
`pointermove`/`pointerup` events are dispatched to whatever element is physically under the pointer
rather than being retargeted to the captured row — which works fine *while* the pointer stays over
some `<li>` inside `#list-root` (delegation still catches it regardless of which row), but breaks
down the moment the pointer moves entirely outside `#list-root`'s DOM subtree (e.g., dragged up over
the page header and released there) — exactly the scenario rule (3) of the locked AC names by
example ("released over the header... commits to the nearest valid boundary position"). Without
capture, that release's native `pointerup` would fire on the header (or whatever's there), never
bubble to `listRoot`'s delegated listener, and `endDrag` would never run — leaving `dragState` stuck
(same class of persistent broken-list symptom as C1, via a different path) rather than the
"off-row tolerance" the comment implies is the only thing at stake. Low practical likelihood —
`setPointerCapture` is well-supported on all realistic target devices (iOS Safari 13+, Android
Chrome) — but the comment's own characterization doesn't match the real failure mode, and there's
no test coverage for a capture-failure scenario (understandably hard to simulate). Recommend either
correcting the comment to reflect the real risk, or adding a defensive document-level
`pointerup`/`pointercancel` fallback so a stray release outside `listRoot`'s subtree is still caught
regardless of capture success. No PO input needed.

---

### Confirmed sound (reviewed, no gap found — traced against real code, not just AC prose)

- **Drop-position rule, jitter tolerance, out-of-bounds clamp, and the M11/M15 same-position no-op
  tie-break are all correctly implemented exactly as specced.** Traced `computeInsertionIndex`
  (clamps to 0 for above-first-row, clamps to `rows.length` for past-last-row — never a "no match"),
  the jitter check in the `pointermove` listener (measures from `dragArm.startX/startY`, clears and
  nulls the arm — not just cancels — so a later press restarts fresh, never resumes), and `endDrag`'s
  `ds.currentIndex !== ds.startIndex` check (the M15 tie-break falls out structurally for free: an
  above-the-top release for the *first* item computes insertion index 0, which already equals its
  own `startIndex`, so it's already the same-position no-op branch without any special-casing
  needed).
- **`pointercancel` abort (R9) is correctly unconditional and side-effect-free** — `endDrag(true)`
  never touches `state.items`, never calls `setLastAction`, always re-renders from unchanged state.
- **Auto-scroll (PO-required) only ever runs after a real pickup begins**, never during the arming
  delay — `startAutoScrollLoop()` is only called from `beginDrag()`, confirmed correctly gated.
- **M12's scroll suppression is correctly scoped** — `touch-action: none` only applies while
  `#list-root.drag-active` is present (added in `beginDrag`, removed in `endDrag`), and
  `pointermove`'s `e.preventDefault()` for the actively-dragging pointer is likewise gated to
  `dragState` being set, not the arming phase — an ordinary scroll during the pickup delay is
  correctly left alone (matches jitter-tolerance's own "falls through to ordinary scroll" language).
- **Undo-eligibility and exact-position restoration are correct** — `reorder`'s `lastAction` stores
  `fromIndex`/`toIndex`, and `performUndo`'s reorder branch reinserts the *same object reference*
  removed from wherever it landed back at `fromIndex` — position, and every other field (note,
  aisle, checked state), are preserved by construction, not reconstructed.
- **S16's icon-only aisle affordance (already shipped) correctly reuses `data-role="aisle-toggle"`**
  (script.js line 955), so it's automatically covered by the nested-control-precedence check at
  `pointerdown` (`if (e.target.closest('[data-role]')) return;`) without needing its own
  special-case — confirmed no drag-arming-from-the-new-icon gap exists in the shipped code.
- **The iOS text-selection fix (PO's own real-device finding) is correctly and narrowly scoped.**
  `-webkit-user-select: none` / `-webkit-touch-callout: none` on the base `.items li` rule
  (unconditional, not gated to `.dragging`/`.drag-active`, with a comment correctly explaining why —
  iOS's long-press gesture recognizer evaluates before the JS pickup-delay timer can add any class)
  is exactly right for stopping the native text-selection/callout collision with S13's own
  press-and-hold. The override restoring normal `user-select: text` / `-webkit-user-select: text` /
  `-webkit-touch-callout: default` is correctly scoped to `.row-meta-input` only (the note/aisle
  editor's own inline `<input>`) — verified this selector actually matches the element script.js
  creates (`class="row-meta-input"`, lines 980/985) and does NOT also accidentally re-enable
  selection on `.note-display`/`.aisle-tag` (the saved-value *display* buttons, which correctly stay
  non-selectable since they're tap-to-edit affordances, not editable text) or on `.item-name` (never
  at risk of losing its original, intentional non-selectable whole-row-tap behavior). Also confirmed
  `#paste-input` isn't a descendant of `.items li` and was correctly identified as never at risk, per
  the fix's own comment.

---

### Verdict

**S13's Done status should NOT proceed until C1 is fixed and Tester adds dedicated regression
coverage for the specific combination that triggers it** (drag-pickup on one row while a different
row's note/aisle editor is open) — this is a confirmed, reproducible crash with a persistent
broken-UI side effect (list becomes unscrollable until reload), not a hypothetical. M18 is cheap and
non-blocking (correct the comment, or add a defensive fallback listener) — worth folding in
alongside C1's fix rather than as a separate pass, but not itself a reason to hold things up. Every
other traced rule (drop-position, jitter, bounds-clamp, pointercancel, auto-scroll, M11/M15's tie-
break, M12's scroll suppression, undo-eligibility/restoration, S16's icon reuse, and the iOS
text-selection fix) held up cleanly against the real shipped code — this is not a story-wide quality
problem, it's one specific, narrow, well-isolated intersection bug plus one comment-accuracy nit.

**Severity/mechanism correction, 2026-09-09 — see the dedicated section below.** C1's exact failure
mechanism as originally described above is wrong (not a thrown exception, not a permanent lockup) —
re-verified against Developer's own repro after they fixed it. The reachability and root cause
(a stale DOM reference used across a `render()` call) still stand, and the shipped fix still fully
closes it either way; only the specific downstream DOM behavior and resulting severity are revised.
Read alongside, not instead of, the original entry above (kept verbatim per this file's own
append-only/historical convention) — see "Correction — 2026-09-09" immediately below.

---

## Correction — 2026-09-09 (C1's exact failure mechanism, re-verified against Developer's repro)

**Trigger:** Developer fixed C1 (root cause, correctly: `beginDrag()` now re-fetches the row element
fresh by id right after the cross-row `commitEditor()` call, rather than trusting a reference that
can go stale across that render). Developer's own repro of the exact sequence found the failure
mode differs from how C1 originally described it — asked to re-verify my trace against theirs and
determine whether this is a real environment/engine difference or an inaccuracy in my original
trace.

**Re-verified from first principles (the DOM "replace all"/removal algorithm, not
re-running anything) — my original trace was wrong, and it's not an engine difference.**

`listRoot.innerHTML = html` only replaces `listRoot`'s *direct* children — in this app that's the
single `<ul class="items">` element, not the `<li>`s themselves. Removing that old `<ul>` from
`listRoot` sets the *old `<ul>`'s own* `parentNode` to `null` — but removing a container from its
parent does not recursively detach the container's own descendants; the old `<ul>`'s internal child
list (the old `<li>`s) stays fully intact, just now rooted in an orphaned subtree rather than the
document. So the stale `li` I traced in C1 does **not** end up with `parentNode === null` as I
claimed — its `parentNode` is the old, disconnected `<ul>`, itself a perfectly valid non-null node.
`li.parentNode.insertBefore(...)` therefore succeeds silently, landing in that dead subtree, rather
than throwing. This is standard, spec-defined DOM removal behavior (the same reason a detached
subtree can be manipulated or reattached elsewhere with its internal structure unchanged) —
identical across every conformant engine, not something that could differ between my check and
Developer's repro. **The inaccuracy was mine, not an environment discrepancy.**

**Corrected consequence, worked through from the same code:** since nothing throws, execution
continues to completion — `dragState` *does* get populated (contrary to C1's claim that the crash
left it unset), with `rowEl`/`placeholderEl` pointing into the dead subtree. `listRoot.classList.
add('drag-active')` still applies to the real, live `listRoot`, and `endDrag()` still runs normally
on release (nothing ever threw to prevent it), removing `drag-active` correctly — **no permanent
lockup, no crash, no reload required**, contrary to C1's central claim. The real, quieter bug:
`getOtherRowElements()` queries the *live* DOM and filters out `dragState.rowEl` — but since that
stale node was never among the live query's results to begin with, nothing actually gets excluded,
so the live counterpart of the dragged row stays in the "other rows" candidate list. This both keeps
the live row from ever getting `.dragging`'s dimmed treatment (only the invisible stale clone gets
that class) and skews the insertion-index math by one extra uncounted row, plausibly landing the
item at the wrong final position on drop — a real, silent correctness/visual bug, not a crash.
Matches Developer's own observed symptom exactly ("the disconnected stale clone got the `dragging`
class while the live, visible row never dimmed").

**What stands, unchanged:** the underlying root cause (a DOM element reference captured before a
`render()` call, used again afterward without re-fetching) is exactly what I identified, and the
fix Developer shipped — re-fetch `li` fresh by id immediately after `commitEditor()`, mirroring how
`idx` is already freshly re-derived there — is correct and fully closes the bug regardless of which
exact downstream DOM behavior follows from the stale reference. The reachability (ordinary
sequential single-finger use: leave a note/aisle editor open on one row, then long-press a different
row) is unchanged and was accurate.

**What's corrected:** the failure mode was NOT a thrown exception, and did NOT leave the list
permanently unscrollable requiring a reload — that specific mechanism and its "Critical" framing
were wrong. The actual (pre-fix) bug was a silent visual/positional correctness defect scoped to the
one drag gesture itself (wrong/missing dimming of the live dragged row, a skewed insertion-index
calculation likely landing the item at an incorrect final position), self-contained and
self-resolving the moment that one drag ends — real and worth fixing, which is exactly what
happened, but **Real severity, not Critical** — no persistent app-breaking state, no data loss
survives past that single gesture. Re-classifying retroactively for the record: C1 should be read as
R13 (Real, not Critical) with the corrected mechanism above superseding its original description.
M18 (the separate `setPointerCapture` fallback-comment finding) is unaffected by this correction and
stands as originally written.

**Process note:** flagging plainly rather than hedging, since the ask was specifically to determine
which side was right — this was a real error in my original trace, not a defensible difference in
testing environment. Worth remembering for future DOM-lifecycle reasoning on this project: removing
a container only detaches *that container* from its parent; a captured reference to one of its
*descendants* survives with a non-null (but orphaned) `parentNode`, it does not become `null`.

---

## Re-confirmation — 2026-09-09 (post-outage resume: full-file staleness check + C1 coverage
verified against real test/repro logic, not just prose)

**Trigger:** whole-team session/connection drop (auth token expiry) recovered. Since my last entry
(the C1 mechanism correction above, already committed/pushed at `0e8094e`), Developer shipped the
fix (`beginDrag()` re-fetches `li` fresh by id right after `commitEditor()`, sha `90983e3`) and
Tester landed dedicated regression coverage for it (TC13.11 strengthened, TC13.27 added, 219/219).
Asked to (1) re-read this whole file end to end for anything else gone stale during the outage, and
(2) do one more targeted pass — check the new TC13.11/TC13.27 coverage and the independent repro
script's actual *logic*, not just `S13-drag-drop-reorder.md`'s prose description of it — against my
own corrected C1 finding, same "check the real thing" standard as the S7/S8 crowded-row catch.

**(1) Full re-read, no other staleness found.** Every entry above this one is internally consistent
with itself and with what's now shipped: R9/R10/R11/M9-M18/M15's resolutions all still hold, S13's
and S15's Lock verdicts aren't contradicted by anything since, and the append-only
history/correction convention (this file's own header) means nothing needed back-editing. Nothing
else in this file references C1/S13 in a way the fix or its coverage would invalidate.

**(2) Traced the real fix, the real test script, and the real repro script — not the writeup.**

- **Fix, `script.js` `beginDrag()` (lines 493-526):** confirmed the re-fetch happens exactly where
  and how it needs to — `if (editingField) commitEditor();` (line 502) can trigger a full
  `render()`, and **immediately after**, before anything else touches `li`, line 522 re-derives it
  fresh: `li = listRoot.querySelector('li[data-id="' + id + '"]');`, with a defensive `if (!li)
  return;` guard, *before* `li.classList.add('dragging')` (line 526) ever runs. This is exactly the
  fix shape my corrected finding called for (mirroring how `idx` above it is already re-derived
  fresh, never trusting a reference across a render).
- **Confirmed `commitEditor()` (line 736) is a genuine fork, not one path wearing two names:** it
  dispatches to `saveNote()` (line 747) or `saveAisle()` (line 761) by field type, and each
  independently ends in its own `saveState(); render();` call. So TC13.27 (aisle) exercises a
  structurally distinct branch from TC13.11 (note), not a redundant re-run of the same one — both
  converge on the same `render()`-triggered staleness window the fix closes, which is exactly the
  point of covering both.
- **Test script logic, `c:\tmp\pw-test\vopping-tests-tester-s1-s13-formal.js`:** read TC13.11
  (lines ~1450-1482) and TC13.27 (~1764-1788) directly, not the test-plan's prose summary of them.
  Both: open the *other* row's (row A) note/aisle editor, type an uncommitted draft, then
  `pointerdown` + wait past the pickup delay on row B (the drag target) — which is precisely when
  `beginDrag()`'s `commitEditor()` call fires mid-gesture — then assert (a) row A's draft actually
  committed and (b) `isDragging(page, dragRowId)` is `true`. Read `isDragging()` itself (lines
  166-171): `page.evaluate(() => document.querySelector(sel).classList.contains('dragging'))` — a
  **fresh** DOM query executed inside the browser at check time, not a cached reference. Since
  `document.querySelector` only ever searches the currently-connected document tree, it is
  structurally incapable of matching an orphaned/detached clone — so this check can only pass if the
  *live, visible* row actually has the class, which is precisely the distinction my corrected C1
  mechanism turns on (stale clone gets `dragging`, live row doesn't). Confirmed the check runs
  *before* the cleanup `pointercancel` removes the class, so timing doesn't accidentally mask a
  failure either way.
- **Independent repro script, `c:\tmp\pw-test\vopping-c1-independent-repro.js`:** same fresh-query
  check pattern (`document.querySelector` + `classList.contains('dragging')`, evaluated in-browser),
  run against an isolated extraction of the pre-fix commit (`8b17aac`, via `git show`, never
  touching the live project tree) and the current post-fix files, using the story's own exact
  sequence (open row A's note editor, draft uncommitted, pointerdown+delay on row B). This isn't a
  hypothetical instrument — the script's own printed verdict logic explicitly distinguishes "threw
  an exception" from "live row never got `dragging`," and running it produced concrete, asymmetric
  results: pre-fix showed zero thrown errors and `liveRowBHasDragging: false` (the silent
  stale-clone signature, matching my corrected mechanism, not my original thrown-exception trace);
  post-fix showed zero errors and `liveRowBHasDragging: true`. That the same check mechanism
  produces different, correct results on the two known-different inputs is direct evidence the check
  is actually sensitive to the bug, not a tautology that would pass regardless.

**Verdict: the dedicated coverage genuinely closes the gap — confirmed against the real fix, real
test logic, and a real empirically-run repro, not just asserted by the writeup.** TC13.11/TC13.27's
`isDragging()` mechanism could not have passed against the pre-fix code (confirmed directly, not
inferred) and does pass against the shipped fix for both the note and aisle branches. No residual
gap found. No new findings. S13's Done status and the 219/219 regression citation both stand as
accurate.

---

## Per-story gate — 2026-09-09 (S19 restore Up/Down + remove drag-and-drop; S20 frameless icon restyle)

**Trigger:** per-story gate, per Orchestrator's request — S19 (revert S13's drag-and-drop back to
S5's Up/Down buttons after a second real-device drag failure) and S20 (restyle all per-row
`.icon-btn` controls frameless — glyph fills the footprint, no square outline) both cleared
Developer's sanity-check and Tester's testability-check, all findings folded into their locked-pending
AC in BACKLOG.md; about to go to Scrum Master for Lock. First QA review of either.

**Scope/method:** same as the S13-S17 gates and the S13 post-implementation review — read both AC
rows in full (BACKLOG.md lines 277/278, extracted via `node -e` since they're single-line GFM table
rows past Read/Grep's line limits), then cross-checked every claim against the **real live code**
(`script.js`, `style.css`), not the AC prose alone: the shipped drag machinery S19 removes, the
`focusout`-driven editor-commit path, the `.icon-btn`/`button` CSS S20 restyles, and the
`sort-manual` class's real consumers. Also verified S19's one outbound cross-story citation (S9's
"forward-reference note") actually exists rather than being a dangling reference (same check that
caught M16's dangling backward-reference on S15).

---

### REAL

**None for either story.** Both clear the gate with no Real findings. The one item that genuinely
matters for these two — the reintroduced 6-icon worst-case row — is already correctly locked as a
deterministic formal-pass verification requirement (S19 findings (a)+(f)); see "Confirmed sound"
below for why it's right, not a gap.

---

### MINOR

**M19 (S19). Removal-completeness gap: S19's finding (b) names removing the drag-era
`#list-root.sort-manual .items li { cursor: grab }` CSS rule, but is silent on the `sort-manual`
class-toggle in `script.js` (line 1229) that rule's selector depends on.** Verified directly: the
`sort-manual` class has exactly ONE consumer anywhere in the project — that single `cursor: grab`
rule (`style.css` line 209, toggled at `script.js` line 1229); grepped `sort-manual` project-wide,
no other reference in `script.js`/`style.css`/`index.html`. So the moment finding (b)'s named rule
is removed, the `listRoot.classList.toggle('sort-manual', ...)` call is fully orphaned dead code —
UNLESS S19 deliberately repurposes `sort-manual` to gate the restored Up/Down buttons' visibility in
CSS (`#list-root:not(.sort-manual) ... { display:none }`-style), which is one of the two plausible
ways to implement "Up/Down hidden in non-Manual sort, reappear in Manual." This is exactly the
"remove ALL drag-only artifacts or they orphan as dead code / latent bugs" category finding (b)
itself exists to close — it just doesn't resolve this specific one. Recommend one line picking a
direction: if Up/Down visibility is JS-gated in `renderRow()` (only emit the buttons when
`sortMode === 'manual'`), the `sort-manual` toggle should be removed alongside the cursor rule; if
CSS-gated, the toggle stays and is repurposed. Cheap, no PO input, same technical-shape category as
the rest of finding (b).

**M20 (S20). Removal-completeness + finding-(d)-premise gap: the inherited base
`button:hover { background: rgba(128,128,128,0.15) }` rule (`style.css` lines 69-71) still matches
`.icon-btn` after S20's restyle, so "remove the box" is not fully achieved by editing the
`.items .icon-btn` rule alone.** S20's finding (c) removal list correctly drops the now-dead
`border-color` declarations on `.icon-btn.delete-btn`/`.icon-btn.aisle-sort-icon` (confirmed against
real CSS — those DO carry a visible border today via the base `.icon-btn` `border: 1px solid` at
line 313, so the cleanup is accurate). But removing `border`/`background` from `.items .icon-btn`
does NOT remove the *separate* base `button:hover` rule, which still applies its rounded grey
highlight to every `.icon-btn` on hover — so finding (d)'s stated premise ("frameless removes the
`button:hover` background press-feedback") is slightly inaccurate: it isn't auto-removed, it has to
be explicitly overridden/removed for `.icon-btn`, and if left, a box-like highlight reappears on
hover, partially contradicting the PO's "remove the square outline." Low practical stakes — it's
hover-only, i.e. desktop-only; the PO's real device is a phone with no hover, and finding (d)
already requires adding *some* non-box press feedback regardless — but it's a genuine
removal-completeness item in the exact same category as finding (c), just not on its list.
Recommend S20 explicitly override/remove `button:hover`'s background for `.icon-btn` as part of
"remove the box," so the frameless result is actually frameless in all states, not just at rest. No
PO input needed.

---

### NITPICK

**N9 (S20).** `border-radius: 4px` on `.items .icon-btn` (`style.css` line 314) becomes vestigial
once `border` and `background` are removed (border-radius has no visible effect with no
border/background/box-shadow to round). Harmless — inert, not a bug — but it's the same
dead-declaration tidy-up category finding (c) explicitly performs for the dead `border-color`
declarations; worth dropping it in the same pass for consistency, not because anything breaks if
left.

**N10 (S20).** S20's scope explicitly lists Up/Down (S5/S19) among its restyle targets, but only
"sequenced after S15" is stated explicitly ("pairs with S19"). Because `.icon-btn` is a shared
class, implementation order is not actually load-bearing — whenever S19 re-adds the Up/Down buttons
with the shared `icon-btn` class, they inherit S20's frameless styling automatically (same way S14's
shrink auto-applied to future icons), so S20 landing before or after S19 both work. Flagged only for
completeness, same low-stakes shape as S14/S16's cross-reference sequencing; no action needed.

---

### Confirmed sound (reviewed against real code, no gap found)

- **S19 structurally eliminates the C1/R13 bug class — it does not reintroduce it.** C1 lived in the
  press-and-hold arm window: `beginDrag()` captured a DOM `li` reference at `pointerdown` and reused
  it up to 450ms later, across a `commitEditor()`-triggered `render()`, going stale. S19's restored
  Up/Down reorder is a plain synchronous `click` → array-swap → `render()` with no DOM element
  reference captured before and reused after a render — so the stale-reference mechanism cannot
  recur. Removing the drag machinery removes the whole failure surface, not just the one traced repro.
- **Cross-row editor-commit is inherited automatically by the restored Up/Down, no explicit commit
  logic needed.** Confirmed the editor commits via the delegated `focusout` listener (`script.js`
  ~1338-1345), not via each action handler calling `commitEditor()`. Tapping an Up/Down button (in
  the same `listRoot`) blurs any open editor input → `focusout` → deferred `commitEditor()`, exactly
  the path `delete` already uses today while an editor is open on another row. The swap operates on
  the item array by id (order-independent) and the draft commits by id afterward, so no draft is
  lost and no ordering hazard exists — same already-shipped behavior as delete-while-editing. Not a
  gap; S19's AC didn't need to (and doesn't) restate it.
- **S19's cited "S9 forward-reference note" genuinely exists and is correctly formed** — S9's row
  (BACKLOG.md line 268) carries an explicit 2026-09-09 note stating that once S19 ships, S9's
  non-Manual-sort clause re-points from S13's drag mechanic to S19's restored Up/Down, behavior
  unchanged, left pointing at S13 until S19 actually ships so Tester's coverage keeps matching what's
  implemented. Not a dangling citation (unlike M16's case on S15). The S9 test-side rewrite
  (TC9.8/TC9.9) is correctly flagged as Tester's call in S19 finding (e).
- **Disabled Up/Down state survives S20's framelessness** — the disabled affordance is
  `opacity: 0.3` (`.items .icon-btn:disabled`, `style.css` 326-329) plus `opacity: 0.4` on the base
  `button:disabled` — opacity-based, fully independent of border/background, so top-row-Up /
  bottom-row-Down still read as disabled after the frameless restyle. (Went in expecting a possible
  "disabled cue lost when the box is removed" finding; checking the real CSS ruled it out.)
- **The 6-icon worst-case row is correctly identified and its verification correctly locked.**
  Enumerated it against `renderRow()`: a both-fields-EMPTY item in Manual sort renders note-toggle +
  aisle-toggle + S15 edit (`name-toggle`, always present since names are never empty) + Up + Down +
  delete = 6 primary-line icons; populating a field removes its toggle (moves to a second line), and
  every non-Manual sort hides Up/Down (≤4 icons), so Manual/empty-fields/6-icon genuinely is the
  horizontal worst case. S19 (a)+(f) lock the right thing: measure that real row at 320/360/375/390px
  with the no-horizontal-overflow guardrail (flex-wrap permitted) as the deterministic pass/fail
  line, "~20 chars" kept as a PO-accepted observation not a per-character assertion, and the same
  measurement doubling as the deferred definitive S7/S8 crowded-row closure re-measurement. Correct.
- **S20 does not undo S14's shrink and does not itself relieve horizontal crowding** — it changes
  chrome (removed) and glyph size (enlarged to fill) within S14's existing ~19.5px footprint only.
  Consequence worth noting (not a defect): since S20 adds no horizontal room, if the 6-icon row wraps
  at 320px, that wrap is within S19 (f)'s accepted no-overflow-with-flex-wrap guardrail, not a
  failure — S19 and S20 are internally consistent on this.
- **S20's text-tag exclusion is correct against real CSS** — `.note-display`/`.aisle-tag` carry only
  a dashed underline + small padding (no `.icon-btn` border/box), so the PO's "tiny icon in a square
  button" instruction correctly doesn't apply to them; same boundary S14 already drew (N6).
- **The `user-select`/`-webkit-*` handling in S19 finding (c) matches the real CSS** — base
  `user-select: none` (S1/S2 whole-row-tap guard, line 169) correctly stays; the drag-motivated
  `-webkit-user-select`/`-webkit-touch-callout` additions (line ~170-190) correctly kept but
  re-scoped as general whole-row tap suppression, and the previously-tracked iOS real-device re-test
  correctly becomes moot once no press-and-hold gesture remains.

---

### Verdict

**Both S19 and S20 clear this gate — no Real findings for either.** Two Minors (M19 on S19, M20 on
S20), both cheap no-PO-input removal-completeness clarifications in the same category the stories'
own Developer-sanity-check findings already handle; recommend Scrum Master fold both in before Lock
(fastest, matches how prior gates folded small items in one pass) or track them as explicit
non-blocking follow-ups — neither blocks Lock on its own merits. N9/N10 (S20) are optional tidy-ups,
no action required. The substantive verification that must actually happen at S19's formal pass — the
true 6-icon empty-fields row measured at 320px against the no-overflow guardrail, doubling as the
S7/S8 closure re-measurement — is correctly locked and correctly scoped; nothing to add there.
Advisory only, as always — the Lock decision is Scrum Master's.

---

## Per-story gate — 2026-09-10 (S21 settings shell; S22 native aisle select / persisted set / migration; S23 aisle CRUD; S24 add-new-aisle from the item dropdown — the "aisle rework")

**Trigger:** per-story gate, per Orchestrator's request — all four stories cleared Scrum-Master +
Developer sanity-checks and Tester's testability-check (zero blocking; refinements folded
2026-09-10); about to go to Scrum Master for Lock. First QA review of any of the four.

**Scope/method:** same as every prior pre-Lock gate on this project (S13-S17, S19/S20) and the S13
post-implementation review — read all four AC rows in full (BACKLOG.md lines 297-300, extracted via
`node -e` since they're single-line GFM table rows past Read/Grep's line limits), then traced every
load-bearing claim against the **real live code** (`script.js`, `index.html`, `style.css`), NOT the
AC prose alone. Primary hunt (per the brief): the S8→S22 commit-model restructure against the S13
C1/R13 stale-DOM/render-timing hazard — the highest-value place to find a Real finding, since S22
touches the exact shared editor infra (editingField/openEditor/commitEditor/saveAisle + the four
delegated listeners) that produced this project's worst bug. Traced: `editingField` (script.js
line 497), `openEditor` (499-552, incl. its own synchronous commit-existing-editor-first at 524-526),
`commitEditor` (564-575), `saveAisle`/`saveNote`/`saveName` (577-631), the delegated
click/keydown/input/focusout listeners (1074/1100/1117/1153, the last with its `setTimeout`-deferred
`pending === editingField`-guarded commit), `renderList` focus-restore + By-Aisle grouping
(939-1003, grouping at 968-973, `aisleDisplayMap` at 961/694-701 → `getAislePool` 671-692),
`renderRow`'s S16 `isEditingAisle`/`aisleSortCompact` logic (795-916), and the `normalize`/migration
touchpoints (`parseStoredState` 23-40, `normalize` 121). Confirmed the iOS-zoom root cause directly:
`.row-meta-input` (today's aisle/note editor input) is `font-size: 0.82rem` (~13px, style.css line
374) — below iOS's 16px focus-zoom floor — while `.add-form input`/`.name-input` inherit 16px, so
S22's "native select + every new text input >= 16px" premise is real and correctly grounded. Not
gating on the note-field zoom (reserved S25) per the brief.

---

### REAL

**R14 (S22 — the primary finding: the S8→S22 commit-model restructure reintroduces the C1/R13
render-timing hazard class in a NEW, un-rescued form).** Opening the per-item aisle `<select>` while
a note or name editor is still open on a DIFFERENT row destroys the just-opened `<select>` (and its
open native dropdown/picker) mid-interaction, before the user can pick — so the first tap flashes the
picker open and closed and the aisle-set silently fails, requiring a second interaction. The AC's
"**Cross-editor timing to VERIFY... safe, double-render**" note misdiagnoses this as benign; the
actual hazard is the opposite ordering it doesn't consider.

Traced sequence (ordinary sequential single-finger use — leave a note/name editor open on row B,
then go set row A's aisle without first tapping away to close the note):
1. Row B's note/name `<input>` has focus; `editingField = {B, note}`.
2. User taps row A's aisle `<select>`. Native focus moves to the select → row B's input fires
   `blur`→`focusout` (bubbles to `listRoot`) → the delegated `focusout` handler (line 1153) captures
   `pending = editingField` and schedules `setTimeout(commitEditor-if-still-pending, 0)`.
3. The select's native dropdown/picker opens as the tap's default action. The current task ends.
4. The `setTimeout(0)` macrotask runs almost immediately (milliseconds), while the picker is still
   open awaiting the user's pick (seconds). `editingField === pending` is still true (nothing
   changed it) → `commitEditor()` → `saveNote(B)` → `saveState(); render()`.
5. `render()` → `renderList()` → `listRoot.innerHTML = html` (line 980) rebuilds the whole list,
   **destroying and replacing row A's `<select>` while its picker is open** → the picker is
   dismissed / the pending `change` is lost (the anchor element is gone). No aisle is set.

This is the SAME failure class as the 2026-09-08 focusout fix documented in the shipped code
(comment at lines 1128-1142: "a tap on one row's aisle-edit affordance while a different field's
editor was still open never opened the new editor at all on the first tap"). Critically, the fix
that solved it for the INLINE editors does NOT rescue a native `<select>`: for an inline editor, the
`click` handler re-opens the editor (openEditor synchronously commits, re-renders, and re-focuses the
NEW input), so the second render lands the user where they wanted. A native select's opening is a
browser default action with no handler of ours to re-trigger it — once `render()` destroys the
select, there is no code path that re-opens the picker. Reachable and reproducible on DESKTOP
Chromium too (destroying a `<select>` with an open dropdown closes it), so it is NOT solely a
real-device concern — the desktop formal pass can and should assert it. After the failed first
attempt the list is stable and `editingField` is null, so the SECOND tap works; net effect is a
"needs two taps, first silently does nothing" bug — exactly the severity the 2026-09-08 bug carried,
which this project treated as a genuine pre-Lock fix, not a nitpick.

Recommend: replace the AC's "safe, verify the sequence" characterization with a deterministic,
DESKTOP-testable requirement — open a note/name editor on row B, open row A's aisle select, assert
the picker opens AND a chosen value commits (and row B's draft also commits) on the FIRST
interaction — and add this specific combination to the pre-Lock verification set rather than assuming
it safe. Exact mitigation is Developer's call (e.g. commit any open editor synchronously on the
select's own `pointerdown`/`focus` before its dropdown opens — mirroring `openEditor`'s existing
commit-first pattern — rather than via the deferred `focusout` path; note even that needs real-device
confirmation that a synchronous re-render on pointerdown doesn't itself suppress the native picker on
that first tap). This is a Real finding: the AC's own flagged "timing to verify" understates a
concrete, reachable, already-precedented render-timing bug at the exact seam the brief prioritized.

**R15 (S22 × S9 — a dangling-value case the migration guard does NOT cover: the By-Aisle
group-header label lookup).** S22's normalized-key dangling-value guard is specified for the per-item
SELECT only ("the per-item select matches an item's current aisle to its option by NORMALIZED-KEY...
so pre-existing case/whitespace variants resolve to the seeded canonical option instead of a dangling
select"). But the same dangling exposure exists in a second place the AC never addresses: S9's
By-Aisle group-header **label** lookup. Today `renderList()` (line 972) computes the header label as
`groupKey ? aisleDisplayMap[groupKey] : 'Unassigned'`, and `aisleDisplayMap` is derived from
`getAislePool()` = starters ∪ **every live item's aisle value** (lines 671-701) — so for any live
item with a non-empty aisle, its normalized key is ALWAYS present in the map by construction; a
non-empty missing key is structurally impossible, which is why the fallback only covers the empty
case. Post-S22, `getAislePool()` "collapses to return `state.aisles`" (AC), so the map becomes
`state.aisles`-derived, NOT items-derived — and `aisleDisplayMap[groupKey]` for a live item's
non-empty aisle is now defined only IF that item's normalized key is in `state.aisles`. That
invariant ("every live item's non-empty normalized aisle key ∈ state.aisles") is real and IS
maintained by every normal path *if implemented exactly per AC* (migration seeds every distinct
remaining item value; select-change writes canonical values already in the set; S23 rename cascades
by normalized key on BOTH sides; S23 delete reverts matching items to '' AND drops the entry; S24
create+persist+assign). But it is no longer a STRUCTURAL guarantee — it is now an
implementation-dependent invariant across three separate stories, and the code has no defensive
fallback for a missing non-empty key: `aisleDisplayMap[groupKey]` would be `undefined` →
`escapeHtml(undefined)` → a group header rendering the literal text **"undefined."** Reachable if any
one of S23's/S24's sync steps is implemented one-sided (e.g. a rename that updates `state.aisles` but
whose item-cascade uses exact-string instead of normalized-key match — the exact orphaning S23's own
NB-2 exists to prevent), or from an unusual pre-existing/hand-seeded state. Recommend: (a) state the
cross-path invariant explicitly on S22/S23/S24 as a locked guarantee, and (b) extend the
existing empty-key fallback in the same spirit as this project's R1/`parseStoredState` defensive
posture — if a non-empty `groupKey` is absent from the map, fall back to the item's own aisle string
(`escapeHtml(item.aisle)`) rather than rendering "undefined." Cheap, no PO input. Low normal-op
reachability if S23/S24 are correct — flagged Real because it is precisely a "dangling value not
covered by the stated guard" case (the brief's explicit hunt) and the safety net that exists today is
being silently removed.

---

### MINOR

**M21 (S23 — rename collision check spuriously rejects a no-op / pure-recasing rename of the aisle
being renamed).** S23's validation: "reject any proposed name that case-insensitively duplicates
EITHER an existing state.aisles entry OR the current bucket label state.unassignedLabel... the SAME
normalized rule applies to BOTH create and rename." Read literally, "an existing state.aisles entry"
includes the very entry being renamed. So renaming `Produce` → `Produce` (no change, e.g. the user
opens rename and commits without editing) or `Produce` → `produce` (fixing casing) both
case-insensitively duplicate an existing entry (themselves) and are REJECTED with a "name already
exists"-style inline message on the user's own aisle — confusing, and it makes pure re-casing
impossible. Recommend the rename collision set exclude the entry being renamed (compare against all
OTHER entries + unassignedLabel); a rename whose normalized key equals its own current key is either a
harmless no-op or a legitimate recase, not a collision. Create is unaffected (nothing to exclude).
Cheap, no PO input.

**M22 (S24 × S23 — unspecified interaction: a colliding new-aisle name dismissed via blur — does it
revert (S24) or stay open (S23)?).** S24 routes the reveal-input's creation through "state.aisles via
S23, same validation," and S23's rejection signal (NB-3) is "the field STAYS OPEN, the create is a
no-op, a brief inline message is shown." But S24's own revert-on-cancel rule fires on "empty commit,
explicit cancel, AND blur dismissal." These collide for one reachable case: the user types a
NON-empty aisle name that collides with an existing aisle, then taps away (blur) instead of
explicitly cancelling. S23 says stay-open-with-error; S24 says blur reverts to the captured prior
aisle and closes. The natural resolution (blur always reverts+closes; S23's "stays open" governs an
explicit commit/Enter rejection, not a blur) is defensible but not stated. Pick one explicitly so
Tester has a single deterministic target for "colliding name + blur." Cheap, no PO input.

**M23 (S22/S16 — the showPicker() fallback does not actually open a picker, and file:// is a primary
deployment context).** S22's S16 ripple offers two implementations for the By-Aisle compact
affordance: (a) icon → `select.showPicker()` with "a graceful fallback to select.focus()", or (b)
"renders the select inline in compact mode." The AC itself notes `showPicker()` "is unsupported on
older iOS / some **file://** contexts" — and file:// is an explicit, first-class deployment target for
this whole app (index.html opened directly off disk). On those contexts, option (a)'s fallback
`select.focus()` merely focuses the (possibly visually-collapsed) select; it does NOT open a native
picker (focus ≠ open on iOS), so a user in By-Aisle sort would have no way to change an item's aisle
without first switching sort modes. Option (b) has no `showPicker` dependency and works everywhere.
The AC is satisfiable without the bug (choose b), so this is Minor rather than Real — but recommend
the AC resolve the fork toward a directly-tappable inline select in compact mode (or require option
(a)'s fallback to expose a tappable select, not just `.focus()`), so a core action isn't left
unreachable on the app's own documented file:// path. NB-6 already tracks "does showPicker open the
overlay" as a real-device signal; this is the distinct, un-tracked gap that the FALLBACK is
inadequate.

**M24 (S22 — a new always-present per-row `<select>` is added after the S19/S20 row-layout gate
closed, with no placement spec or worst-case-overflow re-check).** S22 describes "a persistent aisle
select carrying a data-role" per row, replacing today's conditional aisle affordance (an icon on the
primary line when empty, or a `.aisle-tag` on the second line when set). A `<select>` is materially
wider than the 19.5px `.icon-btn` it may replace, and "persistent" implies it renders on every row
regardless of state. This project has an ironclad precedent (R7, M14, M17, and the whole S19/S20
6-icon re-measurement) that every new per-row control gets an explicit layout cross-reference AND the
worst-case row re-measured at 320/360/375/390px for horizontal overflow — S22 adds a per-row control
and says nothing about its placement (primary vs. second line) or whether it reintroduces the
overflow that gate just closed. Recommend S22 specify the select's row placement and add a worst-case
overflow re-measurement to its formal pass (same shape as S19 findings (a)+(f)), so a new control
doesn't quietly regress the layout the S13-S20 saga spent five stories settling. No PO input needed.

---

### NITPICK

**N11 (S22 — "'Other' is EXCLUDED from the assignable set" reads as an invariant but is conditional).**
S22 states 'Other' "is EXCLUDED from the assignable set so there is never both a real Other aisle AND
the intrinsic bucket." That holds only while `state.unassignedLabel === 'Other'`. S23(c) explicitly
allows deleting the Other label (bucket falls back to built-in 'Unassigned') and then re-creating a
real 'Other' aisle — after which 'Other' IS assignable and IS a real entry in state.aisles, with the
no-aisle bucket now labeled 'Unassigned'. The two stories are temporally consistent (S22 describes the
default t=0 state; S23 the post-deletion state) and there's no real contradiction — the anti-collision
mechanism is S23's validation (reject a create/rename colliding with the CURRENT unassignedLabel), not
a permanent ban on the string 'Other'. But S22's flat wording could lead Tester to assert "'Other' can
never be a real assignable aisle" as an invariant, which S23(c) violates by design. One-line
reconciliation ("...excluded while it remains the unassignedLabel; re-creatable per S23(c) once the
label is deleted") removes the trap.

**N12 (S24 — the sentinel option needs a reserved value, or creating an aisle named exactly like it
must be rejected).** S24's "+ Add new aisle…" sentinel is dispatched on `change`. If it is identified
by its display label/value and a user creates (S23) or types (S24) an aisle literally named
"+ Add new aisle…", that real aisle's option would collide with the sentinel and selecting it would
wrongly trigger the add-new flow. Near-zero reachability, but cheap to close deterministically:
specify the sentinel is matched by a reserved value/attribute that no trimmed user aisle string can
equal (not by its label), and/or that S23/S24 validation rejects a name matching the sentinel label.

**N13 (S22 — confirm migration persists state.aisles, or that first-mutation persistence is
sufficient for the idempotency assertion).** The AC's idempotency test is end-state stability ("a
reload after migration does NOT re-mutate state.aisles or items"), correctly not call-count. If
migration does not itself `saveState()`, it re-runs on every load until the first real mutation
persists `state.aisles` — deterministic and idempotent in RESULT (same seed each time), so the stated
assertion still passes, and the "deleted-starter-must-not-resurrect" guarantee holds regardless
because any S23 delete persists the pruned set (making the migration guard skip on the next load). So
there's no functional bug either way — flagged only so the implementer consciously chooses (persist at
migration is the cleaner choice) rather than leaving idempotency resting on an unstated assumption.

---

### Confirmed sound (reviewed against real code, no gap found)

- **Migration map-then-seed order is correct and its rationale holds against the real code.** Verified
  the ordering matters exactly as the AC says: pre-existing items CAN carry `aisle === 'Other'` today
  (AISLE_STARTER_LIST at line 635 includes 'Other', and it's offered in the S8 datalist), so remapping
  Other-normalizing values to '' BEFORE the union is genuinely load-bearing — otherwise the union
  would re-add 'Other'. Comparing against the hardcoded 'Other' constant (not state.unassignedLabel,
  which doesn't exist at first migration) is correct. `normalize` (trim+toLowerCase, line 121) is the
  right dedup key and matches every other call site. Implementation note (not a finding, AC already
  says "Other EXCLUDED"): AISLE_STARTER_LIST currently ends in 'Other' — the seed must drop it.
- **No data loss from the Other→'' remap.** An item that was 'Other' becomes '' which is LABELED
  'Other' by default (state.unassignedLabel), so it still displays under 'Other' — semantically
  preserved, not lost. It does MERGE the previously-distinct S9 groups 'Other' (a real value) and
  'Unassigned' (no aisle) into one bucket, but that merge is the explicit intent ("there is never both
  a real Other aisle AND the intrinsic bucket"), consistent with the PO's Other==catch-all model.
- **The per-item normalized-key SELECT guard is correct and sufficient for its own scope.** Every
  distinct remaining item.aisle is seeded, so every live non-empty aisle has a matching option by
  normalized key; case/whitespace variants (produce, trailing-space Bakery) resolve to the canonical
  option with no item rewrite, and the change-handler canonicalizes on first edit. Exact-string
  selection was correctly rejected. (The gap is only the GROUP-LABEL lookup — see R15.)
- **The data-integrity invariant is maintained by every normal path when built to AC** — migration,
  select-change, S23 rename (cascade + entry update, normalized-key), S23 delete (revert-to-'' +
  entry removal, normalized-key), S24 create+assign. Items store aisle by-value (string), so S23
  rename cascades over items, as the AC states.
- **The persistent select integrates with focus-restore without special-casing** — `renderList`'s
  restore re-focuses by `data-role` and guards `setSelectionRange` to INPUT/TEXTAREA (lines 988), so a
  restored SELECT is focused but not range-set; the AC's claim here is accurate. (This does NOT rescue
  R14 — focusing a select ≠ re-opening its picker.)
- **S16's suppression logic degrades correctly once `isEditingAisle` disappears** — with the aisle
  editingField type removed, `isEditingAisle` is permanently false, so `aisleSortCompact` collapses to
  `sortMode === 'aisle'` and `showsAisleLine` to `aisleVal && sortMode !== 'aisle'`; the second-line
  aisle-tag suppression under By-Aisle sort still holds structurally. The affordance branch (849-851)
  and the click handler's `aisle-toggle → openEditor(id,'aisle')` (1083) are exactly the code that
  must be re-pointed at the select mechanism (per S22's "genuine RENDERING rework, not a glyph swap") —
  the AC correctly identifies this as the largest structural ripple.
- **S24's new-aisle mechanism genuinely stands alone.** Requiring its own `new-aisle` editingField
  type / dedicated handlers (NOT the removed 'aisle' path) is right; a fresh type re-uses the
  still-present note/name text-editor infra (openEditor/commitEditor/the input/focusout/keydown
  branches) cleanly, and `commitEditor` (564-575) already forks by field, so adding a `new-aisle`
  branch is additive. The sanity-check fix that explicitly forbids reusing the deleted 'aisle' path is
  well-placed: if left on 'aisle', a field='aisle' editingField would fall through commitEditor's
  else to `saveName` after S22 removes the aisle branch — the fix pre-empts exactly that.
- **S24 revert-on-cancel covers the reachable dismissals** — capturing the prior aisle before the
  sentinel changes select.value, and reverting on empty-commit / explicit-cancel / blur, is the right
  set (the only residual ambiguity is the colliding-name-on-blur case, M22).
- **Option order is internally coherent across S22 and S24** — no-aisle FIRST (labeled
  unassignedLabel), real aisles in insertion order, S24 sentinel ALWAYS LAST; explicitly and
  correctly distinct from S9's by-aisle GROUP sort (no-aisle bucket LAST).
- **iOS >= 16px guards are grounded in the real defect** — `.row-meta-input` at 0.82rem (~13px) is
  today's zoom trigger; the native select + >=16px on the select and every new S21/S23/S24 text input
  is the correct fix. (Note edits keep using `.row-meta-input` at 0.82rem, i.e. still zoom — correctly
  out of scope here as reserved S25.)
- **S21 is a clean greenfield shell** — no existing settings code; header (index.html 10-19) has room;
  the panel/scrim/X-close mechanism is separate from `listRoot` and doesn't touch the render/editor
  pipeline; S21 itself introduces no text inputs (its >=16px clause is vacuously satisfied — S23's
  create/rename fields are where it bites). Close-via-X-or-scrim (Escape optional) is consistent with
  the project's out-of-scope keyboard-nav decision. No finding.
- **Undo scope unchanged** — aisle selection stays outside S6's buffer (S22), consistent with S8; S23's
  aisle create/rename/delete undo-eligibility is correctly left as the logged, non-blocking OPEN PO
  question (delete-in-use being the one genuinely destructive new action) — not re-flagging it, it's
  already tracked in QUESTIONS.md with a testable working default.

---

### Verdict (per-story Lock recommendation)

- **S21 — CLEAR.** No Real/Minor/Nitpick findings. Clean shell; recommend Scrum Master lock as drafted.
- **S22 — HOLD FOR REAL FINDING.** Two Real findings: **R14** (the commit-model/render-timing hazard —
  the primary catch, desktop-testable, same class as the C1/R13 and 2026-09-08 focusout bugs, not
  rescued by the existing fix) and **R15** (the dangling group-label lookup — the migration guard
  covers the select but not S9's By-Aisle header label). Both are "technical-shape, no PO input"
  category (like R9/R11), fold-in-then-re-read pattern. Minors M23 (showPicker fallback / file://) and
  M24 (new per-row select placement + overflow re-check) and Nitpicks N11/N13 ride along on S22.
  Recommend fold R14+R15+M23+M24 in one pass, then one more QA re-read (this file's own history shows a
  single pass rarely catches everything).
- **S23 — CLEAR WITH CHEAP FOLDS.** No Real findings. One Minor (**M21**, rename self-collision) — cheap,
  no PO input; recommend folding before Lock or tracking as a non-blocking follow-up.
- **S24 — CLEAR WITH CHEAP FOLDS.** No Real findings. One Minor (**M22**, colliding-name-on-blur vs
  S23's stays-open) + one Nitpick (**N12**, sentinel reserved value) — both cheap, no PO input.

Advisory only, as always — the Lock decision is Scrum Master's. Note S22's R14 is the one item where
"assumed safe" and "verified safe" genuinely diverge, and the divergence sits exactly on this
project's most-repeated failure seam.

---

## Lock-gate re-read — 2026-09-10 (S21-S24, all findings folded; whole-AC coherence pass before Lock)

**Trigger:** Orchestrator relayed that Scrum Master folded ALL gate findings (R14, R15, M21-M24,
N11-N13) into S21-S24, and the PO confirmed the M23 by-aisle-compact decision as the inline `<select>`
(final, superseding S16's ⚑). Asked for the S13/S15-precedent Lock-gate re-read: (1) confirm each
finding is genuinely resolved as folded — R14 especially, traced against the REAL
editingField/commitEditor/focusout/render code, confirming it closes the render-timing hazard WITHOUT
opening a new one (no path leaving an editor permanently un-committed, no change-commit ordering that
strands a draft); (2) whole-AC coherence with everything layered in plus the inline-select
supersession; (3) final per-story Lock rec. S25 (note-field zoom) is a stage behind and NOT part of
this re-read.

**Method:** re-extracted the folded S21-S24 rows (BACKLOG.md 297-300 via `node -e`; S21 byte-identical
= unchanged, S22 7469→10430, S23 3948→4548, S24 2748→3393). Traced R14's three-part mitigation against
the real code — the delegated `focusout` listener + its `setTimeout`/`pending === editingField` guard
(script.js 1153-1161), `commitEditor` (564-575, which nulls `editingField` BEFORE dispatching to
save*), `openEditor`'s own commit-first guard (524-526), `saveAisle`'s re-derive-by-id (591-602), and
`renderList`'s focus-restore (982-998, `setSelectionRange` guarded to INPUT/TEXTAREA). Then traced
every folded rule against every other for a new contradiction, same as S13's six-round layering pass.

---

### Finding-by-finding resolution check

**R14 — CONFIRMED RESOLVED; traced against real code; closes the hazard without opening a blocking
one.** The folded mitigation is three coordinated pieces, all sound:
- *The `activeElement` gate is correctly placed at commit FIRE-time, not schedule-time.* When row B's
  note input blurs to row A's aisle select, focus moves synchronously (`document.activeElement` =
  select A) DURING the tap's event dispatch — before the scheduled `setTimeout(0)` macrotask runs. So
  at fire-time the gate sees the open picker (activeElement = an aisle select inside `listRoot`) and
  skips commit/render. The select is therefore NEVER destroyed mid-picker — directly closing the
  original R14 mechanism. This is strictly more robust than reasoning about schedule-time state.
- *The `change`-handler ordering is stale-DOM-safe.* Capture id+value (primitives) FIRST → `commitEditor()`
  (commits B's note; its `render()` destroys select A, but we already hold id+value) → `saveAisle(A, value)`
  which re-derives the index via `findIndexById` (line 592). No DOM reference is carried across a render
  (the exact C1/R13 lesson). B's note commits from the input-synced `editingField.draft`, not stranded.
  Verified the "change fires only after the picker closes" premise holds: the gate keeps the picker alive
  until the user picks, so `change` is what drives the commit — deterministic.
- *Mechanism 3 (aisle-select role added to the focusout SCHEDULING branch) handles dismiss-without-choosing.*
  When the select later loses focus, a deferred commit flushes any still-open note/name editor, guarded by
  `editingField === pending`; the tap-another-control path is already covered by `openEditor`'s own
  synchronous commit-first (524-526), so no double-commit and no errant commit (a focusout firing during
  a render where `editingField` is already null schedules a no-op `commitEditor`).
- *The rejected alternative is correctly rejected* — committing synchronously on the select's
  pointerdown/mousedown would `render()` away the very select being tapped (the mirror of the 2026-09-08
  bug); the AC names and rejects it.
- *Real-device dependency correctly flagged:* the gate assumes iOS keeps the `<select>` as
  `document.activeElement` while its native picker is open. The AC adds a scripted real-device step
  holding a picker open ~2s to exercise exactly this against a long-lived picker (Playwright's
  `selectOption` being the durable desktop regression guard). Right call — this is the one assumption
  desktop automation can't fully prove, and it's routed to real-device confirmation per NB-6 discipline.

  *One narrow NON-blocking residual, reported per the Orchestrator's explicit ask ("any path where the
  gate leaves an editor permanently un-committed"):* if the user has a note editor open, taps another
  row's aisle select, DISMISSES the picker without choosing, and then ABANDONS the session (no further
  interaction, closes/refreshes the app), the note draft stays uncommitted — mechanism 3 only flushes it
  on the NEXT interaction (a subsequent blur/change), which the abandon case never produces. This is NOT
  a regression in confirmed data: `editingField`/its draft are already in-memory-only and transient by
  design (a note editor left open and abandoned loses its draft on refresh TODAY, pre-S22), and the
  editor remains visibly open and recoverable by any single further tap. So it's the pre-existing
  transient-draft semantics with a slightly wider "I walked away mid-edit" window, not a new committed-data
  loss. Does not block Lock; worth one line in the S22 test notes so Tester doesn't mis-read it as a
  defect if they hit it.

**R15 — CONFIRMED RESOLVED.** S22 now carries the explicit cross-story invariant ("the header label
ALWAYS resolves") plus a defensive fallback to the raw `item.aisle` string, "same posture as R1 /
parseStoredState," so a missing key can never render the literal "undefined." Exactly the fix asked for.

**M21 — CONFIRMED RESOLVED.** S23 now states the rename collision check "MUST EXCLUDE the entry being
renamed... so a no-op or pure-recasing rename (e.g. Dairy → dairy) is not spuriously rejected." Clean.

**M22 — CONFIRMED RESOLVED, and consistent on BOTH sides.** S23: explicit-invalid-commit → field stays
open + inline message; blur dismissal → revert wins, state unchanged. S24 mirrors it verbatim in intent
(blur — including empty OR colliding — → revert wins; only an explicit commit of a colliding name
surfaces S23 NB-3's stay-open). No contradiction between the two rows; the fork is resolved the same way
on each. Clean.

**M23 — the DECISION is coherent and introduces no new contradiction; one doc-state note.** The inline
persistent select in By-Aisle compact mode (superseding S16's ⚑) is internally consistent: the same
persistent select renders in every sort mode, and the `aisleSortCompact`/second-line-suppression logic
(renderRow 838/903) is correctly flagged as needing a genuine rendering rework, not an element swap,
once `isEditingAisle` disappears. No conflict with S17's group-header styling or the 2026-09-09
`--accent` latent-bookkeeping note (that note is about per-state color-coding policy, unaffected by
removing the ⚑). *Doc-state note (not a contradiction):* the S22 row text still literally reads "WORKING
DEFAULT (M23... PROVISIONAL — PENDING PO CONFIRMATION)" — the Orchestrator has confirmed the PO made it
FINAL and that the flip provisional→confirmed (plus the S8/S9/S16 reciprocal supersession notes) happens
at Lock. So the only gap between current text and reality is that pending edit, which the Orchestrator
already owns; the AC content is coherent for Lock once flipped.

**M24 — CONFIRMED RESOLVED.** S22 requires a specified row placement for the now-always-present select
(exact position delegated to Developer) AND a worst-case-row overflow re-check at 320/360/375/390px, "per
the R7/M14/M17/S19 precedent." Correct locked verification requirement, same shape S19 used.

**N11 — CONFIRMED RESOLVED, bidirectional.** S22 states the Other exclusion is CONDITIONAL (only while
Other is the bucket label; re-creatable per S23 once it isn't); S23(c) cross-references "(per S22 N11,
Other becomes assignable again once it is no longer the bucket label)." Both sides agree.

**N12 — CONFIRMED RESOLVED, bidirectional.** S24's sentinel carries a RESERVED non-aisle value distinct
from any real aisle name (matched by value, not label); S23 additionally rejects creating an aisle whose
normalized name equals the sentinel label. Both belt-and-suspenders, consistent across the two rows.

**N13 — CONFIRMED RESOLVED.** S22 states persisting the seeded set immediately after migration via one
saveState is a conscious choice, with idempotency holding either way (deterministic re-derivation). Clean.

---

### Whole-AC coherence — new contradictions introduced by the fold?

Traced every folded rule against the others (R14 gate vs mechanism 3; change-handler commit-first vs
S24's sentinel-reveal; M22's blur-revert vs R14's focusout-flush; N11 vs S23 validation; N12 vs
migration/option-order; M24 always-present select vs the inline-select compact mode vs the S19/S20 layout
gate). **No new blocking contradiction.** The gate and mechanism 3 coexist cleanly (the gate defers a
commit while focus sits on any select; it always commits once focus lands on a non-select or a `change`
fires — no infinite-deferral that loses committed data, only the same transient-draft window noted under
R14). N11↔S23, N12↔S23/S24, and M22↔S23/S24 are each mutually consistent.

**Three NON-blocking implementation/cleanup verify-items** (flagged for Developer/Tester, none a Lock
blocker — same category as S13's M9/M10 wording nitpicks that didn't hold Lock):
1. *`commitEditor` must gain a `new-aisle` branch* (if S24 uses a dedicated `editingField` type): its
   fork is `if note … else if aisle … else saveName` (564-575), and S22 REMOVES the `aisle` branch, so a
   `new-aisle` type with no branch would fall through the `else` to `saveName` — the exact "shared
   machinery + a forgotten branch" class as C1. S24's "dedicated mechanism, named explicitly" covers the
   intent; worth Tester asserting a new-aisle commit never writes item.name.
2. *The `change` handler's "commit any open editor FIRST" must apply to the sentinel-reveal branch too*,
   not only the real-value/saveAisle branch — otherwise picking "+ Add new aisle…" while a note editor is
   open on another row could strand that note's draft. The AC pieces support it; the combined sequence
   just isn't spelled out in one place.
3. *Dead-code cleanup from the inline-select supersession:* S16's ⚑ (`AISLE_EDIT_ICON_GLYPH`),
   `.aisle-sort-icon`, and `.aisle-tag` (plus the already-noted `renderAisleDatalist`/datalist) become
   dead once the persistent select replaces the tag/affordance in all modes — fold into the S16
   supersession note, same removal-completeness discipline as M19/M20 on S19/S20.

---

### Verdict (final per-story Lock recommendation)

- **S21 — CLEAR.** Unchanged since the gate (byte-identical row); was clear, stays clear.
- **S22 — CLEAR (for the QA Lock-gate).** Both Real findings (R14, R15) are confirmed genuinely resolved
  against the real code; R14 closes the render-timing hazard without opening a new blocking one (one
  narrow, non-blocking transient-draft residual, consistent with existing semantics). M24/N11/N13 (and the
  M23 decision) all resolved. The ONLY remaining step before Lock is the doc edit the Orchestrator already
  owns — flip M23 provisional→confirmed and add the S8/S9/S16 reciprocal supersession notes. No QA
  objection to Locking once that edit lands.
- **S23 — CLEAR.** M21 and M22 resolved; validation (M21 self-exclude, N12 sentinel-label reject) coherent.
- **S24 — CLEAR.** M22 (blur→revert) and N12 (reserved sentinel value) resolved and consistent with S23.

No new Real findings on this re-read. The three verify-items above are non-blocking Developer/Tester
implementation notes, not Lock conditions. Advisory only — the Lock decision (and the pending M23 flip)
is the Scrum Master's / Orchestrator's.

---

## Per-story gate — 2026-09-11 (S26 — icon-gate the always-present per-item aisle select, restore single-line density)

**Trigger:** per-story gate, per Orchestrator's request — S26 cleared Scrum-Master + Developer
sanity-checks and Tester's testability-check (testable, zero blocking; 3 non-blocking clarifications
folded); about to go to Scrum Master for Lock. First QA review of S26. (S27, the paired icon-sizing
story, is being testability-checked in parallel and is NOT part of this gate.)

**Scope/method:** same as every prior pre-Lock gate on this project (S13-S17, S19/S20, S21-S24) and
the S13 post-implementation review — read S26's full AC row (BACKLOG.md, extracted via `node -e`
since it's a single-line GFM table row past Read/Grep's line limits), then traced every load-bearing
claim against the **real shipped `script.js`/`style.css`/`index.html`** (the S21-S25 aisle-rework code
S26 modifies), NOT the AC prose alone. Primary hunt (per the brief and this project's own R14/C1/R13
history): does Option C — keep the native `<select>` always-present + always-openable, S22's exact
R14-safe model, and only RELOCATE it to the primary line + collapse it to an icon footprint via CSS —
genuinely inherit S22's R14 safety with ZERO commit/guard changes and introduce NO new render/commit
seam and no path for a `render()` to fire while a native picker is open. Traced: the delegated
`change` handler (script.js 1372-1391), the deferred-`focusout` `activeElement` guard (1345-1368, the
guard proper at 1363-1365), `saveAisle` (683-695), `commitEditor`/`openEditor` (605-667), `renderRow`
+ `renderAisleSelect` (972-1106, the `.row-meta` block at 1053-1066), `renderList`'s focus-restore
(1167-1187) + By-Aisle grouping (1147-1160), and the delegated `click`/`input`/`keydown` listeners
(1251/1304/1279). Confirmed every AC line-reference is accurate against the real file. NB-6 respected
throughout: the native picker opening on a tap-through of the glyph overlay is treated as a
real-device signal, NOT asserted in Chromium — only the structural proxies are gated.

---

### REAL

**None.** The primary hunt — the highest-value place to find a Real finding, per the brief — came up
**clean, and that clean result is itself the load-bearing finding of this gate.** Traced against the
real code, Option C genuinely inherits S22's R14 safety:

- **The commit path and the guard can, and do, stay byte-for-byte untouched.** The `change` handler
  (1372) matches on `data-role === 'aisle-select'` and re-derives the row via
  `target.closest('li[data-id]')`; the focusout guard (1363-1365) keys only off
  `document.activeElement`'s `data-role` and `listRoot.contains(ae)`. Neither reads the select's
  position within the `<li>` or its CSS. Relocating the select from `.row-meta` (a child `<div>`) to a
  direct primary-line child of the `<li>`, and collapsing it via `appearance:none`/fixed width, changes
  neither `closest('li[data-id]')`'s result nor which element becomes `activeElement` on focus — CSS
  never affects focus eligibility. So the AC's "zero JS commit/guard changes" claim is precise and
  correct (only `renderRow` markup + CSS change — a rendering rework, not a commit/guard change, exactly
  the distinction the AC draws).
- **No new render/commit seam is introduced, and no `render()` can fire while a picker is open.** The
  R14 hazard class (C1/R13, and the 2026-09-08 focusout bug) is destroying/recreating the element the
  user is interacting with, mid-interaction, via an un-guarded `render()`. Option C keeps the `<select>`
  ALWAYS-PRESENT (never destroyed/recreated to reveal it) and adds no new JS — no new event handler, no
  new `render()` trigger. The only deferred render on this project (the focusout `setTimeout(0)`) is
  the one already guarded by the `activeElement === aisle-select` check, unchanged. Re-traced the full
  cross-row scenario (row B note editor open → tap row A's collapsed aisle select → focusout schedules a
  deferred commit → picker opens, `activeElement` = select A → the `setTimeout` fires, sees the open
  picker, SKIPS commit/render → user picks → `change` captures id+value first, commits B's note, then
  `saveAisle(A)`): identical to S22's already-Lock-verified flow, because the select is the same
  `data-role="aisle-select"` element with the same handlers. The mirror-image hazard is avoided
  STRUCTURALLY (the select was there all along), not merely re-guarded — exactly as the AC's R14
  invariant states.
- **The Developer's key insight is correct against the code:** the density defect was the select being
  full-width ON A SECOND LINE (`renderAisleSelect` unconditionally appended into the always-emitted
  `.row-meta`, script.js 1053-1066), NOT its being always-present. Keeping it always-present therefore
  costs nothing for R14 safety while shrink-and-relocate alone fixes density.
- **The one assumption Option C rests on is unchanged from S22 and correctly NB-6-scoped:** the guard
  needs the `<select>` to be `document.activeElement` while its native picker is open. That was already
  the accepted real-device-confirmed assumption for the shipped S21-S25 build; `appearance:none` +
  collapse does not newly jeopardize it (focus ≠ visual styling). Tester's clarification C1 correctly
  labels the tap-through-opens-the-picker behavior a non-blocking real-device signal, gating only the
  desktop structural proxies (select present on the primary line at the icon footprint, glyph overlay
  `pointer-events:none`, `change`-commit works, NO reveal-render, select persists across renders).

Also confirmed clean: the glyph overlay's `pointer-events:none` tap-through does not disturb
nested-control precedence (a tap resolves to the `<select>`, which carries `data-role="aisle-select"`
→ the delegated `click` handler at 1251 hits the `data-role` guard and `return`s before
`toggleChecked`, so it never crosses the item off); CSS-hiding the option text cannot affect the
select's `.value`/`change` payload (`saveAisle` reads `target.value`, untouched by styling); and
S24's sentinel path is unaffected (the sentinel is detected by `selOpt.dataset.sentinel === '1'`, not
by geometry — `openNewAisleEditor` still reveals the new-aisle input in `.row-meta`, a transient
editing second line, not the always-present density cost).

---

### MINOR

**M25 (S26 — the "6-icon layout S19 already measured, fits cleanly" equivalence is imprecise: the 6th
control is a `<select>`, not an `.icon-btn`, so the prior measurement does not transfer 1:1, and the
deferred combined re-check must measure the SELECT's real footprint rather than assume icon-btn
parity).** The AC's overflow argument is: S26 moves the worst-case primary-line count 5→6, "exactly the
6-icon layout S19 already measured fitting CLEANLY at 320/360/375/390px (222/222)." Traced against real
code, the COUNT is accurate (current aisle-less/note-less Manual row = note-toggle + name-toggle + Up +
Down + delete = 5 primary-line `.icon-btn`s with the select on the second line; S26 adds the aisle
control back to the primary line → 6). But S19's 6th control was a `<button class="icon-btn">`
(the pre-S22 aisle-toggle), governed by `.items .icon-btn { width/height/min-width: 19.5px }`
(style.css 271-302). S26's 6th control is a `<select>`, which is NOT class `.icon-btn` and will NOT
inherit those sizing rules — and a native `<select>` under `appearance:none` does not reliably collapse
to an arbitrary declared width across engines (intrinsic min-inline-size / reserved arrow-region
behavior is engine-dependent), so its rendered footprint is not guaranteed identical to a button's even
at the same declared `width`. The AC does say "collapse it to an `.icon-btn`-sized footprint... fixed
icon width," which covers the INTENT, but leans on the S19 measurement for its feasibility claim as
though the element type were interchangeable. Non-blocking — the required combined re-check (deferred to
after the S26→S27 pair, correct per the S13→S14 precedent) plus the established flex-wrap-not-overflow
guardrail are the real safety nets — but recommend one line: the collapsed select needs its own explicit
~19.5px sizing (it is not `.icon-btn`) AND the combined re-check must specifically measure the collapsed
`<select>`'s rendered footprint at the four widths, not certify by icon-btn parity. Cheap, no PO input.

---

### NITPICK

**N14 (S26 — the empty `.row-meta` height trap: the density fix depends on an aisle-less/note-less row
NOT contributing any second-line height, and the current markup emits `.row-meta` unconditionally).**
`renderRow` today always builds `secondLine = '<div class="row-meta">' + ... + renderAisleSelect(item)
+ ...` (script.js 1053-1066), and `.row-meta` carries `flex-basis: 100%; margin-top: 0.15rem; display:
flex` (style.css 347-353) — so once the select relocates off it, an aisle-less/note-less row that still
emits an EMPTY `<div class="row-meta">` would force a wrap line plus ~2.4px of top margin, i.e. NOT the
single-line height the story guarantees. The Developer must either not emit `.row-meta` when it has no
content, or add `.row-meta:empty { display: none }`. Flagged only for completeness: Tester's C2 pins the
density signal to a deterministic height-equality assertion "robust whether or not an empty `.row-meta`
div is emitted," which catches this exact trap either way — so it is already covered, not a gap.

**N15 (S26 — accessibility of the collapsed select + glyph overlay, to settle with the deferred glyph
pick).** With the select's option text clipped/transparent and the visible glyph supplied by a
`pointer-events:none` overlay span, the overlay should be `aria-hidden="true"` and the `<select>` should
retain an accessible name (today `renderAisleSelect` gives it `title="Aisle"`; an explicit `aria-label`
is sturdier). No functional risk — a `<select>` still exposes its accessible name and selected option to
AT regardless of the visual clip — and this rides naturally on the post-Lock set-aisle-presentation +
glyph mockup that is already deferred, so no action needed at Lock.

---

### Confirmed sound (reviewed against real code, no gap found)

- **Density path is correctly specified and correctly tested.** The single-line guarantee is scoped to
  aisle-less items only ("a row that HAS an aisle set MAY be two lines"), Tester's C2 pins it to a
  height-equality assertion, and the mechanism (relocate the select off `.row-meta`, emit `.row-meta`
  only for real second-line content) is the correct fix for the traced defect. No path leaves an empty
  second line contributing height once N14's emission/CSS detail is handled (which C2 verifies).
- **By-Aisle / S9 / S16 coherence holds.** The current code applies NO sort-mode suppression to the
  select (`renderAisleSelect` is called unconditionally regardless of `sortMode`), so S26 removes no
  suppression and creates no dead code; the aisle icon staying present in ALL modes including By-Aisle
  honors S16's own hard-won edit-in-every-sort-mode lesson (the exact self-contradiction S16 caught),
  and the previously-redundant full-width select under a group header simply becomes the compact icon.
  No contradiction with S17's group-header styling or the By-Aisle grouping/label logic (R15 guard
  untouched).
- **Cross-story coherence with S22/S24 is intact.** S24's `+ Add new aisle…` sentinel + inline-create
  flow works unchanged through the collapsed select (sentinel detected structurally via
  `data-sentinel`, not geometry; the reveal input still renders in `.row-meta` as a transient editing
  line); the `change`-handler's commit-first step, `saveAisle`, migration/`state.aisles`,
  normalized-key matching, the R15 fallback, and the `Other`/no-aisle bucket are all KEPT — S26 is a
  presentation-only change and does not reopen any S22/S24 functionality.
- **The deferred set-aisle-presentation + glyph mockup does not jeopardize the locked mechanism.** For an
  aisle-LESS item the mechanism is fully determined (collapsed always-present select showing the add
  affordance glyph → single line). Whichever way the post-Lock mockup resolves tag-vs-inline for a SET
  aisle, the always-present select + R14 safety is preserved (a tag adds a second-line display beside
  the still-present collapsed edit affordance; an inline treatment un-clips the same select) — so the
  deferral is a genuine, coherent presentation-only open item, not a latent contradiction with what is
  being Locked now. The AC correctly flags the tag-vs-inline↔mechanism coupling as the "S16 moving-target
  trap" and defers accordingly.
- **The overflow re-check deferral is correctly scoped** (one combined re-check after the S26→S27 pair,
  S13→S14 precedent; S27 only shrinks glyph size within fixed boxes so it cannot worsen horizontal fit)
  — subject only to M25's precision note about measuring the select's own footprint.
- **The iOS focus-zoom guard is preserved and does not conflict with the collapse.** The select keeps
  `font-size >= 16px` (style.css `.aisle-select` 424-435, to be restyled); since the visible icon is the
  overlay glyph and the select's own (now clipped/transparent) option text does not drive the visible
  size, the 16px belt-and-suspenders can stay without affecting the ~19.5px footprint. A native select
  does not trigger focus-zoom regardless (S22's whole premise), so this is unchanged.

---

### Verdict (per-story Lock recommendation)

**S26 — CLEAR (with one cheap fold recommended).** No Real findings — and the R14/C1/R13-hazard hunt,
the brief's designated highest-value target, came up genuinely clean when traced against the real code:
Option C inherits S22's R14 safety structurally (always-present select, byte-for-byte-untouched
commit/guard, no new render/commit seam, no `render()` reachable while a picker is open). One Minor
(**M25**, the select-vs-icon-btn footprint precision on the overflow claim) — cheap, no PO input;
recommend folding one line before Lock or tracking it as a non-blocking follow-up on the combined
re-check. Two Nitpicks (**N14** empty-`.row-meta` height, already covered by Tester's C2; **N15** glyph
overlay a11y, rides on the deferred mockup) — no action required at Lock. The set-aisle presentation +
glyph deferral to a single post-Lock PO mockup is correctly scoped and does not block. Advisory only, as
always — the Lock decision is Scrum Master's.

---

## Per-story gate — 2026-09-11 (S27 — equalize row-icon glyph rendered heights up to the note glyph via per-glyph font-size, glyph-only within the fixed ~19.5px boxes)

**Trigger:** per-story gate, per Orchestrator's request — S27 (the companion sizing story to S26)
cleared Developer's sanity-check (the sharp finding that redefined the AC: every row icon already
renders at the identical box size, the note only LOOKS bigger due to heavier glyph metrics, so a
uniform bump is a no-op and per-glyph tuning is required) and the PO validated the "match" definition
via screenshot; Tester's testability-check just cleared (zero blocking). First QA review of S27.

**Scope/method:** read S27's full AC row (BACKLOG.md, extracted via `node -e` — single-line GFM table
row), then traced every load-bearing claim against the **real shipped `style.css` + `script.js`**, NOT
the AC prose alone: the `.items .icon-btn` box/glyph rules (style.css 271-322), S20's own in-box-
containment reasoning (the 290-294 comment), the `:hover`/`:active`/`:disabled` states (312-322), and
the six glyph hosts in script.js — `NOTE_TOGGLE_ICON_GLYPH` U+1F5CB (558), `NAME_EDIT_ICON_GLYPH`
U+270E (567), Up ▲ / Down ▼ (1043-1044), delete ✕ (1072), and S26's still-deferred aisle glyph. NB-6
respected: the on-device visual match to the note glyph is a real-device signal, NOT asserted in
Chromium — only the structural proxies are gated.

---

### REAL

**None.** Traced against the real CSS, S27's load-bearing overflow-safety constraint holds:

- **The fixed ~19.5px box is preserved and the row cannot grow.** `.items .icon-btn` sets explicit
  `width/height/min-width: 19.5px` (style.css 277-279); `font-size` does not participate in the box's
  layout size (globally `box-sizing: border-box`, `padding: 0`, no border). As a flex ITEM of
  `.items li` (which is `align-items: center`, not stretch), the icon-btn's cross size is its explicit
  19.5px and a taller glyph overflows visually — it does NOT expand the row — because the flex
  `min-*:auto` content-minimum applies only to the MAIN (horizontal) axis for a row-direction
  container, not the cross axis. This is exactly S20's already-stated reasoning ("`line-height:1` + the
  fixed height + inline-flex centering keep the enlarged glyph in-box, so the row does not grow
  taller"), which S27 correctly inherits. So enlarging glyph font-size per-glyph keeps both the box
  footprint (horizontal fit) and the row height unchanged — the whole point of the fixed-box constraint.
- **It is genuinely CSS-only — no JS, no data model, no behavioral surface.** Each of the five
  icon-btn glyphs carries a distinct `data-role` already (note-toggle/name-toggle/up/down/delete), so
  per-glyph `font-size` is achievable purely via `.items .icon-btn[data-role="…"]` selectors with zero
  `script.js` change; the glyph string constants, `state`, S6's undo buffer, and every event handler
  are untouched. Confirmed no behavioral/interaction surface is exposed.
- **The desktop pass/fail line is correctly the structural proxy, not a parity-to-the-note-glyph
  check.** The AC pins the desktop pass to "per-glyph font-sizes applied, boxes unchanged" and routes
  the actual visual match to on-device confirmation, explicitly because U+1F5CB is the exact glyph S7
  found renders differently on the PO's own machine (device-unstable). This is textbook NB-6 discipline,
  consistent with S7's device caveat and S13/S22's precedent — asserting pixel-parity on desktop would
  be the wrong gate, and the AC does not make that mistake.
- **Coherence with S20's frameless model is clean.** S27 works entirely within S20's fixed-box /
  glyph-fills model (it changes only font-size, leaving border:none/background:transparent and the
  `:hover`/`:active scale(0.82)`/`:disabled opacity` states intact) and legitimately SUPERSEDES S20's
  "renders slightly unevenly — accepted" note — S20 accepted the unevenness as the tradeoff of ONE
  uniform size; S27 removes that tradeoff via per-glyph sizing. That is a proper cross-story refinement
  (reciprocal note to S20 at Lock, per the AC), not a contradiction.

---

### MINOR

**M26 (S27 × S26 — S27's `.icon-btn`-box framing does not cleanly cover S26's aisle glyph, which does
NOT live on an `.icon-btn`; and its SIZE ownership is split between S27 and S26's deferred glyph
mockup).** S27 explicitly lists "S26's new aisle glyph" among the glyphs it equalizes "GLYPH-ONLY
within the fixed ~19.5px `.icon-btn` boxes." But per S26's chosen Option C, the aisle affordance is a
collapsed native `<select>` with its glyph supplied by a separate `pointer-events:none` OVERLAY SPAN —
that glyph is not an `.icon-btn` text glyph and its host is not an `.icon-btn` box (see this file's M25:
the collapsed `<select>` is not class `.icon-btn` and won't inherit its sizing). So two gaps: (1)
precision — S27's "within the `.icon-btn` boxes" is literally inapplicable to the aisle glyph; tuning it
means targeting the overlay span's own `font-size`, with the collapsed select's ~19.5px footprint as its
box, not an `.icon-btn`; (2) ownership — S26 DEFERS the aisle glyph itself (and the set-aisle
presentation it's coupled to) to a single post-Lock PO mockup, so the glyph does not even exist when
S27 would tune it, and it is more natural for that same mockup to settle the aisle glyph's SIZE than for
S27 to tune a glyph the mockup will produce. Same cross-story-boundary shape as M14/M17 (a new per-row
icon introduced across a story seam, its sizing/cross-reference not synced). Non-blocking — the aisle
glyph is not on S27's critical path (it's deferred, and the one combined M24/R7 overflow re-check runs
after the S26→S27 pair regardless) — but recommend one line: either scope the aisle-glyph sizing to the
overlay element explicitly (not "the `.icon-btn` boxes"), or hand the aisle glyph's size to S26's
already-deferred glyph mockup and drop it from S27's enumerated target list. Cheap, no PO input.

---

### NITPICK

**N16 (S27 — keep a base `.icon-btn` font-size as the fallback when the single uniform value is
replaced by per-glyph rules).** Today `.items .icon-btn` carries one `font-size: 1.15rem` (style.css
295) that every icon-btn shares. When S27 introduces per-glyph overrides, it should retain a sensible
base `font-size` on `.items .icon-btn` (not remove it in favor of five per-role rules only), so any
icon-btn without an explicit per-glyph rule — a future control, or one added by a later story — still
renders at a deliberate size rather than dropping to the browser-default button font-size. Trivial
housekeeping, no functional stakes; flagged only so the refactor doesn't accidentally leave the base
unset.

---

### Confirmed sound (reviewed against real code, no gap found)

- **The Developer's redefinition of the AC is correct against the real CSS.** There is genuinely no
  note-specific size rule anywhere — all six controls share `.items .icon-btn`'s single `font-size:
  1.15rem`; the note only looks bigger because U+1F5CB has fuller/taller metrics than the thin line
  glyphs at the same size. So a uniform bump IS a no-op for "match," and per-glyph tuning IS the
  required mechanism. The PO's screenshot validation of this (glyph-metrics, not box-size) is consistent
  with what the code shows.
- **No horizontal-overflow risk is introduced by S27.** S27 adds no controls and changes no box widths,
  so it cannot worsen the 320px fit; the AC's "the S26 6-icon worst-case still fits, fixed boxes are
  what keep it" is accurate, and deferring the single combined re-check to after the pair (S13→S14
  precedent) is correctly scoped. (S26's own M25 nuance about measuring the collapsed select's footprint
  carries into that same combined re-check.)
- **Scope stays in its lane** — S27 touches only the icon-btn GLYPH sizing, not `.note-display` /
  `.item-name` / aisle text (the same boundary S14/S20 already drew), so there's no collision with the
  locked single-line/truncation specs.
- **Sequencing (S26 then S27) is coherent** — finalizing icon size once against S26's final primary-line
  layout mirrors the S13→S14 mechanism-then-sizing split the AC cites; the only residual is M26's
  aisle-glyph ownership question.

---

### Verdict (per-story Lock recommendation)

**S27 — CLEAR (with one cheap fold recommended).** No Real findings — the load-bearing constraint
(fixed ~19.5px boxes, glyph-only enlargement, no box resize, no row growth, no horizontal-fit change)
holds against the real CSS, S27 is genuinely CSS-only with no data-model/undo/behavioral surface, it
coheres cleanly with S20's frameless model (which it legitimately supersedes), and the desktop pass/fail
line correctly rests on structural proxies with on-device match as the NB-6 real-device signal. One
Minor (**M26**, the aisle-glyph host-element / size-ownership coherence with S26) — cheap, no PO input;
recommend folding one line before Lock or tracking as a non-blocking follow-up. One Nitpick (**N16**,
retain a base icon-btn font-size fallback) — no action required at Lock. Advisory only, as always — the
Lock decision is Scrum Master's.
