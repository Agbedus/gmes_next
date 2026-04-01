"use client";

import React from "react";
import { Iconly } from "react-iconly";

const ICONLY_NAME_MAP: Record<string, string> = {
  add: "Plus",
  account_balance: "Wallet",
  account_circle: "User",
  activity: "Activity",
  apps: "Category",
  article: "Document",
  agriculture: "__water_drop__",
  arrow_right_alt: "ArrowRight",
  arrow_left_alt: "ArrowLeft",
  bolt: "Activity",
  calendar_month: "Calendar",
  date_range: "Calendar",
  today: "Calendar",
  calendar_today: "Calendar",
  cut: "Swap",
  dns: "Category",
  schedule: "TimeCircle",
  search: "Search",
  filter: "Filter",
  filter_list: "Filter",
  share: "Send",
  download: "Download",
  event: "Calendar",
  insights: "Chart",
  monitoring: "Chart",
  grid_view: "Category",
  layers: "Category",
  category: "Category",
  dashboard: "Category",
  check_circle: "TickSquare",
  engineering: "Work",
  campaign: "Voice",
  inventory_2: "Document",
  room_service: "Work",
  groups: "People",
  public: "Discovery",
  location_on: "Location",
  map: "Location",
  water_drop: "__water_drop__",
  water: "__water_drop__",
  beach_access: "Location",
  park: "Discovery",
  grass: "Discovery",
  waves: "Discovery",
  eco: "Discovery",
  warning_amber: "Danger",
  handyman: "Work",
  chevron_left: "ChevronLeft",
  chevron_right: "ChevronRight",
  chevron_up: "ChevronUp",
  chevron_down: "ChevronDown",
  expand_less: "ChevronUp",
  expand_more: "ChevronDown",
  close: "CloseSquare",
  more_horiz: "MoreCircle",
  open_in_new: "ArrowRightSquare",
  domain: "Home",
  work: "Work",
  health_and_safety: "ShieldDone",
  view_module: "Category",
  notifications: "Notification",
  notification: "Notification",
  visibility: "Show",
  plus: "Plus",
  paper: "Paper",
  paper_download: "PaperDownload",
  document: "Document",
  home: "Home",
  sensors: "Graph",
  history: "TimeCircle",
  storage: "Folder",
  business_center: "Work",
  school: "Work",
  menu_book: "Document",
  emoji_events: "Star",
  hub: "Category",
  description: "Document",
  devices: "Video",
};

function resolveIconlyName(name: string) {
  const key = String(name ?? "").trim().toLowerCase();
  return ICONLY_NAME_MAP[key] ?? (String(name ?? "").trim() || "Dot");
}

function WaterDropIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.75C12 2.75 6.5 8.2 6.5 12.9C6.5 16.7 9.2 19.75 12 19.75C14.8 19.75 17.5 16.7 17.5 12.9C17.5 8.2 12 2.75 12 2.75Z"
        fill={color}
        opacity="0.16"
      />
      <path
        d="M12 2.75C12 2.75 6.5 8.2 6.5 12.9C6.5 16.7 9.2 19.75 12 19.75C14.8 19.75 17.5 16.7 17.5 12.9C17.5 8.2 12 2.75 12 2.75Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 14.1C9.75 15.55 10.8 16.4 12.1 16.4C13.7 16.4 14.9 15.35 15.2 13.85"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function IconlyIcon({
  name,
  size = 20,
  color = "currentColor",
  set = "light",
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  set?: "light" | "bold" | "bulk" | "broken" | "two-tone" | "curved";
  className?: string;
}) {
  const resolvedName = resolveIconlyName(name);
  if (resolvedName === "__water_drop__") {
    return (
      <span className={className} aria-hidden="true" style={{ display: "inline-flex", lineHeight: 0 }}>
        <WaterDropIcon size={size} color={color} />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true" style={{ display: "inline-flex", lineHeight: 0 }}>
      <Iconly name={resolvedName} set={set} size={size} primaryColor={color} secondaryColor={color} />
    </span>
  );
}
