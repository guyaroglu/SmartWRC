# SMARTNET WEB RELEASE CONTROL

## FINAL PROJECT SHEET 

**Document Status:** FINAL SPECIFICATION  
**Project Name:** SmartNet Web Release Control  
**Short Name:** WRC  
**Product Type:** Self-hosted internal web application  
**Primary Organization:** SmartNet  
**Initial Delivery Target:** 1–2 day usable V0 / pilot  
**Long-Term Direction:** Web Release Quality, SEO/GEO Governance and Automated Verification Platform  
**Architecture:** Self-hosted modular monolith  
**Core Stack:** Next.js + TypeScript + PostgreSQL + Prisma + Auth.js + Docker Compose  
**Primary Principle:** **Doğru ekip doğru işi doğru yapsın.**

---

# 0. EXECUTIVE SUMMARY

SmartNet Web Release Control, SmartNet tarafından geliştirilen veya yönetilen web projelerinin yayına çıkmadan önce ve yayına çıktıktan sonra gerekli teknik, içerik, SEO ve GEO kontrollerinden geçtiğini doğrulayan şirket içi bir kalite ve release-governance platformudur.

Bu ürünün ortaya çıkış nedeni yalnızca web sitelerinde hata bulunması değildir.

Temel organizasyonel problem şudur:

> SEO'yu etkileyen pek çok teknik veya içerik problemi, uygulama sorumluluğu başka ekiplerde olmasına rağmen SEO tarafından çözülmesi gereken bir konu gibi değerlendirilebilmektedir.

Örnek:

```text
Canonical yanlış
→ uygulama sahibi Frontend

Redirect eksik
→ uygulama sahibi Backend

Googlebot WAF tarafından bloklanıyor
→ uygulama sahibi Network

H1 / içerik / alt text hatalı
→ uygulama sahibi Content

Canonical stratejisi belirsiz
→ SEO

SEO/GEO release standardı
→ SEO
```

WRC bu ayrımı sistematik hale getirir.

Amaç:

> **SEO her şeyi kontrol etsin değildir.**

Amaç:

> **Her ekip SEO/GEO dahil kendi yaptığı işin release kalitesinden sorumlu olsun.**

SEO;

- standardı belirler,
- kritik SEO/GEO kararlarını verir,
- gerekli kontrolleri doğrular,
- yanlış ownership'i düzeltir,
- gerektiğinde sistemi override/reopen edebilir,
- fakat diğer ekiplerin temel sorumluluklarını onların yerine yerine getirmez.

WRC'nin temel sorusu:

> **Bu release güvenli ve doğrulanmış biçimde yayına çıkabilir mi?**

---

# 1. PROBLEM STATEMENT

SmartNet web projelerinde farklı ekiplerin yaptığı işler birbirini doğrudan etkilemektedir.

Backend, Frontend, Network, Content ve SEO arasında bir kalite kontrol standardı bulunmadığında şu problemler oluşabilir:

- SEO'yu etkileyen her problemin SEO'ya yönlendirilmesi
- Görev sahipliğinin belirsiz olması
- Bir işin “yapıldı” denmesine rağmen doğrulanmamış olması
- Aynı problemin farklı ekip checklistlerinde tekrar tekrar tutulması
- Site yayına çıktıktan sonra kritik problemler bulunması
- “Bu kimin sorumluluğuydu?” tartışmaları
- Aynı hataların farklı projelerde tekrar edilmesi
- Ekiplerin temel SEO/GEO gereksinimlerini öğrenmemesi
- Yönetimin gerçek release riskini görememesi
- Checklistlerin yalnızca işaretlenip gerçek kalite kontrol yapılmaması

WRC bu problemlerin ortak çözüm katmanı olacaktır.

---

# 2. ÜRÜNÜN TEMEL HEDEFİ

WRC'nin görevi:

> Bir web release'inin yayına hazır olup olmadığını objektif ve izlenebilir şekilde belirlemektir.

Bunun için sistem aşağıdaki soruları cevaplamalıdır:

1. Hangi kontroller yapılmalı?
2. Kontrolün gerçek sahibi hangi ekip?
3. Kontrolü hangi kullanıcı yapacak?
4. Kontrolün neden önemli olduğu biliniyor mu?
5. Nasıl kontrol edileceği açıklanmış mı?
6. Nasıl düzeltileceği açıklanmış mı?
7. Evidence gerekli mi?
8. Kontrolü kim doğrulayacak?
9. Kontrol başarısız olursa gerçek owner kim?
10. Release'i engelliyor mu?
11. Release gerçekten READY mi?
12. Deploy sonrası production doğrulandı mı?
13. Kim, neyi, ne zaman değiştirdi?
14. Aynı hata ekip tarafından tekrar ediliyor mu?

---

# 3. ÜRÜNÜN YAPMAYACAĞI ŞEYLER

WRC genel proje yönetim sistemi değildir.

Aşağıdaki özellikler WRC'nin ana kapsamı değildir:

```text
Sprint Management
Story Points
General Task Management
Gantt
Timesheets
Employee Tracking
CRM
Wiki
Team Chat
Resource Planning
Generic Kanban Builder
Software Backlog Management
General Bug Tracker
Mobile App
General Document Management
```

Örnek:

Development task:

> Header component geliştir.

WRC içerisinde tutulmaz.

WRC kontrolü:

> Header ve navigation production ortamında desktop ve mobilde doğru çalışıyor mu?

Başka örnek:

Development task:

> Redirect middleware yaz.

WRC kontrolü:

> Eski URL'ler hedef yeni URL'lere doğru HTTP 301 ile ve redirect chain oluşturmadan yönleniyor mu?

Temel scope guard:

> **Biz Jira yapmıyoruz.**

> **Biz yalnızca checklist uygulaması da yapmıyoruz.**

> **Biz SmartNet'in Web Release Quality Gate sistemini yapıyoruz.**

---

# 4. ARCHITECTURE DECISION RECORD — NEDEN CUSTOM?

## Decision

SmartNet WRC, OpenProject Community üzerine kurulmayacak.

Dar kapsamlı custom uygulama geliştirilecektir.

## Neden?

OpenProject bugünkü manuel checklist ihtiyacının önemli kısmını karşılayabilir.

Ancak WRC'nin doğal gelişim yönü:

```text
Manual Checks
↓
Role-specific Ownership
↓
Custom Release Gate
↓
Evidence Rules
↓
SEO/GEO Verification
↓
Automated Crawling
↓
GSC / Bing Integrations
↓
Automated Post-launch Verification
↓
Release Quality Intelligence
```

şeklindedir.

Bu noktada OpenProject'in task/work-package modeli giderek WRC domain modeline uyarlanmak zorunda kalacaktır.

WRC'nin doğal primitive'i:

```text
Project
→ Release
→ Release Check
→ Evidence
→ Verification
→ Gate
→ Deploy
→ Production Verification
```

olacaktır.

## Custom kararının koşulu

Custom geliştirme yalnızca şu şartlarla geçerlidir:

1. Scope yalnızca Web Release Control alanında kalacak.
2. Genel project-management özellikleri eklenmeyecek.
3. Sistem modüler monolith olarak kalacak.
4. Gereksiz infrastructure eklenmeyecek.
5. Kod SmartNet kurumsal repository'sinde tutulacak.
6. Deployment dokümante edilecek.
7. En az ikinci bir teknik kişi sistemi devralabilecek.
8. Backup ve restore gerçekten test edilecek.

## Kararın OpenProject'e döneceği durumlar

Aşağıdakilerden biri gerçekleşirse custom geliştirme yeniden değerlendirilir:

- Sistem esas olarak manuel checklist olarak kalırsa
- Genel project-management talepleri ağırlık kazanırsa
- İkinci teknik maintainer bulunamazsa
- Sistem tek kişilik kara kutuya dönüşürse
- Custom geliştirme maliyeti ana iş sonucunu aşmaya başlarsa
- Release-control dışı özellikler roadmap'i domine etmeye başlarsa

---

# 5. ANA DOMAIN MODELİ

Sistemin merkezi `Release` olacaktır.

```text
PROJECT
   ↓
RELEASE
   ↓
RELEASE CHECKS
   ↓
EXECUTION
   ↓
VERIFICATION
   ↓
RELEASE GATE
   ↓
DEPLOYMENT
   ↓
POST-LAUNCH VERIFICATION
   ↓
PRODUCTION VERIFIED
```

Örnek:

```text
PROJECT
Audi Türkiye

RELEASE
Website Migration — October 2026

CHECKS
Canonical
Redirects
Robots
Content
Forms
Tracking
Crawler Access
...

GATE
NO-GO

REASON
2 open P0 blockers
```

---

# 6. PROJECT VE RELEASE AYRIMI

## Project

Uzun ömürlü müşteri / site / ürün varlığıdır.

Örnek:

```text
Audi Türkiye
Vaillant Türkiye
DemirDöküm
İklimsa
Yenitepe Diş
```

## Release

Project altında gerçekleşen belirli yayın/değişiklik dönemidir.

Örnek:

```text
Audi Türkiye
├── Website Migration — October 2026
├── Model Pages Update — December 2026
└── Configurator Launch — March 2027
```

Project bir kez oluşturulur.

Her önemli yayın için ayrı Release oluşturulur.

---

# 7. RELEASE OLUŞTURMA KRİTERİ

Her küçük değişiklik WRC Release olmak zorunda değildir.

Release oluşturulması gerekir veya güçlü şekilde değerlendirilmelidir eğer değişiklik:

```text
URL structure
Domain
Migration
Indexability
Canonical behaviour
Redirect behaviour
Tracking
Production infrastructure
Critical templates
Language
Country
Major site redesign
Major content architecture
Forms / lead generation
E-commerce critical flow
SEO visibility
GEO visibility
Important customer-facing functionality
```

alanlarından birini etkiliyorsa.

Örnek:

```text
Bir yazım hatasının düzeltilmesi
→ Release gerekli değil

50 bayi sayfasının yeni URL yapısıyla yayınlanması
→ Release gerekli

Yeni ülke sitesinin açılması
→ Release gerekli

Site migration
→ Release gerekli
```

---

# 8. TEAM VE DOMAIN AYRIMI

İki farklı kavram olacaktır.

## Team

İşi yapan ekip.

Başlangıç ekipleri:

```text
Backend
Frontend
Network
Content
SEO
```

Gelecekte eklenebilir:

```text
UX
Analytics
QA
Design
```

Team mümkün olduğunca kod içine hard-code edilmemelidir.

## Domain

Kontrolün etkilediği kalite alanıdır.

Başlangıç domainleri:

```text
SEO
GEO
PERFORMANCE
ANALYTICS
INFRASTRUCTURE
UX
ACCESSIBILITY
SECURITY
CONTENT_QUALITY
```

Bir kontrol birden fazla domain ile ilişkilendirilebilir.

Örnek:

```text
Control:
Main content is accessible in rendered HTML

Owner:
Frontend

Domains:
SEO
GEO
```

---

# 9. ORGANİZASYON ROLLERİ

Ana roller:

```text
TEAM_MEMBER
SEO_LEAD
PROJECT_MANAGER
MANAGEMENT
SYSTEM_ADMIN
```

## TEAM_MEMBER

