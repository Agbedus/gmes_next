"use client";

import React from "react";
import { Users, UserCircle, Briefcase, Building2, HeartPulse, Globe } from "lucide-react";

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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide">
        <Users size={16} className="text-gray-400" />
        Implementers & Governance
      </h3>
      <div className="mt-4 text-sm text-gray-700 space-y-5">
        {coordinator ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
              <UserCircle size={14} className="text-gray-400" />
              Coordinator
            </div>
            <div className="mt-2 font-medium text-gray-900">{coordinator}</div>
          </div>
        ) : null}

        {implementers && implementers.length ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
              <Briefcase size={14} className="text-gray-400" />
              Implementers (sample)
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="list">
              {implementers.map((imp) => (
                <button
                  key={imp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all"
                  aria-label={`Open implementer ${imp}`}
                >
                  <Building2 size={12} className="text-gray-400" />
                  {imp}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {monitoringPartners && monitoringPartners.length ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
              <HeartPulse size={14} className="text-gray-400" />
              Monitoring partners
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="list">
              {monitoringPartners.map((mp) => (
                <button
                  key={mp}
                  role="listitem"
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all"
                  aria-label={`Open partner ${mp}`}
                >
                  <Globe size={12} className="text-gray-400" />
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
