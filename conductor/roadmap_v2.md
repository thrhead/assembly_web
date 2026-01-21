# Assembly Tracker V2.0 - Master Roadmap

Bu belge, Assembly Tracker projesinin V2.0 dönüşümünü yöneten ana plandır.
**Vizyon:** Offline-First çalışan, güvenli mesajlaşma sunan ve müşteri portalı ile şeffaflık sağlayan kapsamlı bir Saha Servis Yönetimi (FSM) platformu.

## 📦 Tracks (Geliştirme Paketleri)

### 🔴 Track 1: Field Core (Offline First & Messaging) [PRIORITY: HIGH]
*Hedef: Saha ekiplerinin internet bağımsız çalışabilmesi ve güvenli iletişim.*
*   **Feature 11:** Offline Stability (Queue Conflict Resolution & Data Consistency).
*   **Feature 4:** Secure Offline Messaging (E2E Encrypted, Local Storage).
*   **Feature 1 (Partial):** Dijital İmza altyapısı (UI hazırlığı, implementasyon backlog'da).
*   **Entegrasyon:** Mevcut `pwa_offline_sync` track'i bu paketin bir parçası olarak tamamlanacak.

### 🟠 Track 2: Customer Experience (Portal)
*Hedef: Müşterilerin süreçlere dahil edilmesi.*
*   **Feature 3:** Müşteri Portalı (Kısıtlı Rol: Sadece kendi işlerini görme, onay verme).
*   **Feature 6:** Çoklu Dil Altyapısı (i18n).

### 🟡 Track 3: Operations & Intelligence
*Hedef: Yöneticiler için planlama ve analiz gücü.*
*   **Feature 2:** Zaman Planlama, Gantt Şeması ve Rota Optimizasyonu.
*   **Feature 8:** Tahmin vs. Gerçek Analizi.
*   **Feature 9:** Gelişmiş Raporlama ve BI Panoları.

### 🔵 Track 4: Enterprise & Integrations
*Hedef: Ticarileşme ve dış dünya entegrasyonu.*
*   **Feature 7:** Public API & Webhooks.
*   **Feature 10:** Faturalama ve Ödeme Entegrasyonu.
*   **Feature 12:** Gelişmiş Temalar ve UX Animasyonları.

---

## 🚀 Execution Protocol
1.  Her Track için `conductor/tracks/<track_name>/plan.md` esas alınır.
2.  **Öncelik:** Track 1 tamamlanmadan diğerlerine geçilmez.