Backend, Frontend, Network veya Content kullanıcıları.

## SEO_LEAD

SEO/GEO kalite standardından sorumlu tam operasyonel kullanıcı.

## PROJECT_MANAGER

Release operasyon ve koordinasyon sorumlusu.

## MANAGEMENT

Read-only yönetim görünümü.

## SYSTEM_ADMIN

Teknik sistem yönetimi.

SEO_LEAD ile SYSTEM_ADMIN aynı kavram değildir.

Pilot aşamada aynı kullanıcı iki role sahip olabilir ancak sistem seviyesinde ayrım korunmalıdır.

---

# 10. SEO LEAD YETKİSİ

SEO Lead:

```text
All projects: VIEW
All releases: VIEW
All checks: VIEW

Change owner: YES
Change reviewer: YES
Change priority: YES
Reopen: YES
Fail: YES
Verify: YES
Manage blockers: YES
Waive: YES
Override: YES
Manage templates: YES
Manage SEO/GEO rules: YES
```

Ancak:

> SEO Lead başka ekibin normal required control'ünü onların yerine tamamlayan kişi değildir.

SEO'nun full yetkisi:

> gerektiğinde sistemi yönetebilmek

içindir.

> diğer ekiplerin işini yapmak

için değildir.

---

# 11. PERMISSION MATRIX

| Capability | Team Member | SEO Lead | PM | Management | System Admin |
|---|---:|---:|---:|---:|---:|
| View own checks | ✓ | ✓ | ✓ | ✓ | ✓ |
| View other teams | View | ✓ | ✓ | View | ✓ |
| Edit own checks (start / evidence / submit) | Own team | Own team (SEO) | — | — | ✓ |
| Add evidence | Own team | Own team (SEO) | — | — | ✓ |
| Submit review | Own team | Own team (SEO) | — | — | ✓ |
| Review / PASS | By contract¹ | By contract¹ | — | — | ✓ (override) |
| Fail (request correction) | By contract¹ | By contract¹ | — | — | ✓ (override) |
| Create ad-hoc issue (+ Yeni Sorun) | — | ✓ | ✓ | — | ✓ |
| Reopen | — | ✓ | ✓ | — | ✓ |
| Change owner | — | ✓ | ✓ | — | ✓ |
| Change reviewer | — | ✓ | ✓ | — | ✓ |
| Change P0/P1 priority | — | ✓ | ✓ | — | ✓ |
| Override | — | ✓ | Limited | — | ✓ |
| Waive | — | ✓ | Limited | — | ✓ |
| Manage templates | — | ✓ | Limited | — | ✓ |
| Create project | — | ✓ | ✓ | — | ✓ |
| Create release | — | ✓ | ✓ | — | ✓ |
| Mark deployed | — | ✓ | ✓ | — | ✓ |
| System settings | — | — | — | — | ✓ |
| User administration | — | — | Limited | — | ✓ |

¹ **By contract** (Pre-Staging Spec Closure, §116): approval authority comes from the check's verification type, not from a role.
SELF → owner team; CROSS_TEAM → only the assigned reviewer, who must not be in the owner team; SEO_GATED → SEO Lead.
PM is not a technical reviewer. SEO is not a universal reviewer. System Admin keeps an administrative override.

Authorization yalnızca UI'da buton gizleyerek uygulanmaz.

**Server-side enforce edilir.**

---

# 12. VERIFICATION MODELİ

Her check üç verification türünden birine sahiptir.

```text
SELF
CROSS_TEAM
SEO_GATED
```

## SELF

Owner ekip kendi kontrolünü doğrulayabilir.

Örnek:

```text
Broken image yok.

Owner:
Frontend

Verification:
SELF
```

## CROSS_TEAM

Başka bir kullanıcı veya ekip doğrular.

Örnek:

```text
GA4 conversion event works.

Owner:
Frontend

Reviewer:
SEO

Verification:
CROSS_TEAM
```

## SEO_GATED

SEO onayı olmadan PASS olamaz.

Örnek:

```text
Migration redirect mapping is correct.

Owner:
Backend

Reviewer:
SEO

Verification:
SEO_GATED
```

CROSS_TEAM, SEO demek değildir: doğrulayan, kontrolün/şablonun atadığı kişidir (SEO olabilir, başka bir ekipten biri de olabilir). Sahip ekip kendi CROSS_TEAM kontrolünü onaylayamaz.

Priority ve Verification Type farklı kavramlardır.

P0 olmak:

> mutlaka SEO review

anlamına gelmez.

---

# 13. RELEASE CHECK MODELİ

Her ReleaseCheck en az aşağıdaki bilgileri taşımalıdır:

```text
id

release_id

template_control_snapshot

title
description

owner_team_id
owner_user_id

reviewer_user_id

domains[]

priority

verification_type

status

release_blocker

evidence_required

found_by_user_id
found_by_team_id

blocked_by

block_reason

why_it_matters

expected_result

how_to_check

how_to_fix

escalation_rule

lifecycle_phase

result_source

fail_reason

created_at
updated_at
completed_at
verified_at
```

---

# 14. MASTER CONTROL MODELİ

Her master control en az:

```text
Title
Description

Default Owner Team
Default Reviewer

Domains

Default Priority

Verification Type

Release Blocker

Evidence Requirement

Why It Matters

Expected Result

How To Check

How To Fix

Escalation Rule

Applicable Project Types

Applicable Modules

Lifecycle Phase
```

bilgilerini taşımalıdır.

---

# 15. CHECK'İN EĞİTİM KATMANI

Bir kullanıcı yalnızca:

> Canonical doğru mu?

görmemelidir.

Aynı ekranda:

```text
Why It Matters

Expected Result

How To Check

How To Fix

When To Escalate
```

bulunmalıdır.

Amaç:

> checklist doldurtmak değil, ekiplerin aynı konuları zaman içerisinde öğrenmesini sağlamaktır.

Örnek:

## Canonical Uses Production URL

**Owner:** Frontend  
**Domain:** SEO  
**Priority:** P0  
**Verification:** SEO_GATED

### Why It Matters

Canonical arama motorlarına sayfanın tercih edilen URL versiyonunu bildirir.

### Expected Result

Production sayfası doğru production URL'sine canonical vermelidir.

### How To Check

Rendered HTML veya page source içerisinde:

```html
<link rel="canonical">
```

kontrol edilir.

### FAIL

```text
https://staging.example.com/product
```

### PASS

```text
https://www.example.com/product
```

### Escalation

Hangi URL'nin canonical olması gerektiği stratejik olarak belirsizse SEO'ya eskale edilir.

---

# 16. STATUS STATE MACHINE

Normal akış:

```text
NOT_STARTED
     ↓
IN_PROGRESS
     ↓
REVIEW
     ↓
PASS
```

Alternatif durumlar:

```text
FAIL
BLOCKED
N/A
WAIVED
```

FAIL sonrası:

```text
FAIL
 ↓
IN_PROGRESS
 ↓
REVIEW
 ↓
PASS
```

---

# 17. N/A

Bir kontrol release için gerçekten geçerli değilse kullanılabilir.

N/A uygulandığında:

```text
reason
actor
timestamp
```

saklanmalıdır.

P0 kontrollerde N/A yalnızca yetkili kullanıcı tarafından verilebilmelidir.

---

# 18. WAIVED

Kontrol bilinçli şekilde yapılmayacak veya risk kabul edilecekse kullanılır.

WAIVED için zorunlu:

```text
Reason

Risk explanation

Waived by

Timestamp
```

WAIVED sessiz PASS değildir.

Gate Engine WAIVED kontrolü konfigürasyona göre:

```text
accepted risk
```

olarak değerlendirebilir.

---

# 19. PRIORITY

```text
P0
P1
P2
P3
```

## P0

Kritik / release blocker.

## P1

Yüksek risk.

## P2

Orta risk.

## P3

İyileştirme / düşük risk / deneysel.

Owner kullanıcı kendi kontrolünün P0/P1 seviyesini tek başına düşüremez.

---

# 20. FOUND BY ≠ OWNED BY

Bu ayrım zorunludur.

Örnek:

```text
Issue:
54 pages have incorrect canonical.

Found By:
SEO

Owned By:
Frontend

Domain:
SEO
```

Yönetim ekranı:

> SEO'da 54 problem var.

dememelidir.

Doğru ifade:

> SEO tarafından tespit edilen Frontend kaynaklı problem.

Başka örnek:

```text
Issue:
Googlebot receives 403.

Found By:
SEO

Owned By:
Network

Domains:
SEO
INFRASTRUCTURE
```

---

# 21. BLOCKED MODELİ

BLOCKED olduğunda zorunlu:

```text
Blocked By
Block Reason
```

Blocked By seçenekleri başlangıçta:

```text
Backend
Frontend
Network
Content
SEO
Client
External
```

Örnek:

```text
Blocked By:
SEO

Reason:
Canonical strategy for filtered URLs has not been defined.
```

geçerlidir.

Ancak:

```text
Frontend canonical component'i henüz yazmadı.
```

SEO blocker değildir.

Owner Frontend olarak kalır.

---

# 22. EVIDENCE

Evidence türleri:

```text
URL
TEXT
SCREENSHOT
FILE
EXTERNAL_TICKET
TEST_RESULT
```

Evidence gerektiğinde kontrol PASS olamaz.

Örnek:

```text
Check:
HTTP → HTTPS redirect

Evidence:
URL: http://example.com

Observed:
301

Target:
https://www.example.com/
```

Temel ilke:

> “Yaptım” evidence değildir.

---

# 23. RELEASE GATE

Release Gate kullanıcı tarafından manuel seçilemez.

Gate Engine tarafından hesaplanır.

Ana gate durumları:

```text
NOT_ASSESSED
NO_GO
AT_RISK
READY
```

Deployment lifecycle ayrıca tutulur:

```text
NOT_DEPLOYED
DEPLOYED
POST_LAUNCH_VERIFYING
PRODUCTION_VERIFIED
```

Gate state ile deployment state birbirinden ayrılmalıdır.

---

# 24. NOT_ASSESSED

Aşağıdaki durumlarda:

```text
release newly created

baseline not completed

mandatory controls not classified
```

Gate:

```text
NOT_ASSESSED
```

olur.

Yeni eklenen devam eden projelerin sisteme girildiği anda yanlışlıkla NO-GO görünmesini engeller.

---

# 25. NO_GO

Minimum kural:

```text
Any unresolved P0 release blocker
OR
Any failed P0 blocker
OR
Required P0 evidence missing
OR
Required P0 verification missing
```

→

```text
NO_GO
```

---

# 26. AT_RISK

Örnek:

```text
No open P0 blocker

BUT

unresolved P1
OR
required review pending
OR
required evidence missing
OR
important unresolved non-blocking issue
```

→

```text
AT_RISK
```

---

# 27. READY

READY için:

```text
No unresolved release blocker

All mandatory P0 checks resolved

Required P1 rules satisfied

Required evidence present

Required reviews completed

No mandatory check is FAIL/BLOCKED/REVIEW

Baseline completed
```

olmalıdır.

READY manuel değiştirilemez.

---

# 28. DEPLOYMENT AUTHORITY

Normal koşulda deployment yalnızca:

