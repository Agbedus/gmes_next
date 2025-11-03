"use client";

import React from "react";

type ImpactCardProps = {
  label?: string;
  number: string | number;
  unit?: string;
  highlight?: boolean;
  icon?: string;
  colorClass?: string; // e.g. 'bg-blue-50 text-blue-600'
  placeholder?: boolean;
};

export default function ImpactCard({ label, number, unit, highlight = false, icon, colorClass = "bg-zinc-50 text-zinc-600", placeholder = false }: ImpactCardProps) {
  if (placeholder) {
    // invisible placeholder to keep grid layout even
    return <div className="rounded-xl border border-transparent bg-transparent px-4 py-6" aria-hidden="true" />;
  }

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white px-4 py-6 ${highlight ? "bg-blue-50" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          {label ? <div className="text-xs font-medium text-zinc-500">{label}</div> : null}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-zinc-900">{number}</span>
            {unit ? <span className="text-sm text-zinc-600">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className={`rounded-md p-2 ${colorClass} flex items-center justify-center`}>
            <span className="material-symbols-outlined" aria-hidden>
              {icon}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
