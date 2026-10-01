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
| Ekip üyesi | “Benim yapmam gereken ne?” | Kendi ekibinin görevini başlatır, kanıt ekler, onaya gönderir, düzeltme geri bildirimini görür; onayı SEO verir | Başka ekibin görevini değiştiremez; kendi görevini (doğrulama tipi ne olursa olsun) onaylayamaz; **yeni sorun açamaz**; yayını “Yayına Hazır” yapamaz |
| SEO Lideri | “Neyi doğrulamam gerekiyor?” | Frontend/Backend/Network/Content işlerinin **tek teknik onaylayıcısıdır**; SEO ekibinin kendi işini yapar ve doğrular; **+ Yeni Sorun** açar; koordinasyon (sorumlu/doğrulayan/öncelik, engel, yeniden açma) | Başka ekibin işini uygulamaz (başlat/kanıt/gönder yok); kendi SEO işlerinde Çapraz Onay’ı başka biri doğrular |
| Proje Yöneticisi | “Yayını ne blokluyor ve kimde?” | Yayın oluşturur (görevler şablondan otomatik), **+ Yeni Sorun** açar, sahiplik/engelleri izler, sorumlu/doğrulayan/öncelik düzeltir, yayın adımlarını yürütür | **Teknik doğrulama yapmaz** (canonical, WAF, H1… onaylayamaz); başka ekibin işini uygulamaz |
| Yönetim | “Bu site yayına çıkabilir mi?” | Yayın Durumu: karar, kritik sayısı, risk kimde, hedef | Görev değiştiremez, onaylayamaz, sorun açamaz, yayına alamaz, yeniden açamaz (UI + sunucu) |
| Sistem Yöneticisi | — | Kullanıcı oluşturur (kullanıcı adı + geçici şifre), rol/ekip/aktiflik değiştirir, geçici şifre sıfırlar; yönetici override (tüm işlemler, audit’e yazılır) | Normal operasyon yolu değildir; son aktif Sistem Yöneticisi pasife alınamaz |

## 3. Görev nereden gelir?

**A — Normal iş:** PM yeni yayın oluşturur → seçilen kontrol şablonu görevleri **otomatik** üretir (sorumlu ekip, doğrulama tipi, öncelik, kanıt zorunluluğu, SOP kopyalanır). Kimse standart görevleri tek tek girmez. Şablon sonradan değişse de mevcut yayındaki görevler değişmez. Bu görevlerin kaynağı `TEMPLATE`.

**B — Sonradan tespit edilen sorun: + Yeni Sorun.** Yayın Detayı’nda, yalnızca **SEO Lideri, PM ve Sistem Yöneticisi** görür; yayın “Canlıda Doğrulandı” (kilitli) ise görünmez ve sunucu reddeder — önce yayın yeniden açılmalı.
- Form: Ne tespit ettin? · Açıklama · Etkilenen alan · Sorumlu ekip · Öncelik · Doğrulama yöntemi · (Çapraz Onay ise doğrulayan kişi) · Tespit kanıtı.
- **Tespit Eden otomatik olarak formu açan kişidir**; başkası adına girilemez. Sorumlu ekip ayrı seçilir.
- Sorun sıradan bir kontrol görevidir (kaynak `AD_HOC`, kod `ADH-001`…); aynı iş akışı, kanıt kuralı, audit ve yayın kararı kuralları geçerlidir. P0 sorun yayını “Yayına Hazır Değil” yapar.
- Sorun mevcut bir görevin kapsamındaysa yeni sorun açmak yerine o görevde **Düzeltme İste** kullanılır (Tespit Eden yine kaydedilir).

## 4. Doğrulama kuralları (2026-10-01, PROJECT_SHEET §117)

**Frontend, Backend, Network ve Content işlerinin tek teknik onaylayıcısı SEO'dur.** Doğrulama tipi ne olursa olsun bu ekipler kendi işlerini onaylayamaz. PM ve Yönetim hiçbir görevi onaylayamaz. Yayına Hazır / Riskli / Yayına Hazır Değil kararı ise hesaplanır; görev onayı değildir.

| İşin sahibi | Kim yapar | Kim onaylar / düzeltme ister | Kim onaylayamaz |
|---|---|---|---|
| Frontend / Backend / Network / Content | Sorumlu ekip | **Yalnızca SEO Lideri** | Sorumlu ekip, diğer ekipler, PM, Yönetim |
| SEO (Ekip İçi / SEO Onayı Zorunlu) | SEO | SEO Lideri | PM, Yönetim, diğer ekipler |
| SEO (Çapraz Onay) | SEO | SEO dışındaki atanmış doğrulayan | SEO, PM, Yönetim |

Muaf Tut / Uygulanamaz kararı her görevde yalnızca SEO'dadır (PM ve Yönetim veremez). F/B/N/C işlerinde kayıtlı doğrulayan her zaman SEO'dur.

Sistem Yöneticisi'nin override yetkisi normal yol değildir ve audit'e yazılır.

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
4. (2026-10-01 ile değişti, §117) F/B/N/C işlerinin tek onaylayıcısı SEO’dur; Çapraz Onay’da atanmış başka doğrulayan yalnızca SEO’nun kendi işlerinde geçerlidir. Çapraz Onay doğrulayanı sahip ekipten olamaz; şablon böyle bir atama üretirse doğrulayan boş kalır ve PM atar.
5. Katalog v1.1: BASE-006 “Rollback yaklaşımı tanımlandı” → sahip Network; §117 sonrası onaylayan SEO (PM onaylamaz; v1.0 değişmedi).

Kanonik kaynak: `PROJECT_SHEET.md` §11 ve §116.

## 7. Hesaplar (2026-10-02)

- Giriş: **kullanıcı adı** (geçiş döneminde e-posta da kabul edilir). Dışarıdan kayıt yoktur; hesabı Sistem Yöneticisi açar.
- Yeni veya sıfırlanan hesap geçici şifreyle açılır; kullanıcı kendi şifresini belirlemeden uygulamayı kullanamaz.
- **Profilim**: ad, kullanıcı adı, rol, ekip, durum (salt okunur) ve mevcut şifreyle şifre değiştirme. Kullanıcı kendi rolünü/ekibini/aktifliğini değiştiremez.
- Bir ekipte birden fazla kişi olabilir. Görevin **sorumlu ekibi** ile o ekipteki **atanan kişi** ayrıdır (“Ekip İçinde Ata”). Kişi değişse de onay kuralı değişmez: F/B/N/C işlerini yalnızca SEO onaylar.
- **Kanıt kim ekler?** Tespit eden (bulgunun kaynak dosyası), sorumlu ekipteki atanan kişi (düzeltme kanıtı) ve doğrulayan (doğrulama kanıtı). Diğerleri görüntüler. Kimse başkasının kanıtını değiştiremez veya silemez.
- **Proje ekibi** (proje sayfası): PM ve her ekip için varsayılan kişi. Yalnızca yeni işler için geçerlidir; mevcut görevler ayrıca “Ekip İçinde Ata” ile atanır.
- Açık görevi veya proje/yayın varsayılanı olan kullanıcı pasife alınamaz, ekibi veya rolü değiştirilemez; önce yeniden atama yapılır.
