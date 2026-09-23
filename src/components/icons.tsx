import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
  );
}
export function IconChecks(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Svg>
  );
}
export function IconFolder(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </Svg>
  );
}
export function IconStamp(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20h16M8 16h8v4H8z" />
    </Svg>
  );
}
export function IconBook(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </Svg>
  );
}
export function IconUsers(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}
export function IconSearch(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}
export function IconBell(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </Svg>
  );
}
export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 18l6-6-6-6" />
    </Svg>
  );
}
export function IconChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}
export function IconLock(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
  );
}
export function IconOctagonX(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </Svg>
  );
}
export function IconCircleCheck(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </Svg>
  );
}
export function IconAlert(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.3l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.7-2.7l-8-14a2 2 0 0 0-3.4 0z" />
    </Svg>
  );
}
export function IconCode(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </Svg>
  );
}
export function IconServer(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <path d="M7 7h.01M7 17h.01" />
    </Svg>
  );
}
export function IconNetwork(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <path d="M12 8v4M12 12H5v4M12 12h7v4" />
    </Svg>
  );
}
export function IconFile(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </Svg>
  );
}
export function IconPaperclip(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21.4 11.6l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7L9.4 18.1a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </Svg>
  );
}
export function IconUpload(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 20h16" />
    </Svg>
  );
}
export function IconInbox(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.5 5H18.5L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
    </Svg>
  );
}
export function IconMessage(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}
export function IconPlay(p: IconProps) {
  return (
    <Svg {...p}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </Svg>
  );
}
export function IconEye(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
export function IconLogout(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}

export function TeamGlyph({ teamKey, size = 14 }: { teamKey: string; size?: number }) {
  if (teamKey === "BACKEND") return <IconServer size={size} />;
  if (teamKey === "NETWORK") return <IconNetwork size={size} />;
  if (teamKey === "CONTENT") return <IconFile size={size} />;
  if (teamKey === "SEO") return <IconSearch size={size} />;
  return <IconCode size={size} />;
}

export function navIcon(href: string, size = 16) {
  if (href === "/my-checks") return <IconChecks size={size} />;
  if (href === "/projects") return <IconFolder size={size} />;
  if (href === "/reviews") return <IconStamp size={size} />;
  if (href === "/templates") return <IconBook size={size} />;
  if (href === "/admin") return <IconUsers size={size} />;
  if (href === "/management") return <IconEye size={size} />;
  return <IconDashboard size={size} />;
}
