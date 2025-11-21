"use client";

import React from "react";
import ProgramHeader from "../programHeader";
import DashboardToolbar from "../dashboardToolbar";
import ImpactCard from "../impactCard";
import StatCard from "../statCard";
import Timeline from "../timeline";
import ServicesList from "./servicesList";
import ImplementersList from "../implementersList";
import PhaseSummary from "./phaseSummary";
import MapModal from "../MapModal";
import SummaryChartsModal from "../../charts/summaryChartsModal";
import { 
  Landmark, 
  School, 
  Globe, 
  Settings, 
  Cable, 
  Trophy, 
  Zap, 
  Users, 
  DollarSign, 
  AlertCircle, 
  BarChart 
} from "lucide-react";

// Define precise types instead of `any`
type KPI = {
  label: string;
  value?: string;
  amount_eur_millions?: number | string;
  institutions?: number | string;
  countries?: number | string;
  institutions_equipped?: number | string;
  estations_identified?: number | string;
  trained?: number | string;
  citation?: string;
};

type TimelineItem = {
  year?: number;
  years?: string;
  event: string;
  citation?: string;
};

type Service = {
  category: string;
  items: string[];
  citation?: string;
};

type ImplementersGovernance = {
  coordinator: string;
  implementers_phase_2: string[];
  monitoring_partners: string[];
  coverage?: string;
  citations?: string[];
};

type Phase2 = {
  focus?: string;
  citations?: string[];
  pillars?: string[];
  cross_cutting?: string[];
};

type Program = {
  name: string;
  one_liner?: string;
  citation?: string;
};

type DashboardData = {
  program: Program;
  kpis?: KPI[];
  timeline?: TimelineItem[];
  services?: Service[];
  phase2?: Phase2;
  implementers_governance?: ImplementersGovernance;
  // allow other fields but keep typed ones above as primary
  [key: string]: unknown;
};

