// Plain global-variable assignment, not JSON + fetch — file:// blocks fetch/XHR
// of local files. The Orchestrator hand-maintains this file directly as work
// happens; status.html re-injects it on a timer to "poll" for changes.
window.STATUS_DATA = {
  "updatedAt": "2026-09-04T15:12:09Z",
  "lastPush": null,
  "pendingQuestion": {
    "asked": true,
    "time": "2026-09-04T15:02:55Z",
    "summary": "2 items still need PO input, no rush: (1) row-density pick — density-picker.html is now revised with the real S3/S5/S7/S8 controls and ready to try; (2) should checking an item off auto-move it to the bottom, or stay in place? SM default: stays in place. (3) is add-count/threshold-2 the right trigger for \"what am I missing\" suggestions?"
  },
  "agents": {
    "orchestrator": {
      "role": "Orchestrator",
      "status": "Working",
      "task": "Relayed first draft backlog and 3 open questions to PO. Dispatched Developer sanity-check + Tester testability-check on Sprint 1 (S1-S6), stood up QA for its first full sweep."
    },
    "scrumMaster": {
      "role": "Scrum Master",
      "status": "Standing by",
      "task": "Sprint 1 fully locked: S1-S6 + S12, all 7 stories. S12 got its own toast decision (scope-feedback rationale, distinct from S3's accident-prevention one). Standing by for Sprint 2 work or new direction."
    },
    "developer": {
      "role": "Developer",
      "status": "Working",
      "task": "Sprint 1 AC locked — starting implementation. Also running sanity-check on new S12 (clear all checked items)."
    },
    "tester": {
      "role": "Tester",
      "status": "Working",
      "task": "Sprint 1 locked — starting formal test-plan files as implementation lands. Also running testability-check on new S12."
    },
    "qa": {
      "role": "QA",
      "status": "Standing by",
      "task": "First sweep done: 6 Real findings (R1 corrupted-storage handling, R2 delete+undo data-loss tension, R3 missing bulk-clear/new-trip action, R4 density-picker under-represents the real row, R5 paste bullet/number prefixes, R6 aisle normalization) + 6 Minor + 4 Nitpick, all logged to QA_FINDINGS.md. Routed for resolution."
    }
  },
  "events": [
    { "time": "2026-09-04T15:12:09Z", "who": "Scrum Master", "text": "S12 fully locked — added a toast decision (\"Cleared N items — Undo\", scope-feedback rationale, distinct from S3's accident-prevention toast) and flipped Status to Locked. Sprint 1 is now completely locked: S1-S6 + S12, all 7 stories, clear for Developer implementation. Separately: PO decided vopping gets its own new GitHub repo (public, mirroring vacking's public+Pages setup) under the same personal account as vacking — waiting on PO to complete a github.com login on this machine before repo creation." },
    { "time": "2026-09-04T15:04:51Z", "who": "Orchestrator", "text": "Sprint 1 (S1-S6) AC locked by Scrum Master. Dispatched Developer to start implementation and Tester to start formal test-plan files. S12 (added after Sprint 1's passes ran) routed to both for its own sanity-check/testability-check before it can lock." },
    { "time": "2026-09-04T15:02:55Z", "who": "Orchestrator", "text": "Corrected this console's timestamps — PO caught that the pending-question box read \"asked 14 hours ago\" for something that read as just-asked. Root cause: earlier entries used illustrative placeholder times (e.g. \"00:00:00Z\", \"00:05:00Z\"...) instead of real clock time, not a bug in the staleness math itself. Re-anchored updatedAt/pendingQuestion.time to the actual current time and shifted the existing feed entries to preserve their real relative spacing. Will pull real timestamps via the system clock going forward instead of guessing." },
    { "time": "2026-09-04T15:02:55Z", "who": "Orchestrator", "text": "Relayed Scrum Master's first draft backlog to the PO along with 3 open questions (row-density pick, S2 auto-move-on-check default, S10 suggestion signal/threshold). Dispatched Developer's sanity-check and Tester's testability-check on Sprint 1, stood up QA as the 4th role for its first full sweep." },
    { "time": "2026-09-04T14:57:55Z", "who": "Scrum Master", "text": "Delivered first draft backlog: 11 stories (S1-S11). Sprint 1 = core mutable-list loop (render/add/persist, check/uncheck, delete, paste-to-ingest, up/down reorder, undo-last-action, in dependency order). Sprint 2 = enrichment (notes, aisles, view-only sort, \"what am I missing\" suggestions). S11 (recipe-paste alt mode) parked, no AC, per PO's explicit steer. Added superseded-note to project-notes.md retiring its stale \"on hold / needs backend\" framing. Logged 1 genuinely open question (row-density) + 2 non-blocking working-default questions to QUESTIONS.md." },
    { "time": "2026-09-04T14:47:55Z", "who": "Tester", "text": "Read playbook + vacking's QA_FINDINGS.md. Set up test-plans/README.md (pipeline, file template, STATUS-banner discipline rule) and test-plans/REGRESSION_LOG.md (canonical regression count ledger, opened at 0). Flagged that project-notes.md still said the project is \"on hold\" pending backend/multi-user, contradicting the resolved offline/localStorage decision." },
    { "time": "2026-09-04T14:45:55Z", "who": "Orchestrator", "text": "Routed Tester's project-notes.md staleness flag to Scrum Master — asked them to add a superseded-by note pointing at BACKLOG.md when the first draft lands." },
    { "time": "2026-09-04T14:42:55Z", "who": "Orchestrator", "text": "Project kicked off. Reviewed stale project-notes.md and the agentic orchestration playbook, reviewed sibling project vacking for UI/process precedent. PO confirmed: single-user fully offline app (multi-user + shareable link dropped), new paste-to-ingest feature (simple newline-split parsing), up/down move buttons for reordering, single-last-action undo. Spawned Scrum Master, Developer, and Tester as background agents with full charters. Set up .claude/settings.json baseline allowlist and this status console." }
  ]
};
