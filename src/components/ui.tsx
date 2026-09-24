import Link from "next/link";
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
  initials,
  priorityBadgeTone,
  priorityShortLabel,
  statusBadgeTone,
  type BadgeTone,
} from "@/lib/display";
import {
  IconAlert,
  IconChevronRight,
  IconCircleCheck,
  IconCircleDashed,
  IconInbox,
  IconLock,
  IconMessage,
  IconOctagonX,
  TeamGlyph,
} from "@/components/icons";

// ---------------------------------------------------------------------------
// Badge — _ds components/core/Badge: 11px/600, line-height 1, 5px 9px,
// 6px radius, 6px currentColor dot, gap 6. Count shape: 4px 7px.
// ---------------------------------------------------------------------------

const toneBox: Record<BadgeTone, string> = {
  success: "bg-olive-100 text-olive-700",
  warning: "bg-honey-100 text-honey-700",
  danger: "bg-rust-100 text-rust-700",
  brand: "bg-clay-50 text-clay-700",
  neutral: "bg-sand-100 text-sand-600",
};

export function Badge({
  tone = "neutral",
  dot = false,
  count = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  count?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip text-[11px] font-semibold leading-none ${
        count ? "px-[7px] py-1" : "px-[9px] py-[5px]"
      } ${toneBox[tone]}`}
    >
      {dot ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Gate — prototype: sm chip 30px / 0 12px / 8px radius / 13px 800 +0.02em,
// icon 15; lg headline 12px 18px / 12px radius / 24px 800 -0.01em, icon 24 @2.2.
// ---------------------------------------------------------------------------

function GateIcon({ gate, size, strokeWidth }: { gate: GateStatus; size: number; strokeWidth?: number }) {
  if (gate === "READY") return <IconCircleCheck size={size} strokeWidth={strokeWidth} />;
  if (gate === "NO_GO") return <IconOctagonX size={size} strokeWidth={strokeWidth} />;
  if (gate === "AT_RISK") return <IconAlert size={size} strokeWidth={strokeWidth} />;
  return <IconCircleDashed size={size} strokeWidth={strokeWidth} />;
}

export function GateBadge({ gate }: { gate: GateStatus | string }) {
  const value = gate as GateStatus;
  const tone = gateChipTone(value);
  return (
    <span
      className={`inline-flex min-h-[30px] items-center gap-2 self-start justify-self-start rounded-tile px-3 py-1 text-[13px] font-extrabold uppercase leading-tight tracking-gate sm:whitespace-nowrap ${tone.bg} ${tone.fg}`}
    >
      <GateIcon gate={value} size={15} />
      {gateHeadline[value] ?? gateLabel[value] ?? gate}
    </span>
  );
}

export function GateHeadline({ gate }: { gate: GateStatus }) {
  const tone = gateChipTone(gate);
  return (
    <div
      className={`inline-flex items-center gap-2.5 self-start rounded-panel px-[18px] py-3 text-lg font-extrabold tracking-snug sm:text-2xl ${tone.bg} ${tone.fg}`}
    >
      <GateIcon gate={gate} size={24} strokeWidth={2.2} />
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

// Team label chip — prototype: 24px / 0 8px / 6px radius / 12px 600, icon 13, gap 5.
export function TeamBadge({
  teamKey,
  name,
  tone = "neutral",
}: {
  teamKey: string;
  name?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const cls =
    tone === "success"
      ? "bg-olive-100 text-olive-700"
      : tone === "warning"
        ? "bg-honey-100 text-honey-700"
        : tone === "danger"
          ? "bg-rust-100 text-rust-700"
          : "bg-sand-100 text-sand-900";
  return (
    <span className={`inline-flex h-6 items-center gap-[5px] whitespace-nowrap rounded-chip px-2 text-xs font-semibold ${cls}`}>
      <TeamGlyph teamKey={teamKey} size={13} />
      {name ?? teamLabel[teamKey] ?? teamKey}
    </span>
  );
}

// Responsible-team dark chip — 28px / 0 10px / 6px / 13px 700, icon 14, gap 6.
export function OwnerChip({ teamKey, name }: { teamKey: string; name?: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-chip bg-sand-900 px-2.5 text-[13px] font-bold text-sand-50">
      <TeamGlyph teamKey={teamKey} />
      Sorumlu: {name ?? teamLabel[teamKey] ?? teamKey}
    </span>
  );
}

// Avatar — _ds components/core/Avatar: round, clay-100 / clay-700, initials 700 @ size*.36.
export function Avatar({ name, size = 36, ring = false }: { name: string; size?: number; ring?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-clay-100 font-bold leading-none text-clay-700 ${
        ring ? "shadow-avatar-brand" : ""
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

// Card — white, 16px radius, 1px sand-200 hairline, shadow-card.
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-card border border-sand-200 bg-white shadow-card ${className}`}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Buttons — _ds components/core/Button: pill, 600 / line-height 1 / -0.01em.
// md: 14px, 11px 18px, icon 17, gap 8.  sm: 13px, 8px 14px, icon 15, gap 6.
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const buttonBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border font-semibold leading-none tracking-snug no-underline transition-[background-color,color,box-shadow,transform] duration-fast ease-out active:scale-press disabled:cursor-not-allowed disabled:opacity-[.45] disabled:active:scale-100";

const buttonVariant: Record<ButtonVariant, string> = {
  primary: "border-clay-500 bg-clay-500 text-white shadow-brand hover:bg-clay-600 hover:text-white disabled:hover:bg-clay-500",
  secondary: "border-sand-300 bg-white text-sand-900 shadow-xs hover:bg-sand-50 hover:text-sand-900",
  ghost: "border-transparent bg-transparent text-sand-800 hover:bg-sand-100 hover:text-sand-800",
  // secondary shape with rust text — used only for destructive/negative review actions
  danger: "border-rust-500 bg-white text-rust-700 shadow-xs hover:bg-rust-100 hover:text-rust-700",
};

const buttonSize: Record<ButtonSize, string> = {
  md: "gap-2 px-[18px] py-[11px] text-sm",
  sm: "gap-1.5 px-3.5 py-2 text-[13px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return `${buttonBase} ${buttonVariant[variant]} ${buttonSize[size]} ${extra}`;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; size?: ButtonSize };

export function PrimaryButton({ children, className = "", icon, size = "md", ...props }: BtnProps) {
  return (
    <button className={buttonClass("primary", size, className)} type="submit" {...props}>
      {icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", icon, size = "md", ...props }: BtnProps) {
  return (
    <button className={buttonClass("secondary", size, className)} type="submit" {...props}>
      {icon}
      {children}
    </button>
  );
}

export function DangerButton({ children, className = "", icon, size = "md", ...props }: BtnProps) {
  return (
    <button className={buttonClass("danger", size, className)} type="submit" {...props}>
      {icon}
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", icon, size = "md", ...props }: BtnProps) {
  return (
    <button className={buttonClass("ghost", size, className)} type="button" {...props}>
      {icon}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export function ProgressBar({
  percent,
  className = "",
  barClassName = "bg-sand-700",
}: {
  percent: number;
  className?: string;
  barClassName?: string;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-sand-200 ${className}`}>
      <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${width}%` }} />
    </div>
  );
}

// Empty state — prototype: 20px pad / 12px radius / sunken, icon 20 muted, gap 8.
export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-panel bg-sand-50 p-5 text-center">
      <IconInbox size={20} className="text-sand-500" />
      <div className="text-[13px] font-bold text-sand-900">{title}</div>
      {body ? <div className="text-xs text-sand-500">{body}</div> : null}
    </div>
  );
}

// Locked banner — prototype Check Detail locked state.
export function LockedBanner() {
  return (
    <div className="flex items-start gap-3.5 rounded-panel border border-sand-300 bg-sand-100 px-5 py-4">
      <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-tile bg-white text-sand-800">
        <IconLock size={17} />
      </span>
      <div>
        <div className="text-sm font-bold text-sand-900">Canlı doğrulama tamamlandı</div>
        <div className="mt-0.5 text-[13px] text-sand-800" style={{ lineHeight: 1.5 }}>
          Bu yayın kilitli. Değişiklik yapmak için yayının yeniden açılması gerekir.
        </div>
      </div>
    </div>
  );
}

// Feedback alert — prototype: 14px 16px / 12px radius / gap 6; title 13/700 + icon 15;
// quote 16/600/1.45 sand-900.
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
    <div className={`flex flex-col gap-1.5 rounded-panel px-4 py-3.5 ${box}`}>
      <div className="flex items-center gap-2 text-[13px] font-bold">
        <IconMessage size={15} />
        {title}
      </div>
      {body ? (
        <div className="text-base font-semibold text-sand-900" style={{ lineHeight: 1.45 }}>
          {body}
        </div>
      ) : null}
    </div>
  );
}

// Page header — prototype: 26/700/-0.02em title; subtitle 14 body, mt 6.
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
        <h1 className="text-page font-bold text-sand-900">{title}</h1>
        {subtitle ? <div className="mt-1.5 text-sm text-sand-800">{subtitle}</div> : null}
      </div>
      {actions}
    </div>
  );
}

