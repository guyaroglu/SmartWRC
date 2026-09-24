# SmartNet WRC — Türkçe Terimler ve Operasyonel Sahiplik

> **Tespit Eden ≠ Sorumlu**
>
> SEO bir standardın/doğrulamanın sahibi olabilir; uygulamanın sahibi olmak zorunda değildir.
>
> “SEO kontrol etsin” değil; **“Doğru ekip doğru işi doğru yapsın.”**

Bu belge kullanıcıya görünen dili ve kimin ne yaptığını tek yerde tanımlar. Kod ve veritabanındaki enum adları İngilizce kalır; ekranda yalnızca Türkçe karşılıkları görünür (`src/lib/labels.ts`).

## 1. Terimler

| Kavram (kod) | Ekranda |
|---|---|
| Dashboard | Genel Bakış |
| Project | Proje |
| Release | Yayın |
| Release Detail | Yayın Detayı |
| ReleaseCheck | Kontrol Görevi (kısa: Görev) |
| My Checks | Görevlerim |
| Assigned to me | Bana Atananlar |
| Reviews | Onaylar |
| Attention | Dikkat Gerektirenler |
| Evidence | Kanıt |
| Owner / Owner Team | Sorumlu / Sorumlu Ekip |
| Reviewer | Doğrulayan |
| Found By | Tespit Eden |
| Domain | Etkilenen Alan |
| Release Gate | Yayın Kararı |
| Template | Kontrol Şablonu |
| Management view | Yayın Durumu |
| Admin | Sistem Yönetimi |
| Baseline (LIVE_UNVERIFIED) | Mevcut Canlı Durumu Kaydet |

**Görev durumu:** NOT_STARTED Açık · IN_PROGRESS Çalışılıyor · REVIEW Onay Bekliyor · PASS Onaylandı · FAIL Düzeltme Gerekli · BLOCKED Engellendi · NA Uygulanamaz · WAIVED Muaf Tutuldu · DONE_NEEDS_VERIFICATION Doğrulama Bekliyor · REMOVED_FROM_SCOPE Kapsam Dışı

**Doğrulama:** SELF Ekip İçi Onay · CROSS_TEAM Çapraz Onay · SEO_GATED SEO Onayı Zorunlu

**Yayın kararı:** NOT_ASSESSED Henüz Değerlendirilmedi · NO_GO Yayına Hazır Değil · AT_RISK Riskli · READY Yayına Hazır

**Yayın aşaması:** NOT_DEPLOYED Henüz Yayına Alınmadı · DEPLOYED Yayına Alındı · POST_LAUNCH_VERIFYING Yayın Sonrası Kontrol · PRODUCTION_VERIFIED Canlıda Doğrulandı

Bilinçli sapmalar:
- FAIL → **Düzeltme Gerekli** (“Başarısız” yerine): kullanıcıya ne yapacağını söyler, suçlamaz.
- BLOCKED → **Engellendi** (“Engelli” yerine): Türkçede “engelli” başka anlama gelir.

Bilinçli olarak korunan teknik kelimeler: canonical, hreflang, robots.txt, sitemap, schema, CDN, WAF, DNS, SSL, GA4, Googlebot, URL, SEO/GEO; ekip adları Frontend, Backend, Network, Content; kontrol kodları (FE-014 vb.); “PM” kısaltması; ürün adı “SmartNet WRC”.

## 2. Roller — kim ne sorar, ne yapar

| Rol | Ana soru | Yapar | Yapmaz |
|---|---|---|---|
| Ekip üyesi | “Benim yapmam gereken ne?” | Kendi ekibinin görevini başlatır, kanıt ekler, onaya gönderir, düzeltme geri bildirimini görür; Ekip İçi Onay görevini doğrular; kendisine atanmışsa Çapraz Onay yapar | Başka ekibin görevini değiştiremez; kendi Çapraz Onay / SEO Onayı Zorunlu görevini onaylayamaz; **yeni sorun açamaz**; yayını “Yayına Hazır” yapamaz |
| SEO Lideri | “Neyi doğrulamam gerekiyor?” | SEO Onayı Zorunlu görevleri doğrular; Çapraz Onay’ı **yalnızca atanmış doğrulayansa** yapar; SEO ekibinin kendi işini yapar ve doğrular; **+ Yeni Sorun** açar; koordinasyon (sorumlu/doğrulayan/öncelik, engel, yeniden açma) | Başka ekibin işini uygulamaz (başlat/kanıt/gönder yok); başka ekibin Ekip İçi Onay görevini onaylamaz; evrensel doğrulayan değildir |
| Proje Yöneticisi | “Yayını ne blokluyor ve kimde?” | Yayın oluşturur (görevler şablondan otomatik), **+ Yeni Sorun** açar, sahiplik/engelleri izler, sorumlu/doğrulayan/öncelik düzeltir, yayın adımlarını yürütür | **Teknik doğrulama yapmaz** (canonical, WAF, H1… onaylayamaz); başka ekibin işini uygulamaz |
| Yönetim | “Bu site yayına çıkabilir mi?” | Yayın Durumu: karar, kritik sayısı, risk kimde, hedef | Görev değiştiremez, onaylayamaz, sorun açamaz, yayına alamaz, yeniden açamaz (UI + sunucu) |
| Sistem Yöneticisi | — | Kullanıcı/sistem yönetimi; yönetici override (tüm işlemler, audit’e yazılır) | Normal operasyon yolu değildir |

