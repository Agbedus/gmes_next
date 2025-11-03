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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
        <span className="material-symbols-outlined text-zinc-500" aria-hidden>
          groups
        </span>
        Implementers & Governance
      </h3>
      <div className="mt-3 text-sm text-zinc-700 space-y-3">
        {coordinator ? (
          <div>
            <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-400" aria-hidden>
                account_circle
              </span>
              Coordinator
            </div>
            <div className="mt-1">{coordinator}</div>
          </div>
        ) : null}

        {implementers && implementers.length ? (
          <div>
            <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-400" aria-hidden>
                work
              </span>
              Implementers (sample)
            </div>
            <div className="mt-2 flex flex-wrap gap-2" role="list">
              {implementers.map((imp) => (
                <button
                  key={imp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 flex items-center gap-2"
                  aria-label={`Open implementer ${imp}`}
                >
                  <span className="material-symbols-outlined text-zinc-500" aria-hidden>
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
            <div className="text-xs font-medium text-zinc-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-400" aria-hidden>
                health_and_safety
              </span>
              Monitoring partners
            </div>
            <div className="mt-2 flex flex-wrap gap-2" role="list">
              {monitoringPartners.map((mp) => (
                <button
                  key={mp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 flex items-center gap-2"
                  aria-label={`Open partner ${mp}`}
                >
                  <span className="material-symbols-outlined text-zinc-500" aria-hidden>
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
