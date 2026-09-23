import type { CheckStatus, DeploymentStatus, GateStatus, Priority } from "@prisma/client";
import {
  checkStatusLabel,
  deploymentLabel,
  gateHeadline,
  gateLabel,
  teamLabel,
} from "@/lib/labels";
import {
  gateChipTone,
  priorityBadgeTone,
  priorityShortLabel,
  statusBadgeTone,
  type BadgeTone,
} from "@/lib/display";
import { IconChevronRight, IconInbox, IconLock, TeamGlyph } from "@/components/icons";

const toneBox: Record<BadgeTone, string> = {
  success: "bg-olive-100 text-olive-700",
  warning: "bg-honey-100 text-honey-700",
  danger: "bg-rust-100 text-rust-700",
  brand: "bg-clay-50 text-clay-700",
  neutral: "bg-sand-100 text-sand-700",
};

const toneDot: Record<BadgeTone, string> = {
  success: "bg-olive-700",
  warning: "bg-honey-700",
  danger: "bg-rust-700",
  brand: "bg-clay-600",
  neutral: "bg-sand-500",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded px-2 text-xs font-semibold ${toneBox[tone]}`}>
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} /> : null}
      {children}
    </span>
  );
}

export function GateBadge({ gate }: { gate: GateStatus | string }) {
  const value = gate as GateStatus;
  const tone = gateChipTone(value);
  return (
    <span className={`inline-flex h-[30px] items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-extrabold tracking-wide ${tone.bg} ${tone.fg}`}>
      {gateLabel[value] ?? gate}
    </span>
  );
}

export function GateHeadline({ gate }: { gate: GateStatus }) {
  const tone = gateChipTone(gate);
  return (
    <div className={`inline-flex items-center gap-2.5 self-start rounded-xl px-[18px] py-3 text-2xl font-extrabold tracking-tight ${tone.bg} ${tone.fg}`}>
      {gateHeadline[gate]}
    </div>
  );
}

export function StatusBadge({ status }: { status: CheckStatus | string }) {
  const value = status as CheckStatus;
  return (
    <Badge tone={statusBadgeTone(value)} dot>
      {checkStatusLabel[value] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority | string }) {
  const value = priority as Priority;
  return <Badge tone={priorityBadgeTone(value)}>{priorityShortLabel(value)}</Badge>;
}

export function DeploymentBadge({ status }: { status: DeploymentStatus | string }) {
  const value = status as DeploymentStatus;
  return <Badge>{deploymentLabel[value] ?? status}</Badge>;
}

export function TeamBadge({ teamKey, name }: { teamKey: string; name?: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-sand-100 px-2 text-xs font-semibold text-sand-900">
      <TeamGlyph teamKey={teamKey} />
      {name ?? teamLabel[teamKey] ?? teamKey}
    </span>
  );
}

export function OwnerChip({ teamKey, name }: { teamKey: string; name?: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-sand-900 px-2.5 text-[13px] font-bold text-sand-50">
      <TeamGlyph teamKey={teamKey} />
      Sorumlu: {name ?? teamLabel[teamKey] ?? teamKey}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-card border border-sand-200 bg-white shadow-card ${className}`}>{children}</div>;
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-clay-500 px-4 text-sm font-semibold text-white hover:bg-clay-600 disabled:cursor-not-allowed disabled:bg-sand-300 disabled:text-sand-500 ${className}`}
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 text-sm font-semibold text-sand-800 hover:bg-sand-50 ${className}`}
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-sand-700 hover:bg-sand-100 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-sand-200 ${className}`}>
      <div className="h-full rounded-full bg-sand-700" style={{ width: `${width}%` }} />
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-sand-50 px-5 py-8 text-center">
      <IconInbox size={20} className="text-sand-500" />
      <div className="text-[13px] font-bold text-sand-900">{title}</div>
      {body ? <div className="text-xs text-sand-500">{body}</div> : null}
    </div>
  );
}

export function LockedBanner() {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-sand-300 bg-sand-100 px-5 py-4">
      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white text-sand-800">
        <IconLock size={17} />
      </span>
      <div>
        <div className="text-sm font-bold text-sand-900">Production doğrulaması tamamlandı</div>
        <div className="mt-0.5 text-[13px] leading-5 text-sand-800">
          Bu release kilitlidir. Değişiklik yapmak için release yeniden açılmalıdır.
        </div>
      </div>
    </div>
  );
}

export function FeedbackAlert({
  title,
  body,
  tone = "danger",
}: {
  title: string;
  body?: string;
  tone?: "danger" | "warning";
}) {
  const box = tone === "warning" ? "bg-honey-100 text-honey-700" : "bg-rust-100 text-rust-700";
  return (
    <div className={`rounded-xl px-4 py-3.5 ${box}`}>
      <div className="text-[13px] font-bold">{title}</div>
      {body ? <div className="mt-1 text-base font-semibold leading-snug text-sand-900">{body}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <div className="text-xs font-semibold text-sand-500">{eyebrow}</div> : null}
        <h1 className="text-[26px] font-bold tracking-tight text-sand-900">{title}</h1>
        {subtitle ? <div className="mt-1.5 text-sm text-sand-800">{subtitle}</div> : null}
      </div>
      {actions}
    </div>
  );
}

export function SectionTitle({
  children,
  meta,
  className = "",
}: {
  children: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-base font-bold text-sand-900">{children}</h2>
      {meta ? <span className="text-xs text-sand-500">{meta}</span> : null}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-400">{children}</div>;
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-semibold text-sand-800 ${className}`}>
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-full border border-sand-300 bg-white px-3.5 text-sm text-sand-900 placeholder:text-sand-400 ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 rounded-full border border-sand-300 bg-white px-3 text-sm text-sand-900 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-16 w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-sm text-sand-900 placeholder:text-sand-400 ${props.className ?? ""}`}
    />
  );
}

export function RowChevron() {
  return <IconChevronRight size={16} className="text-sand-400" />;
}
