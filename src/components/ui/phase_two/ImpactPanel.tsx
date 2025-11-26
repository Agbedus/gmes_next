"use client";
import React, { useState } from "react";
import PhaseTwoImpactCard from './PhaseTwoImpactCard';

type Metrics = Record<string, any>;

const TabButton = ({ title, active, onClick, icon }: { title: string; active: boolean; onClick: () => void; icon?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap`}
    style={{
      backgroundColor: active ? '#038a36' : 'transparent',
      color: active ? '#fff' : '#71717a',
      borderColor: active ? '#038a36' : 'transparent',
      border: '1px solid'
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.backgroundColor = '#fff';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    {icon ? <span className="material-symbols-outlined text-[18px]">{icon}</span> : null}
    <span className="ml-1">{title}</span>
  </button>
);

export default function ImpactPanel({ metrics }: { metrics?: Metrics }) {
  const [activeTab, setActiveTab] = useState('General');

  const reach = metrics?.reach ?? {};
  const infra = metrics?.infrastructure ?? {};
  const services = metrics?.services ?? {};
  const capacity = metrics?.capacityBuilding ?? {};
  const outreach = metrics?.engagementAndOutreach ?? {};
  const cross = metrics?.crossCutting ?? {};

  const infraItems = [
    { metric: 'eStations operational', value: infra?.eStationsOperational ?? '—' },
    { metric: 'Legacy systems maintained', value: infra?.legacySystemsMaintained ?? '—' },
    { metric: 'Operational geoportals', value: infra?.operationalGeoportals ?? '—' },
    { metric: 'Data volume handled annually', value: infra?.dataVolumeHandledAnnually ?? '—' },
    { metric: 'Geoportal registered users', value: infra?.geoportalRegisteredUsers ?? '—' },
  ];

  const servicesItems = [
    { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—' },
    { metric: 'Terrestrial services', value: services?.terrestrialServices ?? '—' },
    { metric: 'Marine services', value: services?.marineServices ?? '—' },
    { metric: 'Private sector engagement', value: services?.privateSectorEngagement_ServiceDev ?? '—' },
  ];

  const capacityItems = [
    { metric: 'Participants trained', value: capacity?.participantsTrained ?? '—' },
    { metric: 'Total training days', value: capacity?.totalTrainingDays ?? '—' },
    { metric: 'Courses delivered', value: capacity?.coursesDelivered ?? '—' },
    { metric: 'Scholarships awarded', value: capacity?.scholarshipsAwarded ?? '—' },
    { metric: 'Hackathons', value: capacity?.hackathons ?? '—' },
  ];

  const engagementItems = [
    { metric: 'Knowledge products', value: outreach?.knowledgeProducts ?? '—' },
    { metric: 'Digital platforms', value: outreach?.digitalPlatforms ?? '—' },
    { metric: 'Communication strategies', value: outreach?.communicationStrategies ?? '—' },
    { metric: 'Visibility outputs', value: outreach?.visibilityOutputs ?? '—' },
    { metric: 'Media coverage', value: outreach?.mediaCoverage ?? '—' },
    { metric: 'Public events', value: outreach?.publicEvents ?? '—' },
  ];

  const tabs = [
    { name: 'General', icon: 'dashboard' },
    { name: 'Services', icon: 'layers' },
    { name: 'Infrastructure', icon: 'dns' },
    { name: 'Capacity Building', icon: 'school' },
    { name: 'Engagement & Outreach', icon: 'campaign' },
  ];

  const cardGrid = (items: { metric?: string; value?: any; icon?: string; colorClass?: string }[]) => (
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
          { metric: 'Countries involved', value: reach?.countriesInvolved ?? '—', icon: 'public', colorClass: 'text-white', style: { backgroundColor: '#e0c063' } },
          { metric: 'Institutions', value: reach?.institutionsInvolved ?? '—', icon: 'school', colorClass: 'text-white', style: { backgroundColor: '#009639' } },
          { metric: 'Snapshot date', value: metrics?.snapshotDate ?? '—', icon: 'schedule', colorClass: 'text-white', style: { backgroundColor: '#038a36' } },
          { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—', icon: 'layers', colorClass: 'text-white', style: { backgroundColor: '#009639' } },
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
        return cardGrid(servicesItems.map(s => ({ metric: s.metric, value: s.value, icon: serviceIcons[s.metric] || 'room_service', colorClass: 'text-white', style: { backgroundColor: '#038a36' } })));
      }

      case 'Infrastructure':
        return cardGrid(infraItems.map(s => ({ metric: s.metric, value: s.value, icon: 'sensors', colorClass: 'text-white', style: { backgroundColor: '#e0c063' } })));

      case 'Capacity Building':
        return cardGrid(capacityItems.map(s => ({ metric: s.metric, value: s.value, icon: 'school', colorClass: 'text-white', style: { backgroundColor: '#009639' } })));

      case 'Engagement & Outreach':
        return cardGrid(engagementItems.map(s => ({ metric: s.metric, value: s.value, icon: 'campaign', colorClass: 'text-white', style: { backgroundColor: '#dc2626' } })));


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