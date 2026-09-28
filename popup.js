// popup.js — HME Bot control panel (frame-aware, v2)
'use strict';

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const locales = {
  en: {
    conn_searching: 'Searching for iCloud HME frame…',
    conn_connected: 'Connected — {mod} module · frame #{frame}',
    conn_offline: 'No iCloud HME frame found. Open icloud.com → Hide My Email.',
    btn_reconnect: 'Reconnect',
    tab_run: 'Run', tab_training: 'Training', tab_rename: 'Rename', tab_protect: 'Protection', tab_logs: 'Logs',
    label_module: 'Module',
    mode_deactivate: 'Deactivate', mode_delete: 'Delete', mode_rename: 'Rename',
    label_delay: 'Delay (ms)', label_limit: 'Limit (count)',
    label_jitter: 'Human-like delay variation (±30%)',
    label_flags: 'Blacklist keywords (comma separated)',
    protect_note: 'Protected addresses skipped in Delete mode:',
    btn_start_bot: 'Start Bot', btn_pause: 'Pause', btn_resume: 'Resume', btn_stop: 'Stop',
    training_desc: 'Teach the bot which elements to click. Training is saved per module and survives page reloads.',
    training_hint: 'Start training, then click the 3 elements on the iCloud page, in order.',
    btn_start_training: 'Start Training', btn_reset: 'Reset',
    step_email: 'Email item in the list',
    step_action_deactivate: '"Deactivate" button',
    step_action_delete: '"Delete" button',
    step_confirm: 'Confirm button in the dialog',
    step_label_input: 'Label input field',
    step_save: '"Save changes" button',
    badge_set: 'Set', badge_waiting: 'Click it…', badge_unset: 'Not set',
    rename_desc: 'Paste addresses (one per line). The bot finds each one in the active + inactive lists and sets its label. Requires Rename training.',
    label_targets: 'Email list', label_new_label: 'New label',
    label_auto_protect: 'Automatically add renamed addresses to the protection list',
    btn_start_rename: 'Start Rename',
    parse_valid: '{valid} valid address(es)', parse_ignored: '{n} line(s) ignored',
    res_renamed: 'renamed', res_already: 'already set', res_not_found: 'not found', res_failed: 'failed',
    protect_desc: 'Protected addresses are never clicked during a Delete run. Protection uses both the exact address list and the protected label (double safety).',
    label_protected_label: 'Protected label',
    label_add_emails: 'Add addresses (one per line)',
    btn_add: 'Add', btn_copy_list: 'Copy list', btn_clear_list: 'Clear list',
    label_protected_list: 'Protected addresses',
    prot_empty: 'List is empty. Add addresses manually or via the Rename tab.',
    title_logs: 'Process logs', btn_clear: 'Clear',
    footer_text: 'The iCloud.com → Hide My Email page must be open.',
    status_offline: 'Offline', status_ready: 'Ready', status_untrained: 'Untrained',
    status_training: 'Training', status_running: 'Running', status_paused: 'Paused',
    confirm_reset: 'Clear training data for this module?',
    confirm_clear_prot: 'Remove ALL addresses from the protection list?',
    copied: 'Copied ✓',
    summary_title: 'Last run',
    reason_goal: 'goal reached', reason_exhausted: 'list exhausted', reason_stopped: 'stopped',
    current_prefix: 'Current:'
  },
  tr: {
    conn_searching: 'iCloud HME çerçevesi aranıyor…',
    conn_connected: 'Bağlı — {mod} modülü · çerçeve #{frame}',
    conn_offline: 'iCloud HME çerçevesi bulunamadı. icloud.com → E-postamı Gizle sayfasını açın.',
    btn_reconnect: 'Yeniden bağlan',
    tab_run: 'Çalıştır', tab_training: 'Eğitim', tab_rename: 'Yeniden Adlandır', tab_protect: 'Koruma', tab_logs: 'Günlük',
    label_module: 'Modül',
    mode_deactivate: 'Devre Dışı Bırak', mode_delete: 'Kalıcı Sil', mode_rename: 'Yeniden Adlandır',
    label_delay: 'Gecikme (ms)', label_limit: 'Limit (adet)',
    label_jitter: 'İnsansı gecikme varyasyonu (±%30)',
    label_flags: 'Kara liste kelimeleri (virgülle ayırın)',
    protect_note: 'Silme modunda atlanan korumalı adresler:',
    btn_start_bot: 'Botu Başlat', btn_pause: 'Duraklat', btn_resume: 'Devam', btn_stop: 'Durdur',
    training_desc: 'Bota hangi öğelere tıklaması gerektiğini öğretin. Eğitim modül bazında kaydedilir, sayfa yenilense de korunur.',
    training_hint: 'Eğitimi başlatın, ardından iCloud sayfasındaki 3 öğeye sırayla tıklayın.',
    btn_start_training: 'Eğitimi Başlat', btn_reset: 'Sıfırla',
    step_email: 'Listedeki e-posta öğesi',
    step_action_deactivate: '"Devre Dışı Bırak" butonu',
    step_action_delete: '"Sil" butonu',
    step_confirm: 'Onay penceresindeki buton',
    step_label_input: 'Etiket (Label) giriş alanı',
    step_save: '"Değişiklikleri Kaydet" butonu',
    badge_set: 'Tanımlı', badge_waiting: 'Tıklayın…', badge_unset: 'Tanımsız',
    rename_desc: 'Adresleri alt alta yapıştırın. Bot her birini aktif + pasif listelerde bulur ve etiketini değiştirir. Yeniden Adlandırma eğitimi gerekir.',
    label_targets: 'E-posta listesi', label_new_label: 'Yeni etiket',
    label_auto_protect: 'Yeniden adlandırılan adresleri otomatik olarak koruma listesine ekle',
    btn_start_rename: 'Yeniden Adlandırmayı Başlat',
    parse_valid: '{valid} geçerli adres', parse_ignored: '{n} satır yoksayıldı',
    res_renamed: 'yeniden adlandırıldı', res_already: 'zaten bu etikette', res_not_found: 'bulunamadı', res_failed: 'başarısız',
    protect_desc: 'Korumalı adreslere Silme taramasında asla tıklanmaz. Koruma hem tam adres listesi hem korumalı etiket ile çalışır (çift emniyet).',
    label_protected_label: 'Korumalı etiket',
    label_add_emails: 'Adres ekle (satır başına bir tane)',
    btn_add: 'Ekle', btn_copy_list: 'Listeyi kopyala', btn_clear_list: 'Listeyi temizle',
    label_protected_list: 'Korumalı adresler',
    prot_empty: 'Liste boş. Elle ekleyin veya Yeniden Adlandır sekmesini kullanın.',
    title_logs: 'İşlem günlüğü', btn_clear: 'Temizle',
    footer_text: 'iCloud.com → E-postamı Gizle sayfası açık olmalıdır.',
    status_offline: 'Çevrimdışı', status_ready: 'Hazır', status_untrained: 'Eğitilmedi',
    status_training: 'Eğitimde', status_running: 'Çalışıyor', status_paused: 'Duraklatıldı',
    confirm_reset: 'Bu modülün eğitim verileri silinsin mi?',
    confirm_clear_prot: 'TÜM adresler koruma listesinden kaldırılsın mı?',
    copied: 'Kopyalandı ✓',
    summary_title: 'Son çalıştırma',
    reason_goal: 'hedefe ulaşıldı', reason_exhausted: 'liste tükendi', reason_stopped: 'durduruldu',
    current_prefix: 'Şu an:'
  }
};

