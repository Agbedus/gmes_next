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
        <label className="relative flex-1 sm:flex-none">
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
            className="w-full sm:w-80 rounded-md border border-zinc-200 px-3 py-2 text-sm placeholder:text-zinc-400"
          />
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">
            search
          </span>
        </label>

        <button
          type="button"
          aria-label="Open filters"
          onClick={() => onFilterClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          <span className="material-symbols-outlined">filter_list</span>
          Filter
        </button>

        <button
          type="button"
          aria-label="Choose date range"
          onClick={() => onDateClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          <span className="material-symbols-outlined">calendar_month</span>
          Date
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Create new report"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
        >
          <span className="material-symbols-outlined">add</span>
          New Report
        </button>
      </div>
    </div>
  );
}
