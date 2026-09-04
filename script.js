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
  //   { type: 'reorder', idA, idB }                        - S5 swap (a swap is its own inverse)
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

  // ---- S5: reorder via up/down buttons -------------------------------------
  function swapById(idA, idB) {
    var idxA = findIndexById(idA);
    var idxB = findIndexById(idB);
    if (idxA === -1 || idxB === -1) return;
    var tmp = state.items[idxA];
    state.items[idxA] = state.items[idxB];
    state.items[idxB] = tmp;
  }

  function moveUp(id) {
    var idx = findIndexById(id);
    if (idx <= 0) return; // top row's Up is a no-op - nothing to swap with
    var neighborId = state.items[idx - 1].id;
    swapById(id, neighborId);
    // A swap is its own inverse - undo just performs the identical swap
    // again, no array snapshot needed.
    setLastAction({ type: 'reorder', idA: id, idB: neighborId });
    saveState();
    render();
  }

  function moveDown(id) {
    var idx = findIndexById(id);
    if (idx === -1 || idx >= state.items.length - 1) return; // bottom row's Down is a no-op
    var neighborId = state.items[idx + 1].id;
    swapById(id, neighborId);
    setLastAction({ type: 'reorder', idA: id, idB: neighborId });
    saveState();
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
      swapById(action.idA, action.idB);
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
  var editingField = null; // { id, field: 'note'|'aisle', draft }

  function openEditor(id, field) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    var current = state.items[idx][field] || '';
    editingField = { id: id, field: field, draft: current };
    render();
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

  function renderRow(item, isFirst, isLast) {
    var safeName = escapeHtml(item.name);
    var noteVal = item.note || '';
    var aisleVal = item.aisle || '';
    var isEditingNote = !!editingField && editingField.id === item.id && editingField.field === 'note';
    var isEditingAisle = !!editingField && editingField.id === item.id && editingField.field === 'aisle';

    // Primary line: name + up/down/delete, same locked single-line spec as
    // before - only shows a note/aisle AFFORDANCE icon here (not the full
    // content), and only when that field is both empty and not currently
    // being edited (avoids a redundant icon next to that same field's own
    // open editor/display on the second line).
    var noteAffordance = (!noteVal && !isEditingNote)
      ? '<button type="button" class="icon-btn" data-role="note-toggle" title="Add note">✎</button>'
      : '';
    var aisleAffordance = (!aisleVal && !isEditingAisle)
      ? '<button type="button" class="icon-btn" data-role="aisle-toggle" title="Add aisle">▤</button>'
      : '';

    var upBtn = '';
    var downBtn = '';
    if (sortMode === 'manual') {
      // S9 locked AC: Up/Down only make sense (and are only shown at all)
      // in Manual sort - visual position doesn't match the manual-order
      // swap target in any other mode.
      upBtn = '<button type="button" class="icon-btn" data-role="up" title="Move up"' + (isFirst ? ' disabled' : '') + '>▲</button>';
      downBtn = '<button type="button" class="icon-btn" data-role="down" title="Move down"' + (isLast ? ' disabled' : '') + '>▼</button>';
    }

    // Second line (locked AC, S7/S8): a row with a non-empty note/aisle (or
    // either editor currently open) may grow to a second line to fit it;
    // `flex-basis: 100%` (style.css) is what forces this onto its own line
    // within the wrapping flex row rather than sitting beside the controls.
    // A row with neither stays exactly as tall as S1/S2's locked single-
    // line spec - this div simply isn't rendered at all in that case.
    var secondLine = '';
    if (isEditingNote || noteVal || isEditingAisle || aisleVal) {
      secondLine += '<div class="row-meta">';
      if (isEditingNote) {
        secondLine += '<input type="text" class="row-meta-input" data-role="note-input" placeholder="Note…" value="' + escapeHtml(editingField.draft) + '">';
      } else if (noteVal) {
        secondLine += '<button type="button" class="note-display" data-role="note-toggle" title="Edit note">' + escapeHtml(noteVal) + '</button>';
      }
      if (isEditingAisle) {
        secondLine += '<input type="text" class="row-meta-input" list="aisle-options" data-role="aisle-input" placeholder="Aisle…" value="' + escapeHtml(editingField.draft) + '">';
      } else if (aisleVal) {
        secondLine += '<button type="button" class="aisle-tag" data-role="aisle-toggle" title="Edit aisle">' + escapeHtml(aisleVal) + '</button>';
      }
      secondLine += '</div>';
    }

    return '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '"' +
      ' role="checkbox" tabindex="0" aria-checked="' + (item.checked ? 'true' : 'false') + '" aria-label="' + safeName + '">' +
      '<span class="item-name">' + safeName + '</span>' +
      noteAffordance + aisleAffordance + upBtn + downBtn +
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
    // function (findIndexById, moveUp/moveDown, removeEntries/
    // restoreEntries) keeps operating on `state.items`' own true order,
    // completely independent of whatever's rendered here.
    var displayItems = getSortedItems();
    var aisleDisplayMap = sortMode === 'aisle' ? getAisleDisplayMap() : null;
    var lastGroupKey; // undefined initially - first item's group always renders a header in aisle mode

    var html = '<ul class="items">';
    for (var i = 0; i < displayItems.length; i++) {
      var item = displayItems[i];
      var trueIdx = findIndexById(item.id);
      var isFirst = trueIdx === 0;
      var isLast = trueIdx === state.items.length - 1;

      if (sortMode === 'aisle') {
        var groupKey = item.aisle ? normalize(item.aisle) : '';
        if (groupKey !== lastGroupKey) {
          lastGroupKey = groupKey;
          var groupLabel = groupKey ? aisleDisplayMap[groupKey] : 'Unassigned';
          html += '<li class="aisle-group-header">' + escapeHtml(groupLabel) + '</li>';
        }
      }

      html += renderRow(item, isFirst, isLast);
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
    var li = e.target.closest && e.target.closest('li[data-id]');
    if (!li) return;
    var nested = e.target.closest('[data-role]');
    if (nested) {
      var id = Number(li.dataset.id);
      var role = nested.dataset.role;
      if (role === 'up') moveUp(id);
      else if (role === 'down') moveDown(id);
      else if (role === 'delete') deleteItem(id);
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
  listRoot.addEventListener('focusout', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role === 'note-input' || role === 'aisle-input') {
      commitEditor();
    }
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
