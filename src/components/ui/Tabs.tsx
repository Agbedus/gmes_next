'use client';
import React, { useRef, useEffect } from 'react';

type Tab = { id: string; label: string };

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // Keep refs array in sync with tabs length
    refs.current = refs.current.slice(0, tabs.length);
  }, [tabs.length]);

  const focusTab = (index: number) => {
    const btn = refs.current[index];
    if (btn) btn.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = index === last ? 0 : index + 1;
      onChange(tabs[next].id);
      focusTab(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = index === 0 ? last : index - 1;
      onChange(tabs[prev].id);
      focusTab(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(tabs[0].id);
      focusTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(tabs[last].id);
      focusTab(last);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Program sections"
      className={`flex items-center justify-between w-full ${className ?? ''}`}
    >
      <div className="flex items-center gap-2">
        {tabs.map((t, i) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              ref={(el) => { refs.current[i] = el; }}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`py-2 px-3 text-sm uppercase font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${selected ? 'bg-slate-50 text-slate-700 border-[1px] border-slate-300 shadow-sm' : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right-side hint (non-functional) */}
      <div className="ml-4 flex items-center gap-2 text-sm text-slate-500 border-[1px] border-slate-100 rounded px-2 py-1">
        <span className="hidden sm:inline">Use</span>
        <span className="inline-flex items-center justify-center px-1 py-0.5 border rounded bg-white text-xs font-medium">←</span>
        <span className="inline-flex items-center justify-center px-1 py-0.5 border rounded bg-white text-xs font-medium">→</span>
        <span className="hidden sm:inline">Keys to change tabs</span>
      </div>
    </div>
  );
}
