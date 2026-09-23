"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { homePath, navItems } from "@/lib/nav";
import { navIcon } from "@/components/icons";

export function Sidebar({ role, reviewCount }: { role: Role; reviewCount: number }) {
  const pathname = usePathname();
  const items = navItems(role);

  return (
    <aside className="flex w-sidebar shrink-0 flex-col border-r border-sand-200 bg-white px-3 py-5">
      <Link href={homePath(role)} className="mb-6 px-2 no-underline">
        <div className="text-[13px] font-extrabold tracking-tight text-sand-900">SmartNet</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-clay-600">WRC</div>
      </Link>
      <nav aria-label="Ana menü" className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showBadge = item.href === "/reviews" && reviewCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-semibold no-underline ${
                active ? "bg-sand-100 text-sand-900" : "text-sand-600 hover:bg-sand-50 hover:text-sand-900"
              }`}
            >
              <span className={active ? "text-clay-600" : "text-sand-400"}>{navIcon(item.href, 16)}</span>
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rust-100 px-1.5 text-[11px] font-bold text-rust-700">
                  {reviewCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
