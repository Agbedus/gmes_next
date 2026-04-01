"use client";

import React from "react";
import { motion } from "framer-motion";
import IconlyIcon from "./IconlyIcon";

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 transition-colors duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#1A5632'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>{title}</h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
            {delta !== undefined ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={getDeltaStyle()}>{delta}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-xl border border-slate-200 bg-[#FABC0C12] p-2.5 text-[#FABC0C] transition-colors" aria-hidden
               onMouseEnter={(e) => {
                 e.currentTarget.style.color = '#FABC0C';
                 e.currentTarget.style.backgroundColor = '#FABC0C18';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.color = '#FABC0C';
                 e.currentTarget.style.backgroundColor = '#FABC0C12';
               }}
          >
            {/* Ensure icon is treated as a node if passed as such, or string */}
             {React.isValidElement(icon) ? icon : <IconlyIcon name={String(icon)} size={20} color="#FABC0C" />}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
