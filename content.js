// iCloud Hide My Email Bulk Deactivator Content Script
console.log("HME Deactivator content script loaded!");

const locales = {
  en: {
    system_loaded: "Saved selectors loaded. Ready.",
    mod_loaded: "Module: {mod} loaded.",
    log_reset: "Selectors cleared for this module.",
    log_cancel: "Training cancelled.",
    log_start: "Training started. Click on any email element in your list.",
    email_selected: "Email element selected: ",
    btn_deactivate_selected: "Deactivate button selected: ",
    btn_delete_selected: "Delete button selected: ",
    btn_confirm_selected: "Confirm button selected: ",
    training_saved: "Training completed and selectors saved!",
    step_init: "Step {step} starting...",
    err_deactivate_not_found: "Error: Process button in details panel not found. Skipping step.",
    err_confirm_not_found: "Error: Confirm button in dialog not found. Skipping step.",
    success_step: "Deactivated: Email {step} completed.",
    success_step_delete: "Permanently Deleted: Email {step} completed.",
    success_goal: "Goal reached! Successfully processed {count} emails.",
    log_scrolling_filtered: "All visible emails contain blacklisted keywords. Scrolling down...",
    log_scrolling_empty: "Email element not found. Scrolling down...",
    bot_started: "Bot started.",
    bot_paused: "Bot paused.",
    bot_resumed: "Bot resumed.",
    bot_stopped: "Bot stopped.",
    
    // Floating overlay translations
    overlay_header: "🛡️ HME Bot",
    overlay_training: "🎯 Training Bot...",
    overlay_running: "⚡ Running...",
    overlay_paused: "⏸️ Paused",
    overlay_deactivating: "⚡ Deactivating...",
    overlay_deleting: "⚡ Deleting...",
    overlay_cancel: "Cancel Training",
    overlay_pause: "Pause",
    overlay_resume: "Resume",
    overlay_stop: "Stop",
    overlay_trained_ready: "✅ Trained. Start from the extension popup.",
    overlay_untrained: "❌ Untrained. Click 'Start Training' in popup.",
    
    inst_deactivate: [
      "",
      "1. Click on any active email address in the list.",
      "2. Click the 'Deactivate Email Address' button in the details panel.",
      "3. Click the red 'Deactivate' button in the confirmation pop-up."
    ],
    inst_delete: [
      "",
      "1. Click on any inactive email address in the list.",
      "2. Click the 'Delete Email Address' button in the details panel.",
      "3. Click the red 'Delete' button in the confirmation pop-up."
    ]
  },
  tr: {
    system_loaded: "Kayıtlı seçiciler yüklendi. Hazır.",
    mod_loaded: "Mod: {mod} yüklendi.",
    log_reset: "Bu modüle ait seçiciler sıfırlandı.",
    log_cancel: "Eğitim iptal edildi.",
    log_start: "Eğitim başladı. E-posta listesindeki ilk elemana tıklayın.",
    email_selected: "E-posta ögesi seçildi: ",
    btn_deactivate_selected: "Devre Dışı Bırak butonu seçildi: ",
    btn_delete_selected: "Sil butonu seçildi: ",
    btn_confirm_selected: "Onay butonu seçildi: ",
    training_saved: "Eğitim tamamlandı ve seçiciler kaydedildi!",
    step_init: "Adım {step} başlatılıyor...",
    err_deactivate_not_found: "Hata: Detay panelindeki işlem butonu bulunamadı. Adım atlanıyor.",
    err_confirm_not_found: "Hata: Onay penceresindeki kırmızı buton bulunamadı. Adım atlanıyor.",
    success_step: "Devre Dışı Bırakıldı: E-posta {step} tamamlandı.",
    success_step_delete: "Kalıcı Olarak Silindi: E-posta {step} tamamlandı.",
    success_goal: "Hedefe ulaşıldı! Toplam {count} işlem başarıyla tamamlandı.",
    log_scrolling_filtered: "Görünürdeki tüm e-postalar kara listedeki kelimeleri içeriyor. Aşağı kaydırılıyor...",
    log_scrolling_empty: "E-posta ögesi bulunamadı. Sayfa aşağı kaydırılıyor...",
    bot_started: "Bot başlatıldı.",
    bot_paused: "Bot duraklatıldı.",
    bot_resumed: "Bot devam ediyor...",
    bot_stopped: "Bot durduruldu.",
    
    // Floating overlay translations
    overlay_header: "🛡️ HME Bot",
    overlay_training: "🎯 Bot Eğitiminde...",
    overlay_running: "⚡ Çalışıyor...",
    overlay_paused: "⏸️ Bot Duraklatıldı",
    overlay_deactivating: "⚡ Devre Dışı Bırakılıyor...",
    overlay_deleting: "⚡ Kalıcı Siliniyor...",
    overlay_cancel: "Eğitimi İptal Et",
    overlay_pause: "Duraklat",
    overlay_resume: "Devam",
    overlay_stop: "Durdur",
    overlay_trained_ready: "✅ Bot eğitildi. Kontrol panelinden başlatın.",
    overlay_untrained: "❌ Eğitilmemiş. Eğitimi Başlat'a tıklayın.",
    
    inst_deactivate: [
      "",
      "1. Listeden devre dışı bırakılacak aktif bir e-postaya tıklayın.",
      "2. Detay bölmesindeki 'Devre Dışı Bırak' butonuna tıklayın.",
      "3. Çıkan onay penceresindeki kırmızı 'Devre Dışı Bırak' butonuna tıklayın."
    ],
    inst_delete: [
      "",
      "1. Pasif listeden tamamen silinecek bir e-postaya tıklayın.",
      "2. Detay bölmesindeki 'E-posta Adresini Sil' butonuna tıklayın.",
      "3. Çıkan onay penceresindeki kırmızı 'Sil' butonuna tıklayın."
    ]
  }
};

