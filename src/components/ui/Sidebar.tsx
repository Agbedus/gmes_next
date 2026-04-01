"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChevronLeft, ChevronRight, Discovery, Home, Paper } from "react-iconly";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    set?: "light" | "bold" | "bulk" | "broken" | "two-tone";
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
  }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/summary", icon: Home },
  { label: "Phase 2", href: "/phase_two", icon: Discovery },
  { label: "Phase 1", href: "/phase_one", icon: Activity },
  { label: "Useful Links", href: "/useful_links", icon: Paper },
];

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: NavItem["icon"];
  active: boolean;
}) {
  return (
    <Icon
      set="light"
      size={20}
      primaryColor={active ? "#FABC0C" : "#FFFFFF"}
      secondaryColor={active ? "#FABC0C" : "#FFFFFF"}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("sidenavCollapsed");
      if (raw !== null) setCollapsed(raw === "true");
    } catch {
      // Ignore storage errors in restricted environments.
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("sidenavCollapsed", collapsed ? "true" : "false");
    } catch {
      // Ignore storage errors in restricted environments.
    }
  }, [collapsed]);

  return (
    <aside
      className={`relative sticky top-0 flex h-screen shrink-0 flex-col overflow-visible border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-[88px]" : "w-[280px]"
      }`}
      aria-label="Main navigation"
    >
      <div className={`relative h-[76px] ${collapsed ? "px-2" : "px-4"}`}>
        <Link
          href="/summary"
          className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center transition-all duration-300 ${
            collapsed ? "left-1/2 -translate-x-1/2" : "left-4 -translate-x-0"
          }`}
          aria-label="Open overview"
        >
          <Image
            src={collapsed ? "/logos/collapsed_logo.png" : "/logos/expanded_logo.png"}
            alt="GMES & Africa"
            width={collapsed ? 44 : 148}
            height={collapsed ? 44 : 46}
            unoptimized
            className={collapsed ? "h-11 w-11 object-contain" : "h-auto w-[148px] object-contain"}
          />
        </Link>

      </div>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -mr-[18px] -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white text-[#1A5632] transition-colors hover:bg-slate-100"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight
            set="light"
            size={16}
            primaryColor="#1A5632"
            secondaryColor="#1A5632"
          />
        ) : (
          <ChevronLeft
            set="light"
            size={16}
            primaryColor="#1A5632"
            secondaryColor="#1A5632"
          />
        )}
      </button>

      <div className={`mt-4 flex min-h-0 flex-1 flex-col rounded-t-[28px] bg-[#1A5632] ${
        collapsed ? "px-2 pb-3 pt-5" : "px-4 pb-4 pt-5"
      }`}>
        <nav className="space-y-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center rounded-[18px] border border-transparent px-3 py-3 transition-colors ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  active
                    ? "bg-white/10 text-[#FABC0C]"
                    : "text-white hover:bg-white/10 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                    active ? "bg-[#FABC0C]/15 text-[#FABC0C]" : "bg-white/10 text-white"
                  }`}
                >
                  <NavIcon icon={item.icon} active={active} />
                </span>

                {!collapsed && (
                  <span className={`min-w-0 flex-1 text-sm font-medium tracking-tight ${
                    active ? "text-[#FABC0C]" : "text-white"
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/15 pt-4">
          <div
            className={`flex items-center rounded-[18px] border border-white/15 bg-white/10 px-3 py-3 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1A5632]">
              YD
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">Yaw Donkor</p>
                <p className="truncate text-xs text-white/80">Admin Workspace</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
