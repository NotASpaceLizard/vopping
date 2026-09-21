# Agentic Orchestration Playbook

How to stand up a persistent multi-agent dev team (Orchestrator + Scrum Master + Developer + Tester + QA) for a solo PO's project. First run on **vacking**, then re-run and refined on **vopping** — where the process is cited below, both projects are illustrative data points, not the point itself. Written so a brand-new Claude Code session can read this once and start working the same way immediately — no rediscovery, no repeat conversations about things already settled.

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
- **The Orchestrator owns exactly one file class and no more.** The console (§3) is the sole Orchestrator-owned artifact. Everything else — including one-off decision-tool mockups, HTML pickers, and any code or asset — goes through the Developer. Writing a decision-tool page yourself instead of delegating it is a real role-boundary breach, not a shortcut: caught on vopping ("you are my orchestrator, not my developer") when the Orchestrator hand-wrote the first density-picker draft. When you catch yourself about to Edit a non-console file, stop and route it.
- **Don't assert a status change you only *requested*.** "I asked the Scrum Master to flip S14/S16/S17 to Done" is not evidence the BACKLOG.md edit landed. On vopping the Orchestrator wrote "S14/S16/S17 Done (180/180)" into a commit message and the console after only having asked; the session moved on, the edit was never confirmed, and a fresh QA re-read next day found all three still "Locked" — the exact citation-drift class the whole project trained the *agents* to avoid. The Orchestrator is not exempt from its own rule. Before writing any doc-state claim into a commit message, console, or PO-facing summary, either (a) have the agent's explicit confirmation the edit landed, or (b) read the file yourself. See §6 — this is the same "two hand-maintained representations drift" seam, and the fix is the same: verify, don't trust intent.

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
- **For an unreproducible device-only bug, require a PROVEN mechanism before each push, not another hypothesis.** On vopping the iOS add-aisle picker bug took 4 rounds: rounds 1–3 shipped plausible guesses (grace window → commit-on-blur → sentinel guard) and round 3 failed on-device with zero progress because its theory was simply wrong. Round 4 worked because the Developer first *proved* the mechanism on desktop (an A/B on `document.activeElement` showed the `<select>` was being re-focused after every commit, and re-focusing a collapsed native `<select>` re-opens the picker on iOS). When a round comes back "same behavior," stop pattern-matching a new hypothesis — demand a desktop A/B or a structural proxy that proves the cause before the next blind push. Note too that the obvious fix for one direction of a render/commit-timing bug often re-creates the bug in the mirror direction (a synchronous commit-on-pointerdown would have rendered away the very select being tapped) — design the guard, don't just move the commit. And before funding any round at all, get the PO to pin down the *exact* symptom: on vopping, "only when adding a new aisle" vs. "after picking ANY aisle" flipped the entire diagnosis (sentinel-specific → core re-focus-on-commit), and an imprecise symptom guarantees a blind shot.

### Tester
Writes and executes test plans; owns the regression suite.

- **What:** One test-plan file per story under `test-plans/S<N>-slug.md`, a testability pre-check before implementation starts (can this AC actually be verified), a formal pass after implementation, and the running combined regression count cited on every story's Done status.
- **How:** Own test-plan files, never edits script.js. Regression count is cumulative across the whole project — cite the number and which script/pass it came from.
- **Why:** Once an independent Tester formal-pass script exists for a story, **it becomes the citation of record** — supersedes any Developer self-verification script for that slot. This project had regression-count drift multiple times (149 vs 160, 41 vs 40/42, 283 vs 282/300/351) always traced to a dropped or swapped citation. Fix habitually: when you state a regression count, name the script it came from; when in doubt, ask Tester for the current canonical number rather than recomputing from memory.
- **Assert the affordance the user actually reaches for, not just the one that's convenient to script.** On vopping, undo-after-delete "didn't work" for the PO while the suite ran a clean 294/294 — because the suite always clicked the header `#undo-btn` and never the toast's "Undo," which had been inert text with no handler since S3. The undo *logic* was fine; the *affordance* was dead, and a green suite hid it. For any action with multiple entry points (a primary/prominent one plus a fallback), the formal pass must exercise the primary one the user taps.
- **Hold the formal pass until the build the PO has confirmed on-device; don't re-run it against code that's still settling.** During the iOS picker iteration the combined pass got started-and-stopped ~4 times because each on-device result changed the code again — wasted compute, and (since the pass is desktop-structural) it couldn't even see the device bug, so a green pass while the phone was broken was actively misleading (the NB-6 gap, §2). Run the formal pass ONCE, on the device-confirmed final build. Exception: when a fix is desktop-verifiable (e.g. the undo-toast handler), running the pass in parallel with the PO's confirm is fine — the hold is specifically for blind device-only iteration.

