"use client";

import React from "react";

type ImpactCardProps = {
  label?: string;
  number: string | number;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
  colorClass?: string; // e.g. 'bg-blue-50 text-blue-600'
  placeholder?: boolean;
};

export default function ImpactCard({ label, number, unit, highlight = false, icon, colorClass = "bg-zinc-50 text-zinc-600", placeholder = false }: ImpactCardProps) {
  if (placeholder) {
    // invisible placeholder to keep grid layout even
    return <div className="rounded-2xl border border-transparent bg-transparent px-5 py-6" aria-hidden="true" />;
  }

  return (
    <div className={`rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl px-5 py-6 shadow-sm shadow-indigo-100/10 hover:shadow-md hover:shadow-indigo-100/20 transition-all duration-300 group ${highlight ? "bg-indigo-50/50 border-indigo-100" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          {label ? <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 group-hover:text-indigo-600 transition-colors">{label}</div> : null}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">{number}</span>
            {unit ? <span className="text-sm font-medium text-zinc-500">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className={`rounded-xl p-3 ${colorClass} flex items-center justify-center shadow-sm ring-1 ring-inset ring-black/5 group-hover:scale-110 transition-transform duration-300`}>
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
