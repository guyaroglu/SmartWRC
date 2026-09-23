"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logoutAction } from "@/app/actions";
import { searchAction } from "@/app/search-action";
import type { SearchHit } from "@/lib/search";
import type { AttentionItem } from "@/lib/attention";
import { initials, roleTeamLine } from "@/lib/display";
import { IconBell, IconChevronRight, IconSearch } from "@/components/icons";
import { Role } from "@prisma/client";

const kindLabel: Record<SearchHit["kind"], string> = {
  project: "Proje",
  release: "Release",
  check: "Kontrol",
};

const toneBg = {
  danger: "bg-rust-100 text-rust-700",
  warning: "bg-honey-100 text-honey-700",
  brand: "bg-clay-50 text-clay-700",
  neutral: "bg-sand-100 text-sand-700",
};

export function TopBar({
  name,
  role,
  teamKey,
  attention,
}: {
  name: string;
  role: Role;
  teamKey: string | null;
  attention: AttentionItem[];
}) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-sand-200 bg-white px-6">
      <GlobalSearch />
      <AttentionMenu items={attention} />
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sand-900 text-[13px] font-bold text-sand-50" aria-hidden>
          {initials(name)}
        </span>
        <div className="hidden min-w-0 sm:block">
          <div className="truncate text-[13px] font-bold text-sand-900">{name}</div>
          <div className="truncate text-xs text-sand-500">{roleTeamLine(role, teamKey)}</div>
        </div>
        <form action={logoutAction}>
          <button className="text-xs font-semibold text-sand-500 underline-offset-2 hover:text-sand-800 hover:underline" type="submit">
            Çıkış
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
    <div ref={box} className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor="global-search">
        Proje, release veya kontrol ara
      </label>
      <div className="flex h-10 items-center gap-2 rounded-full border border-sand-300 bg-sand-50 px-3.5">
        <IconSearch size={16} className="text-sand-500" />
        <input
          id="global-search"
          className="h-full w-full bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-400"
          placeholder="Proje, release veya kontrol ara…"
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
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-overlay"
        >
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-sand-500">Eşleşen kayıt yok.</p>
          ) : (
            <ul>
              {hits.map((hit) => (
                <li key={`${hit.kind}-${hit.id}`}>
                  <Link
                    href={hit.href}
                    className="flex items-center gap-3 px-4 py-2.5 no-underline hover:bg-sand-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wide text-sand-400">
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

function AttentionMenu({ items }: { items: AttentionItem[] }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

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
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white text-sand-800"
        aria-label={items.length ? `${items.length} dikkat gerektiren kayıt` : "Dikkat gerektiren kayıt yok"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconBell size={17} />
        {items.length ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rust-500 px-1 text-[10px] font-bold text-white">
            {items.length}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-overlay">
          <div className="border-b border-sand-200 px-4 py-3 text-sm font-bold text-sand-900">Dikkat gerekenler</div>
          {items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-sand-500">Şu anda aksiyon bekleyen kayıt yok.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 no-underline hover:bg-sand-50"
                    onClick={() => setOpen(false)}
                  >
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-extrabold ${toneBg[item.tone]}`}>
                      {item.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-sand-900">{item.label}</span>
                      <span className="block truncate text-xs text-sand-500">{item.meta}</span>
                    </span>
                    <IconChevronRight size={16} className="text-sand-400" />
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