// State Object
let state = {
  lang: 'en',          // 'en' or 'tr'
  mode: 'deactivate',  // 'deactivate' or 'delete'
  selectors: {
    email: null,       // { selector, text, tagName }
    deactivate: null,  // { selector, text, tagName }
    confirm: null      // { selector, text, tagName }
  },
  cachedSelectors: {
    deactivate: { email: null, deactivate: null, confirm: null },
    delete: { email: null, deactivate: null, confirm: null }
  },
  trainingStep: 0,     // 0: idle, 1: email, 2: deactivate, 3: confirm
  botState: 'idle',    // 'idle', 'running', 'paused'
  limit: 50,
  delay: 1500,
  progress: 0,
  logs: [],
  flaggedWords: []     // List of lowercased blacklisted words
};

// UI Elements
let overlayEl = null;

// Get translation helper
function getT() {
  return locales[state.lang];
}

// Load saved selectors from storage
chrome.storage.local.get([
  'hmeSelectors_deactivate', 
  'hmeSelectors_delete', 
  'hmeLastMode', 
  'hmeFlaggedWords',
  'hmeLang'
], (result) => {
  if (result.hmeLang) {
    state.lang = result.hmeLang;
  }
  if (result.hmeLastMode) {
    state.mode = result.hmeLastMode;
  }
  if (result.hmeSelectors_deactivate) {
    state.cachedSelectors.deactivate = result.hmeSelectors_deactivate;
  }
  if (result.hmeSelectors_delete) {
    state.cachedSelectors.delete = result.hmeSelectors_delete;
  }
  
  // Set current selectors based on active mode
  state.selectors = state.cachedSelectors[state.mode] || { email: null, deactivate: null, confirm: null };
  
  if (result.hmeFlaggedWords) {
    state.flaggedWords = result.hmeFlaggedWords
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
  }
  
  const modName = state.mode === 'deactivate' 
    ? (state.lang === 'en' ? 'Deactivate' : 'Devre Dışı Bırak') 
    : (state.lang === 'en' ? 'Delete' : 'Kalıcı Olarak Sil');
  addLog('system', getT().system_loaded + " " + getT().mod_loaded.replace('{mod}', modName));
  updateOverlay();
});

// Helper: Log message
function addLog(type, text) {
  const timestamp = new Date().toLocaleTimeString();
  const entry = { type, text: `[${timestamp}] ${text}` };
  state.logs.push(entry);
  if (state.logs.length > 100) state.logs.shift(); // Limit log size
  
  // Try to notify popup
  try {
    chrome.runtime.sendMessage({ action: 'LOG_UPDATE', entry });
  } catch(e) {
    // Popup might be closed
  }
  
  updateOverlay();
}

