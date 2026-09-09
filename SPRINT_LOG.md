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
- **S14/S16/S17 implemented and formally verified, 2026-09-08 (same day, continued;
  commit `606285f`):** Developer implemented all three against their Locked AC,
  self-verified (15/15 new checks, 0 console errors, both prior regression suites
  re-confirmed clean since shared `renderRow()`/`.icon-btn` code was touched), then
  Tester's independent formal pass landed — **180/180 assertions passed** (74
  Sprint-1 + 80 Sprint-2 re-confirmed clean + 26 new: TC14.1-14.5, TC16.1-16.12,
  TC17.1-17.6), zero defects, zero console errors — see REGRESSION_LOG.md's
  2026-09-08/180-total row (script `vopping-tests-tester-s14-s16-s17-formal.js`),
  test-plans/S14-shrink-buttons.md, S16-aisle-sort-compact-icon.md, and
  S17-aisle-header-distinction.md all now STATUS: DONE. **S14, S16, S17 → Done.**
  S16's own icon decision-tool mockup (`s16-aisle-icon-picker.html`, Developer-built)
  then went to the PO, who picked U+2691 (BLACK FLAG); Developer swapped it in
  (commit `8724733`) with an accent-color treatment scoped to that icon — closes
  S16/S17's previously-tracked "placeholder glyph, PO to hand-pick" note, no longer
  provisional. Session paused cleanly after this (commit `d91e9d7`) with S13 Locked
  but not started, S15 blocked on the PO's icon-pairing pick.
- **Resume, 2026-09-08 (scrum-master's own end-to-end doc re-read, per standing
  wind-down/resume habit):** Full re-read of BACKLOG.md, SPRINT_LOG.md, and
  QUESTIONS.md end to end. Found one real drift: BACKLOG.md's Status column still
  read "Locked" for S14/S16/S17 despite the formal 180/180 pass above already
  having landed and closed — this SPRINT_LOG had no entry recording that pass ever
  happening either, so the omission was in both files, not just a stale status
  cell. Root cause: implementation + Tester's formal pass happened in the same
  continued session as the prior Carryover note (which still said "ready for
  Developer"), and neither file's narrative was closed out afterward before the
  pause. Fixed directly: added the entry above, flipped BACKLOG.md's S14/S16/S17
  Status cells to Done with full citations, updated the top-of-file Priority Queue
  summary and the Tracked follow-up #2 gate note (S14 now shipped and verified;
  **S13 is the sole remaining blocker on that gate and the main open implementation
  thread going into resume** — it is Locked but Developer has not started it).
  Independently confirmed by the Orchestrator relaying the same correction from a
  fresh QA resume-check; both landed on the same fix. All edits grep-verified as
  single physical GFM lines; BACKLOG.md still 18 rows (194 total lines, up from
  before due to added citation text, not new rows).