```text
Gate = READY
```

iken işaretlenebilir.

`READY → DEPLOYED` işlemini:

```text
PROJECT_MANAGER
or
SEO_LEAD
```

yapabilir.

Kaydedilecek:

```text
deployed_by
deployed_at
deployment_note
deployment_reference
```

---

# 29. EMERGENCY DEPLOY OVERRIDE

NO_GO veya AT_RISK durumda deployment gerekiyorsa normal workflow bypass edilmemelidir.

Ayrı bir:

```text
EMERGENCY_DEPLOY_OVERRIDE
```

işlemi kullanılmalıdır.

Zorunlu:

```text
Reason
Open risks
Approver 1
Approver 2
Timestamp
```

Minimum iki kişilik approval:

```text
PM + SEO Lead

OR

PM + Management
```

Audit log'a açık şekilde yazılır:

```text
DEPLOYED WITH OPEN RISKS
```

Bu işlem READY yaratmaz.

---

# 30. POST-LAUNCH VERIFICATION

Deploy başarılı olması production doğrulandığı anlamına gelmez.

Akış:

```text
READY
↓
DEPLOYED
↓
POST_LAUNCH_VERIFYING
↓
PRODUCTION_VERIFIED
```

---

# 31. VERIFICATION CHECKPOINTS

Sistem checkpoint kavramını desteklemelidir.

Başlangıç checkpointleri:

```text
RELEASE_DAY
T_PLUS_24H
T_PLUS_7D
```

Her proje için hepsi zorunlu olmayabilir.

## RELEASE_DAY

Örnek:

```text
DNS
SSL
HTTP
Critical pages
Forms
Tracking
Robots
Canonical
Sitemap
Redirects
Crawler access
Production assets
```

## T_PLUS_24H

Örnek:

```text
Full crawl
Broken links
Indexability
Tracking
Server errors
Redirect verification
Sitemap verification
```

## T_PLUS_7D

Özellikle migration ve büyük değişikliklerde:

```text
404 anomalies
Redirect anomalies
Indexation anomalies
GSC anomalies
Traffic anomalies
AI/search crawler accessibility
```

---

# 32. PRODUCTION_VERIFIED

PRODUCTION_VERIFIED yalnızca gerekli post-launch checkpointleri tamamlandıysa oluşabilir.

Bu durum manuel bir kozmetik etiket değildir.

---

# 33. YENİ RELEASE AKIŞI

```text
Select Project
↓
Create Release
↓
Select Release Type
↓
Select Scope Modules
↓
Select Target Date
↓
Generate Applicable Checks
↓
Apply Default Team Assignments
↓
Review Generated Scope
↓
Activate Release
```

---

# 34. RELEASE SCOPE SORULARI

Release oluştururken örnek:

```text
Corporate Website        YES / NO
Migration                YES / NO
Multilingual             YES / NO
E-commerce               YES / NO
Lead Forms               YES / NO
CDN/WAF                  YES / NO
Analytics                YES / NO
GEO                      YES / NO
Post-launch Monitoring   YES / NO
```

Sistem bütün master kontrolleri indiscriminately eklememelidir.

Yalnızca applicable controls instantiate edilir.

---

# 35. DEVAM EDEN İŞLERİN SİSTEME ALINMASI

Onboarding types:

```text
NEW
IN_PROGRESS
LIVE_UNVERIFIED
```

---

# 36. IN_PROGRESS

Mevcut proje sisteme alındığında tüm kontroller:

```text
NOT_STARTED
```

yapılmaz.

Kullanılabilecek initial states:

```text
NOT_STARTED
IN_PROGRESS
DONE_NEEDS_VERIFICATION
BLOCKED
N/A
```

`DONE_NEEDS_VERIFICATION`:

```text
PASS
```

değildir.

Doğrulama sonrası PASS olabilir.

---

# 37. BASELINE

Devam eden proje için:

```text
baseline_at
```

kaydedilir.

Örnek:

```text
2026-09-23 10:30 Europe/Istanbul
```

Audit:

```text
Release imported as IN_PROGRESS.
Previous execution history existed outside WRC.
```

Sistem geçmişi uydurmaz.

---

# 38. BASELINE SORUMLULUĞU

Baseline'ı SEO tek başına doldurmaz.

Backend:

> Backend kontrollerini

Frontend:

> Frontend kontrollerini

Network:

> Network kontrollerini

Content:

> Content kontrollerini

sınıflandırır.

SEO yalnızca kendi kontrollerini ve gerekli doğrulamaları yapar.

Bu ürünün eğitim/ownership amacı açısından zorunludur.

---

# 39. LIVE_UNVERIFIED

Site zaten production'a çıktıysa geçmiş pre-launch kontroller sahte şekilde doldurulmaz.

Release:

```text
LIVE_UNVERIFIED
```

olarak oluşturulur.

Production verification kontrolleri çalıştırılır.

Başarı sonrası:

```text
PRODUCTION_VERIFIED
```

olabilir.

---

# 40. PROJECT TEAM MAPPING

Project seviyesinde default ekip eşleştirmesi bulunacaktır.

Örnek:

```text
Audi Türkiye

Backend  → User A
Frontend → User B
Network  → User C
Content  → User D
SEO      → Gökhan
PM       → User E
```

Yeni release'te otomatik uygulanır.

Release seviyesinde override edilebilir.

---

# 41. TEMPLATE VERSIONING

Master template ile ReleaseCheck instance aynı kayıt değildir.

Örnek:

```text
Corporate Website Template v1.4
```

Release oluşturulurken ilgili kontroller snapshot olarak kopyalanır.

Template daha sonra:

```text
v1.5
```

olursa geçmiş release değişmez.

---

# 42. FULL SNAPSHOT RULE

ReleaseCheck oluşturulurken yalnızca title değil aşağıdaki master metadata snapshot olarak saklanmalıdır:

```text
Title
Description
Owner Team
Reviewer
Domains
Priority
Verification Type
Release Blocker
Evidence Requirement
Why It Matters
Expected Result
How To Check
How To Fix
Escalation Rule
Lifecycle Phase
```

Böylece gelecekte master template değişikliği:

> geçmiş release'in anlamını değiştiremez.

---

# 43. TEMPLATE MODULES

Başlangıç modülleri:

```text
BASE
BACKEND
FRONTEND
NETWORK
CONTENT
SEO
GEO
ANALYTICS
MIGRATION
MULTILINGUAL
ECOMMERCE
POST_LAUNCH
```

---

# 44. MASTER CONTROL LIBRARY — BASE

Aşağıdaki kontroller başlangıç seed library'nin parçasıdır.

| ID | Control | Owner | Priority | Verification |
|---|---|---|---|---|
| BASE-001 | Production domain kesinleştirildi | PM | P0 | SELF |
| BASE-002 | Release target date belirlendi | PM | P1 | SELF |
| BASE-003 | Release kapsamı tanımlandı | PM | P1 | SELF |
| BASE-004 | İlgili ekip/owner atamaları tamamlandı | PM | P1 | SELF |
| BASE-005 | Kritik third-party bağımlılıklar belirlendi | PM | P1 | SELF |
| BASE-006 | Rollback yaklaşımı tanımlandı | PM | P0 | CROSS_TEAM |
| BASE-007 | Production credentials/secrets hazır | System/Admin | P0 | SELF |
| BASE-008 | Release sırasında iletişim/escalation sahipleri belli | PM | P1 | SELF |
| BASE-009 | Gerekli release modülleri doğru seçildi | PM | P1 | CROSS_TEAM |
| BASE-010 | Staging ve production ortamları birbirinden ayrılmış | Backend/Infra | P0 | SELF |

---

# 45. MASTER CONTROL LIBRARY — BACKEND

| ID | Control | Domain | Priority | Verification |
|---|---|---|---|---|
| BE-001 | Production API endpointleri doğru | Infrastructure | P0 | SELF |
| BE-002 | Test/mock endpointleri production'da kullanılmıyor | Infrastructure | P0 | SELF |
| BE-003 | Test/mock data production'da bulunmuyor | Infrastructure | P1 | SELF |
| BE-004 | Kritik endpointler beklenen HTTP status döndürüyor | Infrastructure | P0 | SELF |
| BE-005 | Gerçek olmayan 404'ler düzeltilmiş | SEO | P1 | CROSS_TEAM |
| BE-006 | Gerçek olmayan 200/soft-404 davranışı yok | SEO | P1 | SEO_GATED |
| BE-007 | Custom 404 gerçek HTTP 404 döndürüyor | SEO | P1 | SEO_GATED |
| BE-008 | Server error durumları loglanıyor | Infrastructure | P1 | SELF |
| BE-009 | Kritik 5xx problemi bulunmuyor | Infrastructure | P0 | SELF |
| BE-010 | Redirect mapping uygulanmış | SEO | P0 | SEO_GATED |
| BE-011 | Redirect chain bulunmuyor | SEO | P0 | SEO_GATED |
| BE-012 | Redirect loop bulunmuyor | SEO | P0 | SEO_GATED |
| BE-013 | Redirectler doğru target URL'ye gidiyor | SEO | P0 | SEO_GATED |
| BE-014 | XML sitemap doğru production URL'lerini üretiyor | SEO | P0 | SEO_GATED |
| BE-015 | Sitemap yalnızca uygun indexlenebilir URL'leri içeriyor | SEO | P1 | SEO_GATED |
| BE-016 | Dynamic metadata backend kaynaklıysa production verisi doğru | SEO | P1 | CROSS_TEAM |
| BE-017 | Structured data backend üretiliyorsa doğru production data kullanıyor | SEO/GEO | P1 | SEO_GATED |
| BE-018 | Pagination backend davranışı beklendiği gibi | SEO | P1 | SEO_GATED |
| BE-019 | URL parameter davranışı beklenen şekilde | SEO | P1 | SEO_GATED |
| BE-020 | Deleted resources doğru status/redirect politikası uyguluyor | SEO | P1 | SEO_GATED |

---

# 46. MASTER CONTROL LIBRARY — FRONTEND

