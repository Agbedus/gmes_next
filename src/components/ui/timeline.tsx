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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Timeline</h3>
      <ol className="mt-4 space-y-4">
        {items.map((it, idx) => {
          const isExpanded = !!expanded[idx];
          const contentId = `timeline-${idx}-content`;
          return (
            <li key={idx} className="flex gap-4 group">
              <div className="flex-shrink-0 w-24 text-xs text-blue-600 font-bold pt-1">{it.year ?? it.years}</div>

              <div className="flex-1">
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
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 rounded-lg transition-colors"
                >
                  <div id={contentId} className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
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
