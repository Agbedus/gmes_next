"use client";

import React from "react";
import IconlyIcon from "./IconlyIcon";

export default function ProgramHeader({
  name,
  oneLiner,
  onSearch,
  searchValue,
}: {
  name: string;
  oneLiner?: string;
  onSearch?: (q: string) => void;
  searchValue?: string;
  }) {
  const [q, setQ] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Sync internal state with prop if provided
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setQ(searchValue);
    }
  }, [searchValue]);

  const handleShare = async () => {
    const shareData = {
      title: name,
      text: oneLiner,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
      // Fallback: try to copy to clipboard anyway if share failed/was cancelled
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error("Failed to copy:", copyErr);
      }
    }
  };

  return (
    <header className="rounded-[28px] border border-blue-dark/10 bg-[linear-gradient(135deg,var(--color-au-dark-green),#172554)] p-6 sm:p-7 text-white shadow-lg">
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
                  className="w-full rounded-xl border border-white/20 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-au-gold sm:w-80"
                />
                <IconlyIcon name="search" size={20} color={q ? "var(--color-au-dark-green)" : "#94a3b8"} className="absolute left-3 top-1/2 -translate-y-1/2" />
                {q && (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      onSearch?.("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-dark"
                  >
                    <IconlyIcon name="close" size={16} color="currentColor" />
                  </button>
                )}
              </label>
            ) : null}

            <button 
              type="button" 
              onClick={handleShare}
              aria-label="Share program" 
              className="relative inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-medium text-blue-dark transition-all hover:bg-slate-50 focus:ring-2 focus:ring-au-gold shadow-sm"
            >
              <IconlyIcon name="share" size={20} color="var(--color-au-dark-green)" />
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        {oneLiner ? <p className="w-full text-sm leading-relaxed text-white/80">{oneLiner}</p> : null}
      </div>
    </header>
  );
}
