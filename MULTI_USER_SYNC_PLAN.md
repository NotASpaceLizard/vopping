# Multi-User Sync — Plan & Setup

**Status:** PLANNED, not started. Direction chosen; execution deferred until the PO can coordinate
with their partner (likely a weekend). **Spike-first** — do not build the full feature until the
on-phone proof (below) passes.

## Background / record correction
The earlier assumption that sharing one grocery list across the PO's and their partner's two phones
requires a private server running 24/7 is **incorrect**. Two phones can share one list with **no
machine the PO runs or babysits**. Two server-free families work: (A) use GitHub's own REST API as
a shared datastore; (B) a managed scale-to-zero cloud database (e.g. Firestore). Only
*truly-instant* push while both apps are closed would need an always-on relay — not needed for a
grocery list (sync-on-open is enough).

## Chosen direction
- **RECOMMENDED — Option 1: GitHub Contents API on a dedicated PRIVATE data repo.** Both phones
  read/write one `list.json` in a *separate private* repo via api.github.com directly from the page,
  each using an on-device fine-grained token. Vanilla / no build step, free, zero third-party
  dependencies, leans only on GitHub (already the app's host). GitHub's blob `sha` gives free
  compare-and-swap: a stale write is rejected (409) and re-merged, so neither phone can silently
  clobber the other's edit.
- **Ship alongside — Option 3: manual "Share list" (Web Share)** as a zero-infra backup.
- **Managed fallback — Option 2: Cloud Firestore** (if the PO would rather not manage on-device
  tokens; adds Google's SDK + security rules that must pin the two identities).
- **Ruled out:** isomorphic-git / real-git-in-browser (needs a CORS proxy = a hidden always-on
  server); raw WebRTC phone-to-phone (needs a TURN relay = a server, and dies when the app
  backgrounds); reading a shared iCloud file / Apple Notes / Reminders (no web API on iOS).

## What the PO (and partner) do — one-time, ~15 minutes
1. **Create a new PRIVATE repo** (e.g. `vopping-data`) — NOT the public app repo. Add a README so it
   isn't empty.
2. **Create a fine-grained token:** github.com → avatar → Settings → (bottom of sidebar) Developer
   settings → Personal access tokens → Fine-grained tokens → Generate new token. Set: a name;
   Expiration (required, max ~1 year — pick 1 year); Resource owner = your account; Repository access
   = "Only select repositories" → `vopping-data`; Permissions → Repository → **Contents = Read and
   write** (Metadata auto-set to Read). Generate, then **copy the token** (`github_pat_…`, shown
   once).
3. **Paste the token into the app** (a new Settings → Sync box; stored on that phone only). Re-paste
   ~yearly when it expires (and rarely, if iOS clears stored data after a long idle gap).
4. **Partner access — DECISION PENDING:**
   - **Option A** — partner has a GitHub account: add them as a collaborator on `vopping-data`; they
     create their own token and paste it. (Independently revocable; edits traceable to who made
     them.)
   - **Option B** — partner has no account: the PO creates a *second* token and gives it to the
     partner to paste. (Simpler for the partner; coarser to revoke.)
   - Recommendation: **B** is fine for two trusted people unless the partner already has a GitHub
     account.

## What the team owns (not the PO)
- **Data-model refactor (prerequisite for ANY sync):** switch item ids from the per-device `nextId`
  counter to globally-unique ids (`crypto.randomUUID`, iOS 15.4+), add a per-item `updatedAt`, and
  represent deletes as tombstones (so a delete on one phone isn't resurrected by the other's stale
  copy).
- **Scope of what syncs:** SHARE the items (and probably the aisle config, since items reference
  aisles); keep LOCAL/per-device the S30 personal override map, the frequency-learning data, and
  icon preferences.
- **The sync loop:** conditional GET (ETag) on open/foreground/poll; debounced PUT-with-`sha`; on
  409 re-GET → re-merge → retry; UTF-8-safe base64 helpers; an item-level last-writer-wins +
  tombstone merge.
- **Settings → Sync UI** (token paste box + data-repo id).
- Preserve the existing `escapeHtml` discipline (the token lives in localStorage; never `innerHTML`
  raw synced text).

## Spike first (gate — do this before building anything)
A ~1-hour proof on the PO's actual iPhone (Safari, or the Add-to-Home-Screen app). Using a throwaway
private repo + one fine-grained token, a tiny test page served on the real GitHub Pages origin does
three calls in order: (1) GET the file + its `sha`; (2) PUT with that `sha` → expect 200; (3) PUT
again with the OLD, now-stale `sha` → expect a 409 rejection. If all three behave on the phone,
CORS + the Authorization header + the sha/409 concurrency guard are all proven → commit to Option 1
and start the data-model refactor. If the 409 doesn't appear, we've learned it cheaply before
building.

## Open decisions
- Partner access A vs B (above).
- Token expiry length (convenience vs security).
- (Minor) a custom domain for token-origin isolation — only matters if the PO hosts other project
  pages under notaspacelizard.github.io.
