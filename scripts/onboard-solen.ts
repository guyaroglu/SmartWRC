// Şölen SEO & GEO — first real customer onboarding (September 2026 analysis → October 2026 work).
// Idempotent: re-running never duplicates the project, release or any task (matched by name/title).
// Uses the normal domain services with real actors: PM creates project/release and records the
// live baseline; SEO opens each finding via “+ Yeni Sorun” (Found By = SEO).
// Usage: npx tsx scripts/onboard-solen.ts
// Local development (NODE_ENV not production and DATABASE_URL on localhost) may use the demo accounts.
// Anywhere else ALL of these are required, and every person must exist, be active and have the right
// role/team — checked before any write, otherwise the script exits without touching the database:
//   SOLEN_PM=… SOLEN_SEO=… SOLEN_FRONTEND=… SOLEN_BACKEND=… SOLEN_NETWORK=… SOLEN_CONTENT=… npx tsx scripts/onboard-solen.ts
import { DomainKey, EvidenceType, OnboardingType, Priority, PrismaClient, Role, TeamKey, VerificationType } from "@prisma/client";
import { completeBaseline, createAdHocCheck, createProject, createReleaseFromTemplate } from "../src/lib/release-service";

const prisma = new PrismaClient();

const PROJECT = "Şölen SEO & GEO";
const RELEASE = "Ekim 2026 — İlk uygulama dönemi";
const { SEO, GEO, PERFORMANCE, ANALYTICS, INFRASTRUCTURE, CONTENT_QUALITY, UX } = DomainKey;

type Task = {
  title: string;
  owner: TeamKey;
  priority: Priority;
  domains: DomainKey[];
  category: string;
  scope: string;
  evidence: string;
  why: string;
  expected: string;
  acceptance: string[];
  howToFix: string;
  caveat?: string;
};

