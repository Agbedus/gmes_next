"use client";

import React from "react";
import IconlyIcon from "./IconlyIcon";

export default function DashboardToolbar({
  onSearch,
}: {
  onSearch?: (q: string) => void;
}) {
  const [q, setQ] = React.useState("");

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
            className="w-full sm:w-80 rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm placeholder:text-slate-400 outline-none transition-colors"
            style={{
              borderColor: q ? '#1A5632' : undefined,
            }}
          />
          <IconlyIcon name="search" size={20} color={q ? '#1A5632' : '#94a3b8'} className="absolute left-3 top-1/2 -translate-y-1/2" />
        </label>
      </div>
    </div>
  );
}
