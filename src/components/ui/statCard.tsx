"use client";

import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, delta, deltaType = "neutral", icon }: StatCardProps) {
  const deltaClass =
    deltaType === "positive" ? "text-emerald-600 bg-emerald-50" : deltaType === "negative" ? "text-rose-600 bg-rose-50" : "text-zinc-600 bg-zinc-50";

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl px-5 py-5 shadow-sm shadow-indigo-100/10 hover:shadow-md hover:shadow-indigo-100/20 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-indigo-600 transition-colors">{title}</h3>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
            {delta !== undefined ? (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deltaClass}`}>{delta}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-xl p-2.5 bg-white/50 text-zinc-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300 shadow-sm border border-zinc-100/50" aria-hidden>
            {/* Ensure icon is treated as a node if passed as such, or string */}
             {React.isValidElement(icon) ? icon : <span className="material-symbols-outlined">{icon as string}</span>}
          </div>
        ) : null}
      </div>
    </div>
  );
}
