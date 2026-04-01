"use client";

import React from "react";
import { motion } from "framer-motion";
import IconlyIcon from "./IconlyIcon";

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
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
      }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-[24px] border border-slate-200 bg-white px-5 py-6 transition-colors duration-300 group ${highlight ? "ring-1 ring-[#1A563220]" : ""}`} 
      style={{
        backgroundColor: highlight ? '#1A56320a' : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          {label ? <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#1A5632'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>{label}</div> : null}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{number}</span>
            {unit ? <span className="text-sm font-medium text-slate-500">{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div className={`rounded-xl p-3 ${colorClass} flex items-center justify-center ring-1 ring-inset ring-slate-200 transition-transform duration-300`} style={style}>
            {/* Handle both string (material symbol) and ReactNode icons */}
            {React.isValidElement(icon) ? icon : (
                <IconlyIcon name={String(icon)} size={22} color="#FABC0C" />
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
