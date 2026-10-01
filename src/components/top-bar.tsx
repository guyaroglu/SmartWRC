"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { dismissAllAttentionAction, dismissAttentionAction, logoutAction } from "@/app/actions";
import { searchAction } from "@/app/search-action";
import type { SearchHit } from "@/lib/search";
import type { AttentionItem } from "@/lib/attention";
import { roleTeamLine } from "@/lib/display";
import { Avatar } from "@/components/ui";
import { IconBell, IconChevronRight, IconLogout, IconSearch } from "@/components/icons";
import { Role } from "@prisma/client";

const kindLabel: Record<SearchHit["kind"], string> = {
  project: "Proje",
  release: "Yayın",
  check: "Görev",
};

const toneBg = {
  danger: "bg-rust-100 text-rust-700",
  warning: "bg-honey-100 text-honey-700",
  brand: "bg-clay-50 text-clay-700",
  neutral: "bg-sand-100 text-sand-700",
};

// _ds components/navigation/TopBar: 64px, white, bottom hairline, 0 24px, gap 20,
// search field left (250px), right cluster gap 12: 36px sunken bell, then avatar
// (36px round, clay ring) + name (13/600) / role (12/400), padding-left 6.
export function TopBar({
  name,
  role,
  teamKey,
  attention,
  attentionTotal,
}: {
  name: string;
  role: Role;
  teamKey: string | null;
  attention: AttentionItem[];
  attentionTotal: number;
}) {
  return (
    <header className="flex h-topbar items-center justify-between gap-5 border-b border-sand-200 bg-white px-4 md:px-6">
      <GlobalSearch />
      <div className="flex items-center gap-3">
        <AttentionMenu items={attention} total={attentionTotal} />
        <div className="flex items-center gap-2.5 pl-1.5">
          <Avatar name={name} size={36} ring />
          <div className="hidden min-w-0 flex-col gap-0.5 sm:flex">
            <span className="truncate text-[13px] font-semibold text-sand-900" style={{ lineHeight: 1.25 }}>
              {name}
            </span>
            <span className="truncate text-xs text-sand-500" style={{ lineHeight: 1.45 }}>
              {roleTeamLine(role, teamKey)}
            </span>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sand-500 transition-colors duration-fast ease-out hover:bg-sand-100 hover:text-sand-800"
            type="submit"
            aria-label="Çıkış"
            title="Çıkış"
          >
            <IconLogout size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      void searchAction(q).then((rows) => {
        setHits(rows);
        setOpen(true);
      });
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={box} className="relative min-w-0 w-[250px] max-w-full">
      <label className="sr-only" htmlFor="global-search">
        Proje, yayın veya kontrol görevi ara
      </label>
      <div className="flex items-center gap-2.5 rounded-full border border-sand-200 bg-sand-50 py-[9px] pl-3.5 pr-3 transition-[border-color,box-shadow] duration-fast ease-out focus-within:border-clay-300 focus-within:shadow-focus">
        <IconSearch size={16} className="text-sand-400" />
        <input
          id="global-search"
          className="min-w-0 flex-1 bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-400 focus-visible:outline-none"
          style={{ lineHeight: 1.45 }}
          placeholder="Proje, yayın veya görev ara"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
        />
      </div>
      {open && q.trim().length >= 2 ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 w-[min(420px,calc(100vw-96px))] overflow-hidden rounded-card border border-sand-200 bg-white shadow-overlay"
        >
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-sand-500">Eşleşen kayıt yok.</p>
          ) : (
            <ul>
              {hits.map((hit) => (
                <li key={`${hit.kind}-${hit.id}`}>
                  <Link
                    href={hit.href}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-sand-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-eyebrow text-sand-400">
                      {kindLabel[hit.kind]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-sand-900">{hit.title}</span>
                      <span className="block truncate text-xs text-sand-500">{hit.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AttentionMenu({ items: all, total }: { items: AttentionItem[]; total: number }) {
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [allCleared, setAllCleared] = useState(false);
  const [, startTransition] = useTransition();
  const box = useRef<HTMLDivElement>(null);
  // Optimistic: hide immediately; the server action persists it and refreshes the layout.
  const items = allCleared ? [] : all.filter((i) => !cleared.has(i.key));
  const count = allCleared ? 0 : Math.max(0, total - (all.length - items.length));

  // Fresh server data already excludes persisted dismissals; drop the optimistic overlay.
  useEffect(() => {
    setCleared(new Set());
    setAllCleared(false);
  }, [all, total]);

  function clearOne(key: string) {
    setCleared((s) => new Set(s).add(key));
    startTransition(() => dismissAttentionAction(key));
  }

  function clearAll() {
    setAllCleared(true);
    startTransition(() => dismissAllAttentionAction());
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-sand-50 text-sand-800 transition-[filter] duration-fast ease-out hover:brightness-[.96]"
        aria-label={count ? `${count} dikkat gerektiren kayıt` : "Dikkat gerektiren kayıt yok"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconBell size={17} />
        {count ? (
          <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="fixed left-4 right-4 top-[72px] z-30 overflow-hidden rounded-card md:absolute md:left-auto md:right-0 md:top-auto md:mt-2 md:w-80 border border-sand-200 bg-white shadow-overlay">
          <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-4 py-3">
            <span className="text-base font-bold text-sand-900">Dikkat Gerektirenler</span>
            {items.length ? (
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-clay-700 hover:underline">
                Tümünü temizle
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-sand-500">Şu anda aksiyon bekleyen kayıt yok.</p>
          ) : (
            <ul className="flex flex-col gap-1 p-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-row p-2.5 hover:bg-sand-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-tile text-[15px] font-extrabold ${toneBg[item.tone]}`}>
                      {item.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-sand-900">{item.label}</span>
                      <span className="block truncate text-xs text-sand-500">{item.meta}</span>
                    </span>
                    <IconChevronRight size={16} className="text-sand-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => clearOne(item.key)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-sand-400 hover:bg-sand-100 hover:text-sand-800"
                    aria-label={`Bildirimi temizle: ${item.label} — ${item.meta}`}
                    title="Temizle"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