- **S15 icon-pairing PO-confirmed, 2026-09-08 (same day, continued):** PO explicitly
  confirmed the "recommended" pairing from `s15-edit-gesture-picker.html`'s Option 3
  is their actual pick — "yes the one i said i like the most is my confirmed
  choice. i'll be clearer about that language in the future." Folded into S15's AC:
  this story's own dedicated edit-icon is now locked to the pencil glyph (✎), freed
  from S7's note-toggle. **Deliberately did NOT also lock the mockup's specific
  replacement glyph for S7's note-toggle (a "sticky note" emoji, 🗒️)** — caught on
  this same re-read that `s7-note-icon-picker.html` is a separate, dedicated,
  more-targeted decision-tool redo already in flight for that exact glyph, prompted
  by the PO's own later, more specific stated preference to avoid colorful
  emoji-style pictographs in favor of plain Unicode symbol/dingbat glyphs (see
  PLAYBOOK_UPDATES_PENDING.md's glyph-rendering notes). Locking "sticky-note emoji"
  onto S7 via this story's side-channel would risk contradicting that other,
  purpose-built process for the identical icon — left it to S7's own row/mockup to
  settle instead; this story only locks that the pencil itself moves to become its
  own edit-icon. **Did not flip S15's Status to Locked** despite this closing the
  last open content question — same process pushback as earlier this sprint:
  Tester's re-check and QA's gate (finding R10, now resolved) already ran on S15,
  but QA never did the final Lock-gate re-read every other Sprint-3 story got after
  its last fix landed (S13's own explicit "zero new contradictions, no objection to
  Locking" pass is the precedent). Recommending that one more QA pass before Lock,
  not treating the PO's content confirmation as a substitute for it. All edits
  grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.
- **QA's whole-AC re-read on S15 landed, 2026-09-08 (same day, continued):** one
  Real finding (R11) and two Minors (M16, M17), all folded in directly (no PO
  input needed, same technical-shape category as everything else resolved
  directly this sprint). **R11:** the M2-precedent re-sort-on-edit guarantee never
  said whether the re-sort reads the live in-progress draft or the last-committed
  name — read literally, a naive implementation could relocate the row on every
  keystroke while its own editor is still open, the same failure shape as S7/S8's
  already-twice-fixed focus-loss-on-render bug, just self-triggered this time.
  Fixed: re-sort now explicitly reads the last-committed name only, same
  precedent S8/S9's grouping-key logic already established (reads committed
  `item.aisle`, never a live draft); the row does not relocate mid-edit, only
  once the edit commits. **M16:** my own icon-pairing edit earlier this session
  had claimed nested-control-precedence for S15's edit-icon was "already stated"
  elsewhere on this row — it wasn't, a dangling cross-reference to nothing.
  Fixed: actually stated it now (tapping the edit-icon performs only the
  edit-open action, never also the row's cross-off toggle). **M17:** S15's
  edit-icon, like S16's, is a nested per-row icon control and was never
  cross-referenced into S14's ~25% shrink scope. Fixed: added the cross-reference
  on both S14's row (mirroring S16's own M14 note) and S15's row. **Also flagged,
  not yet actioned:** two non-blocking wording Nitpicks (N7/N8) on S13 — the
  Orchestrator's relay didn't include their actual text, and S13 is described as
  "not urgent," so holding off on inventing wording rather than guessing at what
  QA meant; will fold in once the actual finding text is available. **Did not
  flip S15 to Locked** — QA's own recommendation after this finding was "fold
  these in, then one more quick re-read before flipping to Locked," i.e. this
  pass is not itself the final sign-off. All edits grep-verified as single
  physical GFM lines; BACKLOG.md still 18 rows.
- **S15 → Locked; S13's N7/N8 folded in, 2026-09-08 (same day, continued):** QA's
  final re-read on S15 confirmed R11/M16/M17 all resolved with no new
  contradictions across all 6 rounds of fixes this story went through — same
  Lock-gate-clean bar S13 cleared earlier this sprint. **S15 → Locked**, clear
  for Developer, sequenced after S13/S14 per its own AC. Also folded in S13's two
  Nitpicks now that the Orchestrator relayed QA's actual verbatim text (not just
  a summary) from QA_FINDINGS.md: **N7** — S13's cross-row-commit sentence now
  reads "note/aisle/**name**" draft (was "note/aisle draft"), since S15's name
  editor is itself one of the drafts a drag-pickup elsewhere must commit, not
  discard. **N8** — S13's pickup-delay-immunity illustrative list (the controls
  an ordinary tap on must never be mistaken for a drag pickup) now also names
  "S15's edit-icon, S16's icon-only aisle affordance" alongside the
  already-listed whole-row cross-off tap/note-aisle-toggle/delete — both controls
  exist now and belong in that list, same reasoning as the original list itself.
  Updated the top-of-file Priority Queue summary to reflect S15 → Locked. All
  edits grep-verified as single physical GFM lines; BACKLOG.md still 18 rows.
- **Carryover:** S13 and S15 are both Locked, doc pipeline fully cleared for both
  — Developer implementation is the only remaining step, S13 first (main open
  thread), S15 sequenced after S13/S14 per its own AC. S7/S8 still "In Review,"
  blocked on S13 shipping and Tester re-verifying the worst-case row (S14's half
  of that gate is already satisfied). S16's replacement note-icon glyph for S7
  remains a separate open item on `s7-note-icon-picker.html`'s side, not tracked
  as a BACKLOG.md gate on any locked/Done story.
- **S13 implemented and formally verified, 2026-09-09 (session resumed after a
  brief connectivity pause):** Developer implemented S13 (sha `33deddf`, part of
  `635f906`) — whole-row drag surface, raw Pointer Events, self-verified 27/27.
  Tester's independent formal pass landed: **216/216 assertions** (67 Sprint-1
  retrofitted + 81 Sprint-2 retrofitted + 26 Sprint-3 reconfirmed + 42 new
  S13-specific), zero defects — REGRESSION_LOG.md's 2026-09-09 row, script
  `vopping-tests-tester-s1-s13-formal.js`. This retrofit retired S5's 7
  now-inapplicable Up/Down test cases and rewrote S9's TC9.8/TC9.9 for the drag
  era — both already anticipated in BACKLOG.md's own forward-reference notes
  before S13 shipped, not surprises. **S13 → Done.** Closed the matching
  forward-reference notes on S5's and S9's own rows now that the anticipated
  supersession actually happened, and updated S9's AC clause to point at S13's
  drag mechanic instead of S5's buttons. **Disclosed fix, not yet fully closed:**
  the PO found a real bug testing S13 on an actual iPhone — the drag pickup
  collided with iOS Safari's native long-press-select/callout gesture. Developer
  fixed it (sha `50c57c8`, `-webkit-user-select`/`-webkit-touch-callout: none`)
  but disclosed the verification gap themselves: Chromium doesn't implement
  those iOS-specific gestures at all, so this pass only confirms the CSS parses
  and scopes correctly, not that the real behavioral fix works on an actual
  device. Tracked as non-blocking (same real-hardware-is-the-real-signal
  standard this project already applies elsewhere), not folded into S13's Done
  citation as if it were independently confirmed.
