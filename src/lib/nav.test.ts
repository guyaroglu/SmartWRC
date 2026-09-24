import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { homePath, navItems } from "@/lib/nav";

describe("role navigation", () => {
  it("TEAM_MEMBER sees Dashboard, Görevlerim, Projeler", () => {
    expect(navItems(Role.TEAM_MEMBER).map((i) => i.label)).toEqual(["Genel Bakış", "Görevlerim", "Projeler"]);
  });

  it("SEO_LEAD keeps Onaylar and authorized Şablonlar", () => {
    expect(navItems(Role.SEO_LEAD).map((i) => [i.href, i.label])).toEqual([
      ["/dashboard", "Genel Bakış"],
      ["/reviews", "Onaylar"],
      ["/projects", "Projeler"],
      ["/templates", "Kontrol Şablonları"],
    ]);
  });

  it("PROJECT_MANAGER sees Dashboard and Projeler", () => {
    expect(navItems(Role.PROJECT_MANAGER).map((i) => i.label)).toEqual(["Genel Bakış", "Projeler"]);
  });

  it("MANAGEMENT sees only Yayın Durumu", () => {
    expect(navItems(Role.MANAGEMENT)).toEqual([{ href: "/management", label: "Yayın Durumu" }]);
    expect(homePath(Role.MANAGEMENT)).toBe("/management");
  });

  it("SYSTEM_ADMIN sees operational destinations, not prototype screens", () => {
    const labels = navItems(Role.SYSTEM_ADMIN).map((i) => i.label);
    expect(labels).toEqual(["Genel Bakış", "Projeler", "Görevlerim", "Onaylar", "Kontrol Şablonları", "Sistem Yönetimi"]);
    expect(labels).not.toContain("Tasarım Sistemi");
    expect(labels).not.toContain("Release Detayı");
    expect(labels).not.toContain("Kontrol Detayı");
  });
});