## 3. Görev nereden gelir?

**A — Normal iş:** PM yeni yayın oluşturur → seçilen kontrol şablonu görevleri **otomatik** üretir (sorumlu ekip, doğrulama tipi, öncelik, kanıt zorunluluğu, SOP kopyalanır). Kimse standart görevleri tek tek girmez. Şablon sonradan değişse de mevcut yayındaki görevler değişmez. Bu görevlerin kaynağı `TEMPLATE`.

**B — Sonradan tespit edilen sorun: + Yeni Sorun.** Yayın Detayı’nda, yalnızca **SEO Lideri, PM ve Sistem Yöneticisi** görür; yayın “Canlıda Doğrulandı” (kilitli) ise görünmez ve sunucu reddeder — önce yayın yeniden açılmalı.
- Form: Ne tespit ettin? · Açıklama · Etkilenen alan · Sorumlu ekip · Öncelik · Doğrulama yöntemi · (Çapraz Onay ise doğrulayan kişi) · Tespit kanıtı.
- **Tespit Eden otomatik olarak formu açan kişidir**; başkası adına girilemez. Sorumlu ekip ayrı seçilir.
- Sorun sıradan bir kontrol görevidir (kaynak `AD_HOC`, kod `ADH-001`…); aynı iş akışı, kanıt kuralı, audit ve yayın kararı kuralları geçerlidir. P0 sorun yayını “Yayına Hazır Değil” yapar.
- Sorun mevcut bir görevin kapsamındaysa yeni sorun açmak yerine o görevde **Düzeltme İste** kullanılır (Tespit Eden yine kaydedilir).

## 4. Doğrulama kuralları (yetki rolden değil, görevin doğrulama tipinden gelir)

| Tip | Kim yapar | Kim doğrular | Kim doğrulayamaz |
|---|---|---|---|
| Ekip İçi Onay | Sorumlu ekip | Aynı ekip | SEO, PM ve diğer ekipler (yalnızca rolleri nedeniyle) |
| Çapraz Onay | Sorumlu ekip | **Yalnızca atanmış doğrulayan** (sorumlu ekipten olamaz) | Sahip ekip, SEO/PM (atanmamışsa), ilgisiz kullanıcılar |
| SEO Onayı Zorunlu | Sorumlu ekip | SEO Lideri | Uygulayan ekip, PM. (İstisna: sahibi SEO olan SEO standartlarını SEO Lideri doğrular.) |

**Çapraz Onay, SEO demek değildir.** Varsayılan doğrulayan şablondan gelir; CNT-007 ve CNT-017 için SEO’dur (başlık ve staging link kontrolleri SEO alanıdır). PM/Sistem Yöneticisi görev bazında “Doğrulayanı Değiştir” ile başka birini atayabilir. Sistem Yöneticisi’nin override yetkisi normal yol değildir.

Akış: **Açık → Çalışmaya Başla → kanıt ekle → Onaya Gönder → (Onayla | Düzeltme İste) → Düzeltmeye Başla → yeni kanıt → Onaya Gönder**. Kanıt zorunlu görev kanıtsız gönderilemez. Her adım geçmişe yazılır ve silinmez.

## 5. Örnek — SEO’nun açtığı yeni sorun

```text
+ Yeni Sorun (SEO Lideri açar)
Ne tespit ettin:  Canonical staging domain gösteriyor
Tespit Eden:      SEO / GEO · Gökhan (otomatik)
Etkilenen Alan:   SEO
Sorumlu Ekip:     Frontend
Öncelik:          P0 · Kritik  → yayın “Yayına Hazır Değil”
Doğrulama:        SEO Onayı Zorunlu
```

Frontend düzeltir, kanıt ekler, onaya gönderir; SEO doğrular. SEO sorunu açtı diye işin sahibi olmaz. Yönetim ekranı “SEO’da sorun var” demez.

## 6. Kapanan kararlar (Pre-Staging Spec Closure, 2026-09-24)

1. + Yeni Sorun: SEO Lideri / PM / Sistem Yöneticisi; `ReleaseCheck` + `source = AD_HOC`; kilitli yayında yok.
2. PM teknik doğrulayan değildir; SEO evrensel doğrulayan değildir; onay yetkisi doğrulama tipinden gelir.
3. Uygulama (başlat/kanıt/gönder) yalnızca sahip ekibindir; SEO ve PM koordine eder.
4. Çapraz Onay doğrulayanı şablon/atama ile belirlenir; sabit “SEO” değildir. Çapraz Onay doğrulayanı sahip ekipten olamaz; şablon böyle bir atama üretirse doğrulayan boş kalır ve PM atar.
5. Katalog v1.1: BASE-006 “Rollback yaklaşımı tanımlandı” → sahip Network, doğrulayan Proje Yöneticisi (v1.0 değişmedi).

Kanonik kaynak: `PROJECT_SHEET.md` §11 ve §116.
