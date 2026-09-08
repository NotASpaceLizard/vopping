# Sprint Log

One entry per sprint/session. Sprint 1 numbering starts the real implementation work;
Sprint 0 is team/backlog setup only, same convention as vacking's own Sprint 0.

## Sprint 0 — 2026-09-04

- **Goal:** Team/planning setup only — no implementation yet. Read
  `AGENTIC_ORCHESTRATION_PLAYBOOK.md` in full and the stale `project-notes.md`
  (now marked superseded, pointing at BACKLOG.md as current source of truth).
  Incorporated the PO's resolved decisions relayed by the Orchestrator (single-user/
  fully-offline scope, plain HTML/CSS/JS + localStorage tech stack, new paste-to-
  ingest feature, up/down-button reorder over drag-and-drop, single-last-action-only
  undo, row-density TBD pending `density-picker.html`) and drafted `BACKLOG.md`
  (11 stories, S1-S11) and `QUESTIONS.md` from scratch.
- **Committed stories:** None — this sprint is planning/backlog-drafting only.
- **Outcome:** Backlog drafted and self-sanity-checked by Scrum Master (each story's
  AC reviewed for internal consistency, right-sized scope, and testability;
  dependency ordering worked out explicitly — e.g. S6/undo sequenced after S1-S5,
  S9/sort after S8/aisle, S10/frequency-suggestions after S1+S4). Two non-blocking
  product questions logged to QUESTIONS.md with working defaults (S2 auto-move-on-
  check; S10's frequency signal/threshold), plus the still-open row-density pick.
  Reported back to Orchestrator for review/relay; awaiting go-ahead before Developer
  sanity-check starts on Sprint 1.
- **Update, 2026-09-04 (same day):** Tester's testability pre-check on Sprint 1 landed
  two items, both folded into BACKLOG.md directly: S4 now specifies an all-blank-lines-
  paste no-op (mirrors S1's existing empty-input no-op), and S3/S4 each got a one-line
  forward-reference hedge (mirroring S6's own style) making explicit that their
  undo-related clauses aren't independently verifiable until S6 exists. QA's first full
  sweep (docs+design only, no live app yet — see QA_FINDINGS.md) landed next with 6 Real
  findings and 6 Minor findings. Per Orchestrator's routing: R1 (no corrupted-localStorage
  guard, same bug class as vacking's shipped S30/S31 crash) and R6 (S8/S9 aisle values
  lack S10's existing case/whitespace normalization) were resolved directly into BACKLOG.md
  (S1/S10 for R1; S8/S9 for R6). R2 (S3's no-delete-confirm + S6's single-slot undo combine
  into a zero-warning permanent-data-loss path) is a genuine PO-level tradeoff — drafted 3
  concrete resolution options into QUESTIONS.md's Blocking table (toast-on-delete/longer
  undo window for deletes/lightweight delete-specific confirm) for the Orchestrator to bring
  to the PO as a real choice, rather than guessing. R3 (no bulk "clear checked" mechanism,
  undermines S10's whole premise) and R4 (density-picker.html's 4 mockups omit delete/
  reorder/note/aisle controls that will share the same row) are product/tooling questions
  routed to the Orchestrator, not resolved here. R5 (S4's verbatim paste will capture
  literal bullet/number prefixes from real recipe-site copy-paste, e.g. "- Milk") was
  surfaced by QA but not yet addressed — outstanding, flagged for a follow-up pass. Also
  folded in the Minor items that were cheap given Sprint 2 hasn't started: M1 (note/aisle
  edits neither create nor clobber a pending undo target — resolved on S6/S7/S8), M2 (a
  live add now renders immediately at its correct position under an active non-Manual
  sort, not just at the array's true end), M3 (added an explicit top-of-file tracked
  follow-up + per-story Done-gates on S1/S2/S5 so the density-pick CSS pass can't silently
  evaporate), M4 (retroactive QUESTIONS.md paper trail confirming the "clear site data"
  exception was a real PO decision relayed pre-draft, not an inline assumption), M5 (S1
  now states its no-dedup policy explicitly instead of leaving it inferred from S4), and M6
  (S7 whitespace-only notes now trim to empty, same precedent as S1's item-name handling).
  All edits grep-verified as single physical GFM table lines immediately after writing.
- **Update, 2026-09-04 (same day, continued):** PO resolved the three remaining open QA
  findings via the Orchestrator. **R3** (no bulk-removal mechanism, undermining S10's
  entire "items leave the list between trips" premise) — approved; drafted and added a
  new **S12** ("clear all checked items" bulk action) to BACKLOG.md, sequenced into
  Sprint 1 after S2/S6 (needs check state to exist, and needs the undo buffer to make its
  own undo-eligibility call). Decided directly that S12 is undo-eligible as ONE atomic
  action (same precedent as S4's paste-batch), not excluded from undo like S7/S8's
  note/aisle edits — its risk profile is much closer to S3's delete than to a low-stakes
  field edit. Also updated S3's and S10's rows to cross-reference S12. **R5** (S4's
  verbatim paste would capture literal bullet/number prefixes from real recipe-site
  copy-paste, e.g. "- Milk") — resolved: strip leading list-marker glyphs only (a fixed
  small set: -, *, •, or a leading number+./)), formatting-noise cleanup only, not real
  ingredient parsing; folded into S4's AC directly. **R2** (S3's no-confirm + S6's fragile
  single-slot undo) — PO picked Option A: a brief "Deleted '<item>' — Undo" toast at the
  moment of deletion, no blocking confirm; S3's original no-confirm decision and S6's
  undo-buffer mechanics both stay unchanged, the toast is purely a UI surfacing of the
  existing Undo control at the moment it matters most. Folded into S3's/S6's rows and
  marked Answered in QUESTIONS.md's Blocking table — that table now has zero open rows.
  QA's sweep 1 is now fully closed out except R4 (density-picker.html mockup fidelity,
  a tooling concern for the Orchestrator/Developer, not a BACKLOG.md AC item). Sprint 1
  AC lock is now waiting on Developer's sanity-check only.
- **Carryover:** None — nothing was in flight before this sprint.

## Sprint 1 — AC locked 2026-09-04, implementation not yet started

- **Goal:** Ship the core mutable-list loop end to end: render + add (S1),
  check/uncheck (S2), delete (S3), paste-to-ingest bulk add (S4), up/down reorder
  (S5), single-last-action undo (S6), plus bulk "clear checked items" (S12, added
  mid-sprint-0 per PO-approved QA finding R3).
- **Committed stories:** S1, S2, S3, S4, S5, S6 (see BACKLOG.md), in that sequence.
  S6 deliberately last — undo has a hard dependency on all four other mutation
  types (add, check, delete, reorder) already existing to reverse.