| ID | Control | Domain | Priority | Verification |
|---|---|---|---|---|
| FE-001 | Critical pages responsive çalışıyor | UX | P1 | SELF |
| FE-002 | Mobil horizontal overflow yok | UX | P2 | SELF |
| FE-003 | Primary navigation çalışıyor | UX | P0 | SELF |
| FE-004 | Footer links doğru | UX/SEO | P1 | SELF |
| FE-005 | Form UI/validation doğru çalışıyor | UX | P0 | SELF |
| FE-006 | Success state mevcut ve doğru | UX | P1 | SELF |
| FE-007 | Error state mevcut ve anlaşılır | UX | P1 | SELF |
| FE-008 | Broken image bulunmuyor | UX | P1 | SELF |
| FE-009 | Favicon doğru | UX | P2 | SELF |
| FE-010 | Title production'da doğru render oluyor | SEO | P1 | SEO_GATED |
| FE-011 | Meta description doğru render oluyor | SEO | P2 | CROSS_TEAM |
| FE-012 | H1 doğru render oluyor | SEO | P1 | CROSS_TEAM |
| FE-013 | Heading hierarchy teknik olarak bozuk değil | SEO/Accessibility | P2 | CROSS_TEAM |
| FE-014 | Canonical doğru production URL'sini gösteriyor | SEO | P0 | SEO_GATED |
| FE-015 | Canonical staging/localhost göstermiyor | SEO | P0 | SEO_GATED |
| FE-016 | Open Graph metadata doğru | SEO | P2 | SELF |
| FE-017 | OG image erişilebilir | SEO | P2 | SELF |
| FE-018 | Internal links gerçek navigable link olarak çalışıyor | SEO/Accessibility | P1 | CROSS_TEAM |
| FE-019 | Critical content JS hatası nedeniyle kaybolmuyor | SEO/GEO | P0 | SEO_GATED |
| FE-020 | Structured data render ediliyorsa görünür | SEO/GEO | P1 | SEO_GATED |
| FE-021 | hreflang frontend'den geliyorsa doğru render oluyor | SEO | P0 | SEO_GATED |
| FE-022 | Breadcrumb UI doğru | UX/SEO | P2 | CROSS_TEAM |
| FE-023 | Hero/LCP görseli yanlış lazy-load edilmiyor | Performance | P1 | SELF |
| FE-024 | Gereksiz büyük görseller optimize edilmiş | Performance | P2 | SELF |
| FE-025 | Non-critical images lazy-load ediliyor | Performance | P2 | SELF |
| FE-026 | Görsel width/height/aspect bilgileri layout shift yaratmıyor | Performance | P2 | SELF |
| FE-027 | Kritik console error bulunmuyor | Infrastructure/UX | P1 | SELF |
| FE-028 | Kritik failed network request bulunmuyor | Infrastructure | P1 | SELF |
| FE-029 | Production build staging asset çağırmıyor | Infrastructure | P0 | SELF |
| FE-030 | Production içerisinde localhost referansı bulunmuyor | Infrastructure | P0 | SELF |
| FE-031 | Semantic HTML temel kuralları uygulanmış | Accessibility/SEO/GEO | P2 | CROSS_TEAM |
| FE-032 | Kritik interactive elementler erişilebilir şekilde tanımlı | Accessibility/GEO | P2 | SELF |

---

# 47. MASTER CONTROL LIBRARY — NETWORK / INFRASTRUCTURE

| ID | Control | Domain | Priority | Verification |
|---|---|---|---|---|
| NET-001 | Production DNS kayıtları doğru | Infrastructure | P0 | SELF |
| NET-002 | Canonical hostname tercihi tanımlı | SEO/Infrastructure | P0 | CROSS_TEAM |
| NET-003 | www/non-www tek hostname'e yönleniyor | SEO/Infrastructure | P0 | CROSS_TEAM |
| NET-004 | HTTP → HTTPS redirect aktif | Infrastructure/SEO | P0 | SELF |
| NET-005 | SSL certificate geçerli | Infrastructure/Security | P0 | SELF |
| NET-006 | SSL certificate chain geçerli | Security | P0 | SELF |
| NET-007 | Mixed-content problemi yok | Security/UX | P1 | SELF |
| NET-008 | CDN doğru origin'e bağlı | Infrastructure | P0 | SELF |
| NET-009 | CDN cache kuralları kritik HTML'i bozacak şekilde değil | Infrastructure | P1 | SELF |
| NET-010 | Static asset caching doğru | Performance | P2 | SELF |
| NET-011 | Compression aktif | Performance | P2 | SELF |
| NET-012 | Cache purge/invalidation çalışıyor | Infrastructure | P1 | SELF |
| NET-013 | Production server public erişilebilir | Infrastructure | P0 | SELF |
| NET-014 | Kritik 5xx infrastructure problemi yok | Infrastructure | P0 | SELF |
| NET-015 | Googlebot WAF/CDN tarafından yanlışlıkla bloklanmıyor | SEO | P0 | SEO_GATED |
| NET-016 | Bingbot WAF/CDN tarafından yanlışlıkla bloklanmıyor | SEO/GEO | P1 | SEO_GATED |
| NET-017 | OAI-SearchBot WAF/CDN tarafından yanlışlıkla bloklanmıyor | GEO | P1 | SEO_GATED |
| NET-018 | robots.txt CDN'de stale sürüm değil | SEO | P0 | SEO_GATED |
| NET-019 | XML sitemap erişilebilir | SEO | P0 | SEO_GATED |
| NET-020 | Gereksiz CAPTCHA/challenge crawler erişimini engellemiyor | SEO/GEO | P1 | SEO_GATED |
| NET-021 | Country/IP restriction kritik crawlerları etkilemiyor | SEO/GEO | P1 | SEO_GATED |
| NET-022 | Uptime/health monitoring mevcut | Infrastructure | P1 | SELF |
| NET-023 | Backup mekanizması aktif | Infrastructure | P0 | CROSS_TEAM |
| NET-024 | Restore prosedürü test edilmiş | Infrastructure | P0 | CROSS_TEAM |
| NET-025 | DNS/infra değişiklikleri için rollback yolu mevcut | Infrastructure | P0 | CROSS_TEAM |

---

# 48. MASTER CONTROL LIBRARY — CONTENT

| ID | Control | Domain | Priority | Verification |
|---|---|---|---|---|
| CNT-001 | Sayfa içeriği eksiksiz | Content Quality | P1 | SELF |
| CNT-002 | Lorem ipsum / placeholder metin kalmamış | Content Quality | P1 | SELF |
| CNT-003 | Test/mock içerik production'da yok | Content Quality | P1 | SELF |
| CNT-004 | Marka/ürün isimleri doğru | Content Quality/GEO | P1 | SELF |
| CNT-005 | Fiyat/tarih/iletişim gibi kritik bilgiler güncel | Content Quality | P1 | SELF |
| CNT-006 | Yayına alınmaması gereken taslak içerik yok | Content Quality | P1 | SELF |
| CNT-007 | H1 girilmiş ve sayfa konusu ile uyumlu | SEO | P1 | CROSS_TEAM |
| CNT-008 | Heading yapısı içerik açısından mantıklı | SEO/GEO | P2 | CROSS_TEAM |
| CNT-009 | SEO Title içerik ekibi tarafından giriliyorsa tamam | SEO | P1 | CROSS_TEAM |
| CNT-010 | Meta description gerekiyorsa girilmiş | SEO | P2 | SELF |
| CNT-011 | URL slug CMS üzerinden belirleniyorsa temiz ve doğru | SEO | P1 | SEO_GATED |
| CNT-012 | Görseller doğru içerikle eşleşiyor | Content Quality | P2 | SELF |
| CNT-013 | Alt text gerektiği yerlerde anlamlı | SEO/Accessibility | P2 | SELF |
| CNT-014 | Görsel dosya adı uygunsa anlamlı | SEO | P3 | SELF |
| CNT-015 | Internal links doğru hedefe gidiyor | SEO | P1 | SELF |
| CNT-016 | Broken internal link bulunmuyor | SEO | P1 | CROSS_TEAM |
| CNT-017 | Staging URL linki kalmamış | SEO/Infrastructure | P0 | CROSS_TEAM |
| CNT-018 | localhost linki kalmamış | Infrastructure | P0 | CROSS_TEAM |
| CNT-019 | External links doğru | Content Quality | P2 | SELF |
| CNT-020 | Sayfa doğru kategori/navigation bağlamında | UX/SEO | P1 | CROSS_TEAM |
| CNT-021 | Breadcrumb content/entity isimleri doğru | SEO/GEO | P2 | SELF |
| CNT-022 | Dil versiyonu doğru içerik içeriyor | SEO/Content | P1 | CROSS_TEAM |
| CNT-023 | Author bilgisi gerekiyorsa doğru | Content Quality/GEO | P2 | SELF |
| CNT-024 | İçerikte açıkça yanlış veya stale bilgi yok | Content Quality/GEO | P1 | SELF |
| CNT-025 | Kritik iddialar gerektiğinde kanıt/kaynakla desteklenmiş | GEO/Content Quality | P2 | CROSS_TEAM |
| CNT-026 | İçerik yalnızca başka kaynakların yüzeysel özeti değil | GEO/Content Quality | P2 | CROSS_TEAM |
| CNT-027 | Önemli içerik first-party uzmanlık/değer taşıyor | GEO/Content Quality | P2 | CROSS_TEAM |
| CNT-028 | İçerik yapısı bilgiye kolay ulaşılmasını sağlıyor | GEO/UX | P2 | SELF |
| CNT-029 | Tablo/liste gerektiği yerde anlaşılır biçimde kullanılmış | GEO/UX | P3 | SELF |
| CNT-030 | Teknik SEO alanları SEO onayı olmadan değiştirilmemiş | SEO | P1 | SEO_GATED |

---

# 49. MASTER CONTROL LIBRARY — SEO

| ID | Control | Domain | Priority | Verification |
|---|---|---|---|---|
| SEO-001 | Production robots.txt doğru | SEO | P0 | SEO_GATED |
| SEO-002 | Yanlış noindex bulunmuyor | SEO | P0 | SEO_GATED |
| SEO-003 | Yanlış nofollow directive bulunmuyor | SEO | P1 | SEO_GATED |
| SEO-004 | Kritik sayfalar crawlable | SEO | P0 | SEO_GATED |
| SEO-005 | Kritik sayfalar indexable | SEO | P0 | SEO_GATED |
| SEO-006 | XML sitemap doğru production URL'lerini içeriyor | SEO | P0 | SEO_GATED |
| SEO-007 | Sitemap index yapısı gerekiyorsa doğru | SEO | P1 | SEO_GATED |
| SEO-008 | Canonical stratejisi doğru | SEO | P0 | SEO_GATED |
| SEO-009 | Duplicate URL davranışı kontrol edilmiş | SEO | P1 | SEO_GATED |
| SEO-010 | Parameter URL davranışı kontrol edilmiş | SEO | P1 | SEO_GATED |
| SEO-011 | Pagination davranışı kontrol edilmiş | SEO | P1 | SEO_GATED |
| SEO-012 | Kritik sayfalarda Title mevcut ve benzersiz | SEO | P1 | SEO_GATED |
| SEO-013 | Kritik sayfalarda H1 mevcut | SEO | P1 | SEO_GATED |
| SEO-014 | Internal linking kritik landing page'leri destekliyor | SEO | P1 | SEO_GATED |
| SEO-015 | Kritik orphan page bulunmuyor | SEO | P1 | SEO_GATED |
| SEO-016 | Structured data sayfa tipine uygun | SEO/GEO | P1 | SEO_GATED |
| SEO-017 | Structured data görünür içerikle tutarlı | SEO/GEO | P1 | SEO_GATED |
| SEO-018 | Structured data production URL'lerini kullanıyor | SEO/GEO | P0 | SEO_GATED |
| SEO-019 | hreflang gerekiyorsa doğru | SEO | P0 | SEO_GATED |
| SEO-020 | hreflang reciprocal ilişkiler doğru | SEO | P1 | SEO_GATED |
| SEO-021 | x-default gerekiyorsa doğru | SEO | P2 | SEO_GATED |
| SEO-022 | 404/redirect migration planı kontrol edilmiş | SEO | P0 | SEO_GATED |
| SEO-023 | Search Console verification korunmuş | SEO/Analytics | P1 | SEO_GATED |
| SEO-024 | Production sitemap Search Console'a gönderilebilir | SEO | P1 | SEO_GATED |
| SEO-025 | Critical pages production crawl ile doğrulanmış | SEO | P0 | SEO_GATED |
| SEO-026 | nosnippet/max-snippet/data-nosnippet kullanımı bilinçli | SEO/GEO | P2 | SEO_GATED |
| SEO-027 | Critical template'lerde metadata regression bulunmuyor | SEO | P1 | SEO_GATED |

