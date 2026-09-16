// Grocery List - vanilla JS, no build step, no framework.
// Intentionally a plain (non-module) script so this keeps working when
// index.html is opened directly via a file:// URL (module scripts can hit
// CORS restrictions under file://). Same precedent as vacking/script.js.
(function () {
  'use strict';

  var STORAGE_KEY = 'vopping-list-state-v1';
  var FREQUENCY_KEY = 'vopping-frequency-v1';
  // S30: personal override map ("learning") - its OWN localStorage record,
  // separate from list state + frequency. Shape: { "<normalized item name>":
  // "<aisle display string>" }. Records ONLY hand picks (never auto-writes), and
  // never a ''-value (Q2). Feeds matcher tier 1 (personal override) ahead of the
  // dictionary tiers.
  var OVERRIDES_KEY = 'vopping-overrides-v1';

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
  //
  // S28 (2026-09-14): expanded to the Auto-Aisle spec's 18-aisle taxonomy (17
  // real + 'Other'), in store-walk order (spec §1). These 17 real names are
  // byte-identical (after normalize()) to the keys of window.AISLE_DICTIONARY
  // (S29) - a single source of truth so every matcher output resolves to a
  // seeded <select> option. FRESH state seeds directly from this list (correct
  // store-walk order, no legacy 'Meat/Seafood'); ALREADY-SEEDED states get the
  // one-time versioned re-seed below (migrateAislesV2) - editing this list ALONE
  // is a silent no-op for them because migrateAisles() short-circuits on an
  // existing state.aisles.
  // S36 (2026-09-16): added 'International' in store-walk position between
  // 'Condiments & Sauces' and 'Snacks & Candy' (18 real aisles + 'Other' = 19).
  // Byte-identical (after normalize()) to the new window.AISLE_DICTIONARY
  // 'International' key. FRESH state seeds all 19 directly from this list; an
  // ALREADY-SEEDED (v2) device gets 'International' via the one-time
  // migrateAislesV3 union below (appended at the tail of that device's own
  // aisle order, not this store-walk slot - matches how v2's new starters land).
  var AISLE_STARTER_LIST = ['Produce', 'Meat', 'Seafood', 'Deli', 'Bakery', 'Dairy & Eggs', 'Frozen', 'Cereal & Breakfast', 'Canned & Jarred', 'Pasta, Rice & Grains', 'Baking & Spices', 'Condiments & Sauces', 'International', 'Snacks & Candy', 'Beverages', 'Household & Cleaning', 'Personal Care & Health', 'Pantry', 'Other'];

  // ---- S28: versioned one-time aisle re-seed --------------------------------
  // migrateAisles() (S22) short-circuits on an already-seeded state.aisles, so a
  // taxonomy expansion needs its OWN gated, one-time migration keyed on
  // state.seedVersion (absent/undefined = pre-S28 = "behind current" = run once;
  // fresh defaultState() gets stamped to current the same load). Runs EXACTLY
  // once per device (idempotent: a reload at the current version is a no-op).
  // S36 (2026-09-16): bumped 2->3 for the 'International' aisle. This is now ONLY
  // the current/highest marker (used for fresh-state final stamping + the debug
  // readout). It is CRITICAL that each migration step is pinned to its OWN
  // LITERAL version target below (V2 gates>=2/stamps=2; V3 gates>=3/stamps=3),
  // NOT this global - otherwise bumping this constant would re-open V2's gate on
  // an existing v2 device (2 >= 3 is false), re-running V2's union and
  // resurrecting a user-deleted v2 starter (N13 violation) then stamping to 3
  // and skipping V3. See migrateAislesV2/migrateAislesV3.
  var AISLE_SEED_VERSION = 3;
  // Genuinely-NEW starters this version introduces (never existed in the pre-S28
  // taxonomy). ONLY these are unioned in, so the union can NEVER resurrect a
  // user-DELETED old starter (N13 no-resurrect): the carry-over old starters
  // (Produce, Bakery, Frozen, Pantry, Beverages) are deliberately NOT listed, and
  // 'Dairy & Eggs' / 'Household & Cleaning' arrive ONLY via the renames below
  // (when their source aisle still exists), never via this union.
  var AISLE_V2_NEW_STARTERS = ['Meat', 'Seafood', 'Deli', 'Cereal & Breakfast', 'Canned & Jarred', 'Pasta, Rice & Grains', 'Baking & Spices', 'Condiments & Sauces', 'Snacks & Candy', 'Personal Care & Health'];
  // Q3 = rename-migration: [oldNormalizedKey, newName]. One-time rename + item
  // re-tag (MERGE-not-duplicate if the target already exists). 'Meat/Seafood' is
  // intentionally NOT renamed - it survives untouched as a custom aisle while
  // 'Meat' and 'Seafood' are added fresh (via AISLE_V2_NEW_STARTERS).
  var AISLE_V2_RENAMES = [['dairy', 'Dairy & Eggs'], ['household', 'Household & Cleaning']];
  // S36 v3 union: the single genuinely-new starter this version introduces. ONLY
  // 'International' is unioned in (NEVER the full starter list), so V3 can never
  // resurrect a user-deleted v2 starter (N13). No renames/re-tags in v3 - it is a
  // pure additive union, so it never re-maps an item.aisle.
  var AISLE_V3_NEW_STARTERS = ['International'];
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
  // S32: the per-item "Auto-detect" trigger inside the ⌖ aisle <select>. Detected
  // STRUCTURALLY (reserved VALUE + data-autodetect="1"), exactly mirroring S24's
  // sentinel - NEVER matched by label (N12), so a user aisle literally named
  // "Auto-detect" can never collide. Rendered as the TOP option (index 0); the
  // "+ Add new aisle…" sentinel stays LAST. ICON_GLYPH (⭍ U+2B4D; ↯ U+21AF is
  // the NB-6 on-device fallback) is decorative; AUTODETECT_LABEL is the
  // human-facing / N12-validation label (no glyph, so normalize() rejects a
  // plain "Auto-detect" too).
  var AUTODETECT_VALUE = '__VOPPING_AUTODETECT__';
  var AUTODETECT_LABEL = 'Auto-detect';
  var AUTODETECT_ICON_GLYPH = '⭍';
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

  // ---- S28: one-time versioned taxonomy re-seed ----------------------------
  // Runs AFTER loadState() on every load, but MUTATES exactly once per device:
  // gated on st.seedVersion so a reload at the current version is a pure no-op
  // (idempotency; NB-7 re-pointed to "stable AFTER the one-time upgrade"). For a
  // FRESH state (already seeded from the new AISLE_STARTER_LIST by migrateAisles)
  // this is a near no-op - the renames find no old source, the union finds all
  // starters present - it just stamps the version. For an EXISTING pre-S28
  // device it: renames Dairy->"Dairy & Eggs" and Household->"Household &
  // Cleaning" (+ re-tags their items, MERGE-not-duplicate), then UNIONS the
  // genuinely-new starters, then stamps the version. Order is pinned (M27):
  // renames FIRST, then the new-starter union, then the version stamp - the
  // renames can only turn an old source into a new target (never the reverse),
  // and the union's dedup is case-insensitive, so the end state is
  // order-independent, but this order keeps the renamed entries adjacent to
  // where they already sat (existing users keep their familiar ordering; only
  // fresh users get the pure store-walk order). Returns true iff it mutated.
  // Reuses the S23 cascade helper (renameAisleByKey) for the plain-rename case;
  // both are normalized-key re-tags so non-canonical item values come along
  // (NB-2). No item.aisle is re-mapped except by the two explicit renames.
  function migrateAislesV2(st) {
    // Defensive (R1 posture - this runs at init and must never throw/blank the
    // page): migrateAisles() always leaves st.aisles/st.items as arrays, but
    // guard anyway rather than trust it.
    if (!st || !Array.isArray(st.aisles) || !Array.isArray(st.items)) return false;
    // S36: gate on the LITERAL 2 (NOT the global AISLE_SEED_VERSION, now 3) - so
    // this step runs exactly on a device below v2 and NEVER re-runs on a v2/v3
    // device. Pinning to the literal is the data-safety fix: keying this to the
    // global would re-open the gate whenever the global is bumped, re-running the
    // union and resurrecting a user-deleted v2 starter (N13).
    if (typeof st.seedVersion === 'number' && st.seedVersion >= 2) {
      return false; // already at/after v2 - one-time gate closed (idempotent)
    }
    var i, r;
    // 1. RENAMES (+ item re-tag, MERGE-not-duplicate). Only when the OLD source
    //    aisle still exists (normalized-key), so a user-deleted 'Dairy' is NOT
    //    resurrected as 'Dairy & Eggs' (no-resurrect).
    for (r = 0; r < AISLE_V2_RENAMES.length; r++) {
      reseedRenameAisle(st, AISLE_V2_RENAMES[r][0], AISLE_V2_RENAMES[r][1]);
    }
    // 2. UNION the genuinely-new starters (append if absent, case-insensitive).
    var have = {};
    for (i = 0; i < st.aisles.length; i++) have[normalize(st.aisles[i])] = true;
    for (i = 0; i < AISLE_V2_NEW_STARTERS.length; i++) {
      var nk = normalize(AISLE_V2_NEW_STARTERS[i]);
      if (!have[nk]) { have[nk] = true; st.aisles.push(AISLE_V2_NEW_STARTERS[i]); }
    }
    // 3. Stamp the LITERAL 2 (NOT the global) so this step never runs again on
    //    this device even after AISLE_SEED_VERSION is bumped past 2. V3 runs
    //    right after and advances the stamp to 3.
    st.seedVersion = 2;
    return true;
  }

  // ---- S36: one-time versioned taxonomy re-seed (v3: International) ----------
  // Mirrors migrateAislesV2's shape, pinned to its OWN LITERAL target (3), NOT
  // the global AISLE_SEED_VERSION. V2 is gated >=2/stamps=2 and V3 is gated
  // >=3/stamps=3; run V2 then V3 in ascending order after loadState(). Because
  // each step owns its literal gate, bumping AISLE_SEED_VERSION to 3 can NEVER
  // re-open V2's gate on a v2 device (which would re-run V2's union and
  // resurrect a user-deleted v2 starter - N13). V3 is a PURE ADDITIVE union of
  // the single new starter 'International' (AISLE_V3_NEW_STARTERS): no
  // rename/re-tag, so it never re-maps an item.aisle and never drops a user
  // aisle; union-by-normalized-key means a user-hand-created 'International' is
  // merged, not duplicated; and once it stamps seedVersion=3 the gate closes, so
  // a later user delete of 'International' is never resurrected (N13). Runs at
  // init - R1-defensive, must never throw/blank the page. Returns true iff it
  // mutated.
  function migrateAislesV3(st) {
    if (!st || !Array.isArray(st.aisles) || !Array.isArray(st.items)) return false;
    if (typeof st.seedVersion === 'number' && st.seedVersion >= 3) {
      return false; // already at/after v3 - one-time gate closed (idempotent)
    }
    var i, have = {};
    for (i = 0; i < st.aisles.length; i++) have[normalize(st.aisles[i])] = true;
    for (i = 0; i < AISLE_V3_NEW_STARTERS.length; i++) {
      var nk = normalize(AISLE_V3_NEW_STARTERS[i]);
      if (!have[nk]) { have[nk] = true; st.aisles.push(AISLE_V3_NEW_STARTERS[i]); }
    }
    st.seedVersion = 3; // literal target - see header
    return true;
  }

  // S28 rename helper: rename oldKey's aisle to newName + re-tag its items. If a
  // 'newName' aisle already exists (user created it), MERGE - re-tag the source
  // items onto the surviving target and DROP the source entry (never create a
  // duplicate). No source aisle at all -> no-op (no-resurrect). Operates on the
  // passed state so it is safe to call during init before the module `state` var
  // read paths matter; the plain-rename branch reuses S23's renameAisleByKey.
  function reseedRenameAisle(st, oldKey, newName) {
    var newKey = normalize(newName);
    var hasSource = false, targetDisplay = null, i, k;
    for (i = 0; i < st.aisles.length; i++) {
      k = normalize(st.aisles[i]);
      if (k === oldKey) hasSource = true;
      else if (k === newKey) targetDisplay = st.aisles[i];
    }
    if (!hasSource) return; // no-resurrect
    if (!targetDisplay) {
      renameAisleByKey(oldKey, newName); // S23 cascade helper: relabel + re-tag items
      return;
    }
    // MERGE onto the pre-existing target: re-tag source items, then drop the
    // source entry so state.aisles doesn't gain a duplicate 'newName'.
    for (i = 0; i < st.items.length; i++) {
      if (st.items[i].aisle && normalize(st.items[i].aisle) === oldKey) {
        st.items[i].aisle = targetDisplay;
      }
    }
    for (i = st.aisles.length - 1; i >= 0; i--) {
      if (normalize(st.aisles[i]) === oldKey) st.aisles.splice(i, 1);
    }
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
  // S30: load the personal override map BEFORE the re-seed below, because the
  // S23 rename/delete cascade helpers (renameAisleByKey/deleteAisleByKey) now
  // also cascade into `overrides`, and migrateAislesV2 can call renameAisleByKey
  // during a direct pre-S28 -> S30 upgrade. Loading it here keeps the reference
  // always-defined (the map is empty on that upgrade path, so the cascade is a
  // harmless no-op). Defensive parse (R1 posture) - never throws before render.
  var overrides = loadOverrides();
  // S28: one-time versioned taxonomy re-seed (18-aisle Auto-Aisle taxonomy).
  // Runs here, right after loadState(), because migrateAisles() (called inside
  // loadState via parseStoredState) short-circuits on an already-seeded
  // state.aisles and would never see the expanded starter list. Idempotent -
  // mutates once per device (seedVersion gate), then the saveState() below makes
  // the upgraded set durable from the outset.
  migrateAislesV2(state);
  // S36: v3 union runs right after v2, in ascending version order. Each step owns
  // its literal gate/stamp (V2:2, V3:3), so both run exactly once on a pre-v2
  // device, only V3 runs on a v2 device, and neither runs on a v3 device.
  migrateAislesV3(state);
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

  // ---- S30: personal override map (learning) --------------------------------
  // Same defensive-guard posture as parseStoredState (R1) / parseFrequencyState:
  // a wrong-shape / null / non-object / array top-level value, or any individual
  // entry that isn't a non-empty string->non-empty string pair, is dropped rather
  // than allowed to crash a later read. NEVER throws before the render loop.
  // Q2 is enforced at WRITE time (recordOverride never stores ''), but the parse
  // also drops any stray ''-value defensively so a hand-edited/corrupt file can't
  // reintroduce a no-aisle override.
  function parseOverrideState(raw) {
    if (!raw) return {};
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return {}; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    var result = {};
    for (var key in parsed) {
      if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
      var val = parsed[key];
      if (typeof key === 'string' && key.trim() && typeof val === 'string' && val.trim()) {
        result[key] = val;
      }
    }
    return result;
  }

  function loadOverrides() {
    try {
      return parseOverrideState(window.localStorage.getItem(OVERRIDES_KEY));
    } catch (e) {
      return {};
    }
  }

  function saveOverrides() {
    try {
      window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (e) {
      // localStorage unavailable (private browsing) - same graceful degradation
      // as saveState/saveFrequency; the map still works for this session.
    }
  }

  // Record a learned override for a HAND pick only (callers gate on that). Q2:
  // a clear-to-no-aisle ('') records NOTHING and leaves any existing entry
  // untouched (never a ''-override). Keyed by normalize(name), same key space
  // the matcher's tier-1 lookup uses.
  function recordOverride(name, aisle) {
    var key = normalize(name);
    if (!key) return;
    var a = String(aisle).trim();
    if (!a) return; // Q2: no ''-override
    overrides[key] = a;
    saveOverrides();
  }

  // R15: an aisle that gets ASSIGNED to an item must exist in state.aisles so it
  // renders as a real <select> option (closes the dangling-value class for
  // custom-aisle override/matcher targets). Case-insensitive; no-op for '' or an
  // already-present aisle. Callers that assign an aisle route through saveAisle,
  // which calls this.
  function ensureAisleExists(aisle) {
    var a = String(aisle).trim();
    if (!a) return;
    var key = normalize(a);
    for (var i = 0; i < state.aisles.length; i++) {
      if (normalize(state.aisles[i]) === key) return;
    }
    state.aisles.push(a);
  }

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
    // Message is the descriptive half ONLY - showToast() appends the em-dash +
    // the REAL Undo <button> (so the toast's own "Undo" word actually undoes;
    // see showToast). Toast textContent stays exactly 'Deleted "X" — Undo'.
    showToast('Deleted "' + entry.item.name + '"');
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
    // Descriptive half only - showToast() appends the em-dash + real Undo button
    // (textContent stays exactly 'Cleared N items — Undo').
    showToast('Cleared ' + entries.length + ' item' + (entries.length === 1 ? '' : 's'));
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
    } else if (action.type === 'aisle-bulk') {
      // S31: undo a list-wide Auto-aisle run - restore every TOUCHED item to its
      // prior aisle. Each touched item was empty ('') at run time, so this
      // re-clears them. Re-derive by id (defensive, like the reorder branch);
      // an item could have been deleted since - skip those.
      for (var ab = 0; ab < action.entries.length; ab++) {
        var abIdx = findIndexById(action.entries[ab].id);
        if (abIdx !== -1) state.items[abIdx].aisle = action.entries[ab].prevAisle;
      }
    }
    // Undo itself is not further undoable (no redo) - clears the buffer and
    // the control disables until a new mutating action creates a fresh
    // target.
    clearLastAction();
    saveState();
    render();
    // Dismiss any lingering delete/clear toast: the action it advertised has now
    // been undone, so its own Undo affordance would be stale (fires whether undo
    // came from the header button OR the toast itself).
    hideToast();
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

  // S26 (Locked, 2026-09-11): the per-item aisle affordance glyph - the PO's
  // pick from the post-Lock set-aisle/glyph mockup (s26-aisle-presentation-
  // picker.html), U+2316 POSITION INDICATOR (⌖). A plain monochrome Unicode
  // symbol glyph that inherits CSS `color` (NOT a colored emoji, per the PO's
  // standing icon preference). It is overlaid on the COLLAPSED aisle <select>
  // via a pointer-events:none, aria-hidden span (renderAisleSelect), so a tap
  // falls THROUGH to the native <select> and opens the picker directly (one
  // tap, no showPicker()). S27 sizes THIS glyph via the overlay span's own
  // font-size - it is NOT an .icon-btn box (M26).
  var AISLE_ICON_GLYPH = '⌖';

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

  // S26 iOS regression fix (2026-09-11). The sentinel -> new-aisle reveal path
  // (change handler -> openNewAisleEditor -> render() -> focusNewAisleInput) is
  // byte-for-byte the same as pre-S26, but S26 moved the always-present aisle
  // <select> OFF the (previously always-emitted) second line onto the primary
  // line, making .row-meta conditional. So on an aisle-less row, opening this
  // editor now GROWS the row from one line to two (a brand-new .row-meta
  // appears). On iOS Safari that layout growth collides with the programmatic
  // input.focus(): iOS begins its async scroll-into-view + keyboard raise (the
  // PO's "screen bumps up and down"), but does NOT settle focus synchronously,
  // so `document.activeElement` is transiently <body> - NOT the reveal input.
  // The pre-existing deferred focusout flush (from the torn-down <select>, and
  // then from the input's own bounce-blur) therefore misses its activeElement
  // guard and runs commitEditor()'s 'new-aisle' REVERT branch, render()-ing the
  // just-opened editor away ("doesn't do anything"). Desktop never hit this
  // because there the focus lands synchronously so the activeElement guard
  // already skips. The guard below adds an OPEN-TRANSITION grace window: a
  // deferred flush must not revert a new-aisle editor that was focused within
  // the last NEW_AISLE_OPEN_GRACE_MS, i.e. while iOS's focus/scroll is still
  // settling. It changes NOTHING on desktop (the activeElement guard already
  // covers that transition there) and is scoped tightly to this fragile window,
  // so R14's picker-dismiss flush and S24's genuine abandon=revert (both of
  // which fire long after the window) are untouched.
  // S27 (2026-09-11): the same deferred flush now also COMMITS a non-empty valid
  // new-aisle name on blur (iOS "Go" saves it) rather than always reverting - see
  // the focusout handler's S27 note for the full three-case rule.
  var newAisleOpenedAt = 0;
  var NEW_AISLE_OPEN_GRACE_MS = 400;

  // S28 iOS regression fix (2026-09-14, ROUND 3). After a SUCCESSFUL new-aisle
  // create the flow must settle CLOSED, but on iOS Safari it re-opened: rounds
  // 1+2 made the typed name save+assign (commitNewAisle nulls editingField and
  // re-renders, so the reveal input is correctly gone) - yet the PO saw "the
  // menu is not closing after populating the aisle". Confirmed mechanism (A/B-
  // proven on desktop, see vop-r3-verify.js): the create appends the new aisle
  // to state.aisles right BEFORE the always-last "+ Add new aisle…" sentinel, so
  // in the freshly re-rendered <select> the just-created option and the sentinel
  // are ADJACENT. commitNewAisle's render() rebuilds that collapsed <select> at
  // the exact spot the just-dismissed reveal input / keyboard occupied, and iOS
  // re-dispatches the trailing touch (the keyboard-dismiss "ghost tap" after the
  // layout shrinks back a line) onto it - nudging the native picker onto the
  // adjacent sentinel and firing a SECOND `change` carrying the sentinel value.
  // That re-enters the change handler's sentinel branch -> openNewAisleEditor()
  // -> the reveal editor re-appears even though the aisle is already set (the
  // <select> still shows the created aisle, matching the PO's "populated but the
  // menu stayed open"). Desktop never hit it because there is no ghost tap. Fix:
  // a short post-commit re-entry window (mirroring round-1's open-transition
  // grace idiom) - a sentinel `change` on the SAME row within
  // NEW_AISLE_REENTRY_GUARD_MS of that row's own successful create is treated as
  // the ghost re-fire: snap the <select> back to the committed aisle, do NOT
  // re-open. Scoped to id+time so it never blocks legitimately re-opening the
  // picker to add another aisle later, or on any other row (the mirror-bug trap).
  var newAisleCommittedAt = 0;
  var newAisleCommittedId = null;
  var NEW_AISLE_REENTRY_GUARD_MS = 400;

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

  function saveAisle(id, rawValue, opts) {
    var idx = findIndexById(id);
    if (idx === -1) return;
    // S22: rawValue is the chosen <option>'s canonical display string (or ''
    // for the no-aisle bucket). Storing it CANONICALIZES the item on first edit
    // - a pre-existing non-canonical value (e.g. 'produce' from free-text S8)
    // is displayed correctly via normalized-key <option> selection until the
    // user actively re-picks, at which point it becomes the canonical casing.
    // trim() is harmless (option values carry no stray whitespace).
    var value = String(rawValue).trim();
    // R15: make sure the assigned aisle is a real option (matters for the future
    // S31/S32 auto-assign of a custom-aisle override target; a no-op for a hand
    // pick, whose value always came from the existing <select>).
    ensureAisleExists(value);
    state.items[idx].aisle = value;
    // S30: LEARN from this pick unless it's an auto-write. This is the single
    // choke point for aisle assignment, so the record-SUPPRESS flag lives here:
    // a HAND pick (the delegated change handler + commitNewAisle) records the
    // override; a future auto-write (S31 bulk-run / S32 Auto-detect) passes
    // { viaAuto: true } to set the aisle WITHOUT learning ("record only on hand
    // pick"). Q2 (clear-to-no-aisle records nothing) is handled inside
    // recordOverride, which ignores an empty value.
    if (!(opts && opts.viaAuto)) {
      recordOverride(state.items[idx].name, value);
    }
    saveState();
    render();
  }

  // ---- S31: list-wide fill-empty-only "Auto-aisle" run ---------------------
  // Runs the S29/S30 matcher on every item whose aisle is the INTRINSIC '' (M30:
  // the empty value itself, NOT "normalizes to the bucket label" - so a
  // re-created real, assignable 'Other' aisle is a SET aisle and is left alone).
  // A matched item is assigned via the saveAisle-SHAPE write (set aisle + R15
  // ensureAisleExists) with NO override recorded - auto-writes never learn (S30),
  // so tier 1 is never poisoned. The whole run is ONE undoable 'aisle-bulk'
  // action snapshotting { id, prevAisle } for each TOUCHED (matched) item; it
  // clobbers the single S6 slot ONLY when >=1 item actually changed.
  function runAutoAisle() {
    var entries = [];   // { id, prevAisle } for each item actually assigned
    var eligible = 0;   // items with the intrinsic '' aisle (M30 eligibility)
    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      if (it.aisle !== '') continue; // fill-empty-ONLY: never touch a set aisle
      eligible++;
      var res = matchAisle(it.name); // no opts = runtime dictionary + tier-1 overrides
      if (res && res.aisle) {
        entries.push({ id: it.id, prevAisle: it.aisle }); // prevAisle is '' here
        ensureAisleExists(res.aisle); // R15: keep a matcher-assigned aisle a real option
        it.aisle = res.aisle;
      }
    }
    // ZERO-ELIGIBLE run: fully silent no-op - no toast, no undo entry, no slot
    // change (reserved for "no item had an empty aisle", per the locked UX).
    if (eligible === 0) return;
    var n = entries.length; // sorted (matched + assigned)
    var m = eligible - n;   // eligible-but-unmatched
    // Arm the bulk-undo + clobber the single slot ONLY when >=1 item changed
    // (n>=1); setLastAction runs BEFORE showToast so the toast's Undo binds to
    // this action. The n=0/m>=1 feedback toast must NOT touch the slot (M30/M1).
    if (n >= 1) {
      setLastAction({ type: 'aisle-bulk', entries: entries });
      saveState();
      render();
    }
    // FROZEN toast strings (no trailing period; showToast appends " — Undo" for
    // the armed forms). '·' = U+00B7 middle dot, one space each side;
    // "couldn't be matched" is invariant (never pluralizes); "Sorted {n}" for
    // all n>=1 (n=1 -> "Sorted 1", no "item").
    if (n >= 1 && m === 0) {
      showToast('Sorted ' + n);
    } else if (n >= 1 && m >= 1) {
      showToast('Sorted ' + n + ' · ' + m + ' couldn\'t be matched');
    } else {
      // n===0, m>=1: nothing matched, but eligible>0 so the user still gets
      // feedback their tap acted. withUndo=false: no live Undo affordance and
      // toastAction stays null, so a stray tap can never undo an unrelated
      // prior action (the single slot is deliberately left untouched).
      showToast(m + ' couldn\'t be matched', false);
    }
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
    // S32 N12 (belt-and-suspenders): reject a name that normalizes to the
    // Auto-detect label - same treatment the S24 sentinel label gets above.
    // Detection itself is structural (data-autodetect), never by this label; the
    // label has no glyph so normalize() also rejects a plain "Auto-detect".
    if (key === normalize(AUTODETECT_LABEL)) return 'That name is reserved.';
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
    // S30: cascade the rename INTO the personal override map - update every
    // override whose learned TARGET is this aisle so the learning survives the
    // rename (preserves "a wrong guess is never repeated" across a rename; M28
    // pinned cascade over validate-and-drop). Guarded: `overrides` may be
    // undefined if this runs during a pre-S28 migration (empty then anyway).
    if (overrides) {
      for (var ok in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, ok) && normalize(overrides[ok]) === oldKey) {
          overrides[ok] = trimmed;
        }
      }
      saveOverrides();
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
    // S30: cascade the delete INTO the personal override map - DROP every
    // override whose learned target was this aisle (M28: DROP, never blank to
    // '' - a ''-override would silently defeat Q2 and pin the item to no-aisle
    // on a later auto-run). Guarded like the rename cascade.
    if (overrides) {
      for (var ok in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, ok) && normalize(overrides[ok]) === key) {
          delete overrides[ok];
        }
      }
      saveOverrides();
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
      // S26 iOS fix: arm the open-transition grace window at the exact moment we
      // (re)focus the reveal input - both the initial sentinel reveal
      // (openNewAisleEditor) and the stay-open-on-invalid re-focus
      // (commitNewAisle) route through here, so both are protected from the
      // deferred focusout flush during iOS's async focus/scroll settling. See
      // the newAisleOpenedAt declaration and the focusout handler.
      newAisleOpenedAt = Date.now();
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
    if (idx !== -1) {
      state.items[idx].aisle = trimmed;
      // S30: creating + assigning a NEW aisle by hand is a hand pick - learn it.
      // This is precisely how CUSTOM aisles get auto-populated (the built-in
      // dictionary only knows the 17 canonical aisles), per the spec's §3.3.
      recordOverride(state.items[idx].name, trimmed);
    }
    editingField = null;
    // S28: arm the post-commit re-entry window for THIS row (see the
    // newAisleCommittedAt declaration + the change handler's sentinel guard).
    newAisleCommittedAt = Date.now();
    newAisleCommittedId = id;
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

  // ==== S29: auto-aisle dictionary matcher (pure engine, no DOM) ============
  // The graduated dictionary is window.AISLE_DICTIONARY (aisle-dictionary.js,
  // loaded via <script> BEFORE this file, so it is present at init). Shape:
  //   window.AISLE_DICTIONARY[aisle] = [ { name: string, aliases: [string] } ]
  // authored in store-walk order (spec §1). The PO hand-edits this file, so
  // EVERYTHING here DEGRADES GRACEFULLY (R16): the runtime lookup-build and the
  // matcher must NEVER throw before the render loop - a typo/malformed entry is
  // console.warn+skipped and a canonical-vs-canonical collision resolves by
  // first-write-wins (store-walk order), exactly parseStoredState's R1 posture.
  // The HARD fail-fast (throw on any shape/type/uniqueness/collision problem)
  // lives ONLY in validateDictionary() - the dev/test data-integrity gate, which
  // is NEVER called at runtime.

  // Frozen quantity/unit token set: stripped from the ITEM name (not from the
  // dictionary) before the whole-token (tier 4) scan, so a leading "2 lbs " /
  // "16 oz " tolerates through to the real item token(s) (spec §3.4). Kept
  // deliberately CONSERVATIVE - pure measurement/quantity words only, never
  // container words (can/bag/jar/box/bottle/head/bunch/stick), which appear
  // inside real dictionary aliases and must stay matchable.
  var AUTO_AISLE_STRIP_TOKENS = {
    lb: 1, lbs: 1, pound: 1, pounds: 1, oz: 1, ounce: 1, ounces: 1,
    g: 1, gram: 1, grams: 1, kg: 1, kilogram: 1, kilograms: 1, mg: 1,
    ml: 1, l: 1, liter: 1, liters: 1, litre: 1, litres: 1,
    gal: 1, gallon: 1, gallons: 1, qt: 1, quart: 1, quarts: 1,
    pt: 1, pint: 1, pints: 1, tsp: 1, teaspoon: 1, teaspoons: 1,
    tbsp: 1, tablespoon: 1, tablespoons: 1, cup: 1, cups: 1,
    ct: 1, count: 1, dozen: 1, pk: 1, pkg: 1, pack: 1, packs: 1, x: 1
  };

  // The soft LOWER-BOUND for the item count - a LOG/warn only, never a hard
  // error (R16 folded: don't false-tripwire the very hand-edits the file invites).
  var AUTO_AISLE_MIN_COUNT = 1286;

  // The intentional easter egg, whitelisted by the data-integrity gate so it is
  // never treated as a data error (typing "difficult" resolves lemon->Produce
  // via tier 3). Exposed so the Tester's standing assertion matches the ship.
  var AUTO_AISLE_INTEGRITY_WHITELIST = [
    { aisle: 'Produce', canonical: 'lemon', alias: 'difficult' }
  ];

  function autoAisleWarn(msg) {
    try { if (typeof console !== 'undefined' && console.warn) console.warn('[auto-aisle] ' + msg); } catch (e) {}
  }
  function autoAisleHasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
  // Loose tokenization: lowercase (via normalize), split on ANY non-alphanumeric
  // so punctuation ("(organic)", "st.", "1/2", "t-bone") never defeats a token
  // match. Used for BOTH the dictionary token maps and the item scan (the item
  // scan additionally drops pure-number and strip-set tokens).
  function autoAisleLooseTokens(value) {
    var raw = normalize(value).split(/[^a-z0-9]+/);
    var out = [];
    for (var i = 0; i < raw.length; i++) { if (raw[i]) out.push(raw[i]); }
    return out;
  }
  function autoAisleTokenKey(value) {
    return autoAisleLooseTokens(value).join(' ');
  }
  function autoAisleItemTokens(value) {
    var raw = autoAisleLooseTokens(value);
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var t = raw[i];
      if (/^[0-9]+$/.test(t)) continue;           // pure number -> strip
      if (AUTO_AISLE_STRIP_TOKENS[t]) continue;    // measurement/quantity word -> strip
      out.push(t);
    }
    return out;
  }

  // Build the O(1) lookup once (spec §4). Returns FOUR maps (a superset of the
  // { canonicalMap, aliasMap } contract): exact maps keyed by normalize() for
  // tiers 2/3, and token maps keyed by the loose token-key for tier 4. Every map
  // is first-write-wins in store-walk order (dictionary key order), which is the
  // deterministic canonical-vs-canonical / alias-vs-alias cross-aisle tiebreak
  // (e.g. bare "drumstick": alias of Meat's chicken drumstick AND Frozen's ice
  // cream cone -> Meat wins, earlier in the walk). NEVER throws (R16 degrade):
  // an absent/empty/malformed dictionary yields empty maps; malformed entries
  // are console.warn+skipped. INJECTABLE - pass any dictionary for tests.
  function buildLookup(dictionary) {
    var canonicalMap = {}, aliasMap = {}, canonicalTokenMap = {}, aliasTokenMap = {};
    var result = {
      canonicalMap: canonicalMap, aliasMap: aliasMap,
      canonicalTokenMap: canonicalTokenMap, aliasTokenMap: aliasTokenMap
    };
    if (!dictionary || typeof dictionary !== 'object' || Array.isArray(dictionary)) return result;
    var aisles;
    try { aisles = Object.keys(dictionary); } catch (e) { return result; }
    for (var a = 0; a < aisles.length; a++) {
      var aisle = aisles[a];
      if (normalize(aisle) === normalize(OTHER_LABEL)) continue; // "Other" = no-match bucket, never a target
      var entries = dictionary[aisle];
      if (!Array.isArray(entries)) { autoAisleWarn('aisle "' + aisle + '" is not an array - skipped'); continue; }
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        if (!entry || typeof entry !== 'object' || typeof entry.name !== 'string') {
          autoAisleWarn('malformed entry in "' + aisle + '" - skipped'); continue;
        }
        var name = entry.name;
        var nk = normalize(name);
        if (!nk) { autoAisleWarn('empty canonical in "' + aisle + '" - skipped'); continue; }
        var crec = { aisle: aisle, canonical: name, text: name };
        if (!autoAisleHasOwn(canonicalMap, nk)) canonicalMap[nk] = crec; // first-write-wins
        var ctk = autoAisleTokenKey(name);
        if (ctk && !autoAisleHasOwn(canonicalTokenMap, ctk)) canonicalTokenMap[ctk] = crec;
        var aliases = entry.aliases;
        if (aliases != null && !Array.isArray(aliases)) { autoAisleWarn('aliases of "' + name + '" not an array - ignored'); aliases = null; }
        if (Array.isArray(aliases)) {
          for (var al = 0; al < aliases.length; al++) {
            var alias = aliases[al];
            if (typeof alias !== 'string') { autoAisleWarn('non-string alias in "' + name + '" - skipped'); continue; }
            var ak = normalize(alias);
            if (!ak) continue;
            var arec = { aisle: aisle, canonical: name, text: alias };
            if (!autoAisleHasOwn(aliasMap, ak)) aliasMap[ak] = arec; // first-write-wins
            var atk = autoAisleTokenKey(alias);
            if (atk && !autoAisleHasOwn(aliasTokenMap, atk)) aliasTokenMap[atk] = arec;
          }
        }
      }
    }
    return result;
  }

  // Resolve an item name to an aisle. Precedence (spec §3.4, first hit wins;
  // FIRM: t2 canonical-exact beats t3 alias-exact beats t4 whole-token):
  //   1 personal override (S30; exact on normalize(name)) - dictionary-INDEPENDENT
  //   2 dictionary canonical-exact      3 dictionary alias-exact
  //   4 whole-token (canonical beats alias, longest match wins) with leading
  //     quantity/unit tolerance          5 no match -> no-aisle ('')
  // Returns { aisle, tier, matchedText } always (tier 5 -> aisle '', matchedText '').
  // opts (all optional, INJECTABLE for tests): { lookup, dictionary, overrides }.
  // Runtime callers pass nothing -> the once-at-load autoAisleLookup + no
  // overrides (S30 will pass overrides). The `dictionary` param REBUILDS a lookup
  // (tests only); runtime never rebuilds per item.
  function matchAisle(name, opts) {
    opts = opts || {};
    var lookup = opts.lookup || (opts.dictionary != null ? buildLookup(opts.dictionary) : autoAisleLookup) || buildLookup(null);
    // S30 tier-1 source: an EXPLICITLY-injected `overrides` (tests / future
    // callers) wins; otherwise the RUNTIME reads the persisted personal override
    // map (module `overrides`). Using hasOwnProperty on opts so a test can force
    // "no overrides" with { overrides: null }. Dictionary-INDEPENDENT: tier 1
    // resolves even when the dictionary is absent (the R16 degrade seam).
    var overrideMap = (opts && Object.prototype.hasOwnProperty.call(opts, 'overrides'))
      ? opts.overrides
      : (typeof overrides !== 'undefined' ? overrides : null);
    var key = normalize(name);
    if (!key) return { aisle: '', tier: 5, matchedText: '' };
    // Tier 1: personal override (dictionary-independent; degrade-seam safe).
    if (overrideMap && autoAisleHasOwn(overrideMap, key)) {
      var ov = overrideMap[key];
      if (typeof ov === 'string' && ov !== '') return { aisle: ov, tier: 1, matchedText: key };
    }
    // Tier 2: canonical exact.
    if (autoAisleHasOwn(lookup.canonicalMap, key)) {
      var c = lookup.canonicalMap[key];
      return { aisle: c.aisle, tier: 2, matchedText: c.text };
    }
    // Tier 3: alias exact.
    if (autoAisleHasOwn(lookup.aliasMap, key)) {
      var al2 = lookup.aliasMap[key];
      return { aisle: al2.aisle, tier: 3, matchedText: al2.text };
    }
    // Tier 4: whole-token (NOT raw substring - "ham" never matches "hamburger",
    // "corn"/"popcorn", "ice"/"rice", "pepper"/"peppercorns", "oat"/"goat").
    // Scan contiguous token windows longest-first; at a given length prefer a
    // canonical hit over an alias hit (both maps are already cross-aisle-resolved).
    var toks = autoAisleItemTokens(name);
    for (var L = toks.length; L >= 1; L--) {
      var aliasHit = null;
      for (var i = 0; i + L <= toks.length; i++) {
        var phrase = toks.slice(i, i + L).join(' ');
        if (autoAisleHasOwn(lookup.canonicalTokenMap, phrase)) {
          var ct = lookup.canonicalTokenMap[phrase];
          return { aisle: ct.aisle, tier: 4, matchedText: ct.text }; // canonical wins at this length
        }
        if (!aliasHit && autoAisleHasOwn(lookup.aliasTokenMap, phrase)) {
          aliasHit = lookup.aliasTokenMap[phrase]; // remember leftmost alias at this length
        }
      }
      if (aliasHit) return { aisle: aliasHit.aisle, tier: 4, matchedText: aliasHit.text };
    }
    // Tier 5: no match -> the intrinsic no-aisle value.
    return { aisle: '', tier: 5, matchedText: '' };
  }

  // ---- S29: standing dev/test data-integrity gate (HARD fail-fast) ----------
  // NEVER called at runtime - only from the Tester's suite / the exposed hook,
  // where a PO hand-edit regression belongs (R16). THROWS on any structural /
  // type / within-aisle-canonical-uniqueness / canonical-vs-canonical
  // cross-aisle-collision problem, EXCEPT the whitelisted easter egg. The item
  // count is a SOFT lower-bound LOG (never an error). Returns { count, aisleCount,
  // warnings } on success. INJECTABLE dictionary (defaults to window's).
  function validateDictionary(dictionary) {
    var dict = dictionary || (typeof window !== 'undefined' ? window.AISLE_DICTIONARY : null);
    if (!dict || typeof dict !== 'object' || Array.isArray(dict)) {
      throw new Error('AISLE_DICTIONARY integrity: not a plain object');
    }
    var wl = {}; // normalized "aisle|canonical|alias" -> true
    for (var w = 0; w < AUTO_AISLE_INTEGRITY_WHITELIST.length; w++) {
      var e0 = AUTO_AISLE_INTEGRITY_WHITELIST[w];
      wl[normalize(e0.aisle) + '|' + normalize(e0.canonical) + '|' + normalize(e0.alias)] = true;
    }
    var errors = [], warnings = [], canonHome = {}, count = 0;
    var aisles = Object.keys(dict);
    for (var a = 0; a < aisles.length; a++) {
      var aisle = aisles[a];
      var entries = dict[aisle];
      if (!Array.isArray(entries)) { errors.push('aisle "' + aisle + '" is not an array'); continue; }
      var within = {};
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        if (!entry || typeof entry !== 'object') { errors.push('non-object entry in "' + aisle + '"'); continue; }
        if (typeof entry.name !== 'string' || !entry.name.trim()) { errors.push('non-string/empty canonical in "' + aisle + '"'); continue; }
        count++;
        var nk = normalize(entry.name);
        if (within[nk]) errors.push('within-aisle duplicate canonical: "' + entry.name + '" in ' + aisle);
        within[nk] = true;
        if (autoAisleHasOwn(canonHome, nk) && canonHome[nk] !== aisle) {
          errors.push('canonical-vs-canonical cross-aisle collision: "' + entry.name + '" in ' + canonHome[nk] + ' & ' + aisle);
        } else if (!autoAisleHasOwn(canonHome, nk)) {
          canonHome[nk] = aisle;
        }
        var aliases = entry.aliases;
        if (aliases != null && !Array.isArray(aliases)) { errors.push('aliases of "' + entry.name + '" is not an array'); aliases = []; }
        for (var al = 0; al < (aliases || []).length; al++) {
          if (typeof aliases[al] !== 'string' || !aliases[al].trim()) {
            if (!wl[normalize(aisle) + '|' + nk + '|' + normalize(aliases[al])]) {
              errors.push('non-string/empty alias of "' + entry.name + '" in ' + aisle);
            }
          }
        }
      }
    }
    warnings.push('item count = ' + count + ' across ' + aisles.length + ' aisles');
    if (count < AUTO_AISLE_MIN_COUNT) warnings.push('count ' + count + ' below soft floor ' + AUTO_AISLE_MIN_COUNT);
    if (errors.length) throw new Error('AISLE_DICTIONARY integrity FAILED (' + errors.length + '):\n  ' + errors.join('\n  '));
    return { count: count, aisleCount: aisles.length, warnings: warnings };
  }

  // Guarded dev/test parity: the seeded starter names (minus Other) should be
  // byte-identical (after normalize) to the dictionary keys, so every matcher
  // output resolves to a seeded <select> option (closes the R15 dangling-value
  // class at the source). GUARDED on dictionary presence (degrade: skip if
  // absent) - never throws. Returns { ok, onlyInStarters, onlyInDict, skipped }.
  function assertSeedDictParity(dictionary) {
    var dict = dictionary || (typeof window !== 'undefined' ? window.AISLE_DICTIONARY : null);
    var result = { ok: true, onlyInStarters: [], onlyInDict: [], skipped: false };
    if (!dict || typeof dict !== 'object' || Array.isArray(dict)) { result.skipped = true; return result; }
    var otherKey = normalize(OTHER_LABEL), i, starters = {}, dictKeys = {};
    for (i = 0; i < AISLE_STARTER_LIST.length; i++) {
      var sk = normalize(AISLE_STARTER_LIST[i]);
      if (sk !== otherKey) starters[sk] = true;
    }
    var keys = Object.keys(dict);
    for (i = 0; i < keys.length; i++) {
      var dk = normalize(keys[i]);
      if (dk !== otherKey) dictKeys[dk] = true;
    }
    for (var s in starters) { if (autoAisleHasOwn(starters, s) && !dictKeys[s]) { result.onlyInStarters.push(s); result.ok = false; } }
    for (var d in dictKeys) { if (autoAisleHasOwn(dictKeys, d) && !starters[d]) { result.onlyInDict.push(d); result.ok = false; } }
    return result;
  }

  // Build the runtime lookup ONCE at load (never rebuilt per item). Wrapped so
  // even an unexpected throw degrades to empty maps rather than blanking the page.
  var autoAisleLookup;
  try {
    autoAisleLookup = buildLookup(typeof window !== 'undefined' ? window.AISLE_DICTIONARY : null);
  } catch (e) {
    autoAisleWarn('lookup build failed, degrading to no-match: ' + (e && e.message));
    autoAisleLookup = buildLookup(null);
  }
  // Guarded parity warn at load (never throws; skipped when the dictionary is absent).
  try {
    if (typeof window !== 'undefined' && window.AISLE_DICTIONARY) {
      var parity = assertSeedDictParity();
      if (!parity.ok) autoAisleWarn('starter/dictionary key mismatch: ' + JSON.stringify(parity));
    }
  } catch (e) {}

  // DOM-free test hook (spec §3.4/§4; injectable dictionary/overrides for tests).
  if (typeof window !== 'undefined') {
    window.__voppingAutoAisle = {
      matchAisle: matchAisle,
      buildLookup: buildLookup,
      validateDictionary: validateDictionary,
      assertSeedDictParity: assertSeedDictParity,
      getLookup: function () { return autoAisleLookup; },
      // S30: read a snapshot of the persisted personal override map.
      getOverrides: function () {
        var out = {};
        for (var k in overrides) { if (Object.prototype.hasOwnProperty.call(overrides, k)) out[k] = overrides[k]; }
        return out;
      },
      // S30: the aisle-assignment seam the future S31 bulk-run / S32 Auto-detect
      // will use internally - set an item's aisle via the real saveAisle path
      // with viaAuto=true (assign WITHOUT learning). Exposed so tests can exercise
      // the auto-write (suppress) path before S31/S32 exist.
      setItemAisle: function (id, aisle, viaAuto) { saveAisle(id, aisle, { viaAuto: !!viaAuto }); },
      STRIP_TOKENS: AUTO_AISLE_STRIP_TOKENS,
      INTEGRITY_WHITELIST: AUTO_AISLE_INTEGRITY_WHITELIST,
      SEED_VERSION: AISLE_SEED_VERSION
    };
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
  // The single-slot action this toast's own Undo affordance is bound to (bound at
  // show-time). If a later mutating action clobbers the buffer while the toast
  // lingers, the toast-Undo no-ops rather than undoing that unrelated action.
  var toastAction = null;
  var sortSelect = document.getElementById('sort-select');
  var autoAisleBtn = document.getElementById('auto-aisle-btn'); // S31 list-wide run
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

    // S26 (Locked, 2026-09-11): the per-item aisle affordance is a COLLAPSED
    // native <select> on the PRIMARY line, in line with the other row icons, in
    // ALL sort modes INCLUDING By-Aisle. Do NOT suppress the CONTROL in By-Aisle
    // - hiding the only edit affordance would break S9's edit-in-every-sort-mode
    // guarantee (the exact self-contradiction S16 caught). It is ALWAYS present
    // (S22's exact R14-safe model - never destroyed/recreated to reveal it),
    // collapsed to an ~19.5px icon footprint purely via CSS with the PO's glyph
    // overlaid as a pointer-events:none span (see renderAisleSelect +
    // .aisle-control CSS). Moving it OFF the always-emitted second line is the
    // density fix: an aisle-less AND note-less row now emits NO .row-meta and
    // stays single-line. The change-commit handler and the focusout
    // activeElement guard are UNCHANGED (R14 safety inherited byte-for-byte).
    var aisleControl = renderAisleSelect(item);

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

    // Second line (.row-meta): S26 emits it ONLY when it has real content (N14 -
    // never emit an empty .row-meta, or its flex-basis:100% + margin-top would
    // reintroduce the very second line the density fix removes; a
    // belt-and-suspenders `.row-meta:empty { display:none }` also guards this in
    // CSS). Content it may hold: an open note editor, a saved note-display, the
    // set-aisle TAG (S26 "Tag-when-set", the PO's Option-1 pick - shown when the
    // item HAS an aisle set, EXCEPT under By-Aisle sort where the group header
    // already labels the aisle, so a per-row tag would be redundant - S16's
    // redundant-tag lesson; the collapsed aisle CONTROL itself still renders on
    // the primary line in every mode), and S24's new-aisle reveal input/error.
    // An aisle-less AND note-less row emits none of these -> no second line ->
    // single-line row (Tester's C2 canonical density signal).
    var aisleVal = item.aisle || '';
    var metaParts = '';
    if (isEditingNote) {
      metaParts += '<input type="text" class="row-meta-input" data-role="note-input" placeholder="Note…" value="' + escapeHtml(editingField.draft) + '">';
    } else if (noteVal) {
      metaParts += '<button type="button" class="note-display" data-role="note-toggle" title="Edit note">' + escapeHtml(noteVal) + '</button>';
    }
    if (aisleVal && sortMode !== 'aisle') {
      // Passive display of the set aisle (canonical casing, mirroring the
      // select). data-role keeps a tap on the tag from falling through to the
      // whole-row cross-off (same nested-control-precedence carve-out
      // note-display uses); it maps to no action branch, so tapping it is inert
      // - the primary-line collapsed select is THE edit affordance.
      metaParts += '<span class="aisle-tag-set" data-role="aisle-tag">' + escapeHtml(aisleDisplayLabel(aisleVal)) + '</span>';
    }
    if (isEditingNewAisle) {
      metaParts += '<input type="text" class="row-meta-input new-aisle-input" data-role="new-aisle-input" placeholder="New aisle name…" autocomplete="off" value="' + escapeHtml(editingField.draft) + '">';
      if (editingField.error) {
        metaParts += '<span class="row-meta-error" data-role="new-aisle-error">' + escapeHtml(editingField.error) + '</span>';
      }
    }
    var secondLine = metaParts ? ('<div class="row-meta">' + metaParts + '</div>') : '';

    return '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '"' +
      ' role="checkbox" tabindex="0" aria-checked="' + (item.checked ? 'true' : 'false') + '" aria-label="' + safeName + '">' +
      nameContent +
      noteAffordance + aisleControl + editButton + reorderButtons +
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
    // S26: the <select> is COLLAPSED to an icon footprint and lives inside a
    // positioned .aisle-control wrapper; its own option text is CSS-clipped
    // (color:transparent) and the visible affordance is the pointer-events:none
    // overlay glyph below. The select KEEPS data-role="aisle-select" (the
    // change-commit handler AND the focusout activeElement guard both match on
    // it - byte-for-byte untouched) and an accessible name via aria-label (N15
    // - sturdier than the old title; title kept too, for a desktop hover
    // tooltip). Option set / values / NB-1 order / R15 dangling-value guard /
    // S24 sentinel are ALL UNCHANGED - this is a presentation-only rework.
    var html = '<span class="aisle-control">';
    html += '<select class="aisle-select" data-role="aisle-select" aria-label="Aisle" title="Aisle">';
    // S32: "Auto-detect" TOP option (index 0), ABOVE the no-aisle option.
    // Structural trigger only (reserved value + data-autodetect="1"); it is
    // NEVER `selected` - the item's real aisle option below carries the
    // selection - so a native <select> shows the chosen aisle, not this option.
    html += '<option value="' + escapeHtml(AUTODETECT_VALUE) + '" data-autodetect="1">' + escapeHtml(AUTODETECT_ICON_GLYPH + ' ' + AUTODETECT_LABEL) + '</option>';
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
    // S26: the visible glyph, overlaid on the collapsed <select>. aria-hidden
    // (N15 - the <select>'s aria-label carries the accessible name); the CSS
    // makes it pointer-events:none so a tap falls through to the <select>.
    html += '<span class="aisle-glyph" aria-hidden="true">' + AISLE_ICON_GLYPH + '</span>';
    html += '</span>';
    return html;
  }

  // S26: canonical display label for a SET aisle value (the second-line tag),
  // mirroring the <select>'s normalized-key option matching so the tag shows the
  // same canonical casing as the select and the By-Aisle group header, falling
  // back to the raw stored string for a non-canonical value never re-picked
  // (same R15 posture the select itself uses).
  function aisleDisplayLabel(rawAisle) {
    return getAisleDisplayMap()[normalize(rawAisle)] || rawAisle;
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
        // S29 iOS aisle-picker RE-OPEN fix (2026-09-14, round 4 - CONFIRMED
        // broader than the sentinel path rounds 1-3 chased). NEVER
        // programmatically re-focus the per-item aisle <select> after a rebuild.
        // Mechanism: the <select>'s own `change` commit calls saveAisle() ->
        // render(), which reaches here with the just-interacted <select> as
        // document.activeElement (a native <select> fires `change` while still
        // focused). The pre-S29 code recorded focusedRole 'aisle-select' and
        // called .focus() on the freshly-rebuilt <select> - and on iOS Safari
        // focusing a native <select> at that instant RE-OPENS its picker ("pops
        // up again"). This fires for ANY selection (existing aisle, no-aisle,
        // OR a just-created new aisle), which is exactly the device-confirmed
        // defect; it is NOT sentinel-specific. The chosen value is already
        // committed AND rendered by the time we get here, so there is no
        // in-progress interaction to preserve - deliberately leave focus where
        // the rebuild left it (the old focused node was just detached, so
        // activeElement falls to <body>), which keeps the picker CLOSED. Desktop
        // is unaffected: a <select> does not re-open on programmatic focus there
        // (NB-6), which is why this was iOS-only and invisible in automation
        // except as this activeElement proxy. Scope is exactly this one role;
        // every OTHER previously-focused control (note/name/new-aisle inputs,
        // Up/Down, delete, or the <li> itself) still restores focus as before,
        // so the mid-edit draft-survival / focus-preservation guarantees for
        // S1/S2/S5/S7/S15/S24 are untouched. NB: this removes the programmatic-
        // refocus re-open; S28's change-handler re-entry guard is retained for
        // the DISTINCT real-touch "ghost tap" that fires a genuine second
        // `change` (a synthetic event this focus fix cannot influence).
        if (focusedRole === 'aisle-select') {
          // intentionally no focus restore for this role - see the note above
        } else {
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

  // S3/S12 delete-moment toast. The toast advertises "Undo" IN ITS OWN TEXT, so
  // that word must be a REAL, working control - a plain-text toast that merely
  // SAID "Undo" but did nothing on tap was the exact on-device defect the PO hit
  // (delete, tap the toast's "Undo", nothing comes back). This is a SECOND, in-
  // context entry point to the SAME single-slot performUndo() the header
  // #undo-btn drives - NOT a new undo rule or a second buffer. `message` is the
  // descriptive half only (no " — Undo"); showToast appends the em-dash separator
  // and the real Undo <button>, so the toast's textContent is still exactly
  // "<message> — Undo" (unchanged for existing text assertions). The message is
  // escaped explicitly - it can carry an arbitrary item name, and unlike the old
  // textContent assignment, innerHTML does not escape for us.
  function showToast(message, withUndo) {
    if (toastTimer) clearTimeout(toastTimer);
    if (withUndo === false) {
      // S31 feedback-only toast (the n=0 / m>=1 "nothing matched" run): NO live
      // Undo affordance, and toastAction stays null so a stray tap can never
      // undo an unrelated prior action (the single S6 slot is left untouched).
      // Every other caller omits the arg -> the armed branch below, unchanged.
      toastAction = null;
      toastEl.innerHTML = '<span class="toast-msg">' + escapeHtml(message) + '</span>';
    } else {
      toastAction = lastAction; // bind the toast's Undo to the current action
      toastEl.innerHTML =
        '<span class="toast-msg">' + escapeHtml(message) + ' — </span>' +
        '<button type="button" class="toast-undo" data-role="toast-undo">Undo</button>';
    }
    toastEl.hidden = false;
    toastTimer = setTimeout(function () {
      hideToast();
    }, 4000);
  }

  function hideToast() {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    toastEl.hidden = true;
    toastEl.innerHTML = '';
    toastAction = null;
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
      // S27 iOS commit-on-blur fix (2026-09-11). On iOS Safari, tapping the
      // keyboard's "Go"/return BLURS the reveal input instead of (or before)
      // firing a catchable Enter keydown on the input, so the synchronous
      // Enter->commitNewAisle() path (see the keydown handler) never runs; this
      // deferred flush is all that fires. Pre-S27 that flush ALWAYS routed a
      // new-aisle draft through commitEditor()'s REVERT branch, so the name the
      // PO had just typed was silently discarded ("the text disappears instead
      // of populating the aisle"). Fix: decide the new-aisle flush on the LIVE
      // input value read straight off the DOM element (never a possibly-stale
      // `draft` a render could have cleared), in three cases:
      //
      //   1. NON-EMPTY and VALID  -> COMMIT via commitNewAisle() (create+assign+
      //      persist), regardless of the grace window. THIS is the iOS fix: Go/
      //      blur now saves a valid typed name. commitNewAisle() nulls
      //      editingField, so there is no re-render/refocus loop, and it is the
      //      single create+assign path (no logic duplicated here).
      //   2. within the open-transition grace window (typically still empty)
      //      -> SKIP (S26's first fix: protect the just-opened field while iOS's
      //      async focus/scroll settles and activeElement is transiently <body>).
      //   3. otherwise (empty past the window, or a non-empty-but-INVALID name
      //      past the window) -> fall through to commitEditor()'s REVERT branch:
      //      genuine abandon (S24). An invalid name can never be created anyway,
      //      and reverting it on blur is exactly the pre-S27 baseline behavior -
      //      the inline "stay open with the error message" affordance remains on
      //      the EXPLICIT Enter/commit path (commitNewAisle in the keydown
      //      handler), so nothing regresses and no invalid-name flush loops.
      //
      // Desktop is unchanged: Enter commits synchronously (editingField is null
      // by the time this fires -> the `editingField !== pending` guard returns);
      // a desktop blur-with-a-typed-name now also commits (an improvement). The
      // aisle-<select> path (role 'aisle-select', pending.field !== 'new-aisle')
      // is untouched - it still flushes a pending note/name via commitEditor()
      // below (R14), with its activeElement picker-open guard intact above.
      if (pending.field === 'new-aisle') {
        var liveInput = listRoot.querySelector('li[data-id="' + pending.id + '"] [data-role="new-aisle-input"]');
        var liveVal = liveInput ? liveInput.value : pending.draft;
        var trimmedLive = liveVal == null ? '' : String(liveVal).trim();
        if (trimmedLive && !validateAisleName(trimmedLive, null, false)) {
          pending.draft = liveVal; // commit the freshest live value, not a stale draft
          commitNewAisle();
          return;
        }
        if ((Date.now() - newAisleOpenedAt) < NEW_AISLE_OPEN_GRACE_MS) return;
      }
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
    // S32: structural detection of the Auto-detect trigger (data-autodetect),
    // never by label/value string (N12) - same posture as the sentinel above.
    var isAutodetect = !!(selOpt && selOpt.dataset && selOpt.dataset.autodetect === '1');
    var chosen = target.value;
    // Commit any OPEN text editor first (mirrors openEditor's commit-first
    // guard) so an in-progress note/name draft on another row is not lost; the
    // sentinel-reveal path (S24) is covered by this same flush (QA requirement).
    if (editingField) commitEditor();
    if (isSentinel) {
      // S28 iOS re-entry guard: a sentinel change on the SAME row within the
      // post-commit window is the keyboard-dismiss ghost tap re-selecting the
      // sentinel adjacent to the aisle we just created - snap the <select> back
      // to the committed aisle and DON'T re-open the reveal (which would leave
      // "the menu" open after the aisle is already populated). Long after the
      // window, or on any other row, this is a genuine re-open and runs normally.
      // RETAINED alongside S29 (the renderList focus-restore fix): S29 stops the
      // PROGRAMMATIC re-focus of this <select> from re-opening the picker on any
      // commit; this guard is a separate defense for a genuine second `change`
      // event dispatched by a real re-fired touch, which no focus change can
      // prevent - so the two are complementary, not redundant.
      if (id === newAisleCommittedId && (Date.now() - newAisleCommittedAt) < NEW_AISLE_REENTRY_GUARD_MS) {
        render();
        return;
      }
      openNewAisleEditor(id); // S24: "+ Add new aisle…" reveal
    } else if (isAutodetect) {
      // S32: run the matcher for THIS one item. An ACTUAL match (tiers 1-4, a
      // non-empty aisle) is written through the SAME saveAisle -> render() path
      // with { viaAuto: true } - MAY overwrite an existing aisle (explicit
      // per-item request) but records NO learning override (an auto-guess is not
      // a hand pick). A tier-5 NO-MATCH writes NOTHING: it must NOT clear an
      // existing aisle it couldn't improve, so render() alone resets the
      // transient Auto-detect selection back to the current aisle. No new
      // render/commit seam; id + name captured, no DOM ref carried across the
      // render (C1/R13). The round-4 focus-restore skip and the R14 deferred-
      // focusout guard both key on data-role="aisle-select", so they apply
      // unchanged. Non-undoable (per PO Q1 / N17).
      var aIdx = findIndexById(id);
      if (aIdx !== -1) {
        var res = matchAisle(state.items[aIdx].name);
        if (res && res.aisle) {
          saveAisle(id, res.aisle, { viaAuto: true }); // tiers 1-4: assign, no learning
        } else {
          render(); // tier-5 no match: LEAVE the current aisle; just reset the picker
        }
      } else {
        render(); // row gone mid-interaction - just reset the picker display
      }
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

  // The toast's own in-context Undo control (S3/S12). Fires the SAME single-slot
  // performUndo() as the header button - it is the affordance the toast text has
  // always advertised, now actually wired up. Guarded to the action the toast was
  // shown for: if a newer mutating action has since clobbered the single-slot
  // buffer, this no-ops (the toast label would be stale) instead of undoing the
  // wrong thing; either way the toast is dismissed. performUndo() itself also
  // calls hideToast().
  toastEl.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-role="toast-undo"]');
    if (!btn) return;
    if (lastAction && lastAction === toastAction) {
      performUndo();
    } else {
      hideToast();
    }
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

  // S31: the list-wide Auto-aisle run - an isolated click listener in
  // .sort-controls (no per-row / R14 surface). See runAutoAisle().
  autoAisleBtn.addEventListener('click', function () {
    runAutoAisle();
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
      if (settingsEdit !== pending || !settingsEdit) return; // already committed/handled in between
      // D1: skip the revert while focus is STILL on the in-editor rename input.
      // On an explicit INVALID rename commit, commitSettingsRename sets
      // settingsEdit.error and re-renders to show the inline message, which
      // momentarily blurs+refocuses this input; that transient blur must NOT
      // fire the stay-open editor away (same seam, and same guard, as the row
      // editor's focusout handler for the new-aisle reveal input). A genuine
      // blur-to-elsewhere lands focus outside this control and still reverts (M22).
      var ae = document.activeElement;
      if (ae && ae.dataset && settingsOverlay.contains(ae) && ae.dataset.role === 'aisle-rename-input') return;
      settingsEdit = null;
      renderSettings();
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