let currentLang = 'en';
const t = (key, vars) => {
  let s = (locales[currentLang] && locales[currentLang][key]) || locales.en[key] || key;
  if (vars) for (const k of Object.keys(vars)) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
};

const STEP_KEYS = {
  deactivate: ['email', 'deactivate', 'confirm'],
  delete: ['email', 'deactivate', 'confirm'],
  rename: ['email', 'labelInput', 'save']
};
const EMAIL_LINE_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// ---------------------------------------------------------------------------
// Runtime state
// ---------------------------------------------------------------------------
let activeTabId = null;
let targetFrameId = null;
const frames = new Map();      // frameId -> capability
let lastState = null;
let connected = false;
let currentMode = 'deactivate';
const LOG_CAP = 200; // keep in sync with content.js publicState() log slice
let protectedCacheInit = false;

document.addEventListener('DOMContentLoaded', init);

function $(id) { return document.getElementById(id); }

function init() {
  // ---- tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ---- language
  $('btnLangEN').addEventListener('click', () => setLang('en'));
  $('btnLangTR').addEventListener('click', () => setLang('tr'));

  // ---- mode segments
  document.querySelectorAll('#modeSeg button, #trainModeSeg button').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      chrome.storage.local.set({ hmeLastMode: mode });
      sendAction('SET_MODE', { mode });
      currentMode = mode;
      syncSegs();
      if (lastState) renderSteps({ ...lastState, mode });
      refreshButtons();
    });
  });

  // ---- settings persistence
  $('inputDelay').addEventListener('change', () => chrome.storage.local.set({ hmeDelay: $('inputDelay').value }));
  $('inputLimit').addEventListener('change', () => chrome.storage.local.set({ hmeLimit: $('inputLimit').value }));
  $('chkJitter').addEventListener('change', () => chrome.storage.local.set({ hmeJitter: $('chkJitter').checked }));
  $('inputFlags').addEventListener('input', () => {
    chrome.storage.local.set({ hmeFlaggedWords: $('inputFlags').value });
    sendAction('UPDATE_SETTINGS', { flaggedWords: $('inputFlags').value });
  });

  // ---- run controls
  $('btnStartBot').addEventListener('click', () => {
    // Mode is sent explicitly: after a rename run the content-side mode may
    // still be 'rename' and must not be used for deactivate/delete.
    sendAction('START_BOT', {
      mode: currentMode,
      limit: parseInt($('inputLimit').value) || 50,
      delay: parseInt($('inputDelay').value) || 1500,
      jitter: $('chkJitter').checked
    });
  });
  $('btnPauseBot').addEventListener('click', () => {
    if (lastState && lastState.botState === 'paused') sendAction('RESUME_BOT');
    else sendAction('PAUSE_BOT');
  });
  $('btnStopBot').addEventListener('click', () => sendAction('STOP_BOT'));

  // ---- training
  $('btnStartTraining').addEventListener('click', () => sendAction('START_TRAINING'));
  $('btnResetTraining').addEventListener('click', () => {
    if (confirm(t('confirm_reset'))) sendAction('RESET_TRAINING');
  });

  // ---- rename
  $('txtTargets').addEventListener('input', () => {
    chrome.storage.local.set({ hmeRenameTargets: $('txtTargets').value });
    renderParseInfo();
    refreshButtons();
  });
  $('inputNewLabel').addEventListener('input', () => {
    chrome.storage.local.set({ hmeRenameLabel: $('inputNewLabel').value });
    refreshButtons();
  });
  $('chkAutoProtect').addEventListener('change', () => {
    chrome.storage.local.set({ hmeAutoProtect: $('chkAutoProtect').checked });
    sendAction('UPDATE_SETTINGS', { autoProtect: $('chkAutoProtect').checked });
  });
  $('btnStartRename').addEventListener('click', () => {
    const { valid } = parseEmailList($('txtTargets').value);
    const label = $('inputNewLabel').value.trim();
    if (!valid.length || !label) return;
    sendAction('START_RENAME', { targets: valid, label, delay: parseInt($('inputDelay').value) || 1500 });
    switchTab('rename');
  });
  $('btnStopRename').addEventListener('click', () => sendAction('STOP_BOT'));

  // ---- protection
  $('inputProtLabel').addEventListener('input', () => {
    chrome.storage.local.set({ hmeProtectedLabel: $('inputProtLabel').value });
    sendAction('SET_PROTECTED', { label: $('inputProtLabel').value });
  });
  $('btnProtAdd').addEventListener('click', () => {
    const { valid } = parseEmailList($('txtProtAdd').value);
    if (!valid.length) return;
    const merged = [...new Set([...getProtected(), ...valid])];
    applyProtected(merged);
    $('txtProtAdd').value = '';
  });
  $('btnProtCopy').addEventListener('click', async e => {
    try {
      await navigator.clipboard.writeText(getProtected().join('\n'));
      const b = e.currentTarget;
      const old = b.textContent;
      b.textContent = t('copied');
      setTimeout(() => { b.textContent = old; }, 1200);
    } catch (err) {}
  });
  $('btnProtClear').addEventListener('click', () => {
    if (confirm(t('confirm_clear_prot'))) applyProtected([]);
  });

  // ---- logs
  $('btnClearLogs').addEventListener('click', () => {
    $('logConsole').innerHTML = '';
    sendAction('CLEAR_LOGS');
  });

  $('btnReconnect').addEventListener('click', () => connect());

  // ---- incoming messages from content scripts
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (!msg || !msg.action) return;
    if (msg.action === 'FRAME_HELLO') {
      if (sender.tab && activeTabId !== null && sender.tab.id !== activeTabId) return;
      frames.set(sender.frameId ?? 0, { isTop: !!msg.isTop, hasHme: !!msg.hasHme, matchCount: msg.matchCount || 0 });
      if (targetFrameId === null) scheduleSelect();
    } else if (msg.action === 'STATE_UPDATE' && sender.frameId === targetFrameId) {
      updateUI(msg.state);
    } else if (msg.action === 'LOG_UPDATE' && sender.frameId === targetFrameId) {
      appendLog(msg.entry);
      flashTab('logs');
    }
  });

  // ---- load settings, then connect
  chrome.storage.local.get([
    'hmeLang', 'hmeLastMode', 'hmeDelay', 'hmeLimit', 'hmeJitter', 'hmeFlaggedWords',
    'hmeProtectedEmails', 'hmeProtectedLabel', 'hmeAutoProtect', 'hmeRenameTargets', 'hmeRenameLabel'
  ], result => {
    currentLang = result.hmeLang || 'en';
    if (result.hmeLastMode) currentMode = result.hmeLastMode;
    if (result.hmeDelay) $('inputDelay').value = result.hmeDelay;
    if (result.hmeLimit) $('inputLimit').value = result.hmeLimit;
    $('chkJitter').checked = !!result.hmeJitter;
    if (result.hmeFlaggedWords) $('inputFlags').value = result.hmeFlaggedWords;
    if (result.hmeProtectedLabel) $('inputProtLabel').value = result.hmeProtectedLabel;
    $('chkAutoProtect').checked = result.hmeAutoProtect === undefined ? true : !!result.hmeAutoProtect;
    if (result.hmeRenameTargets) $('txtTargets').value = result.hmeRenameTargets;
    if (result.hmeRenameLabel) $('inputNewLabel').value = result.hmeRenameLabel;

    applyI18n();
    syncSegs();
    renderParseInfo();
    protectedCache = result.hmeProtectedEmails || [];
    renderProtList(protectedCache);
    connect();
  });
}