---

# 50. MASTER CONTROL LIBRARY — GEO

GEO ayrı ekip değildir.

Aşağıdaki kontrollerin owner'ı farklı ekipler olabilir.

| ID | Control | Owner | Priority | Verification |
|---|---|---|---|---|
| GEO-001 | Googlebot kritik sayfalara erişebiliyor | Network | P0 | SEO_GATED |
| GEO-002 | Bingbot kritik sayfalara erişebiliyor | Network | P1 | SEO_GATED |
| GEO-003 | OAI-SearchBot kritik sayfalara erişebiliyor | Network | P1 | SEO_GATED |
| GEO-004 | WAF/CDN search/AI crawler erişimini yanlış engellemiyor | Network | P1 | SEO_GATED |
| GEO-005 | Kritik içerik HTML/rendered text olarak erişilebilir | Frontend | P1 | SEO_GATED |
| GEO-006 | Kritik içerik yalnızca görsel/canvas içinde değil | Frontend/Content | P1 | CROSS_TEAM |
| GEO-007 | JS rendering kritik bilgiyi crawlerlardan gizlemiyor | Frontend | P1 | SEO_GATED |
| GEO-008 | Structured entity data uygun olduğunda mevcut | Frontend/Backend | P1 | SEO_GATED |
| GEO-009 | Structured data görünür içerikle tutarlı | SEO | P1 | SEO_GATED |
| GEO-010 | Marka/entity isimleri site boyunca tutarlı | Content | P1 | CROSS_TEAM |
| GEO-011 | Adres/telefon/işletme bilgileri tutarlı | Content | P1 | CROSS_TEAM |
| GEO-012 | İçerik güncelliği kontrol edilmiş | Content | P1 | CROSS_TEAM |
| GEO-013 | Kritik factual claim'ler gerektiğinde evidence/source içeriyor | Content | P2 | CROSS_TEAM |
| GEO-014 | İçerik özgün/first-party değer içeriyor | Content | P2 | CROSS_TEAM |
| GEO-015 | Başlık ve bölüm yapısı bilginin retrieval'ını kolaylaştırıyor | Content | P2 | CROSS_TEAM |
| GEO-016 | Tablo/liste gibi yapılar gerektiğinde açık kullanılmış | Content | P3 | SELF |
| GEO-017 | Görsellerin entity/context ilişkisi anlamlı | Content | P2 | SELF |
| GEO-018 | AI referral measurement için analytics hazır | SEO/Analytics | P2 | CROSS_TEAM |
| GEO-019 | AI visibility baseline alınabiliyorsa kaydedilmiş | SEO | P2 | SELF |
| GEO-020 | llms.txt değerlendirmesi gerekiyorsa bilinçli karar verilmiş | SEO | P3 | SELF |

---

# 51. MASTER CONTROL LIBRARY — ANALYTICS

| ID | Control | Owner | Priority | Verification |
|---|---|---|---|---|
| ANL-001 | Production GA4 doğru property'ye veri gönderiyor | Frontend/SEO | P0 | CROSS_TEAM |
| ANL-002 | GTM doğru production container kullanıyor | Frontend/SEO | P0 | CROSS_TEAM |
| ANL-003 | Page view ölçümü çalışıyor | SEO/Analytics | P1 | CROSS_TEAM |
| ANL-004 | Kritik form conversion event çalışıyor | Frontend/SEO | P0 | CROSS_TEAM |
| ANL-005 | Telefon CTA tracking çalışıyor gerekiyorsa | Frontend/SEO | P1 | CROSS_TEAM |
| ANL-006 | WhatsApp CTA tracking çalışıyor gerekiyorsa | Frontend/SEO | P1 | CROSS_TEAM |
| ANL-007 | Mail CTA tracking çalışıyor gerekiyorsa | Frontend/SEO | P1 | CROSS_TEAM |
| ANL-008 | Cookie consent ölçümü beklenmedik şekilde kırmıyor | Frontend/SEO | P1 | CROSS_TEAM |
| ANL-009 | Test/staging traffic production raporunu kirletmiyor | SEO/Analytics | P2 | SELF |
| ANL-010 | AI referral kaynakları analiz edilebilir | SEO | P2 | SELF |

---

# 52. MASTER CONTROL LIBRARY — MIGRATION

| ID | Control | Owner | Priority | Verification |
|---|---|---|---|---|
| MIG-001 | Eski URL inventory hazır | SEO | P0 | SEO_GATED |
| MIG-002 | Eski→yeni URL mapping hazır | SEO/Backend | P0 | SEO_GATED |
| MIG-003 | Kritik URL'ler bire bir doğru hedefe yönleniyor | Backend | P0 | SEO_GATED |
| MIG-004 | Redirect chain yok | Backend | P0 | SEO_GATED |
| MIG-005 | Redirect loop yok | Backend | P0 | SEO_GATED |
| MIG-006 | Gereksiz homepage redirect kullanılmıyor | Backend/SEO | P0 | SEO_GATED |
| MIG-007 | Silinen içerik için uygun 404/410/redirect kararı verilmiş | SEO | P1 | SEO_GATED |
| MIG-008 | Eski canonical/staging referansı kalmamış | Frontend | P0 | SEO_GATED |
| MIG-009 | Internal links yeni URL'leri kullanıyor | Content/Frontend | P1 | CROSS_TEAM |
| MIG-010 | Sitemap yeni URL yapısını kullanıyor | Backend | P0 | SEO_GATED |
| MIG-011 | Analytics continuity doğrulandı | SEO | P1 | CROSS_TEAM |
| MIG-012 | Search Console ownership/verification korunmuş | SEO | P1 | SEO_GATED |
| MIG-013 | Launch sonrası 404 crawl planı hazır | SEO | P1 | SELF |
| MIG-014 | Launch sonrası redirect verification planı hazır | SEO | P1 | SELF |
| MIG-015 | Rollback ihtiyacı için eski yapı/konfigürasyon referansı mevcut | Backend/Infra | P0 | CROSS_TEAM |

---

# 53. MASTER CONTROL LIBRARY — MULTILINGUAL

| ID | Control | Owner | Priority | Verification |
|---|---|---|---|---|
| ML-001 | Her dil URL yapısı tutarlı | Backend/SEO | P1 | SEO_GATED |
| ML-002 | hreflang language/region kodları doğru | SEO | P0 | SEO_GATED |
| ML-003 | reciprocal hreflang ilişkileri doğru | SEO | P1 | SEO_GATED |
| ML-004 | x-default gerekiyorsa doğru | SEO | P2 | SEO_GATED |
| ML-005 | Dil switcher doğru URL'ye gidiyor | Frontend | P1 | CROSS_TEAM |
| ML-006 | Yanlış dil içeriği production'da yok | Content | P1 | SELF |
| ML-007 | Canonical ve hreflang çelişmiyor | SEO | P0 | SEO_GATED |
| ML-008 | Sitemap dil URL'lerini doğru içeriyor | Backend/SEO | P1 | SEO_GATED |

---

# 54. MASTER CONTROL LIBRARY — POST LAUNCH

| ID | Control | Checkpoint | Owner | Priority |
|---|---|---|---|---|
| POST-001 | Production homepage 200 | Release Day | Frontend/Backend | P0 |
| POST-002 | Kritik landing pages erişilebilir | Release Day | SEO | P0 |
| POST-003 | DNS doğru | Release Day | Network | P0 |
| POST-004 | SSL doğru | Release Day | Network | P0 |
| POST-005 | robots.txt production doğru | Release Day | SEO | P0 |
| POST-006 | sitemap erişilebilir | Release Day | SEO | P0 |
| POST-007 | canonical production doğru | Release Day | SEO | P0 |
| POST-008 | forms production çalışıyor | Release Day | Frontend | P0 |
| POST-009 | analytics production veri alıyor | Release Day | SEO | P0 |
| POST-010 | kritik redirects production çalışıyor | Release Day | Backend/SEO | P0 |
| POST-011 | production assetlerde staging/localhost yok | Release Day | Frontend | P0 |
| POST-012 | Googlebot erişimi doğrulandı | Release Day | SEO/Network | P0 |
| POST-013 | Full crawl çalıştırıldı | T+24H | SEO | P1 |
| POST-014 | Broken internal links kontrol edildi | T+24H | SEO | P1 |
| POST-015 | Unexpected 404/5xx kontrol edildi | T+24H | Backend/SEO | P1 |
| POST-016 | Indexability sample doğrulandı | T+24H | SEO | P1 |
| POST-017 | Tracking continuity doğrulandı | T+24H | SEO | P1 |
| POST-018 | Migration redirect anomalies kontrol edildi | T+7D | SEO | P1 |
| POST-019 | GSC/indexation anomalies kontrol edildi | T+7D | SEO | P1 |
| POST-020 | Trafik/measurement anomaly kontrol edildi | T+7D | SEO | P1 |

---

# 55. SINGLE SOURCE OF TRUTH KURALI

Aynı control üç farklı checklistte kopyalanmaz.

Örnek:

```text
Canonical
```

tek kayıttır:

```text
Owner Team:
Frontend

Domain:
SEO

Reviewer:
SEO
```

Frontend ekranında:

> Yapılacak iş

SEO ekranında:

> Review

PM ekranında:

> Durum

Management ekranında:

> Risk

olarak görünür.

---

# 56. UI ROUTES

Ana route aileleri:

```text
/dashboard

/projects
/projects/[projectId]

/releases/[releaseId]

/checks/[checkId]

/my-checks

/reviews

/templates

/admin
```

Backend/Frontend/SEO için ayrı uygulamalar yazılmaz.

---

# 57. DASHBOARD — TEAM MEMBER

Ana sorusu:

> Benim yapmam gereken ne?

Widgetlar:

```text
My Checks

Returned Checks

Blocked Checks

Due Soon
```

---

# 58. DASHBOARD — SEO

Ana sorusu:

> Nerede kritik SEO/GEO riski veya doğrulama bekleyen iş var?

Widgetlar:

```text
Awaiting SEO Review

P0 Blockers

Failed Checks

SEO Domain

GEO Domain

Open Releases

Repeated Issues
```

---

# 59. DASHBOARD — PM

Ana sorusu:

> Release'i ne blokluyor ve kimde bekliyor?

```text
Active Releases

Blockers

Overdue

Unassigned

Pending Reviews

Team Progress
```

---

# 60. DASHBOARD — MANAGEMENT

Ana sorusu:

> Site yayına çıkabilir mi?

Örnek:

| Project | Release | Gate | P0 | P1 | Main Owner Risk |
|---|---|---|---:|---:|---|
| Audi | Migration | NO-GO | 2 | 3 | Network |
| Vaillant | Product Launch | AT RISK | 0 | 4 | Content |
| Yenitepe | New Website | READY | 0 | 0 | — |

