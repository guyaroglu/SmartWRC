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
  [CheckStatus.BLOCKED]: "Bloklandı",
  [CheckStatus.NA]: "Uygulanamaz",
  [CheckStatus.WAIVED]: "Risk Kabul Edildi",
  [CheckStatus.DONE_NEEDS_VERIFICATION]: "Doğrulama Bekliyor",
  [CheckStatus.REMOVED_FROM_SCOPE]: "Kapsam Dışı",
};

export const verificationLabel: Record<VerificationType, string> = {
  [VerificationType.SELF]: "Ekip Onayı",
  [VerificationType.CROSS_TEAM]: "Çapraz Onay",
  [VerificationType.SEO_GATED]: "SEO Onayı Gerekli",
};

export const deploymentLabel: Record<DeploymentStatus, string> = {
  [DeploymentStatus.NOT_DEPLOYED]: "Henüz Yayınlanmadı",
  [DeploymentStatus.DEPLOYED]: "Yayına Alındı",
  [DeploymentStatus.POST_LAUNCH_VERIFYING]: "Yayın Sonrası Kontrol Ediliyor",
  [DeploymentStatus.PRODUCTION_VERIFIED]: "Production Doğrulandı",
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
  GEO: "SEO / GEO",
  ANALYTICS: "Analytics",
  MIGRATION: "Migrasyon",
  MULTILINGUAL: "Çok dilli",
  POST_LAUNCH: "Yayın sonrası",
};

export const roleLabel: Record<string, string> = {
  TEAM_MEMBER: "Ekip üyesi",
  SEO_LEAD: "SEO Lead",
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
