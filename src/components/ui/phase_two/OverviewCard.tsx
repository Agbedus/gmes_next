"use client";
import React from "react";

export default function OverviewCard({ title, value, subtitle, icon }: { title: string; value?: React.ReactNode; subtitle?: React.ReactNode; icon?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-700">{title}</h4>
          <div className="mt-2 text-sm font-semibold text-zinc-900">{value ?? '—'}</div>
          {subtitle ? <div className="mt-1 text-xs text-zinc-500">{subtitle}</div> : null}
        </div>
        {icon ? (
          <div className="rounded-md p-2 bg-zinc-50 text-zinc-600 flex items-center justify-center">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

