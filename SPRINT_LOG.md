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

## Parked / unscheduled

- **S11** (recipe-paste alternate ingest mode) — explicitly not sequenced into
  either sprint. Low-priority future stretch only, per explicit PO direction not
  to build this now. Revisit only if asked.
