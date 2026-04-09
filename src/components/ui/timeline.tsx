"use client";

import React from "react";
import { motion } from "framer-motion";

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

  // Reset expanded state when items change (e.g. search cleared)
  React.useEffect(() => {
    setExpanded({});
  }, [items]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-[24px] border border-slate-200 bg-white p-6"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Timeline</h3>
        <p className="mt-1 text-sm text-slate-600">Milestones, launches, and program progression.</p>
      </div>
      <motion.ol 
        className="space-y-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
      >
        {items.map((it, idx) => {
          const isExpanded = !!expanded[idx];
          const contentId = `timeline-${idx}-content`;
          return (
            <motion.li 
              key={idx} 
              className="flex gap-4 group"
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
            >
              <div className="w-24 flex-shrink-0 pt-1 text-xs font-bold text-blue-dark">{it.year ?? it.years}</div>

              <div className="flex-1 relative pb-1">
                {/* Connector line */}
                {idx !== items.length - 1 && (
                    <div className="absolute left-[-17px] top-2 bottom-[-14px] w-[2px] bg-blue-dark/10 transition-colors group-hover:bg-blue-dark/20" />
                )}
                {/* Dot */}
                <div className="absolute left-[-21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-dark bg-white transition-all group-hover:scale-125 group-hover:border-blue-primary" />

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
                  className="w-full rounded-lg p-1 -ml-1 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-dark/20"
                >
                  <div id={contentId} className="text-sm leading-relaxed text-slate-600 transition-colors group-hover:text-slate-900">
                    {isExpanded ? it.event : truncate(it.event, 140)}
                  </div>
                </button>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </motion.div>
  );
}
