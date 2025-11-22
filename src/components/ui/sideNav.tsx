"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Tabler icons for interactive/animated SVG icons
import { IconHome, IconLayersLinked, IconFileText, IconLink, IconArchive, IconChevronLeft, IconChevronRight, IconDotsVertical, IconHelp } from '@tabler/icons-react';

// Helper: wrap a Tabler icon component reference and return a factory which
// will either render the icon component or a fallback Tabler icon. This
// prevents rendering `undefined` if an icon is missing at runtime.
const safeIcon = (Comp: React.ElementType | undefined, Fallback: React.ElementType = IconHelp) => {
  const SafeIcon = (props?: React.ComponentProps<typeof IconHelp>) => {
    if (Comp) return <Comp {...props} />;
    return <Fallback {...props} />;
  };
  SafeIcon.displayName = 'SafeIcon';
  return SafeIcon;
};

// Map serializable icon keys to factories that render Tabler icons safely.
const ICON_MAP: Record<string, (props?: React.ComponentProps<typeof IconHelp>) => React.ReactNode> = {
  overview: safeIcon(IconHome, IconHelp),
  phase_two: safeIcon(IconLayersLinked, IconHelp),
  phase_one: safeIcon(IconArchive, IconHelp),
  reports: safeIcon(IconFileText, IconHelp),
  links: safeIcon(IconLink, IconHelp),
};

type NavItem = {
  label: string;
  href: string;
  // Accept either a React node (e.g. Lucide icon) or a string name for
  // Google Material Symbols (e.g. 'insights', 'article'). We keep ReactNode
  // for backwards compatibility.
  icon?: React.ReactNode | string;
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
          className={`py-6 h-screen overflow-y-auto transition-all duration-300 flex-shrink-0 flex flex-col bg-white/90 backdrop-blur-xl border-r border-zinc-200/60 ${
              collapsed ? 'px-3 w-[80px]' : 'px-5 w-[280px]'
          } ${className}`}
          aria-label="Main navigation"
      >

        {/* Logo and Toggle Section - Always aligned */}
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
               className={`p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 ${collapsed ? '' : ''}`}
               aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
           >
               {/* Tabler toggle icon: show IconChevronRight to expand when collapsed, IconChevronLeft to collapse when expanded */}
               {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
           </button>
        </div>

        <div className="flex-1">
          <ul className="space-y-2">
            {items.map((item) => {
              const active = pathname === item.href || pendingPath === item.href;
              return (
                  <li key={item.href}>
                    <Link
                        href={item.href}
                        className={`group flex items-center relative px-3 py-2.5 rounded-xl transition-all duration-200 ease-out ${
                            active
                                ? 'bg-indigo-50/80 text-indigo-600 shadow-sm ring-1 ring-indigo-100'
                                : 'text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900'
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
                               } ${active ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600 group-hover:scale-105'}`}
                               aria-hidden="true"
                           >
                            {typeof item.icon === 'string' ? (
                                (() => {
                                  const iconFactory = ICON_MAP[item.icon as string];
                                  if (iconFactory) return iconFactory({ size: 20, stroke: 1.5, 'aria-hidden': true });
                                  // fallback to generic Tabler help icon when unknown string provided
                                  return <IconHelp size={20} stroke={1.5} aria-hidden />;
                                })()
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
                      
                      {/* Active state right chevron */}
                      {!collapsed && active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                      )}
                    </Link>
                  </li>
              );
            })}
          </ul>
        </div>
        
        {/* User Profile / Bottom Section */}
        <div className={`mt-auto pt-6 border-t border-zinc-100 ${collapsed ? 'flex justify-center' : 'px-1'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm ring-1 ring-zinc-100">
                    YD
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate group-hover:text-indigo-700 transition-colors">Yaw Donkor</p>
                        <p className="text-xs text-zinc-500 truncate">Admin Workspace</p>
                    </div>
                )}
                 {!collapsed && (
                    <IconDotsVertical size={16} className="text-zinc-400 group-hover:text-zinc-600" />
                 )}
            </div>
        </div>

      </nav>
  );
}
