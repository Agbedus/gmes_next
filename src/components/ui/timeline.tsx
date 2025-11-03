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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Timeline</h3>
      <ol className="mt-3 space-y-3">
        {items.map((it, idx) => {
          const isExpanded = !!expanded[idx];
          const contentId = `timeline-${idx}-content`;
          return (
            <li key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-24 text-xs text-amber-600 font-semibold">{it.year ?? it.years}</div>

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
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 rounded-md"
                >
                  <div id={contentId} className="text-sm text-zinc-700">
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
