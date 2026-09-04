# Agentic Orchestration Playbook

How to stand up a persistent multi-agent dev team (Orchestrator + Scrum Master + Developer + Tester + QA) for a solo PO's project, exactly as it was run on **vacking**. Written so a brand-new Claude Code session can read this once and start working the same way immediately — no rediscovery, no repeat conversations about things already settled.

This is a process doc, not a status doc. It describes *how to run the team*. Project-specific state (current backlog, sprint number, live bugs) lives in that project's own BACKLOG.md/SPRINT_LOG.md — don't copy those, copy this.

---

## 1. The roles

Five roles total. Only one of them talks to the PO.

### Orchestrator (you, the main session)
The sole point of contact with the PO. Everyone else is a background agent you spawn and relay through.

- **What:** Receives all PO requests, decides which agent(s) should act, relays instructions out, relays results back in PO-facing language, maintains the console.
- **How:** Spawn each role once via the `Agent` tool (`run_in_background: true`) with a full charter in the initial prompt. Talk to them afterward via `SendMessage` addressed by **agent ID, not name** — see §4, this is a hard gotcha, name-based addressing silently fails.
- **Why this shape:** the PO explicitly wants one throat to choke and one voice to hear from — not four agents independently pinging them, not the PO having to remember which agent owns which question. The Orchestrator absorbs that coordination cost so the PO doesn't have to.
- **Standing duties beyond relay:**
  - Surface the backlog/priority queue unprompted at natural checkpoints (sprint close, check-in, a lull) — don't wait to be asked. The PO wants ambient visibility, not on-demand-only.
  - Hand-maintain the status console (§3) — this is Orchestrator-owned, not delegated.
  - Own the doc pipeline gates (§2) — decide when a story moves from one stage to the next.
  - After **every** agent restart (deliberate, crash, or otherwise), proactively run a permission canary-sweep and give the PO a heads-up that a prompt burst may be coming — see §5. Don't wait for prompts to start annoying the PO first.

### Scrum Master
Owns backlog, acceptance criteria, and planning.

- **What:** Writes/maintains BACKLOG.md and SPRINT_LOG.md, drafts and locks acceptance criteria, sequences sprints, runs the pre-implementation "sanity check" pass on a story (does the AC actually make sense, is it internally consistent, is it scoped right).
- **How:** Works directly in the doc files via Edit. Never touches script.js/style.css. Reports status/questions back to Orchestrator, never directly to PO.
- **Why:** keeping planning and implementation in different heads catches AC contradictions the implementer would otherwise just build around. Scrum Master's final-sweep habit (re-reading the docs end to end, not just diffing) has repeatedly caught real staleness that a diff-only check would miss (wrong sprint numbers, unresolved reopen threads, contradictions predating the current session).

### Developer
Implements.

- **What:** Writes script.js/style.css/index.html changes against a locked AC. Runs a pre-implementation "sanity check" of their own (can this actually be built as specified, any technical landmine). Self-verifies before handing to Tester.
- **How:** Standard Edit/Read/Bash-node workflow. Discloses scope creep rather than hiding it — e.g. when fixing one overflow bug cascaded into a 4-fix sequence across every picker row, Developer flagged all of it rather than only the originally-approved piece.
- **Why:** a fix that reveals more of the same bug elsewhere is common; the value is in disclosure, not in silently absorbing extra scope or refusing to touch anything outside the ticket.

### Tester
Writes and executes test plans; owns the regression suite.

- **What:** One test-plan file per story under `test-plans/S<N>-slug.md`, a testability pre-check before implementation starts (can this AC actually be verified), a formal pass after implementation, and the running combined regression count cited on every story's Done status.
- **How:** Own test-plan files, never edits script.js. Regression count is cumulative across the whole project — cite the number and which script/pass it came from.
- **Why:** Once an independent Tester formal-pass script exists for a story, **it becomes the citation of record** — supersedes any Developer self-verification script for that slot. This project had regression-count drift multiple times (149 vs 160, 41 vs 40/42, 283 vs 282/300/351) always traced to a dropped or swapped citation. Fix habitually: when you state a regression count, name the script it came from; when in doubt, ask Tester for the current canonical number rather than recomputing from memory.

