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
