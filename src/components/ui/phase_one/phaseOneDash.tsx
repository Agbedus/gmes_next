// filepath: /Users/yawdonkor/Desktop/git-repos/gmes_next/src/components/ui/phase_one/phaseOneDash.tsx
'use client';
import React, { useState } from 'react';
import ProgramHeader from '@/components/ui/programHeader';
import DashboardToolbar from '@/components/ui/dashboardToolbar';
import phaseOneData from '@/data/phase_one_data.json';

import OverviewPanel from './OverviewPanel';
import ImpactPanel from './ImpactPanel';
import ConsortiaPanel from './ConsortiaPanel';
import NetworksPanel from './NetworksPanel';
import Tabs from '@/components/ui/Tabs';

export default function PhaseOneDash() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = (phaseOneData as any).gmesAndAfricaPhase1;

  const programDetails = program?.programDetails ?? {};
  const metrics = program?.keyImpactMetrics ?? {};
  const consortia = program?.consortia ?? [];
  const networks = program?.digitalEcosystem ?? {};
  const strategicFramework = program?.strategicFramework ?? {};

  function handleSearch(q: string) {
    console.log('phase1 search', q);
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'consortia' | 'networks'>('overview');

  return (
    <div>
      <ProgramHeader name={programDetails?.name ?? 'GMES & Africa Phase 1'} oneLiner={programDetails?.description ?? ''} />

      <div className="mt-4">
        <DashboardToolbar onSearch={(q: string) => handleSearch(q)} onFilterClick={() => alert('Filter not implemented')} onDateClick={() => alert('Date not implemented')} />
      </div>

      <main className="mt-6">
        <ImpactPanel metrics={metrics} />

        <div className="mt-12">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Program Overview' },
              { id: 'consortia', label: 'Consortia' },
              { id: 'networks', label: 'Networks' },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as 'overview' | 'consortia' | 'networks')}
            className="gap-2 w-full"
          />

          <div className="mt-4">
            {activeTab === 'overview' && (
              <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
                <OverviewPanel programDetails={programDetails} strategicFramework={strategicFramework} metrics={metrics} />
              </div>
            )}

            {activeTab === 'consortia' && (
              <div id="panel-consortia" role="tabpanel" aria-labelledby="tab-consortia">
                <ConsortiaPanel consortia={consortia} />
              </div>
            )}

            {activeTab === 'networks' && (
              <div id="panel-networks" role="tabpanel" aria-labelledby="tab-networks">
                <NetworksPanel networks={networks} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
