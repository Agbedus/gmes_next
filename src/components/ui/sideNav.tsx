"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map icon keys to Material Symbols icon names
const ICON_MAP: Record<string, string> = {
  overview: 'dashboard',
  phase_two: 'layers',
  phase_one: 'archive',
  reports: 'description',
  links: 'link',
};

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode | string;
};

type SideNavProps = {
  items: NavItem[];
  className?: string;
  collapsed?: boolean;
  onCollapseChangeAction?: (collapsed: boolean) => void;
};

export default function SideNav({ items, className = '', collapsed: controlledCollapsed, onCollapseChangeAction }: SideNavProps) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  const isControlled = typeof controlledCollapsed === 'boolean';
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isControlled) return;
    try {
      const raw = localStorage.getItem('sidenavCollapsed');
      if (raw !== null) setInternalCollapsed(raw === 'true');
    } catch {}
  }, [isControlled]);

  React.useEffect(() => {
    if (isControlled) return;
    try {
      localStorage.setItem('sidenavCollapsed', internalCollapsed ? 'true' : 'false');
    } catch {}
  }, [internalCollapsed, isControlled]);

  const collapsed = isControlled ? (controlledCollapsed as boolean) : internalCollapsed;

  React.useEffect(() => {
    if (pendingPath && pathname === pendingPath) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  return (
      <nav
          className={`py-6 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0 flex flex-col bg-white/90 backdrop-blur-xl border-r ${
              collapsed ? 'px-3 w-[80px]' : 'px-5 w-[280px]'
          } ${className}`}
          style={{ borderColor: '#038a3620' }}
          aria-label="Main navigation"
      >

        {/* Logo and Toggle Section */}
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-6' : 'justify-between'} mb-10`}>
           <div className={`transition-all duration-300 flex items-center justify-center`}>
            <Image
                src={collapsed ? '/logos/collapsed_logo.png' : '/logos/expanded_logo.png'}
                alt="Logo"
                width={collapsed ? 42 : 140}
                height={collapsed ? 42 : 45}
                unoptimized
                className={`object-contain transition-all duration-300 ${collapsed ? 'h-10 w-10' : 'h-auto w-36'}`}
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
               className={`p-1.5 text-zinc-400 rounded-lg transition-all duration-200`}
               style={{
                 backgroundColor: 'transparent'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.color = '#038a36';
                 e.currentTarget.style.backgroundColor = '#038a3610';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.color = '#a1a1aa';
                 e.currentTarget.style.backgroundColor = 'transparent';
               }}
               aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
               <span className="material-symbols-outlined text-[18px]">
                 {collapsed ? 'chevron_right' : 'chevron_left'}
               </span>
           </button>
        </div>

        {/* Navigation Links - moved down with mt-8 and increased spacing */}
        <div className="flex-1 mt-8">
          <ul className="space-y-3">
            {items.map((item) => {
              const active = pathname === item.href || pendingPath === item.href;
              return (
                  <li key={item.href}>
                    <Link
                        href={item.href}
                        className={`group flex items-center relative px-3 py-3 rounded-xl transition-all duration-200 ease-out ${
                            collapsed ? 'justify-center' : ''
                        }`}
                        style={{
                          backgroundColor: active ? '#038a3610' : 'transparent',
                          color: active ? '#038a36' : '#71717a',
                          boxShadow: active ? '0 1px 3px 0 rgba(3, 138, 54, 0.1), 0 0 0 1px rgba(3, 138, 54, 0.1)' : undefined
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = '#f4f4f5';
                            e.currentTarget.style.color = '#18181b';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#71717a';
                          }
                        }}
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
                               }`}
                               style={{
                                 color: active ? '#038a36' : '#a1a1aa'
                               }}
                               aria-hidden="true"
                           >
                            {typeof item.icon === 'string' ? (
                                <span className="material-symbols-outlined text-[22px]">
                                  {ICON_MAP[item.icon as string] || 'help'}
                                </span>
                            ) : (
                                item.icon
                            )}
                           </span>
                       ) : null}

                      {!collapsed && (
                          <span
                              className={`text-sm font-medium tracking-tight transition-all duration-300 ${
                                  active ? 'font-semibold' : ''
                              }`}
                          >
                            {item.label}
                          </span>
                      )}
                      
                      {/* Active state indicator */}
                      {!collapsed && active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#038a36' }} />
                      )}
                    </Link>
                  </li>
              );
            })}
          </ul>
        </div>
        
        {/* User Profile / Bottom Section */}
        <div className={`mt-auto pt-6 border-t ${collapsed ? 'flex justify-center' : 'px-1'}`} style={{ borderColor: '#038a3620' }}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl transition-colors cursor-pointer group`}
                 style={{ backgroundColor: 'transparent' }}
                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f4f4f5'}
                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm ring-1 ring-zinc-100"
                     style={{ background: 'linear-gradient(135deg, #038a36 0%, #009639 100%)' }}
                >
                    YD
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate transition-colors"
                           onMouseEnter={(e) => e.currentTarget.style.color = '#038a36'}
                           onMouseLeave={(e) => e.currentTarget.style.color = '#27272a'}
                        >Yaw Donkor</p>
                        <p className="text-xs text-zinc-500 truncate">Admin Workspace</p>
                    </div>
                )}
                 {!collapsed && (
                    <span className="material-symbols-outlined text-[16px] text-zinc-400 transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#71717a'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                    >more_vert</span>
                 )}
            </div>
        </div>

      </nav>
  );
}