// ---------------------------------------------------------------------------
// Connection / frame targeting
// ---------------------------------------------------------------------------
let selectTimer = null;
function scheduleSelect() {
  if (selectTimer) return;
  selectTimer = setTimeout(() => { selectTimer = null; selectTarget(); }, 650);
}

async function connect() {
  frames.clear();
  targetFrameId = null;
  connected = false;
  setConn('search', t('conn_searching'));
  updateUI(null);
  // Re-ask the active tab: the user may have switched tabs since popup open,
  // or the HME page may have reloaded in the SAME tab (new frame ids).
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab) { setConn('off', t('conn_offline')); updateUI(null); return; }
  if (activeTabId !== null && tab.id !== activeTabId) {
    sendAction('STOP_BOT');
    sendAction('PAUSE_BOT');
  }
  activeTabId = tab.id;
  // Broadcast ping to every frame; frames answer via runtime FRAME_HELLO (carries frameId)
  try {
    chrome.tabs.sendMessage(tab.id, { action: 'HME_PING' }, () => void chrome.runtime.lastError);
  } catch (e) {}
  scheduleSelect();
  // Hard fallback if nothing answers
  setTimeout(() => { if (targetFrameId === null && !frames.size) { setConn('off', t('conn_offline')); updateUI(null); } }, 1500);
}

