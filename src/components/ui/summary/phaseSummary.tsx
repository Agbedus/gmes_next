"use client";

import React from "react";

import { motion } from "framer-motion";

export default function PhaseSummary({
  focus,
  pillars,
  crossCutting,
}: {
  focus?: string;
  pillars?: string[];
  crossCutting?: string[];
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-[24px] border border-slate-200 bg-white p-4"
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Phase 2 summary</h3>
        <p className="mt-1 text-sm text-slate-600">Focus areas, pillars, and cross-cutting priorities.</p>
      </div>
      {focus ? <p className="mt-2 text-sm text-slate-600">{focus}</p> : null}

      {pillars && pillars.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-500">Pillars</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pillars.map((p) => (
              <li key={p} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {crossCutting && crossCutting.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-slate-500">Cross-cutting</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {crossCutting.map((c) => (
              <li key={c} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.div>
  );
}