// Section title — 16/700 heading with optional 12px muted meta on the right.
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

// Uppercase group heading used above release sections (13/700/+0.06em muted).
export function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-eyebrow text-sand-500">{children}</h2>;
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[11px] font-bold uppercase tracking-eyebrow text-sand-400 ${className}`}>{children}</div>;
}

// Segmented control — prototype: 3px pad / pill / sand-100, 12px 600; item 6px 12px,
// active = white surface.
export function Segmented({ items }: { items: { href: string; label: string; active: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-sand-100 p-[3px] text-xs font-semibold">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sand-900 hover:text-sand-900 ${item.active ? "bg-white" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
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

// Fields — single-line fields are 40px pills; textareas 12px radius. Focus: clay border + 3px ring.
const fieldFocus = "outline-none focus:border-clay-300 focus:shadow-focus focus-visible:outline-none";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-full border border-sand-300 bg-white px-3.5 text-[13px] text-sand-900 placeholder:text-sand-400 ${fieldFocus} ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 rounded-full border border-sand-300 bg-white px-3.5 text-[13px] text-sand-900 ${fieldFocus} ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-16 w-full rounded-panel border border-sand-300 bg-white px-3.5 py-2.5 text-[13px] text-sand-900 placeholder:text-sand-400 ${fieldFocus} ${props.className ?? ""}`}
    />
  );
}

export function RowChevron() {
  return <IconChevronRight size={16} className="text-sand-400" />;
}
