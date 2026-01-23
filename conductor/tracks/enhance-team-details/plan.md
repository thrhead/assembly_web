# Plan: Ekip Detay ve Rapor Geliştirmeleri

Bu plan, ekiplerin performansını, harcamalarını ve iş geçmişini detaylı bir şekilde raporlayan bir yapı kurmayı hedefler.

## Aşama 1: Veri Katmanı Geliştirmeleri
- [ ] `lib/data/teams.ts` dosyasına `getTeamDetailedReports` fonksiyonunun eklenmesi.
    - [ ] Toplam çalışma saati hesaplaması (`JobStep`'lerin `startedAt` ve `completedAt` farkları).
    - [ ] Toplam masraf hesaplaması (`CostTracking` tablosundan onaylı kayıtlar).
    - [ ] Atanan işlerin (aktif ve geçmiş) listesi.
    - [ ] Ortalama montaj süresi ve zamanında tamamlama oranı.
- [ ] Masraf kategorilerine göre dağılım verisinin çekilmesi.

## Aşama 2: Yeni UI Bileşenleri
- [ ] `TeamLeadBadge`: Takım liderini diğer üyelerden ayıran görsel etiket.
- [ ] `TeamJobsList`: Ekibe atanan işlerin durumlarıyla listelendiği tablo/liste.
- [ ] `TeamFinancialSummary`: Toplam masraf ve kategori bazlı dağılım grafiği.
- [ ] `TeamPerformanceCharts`: Aylık tamamlanma ve çalışma saati trend grafikleri.

## Aşama 3: Sayfa Yenileme (`app/[locale]/admin/teams/[id]/page.tsx`)
- [ ] Sekmeli (Tabs) yapıya geçiş:
    - **Genel Bakış:** Özet istatistikler ve performans karnesi.
    - **İş Geçmişi:** Atanan tüm işlerin kronolojik listesi.
    - **Ekip Üyeleri:** Lider vurgulu üye kartları.
    - **Finansal Raporlar:** Harcama detayları ve verimlilik raporları.

## Aşama 4: Ekstra Analitik Bilgiler
- [ ] Ekip Verimlilik Skoru hesaplama algoritması.
- [ ] En çok çalışılan lokasyonlar (Heatmap veya liste).
- [ ] Üye bazlı adım tamamlama istatistikleri.
