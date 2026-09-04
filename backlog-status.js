// Plain global-variable assignment, same file:// constraint as status.js —
// the Orchestrator hand-maintains this from BACKLOG.md's real state whenever
// priority or story status actually changes. Empty until Scrum Master's first
// draft backlog lands.
window.BACKLOG_STATUS = {
  "updatedAt": "2026-09-04T00:15:00Z",
  "stories": [
    {
      "divider": true,
      "label": "Sprint 1 — core mutable-list loop (dependency order)"
    },
    { "rank": 1, "id": "S1", "title": "Render list, add single item, localStorage persistence (foundation)", "status": "In Review — formal pass clean (67/67), held pending PO's density-picker pick (tracked gate)" },
    { "rank": 2, "id": "S2", "title": "Check/uncheck an item", "status": "In Review — formal pass clean (67/67), held pending PO's density-picker pick (tracked gate)" },
    { "rank": 3, "id": "S3", "title": "Delete an item (distinct from check)", "status": "Done — 67/67 formal pass clean" },
    { "rank": 4, "id": "S4", "title": "Paste-to-ingest bulk add (newline-split, verbatim)", "status": "Locked — 1 minor bug (marker-only paste lines) being fixed before Done, per Scrum Master" },
    { "rank": 5, "id": "S5", "title": "Up/down reorder buttons", "status": "In Review — formal pass clean (67/67), held pending PO's density-picker pick (tracked gate)" },
    { "rank": 6, "id": "S6", "title": "Single-last-action undo (depends on S1-S5's mutation types)", "status": "Done — 67/67 formal pass clean" },
    {
      "divider": true,
      "label": "Sprint 2 — enrichment"
    },
    { "rank": 7, "id": "S7", "title": "Text notes per item", "status": "Not Started" },
    { "rank": 8, "id": "S8", "title": "Aisle designation (suggested groupings + free text)", "status": "Not Started" },
    { "rank": 9, "id": "S9", "title": "Sort view (manual / alphabetical / aisle) — view-only, never rewrites stored order", "status": "Not Started" },
    { "rank": 10, "id": "S10", "title": "\"What am I missing?\" frequency suggestions", "status": "Not Started" },
    { "rank": 12, "id": "S12", "title": "Clear all checked items (new-trip reset)", "status": "Done — 67/67 formal pass clean" },
    {
      "divider": true,
      "label": "Parked — future stretch, not sequenced"
    },
    { "rank": 11, "id": "S11", "title": "Recipe-paste alternate ingest mode", "status": "Parked — no AC drafted, PO explicitly deferred" }
  ]
};
