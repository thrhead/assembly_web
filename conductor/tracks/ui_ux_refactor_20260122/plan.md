# Plan: UI/UX & Performance Refactor

## Phase 1: Web Accessibility & Styling
- [x] Task: Popover Focus Fix
  - [x] Subtask: `apps/web/components/ui/popover.tsx` dosyasındaki `outline-none` yerine erişilebilir focus sınıflarını ekle.
- [x] Task: Sidebar Z-Index Standardization
  - [x] Subtask: `apps/web/components/admin/sidebar.tsx` dosyasındaki keyfi z-index değerlerini Tailwind standartlarına (z-50) çek.

## Phase 2: Web Performance (Images)
- [x] Task: Image Component Migration
  - [x] Subtask: `apps/web/components/worker/cost-dialog.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.
  - [x] Subtask: `apps/web/components/photo-gallery.tsx` içindeki `<img>` etiketini `next/image` ile değiştir.

## Phase 3: Mobile Modernization
- [x] Task: Button Component Refactor
  - [x] Subtask: `apps/mobile/src/components/CustomButton.js` dosyasını `TouchableOpacity` yerine `Pressable` kullanacak şekilde güncelle.
  - [x] Subtask: Butonun mevcut prop'larını koruyarak geriye dönük uyumluluğu sağla.

## Phase 4: Code Quality & Safety
- [x] Task: Web Linting Onarımı
  - [x] Subtask: `eslint-config-next` bağımlılığını kur ve `npm run lint` komutunun hatasız çalıştığını doğrula.
- [x] Task: Type Safety İyileştirmeleri
  - [x] Subtask: Web projesindeki kritik `any` kullanımlarını (özellikle API yanıtları ve Context'ler) azalt.
- [x] Task: Mobil Linting Kurulumu
  - [x] Subtask: Mobil projeye temel `eslint` ve `prettier` yapılandırmasını ekle.

## Phase 5: Web Responsiveness & Profile Navigation
- [x] Task: Sidebar Mobile Visibility Fix
  - [x] Subtask: `AdminHeader`, `ManagerHeader` ve `CustomerHeader` bileşenlerine mobil menü tetikleyici (hamburger button) ekle.
  - [x] Subtask: `CustomerSidebar` ve `ManagerSidebar` bileşenlerini mobil uyumlu hale getir (Drawer/Overlay mantığı ekle).
  - [x] Subtask: `AdminSidebar` mobil butonunun Header altında kalma sorununu z-index ile çöz.
- [x] Task: Profile Pages Implementation
  - [x] Subtask: Admin, Manager ve Customer için temel profil sayfalarını (`/profile`) oluştur.
  - [x] Subtask: Tüm Header bileşenlerindeki "Profil" linklerini aktif hale getir ve doğru rotalara yönlendir.

## Phase 6: Mobile Theme & Status UX Fixes
- [ ] Task: Dashboard Bottom Nav Theme Fix
  - [ ] Subtask: `DashboardBottomNav.js` içinde açık temada hala siyah görünen alanları düzelt.
- [ ] Task: Job Detail Status Visibility
  - [ ] Subtask: İş detaylarında Kabul/Red butonları üzerindeki durum alanının açık temada siyah görünmesini engelle.
- [ ] Task: Substep Rejection Modal Theme
  - [ ] Subtask: Alt iş emri reddetme ekranının açık temada koyu kalması sorununu gider.

## Phase 7: Enhanced Mobile Navigation (Functional Bottom Menu)
- [ ] Task: Bottom Nav Modernization
  - [ ] Subtask: `DashboardBottomNav` bileşenine aktif sekme animasyonu ve dokunsal geri bildirim ekle.
  - [ ] Subtask: Menüye "Hızlı Ekle" (Floating Action Button mantığı) veya bildirim sayacı gibi işlevsel öğeler entegre et.
  - [ ] Subtask: İkon setini daha açıklayıcı ve modern Lucide ikonları ile güncelle.

## Phase 8: Verification
- [ ] Task: Final Manual Review
  - [ ] Subtask: Tüm cihazlarda ve temalarda (Açık/Koyu) navigasyonu test et.
