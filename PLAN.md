# PLAN — Bugfix + QoL + 2 Yeni Feature

> Durum: TAMAMLANDI (2026-09-29). Faz 0-5 kod + otomatik E2E testleri bitti; gerçek-site manuel checklist (M1-M7) kullanıcıda. Kararlar: UI = modern koyu minimal · koruma = yalnız delete modu · rename sonrası otomatik koruma = açık.

## 0. Bağlam ve doğrulanmış gerçekler

**Kullanıcı raporları:**
- Eklenti son kullanımda çalışıyordu; bazı özellikler bozuk, arayüz kötü.
- İşlem başlatınca **2 kutu (overlay)** açılıyor: birinde progress var, diğeri boş.

**Kök neden (2 kutu) — statik analizle doğrulandı:**
`manifest.json` → `all_frames: true` + `popup.js sendAction()` → `chrome.tabs.sendMessage(tabId, msg)` **frameId'siz** = mesaj TÜM icloud.com frame'lerine yayınlanır. iCloud, HME uygulamasını iframe içinde sunar:
- `GET_STATE` her frame'de `createOverlay()` çağırır (`content.js:731-734`) → her frame kendi kutusunu çizer.
- `START_BOT` her frame'de ayrı bot instance başlatır. Liste iframe'de olduğu için sadece onun progress'i artar; ana frame "eleman bulunamadı → scroll → tekrar" **sonsuz döngüsüne** girer (`content.js:573-582`, boş kutunun kaynağı).
- Her iki frame `STATE_UPDATE` yayınladığı için popup progress'i çakışır/titrer.

**Apple Support ile doğrulanan HME sayfa yapısı** (support.apple.com/en-ca/guide/icloud/mm1a876f7aed):
- Tek sayfa, tek scroll: üstte "N active email addresses" bölümü, "Forward to", altta "N inactive email addresses" bölümü. Tab/ayrı sayfa YOK.
- Detay paneli: `Label` (düzenlenebilir), `Email`, `Note`, `Copy email address`, `Save changes`, `Deactivate email address`. Pasif öğelerde: `Reactivate address`, `Delete address`.
- **Adresler label'a göre alfabetik sıralanır** → rename sonrası liste DOM'da yeniden sıralanır; bot her hedefte DOM'u yeniden sorgulamalı (queue e-posta bazlı, sıradan bağımsız).