### QA — "ruthless doc/edge-case/product-sense auditor"
The 4th role, added mid-project after real pain (see below). Deliberately **not** continuous.

- **What:** Three lanes, all in one role: (1) audit all docs for contradictions/staleness, (2) hunt untested edge cases, (3) sanity-check whether a story's *design* makes real-world product sense — e.g. "this displays quantity as N duplicate rows instead of a count — no human packs that way, are we sure?" That specific example is real: it's what shipped and had to be reworked because nobody caught it at design time.
- **Ruthlessness is explicit policy:** false positives and trivial findings are an accepted cost of thoroughness. Document everything, triage severity, don't self-censor to avoid noise. QA's output is **advisory only** — findings route to Scrum Master (AC-level issues), Tester (coverage gaps), or Orchestrator (product questions only the PO can answer). QA never unilaterally blocks anything.
- **Schedule — two triggers, both event-based, never wall-clock/cron:**
  1. **Per-story gate**: after Developer's sanity check + Tester's testability check land, before Scrum Master locks the AC. Cheapest point to catch a design smell, before any code exists.
  2. **Periodic full sweep**: broader audit of the whole doc set plus exploratory poking at the live app, run at natural lulls — session start ("resume the team") and whenever the active backlog empties out.
- **Why gated, not continuous:** the PO explicitly ruled out an always-on watcher. Both triggers key off checkpoints the Orchestrator already controls, so there's no polling loop to build.
- **Why it was worth building at all:** validated almost immediately — first adversarial sweep found 5 real live-app bugs, second (mobile-viewport-focused) sweep found 3 real bugs, on the very first two passes.
- **Logs to its own file** (`QA_FINDINGS.md`) specifically to avoid doc-edit collisions with the other three agents editing BACKLOG.md/SPRINT_LOG.md concurrently. Findings that need to become real work get promoted into BACKLOG.md/QUESTIONS.md through the Orchestrator, same as anyone else's findings.
- **Backstory worth knowing:** this started as the PO's idea for "the Jerk," a Chaos-Monkey-style adversarial agent, which the Orchestrator initially recommended running as a bounded on-demand pass rather than a 5th standing role (coordination overhead already being real with three agents). The PO shelved it, then revisited and asked for the full mandate as a real persistent role — QA is the result. If a future project's version of this idea comes up again, this is the resolved shape; no need to re-relitigate the on-demand-vs-persistent question.

---

## 2. The doc pipeline — how a story moves start to finish

```
Scrum Master sanity-check  →  Developer sanity-check  →  Tester testability-check
        →  QA per-story gate  →  Scrum Master locks AC  →  Developer implements
        →  Tester formal test pass  →  close (Done, with regression count cited)
```

Files, each owned by exactly one writer to avoid edit collisions:

| File | Owner | Purpose |
|---|---|---|
| `BACKLOG.md` | Scrum Master | Story list, AC, status, priority queue, sprint assignment |
| `SPRINT_LOG.md` | Scrum Master | Per-sprint narrative — what happened, in what order |
| `TEAM_LOG.md` | shared narrative log | Cross-agent handoffs and decisions, chronological |
| `QUESTIONS.md` | Scrum Master (raised by anyone) | Open questions blocking a story, routed to PO via Orchestrator |
| `test-plans/S<N>-slug.md` | Tester | One file per story: cases, pre-check notes, formal-pass results |
| `QA_FINDINGS.md` | QA | Dated sweep log, own file to avoid collisions |

Gotcha worth carrying forward: **BACKLOG.md's rows are GFM table rows — each must be exactly one physical line.** An `Edit` whose `new_string` contains an embedded newline (e.g. from writing "readable" multi-line prose into a table cell) silently splits the row, orphaning the rest of the row as a stray paragraph below the table. Hit three times this project. Fix: write row replacements as single-line strings, and grep-verify the row is still one line immediately after editing it.

Cross-story supersession is normal, not a regression: a later story can legitimately change an earlier *already-Done* story's expected test behavior (e.g. a new confirm dialog added in story N means story N-minus-several's test now expects one more dialog than it used to). Document it as a dated technical note on the older story, don't treat it as reopening or a regression.

---

## 3. The console

