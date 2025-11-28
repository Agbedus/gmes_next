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

  // icon background: full #952038; icon foreground (glyph) use full gold #FABC0C
  const pastelBg = { backgroundColor: '#952038' };
  const pastelFg = 'text-[#FABC0C]';

  // Use validated Material Symbols icon names to ensure they render correctly
  const infraItems = [
    { metric: 'eStations operational', value: infra?.eStationsOperational ?? '—', icon: 'sensors', style: pastelBg, colorClass: pastelFg },
    { metric: 'Legacy systems maintained', value: infra?.legacySystemsMaintained ?? '—', icon: 'history', style: pastelBg, colorClass: pastelFg },
    { metric: 'Operational geoportals', value: infra?.operationalGeoportals ?? '—', icon: 'public', style: pastelBg, colorClass: pastelFg },
    { metric: 'Data volume handled annually', value: infra?.dataVolumeHandledAnnually ?? '—', icon: 'storage', style: pastelBg, colorClass: pastelFg },
    { metric: 'Geoportal registered users', value: infra?.geoportalRegisteredUsers ?? '—', icon: 'groups', style: pastelBg, colorClass: pastelFg },
  ];

  const servicesItems = [
    { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—', icon: 'inventory_2', style: pastelBg, colorClass: pastelFg },
    { metric: 'Terrestrial services', value: services?.terrestrialServices ?? '—', icon: 'park', style: pastelBg, colorClass: pastelFg },
    { metric: 'Marine services', value: services?.marineServices ?? '—', icon: 'water_drop', style: pastelBg, colorClass: pastelFg },
    { metric: 'Private sector engagement', value: services?.privateSectorEngagement_ServiceDev ?? '—', icon: 'business_center', style: pastelBg, colorClass: pastelFg },
  ];

  const capacityItems = [
    { metric: 'Participants trained', value: capacity?.participantsTrained ?? '—', icon: 'school', style: pastelBg, colorClass: pastelFg },
    { metric: 'Total trainings', value: capacity?.totalTrainings ?? '—', icon: 'calendar_today', style: pastelBg, colorClass: pastelFg },
    { metric: 'Courses delivered', value: capacity?.coursesDelivered ?? '—', icon: 'menu_book', style: pastelBg, colorClass: pastelFg },
    { metric: 'Scholarships awarded', value: capacity?.scholarshipsAwarded ?? '—', icon: 'emoji_events', style: pastelBg, colorClass: pastelFg },
    { metric: 'Hackathons', value: capacity?.hackathons ?? '—', icon: 'bolt', style: pastelBg, colorClass: pastelFg },
    { metric: 'Continental Networks', value: capacity?.continentalNetworks ?? '—', icon: 'hub', style: pastelBg, colorClass: pastelFg },
    { metric: 'GAAN Universities', value: capacity?.institutionsInvolved_GAAN?.universities ?? '—', icon: 'account_balance', style: pastelBg, colorClass: pastelFg },
    { metric: 'GAAN Colleges', value: capacity?.institutionsInvolved_GAAN?.colleges ?? '—', icon: 'school', style: pastelBg, colorClass: pastelFg },
  ];

  const engagementItems = [
    { metric: 'Knowledge products', value: outreach?.knowledgeProducts ?? '—', icon: 'description', style: pastelBg, colorClass: pastelFg },
    { metric: 'Digital platforms', value: outreach?.digitalPlatforms ?? '—', icon: 'devices', style: pastelBg, colorClass: pastelFg },
    { metric: 'Communication strategies', value: outreach?.communicationStrategies ?? '—', icon: 'campaign', style: pastelBg, colorClass: pastelFg },
    { metric: 'Visibility outputs', value: outreach?.visibilityOutputs ?? '—', icon: 'visibility', style: pastelBg, colorClass: pastelFg },
    { metric: 'Media coverage', value: outreach?.mediaCoverage ?? '—', icon: 'article', style: pastelBg, colorClass: pastelFg },
    { metric: 'Public events', value: outreach?.publicEvents ?? '—', icon: 'event', style: pastelBg, colorClass: pastelFg },
  ];

  const tabs = [
    { name: 'General', icon: 'dashboard' },
    { name: 'Services', icon: 'layers' },
    // { name: 'Infrastructure', icon: 'dns' }, // temporarily commentated for later validation of content
    { name: 'Capacity Building', icon: 'school' },
    { name: 'Engagement & Outreach', icon: 'campaign' },
  ];

  const cardGrid = (items: { metric?: string; value?: any; icon?: string; colorClass?: string; style?: React.CSSProperties }[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((it, idx) => (
        <PhaseTwoImpactCard key={`${it.metric ?? 'it'}-${idx}`} label={it.metric} value={it.value} icon={it.icon} colorClass={it.colorClass} style={it.style} />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General': {
        const general = [
          { metric: 'Countries involved', value: reach?.countriesInvolved ?? '—', icon: 'public', colorClass: pastelFg, style: pastelBg },
          { metric: 'Institutions', value: reach?.institutionsInvolved ?? '—', icon: 'groups', colorClass: pastelFg, style: pastelBg },
          { metric: 'Snapshot date', value: metrics?.snapshotDate ?? '—', icon: 'schedule', colorClass: pastelFg, style: pastelBg },
          { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—', icon: 'layers', colorClass: pastelFg, style: pastelBg },
        ];
        return cardGrid(general);
      }

      case 'Services':
        return cardGrid(servicesItems);

      case 'Infrastructure':
        return cardGrid(infraItems);

      case 'Capacity Building':
        return cardGrid(capacityItems);

      case 'Engagement & Outreach':
        return cardGrid(engagementItems);

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