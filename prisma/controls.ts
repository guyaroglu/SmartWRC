import {
  DomainKey,
  ModuleKey,
  Priority,
  TeamKey,
  VerificationType,
  Checkpoint,
} from "@prisma/client";

export type SeedControl = {
  code: string;
  title: string;
  owner: TeamKey;
  domains: DomainKey[];
  priority: Priority;
  verification: VerificationType;
  module: ModuleKey;
  evidence: boolean;
  blocker?: boolean;
  checkpoint?: Checkpoint;
};

export const SEED_CONTROLS: SeedControl[] = [
  { code: "BASE-001", title: "Production domain kesinleştirildi", owner: TeamKey.SEO, domains: [DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.BASE, evidence: true },
  { code: "BASE-006", title: "Rollback yaklaşımı tanımlandı", owner: TeamKey.SEO, domains: [DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.CROSS_TEAM, module: ModuleKey.BASE, evidence: true },
  { code: "BE-010", title: "Redirect mapping uygulanmış", owner: TeamKey.BACKEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.BACKEND, evidence: true },
  { code: "BE-011", title: "Redirect chain bulunmuyor", owner: TeamKey.BACKEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.BACKEND, evidence: true },
  { code: "BE-014", title: "XML sitemap doğru production URL'lerini üretiyor", owner: TeamKey.BACKEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.BACKEND, evidence: true },
  { code: "FE-003", title: "Primary navigation çalışıyor", owner: TeamKey.FRONTEND, domains: [DomainKey.UX], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.FRONTEND, evidence: true },
  { code: "FE-014", title: "Canonical doğru production URL'sini gösteriyor", owner: TeamKey.FRONTEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.FRONTEND, evidence: true },
  { code: "FE-015", title: "Canonical staging/localhost göstermiyor", owner: TeamKey.FRONTEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.FRONTEND, evidence: true },
  { code: "FE-019", title: "Critical content JS hatası nedeniyle kaybolmuyor", owner: TeamKey.FRONTEND, domains: [DomainKey.SEO, DomainKey.GEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.FRONTEND, evidence: true },
  { code: "FE-008", title: "Broken image bulunmuyor", owner: TeamKey.FRONTEND, domains: [DomainKey.UX], priority: Priority.P1, verification: VerificationType.SELF, module: ModuleKey.FRONTEND, evidence: false },
  { code: "NET-001", title: "Production DNS kayıtları doğru", owner: TeamKey.NETWORK, domains: [DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.NETWORK, evidence: true },
  { code: "NET-004", title: "HTTP → HTTPS redirect aktif", owner: TeamKey.NETWORK, domains: [DomainKey.INFRASTRUCTURE, DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.NETWORK, evidence: true },
  { code: "NET-015", title: "Googlebot WAF/CDN tarafından yanlışlıkla bloklanmıyor", owner: TeamKey.NETWORK, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.NETWORK, evidence: true },
  { code: "NET-018", title: "robots.txt CDN'de stale sürüm değil", owner: TeamKey.NETWORK, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.NETWORK, evidence: true },
  { code: "CNT-017", title: "Staging URL linki kalmamış", owner: TeamKey.CONTENT, domains: [DomainKey.SEO, DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.CROSS_TEAM, module: ModuleKey.CONTENT, evidence: true },
  { code: "CNT-007", title: "H1 girilmiş ve sayfa konusu ile uyumlu", owner: TeamKey.CONTENT, domains: [DomainKey.SEO], priority: Priority.P1, verification: VerificationType.CROSS_TEAM, module: ModuleKey.CONTENT, evidence: false },
  { code: "SEO-001", title: "Production robots.txt doğru", owner: TeamKey.SEO, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.SEO, evidence: true },
  { code: "SEO-002", title: "Yanlış noindex bulunmuyor", owner: TeamKey.SEO, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.SEO, evidence: true },
  { code: "SEO-008", title: "Canonical stratejisi doğru", owner: TeamKey.SEO, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.SEO, evidence: true },
  { code: "GEO-001", title: "Googlebot kritik sayfalara erişebiliyor", owner: TeamKey.NETWORK, domains: [DomainKey.GEO, DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.GEO, evidence: true },
  { code: "ANL-001", title: "Production GA4 doğru property'ye veri gönderiyor", owner: TeamKey.FRONTEND, domains: [DomainKey.ANALYTICS], priority: Priority.P0, verification: VerificationType.CROSS_TEAM, module: ModuleKey.ANALYTICS, evidence: true },
  { code: "MIG-003", title: "Kritik URL'ler bire bir doğru hedefe yönleniyor", owner: TeamKey.BACKEND, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.MIGRATION, evidence: true },
  { code: "ML-002", title: "hreflang language/region kodları doğru", owner: TeamKey.SEO, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.MULTILINGUAL, evidence: true },
  { code: "POST-001", title: "Production homepage 200", owner: TeamKey.FRONTEND, domains: [DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.POST_LAUNCH, evidence: true, checkpoint: Checkpoint.RELEASE_DAY },
  { code: "POST-003", title: "DNS doğru", owner: TeamKey.NETWORK, domains: [DomainKey.INFRASTRUCTURE], priority: Priority.P0, verification: VerificationType.SELF, module: ModuleKey.POST_LAUNCH, evidence: true, checkpoint: Checkpoint.RELEASE_DAY },
  { code: "POST-007", title: "canonical production doğru", owner: TeamKey.SEO, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.POST_LAUNCH, evidence: true, checkpoint: Checkpoint.RELEASE_DAY },
  { code: "POST-012", title: "Googlebot erişimi doğrulandı", owner: TeamKey.NETWORK, domains: [DomainKey.SEO], priority: Priority.P0, verification: VerificationType.SEO_GATED, module: ModuleKey.POST_LAUNCH, evidence: true, checkpoint: Checkpoint.RELEASE_DAY },
];

export function controlText(code: string, title: string) {
  return {
    description: title,
    whyItMatters: `${title} — release kalitesi ve sahiplik için zorunlu kontrol.`,
    expectedResult: `${title} production'da beklenen sonucu sağlar.`,
    howToCheck: `${code}: rendered/production kanıtı ekleyin.`,
    howToFix: `Owner ekip düzeltir. Strateji belirsizse SEO'ya eskale edilir.`,
    escalationRule: `Hangi sonucun doğru olduğu stratejik olarak belirsizse SEO'ya eskale edilir. Uygulama bitmediği için SEO blocker yazılmaz.`,
    lifecyclePhase: code.startsWith("POST") ? "POST_LAUNCH" : "PRE_LAUNCH",
  };
}