Management read-only'dir.

---

# 61. RELEASE SCREEN

Örnek:

```text
Audi Website Migration

Gate:
NO-GO

Deployment:
NOT DEPLOYED

Target:
25 October 2026

P0:
2

P1:
5

Awaiting Review:
7
```

Tabs:

```text
Overview
Checks
Blockers
Post Launch
Activity
```

Filters:

```text
All

Backend
Frontend
Network
Content
SEO

SEO Domain
GEO Domain
Performance
Analytics

P0
P1

Review
Failed
Blocked
```

---

# 62. CHECK DETAIL SCREEN

Örnek:

```text
Canonical Uses Production URL

Owner Team:
Frontend

Owner:
User A

Domain:
SEO

Priority:
P0

Verification:
SEO_GATED

Status:
REVIEW
```

İçerik:

```text
Why It Matters
Expected Result
How To Check
How To Fix
Escalation Rule
Evidence
Notes
Activity
```

Team Member actions:

```text
Start
Add Evidence
Submit Review
Block
```

SEO actions:

```text
Pass
Fail
Reopen
Change Owner
Change Reviewer
Change Priority
Waive
Override
```

Management:

```text
Read Only
```

---

# 63. AUDIT LOG

Audit append-only olacaktır.

Örnek:

```text
09:41
User A
NOT_STARTED → IN_PROGRESS

11:22
User A
Evidence added

11:23
User A
IN_PROGRESS → REVIEW

12:01
Gökhan
REVIEW → FAIL

Reason:
Canonical points to staging domain.

14:14
User A
FAIL → REVIEW

14:27
Gökhan
REVIEW → PASS
```

Audit minimum:

```text
Actor
Timestamp
Entity
Action
Old Value
New Value
Reason
```

---

# 64. DELETE / ARCHIVE KURALLARI

Production release geçmişi hard-delete edilmemelidir.

## Project

Hard delete yerine:

```text
ARCHIVED
```

## Release

Hard delete yerine:

```text
ARCHIVED
```

## User

Silmek yerine:

```text
DEACTIVATED
```

## ReleaseCheck

Release aktive olduktan sonra sessizce hard-delete edilmez.

Gerekirse:

```text
REMOVED_FROM_SCOPE
```

durumu + reason + audit kullanılır.

## AuditEvent

Hard-delete edilmez.

---

# 65. VERIFIED RELEASE LOCK

`PRODUCTION_VERIFIED` olan release normal kullanıcılar tarafından değiştirilemez.

Değişiklik gerekirse:

```text
Reopen Release
```

işlemi gerekir.

Zorunlu:

```text
Reason
Actor
Timestamp
```

Audit'e yazılır.

---

# 66. FAIL REASONS

Başlangıç kategorileri:

```text
NOT_IMPLEMENTED
WRONG_IMPLEMENTATION
MISUNDERSTOOD_REQUIREMENT
ENVIRONMENT_ISSUE
MISSING_EVIDENCE
REGRESSION
DEPENDENCY_FAILURE
OTHER
```

V0'da optional olabilir.

Ancak schema'da bulunmalıdır.

---

# 67. RESULT SOURCE

ReleaseCheck sonucu:

```text
MANUAL
AUTOMATION
API
CRAWLER
```

kaynaklarından gelebilir.

V0:

```text
MANUAL
```

ağırlıklı olacaktır.

Bu field gelecekte otomasyonu kolaylaştıracaktır.

---

# 68. TEKNİK MİMARİ

V0:

```text
Browser
   │
   ▼
Next.js Application
   │
   ├── UI
   ├── Auth
   ├── RBAC
   ├── Projects
   ├── Releases
   ├── Checks
   ├── Templates
   ├── Gate Engine
   ├── Evidence
   └── Audit
   │
   ▼
PostgreSQL

+
Persistent Evidence Storage
```

Deployment:

```text
Docker Compose
```

---

# 69. TEKNİK STACK

Canonical V0 stack:

```text
Next.js
TypeScript
PostgreSQL
Prisma
Auth.js
Docker
Docker Compose
Reverse Proxy
HTTPS
```

No:

```text
Microservices
Kubernetes
Redis
Kafka
Event Bus
Separate Frontend Repository
Separate Backend Repository
```

V0'da bunlara ihtiyaç yoktur.

---

# 70. AUTHENTICATION

Authentication sıfırdan yazılmayacaktır.

Auth.js kullanılacaktır.

V0:

```text
Admin-created accounts
No public self-registration
Secure session cookies
Password credentials if required
Server-side session validation
```

Password kullanılıyorsa güçlü password hashing uygulanmalıdır.

Public signup bulunmayacaktır.

---

# 71. AUTHORIZATION

Authorization server-side uygulanacaktır.

Örnek:

Frontend'de buton gizlemek:

```text
NOT sufficient
```

API/server action:

```text
must verify capability
```

Örnek yetki fonksiyonları:

```text
canViewRelease()
canEditCheck()
canSubmitReview()
canReviewCheck()
canReopenCheck()
canChangePriority()
canWaiveCheck()
canOverrideGate()
canMarkDeployed()
```

---

# 72. SECURITY REQUIREMENTS

Minimum:

```text
HTTPS mandatory

No public self-registration

Secure cookies

Server-side RBAC

Least privilege

Secrets via environment / secret store

No secrets committed to Git

File upload authorization

File size restriction

File type allow-list

Input validation

ORM parameterization

CSRF protection where applicable

Audit sensitive actions

Production admin access restricted

Dependency update responsibility defined
```

---

# 73. EVIDENCE FILE SECURITY

Evidence dosyaları public web path altında doğrudan açık bulunmamalıdır.

Download sırasında:

```text
Authenticated user
+
Permission check
```

yapılmalıdır.

V0 evidence storage:

```text
persistent mounted storage
```

olabilir.

Dosya metadata DB'de tutulur.

---

# 74. ENVIRONMENTS

Minimum iki environment:

```text
STAGING
PRODUCTION
```

Ayrı:

```text
database
environment variables
hostnames
credentials
```

kullanmalıdır.

Staging data production ile otomatik paylaşılmaz.

---

# 75. DATABASE MIGRATIONS

Migration'lar version-controlled olmalıdır.

Production deployment öncesi:

```text
migration reviewed

backup available

migration command documented
```

olmalıdır.

Riskli migration öncesinde backup alınır.

---

# 76. DEPLOYMENT MODEL

Önerilen:

```text
Git Repository
↓
Build
↓
Docker Image
↓
Staging
↓
Smoke Test
↓
Production
```

Her production deployment unique image/tag kullanmalıdır.

`latest` tek rollback mekanizması olmamalıdır.

---

# 77. APPLICATION ROLLBACK

Production deployment başarısız olursa önceki çalışan image/tag korunmalıdır.

Rollback:

```text
Current Image
↓
Problem
↓
Previous Known-Good Image
```

ile mümkün olmalıdır.

DB migration backward incompatible ise application rollback tek başına yeterli değildir.

Bu nedenle migration öncesi backup zorunludur.

---

# 78. DATABASE RECOVERY

Migration veya DB problemi durumunda:

```text
Stop app writes
↓
Assess migration
↓
Rollback migration if safe
OR
Restore pre-deploy backup
↓
Deploy known-good app version
↓
Smoke test
```

Recovery prosedürü dokümante edilmelidir.

---

# 79. BACKUP

Minimum:

```text
PostgreSQL daily backup

Evidence storage backup

Pre-deployment DB backup for risky migrations
```

Başlangıç retention:

```text
Daily:
30 days

Weekly:
12 weeks
```

Mevcut SmartNet backup altyapısı daha güçlü ise kullanılabilir.

---

# 80. RESTORE TEST

Backup alınmış olması başarı değildir.

Pilot production kabulünden önce en az bir kez:

```text
Backup
↓
Fresh/isolated DB
↓
Restore
↓
Application start
↓
Critical data verification
```

gerçekten yapılmalıdır.

Durum:

```text
BACKUP EXISTS
```

ile:

```text
RESTORE VERIFIED
```

ayrı tutulmalıdır.

---

# 81. HEALTH & MONITORING

Minimum health endpoint:

```text
/health
```

kontrol edilecek:

```text
App process
Database connectivity
```

Minimum logging:

```text
Application errors
Authentication failures
Authorization failures
Failed critical operations
```

Production'da process/container restart policy bulunmalıdır.

---

# 82. TECHNICAL OWNERSHIP / BUS FACTOR

Custom kararının şartıdır.

Kod:

> SmartNet'in kurumsal repository'sinde bulunmalıdır.

Production:

> SmartNet infrastructure üzerinde çalışmalıdır.

Zorunlu dokümantasyon:

```text
README
Architecture overview
Environment variables
Local setup
Staging deploy
Production deploy
Database migration
Backup
Restore
Rollback
Admin bootstrap
```

Minimum:

> sistemi devralabilecek ikinci teknik kişi

bulunmalıdır.

Sistem yalnızca Gökhan'ın bilgisayarında veya kişisel hesabında çalışamaz.

---

# 83. SOURCE CONTROL

Tek repository yeterlidir.

Önerilen:

```text
main
feature/*
fix/*
```

Production yalnızca kontrollü `main` build'inden deploy edilir.

Direct production editing yapılmaz.

---

# 84. CLAUDE + CODEX İŞ BÖLÜMÜ

İki agent aynı anda rastgele aynı dosyaları değiştirmemelidir.

## Claude

Ana sorumluluk:

```text
Spec review
Domain model
Architecture review
Edge cases
Permission matrix
UX review
Security review
Red-team
Code review
Regression analysis
```

## Codex

Ana sorumluluk:

```text
Repo implementation
DB schema
Migrations
Auth
RBAC
UI
Gate engine
Audit
Tests
Docker
Bug fixes
```

Akış:

```text
Canonical Project Sheet
↓
Implementation Plan
↓
Codex Build
↓
Tests
↓
Claude Review / Red-team
↓
Codex Fix
↓
Regression Test
↓
Staging
↓
Pilot
```

---

# 85. 48-HOUR V0 SCOPE

V0 MUST HAVE:

```text
Auth

Users

Teams

Roles

Projects

Releases

Project default team mapping

Versioned Templates

ReleaseCheck

Owner

Reviewer

Priority

Verification type

Evidence

Status workflow

Found By / Owned By

Blocked By

Gate Engine

Basic Audit

Dashboard

My Checks

Reviews

Existing Project Onboarding

Baseline

Post-launch Checks

Docker Deployment

Backup

Restore Test
```

---

# 86. V0 OUT OF SCOPE

```text
Automated crawler

GSC API

Bing API

GA4 API

Advanced GEO monitoring

AI assistant

Customer portal

Email notification engine

Slack integration

Advanced reports

Charts

Mobile app

Generic workflow builder

Kanban builder

Gantt

Chat

Wiki

General PM
```

---

# 87. 48-HOUR IMPLEMENTATION PRIORITY

Zaman yetmezse aşağıdaki sıraya göre özellik kesilir.

## TIER 0 — KESİLEMEZ

```text
Database model

Auth

Server-side RBAC

Project

Release

ReleaseCheck

Status transitions

Owner/Reviewer

Gate Engine

Audit
```

