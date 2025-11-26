"use client";
import React from "react";

type Props = {
  label?: string;
  value?: React.ReactNode;
  icon?: string;
  colorClass?: string; // e.g. 'bg-blue-50 text-blue-600'
  style?: React.CSSProperties; // for inline AU colors
  placeholder?: boolean;
};

const ValueDisplay = ({ value }: { value?: React.ReactNode }) => {
  if (typeof value !== 'string') {
    return <div className="text-4xl font-bold text-zinc-900 truncate">{value ?? '—'}</div>;
  }

  const match = value.match(/([≈>≥~]?\s*[\d,.]+)(.*)/);

  if (match) {
    const [, mainValue, additionalText] = match;
    return (
      <>
        <div className="text-4xl font-bold text-zinc-900 truncate">{mainValue.trim()}</div>
        {additionalText.trim() && <div className="mt-1 text-xs text-zinc-500">{additionalText.trim().replace(/^\((.*)\)$/, '')}</div>}
      </>
    );
  }

  return <div className="text-4xl font-bold text-zinc-900 truncate">{value}</div>;
};


export default function PhaseTwoImpactCard({ label, value, icon, colorClass = "bg-zinc-50 text-zinc-600", style, placeholder = false }: Props) {
  if (placeholder) return <div className="rounded-xl border border-transparent bg-transparent px-4 py-6" aria-hidden />;

  return (
    <div className="rounded-xl border bg-white p-4 transition-all duration-200"
         style={{ 
           borderColor: '#038a3620',
           boxShadow: '0 1px 2px 0 rgba(3, 138, 54, 0.05)'
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.borderColor = '#038a3640';
           e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(3, 138, 54, 0.1), 0 2px 4px -2px rgba(3, 138, 54, 0.1)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.borderColor = '#038a3620';
           e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(3, 138, 54, 0.05)';
         }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <ValueDisplay value={value} />
          {label ? <div className="mt-2 text-sm font-medium text-zinc-600 truncate">{label}</div> : null}
        </div>

        {icon ? (
          <div className={`flex-shrink-0 rounded-lg p-3 ${colorClass} flex items-center justify-center`} style={style}>
            <span className="material-symbols-outlined text-2xl" aria-hidden>{icon}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}