// Selector generator helper
function getElementInfo(element) {
  if (!element) return null;
  
  // Try to generate unique selector
  let selector = '';
  if (element.id) {
    selector = `#${element.id}`;
  } else {
    // Check for useful attributes
    for (let attr of ['aria-label', 'role', 'data-testid', 'placeholder']) {
      if (element.hasAttribute(attr)) {
        selector = `${element.tagName.toLowerCase()}[${attr}="${element.getAttribute(attr)}"]`;
        break;
      }
    }
    
    // Fallback to structural path
    if (!selector) {
      const path = [];
      let current = element;
      while (current && current !== document.body && current.parentElement) {
        let tag = current.tagName.toLowerCase();
        let siblingIndex = 1;
        let sibling = current;
        while (sibling = sibling.previousElementSibling) {
          if (sibling.tagName === current.tagName) {
            siblingIndex++;
          }
        }
        
        let classStr = '';
        if (current.classList.length > 0) {
          const cleanClasses = Array.from(current.classList)
            .filter(c => !/\d/.test(c) && c.length > 2);
          if (cleanClasses.length > 0) {
            classStr = '.' + cleanClasses.join('.');
          }
        }
        
        path.unshift(`${tag}${classStr}:nth-of-type(${siblingIndex})`);
        current = current.parentElement;
      }
      selector = path.join(' > ');
    }
  }

  return {
    selector: selector,
    text: element.textContent ? element.textContent.trim().substring(0, 40) : '',
    tagName: element.tagName
  };
}

// Finder helper
function findElement(config) {
  if (!config) return null;
  
  // 1. Try absolute CSS selector
  if (config.selector) {
    try {
      const el = document.querySelector(config.selector);
      if (el) return el;
    } catch(e) {}
  }
  
  // 2. Try tag and exact text match
  if (config.tagName && config.text) {
    const elements = document.querySelectorAll(config.tagName);
    for (let el of elements) {
      if (el.textContent.trim().includes(config.text)) {
        return el;
      }
    }
  }
  
  // 3. Fallback: Search inside buttons or links for containing text
  if (config.text) {
    const all = document.querySelectorAll('button, div, [role="button"], span');
    for (let el of all) {
      if (el.textContent.trim().toLowerCase().includes(config.text.toLowerCase())) {
        return el;
      }
    }
  }
  
  return null;
}

