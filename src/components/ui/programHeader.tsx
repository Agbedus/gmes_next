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
    <header className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">{name}</h1>
          {oneLiner ? <p className="mt-2 text-sm text-zinc-600">{oneLiner}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Share program" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
            <span className="material-symbols-outlined">share</span>
            Share
          </button>

          <button type="button" aria-label="Export program" className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
        </div>
      </div>
    </header>
  );
}