- **Tracked follow-up #2 gate: checked, still open — real gap found, not closed
  by S13 shipping alone.** The Orchestrator asked directly whether S13 shipping
  finally closes S7/S8's crowded-row gate now that both S13 and S14 have landed.
  Checked every test-plan file for a dedicated "worst-case row" check (an item
  with both S7's note and S8's aisle set) — none exists. S13's and S14's own
  formal passes each verify their own story's functional AC in isolation, not
  the combined visual effect on the specific row this gate is about. Declined to
  treat "2 controls removed + the rest shrunk 25%, so it must be fine now" as
  sufficient — this project's own M3 gate already explicitly rejected exactly
  that shape of inference once (sub-parts passing individually is not the same
  as a dedicated pass against the real, full row). Recommending one cheap
  targeted Tester check (render the worst-case row today, assert control
  count/row height/no mobile-viewport overflow, same shape as S1/S2/S5's own
  density Done-gate check) before this gate can close and S7/S8 move to Done.
  Updated the gate's own note and the top-of-file Priority Queue summary
  accordingly. All edits grep-verified as single physical GFM lines; BACKLOG.md
  still 18 rows.
- **Carryover:** S13 Done. S15 Locked, next in line for Developer now that S13
  has shipped. S7/S8 still "In Review" — one specific, cheap Tester check (the
  worst-case-row measurement above) away from closing that gate, not a product
  question and not blocked on the PO. The iOS Safari fix (sha `50c57c8`) is
  tracked non-blocking pending the PO's real-device re-test.
- **Tracked follow-up #2 gate CLOSED; S7/S8 → Done, 2026-09-09 (same day,
  continued):** Tester delivered exactly the recommended check — rendered the
  real worst-case row post-S13+S14, measured both crowding axes directly
  (screenshots + DOM data, 17/17), not inferred. Axis A (note+aisle both set)
  collapses to name + 1 delete icon on one line; Axis B (both empty, the likely
  real source of the original "5 controls" figure) is down to 3 icons at
  19.5px from 5 at 26px. Both confirmed no longer crowded. **S7, S8 → Done.**
