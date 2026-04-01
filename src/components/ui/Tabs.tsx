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
      className={`w-full ${className ?? ''}`}
    >
      <div className={`rounded-[24px] border border-slate-200 bg-slate-50 p-1 ${fullWidth ? 'grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4' : 'flex flex-wrap gap-2'}`}>
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
              className={`py-2.5 px-4 text-sm font-semibold rounded-[20px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${fullWidth ? 'text-center justify-center' : ''} ${selected ? 'border border-[#1A5632] bg-[linear-gradient(135deg,#1A5632,#143d24)] text-white' : 'border border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-100'}`}
              style={{
                backgroundColor: selected ? '#1A5632' : undefined,
                borderColor: selected ? '#1A5632' : undefined,
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(26, 86, 50, 0.2)';
              }}
              onBlur={(e) => {
                if (selected) {
                  e.currentTarget.style.boxShadow = '';
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

    </div>
  );
}