## TIER 1 — KESİLMEMELİ

```text
Evidence

Templates

Template snapshot/version

My Checks

Reviews

Existing project baseline
```

## TIER 2 — BASİTLEŞTİRİLEBİLİR

```text
Dashboard visual polish

Advanced filters

Management styling

Template editing UX

Post-launch UI polish
```

## TIER 3 — V0'DAN ÇIKARILABİLİR

```text
Charts

Advanced KPI visualizations

Repeated issue reporting UI

Fancy animations

Bulk operations
```

Core correctness hiçbir zaman UI polish için feda edilmemelidir.

---

# 88. 48-HOUR BUILD PLAN

## Phase 1 — Foundation

```text
Freeze spec
Repo
Docker
PostgreSQL
Prisma schema
Auth
RBAC
Seed roles/teams
```

## Phase 2 — Core Domain

```text
Project
Release
Template
TemplateVersion
ReleaseCheck
Assignments
```

## Phase 3 — Workflow

```text
Status transitions
Review
PASS/FAIL
BLOCKED
N/A
WAIVED
Gate Engine
```

## Phase 4 — Usability

```text
Dashboard
Projects
Release
Check detail
My Checks
Reviews
```

## Phase 5 — Accountability

```text
Evidence
Audit
Found By
Owned By
Baseline
Existing project onboarding
```

## Phase 6 — Production Pilot

```text
Staging deploy
Permission tests
Gate tests
Backup
Restore
Production deploy
Real SmartNet pilot
```

---

# 89. TEST STRATEGY

V0 minimum automated tests:

## Gate Engine

```text
P0 blocker → NO_GO

No P0 + unresolved P1 → AT_RISK

All mandatory checks PASS → READY

Missing required evidence → not READY

Pending required review → not READY
```

## RBAC

```text
Frontend cannot edit Backend check

Team member cannot change P0 priority

Management cannot modify checks

Unauthorized API status update denied

SEO can reopen check
```

## Workflow

```text
NOT_STARTED → IN_PROGRESS

IN_PROGRESS → REVIEW

REVIEW → PASS

REVIEW → FAIL

FAIL → IN_PROGRESS

BLOCKED requires reason
```

## Template Snapshot

```text
Template v2 modification
must not change
existing ReleaseCheck snapshot
```

## Audit

Critical state change creates AuditEvent.

---

# 90. MANUAL ACCEPTANCE TEST

Gerçek kullanıcı akışı:

1. Project oluştur.
2. Release oluştur.
3. Template'den checks üret.
4. Frontend kullanıcı login olsun.
5. Kendi checklerini görsün.
6. Backend check'ini değiştiremesin.
7. Frontend P0 check başlatsın.
8. Evidence eklesin.
9. Review'a göndersin.
10. SEO Reviews ekranında görsün.
11. SEO FAIL versin.
12. Reason audit'e yazılsın.
13. Frontend düzeltip tekrar göndersin.
14. SEO PASS versin.
15. Gate yeniden hesaplansın.
16. Başka Network P0 açık olduğu için NO_GO kalsın.
17. Network problemi çözülsün.
18. Bütün zorunlu koşullar sağlanınca READY otomatik oluşsun.
19. PM DEPLOYED işaretlesin.
20. Post-launch kontrolleri çalışsın.
21. PRODUCTION_VERIFIED oluşsun.
22. Management geçmişi read-only görebilsin.

Bu senaryo çalışmıyorsa V0 tamamlanmış değildir.

---

# 91. TEKNİK VERİ MODELİ

Minimum entities:

```text
User
Role
Team

Project
ProjectMembership
ProjectTeamAssignment

Release
ReleaseScope
ReleaseTeamAssignment

Template
TemplateVersion
TemplateControl

ReleaseCheck

Evidence
Review

VerificationCheckpoint

AuditEvent
```

Future:

```text
AutomatedCheckRun
Integration
Notification
Metric
```

---

# 92. DATA INTEGRITY INVARIANTS

Aşağıdaki kurallar database/business logic seviyesinde korunmalıdır:

1. READY manuel set edilemez.
2. Production verified release sessiz değiştirilemez.
3. Audit event silinemez.
4. Template update geçmiş ReleaseCheck'i değiştiremez.
5. Unauthorized status transition yapılamaz.
6. Required evidence olmadan gerekli control PASS olamaz.
7. SEO_GATED check SEO verification olmadan PASS olamaz.
8. BLOCKED reason olmadan kaydedilemez.
9. WAIVED reason olmadan kaydedilemez.
10. Deployment override audit olmadan yapılamaz.
11. Found By ile Owned By bağımsız tutulur.
12. Owner ile Reviewer bağımsız tutulur.
13. Team ile Domain bağımsız tutulur.
14. Gate gerçek check state'lerinden hesaplanır.
15. Deploy olmak Production Verified olmak değildir.

---

# 93. RELEASE HISTORY INTEGRITY

Release aktif olduktan sonra master template metadata'sı geçmişe doğru değiştirilemez.

Gerekli değişiklik:

```text
explicit release-level edit
+
actor
+
reason
+
audit
```

gerektirir.

---

# 94. SYSTEM FAILURE PRINCIPLE

Sistem hiçbir zaman:

> testler geçti, demek ki production başarılı

varsayımı yapmamalıdır.

Ayrım:

```text
TECHNICALLY TESTED

STAGING VERIFIED

PRODUCTION DEPLOYED

PRODUCTION SMOKE-TESTED

BACKUP VERIFIED

RESTORE VERIFIED

PRODUCTION VERIFIED

END-GOAL ACHIEVED
```

Bu durumlar aynı şey değildir.

---

# 95. MANAGEMENT REPORTING PRINCIPLE

Management dashboard:

> teknik detay çöplüğü

olmamalıdır.

Ana bilgi:

```text
Can this release go live?

What blocks it?

Which team owns the blocker?

How many critical issues remain?

When is target release?
```

olmalıdır.

---

# 96. RESPONSIBILITY REPORTING

Örnek:

```text
Open Release Blockers: 5

Backend: 2
Frontend: 1
Network: 2
Content: 0
SEO: 0
```

Bu görünüm organizasyonel hedef açısından kritik olacaktır.

---

# 97. SEO BOTTLENECK PREVENTION RULE

SEO full access sahibidir: her şeyi görür ve koordine eder (sahip/doğrulayan/öncelik değişikliği, bloklama, yeniden açma). Başka ekibin işini uygulamaz ve evrensel doğrulayan değildir (§116).

Ancak:

> bütün kontroller SEO review'a gönderilemez.

Verification modeli bilinçli kullanılmalıdır.

Hedef:

```text
Majority:
SELF

Selected:
CROSS_TEAM

Only truly SEO-critical:
SEO_GATED
```

SEO'nun günlük işi yüzlerce basit checkbox doğrulamak olmamalıdır.

---

# 98. LEARNING KPI

Ana kalite KPI'larından biri:

```text
FIRST PASS APPROVAL RATE
```

Örnek:

```text
Frontend

Submitted:
20

Passed first review:
16

First Pass Approval:
80%
```

Zaman içinde artması beklenir.

---

# 99. DİĞER KALİTE KPI'LARI

Gelecekte:

```text
Repeated Issue Count

Reopened Checks

Review Loops

Fail Reason Distribution

Post-launch Defects

Open P0/P1 By Team

Issues Found By SEO vs Owned By Team

Average Time In Review

Percentage of SELF Checks Passing
```

ölçülebilir.

V0 dashboard'ında zorunlu değildir.

---

# 100. İLK PİLOT

İlk pilot:

> devam eden fakat henüz release süreci bitmemiş gerçek bir SmartNet projesi

üzerinde yapılmalıdır.

Pilot özellikle test edecektir:

```text
Existing project onboarding

Baseline

Ownership

Team behaviour

SEO dependency

Review model

Evidence

Gate

Management visibility

Post-launch
```

---

# 101. PILOT SUCCESS CRITERIA

Pilot başarılı kabul edilir eğer:

- Ekip kullanıcıları kendi kontrollerini bulabiliyorsa
- Başka ekibin kontrolünü değiştiremiyorsa
- Owner belirsizliği azalıyorsa
- SEO'ya gereksiz kontrol transferi engelleniyorsa
- Review workflow çalışıyorsa
- Gate doğru hesaplanıyorsa
- Audit geçmişi korunuyorsa
- Yönetim gerçek blocker owner'ını görebiliyorsa
- Sistem restart sonrası veri kaybetmiyorsa
- Backup alınabiliyorsa
- Restore gerçekten çalışıyorsa

---

# 102. ÜRÜN BAŞARI ÖLÇÜTLERİ

WRC başarısı:

> %100 checkbox

değildir.

Gerçek başarı:

```text
↓ SEO'ya yönlendirilen gereksiz işler

↓ Tekrarlanan hatalar

↓ Production sonrası bulunan kritik sorunlar

↓ Ownership tartışmaları

↓ SEO'nun basic QA yükü

↑ First Pass Approval Rate

↑ Team knowledge

↑ Release accountability

↑ Release quality

↑ Ownership clarity
```

---

# 103. FUTURE AUTOMATION MODEL

Gelecekte:

```text
Crawler
   ↓
Check Results
   ↓
WRC
   ↓
Gate Engine
```

örneği:

```text
canonical → FAIL

robots → PASS

schema → FAIL

OAI-SearchBot → PASS

redirects → PASS
```

Gate otomatik güncellenebilir.

V0'da crawler yapılmaz.

---

# 104. GELECEK ENTEGRASYONLARI

Potansiyel:

```text
Technical crawler

Google Search Console

Bing Webmaster Tools

GA4

GTM verification

AI crawler tests

Performance testing

Scheduled post-launch checks

AI/GEO visibility monitoring

Automated evidence capture

Notifications
```

Yalnızca gerçek kullanım ihtiyacı kanıtlandıktan sonra eklenir.

---

# 105. COMPLEXITY BUDGET

Yeni özellik geldiğinde sor:

> Bu özellik release kalitesini, ownership'i, verification'ı veya release kararını doğrudan iyileştiriyor mu?

Hayır ise WRC'ye eklenmemelidir.

Örnek:

```text
Automatic canonical validation
→ YES

Employee time tracking
→ NO

SEO crawler
→ YES

General team chat
→ NO
```

---

# 106. NON-NEGOTIABLE PRODUCT RULES

1. SEO her şeyin sahibi değildir.
2. SEO full access sahibidir (görünürlük + koordinasyon; uygulama ve evrensel onay değil — §116).
3. Owner, reviewer değildir.
4. Found By, Owned By değildir.
5. Team, Domain değildir.
6. Priority, Verification Type değildir.
7. READY manuel değildir.
8. Deployed, Production Verified değildir.
9. PASS gerekiyorsa evidence gerektirir.
10. Audit overwrite edilmez.
11. Past release template değişikliğiyle değişmez.
12. Aynı check duplicate edilmez.
13. Diğer ekiplerin işi normal flow'da SEO tarafından tamamlanmaz.
14. Management operasyonel data değiştiremez.
15. System Admin ile SEO Lead ayrı kavramlardır.
16. Custom sistem genel PM aracına dönüşmez.
17. UI polish correctness'ten önemli değildir.
18. Backup, restore testi olmadan güvenilir sayılmaz.
19. Tests passed production success anlamına gelmez.
20. Production history hard-delete edilmez.