type Stat = {
  title: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

// Helper type for modules that may export default
type ModuleWithDefault<T> = { default: T } | T;

export default function DashboardContainer(): React.ReactElement {
  const [mapOpen, setMapOpen] = React.useState(false);
  const [chartsOpen, setChartsOpen] = React.useState(false);
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [query, setQuery] = React.useState("");
  const [serviceQuery, setServiceQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // sample points to pass into the map modal
  const samplePoints = [
    { id: "ng", name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792, group: "West" },
    { id: "gh", name: "Accra, Ghana", lat: 5.6037, lon: -0.1870, group: "West" },
    { id: "ke", name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, group: "East" },
    { id: "za", name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241, group: "South" },
    { id: "eg", name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357, group: "North" },
    { id: "et", name: "Addis Ababa, Ethiopia", lat: 8.9806, lon: 38.7578, group: "East" },
    { id: "ma", name: "Rabat, Morocco", lat: 34.0209, lon: -6.8416, group: "North" },
    { id: "sn", name: "Dakar, Senegal", lat: 14.6928, lon: -17.4467, group: "West" },
    { id: "tz", name: "Dar es Salaam, Tanzania", lat: -6.7924, lon: 39.2083, group: "East" },
    { id: "dz", name: "Algiers, Algeria", lat: 36.7538, lon: 3.0588, group: "North" },
  ];

  React.useEffect(() => {
    // Load local JSON data via dynamic import so this stays a client component
    setLoading(true);
    import("@/data/program.json")
      .then((m: unknown) => {
        const mod = m as ModuleWithDefault<DashboardData>;
        // narrow without `any`: if module has a `default` key, use it
        if (mod && typeof mod === "object" && "default" in mod) {
          setData((mod as { default: DashboardData }).default);
        } else {
          setData(mod as DashboardData);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load program data:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Focus search when user presses '/'
      if (e.key === "/") {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>("input[data-summary-search]");
        el?.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard…</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-600">Failed to load dashboard data.</div>;
  }

  // Build impact array from data.kpis
  const impact: { label: string; number: string; icon?: React.ReactNode; colorClass?: string }[] = [];
  // we'll extract programme agreement into a stat and not show it in impact
  let programmeAgreementStat: Stat | null = null;
  (data.kpis ?? []).forEach((k: KPI) => {
    const label = String(k.label ?? "").trim();
    const normLabel = label.toLowerCase();
    // If this KPI is the 'Programme agreement', convert it to a stat and don't add to impact
    if (normLabel.includes("programme agreement")) {
      if (k.amount_eur_millions !== undefined) {
        const num = Number(k.amount_eur_millions);
        programmeAgreementStat = {
          title: "Programme agreement",
          // show only the number as requested (no citation), e.g. €30M
          value: `€${num}${Number.isInteger(num) ? "M" : "M"}`,
          icon: <Landmark size={20} />,
        };
      } else {
        programmeAgreementStat = { title: "Programme agreement", value: "Signed Dec 2016", icon: <Landmark size={20} /> };
      }
      return; // skip adding to impact
    }
    if (k.amount_eur_millions !== undefined) {
      const num = Number(k.amount_eur_millions);
      impact.push({ label: k.label, number: `€${num}${Number.isInteger(num) ? "M" : "M"}`, icon: <Landmark size={24} />, colorClass: "bg-blue-50 text-blue-600" });
    }
    if (k.institutions !== undefined) impact.push({ label: "Institutions", number: `${k.institutions}`, icon: <School size={24} />, colorClass: "bg-emerald-50 text-emerald-600" });
    if (k.countries !== undefined) impact.push({ label: "Countries", number: `${k.countries}`, icon: <Globe size={24} />, colorClass: "bg-amber-50 text-amber-600" });
    if (k.institutions_equipped !== undefined) impact.push({ label: "eStations equipped", number: `${k.institutions_equipped}`, icon: <Settings size={24} />, colorClass: "bg-violet-50 text-violet-600" });
    if (k.estations_identified !== undefined) impact.push({ label: "eStations (identified)", number: `${k.estations_identified}`, icon: <Cable size={24} />, colorClass: "bg-violet-50 text-violet-600" });
    if (k.trained !== undefined) impact.push({ label: "Trained people", number: `${Number(k.trained).toLocaleString()}`, icon: <Trophy size={24} />, colorClass: "bg-amber-50 text-amber-600" });
  });

  // Add Users and Active as impact cards (moved from stats)
  // Inserted at the front so they appear at the top of the impact grid
  impact.unshift({ label: "Active", number: "89%", icon: <Zap size={24} />, colorClass: "bg-emerald-50 text-emerald-600" });
  impact.unshift({ label: "Users", number: "12,450", icon: <Users size={24} />, colorClass: "bg-sky-50 text-sky-600" });

  // Reorder impact so specific items appear at the bottom (keep rest at top)
  // programme agreement has been removed from impact and will be shown as a stat
  const bottomKeywords = ["phase 1 grant", "phase 1"];
  // normalize function: lowercase and replace '&' with 'and' to match labels like 'Phase 1 grant & coverage'
  const normalize = (s: string) => s.toLowerCase().replace(/&/g, "and");
  const topImpact = impact.filter(i => !bottomKeywords.some(kw => normalize(i.label ?? "").includes(normalize(kw))));
  const bottomImpact = impact.filter(i => bottomKeywords.some(kw => normalize(i.label ?? "").includes(normalize(kw))));
  const reorderedImpact = [...topImpact, ...bottomImpact];

  // Ensure even grid: pad to multiple of 4 using placeholder ImpactCards
  const remainder = reorderedImpact.length % 4;
  const placeholders = remainder === 0 ? 0 : 4 - remainder;

  // Simple service filtering
  const filteredServices = (data.services ?? []).map((s: Service) => ({
    ...s,
    items: (s.items ?? []).filter((it: string) => it.toLowerCase().includes(serviceQuery.toLowerCase())),
  }));

  // timeline filtering using toolbar query
  const filteredTimeline: TimelineItem[] = (data.timeline ?? []).filter((t) =>
    (t.event ?? "").toLowerCase().includes(query.toLowerCase()) || String(t.year ?? t.years ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const stats: Stat[] = [
    // Users and Active have been moved to impact cards above
    { title: "Revenue", value: "$32,400", delta: "+2.1%", deltaType: "positive", icon: <DollarSign size={20} /> },
    { title: "Errors", value: 12, delta: "-1", deltaType: "negative", icon: <AlertCircle size={20} /> },
  ];

  // Append programme agreement stat at the bottom if we extracted it
  if (programmeAgreementStat) {
    stats.push(programmeAgreementStat);
  }

  return (
    <div className="pb-24">
      <ProgramHeader name={String(data.program?.name ?? "")} oneLiner={String(data.program?.one_liner ?? "")} />

      <div className="mt-6">
        <DashboardToolbar
          onSearch={(q: string) => setQuery(q)}
          onFilterClick={() => alert("Filter panel not implemented yet")}
          onDateClick={() => alert("Date picker not implemented yet")}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Impact overview</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reorderedImpact.map((i) => (
            <ImpactCard key={i.label} label={i.label} number={i.number} icon={i.icon} colorClass={i.colorClass} />
          ))}
          {Array.from({ length: placeholders }).map((_, idx) => (
            // placeholders to keep grid aligned
            <ImpactCard key={`placeholder-${idx}`} number={""} label={undefined} placeholder />
          ))}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Timeline items={filteredTimeline} />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Services</h3>
              <label className="text-sm text-gray-500">
                <input
                  aria-label="Search services"
                  className="ml-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Filter services"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                />
              </label>
            </div>
            <ServicesList services={filteredServices} query={serviceQuery} />
          </div>
        </div>

        <div className="space-y-6">
          <ImplementersList
            coordinator={String(data.implementers_governance?.coordinator ?? "")}
            implementers={data.implementers_governance?.implementers_phase_2 ?? []}
            monitoringPartners={data.implementers_governance?.monitoring_partners ?? []}
          />

          <PhaseSummary
            focus={String(data.phase2?.focus ?? "")}
            pillars={data.phase2?.pillars ?? []}
            crossCutting={data.phase2?.cross_cutting ?? []}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} delta={s.delta} deltaType={s.deltaType} icon={s.icon} />
        ))}
      </div>

      <div className="w-auto h-auto p-2 rounded-[24px] border border-gray-200 fixed bottom-10 bg-white/80 backdrop-blur-xl right-12 flex justify-center items-center shadow-lg z-50">
        <button
            className="w-12 h-12 rounded-[18px] bg-blue-50 text-blue-600 flex justify-center items-center hover:bg-blue-100 hover:scale-105 transition-all"
            id="mapButton"
            aria-label="Open program map"
            onClick={() => setMapOpen(true)}
        >
          <Globe size={24} />
        </button>

        <button
            className="w-12 h-12 rounded-[18px] bg-emerald-50 text-emerald-600 flex justify-center items-center ml-3 hover:bg-emerald-100 hover:scale-105 transition-all"
            id="chartsButton"
            aria-label="Open charts summary"
            onClick={() => setChartsOpen(true)}
        >
          <BarChart size={24} />
        </button>

      </div>
      <SummaryChartsModal open={chartsOpen} onCloseAction={() => setChartsOpen(false)} />

      <MapModal
        open={mapOpen}
        onCloseAction={() => setMapOpen(false)}
        points={samplePoints}
        groupsColor={{ West: '#06b6d4', East: '#34d399', North: '#f59e0b', South: '#ef4444', Central: '#a78bfa' }}
        legendItems={[
          { label: 'West', color: '#06b6d4' },
          { label: 'East', color: '#34d399' },
          { label: 'North', color: '#f59e0b' },
          { label: 'South', color: '#ef4444' },
          { label: 'Central', color: '#a78bfa' },
        ]}
      />
    </div>
  );
}
