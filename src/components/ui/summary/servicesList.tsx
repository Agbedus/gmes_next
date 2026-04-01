"use client";

import React from "react";
import { motion } from "framer-motion";
import IconlyIcon from "../IconlyIcon";

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
      <mark className="rounded-sm bg-[#FABC0C20] px-0.5 text-[#1A5632]">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function ServicesList({ services, query = "" }: { services: Service[]; query?: string }) {
  const visible = services.filter((s) => (s.items || []).length > 0);

  if (!visible.length) {
    return <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-700">No services match your filter.</div>;
  }

  // mapping category -> icon and color classes
  const categoryMeta: Record<string, { icon: string; colorClass: string }> = {
    "Land & water": { icon: "agriculture", colorClass: "text-[#1A5632] bg-slate-50" },
    "Marine & coastal": { icon: "water", colorClass: "text-[#1A5632] bg-slate-50" },
    "Conservation & wetlands": { icon: "eco", colorClass: "text-[#1A5632] bg-slate-50" },
    "Disaster risk & early warning": { icon: "warning_amber", colorClass: "text-[#1A5632] bg-slate-50" },
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
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {visible.map((s) => {
        const meta = categoryMeta[s.category] ?? { icon: "handyman", colorClass: "text-zinc-700 bg-white" };
        const id = `services-${s.category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
        const isOpen = Boolean(expanded[s.category]);

        return (
          <motion.article
            key={s.category}
            className="rounded-[24px] border border-slate-200 bg-white p-4 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-[#1A5632]/20"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
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
                className="flex w-full items-center gap-3 text-left text-sm font-semibold text-slate-900"
              >
                <IconlyIcon name={meta.icon} size={20} color="#FABC0C" className={`rounded-[14px] p-2 bg-[#FABC0C12] ${meta.colorClass}`} />
                <span className="flex-1 text-base sm:text-lg">{s.category}</span>
                <IconlyIcon name={isOpen ? "expand_less" : "expand_more"} size={18} color="#94a3b8" />
              </button>
            </h4>

            <div id={id} role="region" aria-labelledby={id + "-label"} className="mt-3">
              {isOpen ? (
                <ul role="list" className="mt-1 list-none space-y-1 text-sm text-slate-700">
                  {s.items.map((it, i) => (
                    <li key={i} role="listitem">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[14px] px-2 py-2 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5632]/20"
                        aria-label={`Open service ${it}`}
                      >
                        <IconlyIcon name="arrow_right_alt" size={18} color="#FABC0C" />
                        <span className="flex-1">{highlight(it, query)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm italic text-slate-500">Collapsed</div>
              )}
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
