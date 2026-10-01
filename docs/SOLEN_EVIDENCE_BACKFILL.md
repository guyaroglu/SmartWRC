# Şölen — Kanıt Kaynak Dosyası Manifesti ve Backfill

Kaynak klasör (source of truth, salt okunur tarandı 2026-10-02): `C:\Users\Monster Abra\Desktop\Şölen\Eylül Raporlar` — alt klasör yok, 26 dosya. Hiçbir dosya taşınmadı, yeniden adlandırılmadı veya değiştirilmedi.

Model: mevcut 28 **Açıklama (TEXT)** kanıtı bulgunun özeti olarak aynen duruyor; gerçek ham kaynak, aynı göreve ek bir **Dosya (FILE)** kanıtı olarak eklendi. Ekleyen: bulguyu tespit eden SEO Lideri (Gökhan, `gokhanuyaroglu`). Doğrulama: XLSX/CSV/ZIP içerikleri satır düzeyinde, PDF’ler `pdftotext` ile metinden okundu.

## Kaynak envanteri

| FILE NAME | TYPE | SIZE | RELEVANT DATA / PURPOSE |
|---|---|---|---|
| Açılış_sayfası_Açılış_sayfası.csv | CSV | 122728 B | GA4 açılış sayfası raporu (oturum, kullanıcı) |
| Demografik_grup_ayrıntıları_Ülke.csv | CSV | 15235 B | GA4 ülke kırılımı — hiçbir görev metni dayanmıyor |
| Etkinlikler_Etkinlik_adı.csv | CSV | 1361 B | GA4 etkinlik adları ve sayıları |
| Kullanıcı_edinme_İlk_kullanıcı_birincil_kanal_grubu_(Varsayılan_Kanal_Grubu).csv | CSV | 1384 B | GA4 ilk kullanıcı kanal grubu — görev metni dayanmıyor |
| SEO Analyzer - Generate a Free SEO Report of Your Website.pdf | PDF | 206979 B | Genel SEO analiz raporu — görev metni doğrudan dayanmıyor |
| Teknoloji_ayrıntıları_Tarayıcı.csv | CSV | 2486 B | GA4 tarayıcı kırılımı — görev metni dayanmıyor |
| Trafik_edinme_Oturumla_ilişkilendirilen_birincil_kanal_grubu_(Varsayılan_Kanal_Grubu) (1).csv | CSV | 1503 B | GA4 oturum kanal grubu (Organic Search oturumları, önemli faaliyetler) |
| Website Speed Test - Image Analysis Tool by Cloudinary.pdf | PDF | 19076888 B | Cloudinary görsel analizi (mevcut 9,9 MB → optimize 1,9 MB) |
| desktop-PageSpeed Insights.pdf | PDF | 8074765 B | PageSpeed masaüstü (CrUX alan verisi + Lighthouse) |
| gap.keywords_2026-10-01T07_55_20.197Z.csv | CSV | 870955 B | Semrush Keyword Gap export (6.798 anahtar kelime, hacim) |
| https___www.solen.com.tr_-Coverage-2026-10-01.zip | ZIP | 1436 B | GSC Sayfalar/Coverage export: Grafik.csv (indexed / not-indexed / gösterim serisi), Önemli sorunlar.csv, Kritik olmayan sorunlar.csv, Meta Veri.csv |
| https___www.solen.com.tr_-Performance-on-Search-2026-10-01.zip | ZIP | 41058 B | GSC Search Performance export: Grafik, Sorgular, Sayfa sayısı, Ülkeler, Cihazlar, Arama görünümü, Filtreler |
| mobil-PageSpeed Insights.pdf | PDF | 5418525 B | PageSpeed mobil (CrUX alan verisi + Lighthouse önerileri) |
| solen-content_all.xlsx | XLSX | 16290 B | Crawl içerik export (kelime sayısı, yakın kopya) — görev metni doğrudan dayanmıyor |
| solen-eylul-crawl_overview.xlsx | XLSX | 19025 B | Crawl overview (özet sayılar; hreflang, structured data, response codes) |
| solen-h1_all.xlsx | XLSX | 9110 B | Crawl H1 export (101 URL) |
| solen-h2_all.xlsx | XLSX | 8847 B | Crawl H2 export (101 URL) |
| solen-meta_description_all.xlsx | XLSX | 12619 B | Crawl meta description export (101 URL) |
| solen-page_titles_all.xlsx | XLSX | 9394 B | Crawl page title export (101 URL) |
| solen-url_all.xlsx | XLSX | 30431 B | Crawl URL export (459 URL; status, indexability, canonical) |
| solen-─▒mages_all.xlsx | XLSX | 5978 B | Crawl images export (59 görsel; boyut) — görev metni doğrudan dayanmıyor |
| www-solen-com-tr-sitemap-validation-report.txt | TXT | 550 B | Sitemap doğrulama raporu (geçersiz, URL 0) — hiçbir görevin kanıt metni dayanmıyor |
| www.solen.com.tr_ Alan Adı Genel Bakışı.pdf | PDF | 1066601 B | Semrush Alan Adı Genel Bakışı (YZ görünürlüğü 40, bahsetme 610, alıntılanan sayfa 119; trendyol 126 / migros 103 / solen 97) |
| www.solen.com.tr_ Keyword Gap.pdf | PDF | 1823766 B | Semrush Keyword Gap raporu (PDF) — CSV daha spesifik olduğu için tercih edildi |
| www.solen.com.tr_ Pozisyonlar, Organik Sıralamalar.pdf | PDF | 1856888 B | Semrush organik pozisyonlar — görev metni doğrudan dayanmıyor |
| www.solen.com.tr_a9306b87-bdcc-450d-b9ae-5f5b2298231d.pdf | PDF | 1087749 B | SEO Site Checkup raporu (Structured Data testi, üçüncü taraf istekler) |

