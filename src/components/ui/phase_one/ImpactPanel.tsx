"use client";
import React, { useState } from "react";
import PhaseTwoImpactCard from '../phase_two/PhaseTwoImpactCard';

type InfraMetrics = {
  eStationsOperational?: React.ReactNode;
  legacySystemsMaintained?: React.ReactNode;
  operationalGeoportals?: React.ReactNode;
  dataVolumeHandledAnnually?: React.ReactNode;
  geoportalRegisteredUsers?: React.ReactNode;
  [k: string]: unknown;
};

type ServicesMetrics = {
  totalOperationalServices?: React.ReactNode;
  terrestrialServices?: React.ReactNode;
  marineServices?: React.ReactNode;
  privateSectorEngagement_ServiceDev?: React.ReactNode;
  [k: string]: unknown;
};

type CapacityMetrics = {
  participantsTrained?: React.ReactNode;
  totalTrainingDays?: React.ReactNode;
  coursesDelivered?: React.ReactNode;
  scholarshipsAwarded?: React.ReactNode;
  hackathons?: React.ReactNode;
  [k: string]: unknown;
};

type OutreachMetrics = {
  knowledgeProducts?: React.ReactNode;
  digitalPlatforms?: React.ReactNode;
  communicationStrategies?: React.ReactNode;
  visibilityOutputs?: React.ReactNode;
  mediaCoverage?: React.ReactNode;
  publicEvents?: React.ReactNode;
  [k: string]: unknown;
};

type CrossMetrics = {
  femaleParticipation?: React.ReactNode;
  youthInnovation_GAIAClubs?: { universities?: React.ReactNode; countries?: React.ReactNode; [k: string]: unknown };
  [k: string]: unknown;
};

type ReachMetrics = {
  countriesInvolved?: React.ReactNode;
  institutionsInvolved?: React.ReactNode;
  [k: string]: unknown;
};

type Metrics = {
  reach?: ReachMetrics;
  infrastructure?: InfraMetrics;
  services?: ServicesMetrics;
  capacityBuilding?: CapacityMetrics;
  engagementAndOutreach?: OutreachMetrics;
  crossCutting?: CrossMetrics;
  snapshotDate?: React.ReactNode;
  [k: string]: unknown;
};

