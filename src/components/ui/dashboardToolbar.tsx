"use client";

import React from "react";
import { Search, Filter, Calendar, Plus } from "lucide-react";

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
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            placeholder="Search reports, metrics..."
            aria-label="Search reports and metrics"
            className="w-full sm:w-80 rounded-xl border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        </label>

        <button
          type="button"
          aria-label="Open filters"
          onClick={() => onFilterClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <Filter size={16} />
          Filter
        </button>

        <button
          type="button"
          aria-label="Choose date range"
          onClick={() => onDateClick?.()}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <Calendar size={16} />
          Date
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Create new report"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all hover:shadow-md"
        >
          <Plus size={18} />
          New Report
        </button>
      </div>
    </div>
  );
}