## Görevler

| TASK ID | TASK TITLE | CURRENT TEXT EVIDENCE | SOURCE FILE(S) | SOURCE TYPE | SOURCE VERIFICATION | BACKFILL STATUS | NOTES |
|---|---|---|---|---|---|---|---|
| ADH-001 | 2026 Yaz Indexation Daralması — Kök Neden Analizi | GSC: 10 Tem 22 indexed / 436 not indexed → 25 Tem 46/410 → 29 Ağu 81/369 → 5 Eyl 112/355 → Eylül sonu ~124/~340. Indexed URL sayısı ile Google impressions toparlanması arasında korelasyon ≈ 0.965. | GSC Coverage zip | GSC Coverage | VERIFIED | ATTACHED (1) | Grafik.csv: 10 Tem 22/436, 25 Tem 46/410, 29 Ağu 81/369, 5 Eyl 112/355, 21 Eyl 124/340; indexed ~ gösterim korelasyonu 0,965 (n=74). Korelasyon nedensellik değildir (görev notu). |
| ADH-002 | Crawled – Currently Not Indexed İncelemesi | Not-indexed kırılımı (~340): 265 Crawled–currently not indexed, 23 Discovered–currently not indexed, 25 Alternative page with proper canonical, 20 Soft 404, 6 Not found 404, 1 Duplicate–Google chose different canonical. | GSC Coverage zip | GSC Coverage | VERIFIED | ATTACHED (1) | Önemli sorunlar.csv: 265 Tarandı-dizinde değil, 23 Keşfedildi, 25 alternatif canonical, 20 Soft 404, 6 404, 1 kopya-farklı canonical. |
| ADH-003 | SEO İş Ölçümleme Modeli ve GA4 Key Event Tanımı | GA4: Organic Search ~254,979 session, key events 0. Mevcut eventler: form_start 203, form_submit 237, file_download 854, click, scroll. | GA4 Trafik edinme CSV; GA4 Etkinlikler CSV | GA4 | VERIFIED | ATTACHED (2) | Organic Search 254.979 oturum, önemli faaliyet 0; form_start 203, form_submit 237, file_download 854. |
| ADH-004 | Ana Sayfa Hero / LCP Optimizasyonu | CrUX field — Mobil: LCP 4.2s, INP 120ms, CLS 0.18, TTFB 0.9s (CWV FAIL). Masaüstü: LCP 2.1s, INP 49ms, CLS 0.37 (CWV FAIL). | PageSpeed mobil PDF; PageSpeed masaüstü PDF | PageSpeed (CrUX) | VERIFIED | ATTACHED (2) | Mobil LCP 4,2 sn, INP 120 ms, CLS 0,18, TTFB 0,9 sn; masaüstü LCP 2,1 sn, INP 49 ms, CLS 0,37 (pdftotext ile okundu). |
| ADH-005 | Slider / Layout Shift (CLS) Stabilizasyonu | CrUX field — CLS mobil 0.18, masaüstü 0.37 (eşik 0.1). | PageSpeed mobil PDF; PageSpeed masaüstü PDF | PageSpeed (CrUX) | VERIFIED | ATTACHED (2) | CLS mobil 0,18, masaüstü 0,37. |
| ADH-006 | Ana Sayfa / Ortak Görsel Teslim Optimizasyonu | Ana sayfa görselleri ~9.9 MB; optimize edilmiş tahmini ~1.9 MB (~%81 azalma). PageSpeed mobil: ~3 MB görsel teslim tasarrufu. | Cloudinary PDF; PageSpeed mobil PDF | Cloudinary + PageSpeed | VERIFIED | ATTACHED (2) | Cloudinary: Current Images 9.9 MB → 1.9 MB; PageSpeed mobil: “Resim yayınlamayı kolaylaştırın — Tahmini tasarruf: 3.011 KiB”. |
| ADH-007 | Soft 404 Doğrulaması ve HTTP Davranışı | GSC not-indexed kırılımı: 20 Soft 404, 6 Not found 404. | GSC Coverage zip | GSC Coverage | VERIFIED | ATTACHED (1) | Soft 404 20, Bulunamadı (404) 6. |
| ADH-008 | Alternatif Canonical URL Eşleme İncelemesi | GSC not-indexed kırılımı: 25 Alternative page with proper canonical, 1 Duplicate–Google chose different canonical. | GSC Coverage zip | GSC Coverage | VERIFIED | ATTACHED (1) | Doğru standart etikete sahip alternatif sayfa 25; Google farklı standart seçti 1. |
| ADH-009 | Etkilenen İndekslenebilir Şablonlarda Self-Canonical Uygulaması | Crawl: 25 indexable URL'de canonical yok; blog / recipes / seasonal / special-day şablonlarında kümeleniyor. | solen-url_all.xlsx | URL / canonical export | VERIFIED | ATTACHED (1) | Indexable HTML + canonical boş: 25 URL (16 blog; tarif, sevgililer günü, anneler günü, yılbaşı, doğum günü vb.). |
| ADH-010 | Title Farklılaştırma İncelemesi | Tüm URL'lerde title var; ~55 title <30 karakter, ~7 title >60 karakter, ~10 URL duplicate title grubunda (örn. Luppo / Luppo Sandviç Kek aynı title). | solen-page_titles_all.xlsx | Page title export | VERIFIED | ATTACHED (1) | <30 kar. 55, >60 kar. 7, 5 kopya grup × 2 = 10 URL (örn. “Luppo Sandviç Kek \| Şölen” iki URL'de); boş title 0. |
| ADH-011 | Ürün ve Şablon Meta Description Farklılaştırması | 14 meta description eksik, ~20 >160 karakter, ~23 duplicate. | solen-meta_description_all.xlsx | Meta description export | VERIFIED | ATTACHED (1) | Boş/eksik 14, >160 kar. 20, kopya 23 URL. |
| ADH-012 | Eksik / Çoklu H1 Desenlerinin Giderilmesi | Crawl: 23 H1 missing, 8 multiple H1. | solen-h1_all.xlsx | H1 export | VERIFIED | ATTACHED (1) | H1 yok 23, birden fazla H1 8 (101 URL). |
| ADH-013 | Öncelikli Şablonlarda Semantik Başlık (H2) Hiyerarşisi | Crawl: 80 H2 missing (~101 URL). | solen-h2_all.xlsx | H2 export | VERIFIED | ATTACHED (1) | H2 yok 80 / 101. |
| ADH-014 | EN Sayfa Metadata ve Başlık Yerelleştirmesi | /en: ~13 H1 eksik, ~4 meta description eksik; bazı İngilizce ürün sayfalarında Türkçe meta description. | solen-h1_all.xlsx; solen-meta_description_all.xlsx | H1 + meta export (/en) | VERIFIED | ATTACHED (2) | /en: 26 URL; H1 yok 13, meta boş 4; 17 /en sayfasında Türkçe karakterli meta description. |
| ADH-015 | TR ↔ EN Hreflang Eşleme Gereksinimleri | Raw source/crawl'da hreflang görünmüyor. | solen-eylul-crawl_overview.xlsx | Crawl overview | VERIFIED | ATTACHED (1) | Contains hreflang 0 / 101. |
| ADH-016 | TR ↔ EN Hreflang Uygulaması | Raw source/crawl'da hreflang yok; eşleme SEO gereksinim görevinden gelecek. | solen-eylul-crawl_overview.xlsx | Crawl overview | VERIFIED | ATTACHED (1) | Contains hreflang 0 / 101; eşleme ADH-015'ten gelir. |
| ADH-017 | Dahili Asset Host Referanslarının Normalizasyonu | Crawl: ~253 3xx; bunların ~252'si non-www solen.com.tr host'unda ve büyük çoğunluğu asset. Kanonik host https://www.solen.com.tr/. | solen-url_all.xlsx | URL export | VERIFIED | ATTACHED (1) | 3xx 253; 252'si non-www solen.com.tr host'unda, çoğu /Assets/ yolunda (asset). |
| ADH-018 | Render-Blocking CSS / Kritik Render Yolu İncelemesi | PageSpeed: render-blocking kaynak uyarısı; mobil LCP 4.2s (field). | PageSpeed mobil PDF | PageSpeed | VERIFIED | ATTACHED (1) | “Oluşturma engelleme istekleri — Tahmini tasarruf: 6.310 ms”; alan LCP 4,2 sn. |
| ADH-019 | Kullanılmayan / Global Yüklenen JavaScript İncelemesi | PageSpeed: kullanılmayan JavaScript tasarrufu uyarısı. | PageSpeed mobil PDF; PageSpeed masaüstü PDF | PageSpeed | VERIFIED | ATTACHED (2) | “Kullanılmayan JavaScript'i azaltın — Tahmini tasarruf: 633 KiB” (mobil ve masaüstü). |
| ADH-020 | Statik Asset Teslimi / Cache / Host Davranışı İncelemesi | Non-www host asset istekleri www'ya yönleniyor (~252 3xx). Cache/CDN yapılandırması henüz doğrulanmadı. | solen-url_all.xlsx | URL export | VERIFIED | ATTACHED (1) | Non-www → www 3xx (252) doğrulandı. Cache/CDN yapılandırması görevin kendisinde “henüz doğrulanmadı” olarak açık; bunun için ham kaynak yok. |
| ADH-021 | Render Edilen Structured Data / SEO Mutation Doğrulaması | Raw HTML ana sayfada JSON-LD yok; kaynakta “KAF AI Bot Tracking” ve “KAF SEO Repair Loader” var. | SEO Site Checkup PDF; PageSpeed mobil PDF | Site Checkup + PageSpeed | PARTIAL | ATTACHED (2) | Structured Data testi öneri veriyor (JSON-LD yok), crawl overview “Contains Structured Data 0”; PageSpeed'de kaf.simur.org ve /apply_kaf_seo_mutations.js istekleri var. Kanıt metnindeki “KAF AI Bot Tracking” / “KAF SEO Repair Loader” etiketleri ham HTML gerektirir; klasörde raw HTML / source dump yok. |
| ADH-022 | Şölen GEO Sorgu Baseline'ı | Semrush AI snapshot: AI Visibility 40, Mentions 610, Cited Pages 119. En çok atıf alan kaynaklar: trendyol.com 126, migros.com.tr 103, solen.com.tr 97. | Semrush Alan Adı Genel Bakışı PDF | Semrush Domain Overview (YZ) | VERIFIED | ATTACHED (1) | YZ görünürlüğü 40, bahsetme 610, alıntılanan sayfa 119; trendyol.com 126, migros.com.tr 103, solen.com.tr 97. |
| ADH-023 | Birinci Taraf Entity / Fact Coverage Haritası | AI atıflarında üçüncü taraf perakendeciler (trendyol, migros) solen.com.tr'den daha baskın. | Semrush Alan Adı Genel Bakışı PDF | Semrush Domain Overview (YZ) | VERIFIED | ATTACHED (1) | YZ bahsetmelerinde trendyol 126 ve migros 103, solen 97'nin üstünde. |
| ADH-024 | Analytics Tag Envanteri / Legacy UA Doğrulaması | Raw source'ta legacy UA-232429293-1 bulunuyor. | — | Raw HTML / kaynak kodu | SOURCE NOT FOUND | NOT ATTACHED | Klasörün tamamı (26 dosya; xlsx, zip içerikleri ve PDF metinleri dahil) “UA-232429293” için tarandı: bulunamadı. PageSpeed / Site Checkup yalnızca GA4 (G-…) / gtag isteklerini gösteriyor. Raw HTML / view-source kaydı gerekir. |
| ADH-025 | Ticari Kategori Keyword Eşlemesi | Doğrulanmış örnekler: gofret ~12.1K, çikolata çeşitleri ~8.1K, bisküvi çeşitleri ~6.6K, fındıklı çikolata ~3.6K, bayram şekeri çeşitleri ~2.4K, gofret çeşitleri ~1.6K, kraker çeşitleri ~880, ikramlık çikolata ~590. | gap.keywords_2026-10-01T07_55_20.197Z.csv | Semrush Keyword Gap CSV | VERIFIED | ATTACHED (1) | gofret 12.100, çikolata çeşitleri 8.100, bisküvi çeşitleri 6.600, fındıklı çikolata 3.600, bayram şekeri çeşitleri 2.400, gofret çeşitleri 1.600, kraker çeşitleri 880, ikramlık çikolata 590 — birebir. |
| ADH-026 | Kategori / Ürün İçerik Uygulaması | Bağımlı: “Ticari Kategori Keyword Eşlemesi” çıktısı. | — | — | NO DIRECT SOURCE REQUIRED | — | ADH-025 çıktısına bağlı uygulama görevi. |
| ADH-027 | GEO İçerik Geliştirmeleri | Bağımlı: “Şölen GEO Sorgu Baseline'ı” ve “Birinci Taraf Entity / Fact Coverage Haritası”. | — | — | NO DIRECT SOURCE REQUIRED | — | ADH-022 ve ADH-023 çıktısına bağlı uygulama görevi. |
| ADH-028 | Blog → Marka / Ürün İç Yolculuk Haritalaması | Blog: ~5.56M impression, ~55.5K click, ~100K GA4 landing session. 2024 geniş/non-brand blog stratejisi yönetimin bilinçli kararı ve trafik üretiyor. | GSC Performance zip; GA4 Açılış sayfası CSV | GSC Search Performance + GA4 | VERIFIED | ATTACHED (2) | /blog: 55.490 tıklama, 5.557.800 gösterim (Sayfa sayısı.csv); GA4 /blog açılış oturumu 100.046. |

