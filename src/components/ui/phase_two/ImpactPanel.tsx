"use client";
import React, { useState } from "react";
import IconlyIcon from "../IconlyIcon";
import PhaseTwoImpactCard from './PhaseTwoImpactCard';
import { motion, AnimatePresence } from "framer-motion";

type Metrics = Record<string, any>;

const TabButton = ({ title, active, onClick, icon }: { title: string; active: boolean; onClick: () => void; icon?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap border ${
      active
        ? "bg-au-dark-green text-white border-au-dark-green"
        : "bg-transparent text-[#71717a] border-transparent hover:border-slate-200 hover:bg-white"
    }`}
  >
    {icon ? <IconlyIcon name={icon} size={18} color="currentColor" /> : null}
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

  const primaryBadge = 'badge-au-dark-green';
  const secondaryBadge = 'badge-au-gold';
  const tertiaryBadge = 'badge-au-green';

  // Use validated Material Symbols icon names to ensure they render correctly
  const infraItems = [
    { metric: 'eStations operational', value: infra?.eStationsOperational ?? '—', icon: 'sensors', colorClass: primaryBadge },
    { metric: 'Legacy systems maintained', value: infra?.legacySystemsMaintained ?? '—', icon: 'history', colorClass: secondaryBadge },
    { metric: 'Operational geoportals', value: infra?.operationalGeoportals ?? '—', icon: 'public', colorClass: tertiaryBadge },
    { metric: 'Data volume handled annually', value: infra?.dataVolumeHandledAnnually ?? '—', icon: 'storage', colorClass: primaryBadge },
    { metric: 'Geoportal registered users', value: infra?.geoportalRegisteredUsers ?? '—', icon: 'groups', colorClass: secondaryBadge },
  ];

  const servicesItems = [
    { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—', icon: 'inventory_2', colorClass: primaryBadge },
    { metric: 'Terrestrial services', value: services?.terrestrialServices ?? '—', icon: 'park', colorClass: tertiaryBadge },
    { metric: 'Marine services', value: services?.marineServices ?? '—', icon: 'water_drop', colorClass: primaryBadge },
    { metric: 'Private sector engagement', value: services?.privateSectorEngagement_ServiceDev ?? '—', icon: 'business_center', colorClass: secondaryBadge },
  ];

  const capacityItems = [
    { metric: 'Participants trained', value: capacity?.participantsTrained ?? '—', icon: 'school', colorClass: primaryBadge },
    { metric: 'Total trainings', value: capacity?.totalTrainings ?? '—', icon: 'calendar_today', colorClass: secondaryBadge },
    { metric: 'Courses delivered', value: capacity?.coursesDelivered ?? '—', icon: 'menu_book', colorClass: tertiaryBadge },
    { metric: 'Scholarships awarded', value: capacity?.scholarshipsAwarded ?? '—', icon: 'emoji_events', colorClass: secondaryBadge },
    { metric: 'Hackathons', value: capacity?.hackathons ?? '—', icon: 'bolt', colorClass: primaryBadge },
    { metric: 'Continental Networks', value: capacity?.continentalNetworks ?? '—', icon: 'hub', colorClass: tertiaryBadge },
    { metric: 'GAAN Universities', value: capacity?.institutionsInvolved_GAAN?.universities ?? '—', icon: 'account_balance', colorClass: primaryBadge },
    { metric: 'GAAN Colleges', value: capacity?.institutionsInvolved_GAAN?.colleges ?? '—', icon: 'school', colorClass: secondaryBadge },
  ];

  const engagementItems = [
    { metric: 'Knowledge products', value: outreach?.knowledgeProducts ?? '—', icon: 'description', colorClass: primaryBadge },
    { metric: 'Digital platforms', value: outreach?.digitalPlatforms ?? '—', icon: 'devices', colorClass: secondaryBadge },
    { metric: 'Communication strategies', value: outreach?.communicationStrategies ?? '—', icon: 'campaign', colorClass: tertiaryBadge },
    { metric: 'Visibility outputs', value: outreach?.visibilityOutputs ?? '—', icon: 'visibility', colorClass: secondaryBadge },
    { metric: 'Media coverage', value: outreach?.mediaCoverage ?? '—', icon: 'article', colorClass: primaryBadge },
    { metric: 'Public events', value: outreach?.publicEvents ?? '—', icon: 'event', colorClass: tertiaryBadge },
  ];

  const tabs = [
    { name: 'General', icon: 'dashboard' },
    { name: 'Services', icon: 'layers' },
    // { name: 'Infrastructure', icon: 'dns' }, // temporarily commentated for later validation of content
    { name: 'Capacity Building', icon: 'school' },
    { name: 'Engagement & Outreach', icon: 'campaign' },
  ];

  const cardGrid = (items: { metric?: string; value?: any; icon?: string; colorClass?: string; style?: React.CSSProperties }[]) => (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="show"
    >
      {items.map((it, idx) => (
        <motion.div key={`${it.metric ?? 'it'}-${idx}`} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <PhaseTwoImpactCard label={it.metric} value={it.value} icon={it.icon} colorClass={it.colorClass} style={it.style} />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'General': {
        const general = [
          { metric: 'Countries involved', value: reach?.countriesInvolved ?? '—', icon: 'public', colorClass: 'badge-au-dark-green' },
          { metric: 'Institutions', value: reach?.institutionsInvolved ?? '—', icon: 'groups', colorClass: 'badge-au-gold' },
          { metric: 'Snapshot date', value: metrics?.snapshotDate ?? '—', icon: 'schedule', colorClass: 'badge-au-green' },
          { metric: 'Total operational services', value: services?.totalOperationalServices ?? '—', icon: 'layers', colorClass: 'badge-au-dark-green' },
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

      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