const T = TeamKey;
const TASKS: Task[] = [
  // ---------------- P0 ----------------
  {
    title: "2026 Yaz Indexation Daralması — Kök Neden Analizi",
    owner: T.SEO, priority: Priority.P0, domains: [SEO], category: "Indexation",
    scope: "Tüm site; GSC Sayfalar raporu (Temmuz–Eylül 2026).",
    evidence: "GSC: 10 Tem 22 indexed / 436 not indexed → 25 Tem 46/410 → 29 Ağu 81/369 → 5 Eyl 112/355 → Eylül sonu ~124/~340. Indexed URL sayısı ile Google impressions toparlanması arasında korelasyon ≈ 0.965.",
    why: "Indexed URL sayısı ile görünürlük birlikte hareket ediyor; hangi URL desenlerinin neden index dışında kaldığı bilinmeden teknik düzeltme önceliklendirilemez.",
    expected: "Index dışı URL'lerin URL düzeyinde desen ve olası kök neden sınıflandırması; teknik düzeltme gerekenler için ilgili ekibe ayrı görev önerisi.",
    acceptance: [
      "~340 not-indexed URL dışa aktarıldı ve GSC nedenine göre gruplandı",
      "Her grup için örnek URL'ler ve olası kök neden hipotezi yazıldı",
      "Korelasyon ile kanıtlanmış nedensellik ayrımı raporda açıkça belirtildi",
      "Teknik düzeltme gereken gruplar için sorumlu ekip ve önerilen görev listelendi",
    ],
    howToFix: "SEO analizi. Sonuç teknik düzeltme gerektirirse Backend/Frontend/Content için + Yeni Sorun ile ayrı görev açılır.",
    caveat: "Korelasyon nedensellik değildir; “görünürlük indexation yüzünden düştü” kesin hükmü verilmez.",
  },
  {
    title: "Crawled – Currently Not Indexed İncelemesi",
    owner: T.SEO, priority: Priority.P0, domains: [SEO], category: "Indexation",
    scope: "GSC “Crawled – currently not indexed” ~265 URL.",
    evidence: "Not-indexed kırılımı (~340): 265 Crawled–currently not indexed, 23 Discovered–currently not indexed, 25 Alternative page with proper canonical, 20 Soft 404, 6 Not found 404, 1 Duplicate–Google chose different canonical.",
    why: "Index dışı URL'lerin büyük kısmı bu grupta; içerik kalitesi, iç bağlantı veya duplicate sinyalleri ayrıştırılmadan aksiyon alınamaz.",
    expected: "265 URL'nin şablon/içerik tipine göre segmentasyonu ve her segment için iyileştir / birleştir / indeksleme dışı bırak kararı.",
    acceptance: [
      "265 URL şablon tipine göre segmentlere ayrıldı",
      "Her segment için örnek URL, iç bağlantı sayısı ve içerik durumu not edildi",
      "Her segment için karar (iyileştir / birleştir / noindex / bırak) yazıldı",
      "Teknik iş gerektiren segmentler için sorumlu ekip belirlendi",
    ],
    howToFix: "SEO analizi; teknik/içerik işleri ayrı görev olarak açılır.",
  },
  {
    title: "SEO İş Ölçümleme Modeli ve GA4 Key Event Tanımı",
    owner: T.SEO, priority: Priority.P0, domains: [ANALYTICS], category: "Ölçümleme",
    scope: "GA4 property; Organic Search kanalı.",
    evidence: "GA4: Organic Search ~254,979 session, key events 0. Mevcut eventler: form_start 203, form_submit 237, file_download 854, click, scroll.",
    why: "Sorun “SEO dönüşüm üretmiyor” değil; iş sonucunu ölçen model tanımlı değil. Key event olmadan SEO etkisi raporlanamaz.",
    expected: "Hangi eventlerin iş KPI'ı (key event) sayılacağının onaylı tanımı ve ölçüm planı.",
    acceptance: [
      "Aday eventler (form_submit, file_download vb.) iş anlamıyla eşleştirildi",
      "Key event listesi ve tanımları Şölen tarafıyla onaylandı",
      "Organic Search için KPI raporu taslağı hazırlandı",
      "Uygulama gerekiyorsa teknik değişiklik listesi ayrı görev için yazıldı",
    ],
    howToFix: "SEO tanımı. Kod/GTM değişikliği gerekirse ayrı uygulama görevi (Frontend, SEO onaylı) açılır.",
  },
  {
    title: "Ana Sayfa Hero / LCP Optimizasyonu",
    owner: T.FRONTEND, priority: Priority.P0, domains: [PERFORMANCE], category: "Core Web Vitals",
    scope: "Ana sayfa hero alanı (mobil ve masaüstü).",
    evidence: "CrUX field — Mobil: LCP 4.2s, INP 120ms, CLS 0.18, TTFB 0.9s (CWV FAIL). Masaüstü: LCP 2.1s, INP 49ms, CLS 0.37 (CWV FAIL).",
    why: "Mobil LCP 4.2s eşik (2.5s) üzerinde; ana sayfa CWV değerlendirmesinden geçmiyor.",
    expected: "Hero/LCP elemanının erken keşfedilip hızlı yüklenmesi; mobil LCP'nin eşik altına inmesi (field data ile izlenir).",
    acceptance: [
      "LCP elemanı belirlendi ve teknik olarak mümkünse ilk HTML'den keşfediliyor",
      "Hero görseli lazy-load edilmiyor; uygun preload / fetchpriority uygulandı",
      "Hero görseli uygun boyut ve formatta sunuluyor",
      "Önce/sonra Lighthouse ve WebPageTest kanıtı eklendi; field data takibi notlandı",
      "Görsel regresyon yok (önce/sonra ekran görüntüsü)",
    ],
    howToFix: "Frontend uygular. Görsel teslimi için “Ana Sayfa / Ortak Görsel Teslim Optimizasyonu” göreviyle birlikte ele alınır.",
    caveat: "Lab değerleri field data ile karıştırılmaz; kabul field trendiyle teyit edilir.",
  },
  {
    title: "Slider / Layout Shift (CLS) Stabilizasyonu",
    owner: T.FRONTEND, priority: Priority.P0, domains: [PERFORMANCE, UX], category: "Core Web Vitals",
    scope: "Ana sayfa ve slider kullanan şablonlar.",
    evidence: "CrUX field — CLS mobil 0.18, masaüstü 0.37 (eşik 0.1).",
    why: "Masaüstü CLS 0.37 ile ciddi kayma var; kullanıcı deneyimini ve CWV'yi doğrudan etkiliyor.",
    expected: "Slider ve geç yüklenen bileşenlerin yer ayırması; CLS'nin eşik altına inmesi.",
    acceptance: [
      "CLS'ye yol açan elemanlar (slider, banner, font, gömülü içerik) listelendi",
      "CLS'ye neden olan konteynerler sabit boyut / aspect-ratio ile yer ayırıyor",
      "Önce/sonra Layout Shift kaydı (DevTools Performance) eklendi",
      "Slider işlevi ve tasarımı bozulmadı",
    ],
    howToFix: "Frontend uygular.",
  },
  {
    title: "Ana Sayfa / Ortak Görsel Teslim Optimizasyonu",
    owner: T.FRONTEND, priority: Priority.P0, domains: [PERFORMANCE], category: "Görsel pipeline",
    scope: "Ana sayfa ve ortak şablonlardaki görseller.",
    evidence: "Ana sayfa görselleri ~9.9 MB; optimize edilmiş tahmini ~1.9 MB (~%81 azalma). PageSpeed mobil: ~3 MB görsel teslim tasarrufu.",
    why: "Görsel ağırlığı LCP ve veri tüketimini doğrudan artırıyor.",
    expected: "Doğru boyut, modern format ve sıkıştırma ile görsel yükünün belirgin azalması.",
    acceptance: [
      "Görseller kullanım boyutuna göre responsive (srcset / sizes) sunuluyor",
      "Destekleyen tarayıcılarda modern format (WebP/AVIF) kullanılıyor",
      "Sıkıştırma uygulandı; görsel kalite kabul edilebilir",
      "Ekran altı görseller lazy-load; hero/LCP görseli lazy-load değil",
      "Width/height veya aspect-ratio korunuyor (CLS artmıyor)",
      "Önce/sonra toplam görsel payload kanıtı eklendi",
    ],
    howToFix: "Frontend uygular. Bağımlılık: CDN/format dönüşümü Network tarafında gerekiyorsa Network ile koordine edilir.",
  },
  // ---------------- P1 ----------------
  {
    title: "Soft 404 Doğrulaması ve HTTP Davranışı",
    owner: T.BACKEND, priority: Priority.P1, domains: [SEO], category: "Indexation / HTTP",
    scope: "GSC “Soft 404” ~20 URL; GSC “Not found 404” 6 URL.",
    evidence: "GSC not-indexed kırılımı: 20 Soft 404, 6 Not found 404.",
    why: "Soft 404 sayfaları içeriksiz 200 dönüyor olabilir; Google bunları index dışı bırakıyor.",
    expected: "Her URL için doğru HTTP davranışı: gerçek içerikse içerik iyileştirmesi, kaldırılmışsa 404/410, taşınmışsa 301.",
    acceptance: [
      "20 soft 404 URL tek tek incelendi ve sınıflandırıldı (içerik / kaldırılmış / taşınmış)",
      "Kaldırılmış sayfalar 404 veya 410 dönüyor",
      "Taşınmış sayfalar tek adımda 301 ile nihai 200 URL'ye yönleniyor",
      "Örnek URL'ler için HTTP yanıt kanıtı (curl -I) eklendi",
    ],
    howToFix: "Önce SEO sınıflandırması (kanıt); HTTP düzeltmesini Backend yapar.",
    caveat: "Mevcut kanıt sınırlı (20 URL); P0 değil P1 olarak açıldı.",
  },
  {
    title: "Alternatif Canonical URL Eşleme İncelemesi",
    owner: T.SEO, priority: Priority.P1, domains: [SEO], category: "Canonical",
    scope: "GSC “Alternative page with proper canonical” 25 URL; “Duplicate–Google chose different canonical” 1 URL.",
    evidence: "GSC not-indexed kırılımı: 25 Alternative page with proper canonical, 1 Duplicate–Google chose different canonical.",
    why: "Bu durumların bir kısmı beklenen davranış olabilir; hangilerinin sorun olduğu ayrılmalı.",
    expected: "25+1 URL için canonical hedefi doğru mu kararı ve gerekiyorsa düzeltme önerisi.",
    acceptance: [
      "Her URL için kaynak → canonical hedef eşlemesi çıkarıldı",
      "Beklenen (parametreli/varyant) ve sorunlu eşlemeler ayrıldı",
      "Sorunlu eşlemeler için teknik düzeltme görevi önerildi",
    ],
    howToFix: "SEO analizi.",
    caveat: "Crawl'daki “25 canonical missing” ile GSC'deki bu 25 URL aynı set kabul edilmez.",
  },
  {
    title: "Etkilenen İndekslenebilir Şablonlarda Self-Canonical Uygulaması",
    owner: T.BACKEND, priority: Priority.P1, domains: [SEO], category: "Canonical",
    scope: "~101 indexable HTML URL içinde canonical eksik 25 URL; blog, tarifler, mevsimsel sayfalar ve özel gün landing şablonları.",
    evidence: "Crawl: 25 indexable URL'de canonical yok; blog / recipes / seasonal / special-day şablonlarında kümeleniyor.",
    why: "Canonical eksikliği duplicate sinyallerini ve indeksleme kararlarını Google'a bırakıyor.",
    expected: "Etkilenen şablonların geçerli, mutlak self-canonical üretmesi.",
    acceptance: [
      "Örnek etkilenen URL'ler 200 dönüyor",
      "Her sayfa mutlak (https://www.solen.com.tr/...) self-canonical üretiyor",
      "Canonical hiçbir zaman redirect URL'yi göstermiyor",
      "Protokol ve host (https + www) normalize",
      "SEO örnek doğrulaması için şablon başına en az 2 URL kanıtı eklendi",
    ],
    howToFix: "Backend uygular (head/meta render katmanı). Canonical render frontend katmanındaysa PM sorumluyu Frontend olarak değiştirir.",
    caveat: "GSC'deki “25 Alternative page with proper canonical” ile bu 25 URL aynı set değildir.",
  },
  {
    title: "Title Farklılaştırma İncelemesi",
    owner: T.CONTENT, priority: Priority.P1, domains: [SEO, CONTENT_QUALITY], category: "On-page",
    scope: "~101 indexable URL; duplicate title grubundaki ~10 URL öncelikli.",
    evidence: "Tüm URL'lerde title var; ~55 title <30 karakter, ~7 title >60 karakter, ~10 URL duplicate title grubunda (örn. Luppo / Luppo Sandviç Kek aynı title).",
    why: "Farklı arama niyetindeki sayfaların aynı title'ı paylaşması SERP'te karışıklık ve cannibalization riski yaratıyor.",
    expected: "Duplicate ve niyet çakışan title'ların sayfa niyetine göre farklılaşması.",
    acceptance: [
      "Duplicate title grubundaki her sayfa benzersiz, niyeti yansıtan title aldı",
      "SEO hedef sorgu eşlemesine uyuldu",
      "Kısa title'lar yalnızca niyeti eksik anlatıyorsa değiştirildi (kısa olması tek başına hata değil)",
      "Önce/sonra title listesi kanıt olarak eklendi",
    ],
    howToFix: "Content CMS'te uygular; şablon değişikliği gerekirse ilgili teknik ekibe ayrı görev açılır.",
  },
  {
    title: "Ürün ve Şablon Meta Description Farklılaştırması",
    owner: T.CONTENT, priority: Priority.P1, domains: [SEO, CONTENT_QUALITY], category: "On-page",
    scope: "~101 indexable URL.",
    evidence: "14 meta description eksik, ~20 >160 karakter, ~23 duplicate.",
    why: "Amaç karakter sayısını mekanik düzeltmek değil; ürün özgüllüğü ve SERP mesaj netliği.",
    expected: "Eksik ve duplicate meta description'ların sayfa niyetine özgü metinle tamamlanması.",
    acceptance: [
      "14 eksik meta description yazıldı",
      "Duplicate meta description'lar sayfaya özgü hale getirildi",
      "Metinler sayfa niyetini ve ürünü özgül olarak anlatıyor",
      "Önce/sonra liste kanıt olarak eklendi",
    ],
    howToFix: "Content uygular.",
  },
  {
    title: "Eksik / Çoklu H1 Desenlerinin Giderilmesi",
    owner: T.FRONTEND, priority: Priority.P1, domains: [SEO], category: "On-page / Semantik yapı",
    scope: "~101 URL içinde 23 H1 eksik, 8 çoklu H1; şablon bazında gruplanmış.",
    evidence: "Crawl: 23 H1 missing, 8 multiple H1.",
    why: "Sayfanın ana konusunu belirten tek ve anlamlı H1 eksik ya da bölünmüş.",
    expected: "Etkilenen şablonlarda tek, anlamlı H1.",
    acceptance: [
      "Etkilenen URL'ler şablona göre gruplandı",
      "Her şablon tek bir anlamlı H1 üretiyor",
      "Görsel tasarım bozulmadı",
      "Şablon başına örnek URL kanıtı eklendi",
    ],
    howToFix: "Frontend şablonu düzeltir. Bağımlılık: H1 metni Content tarafından sağlanacaksa Content ile koordine edilir.",
  },
  {
    title: "Öncelikli Şablonlarda Semantik Başlık (H2) Hiyerarşisi",
    owner: T.FRONTEND, priority: Priority.P1, domains: [SEO, UX], category: "On-page / Semantik yapı",
    scope: "80 URL'de H2 yok; SEO'nun belirleyeceği öncelikli şablonlar (80 ayrı görev açılmadı).",
    evidence: "Crawl: 80 H2 missing (~101 URL).",
    why: "Mantıksal bölüm başlıkları içeriğin anlaşılmasını ve snippet/GEO çıkarımını destekler.",
    expected: "Öncelikli şablonlarda tek H1 ve mantıklı H2 hiyerarşisi.",
    acceptance: [
      "SEO öncelikli şablon listesini belirledi",
      "Bu şablonlarda tek anlamlı H1 ve mantıklı H2 hiyerarşisi var",
      "Sırf SEO için anlamsız başlık eklenmedi",
      "Görsel tasarım bozulmadı; örnek URL kanıtı eklendi",
    ],
    howToFix: "Frontend şablon yapısını uygular. Bağımlılık: başlık metinleri Content.",
  },
  {
    title: "EN Sayfa Metadata ve Başlık Yerelleştirmesi",
    owner: T.CONTENT, priority: Priority.P1, domains: [SEO, CONTENT_QUALITY], category: "International SEO",
    scope: "~26 /en URL; öncelikli: /en/biscolata, /en/luppo, /en/ozmo, /en/boombastic, /en/chocodans, /en/our-brands.",
    evidence: "/en: ~13 H1 eksik, ~4 meta description eksik; bazı İngilizce ürün sayfalarında Türkçe meta description.",
    why: "İngilizce sayfalarda Türkçe metadata, uluslararası arama görünürlüğünü ve kullanıcı güvenini düşürür.",
    expected: "/en sayfalarında İngilizce, sayfaya özgü title, meta description ve H1.",
    acceptance: [
      "Öncelikli 6 sayfa İngilizce H1 ve meta description aldı",
      "Türkçe metadata kalan /en sayfası yok",
      "Eksik meta description'lar tamamlandı",
      "Önce/sonra liste kanıt olarak eklendi",
    ],
    howToFix: "Content uygular; H1 şablonsal eksikse Frontend ile koordine edilir.",
  },
  {
    title: "TR ↔ EN Hreflang Eşleme Gereksinimleri",
    owner: T.SEO, priority: Priority.P1, domains: [SEO], category: "International SEO",
    scope: "TR sayfaları ve ~26 /en URL.",
    evidence: "Raw source/crawl'da hreflang görünmüyor.",
    why: "Doğru dil sürümünün doğru kullanıcıya gösterilmesi için gerçek eşdeğer sayfaların eşlenmesi gerekiyor.",
    expected: "Yalnızca gerçek eşdeğer TR↔EN sayfaların eşleme tablosu ve uygulama kuralları.",
    acceptance: [
      "TR↔EN eşdeğer sayfa eşleme tablosu hazırlandı",
      "Eşdeğeri olmayan sayfalar açıkça işaretlendi (zorla eşleme yok)",
      "x-default gerekip gerekmediği kararı yazıldı",
      "Uygulama görevi için kurallar teknik ekibe teslim edildi",
    ],
    howToFix: "SEO gereksinimi; uygulama ayrı görevde.",
  },
  {
    title: "TR ↔ EN Hreflang Uygulaması",
    owner: T.BACKEND, priority: Priority.P1, domains: [SEO], category: "International SEO",
    scope: "SEO eşleme tablosundaki TR↔EN sayfa çiftleri.",
    evidence: "Raw source/crawl'da hreflang yok; eşleme SEO gereksinim görevinden gelecek.",
    why: "Hreflang olmadan dil sürümleri birbirine bağlı değil.",
    expected: "Eşleme tablosuna göre karşılıklı, geçerli hreflang.",
    acceptance: [
      "Yalnızca gerçek eşdeğer sayfalar eşlendi",
      "Hreflang karşılıklı (reciprocal)",
      "Tüm hedefler indexable ve 200",
      "Wildcard / global eşleme yok; x-default yalnızca gerekiyorsa",
      "Örnek sayfa çiftleri için kaynak kodu kanıtı eklendi",
    ],
    howToFix: "Backend uygular (head render). Bağımlılık: “TR ↔ EN Hreflang Eşleme Gereksinimleri” tamamlanmadan başlanmaz. Render frontend katmanındaysa PM sorumluyu değiştirir.",
  },
  {
    title: "Dahili Asset Host Referanslarının Normalizasyonu",
    owner: T.FRONTEND, priority: Priority.P1, domains: [PERFORMANCE, INFRASTRUCTURE], category: "Teknik hijyen",
    scope: "Raw HTML'de https://solen.com.tr/... ile çağrılan first-party asset'ler (~195 PNG, ~49 JPG, ~3 JPEG, ~2 SVG).",
    evidence: "Crawl: ~253 3xx; bunların ~252'si non-www solen.com.tr host'unda ve büyük çoğunluğu asset. Kanonik host https://www.solen.com.tr/.",
    why: "Her asset isteği gereksiz bir yönlendirme adımından geçiyor; performans ve istek verimliliği kaybı. (Sorun “253 sayfa yönlendirmesi” değildir.)",
    expected: "First-party asset'lerin doğrudan nihai host üzerinden çağrılması.",
    acceptance: [
      "Etkilenen first-party asset'ler doğrudan https://www.solen.com.tr/ üzerinden çağrılıyor",
      "Asset isteklerinde gereksiz redirect zinciri yok",
      "Sayfalar ve asset'ler kırılmadı",
      "Önce/sonra network (HAR veya DevTools) kanıtı eklendi",
    ],
    howToFix: "Frontend şablon/kaynak URL'lerini düzeltir. Bağımlılık: host davranışı doğrulaması Network görevi “Statik Asset Teslimi / Cache / Host Davranışı İncelemesi”.",
  },
  {
    title: "Render-Blocking CSS / Kritik Render Yolu İncelemesi",
    owner: T.FRONTEND, priority: Priority.P1, domains: [PERFORMANCE], category: "Core Web Vitals",
    scope: "Ana sayfa ve ortak şablonlar.",
    evidence: "PageSpeed: render-blocking kaynak uyarısı; mobil LCP 4.2s (field).",
    why: "Render'ı bloklayan CSS ilk boyamayı ve LCP'yi geciktiriyor.",
    expected: "Kritik CSS'in erken, kritik olmayanın ertelenmiş yüklenmesi.",
    acceptance: [
      "Render-blocking kaynak listesi çıkarıldı",
      "Kritik olmayan CSS ertelendi veya bölündü",
      "Görsel regresyon yok (FOUC yok)",
      "Önce/sonra Lighthouse kanıtı eklendi",
    ],
    howToFix: "Frontend uygular.",
  },
  {
    title: "Kullanılmayan / Global Yüklenen JavaScript İncelemesi",
    owner: T.FRONTEND, priority: Priority.P1, domains: [PERFORMANCE], category: "Core Web Vitals",
    scope: "Global yüklenen script'ler.",
    evidence: "PageSpeed: kullanılmayan JavaScript tasarrufu uyarısı.",
    why: "Gereksiz JS ana thread'i meşgul ediyor ve yükü artırıyor.",
    expected: "Kullanılmayan veya sayfaya özgü olmayan JS'in kaldırılması / ertelenmesi.",
    acceptance: [
      "Global script envanteri ve hangi sayfada kullanıldığı çıkarıldı",
      "Kullanımı doğrulanmadan hiçbir bağımlılık kaldırılmadı",
      "Kaldırılan/ertelenen script'ler işlev testinden geçti",
      "Önce/sonra JS payload kanıtı eklendi",
    ],
    howToFix: "Frontend uygular.",
  },
  {
    title: "Statik Asset Teslimi / Cache / Host Davranışı İncelemesi",
    owner: T.NETWORK, priority: Priority.P1, domains: [INFRASTRUCTURE, PERFORMANCE], category: "Network / Cache",
    scope: "solen.com.tr ve www.solen.com.tr; statik asset yanıtları.",
    evidence: "Non-www host asset istekleri www'ya yönleniyor (~252 3xx). Cache/CDN yapılandırması henüz doğrulanmadı.",
    why: "Host yönlendirmesi ve cache başlıkları asset teslim performansını belirler.",
    expected: "Mevcut host, cache ve CDN davranışının test edilip belgelenmesi; gerekiyorsa net düzeltme kapsamı.",
    acceptance: [
      "non-www → www yönlendirmesinin tek adım ve doğru kod olduğu test edildi",
      "Statik asset'lerin Cache-Control / ETag başlıkları belgelendi",
      "CDN kullanımı gerçek yanıt başlıklarıyla doğrulandı (varsayım yok)",
      "Düzeltme gerekiyorsa kapsam bu göreve yazıldı; test çıktısı kanıt olarak eklendi",
    ],
    howToFix: "Network test eder ve gerekiyorsa yapılandırır.",
    caveat: "Config/repo erişimi olmadan “CDN yok” gibi doğrulanmamış iddia yazılmaz.",
  },
  {
    title: "Render Edilen Structured Data / SEO Mutation Doğrulaması",
    owner: T.SEO, priority: Priority.P1, domains: [SEO, GEO], category: "Structured data / GEO temeli",
    scope: "Ana sayfa ve örnek ürün/marka/tarif sayfaları.",
    evidence: "Raw HTML ana sayfada JSON-LD yok; kaynakta “KAF AI Bot Tracking” ve “KAF SEO Repair Loader” var.",
    why: "Client-side bir loader DOM'a schema/SEO değişikliği uyguluyor olabilir; “sitede schema yok” kesin değil.",
    expected: "Render edilen DOM'da hangi schema ve SEO mutasyonlarının bulunduğunun ve Google'ın bunları görüp görmediğinin tespiti.",
    acceptance: [
      "Raw HTML ile render edilmiş DOM karşılaştırıldı (örnek sayfa başına)",
      "KAF loader'ların uyguladığı mutasyonlar listelendi",
      "Google Rich Results / URL Inspection render çıktısı kanıt olarak eklendi",
      "Server/template seviyesinde schema gerekip gerekmediği kararı yazıldı",
    ],
    howToFix: "SEO doğrulaması. Gerekirse “Entity Structured Data” uygulama görevi ayrıca açılır.",
  },
  {
    title: "Şölen GEO Sorgu Baseline'ı",
    owner: T.SEO, priority: Priority.P1, domains: [GEO], category: "GEO / AI görünürlüğü",
    scope: "Şölen markası, ürün ve kategori sorguları; AI yanıt motorları.",
    evidence: "Semrush AI snapshot: AI Visibility 40, Mentions 610, Cited Pages 119. En çok atıf alan kaynaklar: trendyol.com 126, migros.com.tr 103, solen.com.tr 97.",
    why: "AI Şölen'i biliyor ama birinci taraf (solen.com.tr) atıf hakimiyeti yok.",
    expected: "Ölçülebilir GEO sorgu seti ve başlangıç atıf payı.",
    acceptance: [
      "Takip edilecek GEO sorgu seti (marka / ürün / kategori) tanımlandı",
      "Her sorgu için başlangıç atıf kaynakları ve solen.com.tr payı kaydedildi",
      "Ölçüm yöntemi ve tekrar sıklığı yazıldı",
    ],
    howToFix: "SEO analizi.",
  },
  {
    title: "Birinci Taraf Entity / Fact Coverage Haritası",
    owner: T.SEO, priority: Priority.P1, domains: [GEO, CONTENT_QUALITY], category: "GEO / AI görünürlüğü",
    scope: "Marka, ürün ve şirket bilgileri.",
    evidence: "AI atıflarında üçüncü taraf perakendeciler (trendyol, migros) solen.com.tr'den daha baskın.",
    why: "AI'ın aktardığı gerçek bilgilerin birinci taraf kaynakta net bulunması gerekir.",
    expected: "Hangi entity bilgisinin sitede eksik/dağınık olduğunun haritası ve içerik önceliği.",
    acceptance: [
      "Marka/ürün/şirket için temel gerçekler (fact) listelendi",
      "Her fact için sitede bulunduğu URL veya eksiklik işaretlendi",
      "Content için öncelikli eksik içerik listesi çıkarıldı",
    ],
    howToFix: "SEO haritalar; içerik uygulaması Content (“GEO İçerik Geliştirmeleri”).",
  },
  {
    title: "Analytics Tag Envanteri / Legacy UA Doğrulaması",
    owner: T.FRONTEND, priority: Priority.P1, domains: [ANALYTICS], category: "Ölçümleme",
    scope: "Site genelindeki analytics/GTM tag'leri.",
    evidence: "Raw source'ta legacy UA-232429293-1 bulunuyor.",
    why: "Çift tetikleme, consent etkileşimi veya eski tag'ler veri kalitesini bozabilir.",
    expected: "GA4/GTM/UA yükleme envanteri ve legacy UA etkisinin doğrulanması.",
    acceptance: [
      "GA4'ün nereden yüklendiği belgelendi",
      "GTM varlığı ve container ID'si doğrulandı",
      "Consent etkileşimi ve duplicate firing kontrol edildi",
      "Legacy UA'nın etkisi belgelendi; kaldırma kararı SEO onayına sunuldu (doğrudan kaldırılmadı)",
    ],
    howToFix: "Frontend inceler; kaldırma ancak SEO onayından sonra.",
  },
  {
    title: "Ticari Kategori Keyword Eşlemesi",
    owner: T.SEO, priority: Priority.P1, domains: [SEO], category: "Kategori talebi",
    scope: "Keyword Gap dosyasındaki ~6.8K sorgu (gürültü dahil).",
    evidence: "Doğrulanmış örnekler: gofret ~12.1K, çikolata çeşitleri ~8.1K, bisküvi çeşitleri ~6.6K, fındıklı çikolata ~3.6K, bayram şekeri çeşitleri ~2.4K, gofret çeşitleri ~1.6K, kraker çeşitleri ~880, ikramlık çikolata ~590.",
    why: "6.8K sorgunun tamamı fırsat değil; gerçek ticari set belirlenmeden içerik yatırımı yanlış hedeflenir.",
    expected: "Her fırsatın NEW / OPTIMIZE / EXPAND / CONSOLIDATE kararıyla mevcut URL'lere eşlenmesi.",
    acceptance: [
      "Gürültü ayıklanmış ticari keyword seti çıkarıldı",
      "Her keyword mevcut URL ile eşlendi veya NEW olarak işaretlendi",
      "Her eşleme NEW / OPTIMIZE / EXPAND / CONSOLIDATE kararlarından birini taşıyor",
      "Cannibalization riski olan eşlemeler işaretlendi",
    ],
    howToFix: "SEO analizi; uygulama Content (“Kategori / Ürün İçerik Uygulaması”).",
  },
  {
    title: "Kategori / Ürün İçerik Uygulaması",
    owner: T.CONTENT, priority: Priority.P1, domains: [SEO, CONTENT_QUALITY], category: "Kategori talebi",
    scope: "SEO keyword eşlemesindeki OPTIMIZE / EXPAND / NEW kararları.",
    evidence: "Bağımlı: “Ticari Kategori Keyword Eşlemesi” çıktısı.",
    why: "Doğrulanmış ticari talebi mevcut kategori/ürün sayfalarına bağlamak.",
    expected: "Eşleme kararlarına göre içerik güncellemeleri; cannibalization yaratmadan.",
    acceptance: [
      "Her içerik değişikliği SEO eşlemesindeki karara uyuyor",
      "Mevcut sayfa varken aynı niyete yeni URL açılmadı",
      "Güncellenen sayfaların önce/sonra listesi kanıt olarak eklendi",
    ],
    howToFix: "Content uygular. Bağımlılık: “Ticari Kategori Keyword Eşlemesi” tamamlanmadan başlanmaz.",
  },
  // ---------------- P2 ----------------
  {
    title: "GEO İçerik Geliştirmeleri",
    owner: T.CONTENT, priority: Priority.P2, domains: [GEO, CONTENT_QUALITY], category: "GEO / AI görünürlüğü",
    scope: "Entity/fact haritasındaki öncelikli eksik içerikler.",
    evidence: "Bağımlı: “Şölen GEO Sorgu Baseline'ı” ve “Birinci Taraf Entity / Fact Coverage Haritası”.",
    why: "Birinci taraf atıf payını zamanla ölçülebilir şekilde artırmak.",
    expected: "Öncelikli fact boşluklarının sitede net, doğrulanabilir içerikle kapatılması.",
    acceptance: [
      "Haritadaki öncelikli eksik fact'ler sitede yayınlandı",
      "İçerik sayfada görünür ve doğrulanabilir (gizli/yalnızca schema değil)",
      "GEO baseline'a göre tekrar ölçüm tarihi belirlendi",
    ],
    howToFix: "Content uygular. Bağımlılık: GEO baseline ve entity haritası.",
  },
  {
    title: "Blog → Marka / Ürün İç Yolculuk Haritalaması",
    owner: T.CONTENT, priority: Priority.P2, domains: [SEO, UX], category: "Blog stratejisi",
    scope: "Trafik alan blog içerikleri.",
    evidence: "Blog: ~5.56M impression, ~55.5K click, ~100K GA4 landing session. 2024 geniş/non-brand blog stratejisi yönetimin bilinçli kararı ve trafik üretiyor.",
    why: "Geniş blog trafiğini ilgili marka/ürün/kategori keşfine ve ölçülebilir davranışa bağlamak.",
    expected: "Blog → marka/ürün/kategori iç bağlantı yolculuğu; mevcut trafik kazanım modeli korunarak.",
    acceptance: [
      "En çok trafik alan blog yazıları için ilgili marka/ürün/kategori eşlemesi yapıldı",
      "Doğal ve anlamlı iç bağlantılar eklendi",
      "Hiçbir blog içeriği silinmedi veya “alakasız” diye kaldırılmadı",
      "Bağlantı tıklamaları GA4'te izlenebilir",
    ],
    howToFix: "Content uygular; eşleme SEO ile birlikte yapılır.",
    caveat: "Blog stratejisi bilinçli karar; “topical drift cleanup” veya içerik silme bu görevin kapsamı değildir.",
  },
];

