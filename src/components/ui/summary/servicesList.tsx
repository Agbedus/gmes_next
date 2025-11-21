"use client";

import React from "react";

type Service = {
  category: string;
  items: string[];
};

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-zinc-900 px-0.5 rounded-sm">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function ServicesList({ services, query = "" }: { services: Service[]; query?: string }) {
  const visible = services.filter((s) => (s.items || []).length > 0);

  if (!visible.length) {
    return <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">No services match your filter.</div>;
  }

  // mapping category -> icon and color classes
  const categoryMeta: Record<string, { icon: string; colorClass: string }> = {
    "Land & water": { icon: "agriculture", colorClass: "text-sky-600 bg-sky-50" },
    "Marine & coastal": { icon: "water", colorClass: "text-emerald-600 bg-emerald-50" },
    "Conservation & wetlands": { icon: "eco", colorClass: "text-amber-600 bg-amber-50" },
    "Disaster risk & early warning": { icon: "warning_amber", colorClass: "text-rose-600 bg-rose-50" },
  };

  // track which categories are expanded
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    visible.forEach((s) => (init[s.category] = true)); // default expanded
    return init;
  });

  const toggle = (category: string) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {visible.map((s) => {
        const meta = categoryMeta[s.category] ?? { icon: "handyman", colorClass: "text-zinc-700 bg-white" };
        const id = `services-${s.category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
        const isOpen = Boolean(expanded[s.category]);

        return (
          <article
            key={s.category}
            className={`rounded-xl border border-zinc-200 bg-white p-4 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-indigo-200`}
          >
            <h4 className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => toggle(s.category)}
                onKeyDown={(e) => {
                  if (e.key === "" || e.key === " ") e.preventDefault();
                  if (e.key === "Enter" || e.key === " ") toggle(s.category);
                }}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-900 w-full text-left"
              >
                <span className={`material-symbols-outlined ${meta.colorClass} text-[20px] p-1.5 rounded-lg`} aria-hidden>
                  {meta.icon}
                </span>
                <span className="flex-1 text-xl">{s.category}</span>
                <span className="material-symbols-outlined text-zinc-400" aria-hidden>
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>
            </h4>

            <div id={id} role="region" aria-labelledby={id + "-label"} className="mt-3">
              {isOpen ? (
                <ul role="list" className="mt-1 list-none text-sm text-zinc-700 space-y-1">
                  {s.items.map((it, i) => (
                    <li key={i} role="listitem">
                      <button
                        type="button"
                        className="w-full text-left rounded-md px-1 py-2 hover:bg-zinc-100 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                        aria-label={`Open service ${it}`}
                      >
                        <span className="material-symbols-outlined text-zinc-400 text-[18px]" aria-hidden>
                          arrow_right_alt
                        </span>
                        <span className="flex-1">{highlight(it, query)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-zinc-500 italic">Collapsed</div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
