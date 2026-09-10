// Grocery List - vanilla JS, no build step, no framework.
// Intentionally a plain (non-module) script so this keeps working when
// index.html is opened directly via a file:// URL (module scripts can hit
// CORS restrictions under file://). Same precedent as vacking/script.js.
(function () {
  'use strict';

  var STORAGE_KEY = 'vopping-list-state-v1';
  var FREQUENCY_KEY = 'vopping-frequency-v1';

  // ---- S22: aisle set constants -------------------------------------------
  // Declared up here (not mid-file) specifically because migrateAisles() runs
  // during loadState() at module init, BEFORE any later `var` assignment would
  // execute - a `var AISLE_STARTER_LIST = [...]` further down is hoisted but
  // still `undefined` at migration time. normalize() below is a hoisted
  // FUNCTION declaration, so it IS callable during migration.
  //
  // 'Other' (last entry, S8's original starter list) is intentionally the
  // LABEL of the intrinsic no-aisle bucket, NOT an assignable aisle - it is
  // excluded from the seeded assignable set (S22 N11). The rest are the real
  // starter aisles.
  var AISLE_STARTER_LIST = ['Produce', 'Dairy', 'Meat/Seafood', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Other'];
  // Built-in default label for the no-aisle bucket, and the hard fallback once
  // the user deletes that label in Settings (S23). Compared against the
  // LITERAL constant at first migration (state.unassignedLabel does not exist
  // yet then).
  var OTHER_LABEL = 'Other';
  var UNASSIGNED_FALLBACK = 'Unassigned';
  // S24: the "+ Add new aisle…" sentinel option. VALUE is a reserved internal
  // token that can never equal a real aisle string (so it never collides);
  // LABEL is the visible text (S23 additionally rejects creating an aisle whose
  // normalized name equals this label - N12, belt-and-suspenders).
  var ADD_AISLE_VALUE = '__VOPPING_ADD_NEW_AISLE__';
  var ADD_AISLE_LABEL = '+ Add new aisle…';
  // S23: marker identifying the no-aisle bucket row in the Settings rename
  // editor (distinct from any normalized real-aisle key).
  var BUCKET_EDIT_KEY = '__VOPPING_BUCKET_ROW__';

  function defaultState() {
    // Seed a fresh state through the same migration path so the aisle set and
    // bucket label are always present/valid (starters-minus-Other, no items).
    return migrateAisles({ items: [], nextId: 0 });
  }

  // ---- S22: aisle-set migration/seeding -----------------------------------
  // Runs on every load via parseStoredState(); no-ops on an already-seeded
  // state (NB-7 idempotency: the seed is deterministic, a reload does not
  // re-mutate items or state.aisles once the field exists). MAP-THEN-SEED
  // order is load-bearing (see inline note).
  function migrateAisles(st) {
    if (typeof st.unassignedLabel !== 'string') {
      st.unassignedLabel = OTHER_LABEL;
    }
    if (Array.isArray(st.aisles)) {
      return st; // already seeded - AUTHORITATIVE, never re-merged/re-scanned
    }
    var otherKey = normalize(OTHER_LABEL);
    var i;
    // 1. MAP first: any pre-existing item whose aisle normalizes to the literal
    //    'Other' becomes the no-aisle bucket ('') - they ARE that bucket now.
    //    This MUST run before the seed union below, or the union would pull
    //    those Other-normalizing values straight back into the assignable set.
    //    (Narrow, deliberate exception to "migration never rewrites items".)
    for (i = 0; i < st.items.length; i++) {
      var av = st.items[i] && st.items[i].aisle;
      if (av && normalize(av) === otherKey) {
        st.items[i].aisle = '';
      }
    }
    // 2. SEED: real starters (Other excluded) UNION every distinct remaining
    //    item aisle, deduped case-insensitively (starter casing wins, else
    //    first-seen item casing) - mirrors S8's original getAislePool order.
    var seen = {};
    var aisles = [];
    for (i = 0; i < AISLE_STARTER_LIST.length; i++) {
      var sk = normalize(AISLE_STARTER_LIST[i]);
      if (sk === otherKey) continue; // Other is the bucket label, not assignable
      if (!seen[sk]) { seen[sk] = true; aisles.push(AISLE_STARTER_LIST[i]); }
    }
    for (i = 0; i < st.items.length; i++) {
      var iv = st.items[i] && st.items[i].aisle;
      if (!iv) continue;
      var ik = normalize(iv);
      if (!seen[ik]) { seen[ik] = true; aisles.push(iv); }
    }
    st.aisles = aisles;
    return st;
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
    // S22: seed/repair the persisted aisle set + bucket label (no-op if the
    // state was already seeded on a prior load).
    return migrateAisles(parsed);
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
  // S22 (N13): persist the seeded aisle set once on first load so it is durable
  // from the outset. Idempotent - a state that was already seeded serializes
  // back byte-for-identical, and the Other->'' item remap only runs when
  // state.aisles was absent, so a reload after migration does not re-mutate
  // (NB-7 asserts on end-state stability, not this call). Guarded internally
  // against localStorage being unavailable.
  saveState();

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

  // ---- S19: Up/Down reorder buttons (restores S5's mechanism; supersedes
  // and fully removes S13's drag-and-drop) ---------------------------------
  // Drafted/Locked 2026-09-09, PO decision after drag-and-drop failed a
  // SECOND time on their real iPhone: the Pointer-Events drag lost to the
  // browser's native scroll ("when i try to drag the item, it scrolls the
  // screen instead of moving the item"). Root cause diagnosed as a WebKit
  // touch-action-latched-at-touchstart conflict that desktop Chromium (and
  // Playwright's synthetic pointer events) structurally cannot reproduce, so
  // it passed 219/219 in automation yet fails on device - not trivially
  // fixable without a dedicated drag handle (a UX change the PO declined).
  // PO: "i'll take crowded over not working." All of S13's drag machinery is
  // gone entirely - the pointer state machine (dragArm/dragState), the pickup
  // delay + jitter arming, the live placeholder, the auto-scroll-near-edge
  // loop, the trailing-click suppression, the document-level fallback
  // listeners (old M18), and the drag-only CSS. This is a pure UI/interaction
  // reversal: S13 never touched S5's persisted manual-order data model, so
  // there is no migration - the array-order/localStorage/undo logic is
  // identical to what S5 shipped and S13 carried forward verbatim.
  //
  // A neighbor move (splice the item out and back in one slot over) is
  // exactly equivalent to S5's original swap-with-immediate-neighbor and
  // produces an identical resulting order, so it reuses performUndo()'s
  // existing { type:'reorder', id, fromIndex, toIndex } handler verbatim
  // (undo = splice back out, reinsert at fromIndex) rather than resurrecting
  // S5's retired { idA, idB } swap-shaped entry, which no longer has any
  // producer. Up/Down are rendered per-row (renderRow) only while in Manual
  // sort, and gated at the top/bottom by a `disabled` attribute - so a
  // non-Manual sort simply doesn't render them at all. That JS-gate is what
  // lets QA finding M19's now-dead `sort-manual` CSS class be removed
  // outright (it existed only to give the drag its `grab` cursor hint).
  function moveItem(id, direction) {
    // direction: -1 = up (toward index 0), +1 = down (toward the end).
    var idx = findIndexById(id);
    if (idx === -1) return;
    var targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.items.length) return; // top row's Up / bottom row's Down: no neighbor to swap with, no-op (buttons are also rendered `disabled` in these positions, this is belt-and-suspenders)
    var item = state.items[idx];
    state.items.splice(idx, 1);
    state.items.splice(targetIdx, 0, item);
    // Undo-eligible, same as S5's swaps and S13's drops both were (one of
    // S6's four types); undo restores the exact prior order via the existing
    // 'reorder' handler in performUndo().
    setLastAction({ type: 'reorder', id: id, fromIndex: idx, toIndex: targetIdx });
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
      // Inverse of a reorder move (S19's Up/Down neighbor swap; previously
      // S13's drag-drop - identical undo entry shape, so this handler is
      // unchanged across that supersession): pull the item out from wherever
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

  // S15 (Locked, 2026-09-08): dedicated edit-icon glyph for in-place
  // item-name editing, PO's confirmed pick from `s15-edit-gesture-picker.html`
  // Option 3 ("dedicated edit-icon/button", not double-tap or long-press —
  // long-press was explicitly ruled out since S13 already claims it for
  // drag-pickup). This is the pencil glyph FREED from S7's own note-toggle
  // (which moved to NOTE_TOGGLE_ICON_GLYPH above) — same glyph, different
  // job, per the PO's explicitly-confirmed icon-pairing.
  var NAME_EDIT_ICON_GLYPH = '✎';

  // Editor field types sharing this one mechanism (mutual exclusivity, cross-
  // row/cross-action commit, draft-survives-unrelated-render): S7's 'note',
  // S15's 'name', and S24's 'new-aisle'. NB (S22): 'aisle' is NO LONGER an
  // editor type - the per-item aisle is a native <select> committing on
  // `change`, so it was unthreaded from editingField entirely (the largest
  // structural ripple of the rework). commitEditor() switches on
  // `editingField.field` (note -> save, new-aisle -> revert, else name); the
  // generic helpers (openEditor, updateDraft, render-time focus-restore/draft-
  // survival) work for every type by construction, naming none specifically.
  var editingField = null; // { id, field: 'note'|'name'|'new-aisle', draft[, error] }

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
    } else if (current.field === 'new-aisle') {
      // S24 (QA C1, IMPORTANT): an UNRESOLVED new-aisle draft REVERTS - it must
      // have its OWN explicit branch here or it would fall through the `else`
      // to saveName() and corrupt the item name (the exact C1 fall-through
      // bug). Reaching commitEditor for a new-aisle draft means it was
      // abandoned (blur, or another editor/select opened), so revert-on-blur
      // wins: never create, just re-render so the select snaps back to the
      // item's real aisle. The EXPLICIT commit path (Enter / Add) is a
      // separate function, commitNewAisle(), NOT this one.
      render();
    } else {
      // 'name' (S15). NB: 'aisle' no longer routes through editingField - the
      // per-row native select commits on `change` (see the delegated change
      // handler), so there is intentionally no 'aisle' branch here anymore.
      saveName(current.id, current.draft);
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
    // S22: rawValue is the chosen <option>'s canonical display string (or ''
    // for the no-aisle bucket). Storing it CANONICALIZES the item on first edit
    // - a pre-existing non-canonical value (e.g. 'produce' from free-text S8)
    // is displayed correctly via normalized-key <option> selection until the
    // user actively re-picks, at which point it becomes the canonical casing.
    // trim() is harmless (option values carry no stray whitespace).
    state.items[idx].aisle = String(rawValue).trim();
    saveState();
    render();
  }

  // ---- S23/S24: persisted aisle-set mutations ------------------------------
  // All matching is by NORMALIZED key (NB-2) so pre-existing non-canonical item
  // values (which S22 migration deliberately leaves untouched) stay in sync
  // through renames/deletes instead of being orphaned.

  function validateAisleName(name, excludeKey, isBucket) {
    var trimmed = String(name).trim();
    if (!trimmed) return 'Enter a name.';
    var key = normalize(trimmed);
    if (key === normalize(ADD_AISLE_LABEL)) return 'That name is reserved.';
    // Collision with the no-aisle bucket label (skip when renaming the bucket
    // itself - that is the same entry). Per N11, once Other has been deleted
    // (bucket falls back to 'Unassigned') a real 'Other' becomes creatable,
    // because this check compares against the CURRENT bucket label only.
    if (!isBucket && key === normalize(noAisleLabel())) return 'That name is already in use.';
    var pool = getAislePool();
    for (var i = 0; i < pool.length; i++) {
      var pk = normalize(pool[i]);
      if (excludeKey != null && pk === excludeKey) continue; // renaming self (M21)
      if (pk === key) return 'That aisle already exists.';
    }
    return null;
  }

  function addAisle(name) {
    // Caller validates first. Stores the canonical casing (as typed, trimmed).
    state.aisles.push(String(name).trim());
  }

  function renameAisleByKey(oldKey, newName) {
    var trimmed = String(newName).trim();
    var i;
    for (i = 0; i < state.aisles.length; i++) {
      if (normalize(state.aisles[i]) === oldKey) { state.aisles[i] = trimmed; break; }
    }
    // Cascade the new string over every item using that aisle (normalized-key
    // match, so non-canonical variants are updated too - NB-2).
    for (i = 0; i < state.items.length; i++) {
      if (state.items[i].aisle && normalize(state.items[i].aisle) === oldKey) {
        state.items[i].aisle = trimmed;
      }
    }
    saveState();
  }

  function deleteAisleByKey(key) {
    var i;
    for (i = state.aisles.length - 1; i >= 0; i--) {
      if (normalize(state.aisles[i]) === key) state.aisles.splice(i, 1);
    }
    // Delete-in-use reverts affected items to the no-aisle bucket ('') - it does
    // NOT block on reassignment (locked AC). Normalized-key match (NB-2).
    for (i = 0; i < state.items.length; i++) {
      if (state.items[i].aisle && normalize(state.items[i].aisle) === key) {
        state.items[i].aisle = '';
      }
    }
    saveState();
  }

  function renameBucket(newName) {
    // Renaming the no-aisle bucket relabels it everywhere via state.unassignedLabel
    // - no item data changes (items already store '' for no-aisle).
    state.unassignedLabel = String(newName).trim();
    saveState();
  }

  function deleteBucket() {
    // The no-aisle STATE cannot be deleted, only its label - drop the custom
    // label so the bucket falls back to the built-in 'Unassigned' (S23c).
    state.unassignedLabel = UNASSIGNED_FALLBACK;
    saveState();
  }

  // ---- S24: inline "add new aisle" from the per-item select ----------------
  // Its OWN editingField type ('new-aisle'), deliberately NOT the removed
  // 'aisle' path (S22 deleted that). Explicit commit = commitNewAisle();
  // blur/switch/abandon = revert (handled by commitEditor's 'new-aisle' branch).
  function openNewAisleEditor(id) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    editingField = { id: id, field: 'new-aisle', draft: '', error: null };
    render(); // rebuilds the row: the select snaps back to the item's real
              // aisle (we never saved the sentinel), the name input appears.
    focusNewAisleInput(id);
  }

  function focusNewAisleInput(id) {
    var input = listRoot.querySelector('li[data-id="' + id + '"] [data-role="new-aisle-input"]');
    if (input) {
      input.focus();
      if (typeof input.setSelectionRange === 'function') {
        var len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  }

  function commitNewAisle() {
    // EXPLICIT commit only (Enter / a future confirm control). Empty -> revert.
    // Invalid/collision -> stay open + inline message (S23 NB-3). Valid ->
    // create + persist + assign + select, all in one atomic save.
    if (!editingField || editingField.field !== 'new-aisle') return;
    var id = editingField.id;
    var trimmed = String(editingField.draft).trim();
    if (!trimmed) { editingField = null; render(); return; }
    var err = validateAisleName(trimmed, null, false);
    if (err) {
      editingField.error = err;
      render();
      focusNewAisleInput(id);
      return;
    }
    addAisle(trimmed);
    var idx = findIndexById(id);
    if (idx !== -1) state.items[idx].aisle = trimmed;
    editingField = null;
    saveState();
    render();
  }

  // ---- S15: in-place item-name editing --------------------------------------
  // A blank/whitespace-only edit reverts to the item's ORIGINAL text unchanged
  // (locked AC) - deliberately different from S7/S8's trim-to-empty-and-clear
  // handling above, since a name can never legitimately be empty the way a
  // note/aisle can. Achieved by simply never writing `state.items[idx].name`
  // at all when the trimmed draft is empty - the field is left exactly as it
  // was, not overwritten with '' and not specially "restored" from anywhere,
  // since it was never touched in the first place.
  function saveName(id, rawValue) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    var trimmed = String(rawValue).trim();
    if (trimmed) {
      state.items[idx].name = trimmed;
    }
    // Deliberately does NOT call incrementFrequency/decrementFrequency - S10's
    // separate frequency counter simply never observes this edit in either
    // direction (locked AC, resolving the Developer sanity-check finding on
    // this story's own row: renaming "zucchini" to "2 zucchini" must not
    // fragment into two counter entries). No de-duplication check against
    // other item names either (project-wide no-dedup policy, S1/S4).
    // Name edits are NOT undo-eligible and do NOT clobber the pending undo
    // target (locked AC, same working-default treatment as S7/S8's note/
    // aisle edits) - achieved for free by simply never calling setLastAction
    // anywhere in this function.
    saveState();
    render();
  }

  // S22: the assignable aisle set is now the PERSISTED state.aisles (seeded on
  // first load by migrateAisles(), then authoritative). getAislePool()
  // collapses to a direct read - it is NO LONGER derived live from starters ∪
  // items (that logic moved into one-time seeding). AISLE_STARTER_LIST and the
  // label constants now live at the top of this file (migration needs them
  // before this point executes). S8's old datalist/free-text pool and its
  // renderAisleDatalist() are removed.
  function getAislePool() {
    return state.aisles;
  }

  // S22: the live label for the intrinsic no-aisle bucket - state.unassignedLabel
  // (default 'Other'), or the built-in 'Unassigned' fallback once the user has
  // deleted the Other label in Settings (S23).
  function noAisleLabel() {
    return state.unassignedLabel || UNASSIGNED_FALLBACK;
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
  var suggestionsRoot = document.getElementById('suggestions-root');
  // S21: settings menu shell.
  var settingsBtn = document.getElementById('settings-btn');
  var settingsOverlay = document.getElementById('settings-overlay');
  var settingsBody = document.getElementById('settings-body');
  // S21/S23 settings UI state (kept outside `state`, same rationale as
  // editingField - it is transient view state that must survive the panel's
  // innerHTML rebuilds).
  var settingsOpen = false;
  var settingsEdit = null;        // { key, draft, error } while renaming an aisle/bucket
  var settingsCreateDraft = '';   // in-progress "New aisle…" text (survives re-render)
  var settingsCreateError = null; // inline create-field validation message

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderRow(item, index, total) {
    var safeName = escapeHtml(item.name);
    var noteVal = item.note || '';
    var isEditingNote = !!editingField && editingField.id === item.id && editingField.field === 'note';
    var isEditingName = !!editingField && editingField.id === item.id && editingField.field === 'name';
    // S24: the inline "add new aisle" name editor for THIS row (its own editor
    // type - NOT the removed 'aisle' path). While open, the reveal input shows
    // in the row-meta line beside the (reverted) select.
    var isEditingNewAisle = !!editingField && editingField.id === item.id && editingField.field === 'new-aisle';

    // S15 (Locked, 2026-09-08): while this row's name editor is open, an
    // <input> takes over the EXACT same primary-line flex slot the passive
    // `<span class="item-name">` normally occupies (see `.name-input` in
    // style.css - same `flex: 1; min-width: 0`) - opening/closing the editor
    // never reflows anything else in the row. Deliberately NOT rendered on a
    // second line the way S7/S8's editors are - item text is primary-line
    // content, not secondary metadata, and the locked AC is explicit that
    // truncation/wrapping behavior for the SAVED name is unchanged (no new
    // multi-line wrapping the way S7's notes wrap) - only the live editor
    // itself shows the in-progress text in full, via a plain <input>'s own
    // native horizontal-scroll-within-the-field behavior, no ellipsis logic
    // needed here since that's just how an <input> already works.
    var nameContent = isEditingName
      ? '<input type="text" class="name-input" data-role="name-input" value="' + escapeHtml(editingField.draft) + '">'
      : '<span class="item-name">' + safeName + '</span>';

    // Primary line: name + delete (S13's drag pickup is the whole row
    // itself, no dedicated button), same locked single-line spec as
    // before - only shows a note/aisle AFFORDANCE icon here (not the full
    // content), and only when that field is both empty and not currently
    // being edited (avoids a redundant icon next to that same field's own
    // open editor/display on the second line).
    var noteAffordance = (!noteVal && !isEditingNote)
      ? '<button type="button" class="icon-btn" data-role="note-toggle" title="Add note">' + NOTE_TOGGLE_ICON_GLYPH + '</button>'
      : '';

    // S22/S16: the old icon-only aisle affordance (⚑ / "Add aisle") is GONE.
    // The aisle is now a persistent native <select> rendered on the row-meta
    // line below, in ALL sort modes including By-Aisle compact (M23, PO
    // confirmed - the inline select supersedes S16's ⚑). No primary-line aisle
    // control remains, so the worst-case primary-line icon count drops by one.

    // S15 (Locked, 2026-09-08): unlike note/aisle's affordances above, this
    // icon is NOT conditioned on the field being empty (an item's name is
    // never empty) - it's always present, same "dedicated icon/button"
    // mechanic the PO picked over double-tap/long-press in
    // `s15-edit-gesture-picker.html`'s Option 3. Only hidden while this
    // row's own name editor is already open (isEditingName), same as note/
    // aisle's own icon hiding while THEIR editor is open - no point showing
    // a second way to open what's already open, and the slot it'd occupy is
    // busy with the `.name-input` above anyway. Placement (between the
    // aisle affordance and delete) matches the exact arrangement the PO
    // reviewed and approved via that same decision-tool page.
    var editButton = !isEditingName
      ? '<button type="button" class="icon-btn" data-role="name-toggle" title="Edit item">' + NAME_EDIT_ICON_GLYPH + '</button>'
      : '';

    // S19 (Locked, 2026-09-09): Up/Down reorder controls, restored from S5,
    // replacing S13's removed drag-and-drop. Rendered ONLY in Manual sort -
    // the same manual-order-only rule S9 has always described (S13 had merely
    // swapped in its drag equivalent under that same rule); JS-gating it here
    // is what let the old `sort-manual` class be removed (QA M19). `index`/
    // `total` are the item's position in the current display order, which in
    // Manual sort is identical to its state.items index (no group headers, no
    // sorted reordering interposed), exactly what moveItem() operates on - so
    // the top row's Up and the bottom row's Down are `disabled` no-ops with no
    // neighbor to swap with. In any non-Manual sort this is empty (drag/
    // Up-Down are meaningless when visible order != manual order).
    var reorderButtons = '';
    if (sortMode === 'manual') {
      reorderButtons =
        '<button type="button" class="icon-btn" data-role="up" title="Move up"' + (index === 0 ? ' disabled' : '') + '>▲</button>' +
        '<button type="button" class="icon-btn" data-role="down" title="Move down"' + (index === total - 1 ? ' disabled' : '') + '>▼</button>';
    }

    // Second line (row-meta): S22 makes the per-item aisle <select> ALWAYS
    // present, so this line now always renders (M24 - a placement re-check at
    // 320/360/375/390px is required and was run; the select sits on its own
    // wrapping line, never on the crowded primary control line). It also holds
    // the note editor/display when applicable, and S24's new-aisle reveal input
    // while that editor is open.
    var secondLine = '<div class="row-meta">';
    if (isEditingNote) {
      secondLine += '<input type="text" class="row-meta-input" data-role="note-input" placeholder="Note…" value="' + escapeHtml(editingField.draft) + '">';
    } else if (noteVal) {
      secondLine += '<button type="button" class="note-display" data-role="note-toggle" title="Edit note">' + escapeHtml(noteVal) + '</button>';
    }
    secondLine += renderAisleSelect(item);
    if (isEditingNewAisle) {
      secondLine += '<input type="text" class="row-meta-input new-aisle-input" data-role="new-aisle-input" placeholder="New aisle name…" autocomplete="off" value="' + escapeHtml(editingField.draft) + '">';
      if (editingField.error) {
        secondLine += '<span class="row-meta-error" data-role="new-aisle-error">' + escapeHtml(editingField.error) + '</span>';
      }
    }
    secondLine += '</div>';

    return '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '"' +
      ' role="checkbox" tabindex="0" aria-checked="' + (item.checked ? 'true' : 'false') + '" aria-label="' + safeName + '">' +
      nameContent +
      noteAffordance + editButton + reorderButtons +
      '<button type="button" class="icon-btn delete-btn" data-role="delete" title="Delete">✕</button>' +
      secondLine +
      '</li>';
  }

  // S22: the persistent per-item aisle <select>. Options (NB-1): the no-aisle
  // bucket FIRST (value '', labeled state.unassignedLabel), then the real
  // aisles in state.aisles insertion order, then S24's "+ Add new aisle…"
  // sentinel LAST. The item's current aisle is matched to its option by
  // NORMALIZED key (not exact string), so a pre-existing non-canonical value
  // (e.g. 'produce') selects the canonical 'Produce' option rather than
  // dangling. R15 defensive guard: if no option matches a non-empty stored
  // value, append it as its own selected option so the select never silently
  // shows the wrong value (never renders a blank/undefined selection).
  function renderAisleSelect(item) {
    var curKey = normalize(item.aisle || '');
    var matched = (curKey === '');
    var html = '<select class="aisle-select" data-role="aisle-select" title="Aisle">';
    html += '<option value=""' + (curKey === '' ? ' selected' : '') + '>' + escapeHtml(noAisleLabel()) + '</option>';
    var pool = getAislePool();
    for (var i = 0; i < pool.length; i++) {
      var optKey = normalize(pool[i]);
      var sel = (!matched && optKey === curKey);
      if (sel) matched = true;
      html += '<option value="' + escapeHtml(pool[i]) + '"' + (sel ? ' selected' : '') + '>' + escapeHtml(pool[i]) + '</option>';
    }
    if (!matched && item.aisle) {
      html += '<option value="' + escapeHtml(item.aisle) + '" selected>' + escapeHtml(item.aisle) + '</option>';
    }
    // Sentinel LAST (S24). Detected structurally via data-sentinel (not by its
    // value string) so it can never be confused with a real aisle.
    html += '<option value="' + escapeHtml(ADD_AISLE_VALUE) + '" data-sentinel="1">' + escapeHtml(ADD_AISLE_LABEL) + '</option>';
    html += '</select>';
    return html;
  }

  function renderList() {
    // Bug fix (2026-09-04, self-caught during nested-control-precedence
    // testing of the whole-row-tap change): a full `innerHTML` rebuild
    // destroys and recreates every row, including whatever currently has
    // keyboard focus OR an open note/aisle/name editor (S15's name editor
    // reuses this exact same generic mechanism, no special-casing needed
    // here). Captures which element
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
    // function (findIndexById, S19's Up/Down moveItem, removeEntries/
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
          // S9/S22: no-aisle group uses the live bucket label (Other, or the
          // Unassigned fallback after the label is deleted). R15 invariant: the
          // real-aisle label lookup flipped from items-derived (can't miss) to
          // state.aisles-derived (can miss), so ALWAYS resolve with a defensive
          // fallback to the raw item.aisle string - never render literal
          // 'undefined' (same posture as parseStoredState's R1 guard).
          var groupLabel = groupKey ? (aisleDisplayMap[groupKey] || item.aisle) : noAisleLabel();
          html += '<li class="aisle-group-header">' + escapeHtml(groupLabel) + '</li>';
        }
      }

      html += renderRow(item, i, displayItems.length);
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
    renderSuggestions();
    if (settingsOpen) renderSettings(); // keep the open Settings panel in sync
                                        // with aisle-set / bucket-label changes
    // S19 (QA finding M19): the old `sort-manual` class toggle (S13's, which
    // existed only to switch on the drag `grab` cursor hint) is gone -
    // Up/Down visibility is JS-gated directly in renderRow() by `sortMode`,
    // so there's nothing left for a body/container class to drive here.
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
      if (role === 'delete') deleteItem(id);
      else if (role === 'note-toggle') openEditor(id, 'note');
      else if (role === 'name-toggle') openEditor(id, 'name');
      else if (role === 'up') moveItem(id, -1); // S19: swap with the neighbor above
      else if (role === 'down') moveItem(id, 1); // S19: swap with the neighbor below
      // role === 'note-input' / 'name-input' / 'new-aisle-input': no action
      // needed here, just let the native input handle cursor placement.
      // role === 'aisle-select': the native <select> handles its own open/pick;
      // it commits via the delegated 'change' handler, not here. (The old
      // 'aisle-toggle' affordance is gone - S22.) Still return below rather
      // than falling through to toggleChecked.
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
    if (e.key === 'Enter' && nested && nested.dataset.role === 'new-aisle-input') {
      // S24: Enter is the EXPLICIT commit for the new-aisle name (create +
      // assign, or stay-open-with-message on invalid) - a separate path from
      // commitEditor (which reverts an abandoned new-aisle draft).
      e.preventDefault();
      commitNewAisle();
      return;
    }
    if (e.key === 'Enter' && nested && (nested.dataset.role === 'note-input' || nested.dataset.role === 'name-input')) {
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
    if (role === 'note-input' || role === 'name-input' || role === 'new-aisle-input') {
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
  // Roles that trigger the deferred editor flush: the text editors (note/name/
  // new-aisle), AND the aisle <select> (so a picker DISMISSED without choosing
  // still flushes a pending note/name editor - R14). For a new-aisle draft the
  // flush is a revert (commitEditor's 'new-aisle' branch); for note/name it is
  // a commit.
  listRoot.addEventListener('focusout', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role !== 'note-input' && role !== 'name-input' && role !== 'new-aisle-input' && role !== 'aisle-select') {
      return;
    }
    var pending = editingField;
    if (!pending) return; // nothing open to flush (e.g. an aisle-select blur with no editor)
    setTimeout(function () {
      if (editingField !== pending) return; // already handled by a click/change in between
      // Skip the flush while focus is STILL on an in-progress editor control in
      // the list: (a) an aisle <select> whose native picker is open - R14:
      // committing now would render() it away mid-pick (the seam S13 C1/R13
      // taught: a picker outlives this setTimeout(0), unlike a click); (b) the
      // S24 new-aisle reveal input - when commitNewAisle re-renders to show an
      // inline validation error, that rebuild momentarily blurs+refocuses the
      // input, and this deferred revert must NOT fire on that transient blur
      // (it would wrongly close the stay-open editor). A genuine
      // blur-to-elsewhere lands focus outside this set and still reverts.
      var ae = document.activeElement;
      if (ae && ae.dataset && listRoot.contains(ae) &&
          (ae.dataset.role === 'aisle-select' || ae.dataset.role === 'new-aisle-input')) return;
      commitEditor();
    }, 0);
  });

  // S22 (R14): the per-item aisle <select> commits on `change`. `change` fires
  // only AFTER the native picker has closed, so render() here is safe.
  listRoot.addEventListener('change', function (e) {
    var target = e.target;
    if (!target.dataset || target.dataset.role !== 'aisle-select') return;
    var li = target.closest && target.closest('li[data-id]');
    if (!li) return;
    var id = Number(li.dataset.id);
    // Capture id + selection FIRST, before any commit/render detaches the node.
    var selOpt = target.options[target.selectedIndex];
    var isSentinel = !!(selOpt && selOpt.dataset && selOpt.dataset.sentinel === '1');
    var chosen = target.value;
    // Commit any OPEN text editor first (mirrors openEditor's commit-first
    // guard) so an in-progress note/name draft on another row is not lost; the
    // sentinel-reveal path (S24) is covered by this same flush (QA requirement).
    if (editingField) commitEditor();
    if (isSentinel) {
      openNewAisleEditor(id); // S24: "+ Add new aisle…" reveal
    } else {
      saveAisle(id, chosen);  // canonical option value (or '' for no-aisle)
    }
  });

  // S19: drag-and-drop is gone entirely (see moveItem()'s header comment for
  // why). Reordering is now S5's Up/Down buttons, handled by the delegated
  // `click` listener above (data-role 'up'/'down' -> moveItem). No Pointer
  // Event listeners remain - the whole pointerdown/move/up/cancel state
  // machine and the document-level M18 fallback listeners were removed with
  // the drag mechanism they served.

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

  // ---- S21/S23: settings menu + aisle management ---------------------------
  function openSettings() {
    settingsOpen = true;
    settingsEdit = null;
    settingsCreateDraft = '';
    settingsCreateError = null;
    settingsOverlay.hidden = false;
    renderSettings();
    // Deliberately do NOT auto-focus the create input - avoids popping the
    // mobile keyboard the instant the panel opens.
  }

  function closeSettings() {
    settingsOpen = false;
    settingsEdit = null;
    settingsOverlay.hidden = true;
  }

  function renderSettings() {
    if (!settingsBody) return;
    // Capture focus target before the rebuild, same shape as renderList's
    // focus-preservation - so re-rendering (e.g. after a create) doesn't drop
    // the caret out of the create field.
    var active = document.activeElement;
    var wasCreate = !!(active && active.dataset && active.dataset.role === 'aisle-create-input');

    var html = '<div class="settings-section">';
    html += '<h3 class="settings-section-title">Aisles</h3>';
    html += '<p class="settings-hint">Add the sections of your store. Items with no aisle group under &ldquo;' + escapeHtml(noAisleLabel()) + '&rdquo;.</p>';
    html += '<form class="aisle-create" data-role="aisle-create-form">';
    html += '<input type="text" class="settings-input" data-role="aisle-create-input" placeholder="New aisle…" autocomplete="off" value="' + escapeHtml(settingsCreateDraft) + '">';
    html += '<button type="submit" class="settings-add-btn">Add</button>';
    html += '</form>';
    if (settingsCreateError) {
      html += '<p class="settings-error" data-role="create-error">' + escapeHtml(settingsCreateError) + '</p>';
    }
    html += '<ul class="aisle-manage-list">';
    // No-aisle bucket first (rename => relabel; delete => fall back to Unassigned).
    html += renderAisleManageRow(BUCKET_EDIT_KEY, noAisleLabel(), true);
    var pool = getAislePool();
    for (var i = 0; i < pool.length; i++) {
      html += renderAisleManageRow(normalize(pool[i]), pool[i], false);
    }
    html += '</ul>';
    html += '</div>';
    settingsBody.innerHTML = html;

    // Focus restore: an open rename editor wins; otherwise keep the create field
    // focused if it was.
    if (settingsEdit) {
      var ri = settingsBody.querySelector('[data-role="aisle-rename-input"]');
      if (ri) { ri.focus(); if (ri.setSelectionRange) { var rl = ri.value.length; ri.setSelectionRange(rl, rl); } }
    } else if (wasCreate) {
      var ci = settingsBody.querySelector('[data-role="aisle-create-input"]');
      if (ci) { ci.focus(); if (ci.setSelectionRange) { var cl = ci.value.length; ci.setSelectionRange(cl, cl); } }
    }
  }

  function renderAisleManageRow(key, display, isBucket) {
    var editing = settingsEdit && settingsEdit.key === key;
    var h = '<li class="aisle-manage-item"' + (isBucket ? ' data-bucket="1"' : '') + '>';
    if (editing) {
      h += '<input type="text" class="settings-input" data-role="aisle-rename-input" autocomplete="off" value="' + escapeHtml(settingsEdit.draft) + '">';
      h += '<button type="button" class="settings-mini-btn" data-role="aisle-rename-confirm">Save</button>';
      if (settingsEdit.error) {
        h += '<span class="settings-error" data-role="rename-error">' + escapeHtml(settingsEdit.error) + '</span>';
      }
    } else {
      h += '<span class="aisle-manage-name">' + escapeHtml(display) + '</span>';
      h += '<button type="button" class="settings-mini-btn" data-role="aisle-rename" data-key="' + escapeHtml(key) + '" data-display="' + escapeHtml(display) + '">Rename</button>';
      h += '<button type="button" class="settings-mini-btn settings-delete-btn" data-role="aisle-delete" data-key="' + escapeHtml(key) + '" title="Delete">Delete</button>';
    }
    h += '</li>';
    return h;
  }

  function submitCreateAisle() {
    var trimmed = String(settingsCreateDraft).trim();
    if (!trimmed) { // empty create is a silent no-op, keep the field as-is
      settingsCreateError = null;
      renderSettings();
      return;
    }
    var err = validateAisleName(trimmed, null, false);
    if (err) {
      // Explicit invalid commit: keep the field open with the typed text + an
      // inline message (S23 NB-3).
      settingsCreateError = err;
      renderSettings();
      var ci = settingsBody.querySelector('[data-role="aisle-create-input"]');
      if (ci) ci.focus();
      return;
    }
    addAisle(trimmed);
    settingsCreateDraft = '';
    settingsCreateError = null;
    saveState();
    render(); // refresh the list's per-row selects + the panel
  }

  function commitSettingsRename() {
    if (!settingsEdit) return;
    var key = settingsEdit.key;
    var isBucket = (key === BUCKET_EDIT_KEY);
    var trimmed = String(settingsEdit.draft).trim();
    if (!trimmed) { settingsEdit = null; renderSettings(); return; } // empty -> revert
    var err = validateAisleName(trimmed, isBucket ? null : key, isBucket);
    if (err) {
      settingsEdit.error = err;
      renderSettings();
      var ri = settingsBody.querySelector('[data-role="aisle-rename-input"]');
      if (ri) ri.focus();
      return;
    }
    if (isBucket) renameBucket(trimmed); else renameAisleByKey(key, trimmed);
    settingsEdit = null;
    render(); // rename cascade over items + refresh panel
  }

  function deleteSettingsAisle(key) {
    if (key === BUCKET_EDIT_KEY) deleteBucket(); else deleteAisleByKey(key);
    render();
  }

  settingsBtn.addEventListener('click', openSettings);

  settingsOverlay.addEventListener('click', function (e) {
    var control = e.target.closest && e.target.closest('[data-role]');
    var role = control && control.dataset.role;
    if (role === 'settings-scrim' || role === 'settings-close') { closeSettings(); return; }
    if (role === 'aisle-rename') {
      settingsEdit = { key: control.dataset.key, draft: control.dataset.display, error: null };
      renderSettings();
    } else if (role === 'aisle-rename-confirm') {
      commitSettingsRename();
    } else if (role === 'aisle-delete') {
      deleteSettingsAisle(control.dataset.key);
    }
  });

  settingsOverlay.addEventListener('submit', function (e) {
    var control = e.target.closest && e.target.closest('[data-role]');
    if (control && control.dataset.role === 'aisle-create-form') {
      e.preventDefault();
      submitCreateAisle();
    }
  });

  settingsOverlay.addEventListener('input', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role === 'aisle-create-input') {
      settingsCreateDraft = e.target.value;
    } else if (role === 'aisle-rename-input' && settingsEdit) {
      settingsEdit.draft = e.target.value;
    }
  });

  settingsOverlay.addEventListener('keydown', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (e.key === 'Enter' && role === 'aisle-rename-input') {
      e.preventDefault();
      commitSettingsRename();
    }
  });

  // Rename-field blur = revert (M22, consistent with S24). Deferred so that a
  // click on this same editor's Save button (which fires focusout on the input
  // BEFORE the click) commits first and this revert then no-ops - same seam as
  // the row editors' focusout, no native picker involved here.
  settingsOverlay.addEventListener('focusout', function (e) {
    var role = e.target.dataset && e.target.dataset.role;
    if (role !== 'aisle-rename-input') return;
    var pending = settingsEdit;
    setTimeout(function () {
      if (settingsEdit === pending && settingsEdit) { settingsEdit = null; renderSettings(); }
    }, 0);
  });

  // S21: Escape-to-close is an optional convenience only (keyboard-only nav is
  // out of scope) - the deterministic close paths are the X control and the
  // scrim/outside tap above.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && settingsOpen) closeSettings();
  });

  render();

}());