const TabButton = ({ title, active, onClick, icon }: { title: string; active: boolean; onClick: () => void; icon?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
      active
        ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
        : "text-zinc-600 border border-transparent hover:border-zinc-200 hover:bg-white"
    }`}
  >
    {icon ? <span className="material-symbols-outlined text-[18px]">{icon}</span> : null}
    <span className="ml-1">{title}</span>
  </button>
);

export default function ImpactPanel({ metrics }: { metrics?: Metrics }) {
  const [activeTab, setActiveTab] = useState('General');

  const reach = (metrics?.reach ?? {}) as ReachMetrics;
  const infra = (metrics?.infrastructure ?? {}) as InfraMetrics;
  const services = (metrics?.services ?? {}) as ServicesMetrics;
  const capacity = (metrics?.capacityBuilding ?? {}) as CapacityMetrics;
  const outreach = (metrics?.engagementAndOutreach ?? {}) as OutreachMetrics;
  const cross = (metrics?.crossCutting ?? {}) as CrossMetrics;

  const infraItems = [
    { metric: 'eStations operational', value: (infra?.eStationsOperational ?? '—') as React.ReactNode },
    { metric: 'Legacy systems maintained', value: (infra?.legacySystemsMaintained ?? '—') as React.ReactNode },
    { metric: 'Operational geoportals', value: (infra?.operationalGeoportals ?? '—') as React.ReactNode },
    { metric: 'Data volume handled annually', value: (infra?.dataVolumeHandledAnnually ?? '—') as React.ReactNode },
    { metric: 'Geoportal registered users', value: (infra?.geoportalRegisteredUsers ?? '—') as React.ReactNode },
  ];

  const servicesItems = [
    { metric: 'Total operational services', value: (services?.totalOperationalServices ?? '—') as React.ReactNode },
    { metric: 'Terrestrial services', value: (services?.terrestrialServices ?? '—') as React.ReactNode },
    { metric: 'Marine services', value: (services?.marineServices ?? '—') as React.ReactNode },
    { metric: 'Private sector engagement', value: (services?.privateSectorEngagement_ServiceDev ?? '—') as React.ReactNode },
  ];

  const capacityItems = [
    { metric: 'Participants trained', value: (capacity?.participantsTrained ?? '—') as React.ReactNode },
    { metric: 'Total training days', value: (capacity?.totalTrainingDays ?? '—') as React.ReactNode },
    { metric: 'Courses delivered', value: (capacity?.coursesDelivered ?? '—') as React.ReactNode },
    { metric: 'Scholarships awarded', value: (capacity?.scholarshipsAwarded ?? '—') as React.ReactNode },
    { metric: 'Hackathons', value: (capacity?.hackathons ?? '—') as React.ReactNode },
  ];

  const engagementItems = [
    { metric: 'Knowledge products', value: (outreach?.knowledgeProducts ?? '—') as React.ReactNode },
    { metric: 'Digital platforms', value: (outreach?.digitalPlatforms ?? '—') as React.ReactNode },
    { metric: 'Communication strategies', value: (outreach?.communicationStrategies ?? '—') as React.ReactNode },
    { metric: 'Visibility outputs', value: (outreach?.visibilityOutputs ?? '—') as React.ReactNode },
    { metric: 'Media coverage', value: (outreach?.mediaCoverage ?? '—') as React.ReactNode },
    { metric: 'Public events', value: (outreach?.publicEvents ?? '—') as React.ReactNode },
  ];

  const tabs = [
    { name: 'General', icon: 'dashboard' },
    { name: 'Services', icon: 'layers' },
    { name: 'Infrastructure', icon: 'dns' },
    { name: 'Capacity Building', icon: 'school' },
    { name: 'Engagement & Outreach', icon: 'campaign' },
    { name: 'Cross Cutting', icon: 'cut' },
  ];

  const cardGrid = (items: { metric?: string; value?: React.ReactNode; icon?: string; colorClass?: string }[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((it, idx) => (
        <PhaseTwoImpactCard key={`${it.metric ?? 'it'}-${idx}`} label={it.metric} value={it.value} icon={it.icon} colorClass={it.colorClass} />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General': {
        const general = [
          { metric: 'Countries involved', value: (reach?.countriesInvolved ?? '—') as React.ReactNode, icon: 'public', colorClass: 'bg-amber-50 text-amber-600' },
          { metric: 'Institutions', value: (reach?.institutionsInvolved ?? '—') as React.ReactNode, icon: 'school', colorClass: 'bg-emerald-50 text-emerald-600' },
          { metric: 'Snapshot date', value: (metrics?.snapshotDate ?? '—') as React.ReactNode, icon: 'schedule', colorClass: 'bg-sky-50 text-sky-600' },
          { metric: 'Total operational services', value: (services?.totalOperationalServices ?? '—') as React.ReactNode, icon: 'layers', colorClass: 'bg-violet-50 text-violet-600' },
        ];
        return cardGrid(general);
      }

      case 'Services': {
        const serviceIcons: { [key: string]: string } = {
          'Total operational services': 'apps',
          'Terrestrial services': 'grass',
          'Marine services': 'waves',
          'Private sector engagement': 'business_center',
        };
        return cardGrid(servicesItems.map(s => ({ metric: s.metric, value: s.value, icon: serviceIcons[s.metric] || 'room_service', colorClass: 'bg-sky-50 text-sky-600' })));
      }

      case 'Infrastructure':
        return cardGrid(infraItems.map(s => ({ metric: s.metric, value: s.value, icon: 'sensors', colorClass: 'bg-amber-50 text-amber-600' })));

      case 'Capacity Building':
        return cardGrid(capacityItems.map(s => ({ metric: s.metric, value: s.value, icon: 'school', colorClass: 'bg-emerald-50 text-emerald-600' })));

      case 'Engagement & Outreach':
        return cardGrid(engagementItems.map(s => ({ metric: s.metric, value: s.value, icon: 'campaign', colorClass: 'bg-rose-50 text-rose-600' })));

      case 'Cross Cutting':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-3">
              <h4 className="text-xs font-medium text-zinc-800">Participation</h4>
              <div className="mt-2 text-sm text-zinc-700">
                <div><strong>Female participation:</strong> {(cross?.femaleParticipation ?? '—') as React.ReactNode}</div>
                <div className="mt-1"><strong>GAIA clubs (universities):</strong> {(cross?.youthInnovation_GAIAClubs?.universities ?? '—') as React.ReactNode}</div>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3">
              <h4 className="text-xs font-medium text-zinc-800">Youth</h4>
              <div className="mt-2 text-sm text-zinc-700">
                <div><strong>Countries:</strong> {(cross?.youthInnovation_GAIAClubs?.countries ?? '—') as React.ReactNode}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-zinc-900">Key Impact Metrics</h2>

      <div className="mt-4">
        <nav className="flex items-center justify-between flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <div className="flex-1 flex" key={tab.name}>
              <div className="w-full flex justify-center">
                <TabButton
                  title={tab.name}
                  icon={tab.icon}
                  active={activeTab === tab.name}
                  onClick={() => setActiveTab(tab.name)}
                />
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-4">{renderContent()}</div>
    </section>
  );
}
