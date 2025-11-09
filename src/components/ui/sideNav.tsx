"use client";

import React from 'react';
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
};

export default function SideNav({ items, className = '' }: SideNavProps) {
  const pathname = usePathname();
  // pendingPath is set optimistically on mouseDown so the clicked link shows active state immediately
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    // clear pending optimistic state once router has updated
    if (pendingPath && pathname === pendingPath) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  return (
    <nav className={`py-12 px-6 h-screen bg-white overflow-y-auto ${className}`} aria-label="Main navigation">
      <div className="flex items-center justify-between">
        <img
          src="data:image/png;base64,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"
          alt="Logo"
          className="h-auto w-32"
        />
      </div>
      <ul className="space-y-1 mt-24">
        {items.map((item) => {
          const active = (pathname === item.href) || (pendingPath === item.href);
           return (
             <li key={item.href}>
               <Link
                 href={item.href}
                 className={`flex text-[10px] uppercase items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                 }`}
                 aria-current={active ? 'page' : undefined}
                 onMouseDown={() => setPendingPath(item.href)}
                 onTouchStart={() => setPendingPath(item.href)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     // mark optimistic pending path so keyboard users get immediate feedback
                     setPendingPath(item.href);
                   }
                 }}
               >
                 {item.icon ? (
                   <span
                     className={`material-symbols-outlined mr-3 text-lg ${
                       active ? 'text-white' : 'text-zinc-600'
                     }`}
                     aria-hidden="true"
                   >
                     {item.icon}
                   </span>
                 ) : null}

                 <span>{item.label}</span>
               </Link>
             </li>
           );
         })}
       </ul>
     </nav>
   );
 }
