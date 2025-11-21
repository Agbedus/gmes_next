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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Phase 2 summary</h3>
      {focus ? <p className="mt-2 text-sm text-zinc-700">{focus}</p> : null}

      {pillars && pillars.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-zinc-500">Pillars</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pillars.map((p) => (
              <li key={p} className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700">
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {crossCutting && crossCutting.length ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-zinc-500">Cross-cutting</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {crossCutting.map((c) => (
              <li key={c} className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700">
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

