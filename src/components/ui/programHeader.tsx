"use client";

import React from "react";
import { Share2, Download } from "lucide-react";

export default function ProgramHeader({
  name,
  oneLiner,
}: {
  name: string;
  oneLiner?: string;
}) {
  return (
    <header className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{name}</h1>
          {oneLiner ? <p className="mt-2 text-sm text-gray-500 leading-relaxed">{oneLiner}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Share program" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Share2 size={16} />
            Share
          </button>

          <button type="button" aria-label="Export program" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:shadow-md">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </header>
  );
}
