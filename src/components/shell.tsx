import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { CheckStatus, DeploymentStatus, GateStatus, Role } from "@prisma/client";
import { navItems } from "@/lib/nav";
import {
  checkStatusLabel,
  deploymentLabel,
  gateLabel,
  gateTone,
  priorityLabel,
  roleLabel,
  statusTone,
} from "@/lib/labels";
import type { Priority } from "@prisma/client";

export function Shell({
  children,
  name,
  role,
}: {
  children: React.ReactNode;
  name: string;
  role: Role;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <Link href={role === "MANAGEMENT" ? "/management" : "/dashboard"} className="font-semibold text-ink no-underline">
              SmartNet WRC
            </Link>
            <p className="text-xs text-ink/55">Web yayın kontrolü — doğru ekip, doğru iş</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm">
            {navItems(role).map((item) => (
              <Link key={item.href} href={item.href} className="text-ink/80 no-underline hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="text-sm">
            <span className="mr-3 text-ink/60">
              {name} · {roleLabel[role] ?? role}
            </span>
            <button className="text-ink/70 underline" type="submit">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

const toneClass = {
  danger: "bg-danger text-white",
  warn: "bg-warn text-white",
  ok: "bg-accent text-white",
  muted: "bg-ink/10 text-ink/80",
};

export function GateBadge({ gate }: { gate: GateStatus | string }) {
  const value = gate as GateStatus;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass[gateTone(value)]}`}>
      {gateLabel[value] ?? gate}
    </span>
  );
}

export function StatusBadge({ status }: { status: CheckStatus | string }) {
  const value = status as CheckStatus;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[statusTone(value)]}`}>
      {checkStatusLabel[value] ?? status}
    </span>
  );
}

export function DeploymentBadge({ status }: { status: DeploymentStatus | string }) {
  const value = status as DeploymentStatus;
  return (
    <span className="inline-flex rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-medium text-ink/80">
      {deploymentLabel[value] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority | string }) {
  const value = priority as Priority;
  const cls = value === "P0" ? "bg-danger/10 text-danger" : value === "P1" ? "bg-warn/10 text-warn" : "bg-ink/10 text-ink/70";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{priorityLabel[value] ?? priority}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-ink/10 bg-white p-4 ${className}`}>{children}</div>;
}

export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" type="submit">
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm" type="submit">
      {children}
    </button>
  );
}
