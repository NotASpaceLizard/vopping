# Grocery Shopping List App - Project Notes

> **SUPERSEDED, 2026-09-04.** This entire file — including the "on hold until backend
> infrastructure becomes available" conclusion below and the multi-user/multi-device
> sync framing it's built on — is stale. The PO has since resolved this project as a
> **single-user, fully offline, self-contained webapp** (plain HTML/CSS/JS, no
> framework/build step, no backend, `localStorage` persistence, same architecture as
> sibling project vacking). There is no backend blocker and nothing is on hold.
> **`BACKLOG.md` in this same folder is the current source of truth** for scope and
> stories — every requirement below (minus multi-user editing and shareable links,
> both dropped entirely) has already been turned into a real story there, plus a new
> paste-to-ingest feature not listed below. Keeping this file only for requirement-
> history context; do not treat anything under "Technical Constraints Identified" or
> "Conclusion" below as current.

## Requirements
- Multiple users can edit the same list
- Check items to clear them off the list
- Add items to a list
- Rearrange items on a list
- Remove items from a list (distinct from checking)
- Undo button
- Text notes on items (e.g., "half gallon", "red")
- Designate items into aisles (suggested groupings or custom free text)
- Sort by aisle, alphabetical, etc.
- "What am I missing?" feature to suggest frequently added items
- Save list and share via link
- List persists through refreshes and cache clearing
- List only changes when items are added/removed

## Technical Constraints Identified

### Multi-User + Multi-Device Requirement
- Core requirement: users need to access and edit from different devices
- This requires server-side data storage and synchronization

### Backend Limitation
**Blocker:** No backend server available
- Cannot use third-party services (Firebase, Supabase, etc.)
- Cannot run Node.js server locally or deploy to hosting
- Static solutions (CSV in code, GitHub-hosted files) don't support true multi-user editing

### Sync Options Evaluated
1. **Real-time sync** (WebSockets) - Complex, requires backend
2. **Manual refresh/polling** (REST API) - Simpler, still requires backend ✓ Preferred approach
3. **localStorage only** - No cross-device support ✗

## Conclusion
Project on hold until backend infrastructure becomes available.

### Future Options
- Self-hosted Node.js + SQLite server (~100 lines of code)
- Third-party backend service (Firebase, Supabase, etc.)
- Cloud hosting with simple REST API

## Date
Initial planning: August 11, 2026