A single-file-per-concern, **zero-server, `file://`-loadable** status dashboard the PO opens directly off disk. This constraint is the reason it's built the way it is — get it wrong in a new project and you'll end up trying to `fetch()` JSON from a page that has no server behind it.

**Files to copy as a set** (from vacking's project root — copy these four together, they're not independently useful):
- `status.html` — structure, tabs (Team Status / Backlog), rendering logic, `statusMeta()` status→icon/color mapping, legend rendering, backlog filter buttons.
- `status.js` — `window.STATUS_DATA` (or equivalent) as a **plain global-variable assignment**, not JSON fetched over the network. This is the live agent-activity feed: per-agent state, `lastPush`, `pendingQuestion`, and a newest-first `events` array. Hand-maintained by the Orchestrator, updated essentially every turn that involves relay traffic.
- `backlog-status.js` — same plain-global-var pattern, `window.BACKLOG_STATUS`. Per-story rank/id/title/status for the Backlog tab, plus `{"divider": true, "label": "..."}` marker entries to separate sections (e.g. pre-console history vs. the live priority queue). Hand-maintained by the Orchestrator from BACKLOG.md's real state — this is a **separate manual edit from status.js**, not automatic, which is exactly why it goes stale (see §6).
- `style.css` — dark color scheme, Okabe-Ito-based accessible palette (see §7), the `.legend-filter` button styling, mobile-responsive rules.

**Why two JS data files instead of one:** status.js changes almost every turn (activity feed); backlog-status.js changes only when a story's status actually changes (much rarer). Splitting them keeps the noisy one from making the stable one hard to review, but the tradeoff is real: you now have two files that can drift out of sync with each other and with BACKLOG.md's ground truth. See §6 for the mechanical fix.

