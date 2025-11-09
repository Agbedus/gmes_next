"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon?: string; // optional Material Symbol name
};

type SideNavProps = {
  items: NavItem[];
  className?: string;
  collapsed?: boolean; // controlled collapsed state
  onCollapseChangeAction?: (collapsed: boolean) => void;
};

export default function SideNav({ items, className = '', collapsed: controlledCollapsed, onCollapseChangeAction }: SideNavProps) {
  const pathname = usePathname();
  // pendingPath is set optimistically on mouseDown so the clicked link shows active state immediately
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  // collapsed state controls whether the nav shows labels or is compact.
  // support controlled (via props) or uncontrolled internal state
  const isControlled = typeof controlledCollapsed === 'boolean';
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(false);

  // when uncontrolled, read persisted value from localStorage on mount
  React.useEffect(() => {
    if (isControlled) return;
    try {
      const raw = localStorage.getItem('sidenavCollapsed');
      if (raw !== null) setInternalCollapsed(raw === 'true');
    } catch {}
  }, [isControlled]);

  // persist uncontrolled changes
  React.useEffect(() => {
    if (isControlled) return;
    try {
      localStorage.setItem('sidenavCollapsed', internalCollapsed ? 'true' : 'false');
    } catch {}
  }, [internalCollapsed, isControlled]);

  const collapsed = isControlled ? (controlledCollapsed as boolean) : internalCollapsed;

  React.useEffect(() => {
    // clear pending optimistic state once router has updated
    if (pendingPath && pathname === pendingPath) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  return (
      <nav
          className={`py-12 h-screen bg-white overflow-y-auto transition-all duration-300 flex-shrink-0 ${
              collapsed ? 'w-20 px-2' : 'w-64 px-6'
          } ${className}`}
          aria-label="Main navigation"
      >

        <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => {
              const next = !collapsed;
              if (isControlled) {
                onCollapseChangeAction?.(next);
              } else {
                setInternalCollapsed(next);
              }
            }}
            className="px-3 py-2 mb-8 hover:bg-gray-100 focus:outline-none focus:ring-transparent block flex items-center justify-center rounded"
        >
            <span className={`material-symbols-outlined`}>menu</span>
        </button>

        <div>
          <div className="flex mb-6">
            <Image
                src={collapsed ? '/logos/collapsed_logo.png' : '/logos/expanded_logo.png'}
                alt="Logo"
                width={collapsed ? 32 : 128}
                height={collapsed ? 32 : 32}
                unoptimized
                className={collapsed ? 'h-12 w-12 object-contain mx-auto' : 'h-auto w-32'}
            />
          </div>

          <ul className="space-y-1 mt-24">
            {items.map((item) => {
              const active = pathname === item.href || pendingPath === item.href;
              return (
                  <li key={item.href}>
                    <Link
                        href={item.href}
                        className={`flex items-center ${collapsed ? 'justify-center' : ''} text-[10px] uppercase px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            active
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        aria-current={active ? 'page' : undefined}
                        onMouseDown={() => setPendingPath(item.href)}
                        onTouchStart={() => setPendingPath(item.href)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setPendingPath(item.href);
                        }}
                        title={collapsed ? item.label : undefined}
                    >
                      {item.icon ? (
                          <span
                              className={`material-symbols-outlined text-lg ${collapsed ? '' : 'mr-3'} ${active ? 'text-white' : 'text-zinc-600'}`}
                              aria-hidden="true"
                          >
                    {item.icon}
                  </span>
                      ) : null}

                      {/* animate label visibility */}
                      <span
                          className={`transition-all duration-300 ease-in-out ${
                              collapsed ? 'opacity-0 translate-x-[-6px] max-w-0 overflow-hidden' : 'opacity-100 translate-x-0 max-w-full'
                          }`}
                      >
                  {!collapsed ? item.label : null}
                </span>
                    </Link>
                  </li>
              );
            })}
          </ul>
        </div>

      </nav>
  );
}