function description(t: Task) {
  return [
    `Kategori: ${t.category}`,
    `Kapsam / etkilenen URL'ler: ${t.scope}`,
    `Kanıt (Eylül 2026 SEO analizi): ${t.evidence}`,
    t.caveat ? `Not: ${t.caveat}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const PEOPLE = [
  { env: "SOLEN_PM", demo: "pm@smartnet.local", role: Role.PROJECT_MANAGER, team: null },
  { env: "SOLEN_SEO", demo: "seo@smartnet.local", role: Role.SEO_LEAD, team: T.SEO },
  { env: "SOLEN_FRONTEND", demo: "frontend@smartnet.local", role: Role.TEAM_MEMBER, team: T.FRONTEND },
  { env: "SOLEN_BACKEND", demo: "backend@smartnet.local", role: Role.TEAM_MEMBER, team: T.BACKEND },
  { env: "SOLEN_NETWORK", demo: "network@smartnet.local", role: Role.TEAM_MEMBER, team: T.NETWORK },
  { env: "SOLEN_CONTENT", demo: "content@smartnet.local", role: Role.TEAM_MEMBER, team: T.CONTENT },
] as const;

function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV !== "production" && /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "");
}

// Read-only. Resolves and validates every person before main() writes anything.
async function resolvePeople() {
  const local = isLocalDevelopment();
  const missing = PEOPLE.filter((p) => !process.env[p.env]?.trim()).map((p) => p.env);
  if (!local && missing.length) {
    throw new Error(`Non-development environment: set ${missing.join(", ")} (no demo-account fallback). Nothing was written.`);
  }
  const problems: string[] = [];
  const byEnv = new Map<string, { id: string; role: Role; teamId: string | null; teamKey: TeamKey | null; isActive: boolean }>();
  for (const p of PEOPLE) {
    const email = process.env[p.env]?.trim() || p.demo;
    const u = await prisma.user.findUnique({ where: { email }, include: { team: true } });
    if (!u) problems.push(`${p.env}=${email}: user not found`);
    else if (!u.isActive) problems.push(`${p.env}=${email}: user is inactive`);
    else if (u.role !== p.role) problems.push(`${p.env}=${email}: role ${u.role}, expected ${p.role}`);
    else if (p.team && u.team?.key !== p.team) problems.push(`${p.env}=${email}: team ${u.team?.key ?? "none"}, expected ${p.team}`);
    else byEnv.set(p.env, { id: u.id, role: u.role, teamId: u.teamId, teamKey: u.team?.key ?? null, isActive: u.isActive });
  }
  if (problems.length) throw new Error(`Invalid Şölen people:\n  ${problems.join("\n  ")}\nNothing was written.`);
  const teams = new Map((await prisma.team.findMany()).map((t) => [t.key, t.id]));
  for (const p of PEOPLE) if (p.team && !teams.has(p.team)) throw new Error(`Team ${p.team} missing. Nothing was written.`);
  return { get: (env: (typeof PEOPLE)[number]["env"]) => byEnv.get(env)!, teams };
}

async function main() {
  const people = await resolvePeople(); // fail closed before the first write
  const pm = people.get("SOLEN_PM");
  const seo = people.get("SOLEN_SEO");
  const result = { projectCreated: false, releaseCreated: false, baselineRecorded: false, created: 0, existing: 0 };

  let project = await prisma.project.findFirst({ where: { name: PROJECT } });
  if (!project) {
    project = await createProject(pm, PROJECT);
    result.projectCreated = true;
  }

  // Default team → person mapping (same pattern as the existing project; no UI exists for this yet).
  for (const p of PEOPLE) {
    if (!p.team) continue;
    const teamId = people.teams.get(p.team)!;
    await prisma.projectTeamAssignment.upsert({
      where: { projectId_teamId: { projectId: project.id, teamId } },
      update: {},
      create: { projectId: project.id, teamId, userId: people.get(p.env).id },
    });
  }

  let release = await prisma.release.findFirst({ where: { projectId: project.id, name: RELEASE } });
  if (!release) {
    const template = await prisma.templateVersion.findFirstOrThrow({ where: { version: "1.1", template: { name: "Corporate Website" } } });
    release = await createReleaseFromTemplate({
      user: pm,
      projectId: project.id,
      name: RELEASE,
      templateVersionId: template.id,
      modules: [], // live site optimisation: no launch checklist; the work items are the findings below
      targetDate: new Date("2026-10-31T00:00:00.000Z"),
      onboardingType: OnboardingType.LIVE_UNVERIFIED,
    });
    result.releaseCreated = true;
  }

  for (const t of TASKS) {
    const exists = await prisma.releaseCheck.findFirst({ where: { releaseId: release.id, title: t.title } });
    if (exists) {
      result.existing += 1;
      continue;
    }
    await createAdHocCheck(seo, {
      releaseId: release.id,
      title: t.title,
      description: description(t),
      domains: t.domains,
      ownerTeamKey: t.owner,
      priority: t.priority,
      // SEO's own analysis is verified inside SEO; every other team's work needs SEO approval.
      verificationType: t.owner === T.SEO ? VerificationType.SELF : VerificationType.SEO_GATED,
      evidence: { type: EvidenceType.TEXT, body: t.evidence },
      sop: {
        whyItMatters: t.why,
        expectedResult: t.expected,
        howToCheck: t.acceptance.join("\n"),
        howToFix: t.howToFix,
      },
    });
    result.created += 1;
  }

  const current = await prisma.release.findUniqueOrThrow({ where: { id: release.id } });
  if (!current.baselineCompleted) {
    await completeBaseline(pm, release.id); // the September analysis is the recorded live baseline
    result.baselineRecorded = true;
  }

  console.log(JSON.stringify({ project: project.id, release: release.id, tasks: TASKS.length, ...result }));
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