## Özet

- 28 görev: VERIFIED 24, PARTIAL 1, MANUAL REVIEW REQUIRED 0, NO DIRECT SOURCE REQUIRED 2, SOURCE NOT FOUND 1.
- Eklenen Dosya kanıtı: 33; dosya eklenen görev: 25.
- Yalnızca Açıklama kanıtıyla kalan: ADH-024 (kaynak bulunamadı), ADH-026 ve ADH-027 (bağımlı görev).
- Görev metnine doğrudan dayanmadığı için eklenmeyen dosyalar: GA4 ülke / tarayıcı / ilk kullanıcı CSV’leri, SEO Analyzer PDF, Semrush Pozisyonlar ve Keyword Gap PDF’leri (CSV tercih edildi), içerik ve görsel export’ları, sitemap doğrulama raporu.

## Taşıma notu

Şölen Dosya kanıtlarının içerikleri (33 dosya, ~77 MB) **veritabanı durumudur**: Postgres `EvidenceFile` tablosunda durur; kaynak koda veya migration'lara gömülü değildir ve Git'e girmez. Staging/production'a geçişte DB yedeği/geri yüklemesi ya da kontrollü bir kanıt aktarımı gerekir. DEV yedeği: `C:\Users\Monster Abra\Desktop\SmartWRC Backups\wrc-dev-20261001-172536.dump` (pg_dump custom, repo dışında).
