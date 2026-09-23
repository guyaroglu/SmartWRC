import { prisma } from "@/lib/prisma";
import { canViewRelease, type AuthUser } from "@/lib/authz";

export type SearchKind = "project" | "release" | "check";

export type SearchHit = {
  kind: SearchKind;
  id: string;
  title: string;
  meta: string;
  href: string;
};

export const SEARCH_LIMIT_PER_KIND = 6;

export async function searchVisible(user: AuthUser, rawQuery: string): Promise<SearchHit[]> {
  if (!canViewRelease(user)) return [];
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const [projects, releases, checks] = await Promise.all([
    prisma.project.findMany({
      where: { archived: false, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true },
      take: SEARCH_LIMIT_PER_KIND,
      orderBy: { name: "asc" },
    }),
    prisma.release.findMany({
      where: {
        archived: false,
        project: { archived: false },
        OR: [{ name: { contains: q, mode: "insensitive" } }, { project: { name: { contains: q, mode: "insensitive" } } }],
      },
      select: { id: true, name: true, project: { select: { name: true } } },
      take: SEARCH_LIMIT_PER_KIND,
      orderBy: { name: "asc" },
    }),
    prisma.releaseCheck.findMany({
      where: {
        release: { archived: false, project: { archived: false } },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { controlCode: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        controlCode: true,
        release: { select: { name: true, project: { select: { name: true } } } },
      },
      take: SEARCH_LIMIT_PER_KIND,
      orderBy: { title: "asc" },
    }),
  ]);

  return [
    ...projects.map((p) => ({
      kind: "project" as const,
      id: p.id,
      title: p.name,
      meta: "Proje",
      href: `/projects/${p.id}`,
    })),
    ...releases.map((r) => ({
      kind: "release" as const,
      id: r.id,
      title: r.name,
      meta: `Release · ${r.project.name}`,
      href: `/releases/${r.id}`,
    })),
    ...checks.map((c) => ({
      kind: "check" as const,
      id: c.id,
      title: c.title,
      meta: `Kontrol · ${c.release.project.name} · ${c.controlCode}`,
      href: `/checks/${c.id}`,
    })),
  ];
}
