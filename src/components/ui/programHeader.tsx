"use client";

import React from "react";

export default function ProgramHeader({
  name,
  oneLiner,
}: {
  name: string;
  oneLiner?: string;
}) {
  return (
    <header className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm shadow-indigo-100/20">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">{name}</h1>
          {oneLiner ? <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{oneLiner}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Share program" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white hover:border-zinc-300/60 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">share</span>
            Share
          </button>

          <button type="button" aria-label="Export program" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export
          </button>
        </div>
      </div>
    </header>
  );
}
