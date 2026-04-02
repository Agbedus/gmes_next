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
    if (deltaType === "positive") return { color: '#00843D', backgroundColor: 'rgba(0, 132, 61, 0.1)' };
    if (deltaType === "negative") return { color: '#E03E2D', backgroundColor: 'rgba(224, 62, 45, 0.1)' };
    return { color: '#71717a', backgroundColor: '#f4f4f5' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-3xl border border-au-dark-green/10 bg-white px-5 py-5 transition-all duration-300 hover:border-au-gold/30 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-au-dark-green">{title}</h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-au-dark-green tracking-tight">{value}</span>
            {delta !== undefined ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={getDeltaStyle()}>{delta}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-xl border border-slate-200 bg-[#FABC0C12] p-2.5 text-[#FABC0C] transition-colors hover:bg-[#FABC0C18]" aria-hidden>
            {/* Ensure icon is treated as a node if passed as such, or string */}
             {React.isValidElement(icon) ? icon : <IconlyIcon name={String(icon)} size={20} color="#FABC0C" />}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
