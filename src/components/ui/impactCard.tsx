"use client";

import React from "react";

type ImpactCardProps = {
  label?: string;
  number: string | number;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
  colorClass?: string; // e.g. 'bg-blue-50 text-blue-600'
  style?: React.CSSProperties; // for custom inline styles
  placeholder?: boolean;
};

export default function ImpactCard({ label, number, unit, highlight = false, icon, colorClass = "bg-zinc-50 text-zinc-600", style, placeholder = false }: ImpactCardProps) {
  if (placeholder) {
    // invisible placeholder to keep grid layout even
    return <div className="rounded-2xl border border-transparent bg-transparent px-5 py-6" aria-hidden="true" />;
  }

  return (
    <div className={`rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl px-5 py-6 shadow-sm hover:shadow-md transition-all duration-300 group ${highlight ? "border-emerald-100" : ""}`} 
         style={{
           backgroundColor: highlight ? '#038a3608' : undefined,
           boxShadow: '0 1px 3px 0 rgba(3, 138, 54, 0.05), 0 1px 2px -1px rgba(3, 138, 54, 0.05)'
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(3, 138, 54, 0.1), 0 4px 6px -4px rgba(3, 138, 54, 0.1)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(3, 138, 54, 0.05), 0 1px 2px -1px rgba(3, 138, 54, 0.05)';
         }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          {label ? <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 transition-colors" style={{color: undefined}} onMouseEnter={(e) => e.currentTarget.style.color = '#038a36'} onMouseLeave={(e) => e.currentTarget.style.color = '#71717a'}>{label}</div> : null}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">{number}</span>
            {unit ? <span className="text-sm font-medium text-zinc-500">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className={`rounded-xl p-3 ${colorClass} flex items-center justify-center shadow-sm ring-1 ring-inset ring-black/5 group-hover:scale-110 transition-transform duration-300`} style={style}>
            {/* Handle both string (material symbol) and ReactNode icons */}
            {React.isValidElement(icon) ? icon : (
                <span className="material-symbols-outlined" aria-hidden>
                  {icon as string}
                </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
