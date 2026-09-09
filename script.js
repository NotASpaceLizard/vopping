// Grocery List - vanilla JS, no build step, no framework.
// Intentionally a plain (non-module) script so this keeps working when
// index.html is opened directly via a file:// URL (module scripts can hit
// CORS restrictions under file://). Same precedent as vacking/script.js.
(function () {
  'use strict';

  var STORAGE_KEY = 'vopping-list-state-v1';
  var FREQUENCY_KEY = 'vopping-frequency-v1';

  function defaultState() {
    return { items: [], nextId: 0 };
  }

  // S1 locked AC / QA finding R1 (Developer sanity-check finding,
  // 2026-09-04): persisted as ONE object { items: [...], nextId: N }, not a
  // bare array at the top level - storing the array directly would make a
  // naive "is this a plain object" shape-check incorrectly flag valid data
  // as corrupted (arrays fail that check). Guards against: parse failure,
  // a parsed value that isn't a plain object, or a parsed object whose
  // `items` field specifically isn't an array. Any of those falls back to
  // an empty default state, never throws before the render loop runs.
  function parseStoredState(raw) {
    if (!raw) {
      return defaultState();
    }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return defaultState();
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.items)) {
      return defaultState();
    }
    if (typeof parsed.nextId !== 'number') {
      parsed.nextId = parsed.items.length;
    }
    return parsed;
  }

  function loadState() {
    try {
      return parseStoredState(window.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) - fall back to an
      // empty, in-memory-only state rather than throwing.
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) - state still works
      // for this session, it just won't survive a reload.
    }
  }

  var state = loadState();

  // ---- S10: frequency counter, a separate/independent storage record -----
  // { "<normalized name>": { count: N, display: "<first-typed casing>" } }.
  // Same defensive-guard spirit as S1's parseStoredState (QA finding R1),
  // adapted to a map-of-objects shape rather than an {items,nextId} shape -
  // validates the top-level value AND each individual entry, dropping any
  // malformed entry rather than letting it propagate and crash a later read.
  function parseFrequencyState(raw) {
    if (!raw) return {};
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return {};
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    var result = {};
    for (var key in parsed) {
      if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
      var entry = parsed[key];
      if (entry && typeof entry === 'object' && typeof entry.count === 'number' && typeof entry.display === 'string') {
        result[key] = { count: entry.count, display: entry.display };
      }
    }
    return result;
  }

  function loadFrequency() {
    try {
      return parseFrequencyState(window.localStorage.getItem(FREQUENCY_KEY));
    } catch (e) {
      return {};
    }
  }

  function saveFrequency() {
    try {
      window.localStorage.setItem(FREQUENCY_KEY, JSON.stringify(frequency));
    } catch (e) {
      // localStorage unavailable - same graceful degradation as saveState.
    }
  }

  var frequency = loadFrequency();

  // Suggestion threshold (locked AC default: 2, "added at least twice
  // before") - explicitly flagged in BACKLOG.md as an easily-tunable
  // constant, not a hard product lock-in.
  var SUGGESTION_THRESHOLD = 2;

  // ---- shared name/aisle normalization -------------------------------------
  // Trim + case-fold. Used consistently as the comparison key everywhere
  // names/aisles are matched case-insensitively (S8's aisle grouping/
  // suggestion-matching, S10's frequency counter and live-list exclusion) -
  // one function, not independently re-derived in each spot, so there's no
  // risk of one call site normalizing and another comparing raw casing by
  // accident.
  function normalize(value) {
    return String(value).trim().toLowerCase();
  }

  // ---- S6: single-slot undo buffer --------------------------------------
  // Transient/in-memory only, per locked AC - deliberately never persisted,
  // so a reload always starts with no undo target. Holds exactly one of:
  //   { type: 'add',     ids: [...] }                     - S1 single add, S4 paste batch, or S10 suggestion-tap
  //   { type: 'check',   id, prevChecked }                 - S2 toggle
  //   { type: 'delete',  entries: [{ item, index }, ...] } - S3 single delete OR S12 bulk
  //                                                           clear-checked, reusing the same
  //                                                           shape generalized to N entries -
  //                                                           same "batch shares the type" precedent
  //                                                           S4's paste-batch already uses under 'add'.
  //   { type: 'reorder', id, fromIndex, toIndex }           - S13 drag-drop move (supersedes S5's
  //                                                           swap-shaped {idA,idB} - S5's Up/Down UI
  //                                                           is gone entirely, so that shape has no
  //                                                           remaining producer; undo is the inverse
  //                                                           move: splice `id` out of toIndex, back
  //                                                           in at fromIndex)
  // S7's note edits and S8's aisle edits deliberately never touch this
  // buffer in either direction (locked AC, resolving QA finding M1) - their
  // save functions simply never call setLastAction, so they neither create
  // a new undo target nor clobber whatever was already pending.
  var lastAction = null;

  function setLastAction(action) {
    lastAction = action;
  }

  function clearLastAction() {
    lastAction = null;
  }

  // ---- item lookup helpers ------------------------------------------------
  function findIndexById(id) {
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) return i;
    }
    return -1;
  }

  function nextItemId() {
    var id = state.nextId;
    state.nextId += 1;
    return id;
  }

  // ---- S10: increment the frequency counter --------------------------------
  // Shared by every add path (S1 single add, S4 paste-ingest, S10 suggestion
  // tap - the last one via the same addItem() call, "no special-case
  // needed" per locked AC). First-typed casing wins and is never overwritten
  // by later increments of the same normalized name - same tie-break
  // convention as S8's aisle-pool casing, for consistency across the app.
  function incrementFrequency(name) {
    var key = normalize(name);
    if (!key) return;
    var entry = frequency[key];
    if (!entry) {
      entry = { count: 0, display: name.trim() };
      frequency[key] = entry;
    }
    entry.count += 1;
    saveFrequency();
  }

  // ---- shared item-creation helper (S1/S4/S10 all route through this) -----
  // Centralizing item creation here means the S10 frequency increment lives
  // in exactly ONE place rather than being duplicated at both addItem() and
  // addPastedItems() call sites - avoids the realistic bug of adding the
  // increment to one add path and forgetting the other.
  function createItem(name) {
    var item = { id: nextItemId(), name: name, checked: false, note: '', aisle: '' };
    state.items.push(item);
    incrementFrequency(name);
    return item;
  }

  // ---- S1: render + single-item add + persistence ------------------------
  function addItem(name) {
    var trimmed = String(name).trim();
    if (!trimmed) return false; // no-op on empty/whitespace-only, no blank row
    // No de-duplication against existing items (QA finding M5) - adding the
    // same name twice is allowed and creates a second, independent row.
    var item = createItem(trimmed);
    setLastAction({ type: 'add', ids: [item.id] });
    saveState();
    render();
    return true;
  }

  // ---- S4: paste-to-ingest bulk add ---------------------------------------
  // PO-confirmed (QA finding R5, 2026-09-04): strip ONLY a fixed, small set
  // of copy-paste formatting-noise leading markers - a single -/*/• char, or
  // a leading number+"."/")" - each followed by whitespace, before the real
  // item text. No quantity/unit stripping, no aisle-guessing (that's S11,
  // parked, not built here).
  // Bug fix (2026-09-04, Tester TC4.3 / Scrum Master's dated S4 AC note):
  // was `\s+` only, requiring a marker be followed by real trailing
  // whitespace to be recognized. That broke on a marker-only line (e.g.
  // "- ", "1. ") - by the time this regex runs, parsePasteLines' own
  // pre-strip `.trim()` (below) has already consumed that trailing
  // whitespace, so "- " became "-" with nothing left for `\s+` to match,
  // the regex silently failed to strip anything, and the bare marker
  // character got pushed as a real item. Widening to `(?:\s+|$)` - marker
  // followed by whitespace OR by the end of the (already-trimmed) string -
  // catches exactly that residue while leaving every other case unchanged:
  // a real marker+space+text line still only matches via the `\s+` branch
  // (text after the space blocks `$`), and a no-space boundary case like
  // "-NoSpaceMarker" still doesn't match either branch (next char is
  // neither whitespace nor end-of-string), so it's still added verbatim
  // per TC4.2. Deliberately NOT restructuring parsePasteLines' trim/strip
  // order to check blankness only post-strip (Tester's alternate suggested
  // fix) - that would require re-deriving the pre-strip trim from scratch to
  // avoid breaking a marker preceded by leading whitespace (e.g. "  - Milk"),
  // which today relies on that pre-strip trim to align the regex's `^`
  // anchor with the marker. This is the smaller, lower-risk diff for the
  // same required outcome.
  var LEADING_LIST_MARKER_RE = /^(?:[-*•]|\d+[.)])(?:\s+|$)/;

  function parsePasteLines(raw) {
    // \r?\n - handles both LF and CRLF line endings (QA nitpick N1).
    var lines = raw.split(/\r?\n/);
    var names = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue; // blank lines skipped, no empty rows
      line = line.replace(LEADING_LIST_MARKER_RE, '').trim();
      // A line that was ONLY a marker glyph (with or without trailing
      // whitespace) reduces to "" here and gets the same treatment as an
      // originally-blank line - this check was already present before this
      // fix, but was effectively unreachable dead code for marker-only
      // input until the regex above was widened to actually strip it down
      // to empty in that case.
      if (!line) continue;
      names.push(line);
    }
    return names;
  }

  function addPastedItems(raw) {
    var names = parsePasteLines(raw);
    if (names.length === 0) return false; // whole-input no-op, textarea left as typed
    var ids = [];
    for (var i = 0; i < names.length; i++) {
      var item = createItem(names[i]);
      ids.push(item.id);
    }
    // Whole paste operation counts as ONE undo action, not one per line.
    setLastAction({ type: 'add', ids: ids });
    saveState();
    render();
    return true;
  }

  // ---- S2: check/uncheck --------------------------------------------------
  function toggleChecked(id) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    var item = state.items[idx];
    var prevChecked = item.checked;
    item.checked = !item.checked;
    // No auto-move-to-bottom (decided directly, see QUESTIONS.md) - position
    // in state.items is untouched, only the `checked` flag changes.
    setLastAction({ type: 'check', id: id, prevChecked: prevChecked });
    saveState();
    render();
  }

  // ---- S3 / S12 shared removal machinery ---------------------------------
  // Both "delete one item" (S3) and "clear all checked" (S12) are the same
  // operation at different N - remove a set of {item, index} entries and be
  // able to restore them to their exact original positions on undo.
  function removeEntries(entries) {
    // Highest-index-first so removing one entry doesn't shift the still-
    // pending indices out from under the remaining removals.
    var byIndexDesc = entries.slice().sort(function (a, b) { return b.index - a.index; });
    for (var i = 0; i < byIndexDesc.length; i++) {
      state.items.splice(byIndexDesc[i].index, 1);
    }
  }

  function restoreEntries(entries) {
    // Inverse of removeEntries: re-insert in ASCENDING original-index order.
    // Correct by induction - when the k-th entry (ascending) is restored,
    // every item that was originally before it is already back in the
    // array: either it was never removed, or it's one of the k-1 entries
    // already restored ahead of it in this same loop.
    var byIndexAsc = entries.slice().sort(function (a, b) { return a.index - b.index; });
    for (var i = 0; i < byIndexAsc.length; i++) {
      state.items.splice(byIndexAsc[i].index, 0, byIndexAsc[i].item);
    }
  }

  // ---- S3: delete a single item -------------------------------------------
  function deleteItem(id) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    var entry = { item: state.items[idx], index: idx };
    removeEntries([entry]);
    setLastAction({ type: 'delete', entries: [entry] });
    saveState();
    render();
    // Resolved 2026-09-04 (QA finding R2, PO Option A): brief toast at the
    // moment of deletion, IN ADDITION TO the always-visible Undo control -
    // purely a UI surfacing, not a new undo-eligibility rule.
    showToast('Deleted "' + entry.item.name + '" — Undo');
  }

  // ---- S12: clear all checked items in one atomic action ------------------
  function clearCheckedItems() {
    var entries = [];
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].checked) entries.push({ item: state.items[i], index: i });
    }
    if (entries.length === 0) return; // no-op, nothing checked
    removeEntries(entries);
    // Undo-eligible as ONE atomic action (locked AC) - same 'delete' shape
    // S3 uses, just generalized to N entries.
    setLastAction({ type: 'delete', entries: entries });
    saveState();
    render();
    // Does NOT touch S10's frequency counter in either direction - true by
    // construction, this function never reads/writes that storage key.
    showToast('Cleared ' + entries.length + ' item' + (entries.length === 1 ? '' : 's') + ' — Undo');
  }

  // ---- S13: drag-and-drop reorder (supersedes S5's Up/Down buttons) -------
  // Locked AC, 2026-09-08 (6 rounds of QA hardening - drop-position rule,
  // jitter tolerance, out-of-bounds clamp, pointercancel abort, then
  // M9-M12, then M15's tie-break). Built on raw Pointer Events specifically
  // (not a touch-only listener) so it's Playwright-automatable and behaves
  // consistently across mouse/touch/pen. No dedicated drag-handle icon -
  // the whole row (outside the other nested controls) is the drag surface,
  // a Developer-level choice explicitly left open by the AC; this also
  // avoids adding yet another icon to the row S14 just finished shrinking
  // for space.
  //
  // Three-phase state machine, deliberately kept as two separate variables
  // rather than one - `dragArm` (during the pickup delay, before anything
  // visible has happened) and `dragState` (an actual drag is underway) have
  // different shapes and different valid transitions, and conflating them
  // risked exactly the kind of "is this armed or dragging" ambiguity bugs
  // like this tend to produce:
  //   dragArm   = { pointerId, id, startX, startY, timerId }
  //   dragState = { pointerId, id, startIndex, otherIds, currentIndex,
  //                 rowEl, placeholderEl, scrollDir, lastClientX,
  //                 lastClientY, rafId }
  var DRAG_PICKUP_DELAY_MS = 450; // Developer-level tuning detail, not PO-locked - long enough that an ordinary scroll/tap never accidentally arms a pickup
  var DRAG_JITTER_TOLERANCE_PX = 10; // Developer-level tuning detail, not PO-locked
  var DRAG_EDGE_ZONE_PX = 56; // auto-scroll trigger-zone size, Developer-level tuning detail
  var DRAG_EDGE_SCROLL_SPEED = 14; // px/frame while inside the edge zone, Developer-level tuning detail

  var dragArm = null;
  var dragState = null;
  // Set the instant a real pickup begins (see beginDrag), consumed by the
  // very next 'click' event (see the click listener below). Needed because
  // `rowEl.setPointerCapture()` (below) redirects the eventual pointerup -
  // and therefore the browser's own trailing synthetic `click` - back onto
  // the ORIGINAL row element regardless of where the pointer physically
  // ended up, which would otherwise cross the item off as an unwanted side
  // effect of every successful (or no-op) drag.
  var suppressNextClick = false;

  // Arms the suppression above. Split into its own function rather than a
  // bare assignment specifically to attach a safety-net expiry: a real
  // trailing `click` reliably follows the pointerup that ends a genuine
  // drag (browsers generate one via the captured pointer regardless of how
  // far it moved - this is exactly why the suppression is needed at all),
  // but this flag must never stay armed indefinitely waiting for one, in
  // case some browser/input-device quirk ever skips it without going
  // through a proper `pointercancel`. 250ms comfortably covers a real
  // click's arrival while being far shorter than DRAG_PICKUP_DELAY_MS, so it
  // can't bleed into some later, unrelated gesture's own click.
  function armClickSuppression() {
    suppressNextClick = true;
    setTimeout(function () { suppressNextClick = false; }, 250);
  }

  // Returns every real row <li> currently in the DOM except the one being
  // dragged - i.e. exactly `otherIds`, in current display order. Drag is
  // manual-sort-only (guarded at pointerdown, below), so DOM order matches
  // state.items order 1:1 with no group-header rows in between.
  function getOtherRowElements() {
    var all = listRoot.querySelectorAll('li[data-id]');
    var rows = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i] !== dragState.rowEl) rows.push(all[i]);
    }
    return rows;
  }

  // Drop-position rule (locked AC testability-check finding #1): whether the
  // pointer sits above or below the midpoint of the row it's currently over
  // determines insert-before vs. insert-after that row. A pointer above the
  // very first row, or past the very last row's midpoint, clamps to the
  // nearest boundary (testability-check finding #3) rather than treating it
  // as a no-match - this same function serves both the live placeholder
  // position AND the eventual drop target, since they're the same
  // computation run continuously.
  function computeInsertionIndex(rows, clientY) {
    if (rows.length === 0) return 0;
    var firstRect = rows[0].getBoundingClientRect();
    if (clientY < firstRect.top) return 0;
    for (var i = 0; i < rows.length; i++) {
      var rect = rows[i].getBoundingClientRect();
      var mid = rect.top + rect.height / 2;
      if (clientY < mid) return i;
    }
    return rows.length; // past the last row's midpoint (or past its bottom edge, out-of-bounds) - clamp to the end
  }

  function movePlaceholderTo(rows, target) {
    var placeholder = dragState.placeholderEl;
    var ul = listRoot.querySelector('ul.items');
    if (!ul) return; // defensive - can't happen mid-drag (the list can't have gone empty while an item is still being dragged)
    if (target >= rows.length) {
      ul.appendChild(placeholder);
    } else {
      rows[target].parentNode.insertBefore(placeholder, rows[target]);
    }
  }

  // Deliberately does NOT call render() - a full DOM rebuild on every single
  // pointermove would be wasteful (Developer sanity-check note) and would
  // also destroy the very placeholder/dragging-row elements this function
  // and its caller depend on. Only a raw `insertBefore` of the lightweight
  // placeholder element moves; state.items itself is untouched until drop.
  function updateDragPosition(clientX, clientY) {
    dragState.lastClientX = clientX;
    dragState.lastClientY = clientY;
    var vh = window.innerHeight;
    if (clientY < DRAG_EDGE_ZONE_PX) dragState.scrollDir = -1;
    else if (clientY > vh - DRAG_EDGE_ZONE_PX) dragState.scrollDir = 1;
    else dragState.scrollDir = 0;
    var rows = getOtherRowElements();
    var target = computeInsertionIndex(rows, clientY);
    if (target === dragState.currentIndex) return;
    dragState.currentIndex = target;
    movePlaceholderTo(rows, target);
  }

  // PO-required auto-scroll (2026-09-08, resolving Developer's sanity-check
  // question - "the grocery lists can sometimes be quite long... that level
  // of complexity is unfortunately important"): while the pointer stays near
  // the top/bottom edge of the viewport during an active drag, keep scrolling
  // in that direction for as long as it stays there, re-deriving the
  // insertion point after each scroll tick since scrolling moves every row's
  // viewport-relative rect even though the pointer itself hasn't moved.
  function startAutoScrollLoop() {
    function tick() {
      if (!dragState) return;
      if (dragState.scrollDir !== 0) {
        window.scrollBy(0, dragState.scrollDir * DRAG_EDGE_SCROLL_SPEED);
        updateDragPosition(dragState.lastClientX, dragState.lastClientY);
      }
      dragState.rafId = requestAnimationFrame(tick);
    }
    dragState.rafId = requestAnimationFrame(tick);
  }

  // Takes the drag-state snapshot explicitly rather than reading the
  // module-level `dragState` variable itself - endDrag() below nulls that
  // out FIRST, before calling this, specifically so tick()'s own
  // `if (!dragState) return` guard is already live for any frame that might
  // somehow still be in flight, and this function's own cancelAnimationFrame
  // call is pure belt-and-suspenders on top of that, not the only line of
  // defense.
  function stopAutoScrollLoop(ds) {
    if (ds && ds.rafId) cancelAnimationFrame(ds.rafId);
  }

  function beginDrag(id, li, pointerId) {
    dragArm = null;
    // Cross-row commit guarantee (locked AC): starting a pickup must commit,
    // never silently discard, a note/aisle draft still open on a DIFFERENT
    // row - same "unrelated action" treatment S7/S8 already require of
    // Undo/reorder/add. (A SAME-row open editor can never reach this point
    // at all - see the pointerdown guard below, QA finding M9 - so any
    // `editingField` still set here is guaranteed to belong to some other
    // row.)
    if (editingField) commitEditor();
    var idx = findIndexById(id);
    if (idx === -1) return; // defensive - the row can't actually vanish between pointerdown and now (committing an editor doesn't delete rows), but never assume
    // Bug fix (2026-09-09, QA finding C1 - real, reproducible crash, not
    // hypothetical): the `li` parameter above is a DOM reference captured at
    // `pointerdown` time, up to DRAG_PICKUP_DELAY_MS ago. `commitEditor()`
    // just above (or, more generally, ANY other mutating action that
    // happened to run during that same arming delay - an Undo, an add, a
    // delete elsewhere, not only a cross-row editor commit) runs a full
    // render() - renderList()'s `innerHTML` rebuild - which destroys and
    // replaces EVERY <li> in the list, including this one. From that point
    // on the original `li` is a detached node (`parentNode === null`), even
    // though `id` itself is still perfectly valid in `state.items` (the
    // `idx` check above only guards the DATA model, not this DOM reference -
    // exactly the gap that let a detached-node crash through). Re-fetching
    // the CURRENT live element by id - the same "never trust a reference
    // across a render, re-derive fresh" discipline `idx` above already
    // follows - fixes this at the root for every cause of staleness, not
    // just the one specific repro QA found, rather than special-casing
    // detachment defensively line by line further down.
    li = listRoot.querySelector('li[data-id="' + id + '"]');
    if (!li) return; // defensive - can't actually happen (idx above already confirmed the item is still in state.items, and render() unconditionally renders every state.items entry as its own <li>), but never assume
    armClickSuppression();
    try { li.setPointerCapture(pointerId); } catch (e) { /* QA finding M18: this only catches setPointerCapture THROWING outright - it doesn't cover capture silently not being honored. Without real capture, once the pointer moves outside listRoot's own bounds entirely (e.g. released over the header, per the out-of-bounds AC scenario), a pointerup/pointercancel dispatched there via ordinary hit-testing never bubbles through listRoot at all, so the delegated listeners below would never fire - leaving dragState (and drag-active's touch-action:none) stuck indefinitely, the same stuck-state failure family as C1. The document-level fallback listeners further down exist specifically to cover that gap. */ }
    li.classList.add('dragging');
    listRoot.classList.add('drag-active'); // QA finding M12: suppresses ordinary touch-scroll for the drag's duration - auto-scroll above is the only scrolling allowed while this class is present
    var placeholder = document.createElement('li');
    placeholder.className = 'drag-placeholder';
    li.parentNode.insertBefore(placeholder, li.nextSibling);
    var otherIds = [];
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id !== id) otherIds.push(state.items[i].id);
    }
    dragState = {
      pointerId: pointerId, id: id, startIndex: idx, otherIds: otherIds,
      // Inserting at `idx` within `otherIds` exactly reproduces the
      // original array (otherIds is state.items with this one id removed,
      // so everything before `idx` is unchanged and everything from `idx`
      // on shifts back into place) - this is also exactly M11's no-op
      // tie-break condition: currentIndex still equal to startIndex at drop
      // time means nothing actually moved.
      currentIndex: idx,
      rowEl: li, placeholderEl: placeholder, scrollDir: 0,
      lastClientX: 0, lastClientY: 0, rafId: null
    };
    startAutoScrollLoop();
  }

  // aborted=true is a `pointercancel` (QA finding R9): abort entirely, no
  // commit, no undo entry, item snaps back to its original position (true
  // by construction - state.items was never touched during the drag, only
  // the placeholder moved) - a pointercancel is never treated as an implicit
  // drop. aborted=false is a normal `pointerup`: commit the move UNLESS
  // it's a same-position no-op (M11/M15 - no undo entry either, since the
  // resulting order is provably identical either way).
  function endDrag(aborted) {
    var ds = dragState;
    dragState = null; // cleared FIRST - see stopAutoScrollLoop()'s own comment for why the ordering matters
    stopAutoScrollLoop(ds);
    try { ds.rowEl.releasePointerCapture(ds.pointerId); } catch (e) { /* already released, or capture was never supported - harmless either way */ }
    ds.rowEl.classList.remove('dragging');
    listRoot.classList.remove('drag-active');
    if (ds.placeholderEl.parentNode) ds.placeholderEl.parentNode.removeChild(ds.placeholderEl);
    if (aborted) {
      // No trailing `click` will ever fire for a cancelled pointer (per the
      // Pointer Events spec, a pointercancel means the compatibility mouse
      // events - including the eventual click - never fire at all) - don't
      // leave the flag armed to wrongly swallow some LATER, unrelated tap.
      suppressNextClick = false;
    } else if (ds.currentIndex !== ds.startIndex) {
      var byId = {};
      for (var i = 0; i < state.items.length; i++) byId[state.items[i].id] = state.items[i];
      var newIds = ds.otherIds.slice();
      newIds.splice(ds.currentIndex, 0, ds.id);
      var rebuilt = [];
      for (var j = 0; j < newIds.length; j++) rebuilt.push(byId[newIds[j]]);
      state.items = rebuilt;
      setLastAction({ type: 'reorder', id: ds.id, fromIndex: ds.startIndex, toIndex: ds.currentIndex });
      saveState();
    }
    // else: same-position no-op (M11/M15) - no mutation, no undo entry, but
    // the pointerup that ended this drag still generates a trailing `click`
    // on the captured row (setPointerCapture redirects it there) -
    // `suppressNextClick` stays armed from beginDrag() to swallow exactly
    // that one click, so a no-op drag doesn't ALSO cross the item off.
    render();
  }

  // ---- S6: perform the undo -------------------------------------------------
  function performUndo() {
    if (!lastAction) return;
    var action = lastAction;
    if (action.type === 'add') {
      var idSet = {};
      for (var i = 0; i < action.ids.length; i++) idSet[action.ids[i]] = true;
      state.items = state.items.filter(function (it) { return !idSet[it.id]; });
    } else if (action.type === 'check') {
      var idx = findIndexById(action.id);
      if (idx !== -1) state.items[idx].checked = action.prevChecked;
    } else if (action.type === 'delete') {
      restoreEntries(action.entries);
    } else if (action.type === 'reorder') {
      // Inverse of a drag-drop move (S13): pull the item out from wherever
      // it landed and reinsert it at its exact prior position. By
      // construction this is always the single most recent mutating action
      // when reached here (S6's single-slot buffer - any other mutation in
      // between would have overwritten `lastAction` already), so
      // `findIndexById` is guaranteed to find it at `action.toIndex`
      // exactly; re-deriving via lookup rather than trusting the stored
      // index directly is just this file's usual defensive style.
      var reorderIdx = findIndexById(action.id);
      if (reorderIdx !== -1) {
        var reorderItem = state.items[reorderIdx];
        state.items.splice(reorderIdx, 1);
        state.items.splice(action.fromIndex, 0, reorderItem);
      }
    }
    // Undo itself is not further undoable (no redo) - clears the buffer and
    // the control disables until a new mutating action creates a fresh
    // target.
    clearLastAction();
    saveState();
    render();
  }

  // ---- S7: notes / S8: aisles ------------------------------------------------
  // Both fields are optional, per-item, edited inline via the same kind of
  // "tap a small affordance, an input appears, blur/Enter saves" mechanic -
  // one shared editor mechanism (`editingField`) rather than two separate
  // ones, per the Sprint-2 plan.
  //
  // Developer sanity-check finding, 2026-09-04 (real landmine, same
  // treatment as S1's storage-shape note - now a locked AC requirement on
  // both S7 and S8): this is the app's first multi-keystroke, in-progress
  // UI state. Every other mutation (check/delete/reorder/add) fires its
  // complete action in one atomic step, so `renderList()`'s full rebuild
  // was always safe. A note/aisle edit is different - the user types over
  // several keystrokes before confirming, and an UNRELATED action elsewhere
  // (Undo, a different row's reorder, a new add) can trigger a render mid-
  // edit. `editingField` lives outside `state` specifically so it survives
  // that rebuild - renderList() consults it on every render (regardless of
  // what triggered that render) and re-opens the same editor with the same
  // in-progress draft text, exactly the same capture-before-rebuild/
  // restore-after shape as the keyboard-focus-preservation fix shipped for
  // S1/S2/S5.
  // S7 note-toggle icon glyph. History (2026-09-08): the first two candidate
  // rounds (obscure "document" codepoints U+1F5CB/U+1F5CE, then Developer's
  // own emoji suggestions) both got rejected - the emoji suggestions on
  // aesthetic grounds (PO explicitly wants plain Unicode symbol/dingbat
  // glyphs, not colorful emoji-style pictographs, the same family S16's ⚑
  // pick belongs to), and separately U+1F5CB/U+1F5CE turned out to render
  // IDENTICALLY to each other on the PO's own Windows machine - a font-
  // fallback gap in that obscure Unicode sub-block, not tofu (this test
  // browser's own automated pixel/tofu-check correctly found no tofu for
  // either, since this machine's font DOES distinguish them - the collapse
  // is PO-device-specific, a real gap beyond what a tofu-check alone can
  // catch). PO decision, 2026-09-09 (after sleeping on it): keep U+1F5CB
  // anyway - "i think the current icon in option #1 is fine. i know it's
  // not exactly rendering as expected but after sleeping on it i think it's
  // good." Confirmed via a canvas pixel-color check (this test browser
  // only, same device caveat as above) that this glyph is a plain,
  // monochrome, CSS-`color`-inheriting outline glyph here - NOT a baked-
  // color emoji rendering - same text-colorable category as S16's ⚑ pick,
  // even though it happens to use the default `.icon-btn` muted-gray color
  // rather than a mode-specific accent color the way S16's does.
  var NOTE_TOGGLE_ICON_GLYPH = '🗋';

  var editingField = null; // { id, field: 'note'|'aisle', draft }

  function openEditor(id, field) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    if (editingField && editingField.id === id && editingField.field === field) {
      return; // already open for this exact field - don't reset the in-progress draft
    }
    // Bug fix (2026-09-08, caught by Playwright verification pass): if a
    // DIFFERENT editor was already open (same row's other field, or a
    // different row entirely) and never got a chance to blur/commit
    // naturally, simply overwriting `editingField` below would silently
    // discard its in-progress draft - exactly the "not silently discarded"
    // requirement the locked AC already states for S7/S8, just reachable via
    // a path (opening a second editor) beyond the one already handled
    // (an unrelated re-render). Worse, deferring that commit to whenever the
    // old input's element eventually gets removed from the DOM (which does
    // fire a native blur/focusout, since it's still attached at removal
    // time) creates a real reentrancy hazard: that stale focusout's delegated
    // handler would call commitEditor() using whatever `editingField` is
    // CURRENT at that moment - which by then already points at the NEW
    // field - so it would wrongly save the new field's (empty) draft under
    // the old field's save function, then null out the very `editingField`
    // this function is about to set up, leaving the newly-opened editor
    // dead on arrival. Committing explicitly, synchronously, right here -
    // before `editingField` changes at all - avoids both problems in one
    // stroke.
    if (editingField) {
      commitEditor();
    }
    var current = state.items[idx][field] || '';
    editingField = { id: id, field: field, draft: current };
    render();
    // Bug fix (2026-09-08, caught by Playwright verification pass): render()'s
    // generic focus-restore logic (see renderList()) only re-targets an
    // element sharing the SAME data-role as whatever was focused before the
    // rebuild. Opening the editor changes the focused control's role (the
    // clicked 'note-toggle'/'aisle-toggle' affordance is replaced by a
    // 'note-input'/'aisle-input' in the new render), so that generic path
    // never finds a match and falls back to focusing the <li> itself,
    // leaving the freshly-shown text input completely unfocused - the user's
    // keystrokes went nowhere, and since no real <input> ever had focus, no
    // `focusout` ever fired to commit/close it either, so the editor could
    // get stuck open indefinitely once another action elsewhere re-rendered
    // the list. Handle this one specific transition directly: explicitly
    // focus the new editor input (and place the cursor at the end, matching
    // the same convention renderList() already uses elsewhere).
    var input = listRoot.querySelector('li[data-id="' + id + '"] [data-role="' + field + '-input"]');
    if (input) {
      input.focus();
      if (typeof input.setSelectionRange === 'function') {
        var len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  }

  function updateDraft(value) {
    // Deliberately NOT calling render() per keystroke - the input's own DOM
    // value is already the source of truth while the user is actively
    // typing; `editingField.draft` only matters as a fallback for whatever
    // render() gets triggered by something ELSE mid-edit. Re-rendering (and
    // therefore rebuilding the DOM) on every keystroke would also fight the
    // browser's own cursor-position handling for no benefit.
    if (editingField) editingField.draft = value;
  }

  function commitEditor() {
    if (!editingField) return;
    var current = editingField;
    editingField = null;
    if (current.field === 'note') {
      saveNote(current.id, current.draft);
    } else {
      saveAisle(current.id, current.draft);
    }
  }

  function saveNote(id, rawValue) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    // Whitespace-only trims to empty (reverts to the discreet "add note"
    // affordance) - same precedent as S1's item-name handling (QA finding
    // M6), applied here per S7's own explicit AC restatement of it.
    state.items[idx].note = String(rawValue).trim();
    // Note edits are NOT undo-eligible and do NOT clobber the pending undo
    // target (locked AC, resolving QA M1) - achieved for free by simply
    // never calling setLastAction anywhere in this function.
    saveState();
    render();
  }

  function saveAisle(id, rawValue) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    // Same whitespace-only-trims-to-empty treatment as notes, extended here
    // for consistency (not separately restated in S8's own AC text, but the
    // same underlying precedent applies - an aisle value the user backspaced
    // to nothing should revert to "Unassigned", not save as literal
    // whitespace).
    state.items[idx].aisle = String(rawValue).trim();
    saveState();
    render();
  }

  // S8: starter suggestion list (Developer-level content detail per locked
  // AC - exact wording freely adjustable, not a product requirement).
  var AISLE_STARTER_LIST = ['Produce', 'Dairy', 'Meat/Seafood', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Other'];

  // S16 (Locked, 2026-09-08): glyph for the new icon-only "edit aisle"
  // affordance shown while sorted By Aisle (see renderRow()). FINAL, PO's
  // pick from s16-aisle-icon-picker.html's candidate comparison, 2026-09-08:
  // U+2691 BLACK FLAG - chosen specifically because it's a plain monochrome,
  // text-colorable dingbat (not a colored emoji), so it can inherit the
  // aisle-tag's own accent color instead of looking like a mismatched
  // colored sticker (see the `.aisle-sort-icon` color rule in style.css,
  // scoped narrowly to this icon's aisle-sort-mode rendering specifically -
  // deliberately NOT applied to S8's separate, still-neutral "Add aisle"
  // empty-state icon in Manual/Alphabetical mode, to avoid an unintended
  // side effect there). Still centralized to this one constant so any
  // future swap stays a one-line change.
  var AISLE_EDIT_ICON_GLYPH = '⚑';

  // Locked AC, 2026-09-04 (Scrum Master, resolving Tester's testability-check
  // question): the datalist pool is NOT just the static starter list - it
  // also includes every distinct free-typed aisle value currently used
  // somewhere in the live list, deduplicated via the same normalized
  // (trimmed, case-folded) comparison used for grouping, with whichever
  // casing was entered chronologically first winning the merge.
  //
  // Two Developer-level interpretation choices, disclosed rather than
  // silently assumed: (1) "used elsewhere in the list" is read as a LIVE
  // derived scan of state.items' current aisle values, not a separately
  // persisted permanent history - a custom aisle stops being suggested once
  // no current item uses it anymore, no new storage key needed for this;
  // (2) "chronologically first" is approximated as first-occurrence-in-
  // state.items'-current-array-order rather than a true edit timestamp - a
  // cosmetic-only tie-break (which casing DISPLAYS in the merged suggestion
  // entry), never affects what's actually stored on any individual item, so
  // a rare reordering-perturbs-the-tie-break edge case has no functional
  // consequence. A static starter-list entry always keeps its own curated
  // casing even if a later free-typed value only differs by case - only
  // genuinely new (non-static) values get their casing from first usage.
  function getAislePool() {
    var seen = {};
    var pool = [];
    var i;
    for (i = 0; i < AISLE_STARTER_LIST.length; i++) {
      var starterKey = normalize(AISLE_STARTER_LIST[i]);
      if (!seen[starterKey]) {
        seen[starterKey] = true;
        pool.push(AISLE_STARTER_LIST[i]);
      }
    }
    for (i = 0; i < state.items.length; i++) {
      var aisle = state.items[i].aisle;
      if (!aisle) continue;
      var key = normalize(aisle);
      if (!seen[key]) {
        seen[key] = true;
        pool.push(aisle);
      }
    }
    return pool;
  }

  function getAisleDisplayMap() {
    var pool = getAislePool();
    var map = {};
    for (var i = 0; i < pool.length; i++) {
      map[normalize(pool[i])] = pool[i];
    }
    return map;
  }

  // ---- S9: sort view (view-only, never rewrites state.items' own order) ---
  // In-memory only, per locked AC - does not persist across reload (always
  // resets to 'manual').
  var sortMode = 'manual'; // 'manual' | 'alpha' | 'aisle'

  function compareByName(a, b) {
    return normalize(a.name).localeCompare(normalize(b.name));
  }

  // Returns a SORTED COPY - `.slice()` before `.sort()` is the one thing
  // this function must never skip. `Array.prototype.sort()` mutates in
  // place; calling it directly on `state.items` would silently violate the
  // AC's core "sorting never rewrites the stored order" guarantee (flagged
  // explicitly during Developer sanity-check as the one easy, tempting
  // shortcut to avoid here).
  function getSortedItems() {
    if (sortMode === 'alpha') {
      return state.items.slice().sort(compareByName);
    }
    if (sortMode === 'aisle') {
      return state.items.slice().sort(function (a, b) {
        var aKey = a.aisle ? normalize(a.aisle) : null;
        var bKey = b.aisle ? normalize(b.aisle) : null;
        // "Unassigned" (no aisle) always sorts last, regardless of alnum
        // order - never just falls out of a plain string comparison.
        if (aKey === null && bKey === null) return compareByName(a, b);
        if (aKey === null) return 1;
        if (bKey === null) return -1;
        if (aKey !== bKey) return aKey < bKey ? -1 : 1;
        return compareByName(a, b); // alphabetical tie-break within a group
      });
    }
    return state.items.slice(); // 'manual' - same order as state.items itself
  }

  // ---- S10: "What am I missing?" suggestions -------------------------------
  function getLiveNameSet() {
    var set = {};
    for (var i = 0; i < state.items.length; i++) {
      set[normalize(state.items[i].name)] = true;
    }
    return set;
  }

  function getSuggestions() {
    var liveNames = getLiveNameSet();
    var list = [];
    for (var key in frequency) {
      if (!Object.prototype.hasOwnProperty.call(frequency, key)) continue;
      var entry = frequency[key];
      if (entry.count >= SUGGESTION_THRESHOLD && !liveNames[key]) {
        list.push({ name: entry.display, count: entry.count });
      }
    }
    list.sort(function (a, b) { return b.count - a.count; });
    return list;
  }

  function addSuggestion(name) {
    // "Adds it to the live list via the same mechanic as S1's single add...
    // no special-case needed" (locked AC) - literally the same function,
    // which already increments the frequency counter again via createItem().
    addItem(name);
  }

  // ---- DOM wiring -----------------------------------------------------------
  var listRoot = document.getElementById('list-root');
  var undoBtn = document.getElementById('undo-btn');
  var clearCheckedBtn = document.getElementById('clear-checked-btn');
  var addForm = document.getElementById('add-form');
  var addInput = document.getElementById('add-input');
  var pasteForm = document.getElementById('paste-form');
  var pasteInput = document.getElementById('paste-input');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var sortSelect = document.getElementById('sort-select');
  var aisleDatalist = document.getElementById('aisle-options');
  var suggestionsRoot = document.getElementById('suggestions-root');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderRow(item) {
    var safeName = escapeHtml(item.name);
    var noteVal = item.note || '';
    var aisleVal = item.aisle || '';
    var isEditingNote = !!editingField && editingField.id === item.id && editingField.field === 'note';
    var isEditingAisle = !!editingField && editingField.id === item.id && editingField.field === 'aisle';

    // Primary line: name + delete (S13's drag pickup is the whole row
    // itself, no dedicated button), same locked single-line spec as
    // before - only shows a note/aisle AFFORDANCE icon here (not the full
    // content), and only when that field is both empty and not currently
    // being edited (avoids a redundant icon next to that same field's own
    // open editor/display on the second line).
    var noteAffordance = (!noteVal && !isEditingNote)
      ? '<button type="button" class="icon-btn" data-role="note-toggle" title="Add note">' + NOTE_TOGGLE_ICON_GLYPH + '</button>'
      : '';

    // S16 (Locked, 2026-09-08): while sorted By Aisle specifically, the
    // passive full-text aisle tag on the second line is suppressed (the
    // group header already conveys the aisle - see renderList()) and
    // replaced by this SAME icon-only affordance regardless of whether the
    // item already has a value or is Unassigned (QA finding M13 - one
    // consistent icon for the whole column in this mode, not two different
    // icons depending on each row's state). Scoped to non-editing display
    // only (Developer sanity-check finding) - `isEditingAisle` always wins
    // below and renders the real editor input exactly as in every other
    // sort mode, completely unaffected by sortMode; tapping this icon opens
    // that same editor pre-filled with the item's real current value (or
    // empty if Unassigned), via the exact same 'aisle-toggle' role/handler
    // S8 already wires up - no new click-handling code needed.
    var aisleSortCompact = sortMode === 'aisle' && !isEditingAisle;
    // Disclosed addition beyond the literal glyph swap (2026-09-08): the PO's
    // own reasoning for picking this glyph was specifically about color -
    // "it can inherit the aisle-tag's existing text color instead of
    // looking like a mismatched colored sticker." That's only true if this
    // icon actually GETS that color treatment, which nothing did before this
    // - `aisle-sort-icon` is a class added ONLY in the aisleSortCompact
    // branch (not S8's separate, still-neutral empty-state "Add aisle" icon
    // in Manual/Alphabetical mode below), so the accent-color rule in
    // style.css stays scoped to exactly the context the PO was reasoning
    // about, without recoloring the unrelated pre-existing icon.
    var aisleAffordance = (!isEditingAisle && (aisleSortCompact || !aisleVal))
      ? '<button type="button" class="icon-btn' + (aisleSortCompact ? ' aisle-sort-icon' : '') + '" data-role="aisle-toggle" title="' + (aisleVal ? 'Edit aisle' : 'Add aisle') + '">' + AISLE_EDIT_ICON_GLYPH + '</button>'
      : '';

    // Second line (locked AC, S7/S8): a row with a non-empty note/aisle (or
    // either editor currently open) may grow to a second line to fit it;
    // `flex-basis: 100%` (style.css) is what forces this onto its own line
    // within the wrapping flex row rather than sitting beside the controls.
    // A row with neither stays exactly as tall as S1/S2's locked single-
    // line spec - this div simply isn't rendered at all in that case.
    //
    // S16: the aisle tag specifically is suppressed here while
    // `aisleSortCompact` (sorted By Aisle, not currently editing) - it moved
    // to the icon-only affordance on the primary line above instead. The
    // outer "does this row need a second line at all" check below must
    // account for that suppression too, not just check the raw `aisleVal`
    // flag - otherwise a row with an aisle but no note would still open an
    // empty `<div class="row-meta">` while sorted By Aisle (content-less but
    // still occupying a sliver of vertical space via its own margin),
    // exactly the second-line growth this story exists to avoid.
    var showsNoteLine = isEditingNote || noteVal;
    var showsAisleLine = isEditingAisle || (aisleVal && !aisleSortCompact);
    var secondLine = '';
    if (showsNoteLine || showsAisleLine) {
      secondLine += '<div class="row-meta">';
      if (isEditingNote) {
        secondLine += '<input type="text" class="row-meta-input" data-role="note-input" placeholder="Note…" value="' + escapeHtml(editingField.draft) + '">';
      } else if (noteVal) {
        secondLine += '<button type="button" class="note-display" data-role="note-toggle" title="Edit note">' + escapeHtml(noteVal) + '</button>';
      }
      if (isEditingAisle) {
        secondLine += '<input type="text" class="row-meta-input" list="aisle-options" data-role="aisle-input" placeholder="Aisle…" value="' + escapeHtml(editingField.draft) + '">';
      } else if (aisleVal && !aisleSortCompact) {
        secondLine += '<button type="button" class="aisle-tag" data-role="aisle-toggle" title="Edit aisle">' + escapeHtml(aisleVal) + '</button>';
      }
      secondLine += '</div>';
    }

    return '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '"' +
      ' role="checkbox" tabindex="0" aria-checked="' + (item.checked ? 'true' : 'false') + '" aria-label="' + safeName + '">' +
      '<span class="item-name">' + safeName + '</span>' +
      noteAffordance + aisleAffordance +
      '<button type="button" class="icon-btn delete-btn" data-role="delete" title="Delete">✕</button>' +
      secondLine +
      '</li>';
  }

  function renderList() {
    // Bug fix (2026-09-04, self-caught during nested-control-precedence
    // testing of the whole-row-tap change): a full `innerHTML` rebuild
    // destroys and recreates every row, including whatever currently has
    // keyboard focus OR an open note/aisle editor. Captures which element
    // (the row itself, a nested button by role, or the open editor input)
    // had focus before the rebuild, and restores focus (and cursor
    // position, for text inputs) onto the equivalent new element after.
    var focusedId = null;
    var focusedRole = null; // null = the <li> itself, not a nested control
    var active = document.activeElement;
    if (active && listRoot.contains(active)) {
      var activeLi = active.closest('li[data-id]');
      if (activeLi) {
        focusedId = activeLi.dataset.id;
        focusedRole = (active !== activeLi && active.dataset) ? active.dataset.role : null;
      }
    }

    if (state.items.length === 0) {
      // Clear empty state, not a blank screen.
      listRoot.innerHTML = '<p class="empty-state">No items yet — add one above to get started.</p>';
      return;
    }

    // S9: iterate the SORTED VIEW for display only - every mutation
    // function (findIndexById, S13's drag-drop endDrag, removeEntries/
    // restoreEntries) keeps operating on `state.items`' own true order,
    // completely independent of whatever's rendered here.
    var displayItems = getSortedItems();
    var aisleDisplayMap = sortMode === 'aisle' ? getAisleDisplayMap() : null;
    var lastGroupKey; // undefined initially - first item's group always renders a header in aisle mode

    var html = '<ul class="items">';
    for (var i = 0; i < displayItems.length; i++) {
      var item = displayItems[i];

      if (sortMode === 'aisle') {
        var groupKey = item.aisle ? normalize(item.aisle) : '';
        if (groupKey !== lastGroupKey) {
          lastGroupKey = groupKey;
          var groupLabel = groupKey ? aisleDisplayMap[groupKey] : 'Unassigned';
          html += '<li class="aisle-group-header">' + escapeHtml(groupLabel) + '</li>';
        }
      }

      html += renderRow(item);
    }
    html += '</ul>';
    listRoot.innerHTML = html;

    if (focusedId !== null) {
      var newLi = listRoot.querySelector('li[data-id="' + focusedId + '"]');
      if (newLi) {
        var toFocus = focusedRole ? newLi.querySelector('[data-role="' + focusedRole + '"]') : newLi;
        if (toFocus) {
          toFocus.focus();
          if (typeof toFocus.setSelectionRange === 'function' && (toFocus.tagName === 'INPUT' || toFocus.tagName === 'TEXTAREA')) {
            var len = toFocus.value.length;
            toFocus.setSelectionRange(len, len); // cursor to end, not just "focused somewhere"
          }
        } else {
          // Previously-focused nested control no longer applies (e.g. focus
          // was on Up and this row is now first) - fall back to the row
          // itself rather than dropping focus entirely.
          newLi.focus();
        }
      }
      // If newLi itself is gone (e.g. this row was just deleted), there's
      // nothing sensible of "the same element" left to restore focus onto -
      // deliberately not guessing a fallback target here.
    }
  }

  function renderUndoButton() {
    undoBtn.disabled = !lastAction;
  }

  function renderClearCheckedButton() {
    var anyChecked = false;
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].checked) { anyChecked = true; break; }
    }
    clearCheckedBtn.disabled = !anyChecked;
  }

  function renderAisleDatalist() {
    var pool = getAislePool();
    var html = '';
    for (var i = 0; i < pool.length; i++) {
      html += '<option value="' + escapeHtml(pool[i]) + '"></option>';
    }
    aisleDatalist.innerHTML = html;
  }

  function renderSuggestions() {
    var suggestions = getSuggestions();
    if (suggestions.length === 0) {
      suggestionsRoot.innerHTML = '';
      suggestionsRoot.hidden = true;
      return;
    }
    suggestionsRoot.hidden = false;
    var html = '<span class="suggestions-label">What am I missing?</span>';
    for (var i = 0; i < suggestions.length; i++) {
      html += '<button type="button" class="suggestion-chip" data-name="' + escapeHtml(suggestions[i].name) + '">' + escapeHtml(suggestions[i].name) + '</button>';
    }
    suggestionsRoot.innerHTML = html;
  }

  function render() {
    renderList();
    renderUndoButton();
    renderClearCheckedButton();
    renderAisleDatalist();
    renderSuggestions();
    // S13: cursor affordance only - draggability itself is gated at
    // pointerdown time (see the listener below) by the same `sortMode`
    // check, this class just gives a visual "grab" cursor hint in Manual
    // mode instead of the ordinary tap cursor, and reappears/disappears
    // automatically with every render, same as Up/Down used to appear/
    // disappear per S9's original locked AC.
    listRoot.classList.toggle('sort-manual', sortMode === 'manual');
  }

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, 4000);
  }

  // Event delegation (Developer sanity-check decision, see TEAM_LOG/report):
  // ONE listener per event type on the list container rather than binding
  // fresh per-row listeners on every re-render.
  //
  // Nested-control precedence (locked AC, S2/S3/S5, extended to S7/S8's
  // note/aisle affordances by Scrum Master's Sprint-2 addition): a tap on
  // any more specific control inside the row must fire ONLY that control's
  // own action, never also the row's cross-off toggle. Broadened here to
  // match on ANY element with `data-role` (not just <button>s, as it
  // originally checked) - the note/aisle text `<input>`s also carry
  // `data-role` now, and a click to position the cursor inside an open
  // editor must not fall through to the row-toggle branch either.
  listRoot.addEventListener('click', function (e) {
    // S13: swallow exactly the one trailing `click` a completed drag-pickup
    // gesture generates (see beginDrag()/endDrag()'s own comments for why
    // this is necessary, not just defensive) - must be the very first check,
    // before any other branch gets a chance to act on this click.
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    var li = e.target.closest && e.target.closest('li[data-id]');
    if (!li) return;
    var nested = e.target.closest('[data-role]');
    if (nested) {
      var id = Number(li.dataset.id);
      var role = nested.dataset.role;
      if (role === 'delete') deleteItem(id);
      else if (role === 'note-toggle') openEditor(id, 'note');
      else if (role === 'aisle-toggle') openEditor(id, 'aisle');
      // role === 'note-input' / 'aisle-input': no action needed here, just
      // let the native input handle cursor placement - but still return
      // below rather than falling through to toggleChecked.
      return; // nested control handled its own action - do NOT also cross off
    }
    toggleChecked(Number(li.dataset.id)); // tap landed on the row itself
  });

  // Keyboard equivalent of the same nested-control precedence rule (the
  // exact keydown-bubbling gotcha self-caught in density-picker.html's
  // Options C/D). Also handles Enter-to-confirm specifically for the note/
  // aisle editor inputs, per locked AC ("typing and confirming (blur or
  // Enter) saves it").
  listRoot.addEventListener('keydown', function (e) {
    var nested = e.target.closest && e.target.closest('[data-role]');
    if (e.key === 'Enter' && nested && (nested.dataset.role === 'note-input' || nested.dataset.role === 'aisle-input')) {
      e.preventDefault(); // no default action to run for a bare <input>, but explicit is cheap
      commitEditor();
      return;
    }
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    var li = e.target.closest && e.target.closest('li[data-id]');
    if (!li) return;
    if (nested) return; // let the native button handle its own key (or, for the editor input on Space, just type a space normally)
    e.preventDefault();
    toggleChecked(Number(li.dataset.id));
  });

  // S7/S8: live-update the in-progress draft as the user types, WITHOUT
  // re-rendering on every keystroke (see updateDraft's own comment).
  listRoot.addEventListener('input', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role === 'note-input' || role === 'aisle-input') {
      updateDraft(e.target.value);
    }
  });

  // S7/S8: confirm-on-blur. Delegated listeners must use `focusout`, not
  // `blur` - `blur` does not bubble, so a listener on an ancestor (this
  // app's established event-delegation pattern) would never see it fire.
  //
  // Bug fix (2026-09-08, caught by Playwright verification pass): committing
  // SYNCHRONOUSLY here is a real hazard, not just a style choice. This
  // `focusout` can itself be a side effect of the SAME mousedown/click
  // gesture that's about to activate a DIFFERENT nested control elsewhere in
  // the list (tapping another row's note/aisle-toggle, or its Up/Down/
  // Delete) - browsers process the focus change (and therefore fire this
  // `focusout`) BEFORE dispatching the resulting `click`. Calling
  // commitEditor() synchronously here runs render(), which rebuilds
  // listRoot's ENTIRE innerHTML - destroying the very element the
  // not-yet-dispatched click is targeting, before that click event ever
  // reaches it (a detached node can't bubble to listRoot). Net effect: the
  // user's tap on that other control silently does nothing and needs a
  // second tap to register - confirmed live via Playwright (a tap on one
  // row's aisle-edit affordance while a different field's editor was still
  // open never opened the new editor at all on the first tap).
  //
  // Deferring the commit to a fresh task (a plain setTimeout) lets the
  // CURRENT click finish dispatching first, against the still-intact
  // original DOM, before anything gets rebuilt. The `pending === editingField`
  // guard handles the other ordering: if that same click's own handler
  // already opened/committed a different editor in the meantime (see
  // openEditor()'s own explicit commit-existing-editor-first logic),
  // `editingField` will have moved on by the time this fires, and this
  // deferred call correctly no-ops rather than wrongly re-committing (or
  // prematurely closing) whatever is open now.
  listRoot.addEventListener('focusout', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role === 'note-input' || role === 'aisle-input') {
      var pending = editingField;
      setTimeout(function () {
        if (editingField === pending) commitEditor();
      }, 0);
    }
  });

  // S13: drag-and-drop pickup/move/drop, delegated on listRoot per the
  // app's established event-delegation pattern. Split across four Pointer
  // Event types (locked AC requires Pointer Events specifically, not a
  // touch-only listener, so this is Playwright-automatable):
  //   pointerdown   - arm a pickup after a deliberate delay, IF this press
  //                    didn't land on a nested control and isn't this row's
  //                    own open editor (nested-control precedence, both
  //                    directions - QA finding M9/M10)
  //   pointermove   - while armed: jitter-tolerance check, cancels the arm
  //                    (falls through to an ordinary scroll) if exceeded;
  //                    while actively dragging: drive the live placeholder
  //   pointerup     - while armed: released before the delay elapsed, an
  //                    ordinary tap - just clear the arm, let the natural
  //                    `click` fire unchanged; while dragging: commit
  //   pointercancel - while armed: clear the arm, no side effects; while
  //                    dragging: abort entirely, no commit (QA finding R9)
  listRoot.addEventListener('pointerdown', function (e) {
    if (sortMode !== 'manual') return; // S9: drag is a manual-order-only operation, same restriction S5's buttons had
    if (dragArm || dragState) return; // a gesture is already in flight for another pointer - defensive, this is a single-user phone app, not a real multi-touch target
    var li = e.target.closest && e.target.closest('li[data-id]');
    if (!li) return;
    if (e.target.closest('[data-role]')) return; // nested-control precedence: never arm a pickup from delete/note-toggle/aisle-toggle or an open editor's own input
    var id = Number(li.dataset.id);
    // QA finding M9: a row with its OWN note/aisle editor currently open
    // cannot be drag-picked-up at all - a press-and-hold anywhere on that
    // row is left as ordinary interaction with the open editor, not a drag
    // attempt. (The data-role check just above already excludes the input
    // element itself; this additionally excludes the rest of that same
    // row - its item-name text, its blank space - while that row's editor
    // is open.)
    if (editingField && editingField.id === id) return;
    var startX = e.clientX, startY = e.clientY, pointerId = e.pointerId;
    var timerId = setTimeout(function () {
      beginDrag(id, li, pointerId);
    }, DRAG_PICKUP_DELAY_MS);
    dragArm = { pointerId: pointerId, id: id, startX: startX, startY: startY, timerId: timerId };
  });

  listRoot.addEventListener('pointermove', function (e) {
    if (dragArm && e.pointerId === dragArm.pointerId) {
      var dx = e.clientX - dragArm.startX, dy = e.clientY - dragArm.startY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_JITTER_TOLERANCE_PX) {
        // Jitter tolerance exceeded before the delay elapsed (locked AC
        // testability-check finding #2): cancel the arm outright and treat
        // this as an ordinary scroll - no drag begins, and a LATER press
        // starts a fresh delay from zero, it never resumes from where this
        // one left off.
        clearTimeout(dragArm.timerId);
        dragArm = null;
      }
      return;
    }
    if (dragState && e.pointerId === dragState.pointerId) {
      e.preventDefault(); // block native touch-scroll for the rest of this gesture (QA finding M12) - the auto-scroll loop above is the only scrolling that happens now
      updateDragPosition(e.clientX, e.clientY);
    }
  });

  listRoot.addEventListener('pointerup', function (e) {
    if (dragArm && e.pointerId === dragArm.pointerId) {
      clearTimeout(dragArm.timerId);
      dragArm = null; // released before the delay elapsed - ordinary tap, the natural click fires unchanged, nothing to suppress
      return;
    }
    if (dragState && e.pointerId === dragState.pointerId) {
      endDrag(false);
    }
  });

  listRoot.addEventListener('pointercancel', function (e) {
    if (dragArm && e.pointerId === dragArm.pointerId) {
      clearTimeout(dragArm.timerId);
      dragArm = null;
      return;
    }
    if (dragState && e.pointerId === dragState.pointerId) {
      endDrag(true);
    }
  });

  // QA finding M18: document-level fallback for the case setPointerCapture
  // (in beginDrag(), above) silently doesn't take effect - if the pointer
  // ends up outside listRoot's own bounds entirely without real capture in
  // place (e.g. released over the header), the resulting pointerup/
  // pointercancel is dispatched via ordinary hit-testing to whatever's
  // actually under the pointer there, which never bubbles through listRoot
  // at all, so the delegated listeners above would simply never fire -
  // stranding dragState (and drag-active's touch-action:none) indefinitely,
  // same stuck-state failure family as QA finding C1. `document` always
  // receives the event via ordinary bubbling regardless of where on the
  // page it's targeted. Bubble order guarantees listRoot's own listener
  // (closer to the target) runs FIRST whenever it DOES successfully receive
  // the event, so this never double-fires endDrag() - `dragState` is
  // already null by the time this fallback runs in the normal case, making
  // it a no-op exactly when it should be.
  document.addEventListener('pointerup', function (e) {
    if (dragState && e.pointerId === dragState.pointerId) endDrag(false);
  });
  document.addEventListener('pointercancel', function (e) {
    if (dragState && e.pointerId === dragState.pointerId) endDrag(true);
  });

  addForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Enter key also submits via the form itself
    if (addItem(addInput.value)) {
      addInput.value = '';
    }
    addInput.focus();
  });

  pasteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (addPastedItems(pasteInput.value)) {
      pasteInput.value = ''; // clears only on a successful ingest
    }
  });

  undoBtn.addEventListener('click', function () {
    performUndo();
  });

  clearCheckedBtn.addEventListener('click', function () {
    clearCheckedItems();
  });

  // S9: sort control - view-only, in-memory, resets to Manual on reload
  // (the <select>'s own default value already starts on Manual, so there's
  // nothing to restore here on load).
  sortSelect.addEventListener('change', function () {
    sortMode = sortSelect.value;
    render();
  });

  // S10: tapping a suggestion chip adds it via the exact same mechanic as a
  // single S1 add.
  suggestionsRoot.addEventListener('click', function (e) {
    var chip = e.target.closest('.suggestion-chip');
    if (!chip) return;
    addSuggestion(chip.dataset.name);
  });

  render();

}());
