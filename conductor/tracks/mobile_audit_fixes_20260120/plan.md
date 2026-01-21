# Plan: Mobile UX & Performance Audit Fixes

Bu track, `mobile_audit.py` tarafından tespit edilen 52 kritik sorunu ve temel uyarıları gidermeyi hedefler.

## Phase 1: Kritik Performans Düzeltmeleri
- [ ] Task: Liste Performansı (EventList.js)
  - [ ] Subtask: `EventList.js` dosyasında `key={index}` kullanımını benzersiz ID (`item.id`) ile değiştir.
  - [ ] Subtask: Eğer ID yoksa, veri kaynağına ID ekle veya kararlı bir key üret.
- [ ] Task: Gereksiz Render Önleme
  - [ ] Subtask: `App.js` ve ana listelerde `React.memo` veya `useCallback` eksikliklerini kontrol et ve ekle.

## Phase 2: Dokunma Hedefi (Touch Target) İyileştirmeleri
*Hedef: Tüm tıklanabilir alanlar en az 44x44 (iOS) / 48x48 (Android) olmalıdır.*
- [ ] Task: Küçük Buton Düzeltmeleri
  - [ ] Subtask: `NotificationBadge.js` (18px -> 44px hit area).
  - [ ] Subtask: `TeamFormModal.js` (24px -> 48px hit area).
  - [ ] Subtask: `JobListItem.js` (Küçük ikon butonları için `hitSlop` ekle).
  - [ ] Subtask: `SuccessModal.js` ve `ConfirmationModal.js` kapatma butonlarını genişlet.

## Phase 3: Navigasyon ve Platform Uyumluluğu
- [ ] Task: Android Geri Tuşu Yönetimi
  - [ ] Subtask: `App.js` veya ana navigasyon yığınına `BackHandler` dinleyicisi ekle (React Navigation ile uyumlu).
- [ ] Task: Güvenli Alan (Safe Area) Kontrolü
  - [ ] Subtask: `index.js` ve `App.js` seviyesinde `SafeAreaProvider` ve `SafeAreaView` kullanımını doğrula (Çentik/Home bar için).

## Phase 4: Tipografi ve Renk Sistemi
- [ ] Task: Font Ölçekleme
  - [ ] Subtask: Sabit `fontSize` değerlerini `context/ThemeContext` veya `utils` üzerinden ölçeklenebilir (sp) birimlere dönüştür.
- [ ] Task: Karanlık Mod Desteği
  - [ ] Subtask: `App.js` ve `index.js` içinde eksik olan `useColorScheme` entegrasyonunu tamamla.

## Phase 5: Son Kontrol
- [ ] Task: Audit Script Tekrarı
  - [ ] Subtask: `python scripts/mobile_audit.py apps/mobile` komutunu çalıştır ve sorun sayısının düştüğünü doğrula.
