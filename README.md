# iCloud Hide My Email Bulk Deactivator & Deleter

[English](#english) | [Türkçe](#türkçe)

---

## English

An elegant, secure, and trainable Chrome Extension to automate the bulk deactivation and permanent deletion of Apple iCloud+ "Hide My Email" addresses.

### Features
* **Trainable Selector Engine:** Because Apple frequently updates their site layout and class names, this extension uses a "no-code training mode". You simply click one email, the deactivate/delete button, and the confirm button. The bot learns the selectors dynamically and automates the rest!
* **Dual-Mode Support:**
  * **Deactivate Mode (Active ➔ Inactive):** Moves active addresses to the Inactive list.
  * **Delete Mode (Inactive ➔ Delete):** Permanently deletes deactivated addresses from your account.
  * Selector templates for both modes are cached independently.
* **Blacklist Keyword Filtering:** Prevent deleting or deactivating important addresses. Specify a comma-separated blacklist of keywords (e.g. `netflix, work, personal`). Any email matching these keywords will be skipped.
* **Intelligent Scrolling:** Automatically scrolls the iCloud lists to trigger lazy-loading and fetch more items during automation.
* **100% Local & Secure:** Runs entirely client-side. No cookies, session tokens, or credentials are sent to any external server.
* **Premium User Interface:** Beautiful, glassmorphic dark-mode interface with language selector (EN/TR), status badges, a draggable on-page status overlay, and real-time process logs.

### Installation
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top-right toggle switch).
4. Click **Load unpacked** (top-left button) and select this project's folder.
5. The extension is now loaded and ready!

### How to Use
1. Log in to [iCloud.com/icloudplus](https://www.icloud.com/icloudplus/) and open the **Hide My Email** section.
2. Open the extension popup, select your language, and select the **Active Module** (Deactivate or Delete).
3. Click **Start Training** and perform the 3-step action once on the page:
   * **Click 1:** Select any email from the list.
   * **Click 2:** Click the Deactivate/Delete button in the details panel.
   * **Click 3:** Click the red confirmation button in the dialog.
4. Once training finishes, the selectors are cached. 
5. Set your **Limit**, **Delay** (recommended: 1500ms), enter optional blacklist keywords, and click **Start Bot**.
6. Follow the progress on the floating status overlay. You can pause or stop the bot at any time.

---

## Türkçe

Apple iCloud+ "E-postamı Gizle" (Hide My Email) adreslerini toplu olarak devre dışı bırakmak ve kalıcı olarak silmek için eğitilebilir, güvenli ve şık bir Chrome eklentisi.

### Özellikler
* **Eğitilebilir Seçici Motoru:** Apple'ın arayüzü ve sınıf isimleri sık sık güncellendiği için bu eklenti "kodsuz eğitim modu" kullanır. Sadece bir e-postaya, devre dışı bırak/sil butonuna ve onay butonuna tıklayarak bota yolu öğretirsiniz. Bot seçicileri dinamik olarak öğrenir ve kalanları otomatikleştirir!
* **Çift Mod Desteği:**
  * **Devre Dışı Bırak (Aktif ➔ Pasif):** Aktif adresleri pasif listesine taşır.
  * **Kalıcı Olarak Sil (Pasif ➔ Sil):** Pasif durumdaki adresleri hesabınızdan tamamen siler.
  * Her iki modun şablonları birbirinden bağımsız olarak önbelleğe alınır.
* **Kara Liste Kelime Filtresi:** Önemli adreslerin yanlışlıkla silinmesini önleyin. Virgülle ayrılmış filtre kelimeleri girin (örn: `netflix, spotify, onemli`). Bu kelimeleri içeren e-postalar bot tarafından otomatik olarak atlanır.
* **Akıllı Sayfa Kaydırma:** Listenin sonuna gelindiğinde lazy-load tetiklenmesi için sayfayı otomatik olarak aşağı kaydırır.
* **%100 Güvenli ve Yerel:** Tamamen istemci tarafında (tarayıcınızda) çalışır. Çerezleriniz veya hesap bilgileriniz kesinlikle hiçbir harici sunucuya gönderilmez.
* **Premium Kullanıcı Arayüzü:** Dil seçimi (EN/TR), durum rozetleri, sürüklenebilir sayfa üstü durum paneli ve canlı işlem günlüğü içeren cam (glassmorphism) efektli şık koyu tema arayüzü.

### Kurulum
1. Bu depoyu indirin veya klonlayın.
2. Google Chrome tarayıcınızda `chrome://extensions/` adresine gidin.
3. Sağ üstteki **Geliştirici Modu** (Developer Mode) anahtarını aktif edin.
4. Sol üstteki **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın ve bu klasörü seçin.
5. Eklenti yüklenmiştir!

### Nasıl Kullanılır?
1. [iCloud.com/icloudplus](https://www.icloud.com/icloudplus/) adresine giderek hesabınızla giriş yapın ve **E-postamı Gizle** kısmını açın.
2. Eklenti simgesine tıklayıp dilinizi ve **Çalışma Modülünü** (Devre Dışı Bırak / Kalıcı Sil) seçin.
3. **Eğitimi Başlat** butonuna tıklayın ve sayfada şu 3 adımı bir kez manuel yapın:
   * **Tıklama 1:** Listeden herhangi bir e-postaya tıklayın.
   * **Tıklama 2:** Sağdaki detay panelinde bulunan Devre Dışı Bırak / Sil butonuna tıklayın.
   * **Tıklama 3:** Açılan onay penceresindeki kırmızı renkli butona tıklayın.
4. Eğitim tamamlandığında seçiciler kaydedilecektir.
5. **Limit**, **Gecikme** (varsayılan: 1500ms) ve isteğe bağlı kara liste kelimelerinizi girip **Botu Başlat** butonuna tıklayın.
6. Süreci sayfa üzerindeki yüzen panelden takip edebilirsiniz. Dilediğiniz an duraklatabilir veya durdurabilirsiniz.
