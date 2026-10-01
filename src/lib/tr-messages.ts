// Presentation-only Turkish wording for domain messages and audit events.
// Domain code keeps its own (partly English) messages; users never see them raw.
import { checkStatusLabel, gateLabel, priorityLabel } from "@/lib/labels";

const ERROR_TR: Record<string, string> = {
  "Authentication required": "Bu işlem için giriş yapmalısın.",
  "Check not found": "Kontrol görevi bulunamadı.",
  "Release not found": "Yayın bulunamadı.",
  "Project not found": "Proje bulunamadı.",
  "Template version not found": "Kontrol şablonu bulunamadı.",
  "Not allowed to edit this check": "Bu görev senin ekibinin sorumluluğunda değil; üzerinde değişiklik yapamazsın.",
  "Not allowed to add evidence": "Bu göreve kanıt ekleme yetkin yok.",
  "Not allowed to submit this check": "Bu görevi onaya gönderme yetkin yok.",
  "Not allowed to pass this check": "Bu görevi onaylama yetkin yok.",
  "Not allowed to fail this check": "Bu görev için düzeltme isteme yetkin yok.",
  "Not allowed to block": "Bu görevi engellendi olarak işaretleme yetkin yok.",
  "Not allowed to waive": "Bu görevi muaf tutma yetkin yok.",
  "Frontend/Backend/Network/Content work is reviewed by SEO": "Frontend, Backend, Network ve Content işlerinin doğrulayanı yalnızca SEO olabilir.",
  "Evidence file is required": "Dosya veya ekran görüntüsü için bir dosya seçmelisin.",
  "Choose File or Screenshot to attach a file": "Dosya eklemek için türü “Dosya” ya da “Ekran görüntüsü” seç.",
  "Screenshot must be an image": "Ekran görüntüsü PNG, JPG veya WEBP olmalı.",
  "Evidence is empty": "Kanıt boş olamaz.",
  "Evidence file type is not allowed": "Bu dosya türü kabul edilmiyor (PNG, JPG, WEBP, PDF, CSV, XLSX, ZIP, TXT, JSON).",
  "Evidence file is empty": "Dosya boş.",
  "Evidence file is too large": "Dosya en fazla 25 MB olabilir.",
  "Evidence file content does not match its type": "Dosyanın içeriği uzantısıyla uyuşmuyor.",
  "Invalid username": "Kullanıcı adı 3–32 karakter olmalı; yalnızca küçük harf, rakam, nokta, alt çizgi ve tire.",
  "Username already exists": "Bu kullanıcı adı zaten kullanılıyor.",
  "E-mail already exists": "Bu e-posta zaten kullanılıyor.",
  "Name is required": "Ad Soyad zorunlu.",
  "Team is required for this role": "Ekip üyesi için ekip seçmelisin.",
  "Team not found": "Ekip bulunamadı.",
  "Invalid role": "Geçersiz rol.",
  "Password too short": "Şifre en az 10 karakter olmalı.",
  "Current password is wrong": "Mevcut şifre yanlış.",
  "New passwords do not match": "Yeni şifreler birbiriyle aynı değil.",
  "New password must differ from the current one": "Yeni şifre mevcut şifreden farklı olmalı.",
  "Not allowed to manage users": "Kullanıcı yönetme yetkin yok.",
  "Cannot remove the last active System Admin": "Son aktif Sistem Yöneticisi pasife alınamaz veya rolü değiştirilemez.",
  "Assignee must be an active member of the owner team": "Atanan kişi, görevin sorumlu ekibinin aktif bir üyesi olmalı.",
  "Not allowed to change the project team": "Proje ekibini değiştirme yetkin yok.",
  "Person is not an active member for this project role": "Seçilen kişi bu görev için uygun aktif bir kullanıcı değil (PM için proje yöneticisi, ekipler için o ekibin aktif üyesi).",
  "Not allowed to mark N/A": "Bu görevi Uygulanamaz olarak işaretleme yetkin yok.",
  "N/A requires a reason": "Uygulanamaz için neden yazmalısın.",
  "Not allowed to reopen": "Bu görevi yeniden açma yetkin yok.",
  "Not allowed to reopen this release": "Bu yayını yeniden açma yetkin yok.",
  "Not allowed to change owner": "Sorumluyu değiştirme yetkin yok.",
  "Not allowed to change reviewer": "Doğrulayanı değiştirme yetkin yok.",
  "Not allowed to change priority": "Önceliği değiştirme yetkin yok.",
  "Not allowed to complete baseline": "Mevcut canlı durumu kaydetme yetkin yok.",
  "Not allowed to create project": "Proje oluşturma yetkin yok.",
  "Not allowed to create release": "Yayın oluşturma yetkin yok.",
  "Required evidence is missing": "Bu görev kanıt olmadan onaya gönderilemez veya onaylanamaz. Önce kanıt ekle.",
  "SEO_GATED checks require SEO verification": "Bu görev SEO onayı zorunlu; yalnızca SEO onaylayabilir.",
  "Fail reason is required": "Düzeltme isterken gerekçe yazmalısın.",
  "BLOCKED requires a reason": "Engel nedeni yazmalısın.",
  "BLOCKED requires Blocked By": "Neyin engellediğini seçmelisin.",
  "WAIVED requires reason and risk explanation": "Muaf tutmak için neden ve kabul edilen riski yazmalısın.",
  "Reopen Release requires a reason": "Yayını yeniden açmak için neden yazmalısın.",
  "PRODUCTION_VERIFIED release is locked. Reopen Release is required.":
    "Bu yayın canlıda doğrulandı ve kilitli. Değişiklik için önce yayın yeniden açılmalı.",
  "READY cannot be selected by a user": "“Yayına Hazır” elle seçilemez; sistem kontrollerden hesaplar.",
  "Emergency deploy requires reason, open risks, and a second approver":
    "Acil yayın için neden, açık riskler ve ikinci onaylayan gerekli.",
  "Emergency deploy approvers must be PM+SEO or PM+Management":
    "Acil yayını PM ile SEO ya da PM ile Yönetim birlikte onaylamalı.",
  "Two distinct approvers are required": "İki farklı onaylayan gerekli.",
  "Second approver not found": "İkinci onaylayan bulunamadı.",
  "Owner must belong to a team": "Sorumlu kişi bir ekibe bağlı olmalı.",
  "Not allowed to create ad-hoc issue": "Yeni sorun yalnızca SEO Lideri, Proje Yöneticisi veya Sistem Yöneticisi tarafından açılabilir.",
  "Ad-hoc issue requires a title": "Ne tespit ettiğini yazmalısın.",
  "Ad-hoc issue requires an affected domain": "Etkilenen alanı seçmelisin.",
  "Owner team not found": "Sorumlu ekip bulunamadı.",
  "CROSS_TEAM requires an assigned reviewer": "Çapraz Onay için doğrulayacak kişiyi seçmelisin.",
  "CROSS_TEAM reviewer is not a valid active user": "Seçilen doğrulayan geçerli bir aktif kullanıcı değil.",
  "CROSS_TEAM reviewer must not belong to the owner team": "Çapraz Onay’da doğrulayan, sorumlu ekipten olamaz.",
  "Yayına alma yalnızca Yayına Hazır ve henüz yayınlanmamış release için geçerlidir":
    "Yayına alma yalnızca yayın kararı “Yayına Hazır” olan ve henüz yayına alınmamış yayınlar için yapılabilir.",
  "Acil yayın yalnızca Yayına Hazır olmayan ve henüz yayınlanmamış release için geçerlidir":
    "Acil yayın yalnızca “Yayına Hazır” olmayan ve henüz yayına alınmamış yayınlar için yapılabilir.",
  "Production doğrulaması yalnızca yayın sonrası kontrol aşamasında ve zorunlu kontroller tamamsa yapılabilir":
    "Canlı doğrulama yalnızca yayın sonrası kontrol aşamasında ve zorunlu kontroller tamamlandığında yapılabilir.",
};