### QA — "ruthless doc/edge-case/product-sense auditor"
The 4th background agent (the 5th role, counting the Orchestrator), added mid-project after real pain (see below). Deliberately **not** continuous.

- **What:** Three lanes, all in one role: (1) audit all docs for contradictions/staleness, (2) hunt untested edge cases, (3) sanity-check whether a story's *design* makes real-world product sense — e.g. "this displays quantity as N duplicate rows instead of a count — no human packs that way, are we sure?" That specific example is real: it's what shipped and had to be reworked because nobody caught it at design time.
- **Ruthlessness is explicit policy:** false positives and trivial findings are an accepted cost of thoroughness. Document everything, triage severity, don't self-censor to avoid noise. QA's output is **advisory only** — findings route to Scrum Master (AC-level issues), Tester (coverage gaps), or Orchestrator (product questions only the PO can answer). QA never unilaterally blocks anything.
- **At the per-story gate, gate the AC's *mechanism against the actual code*, not just prose coherence.** On vopping this caught a render-timing bug (R14) before a line was implemented: the aisle rework moved the editor onto a native `<select>` committing on `change`, and QA traced the real `editingField`/`commitEditor`/`focusout`/`render` sequence to find that the deferred focusout-commit would `render()` away an open native picker mid-interaction — the same failure seam as the shipped S13 stale-DOM bug, in a new form. Catching it pre-implementation is the whole payoff of gating against code rather than against the prose of the AC.
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

Files, each owned by exactly one writer to avoid edit collisions — with one deliberate exception, `TEAM_LOG.md` (see its row):

| File | Owner | Purpose |
|---|---|---|
| `BACKLOG.md` | Scrum Master | Story list, AC, status, priority queue, sprint assignment |
| `SPRINT_LOG.md` | Scrum Master | Per-sprint narrative — what happened, in what order |
| `TEAM_LOG.md` | shared, append-only | Cross-agent handoffs and decisions, chronological. The one file exempt from the one-writer rule: any agent may write it, and collisions are avoided by appending newest-first and never editing existing lines. |
| `QUESTIONS.md` | Scrum Master (raised by anyone) | Open questions blocking a story, routed to PO via Orchestrator |
| `test-plans/S<N>-slug.md` | Tester | One file per story: cases, pre-check notes, formal-pass results |
| `QA_FINDINGS.md` | QA | Dated sweep log, own file to avoid collisions |

Gotcha worth carrying forward: **BACKLOG.md's rows are GFM table rows — each must be exactly one physical line.** An `Edit` whose `new_string` contains an embedded newline (e.g. from writing "readable" multi-line prose into a table cell) silently splits the row, orphaning the rest of the row as a stray paragraph below the table. Hit three times this project. Fix: write row replacements as single-line strings, and grep-verify the row is still one line immediately after editing it.

### Calibrate the pipeline's rigor to the story's risk
The full seven-stage gauntlet above earns its keep for stories that touch **app logic, data model, or migrations** — where regressions hide and a design smell is expensive to unwind. It is over-processing for **additive static/asset/config** work, and over-processing is its own cost (agent spend + latency + more permission prompts). On vopping the app-icon story (S40: an apple-touch-icon PNG + web manifest + a few `<head>` tags — no script logic, no data, additive-only) skipped the 3-reviewer pre-Lock gauntlet: the Scrum Master sliced+Locked in one pass, the Developer built + self-verified (Playwright clean load + valid manifest + every tag/path resolves + core UI still works), pushed implemented, and the PO confirmed on-device. The one gate that mattered — does the new `<head>` break page load? — was covered by the Dev self-verify, and acceptance was device-only anyway. A prior **verified research workflow** (§9) can itself stand in for the design/feasibility review: S40's spec came out of a 4-agent glyph-survey + iOS-icon-mechanics + adversarial-verify + synthesis run, so re-reviewing it before Lock would have been redundant. Rule: reserve the full gauntlet for logic/data/migration stories; for additive static/asset/config changes — especially when a verified workflow already served as the design review — slice+Lock in one pass and lean on Dev self-verify + the device/acceptance check.

