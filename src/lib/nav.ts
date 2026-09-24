import { Role } from "@prisma/client";

export type NavItem = { href: string; label: string };

export function navItems(role: Role): NavItem[] {
  switch (role) {
    case Role.TEAM_MEMBER:
      return [
        { href: "/dashboard", label: "Genel Bakış" },
        { href: "/my-checks", label: "Görevlerim" },
        { href: "/projects", label: "Projeler" },
      ];
    case Role.SEO_LEAD:
      return [
        { href: "/dashboard", label: "Genel Bakış" },
        { href: "/reviews", label: "Onaylar" },
        { href: "/projects", label: "Projeler" },
        { href: "/templates", label: "Kontrol Şablonları" },
      ];
    case Role.PROJECT_MANAGER:
      return [
        { href: "/dashboard", label: "Genel Bakış" },
        { href: "/projects", label: "Projeler" },
      ];
    case Role.MANAGEMENT:
      return [{ href: "/management", label: "Yayın Durumu" }];
    case Role.SYSTEM_ADMIN:
      return [
        { href: "/dashboard", label: "Genel Bakış" },
        { href: "/projects", label: "Projeler" },
        { href: "/my-checks", label: "Görevlerim" },
        { href: "/reviews", label: "Onaylar" },
        { href: "/templates", label: "Kontrol Şablonları" },
        { href: "/admin", label: "Sistem Yönetimi" },
      ];
    default:
      return [{ href: "/dashboard", label: "Genel Bakış" }];
  }
}

export function homePath(role: Role): string {
  return role === Role.MANAGEMENT ? "/management" : "/dashboard";
}
