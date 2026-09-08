# Test Plan — S10: "What am I missing?" frequency suggestions

**STATUS: DONE — formally executed 2026-09-08, PASS (154/154 combined run: 74 Sprint-1 regression
re-confirmed + 80 new S7-S10 checks), zero defects.** Citation of record:
`c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full canonical transcript archived in
`S7-notes.md`'s Commands section, cross-referenced here rather than duplicated.

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
| TC10.1 | Single-add "Milk": `{"milk":{"count":1,"display":"Milk"}}` | Pass |
| TC10.2 | Paste "Oats"/"Honey": each own entry, count 1 | Pass |
| TC10.3 | "Milk" (single-add) then "milk" (paste): one entry, count=2 | Pass |
| TC10.4 | Deleting a "Milk" row leaves count at 2, unchanged | Pass |
| TC10.5 | **Closes S12's deferred hedge.** Before/after compared directly across an S12 bulk clear-crossed-off: `before=3 after=3` — unchanged | Pass |
| TC10.6 | count=1 not suggested; count=2 (threshold) suggested once off the list | Pass (2/2 sub-checks) |
| TC10.7 | Suggestion suppressed once back on the live list, and still suppressed while crossed off (still "present") | Pass (2/2 sub-checks) |
| TC10.8 | Suggestion reappears once fully removed from the live list (via the same S12 clear as TC10.5) | Pass |
| TC10.9 | Descending order confirmed with two real unequal-then-equal counts (`oats.count=3`, `cereal.count=3`, both above a lower-count baseline) | Pass |
| TC10.10 | Chip tap appends to end, is undo-eligible, and increments its own count again (`before=3 after=4`) | Pass (3/3 sub-checks) |
| TC10.11 | A suggestion chip has zero child elements (no dismiss/snooze control) | Pass |
| TC10.12 | 5/5 malformed frequency-storage values (`null`, raw array, non-object JSON, invalid JSON, malformed entry) — zero throws | Pass (5/5 sub-checks) |
| TC10.13 | "CEREAL " (case+space-different) on the live list correctly suppresses the "Cereal" suggestion | Pass |

**Overall verdict: PASS, 0 defects in S10.** Part of the combined 154/154 run — see
`REGRESSION_LOG.md`'s 2026-09-08 row (current canonical figure). This pass also closes
`S12-clear-checked-items.md`'s deferred forward-reference (TC10.5) — see that file's own updated
note.

## Commands run and output
Script: `c:\tmp\pw-test\vopping-tests-tester-s7-s10-formal.js`. Full raw transcript (Sprint-1
regression + all of S7-S10) archived in `S7-notes.md`'s Commands section. S10-specific lines
(verbatim, in execution order):
```
PASS - TC10.1 single-add increments the historical count :: {"milk":{"count":1,"display":"Milk"}}
PASS - TC10.2 paste-ingest increments each pasted line's own count :: {"milk":{"count":1,"display":"Milk"},"oats":{"count":1,"display":"Oats"},"honey":{"count":1,"display":"Honey"}}
PASS - TC10.3 single-add and paste-ingest share the SAME normalized counter entry :: {"count":2,"display":"Milk"}
PASS - TC10.4 deleting an item does NOT decrement its historical count :: {"count":2,"display":"Milk"}
PASS - TC10.6a item with count=1 is NOT suggested yet :: []
PASS - TC10.6b item with count=2 (threshold) IS now suggested once off the list :: ["Cereal"]
PASS - TC10.7 suggestion suppressed once the item is back on the live list :: []
PASS - TC10.7b still suppressed while crossed off but still present on the list :: []
PASS - TC10.5 S12 bulk clear-crossed-off does NOT change historical count (closes S12's deferred hedge) :: before=3 after=3
PASS - TC10.8 suggestion reappears once the item is fully removed from the live list :: ["Cereal"]
PASS - TC10.9 suggestions are sorted by descending historical count :: oats.count=3 cereal.count=3 order=["Oats","Cereal"]
PASS - TC10.10a tapping a suggestion chip appends the item to the live list
PASS - TC10.10b tapping a suggestion chip is undo-eligible (S6)
PASS - TC10.10c tapping a suggestion chip increments its own historical count again :: before=3 after=4
PASS - TC10.11 a suggestion chip has no dismiss/snooze control (out of scope, correctly absent) :: children=0
PASS - TC10.13 case/whitespace-insensitive presence match suppresses the suggestion ("CEREAL " suppresses "Cereal") :: ["Oats"]
PASS - TC10.12 corrupted frequency storage (literal "null") does not throw
PASS - TC10.12 corrupted frequency storage (raw top-level array) does not throw
PASS - TC10.12 corrupted frequency storage (valid JSON but not an object) does not throw
PASS - TC10.12 corrupted frequency storage (not JSON at all) does not throw
PASS - TC10.12 corrupted frequency storage (object shape ok but an entry has a malformed count) does not throw
```