### Feasibility spike before drafting a hard story
For a story whose core mechanism is technically unknown, run a Developer feasibility spike *before* the Scrum Master drafts the AC, so the AC is written against reality instead of a guess. On vopping this is what let the entire aisle rework (5 stories, superseding mechanisms in 3 already-Done stories) go idea→shipped in a single session: the spike resolved the one real unknown (inline "add new aisle" inside a native `<select>`), and everything downstream drafted cleanly against the proven approach.

### Cross-story supersession is normal, not a regression
A later story can legitimately change an earlier *already-Done* story's expected behavior (a new confirm dialog in story N means story N-minus-several's test now expects one more dialog than before; a new mechanism can replace an old one wholesale). Document it as a dated technical note on the older story — it stays Done — and declare the supersession in the new story's AC at Lock, with reciprocal notes both directions. This is proven for UI-level supersession (S13→S5, S19→S13) and for mechanism-level supersession with a regression-suite retrofit (the aisle rework's 222→209 by-design coverage change — reduced on purpose, not lost). Don't treat any of this as reopening or as a regression.

### Device-only acceptance criteria — structure the AC and the delivery around them
When the whole point of a change is behavior only a real device can exhibit (iOS Safari focus-zoom on sub-16px inputs; native `<select>`/`showPicker()` behavior; a home-screen icon), the formal pass must **not** be allowed to imply it verified that behavior — a green desktop pass while the phone is broken is the "NB-6 gap." Discipline that worked on vopping:
- The Tester's testability check *names* the device-only signal explicitly (tagged NB-6).
- The Scrum Master folds an explicit AC line: "on-device X is a non-blocking REAL-DEVICE confirmation signal, NOT a desktop-pass gate."
- The desktop formal pass asserts only **structural proxies** it can genuinely verify (the field is a native `<select>`; every text input's computed font-size ≥16px; correct option set/order; the commit/migration logic; no horizontal overflow at 320/360/375/390px) — never the device behavior itself.
- **Push the self-verified build to the PO's device *in parallel with* the formal pass, don't serialize them.** They verify complementary things (logic/structure vs. real device behavior) and neither gates the other, so push to Pages the moment the build is clean, flagged as a `needsReply` "try it on your phone." The Done-flip still waits on the Tester's citation; the early push is for real-device feedback, not a Done claim — say "implemented, NOT yet Done" in the commit and console.
- Keep a standing scrap-vs-continue gate for an unreproducible device bug: the PO may prefer to cut the affordance rather than fund another blind round (on vopping the PO twice offered "scrap it to Settings-only"). Surface that as a real choice each time a blind round fails; don't auto-launch the next patch.

---

## 3. The console

A single-file-per-concern, **zero-server, `file://`-loadable** status dashboard the PO opens directly off disk. This constraint is the reason it's built the way it is — get it wrong in a new project and you'll end up trying to `fetch()` JSON from a page that has no server behind it.

**Confirm the viewing model explicitly at project start — don't assume.** Ask the PO whether they view the console locally (`file://`, no push needed) or need it live somewhere (GitHub Pages, needs a push after every edit). On vopping the PO views the *console* locally but views the actual *app* and any decision-tool mockups on their phone via Pages — two different files with two different sync requirements, and conflating them caused real confusion twice. The Orchestrator-owned console files (`status.html`, `status.js`, `backlog-status.js`, `status-archive.js`) are kept local and out of the app deploy — don't commit or push console edits; they're read off disk via `file://`. What gets pushed is the app, the manifest, and any decision-tool mockups. `style.css` is the *app's* stylesheet (Developer-owned, pushed — §1), **not** a console file; the console's own styling lives inline in `status.html` on vopping.

**Files to copy as a set** (from vacking's project root — copy this set together, they're not independently useful):
- `status.html` — structure, tabs (Team Status / Backlog / Messages), rendering logic, `statusMeta()` status→icon/color mapping, legend rendering, backlog filter buttons.
- `status.js` — `window.STATUS_DATA` (or equivalent) as a **plain global-variable assignment**, not JSON fetched over the network. This is the live agent-activity feed: per-agent state, `lastPush`, `pendingQuestion`, a newest-first `events` array, and the curated `messages` array (below). Hand-maintained by the Orchestrator, updated essentially every turn that involves relay traffic.
- `backlog-status.js` — same plain-global-var pattern, `window.BACKLOG_STATUS`. Per-story rank/id/title/status for the Backlog tab, plus `{"divider": true, "label": "..."}` marker entries to separate sections (e.g. pre-console history vs. the live priority queue). Hand-maintained by the Orchestrator from BACKLOG.md's real state — this is a **separate manual edit from status.js**, not automatic, which is exactly why it goes stale (see §6).
- console styling — the dark Okabe-Ito palette (see §7), the `.legend-filter` button styling, mobile-responsive rules. vacking kept this in a dedicated console stylesheet; vopping inlines it into `status.html`. Keep it distinct from the app's `style.css` (a different, Developer-owned, pushed file) — don't reuse that filename for the console.

**Why two JS data files instead of one:** status.js changes almost every turn (activity feed); backlog-status.js changes only when a story's status actually changes (much rarer). Splitting them keeps the noisy one from making the stable one hard to review, but the tradeoff is real: you now have two files that can drift out of sync with each other and with BACKLOG.md's ground truth. See §6 for the mechanical fix.

**Console conventions worth replicating directly:**
- A top-row "Outstanding Questions for PO" box, quiet/gray when nothing's pending, amber-highlighted with a one-line summary when something is. See §10 — this exists specifically because chat-only questions get missed.
- **A curated Messages tab, separate from the raw activity feed.** The PO described raw agent-relay narration in chat as "drinking from a firehose." The fix is a one-way, PO-facing digest: each entry tagged `needsReply` / `answered`, sorted unanswered-needs-reply first then reverse-chronological within each group, paginated like the activity feed. This is a *discipline*, not just a feature: any substantive PO-facing content — a recommendation, a proposed resolution, an answer to their question — must be mirrored into the `messages` array in the **same turn** it's said in chat, not backfilled later. Missed ~5 times in one session before it stuck; the console can't be a trusted source of truth if real content only lands there after the PO notices it's missing. This generalizes the older, narrower rule "don't narrate raw relay traffic in chat" — the positive form is "put the substance on the console as you say it."
- **Agent cards stay tiered and self-scoped — maintain it per-update, it regrows if unattended.** Left alone, per-agent cards drift into multi-paragraph walls (each relay just appended) until the newest activity scrolls off-screen, and cards start narrating *other* agents' actions. The rule the PO asked for: **TIER 1** = the status line, literally just the state word ("Working", "Standing by") with nothing appended — it also drives the status icon; **TIER 2** = the task line, tweet-level, one or two short sentences; **TIER 3** = the Recent-activity/events feed, where all detail lives. Plus **self-scoping**: each card describes only its own agent's state/next action — anything about what another agent did belongs in the events feed as *that* agent's event, never inside a peer's card. Bake a "cards tiered + self-scoped; detail to the feed" check into every routine console update.
- Backlog tab legend rendered as clickable filter buttons (toggle a `Set` of active status labels, OR-logic, empty set = show all) rather than static text — the PO asked for this after finding the static legend not useful enough on its own.
- `statusMeta(status)` should only pattern-match against the text **before** any em-dash/detail separator in a status string. Scanning the full string (including trailing detail text like "...implemented cleanly...") caused false keyword hits (e.g. "implemented" tripping the Done bucket before "review" was ever reached). Keep the bucket vocabulary matched to whatever controlled vocabulary the backlog docs actually use (this project's: Not Started / In Progress / In Review / Locked / Done) — inventing a new label (e.g. "Reopened") that isn't in that vocabulary means it silently falls through every filter and the row just vanishes.

**The decision-tool pattern** (also see §7): when a subjective call needs the PO's input and a first guess lands wrong, don't guess again — build a small standalone comparison page with real side-by-side options and let them pick. vacking's `palette-picker.html` is the template (it lives in the vacking repo, not this one); the same shape works for spacing, density, animation timing, copy tone — anything where "does this feel right" is a call only the PO can make and iterating blind burns turns. Two hard-won refinements:
- **Scope the mockup to the whole real element, not just the dimension being decided.** vopping's first density-picker draft showed only checkbox+name+aisle-tag; QA caught that it omitted the delete/reorder/note controls that would actually share that row — so a PO pick made against it risked not holding once the real controls landed (the same "crowded row" failure class the picker was meant to prevent). Build the tool against the full realistic element from the start.
- **Frame reversibility honestly when the PO worries about future-proofing.** For a static HTML/CSS UI, removing a visual affordance (a glyph, a control) is a reversible markup/CSS choice, not a data-model lock-in. Don't reserve hidden space for a hypothetical future need — note that reversing course later just costs the density back, symmetric either direction.
- **The Orchestrator does not write these — the Developer does** (§1). The console is the only file the Orchestrator authors directly.

---

## 4. Agent addressing & role mapping (read this before spawning anyone)

**`SendMessage` addressed by agent *name* silently fails in this environment.** Always capture the raw agent ID returned when you spawn each agent (`Agent` tool result) and address every subsequent `SendMessage` by that ID. If you ever lose track of an ID, `ListAgents` will list current agents — check there before assuming an agent is gone.

**Write down the role→agentId mapping the moment a spawn batch returns; double-check it before every `SendMessage`, especially right after a re-spawn.** When Scrum Master/Developer/Tester/QA are spawned in one parallel batch, the tool results come back in call order but nothing else labels which raw agentId is which role. On vopping, after a multi-day pause forced a full re-spawn, the Orchestrator misremembered the mapping and sent a Developer-owned-file task (updating a decision-tool mockup for a QA finding) to the Tester agent. Tester complied and did competent work — but it was still a role-boundary breach the *Orchestrator* caused, same failure family as the Orchestrator writing the mockup itself (§1). A scratch note of the mapping is enough; the discipline is checking it before you send, not trusting spawn-order memory.

---

## 5. Permissions — read this whole section before doing anything else

This caused more real friction than any other part of the process. Two independent layers, plus a session-local mode setting. All three have to be right or prompts come back.

### Layer 1: Claude Code's own permission *mode* (PO-side, not project config)
Claude Code has a mode toggle — roughly "auto" vs. "edit automatically" — and it **silently reverts to the more restrictive mode on reload/reconnect** (e.g. after a token-expiry crash forces a window reload). This is a PO-side setting, unrelated to anything in the project. If prompts suddenly resume right after the PO mentions reloading their window or recovering from a crash, **ask them to check their own permission mode before touching anything project-side.**

### Layer 2: the org-managed policy file (cannot be worked around)
On this machine the enterprise managed settings live at `C:\Program Files\claudecode\managed-settings.json` — **not** the standard `C:\ProgramData\ClaudeCode\` path, so checking only there wrongly concludes "no managed policy." It **outranks every project's `.claude/settings.json` and the user's own `~/.claude/settings.json` unconditionally.** Its `permissions.ask` force-prompts raw Bash `grep`/`find`/`awk`/`sed`, `curl`/`wget`, `git push`/`pull`/`merge`/`rebase`/`reset --hard`/`clean`/`clone`, all package installers, docker/kubectl/cloud CLIs, and reads of secret-ish files; it hard-denies credential/key files, cloud-metadata IPs, and browser-profile paths. `--dangerously-skip-permissions` is also locked off org-wide.

No amount of adding `Bash(grep *)` etc. to a project's settings.json will ever stop those specific commands from prompting — a managed `ask` outranks a project/user `allow`, so a `fewer-permission-prompts` sweep is a dead end for the managed set. Don't burn a session re-editing/restarting agents chasing this like it's a project-config bug (this project did exactly that before finding the managed file). **The fixes are behavioral:**
- **Dedicated tools over raw Bash.** Use `Grep`/`Glob`/`Read`/`WebFetch`/`Edit` instead of raw `grep`/`find`/`sed`/`awk`/`curl` — the managed policy is Bash-pattern-specific and doesn't cover them. For ad-hoc text processing that would reach for `awk`/`sed`, use a small `node -e` snippet (a last resort, not a default — see Layer 3).
- **`git push` is managed-asked and unavoidable** — treat it as one expected prompt per push, not a bug to fix.
- For background/headless agents specifically, an "ask" they have no UI to answer degrades to an outright *denial* — if an agent reports something flatly blocked rather than prompting, check here before assuming a different mechanism.

### Layer 3: the project's own `.claude/settings.json` allowlist
This is the one you actually maintain. Known gotchas, all confirmed the hard way this project:
- **`Bash(node *)` does NOT cover `Bash(node -e *)`.** Claude Code treats an inline `-e` invocation as a distinct pattern from a bare `node <file>` call. If agents use `node -e` at all (and per Layer 2 they legitimately need to), add `Bash(node -e *)` as its own explicit entry.
- **Chained/compound commands are not covered by a rule that matches only the first command.** Claude Code is shell-operator-*aware*: it parses `&&`, quotes, backticks, and command-substitution rather than treating the command as one opaque blob. That awareness is exactly why a prefix rule for the first command does **not** blanket-extend across an operator — the docs state it plainly: `Bash(safe-cmd *)` "won't give it permission to run the command `safe-cmd && other-cmd`." (Correct the intuition here: it's not that "wildcard matching is defeated by chaining" like a crude bug — it's that operator-aware parsing deliberately scopes a rule to a single command.) The working directory persists between Bash calls anyway, so the fix is behavioral: **one command per call, no `cd X && Y` chaining; use `git -C "<abs path>"` or absolute paths; run tests by absolute node path.**
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

### The standing process fix: proactive tool-discipline, not reactive fire-fighting
Permission-allowlist changes **do not hot-reload into already-running agents** — a settings.json fix only takes effect for a freshly spawned process. And the same two gotchas (managed-asked raw Bash; `cd X && Y` chaining) resurface across a session even after being fixed once, because agents drift back into old habits or a freshly re-spawned agent never got the lesson. So this has to be built into the routine, not applied after the PO notices prompts piling up (a reactive framing the PO explicitly rejected). On every agent (re-)spawn — deliberate, crash recovery, or post-pause — and again at natural checkpoints (sprint boundaries, after a multi-day pause):
1. Put the tool-discipline block at the **top** of every agent brief: dedicated Read/Grep/Glob/Edit over raw Bash equivalents; one command per call, no `cd` chaining; `git -C`/absolute paths; absolute node path for tests.
2. Give the PO a one-line heads-up that a burst of prompts may be coming.
3. Have the fresh agent run a **canary sweep** of every currently-allowlisted pattern right away (git status, npm -v, node -e, a Grep call, a Read call, ls, etc.) so first-use prompts land together in one batch the PO can approve at once, rather than trickling in over the next hour. (vacking kept a `.permission-warmup` file for this — just a scratch list of the allowlisted command patterns to fire once on spawn.) Skipping the canary + reminders on re-spawn has a real cost: on vopping a token expiry forced repeated full-fleet re-spawns, and omitting them produced a prompt spike the PO flagged.

Do this unconditionally on every restart. See §9 for the reason Workflow subagents need the tool-discipline block baked into the *script* instead — you can't re-brief them mid-run.

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

**Generalize this:** when a "remember to double check X" habit has already failed more than once at the same seam, stop reinforcing the habit and write a mechanical check instead. This applies beyond backlog sync — anywhere two hand-maintained representations of the same fact can drift (docs vs. code, one doc vs. another, a cached count vs. a live one, a *requested* status change vs. the file's real state per §1).

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
- **The decision-tool pattern (reuse this directly):** build a standalone comparison page — vacking's `palette-picker.html` — showing several real candidate palettes side by side, each rendered through SVG `feColorMatrix` filters simulating protanopia/deuteranopia/tritanopia, plus a mini mockup matching the real app's actual markup (swatches alone aren't enough; show it in context). Let the PO pick from real rendered options instead of iterating blind on descriptions. This is the artifact to copy/adapt for a new project rather than rebuilding from scratch — the SVG filter approach for simulating each colorblindness type is the reusable part.
- Once a palette is picked for a given PO, treat it as settled across projects unless they say otherwise — don't restart this conversation from zero next time.

---

## 8. Glyphs & icons — rendering, verification, and the no-emoji preference

Icon/glyph choice is its own recurring hazard, separate from color. Two settled facts and a verification discipline:

- **This PO wants plain Unicode symbol/dingbat glyphs, not colorful emoji-style pictographs.** Explicit on vopping: "i'm trying to AVOID emojis... they don't match the vibe." Treat this as settled across projects like the palette (§7). The consequence: **do not reach for well-supported core emoji as the cross-platform "safety" fallback** without checking whether the project wants emoji at all — on vopping that would have been the wrong call. When a glyph won't render reliably, the fix is to test other candidates *within the wanted family* on the real device, not to escape to a different aesthetic.
- **"Not tofu" in a test browser ≠ "renders distinctly on the PO's device."** A test-browser render (even an automated canvas pixel-comparison against a blank reference, which correctly finds true tofu) can still miss a distinct failure mode: on Windows, several obscure codepoints in the same Unicode sub-block collapse to *the same generic fallback artwork* — each renders as *something*, just not the intended distinct something. A single test-browser screenshot is necessary but not sufficient for a cross-platform glyph choice. Verify on the PO's actual device, and when they report "looks like X," get the *actual character* — have them paste it back and check its real codepoint with `String.codePointAt()`, don't trust the description.
- **A baked raster sidesteps the device-glyph problem entirely.** The tofu / inconsistent-live-font pain does not apply to anything rendered once to an image — an `apple-touch-icon` PNG, a splash screen — because every device shows those exact committed pixels. So when a "which glyph renders?" question arises for something that *can* be baked to an image, baking removes the device-font risk (and lets you render a plain monochrome mark even from an emoji-only source codepoint — relevant because there is no non-emoji shopping-cart/basket glyph in Unicode). One nuance: "renders as drawn" freezes the look to the *generating machine's* font, so draw vector paths or composite a controlled source asset (on vopping, the PO's own `shop.png`), not `fillText` of a system glyph, if you want to control the exact look.

---

## 9. Workflows — when you fan out to many subagents

When a substantive research/audit/migration task warrants it — or when the session is in a workflow-first mode like *ultracode* (a Claude Code setting, signalled by a system-reminder, that means "author and run a workflow for every substantive task by default") — the Workflow tool runs many subagents in a deterministic script. It is powerful, but it has a coordination property the persistent fleet does not, and getting it wrong burned the PO on vopping:

- **You cannot course-correct a running Workflow's subagents mid-flight.** They're ephemeral — you have no `SendMessage` handle, and each runs the prompt you gave it to completion. The entire tool-discipline apparatus this project relies on (canary-sweep-on-respawn, no-chaining re-briefs, mid-task course-corrections) does **not** reach them. On vopping a multi-user-sync research Workflow (6 explorers + critic + synthesis) was told to "use web tools if available, else reason from knowledge" — and the explorers shelled out to `curl` to verify specifics, which the managed policy force-asks (§5), producing a burst of permission prompts right as the PO stepped away for hours.
- **Therefore: bake tool-discipline into the workflow *script's shared context* up front**, exactly where you'd put it at the top of a persistent agent's brief. Prepend an absolute no-shell/no-`curl`/no-web "OPERATING CONSTRAINT" into the shared CONTEXT string that's concatenated into every `agent()` prompt.
- **For a research/reasoning workflow, default to forbidding shell + web entirely** and have agents flag unverifiable specifics under an "uncertainties" field for later human verification — rather than inviting them to "go verify," which means network calls, which means prompts. The marginal accuracy rarely beats the interruption cost. If the human is away or has asked for zero prompts, this is non-negotiable: a workflow that can prompt is a workflow that can stall on an unanswered prompt.
- **To fix a workflow that's already misbehaving:** `TaskStop` the run → `Edit` the persisted script (the tool returns its `scriptPath`) to add the constraint and rewrite any "use web tools" instruction → relaunch via `Workflow({scriptPath, resumeFromRunId})` (the unchanged prefix returns cached results instantly).
- **A verified workflow's output can substitute for the pre-Lock design/feasibility review** of the story it specced — see §2 (calibrate rigor to risk), where the S40 example is worked through. Don't re-review what an adversarial-verify pass already vetted.

---

## 10. Communication style — how this PO likes to work

- **Direct, short instructions.** Requests tend to be terse and specific ("yes, queue all 7 as stories," "let's go with color choice c: okabe-ito"). Match that — don't pad responses, don't restate the request back before acting.
- **No fluff, no flattery.** The PO explicitly asked to cut affirmations and filler — no "good call," "good instinct," "smart choice," "great question," no prefacing an answer with praise of their idea. Open with the substance. Normal plain acknowledgment is fine; editorializing on the quality of their decisions is not. It reads as padding and wastes tokens.
- **Corrections are blunt and should be taken literally, immediately, no negotiation.** When told to stop, that means stop *now* — not finish the current step, not verify state first, not run one more sanity check. One immediate stop message to every live agent, in the same turn, no preconditions. Any commit/push/doc-sync that would normally happen at a wind-down waits until explicitly resumed; it does not get bundled into the stop itself.
- **"Use the console" is a hard rule, not a suggestion, once given.** Any question in chat that genuinely needs a PO response to proceed must also be flagged on the console (`pendingQuestion`-equivalent) — set it as the **literal last tool call before sending the message containing the question**, every time, no exceptions. This was missed twice in one session before that discipline stuck; chat-only questions get lost in scroll and the PO won't reliably notice them unaided. This is fully within the Orchestrator's own control (unlike a background-agent permission prompt, which genuinely can't be seen coming) — there's no excuse for relying on the PO to catch a miss here. (The Messages-tab mirroring discipline in §3 is the broader form of the same rule.)
- **Wants ambient visibility, not just on-demand answers.** Backlog/priority queue should come up periodically unprompted (§1); the same "surface it, don't wait to be asked" instinct applies to permission-prompt heads-ups after a restart (§5) and probably generalizes to anything else the PO would rather hear about early than discover themselves.
- **Will push back on a superficial answer.** When asked "why does this keep happening" or "how do we stop this," a reflexive "I'll be more careful" was explicitly rejected as insufficient after failing 2-3 times already at the same seam (console sync, question-flagging) — the PO wants an actual mechanical fix or a genuine causal answer, not a renewed promise. When the honest answer is "I can't fully prevent this, here's why, here's the closest mitigation," say that plainly rather than overpromising.
- **Appreciates disclosure of scope creep over silent scope creep or over-asking.** Developer flagging "fixing this exposed 3 more of the same bug elsewhere, fixed those too" was treated as the right call, not a process violation — the PO reviewed and approved retroactively rather than wanting a stop-and-ask for every incidental fix.
- **Tests on real hardware and reports back plainly** ("yep looks just fine on mobile," "yep all working, thanks") — treat that kind of confirmation as the actual acceptance signal for anything device-dependent (§2); agents cannot substitute a real device test with narrow-viewport emulation, only approximate it.
- **Does not normally approve new backlog stories** — queuing stories is routine SM work that doesn't need PO sign-off. (Flagged once on vopping only because of an unusually large batch; not a standing gate.)
- **Auto-push is pre-authorized for this repo specifically** ("you can push automatically") — but that's a standing authorization for *this* remote, not a general default. In a new project, confirm push authorization explicitly rather than assuming it carries over; commits themselves are still only made on explicit request in every project.

---

## 11. Quick-start checklist for a new project

1. **Review the sibling project's real artifacts first** (vacking/vopping CSS, BACKLOG.md, QA_FINDINGS.md) before writing a line of the new project's docs. On vopping this immediately surfaced the exact root cause of the PO's density complaint (44px checkboxes + zero row margin) — treat it as a hard requirement, not a nice-to-have.
2. Copy `status.html` / `status.js` / `backlog-status.js` (plus a `status-archive.js`) and the console styling from vacking as the console starting point (§3) — keep the console's CSS distinct from the app's own `style.css`. Strip project-specific content, keep the mechanics (file:// + global-var pattern, `pendingQuestion` box, Messages tab, `statusMeta()` em-dash-safe parsing, legend-as-filter-buttons, Okabe-Ito palette). Confirm the PO's viewing model (local vs. Pages) explicitly (§3).
3. Set up `.claude/settings.json` with the baseline allowlist in §5, including `Bash(node -e *)` explicitly.
4. Check for a machine-level `managed-settings.json` before assuming any Bash-permission gap is project-config-fixable — on this machine it's at `C:\Program Files\claudecode\managed-settings.json`, not the standard path (§5, Layer 2).
5. Spawn Scrum Master, Developer, Tester as background agents with role charters from §1, **tool-discipline block at the top of each brief** (§5); capture their agent IDs and write down the role→agentId mapping immediately (§4).
6. Set up BACKLOG.md / SPRINT_LOG.md / TEAM_LOG.md / QUESTIONS.md / `test-plans/` with the ownership split in §2.
7. Write `tools/check-backlog-console-sync.js` (§6) up front, not after the first drift incident.
8. Add QA as a 4th agent once there's a real backlog to audit — no need to wait for a "session gets big enough" trigger, the two event-based gates in §1 work from story 1.
9. Confirm colorblind-safe palette is still Okabe-Ito for this PO (§7) and that the no-emoji glyph preference still holds (§8) — don't re-run either conversation, just confirm and move on. For any other subjective visual/UX call, build a comparison tool (§3/§7) rather than guessing.
10. Confirm push authorization scope for the new repo explicitly (§10) — don't assume the vacking authorization carries over. If GitHub setup is involved, confirm *which host and account* the PO actually wants: a work machine can be logged into a corporate/enterprise GitHub host while the PO's personal projects live on public github.com under a different account, and `gh auth status` can look "logged in" while pointed at the wrong host entirely.
