# iCloud Hide My Email Bulk Deactivator, Deleter & Renamer

[English](#english) | [Türkçe](#türkçe)

---

## English

A trainable Chrome extension (Manifest V3) to automate bulk management of Apple iCloud+ **Hide My Email** addresses on `icloud.com`: deactivate them, permanently delete them, or **bulk-rename their labels** — with a protection list that guarantees chosen addresses are never deleted.

### Features
* **Three modules:**
  * **Deactivate (Active ➔ Inactive)** — moves active addresses to the inactive list.
  * **Delete (Inactive ➔ Permanently removed)** — deletes inactive addresses.
  * **Rename (bulk label edit)** — paste a list of addresses (one per line); the bot finds each one in the active + inactive sections and sets its label to the value you choose (e.g. `sakın silme`).
* **Protection list ("never delete"):** exact addresses + a protected label. During **Delete** runs, protected items are skipped before any click (double safety: the exact-address list works even if the label is not visible in the list). Addresses renamed via the Rename module are added to the protection list automatically.
* **Trainable selector engine:** Apple changes class names frequently, so each module is trained once with 3 clicks (email item → action button → confirm; for rename: email item → label input → save). Selectors are cached per module and survive reloads.
* **Verified steps:** every click is followed by MutationObserver-based waits and result verification (item removed / moved / label updated). Failed steps are retried once, then reported — no blind `progress++`.
* **Frame-aware single overlay:** iCloud serves the app inside iframes; the popup discovers the right frame, and only that frame shows the status overlay and runs the bot (no more duplicate boxes).
* **Auto-stop:** when the list is exhausted the bot stops by itself and prints a run summary (✓ processed · ⛔ skipped · ✗ failed · ? not found · ⊘ mismatched).
* **Blacklist keywords** (all modes) and **human-like delay jitter** (±30%) option.
* **100% local:** everything runs in your browser; no cookies, tokens or data ever leave your machine.
* EN/TR interface, modern dark-minimal UI, draggable on-page overlay with remembered position, live logs.

### Installation
1. Clone/download this repository.
2. Open `chrome://extensions/`, enable **Developer Mode**.
3. **Load unpacked** → select this folder.

### Usage
1. Sign in at [icloud.com](https://www.icloud.com/) and open **Hide My Email** (iCloud+).
2. Open the extension popup — the connection bar should say *Connected*.
3. **Training tab:** pick the module, click **Start Training**, then click the 3 elements on the page in order (the floating overlay guides you). Repeat per module (deactivate / delete / rename).
4. **Run tab:** choose Deactivate or Delete, set delay (≥1500 ms recommended) and limit, optional blacklist keywords → **Start Bot**.
5. **Rename tab:** paste addresses (one per line), type the new label → **Start Rename**. Results per address: ✓ renamed / ⚠ already set / ? not found / ✗ failed.
6. **Protection tab:** manage the protected label and the exact-address list. Delete runs never touch protected addresses.

> Rename training step 2 is the **Label input field** in the details panel; step 3 is **Save changes**.

### Development & tests
```bash
# build the test extension (adds http://127.0.0.1 matches)
bun tests/build-test-ext.mjs        # or: node tests/build-test-ext.mjs

# serve the mock iCloud page
python3 -m http.server 8931 --directory tests/mock-icloud

# launch Chromium with the extension, open http://127.0.0.1:8931/index.html
# and chrome-extension://<id>/popup.html — see tests/README.md
```
The mock page reproduces the real HME layout (active/inactive sections, lazy loading, alphabetical re-sort on label save, confirm modal, silent-failure injection) for deterministic E2E tests.

---

## Türkçe

Apple iCloud+ **E-postamı Gizle** (Hide My Email) adreslerini `icloud.com` üzerinde toplu yönetmek için eğitilebilir Chrome eklentisi (Manifest V3): toplu devre dışı bırakma, kalıcı silme ve **toplu etiket yenileme** — ayrıca seçtiğiniz adreslerin asla silinmemesini garanti eden koruma listesi.

### Özellikler
* **Üç modül:**
  * **Devre Dışı Bırak (Aktif ➔ Pasif)** — aktif adresleri pasif listesine taşır.
  * **Kalıcı Sil (Pasif ➔ Sil)** — pasif adresleri hesabınızdan tamamen siler.
  * **Yeniden Adlandır (toplu etiket):** adresleri alt alta yapıştırın; bot her birini aktif + pasif listelerde bulur ve etiketini istediğiniz değere çevirir (örn. `sakın silme`).
* **Koruma listesi ("asla silinmesin"):** tam adresler + korumalı etiket. **Sil** taramalarında korumalı öğelere tıklanmadan önce atlanır (çift emniyet: etiket listede görünmese bile tam adres listesi korur). Yeniden Adlandırma ile etiketlenen adresler koruma listesine otomatik eklenir.
* **Eğitilebilir seçici motoru:** Apple sınıf adlarını sık değiştirdiği için her modül 3 tıklamayla bir kez eğitilir (e-posta öğesi → işlem butonu → onay; yeniden adlandırmada: e-posta öğesi → etiket alanı → kaydet). Seçiciler modül bazında saklanır, yenilemede kaybolmaz.
* **Doğrulamalı adımlar:** her tıklama MutationObserver tabanlı beklemeler ve sonuç doğrulamasıyla izlenir (öğe silindi / taşındı / etiket güncellendi). Başarısız adım bir kez yeniden denenir, sonra raporlanır — kör `progress++` yok.
* **Çerçeve farkındalıklı tek panel:** iCloud uygulamayı iframe içinde sunar; popup doğru çerçeveyi bulur, yalnız o çerçevede durum paneli görünür ve bot çalışır (çift kutu sorunu yok).
* **Otomatik duruş:** liste tükenince bot kendiliğinden durur ve çalıştırma özeti yazdırır (✓ işlenen · ⛔ atlanan · ✗ başarısız · ? bulunamayan · ⊘ uyumsuz).
* **Kara liste kelimeleri** (tüm modlar) ve **insansı gecikme varyasyonu** (±%30) seçeneği.
* **%100 yerel:** her şey tarayıcınızda çalışır; çerez/token/veri makinenizden çıkmaz.
* EN/TR arayüz, modern koyu-minimal tasarım, konumu hatırlanan sürüklenebilir sayfa paneli, canlı günlükler.

### Kurulum
1. Bu depoyu klonlayın/indirin.
2. `chrome://extensions/` → **Geliştirici Modu**'nu açın.
3. **Paketlenmemiş öğe yükle** → bu klasörü seçin.

### Kullanım
1. [icloud.com](https://www.icloud.com/) adresine giriş yapın, **E-postamı Gizle**'yi açın.
2. Eklenti popup'ını açın — bağlantı çubuğu *Bağlı* demeli.
3. **Eğitim sekmesi:** modülü seçin, **Eğitimi Başlat**'a tıklayın, ardından sayfadaki 3 öğeye sırayla tıklayın (yüzen panel sizi yönlendirir). Her modül için tekrarlayın (devre dışı / sil / yeniden adlandır).
4. **Çalıştır sekmesi:** Devre Dışı Bırak veya Sil seçin, gecikme (≥1500 ms önerilir) ve limiti ayarlayın, isterseniz kara liste kelimeleri girin → **Botu Başlat**.
5. **Yeniden Adlandır sekmesi:** adresleri alt alta yapıştırın, yeni etiketi yazın → **Yeniden Adlandırmayı Başlat**. Adres başına sonuç: ✓ yeniden adlandırıldı / ⚠ zaten bu etikette / ? bulunamadı / ✗ başarısız.
6. **Koruma sekmesi:** korumalı etiketi ve tam adres listesini yönetin. Sil taramaları korumalı adreslere asla dokunmaz.

> Yeniden adlandırma eğitiminin 2. adımı detay panelindeki **Etiket (Label) giriş alanı**, 3. adımı **Değişiklikleri Kaydet** butonudur.

### Geliştirme ve testler
```bash
# test eklentisini derle (http://127.0.0.1 eşleşmeleri ekler)
bun tests/build-test-ext.mjs        # veya: node tests/build-test-ext.mjs

# mock iCloud sayfasını sun
python3 -m http.server 8931 --directory tests/mock-icloud

# Chromium'u eklentiyle başlatın, http://127.0.0.1:8931/index.html ve
# chrome-extension://<id>/popup.html açın — ayrıntı: tests/README.md
```
Mock sayfa gerçek HME düzenini (aktif/pasif bölümler, lazy-load, etiket kaydında alfabetik yeniden sıralama, onay modalı, sessiz-hata enjeksiyonu) birebir taklit ederek deterministik E2E testler sağlar.
