'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgramHeader from "@/components/ui/programHeader";
import DashboardToolbar from "@/components/ui/dashboardToolbar";
import phaseTwoData from '@/data/phase_two_data.json';

import OverviewPanel from './OverviewPanel';
import ImpactPanel from './ImpactPanel';
import ConsortiaPanel from './ConsortiaPanel';
import NetworksPanel from './NetworksPanel';
import ImpactReportsPanel from './ImpactReportsPanel';
import Tabs from '@/components/ui/Tabs';

export default function PhaseTwoDash() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = (phaseTwoData as any).gmesAndAfricaPhase2;

    const programDetails = program?.programDetails ?? {};
    const metrics = program?.keyImpactMetrics ?? {};
    const consortia = program?.consortia ?? [];
    const networks = program?.networksAndPartnerships ?? {};
    const strategicFramework = program?.strategicFramework ?? {};

    function handleSearch(q: string) {
        console.log('phase2 search', q);
    }

    // Tab state: 'overview' | 'consortia' | 'networks' | 'reports'
    const [activeTab, setActiveTab] = useState<'overview' | 'consortia' | 'networks' | 'reports'>('overview');

    return (
        <div>
            <ProgramHeader name={programDetails?.name ?? 'GMES & Africa Phase 2'} oneLiner={programDetails?.description ?? ''} />

            <div className="mt-4">
                <DashboardToolbar onSearch={(q: string) => handleSearch(q)} onFilterClick={() => alert('Filter not implemented')} onDateClick={() => alert('Date not implemented')} />
            </div>

            <main className="mt-6">
                <ImpactPanel metrics={metrics} />

                {/* Tab bar at the same level as Program Overview (keeps design mostly unchanged) */}
                <div className="mt-12">
                    <Tabs
                        tabs={[
                            { id: 'overview', label: 'Program Overview' },
                            { id: 'consortia', label: 'Consortia' },
                            { id: 'networks', label: 'Networks' },
                            { id: 'reports', label: 'Impact Reports' },
                        ]}
                        activeId={activeTab}
                        onChange={(id) => setActiveTab(id as 'overview' | 'consortia' | 'networks' | 'reports')}
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
                                    <ConsortiaPanel consortia={consortia} />
                                </div>
                            )}

                            {activeTab === 'networks' && (
                                <div id="panel-networks" role="tabpanel" aria-labelledby="tab-networks">
                                    <NetworksPanel networks={networks} crossCutting={metrics?.crossCutting} />
                                </div>
                            )}

                            {activeTab === 'reports' && (
                                <div id="panel-reports" role="tabpanel" aria-labelledby="tab-reports">
                                    <ImpactReportsPanel />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>
        </div>
    );
}