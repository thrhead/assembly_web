# Plan: PWA Offline Sync & Queue System

## Phase 1: Altyapı Kurulumu (IndexedDB)
- [ ] Task: Paket Kurulumu
  - [ ] Subtask: `dexie` paketini `apps/web` projesine ekle (`npm install dexie`).
- [ ] Task: Database Yapılandırması
  - [ ] Subtask: `lib/offline-db.ts` dosyasını oluştur ve `Queue` tablosunu tanımla (id, url, method, payload, headers, createdAt).
- [ ] Task: Queue Servisi
  - [ ] Subtask: `lib/services/queue-service.ts` dosyasını oluştur (add, remove, getAll, update metodları).
  - [ ] Subtask: Mobil uygulamadaki `QueueService.js` mantığını TypeScript'e uyarla.
- [ ] Task: Conductor - User Manual Verification 'Altyapı Kurulumu' (Protocol in workflow.md)

## Phase 2: Sync Manager ve Network Tespiti
- [ ] Task: Network Hook
  - [ ] Subtask: `hooks/useNetworkStatus.ts` hook'unu oluştur (`window.navigator.onLine` takibi).
- [ ] Task: Sync Manager
  - [ ] Subtask: `lib/services/sync-manager.ts` dosyasını oluştur.
  - [ ] Subtask: Kuyruktaki öğeleri sırayla işleyen ve API'ye gönderen mantığı kur.
  - [ ] Subtask: Retry (tekrar deneme) mekanizmasını ekle (Max 3 deneme).
- [ ] Task: Global Provider Entegrasyonu
  - [ ] Subtask: `components/providers/SyncProvider.tsx` oluştur ve uygulamanın en üstüne (`layout.tsx`) ekle.
  - [ ] Subtask: Provider içinde network durumunu dinle ve online olunca sync başlat.
- [ ] Task: Conductor - User Manual Verification 'Sync Manager ve Network Tespiti' (Protocol in workflow.md)

## Phase 3: API İsteklerini Yakalama (Interception)
- [ ] Task: API Client Düzenlemesi
  - [ ] Subtask: Web uygulamasındaki API çağrılarının merkezi bir noktadan (örn: `lib/api-client.ts` veya custom fetch wrapper) geçmesini sağla.
  - [ ] Subtask: Eğer merkezi yapı yoksa, kritik formlarda (Job Complete, Cost Create) "Offline Mode" kontrolü ekle.
- [ ] Task: Offline Fallback Mantığı
  - [ ] Subtask: İstek başarısız olursa (network error) ve offline ise, veriyi `QueueService` ile DB'ye kaydet.
  - [ ] Subtask: Kullanıcıya "İşlem sıraya alındı, internet gelince gönderilecek" mesajı göster (Toast).
- [ ] Task: Conductor - User Manual Verification 'API İsteklerini Yakalama' (Protocol in workflow.md)

## Phase 4: UI İyileştirmeleri ve Test
- [ ] Task: Offline Göstergeleri
  - [ ] Subtask: Navbar veya Header'da "Offline" ikonu/banner'ı göster.
  - [ ] Subtask: Sync sırasında dönen bir indikatör göster.
- [ ] Task: Test Senaryoları
  - [ ] Subtask: İnterneti kes -> İş tamamla -> İnterneti aç -> Verinin gittiğini doğrula.
  - [ ] Subtask: Tarayıcıyı kapat/aç -> Verinin korunduğunu doğrula.
- [ ] Task: Conductor - User Manual Verification 'UI İyileştirmeleri ve Test' (Protocol in workflow.md)
