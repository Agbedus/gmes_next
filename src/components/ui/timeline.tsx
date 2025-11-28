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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm" 
      style={{boxShadow: '0 1px 3px 0 rgba(3, 138, 54, 0.05), 0 1px 2px -1px rgba(3, 138, 54, 0.05)'}}
    >
      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Timeline</h3>
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
              <div className="flex-shrink-0 w-24 text-xs font-bold pt-1" style={{color: '#038a36'}}>{it.year ?? it.years}</div>

              <div className="flex-1 relative pb-1">
                {/* Connector line */}
                {idx !== items.length - 1 && (
                    <div className="absolute left-[-17px] top-2 bottom-[-14px] w-[2px] transition-colors" style={{backgroundColor: '#038a3620'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#038a3640'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#038a3620'} />
                )}
                {/* Dot */}
                <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 transition-all" style={{borderColor: '#038a36'}} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.borderColor = '#027a2e'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#038a36'; }} />

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
                  className="w-full text-left focus:outline-none rounded-lg transition-colors hover:bg-white/50 p-1 -ml-1"
                  style={{
                    boxShadow: isExpanded ? '0 0 0 2px rgba(3, 138, 54, 0.2)' : undefined
                  }}
                >
                  <div id={contentId} className="text-sm text-zinc-600 leading-relaxed group-hover:text-zinc-900 transition-colors">
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
