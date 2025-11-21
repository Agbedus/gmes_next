"use client";

import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: string;
};

export default function StatCard({ title, value, delta, deltaType = "neutral", icon }: StatCardProps) {
  const deltaClass =
    deltaType === "positive" ? "text-green-600" : deltaType === "negative" ? "text-red-600" : "text-zinc-600";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase text-zinc-500">{title}</h3>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-zinc-900">{value}</span>
            {delta !== undefined ? (
              <span className={`text-sm font-medium ${deltaClass}`}>{delta}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-md p-2 bg-zinc-50 text-zinc-600 flex items-center justify-center" aria-hidden>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
