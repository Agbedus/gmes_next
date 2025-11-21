"use client";

import React from "react";
import { Droplets, Waves, Leaf, Siren, Wrench, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";

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
      <mark className="bg-blue-100 text-gray-900 px-0.5 rounded-sm">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function ServicesList({ services, query = "" }: { services: Service[]; query?: string }) {
  const visible = services.filter((s) => (s.items || []).length > 0);

  if (!visible.length) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">No services match your filter.</div>;
  }

  // mapping category -> icon and color classes
  const categoryMeta: Record<string, { icon: React.ReactNode; colorClass: string }> = {
    "Land & water": { icon: <Droplets size={20} />, colorClass: "text-sky-600 bg-sky-50" },
    "Marine & coastal": { icon: <Waves size={20} />, colorClass: "text-emerald-600 bg-emerald-50" },
    "Conservation & wetlands": { icon: <Leaf size={20} />, colorClass: "text-amber-600 bg-amber-50" },
    "Disaster risk & early warning": { icon: <Siren size={20} />, colorClass: "text-rose-600 bg-rose-50" },
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
        const meta = categoryMeta[s.category] ?? { icon: <Wrench size={20} />, colorClass: "text-gray-700 bg-white" };
        const id = `services-${s.category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
        const isOpen = Boolean(expanded[s.category]);

        return (
          <article
            key={s.category}
            className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-blue-100`}
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
                className="flex items-center gap-3 text-sm font-semibold text-gray-900 w-full text-left group"
              >
                <div className={`p-2 rounded-xl ${meta.colorClass} transition-transform group-hover:scale-105`}>
                  {meta.icon}
                </div>
                <span className="flex-1 text-base">{s.category}</span>
                <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
            </h4>

            <div id={id} role="region" aria-labelledby={id + "-label"} className="mt-3">
              {isOpen ? (
                <ul role="list" className="mt-2 list-none text-sm text-gray-600 space-y-1">
                  {s.items.map((it, i) => (
                    <li key={i} role="listitem">
                      <button
                        type="button"
                        className="w-full text-left rounded-lg px-2 py-2 hover:bg-gray-50 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 group"
                        aria-label={`Open service ${it}`}
                      >
                        <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        <span className="flex-1 group-hover:text-gray-900 transition-colors">{highlight(it, query)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400 italic px-2">Collapsed</div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
