"use client";

import React from "react";

type TimelineItem = {
  year?: number | string;
  years?: string;
  event: string;
};

function truncate(text: string, n = 120) {
  if (text.length <= n) return text;
  return text.slice(0, n).trimEnd() + "…";
}

export default function Timeline({ items }: { items: TimelineItem[] }) {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm shadow-indigo-100/10">
      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Timeline</h3>
      <ol className="space-y-4">
        {items.map((it, idx) => {
          const isExpanded = !!expanded[idx];
          const contentId = `timeline-${idx}-content`;
          return (
            <li key={idx} className="flex gap-4 group">
              <div className="flex-shrink-0 w-24 text-xs font-bold text-indigo-600 pt-1">{it.year ?? it.years}</div>

              <div className="flex-1 relative pb-1">
                {/* Connector line */}
                {idx !== items.length - 1 && (
                    <div className="absolute left-[-17px] top-2 bottom-[-14px] w-[2px] bg-indigo-100/50 group-hover:bg-indigo-200 transition-colors" />
                )}
                {/* Dot */}
                <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400 group-hover:scale-125 group-hover:border-indigo-600 transition-all" />

                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  onClick={() => setExpanded((s) => ({ ...s, [idx]: !s[idx] }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpanded((s) => ({ ...s, [idx]: !s[idx] }));
                    }
                  }}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 rounded-lg transition-colors hover:bg-white/50 p-1 -ml-1"
                >
                  <div id={contentId} className="text-sm text-zinc-600 leading-relaxed group-hover:text-zinc-900 transition-colors">
                    {isExpanded ? it.event : truncate(it.event, 140)}
                  </div>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
