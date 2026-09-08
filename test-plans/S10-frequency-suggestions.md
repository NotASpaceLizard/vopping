# Test Plan — S10: "What am I missing?" frequency suggestions

**STATUS: FORMAL PASS IN PROGRESS — test cases drafted 2026-09-08 against locked AC; Developer is
independently re-verifying their Sprint-2 implementation right now, execution against the live app
is pending that re-verification landing (or Orchestrator sign-off to proceed against the current
build as-is).** Derived from BACKLOG.md's locked AC plus `test-plans/README.md`'s "Known
implementation details (Sprint 2)" section only — no `script.js` read yet. Hard dependency on S1
and S4 (both Done, both fully testable already) — no forward-reference gap on that side.

**Story:** As a user, I want the app to suggest items I've frequently added in the past but
haven't added to my current list yet, so that I don't forget staples while shopping.

**Acceptance criteria (condensed from BACKLOG.md, locked):** a separate, persistent localStorage
record — independent of the live list's own contents — tracks a count per distinct item name
(matched case-insensitively/trimmed), incremented by 1 every time that name is added: once for a
single S1 add, once per line for an S4 paste-ingest batch; deleting an item (S3) does NOT decrement
its historical count; a "What am I missing?" affordance shows suggestion chips for names whose
historical count is >= a threshold (default 2, an easily-tunable constant, non-blocking) AND that
are not currently present anywhere in the live list (same case-insensitive/trimmed match);
suggestions sorted by descending historical count; tapping a suggestion adds it via the same
mechanic as S1's single add (appends to end, covered by S6 undo, increments its own historical
count again — no special-case); no dismiss/snooze mechanic (explicitly out of scope); this story's
usefulness depends on S12 (Done) actually letting items leave the live list between trips; **same
defensive load-time guard as S1 (QA finding R1)** applies to this story's own separate
frequency-counter record — a parse failure or wrong-shape parsed value falls back to an empty
counter, never throws. **Known implementation detail (Developer, README):** both S1's single-add
and S4's paste-ingest funnel through one shared `pushNewItem()`-style helper where the counter
actually increments, using one normalization helper (`trim().toLowerCase()`) consistently as BOTH
the counter key AND the on-list-presence comparison. **S12's own row (Done) carries a deferred
forward-reference** — "clearing does NOT change any cleared item's historical count, in either
direction" — not independently verifiable until this story shipped; this pass closes that out
(TC10.5).

**Deliverable under test:** `index.html`/`script.js`/`style.css`, opened via `file://` URL.
Developer reports this implemented as of 2026-09-04; not yet independently verified by Tester —
this is that verification pass.

**Tooling:** Playwright (`playwright-core` 1.62.1), `channel: 'chrome'`.

## Testability review summary (for scrum-master)

Re-reviewed 2026-09-08. No open items — every clause in this AC is concretely observable (a count
is a number, a threshold comparison is deterministic, presence-on-list is a boolean). One
cross-file closure worth flagging explicitly: TC10.5 below is the actual verification point for
S12's own deferred hedge ("clearing does NOT change historical count") — once this pass runs,
S12-clear-checked-items.md's Story-row note ("deferred, tracked here, to be closed out at S10's own
formal pass") should be updated to point at this test case's result rather than left open.

## Test cases
| ID | Covers AC | Steps | Expected |
|----|-----------|-------|----------|
| TC10.1 | Single-add increments count | Add "Milk" via S1's single-add | Historical count for "milk" (normalized) == 1 |
| TC10.2 | Paste-ingest increments per line | Paste 3 new item lines via S4 | Each of the 3 gets its own historical count incremented by 1 |
| TC10.3 | Shared counter across both add paths | Add "Milk" via single-add, then add "milk" via paste | Counter for normalized key "milk" == 2, one entry, not two separate 1-each entries |
| TC10.4 | Delete does not decrement | Add "Milk" twice (count=2), delete one "Milk" row | Historical count for "milk" remains 2 after the delete |
| TC10.5 | S12 bulk-clear does not change count (closes S12's deferred hedge) | Add "Milk" twice (count=2), cross it off, bulk-clear crossed-off items via S12 | Historical count for "milk" remains 2, unchanged, after the clear |
| TC10.6 | Threshold gating | Add "Oats" once (count=1), check suggestions; add "Oats" again (count=2), check suggestions | Not suggested at count=1; suggested at count=2 (default threshold) |
| TC10.7 | Suppressed while present on the list | "Oats" has count>=2 AND is currently on the live list (even if crossed off) | "Oats" is NOT offered as a suggestion while present |
| TC10.8 | Reappears once removed from the list | Remove "Oats" from the live list entirely (delete, or S12-clear while crossed off) while its count still >= threshold | "Oats" now appears as a suggestion |
| TC10.9 | Sorted by descending count | Multiple eligible suggestions with different counts | Rendered chip order is highest count first |
| TC10.10 | Tap-to-add mechanic | Tap a suggestion chip | Item appended to end of live list; Undo (S6) reverses it; its own historical count increments again (now +1 further) |
| TC10.11 | No dismiss/snooze control | Inspect a suggestion chip's controls | No dismiss/snooze affordance present (correctly out of scope, not a gap) |
| TC10.12 | Defensive load-time guard, 5 malformed values | Set the frequency-counter's storage key to literal `"null"`, a raw array, an object in an unexpected shape, non-JSON garbage, and a valid-JSON-but-wrong-type value; reload each | No throw, no console/page error; falls back to an empty counter each time |
| TC10.13 | Case-insensitive/trimmed matching, both counter key and presence check | Item "MILK " (trailing space, different case) present on the live list; historical count for "milk" >= threshold | "milk" is NOT suggested — the on-list-presence check catches the case/space-insensitive match |

## Results
| Test Case | Actual | Pass/Fail |
|-----------|--------|-----------|
| TC10.1 | *pending execution* | |
| TC10.2 | *pending execution* | |
| TC10.3 | *pending execution* | |
| TC10.4 | *pending execution* | |
| TC10.5 | *pending execution* | |
| TC10.6 | *pending execution* | |
| TC10.7 | *pending execution* | |
| TC10.8 | *pending execution* | |
| TC10.9 | *pending execution* | |
| TC10.10 | *pending execution* | |
| TC10.11 | *pending execution* | |
| TC10.12 | *pending execution* | |
| TC10.13 | *pending execution* | |

**Overall verdict:** PENDING — not yet executed. Planned as part of the same combined Sprint 2
formal-pass script as S7/S8/S9 (`vopping-tests-tester-s7-s10-formal.js`).

## Commands run and output
Not yet run.
