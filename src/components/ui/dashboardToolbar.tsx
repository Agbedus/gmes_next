"use client";

import React from "react";
import IconlyIcon from "./IconlyIcon";

export default function DashboardToolbar({
  onSearch,
  searchValue,
}: {
  onSearch?: (q: string) => void;
  searchValue?: string;
}) {
  const [q, setQ] = React.useState("");

  // Sync internal state with prop if provided
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setQ(searchValue);
    }
  }, [searchValue]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
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
            className="w-full sm:w-80 rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 pr-10 text-sm placeholder:text-slate-400 outline-none transition-colors"
            style={{
              borderColor: q ? 'var(--color-au-dark-green)' : undefined,
            }}
          />
          <IconlyIcon name="search" size={20} color={q ? 'var(--color-au-dark-green)' : '#94a3b8'} className="absolute left-3 top-1/2 -translate-y-1/2" />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                onSearch?.("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <IconlyIcon name="close" size={16} color="currentColor" />
            </button>
          )}
        </label>
      </div>
    </div>
  );
}