- **QA's adversarial post-Done review found a real Critical bug in S13 (C1) —
  first time this exact scenario has come up on this project, 2026-09-09 (same
  day, continued):** starting a drag-pickup on one row while a note/aisle
  editor is open on a DIFFERENT row throws an uncaught exception and leaves the
  list permanently unscrollable until reload. Root cause: `beginDrag` captures
  the row's `li` DOM node as a closure variable at `pointerdown` time, then the
  cross-row-commit guarantee (correct, locked AC) fires `commitEditor()` on the
  other row's open draft, which calls `render()` and rebuilds the ENTIRE list —
  detaching the closure's `li` reference six lines before it gets dereferenced.
  A real, ordinary-use crash (no contrivance needed), not a hypothetical — full
  trace in QA_FINDINGS.md's C1. Not a gap in Tester's 216/216 pass's own
  assertions (each of those passed exactly as written) — a coverage gap: the
  specific *combination* of an open cross-row draft AND a completed drag
  sequence was never scripted together, sitting at the intersection of two
  independently-well-tested areas (S7/S8's editor-commit guarantee, S13's own
  drag-arm mechanics) neither of which obviously implied the other needed it.
  Fix already sent to Developer by the Orchestrator (re-fetch `li` fresh from
  the DOM right after `commitEditor()`, mirroring the already-fresh `idx`
  re-derivation immediately below it in the same function).
  **Status handling — no prior precedent existed for this exact scenario
  (Done story, real regression found post-Done via QA's adversarial sweep, not
  pre-Done as with S4's disclosed paste-marker defect); establishing one now:**
  this project's controlled Status vocabulary has no "Reopened" label, and the
  playbook explicitly warns that inventing a new one silently breaks the
  console's filter logic. Reused **"In Review"** instead of inventing a label —
  same word S7/S8 used moments earlier in this same session, but for a
  deliberately different reason, called out explicitly on S13's own row so a
  future reader can tell the two apart: S7/S8's meant "functionally correct,
  blocked by an external gate"; this one means "a confirmed defect exists in
  shipped code, fix in progress, Done is not currently an accurate claim."
  **S13 → In Review** (down from Done). Reinstating Done requires Developer's
  fix landing plus Tester's dedicated regression coverage for the exact
  triggering combination — same resolution shape as R9/R11 (technical, no PO
  input needed), just Critical severity given the confirmed reproducible crash
  with a persistent broken-UI side effect, not an ambiguous rule.
  **Explicitly did NOT let this reopen or block anything else:** S5's/S9's own
  already-closed forward-reference notes describe a real, already-shipped
  markup/behavior change unaffected by this unrelated interaction bug — left
  untouched. **Also explicitly did NOT hold S7/S8's Done flip (above) for
  this** — the Orchestrator flagged both threads as orthogonal and left the
  call to me: crowding is a physical-layout fact (verified, unaffected by C1);
  C1 is a functional bug in a specific drag+cross-row-editor interaction path
  in a different story. Treating one as blocking the other would be new,
  unpracticed caution — cross-story independence (S5 staying Done through
  S13's own UI supersession) is already this project's working model. Folded
  M18 (a cheap Minor, mischaracterized risk in a `setPointerCapture` fallback
  comment) in as non-blocking alongside C1's fix, per QA's own recommendation.
  Updated S13's own row, the Tracked follow-up #2 gate note, and the top-of-file
  Priority Queue summary (rewritten more broadly while in there, since several
  layered updates had made it hard to follow — consolidated to current state
  rather than patched again). All edits grep-verified as single physical GFM
  lines; BACKLOG.md still 18 rows.
- **Carryover:** S7/S8 Done — closed, nothing further pending. S13 "In Review"
  pending C1's fix landing + Tester's dedicated regression coverage for the
  triggering combination; M18 to fold in alongside. S15 Locked, waiting on
  S13's Done reinstatement before Developer picks it up next (per its own AC's
  sequencing, not blocked by C1 itself). iOS Safari real-device re-test (sha
  `50c57c8`) still pending the PO, tracked non-blocking, unrelated to C1.
- **S13 reinstated to Done, 2026-09-09 (scrum-master's resume-time verification,
  following a full session/connection drop — re-checked directly against the
  actual files rather than taking the reinstatement condition as already
  satisfied on faith):** BACKLOG.md's own S13 row states the reinstatement
  condition explicitly: "Developer's fix landing, plus Tester adding dedicated
  regression coverage for the exact combination that triggers it." Verified
  both halves independently. **(1)** Developer's fix is landed and pushed —
  sha `90983e3` re-fetches `beginDrag()`'s row element fresh by id immediately
  after `commitEditor()`, mirroring the already-fresh `idx` re-derivation right
  below it; also hardens M18's `setPointerCapture` fallback in the same commit
  (confirmed directly via `git log`, not just cited from memory). **(2)**
  Tester's dedicated regression coverage for the exact triggering combination
  is real and landed — read `test-plans/S13-drag-drop-reorder.md` in full: its
  own STATUS banner already reads "DONE," TC13.11 was strengthened to assert
  the LIVE row (not a stale detached clone) receives the `dragging` class, and
  a new TC13.27 covers the identical combination via an aisle editor —
  219/219 (45 S13-specific + the full 174-check regression baseline), zero
  defects. Tester additionally, independently settled a discrepancy between
  QA's original trace and Developer's own repro by reproducing both pre-fix
  and post-fix behavior directly against an isolated temp copy of the pre-fix
  code — confirmed the fix genuinely closes the bug, not just that a test
  happens to pass. Both reinstatement conditions are therefore satisfied, not
  assumed. **S13 → Done** in BACKLOG.md, with the reinstatement account and a
  carried-forward severity correction added directly to S13's own row (see
  below). Also updated the top-of-file Priority Queue summary, which was
  still describing S13 as reverted/awaiting fix. All edits grep-verified as
  single physical GFM lines immediately after writing (`^\| S13 \|` still
  matches exactly once; BACKLOG.md still 18 story rows, 238 total lines, no
  orphaned stray paragraph at EOF).
- **Severity/mechanism correction folded in alongside the reinstatement:**
  QA_FINDINGS.md's own 2026-09-09 "Correction" entry (read directly, not
  relayed secondhand) found C1's original description — a thrown exception,
  list permanently unscrollable until reload — was inaccurate: removing the
  old `<ul>` via `innerHTML` replacement doesn't detach its own descendants,
  so the stale `li` reference's `insertBefore` call succeeded silently into a
  dead subtree rather than throwing. The real pre-fix bug was a silent
  stale-clone visual/positional defect (wrong/missing `dragging` styling, a
  skewed insertion-index calculation), scoped to that one gesture only and
  self-resolving the instant it ended — no persistent broken state. QA
  retroactively reclassified this as **R13 (Real, not Critical)**; the root
  cause identified and the fix already shipped are unaffected by this
  correction, only the failure-mode description and severity label change.
  Folded this correction directly into S13's own BACKLOG.md row (which still
  described C1 as "Critical" with the now-superseded failure mode) rather
  than leaving a stale severity claim sitting next to the row's own
  just-added reinstatement note — same citation-hygiene habit this project
  has applied to every other correction/drift found on a doc re-read.
