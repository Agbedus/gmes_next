"use client";
import React from "react";
import IconlyIcon from "../IconlyIcon";

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
    return <div className="text-4xl font-bold text-zinc-900 truncate">{value ?? '\u2014'}</div>;
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


export default function PhaseTwoImpactCard({ label, value, icon, colorClass = "bg-slate-50 text-slate-600", style, placeholder = false }: Props) {
  if (placeholder) return <div className="rounded-[24px] border border-transparent bg-transparent px-4 py-6" aria-hidden />;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 transition-colors duration-200"
         style={{ 
           borderColor: '#E2E8F0',
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.borderColor = '#CBD5E1';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.borderColor = '#E2E8F0';
         }}
    >
      {/* Leading icon (rounded square) with value to the right */}
      <div className="flex items-start gap-4">
        {icon ? (
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[24px] p-2 ${colorClass}`} style={style}>
            <IconlyIcon name={icon} size={22} color="currentColor" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <ValueDisplay value={value} />
          {label ? <div className="mt-2 truncate text-sm font-medium text-slate-600">{label}</div> : null}
        </div>
      </div>
    </div>
  );
}