---

# 107. UNRESOLVED DECISIONS

```text
NONE FOR V0 CORE PRODUCT.
```

Yeni kararlar bu document'e ADR veya version update olarak işlenmelidir.

Chat içerisinde alınan fakat bu dokümana eklenmeyen karar:

> canonical specification sayılmaz.

---

# 108. CHANGE MANAGEMENT

Bu dokümanda önemli domain değişikliği yapılacaksa:

```text
Current behaviour
↓
Proposed change
↓
Affected data
↓
Affected permissions
↓
Affected historical records
↓
Migration requirement
↓
Rollback
↓
Approval
```

değerlendirilmelidir.

---

# 109. PROJECT SHEET VERSIONING

Bu belge:

```text
v1.1 FINAL CANONICAL
```

sürümüdür.

Gelecek önemli değişiklikler:

```text
v1.2
v1.3
...
```

olarak versiyonlanmalıdır.

Eski specification Git history'de korunmalıdır.

---

# 110. TEK CÜMLELİK ÜRÜN TANIMI

> **SmartNet Web Release Control, web projelerinde Backend, Frontend, Network, Content ve SEO ekiplerinin kendi sorumluluklarını kanıtla tamamlamasını, gerekli kontrollerin doğru ekip tarafından doğrulanmasını ve bir web release'inin yayına hazır olup olmadığının sistem tarafından objektif biçimde belirlenmesini sağlayan şirket içi release-quality ve governance platformudur.**

---

# 111. ÜRÜNÜN ORGANİZASYONEL CÜMLESİ

> **SEO kontrol etsin değil; doğru ekip doğru işi doğru yapsın.**

---

# 112. V0 ANA HEDEFİ

48 saat sonunda hedef:

> Kusursuz enterprise platform üretmek değildir.

Hedef:

```text
Real Project
+
Real Users
+
Real Permissions
+
Real Ownership
+
Real Checks
+
Real Evidence
+
Real Review
+
Real Gate
+
Real Audit
+
Real Deployment
+
Verified Backup/Restore
=
Usable SmartNet WRC Pilot
```

---

# 113. DEFINITION OF DONE — V0

V0 ancak aşağıdakilerin tamamı gerçekleştiğinde DONE kabul edilir:

```text
[ ] Application runs on SmartNet-hosted environment

[ ] HTTPS works

[ ] PostgreSQL persists data

[ ] Authentication works

[ ] Server-side RBAC works

[ ] Users/Teams/Roles work

[ ] Project creation works

[ ] Release creation works

[ ] Template versioning works

[ ] Release checks generate from template

[ ] Team ownership works

[ ] Reviewer model works

[ ] SELF workflow works

[ ] CROSS_TEAM workflow works

[ ] SEO_GATED workflow works

[ ] Evidence works

[ ] PASS/FAIL/BLOCKED/N/A/WAIVED validation works

[ ] Found By / Owned By works

[ ] Audit history works

[ ] Gate Engine produces correct state

[ ] READY cannot be manually selected

[ ] Existing IN_PROGRESS project can be onboarded

[ ] Baseline works

[ ] LIVE_UNVERIFIED flow works

[ ] DEPLOYED state works

[ ] Post-launch checks work

[ ] Management read-only view works

[ ] Docker restart preserves data

[ ] Database backup succeeds

[ ] Backup restore succeeds

[ ] Known-good rollback path documented

[ ] Staging smoke test passes

[ ] Real SmartNet pilot scenario passes
```

---

# 114. FINAL SCOPE GUARD

Bu proje boyunca aşağıdaki üç cümle korunacaktır:

> **Biz Jira yapmıyoruz.**

> **Biz insanların işini SEO'nun yapacağı bir checklist sistemi yapmıyoruz.**

> **Biz SmartNet'in web release kalite kapısını yapıyoruz.**

---

# 115. FINAL DECISION

**BUILD CUSTOM SMARTNET WRC.**

Şartlar:

```text
Narrow domain

Modular monolith

Single source of truth

Server-side permissions

Versioned templates

Calculated release gate

Append-only audit

Verified recovery

Company-owned repository

At least two technical maintainers

No general PM scope creep
```

Bu şartlar korunmadığında mimari karar yeniden değerlendirilmelidir.

---

# 116. PRE-STAGING SPEC CLOSURE (2026-09-24)

Bu bölüm önceki bölümlerle çelişen noktalarda önceliklidir.

## Normal iş

PM yayını (Release) oluşturur → seçilen şablon standart ReleaseCheck'leri otomatik üretir. Kimse normal yayın oluştururken canonical/WAF/H1/sitemap gibi kontrolleri tek tek girmez.

## Sonradan tespit edilen sorun — “+ Yeni Sorun”

- SEO Lead, PM ve System Admin açabilir. Team Member ve Management açamaz.
- Ayrı bir görev sistemi değildir: sorun sıradan bir **ReleaseCheck**'tir, `source = AD_HOC` (şablondan gelenler `TEMPLATE`).
- Kontrol kodu sistem tarafından üretilir (`ADH-001`…); oluşturma anındaki tanım `templateControlSnapshot` içinde dondurulur ve sonradan katalog değişse de değişmez.
- **Tespit Eden = oturum açmış oluşturan kullanıcı** (başkası adına girilemez). **Sorumlu ekip** ayrı seçilir; tespit eden sahip olmaz.
- P0 sorun `releaseBlocker` olur ve yayın kararını aynı P0 şablon kontrolü gibi etkiler. READY yine yalnızca hesaplanır.
- `PRODUCTION_VERIFIED` yayına doğrudan sorun açılamaz; önce mevcut “Yayını Yeniden Aç” akışı kullanılır.
- Oluşturma append-only audit'e yazılır: aktör, zaman, `source = AD_HOC`, sorumlu ekip, öncelik, doğrulama tipi.
- Kanıt zorunludur; tespit sırasında eklenen kanıt sorunu belgeler, düzeltme kanıtını sorumlu ekip ekler.

## Uygulama ve onay yetkisi

- Uygulama (başlat, kanıt ekle, onaya gönder): **yalnızca sahip ekip** (+ System Admin override). SEO ve PM koordine eder, başka ekibin işini uygulamaz.
- SELF (Ekip İçi Onay): sahip ekip doğrular; otomatik SEO adımı yoktur.
- CROSS_TEAM (Çapraz Onay): yalnızca atanmış doğrulayan onaylar; sahip ekipten biri, ilgisiz kullanıcılar, SEO ve PM yalnızca rolleri nedeniyle onaylayamaz. CROSS_TEAM = SEO değildir; varsayılan doğrulayan şablonun `defaultReviewerRole` alanından gelir (CNT-007/CNT-017 için SEO — alan uyumu nedeniyle korunur).
- SEO_GATED (SEO Onayı Zorunlu): SEO Lead doğrular; uygulayan ekip kendi işini onaylayamaz. İstisna: sahibi SEO olan SEO standartlarını (SEO-001 vb.) SEO Lead doğrular.
- PM evrensel teknik doğrulayan değildir. SEO evrensel doğrulayan değildir.

## Katalog v1.1 (2026-09-24)

BASE-006 “Rollback yaklaşımı tanımlandı”: sahip ekip **Network**, doğrulama CROSS_TEAM, varsayılan doğrulayan **Proje Yöneticisi** (sahip olarak PM temsil edilemediği için v1.0'daki SEO yer tutucusu düzeltildi). v1.0 değiştirilmedi. Yayın üretimi, CROSS_TEAM doğrulayanı sahip ekipten çıkıyorsa doğrulayanı boş bırakır; PM atar. Değişmez kural: **CROSS_TEAM doğrulayanının ekibi ≠ sahip ekip.**

**Tespit Eden ≠ Sorumlu. PM teknik doğrulayan değildir. SEO evrensel doğrulayan değildir. CROSS_TEAM, SEO demek değildir.**

---

# 117. SEO TEKNİK ONAY KURALI (2026-10-01)

Bu bölüm §116'nın onay kurallarını Frontend / Backend / Network / Content işleri için değiştirir.

- **Frontend, Backend, Network ve Content'in sahip olduğu her görevin tek teknik onaylayıcısı SEO'dur** (onay ve düzeltme isteme). Doğrulama tipi (SELF / CROSS_TEAM / SEO_GATED) ne olursa olsun geçerlidir. Bu ekipler kendi işlerini onaylayamaz; atanmış SEO dışı bir doğrulayan da onaylayamaz.
- **PM hiçbir görevi onaylayamaz.** Oluşturur (“+ Yeni Sorun”), atar, sorumlu/öncelik değiştirir, planlar ve takip eder.
- **Yönetim hiçbir görevi onaylayamaz.** Yayın düzeyindeki Yayına Hazır / Riskli / Yayına Hazır Değil kararı hesaplanır ve Yönetim bunu salt okunur görür. Görev onayı ile yayın hazırlığı aynı kavram değildir.
- SEO'nun sahip olduğu işlerde §116 korunur: SEO_GATED ve SELF → SEO; CROSS_TEAM → SEO ekibi dışındaki atanmış doğrulayan.
- **Muaf Tut (WAIVED) ve Uygulanamaz (N/A)** görevi onaysız kapattığı için **her görevde** (F/B/N/C ve SEO'nun kendi işleri) nihai kararı yalnızca SEO verir; PM ve Yönetim veremez. PM gerekirse yorum/talep bırakır, durumu değiştiremez.
- F/B/N/C işlerinde kayıtlı doğrulayan her zaman SEO Lideridir; başka bir doğrulayan atanamaz, iş F/B/N/C ekibine taşınınca doğrulayan SEO olur.
- System Admin yönetici override'ını korur (audit'e yazılır).
- Yeni yayın ve yeni sorun oluşturulurken F/B/N/C işlerine doğrulayan olarak SEO Lideri atanır. Kurallar sunucu tarafında uygulanır; arayüz yalnızca bunu yansıtır.

**Bilinçli sonuç:** Ekip İçi Onay artık yalnızca SEO'nun kendi işleri için ekip içidir; F/B/N/C işlerinin tamamı SEO onay kuyruğuna düşer. Bu, §97'deki “SEO darboğazı önleme” hedefinden bilinçli bir sapmadır.

---

# END OF CANONICAL PROJECT SHEET

**Project:** SmartNet Web Release Control  
**Version:** 1.1 FINAL CANONICAL  
**Status:** Approved for V0 Implementation  
**Architecture:** Self-hosted Modular Monolith  
**Core Stack:** Next.js + TypeScript + PostgreSQL + Prisma + Auth.js + Docker Compose  
**Core Domain:** Project → Release → Check → Verification → Gate → Deploy → Production Verification  
**Primary Organizational Goal:** SEO'yu operasyonel darboğaz olmaktan çıkarmak ve kalite sorumluluğunu işi yapan ekibe taşımak.  
**Primary Product Principle:** Doğru ekip doğru işi doğru yapsın.  
**V0 Target:** 1–2 days / real SmartNet pilot  
**Unresolved Core Decisions:** 0