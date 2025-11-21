"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, delta, deltaType = "neutral", icon }: StatCardProps) {
  const deltaColor =
    deltaType === "positive" ? "text-emerald-600 bg-emerald-50" : deltaType === "negative" ? "text-rose-600 bg-rose-50" : "text-gray-600 bg-gray-50";
  
  const TrendIcon = deltaType === "positive" ? TrendingUp : deltaType === "negative" ? TrendingDown : Minus;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
            {delta !== undefined ? (
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${deltaColor}`}>
                <TrendIcon size={12} />
                <span>{delta}</span>
              </div>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="rounded-xl p-2 bg-gray-50 text-gray-600 flex items-center justify-center shadow-sm">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
