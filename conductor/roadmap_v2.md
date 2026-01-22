# Assembly Tracker V2.0 - Master Roadmap

Bu belge, Assembly Tracker projesinin V2.0 dönüşümünü yöneten ana plandır.
**Vizyon:** Offline-First çalışan, güvenli mesajlaşma sunan ve müşteri portalı ile şeffaflık sağlayan kapsamlı bir Saha Servis Yönetimi (FSM) platformu.

## 📦 Tracks (Geliştirme Paketleri)

### 🔴 Track 1: Field Core (Offline First & Messaging) [PRIORITY: HIGH]
*Hedef: Saha ekiplerinin internet bağımsız çalışabilmesi ve güvenli iletişim.*
*   **Feature 11:** ✅ Offline Stability (Tamamlandı - `pwa_offline_sync`).
*   **Feature 4:** ✅ Secure Offline Messaging (Temel yapı tamamlandı, geliştirmeler `tech_debt` içinde yapıldı).
*   **Feature 1:** ⏳ Dijital İmza (Yeni Track: `digital_signature_v1`).

### 🟠 Track 2: Customer Experience (Portal)
*Hedef: Müşterilerin süreçlere dahil edilmesi.*
*   **Feature 3:** ✅ Müşteri Portalı (Tamamlandı - `customer_portal_v1`).
*   **Feature 6:** ⏳ Çoklu Dil Altyapısı (Yeni Track: `i18n_localization_v1`).

### 🟡 Track 3: Operations & Intelligence
*Hedef: Yöneticiler için planlama ve analiz gücü.*
*   **Feature 2:** ⏳ Zaman Planlama ve Gantt (Yeni Track: `advanced_planning_v1`).
*   **Feature 8:** ⏳ Tahmin vs. Gerçek Analizi (Yeni Track: `advanced_planning_v1`).
*   **Feature 9:** 🔄 Gelişmiş Raporlama (Devam Ediyor - `ops_insights_v1`).

### 🔵 Track 4: Enterprise & Integrations
*Hedef: Ticarileşme ve dış dünya entegrasyonu.*
*   **Feature 7:** ⏳ Public API & Webhooks (Yeni Track: `enterprise_integrations_v1`).
*   **Feature 10:** ⏳ Faturalama (Yeni Track: `enterprise_integrations_v1`).
*   **Feature 12:** 🔄 Gelişmiş Temalar ve UX (Devam Ediyor - `ui_ux_refactor` & `ops_insights_v1`).

---

## 🚀 Execution Protocol
1.  Her Track için `conductor/tracks/<track_name>/plan.md` esas alınır.
2.  **Öncelik:** Track 1 tamamlanmadan diğerlerine geçilmez.
