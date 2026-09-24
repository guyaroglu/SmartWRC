"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { homePath, navItems } from "@/lib/nav";
import { navIcon } from "@/components/icons";

// _ds components/navigation/Sidebar + NavItem:
// 184px, white, 1px right hairline, 24px 20px padding, 24px section gap.
// Brand: 28px clay disc + 15px/800 wordmark. Eyebrow 11/700 +0.06em faint, 0 0 8px 14px.
// Row: 9px 10px 9px 14px, 8px radius, 14px/1, gap 11, icon 18 (2.2 active / 1.8 idle).
// Active: clay-50 bg, clay-700 700 text, 4px clay bar at left -10px.
// Below md the same rows collapse to an icon rail so navigation stays available on phones.
export function Sidebar({ role, reviewCount }: { role: Role; reviewCount: number }) {
  const pathname = usePathname();
  const items = navItems(role);

  return (
    <aside className="flex w-16 shrink-0 flex-col gap-6 border-r border-sand-200 bg-white px-2.5 py-6 md:w-sidebar md:px-5">
      <Link href={homePath(role)} className="flex items-center justify-center gap-[9px] px-1 md:justify-start" aria-label="SmartNet WRC">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-500 text-[13px] font-extrabold leading-none text-white">
          S
        </span>
        <span className="hidden text-[15px] font-extrabold tracking-tight text-sand-900 md:inline" style={{ lineHeight: 1.15 }}>
          SmartNet WRC
        </span>
      </Link>
      <nav aria-label="Ana menü" className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <div className="hidden pb-2 pl-3.5 text-[11px] font-bold uppercase leading-snug tracking-eyebrow text-sand-400 md:block">
            Çalışma
          </div>
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const showBadge = item.href === "/reviews" && reviewCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
                className={`relative flex w-full items-center justify-center gap-[11px] rounded-tile py-[9px] text-sm leading-none transition-colors duration-fast ease-out md:justify-start md:pl-3.5 md:pr-2.5 ${
                  active
                    ? "bg-clay-50 font-bold text-clay-700 hover:text-clay-700"
                    : "font-medium text-sand-500 hover:bg-sand-100 hover:text-sand-500"
                }`}
              >
                {active ? <span className="absolute -left-2.5 bottom-1.5 top-1.5 w-1 rounded-full bg-clay-500" /> : null}
                {navIcon(item.href, 18, active ? 2.2 : 1.8)}
                <span className="hidden flex-1 md:inline">{item.label}</span>
                {showBadge ? (
                  <span className="absolute -right-1 -top-1 rounded-chip bg-clay-50 px-[7px] py-1 text-[11px] font-semibold leading-none text-clay-700 md:static">
                    {reviewCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
