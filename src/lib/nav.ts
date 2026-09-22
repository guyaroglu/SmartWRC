import { Role } from "@prisma/client";

export type NavItem = { href: string; label: string };

export function navItems(role: Role): NavItem[] {
  switch (role) {
    case Role.TEAM_MEMBER:
      return [
        { href: "/dashboard", label: "Ana Sayfa" },
        { href: "/my-checks", label: "Görevlerim" },
        { href: "/projects", label: "Projeler" },
      ];
    case Role.SEO_LEAD:
      return [
        { href: "/dashboard", label: "Ana Sayfa" },
        { href: "/reviews", label: "Onaylar" },
        { href: "/projects", label: "Projeler" },
        { href: "/templates", label: "Şablonlar" },
      ];
    case Role.PROJECT_MANAGER:
      return [
        { href: "/dashboard", label: "Ana Sayfa" },
        { href: "/projects", label: "Projeler" },
      ];
    case Role.MANAGEMENT:
      return [{ href: "/management", label: "Yönetim Özeti" }];
    case Role.SYSTEM_ADMIN:
      return [
        { href: "/dashboard", label: "Ana Sayfa" },
        { href: "/projects", label: "Projeler" },
        { href: "/my-checks", label: "Görevler" },
        { href: "/reviews", label: "Onaylar" },
        { href: "/templates", label: "Şablonlar" },
        { href: "/admin", label: "Kullanıcılar" },
      ];
    default:
      return [{ href: "/dashboard", label: "Ana Sayfa" }];
  }
}

export function homePath(role: Role): string {
  return role === Role.MANAGEMENT ? "/management" : "/dashboard";
}
