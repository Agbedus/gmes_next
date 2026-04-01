"use client";

import React from "react";
import IconlyIcon from "./IconlyIcon";

export default function ProgramHeader({
  name,
  oneLiner,
  onSearch,
}: {
  name: string;
  oneLiner?: string;
  onSearch?: (q: string) => void;
  }) {
  const [q, setQ] = React.useState("");

  return (
    <header className="rounded-[28px] border border-[#153f25] bg-[linear-gradient(135deg,#1A5632,#153f25)] p-6 sm:p-7 text-white">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Overview</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{name}</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {onSearch ? (
              <label className="relative block">
                <input
                  data-dashboard-search
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch?.(q);
                  }}
                  placeholder="Search reports, metrics..."
                  aria-label="Search reports and metrics"
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors sm:w-80"
                />
                <IconlyIcon name="search" size={20} color={q ? "#1A5632" : "#94a3b8"} className="absolute left-3 top-1/2 -translate-y-1/2" />
              </label>
            ) : null}

            <button type="button" aria-label="Share program" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-medium text-[#1A5632] transition-colors hover:bg-slate-50">
              <IconlyIcon name="share" size={20} color="#1A5632" />
              Share
            </button>
          </div>
        </div>

        {oneLiner ? <p className="w-full text-sm leading-relaxed text-white/80">{oneLiner}</p> : null}
      </div>
    </header>
  );
}
