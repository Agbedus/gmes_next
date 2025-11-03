"use client";
import React from "react";

export default function DataTable({
  columns,
  rows,
  compact = false,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number | React.ReactNode>[];
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-2 overflow-auto">
      <table className="min-w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`text-xs text-zinc-600 text-left px-3 py-2 ${compact ? 'py-1' : ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 align-top ${compact ? 'py-1' : ''}`}>
                  {r[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

