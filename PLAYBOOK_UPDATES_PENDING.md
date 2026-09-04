# Playbook Updates Pending

Running log of process lessons learned on **vopping** that should get folded into `AGENTIC_ORCHESTRATION_PLAYBOOK.md` at project wind-down. Not yet applied — this is a queue, not a changelog. Orchestrator-owned; add to it as things come up, don't edit the playbook itself until the PO says the project is winding down.

## Console

- **Messages tab pattern**: a curated, one-way PO-facing digest, separate from the raw Team Status activity feed. Each entry tagged `needsReply` / `answered`. Sort: unanswered-needs-reply group first, then reverse-chronological within each group. Paginated the same way as the activity feed. Built specifically because the PO described raw agent-relay narration in chat as "drinking from a firehose."
- **Discipline, not just a feature**: it's not enough to avoid narrating *agent-relay* traffic in chat — any substantive PO-facing content at all (a recommendation, a proposed resolution, an answer to their question) has to be mirrored into the Messages array in the *same turn* it's said in chat, not backfilled later. This was corrected roughly 5 times in one session on vopping before it stuck. The console can't be a trusted source of truth if real content only lands there after the PO complains it's missing.
- **Confirm the viewing model explicitly, don't assume**: ask the PO up front whether they view the console locally (`file://`, no push needed) or need it live somewhere (e.g. GitHub Pages, needs push after every edit). On vopping the PO views the console locally but views the actual app/decision-tools (e.g. a density picker) on their phone via Pages — two different files, two different sync requirements. Conflating them caused real confusion twice.

## GitHub setup

- **Check the authenticated host, not just whether `gh` is authenticated at all.** A work machine can be logged into a corporate/enterprise GitHub host while the PO's actual personal projects live on public github.com under a different account. `gh auth status` can show a host and look "logged in" while still being the wrong host entirely. Confirm which host+account the PO actually wants before creating anything.

## Decision-tool artifacts (palette-picker.html-style)

- **Scope the mockup to the whole real row/element, not just the dimension being decided.** vopping's first density-picker.html draft showed only checkbox+name+aisle-tag; QA caught that it omitted the delete/reorder/note controls that would actually share that row, meaning a PO pick made against it risked not holding once the real controls landed — same "crowded row" failure class as vacking's own MV-1/MV-3 bugs. Build the decision tool against the full realistic element from the start.
- **Reversibility framing for "future-proofing" worries**: when a PO worries about removing a visual affordance (e.g. "what if we want a checkbox back later and there's no room") — for a static HTML/CSS UI, removing a glyph is usually a reversible markup/CSS choice, not a data-model lock-in. Don't reserve hidden space for a hypothetical future need; note that reversing course later just costs the density back, symmetric either direction.

## Role boundaries

- **The Orchestrator writing a decision-tool artifact directly (not through Developer) is a real mistake, not a shortcut.** Caught on vopping when the Orchestrator wrote the first density-picker.html draft itself instead of delegating to Developer — PO corrected it immediately ("you are my orchestrator, not my developer"). The console itself remains the sole Orchestrator-owned exception; everything else, including one-off decision-tool mockups, goes through Developer.

## Sibling-project review pays off

- Reviewing vacking's actual CSS/BACKLOG/QA_FINDINGS before writing a single line of vopping's own docs immediately surfaced the exact root cause of the PO's density complaint (44px checkboxes + zero row margin, a deliberate but unbalanced tap-target-comfort decision) — worth keeping as a hard requirement for any new sibling project, not just a nice-to-have.