**Analizde doğrulanan diğer bug'lar:**
1. 🔴 `popup.js:133-140` `.card:nth-of-type(2/3)` indeks kayması → `translateUI` içinde `TypeError: Cannot set properties of null` (headless Chromium'da reproduce edildi). EN modda arayüz çoğunlukla Türkçe kalır, başlıklar yanlış karta yazılır, eğitim kartı hiç çevrilmez.
2. 🔴 Liste bitince otomatik durma yok → sonsuz scroll döngüsü.
3. 🟠 Başarı doğrulaması yok: confirm tıklanınca `progress++`; dialog kapandı mı / öğe listeden düştü mü kontrol edilmez. Retry yok.
4. 🟠 Blacklist kaba: tüm `textContent` üzerinde lowercase substring; exact-e-posta ve label bazlı koruma yok.
5. 🟠 Adım ortasında pause → onay tıklanmaz, dialog açık kalır; resume adımı baştan tetikler (çift tıklama riski).
6. 🟡 Clear Logs sadece popup DOM'unu temizler; `content.js state.logs` kalır → sync'te geri gelir.
7. 🟡 Eğitimli "email öğesi" seçicisi hem aktif hem pasif bölüm öğelerini eşleştirir → deactivate modunda pasif öğeye tıklanıp işlem butonu bulunamayabilir (findElement text-fallback yanlış eleman seçebilir). "Özelliklerin bazıları bozuk" raporunun olası kaynağı.
8. 🟡 Manifest'te icon yok; background/service worker yok → sayfa yenilenince bot state uçar.

**Varsayımlar (A):**
- **A1:** "silinenler" = **Inactive (pasif) bölümü**. Kalıcı silinmiş adresler iCloud'da yoktur, yeniden adlandırılamaz.
- **A2 (karar):** Koruma (protected label + protected liste) **yalnız delete modunda** atlanır; deactivate modu korumaya bakmaz (blacklist keyword'ü her iki modda geçerli kalır).
- **A3:** Rename de mevcut **eğitilebilir seçici motoruyla** yapılır (özel Apple API'si reddedildi: private endpoint, oturum token'ları (SCNT/X-Apple-I-MD), kırılganlık, kapsam dışı risk).
- **A4 (karar):** UI yönü: **modern koyu minimal** — sade, yüksek kontrast, glassmorphism yok.

---

## 1. Fazlar

### Faz 0 — Teşhis + test altyapısı
**Amaç:** bug'ları otomatik reproduce eden, sonraki her fazı doğrulayan harness.

1. `tests/mock-icloud/` — gerçek HME sayfasını taklit eden mock:
   - `index.html` (ana frame) + iframe içinde `app.html` (HME UI) → **2 kutu bug'ını birebir reproduce eder**.
   - 40 öğe: 25 aktif / 15 pasif bölüm; scroll'da lazy-load (20'şerli, SONLU); öğe = label + e-posta + tarih.
   - Detay paneli (async 300ms), confirm modal, `Label` input + `Save changes` (kayıtta alfabetik re-sort), `Deactivate`/`Delete`/`Reactivate`.
   - Bazı öğeler önceden `sakın silme` label'lı; bazıları blacklist kelimeli.
   - Input, framework benzeri `input` event dinleyicisiyle (native setter zorunluluğunu test eder).
2. `tests/build-test-ext.mjs` — repo kaynakları + `http://127.0.0.1/*` match'li test manifesti → `tests/dist-ext/` (shipping manifest kirlenmez).
3. Chromium'u `--load-extension=tests/dist-ext` ile başlat (browser tooling, `app.path` + args); popup'ı `chrome-extension://<id>/popup.html` sekmesi olarak sür; aktif sekme mock sayfa.
4. Popup regresyon testleri Node stub yerine **gerçek extension context'te** koşulur (`chrome-extension://<id>/popup.html` sekmesi + browser tooling) — daha yüksek fidelity, ayrı harness gereksiz.
5. **Gerçek DOM teşhisi:** kullanıcı relay oturumuyla (izinle) veya teşhis snippet'i ile gerçek iCloud HME DOM'u map edilir → frame yapısı, liste container seçicileri, label input tipi (`<input>` mi contenteditable mı), lazy-load davranışı. Mock ve detection buradan beslenir.

**Kabul:** 2 kutu bug'ı ve sonsuz scroll, mock üzerinde OTOMATİK testle başarısız (kırmızı) durumda reproduce ediliyor.

### Faz 1 — Kritik bugfix'ler
1. **Frame hedefleme (2 kutu fix):**
   - Her frame `chrome.runtime.sendMessage({action:'FRAME_HELLO', isTop, hasHme, matchCount})` ile kendini bildirir; popup `sender.frameId`'yi alır.
   - `hasHme` tespiti: eğitimli email seçicisi eşleşmesi > 0; eğitimsizken metin/seçici sezgisi (Faz 0 teşhisiyle netleşir).
   - Popup `targetFrameId` seçer (en çok eşleşen frame); tüm komutlar `tabs.sendMessage(tabId, msg, {frameId})` ile hedefli gider.
   - Emniyet: content script, app-frame değilse `START_BOT`/`createOverlay` yok sayar (popup hedeflemesi başarısız olsa bile çift kutu/çift bot imkânsız).
   - **Regresyon T-B1:** mock'ta tüm frame'lerde toplam `#hme-floating-overlay` sayısı == 1; bot sadece iframe'de koşar; ana frame'de progress yok.
2. **Otomatik dur (liste sonu):** scroll container tespiti; `scrollHeight` 3 tur değişmez + eşleşen öğe yok → "Liste tükendi" + özet log + `stopBot()`. Tüm kalan öğeler korumalı/blacklist'li ise de durur ("Kalan tüm öğeler atlandı").
   - **Regresyon T-B2:** sonlu mock listede bot kendiliğinden durur; sonsuz scroll yok.
3. **i18n yeniden yapılandırma:** tüm statik metinler `data-i18n` attribute'una; tek `applyI18n()`; `nth-of-type` seçicileri silinir. `btnStartTraining.innerHTML` gibi dinamik yerler sabit id'lerle.
   - **Regresyon T-A1:** stub harness'ta EN/TR geçişi hatasız; her `[data-i18n]` düğümü sözlükteki değerle eşit; hiç Türkçe kalıntı yok (EN modda).
4. **Log clear sync:** `CLEAR_LOGS` mesajı → `state.logs = []` (content) + popup DOM.
   - **Regresyon T-A3.**
5. **Pause/resume adım bütünlüğü:** pause, adımın "güvenli noktasına" kadar tamamlanmasına izin verir (confirm basıldıktan SONRA) veya açık dialog'u kapatır (Escape/cancel); resume asla yarı-açık dialog üstüne tıklamaz.
   - **Regresyon T-B7.**
6. **Bölüm kapsamı (bug 7):** deactivate/delete modunda öğe seçicisi eşleşmeleri bölüm bazında filtrelenir (Faz 0'da teşhis edilen bölüm container'ı veya öğe içi durum işaretleri). Tıklama sonrası işlem butonu bulunamazsa: Escape → öğeyi "bu moda ait değil" olarak işaretle → sıradakine geç (retry döngüsüne girme).

### Faz 2 — Güvenilirlik çekirdeği (feature'ların temeli)
1. `waitFor(predicate, {timeout, root})` — MutationObserver (childList+subtree+attributes) + 100ms polling fallback. Sabit `setTimeout` beklemeleri kaldırılır.
2. **Başarı doğrulama:**
   - Deactivate: confirm sonrası modal kapanışı VE e-postanın aktif bölümden düşüşü `waitFor` ile doğrulanır → `stats.processed++`.
   - Delete: öğenin pasif bölümden düşüşü doğrulanır.
   - Timeout'ta 1 retry (yeniden kontrol), sonra `stats.failed++`, Escape, sıradaki.
3. **Koruma altyapısı:** `isProtected(el)` =
   - exact e-posta ∈ `protectedEmails` (normalize: trim+lowercase), VEYA
   - `protectedLabel` ≠ boş VE öğe textContent'i içerir (Apple listesi label'ı gösterdiği için çalışır) — **yalnız delete modunda**, VEYA
   - mevcut blacklist keyword (her iki modda).
   - Sayaçlar: `stats = {processed, skippedProtected, skippedFlagged, failed, notFound}` → overlay + popup + bitiş özeti.
