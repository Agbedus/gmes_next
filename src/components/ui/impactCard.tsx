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
  colorClass?: string;
  style?: React.CSSProperties;
  placeholder?: boolean;
};

export default function ImpactCard({ label, number, unit, highlight = false, icon, colorClass = "bg-zinc-50 text-zinc-600", style, placeholder = false }: ImpactCardProps) {
  if (placeholder) {
    return <div className="rounded-2xl border border-transparent bg-transparent px-5 py-6" aria-hidden="true" />;
  }

  const themedCard = Boolean(style) || colorClass.includes("text-white");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
      }}
      whileHover={{ scale: 1.02 }}
      className={`group rounded-3xl px-5 py-5 transition-all duration-300 ${
        themedCard
          ? `${colorClass} border border-transparent shadow-sm`
          : `border border-au-dark-green/10 bg-white hover:border-au-gold/30`
      } ${highlight ? (themedCard ? "ring-1 ring-white/20" : "ring-1 ring-au-dark-green/10 bg-au-dark-green/[0.04]") : ""}`}
      style={themedCard ? style : undefined}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          {label ? (
            <div className={`mb-2 text-xs font-bold uppercase tracking-wider transition-colors ${themedCard ? "text-white/75" : "text-slate-400 group-hover:text-au-dark-green"}`}>
              {label}
            </div>
          ) : null}
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${themedCard ? "text-white" : "text-au-dark-green"}`}>{number}</span>
            {unit ? <span className={`text-sm font-semibold ${themedCard ? "text-white/75" : "text-slate-400"}`}>{unit}</span> : null}
          </div>
        </div>

        {icon ? (
          <div
            className={`flex items-center justify-center rounded-xl p-3 transition-transform duration-300 ${
              themedCard ? "bg-white/12 text-white ring-1 ring-inset ring-white/15" : `${colorClass} ring-1 ring-inset ring-slate-200`
            }`}
          >
            {React.isValidElement(icon) ? icon : (
                <IconlyIcon name={String(icon)} size={22} color="#FABC0C" />
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
