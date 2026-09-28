// iCloud Hide My Email Bulk Deactivator — Content Script (engine v2)
// Modes: deactivate | delete | rename. Frame-aware, verified steps, auto-stop.
(() => {
'use strict';

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const locales = {
  en: {
    system_loaded: 'Saved settings loaded. Ready.',
    mod_loaded: 'Module: {mod}',
    mod_deactivate: 'Deactivate', mod_delete: 'Delete', mod_rename: 'Rename',
    log_reset: 'Selectors cleared for this module.',
    log_cancel: 'Training cancelled.',
    log_start: 'Training started. Follow the overlay instructions.',
    email_selected: 'Email element selected: ',
    action_selected: 'Action button selected: ',
    confirm_selected: 'Confirm button selected: ',
    label_input_selected: 'Label input selected: ',
    save_selected: 'Save button selected: ',
    training_saved: 'Training completed and selectors saved!',
    training_conflict: 'Training is running in another frame — this frame stopped listening.',
    bot_conflict: 'Bot stopped here: another frame is running it.',
    processing: 'Processing {email}…',
    err_action_missing: 'Action button not found for {email} — item skipped (wrong section or UI change).',
    err_confirm_missing: 'Confirm button not found for {email}.',
    err_verify: 'Could not verify result for {email} after retry — marked failed.',
    retry_note: 'Verification failed for {email}, retrying…',
    success_deactivate: '✓ Deactivated: {email}',
    success_delete: '✓ Deleted: {email}',
    skip_flagged: '⛔ Skipped (blacklist): {email}',
    skip_protected: '⛔ Skipped (protected): {email}',
    scrolling: 'No candidate visible — scrolling to load more…',
    exhausted: 'End of list reached. Nothing left to process.',
    bot_started: 'Bot started ({mod}) · limit {limit} · delay {delay}ms',
    pause_requested: 'Pause requested — finishing current step…',
    bot_paused: 'Bot paused.',
    bot_resumed: 'Bot resumed.',
    bot_stopped: 'Bot stopped.',
    goal_reached: 'Goal reached: {n} processed.',
    summary: 'Summary — ✓ {processed} processed · ⛔ {flagged} blacklist · 🛡 {protected} protected · ✗ {failed} failed · ? {notFound} not found · ⊘ {mismatch} mismatched',
    rename_started: 'Rename started · {n} targets · label "{label}"',
    rename_done: '✓ Renamed: {email} → "{label}"',
    rename_already: '⚠ Already labeled "{label}": {email}',
    rename_not_found: '✗ Not found in list: {email}',
    rename_failed: '✗ Rename failed: {email}',
    protect_added: '🛡 Added to protection list: {n} address(es)',
    not_trained: 'Cannot start: complete training for this module first.',
    err_selector_empty: 'List items not found at all — the trained selector may no longer match. Retrain this module.',
    mode_rename_pick: 'Choose Deactivate or Delete in the Run tab before starting the bot.',
    err_wrong_frame: 'Wrong frame: HME content not detected here. Reopen the extension on the Hide My Email page.',
    relinked: 'Selector repaired automatically: {sel}',
    untrained_rename_hint: 'Rename training: 1) email item, 2) label input, 3) Save button.',
    overlay_title: 'HME Bot',
    overlay_training: 'Training',
    overlay_pausing: 'Pausing…',
    overlay_paused: 'Paused',
    overlay_cancel: 'Cancel training',
    overlay_pause: 'Pause', overlay_resume: 'Resume', overlay_stop: 'Stop',
    overlay_idle: 'Idle',
    overlay_trained: 'Trained — start from the popup.',
    overlay_untrained: 'Not trained for this module.',
    overlay_current: 'Current: {email}',
    inst_deactivate: [
      '',
      '1/3 — Click any ACTIVE email in the list.',
      '2/3 — Click "Deactivate email address" in the details panel.',
      '3/3 — Click the red confirm button in the dialog.'
    ],
    inst_delete: [
      '',
      '1/3 — Click any INACTIVE email in the list.',
      '2/3 — Click "Delete address" in the details panel.',
      '3/3 — Click the red confirm button in the dialog.'
    ],
    inst_rename: [
      '',
      '1/3 — Click any email in the list.',
      '2/3 — Click the Label input field in the details panel.',
      '3/3 — Click the "Save changes" button.'
    ]
  },
  tr: {
    system_loaded: 'Kayıtlı ayarlar yüklendi. Hazır.',
    mod_loaded: 'Modül: {mod}',
    mod_deactivate: 'Devre Dışı Bırak', mod_delete: 'Kalıcı Sil', mod_rename: 'Yeniden Adlandır',
    log_reset: 'Bu modülün seçicileri sıfırlandı.',
    log_cancel: 'Eğitim iptal edildi.',
    log_start: 'Eğitim başladı. Paneldeki adımları izleyin.',
    email_selected: 'E-posta öğesi seçildi: ',
    action_selected: 'İşlem butonu seçildi: ',
    confirm_selected: 'Onay butonu seçildi: ',
    label_input_selected: 'Etiket alanı seçildi: ',
    save_selected: 'Kaydet butonu seçildi: ',
    training_saved: 'Eğitim tamamlandı, seçiciler kaydedildi!',
    training_conflict: 'Eğitim başka bir çerçevede sürüyor — bu çerçeve dinlemeyi bıraktı.',
    bot_conflict: 'Bot burada durduruldu: başka bir çerçevede çalışıyor.',
    processing: 'İşleniyor: {email}…',
    err_action_missing: '{email} için işlem butonu bulunamadı — öğe atlandı (yanlış bölüm veya arayüz değişti).',
    err_confirm_missing: '{email} için onay butonu bulunamadı.',
    err_verify: '{email} için sonuç doğrulanamadı (retry sonrası) — başarısız işaretlendi.',
    retry_note: '{email} doğrulanamadı, yeniden deneniyor…',
    success_deactivate: '✓ Devre dışı bırakıldı: {email}',
    success_delete: '✓ Kalıcı silindi: {email}',
    skip_flagged: '⛔ Atlandı (kara liste): {email}',
    skip_protected: '⛔ Atlandı (korunuyor): {email}',
    scrolling: 'Görünürde aday yok — daha fazla yüklemek için kaydırılıyor…',
    exhausted: 'Liste sonuna gelindi. İşlenecek öğe kalmadı.',
    bot_started: 'Bot başlatıldı ({mod}) · limit {limit} · gecikme {delay}ms',
    pause_requested: 'Duraklatma istendi — mevcut adım bitiriliyor…',
    bot_paused: 'Bot duraklatıldı.',
    bot_resumed: 'Bot devam ediyor.',
    bot_stopped: 'Bot durduruldu.',
    goal_reached: 'Hedefe ulaşıldı: {n} işlendi.',
    summary: 'Özet — ✓ {processed} işlenen · ⛔ {flagged} kara liste · 🛡 {protected} korunan · ✗ {failed} başarısız · ? {notFound} bulunamadı · ⊘ {mismatch} uyumsuz',
    rename_started: 'Yeniden adlandırma başladı · {n} hedef · etiket "{label}"',
    rename_done: '✓ Yeniden adlandırıldı: {email} → "{label}"',
    rename_already: '⚠ Zaten "{label}" etiketli: {email}',
    rename_not_found: '✗ Listede bulunamadı: {email}',
    rename_failed: '✗ Yeniden adlandırma başarısız: {email}',
    protect_added: '🛡 Koruma listesine eklendi: {n} adres',
    not_trained: 'Başlatılamıyor: önce bu modülün eğitimini tamamlayın.',
    err_selector_empty: 'Hiç liste öğesi bulunamadı — eğitilmiş seçici artık eşleşmiyor olabilir. Bu modülü yeniden eğitin.',
    mode_rename_pick: 'Botu başlatmadan önce Çalıştır sekmesinden Devre Dışı Bırak veya Sil modülünü seçin.',
    err_wrong_frame: 'Yanlış çerçeve: burada HME içeriği bulunamadı. Eklentiyi E-postamı Gizle sayfasında yeniden açın.',
    relinked: 'Seçici otomatik onarıldı: {sel}',
    untrained_rename_hint: 'Yeniden adlandırma eğitimi: 1) e-posta öğesi, 2) etiket alanı, 3) Kaydet butonu.',
    overlay_title: 'HME Bot',
    overlay_training: 'Eğitim',
    overlay_pausing: 'Duraklatılıyor…',
    overlay_paused: 'Duraklatıldı',
    overlay_cancel: 'Eğitimi iptal et',
    overlay_pause: 'Duraklat', overlay_resume: 'Devam', overlay_stop: 'Durdur',
    overlay_idle: 'Boşta',
    overlay_trained: 'Eğitildi — popup\'tan başlatın.',
    overlay_untrained: 'Bu modül için eğitilmedi.',
    overlay_current: 'Şu an: {email}',
    inst_deactivate: [
      '',
      '1/3 — Listeden AKTİF bir e-postaya tıklayın.',
      '2/3 — Detay panelinde "E-posta adresini devre dışı bırak"a tıklayın.',
      '3/3 — Açılan penceredeki kırmızı onay butonuna tıklayın.'
    ],
    inst_delete: [
      '',
      '1/3 — Listeden PASİF bir e-postaya tıklayın.',
      '2/3 — Detay panelinde "Adresi sil"e tıklayın.',
      '3/3 — Açılan penceredeki kırmızı onay butonuna tıklayın.'
    ],
    inst_rename: [
      '',
      '1/3 — Listeden herhangi bir e-postaya tıklayın.',
      '2/3 — Detay panelindeki Etiket (Label) giriş alanına tıklayın.',
      '3/3 — "Değişiklikleri kaydet" butonuna tıklayın.'
    ]
  }
};

// ---------------------------------------------------------------------------
// Constants & state
// ---------------------------------------------------------------------------
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const HME_MARKER_RE = /(hide my email|e-?postam[ıi] gizle|active email address|inactive email address|aktif e-posta|pasif e-posta)/i;
const TRAINING_STEPS = {
  deactivate: ['email', 'deactivate', 'confirm'],
  delete: ['email', 'deactivate', 'confirm'],
  rename: ['email', 'labelInput', 'save']
};
const EXHAUSTED = Symbol('exhausted');
const frameKey = Math.random().toString(36).slice(2) + Date.now().toString(36);

let state = {
  lang: 'en',
  mode: 'deactivate',
  selectors: { email: null, deactivate: null, confirm: null, labelInput: null, save: null },
  cachedSelectors: {
    deactivate: { email: null, deactivate: null, confirm: null },
    delete: { email: null, deactivate: null, confirm: null },
    rename: { email: null, labelInput: null, save: null }
  },
  trainingStep: 0,
  botState: 'idle',            // idle | running | pausing | paused
  isTargetFrame: null,
  limit: 50,
  delay: 1500,
  jitter: false,
  progress: 0,
  stats: { processed: 0, skippedFlagged: 0, skippedProtected: 0, failed: 0, notFound: 0, mismatch: 0 },
  logs: [],
  flaggedWords: [],
  protectedEmails: new Set(),
  protectedLabel: '',
  autoProtect: true,
  renameTargets: [],
  renameLabel: '',
  renameResults: {},
  lastSummary: null,
  currentItem: '',
  skipSet: new Set(),          // emails not to click again this run
  skipCounted: new Set(),      // emails already counted in skip stats
  mismatchSels: new Set(),     // learned wrong-section container selectors (this run)
  matchSels: new Set(),        // learned correct-section container selectors (this run)
  overlayPos: null,
  overlayMin: false
};

let overlayEl = null;
let botTimeoutId = null;
let sleepResolver = null;
let loopActive = false;
let runFinished = true;
let startPending = false;     // start requested while the previous loop unwinds
let renameSearchExhausted = false;

const t = (key, vars) => {
  let s = (locales[state.lang] && locales[state.lang][key]) || locales.en[key] || key;
  if (vars) for (const k of Object.keys(vars)) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
};
const sleep = ms => new Promise(r => {
  sleepResolver = r;
  botTimeoutId = setTimeout(() => { sleepResolver = null; r(); }, ms);
});
const jitteredDelay = () => {
  const d = state.jitter ? Math.round(state.delay * (0.7 + Math.random() * 0.6)) : state.delay;
  return Math.max(300, d);
};
const running = () => state.botState === 'running';
const active = () => state.botState === 'running' || state.botState === 'pausing';
const normalizeEmail = e => (e || '').trim().toLowerCase();

// ---------------------------------------------------------------------------
// Storage: load + live sync
// ---------------------------------------------------------------------------
function loadFromStorage(result) {
  if (result.hmeLang) state.lang = result.hmeLang;
  if (result.hmeLastMode) state.mode = result.hmeLastMode;
  if (result.hmeSelectors_deactivate) state.cachedSelectors.deactivate = result.hmeSelectors_deactivate;
  if (result.hmeSelectors_delete) state.cachedSelectors.delete = result.hmeSelectors_delete;
  if (result.hmeSelectors_rename) state.cachedSelectors.rename = result.hmeSelectors_rename;
  if (result.hmeFlaggedWords !== undefined) state.flaggedWords = parseFlagged(result.hmeFlaggedWords);
  if (Array.isArray(result.hmeProtectedEmails)) state.protectedEmails = new Set(result.hmeProtectedEmails.map(normalizeEmail));
  if (result.hmeProtectedLabel !== undefined) state.protectedLabel = result.hmeProtectedLabel || '';
  if (result.hmeAutoProtect !== undefined) state.autoProtect = !!result.hmeAutoProtect;
  if (result.hmeDelay) state.delay = parseInt(result.hmeDelay) || state.delay;
  if (result.hmeLimit) state.limit = parseInt(result.hmeLimit) || state.limit;
  if (result.hmeJitter !== undefined) state.jitter = !!result.hmeJitter;
  if (result.hmeRenameLabel) state.renameLabel = result.hmeRenameLabel;
  if (result.hmeLastSummary) state.lastSummary = result.hmeLastSummary;
  if (result.hmeOverlayPos) state.overlayPos = result.hmeOverlayPos;
  if (result.hmeOverlayMin !== undefined) state.overlayMin = !!result.hmeOverlayMin;
  state.selectors = { ...state.selectors, ...(state.cachedSelectors[state.mode] || {}) };
}
function parseFlagged(raw) {
  return String(raw || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

chrome.storage.local.get(null, result => {
  loadFromStorage(result);
  addLog('system', t('system_loaded') + ' ' + t('mod_loaded', { mod: t('mod_' + state.mode) }));
  frameReport();
});

// Live sync + cross-frame claims
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const patch = {};
  for (const k of Object.keys(changes)) patch[k] = changes[k].newValue;
  // training claim: another frame took over → abort here
  if ('hmeTrainingClaim' in patch) {
    const claim = patch.hmeTrainingClaim;
    if (claim && claim.key !== frameKey && state.trainingStep > 0) abortTraining(t('training_conflict'));
  }
  // bot claim: another frame owns the run → stop here
  if ('hmeBotClaim' in patch) {
    const claim = patch.hmeBotClaim;
    if (claim && claim.key !== frameKey && state.botState !== 'idle') {
      addLog('warning', t('bot_conflict'));
      haltLocal();
    }
  }
  // Protection must be updatable WHILE a delete run is in progress, otherwise
  // the bot keeps deleting an address the user just protected. No write loop:
  // this branch only reads, and addProtectedEmails writes only new entries.
  if ('hmeProtectedEmails' in patch) {
    state.protectedEmails = new Set((patch.hmeProtectedEmails || []).map(normalizeEmail));
  }
  if ('hmeProtectedLabel' in patch) state.protectedLabel = patch.hmeProtectedLabel || '';
  if ('hmeAutoProtect' in patch) state.autoProtect = !!patch.hmeAutoProtect;
  if ('hmeLang' in patch && patch.hmeLang) { state.lang = patch.hmeLang; updateOverlay(); }
  for (const m of ['deactivate', 'delete', 'rename']) {
    const key = 'hmeSelectors_' + m;
    if (key in patch) {
      state.cachedSelectors[m] = patch[key] || { email: null };
      if (state.mode === m) state.selectors = { ...state.selectors, ...(patch[key] || {}) };
    }
  }
  // keep popup in sync when selectors/protection change (training, other frames, tests)
  if (['hmeProtectedEmails', 'hmeProtectedLabel', 'hmeAutoProtect',
       'hmeSelectors_deactivate', 'hmeSelectors_delete', 'hmeSelectors_rename'].some(k => k in patch)) {
    broadcastState();
  }
});

// ---------------------------------------------------------------------------
// Frame handshake / capability
// ---------------------------------------------------------------------------
let markerCache = { ts: 0, val: false };
function hasHmeMarker() {
  const now = Date.now();
  if (now - markerCache.ts < 4000) return markerCache.val;
  let val = false;
  try {
    const text = ((document.title || '') + ' ' + (document.body ? document.body.innerText.slice(0, 20000) : ''));
    val = HME_MARKER_RE.test(text);
  } catch (e) {}
  markerCache = { ts: now, val };
  return val;
}
function countTrainedMatches() {
  let max = 0;
  for (const m of ['deactivate', 'delete', 'rename']) {
    const sel = state.cachedSelectors[m] && state.cachedSelectors[m].email && state.cachedSelectors[m].email.selector;
    if (!sel) continue;
    try { max = Math.max(max, document.querySelectorAll(sel).length); } catch (e) {}
  }
  return max;
}
function frameCapability() {
  return { isTop: window === window.top, hasHme: hasHmeMarker(), matchCount: countTrainedMatches() };
}
function isCapableFrame() {
  const cap = frameCapability();
  return cap.hasHme || cap.matchCount > 0;
}
function frameReport() {
  try {
    const p = chrome.runtime.sendMessage({ action: 'FRAME_HELLO', ...frameCapability() });
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------
function addLog(type, text) {
  const entry = { type, text: `[${new Date().toLocaleTimeString()}] ${text}` };
  state.logs.push(entry);
  if (state.logs.length > 300) state.logs.splice(0, state.logs.length - 300);
  try {
    const p = chrome.runtime.sendMessage({ action: 'LOG_UPDATE', entry });
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
  updateOverlay();
}
function broadcastState() {
  try {
    const p = chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state: publicState() });
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function publicState() {
  return {
    lang: state.lang, mode: state.mode, selectors: state.selectors,
    trained: {
      deactivate: isTrained('deactivate'), delete: isTrained('delete'), rename: isTrained('rename')
    },
    trainingStep: state.trainingStep, botState: state.botState, isTargetFrame: state.isTargetFrame,
    limit: state.limit, delay: state.delay, jitter: state.jitter,
    progress: state.progress, stats: { ...state.stats }, currentItem: state.currentItem,
    logs: state.logs.slice(-200),
    flaggedWords: state.flaggedWords.slice(),
    protectedEmails: [...state.protectedEmails], protectedLabel: state.protectedLabel, autoProtect: state.autoProtect,
    renameTargets: state.renameTargets.slice(), renameLabel: state.renameLabel, renameResults: { ...state.renameResults },
    lastSummary: state.lastSummary,
    frame: frameCapability()
  };
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------
function waitFor(predicate, { timeout = 8000, interval = 150, root = document } = {}) {
  return new Promise(resolve => {
    const t0 = performance.now();
    let done = false, obs = null, timer = null;
    const finish = v => {
      if (done) return; done = true;
      try { obs && obs.disconnect(); } catch (e) {}
      clearInterval(timer); resolve(v);
    };
    const check = () => {
      let v = null;
      try { v = predicate(); } catch (e) {}
      if (v) finish(v);
      else if (performance.now() - t0 >= timeout) finish(null);
    };
    check();
    if (done) return;
    try {
      obs = new MutationObserver(check);
      obs.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    } catch (e) {}
    timer = setInterval(check, interval);
  });
}

function isVisible(el) {
  if (!el || !el.getBoundingClientRect) return false;
  const st = getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function textOf(el) { return ((el.textContent || '') + ' ' + (el.getAttribute && (el.getAttribute('aria-label') || '') || '') + ' ' + (el.value || '')).trim(); }

function findElement(config, opts) {
  if (!config) return null;
  const { requireEnabled = true } = opts || {};
  const ok = el => {
    if (!el || !isVisible(el)) return false;
    if (requireEnabled && el.disabled) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    return true;
  };
  // 1. CSS selector — prefer visible + enabled
  if (config.selector) {
    try {
      const all = [...document.querySelectorAll(config.selector)];
      const good = all.find(ok);
      if (good) return good;
      const vis = all.find(isVisible);
      if (vis) return requireEnabled && vis.disabled ? null : vis;
    } catch (e) {}
  }
  // 2. attribute-based (inputs & buttons) — skip generic type/role, they match
  //    every button on the page and would hit the wrong control
  if (config.attrs) {
    for (const [attr, val] of Object.entries(config.attrs)) {
      if (!val || attr === 'type' || attr === 'role') continue;
      try {
        const el = [...document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`)].find(ok);
        if (el) return el;
      } catch (e) {}
    }
  }
  // 3. text scan — Apple renders the label in nested spans, so match on the
  //    button's own normalized text; also accept a distinctive substring in
  //    either direction (trained "E-posta adresini sil" vs UI "Sil")
  const want = normalizeLabel(config.text || '');
  if (want) {
    const cands = [];
    for (const el of document.querySelectorAll('button, [role="button"], a, input[type="submit"], input[type="button"]')) {
      if (!ok(el)) continue;
      const label = normalizeLabel(textOf(el));
      if (!label) continue;
      const exact = label === want;
      const contains = label.includes(want) || want.includes(label);
      if (exact || contains) cands.push({ el, exact, len: label.length, text: label });
    }
    if (cands.length) {
      cands.sort((a, b) => (b.exact - a.exact) || (a.len - b.len));
      return cands[0].el;
    }
  }
  return null;
}

// Collapse whitespace, drop punctuation: makes "E-posta Adresini  Sil! " and
// "eposta adresini sil" comparable, and lets short UI labels match long ones.
function normalizeLabel(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function extractEmail(el) {
  // Scan text NODES individually: concatenated textContent glues label+email
  // ("Appsactive06@icloud.com") and the regex local-part would swallow the label.
  try {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const m = (n.nodeValue || '').match(EMAIL_RE);
      if (m) return m[0].toLowerCase();
    }
  } catch (e) {}
  // attribute fallbacks (some UIs expose the address on the item)
  if (el.getAttribute) {
    for (const a of ['data-email', 'title', 'aria-label']) {
      const v = el.getAttribute(a);
      if (v) { const m = v.match(EMAIL_RE); if (m) return m[0].toLowerCase(); }
    }
  }
  const m = (el.textContent || '').match(EMAIL_RE);
  return m ? m[0].toLowerCase() : '';
}

// Escape is GLOBAL on a real site: pressing it can close the whole HME app
// (the user's report: panel opens, everything collapses back to the main
// screen). So we never fire a synthetic document-wide Escape during a run.
// We only click a visible, real dismiss control (modal cancel / close button)
// that belongs to the container we opened, and only as a last resort.
function findDismissControl(containers) {
  const LABEL = /cancel|close|dismiss|kapat|iptal|vazgeç|geri|back|not now|daha sonra|skip/i;
  const cands = [];
  for (const c of containers) {
    if (!c || !c.querySelectorAll) continue;
    for (const el of c.querySelectorAll('button, [role="button"], a')) {
      if (!isVisible(el)) continue;
      const label = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).trim();
      const cls = (typeof el.className === 'string' ? el.className : '');
      if (LABEL.test(label) || /close|cancel|dismiss/i.test(cls)) cands.push(el);
    }
  }
  // prefer the smallest/most specific control (a modal's own button, not a page-level one)
  cands.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
  return cands[0] || null;
}

// Containers whose own Cancel/Close control we may click to undo an action.
const DISMISS_SCOPES = [
  '[role="dialog"]', '[role="alertdialog"]', 'dialog[open]',
  '[class*="modal" i]', '[class*="dialog" i]', '[class*="sheet" i]', '[class*="overlay" i]'
];
// Safe cleanup: dismiss only what we opened. Never a global Escape.
function dismissUi(scopeSelectors) {
  const containers = [];
  for (const sel of scopeSelectors) {
    const el = document.querySelector(sel);
    if (el) containers.push(el);
  }
  containers.push(document.body);
  const btn = findDismissControl(containers);
  if (btn) { try { btn.click(); return true; } catch (e) {} }
  return false;
}

function setInputValue(input, value) {
  input.focus();
  if (input.isContentEditable) {
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, value);
    } catch (e) { input.textContent = value; }
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }));
    return;
  }
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value') && Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
  if (setter) setter.call(input, value); else input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function snapshotItem(el) {
  const sig = [];
  let c = el;
  for (let i = 0; i < 5 && c && c !== document.body; i++) {
    const cls = (typeof c.className === 'string' && c.className) ? '.' + c.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    sig.push(c.tagName + (c.id ? '#' + c.id : '') + cls);
    c = c.parentElement;
  }
  return { html: (el.outerHTML || '').slice(0, 2000), sig: sig.join('>') };
}

function queryEmailItems() {
  const sel = state.selectors.email && state.selectors.email.selector;
  if (!sel) return [];
  try { return [...document.querySelectorAll(sel)]; } catch (e) { return []; }
}

function findScrollContainer(items) {
  const sel = state.selectors.email && state.selectors.email.selector;
  const probe = (items && items[items.length - 1]) ||
    (sel ? document.querySelector(sel) : null) || document.body;
  // Pass 1: programmatically scrollable ancestors (auto/scroll/hidden/overlay)
  let c = probe ? probe.parentElement : null;
  while (c && c !== document.body) {
    if (c.scrollHeight > c.clientHeight + 30) {
      const ov = getComputedStyle(c).overflowY;
      if (ov === 'auto' || ov === 'scroll' || ov === 'hidden' || ov === 'overlay') return c;
    }
    c = c.parentElement;
  }
  // Pass 2: any scrollable ancestor (custom wheel/scrollbar implementations)
  c = probe ? probe.parentElement : null;
  while (c && c !== document.body) {
    if (c.scrollHeight > c.clientHeight + 30) return c;
    c = c.parentElement;
  }
  const guess = document.querySelector('[id*="list"][style*="overflow"], [class*="scroll"], [id*="scroll"]');
  if (guess && guess.scrollHeight > guess.clientHeight + 30) return guess;
  return null; // window scroll
}

// Apple shows a spinner/skeleton while fetching the next batch; never count
// that as "no more items".
function isLoadingVisible(sc) {
  try {
    if (document.querySelector('[aria-busy="true"]')) return true;
    const sel = '[class*="loading" i],[class*="spinner" i],[class*="skeleton" i],[role="progressbar"],[data-loading],[data-testid*="loading" i]';
    const scope = sc || document.body;
    for (const el of scope.querySelectorAll(sel)) {
      if (isVisible(el)) return true;
    }
  } catch (e) {}
  return false;
}

function scrollDown(sc) {
  try {
    if (sc) {
      const before = sc.scrollTop;
      sc.scrollTop += Math.max(200, sc.clientHeight * 0.85);
      if (sc.scrollTop === before && before > 0) {
        // pinned at bottom: jiggle so scroll events fire for lazy-loaders
        sc.scrollTop = before - 40;
        sc.dispatchEvent(new Event('scroll', { bubbles: true }));
        sc.scrollTop = before;
      }
      sc.dispatchEvent(new Event('scroll', { bubbles: true }));
    } else {
      window.scrollBy(0, 400);
      window.dispatchEvent(new Event('scroll'));
    }
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// Selector capture (training)
// ---------------------------------------------------------------------------
function getElementInfo(element) {
  if (!element) return null;
  let selector = '';
  if (element.id) selector = '#' + CSS.escape(element.id);
  if (!selector) {
    for (const attr of ['data-testid', 'aria-label', 'name', 'placeholder']) {
      if (element.hasAttribute && element.hasAttribute(attr)) {
        selector = `${element.tagName.toLowerCase()}[${attr}="${CSS.escape(element.getAttribute(attr))}"]`;
        break;
      }
    }
  }
  if (!selector) {
    const path = [];
    let current = element;
    while (current && current !== document.body && current.parentElement) {
      const tag = current.tagName.toLowerCase();
      let nth = 1, sib = current;
      while ((sib = sib.previousElementSibling)) if (sib.tagName === current.tagName) nth++;
      let classStr = '';
      if (current.classList && current.classList.length) {
        const clean = [...current.classList].filter(c => !/\d/.test(c) && c.length > 2).slice(0, 2);
        if (clean.length) classStr = '.' + clean.join('.');
      }
      path.unshift(`${tag}${classStr}:nth-of-type(${nth})`);
      current = current.parentElement;
    }
    selector = path.join(' > ');
  }
  const attrs = {};
  for (const attr of ['placeholder', 'aria-label', 'name', 'type', 'role']) {
    if (element.hasAttribute && element.hasAttribute(attr)) attrs[attr] = element.getAttribute(attr);
  }
  return {
    selector,
    text: element.textContent ? element.textContent.trim().substring(0, 60) : '',
    tagName: element.tagName,
    attrs
  };
}

// For list items (email elements) prefer a class-based selector that matches
// ALL similar items — bulk runs need multi-match, not a unique path.
function getListItemInfo(element) {
  const clean = element.classList ? [...element.classList].filter(c => c.length > 1 && !/\d/.test(c)) : [];
  if (clean.length) {
    const sel = element.tagName.toLowerCase() + '.' + clean.join('.');
    try {
      if (document.querySelectorAll(sel).length > 1) {
        const attrs = {};
        for (const attr of ['placeholder', 'aria-label', 'name', 'type', 'role']) {
          if (element.hasAttribute && element.hasAttribute(attr)) attrs[attr] = element.getAttribute(attr);
        }
        return {
          selector: sel,
          text: element.textContent ? element.textContent.trim().substring(0, 60) : '',
          tagName: element.tagName,
          attrs
        };
      }
    } catch (e) {}
  }
  return getElementInfo(element);
}

function getInteractiveTarget(element) {
  let current = element;
  while (current && current !== document.body && current.parentElement) {
    if (current.tagName) {
      const tag = current.tagName.toLowerCase();
      const role = current.getAttribute && current.getAttribute('role');
      if (tag === 'button' || tag === 'a' || tag === 'li' || tag === 'input' || tag === 'textarea' ||
          role === 'button' || (current.classList && current.classList.contains('button')) || current.onclick) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return element;
}

function isTrained(mode) {
  const s = state.cachedSelectors[mode] || {};
  return TRAINING_STEPS[mode].every(k => s[k]);
}

function pageClickHandler(e) {
  if (state.trainingStep === 0) return;
  const target = (e.composedPath && e.composedPath()[0]) || e.target;
  if (overlayEl && overlayEl.contains(target)) return;

  // Claim training for this frame on first captured click
  chrome.storage.local.set({ hmeTrainingClaim: { key: frameKey, ts: Date.now() } });

  const stepKey = TRAINING_STEPS[state.mode][state.trainingStep - 1];
  const interactiveTarget = getInteractiveTarget(target);
  const info = stepKey === 'email' ? getListItemInfo(interactiveTarget) : getElementInfo(interactiveTarget);
  state.selectors[stepKey] = info;

  const label = info.text || info.selector;
  if (stepKey === 'email') addLog('success', t('email_selected') + `"${label}"`);
  else if (stepKey === 'labelInput') addLog('success', t('label_input_selected') + `"${label}"`);
  else if (stepKey === 'save') addLog('success', t('save_selected') + `"${label}"`);
  else if (stepKey === 'confirm') addLog('success', t('confirm_selected') + `"${label}"`);
  else addLog('success', t('action_selected') + `"${label}"`);

  state.trainingStep++;
  if (state.trainingStep > TRAINING_STEPS[state.mode].length) {
    // done
    const saved = {};
    for (const k of TRAINING_STEPS[state.mode]) saved[k] = state.selectors[k];
    state.cachedSelectors[state.mode] = saved;
    chrome.storage.local.set({
      ['hmeSelectors_' + state.mode]: saved,
      hmeTrainingClaim: null
    }, () => addLog('success', t('training_saved')));
    state.trainingStep = 0;
    document.removeEventListener('click', pageClickHandler, true);
    setTimeout(() => removeOverlay(), 2500);
  } else {
    createOverlay();
  }
  updateOverlay();
  broadcastState();
}

function startTraining() {
  state.trainingStep = 1;
  for (const k of TRAINING_STEPS[state.mode]) state.selectors[k] = null;
  addLog('info', t('log_start') + (state.mode === 'rename' ? ' ' + t('untrained_rename_hint') : ''));
  document.addEventListener('click', pageClickHandler, true);
  broadcastState();
}

function abortTraining(reason) {
  state.trainingStep = 0;
  document.removeEventListener('click', pageClickHandler, true);
  state.selectors = { ...state.selectors, ...(state.cachedSelectors[state.mode] || {}) };
  if (reason) addLog('warning', reason);
  removeOverlay();
  broadcastState();
}

function handleCancelTraining() {
  abortTraining(t('log_cancel'));
  chrome.storage.local.set({ hmeTrainingClaim: null });
}

function resetTraining() {
  const empty = { email: null, deactivate: null, confirm: null, labelInput: null, save: null };
  for (const k of TRAINING_STEPS[state.mode]) state.selectors[k] = null;
  state.cachedSelectors[state.mode] = {};
  chrome.storage.local.remove(['hmeSelectors_' + state.mode], () => {
    addLog('system', t('log_reset'));
    updateOverlay();
    broadcastState();
  });
}

// ---------------------------------------------------------------------------
// Protection / filtering
// ---------------------------------------------------------------------------
function isFlagged(el) {
  if (!state.flaggedWords.length) return false;
  const text = (el.textContent || '').toLowerCase();
  return state.flaggedWords.some(w => text.includes(w));
}
function isProtectedEmail(el) {
  if (!state.protectedEmails.size && !state.protectedLabel) return false;
  const email = extractEmail(el);
  if (email && state.protectedEmails.has(email)) return true;
  const label = state.protectedLabel.trim().toLowerCase();
  return !!label && (el.textContent || '').toLowerCase().includes(label);
}
function countSkipOnce(bucket, email, logKey) {
  const key = bucket + ':' + email;
  if (state.skipCounted.has(key)) return;
  state.skipCounted.add(key);
  state.stats[bucket]++;
  if (logKey) addLog('info', t(logKey, { email }));
}
function inMismatchSection(el) {
  for (const sel of state.mismatchSels) {
    try { if (el.closest(sel)) return true; } catch (e) {}
  }
  return false;
}
function learnMismatchSection(el) {
  const sec = el.closest('section[id], ul[id], div[id]') || el.closest('section, ul');
  if (sec && sec.id) state.mismatchSels.add('#' + CSS.escape(sec.id));
}
function inMatchSection(el) {
  for (const sel of state.matchSels) {
    try { if (el.closest(sel)) return true; } catch (e) {}
  }
  return false;
}
function sectionSelectorOf(el) {
  if (!el || !el.closest) return null;
  const sec = el.closest('section[id], ul[id], div[id]') || el.closest('section, ul');
  return sec && sec.id ? '#' + CSS.escape(sec.id) : null;
}
function freshItemNode(email) {
  return queryEmailItems().find(el => extractEmail(el) === email) || null;
}
function classifyItem(el) {
  const email = extractEmail(el);
  if (!email || state.skipSet.has(email)) return 'skip';
  if (state.matchSels.size && !inMatchSection(el)) return 'skip';
  if (inMismatchSection(el)) return 'skip';
  if (isFlagged(el)) { countSkipOnce('skippedFlagged', email, 'skip_flagged'); return 'skip'; }
  if (state.mode === 'delete' && isProtectedEmail(el)) { countSkipOnce('skippedProtected', email, 'skip_protected'); return 'skip'; }
  return 'ok';
}
function addProtectedEmails(emails) {
  const list = [...emails].map(normalizeEmail).filter(Boolean);
  let added = 0;
  for (const e of list) if (!state.protectedEmails.has(e)) { state.protectedEmails.add(e); added++; }
  if (added > 0) {
    chrome.storage.local.set({ hmeProtectedEmails: [...state.protectedEmails] });
    addLog('success', t('protect_added', { n: added }));
    broadcastState();
  }
}

// ---------------------------------------------------------------------------
// Search (lazy-load aware, exhaustible)
// ---------------------------------------------------------------------------
async function scrollUntilFound(matchFn) {
  const sigOf = () => {
    const it = queryEmailItems();
    const sc = findScrollContainer(it);
    return { n: it.length, sig: it.length + ':' + (sc ? sc.scrollHeight : document.documentElement.scrollHeight), sc, last: it[it.length - 1] };
  };
  let stall = 0, lastSig = '', scrolledOnce = false, loadingSince = 0;
  while (active()) {
    const { n, sig, sc, last } = sigOf();
    const hit = queryEmailItems().find(matchFn);
    if (hit) return hit;
    if (scrolledOnce && sig === lastSig) stall++; else stall = 0;
    lastSig = sig;
    if (!scrolledOnce) { addLog('info', t('scrolling')); scrolledOnce = true; }
    // a visible loader means "more may be coming" → wait it out, don't scroll again
    if (isLoadingVisible(sc)) {
      if (!loadingSince) loadingSince = performance.now();
      if (performance.now() - loadingSince > 90000) { loadingSince = 0; stall++; }
      else stall = 0;
    } else {
      loadingSince = 0;
    }
    if (stall >= 4) {
      if (n === 0) addLog('error', t('err_selector_empty'));
      return EXHAUSTED;
    }
    if (loadingSince) {
      await sleep(500);
    } else {
      scrollDown(sc);
      if (last) { try { last.scrollIntoView({ block: 'end' }); } catch (e) {} }
    }
    await waitFor(() => {
      const it2 = queryEmailItems();
      const sc2 = findScrollContainer(it2);
      const sig2 = it2.length + ':' + (sc2 ? sc2.scrollHeight : document.documentElement.scrollHeight);
      return sig2 !== sig ? true : null;
    }, { timeout: 6000 });
    await sleep(150);
  }
  return EXHAUSTED;
}

async function findNextCandidate() {
  return scrollUntilFound(el => classifyItem(el) === 'ok');
}

async function findTargetItem(email) {
  return scrollUntilFound(el => extractEmail(el) === email && !state.skipSet.has(email));
}

// ---------------------------------------------------------------------------
// Bot core: deactivate / delete
// ---------------------------------------------------------------------------
function itemPresent(email) {
  return queryEmailItems().some(el => extractEmail(el) === email);
}

async function verifyProcessed(email, snap) {
  return waitFor(() => {
    const el = queryEmailItems().find(x => extractEmail(x) === email);
    if (!el) return 'removed';
    const s2 = snapshotItem(el);
    if (s2.html !== snap.html || s2.sig !== snap.sig) return 'changed';
    return null;
  }, { timeout: 8000, interval: 200 });
}

// Wait until the details panel is actually bound to the clicked item:
// 1) an ancestor of the anchor contains the item's email, OR
// 2) panel-ish text around the anchor stayed stable for 350ms (UIs without email).
function waitForPanelBinding(getAnchor, email, timeout = 4000) {
  let lastText = null, lastChange = performance.now();
  const emailLc = (email || '').toLowerCase();
  return waitFor(() => {
    const a = getAnchor();
    if (!a) { lastText = null; lastChange = performance.now(); return null; }
    if (emailLc) {
      let c = a;
      for (let i = 0; i < 8 && c && c !== document.body; i++) {
        if ((c.textContent || '').toLowerCase().includes(emailLc)) return 'bound';
        c = c.parentElement;
      }
    }
    const p = (a.closest && a.closest('aside,section,form,[role="dialog"]')) || a.parentElement || a;
    const txt = (p.textContent || '').slice(0, 3000);
    if (txt !== lastText) { lastText = txt; lastChange = performance.now(); return null; }
    return (performance.now() - lastChange >= 350) ? 'stable' : null;
  }, { timeout, interval: 100 });
}

function readInputValue(el) {
  return ((el.value !== undefined && el.tagName !== 'DIV' && !el.isContentEditable) ? el.value : (el.textContent || '')).trim();
}
// Wait until the label input value settles (async UI re-fill after item switch).
function waitForStableInput(getInput, timeout = 5000) {
  let last = null, lastChange = performance.now();
  return waitFor(() => {
    const el = getInput();
    if (!el) { last = null; lastChange = performance.now(); return null; }
    const cur = readInputValue(el);
    if (cur !== last) { last = cur; lastChange = performance.now(); return null; }
    return (performance.now() - lastChange >= 350) ? cur : null;
  }, { timeout, interval: 100 });
}

// Apple changes class names; the trained *text* is stable. When the stored CSS
// selector stops matching, rebuild it from the element that carries the trained
// text and persist the fresh selector (self-healing, no retraining needed).
function relinkSelectorFromText(key) {
  const cfg = state.selectors[key];
  if (!cfg || !cfg.text) return false;
  const want = normalizeLabel(cfg.text);
  if (!want) return false;
  for (const el of document.querySelectorAll('button, [role="button"], input, a')) {
    if (!isVisible(el)) continue;
    if (normalizeLabel(textOf(el)) !== want) continue;
    if (el.id) {
      const sel = '#' + CSS.escape(el.id);
      if (state.cachedSelectors[state.mode]) {
        state.cachedSelectors[state.mode][key] = { ...cfg, selector: sel };
        state.selectors[key] = { ...cfg, selector: sel };
        chrome.storage.local.set({ ['hmeSelectors_' + state.mode]: state.cachedSelectors[state.mode] });
        addLog('system', t('relinked', { sel }));
        return true;
      }
    }
  }
  return false;
}

async function processItem(item) {
  const email = extractEmail(item);
  state.currentItem = email;
  addLog('info', t('processing', { email }));
  updateOverlay(); broadcastState();
  const secSel = sectionSelectorOf(item);
  let node = freshItemNode(email) || item;
  try { node.scrollIntoView({ block: 'center' }); } catch (e) {}
  await sleep(120);
  if (!active()) return;
  node = freshItemNode(email) || node; // list may have re-rendered; never click stale nodes
  node.click();

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (!active()) return;
    const findAction = () => {
      const el = findElement(state.selectors.deactivate);
      return el && isVisible(el) && !el.disabled ? el : null;
    };
    let actionEl = await waitFor(findAction, { timeout: 4000 });
    if (!actionEl) {
      // The trained CSS may no longer match Apple's current markup: re-link the
      // selector from the trained TEXT (same way training named it) instead of
      // burning seconds and collapsing the panel.
      relinkSelectorFromText('deactivate');
      actionEl = await waitFor(findAction, { timeout: 2500 });
    }
    if (!actionEl) {
      // stale-node click (delegated listeners ignore detached nodes): re-click fresh node once
      const fresh = freshItemNode(email);
      if (fresh) {
        try { fresh.scrollIntoView({ block: 'center' }); } catch (e) {}
        fresh.click();
        actionEl = await waitFor(findAction, { timeout: 2500 });
      }
    }
    if (actionEl) {
      // panel may still show the PREVIOUS item — wait until it binds to this email
      await waitForPanelBinding(findAction, email);
      actionEl = findAction();
    }
    if (!actionEl) {
      dismissUi(DISMISS_SCOPES);
      state.skipSet.add(email);
      learnMismatchSection(freshItemNode(email) || item);
      state.stats.mismatch++;
      addLog('warning', t('err_action_missing', { email }));
      return;
    }
    if (!active()) { dismissUi(DISMISS_SCOPES); return; }   // user stopped mid-step
    actionEl.click();

    const confirmEl = await waitFor(() => {
      const el = findElement(state.selectors.confirm);
      return el && isVisible(el) && !el.disabled ? el : null;
    }, { timeout: 5000 });
    if (!confirmEl) {
      // A modal we opened is still open: close it via its own control, never a
      // page-wide Escape (that collapsed the whole HME app on the real site).
      dismissUi(DISMISS_SCOPES);
      if (attempt === 2) { state.stats.failed++; state.skipSet.add(email); addLog('error', t('err_confirm_missing', { email })); return; }
      addLog('warning', t('retry_note', { email }));
      await sleep(500);
      continue;
    }
    const snap = snapshotItem(freshItemNode(email) || item);
    if (!active()) { dismissUi(DISMISS_SCOPES); return; }   // never confirm after STOP
    confirmEl.click();

    // Delete must prove the row is GONE: 'changed' alone can be a spinner or a
    // selection class, and counting that as deleted is a silent false positive.
    // Deactivate legitimately moves the row to the inactive section ('changed').
    const verdict = await verifyProcessed(email, snap);
    const ok = state.mode === 'delete' ? verdict === 'removed' : !!verdict;
    if (ok) {
      state.skipSet.add(email);                  // never click a processed address again
      if (state.mode === 'delete' && isProtectedEmail(item)) {
        // became protected while this item was being processed: it survived,
        // so report it as skipped rather than deleted.
        countSkipOnce('skippedProtected', email, 'skip_protected');
        state.progress++;
        broadcastState();
        return;
      }
      state.stats.processed++;
      if (secSel) state.matchSels.add(secSel);
      state.progress++;
      addLog('success', t(state.mode === 'delete' ? 'success_delete' : 'success_deactivate', { email }));
      broadcastState();
      return;
    }
    // not verified
    dismissUi(DISMISS_SCOPES);
    const second = await waitFor(() => !itemPresent(email) ? 'removed' : null, { timeout: 2500 });
    if (second) {
      state.stats.processed++; state.progress++;
      if (secSel) state.matchSels.add(secSel);
      addLog('success', t(state.mode === 'delete' ? 'success_delete' : 'success_deactivate', { email }));
      broadcastState();
      return;
    }
    if (attempt === 2) {
      state.stats.failed++;
      state.skipSet.add(email);
      addLog('error', t('err_verify', { email }));
      return;
    }
    addLog('warning', t('retry_note', { email }));
    await sleep(500);
    const again = queryEmailItems().find(x => extractEmail(x) === email);
    if (!again) { state.stats.failed++; return; }
    try { again.scrollIntoView({ block: 'center' }); } catch (e) {}
    again.click();
  }
}

async function runLoop() {
  if (loopActive) return;
  loopActive = true;
  try {
    while (active()) {
      if (state.progress >= state.limit) { finishRun('goal'); return; }
      const item = await findNextCandidate();
      if (!active()) break;
      if (item === EXHAUSTED || !item) { finishRun('exhausted'); return; }
      await processItem(item);
      if (!active()) break;
      if (state.botState === 'pausing') {
        state.botState = 'paused';
        addLog('warning', t('bot_paused'));
        updateOverlay(); broadcastState();
        await waitFor(() => state.botState !== 'paused' ? true : null, { timeout: 3600000, interval: 250 });
        if (!active()) break;
      }
      await sleep(jitteredDelay());
    }
  } finally {
    loopActive = false;
    if (startPending) { startPending = false; if (running()) (state.mode === 'rename' ? runRenameLoop() : runLoop()); }
  }
}

// ---------------------------------------------------------------------------
// Bot core: rename
// ---------------------------------------------------------------------------
async function processRename(target) {
  const newLabel = state.renameLabel.trim();
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (!active()) return 'aborted';
    let item = null;
    if (renameSearchExhausted) {
      // The list was scrolled end-to-end for a previous target, but a
      // re-sort or lazy batch may have changed what is rendered: still look at
      // the DOM, and allow a full re-scan if the item isn't there.
      item = queryEmailItems().find(x => extractEmail(x) === target) || null;
      if (!item) {
        const found = await findTargetItem(target);
        if (found !== EXHAUSTED) item = found;
      }
    } else {
      const found = await findTargetItem(target);
      if (found === EXHAUSTED) { renameSearchExhausted = true; item = null; }
      else item = found;
    }
    if (!active()) return 'aborted';
    if (!item) return 'notFound';
    let node = freshItemNode(target) || item;
    try { node.scrollIntoView({ block: 'center' }); } catch (e) {}
    await sleep(120);
    node = freshItemNode(target) || node;
    node.click();

    const inputFound = await waitFor(() => {
      const el = findElement(state.selectors.labelInput);
      return el && isVisible(el) ? el : null;
    }, { timeout: 5000 });
    if (!inputFound) {
      dismissUi(DISMISS_SCOPES);
      if (attempt === 2) return 'failed';
      addLog('warning', t('retry_note', { email: target }));
      continue;
    }
    // wait until panel binds to THIS target and the input value settles
    const getInput = () => {
      const el = findElement(state.selectors.labelInput);
      return el && isVisible(el) ? el : null;
    };
    await waitForPanelBinding(getInput, target);
    const cur = await waitForStableInput(getInput);
    const input = getInput();
    if (cur === null || !input) {
      dismissUi(DISMISS_SCOPES);
      if (attempt === 2) return 'failed';
      addLog('warning', t('retry_note', { email: target }));
      continue;
    }
    if (cur.toLowerCase() === newLabel.toLowerCase()) {
      dismissUi(DISMISS_SCOPES);
      return 'already';
    }
    setInputValue(input, newLabel);
    await sleep(80);

    const save = await waitFor(() => {
      const el = findElement(state.selectors.save);
      return el && isVisible(el) && !el.disabled ? el : null;
    }, { timeout: 4000 });
    if (!save) {
      dismissUi(DISMISS_SCOPES);
      if (attempt === 2) return 'failed';
      continue;
    }
    if (!active()) { dismissUi(DISMISS_SCOPES); return 'aborted'; }
    save.click();

    const ok = await waitFor(() => {
      const el = queryEmailItems().find(x => extractEmail(x) === target);
      if (!el) return null; // may re-render mid-resort; keep waiting
      return (el.textContent || '').toLowerCase().includes(newLabel.toLowerCase()) ? 'ok' : null;
    }, { timeout: 6000 });
    if (ok) return 'renamed';

    dismissUi(DISMISS_SCOPES);
    if (attempt === 2) return 'failed';
    addLog('warning', t('retry_note', { email: target }));
    await sleep(400);
  }
  return 'failed';
}

async function runRenameLoop() {
  if (loopActive) return;
  loopActive = true;
  const renamedForProtection = [];
  try {
    for (const target of state.renameTargets) {
      if (!active()) break;
      state.currentItem = target;
      updateOverlay(); broadcastState();
      const res = await processRename(target);
      if (res === 'aborted') break;
      state.renameResults[target] = res;
      state.progress++;
      if (res === 'renamed') {
        state.stats.processed++;
        addLog('success', t('rename_done', { email: target, label: state.renameLabel }));
        renamedForProtection.push(target);
      } else if (res === 'already') {
        state.stats.processed++;
        addLog('warning', t('rename_already', { email: target, label: state.renameLabel }));
        renamedForProtection.push(target);
      } else if (res === 'notFound') {
        state.stats.notFound++;
        addLog('warning', t('rename_not_found', { email: target }));
      } else {
        state.stats.failed++;
        state.skipSet.add(target);
        addLog('error', t('rename_failed', { email: target }));
      }
      if (state.autoProtect && renamedForProtection.length >= 5) {
        addProtectedEmails(renamedForProtection.splice(0));
      }
      broadcastState();
      if (!active()) break;
      if (state.botState === 'pausing') {
        state.botState = 'paused';
        addLog('warning', t('bot_paused'));
        updateOverlay(); broadcastState();
        await waitFor(() => state.botState !== 'paused' ? true : null, { timeout: 3600000, interval: 250 });
        if (!active()) break;
      }
      await sleep(jitteredDelay());
    }
    if (active()) finishRun('goal');
  } finally {
    loopActive = false;
    if (startPending) { startPending = false; if (running()) (state.mode === 'rename' ? runRenameLoop() : runLoop()); }
    if (renamedForProtection.length && state.autoProtect) addProtectedEmails(renamedForProtection);
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
function resetRunState() {
  state.progress = 0;
  state.stats = { processed: 0, skippedFlagged: 0, skippedProtected: 0, failed: 0, notFound: 0, mismatch: 0 };
  state.skipSet = new Set();
  state.skipCounted = new Set();
  state.mismatchSels = new Set();
  state.matchSels = new Set();
  state.renameResults = {};
  renameSearchExhausted = false;
  state.currentItem = '';
  runFinished = false;
}

function finishRun(reason) {
  if (runFinished) return;
  runFinished = true;
  if (reason === 'goal' && state.mode !== 'rename') addLog('success', t('goal_reached', { n: state.stats.processed }));
  if (reason === 'exhausted') addLog('system', t('exhausted'));
  const s = state.stats;
  addLog('system', t('summary', {
    processed: s.processed, flagged: s.skippedFlagged, protected: s.skippedProtected,
    failed: s.failed, notFound: s.notFound, mismatch: s.mismatch
  }));
  const summary = {
    ts: Date.now(), mode: state.mode, reason, limit: state.limit, progress: state.progress, ...s
  };
  state.lastSummary = summary;
  chrome.storage.local.set({ hmeLastSummary: summary });
  haltLocal();
}

function haltLocal() {
  state.botState = 'idle';
  runFinished = true;
  if (botTimeoutId) { clearTimeout(botTimeoutId); botTimeoutId = null; }
  if (sleepResolver) { const r = sleepResolver; sleepResolver = null; r(); }
  state.currentItem = '';
  updateOverlay();
  broadcastState();
}

function startBot(limit, delay, jitter, mode) {
  // Run mode is explicit: after a rename run state.mode is 'rename' in content.
  if (mode && TRAINING_STEPS[mode] && mode !== 'rename') {
    state.mode = mode;
    state.selectors = { ...state.selectors, ...(state.cachedSelectors[mode] || {}) };
  }
  if (state.mode === 'rename') { addLog('error', t('mode_rename_pick')); broadcastState(); return false; }
  if (!isTrained(state.mode)) { addLog('error', t('not_trained')); broadcastState(); return false; }
  if (!isCapableFrame()) { addLog('error', t('err_wrong_frame')); broadcastState(); return false; }
  createOverlay();
  resetRunState();
  state.botState = 'running';
  state.limit = parseInt(limit) || 50;
  state.delay = parseInt(delay) || 1500;
  if (jitter !== undefined) state.jitter = !!jitter;
  chrome.storage.local.set({ hmeBotClaim: { key: frameKey, ts: Date.now() } });
  addLog('info', t('bot_started', { mod: t('mod_' + state.mode), limit: state.limit, delay: state.delay }));
  updateOverlay(); broadcastState();
  if (loopActive) { startPending = true; }   // previous loop still unwinding
  else runLoop();
  return true;
}

function startRename(targets, label, delay) {
  if (!isTrained('rename')) { addLog('error', t('not_trained') + ' ' + t('untrained_rename_hint')); broadcastState(); return false; }
  if (!isCapableFrame()) { addLog('error', t('err_wrong_frame')); broadcastState(); return false; }
  if (!Array.isArray(targets) || !targets.length || !label || !label.trim()) {
    addLog('error', 'Rename: empty target list or label.'); broadcastState(); return false;
  }
  state.mode = 'rename';
  state.selectors = { ...state.selectors, ...(state.cachedSelectors.rename || {}) };
  createOverlay();
  resetRunState();
  state.renameTargets = [...new Set(targets.map(normalizeEmail).filter(Boolean))];
  state.renameLabel = label.trim();
  state.limit = state.renameTargets.length;
  state.delay = parseInt(delay) || state.delay;
  state.botState = 'running';
  chrome.storage.local.set({ hmeBotClaim: { key: frameKey, ts: Date.now() } });
  addLog('info', t('rename_started', { n: state.renameTargets.length, label: state.renameLabel }));
  updateOverlay(); broadcastState();
  if (loopActive) { startPending = true; } else runRenameLoop();
  return true;
}

function pauseBot() {
  if (state.botState !== 'running') return;
  state.botState = 'pausing';
  addLog('warning', t('pause_requested'));
  updateOverlay(); broadcastState();
}
function resumeBot() {
  if (state.botState !== 'paused') return;
  state.botState = 'running';
  addLog('info', t('bot_resumed'));
  updateOverlay(); broadcastState();
}
function stopBot(byUser = true) {
  if (state.botState === 'idle') return;
  if (!runFinished && byUser) {
    runFinished = true;
    const s = state.stats;
    addLog('system', t('summary', {
      processed: s.processed, flagged: s.skippedFlagged, protected: s.skippedProtected,
      failed: s.failed, notFound: s.notFound, mismatch: s.mismatch
    }));
    const summary = { ts: Date.now(), mode: state.mode, reason: 'stopped', limit: state.limit, progress: state.progress, ...s };
    state.lastSummary = summary;
    chrome.storage.local.set({ hmeLastSummary: summary });
  }
  dismissUi(DISMISS_SCOPES);
  addLog('system', t('bot_stopped'));
  chrome.storage.local.get('hmeBotClaim', r => {
    if (r.hmeBotClaim && r.hmeBotClaim.key === frameKey) chrome.storage.local.set({ hmeBotClaim: null });
  });
  haltLocal();
}

// ---------------------------------------------------------------------------
// Floating overlay (single instance, only in the working frame)
// ---------------------------------------------------------------------------
const OV_CSS = `
  position: fixed; top: 20px; right: 20px; width: 300px; z-index: 2147483647;
  background: rgba(9, 14, 26, 0.94); border: 1px solid #223047; border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.5); color: #e6ebf5;
  font: 13px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  user-select: none;
`;
function createOverlay() {
  if (overlayEl) { updateOverlay(); return; }
  overlayEl = document.createElement('div');
  overlayEl.id = 'hme-floating-overlay';
  overlayEl.setAttribute('style', OV_CSS);
  if (state.overlayPos && Number.isFinite(state.overlayPos.x)) {
    overlayEl.style.left = state.overlayPos.x + 'px';
    overlayEl.style.top = state.overlayPos.y + 'px';
    overlayEl.style.right = 'auto';
  }
  // drag (header only)
  let dragging = false, ox = 0, oy = 0;
  overlayEl.addEventListener('mousedown', e => {
    const tgt = (e.composedPath && e.composedPath()[0]) || e.target;
    if (tgt.closest && tgt.closest('button')) return;
    if (!tgt.closest || !tgt.closest('.hme-ov-header')) return;
    dragging = true;
    const r = overlayEl.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging || !overlayEl) return;
    overlayEl.style.left = Math.max(0, e.clientX - ox) + 'px';
    overlayEl.style.top = Math.max(0, e.clientY - oy) + 'px';
    overlayEl.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging || !overlayEl) return;
    dragging = false;
    const r = overlayEl.getBoundingClientRect();
    state.overlayPos = { x: r.left, y: r.top };
    chrome.storage.local.set({ hmeOverlayPos: state.overlayPos });
  });
  document.body.appendChild(overlayEl);
  updateOverlay();
}
function removeOverlay() {
  if (overlayEl) { overlayEl.remove(); overlayEl = null; }
}
function updateOverlay() {
  if (!overlayEl) return;
  const dot = c => `<span style="width:8px;height:8px;border-radius:50%;background:${c};box-shadow:0 0 6px ${c};display:inline-block"></span>`;
  const btn = (id, label, bg) => `<button data-ov="${id}" style="flex:1;padding:5px 0;border:0;border-radius:6px;background:${bg};color:#fff;font:600 12px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;cursor:pointer">${label}</button>`;
  let title = t('overlay_title'), color = '#889096', body = '';

  if (state.trainingStep > 0) {
    title = t('overlay_training') + ' ' + state.trainingStep + '/' + TRAINING_STEPS[state.mode].length;
    color = '#4f8cff';
    const inst = (locales[state.lang]['inst_' + state.mode] || [])[state.trainingStep] || '';
    body = `<div style="color:#9fb0cc;margin-bottom:8px">${inst}</div>
      <button data-ov="cancel" style="width:100%;padding:5px 0;border:1px solid #2a3a55;border-radius:6px;background:transparent;color:#c7d2e5;font:12px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;cursor:pointer">${t('overlay_cancel')}</button>`;
  } else if (state.botState !== 'idle') {
    const pct = state.limit ? Math.min(100, Math.round(state.progress / state.limit * 100)) : 0;
    title = state.botState === 'paused' ? t('overlay_paused') : state.botState === 'pausing' ? t('overlay_pausing') : t('mod_' + state.mode);
    color = state.botState === 'running' ? '#34d17e' : '#f7b955';
    const s = state.stats;
    body = `
      <div style="display:flex;justify-content:space-between;color:#9fb0cc;margin-bottom:4px">
        <span>${state.progress} / ${state.limit}</span><span>${pct}%</span>
      </div>
      <div style="height:5px;background:#1a2438;border-radius:3px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#4f8cff,#34d17e)"></div>
      </div>
      <div style="color:#9fb0cc;font-size:11px;margin-bottom:6px">✓ ${s.processed} · ⛔ ${s.skippedFlagged + s.skippedProtected} · ✗ ${s.failed}${state.mode === 'rename' ? ' · ? ' + s.notFound : ''}</div>
      ${state.currentItem ? `<div style="color:#c7d2e5;font-size:11px;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t('overlay_current', { email: state.currentItem })}</div>` : '<div style="margin-bottom:8px"></div>'}
      <div style="display:flex;gap:6px">
        ${state.botState === 'paused'
          ? btn('resume', t('overlay_resume'), '#2e9e63')
          : btn('pause', t('overlay_pause'), '#b07d2a')}
        ${btn('stop', t('overlay_stop'), '#c2334d')}
      </div>`;
  } else {
    const trained = isTrained(state.mode);
    title = t('overlay_title');
    body = `<div style="color:#9fb0cc">
        ${t('mod_loaded', { mod: t('mod_' + state.mode) })}<br>
        ${trained ? '✅ ' + t('overlay_trained') : '❌ ' + t('overlay_untrained')}
      </div>`;
  }

  overlayEl.innerHTML = `
    <div class="hme-ov-header" style="display:flex;align-items:center;gap:8px;padding:9px 10px;border-bottom:1px solid #1c2942;cursor:move">
      ${dot(color)}
      <span style="font-weight:700;flex:1">${title}</span>
      <button data-ov="min" style="border:0;background:transparent;color:#9fb0cc;cursor:pointer;font:14px inherit;padding:0 2px">${state.overlayMin ? '▢' : '—'}</button>
    </div>
    <div class="hme-ov-body" style="padding:10px;${state.overlayMin ? 'display:none' : ''}">${body}</div>`;

  const on = (name, fn) => {
    const el = overlayEl.querySelector(`[data-ov="${name}"]`);
    if (el) el.onclick = e => { e.stopPropagation(); fn(); };
  };
  on('cancel', handleCancelTraining);
  on('pause', pauseBot);
  on('resume', resumeBot);
  on('stop', () => stopBot(true));
  on('min', () => {
    state.overlayMin = !state.overlayMin;
    chrome.storage.local.set({ hmeOverlayMin: state.overlayMin });
    updateOverlay();
  });
}

// ---------------------------------------------------------------------------
// Message handling (popup → content)
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const req = request || {};
  switch (req.action) {
    case 'HME_PING':
      frameReport();
      sendResponse({ status: 'ok' });
      break;
    case 'GET_STATE':
      sendResponse({ status: 'ok', state: publicState() });
      break;
    case 'SET_TARGET':
      state.isTargetFrame = !!req.isTarget;
      if (!state.isTargetFrame && state.botState !== 'idle') stopBot(false);
      sendResponse({ status: 'ok' });
      break;
    case 'SET_LANG':
      if (req.lang) { state.lang = req.lang; updateOverlay(); }
      sendResponse({ status: 'ok', state: publicState() });
      break;
    case 'SET_MODE':
      if (req.mode && TRAINING_STEPS[req.mode] && state.botState === 'idle') {
        state.mode = req.mode;
        state.selectors = { ...state.selectors, ...(state.cachedSelectors[req.mode] || {}) };
        addLog('system', t('mod_loaded', { mod: t('mod_' + req.mode) }));
        updateOverlay();
      }
      sendResponse({ status: 'ok', state: publicState() });
      break;
    case 'UPDATE_SETTINGS': {
      if (req.flaggedWords !== undefined) state.flaggedWords = parseFlagged(req.flaggedWords);
      if (req.delay !== undefined) state.delay = parseInt(req.delay) || state.delay;
      if (req.limit !== undefined) state.limit = parseInt(req.limit) || state.limit;
      if (req.jitter !== undefined) state.jitter = !!req.jitter;
      if (req.protectedLabel !== undefined) state.protectedLabel = req.protectedLabel;
      if (req.autoProtect !== undefined) state.autoProtect = !!req.autoProtect;
      sendResponse({ status: 'ok', state: publicState() });
      break;
    }
    case 'SET_PROTECTED': {
      if (Array.isArray(req.emails)) {
        state.protectedEmails = new Set(req.emails.map(normalizeEmail).filter(Boolean));
        chrome.storage.local.set({ hmeProtectedEmails: [...state.protectedEmails] });
      }
      if (req.label !== undefined) {
        state.protectedLabel = req.label;
        chrome.storage.local.set({ hmeProtectedLabel: state.protectedLabel });
      }
      sendResponse({ status: 'ok', state: publicState() });
      break;
    }
    case 'START_TRAINING':
      if (!req.targeted && !isCapableFrame()) { sendResponse({ status: 'wrong_frame' }); break; }
      startTraining();
      sendResponse({ status: 'ok', state: publicState() });
      break;
    case 'RESET_TRAINING':
      resetTraining();
      sendResponse({ status: 'ok', state: publicState() });
      break;
    case 'START_BOT':
      if (!req.targeted && !isCapableFrame()) { sendResponse({ status: 'wrong_frame' }); break; }
      sendResponse({ status: startBot(req.limit, req.delay, req.jitter, req.mode) ? 'ok' : 'error', state: publicState() });
      break;
    case 'START_RENAME':
      if (!req.targeted && !isCapableFrame()) { sendResponse({ status: 'wrong_frame' }); break; }
      sendResponse({ status: startRename(req.targets, req.label, req.delay) ? 'ok' : 'error', state: publicState() });
      break;
    case 'PAUSE_BOT': pauseBot(); sendResponse({ status: 'ok', state: publicState() }); break;
    case 'RESUME_BOT': resumeBot(); sendResponse({ status: 'ok', state: publicState() }); break;
    case 'STOP_BOT': stopBot(true); sendResponse({ status: 'ok', state: publicState() }); break;
    case 'CLEAR_LOGS':
      state.logs = [];
      sendResponse({ status: 'ok', state: publicState() });
      break;
    default:
      sendResponse({ status: 'unknown' });
  }
  return true;
});

// Expose minimal test hooks (E2E)
window.__hmeBot = { state: () => publicState(), frameKey };
})();