// Inject Floating UI Overlay
function createOverlay() {
  if (overlayEl) return;
  
  overlayEl = document.createElement('div');
  overlayEl.id = 'hme-floating-overlay';
  overlayEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 280px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    z-index: 999999;
    padding: 12px;
    font-family: 'Outfit', sans-serif, system-ui;
    color: #fff;
    cursor: move;
    user-select: none;
    transition: opacity 0.3s ease;
  `;
  
  // Make it draggable
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  overlayEl.addEventListener('mousedown', (e) => {
    const target = (e.composedPath && e.composedPath()[0]) || e.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') return;
    isDragging = true;
    offsetX = e.clientX - overlayEl.getBoundingClientRect().left;
    offsetY = e.clientY - overlayEl.getBoundingClientRect().top;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    overlayEl.style.left = (e.clientX - offsetX) + 'px';
    overlayEl.style.top = (e.clientY - offsetY) + 'px';
    overlayEl.style.right = 'auto';
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  document.body.appendChild(overlayEl);
  updateOverlay();
}

// Update floating overlay UI
function updateOverlay() {
  if (!overlayEl) return;
  const t = getT();
  
  let headerText = t.overlay_header;
  let statusColor = "#889096";
  let contentHtml = "";
  
  if (state.trainingStep > 0) {
    headerText = t.overlay_training;
    statusColor = "#0072f5";
    
    let instructions = state.mode === 'delete' ? t.inst_delete : t.inst_deactivate;
    contentHtml = `
      <div style="font-size: 0.8rem; line-height: 1.4; color: #a2a8d3; margin-bottom: 8px;">
        ${instructions[state.trainingStep]}
      </div>
      <button id="overlay-cancel-training" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.1); color: #fff; font-size: 0.75rem; cursor: pointer;">${t.overlay_cancel}</button>
    `;
  } else if (state.botState === 'running' || state.botState === 'paused') {
    const isDelete = state.mode === 'delete';
    headerText = state.botState === 'running' 
      ? (isDelete ? t.overlay_deleting : t.overlay_deactivating) 
      : t.overlay_paused;
    statusColor = state.botState === 'running' ? "#17c964" : "#f5a524";
    const percent = Math.round((state.progress / state.limit) * 100);
    
    contentHtml = `
      <div style="font-size: 0.75rem; color: #a2a8d3; margin-bottom: 4px;">${state.lang === 'en' ? 'Mode' : 'Mod'}: ${isDelete ? (state.lang === 'en' ? 'Permanent Delete' : 'Kalıcı Silme') : (state.lang === 'en' ? 'Deactivate' : 'Devre Dışı Bırakma')}</div>
      <div style="font-size: 0.8rem; margin-bottom: 6px; display: flex; justify-content: space-between;">
        <span>${state.lang === 'en' ? 'Progress' : 'İlerleme'}: ${state.progress} / ${state.limit}</span>
        <span>${percent}%</span>
      </div>
      <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 10px;">
        <div style="height: 100%; width: ${percent}%; background: linear-gradient(90deg, #0072f5, #17c964); border-radius: 3px;"></div>
      </div>
      <div style="display: flex; gap: 6px;">
        ${state.botState === 'running' 
          ? `<button id="overlay-pause" style="flex: 1; padding: 6px; border-radius: 6px; border: none; background: #f5a524; color: #fff; font-size: 0.75rem; font-weight:600; cursor: pointer;">${t.overlay_pause}</button>`
          : `<button id="overlay-resume" style="flex: 1; padding: 6px; border-radius: 6px; border: none; background: #17c964; color: #fff; font-size: 0.75rem; font-weight:600; cursor: pointer;">${t.overlay_resume}</button>`
        }
        <button id="overlay-stop" style="flex: 1; padding: 6px; border-radius: 6px; border: none; background: #f31260; color: #fff; font-size: 0.75rem; font-weight:600; cursor: pointer;">${t.overlay_stop}</button>
      </div>
    `;
  } else {
    // Idle
    const trained = state.selectors.email && state.selectors.deactivate && state.selectors.confirm;
    contentHtml = `
      <div style="font-size: 0.75rem; color: #889096; margin-bottom: 8px;">
        ${state.lang === 'en' ? 'Mode' : 'Mod'}: <b>${state.mode === 'deactivate' ? (state.lang === 'en' ? 'Deactivation' : 'Devre Dışı Bırakma') : (state.lang === 'en' ? 'Deletion' : 'Kalıcı Silme')}</b><br>
        ${trained ? t.overlay_trained_ready : t.overlay_untrained}
      </div>
    `;
  }
  
  overlayEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px; margin-bottom: 8px;">
      <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">${headerText}</span>
      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 8px ${statusColor}"></span>
    </div>
    ${contentHtml}
  `;
  
  // Attach overlay button listeners
  const btnCancelTraining = overlayEl.querySelector('#overlay-cancel-training');
  if (btnCancelTraining) btnCancelTraining.onclick = () => handleCancelTraining();
  
  const btnPause = overlayEl.querySelector('#overlay-pause');
  if (btnPause) btnPause.onclick = () => pauseBot();
  
  const btnResume = overlayEl.querySelector('#overlay-resume');
  if (btnResume) btnResume.onclick = () => resumeBot();
  
  const btnStop = overlayEl.querySelector('#overlay-stop');
  if (btnStop) btnStop.onclick = () => stopBot();
}