// Tab/frame changes must not leave the popup bound to a dead tab.
let popupHiddenAt = 0;
function popupVisible() {
  if (document.visibilityState === 'visible') return true;
  // popups can report hidden right after open; treat sub-2s as visible
  return (Date.now() - popupHiddenAt) < 2000;
}
chrome.tabs.onActivated.addListener(() => { if (popupVisible()) connect(); });
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'complete' && tabId === activeTabId && popupVisible()) connect();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') popupHiddenAt = Date.now();
  else if (Date.now() - popupHiddenAt >= 2000) connect();
});

function selectTarget() {
  if (!frames.size) { setConn('off', t('conn_offline')); updateUI(null); return; }
  // Only frames that actually look like the HME app are eligible; otherwise a
  // random frame (iCloud home, Mail) could be targeted and "trained" on.
  let best = null, bestScore = -1;
  for (const [fid, cap] of frames) {
    if (!cap.hasHme && cap.matchCount <= 0) continue;
    const score = cap.matchCount * 1000 + (cap.hasHme ? 100 : 0) + (cap.isTop ? 0 : 1);
    if (score > bestScore) { bestScore = score; best = fid; }
  }
  if (best === null) { setConn('off', t('conn_offline')); updateUI(null); return; }
  targetFrameId = best;
  for (const fid of frames.keys()) {
    if (fid !== best) sendRaw(fid, { action: 'SET_TARGET', isTarget: false, targeted: true });
  }
  sendRaw(best, { action: 'SET_TARGET', isTarget: true, targeted: true }, () => {
    sendRaw(best, { action: 'GET_STATE', targeted: true }, resp => {
      if (resp && resp.state) {
        connected = true;
        currentMode = resp.state.mode || currentMode;
        syncSegs();
        setConn('on', t('conn_connected', { mod: t('mode_' + currentMode), frame: best }));
        updateUI(resp.state);
      } else {
        setConn('off', t('conn_offline'));
        updateUI(null);
      }
    });
  });
}