- **AC lock, 2026-09-04:** S1-S6 have cleared the full doc pipeline (scrum-master
  sanity-check → Developer sanity-check → Tester testability-check → QA per-story
  gate) with zero remaining open findings, and are now **Locked** in BACKLOG.md.
  One AC change came out of Developer's sanity-check before locking: S1's R1
  corrupted-storage guard needed a concrete storage shape stated explicitly —
  storing the item array directly at the top level of the localStorage key would
  make the "is this a plain object" shape-check incorrectly flag valid data as
  corrupted (arrays fail that check), so S1's AC now specifies `{ items: [...],
  nextId: N }` as one object under a single key, with `items` checked separately
  as an array. Developer's other findings (incrementing item ids, event
  delegation, S5/S6 swap-is-its-own-inverse, S6's tagged-union buffer shape, S4's
  `\r?\n`-aware split) were implementation-plan choices, not AC changes — routed
  directly to Tester for concrete test-plan assertions, not reflected in
  BACKLOG.md. **S12 is NOT included in this lock** — it was added to the backlog
  after Developer's and Tester's Sprint-1 passes ran, so it still needs its own
  sanity-check/testability-check before it can lock; it stays "Not Started."
- **S12 lock, 2026-09-04 (same day, continued):** Tester's testability-check on S12
  landed clean bar one nit — the "doesn't change S10's frequency counter" clause
  was missing the same forward-reference hedge S3/S4 already carry for their own
  S6 dependency; added directly. Developer's sanity-check then landed clean too,
  no blockers. One open call Developer flagged, resolved directly (scrum-master's,
  not the PO's): should S12 get a delete-moment toast like S3's R2 resolution?
  Decided yes, but on different grounds than S3's — S3's toast exists because a
  single delete can be accidental (wrong-row mis-tap); S12 is a deliberate,
  single "I'm done shopping" gesture with no comparable wrong-target risk, so that
  rationale doesn't carry over as-is. Kept the toast anyway because S12 can remove
  many items at once — showing the actual count cleared gives useful scope
  feedback a silent bulk removal wouldn't, at zero added friction, and keeps the
  recovery-affordance pattern consistent across every list-scrubbing action in the
  app. With Tester's hedge fix + Developer's sanity-check + this toast call all
  landed, **S12 is now Locked** in BACKLOG.md — Sprint 1 is fully locked at 7
  stories (S1-S6, S12).
- **Outcome:** AC locked for S1-S6 and S12 (all of Sprint 1); implementation has
  not started.
- **Formal pass, 2026-09-04:** Tester's independent formal pass landed —
  67/67 assertions passed, zero required-assertion failures (see
  `test-plans/REGRESSION_LOG.md`, 2026-09-04 row, script
  `vopping-tests-tester-s1-s6-s12-formal.js`, citation of record per the
  playbook's "independent formal-pass script supersedes self-check" rule).
  **S3, S6, S12 → Done.** S1/S2/S5 correctly held at Locked (not Done) per
  their own pre-existing M3 density-CSS gate — Tester's pass is complete for
  them too (same 67/67 run) but the gate is working exactly as designed, not
  a gap. **S4 also held at Locked, for a different reason:** Tester disclosed
  one real MINOR defect despite the scripted TC4.3 assertion technically
  passing — a paste line that's only a marker glyph + trailing whitespace
  (e.g. `"- "`) creates a spurious junk item instead of being skipped, because
  `parsePasteLines()`'s blank-check runs before marker-stripping, so the
  trailing whitespace that would let the marker regex match is already gone
  by the time it runs (full root-cause and repro in
  `test-plans/S4-paste-ingest.md` Findings). Sequencing call made directly
  (scrum-master's, no PO input needed, same category of call as Developer's
  toast question on S12): **fix now, not backlogged** — narrow, well-understood,
  cheap (Tester's own proposed fix: run the blank/empty check on the
  post-marker-strip result, not the raw line). Added a dated technical note to
  S4's AC stating the correct intended behavior explicitly (a post-strip-empty
  line must be treated as blank) and gated S4's Done status on the fix landing
  plus Tester re-verifying TC4.3 — same Done-gate *pattern* as S1/S2/S5's, just
  a different underlying reason (a real disclosed bug, not a pending PO pick).
- **S4 fix verified, 2026-09-04 (same day, continued):** Developer's fix landed
  (corrected the blank-check/marker-strip ordering in `parsePasteLines()`) and
  Tester re-verified — 69/69 assertions passed (67 original + 2 new TC4.3
  fix-verification checks, zero regressions in the other 67), same script
  `vopping-tests-tester-s1-s6-s12-formal.js` updated in place and re-run in
  full. Cited to `REGRESSION_LOG.md`'s second 2026-09-04 row, which explicitly
  supersedes the first (67/67) row — do not cite the 67/67 figure going
  forward. **S4 → Done.** Sprint 1 is now 4/7 Done (S3, S4, S6, S12) and 3/7
  Locked-not-Done (S1, S2, S5 — density-CSS gate only, working as designed).
- **Row-density decision landed, 2026-09-04 (same day, continued):** PO's final pick from
  `density-picker.html`: whole-row tap target (Option C) + no checkbox/dot glyph at all
  (Option D) — the whole row already toggles on tap, so a dedicated glyph isn't needed for
  the everyday cross-off gesture. Crossed-off visual state is strikethrough + dimmed text
  only. Locked this into S1/S2/S5's AC directly, replacing every remaining TBD note.
  **New requirement surfaced while locking this in, not previously written down anywhere:**
  once the whole row is a tap target, S3's delete button and S5's Up/Down buttons need
  explicit "nested-control precedence" — tapping one of those must fire ONLY that control's
  own action, never also the row's cross-off toggle. Added this rule to S2 (where the core
  tap behavior lives) and cross-referenced it from S3 and S5. **Also caught and fixed a
  citation-drift bug of my own:** S1/S2/S5's existing "Tester's formal pass is complete"
  notes were still citing the superseded 67/67 REGRESSION_LOG.md figure instead of the
  current 69/69 row — corrected while I was already in these three rows for the density
  update, exactly the kind of drift the playbook's citation-hygiene lesson warns about.
  **PO's explicit terminology ask, also actioned:** renamed "checked"-adjacent language in
  S12 (story text, control label "Clear checked items" → "Clear crossed-off items",
  checked(S2)/unchecked/checked-state references) and S3 (story text's "checking it off" →
  "crossing it off", the undo-retention "checked state" → "crossed-off state", and the
  now-checkbox-free delete-control description) to "crossed off," per the PO's explicit
  request since the app no longer has a checkbox to refer to. **Deliberately left out of
  scope:** S2's own story title ("check an item off") and S6/S7/S8/S9/S10's internal
  check/uncheck vocabulary (undo-eligible-type name, sort-mode availability lists, etc.)
  — the PO's ask was scoped to S12/S3's "clear checked"-adjacent terminology specifically,
  not a full-project rename; flagging this scoping choice back to the Orchestrator in case
  broader consistency is wanted later. All edits grep-verified as single physical GFM lines;
  BACKLOG.md is still 12 rows. Routing to Developer for the CSS/markup pass and Tester for
  re-verification of S1/S2/S5's Done-gate, per the Orchestrator's instruction.
- **Sprint 1 CLOSED, 2026-09-04:** Tester's density-picker.html CSS/markup Done-gate
  re-verification landed clean — 74/74 assertions passed, zero defects, zero regressions
  across all of Sprint 1 (independent script rewrite, not a copy, since the toggle
  mechanic fundamentally changed — see REGRESSION_LOG.md's latest/current row, script
  `vopping-tests-tester-s1-s2-s5-density-formal.js`). **S1, S2, S5 → Done.** Sprint 1 is
  now 7/7 Done: S1, S2, S3, S4, S5, S6, S12. Every gate that opened during this sprint
  (M3's density-CSS hold, S4's disclosed paste-marker defect, R2's delete/undo tension,
  R3's missing bulk-clear story) closed before Done, none left open or silently dropped.
- **Outcome:** Sprint 1 complete, 7/7 stories Done, zero open defects.
- **Carryover:** None — Sprint 1 finished clean, all 7 stories Done.

## Sprint 2 — sanity-check pass started 2026-09-04

- **Goal:** Organization/enrichment on top of the now-complete core list: text notes (S7),
  aisle designation (S8), sort view (S9), frequency-based "What am I missing?" suggestions
  (S10). Started as a natural checkpoint right after Sprint 1 closed, so Developer/Tester
  aren't idle.
- **Committed stories:** S7, S8, S9, S10, in that sequence (S9 depends on S8's aisle
  field; S10 depends on S1's/S4's add paths, both Done).
- **Scrum-master sanity-check, 2026-09-04:** Re-read all four stories fresh against
  everything that changed during Sprint 1 (whole-row tap target, no checkbox, nested-
  control precedence, crossed-off terminology) rather than assuming they were still
  accurate as originally drafted. Found and fixed two real gaps before Developer's own
  sanity-check starts: (1) S7's note-edit affordance and S8's aisle-edit affordance are
  both new nested controls inside what's now a whole-row tap target — added explicit
  cross-references to S2's nested-control-precedence rule (which, on re-reading, already
  named "note/aisle-edit affordances" by name when it was written, so this just makes
  that visible on S7/S8 themselves); (2) S1/S2's locked-spec phrase "crossed-off visual
  state is strikethrough + dimmed text only, nothing else" could be misread as banning
  any other row content — clarified on S7 that this describes the cross-off indicator
  specifically, not a ban on additive content like a note or aisle tag, and stated
  explicitly that a row may grow to a second line to fit a non-empty note/aisle while an
  empty row stays at S1/S2's locked single-line height. S9/S10 reviewed with no gaps
  found — S9's sort control is page-level, not a per-row nested control, so the
  whole-row-tap conflict doesn't apply to it; S10's suggestion chips live in their own
  panel, same reasoning. All four stories' AC checked for internal consistency,
  right-sized scope, and testability; no PO-level ambiguity surfaced this pass — both
  fixes were resolved directly. All edits grep-verified as single physical GFM lines;
  BACKLOG.md still 12 rows.
- **Outcome:** Sanity-check complete. Ready for Developer's sanity-check + Tester's
  testability-check per the doc pipeline.
- **Testability-check + Developer sanity-check landed, 2026-09-04 (same day, continued):**
  Tester: S7/S9/S10 clean, no gaps. S8 had two items, both resolved directly (no PO input
  needed): (1) added the same forward-reference hedge S3/S4→S6 and S12→S10 already carry,
  now on S8's "Unassigned for S9's grouping" clause (not verifiable until S9 ships); (2)
  a real ambiguity in "suggestion-matching" normalization — confirmed Tester's reading was
  right, but it exposed a previously-implicit gap: the aisle datalist isn't purely the
  static 9-item starter set, it also grows with every distinct free-typed aisle value used
  elsewhere in the list (otherwise the normalization clause would have nothing to dedupe).
  Made that mechanism explicit, plus a chronological-first tie-break for which casing
  displays when two entries merge. Developer's sanity-check then found one real landmine:
  S7/S8's inline note/aisle editors are the app's first multi-keystroke, in-progress UI
  state, and an unrelated re-render (Undo, another row's reorder, a new add) would
  otherwise silently discard unsaved draft text. Added an explicit, testable guarantee to
  both S7 and S8 (draft text must survive such a re-render intact), same
  capture-before-rebuild/restore-after pattern as S1/S2/S5's focus-preservation fix. No
  other blockers. **S7, S8, S9, S10 → Locked.** All edits grep-verified as single physical
  GFM lines; BACKLOG.md still 12 rows, all four Sprint 2 stories now read "Locked | 2".
- **Outcome:** Sprint 2 AC locked for all 4 stories.
- **Implementation status, 2026-09-04 (wind-down check before compaction):** Developer
  has started implementing against the locked AC — index.html wired for Sprint 2's new
  UI elements, script.js written including note/aisle logic, but functionally verified
  so far only for basic add, per Developer's own status — the full note/aisle/sort/
  suggestion feature set has not yet been exercised. style.css not yet touched for the
  new UI. No Status flips in BACKLOG.md yet — S7-S10 correctly remain "Locked," not "In
  Progress" or further, since nothing has self-verified or formally passed yet; this is
  accurate, not a gap. Stopping for the day here; resume with Developer's
  self-verification once wired up, then Tester's formal pass, same pipeline as Sprint 1.
- **Carryover:** None — Sprint 2 implementation continues next session; already
  recorded above, not a dangling loose end.
- **Resume, 2026-09-08 (scrum-master's own end-to-end doc re-read, per standing
  wind-down/resume habit):** Full re-read of BACKLOG.md, SPRINT_LOG.md, and
  QUESTIONS.md end to end, not a diff-only skim. Found and fixed one real
  staleness item: S3, S6, and S12's own "Done" citations in BACKLOG.md were still
  quoting the 67/67 first-formal-pass figure, which REGRESSION_LOG.md explicitly
  marks superseded ("do not cite this row going forward") — the same
  citation-drift bug already caught and fixed on S1/S2/S5 on 2026-09-04 was
  missed on these three rows at the time. Corrected all three to cite
  REGRESSION_LOG.md's current canonical 74/74 row (script
  `vopping-tests-tester-s1-s2-s5-density-formal.js`), whose full functional
  regression re-run explicitly covered delete/undo/clear-crossed-off-items with
  zero regressions — no new testing needed, this was a citation-text fix only,
  not a retest. No other contradictions, duplicate sections, or stale headers
  found; BACKLOG.md's top-of-file Priority Queue summary, Sprint 2's Locked
  statuses, and the Sprint 2 implementation-status note above all still
  accurately reflect real state (Developer's S7-S10 implementation exists but is
  only self-verified for basic add; style.css untouched for new UI; no formal
  Tester pass yet). All edits grep-verified as single physical GFM table lines;
  BACKLOG.md still 12 rows.
- **Outcome:** Docs confirmed consistent (one citation fix applied). Sprint 2
  implementation still awaiting Developer's own full self-verification across
  note/aisle/sort/suggestions before Tester's testability work on S7-S10 formal
  test-plan files should start — no test-plan files exist yet for S7-S10 (only
  S1-S6/S12 have files under `test-plans/`), which tracks the doc pipeline
  correctly (testability-check already happened pre-lock; the *formal* pass is
  what's pending, and per the playbook that follows implementation, it isn't
  blocked on anything doc-side).
- **QA/Tester findings triaged, 2026-09-08 (same day, continued):** Three items
  landed from QA's and Tester's own passes on Developer's in-progress Sprint 2
  implementation. **QA R7 (Real, crowded worst-case row):** S7's note-toggle and
  S8's aisle-toggle affordances bring a real row up to 5 nested controls
  (note/aisle/up/down/delete) — a density the PO's original density-picker.html
  pick never showed, since S7/S8 didn't exist yet when that pick was made.
  Decided this rises to a fresh PO-facing look, not a scrum-master call to close
  alone — same "guess twice on a subjective visual call" trap the playbook
  explicitly warns against (§7), and the same mockup-fidelity failure class QA
  already caught once on this project (R4). Added a new top-of-file **Tracked
  follow-up #2** gate in BACKLOG.md blocking S7/S8's Done status on PO
  confirmation, cross-referenced from both rows; routed to Orchestrator as a
  console-worthy PO item, non-blocking to Developer's/Tester's ongoing work in
  the meantime. **QA R8 (Real, AC/implementation mismatch on S8):** folded both
  disclosed behaviors directly into S8's AC (no PO input needed, narrow and
  well-understood) — the aisle-suggestion pool is derived live each render, not
  a persisted record like S10's counter; and the merged-entry casing tie-break
  is actually array-position-based, not chronological-typing-order as originally
  written, meaning a plain Up/Down reorder (no retyping) can flip which casing
  displays. Documents actual behavior for Tester's test plan; not a behavior
  change. **Tester-flagged terminology mix:** found and fixed one real leftover
  — S12's AC still read "if zero items are currently checked" instead of
  "crossed off"; corrected. S2's Story-cell title ("check an item off") was
  confirmed to be the already-documented, deliberate rename-scope boundary from
  2026-09-04 (not a new bug) — re-flagging to Orchestrator/PO as a non-blocking
  QUESTIONS.md entry since it's now been independently surfaced twice. All
  edits grep-verified as single physical GFM lines; BACKLOG.md still 12 rows.
- **Developer's live-verification pass landed, 2026-09-08 (same day, continued;
  commit `f9f097d`):** Developer live-verified all of S7-S10 via Playwright
  (not just a code trace) and disclosed 2 real bugs found/fixed in S7/S8's
  shared inline-editor code — focus loss on opening the editor, and a
  focusout-triggered re-render that could swallow a pending click elsewhere in
  the list. Both are the exact risk class S7/S8's own AC already called out
  (draft text/re-render survival, nested-control precedence) — this is
  Developer correctly making the already-locked AC true, not new scope. S9
  (sort) and S10 (suggestions): fully verified live, zero bugs found. Reported
  zero regressions on Sprint 1 — **noting explicitly for citation hygiene**:
  this is Developer's own self-verification run, disclosed for transparency
  only; per the standing citation-of-record rule it does NOT become BACKLOG.md's
  regression citation for any story — that role is reserved for Tester's own
  independent formal-pass script once it lands (all 4 Sprint-2 test plans are
  drafted and Tester has just started executing them, per Orchestrator).
  **Scrum-master's status-column call:** moved S7, S8, S9, S10 from "Locked" to
  "In Review" in BACKLOG.md — "Locked" no longer accurately described their
  real state (implemented, bug-fixed, self-verified live) now that Tester's
  formal execution is actually underway; reserving "Done" for after Tester's own
  formal-pass citation lands, same gate every other story in this project has
  gone through, self-verification (however thorough) has never itself been
  sufficient for Done. S7/S8 additionally stay blocked from Done by the
  existing Tracked follow-up #2 PO-review gate regardless of Tester's outcome —
  Orchestrator reports the corrected density-picker.html is now pushed and the
  PO has been asked to check it live on their phone, so that gate is now
  actionable, not a placeholder. **Style.css gap, tracked but not gating:**
  Developer flagged style.css has zero rules yet for S9's (`.sort-controls`,
  `.aisle-group-header`) and S10's (`.suggestions-root`, `.suggestion-chip`) new
  UI classes — functions correctly per live verification but renders unstyled.
  Decided directly (no PO input needed): this does NOT gate Done the way S1/S2/
  S5's density spec or S7/S8's R7 gate do, because neither S9 nor S10's own AC
  locks any specific visual spec — added a short dated tracked-but-non-blocking
  note to each row instead of a new Done-gate, so it's visible and doesn't get
  lost without inventing an unnecessary gate. All edits grep-verified as single
  physical GFM lines; BACKLOG.md still 12 rows.

## Sprint 3 — drafted 2026-09-08, from the PO's crowded-row review

- **Goal:** PO tried `density-picker.html` again (and had independently noticed
  the row-crowding over the weekend too), confirming QA finding R7 (S7/S8's
  5-nested-control worst-case row) is real — resolving the Tracked follow-up #2
  gate. Gave 6 concrete decisions in one pass and explicitly asked for each to
  become its own BACKLOG.md story "so they don't slip through the cracks."
  Drafted all 6 directly into BACKLOG.md as S13-S17 (Sprint 3) plus S18 (parked
  stretch goal, same treatment as S11) — quoting the PO's own words in each
  story's AC so nothing gets lost in translation, per the Orchestrator's
  explicit relay instruction.
- **S13 (drag-and-drop reorder, supersedes S5's UI):** PO wants Up/Down buttons
  gone entirely, replaced by drag-and-drop with a deliberate pickup delay so
  scrolling/editing doesn't trigger accidental drags. **Scrum-master's call:**
  this is cross-story supersession, not a reopening of S5 — S5 shipped and
  passed exactly as specified for its time and stays Done; added a dated
  technical note to S5's row instead, and a forward-reference note to S9's row
  (whose AC currently names "S5's Up/Down buttons" in its non-Manual-sort
  clause — left unchanged for now so Tester's just-started S9 formal pass tests
  against what's actually implemented today, not a future state). S13's AC
  carries forward S5's undo-eligibility and non-Manual-sort-hides-it precedents
  unchanged, only the interaction mechanism is new.
- **S14 (shrink remaining row-control buttons ~25%):** sequenced right after
  S13 per the PO's own pairing of the two asks (no hard technical dependency,
  but finalizing size once against S13's final layout avoids resizing twice).
  Added a guardrail referencing Tester's earlier informational >=24px
  tap-target check as the flag-back threshold, since the PO's sizing call is
  otherwise not something Developer/Tester should re-litigate.
- **S15 (in-place item text editing):** a real, previously-nonexistent
  capability — the app never supported editing an item's own text, only
  note/aisle metadata. PO explicitly flagged an unresolved pencil-icon conflict
  with S7's existing note-toggle and asked for options twice ("i'm open to
  ideas here"). **Scrum-master's call:** did not guess at a locked interaction
  spec — drafted the functional core (edit persists, position/note/aisle/
  crossed-off state preserved, blank-edit reverts) as the real AC, but left the
  gesture/icon mechanism explicitly unlocked pending a Developer-built
  decision-tool mockup (2-3 gesture options x 2-3 icon options, same pattern as
  `density-picker.html`, built by Developer per the playbook's role-boundary
  lesson, not by the Orchestrator or scrum-master directly). Status is
  deliberately "Not Started," not "Locked." Flagged S15's undo-eligibility as a
  new non-blocking QUESTIONS.md entry (working default: not undo-eligible, same
  as S7/S8) since S6's undo scope predates this story existing. Sequenced after
  S13/S14 so the mockup reflects the final row layout.
- **S16 (suppress per-row aisle tag when sorting By Aisle) and S17 (more visual
  distinction for aisle group headers):** both amend S9, currently "In Review"
  with Tester's formal pass just started against S9's existing implementation
  (which does neither of these yet). **Scrum-master's call:** drafted both as
  follow-on stories rather than folding into S9's AC now, specifically so
  Tester isn't asked to test a moving target mid-pass — added a forward-
  reference note to S9's row instead. S17 needed no decision-tool pass (PO
  explicitly said "i'm not picky" on the exact visual treatment); S16 is a
  direct, unambiguous PO instruction, also locked-language-ready as drafted.
- **S18 (collapsible aisle groups):** explicit PO stretch goal ("that can be a
  stretch goal"). Parked alongside S11 rather than sequenced into Sprint 3
  proper, same low-priority/revisit-only-if-asked treatment.
- **Outcome:** All 6 items drafted into BACKLOG.md (S13-S18), none yet through
  the doc pipeline (Developer sanity-check / Tester testability-check / QA
  gate) — that's next, whenever Developer/Tester have bandwidth after Sprint
  2's Tester formal pass and the PO's pending S7/S8 crowded-row confirmation
  both land. Per Orchestrator's request, reporting back once drafted so the PO
  can be notified via the console that nothing was lost. All edits
  grep-verified as single physical GFM lines; BACKLOG.md now 18 rows (was 12).
- **Carryover:** S13-S18 need Developer sanity-check + Tester testability-check
  + QA gate before any can Lock; S15 additionally needs its decision-tool
  mockup before its AC can lock at all. None of this blocks Sprint 2's
  in-flight Tester formal pass or the PO's S7/S8 review.
- **Sprint 2 Tester formal pass landed, 2026-09-08 (same day, continued):**
  154/154 assertions passed (74 Sprint-1 regression re-confirmed + 80 new: 23
  for S7, 18 for S8, 18 for S9, 21 for S10), zero defects, zero console errors
  — see REGRESSION_LOG.md's new canonical row, script
  `vopping-tests-tester-s7-s10-formal.js`. All 4 Sprint-2 test-plan files now
  STATUS: DONE. This also closed two standing forward-reference hedges that
  predated this pass: S8's "Unassigned for S9's grouping" clause (verified via
  TC9.1-17) and S12's "does not touch S10's counter" clause (verified via
  TC10.5, which also satisfies S12's own deferred cross-reference to S10) —
  both updated directly in BACKLOG.md rather than left dangling now that the
  dependency they were hedging against actually exists and passed.
  **S9, S10 → Done** — this is exactly the independent-formal-pass citation I
  said last session I was waiting for before flipping their Status past "In
  Review"; it's now landed, so both flip. **S7, S8 stay "In Review," not
  Done — scrum-master's call on the crowded-row gate:** their own functional
  AC is equally fully verified by this same 154/154 pass (23+18 of the total),
  so the gate isn't about outstanding bugs. The question was whether the PO's
  response to the crowded-row review (confirmed real, gave 6 remediation
  stories — S13-S18) counts as *resolving* Tracked follow-up #2, or whether the
  gate stays open until the remediation (S13/S14) actually ships. Decided the
  latter, on the gate's own precedent: M3 (this project's near-identical
  earlier density gate) explicitly held that "the pick landing... is not by
  itself sufficient closure... must actually happen and be Tester-verified" —
  a remediation *decision* is the PO-review half of this gate, not the
  fix-shipped half, and the PO's actual answer was "no, doesn't hold up,
  here's the fix," not "yes, fine as-is." Retargeted Tracked follow-up #2's
  closure condition directly in BACKLOG.md (S13/S14 ship + Tester re-verifies)
  rather than leaving the old "PO reviews" language sitting there answered but
  still gating nothing clearly. Also folded Developer's `f9f097d` two-bug fix
  detail into S7/S8's own citations for the permanent record.
- **Developer's S13-S17 sanity-check landed, 2026-09-08 (same day, continued):**
  Five real findings, split cleanly by who owns the resolution. **Not mine —
  routed to the PO directly via console by the Orchestrator, tracked here in
  BACKLOG.md/QUESTIONS.md for the paper trail only:** S13's auto-scroll-on-drag
  question (does dragging off-screen scroll the list); S14's certainty (not a
  maybe) that a 25% button shrink breaches the story's own 24px tap-target
  floor (26px × 0.75 ≈ 19.5px) — PO needs to say whether that's acceptable or
  wants a smaller number. Added a Blocking-table row in QUESTIONS.md for each,
  matching this project's established pattern of always logging a PO-facing
  question there even when the Orchestrator routes it directly. **Mine —
  resolved directly, no PO input needed:** S15 had two real gaps — (a) item-
  text edits now explicitly do NOT touch S10's frequency counter in either
  direction (same arm's-length treatment as note/aisle edits, extended
  symmetrically from S12's existing never-decrements rule, closes the exact
  "zucchini"/"2 zucchini" fragmentation risk Developer flagged); (b) editing an
  item's text while a non-Manual sort is active now explicitly re-renders it at
  its newly-correct position immediately, same M2 precedent S9 already needed
  for adds. S16 needed a line distinguishing the passive aisle-tag suppression
  from S8's active editor, which must keep working in every sort mode per S9's
  existing guarantee — folded in directly. S17 had no AC gap but got a free
  related fix folded in as an explicit requirement: group headers must not
  inherit item-rows' tap-cursor/active-state styling since headers aren't
  themselves clickable. Declined to fold in Developer's recommended
  implementation approach for S15 (reusing the existing `editingField`/
  `openEditor`/`commitEditor` note/aisle-editor infrastructure rather than a
  parallel build) — that's an implementation-plan choice, not an AC matter,
  same treatment this project has always given Developer's technical-approach
  findings. Noted Developer's `s15-edit-gesture-picker.html` (pushed, live on
  Pages, sent to the PO by the Orchestrator) directly on S15's own row so the
  artifact is traceable from BACKLOG.md, not just from chat. All edits
  grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S13/S14 blocked on PO answers (QUESTIONS.md Blocking table);
  S15 blocked on the PO's edit-gesture/icon pick from
  `s15-edit-gesture-picker.html`; S16/S17 have nothing outstanding and are
  ready for Tester's testability-check whenever there's bandwidth; S7/S8 stay
  "In Review" until S13/S14 ship and are Tester-verified to have resolved the
  crowding.
- **PO answered all three, 2026-09-08 (same day, continued):** folded directly
  into BACKLOG.md, closed the corresponding QUESTIONS.md Blocking rows.
  **S13:** auto-scroll during drag is required, not optional — PO's own words,
  "the grocery lists can sometimes be quite long, so that level of complexity
  is unfortunately important." Added as a real AC requirement (auto-scroll
  near a viewport edge while dragging, continues while held there; exact
  trigger-zone/speed left as Developer-level tuning). **S14:** PO is fine with
  sub-24px controls — "if it's a problem, we can adjust again later or figure
  out a different strategy." Reframed the AC's guardrail language from a
  flag-back-if-breached check to an explicitly accepted tradeoff with a
  stated escape hatch (revisit only if it's a real problem in practice), per
  the coordinator's recommendation and the PO's own framing — not silently
  dropping the floor-check language, reframing it. **S15:** PO picked the
  dedicated-edit-icon gesture (the decision tool's "Option 3") over
  double-tap/long-press, reasoning it's consistent with already using a
  button for delete, and confirmed ~20 characters of row space remain even
  pre-S14-shrink with 4 buttons present ("longer text is what notes are for").
  Locked the GESTURE mechanism into S15's AC. **Did not lock the specific icon
  pairing** — Option 3 offered 3 icon pairings and the PO didn't name one
  explicitly; the Orchestrator inferred the tool's "recommended" pairing as
  the implicit pick and asked me to flag back if I saw real ambiguity here.
  Decided yes: this project's own established rule is to never guess twice on
  a subjective visual pick the PO hasn't explicitly confirmed (playbook §7) —
  "recommended by the tool" isn't the same as "PO confirmed," unlike S17's
  explicit "I'm not picky." Flagged directly on S15's own row recommending one
  quick explicit confirm-or-correct on the icon pairing specifically before
  treating it as final; the gesture decision itself is not held up by this.
  **Process pushback (mine, not silently complying):** the coordinator's
  message framed these three as "once locked, clear for Developer to
  implement," but per this project's own doc pipeline (every other story,
  zero exceptions so far) locking still requires Tester's testability-check
  and QA's per-story gate, neither of which have run yet on S13/S14/S15 — PO
  answering the open content questions closes the AC-content gap, it doesn't
  substitute for those two steps. Left Status as "Not Started" on all three
  (consistent with this project's own precedent — the Status column has never
  flipped to "Locked" before Tester+QA both clear a story, going all the way
  back to Sprint 1's S1-S6). Recommending Tester's testability-check next, not
  a straight handoff to Developer. **Also preserved a new, explicitly
  not-yet-scoped PO idea** (auto-detect notes vs. list items during
  paste-to-ingest) as a dated note on S11's parked row — S4/S11 territory,
  no AC, no priority, just retrievable for whenever ingestion work resumes.
  All edits grep-verified as single physical GFM lines; BACKLOG.md still 18
  rows.
- **Carryover:** S13/S14 AC-content-complete, need Tester testability-check +
  QA gate before Lock. S15 AC-content-complete on the gesture mechanism, needs
  the icon-pairing confirm-or-correct plus the same Tester/QA steps before
  Lock. S16/S17 unchanged, still ready for Tester's testability-check. S7/S8
  still "In Review" pending S13/S14 shipping.
- **Tester's testability-check on S13-S17 landed, 2026-09-08 (same day,
  continued):** **S14, S17 clean** — sent straight to QA's per-story gate,
  noted directly on both rows. **S13, S15, S16 had real gaps, all resolved
  directly here (no PO input needed for any of them — narrow technical-shape
  decisions, same category as e.g. S1's storage-shape or S6's buffer-shape
  calls):** **S13** — three gaps: (1) locked a deterministic drop-position
  rule (live placeholder tracks hover position relative to the hovered row's
  midpoint; release commits wherever the placeholder sits); (2) locked a
  jitter-tolerance rule distinguishing an ordinary scroll from a real pickup
  attempt during the delay window (movement beyond a small tolerance cancels
  the pickup, timer doesn't resume, restarts fresh); (3) locked a
  drop-outside-bounds rule (clamps to the nearest valid boundary position,
  never a silent no-op, still undo-recoverable). Also folded in Tester's two
  non-blocking items as real requirements: Pointer-Events-based (not
  touch-only, so Playwright can test it), and drag-pickup on one row commits
  an in-progress note/aisle draft open on another row (same guarantee S7/S8
  already needed two bugfixes for, now explicitly extended to cover this
  story's gesture too). **S15** — three gaps: (1) left implementation
  approach (reuse S7/S8's shared editor infrastructure vs. a separate build)
  as Developer's choice, but explicitly locked the two testable behavioral
  guarantees that must hold either way (draft survives an unrelated re-render;
  opening any other editor or a drag-pickup elsewhere commits it) so Tester
  has a real target regardless of which approach Developer takes; (2) locked
  the same already-tested mutual-exclusivity rule from S7/S8 (only one editor
  open per row at a time) to now include the new name editor as a third type;
  (3) locked that post-edit rendering stays single-line/ellipsis-truncated per
  the existing locked density spec, unchanged by this story — only the
  live-editing input itself shows full text. Tester also independently
  re-flagged the icon-pairing-needs-PO-confirm point from my last pass — not
  new, just confirms it's real, noted as such on the row. **S16** — a genuine
  self-contradiction, not just a gap: the per-row aisle tag is currently the
  ONLY tap-to-edit affordance once an aisle is set (no separate icon exists,
  unlike S7's note field), so suppressing it in By-Aisle mode would remove the
  only way back into its own editor — directly contradicting the "editor
  keeps working in every sort mode" guarantee already on this row. **Adopted
  Tester's own candidate fix, scoped narrowly to By-Aisle mode only:** render
  a minimal icon-only "edit aisle" affordance in place of the suppressed text
  tag, opening the same editor pre-filled with the real value; every other
  sort mode is completely unchanged. Noted that being icon-only rather than
  full text, this should also reinforce the story's own space-saving goal
  rather than just patch the contradiction. All edits grep-verified as single
  physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S13/S15/S16 go back to Tester to confirm the gaps above are
  now resolved and finish the testability pass, per the coordinator's
  instruction; S15 additionally still needs the PO's icon-pairing
  confirm-or-correct before it can fully lock. S14/S17 are at QA's gate now.
  S7/S8 still "In Review" pending S13/S14 shipping and Tester-verifying the
  crowding is resolved.
- **QA gate landed clean on S14/S17, 2026-09-08 (same day, continued) — both
  → Locked:** zero Real/Minor findings on either. One cheap Nitpick on S14
  (clarify note/aisle tag chrome — background/border/padding, distinct from
  text size which was already excluded — is likewise out of scope for the
  button shrink; moot today since neither tag has fixed chrome yet, but worth
  stating explicitly before a future styling pass could get misread as in
  scope) — folded in directly, no PO input needed. S17 had nothing further.
  Both have now cleared the full pre-implementation pipeline (scrum-master
  sanity-check → Developer sanity-check → Tester testability-check → QA gate)
  with zero remaining open findings — **locked both in BACKLOG.md**, clear for
  Developer to implement. QA also independently verified `density-picker.html`
  already covers both worst-case row axes (empty-field icon-crowding AND
  populated-field second-line growth) — confirming the PO's original
  crowded-row review wasn't working from an incomplete mockup; recorded on the
  top-of-file Tracked follow-up #2 note as supporting evidence, no action
  needed. **S13/S15/S16 are with QA's gate now, separately** — Tester's
  re-check already confirmed all three of my testability-check fixes hold up
  to deterministic testing (per the coordinator), so those three are one step
  further along the same pipeline, just not through QA yet. Updated the
  top-of-file Priority Queue summary to reflect current per-story pipeline
  position. All edits grep-verified as single physical GFM lines; BACKLOG.md
  still 18 rows.
- **Carryover:** S14/S17 Locked, ready for Developer implementation whenever
  picked up. S13/S15/S16 awaiting QA's gate; S15 also still needs the PO's
  icon-pairing pick. S7/S8 still "In Review" pending S13/S14 shipping.
- **QA gate on S13/S15/S16 landed, 2026-09-08 (same day, continued):** **S16
  clean** — two cheap Minors, both folded in directly (no PO input needed):
  M13 (Unassigned items in By-Aisle mode use the SAME new icon-only "edit
  aisle" affordance as populated items, not S8's separate empty-state icon —
  one consistent icon for the column, not two different ones depending on
  row state) and M14 (S16's new icon is itself a nested control, so it's in
  scope for S14's shrink — added as a dated cross-reference note on S14's
  already-Locked row, additive clarification not a reopening). **S16 →
  Locked.** **S13** — one Real finding (R9): Pointer Events' `pointercancel`
  (drag interrupted by something outside the user's control) had zero stated
  behavior. Accepted QA's own recommendation directly — same technical-
  edge-case category as the drop-position/jitter/out-of-bounds rules already
  resolved this session, not a product question: cancel aborts the drag,
  item returns to its original position, nothing committed, no undo entry —
  consistent with the no-surprise-mutations guardrail. Folded in; ready for
  QA to re-confirm. **S15** — one Real finding (R10), and this one IS a
  genuine product question, not decided directly: the story's own headline
  example (renaming "zucchini" to "2 zucchini") can make the old name
  resurface as a stale S10 suggestion chip — not a bug in either story
  individually, an interaction between two independently-correct pieces of
  logic. Declined to resolve this myself — the "fix it properly" option
  reopens the exact counter-identity/fragmentation complexity I already
  deliberately kept out of S15's scope, and how much a low-stakes but
  real-world-visible quirk like this matters is a judgment call the PO has
  weighed in on before for comparable questions (S2's auto-move-on-check,
  S10's original signal/threshold). Added a QUESTIONS.md Blocking entry with
  two concrete options (accept as low-stakes/self-correcting, my own lean
  given the cost/benefit; or invest in real counter-identity tracking across
  a rename) rather than an open-ended ask. Noted directly on S15's row.
  Neither R9 nor R10 blocks Developer's already-locked S14/S16/S17 work. All
  edits grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S14/S16/S17 Locked, ready for Developer. S13 needs QA to
  re-confirm R9's fix. S15 needs the PO on both the icon-pairing pick and
  R10's resolution, plus Tester/QA re-passes once those land. S7/S8 still
  "In Review" pending S13/S14 shipping.
- **PO answered R10 + volunteered a new icon-pick task, 2026-09-08 (same day,
  continued):** **R10 (S15):** PO picked Option A outright — "i like the
  first option." Accepted the rename/stale-suggestion quirk as-is, no extra
  logic. Closed the QUESTIONS.md row and folded "known, accepted, low-stakes
  behavior, not a bug to flag later" directly into S15's AC — this is exactly
  the paper-trail discipline this project has always used for a PO-confirmed
  working behavior, so nobody rediscovers this as a "bug" months from now.
  Caught and fixed a duplicate sentence my own edit introduced on S15's row
  (an existing "Tester re-flagged the icon-pairing point" note got restated a
  second time) — removed the redundant copy immediately, single canonical
  occurrence now. **New, unprompted PO item:** the PO also said, unprompted,
  "we probably need to make a change to the aisle button too. i'll try to
  find an icon to use" — they want to hand-pick S16's new icon-only
  edit-aisle glyph themselves, same as they're doing for S15's edit icon.
  Orchestrator has already told Developer to implement S16 functionally now
  with a placeholder glyph and swap later — not a Lock- or implementation
  blocker. Added a tracked, non-blocking note directly on S16's
  already-Locked row (same "don't let a real commitment silently evaporate"
  pattern used throughout this project) so the provisional icon isn't a
  surprise and the swap doesn't get forgotten.
- **QA re-confirmed S13's R9 fix, plus 4 more Minors surfaced, 2026-09-08
  (same day, continued):** R9 (`pointercancel`) confirmed fully resolved —
  aborts cleanly, no partial commit, no undo entry, exactly as specced. Same
  gate pass flagged 4 previously-unaddressed Minors from earlier passes
  (M9: same-row drag-vs-open-editor conflict never addressed; M10: ambiguous
  whether the jitter/delay rule still applies if Developer uses a dedicated
  drag-handle instead of whole-row press; M11: no no-op rule for a drop back
  at the exact original position; M12: no scroll-suppression rule during an
  *active* drag, only during pickup-arming) — QA explicitly left it as my
  conscious call whether to fold these in now or track as non-blocking
  follow-ups. **Decided: fold all four in now**, not defer — same technical-
  shape category as R9 and the earlier testability-check gaps, each cheap
  (one or two sentences), and this project's playbook explicitly warns that
  deferred items risk silently evaporating rather than actually getting
  picked up later. Resolved directly: (M9) an already-open editor on a row
  captures a press-and-hold as ordinary text-input interaction, not a drag
  attempt — the editor must be committed/closed first via the existing
  auto-commit rule. (M10) the jitter/delay gate applies identically to
  whichever drag-surface Developer picks (whole-row or a dedicated handle) —
  no instant-pickup shortcut for a handle. (M11) a same-position drop is a
  no-op, no undo entry created. (M12) normal touch-scrolling is suppressed
  for the duration of an active drag (distinct from the arming-delay window,
  where jitter-triggered scroll-cancel already applies) — only the
  already-specified auto-scroll-near-edge mechanic scrolls the list while a
  drag is live, avoiding a fight between the two. All four folded directly
  into S13's AC; now needs QA to re-confirm before Lock. All edits
  grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S13 needs QA's re-confirmation of M9-M12 before Lock. S15
  needs the PO's icon-pairing pick, then Tester/QA re-passes, before Lock.
  S16 (Locked) has a non-blocking tracked icon-swap pending from the PO.
  S14/S17 unchanged, ready for Developer. S7/S8 still "In Review" pending
  S13/S14 shipping.
- **QA re-confirmed M9/M10/M12, surfaced one more finding (M15), 2026-09-08
  (same day, continued):** M9/M10/M12 confirmed clean. M11 (same-position
  drop is a no-op) is correct in isolation but a real, reachable case
  collides with it: nudging the top item just above the list and releasing
  lands at the nearest boundary (position 0) — which is also that item's own
  original spot — so M11's "no-op" and the drop-outside-bounds rule's
  "commits, never a no-op" both apply at once with nothing saying which
  wins. Low-stakes (list order is identical either way; only affects whether
  a bookkeeping undo entry gets created), but QA correctly flagged it needed
  one tie-break sentence before Lock rather than being left ambiguous. **QA's
  recommendation: M11's no-op wins. Agreed and folded in directly** — the
  reasoning holds up on inspection, not just deference to QA: letting the
  boundary rule "commit" in this exact-same-position case would create a
  spurious undo-buffer entry for a net-zero move, which would silently
  clobber whatever undo-eligible action was already pending before the drag
  — precisely the surprise-mutation class this project's own guardrail
  exists to prevent. The boundary rule's original "never a silent no-op"
  intent is unaffected by this tie-break: that rule was about not silently
  ignoring an out-of-bounds drag attempt, not about forcing an undo entry
  when the visible outcome is provably unchanged either way. Folded the
  tie-break directly into S13's AC next to M11; still needs QA to re-confirm
  M15 specifically before this AC can Lock. All edits grep-verified as
  single physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S13 needs QA's re-confirmation of M15's tie-break before
  Lock (M9/M10/M12 already clean). Everything else unchanged from the prior
  entry's Carryover.
- **S13 → Locked, 2026-09-08 (same day, continued):** QA's final Lock-gate
  re-read found zero new contradictions across all 6 iterative rounds of
  fixes this story went through (drop-position/jitter/out-of-bounds rules,
  the auto-scroll requirement, `pointercancel` (R9), M9-M12, and M15's
  tie-break) — no objection to Locking. **S13 → Locked.** This closes out
  Sprint 3's doc pipeline for S13/S14/S16/S17 — all four are now Locked and
  clear for Developer implementation; **S15 is the only Sprint 3 story not
  yet Locked**, blocked solely on the PO's still-outstanding icon-pairing
  pick (R10 already resolved). Updated the top-of-file Priority Queue
  summary to reflect this. All edits grep-verified as single physical GFM
  lines; BACKLOG.md still 18 rows.
- **Carryover:** S13/S14/S16/S17 Locked, ready for Developer (S16 carries a
  non-blocking tracked icon-swap pending from the PO). S15 blocked only on
  the PO's icon-pairing pick, then Tester/QA re-passes. S7/S8 still "In
  Review" — now that S13/S14 are both Locked, the Tracked follow-up #2 gate
  is waiting on implementation + Tester-verification next, not any further
  doc-side decisions.
- **Disclosed implementation side-effect, 2026-09-08 (Developer, not hidden;
  for the record, not urgent):** while implementing S14, Developer found S5's
  Up/Down buttons share S14's targeted `.icon-btn` CSS class and weren't
  named in S14's AC (drafted assuming S13 — which removes Up/Down entirely —
  would land first; the two shipped in the other order in practice). Rather
  than splitting a separate CSS class just to hold Up/Down at the old size
  for what's expected to be only a few days until S13 ships and deletes them
  outright, Developer let them shrink too as a side effect, flagged via an
  inline CSS comment. **Scrum-master's call: document, don't gate** — purely
  cosmetic, purely temporary, zero functional change, moot the moment S13
  ships; added a short cross-referenced note on both S5's (Done) and S14's
  (Locked) rows rather than treating it as an AC gap or reopening either
  story — textbook disclosed-scope-creep handling per the playbook's
  Developer-role guidance, not a case that needed a new gate. All edits
  grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.

## Parked / unscheduled

- **S11** (recipe-paste alternate ingest mode) — explicitly not sequenced into
  either sprint. Low-priority future stretch only, per explicit PO direction not
  to build this now. Revisit only if asked.
- **S18** (collapsible aisle groups when sorted By Aisle) — drafted 2026-09-08
  alongside Sprint 3, explicit PO stretch goal, same treatment as S11. Revisit
  only if asked, likely after S9/S16/S17 have been lived with for a while.