// Helper to find the nearest interactive parent
function getInteractiveTarget(element) {
  let current = element;
  while (current && current !== document.body && current.parentElement) {
    if (current.tagName) {
      const tag = current.tagName.toLowerCase();
      const role = current.getAttribute('role');
      if (
        tag === 'button' || 
        tag === 'a' || 
        tag === 'li' || 
        role === 'button' || 
        current.classList.contains('button') || 
        current.onclick
      ) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return element;
}

// Training Logic: Handle clicks on page
function pageClickHandler(e) {
  if (state.trainingStep === 0) return;
  const t = getT();
  
  // Resolve actual target even if inside Shadow DOM
  const target = (e.composedPath && e.composedPath()[0]) || e.target;
  
  // Avoid capturing clicks on our floating overlay
  if (overlayEl && overlayEl.contains(target)) return;
  
  // Do NOT preventDefault or stopPropagation to avoid breaking iCloud's framework logic
  const interactiveTarget = getInteractiveTarget(target);
  const info = getElementInfo(interactiveTarget);
  
  if (state.trainingStep === 1) {
    state.selectors.email = info;
    addLog('success', t.email_selected + `"${info.text || info.selector}"`);
    state.trainingStep = 2;
    updateOverlay();
  } else if (state.trainingStep === 2) {
    state.selectors.deactivate = info;
    const btnLabel = state.mode === 'delete' ? t.btn_delete_selected : t.btn_deactivate_selected;
    addLog('success', btnLabel + `"${info.text || info.selector}"`);
    state.trainingStep = 3;
    updateOverlay();
  } else if (state.trainingStep === 3) {
    state.selectors.confirm = info;
    addLog('success', t.btn_confirm_selected + `"${info.text || info.selector}"`);
    
    // Save to storage
    state.cachedSelectors[state.mode] = { ...state.selectors };
    const storageKey = `hmeSelectors_${state.mode}`;
    chrome.storage.local.set({ [storageKey]: state.selectors }, () => {
      addLog('success', t.training_saved);
    });
    
    state.trainingStep = 0;
    document.removeEventListener('click', pageClickHandler, true);
    updateOverlay();
  }
  
  // Send state update to popup
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

function startTraining() {
  state.trainingStep = 1;
  state.selectors = { email: null, deactivate: null, confirm: null };
  createOverlay();
  addLog('info', getT().log_start);
  document.addEventListener('click', pageClickHandler, true);
}

function handleCancelTraining() {
  state.trainingStep = 0;
  document.removeEventListener('click', pageClickHandler, true);
  addLog('warning', getT().log_cancel);
  
  // Restore previously saved selectors for active mode
  state.selectors = state.cachedSelectors[state.mode] || { email: null, deactivate: null, confirm: null };
  updateOverlay();
  
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

function resetTraining() {
  state.selectors = { email: null, deactivate: null, confirm: null };
  state.cachedSelectors[state.mode] = { email: null, deactivate: null, confirm: null };
  
  const storageKey = `hmeSelectors_${state.mode}`;
  chrome.storage.local.remove([storageKey], () => {
    addLog('system', getT().log_reset);
    updateOverlay();
  });
}

// Automation execution loop
let botTimeoutId = null;

async function runAutomationStep() {
  if (state.botState !== 'running') return;
  const t = getT();
  
  if (state.progress >= state.limit) {
    addLog('success', t.success_goal.replace('{count}', state.progress));
    stopBot();
    return;
  }
  
  addLog('info', t.step_init.replace('{step}', state.progress + 1));
  
  // 1. Find and click active email (filtering flagged keywords)
  let emailEl = null;
  if (state.selectors.email && state.selectors.email.selector) {
    try {
      const allEmails = document.querySelectorAll(state.selectors.email.selector);
      if (allEmails.length > 0) {
        for (let el of allEmails) {
          const text = el.textContent.toLowerCase();
          const isFlagged = state.flaggedWords.some(word => text.includes(word));
          if (!isFlagged) {
            emailEl = el;
            break;
          } else {
            console.log(`Filtered (Skipped): ${el.textContent.trim()}`);
          }
        }
      }
    } catch(err) {
      console.error(err);
    }
  }
  
  // If still not found, search via text-based method if selectors failed
  if (!emailEl && state.selectors.email) {
    // If we have elements matching the selector but they are ALL flagged, scroll down
    const allEmails = document.querySelectorAll(state.selectors.email.selector);
    if (allEmails.length > 0) {
      addLog('warning', t.log_scrolling_filtered);
      window.scrollBy(0, 300);
      const lists = document.querySelectorAll('div[class*="list"], div[class*="scroll"], ul');
      for (let l of lists) {
        l.scrollTop += 300;
      }
      botTimeoutId = setTimeout(runAutomationStep, state.delay);
      return;
    }
  }

  // General fallback if no emails found
  if (!emailEl) {
    addLog('warning', t.log_scrolling_empty);
    window.scrollBy(0, 300);
    const lists = document.querySelectorAll('div[class*="list"], div[class*="scroll"], ul');
    for (let l of lists) {
      l.scrollTop += 300;
    }
    botTimeoutId = setTimeout(runAutomationStep, state.delay);
    return;
  }
  
  emailEl.scrollIntoView({ block: 'center' });
  emailEl.click();
  addLog('info', `"${emailEl.textContent.trim()}" ${state.lang === 'en' ? 'clicked. Waiting for details...' : 'tıklandı. Detaylar bekleniyor...'}`);
  
  // Wait for details panel
  await new Promise(r => setTimeout(r, state.delay));
  if (state.botState !== 'running') return;
  
  // 2. Find and click Deactivate/Delete Button
  let deactivateEl = findElement(state.selectors.deactivate);
  if (!deactivateEl) {
    addLog('error', t.err_deactivate_not_found);
    botTimeoutId = setTimeout(runAutomationStep, state.delay);
    return;
  }
  deactivateEl.click();
  addLog('info', state.lang === 'en' ? 'Process button clicked. Waiting for confirmation dialog...' : 'İşlem butonuna tıklandı. Onay penceresi bekleniyor...');
  
  // Wait for confirmation popup
  await new Promise(r => setTimeout(r, Math.max(state.delay, 1000)));
  if (state.botState !== 'running') return;
  
  // 3. Find and click Confirm Button
  let confirmEl = findElement(state.selectors.confirm);
  if (!confirmEl) {
    addLog('error', t.err_confirm_not_found);
    botTimeoutId = setTimeout(runAutomationStep, state.delay);
    return;
  }
  confirmEl.click();
  
  const successMsg = state.mode === 'delete' ? t.success_step_delete : t.success_step;
  addLog('success', successMsg.replace('{step}', state.progress + 1));
  state.progress++;
  
  // Wait for modal to close and update DOM
  await new Promise(r => setTimeout(r, Math.max(state.delay, 1500)));
  
  // Send status update to popup
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
  
  // Loop
  runAutomationStep();
}

function startBot(limit, delay) {
  if (!state.selectors.email || !state.selectors.deactivate || !state.selectors.confirm) {
    addLog('error', state.lang === 'en' ? 'Error: Cannot start bot. Complete training for this module first.' : 'Hata: Bot başlatılamıyor. Önce bu modülün eğitimini tamamlamalısınız.');
    return;
  }
  
  createOverlay();
  state.botState = 'running';
  state.limit = parseInt(limit) || 50;
  state.delay = parseInt(delay) || 1500;
  state.progress = 0;
  
  addLog('info', getT().bot_started + ` Limit: ${state.limit}, Delay: ${state.delay}ms`);
  runAutomationStep();
  
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

function pauseBot() {
  state.botState = 'paused';
  if (botTimeoutId) clearTimeout(botTimeoutId);
  addLog('warning', getT().bot_paused);
  
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

function resumeBot() {
  state.botState = 'running';
  addLog('info', getT().bot_resumed);
  runAutomationStep();
  
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

function stopBot() {
  state.botState = 'idle';
  if (botTimeoutId) clearTimeout(botTimeoutId);
  addLog('system', getT().bot_stopped);
  
  try {
    chrome.runtime.sendMessage({ action: 'STATE_UPDATE', state });
  } catch(err) {}
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_TRAINING') {
    startTraining();
    sendResponse({ status: 'ok', state });
  } 
  else if (request.action === 'RESET_TRAINING') {
    resetTraining();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'START_BOT') {
    startBot(request.limit, request.delay);
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'PAUSE_BOT') {
    pauseBot();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'RESUME_BOT') {
    resumeBot();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'STOP_BOT') {
    stopBot();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'SET_MODE') {
    state.mode = request.mode;
    state.selectors = state.cachedSelectors[state.mode] || { email: null, deactivate: null, confirm: null };
    const modName = state.mode === 'deactivate' 
      ? (state.lang === 'en' ? 'Deactivate' : 'Devre Dışı Bırak') 
      : (state.lang === 'en' ? 'Delete' : 'Kalıcı Olarak Sil');
    addLog('system', getT().mod_loaded.replace('{mod}', modName));
    updateOverlay();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'SET_LANG') {
    state.lang = request.lang;
    updateOverlay();
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'UPDATE_SETTINGS') {
    if (request.flaggedWords !== undefined) {
      state.flaggedWords = request.flaggedWords
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
    }
    sendResponse({ status: 'ok', state });
  }
  else if (request.action === 'GET_STATE') {
    createOverlay(); // Ensure overlay is present
    sendResponse(state);
  }
  return true; // Keep message channel open
});