function sendRaw(frameId, msg, cb) {
  if (activeTabId === null) return;
  try {
    chrome.tabs.sendMessage(activeTabId, msg, { frameId }, resp => {
      void chrome.runtime.lastError;
      if (cb) cb(resp);
    });
  } catch (e) { if (cb) cb(null); }
}

function sendAction(action, data = {}, cb) {
  if (targetFrameId === null) { connect(); return; }
  sendRaw(targetFrameId, { action, targeted: true, ...data }, resp => {
    if (resp && resp.state) updateUI(resp.state);
    if (cb) cb(resp);
  });
}

function setConn(kind, text) {
  const bar = $('connBar');
  bar.classList.toggle('on', kind === 'on');
  bar.classList.toggle('off', kind === 'off');
  $('connText').textContent = text;
}

// ---------------------------------------------------------------------------
// i18n rendering
// ---------------------------------------------------------------------------
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  $('btnLangEN').classList.toggle('active', currentLang === 'en');
  $('btnLangTR').classList.toggle('active', currentLang === 'tr');
  document.documentElement.lang = currentLang;
  renderParseInfo();
  renderSteps(lastState);
  renderSummary(lastState && lastState.lastSummary);
  refreshChip();
  if (lastState) setConn(connected ? 'on' : 'off',
    connected ? t('conn_connected', { mod: t('mode_' + currentMode), frame: targetFrameId }) : t('conn_offline'));
  else if (!connected) setConn('off', t('conn_offline'));
  if (lastState && lastState.botState === 'paused') $('btnPauseBot').textContent = t('btn_resume');
  else $('btnPauseBot').textContent = t('btn_pause');
}

