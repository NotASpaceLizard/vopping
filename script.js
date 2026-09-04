// Grocery List - vanilla JS, no build step, no framework.
// Intentionally a plain (non-module) script so this keeps working when
// index.html is opened directly via a file:// URL (module scripts can hit
// CORS restrictions under file://). Same precedent as vacking/script.js.
(function () {
  'use strict';

  var STORAGE_KEY = 'vopping-list-state-v1';

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

  // ---- S6: single-slot undo buffer --------------------------------------
  // Transient/in-memory only, per locked AC - deliberately never persisted,
  // so a reload always starts with no undo target. Holds exactly one of:
  //   { type: 'add',     ids: [...] }                     - S1 single add or S4 paste batch
  //   { type: 'check',   id, prevChecked }                 - S2 toggle
  //   { type: 'delete',  entries: [{ item, index }, ...] } - S3 single delete OR S12 bulk
  //                                                           clear-checked, reusing the same
  //                                                           shape generalized to N entries -
  //                                                           same "batch shares the type" precedent
  //                                                           S4's paste-batch already uses under 'add'.
  //   { type: 'reorder', idA, idB }                        - S5 swap (a swap is its own inverse)
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

  // ---- S1: render + single-item add + persistence ------------------------
  function addItem(name) {
    var trimmed = String(name).trim();
    if (!trimmed) return false; // no-op on empty/whitespace-only, no blank row
    // No de-duplication against existing items (QA finding M5) - adding the
    // same name twice is allowed and creates a second, independent row.
    var item = { id: nextItemId(), name: trimmed, checked: false };
    state.items.push(item);
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
      var item = { id: nextItemId(), name: names[i], checked: false };
      state.items.push(item);
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
    // construction, this function never reads/writes that (not yet built)
    // storage key at all.
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderList() {
    if (state.items.length === 0) {
      // Clear empty state, not a blank screen.
      listRoot.innerHTML = '<p class="empty-state">No items yet — add one above to get started.</p>';
      return;
    }
    var html = '<ul class="items">';
    for (var i = 0; i < state.items.length; i++) {
      var item = state.items[i];
      var isFirst = i === 0;
      var isLast = i === state.items.length - 1;
      var safeName = escapeHtml(item.name);
      html += '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '">' +
        '<input type="checkbox" class="item-check" data-role="check" aria-label="' + safeName + '"' + (item.checked ? ' checked' : '') + '>' +
        '<span class="item-name">' + safeName + '</span>' +
        '<button type="button" class="icon-btn" data-role="up" title="Move up"' + (isFirst ? ' disabled' : '') + '>▲</button>' +
        '<button type="button" class="icon-btn" data-role="down" title="Move down"' + (isLast ? ' disabled' : '') + '>▼</button>' +
        '<button type="button" class="icon-btn delete-btn" data-role="delete" title="Delete">✕</button>' +
        '</li>';
    }
    html += '</ul>';
    listRoot.innerHTML = html;
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

  function render() {
    renderList();
    renderUndoButton();
    renderClearCheckedButton();
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
  // fresh per-row listeners on every re-render - S2/S3/S5's controls all
  // land on the same row and a full re-render happens on every mutation, so
  // delegation avoids rebinding N listeners each time.
  listRoot.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-role]');
    if (!btn || btn.tagName !== 'BUTTON') return;
    var li = btn.closest('li[data-id]');
    if (!li) return;
    var id = Number(li.dataset.id);
    var role = btn.dataset.role;
    if (role === 'up') moveUp(id);
    else if (role === 'down') moveDown(id);
    else if (role === 'delete') deleteItem(id);
  });

  listRoot.addEventListener('change', function (e) {
    var target = e.target;
    if (!target.matches || !target.matches('[data-role="check"]')) return;
    var li = target.closest('li[data-id]');
    if (!li) return;
    toggleChecked(Number(li.dataset.id));
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

  render();

}());
