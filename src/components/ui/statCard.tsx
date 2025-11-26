"use client";

import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, delta, deltaType = "neutral", icon }: StatCardProps) {
  const getDeltaStyle = () => {
    if (deltaType === "positive") return { color: '#038a36', backgroundColor: '#038a3610' };
    if (deltaType === "negative") return { color: '#e0c063', backgroundColor: '#e0c06310' };
    return { color: '#71717a', backgroundColor: '#f4f4f5' };
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl px-5 py-5 shadow-sm transition-all duration-300 group"
         style={{boxShadow: '0 1px 3px 0 rgba(3, 138, 54, 0.05), 0 1px 2px -1px rgba(3, 138, 54, 0.05)'}}
         onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(3, 138, 54, 0.1), 0 4px 6px -4px rgba(3, 138, 54, 0.1)'}
         onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(3, 138, 54, 0.05), 0 1px 2px -1px rgba(3, 138, 54, 0.05)'}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#038a36'} onMouseLeave={(e) => e.currentTarget.style.color = '#71717a'}>{title}</h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
            {delta !== undefined ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={getDeltaStyle()}>{delta}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-xl p-2.5 bg-white/50 text-zinc-400 transition-all duration-300 shadow-sm border border-zinc-100/50" aria-hidden
               onMouseEnter={(e) => {
                 e.currentTarget.style.color = '#038a36';
                 e.currentTarget.style.backgroundColor = '#038a3608';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.color = '#a1a1aa';
                 e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
               }}
          >
            {/* Ensure icon is treated as a node if passed as such, or string */}
             {React.isValidElement(icon) ? icon : <span className="material-symbols-outlined">{icon as string}</span>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
