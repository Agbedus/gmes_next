"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProgramHeader from "../programHeader";
import ImpactCard from "../impactCard";
import StatCard from "../statCard";
import IconlyIcon from "../IconlyIcon";
import Timeline from "../timeline";
import ServicesList from "./servicesList";
import PhaseSummary from "./phaseSummary";
import MapModal from "../MapModal";
import SummaryChartsModal from "../../charts/summaryChartsModal";
import Tabs from "../Tabs";
import { SearchResult } from "../GlobalSearch";
import { useUI } from "@/context/UIContext";
import {
  Landmark, 
  School, 
  Cable, 
  Users, 
    Award,
    Network,
    Share2,
    Flag,
    Antenna,
    Building2,
    Satellite,
  LayoutGrid,
  Sparkles,
  Settings
} from "lucide-react";
import Image from "next/image";

// Define precise types
type KPI = {
  label: string;
  value?: string;
  eo_applications?: number | string;
  users?: number | string;
  geoportals?: number | string;
  implementing_institutions?: number | string;
  data_enabled_institutions?: number | string;
  estations_installed?: number | string;
  trained_operators?: number | string;
  trainings?: number | string;
  trainees_in_eo?: number | string;
  studies_grant?: number | string;
  continental_network?: number | string;
  dissemination_platform?: number | string;
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

type PartnerFunders = {
  name: string;
  role?: string;
  logo: string;
};

type PartnerFundersList = PartnerFunders[];

type DashboardData = {
  program: Program;
  funders: PartnerFundersList;
  technical_partners: PartnerFundersList;
  kpis?: KPI[];
  timeline?: TimelineItem[];
  services?: Service[];
  phase2?: Phase2;
  implementers_governance?: ImplementersGovernance;
  [key: string]: unknown;
};

type Stat = {
  title: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
};

type ModuleWithDefault<T> = { default: T } | T;

export default function DashboardContainer(): React.ReactElement {
  const { isMapOpen, setIsMapOpen, isChartsOpen, setIsChartsOpen } = useUI();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");

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
    setLoading(true);
    import("@/data/program.json")
      .then((m: unknown) => {
        const mod = m as ModuleWithDefault<DashboardData>;
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
      if (e.key === "/") {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>("input[data-dashboard-search]");
        el?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    // When the user clears the search box, the filters evaluate true for all items, 
    // causing massive lists to reappear. We MUST scroll up so the user doesn't lose their place 
    // when the layout expands and pushes bottom content completely off-screen.
    if (query.trim() === "" && typeof window !== "undefined") {
      if (window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [query]);

  const { impact, reorderedImpact, programmeAgreementStat } = useMemo(() => {
    const impactArr: { label: string; number: string; icon?: React.ReactNode; colorClass?: string; style?: React.CSSProperties; category: string }[] = [];
    const overviewImpactTheme = "bg-au-dark-green text-white";
    let agreementStat: Stat | null = null;

    if (data?.kpis) {
      data.kpis.forEach((k: KPI) => {
        const label = String(k.label ?? "").trim();
        const normLabel = label.toLowerCase();
        if (normLabel.includes("programme agreement")) {
          agreementStat = { title: "Programme agreement", value: "Signed Dec 2016", icon: <Landmark size={20} /> };
          return;
        }
        if (k.amount_eur_millions !== undefined) {
          const num = Number(k.amount_eur_millions);
          impactArr.push({ label: k.label, number: `€${num}M`, icon: <Landmark size={24} />, colorClass: overviewImpactTheme, category: 'overview' });
        }
        if (k.eo_applications !== undefined) impactArr.push({ label: "EO Applications", number: `${k.eo_applications}`, icon: <Sparkles size={24} />, colorClass: overviewImpactTheme, category: 'implementation' });
        if (k.users !== undefined) impactArr.push({ label: "Users", number: `${k.users}`, icon: <Users size={24} />, colorClass: overviewImpactTheme, category: 'implementation' });
        if (k.geoportals !== undefined) impactArr.push({ label: "Geoportals", number: `${k.geoportals}`, icon: <LayoutGrid size={24} />, colorClass: overviewImpactTheme, category: 'infrastructure' });
        if (k.implementing_institutions !== undefined) impactArr.push({ label: "Implementing", number: `${k.implementing_institutions}`, icon: <School size={24} />, colorClass: overviewImpactTheme, category: 'implementation' });
        if (k.data_enabled_institutions !== undefined) impactArr.push({ label: "Data Enabled Institutions", number: `${k.data_enabled_institutions}`, icon: <Cable size={24} />, colorClass: overviewImpactTheme, category: 'infrastructure' });
        if (k.estations_installed !== undefined) impactArr.push({ label: "eStations Installed", number: `${k.estations_installed}`, icon: <Antenna size={24} />, colorClass: overviewImpactTheme, category: 'infrastructure' });
        if (k.trained_operators !== undefined) impactArr.push({ label: "Trained Operators", number: `${k.trained_operators}`, icon: <Settings size={24} />, colorClass: overviewImpactTheme, category: 'capacity' });
        if (k.trainings !== undefined) impactArr.push({ label: "Trainings", number: `${k.trainings}`, icon: <Building2 size={24} />, colorClass: overviewImpactTheme, category: 'capacity' });
        if (k.trainees_in_eo !== undefined) impactArr.push({ label: "Trainees In EO", number: `${k.trainees_in_eo}`, icon: <Satellite size={24} />, colorClass: overviewImpactTheme, category: 'capacity' });
        if (k.studies_grant !== undefined) impactArr.push({ label: "Study Grants", number: `${k.studies_grant}`, icon: <Award size={24} />, colorClass: overviewImpactTheme, category: 'capacity' });
        if (k.continental_network !== undefined) impactArr.push({ label: "Continental Networks", number: `${k.continental_network}`, icon: <Network size={24} />, colorClass: overviewImpactTheme, category: 'overview' });
        if (k.dissemination_platform !== undefined) impactArr.push({ label: "Dissemination Platform", number: `${k.dissemination_platform}`, icon: <Share2 size={24} />, colorClass: overviewImpactTheme, category: 'overview' });
        if (k.countries !== undefined) impactArr.push({ label: "Countries", number: `${k.countries}`, icon: <Flag size={24} />, colorClass: overviewImpactTheme, category: 'overview' });
      });
    }

    const bottomKeywords = ["phase 1 grant", "phase 1"];
    const norm = (s: string) => s.toLowerCase().replace(/&/g, "and");
    const top = impactArr.filter(i => !bottomKeywords.some(kw => norm(i.label ?? "").includes(norm(kw))));
    const bottom = impactArr.filter(i => bottomKeywords.some(kw => norm(i.label ?? "").includes(norm(kw))));
    
    return { impact: impactArr, reorderedImpact: [...top, ...bottom], programmeAgreementStat: agreementStat };
  }, [data]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || !data) return [];
    const results: SearchResult[] = [];

    reorderedImpact.forEach((i) => {
      if (i.label?.toLowerCase().includes(q) || i.number?.toLowerCase().includes(q)) {
        results.push({
          id: `impact-${i.label}`,
          title: i.label,
          subtitle: i.number,
          category: "Impact",
          icon: "insights",
          action: () => {
            setActiveTab(i.category);
          }
        });
      }
    });

    (data.timeline ?? []).forEach((t, idx) => {
      if (t.event?.toLowerCase().includes(q) || String(t.year ?? t.years ?? "").toLowerCase().includes(q)) {
        results.push({
          id: `timeline-${idx}`,
          title: t.event,
          subtitle: String(t.year ?? t.years ?? ""),
          category: "Pillars",
          icon: "calendar_month",
          action: () => document.querySelector('.timeline-container')?.scrollIntoView({ behavior: 'smooth' })
        });
      }
    });

    (data.services ?? []).forEach((s, sIdx) => {
      s.items.forEach((item, iIdx) => {
        if (item.toLowerCase().includes(q)) {
          results.push({
            id: `service-${sIdx}-${iIdx}`,
            title: item,
            subtitle: s.category,
            category: "Other",
            icon: "grid_view",
            action: () => {
              setTimeout(() => {
                document.getElementById(`services-${s.category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          });
        }
      });
    });

    return results;
  }, [query, reorderedImpact, data]);

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading dashboard…</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-[24px]">Failed to load dashboard data.</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Program Overview' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'capacity', label: 'Capacity Building' },
    { id: 'implementation', label: 'Implementation' },
  ];

  const filteredImpact = reorderedImpact.filter(i => {
    const q = query.trim().toLowerCase();
    const matchesTab = i.category === activeTab;
    const matchesQuery = q === "" || i.label?.toLowerCase().includes(q) || i.number?.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });
  const remainder = filteredImpact.length % 4;
  const placeholders = remainder === 0 ? 0 : 4 - remainder;

  const filteredTimeline: TimelineItem[] = (data.timeline ?? []).filter((t) => {
    const q = query.trim().toLowerCase();
    return q === "" || (t.event ?? "").toLowerCase().includes(q) || String(t.year ?? t.years ?? "").toLowerCase().includes(q);
  });

  const visibleServiceGroups = (data.services ?? []).filter((s) => (s.items ?? []).length > 0);
  const partnerCount = (data.funders?.length ?? 0) + (data.technical_partners?.length ?? 0);
  const stats: Stat[] = programmeAgreementStat ? [programmeAgreementStat] : [];

  return (
    <div className="relative pb-24">
      <ProgramHeader
        name={String(data.program?.name ?? "")}
        oneLiner={String(data.program?.one_liner ?? "")}
        onSearch={(q: string) => setQuery(q)}
        searchValue={query}
        searchResults={searchResults}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { 
            label: "Impact cards", 
            value: filteredImpact.length, 
            note: query.trim() === "" 
              ? `in ${tabs.find((t) => t.id === activeTab)?.label ?? "overview"}` 
              : `matched in ${tabs.find((t) => t.id === activeTab)?.label ?? "overview"}`, 
            icon: "insights", 
            featured: true 
          },
          { 
            label: "Milestones", 
            value: filteredTimeline.length, 
            note: query.trim() === "" ? "total program milestones" : "matched by your current search", 
            icon: "calendar_month" 
          },
          { 
            label: "Service groups", 
            value: visibleServiceGroups.length, 
            note: "total available services", 
            icon: "grid_view" 
          },
          { label: "Partners", value: partnerCount, note: "funders and technical partners", icon: "groups" },
        ].map((metric) => {
          const blueCardLabels = new Set(["Milestones", "Service groups", "Partners"]);
          const useBlueCard = metric.featured || blueCardLabels.has(metric.label);

          return (
          <div
            key={metric.label}
            className={`rounded-[24px] border p-5 ${useBlueCard ? "border-au-dark-green/20 bg-au-dark-green text-white shadow-lg" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${useBlueCard ? "text-white/75" : "text-slate-500"}`}>{metric.label}</p>
                <div className={`mt-3 text-3xl font-bold tracking-tight ${useBlueCard ? "text-white" : "text-au-dark-green"}`}>{metric.value}</div>
                <p className={`mt-2 text-sm ${useBlueCard ? "text-white/80" : "text-slate-600"}`}>{metric.note}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] border ${useBlueCard ? "border-white/20 bg-white/12 text-au-gold" : "border-slate-200 bg-au-gold/10 text-au-gold"}`}>
                <IconlyIcon name={metric.icon} size={20} color="var(--color-au-gold)" />
              </div>
            </div>
          </div>
        )})}
      </section>

      <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} className="max-w-4xl" fullWidth />
        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div 
              key={activeTab}
              initial={false}
              animate="show"
              exit="hidden"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {filteredImpact.map((i) => (
                <motion.div key={i.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                  <ImpactCard label={i.label} number={i.number} icon={i.icon} colorClass={i.colorClass} style={i.style} />
                </motion.div>
              ))}
              {Array.from({ length: placeholders }).map((_, idx) => (
                <ImpactCard key={`placeholder-${idx}`} number={""} label={undefined} placeholder />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="space-y-8">
          <div className="timeline-container">
            <Timeline items={filteredTimeline} />
          </div>
          <div>
            <ServicesList services={data.services ?? []} />
          </div>
        </div>

        <div className="space-y-8">
          {data.funders && data.funders.length > 0 && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Funded By</h3>
              <div className="flex flex-col gap-4">
                {data.funders.map((funder, idx) => (
                  <div key={idx} className="flex items-center gap-3" title={funder.name}>
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image src={funder.logo} alt={`${funder.name} logo`} fill className="object-contain" unoptimized />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{funder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.technical_partners && data.technical_partners.length > 0 && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Technical Partners</h3>
              <div className="flex flex-col gap-4">
                {data.technical_partners.map((partner, idx) => (
                  <div key={idx} className="flex items-center gap-3" title={partner.name}>
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain" unoptimized />
                    </div>
                    <span className="text-sm font-medium text-slate-900">{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(data.phase2?.focus || (data.phase2?.pillars?.length ?? 0) > 0 || (data.phase2?.cross_cutting?.length ?? 0) > 0) && (
            <PhaseSummary focus={String(data.phase2?.focus ?? "")} pillars={data.phase2?.pillars ?? []} crossCutting={data.phase2?.cross_cutting ?? []} />
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-10">
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => (
              <StatCard key={s.title} title={s.title} value={s.value} delta={s.delta} deltaType={s.deltaType} icon={s.icon} />
            ))}
          </div>
        </div>
      )}

      <SummaryChartsModal open={isChartsOpen} onCloseAction={() => setIsChartsOpen(false)} />
      <MapModal
        open={isMapOpen}
        onCloseAction={() => setIsMapOpen(false)}
        points={samplePoints}
        groupsColor={{ West: 'var(--color-au-dark-green)', East: 'var(--color-au-green)', North: 'var(--color-au-gold)', South: 'var(--color-au-dark-green)', Central: 'var(--color-au-green)' }}
        legendItems={[
          { label: 'West', color: '#1E3A8A' },
          { label: 'East', color: '#10B981' },
          { label: 'North', color: '#F59E0B' },
          { label: 'South', color: '#1E3A8A' },
          { label: 'Central', color: '#10B981' },
        ]}
      />
    </div>
  );
}
