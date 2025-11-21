"use client";

import React from "react";

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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Phase 2 summary</h3>
      {focus ? <p className="mt-3 text-sm text-gray-700 leading-relaxed">{focus}</p> : null}

      {pillars && pillars.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pillars</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pillars.map((p) => (
              <li key={p} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {crossCutting && crossCutting.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cross-cutting</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {crossCutting.map((c) => (
              <li key={c} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

