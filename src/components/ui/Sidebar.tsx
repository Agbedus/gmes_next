"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Paper } from "react-iconly";

type NavIconComponent = React.ComponentType<{
  set?: "light" | "bold" | "bulk" | "broken" | "two-tone";
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}>;

type NavItem = {
  label: string;
  href: string;
  icon: NavIconComponent;
  children?: { label: string; href: string }[];
};

const PhaseOneIcon = ({ size, primaryColor }: { size?: number; primaryColor?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16V8L10 9.5" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhaseTwoIcon = ({ size, primaryColor }: { size?: number; primaryColor?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 10C9 8.89543 9.89543 8 11 8H13C14.1046 8 15 8.89543 15 10C15 11.1046 14.1046 12 13 12H11C9.89543 12 9 13.1046 9 14.2105V16H15" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/summary", icon: Home },
  { label: "Phase 2", href: "/phase_two", icon: PhaseTwoIcon },
  { label: "Phase 1", href: "/phase_one", icon: PhaseOneIcon },
  {
    label: "Useful Links",
    href: "/useful_links",
    icon: Paper,
    children: [
      { label: "Program Mgt. Unit", href: "/useful_links?section=pmu" },
      { label: "Consortia Resources", href: "/useful_links?section=consortia" },
      { label: "Use Cases", href: "/useful_links?section=useCases" },
      { label: "Continental Policies", href: "/useful_links?section=policies" },
      { label: "Global Agendas", href: "/useful_links?section=agendas" },
    ],
  },
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
      primaryColor={active ? "#FDB813" : "currentColor"}
      secondaryColor={active ? "#FDB813" : "currentColor"}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = React.useState(false);
  const [usefulLinksOpen, setUsefulLinksOpen] = React.useState(false);

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

  React.useEffect(() => {
    if (pathname === "/useful_links") {
      setUsefulLinksOpen(true);
    }
  }, [pathname]);

  return (
    <aside
      className={`relative sticky top-0 flex h-screen shrink-0 flex-col overflow-visible border-r border-au-dark-green/10 bg-au-surface transition-all duration-300 ${
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
        className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -mr-[18px] -translate-y-1/2 items-center justify-center rounded-full border border-au-dark-green/10 bg-white text-au-dark-green transition-colors hover:bg-slate-100"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight
            set="light"
            size={16}
            primaryColor="currentColor"
            secondaryColor="currentColor"
          />
        ) : (
          <ChevronLeft
            set="light"
            size={16}
            primaryColor="currentColor"
            secondaryColor="currentColor"
          />
        )}
      </button>

      <div className={`mt-6 flex min-h-0 flex-1 flex-col ${
        collapsed ? "px-2" : "px-4"
      }`}>
        <nav className="space-y-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const hasChildren = Boolean(item.children?.length);
            const showChildren = !collapsed && hasChildren && usefulLinksOpen;

            return (
              <div key={item.href} className="space-y-1">
                <div className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center rounded-2xl px-3 py-3 transition-all duration-200 ${
                      collapsed ? "justify-center" : "gap-3"
                    } ${
                      active
                        ? "bg-au-dark-green text-white"
                        : "text-slate-600 hover:bg-au-green/5 hover:text-au-dark-green"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <div className="absolute left-0 h-6 w-1 rounded-r-full bg-au-gold" />
                    )}

                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        active ? "bg-white/10 text-white" : "bg-slate-50 text-slate-500 group-hover:bg-au-green/10 group-hover:text-au-dark-green"
                      }`}
                    >
                      <NavIcon icon={item.icon} active={active} />
                    </span>

                    {!collapsed && (
                      <span className="min-w-0 flex-1 text-sm font-semibold tracking-tight">
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {hasChildren && !collapsed && (
                    <button
                      type="button"
                      onClick={() => setUsefulLinksOpen((open) => !open)}
                      aria-label={usefulLinksOpen ? "Collapse useful links sections" : "Expand useful links sections"}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors ${
                        active ? "text-white/85 hover:bg-white/10" : "text-slate-400 hover:bg-slate-100 hover:text-au-dark-green"
                      }`}
                    >
                      <span className={`block transition-transform duration-200 ${usefulLinksOpen ? "rotate-90" : ""}`}>›</span>
                    </button>
                  )}
                </div>

                {showChildren && (
                  <div className="ml-5 space-y-1 border-l border-au-dark-green/10 pl-4">
                    {item.children?.map((child) => {
                      const childSection = child.href.split("section=")[1] ?? "";
                      const childActive = pathname === "/useful_links" && searchParams?.get("section") === childSection;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                            childActive
                              ? "bg-au-green/10 font-semibold text-au-dark-green"
                              : "text-slate-500 hover:bg-slate-50 hover:text-au-dark-green"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4 pb-4">
          <div
            className={`flex items-center rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-au-dark-green text-xs font-semibold text-white">
              YD
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">Yaw Donkor</p>
                <p className="truncate text-xs text-slate-500">Admin Workspace</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
