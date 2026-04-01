"use client";
import React from "react";
import IconlyIcon from "../IconlyIcon";

export default function OverviewCard({ title, value, subtitle, icon, iconColor, iconBg, valueClassName }: { title: string; value?: React.ReactNode; subtitle?: React.ReactNode; icon?: string; iconColor?: string; iconBg?: string; valueClassName?: string }) {
  const iconStyle: React.CSSProperties | undefined = (iconColor || iconBg) ? { color: iconColor, backgroundColor: iconBg, borderRadius: 8 } : undefined;

  // allow callers to override the value classes; fall back to the original large display classes
  const finalValueClass = valueClassName ?? 'text-lg md:text-xl font-semibold text-slate-900';

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-700">{title}</h4>
          <div className={`mt-2 ${finalValueClass}`}>{value ?? '—'}</div>
          {subtitle ? <div className="mt-1 hidden text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        {icon ? (
          <div className="rounded-md p-2 flex items-center justify-center" style={iconStyle}>
            <IconlyIcon name={icon} size={20} color={iconColor ?? "currentColor"} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
