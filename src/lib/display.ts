import { CheckStatus, DeploymentStatus, GateStatus, Priority, Role } from "@prisma/client";
import { firstName } from "@/lib/format";
import { teamLabel } from "@/lib/labels";

export function initials(name: string): string {
  const parts = name
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function greeting(name: string, now = new Date()): string {
  const hour = now.getHours();
  const first = firstName(name);
  if (hour < 12) return `Günaydın, ${first}`;
  if (hour < 18) return `İyi günler, ${first}`;
  return `İyi akşamlar, ${first}`;
}

export function dateContext(now = new Date()): string {
  const formatted = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function roleTeamLine(role: Role, teamKey: string | null | undefined): string {
  const rolePart =
    role === Role.SYSTEM_ADMIN
      ? "Admin"
      : role === Role.SEO_LEAD
        ? "SEO Lead"
        : role === Role.PROJECT_MANAGER
          ? "PM"
          : role === Role.MANAGEMENT
            ? "Yönetim"
            : teamKey
              ? teamLabel[teamKey] ?? "Ekip"
              : "Ekip üyesi";
  return teamKey && role !== Role.TEAM_MEMBER ? `${rolePart} · ${teamLabel[teamKey] ?? teamKey}` : rolePart;
}

export type BadgeTone = "success" | "warning" | "danger" | "brand" | "neutral";

export function statusBadgeTone(status: CheckStatus): BadgeTone {
  if (status === CheckStatus.PASS) return "success";
  if (status === CheckStatus.FAIL || status === CheckStatus.BLOCKED) return "danger";
  if (status === CheckStatus.REVIEW || status === CheckStatus.DONE_NEEDS_VERIFICATION) return "warning";
  if (status === CheckStatus.IN_PROGRESS) return "brand";
  return "neutral";
}

export function priorityBadgeTone(priority: Priority): BadgeTone {
  if (priority === Priority.P0) return "danger";
  if (priority === Priority.P1) return "warning";
  return "neutral";
}

export function priorityShortLabel(priority: Priority): string {
  if (priority === Priority.P0) return "Kritik";
  if (priority === Priority.P1) return "Yüksek";
  return "Normal";
}

export function gateChipTone(gate: GateStatus): { bg: string; fg: string } {
  if (gate === GateStatus.READY) return { bg: "bg-olive-100", fg: "text-olive-700" };
  if (gate === GateStatus.NO_GO) return { bg: "bg-rust-100", fg: "text-rust-700" };
  if (gate === GateStatus.AT_RISK) return { bg: "bg-honey-100", fg: "text-honey-700" };
  return { bg: "bg-sand-100", fg: "text-sand-700" };
}

export function isCompactVerified(deployment: DeploymentStatus): boolean {
  return deployment === DeploymentStatus.PRODUCTION_VERIFIED;
}

export const CANONICAL_TEAMS = ["FRONTEND", "BACKEND", "NETWORK", "CONTENT", "SEO"] as const;

export function teamIconName(key: string): "code" | "server" | "network" | "file" | "search" {
  if (key === "BACKEND") return "server";
  if (key === "NETWORK") return "network";
  if (key === "CONTENT") return "file";
  if (key === "SEO") return "search";
  return "code";
}
