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
