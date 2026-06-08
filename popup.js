// popup.js - Coordinating popup UI with injected content script

const locales = {
  en: {
    status_idle: "Idle",
    status_training: "Training",
    status_running: "Running",
    status_paused: "Paused",
    status_offline: "Offline",
    status_ready: "Ready",
    status_untrained: "Untrained",
    title_setup: "1. Training Mode (Setup)",
    desc_setup: "Start training to teach the bot which elements to click in the iCloud UI.",
    btn_start_training: "Start Training",
    btn_reset_training: "Reset",
    badge_configured: "Configured",
    badge_waiting: "Waiting...",
    badge_not_configured: "Not Set",
    email_label: "Email Element",
    deactivate_btn_label: "Deactivate Button",
    delete_btn_label: "Delete Button",
    confirm_btn_label: "Confirm Button",
    title_panel: "2. Bot Control Panel",
    label_module: "Active Module",
    label_delay: "Delay (ms)",
    label_limit: "Limit (Count)",
    label_flags: "Skipped Emails (Blacklist Keywords)",
    btn_start_bot: "Start Bot",
    btn_pause_bot: "Pause",
    btn_stop_bot: "Stop",
    title_logs: "Process Logs",
    btn_clear_logs: "Clear",
    footer_text: "iCloud.com/icloudplus page must be active.",
    confirm_reset: "Are you sure you want to clear selector data for this module?",
    confirm_clear_logs: "Logs cleared."
  },
  tr: {
    status_idle: "Boşta",
    status_training: "Eğitimde",
    status_running: "Çalışıyor",
    status_paused: "Duraklatıldı",
    status_offline: "Çevrimdışı",
    status_ready: "Hazır",
    status_untrained: "Eğitilmedi",
    title_setup: "1. Eğitim Modu (Setup)",
    desc_setup: "iCloud arayüzündeki öğeleri bota öğretmek için eğitimi başlatın.",
    btn_start_training: "Eğitimi Başlat",
    btn_reset_training: "Sıfırla",
    badge_configured: "Tanımlandı",
    badge_waiting: "Bekleniyor...",
    badge_not_configured: "Seçilmedi",
    email_label: "E-posta Ögesi",
    deactivate_btn_label: "Devre Dışı Bırak Butonu",
    delete_btn_label: "Sil Butonu",
    confirm_btn_label: "Onay Butonu",
    title_panel: "2. Bot Kontrol Paneli",
    label_module: "Çalışma Modülü",
    label_delay: "Gecikme (ms)",
    label_limit: "Limit (Adet)",
    label_flags: "Atlanacak E-postalar (Kara Liste Kelimeleri)",
    btn_start_bot: "Botu Başlat",
    btn_pause_bot: "Duraklat",
    btn_stop_bot: "Durdur",
    title_logs: "İşlem Günlüğü (Logs)",
    btn_clear_logs: "Temizle",
    footer_text: "iCloud.com/icloudplus sayfasında açık olmalıdır.",
    confirm_reset: "Seçilen modüle ait eğitim verilerini sıfırlamak istediğinize emin misiniz?",
    confirm_clear_logs: "Günlük temizlendi."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnLangEN = document.getElementById('btnLangEN');
  const btnLangTR = document.getElementById('btnLangTR');
  const selectMode = document.getElementById('selectMode');
  const inputFlags = document.getElementById('inputFlags');
  const inputDelay = document.getElementById('inputDelay');
  const inputLimit = document.getElementById('inputLimit');
  
  const btnStartTraining = document.getElementById('btnStartTraining');
  const btnResetTraining = document.getElementById('btnResetTraining');
  
  const selEmail = document.getElementById('selEmail');
  const selDeactivate = document.getElementById('selDeactivate');
  const selConfirm = document.getElementById('selConfirm');
  
  const badgeEmail = document.getElementById('badgeEmail');
  const badgeDeactivate = document.getElementById('badgeDeactivate');
  const badgeConfirm = document.getElementById('badgeConfirm');
  
  const btnStartBot = document.getElementById('btnStartBot');
  const btnPauseBot = document.getElementById('btnPauseBot');
  const btnStopBot = document.getElementById('btnStopBot');
  
  const progressContainer = document.getElementById('progressContainer');
  const progressText = document.getElementById('progressText');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressPercent = document.getElementById('progressPercent');
  
  const logConsole = document.getElementById('logConsole');
  const btnClearLogs = document.getElementById('btnClearLogs');
  const botStatusBadge = document.getElementById('botStatusBadge');

  let currentLang = 'en';

  // Load cached settings from storage
  chrome.storage.local.get(['hmeFlaggedWords', 'hmeLastMode', 'hmeDelay', 'hmeLimit', 'hmeLang'], (result) => {
    if (result.hmeFlaggedWords) inputFlags.value = result.hmeFlaggedWords;
    if (result.hmeLastMode) selectMode.value = result.hmeLastMode;
    if (result.hmeDelay) inputDelay.value = result.hmeDelay;
    if (result.hmeLimit) inputLimit.value = result.hmeLimit;
    
    currentLang = result.hmeLang || 'en';
    translateUI(currentLang);
  });

  // Dynamic Translate UI Texts
  function translateUI(lang) {
    currentLang = lang;
    const t = locales[lang];
    
    // Language buttons active class toggle
    if (lang === 'en') {
      btnLangEN.classList.add('active');
      btnLangTR.classList.remove('active');
    } else {
      btnLangEN.classList.remove('active');
      btnLangTR.classList.add('active');
    }
    
    // Labels & Text nodes
    document.querySelector('.card:nth-of-type(2) h2').textContent = t.title_setup;
    document.querySelector('.card:nth-of-type(2) .card-desc').textContent = t.desc_setup;
    btnResetTraining.textContent = t.btn_reset_training;
    
    document.querySelector('#selEmail .label').textContent = t.email_label;
    document.querySelector('#selConfirm .label').textContent = t.confirm_btn_label;
    
    document.querySelector('.card:nth-of-type(3) h2').textContent = t.title_panel;
    document.querySelector('label[for="selectMode"]').textContent = t.label_module;
    document.querySelector('label[for="inputDelay"]').textContent = t.label_delay;
    document.querySelector('label[for="inputLimit"]').textContent = t.label_limit;
    document.querySelector('label[for="inputFlags"]').textContent = t.label_flags;
    
    btnPauseBot.textContent = t.btn_pause_bot;
    btnStopBot.textContent = t.btn_stop_bot;
    
    document.querySelector('.log-card h2').textContent = t.title_logs;
    btnClearLogs.textContent = t.btn_clear_logs;
    document.querySelector('.app-footer span').textContent = t.footer_text;
    
    // Update select option translations
    selectMode.options[0].text = lang === 'en' ? "Deactivate (Active ➔ Inactive)" : "Devre Dışı Bırak (Aktif ➔ Pasif)";
    selectMode.options[1].text = lang === 'en' ? "Permanently Delete (Inactive ➔ Delete)" : "Kalıcı Olarak Sil (Pasif ➔ Sil)";
    
    // Refresh status panel UI text values
    syncState();
  }

  // Language buttons change listeners
  btnLangEN.addEventListener('click', () => {
    chrome.storage.local.set({ hmeLang: 'en' });
    translateUI('en');
    sendAction('SET_LANG', { lang: 'en' });
  });

  btnLangTR.addEventListener('click', () => {
    chrome.storage.local.set({ hmeLang: 'tr' });
    translateUI('tr');
    sendAction('SET_LANG', { lang: 'tr' });
  });

  // Save changes to storage
  inputFlags.addEventListener('input', () => {
    chrome.storage.local.set({ hmeFlaggedWords: inputFlags.value });
    sendAction('UPDATE_SETTINGS', { flaggedWords: inputFlags.value });
  });

  selectMode.addEventListener('change', () => {
    chrome.storage.local.set({ hmeLastMode: selectMode.value });
    sendAction('SET_MODE', { mode: selectMode.value });
  });

  inputDelay.addEventListener('change', () => {
    chrome.storage.local.set({ hmeDelay: inputDelay.value });
  });

  inputLimit.addEventListener('change', () => {
    chrome.storage.local.set({ hmeLimit: inputLimit.value });
  });

  // Helper: Get active tab
  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  // Helper: Append log to console locally
  function addLogToConsole(type, text) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = text;
    logConsole.appendChild(entry);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  // Synchronize state with Content Script
  async function syncState() {
    const tab = await getActiveTab();
    if (!tab) return;
    
    if (!tab.url || !tab.url.includes('icloud.com')) {
      addLogToConsole('error', currentLang === 'en' ? 'Please open iCloud.com/icloudplus page.' : 'Lütfen iCloud.com/icloudplus sayfasını açın.');
      disableAllControls();
      return;
    }

    try {
      chrome.tabs.sendMessage(tab.id, { action: 'GET_STATE' }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (response) {
          // If content script has a different mode, align popup mode selector
          if (response.mode) {
            selectMode.value = response.mode;
            chrome.storage.local.set({ hmeLastMode: response.mode });
          }
          // Set initial settings to content script
          sendAction('UPDATE_SETTINGS', { flaggedWords: inputFlags.value });
          sendAction('SET_LANG', { lang: currentLang });
          updateUI(response);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Disable controls if not on iCloud
  function disableAllControls() {
    btnStartTraining.disabled = true;
    btnResetTraining.disabled = true;
    btnStartBot.disabled = true;
    btnPauseBot.disabled = true;
    btnStopBot.disabled = true;
    selectMode.disabled = true;
    inputFlags.disabled = true;
    
    const t = locales[currentLang];
    botStatusBadge.textContent = t.status_offline;
    botStatusBadge.className = "status-badge";
  }

  // Update UI Elements based on state object
  function updateUI(state) {
    if (!state) return;
    const t = locales[currentLang];

    // Update labels depending on the active Mode
    const isDeleteMode = state.mode === 'delete';
    document.querySelector('#selDeactivate .label').textContent = isDeleteMode ? t.delete_btn_label : t.deactivate_btn_label;

    // 1. Selector Badges & Items
    updateSelectorUI(selEmail, badgeEmail, state.selectors.email, 1, state.trainingStep);
    updateSelectorUI(selDeactivate, badgeDeactivate, state.selectors.deactivate, 2, state.trainingStep);
    updateSelectorUI(selConfirm, badgeConfirm, state.selectors.confirm, 3, state.trainingStep);

    // 2. Training Buttons State
    if (state.trainingStep > 0) {
      btnStartTraining.disabled = true;
      btnStartTraining.innerHTML = `<span class="btn-icon">🎯</span> ${t.status_training} ${state.trainingStep}...`;
      btnResetTraining.disabled = true;
      selectMode.disabled = true;
      botStatusBadge.textContent = t.status_training;
      botStatusBadge.className = "status-badge training";
    } else {
      btnStartTraining.disabled = false;
      btnStartTraining.innerHTML = `<span class="btn-icon">🎯</span> ${t.btn_start_training}`;
      btnResetTraining.disabled = !(state.selectors.email || state.selectors.deactivate || state.selectors.confirm);
      selectMode.disabled = (state.botState !== 'idle');
    }

    // 3. Automation Buttons State
    const isTrained = state.selectors.email && state.selectors.deactivate && state.selectors.confirm;
    
    if (state.botState === 'running') {
      btnStartBot.disabled = true;
      btnPauseBot.disabled = false;
      btnStopBot.disabled = false;
      btnStartTraining.disabled = true;
      botStatusBadge.textContent = t.status_running;
      botStatusBadge.className = "status-badge active";
      
      progressContainer.classList.remove('hidden');
    } else if (state.botState === 'paused') {
      btnStartBot.disabled = true;
      btnPauseBot.disabled = true;
      btnStopBot.disabled = false;
      btnStartTraining.disabled = true;
      botStatusBadge.textContent = t.status_paused;
      botStatusBadge.className = "status-badge paused";
      
      progressContainer.classList.remove('hidden');
    } else {
      // Idle
      btnStartBot.disabled = !isTrained;
      btnPauseBot.disabled = true;
      btnStopBot.disabled = true;
      if (state.trainingStep === 0) {
        botStatusBadge.textContent = isTrained ? t.status_ready : t.status_untrained;
        botStatusBadge.className = "status-badge";
      }
      
      progressContainer.classList.add('hidden');
    }

    // 4. Progress bar update
    if (state.botState !== 'idle') {
      const current = state.progress;
      const limit = state.limit;
      const percent = Math.min(100, Math.round((current / limit) * 100)) + '%';
      
      progressText.textContent = `${currentLang === 'en' ? 'Progress' : 'İlerleme'}: ${current} / ${limit}`;
      progressPercent.textContent = percent;
      progressBarFill.style.width = percent;
    }

    // 5. Sync Logs
    if (state.logs && state.logs.length > 0) {
      logConsole.innerHTML = '';
      state.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-entry ${log.type}`;
        div.textContent = log.text;
        logConsole.appendChild(div);
      });
      logConsole.scrollTop = logConsole.scrollHeight;
    }
  }

  function updateSelectorUI(itemEl, badgeEl, selectorVal, stepNum, currentStep) {
    const t = locales[currentLang];
    itemEl.className = "selector-item";
    if (selectorVal) {
      itemEl.classList.add("configured");
      badgeEl.textContent = t.badge_configured;
    } else if (currentStep === stepNum) {
      itemEl.classList.add("active");
      badgeEl.textContent = t.badge_waiting;
    } else {
      badgeEl.textContent = t.badge_not_configured;
    }
  }

  // Send Action to Content Script
  async function sendAction(action, extraData = {}) {
    const tab = await getActiveTab();
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { action, ...extraData }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Message response error:", chrome.runtime.lastError);
        return;
      }
      if (response) {
        updateUI(response.state || response);
      }
    });
  }

  // Button Listeners
  btnStartTraining.addEventListener('click', () => {
    sendAction('START_TRAINING');
  });

  btnResetTraining.addEventListener('click', () => {
    const t = locales[currentLang];
    if (confirm(t.confirm_reset)) {
      sendAction('RESET_TRAINING');
    }
  });

  btnStartBot.addEventListener('click', () => {
    const limit = parseInt(inputLimit.value) || 50;
    const delay = parseInt(inputDelay.value) || 1500;
    // Ensure settings are synced
    sendAction('UPDATE_SETTINGS', { flaggedWords: inputFlags.value });
    sendAction('START_BOT', { limit, delay });
  });

  btnPauseBot.addEventListener('click', () => {
    sendAction('PAUSE_BOT');
  });

  btnStopBot.addEventListener('click', () => {
    sendAction('STOP_BOT');
  });

  btnClearLogs.addEventListener('click', () => {
    const t = locales[currentLang];
    logConsole.innerHTML = `<div class="log-entry system">${t.confirm_clear_logs}</div>`;
  });

  // Listen for background state/log updates from Content Script
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'STATE_UPDATE') {
      updateUI(request.state);
    } else if (request.action === 'LOG_UPDATE') {
      const entry = document.createElement('div');
      entry.className = `log-entry ${request.entry.type}`;
      entry.textContent = request.entry.text;
      logConsole.appendChild(entry);
      logConsole.scrollTop = logConsole.scrollHeight;
    }
  });

  // Initial state check
  syncState();
});
