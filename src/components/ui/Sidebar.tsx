"use client";

import React from 'react';
import SideNav from './sideNav';

export default function Sidebar({ items }: { items: { label: string; href: string; icon?: string }[] }) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  // read persisted value on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('sidenavCollapsed');
      if (raw !== null) setCollapsed(raw === 'true');
    } catch {}
  }, []);

  // keep localStorage in sync
  React.useEffect(() => {
    try {
      localStorage.setItem('sidenavCollapsed', collapsed ? 'true' : 'false');
    } catch {}
  }, [collapsed]);

  return (
    <aside className={`min-h-screen border-r border-zinc-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <SideNav items={items} collapsed={collapsed} onCollapseChangeAction={setCollapsed} />
    </aside>
  );
}
