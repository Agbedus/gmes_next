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

export default function ImpactCard({ label, number, unit, highlight = false, icon, colorClass = "bg-gray-50 text-gray-600", placeholder = false }: ImpactCardProps) {
  if (placeholder) {
    // invisible placeholder to keep grid layout even
    return <div className="rounded-2xl border border-transparent bg-transparent px-5 py-6" aria-hidden="true" />;
  }

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${highlight ? "bg-blue-50/50 border-blue-100" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {label ? <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</div> : null}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{number}</span>
            {unit ? <span className="text-sm font-medium text-gray-500">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className={`rounded-xl p-2.5 ${colorClass} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