4. **Regresyon T-B4/T-B6:** korumalı ve blacklist'li öğelere HİÇ tıklanmadığı (mock click-spy) ve sayaçların doğruluğu.

### Faz 3 — UI / QoL redesign
Yön **(a) modern koyu minimal** — onaylandı.
1. **Popup yeniden yapılandırma:** sekmeli/bölümlü düzen — `Durum & Kontrol` | `Eğitim` | `Yeniden Adlandır` | `Koruma` | `Günlük`. Net durum göstergesi (frame bağlantısı, modül, eğitim durumu), progress + sayaç çubukları (✓ işlenen / ⛔ atlanan / ✗ hatalı).
2. **Overlay:** tek kutu, kompakt, sürükleme konumu `storage.local`'da hatırlanır, küçültülebilir.
3. **Iconlar** (16/48/128 PNG) + manifest metadata; `default_title`.
4. QoL: delay/limit kalıcı; "son çalıştırma özeti" kartı; insanileştirilmiş gecikme (±%30 jitter) seçeneği (rate-limit güvenliği).
5. **Regresyon T-A1/T-A2/T-B8** (EN/TR E2E) + görsel screenshot diff.

### Faz 4 — Feature 1: Toplu Yeniden Adlandırma (label)
**Kullanıcı akışı:** mod seç → "Yeniden Adlandır" → e-postaları alt alta yapıştır → yeni label yaz ("sakın silme") → Başlat.
1. **Yeni mod:** `state.mode = 'rename'`; `hmeSelectors_rename = {email, labelInput, save}`; eğitim 3 adım: (1) e-posta öğesi, (2) Label input, (3) `Save changes` butonu. (Gerçek DOM'da arada "Edit" butonu varsa teşhiste 4. adım eklenir.)
2. **UI:** çok satırlı textarea (satır başına 1 e-posta; otomatik trim/lowercase/dedupe/`@icloud.com` doğrulama), "Yeni label" input, başlat/durdur, sonuç listesi: `✓ yeniden adlandırıldı | ⚠ zaten bu label'da | ✗ bulunamadı | ⛔ hata`.
3. **Çalışma:** kuyruk = yapıştırılan liste. Her hedef için:
   - Öğeyi bul: tüm sayfa (aktif+pasif bölümler aynı sayfada) — `textContent` içinde exact e-posta eşleşmesi; bulunamazsa lazy-load scroll turu (Faz 1 otomatik-dur mantığıyla sınırlı).
   - `scrollIntoView` → tıkla → detay panelini `waitFor` → Label input'a yaz:
     `HTMLInputElement` ise native value setter (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set`) + `input`+`change` dispatch; contenteditable ise `execCommand('selectAll')` + `insertText`. (Hangisi: Faz 0 teşhisi.)
   - `Save changes` → doğrula: `waitFor` detay/liste öğesinde yeni label metni.
   - **Re-sort notu:** her kayıttan sonra DOM sırası değişir → her hedefte yeniden sorgula; kuyruk index'siz.
   - Sonuç raporu + başarıyla adlandırılanlar **otomatik** `protectedEmails`'e eklenir (A5 kararı).
4. **Regresyon T-B5:** mock'ta 6 hedef (4 aktif, 1 pasif, 1 yok) → 5 rename doğrulanır (DOM label), 1 `notFound` raporlanır, re-sort sırasında kuyruk bozulmaz.

### Faz 5 — Feature 2: Koruma ("asla silinmesin")
1. **Storage:** `protectedEmails: string[]`, `protectedLabel: string`, `autoProtectRenamed: bool`.
2. **Atlama mantığı:** Faz 2 `isProtected()` **delete döngüsünde** tıklama ÖNCESİ çalışır; atlanan öğe loglanır: `Atlandı (korunuyor): x@icloud.com`.
3. **UI — "Korumalı Adresler" paneli:** toplam sayı, label alanı, manuel ekle/çıkar, rename'den otomatik eklenenler, "listeyi temizle"; dışa aktar (kopyala).
4. **Çift emniyet:** label listede görünmese bile (UI değişirse) exact-e-posta listesi korumayı garanti eder.
5. **Regresyon T-B6:** rename sonrası delete taraması → korunuyor işaretli 0 öğe silindi (mock spy + DOM assert).

### Faz 6 — Gerçek site doğrulaması + dokümantasyon
1. Kullanıcıyla gerçek iCloud'da manuel checklist (aşağıda) — önce TEK test adresiyle.
2. README güncelleme (EN/TR): yeni mod, koruma, frame düzeltmesi, UI.
3. `tests/` repoda kalır (tekrar koşulabilir); geçici teşhis scriptleri temizlenir.

---

## 2. Test matrisi

### Tier A — popup testleri (gerçek extension context, hızlı)
| ID | Test | Assert |
|---|---|---|
| T-A1 | EN/TR `applyI18n` | TypeError yok; tüm `data-i18n` çevrildi; EN modda Türkçe kalıntı yok |
| T-A2 | ayar persist | delay/limit/flags/label storage stub'a yazılıyor, açılışta geri yükleniyor |
| T-A3 | Clear Logs | `CLEAR_LOGS` gönderildi + content state temizlendi (stub üzerinden) |
| T-A4 | textarea parse | satır→liste: trim, dedupe, lowercase, geçersiz satır uyarısı |

### Tier B — E2E: gerçek Chromium + `--load-extension` + mock iCloud (http://127.0.0.1)
| ID | Senaryo | Assert |
|---|---|---|
| T-B1 | Frame tekilleştirme | Tüm frame'lerde toplam overlay == 1; bot yalnız HME frame'inde; boş ikinci kutu YOK |
| T-B2 | Otomatik dur | Sonlu listede bot kendiliğinden `idle`; "liste tükendi" logu; sonsuz scroll yok |
| T-B3 | Eğitim akışı | 3 mock tıklama → `hmeSelectors_*` storage'a doğru yazıldı |
| T-B4 | Deactivate/delete + atlama | Korunan/blacklist öğeler DOM'da el değmemiş; diğerleri işlendi; sayaçlar == beklenen |
| T-B5 | Rename E2E | 5/6 label DOM'da değişti; notFound raporlandı; re-sort kuyruğu bozmadı; auto-protect listesi güncel |
| T-B6 | Koruma entegrasyonu | Rename sonrası delete taraması: korumalı öğeye 0 tıklama (click-spy) |
| T-B7 | Pause/Resume/Stop | Pause sırasında 0 tıklama; açık dialog bırakılmaz; resume kaldığı yerden; stop anında durur |
| T-B8 | i18n E2E | Popup sekmesinde EN/TR geçişi tüm yüzeyde (overlay dahil) |
| T-B9 | Doğrulama+retry | Mock confirm'i 1 kez kasten sessiz düşür → retry → success; 2. düşüşte `failed++`, akış devam |

### Tier C — manuel, gerçek iCloud (kullanıcı, Faz 6)
| ID | Adım | Beklenen |
|---|---|---|
| M1 | icloud.com/icloudplus aç, popup'ı aç | TEK kutu; dolu olan doğru frame'de |
| M2 | Deactivate eğitimi + 1 adreslik koşu | Adres pasife taşındı; doğrulama logu "✓" |
| M3 | Rename eğitimi + 1 test adresi | Label değişti, liste yeniden sıralandı, input doğru doldu |
| M4 | Koruma: `sakın silme` label'lı öğeyle delete taraması | Log "Atlandı (korunuyor)"; öğe silinmedi |
| M5 | Listenin sonuna kadar koşu | Otomatik duruş + özet (işlenen/atlanan/hatalı) |
| M6 | EN/TR geçişi | Tüm metinler çevrildi, konsol hatasız |
| M7 | Sayfa yenileme | Overlay tek kalır; ayarlar/eğitim korunur |

---

## 3. Riskler ve önlemler
| Risk | Önlem |
|---|---|
| Gerçek DOM mock'tan farklı | Eğitilebilir motor zaten absorbe eder; Faz 0 gerçek-DOM teşhisi (relay/snippet) mock'u kalibre eder |
| Label input framework-özel event ister | Native setter + `input`/`change`; fallback `execCommand('insertText')`; M3'te doğrulanır |
| Apple rate-limit | min delay 1500ms + jitter seçeneği; doğrulama-bekli adımlar doğal yavaşlatır |
| Alfabetik re-sort sırayı bozar | Kuyruk e-posta bazlı; her hedefte DOM yeniden sorgulanır (T-B5) |
| Frame tespiti gerçek sitede başarısız | Çok katmanlı: seçici eşleşme sayısı → metin sezgisi → kullanıcıya "hangi frame?" onayı (son çare) |
| Pasif bölüm "show more" ile gizli | Faz 0 teşhisi; gerekirse eğitimli "daha fazla göster" adımı |

## 4. Kapsam dışı (bu turda)
- Özel HME HTTP API entegrasyonu (A3), Firefox desteği, background service worker ile reload-resume, Note alanına yazma (yalnız Label istendi).

---

## 5. Sonuçlar (2026-09-29)

Otomatik E2E: Chromium 150 (headless=new) + `--load-extension` + mock iCloud.

| Test | Sonuç | Kanıt |
|---|---|---|
| T-B1 tek overlay | ✅ | tüm fazlarda top-frame=0 / iframe=1 overlay |
| T-B2 otomatik dur | ✅ | `reason=exhausted`; sonsuz scroll yok |
| T-B3 eğitim | ✅ | 3 tıklama → `hmeSelectors_*`; `li.hme-item` çoklu-eşleşme seçicisi |
| T-B4 blacklist + sayaçlar | ✅ | processed=24, skippedFlagged=1, mismatch=0, boşa tıklama yok |
| T-B5 rename | ✅ | 4 renamed + 1 already + 1 notFound; re-sort dayanıklı; auto-protect 5 adres |
| T-B6 koruma (delete) | ✅ | 13 delete; korumalı/flagged adreslere 0 tıklama; aktif bölüm el değmemiş |
| T-B7 pause/resume | ✅ | pause penceresinde 0 tıklama, açık modal yok; resume kaldığı yerden |
| T-B8 i18n | ✅ | EN/TR popup + overlay; boş `data-i18n` düğümü yok |
| T-B9 doğrulama+retry | ✅ | failNext(1) → retry ile success; failNext(2) → failed=1 + sıradaki success |
| T-A1..A4 | ✅ | i18n TypeError yok; ayar persist; log-clear content'e senkron; parse dedupe |

E2E sırasında bulunup düzeltilen gerçek-site riskleri:
1. `extractEmail` bitişik `textContent`'te label'ı yutuyordu (`Appsactive06@…`) → TreeWalker ile düğüm-bazlı tarama + attribute fallback.
2. Detay paneli önceki öğeye bağlıyken yanlış `already` / yanlış buton tıklama riski → panel-binding bekleme (panel metninde e-posta) + input değer stabilizasyonu.
3. Re-render sonrası kopuk (stale) düğüme tıklama — delege listener'lar yok sayar → tıklama öncesi fresh-node refetch; action-button timeout'unda bir kez fresh tıklama.
4. Lazy liste dipte scroll event üretmeyince render penceresi genişlemiyordu → `scrollDown` jiggle + `scroll` event dispatch.
5. Doğru-bölüm öğrenimi kopuk düğümde `closest()` ile başarısızdı → bölüm seçicisi tıklama anında alınıp yalnız doğrulanmış başarıda kaydediliyor.
