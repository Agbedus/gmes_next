'use client';
import React, { useRef, useEffect } from 'react';

type Tab = { id: string; label: string };

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  fullWidth?: boolean;
}

export default function Tabs({ tabs, activeId, onChange, className, fullWidth = false }: TabsProps) {
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
      <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
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
              className={`py-2 px-3 text-sm uppercase font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${fullWidth ? 'flex-1 text-center justify-center' : ''} ${selected ? 'text-white border-[1px] shadow-sm' : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}
              style={{
                backgroundColor: selected ? '#038a36' : undefined,
                borderColor: selected ? '#038a36' : undefined,
                boxShadow: selected ? '0 1px 3px 0 rgba(3, 138, 54, 0.2)' : undefined,
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(3, 138, 54, 0.2)';
              }}
              onBlur={(e) => {
                if (selected) {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(3, 138, 54, 0.2)';
                } else {
                  e.currentTarget.style.boxShadow = '';
                }
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right-side hint (non-functional) */}
      {!fullWidth && (
        <div className="ml-4 flex items-center gap-2 text-sm text-slate-500 border-[1px] border-slate-100 rounded px-2 py-1">
          <span className="hidden sm:inline">Use</span>
          <span className="inline-flex items-center justify-center px-1 py-0.5 border rounded bg-white text-xs font-medium">←</span>
          <span className="inline-flex items-center justify-center px-1 py-0.5 border rounded bg-white text-xs font-medium">→</span>
          <span className="hidden sm:inline">Keys to change tabs</span>
        </div>
      )}
    </div>
  );
}
