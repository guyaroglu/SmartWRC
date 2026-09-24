import {
  CheckStatus,
  DeploymentStatus,
  GateStatus,
  Priority,
  VerificationType,
} from "@prisma/client";

export const gateLabel: Record<GateStatus, string> = {
  [GateStatus.NO_GO]: "Yayına Hazır Değil",
  [GateStatus.AT_RISK]: "Riskli",
  [GateStatus.READY]: "Yayına Hazır",
  [GateStatus.NOT_ASSESSED]: "Henüz Değerlendirilmedi",
};

export const gateHeadline: Record<GateStatus, string> = {
  [GateStatus.NO_GO]: "YAYINA HAZIR DEĞİL",
  [GateStatus.AT_RISK]: "RİSKLİ",
  [GateStatus.READY]: "YAYINA HAZIR",
  [GateStatus.NOT_ASSESSED]: "HENÜZ DEĞERLENDİRİLMEDİ",
};

export const checkStatusLabel: Record<CheckStatus, string> = {
  [CheckStatus.NOT_STARTED]: "Açık",
  [CheckStatus.IN_PROGRESS]: "Çalışılıyor",
  [CheckStatus.REVIEW]: "Onay Bekliyor",
  [CheckStatus.PASS]: "Onaylandı",
  [CheckStatus.FAIL]: "Düzeltme Gerekli",
  [CheckStatus.BLOCKED]: "Engellendi",
  [CheckStatus.NA]: "Uygulanamaz",
  [CheckStatus.WAIVED]: "Muaf Tutuldu",
  [CheckStatus.DONE_NEEDS_VERIFICATION]: "Doğrulama Bekliyor",
  [CheckStatus.REMOVED_FROM_SCOPE]: "Kapsam Dışı",
};

export const verificationLabel: Record<VerificationType, string> = {
  [VerificationType.SELF]: "Ekip İçi Onay",
  [VerificationType.CROSS_TEAM]: "Çapraz Onay",
  [VerificationType.SEO_GATED]: "SEO Onayı Zorunlu",
};

export const deploymentLabel: Record<DeploymentStatus, string> = {
  [DeploymentStatus.NOT_DEPLOYED]: "Henüz Yayına Alınmadı",
  [DeploymentStatus.DEPLOYED]: "Yayına Alındı",
  [DeploymentStatus.POST_LAUNCH_VERIFYING]: "Yayın Sonrası Kontrol",
  [DeploymentStatus.PRODUCTION_VERIFIED]: "Canlıda Doğrulandı",
};

export const priorityLabel: Record<Priority, string> = {
  [Priority.P0]: "Kritik",
  [Priority.P1]: "Yüksek",
  [Priority.P2]: "Orta",
  [Priority.P3]: "İyileştirme",
};

export const teamLabel: Record<string, string> = {
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  NETWORK: "Network",
  CONTENT: "Content",
  SEO: "SEO / GEO",
};

export const moduleLabel: Record<string, string> = {
  BASE: "Temel",
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  NETWORK: "Network",
  CONTENT: "Content",
  SEO: "SEO / GEO",
  GEO: "GEO",
  ANALYTICS: "Analitik",
  MIGRATION: "Site taşıma",
  ECOMMERCE: "E-ticaret",
  MULTILINGUAL: "Çok dilli",
  POST_LAUNCH: "Yayın sonrası",
};

export const roleLabel: Record<string, string> = {
  TEAM_MEMBER: "Ekip üyesi",
  SEO_LEAD: "SEO Lideri",
  PROJECT_MANAGER: "Proje yöneticisi",
  MANAGEMENT: "Yönetim",
  SYSTEM_ADMIN: "Sistem yöneticisi",
};

export function gateTone(gate: GateStatus): "danger" | "warn" | "ok" | "muted" {
  if (gate === GateStatus.READY) return "ok";
  if (gate === GateStatus.NO_GO) return "danger";
  if (gate === GateStatus.AT_RISK) return "warn";
  return "muted";
}

export function statusTone(status: CheckStatus): "danger" | "warn" | "ok" | "muted" {
  if (status === CheckStatus.PASS) return "ok";
  if (status === CheckStatus.FAIL || status === CheckStatus.BLOCKED) return "danger";
  if (status === CheckStatus.REVIEW || status === CheckStatus.IN_PROGRESS) return "warn";
  return "muted";
}

// User-facing labels for enums that were previously rendered raw.
export const domainLabel: Record<string, string> = {
  SEO: "SEO",
  GEO: "GEO",
  PERFORMANCE: "Performans",
  ANALYTICS: "Analitik",
  INFRASTRUCTURE: "Altyapı",
  UX: "Kullanıcı deneyimi",
  ACCESSIBILITY: "Erişilebilirlik",
  SECURITY: "Güvenlik",
  CONTENT_QUALITY: "İçerik kalitesi",
};

export const evidenceTypeLabel: Record<string, string> = {
  URL: "URL",
  TEXT: "Açıklama",
  SCREENSHOT: "Ekran görüntüsü",
  FILE: "Dosya",
  EXTERNAL_TICKET: "Harici kayıt",
  TEST_RESULT: "Test sonucu",
};

export const blockedByLabel: Record<string, string> = {
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  NETWORK: "Network",
  CONTENT: "Content",
  SEO: "SEO / GEO",
  CLIENT: "Müşteri",
  EXTERNAL: "Dış taraf",
};