function setLang(lang) {
  currentLang = lang;
  chrome.storage.local.set({ hmeLang: lang });
  applyI18n();
  sendAction('SET_LANG', { lang });
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  for (const p of ['run', 'training', 'rename', 'protect', 'logs']) {
    $('panel-' + p).classList.toggle('hidden', p !== name);
  }
}

let flashTimers = {};
function flashTab(name) {
  const btn = document.querySelector(`.tab[data-tab="${name}"]`);
  if (!btn || btn.classList.contains('active')) return;
  btn.classList.add('flash');
  clearTimeout(flashTimers[name]);
  flashTimers[name] = setTimeout(() => btn.classList.remove('flash'), 800);
}

// ---------------------------------------------------------------------------
// UI rendering
// ---------------------------------------------------------------------------
function syncSegs() {
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
  document.querySelectorAll('#trainModeSeg button').forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
}

function stepLabels(mode) {
  if (mode === 'rename') return [t('step_email'), t('step_label_input'), t('step_save')];
  return [t('step_email'), mode === 'delete' ? t('step_action_delete') : t('step_action_deactivate'), t('step_confirm')];
}

function renderSteps(st) {
  const mode = (st && st.mode) || currentMode;
  const keys = STEP_KEYS[mode] || STEP_KEYS.deactivate;
  const labels = stepLabels(mode);
  for (let i = 0; i < 3; i++) {
    const li = $('step' + (i + 1));
    const badge = $('badge' + (i + 1));
    $('stepLabel' + (i + 1)).textContent = labels[i];
    const isSet = st && st.selectors && st.selectors[keys[i]] && (st.trainingStep === 0 || st.trainingStep > i + 1);
    const isWaiting = st && st.trainingStep === i + 1;
    li.classList.toggle('done', !!isSet);
    li.classList.toggle('active', !!isWaiting);
    badge.textContent = isWaiting ? t('badge_waiting') : isSet ? t('badge_set') : t('badge_unset');
    badge.className = 'badge' + (isWaiting ? ' waiting' : isSet ? ' set' : '');
  }
}

function statusFor(st) {
  if (!connected || !st) return ['err', t('status_offline')];
  if (st.trainingStep > 0) return ['run', t('status_training')];
  if (st.botState === 'running' || st.botState === 'pausing') return ['run', t('status_running')];
  if (st.botState === 'paused') return ['warn', t('status_paused')];
  if (st.trained && st.trained[st.mode]) return ['ok', t('status_ready')];
  return ['warn', t('status_untrained')];
}

function refreshChip() {
  const [cls, label] = statusFor(lastState);
  const chip = $('statusChip');
  chip.className = 'chip ' + cls;
  $('statusChipText').textContent = label;
}

