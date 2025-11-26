"use client";

import React from "react";

export default function DashboardToolbar({
  onSearch,
  onFilterClick,
  onDateClick,
}: {
  onSearch?: (q: string) => void;
  onFilterClick?: () => void;
  onDateClick?: () => void;
}) {
  const [q, setQ] = React.useState("");

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label className="relative flex-1 sm:flex-none group">
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
            placeholder="Search reports, metrics... (press / to focus)"
            aria-label="Search reports and metrics"
            className="w-full sm:w-80 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-2.5 pl-10 text-sm placeholder:text-zinc-400 outline-none transition-all"
            style={{
              borderColor: q ? '#038a36' : undefined,
              boxShadow: q ? '0 0 0 4px rgba(3, 138, 54, 0.05)' : undefined
            }}
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors text-[20px]" style={{color: q ? '#038a36' : undefined}}>
            search
          </span>
        </label>

        <button
          type="button"
          aria-label="Open filters"
          onClick={() => onFilterClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white hover:border-zinc-300/60 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
          Filter
        </button>

        <button
          type="button"
          aria-label="Choose date range"
          onClick={() => onDateClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white hover:border-zinc-300/60 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          Date
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Create new report"
          className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2.5 text-sm font-medium transition-all shadow-md"
          style={{ backgroundColor: '#038a36', boxShadow: '0 4px 6px -1px rgba(3, 138, 54, 0.2), 0 2px 4px -2px rgba(3, 138, 54, 0.2)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#027a2e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#038a36'}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Report
        </button>
      </div>
    </div>
  );
}