/** Turkish, user-facing text for an error raised by a server action. */
export function userFacingError(message: string): string {
  const known = ERROR_TR[message.trim()];
  if (known) return known;
  const transition = message.match(/^Illegal status transition: (\w+) → (\w+)$/);
  if (transition) {
    const from = checkStatusLabel[transition[1] as keyof typeof checkStatusLabel] ?? transition[1];
    const to = checkStatusLabel[transition[2] as keyof typeof checkStatusLabel] ?? transition[2];
    return `Görev “${from}” durumundayken “${to}” durumuna geçirilemez.`;
  }
  // Domain messages already written in Turkish are shown as-is; anything else is not leaked raw.
  return /[çğıöşüÇĞİÖŞÜ]/.test(message) ? message : "İşlem yapılamadı. Yetkin olmayabilir veya görev bu işlem için uygun durumda değil.";
}

const REASON_TR: Record<string, string> = {
  "Previous execution history existed outside WRC where applicable.":
    "Önceki çalışma geçmişi WRC dışında tutulmuştu.",
};

export type AuditLike = { action: string; oldValue: unknown; newValue: unknown; reason: string | null };

function statusTr(value: unknown): string {
  return typeof value === "string" ? checkStatusLabel[value as keyof typeof checkStatusLabel] ?? value : "—";
}