- **Ledger gap found and flagged, not fixed directly (not my file):**
  `REGRESSION_LOG.md`'s own ledger still shows 216/216 as its last logged row
  for S13 — the superseding 219/219 run (already fully documented in the
  test-plan file's own STATUS banner, command output, and verbatim PASS lines)
  has never been appended as its own dated ledger row, plausibly because the
  session's connection drop interrupted Tester right as they were finishing
  this exact bit of bookkeeping. Cited the test-plan's own fully-detailed,
  independently-reproduced 219/219 evidence directly in BACKLOG.md's S13 row
  rather than an out-of-date ledger figure, consistent with this project's own
  "cite the most current verified evidence" practice — but flagging this gap
  for Tester to close by adding the missing dated row, rather than adding it
  myself (REGRESSION_LOG.md is Tester-owned, not mine to edit).
- **Carryover:** S13 Done (reinstated, this session). S15 Locked — S13's Done
  reinstatement above clears its own sequencing dependency, so Developer can
  pick it up next. S7/S8 unaffected, already Done. iOS Safari real-device
  re-test (sha `50c57c8`) still pending the PO, tracked non-blocking. Flagged
  for Tester (not a scrum-master action item): add the missing 219/219 dated
  row to REGRESSION_LOG.md's ledger.
- **Big PO direction change drafted as S19 + S20, 2026-09-09 (same day, relayed
  by Orchestrator):** the PO gave two distinct decisions from a fresh review,
  driven by a SECOND real-device drag failure — this time the drag gesture
  loses to the phone's native scroll ("when i try to drag the item, it scrolls
  the screen instead of moving the item"), the first having been the iOS
  text-select collision (sha `50c57c8`, still never confirmed fixed on-device).
  Drag-and-drop passed 219/219 in our desktop Chromium test environment but has
  now failed twice on the PO's actual hardware — an environment we structurally
  cannot reproduce. Drafted both into BACKLOG.md; doc-structure call was left to
  me.
  - **Decision 1 → S19 (restore Up/Down reorder buttons, remove drag-and-drop).**
    PO's words: "i think we need to go back to the up/down arrows. i know it
    will result in the buttons being a bit crowded, but i'll take crowded over
    not working. from some testing, it looks like i'll still have about 20
    characters even with two up/down buttons and the edit button." **Structure
    call — new story, NOT a reopening of S13, NOT a re-drafting of S5:** this
    project's strongest, repeatedly-invoked convention is cross-story
    supersession over reopening — when the PO went the *other* direction
    (S5's Up/Down → S13's drag), the scrum-master explicitly kept S5 Done and
    made S13 a new story ("shipped and passed exactly as specified for its
    time"). Reversing direction uses the identical shape: **S13 stays Done**
    (it passed its full verified AC — real-device behavior was always a
    separately-tracked, non-blocking signal, never part of its Done claim, per
    the iOS fix's own tracked-non-blocking note), and **S19 supersedes its live
    mechanism the mirror image of how S13 superseded S5's.** S5's own data
    model/reorder-persistence logic never changed through either direction and
    carries forward untouched — S19 is a UI/interaction reversal only, no data
    migration. Added dated cross-story notes to S13 (reverted-by-S19, with the
    escape hatch below), S5 (un-superseded/mechanism-restored-by-S19), and S9
    (forward-reference note: its non-Manual-sort clause re-points from S13's
    drag back to S19's Up/Down on ship, left pointing at S13 until then so
    Tester's coverage keeps matching what's implemented today — same handling
    this clause already used across the S5→S13 transition). **Crowding is a
    PO-accepted tradeoff, explicitly NOT a reopening of the R7 /
    Tracked-follow-up-#2 crowded-row gate:** that gate existed because the PO
    had not yet *seen* a crowded row; here the PO has directly experienced the
    alternative, seen the crowding, and chosen it — same PO-owned-tradeoff
    handling as S14's sub-24px controls. **Escape hatch (per Orchestrator):**
    the revert is the PO's decision UNLESS Developer's separate, parallel
    root-cause diagnosis of the scroll-collision (likely a
    `touch-action`/non-passive-listener/`preventDefault` issue desktop Chromium
    can't surface) proves it trivially fixable AND the PO reconsiders — in which
    case S19 parks and S13's drag is retained. Proceeding with the revert
    regardless; the diagnosis does not block S19's own doc pipeline. Noted on
    S13's row that if the diagnosis instead confirms a genuine S13
    *implementation* defect, that could retroactively warrant the same
    "In Review" treatment C1 got — a call for once the diagnosis lands, not
    preempted now.
  - **Decision 2 → S20 (frameless restyle of all per-row icon controls).** PO's
    words: "for all the buttons, instead of having a tiny icon in a square
    button, make the icon the size of the button and remove the square outline.
    it will give the appearance of a bigger button without the size of the
    button actually changing." **Structure call — its own story, not folded
    into S19:** this project consistently keeps visual/styling treatments as
    their own stories (S14 shrink, S16/S17 visual treatments were all separate),
    and this restyle applies to every per-row icon control regardless of the
    reorder mechanism. Scope: the full `.icon-btn` set — Up/Down (S5/S19),
    delete (S3), note-toggle (S7), aisle-toggle (S8), S15's edit-icon, S16's
    aisle-sort icon. **Complementary to S14, does NOT undo it:** footprint stays
    whatever S14's ~25% shrink left it; S20 only removes the square chrome and
    enlarges the glyph within that footprint. Added a cross-reference note on
    S14's Done row (mirroring the M14/M17 forward-reference pattern), and on
    S15's and S16's rows (their icons are in S20's scope). Text tags
    (`.note-display`/`.aisle-tag`) are out of scope — they aren't "icon in a
    square button" — same boundary S14 drew. No decision-tool mockup needed:
    this is a direct, unambiguous PO instruction, not an open subjective call
    (contrast S13/S15's gesture/icon pickers).
  - **Sequencing (per Orchestrator):** Developer is mid-implementation on S15
    (edit button, independent of the reorder mechanism) and finishes it first;
    S19 and S20 come after, so both their AC assume S15's edit-icon already
    exists in the row. Both drafted at **Not Started** — neither can Lock until
    Developer sanity-check + Tester testability-check + QA gate all clear, same
    pipeline every story on this project has gone through (no shortcut for a
    revert or a restyle). Did NOT flip either to Locked, consistent with this
    project's own precedent (the Status column has never reached Locked before
    Tester + QA both clear a story).
  - All edits grep-verified as single physical GFM table lines immediately after
    writing: BACKLOG.md now has 20 story rows (S1-S20), each a well-formed
    7-segment single-line row (S19/S20 confirmed one physical line each), 263
    total lines. Top-of-file Priority Queue summary and the Sprint 3 narrative
    list both updated to reflect S19/S20. No QUESTIONS.md entry created — both
    decisions are PO answers, not open asks; the escape-hatch conditional
    becomes a real PO question only if Developer's diagnosis comes back trivial,
    at which point the Orchestrator surfaces it (flagged to the Orchestrator).
- **Carryover:** S19/S20 drafted, Not Started — need Developer sanity-check +
  Tester testability-check + QA gate before Lock; both sequenced after S15,
  which Developer is finishing first. S13 stays Done (reverted-by-S19, escape
  hatch open on Developer's scroll-collision diagnosis). S15 Locked, next up for
  Developer. Reorder ripple notes landed on S5/S9/S13; restyle ripple notes on
  S14/S15/S16. Two Tester/Orchestrator flags still standing from the prior
  entry: (1) the missing 219/219 REGRESSION_LOG.md ledger row (Tester);
  (2) console sync for S13's Done + the two new S19/S20 rows (Orchestrator).
- **S15 implemented → In Review + a real staleness item handled, 2026-09-09
  (same day, relayed by Orchestrator):** two updates for my files.
  **(1) S15 implemented (Developer, pushed sha `10c804e`):** built by reusing
  S7/S8's shared editor infrastructure (`editingField`/`openEditor`/
  `commitEditor`) rather than a parallel build — one of the two approaches
  Tester's testability-check explicitly left to Developer's choice, with both
  behavioral guarantees required either way (draft survives an unrelated
  re-render; opening any other editor or a drag-pickup elsewhere commits it).
  Self-verified 33/33 new checks + the full 219/219 regression re-confirmed
  clean. **Moved S15 Locked → In Review**, not straight to Done — the same
  convention S7/S8/S9/S10 used for "implemented + self-verified, Tester's
  formal pass now underway," reserving Done for Tester's own independent
  formal-pass citation, per this project's standing rule that self-verification
  (however thorough) is never itself sufficient for Done. This is the original
  S7-S10 sense of "In Review" (awaiting Tester), distinct from S13's C1-era
  reuse of the same label (which meant "confirmed defect in shipped code") —
  flagging the sense explicitly so a future reader doesn't conflate them, same
  discipline S13's own row already established for the label's dual use.
  Tester's formal pass is running now; Done flips when that citation lands.
  Updated the top-of-file Priority Queue summary's S15 clause (and its now-stale
  "S15, which Developer is finishing first" wording in the S19/S20 sub-note)
  accordingly.
  **(2) Staleness in S7/S8's crowded-row closure evidence — handled by
  softening, not re-counting (my call on timing, per the Orchestrator's
  options):** Developer flagged that S15's edit-icon, being always visible
  (item names are never empty, so unlike the note/aisle toggles it always
  renders), adds one icon to every row — shifting the specific icon counts
  cited in the S7/S8 Done-gate closure evidence (Axis A 1→2, Axis B 3→4). Row
  height/overflow still pass clean and the PO has accepted the crowding, so
  this is NOT a regression and does NOT reopen the gate or R7 — only the exact
  numbers in the closure note are stale. **Chose option (a): soften the closure
  note's wording now so it no longer hangs on a frozen icon count, and defer one
  definitive re-measurement until S19/S20 land** — rather than re-stating a
  fresh exact count now, which would just go stale a third time the moment S19
  (+2 icons) and S20 (frameless restyle) change the row again. That repeated
  drift-at-one-seam is exactly what the playbook §6 says to fix structurally
  (soften the dependency) rather than by re-stating and re-promising accuracy.
  Added a dated softening addendum to the top-of-file "Gate CLOSED" note and a
  concise point-in-time tag to S7's and S8's own rows: all three now explicitly
  say the gate's conclusion rests on the still-passing overflow/row-height check
  plus the PO's own accepted-crowding decision, not on any specific icon tally.
  Tester owns the closure script itself (`vopping-worst-case-row-s13-s14-
  closure.js`) — the Orchestrator flagged the same to them for the eventual
  definitive re-measure; I only touched the note wording in my own files.
  All edits grep-verified as single physical GFM table lines (S7/S8/S15 rows
  each still one well-formed 7-segment line; 20 story rows total, 279 lines).
- **Carryover:** S15 In Review — Tester's formal pass running; flips to Done on
  that citation. S19/S20 Not Started, awaiting Developer's sanity-check (which
  comes after Developer diagnoses the scroll-collision for the Orchestrator),
  then the rest of the pipeline before Lock. S13 Done. S7/S8 Done — closure note
  softened, one definitive icon re-measure deferred to Tester once S19/S20 land.
  Standing flags unchanged: missing 219/219 REGRESSION_LOG.md row (Tester);
  console sync for S13 Done / S15 In Review / new S19/S20 rows (Orchestrator).
- **PO's final call on the reorder revert — escape hatch CLOSED, drag abandoned
  for good, 2026-09-09 (same day, relayed by Orchestrator):** with Developer's
  full root-cause diagnosis in hand, the PO chose to proceed with the S19 revert
  to Up/Down and explicitly declined the one drag-preserving alternative.
  **Developer's diagnosis — preserved here deliberately as the rationale for why
  a 219/219-passing feature got pulled, so a future reader doesn't wonder:** the
  real-device drag failure is an iOS `touch-action`-latched-at-`touchstart`
  conflict — Mobile Safari commits to native scrolling at the moment of
  `touchstart`, before the drag's JS pickup-delay timer can claim the gesture,
  so a press-and-hold drag can never out-compete scroll on that engine. Desktop
  Chromium does not latch touch-action this way, which is exactly why S13 passed
  219/219 in our test environment yet failed on the PO's actual phone — the
  concrete instance of this project's own "real hardware is the real acceptance
  signal, emulation only approximates it" principle overriding a green test
  suite. The Orchestrator laid out the drag-handle alternative to the PO (a
  dedicated handle would be one icon fewer than restoring Up/Down — 5 vs 6 — and
  would keep drag); the PO declined it, choosing the proven, familiar Up/Down
  mechanism after being burned by drag twice (first the iOS text-select
  collision, then this scroll-latch). **Resolution:** the escape hatch on S13
  and S19 is CLOSED — drag-and-drop is out for good, the handle-based-drag
  alternative is explicitly declined, and S19's revert proceeds unconditionally
  (no longer "revert unless trivially fixable / PO reconsiders"). Resolved the
  conditional directly on both S13's and S19's rows, and in the top-of-file
  Priority Queue summary's escape-hatch clause. **S13 stays Done** as the
  historical record of the shipped-and-verified drag feature — the diagnosis is
  a platform-level touch-action behavior and the resolution is supersession
  (S19), not a fix-in-progress, so it does NOT trigger the C1-style "In Review"
  branch that was earlier flagged as a possibility. **Pipeline:** S19/S20 are
  clear to continue — Developer's sanity-check is done, Tester's
  testability-check is being routed next; both stay Not Started until Tester +
  QA both clear them, per this project's standard rule. All edits grep-verified
  as single physical GFM table lines; BACKLOG.md still 20 story rows.
- **Carryover:** S19/S20 Not Started, escape hatch closed — proceeding
  unconditionally through the pipeline (Developer sanity-check done; Tester
  testability-check next, then QA gate, before Lock). If Developer's S19/S20
  sanity-check surfaced any AC findings to fold in, I have not received them yet
  — flagged to the Orchestrator so it isn't assumed silently handled. S13 Done
  (drag superseded by S19, decision final). S15 In Review (Tester's formal pass
  running). S7/S8 Done (closure note softened; icon re-measure deferred to
  Tester after S19/S20 land). Standing flags: missing 219/219 REGRESSION_LOG.md
  row (Tester); console sync for S13 Done / S15 In Review / S19+S20 new rows
  (Orchestrator).
- **S15 → Done, and S19/S20's Developer+Tester pipeline findings folded in,
  2026-09-09 (same day, relayed by Orchestrator in two back-to-back messages):**
  - **S15 → Done.** Tester's independent formal pass landed — **246/246**
    (219 regression baseline re-confirmed + 27 new S15 checks; 219 + 27 = 246),
    zero defects — the citation of record, superseding S15's Locked/In-Review
    states and Developer's own 33/33 self-check per the playbook's
    independent-formal-pass-supersedes-self-check rule. Flipped the Status cell
    and the top-of-file summary's S15 clause. **Ledger note:** neither this 246
    total nor the earlier 219 (S13 C1-fix) run has been appended as its own
    dated row in REGRESSION_LOG.md yet — cited directly from Tester's formal-pass
    results in the meantime and re-flagged to Tester (that file's owner) to add
    both rows plus the canonical script name; not mine to edit.
  - **S19 (revert) sanity-check + testability-check findings folded in.** The
    sanity-check did NOT land clean (my earlier carryover's open question is now
    answered — the Orchestrator had relayed the diagnosis to the PO but not the
    findings to me). Triaged: **(a)** locked a verification requirement — Tester
    must measure the true 6-icon both-fields-empty worst-case row at 320px
    (S15's always-visible edit-icon pushes it to 6, one past R7's original 5),
    which also serves as the deferred definitive re-measurement for the S7/S8
    closure evidence I softened; **(b)** locked removal-completeness naming the
    specific drag-only orphans to delete (`suppressNextClick`/
    `armClickSuppression()`/its click-guard, the document-level M18 fallback
    listeners, the `cursor: grab` rule); **(c)** made the conscious `user-select`
    call directly (plain `user-select:none` stays as S1/S2's guard; the
    drag-era `-webkit-*` additions kept but re-scoped as general tap-target
    selection/callout suppression) — which incidentally makes the iOS-fix's
    tracked-non-blocking real-device re-test MOOT (no drag gesture left to
    collide with); **(d)** left the undo-entry shape as Developer's
    implementation choice (behavioral guarantee locked, not the shape), same
    treatment this project always gives technical-approach findings; **(e)**
    noted the downstream S9 TC9.8/TC9.9 re-write (Tester's). Then Tester's
    testability-check landed clean with one clarification — **(f):** the
    PO-accepted crowding does NOT waive S1/S2's locked no-horizontal-overflow
    guardrail (checked at 320/360/375/390px, flex-wrap permitted); that stays
    the deterministic pass/fail line, the "~20 chars" figure is an
    accepted-tradeoff observation, not a per-character assertion.
  - **S20 (frameless restyle) findings folded in.** **(a)** expectation-setting
    note that one uniform font-size across the mixed glyph set won't render
    visually uniform (per-glyph tuning is a Developer detail, may accept some
    unevenness); **(b)** locked footprint/row-height verification (glyphs stay
    within the ~19.5px box, no row-height growth); **(c)** removal-completeness
    (drop the now-dead `border-color` on `.icon-btn.delete-btn`/`.aisle-sort-icon`,
    color distinction survives via `color:`); **(d)** preserve-press-feedback
    requirement + real-device legibility/separation look (frameless removes the
    hover-background feedback), PO-requested so proceeding. Testability
    clarification **(e):** "scale the glyph to fill the footprint" pinned to
    "computed font-size materially larger than pre-S20" (fill ratio a Developer
    tuning detail, like S14's ~25%/S13's constants); "remove the box" =
    border + background + box-shadow removed, NOT shrinking the tap target.
  - **Triage principle applied throughout (unchanged from this project's norm):**
    AC-worthy requirements, verification items, deliberate decisions, and
    removal-completeness clauses locked into the AC directly (all narrow
    technical-shape calls, no PO input needed — same category as S13's R9/R11);
    pure implementation-approach choices (S19's undo shape, S20's per-glyph
    tuning method) left to Developer. Reference (Tester-owned, not edited):
    `test-plans/S19-restore-updown-buttons.md`,
    `test-plans/S20-frameless-icon-restyle.md`.
  - All edits grep-verified as single physical GFM table lines: 20 story rows,
    zero malformed, S15 now Done, S19/S20 still Not Started (headed to QA gate),
    279 lines.
- **Carryover:** S15 Done. S19/S20 Not Started — sanity-check + testability-check
  both cleared and all findings folded in; **next step is QA's per-story gate**,
  then AC Lock, then implementation. S13 Done (drag out for good). S7/S8 Done
  (definitive icon re-measure now assigned to S19's formal pass via S19 finding
  (a)). Standing flags for others: REGRESSION_LOG.md missing both the 219 and
  246 dated rows (Tester); console sync now covers S15 → Done as well as the
  S19/S20 rows (Orchestrator).

## Parked / unscheduled

- **S11** (recipe-paste alternate ingest mode) — explicitly not sequenced into
  either sprint. Low-priority future stretch only, per explicit PO direction not
  to build this now. Revisit only if asked.
- **S18** (collapsible aisle groups when sorted By Aisle) — drafted 2026-09-08
  alongside Sprint 3, explicit PO stretch goal, same treatment as S11. Revisit
  only if asked, likely after S9/S16/S17 have been lived with for a while.
