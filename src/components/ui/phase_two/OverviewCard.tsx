"use client";
import React from "react";

export default function OverviewCard({ title, value, subtitle, icon, iconColor, iconBg, valueClassName }: { title: string; value?: React.ReactNode; subtitle?: React.ReactNode; icon?: string; iconColor?: string; iconBg?: string; valueClassName?: string }) {
  const iconStyle: React.CSSProperties | undefined = (iconColor || iconBg) ? { color: iconColor, backgroundColor: iconBg, borderRadius: 8 } : undefined;

  // allow callers to override the value classes; fall back to the original large display classes
  const finalValueClass = valueClassName ?? 'text-lg md:text-xl font-semibold text-zinc-900';

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-700">{title}</h4>
          <div className={`mt-2 ${finalValueClass}`}>{value ?? '—'}</div>
          {subtitle ? <div className="mt-1 text-xs text-zinc-500 hidden">{subtitle}</div> : null}
        </div>
        {icon ? (
          <div className="rounded-md p-2 flex items-center justify-center" style={iconStyle}>
            <span className="material-symbols-outlined text-xl" aria-hidden>{icon}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
