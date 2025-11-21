"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode; // Changed to ReactNode for Lucide icons
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
          className={`py-6 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0 flex flex-col ${
              collapsed ? 'px-2' : 'px-4'
          } ${className}`}
          aria-label="Main navigation"
      >

        {/* Logo and Toggle Section - Always aligned */}
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-4' : 'justify-between'} mb-12 px-2`}>
           <div className={`transition-all duration-300 flex items-center justify-center`}>
            <Image
                src={collapsed ? '/logos/collapsed_logo.png' : '/logos/expanded_logo.png'}
                alt="Logo"
                width={collapsed ? 40 : 130}
                height={collapsed ? 40 : 40}
                unoptimized
                className={`object-contain transition-all duration-300 ${collapsed ? 'h-10 w-10' : 'h-auto w-32'}`}
            />
           </div>
           
           <button
              type="button"
              onClick={() => {
                  const next = !collapsed;
                  if (isControlled) {
                      onCollapseChangeAction?.(next);
                  } else {
                      setInternalCollapsed(next);
                  }
              }}
              className={`p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 ${collapsed ? '' : ''}`}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
               {/* Using Material Symbol for toggle as it's a UI control, or could switch to Lucide Chevron/Menu */}
               <span className="material-symbols-outlined text-xl">{collapsed ? 'last_page' : 'first_page'}</span>
           </button>
        </div>

        <div className="flex-1">
          <ul className="space-y-3">
            {items.map((item) => {
              const active = pathname === item.href || pendingPath === item.href;
              return (
                  <li key={item.href}>
                    <Link
                        href={item.href}
                        className={`group flex items-center relative px-3 py-3 rounded-xl transition-all duration-200 ease-out ${
                            active
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                        } ${collapsed ? 'justify-center' : ''}`}
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
                              className={`flex items-center justify-center transition-transform duration-200 ${
                                  collapsed ? '' : 'mr-3'
                              } ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 group-hover:scale-110'}`}
                              aria-hidden="true"
                          >
                            {/* Icon is now a ReactNode, so we just render it */}
                            {item.icon}
                          </span>
                      ) : null}

                      {!collapsed && (
                          <span
                              className={`text-sm font-medium tracking-wide transition-all duration-300 ${
                                  active ? 'font-semibold' : ''
                              }`}
                          >
                            {item.label}
                          </span>
                      )}
                      
                      {/* Active state right chevron */}
                      {!collapsed && active && (
                          <span className="ml-auto material-symbols-outlined text-lg text-blue-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              chevron_right
                          </span>
                      )}
                    </Link>
                  </li>
              );
            })}
          </ul>
        </div>
        
        {/* User Profile / Bottom Section */}
        <div className={`mt-auto pt-6 border-t border-slate-100 ${collapsed ? 'flex justify-center' : 'px-2'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm">
                    YD
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">Yaw Donkor</p>
                        <p className="text-xs text-slate-500 truncate">Admin Workspace</p>
                    </div>
                )}
                 {!collapsed && (
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600">more_vert</span>
                 )}
            </div>
        </div>

      </nav>
  );
}