function updateUI(st) {
  if (!st) {
    lastState = null;
    refreshChip();
    refreshButtons();
    return;
  }
  lastState = st;
  currentMode = st.mode || currentMode;
  syncSegs();
  refreshChip();

  // run progress (deactivate/delete)
  const isRename = st.mode === 'rename';
  const running = st.botState !== 'idle';
  $('progressBox').classList.toggle('hidden', isRename || !running);
  $('renameProgress').classList.toggle('hidden', !isRename || !running);
  if (running) {
    const pct = st.limit ? Math.min(100, Math.round(st.progress / st.limit * 100)) : 0;
    if (isRename) {
      $('renameProgressText').textContent = `${st.progress} / ${st.limit}`;
      $('renameProgressPct').textContent = pct + '%';
      $('renameProgressFill').style.width = pct + '%';
    } else {
      $('progressText').textContent = `${st.progress} / ${st.limit}`;
      $('progressPct').textContent = pct + '%';
      $('progressFill').style.width = pct + '%';
      const s = st.stats || {};
      $('cntOk').textContent = s.processed || 0;
      $('cntSkip').textContent = (s.skippedFlagged || 0) + (s.skippedProtected || 0);
      $('cntFail').textContent = s.failed || 0;
      $('cntMismatch').textContent = s.mismatch || 0;
      $('cntMismatchBox').classList.toggle('hidden', !s.mismatch);
    }
    const cur = $('currentRow');
    cur.classList.toggle('hidden', !st.currentItem);
    if (st.currentItem) cur.textContent = t('current_prefix') + ' ' + st.currentItem;
  }

  renderResults(st.renameResults || {});
  renderSummary(st.lastSummary);
  renderSteps(st);

  // protection sync (avoid clobbering while typing)
  $('protectCountRun').textContent = (st.protectedEmails || []).length;
  $('protectNote').classList.toggle('hidden', st.mode !== 'delete');
  if (document.activeElement !== $('inputProtLabel')) $('inputProtLabel').value = st.protectedLabel || '';
  if (document.activeElement !== $('chkAutoProtect')) $('chkAutoProtect').checked = st.autoProtect !== false;
  renderProtList(st.protectedEmails || []);

  // Full rebuild only when the content-side buffer really differs from what's on screen.
  // Both sides cap at LOG_CAP; a mismatch after streaming appendLog() means a new session.
  const consoleEl = $('logConsole');
  if (st.logs && consoleEl.childElementCount !== st.logs.length) {
    consoleEl.innerHTML = '';
    for (const entry of st.logs.slice(-LOG_CAP)) appendLog(entry, true);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  refreshButtons();
}

function refreshButtons() {
  const st = lastState;
  const busy = st && st.botState !== 'idle';
  const trainedNow = st && st.trained && st.trained[currentMode];

  $('btnStartBot').disabled = !connected || busy || !trainedNow || currentMode === 'rename' || (st && st.trainingStep > 0);
  $('btnPauseBot').disabled = !connected || !busy || (st && (st.botState === 'paused' ? false : st.botState !== 'running'));
  $('btnPauseBot').textContent = st && st.botState === 'paused' ? t('btn_resume') : t('btn_pause');
  $('btnStopBot').disabled = !connected || !busy;

  $('btnStartTraining').disabled = !connected || busy || (st && st.trainingStep > 0);
  $('btnResetTraining').disabled = !connected || !(trainedNow) || (st && st.trainingStep > 0);

  const { valid } = parseEmailList($('txtTargets').value);
  const hasLabel = $('inputNewLabel').value.trim().length > 0;
  const renameTrained = st && st.trained && st.trained.rename;
  const renameBusy = st && st.botState !== 'idle' && st.mode === 'rename';
  $('btnStartRename').disabled = !connected || !renameTrained || !valid.length || !hasLabel || (st && st.botState !== 'idle');
  $('btnStopRename').disabled = !connected || !renameBusy;

  // mode segment locks while running
  document.querySelectorAll('#modeSeg button, #trainModeSeg button').forEach(b => { b.disabled = !!busy; });
}

function renderResults(results) {
  const box = $('renameResults');
  const entries = Object.entries(results || {});
  box.classList.toggle('hidden', entries.length === 0);
  const icons = { renamed: '✓', already: '⚠', notFound: '?', failed: '✗' };
  // content returns camelCase statuses; locale keys are snake_case
  const statusKey = s => (s === 'notFound' ? 'not_found' : s);
  box.innerHTML = '';
  for (const [email, status] of entries) {
    const row = document.createElement('div');
    row.className = 'res-row ' + status;
    const ico = document.createElement('span');
    ico.className = 'ico';
    ico.textContent = icons[status] || '·';
    const mail = document.createElement('span');
    mail.className = 'mail';
    mail.textContent = email;
    const stt = document.createElement('span');
    stt.className = 'st';
    stt.textContent = t('res_' + statusKey(status)) || status;
    row.append(ico, mail, stt);
    box.appendChild(row);
  }
}

function renderSummary(s) {
  const box = $('summaryBox');
  if (!s || !s.ts) { box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  const reasonKey = 'reason_' + (s.reason === 'goal' ? 'goal' : s.reason === 'exhausted' ? 'exhausted' : 'stopped');
  const when = new Date(s.ts).toLocaleString();
  box.innerHTML = '';
  const title = document.createElement('b');
  title.textContent = `${t('summary_title')} · ${t('mode_' + s.mode) || s.mode} · ${when}`;
  const line = document.createElement('div');
  line.textContent = `✓ ${s.processed} · ⛔ ${(s.skippedFlagged || 0) + (s.skippedProtected || 0)} · ✗ ${s.failed}` +
    (s.notFound ? ` · ? ${s.notFound}` : '') + (s.mismatch ? ` · ⊘ ${s.mismatch}` : '') +
    ` — ${t(reasonKey)}`;
  box.append(title, line);
}

function renderProtList(list) {
  const ul = $('protList');
  ul.innerHTML = '';
  $('protCount').textContent = list.length;
  $('protectCountRun').textContent = list.length;
  $('protEmpty').classList.toggle('hidden', list.length > 0);
  ul.classList.toggle('hidden', list.length === 0);
  for (const email of list) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'mail';
    span.textContent = email;
    const x = document.createElement('button');
    x.textContent = '✕';
    x.title = email;
    x.addEventListener('click', () => applyProtected(getProtected().filter(e => e !== email)));
    li.append(span, x);
    ul.appendChild(li);
  }
}

// Storage is the source of truth: lastState can be null (popup just opened) or
// stale, and a merge based on it would WIPE previously protected addresses.
let protectedCache = [];
function getProtected() {
  if (lastState && Array.isArray(lastState.protectedEmails)) protectedCache = lastState.protectedEmails;
  return protectedCache;
}
function applyProtected(list) {
  const clean = [...new Set(list.map(e => e.trim().toLowerCase()).filter(Boolean))];
  protectedCache = clean;
  chrome.storage.local.set({ hmeProtectedEmails: clean });
  if (lastState) lastState.protectedEmails = clean;
  renderProtList(clean);
  sendAction('SET_PROTECTED', { emails: clean });
}

function parseEmailList(raw) {
  const lines = String(raw || '').split(/[\n;]+/).flatMap(l => l.split(',')).map(s => s.trim().toLowerCase()).filter(Boolean);
  const valid = [], seen = new Set();
  let ignored = 0;
  for (const l of lines) {
    if (EMAIL_LINE_RE.test(l)) { if (!seen.has(l)) { seen.add(l); valid.push(l); } }
    else ignored++;
  }
  return { valid, ignored };
}

function renderParseInfo() {
  const raw = $('txtTargets').value;
  const info = $('parseInfo');
  if (!raw.trim()) { info.textContent = ''; return; }
  const { valid, ignored } = parseEmailList(raw);
  info.textContent = t('parse_valid', { valid: valid.length }) + (ignored ? ' · ' + t('parse_ignored', { n: ignored }) : '');
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------
function appendLog(entry, silent) {
  if (!entry) return;
  const consoleEl = $('logConsole');
  const div = document.createElement('div');
  div.className = 'log-entry ' + (entry.type || 'system');
  div.textContent = entry.text;
  consoleEl.appendChild(div);
  while (consoleEl.childElementCount > LOG_CAP) consoleEl.removeChild(consoleEl.firstChild);
  if (!silent) consoleEl.scrollTop = consoleEl.scrollHeight;
}
