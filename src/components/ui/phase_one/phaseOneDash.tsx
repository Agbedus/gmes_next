// filepath: /Users/yawdonkor/Desktop/git-repos/gmes_next/src/components/ui/phase_one/phaseOneDash.tsx
'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgramHeader from '@/components/ui/programHeader';
import phaseOneData from '@/data/phase_one_data.json';
import { SearchResult } from "@/components/ui/GlobalSearch";

import OverviewPanel from './OverviewPanel';
import ImpactPanel from './ImpactPanel';
import ConsortiaPanel from './ConsortiaPanel';
import Tabs from '@/components/ui/Tabs';
import { useUI } from "@/context/UIContext";
import MapModal from '../MapModal';
import SummaryChartsModal from '../../charts/summaryChartsModal';

type ConsortiaPanelProps = React.ComponentProps<typeof ConsortiaPanel>;
type PhaseOneConsortium = ConsortiaPanelProps['consortia'][number];

export default function PhaseOneDash() {
  const { isMapOpen, setIsMapOpen, isChartsOpen, setIsChartsOpen } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'consortia'>('overview');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = (phaseOneData as any).gmesAndAfricaPhase1;

  const programDetails = program?.programDetails ?? {};
  const metrics = program?.keyImpactMetrics ?? {};
  const consortia = program?.consortia ?? [];
  const strategicFramework = program?.strategicFramework ?? {};

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Consortia
    consortia.forEach((c: any) => {
        const name = c.name || "";
        const acronym = c.acronym || "";
        const lead = c.leadInstitution || "";
        const description = c.description || "";

        if (
            name.toLowerCase().includes(q) ||
            acronym.toLowerCase().includes(q) ||
            lead.toLowerCase().includes(q) ||
            description.toLowerCase().includes(q)
        ) {
            results.push({
                id: `consortium-${acronym || name}`,
                title: acronym ? `${name} (${acronym})` : name,
                subtitle: lead,
                category: "Consortia",
                icon: "groups",
                action: () => {
                    setActiveTab("consortia");
                    setTimeout(() => {
                        const el = document.getElementById('panel-consortia');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        }
    });

    // 2. Search Pillars
    (strategicFramework.pillars_LogFrame ?? []).forEach((p: any) => {
        if (p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
            results.push({
                id: `pillar-${p.id}`,
                title: p.name,
                subtitle: p.description,
                category: "Pillars",
                icon: "layers",
                action: () => {
                    setActiveTab("overview");
                }
            });
        }
    });

    return results;
  }, [searchQuery, consortia, strategicFramework]);

  const filteredConsortia = consortia.filter((c: PhaseOneConsortium) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      (c.name ?? '').toLowerCase().includes(searchStr) ||
      (c.acronym ?? '').toLowerCase().includes(searchStr) ||
      (c.leadInstitution ?? '').toLowerCase().includes(searchStr) ||
      (c.description ?? '').toLowerCase().includes(searchStr) ||
      (c.region ?? '').toLowerCase().includes(searchStr)
    );
  });

  // Reset dashboard state when query is cleared
  React.useEffect(() => {
    if (searchQuery === "") {
      setActiveTab("overview");
    }
  }, [searchQuery]);

  function handleSearch(q: string) {
    setSearchQuery(q);
  }

  return (
    <div>
      <ProgramHeader
        name={programDetails?.name ?? 'GMES & Africa Phase 1'}
        oneLiner={programDetails?.description ?? ''}
        onSearch={handleSearch}
        searchValue={searchQuery}
        searchResults={searchResults}
      />

      <main className="mt-6">
        <ImpactPanel metrics={metrics} />

        <div className="mt-12">
          <Tabs
            tabs={[
              { id: 'overview', label: 'Program Overview' },
              { id: 'consortia', label: 'Consortia' },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as 'overview' | 'consortia')}
            className="gap-2 w-full"
          />

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {activeTab === 'overview' && (
                <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
                  <OverviewPanel programDetails={programDetails} strategicFramework={strategicFramework} metrics={metrics} />
                </div>
              )}

              {activeTab === 'consortia' && (
                <div id="panel-consortia" role="tabpanel" aria-labelledby="tab-consortia">
                  <ConsortiaPanel consortia={filteredConsortia} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <SummaryChartsModal open={isChartsOpen} onCloseAction={() => setIsChartsOpen(false)} />
      <MapModal
        open={isMapOpen}
        onCloseAction={() => setIsMapOpen(false)}
        points={[]}
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
