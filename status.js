// Plain global-variable assignment, not JSON + fetch — file:// blocks fetch/XHR
// of local files. The Orchestrator hand-maintains this file directly as work
// happens; status.html re-injects it on a timer to "poll" for changes.
window.STATUS_DATA = {
  "updatedAt": "2026-09-04T15:57:06Z",
  "lastPush": {
    "sha": "91cda02",
    "time": "2026-09-04T15:18:21Z",
    "subject": "Initial commit: vopping project setup, backlog, and Sprint 1 scaffolding"
  },
  "messages": [
    {
      "id": "m7",
      "time": "2026-09-04T15:57:06Z",
      "needsReply": false,
      "answered": false,
      "summary": "S4's marker-only-line bug is fixed, Tester re-verifying now.",
      "body": "Developer widened the marker-strip regex to also match end-of-string, not just trailing whitespace — a narrower fix than Tester's original suggestion, chosen to avoid risking a regression on the leading-whitespace-before-marker case. Self-verified 37/37 in a live browser, zero console errors. S4 flips to Done once Tester confirms."
    },
    {
      "id": "m6",
      "time": "2026-09-04T15:36:54Z",
      "needsReply": false,
      "answered": false,
      "summary": "S3/S6/S12 flipped Done (67/67, cited). S4's marker-only-line bug: fixing now, not backlogging.",
      "body": "Scrum Master's call, not a PO decision: the S4 bug is narrow, root cause is clean, and Tester already handed over the fix direction, so it's getting patched now rather than shipping a known bug to Done. Routed to Developer. S4 stays Locked until the fix lands and Tester re-verifies. S1/S2/S5 unchanged (still correctly held on your density-picker pick)."
    },
    {
      "id": "m5",
      "time": "2026-09-04T15:33:36Z",
      "needsReply": false,
      "answered": false,
      "summary": "Sprint 1 formal test pass: 67/67, one minor bug found and disclosed.",
      "body": "Tester's independent formal pass on S1-S6+S12 passed 67/67 with zero console/page errors, zero dialogs, zero network calls. They found and disclosed one real minor defect despite their own assertion technically passing: pasting a line that's just a marker glyph + trailing whitespace (e.g. \"- \", \"1. \") creates a spurious junk item instead of being skipped. Routed to Scrum Master for a fix-now-vs-backlog call. S3/S4/S6/S12 are clear Done citations; S1/S2/S5 are correctly held at \"formal pass complete, not yet Done\" pending your density-picker pick (that's an existing tracked gate, not a new blocker)."
    },
    {
      "id": "m1",
      "time": "2026-09-04T15:21:53Z",
      "needsReply": false,
      "answered": false,
      "summary": "New: this Messages tab. One-way push only (no server behind this page) — I'll use it for anything worth your attention instead of narrating every relay in chat. The \"Outstanding Questions\" box up top counts unanswered items below and jumps here if you click it."
    },
    {
      "id": "m2",
      "time": "2026-09-04T15:18:21Z",
      "needsReply": false,
      "answered": false,
      "summary": "vopping's GitHub repo is live and Sprint 1 is implemented.",
      "body": "Public repo created (github.com/NotASpaceLizard/vopping, kept separate from vacking per your instruction), Sprint 1 (S1-S6 + S12) implemented and self-verified by Developer in a real browser (34/34 assertions, 390px viewport, zero console errors) — including the trickiest case, non-contiguous bulk-undo. Tester's formal pass is running now."
    },
    {
      "id": "m3",
      "time": "2026-09-04T15:18:21Z",
      "needsReply": false,
      "answered": false,
      "summary": "Optional: a reusable test-runner skill needs YOU specifically to type a command.",
      "body": "Developer wanted to package their working Playwright test driver into a proper reusable skill via /run-skill-generator, but that command only accepts direct human entry — no agent (including me) can invoke it for you. Nothing is blocked without it — Tester can use the driver script as-is — but if you want the packaged version, type /run-skill-generator yourself pointing at c:\\tmp\\pw-test\\vopping-selfcheck.js. Entirely optional, no rush."
    },
    {
      "id": "m4",
      "time": "2026-09-04T01:00:00Z",
      "needsReply": true,
      "answered": false,
      "summary": "Row-density pick still needed: try density-picker.html and tell me A/B/C/D or a mix.",
      "body": "Live at https://notaspacelizard.github.io/vopping/density-picker.html — tap through the 4 options on your phone, tell me which one (or a mix) in chat."
    }
  ],
  "agents": {
    "orchestrator": {
      "role": "Orchestrator",
      "status": "Working",
      "task": "Relayed first draft backlog and 3 open questions to PO. Dispatched Developer sanity-check + Tester testability-check on Sprint 1 (S1-S6), stood up QA for its first full sweep."
    },
    "scrumMaster": {
      "role": "Scrum Master",
      "status": "Standing by",
      "task": "S3/S6/S12 flipped Done (cited to REGRESSION_LOG.md). S4 held at Locked pending a small bugfix. S1/S2/S5 held pending density pick. Standing by."
    },
    "developer": {
      "role": "Developer",
      "status": "Standing by",
      "task": "S4 bug fixed (marker-strip regex widened), self-verified 37/37 live-browser, zero console errors. Standing by."
    },
    "tester": {
      "role": "Tester",
      "status": "Working",
      "task": "Re-verifying TC4.3 against Developer's S4 fix."
    },
    "qa": {
      "role": "QA",
      "status": "Standing by",
      "task": "First sweep done: 6 Real findings (R1 corrupted-storage handling, R2 delete+undo data-loss tension, R3 missing bulk-clear/new-trip action, R4 density-picker under-represents the real row, R5 paste bullet/number prefixes, R6 aisle normalization) + 6 Minor + 4 Nitpick, all logged to QA_FINDINGS.md. Routed for resolution."
    }
  },
  "events": [
    { "time": "2026-09-04T15:21:53Z", "who": "Orchestrator", "text": "Added a Messages tab to this console per PO's request (curated PO-facing notes instead of the raw activity feed; PO explicitly wants to stop \"drinking from the firehose\" of relayed agent messages in chat). Confirmed the console can't accept replies — no server behind this static page — so genuine questions still need a chat reply, but routine FYI updates move here instead. Migrated the old pendingQuestion box to compute live from unanswered messages." },
    { "time": "2026-09-04T15:18:21Z", "who": "Orchestrator", "text": "Created public GitHub repo NotASpaceLizard/vopping (personal account, mirroring vacking's public+Pages setup, kept as a separate repo per PO's explicit instruction), pushed initial commit, enabled GitHub Pages (branch main, root). density-picker.html now live at https://notaspacelizard.github.io/vopping/density-picker.html for the PO to try on their phone." },
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