/** One Turkish sentence (without the actor) describing an audit event. */
export function auditSentence(e: AuditLike): string {
  const reason = e.reason ? ` — ${REASON_TR[e.reason] ?? e.reason}` : "";
  switch (e.action) {
    case "STATUS_CHANGED":
      return `durumu “${statusTr(e.oldValue)}” → “${statusTr(e.newValue)}” olarak değiştirdi${reason}`;
    case "EVIDENCE_ADDED":
      return `kanıt ekledi${reason}`;
    case "CREATED": {
      const nv = e.newValue as { source?: string } | null;
      return nv && typeof nv === "object" && nv.source === "AD_HOC" ? `yeni sorun açtı${reason}` : `kaydı oluşturdu${reason}`;
    }
    case "GATE_RECALCULATED": {
      const next = typeof e.newValue === "string" ? gateLabel[e.newValue as keyof typeof gateLabel] ?? e.newValue : "—";
      return `yayın kararı yeniden hesaplandı: “${next}”${reason}`;
    }
    case "OWNER_CHANGED":
      return `sorumluyu değiştirdi${reason}`;
    case "REVIEWER_CHANGED":
      return `doğrulayanı değiştirdi${reason}`;
    case "ASSIGNEE_CHANGED":
      return `görevi ekip içinde başka bir kişiye atadı${reason}`;
    case "PRIORITY_CHANGED": {
      const p = (v: unknown) => (typeof v === "string" ? `${v} (${priorityLabel[v as keyof typeof priorityLabel] ?? v})` : "—");
      return `önceliği ${p(e.oldValue)} → ${p(e.newValue)} olarak değiştirdi${reason}`;
    }
    case "REOPENED":
      return `görevi yeniden açtı${reason}`;
    case "BASELINE_COMPLETED":
      return `mevcut canlı durumu kaydetti${reason}`;
    case "DEPLOYED":
      return `yayını “Yayına Alındı” olarak işaretledi${reason}`;
    case "DEPLOYED_WITH_OPEN_RISKS":
      return `yayını açık risklerle acil olarak yayına aldı${reason}`;
    case "POST_LAUNCH_STARTED":
      return `yayın sonrası kontrolü başlattı${reason}`;
    case "PRODUCTION_VERIFIED":
      return `canlı doğrulamayı tamamladı; yayın kilitlendi${reason}`;
    case "RELEASE_REOPENED":
      return `yayını yeniden açtı${reason}`;
    default:
      return `işlem kaydı: ${e.action.toLowerCase().replace(/_/g, " ")}${reason}`;
  }
}
