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
| Ekip üyesi | “Benim yapmam gereken ne?” | Kendi ekibinin görevini başlatır, kanıt ekler, onaya gönderir, düzeltme geri bildirimini görür; Ekip İçi Onay görevini doğrular | Başka ekibin görevini değiştiremez; SEO Onayı Zorunlu görevi onaylayamaz; yayını “Yayına Hazır” yapamaz |
| SEO Lideri | “Neyi doğrulamam gerekiyor?” | Gerçek SEO görevlerinin sahibidir; SEO Onayı Zorunlu görevleri doğrular; Çapraz Onay görevini yalnızca doğrulayan olarak atanmışsa kuyruğunda görür; düzeltme ister; kontrol şablonlarını yönetir | Sorun SEO’yu etkiliyor diye Frontend/Backend/Network işini üstlenmez; Ekip İçi Onay görevleri kuyruğuna düşmez |
| Proje Yöneticisi | “Yayını ne blokluyor ve kimde?” | Yayın oluşturur (görevler şablondan otomatik gelir), sahiplik/hazırlık/engelleri izler, sorumlu/doğrulayan/öncelik düzeltir, yayın adımlarını yürütür | Canonical, WAF, H1 gibi teknik doğrulamayı PM olduğu için yapmaz (bkz. §6) |
| Yönetim | “Bu site yayına çıkabilir mi?” | Yayın Durumu’nu görür: karar, kritik sayısı, riskin kimde olduğu, hedef | Hiçbir görevi değiştiremez, onaylayamaz, sorun açamaz, yayına alamaz, yeniden açamaz (UI + sunucu) |
| Sistem Yöneticisi | — | Kullanıcı ve sistem yönetimi; acil durumda tüm işlemler | Normal operasyon yolu değildir |

## 3. Görev nereden gelir?

**A — Standart yayın görevleri:** PM yeni yayın oluşturur, kontrol şablonunu ve kapsamı seçer. Görevler şablondan **otomatik** oluşur; sorumlu ekip, doğrulama tipi, öncelik, kanıt zorunluluğu ve SOP metinleri kopyalanır (snapshot). PM görevleri tek tek girmez. Şablon sonradan değişirse mevcut yayındaki görevler değişmez.

**B — Sonradan tespit edilen sorun:**
- Sorun mevcut bir kontrol görevinin kapsamındaysa (ör. “Canonical staging domain gösteriyor” → FE-015): doğrulayan görevi **Düzeltme İste** ile geri gönderir. Sistem **Tespit Eden** olarak doğrulayanı/ekibini kaydeder; **Sorumlu Ekip** değişmez.
- Sorun hiçbir mevcut görevin kapsamında değilse: V0’da serbest “Yeni Sorun” oluşturma **yoktur**. Bu, ürün kararı bekleyen bir konudur (bkz. `IMPLEMENTATION_STATUS.md` → Blocked Decisions). O zamana kadar sorun PM’e iletilir; PM gerekiyorsa ilgili görevi yeniden açar veya sorumluyu/doğrulayanı düzeltir.

## 4. Doğrulama kuralları

| Tip | Kim yapar | Kim doğrular | Not |
|---|---|---|---|
| Ekip İçi Onay | Sorumlu ekip | Aynı ekipten atanmış doğrulayan | SEO kuyruğuna düşmez |
| Çapraz Onay | Sorumlu ekip | Atanmış doğrulayan (başka ekip/kişi) | Sahip kendi görevini onaylayamaz; ilgisiz ekip onaylayamaz; yalnızca atanmış doğrulayanın kuyruğuna düşer |
| SEO Onayı Zorunlu | Sorumlu ekip | SEO | SEO onayı olmadan “Onaylandı” olamaz; SEO sahip olmaz |

Akış: **Açık → Çalışmaya Başla → kanıt ekle → Onaya Gönder → (Onayla | Düzeltme İste) → Düzeltmeye Başla → yeni kanıt → Onaya Gönder**. Kanıt zorunlu görev kanıtsız gönderilemez. Her adım geçmişe (audit) yazılır ve silinmez.

## 5. Örnek

```text
Görev:          Canonical staging/localhost göstermiyor (FE-015)
Tespit Eden:    SEO / GEO · Gökhan (SEO Lideri)
Etkilenen Alan: SEO
Sorumlu Ekip:   Frontend
Öncelik:        P0 · Kritik
Doğrulama:      SEO Onayı Zorunlu
```

Frontend düzeltir, kanıt ekler, onaya gönderir; SEO doğrular. Yönetim ekranı “SEO’da sorun var” demez: sorun Frontend’dedir, SEO tespit etmiştir.

## 6. Açık ürün kararları

1. **Serbest “Yeni Sorun” oluşturma** — spesifikasyonun yetki matrisinde yok; kaynak (şablon dışı görev), P0 oluşturma yetkisi ve yayın kararına etkisi tanımlanmalı.
2. **PM ve SEO’nun doğrulama kapsamı** — spesifikasyon (Bölüm 11) PM ve SEO’ya tüm görevlerde “Review ✓” verir; sistem buna uygundur. “PM teknik doğrulama yapmaz / SEO Ekip İçi Onay’da evrensel doğrulayan olmaz” kuralı istenirse yetki matrisi değişmelidir. Bugün kuyruklar bunu uygular (PM ve SEO’ya Ekip İçi Onay görevleri düşmez), yetki ise daha geniştir.
3. **Çapraz Onay varsayılan doğrulayanı** — katalogda tüm Çapraz Onay kontrolleri için varsayılan doğrulayan SEO’dur (spesifikasyon örneğiyle uyumlu). Belirli kontrollerin başka ekibe atanması katalog kararıdır; bugün PM/Sistem Yöneticisi “Doğrulayanı Değiştir” ile görev bazında düzeltebilir.