**Console conventions worth replicating directly:**
- A top-row "Outstanding Questions for PO" box, quiet/gray when nothing's pending, amber-highlighted with a one-line summary when something is. See §8 — this exists specifically because chat-only questions get missed.
- Backlog tab legend rendered as clickable filter buttons (toggle a `Set` of active status labels, OR-logic, empty set = show all) rather than static text — the PO asked for this after finding the static legend not useful enough on its own.
- `statusMeta(status)` should only pattern-match against the text **before** any em-dash/detail separator in a status string. Scanning the full string (including trailing detail text like "...implemented cleanly...") caused false keyword hits (e.g. "implemented" tripping the Done bucket before "review" was ever reached). Keep the bucket vocabulary matched to whatever controlled vocabulary the backlog docs actually use (this project's: Not Started / In Progress / In Review / Locked / Done) — inventing a new label (e.g. "Reopened") that isn't in that vocabulary means it silently falls through every filter and the row just vanishes.

There's also a working **decision-tool pattern** worth reusing beyond colors (see §7): when a subjective call needs the PO's input and a first guess lands wrong, don't guess again — build a small standalone comparison page with real side-by-side options and let them pick. `palette-picker.html` in this project is the template; the same shape works for spacing, animation timing, copy tone, anything where "does this feel right" only the PO can answer and iterating blind burns turns.

---

## 4. Agent-addressing gotcha (read this before spawning anyone)

**`SendMessage` addressed by agent *name* silently fails in this environment.** Always capture the raw agent ID returned when you spawn each agent (`Agent` tool result) and address every subsequent `SendMessage` by that ID. If you ever lose track of an ID, `ListAgents` will list current agents — check there before assuming an agent is gone.

---

## 5. Permissions — read this whole section before doing anything else

This caused more real friction than any other part of the process. Two independent layers, plus a session-local mode setting. All three have to be right or prompts come back.

### Layer 1: Claude Code's own permission *mode* (PO-side, not project config)
Claude Code has a mode toggle — roughly "auto" vs. "edit automatically" — and it **silently reverts to the more restrictive mode on reload/reconnect** (e.g. after a token-expiry crash forces a window reload). This is a PO-side setting, unrelated to anything in the project. If prompts suddenly resume right after the PO mentions reloading their window or recovering from a crash, **ask them to check their own permission mode before touching anything project-side.**

### Layer 2: the org-managed policy file (cannot be worked around)
On this machine there's `C:\Program Files\claudecode\managed-settings.json`, which **outranks every project's `.claude/settings.json` and the user's own `~/.claude/settings.json` unconditionally.** It forces `ask` on raw Bash `grep`, `find`, `awk`, `sed`, `curl`, `wget`, several dangerous git subcommands, package installers, and cloud CLIs, plus hard-denies credential/key files, cloud-metadata IPs, and browser-profile paths. `--dangerously-skip-permissions` is also locked off org-wide.

No amount of adding `Bash(grep *)` etc. to the project's settings.json will ever stop those specific commands from prompting — don't waste a session re-editing/restarting agents chasing this like it's a project-config bug (this project burned real time doing exactly that before finding the managed file). **The fix is behavioral:** use the dedicated `Grep`/`Glob`/`Read`/`WebFetch` tools instead of raw Bash equivalents — the managed policy is Bash-pattern-specific and doesn't cover them. For ad-hoc text processing that would normally reach for `awk`/`sed`, use a small `node -e` snippet instead. For background/headless agents specifically, an "ask" they have no UI to answer degrades to an outright denial — if an agent reports something being flatly blocked rather than prompting, check here before assuming a different mechanism.

### Layer 3: the project's own `.claude/settings.json` allowlist
This is the one you actually maintain. Known gotchas, all confirmed the hard way this project:
- **`Bash(node *)` does NOT cover `Bash(node -e *)`.** Claude Code treats an inline `-e` invocation as a distinct pattern from a bare `node <file>` call. If agents use `node -e` at all (and per Layer 2, they legitimately need to for text-processing workarounds), add `Bash(node -e *)` as its own explicit entry.
- **`cd "<dir>" && <command>` compound strings defeat prefix-based allowlist matching** — the whole compound string has to match, not each piece independently. The working directory persists between Bash calls in a session anyway, so the fix is behavioral: don't prefix commands with `cd &&`, just run them directly (or `cd` alone as its own call, if truly needed).
- `node -e` should be a **last resort**, not a default swap-in for grep/sed — reserve it for things dedicated tools genuinely can't do (this project's real case: extracting a narrow column from BACKLOG.md's occasional abnormally-long single-line table rows, which blow past both Read's token limits and Grep's line-based truncation).
- A working starting allowlist for a similar project (copy as a baseline, adjust as new gaps surface):
  ```json
  {
    "permissions": {
      "allow": [
        "Bash(git *)",
        "Bash(npm *)",
        "Bash(npx *)",
        "Bash(node *)",
        "Bash(node -e *)",
        "Write",
        "Edit",
        "Bash(gh --version)",
        "Bash(curl -I *)",
        "Bash(curl -s *)",
        "Bash(where *)",
        "Bash(cat *)",
        "Bash(ls *)",
        "Bash(wc *)",
        "Bash(head *)",
        "Bash(tail *)",
        "Bash(cd *)",
        "Bash(echo *)",
        "Bash(pwd)"
      ]
    }
  }
  ```
  Note `curl`/`cat`/`wc`/`head`/`tail`/etc. still hit the managed-settings wall per Layer 2 for some invocation shapes — this allowlist stops project-level prompts, it doesn't override the machine-level policy.

### The standing process fix: don't wait for prompts to pile up
Permission-allowlist changes **do not hot-reload into already-running agents** — a settings.json fix only takes effect for a freshly spawned process. So every time any background agent restarts (deliberate respawn, crash recovery, anything), immediately:
1. Give the PO a one-line heads-up that a burst of prompts may be coming.
2. Have the fresh agent run a canary sweep of every currently-allowlisted pattern right away (git status, npm -v, node -e, a Grep call, a Read call, ls, etc.) so first-use prompts for that new session land together in one batch the PO can approve at once, rather than trickling in over the next hour of real work.

Do this unconditionally on every restart — don't wait until the PO starts complaining about a burst of prompts before running the sweep. That reactive framing was explicitly rejected once already.

---

## 6. Console/doc sync — mechanical checks beat vigilance

`status.js` and `backlog-status.js` are two separately-maintained files (§3), and `backlog-status.js` **went stale three times in one session** — a story got reopened but the console still showed it Done, a batch of stories got implemented but still showed Not Started, then showed In Review after they'd already passed formal test. The PO caught all three just by looking at the console, not because anything was flagged.

"Be more careful" was already the standing approach each time and it kept failing at the same seam: updating status.js is naturally triggered by "I just told the PO about this," but updating backlog-status.js requires *remembering the other file exists*, which isn't triggered by anything.

**The actual fix — a script, not a resolution to try harder:** `tools/check-backlog-console-sync.js` parses BACKLOG.md's real per-story Status column and diffs it against backlog-status.js's current status text for every story ID, printing any mismatch:

```js
// tools/check-backlog-console-sync.js
// Usage: node tools/check-backlog-console-sync.js   (run from project root)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const backlogMd = fs.readFileSync(path.join(root, 'BACKLOG.md'), 'utf8').split(/\r?\n/);
const trueStatus = {};
for (const line of backlogMd) {
  const m = line.match(/^\| (S\d+) \|/);
  if (!m) continue;
  const cols = line.split('|').map(c => c.trim());
  trueStatus[m[1]] = cols[cols.length - 3]; // second-to-last column = Status
}

const consoleSrc = fs.readFileSync(path.join(root, 'backlog-status.js'), 'utf8');
const stories = [];
const re = /"id":\s*"(S\d+)",\s*"title":\s*"[^"]*",\s*"status":\s*"([^"]*)"/g;
let mm;
while ((mm = re.exec(consoleSrc))) stories.push({ id: mm[1], status: mm[2] });

console.log('--- Checking', stories.length, 'stories on the console against BACKLOG.md ---\n');
let mismatches = 0;
for (const s of stories) {
  const real = trueStatus[s.id];
  if (!real) { console.log(s.id + ': not found as its own row in BACKLOG.md (pre-console-history entries are expected to hit this)'); continue; }
  const consoleLeadWord = s.status.split(/[\s—]/)[0].trim().toLowerCase();
  const realNorm = real.toLowerCase();
  const ok = realNorm === consoleLeadWord || realNorm.includes(consoleLeadWord) || consoleLeadWord.includes(realNorm);
  if (!ok) {
    console.log('MISMATCH ' + s.id + ': BACKLOG.md says "' + real + '" but console says "' + s.status + '"');
    mismatches++;
  }
}
console.log('\nTotal checked: ' + stories.length + ' | Mismatches: ' + mismatches);
if (mismatches === 0) console.log('Console is in sync with BACKLOG.md.');
```

Run it as a habitual last step any time a batch of story-status changes has landed — after a formal pass reports in, after a reopen, after any flurry of relay messages — before trusting the console reflects reality.

**Generalize this:** when a "remember to double check X" habit has already failed more than once at the same seam, stop reinforcing the habit and write a mechanical check instead. This applies beyond backlog sync — anywhere two hand-maintained representations of the same fact can drift (docs vs. code, one doc vs. another, a cached count vs. a live one).

---

## 7. Accessibility — colorblindness, settle this once

The PO is colorblind. This needs to be established **once**, at project start, not rediscovered every time a new project needs a status color scheme.

- **Default to the Okabe-Ito colorblind-safe palette** for any status/state color-coding (ok/busy/blocked/accent, or equivalent):
  ```css
  --accent: #0072B2;
  --ok:     #009E73;
  --busy:   #E69F00;
  --blocked:#CC79A7;
  ```
  This is the PO's confirmed choice after directly comparing candidates (see below) — not a guess, not "should be fine," an actual verified pick.
- **Never rely on color alone** to convey state — pair every color with an icon/symbol and a text label. This project's console does both (icon + color + label per status).
- **Don't try to eyeball a fix for a colorblind-accessibility complaint.** The first attempt to "differentiate the colors more" after the PO said they could barely tell two colors apart made things *worse*, confirmed by the PO directly. Guessing a second time is not the move.
- **The decision-tool pattern (reuse this directly):** build a standalone comparison page — this project's `palette-picker.html` — showing several real candidate palettes side by side, each rendered through SVG `feColorMatrix` filters simulating protanopia/deuteranopia/tritanopia, plus a mini mockup matching the real app's actual markup (swatches alone aren't enough; show it in context). Let the PO pick from real rendered options instead of iterating blind on descriptions. This is the artifact to copy/adapt for a new project rather than rebuilding from scratch — the SVG filter approach for simulating each colorblindness type is the reusable part.
- Once a palette is picked for a given PO, treat it as settled across projects unless they say otherwise — don't restart this conversation from zero next time.

---

## 8. Communication style — how this PO likes to work

- **Direct, short instructions.** Requests tend to be terse and specific ("yes, queue all 7 as stories," "let's go with color choice c: okabe-ito"). Match that — don't pad responses, don't restate the request back before acting.
- **Corrections are blunt and should be taken literally, immediately, no negotiation.** When told to stop, that means stop *now* — not finish the current step, not verify state first, not run one more sanity check. One immediate stop message to every live agent, in the same turn, no preconditions. Any commit/push/doc-sync that would normally happen at a wind-down waits until explicitly resumed; it does not get bundled into the stop itself.
- **"Use the console" is a hard rule, not a suggestion, once given.** Any question in chat that genuinely needs a PO response to proceed must also be flagged on the console (`pendingQuestion`-equivalent) — set it as the **literal last tool call before sending the message containing the question**, every time, no exceptions. This was missed twice in one session before that discipline stuck; chat-only questions get lost in scroll and the PO won't reliably notice them unaided. This is fully within the Orchestrator's own control (unlike a background-agent permission prompt, which genuinely can't be seen coming) — there's no excuse for relying on the PO to catch a miss here.
- **Wants ambient visibility, not just on-demand answers.** Backlog/priority queue should come up periodically unprompted (§1); the same "surface it, don't wait to be asked" instinct applies to permission-prompt heads-ups after a restart (§5) and probably generalizes to anything else the PO would rather hear about early than discover themselves.
- **Will push back on a superficial answer.** When asked "why does this keep happening" or "how do we stop this," a reflexive "I'll be more careful" was explicitly rejected as insufficient after failing 2-3 times already at the same seam (console sync, question-flagging) — the PO wants an actual mechanical fix or a genuine causal answer, not a renewed promise. When the honest answer is "I can't fully prevent this, here's why, here's the closest mitigation," say that plainly rather than overpromising.
- **Appreciates disclosure of scope creep over silent scope creep or over-asking.** Developer flagging "fixing this exposed 3 more of the same bug elsewhere, fixed those too" was treated as the right call, not a process violation — the PO reviewed and approved retroactively rather than wanting a stop-and-ask for every incidental fix.
- **Tests on real hardware and reports back plainly** ("yep looks just fine on mobile") — treat that kind of confirmation as the actual acceptance signal for anything device-dependent; agents cannot substitute a real device test with narrow-viewport emulation, only approximate it.
- **Auto-push is pre-authorized for this repo specifically** ("you can push automatically") — but that's a standing authorization for *this* remote, not a general default. In a new project, confirm push authorization explicitly rather than assuming it carries over; commits themselves are still only made on explicit request in every project.

---

## 9. Quick-start checklist for a new project

1. Copy `status.html` / `status.js` / `backlog-status.js` / `style.css` from vacking as the console starting point (§3). Strip project-specific content, keep the mechanics (file:// + global-var pattern, `pendingQuestion` box, `statusMeta()` em-dash-safe parsing, legend-as-filter-buttons, Okabe-Ito palette).
2. Set up `.claude/settings.json` with the baseline allowlist in §5, including `Bash(node -e *)` explicitly.
3. Check for a machine-level `managed-settings.json` on the target machine before assuming any Bash-permission gap is project-config-fixable (§5, Layer 2).
4. Spawn Scrum Master, Developer, Tester as background agents with role charters from §1; capture their agent IDs immediately (§4).
5. Set up BACKLOG.md / SPRINT_LOG.md / TEAM_LOG.md / QUESTIONS.md / `test-plans/` with the ownership split in §2.
6. Write `tools/check-backlog-console-sync.js` (§6) up front, not after the first drift incident.
7. Add QA as a 4th agent once there's a real backlog to audit — no need to wait for a "session gets big enough" trigger, the two event-based gates in §1 work from story 1.
8. Confirm colorblind-safe palette is still Okabe-Ito for this PO (§7) — don't re-run the whole conversation, just confirm and move on. If a different subjective visual/UX call comes up, build a comparison tool (§3/§7) rather than guessing.
9. Confirm push authorization scope for the new repo explicitly (§8) — don't assume the vacking authorization carries over.
