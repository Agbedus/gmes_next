"use client";

import React from "react";

export default function ImplementersList({
  coordinator,
  implementers,
  monitoringPartners,
}: {
  coordinator?: string;
  implementers?: string[];
  monitoringPartners?: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm shadow-indigo-100/10">
      <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider mb-4">
        <span className="material-symbols-outlined text-indigo-500" aria-hidden>
          groups
        </span>
        Implementers & Governance
      </h3>
      <div className="space-y-6">
        {coordinator ? (
          <div>
            <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-zinc-400 text-[18px]" aria-hidden>
                account_circle
              </span>
              Coordinator
            </div>
            <div className="pl-7 text-sm font-medium text-zinc-800">{coordinator}</div>
          </div>
        ) : null}

        {implementers && implementers.length ? (
          <div>
            <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-zinc-400 text-[18px]" aria-hidden>
                work
              </span>
              Implementers (sample)
            </div>
            <div className="pl-7 flex flex-wrap gap-2" role="list">
              {implementers.map((imp) => (
                <button
                  key={imp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-medium text-indigo-700 flex items-center gap-1.5 hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                  aria-label={`Open implementer ${imp}`}
                >
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]" aria-hidden>
                    domain
                  </span>
                  {imp}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {monitoringPartners && monitoringPartners.length ? (
          <div>
            <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-zinc-400 text-[18px]" aria-hidden>
                health_and_safety
              </span>
              Monitoring partners
            </div>
            <div className="pl-7 flex flex-wrap gap-2" role="list">
              {monitoringPartners.map((mp) => (
                <button
                  key={mp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-xs font-medium text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-100 hover:border-emerald-200 transition-all"
                  aria-label={`Open partner ${mp}`}
                >
                  <span className="material-symbols-outlined text-emerald-500 text-[16px]" aria-hidden>
                    public
                  </span>
                  {mp}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
