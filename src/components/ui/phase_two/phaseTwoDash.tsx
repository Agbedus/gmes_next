'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgramHeader from "@/components/ui/programHeader";
import phaseTwoData from '@/data/phase_two_data.json';

import OverviewPanel from './OverviewPanel';
import ImpactPanel from './ImpactPanel';
import ConsortiaPanel from './ConsortiaPanel';
import NetworksPanel from './NetworksPanel';
import Tabs from '@/components/ui/Tabs';

export default function PhaseTwoDash() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'consortia' | 'networks'>('overview');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = (phaseTwoData as any).gmesAndAfricaPhase2;

    const programDetails = program?.programDetails ?? {};
    const metrics = program?.keyImpactMetrics ?? {};
    const consortia = program?.consortia ?? [];
    const networks = program?.networksAndPartnerships ?? {};
    const strategicFramework = program?.strategicFramework ?? {};

    const filteredConsortia = consortia.filter((c: any) => {
        const searchStr = searchQuery.toLowerCase();
        // Check project title, acronym, coordinator name, and keywords
        return (
            (c.project_title ?? '').toLowerCase().includes(searchStr) ||
            (c.acronym ?? '').toLowerCase().includes(searchStr) ||
            (c.consortium?.coordinator?.name ?? '').toLowerCase().includes(searchStr) ||
            (c.keywords ?? []).some((kw: string) => kw.toLowerCase().includes(searchStr))
        );
    });

    const filteredNetworks = {
        ...networks,
        regional_networks: (networks.regional_networks ?? []).filter((n: any) => {
            const searchStr = searchQuery.toLowerCase();
            return (
                (n.name ?? '').toLowerCase().includes(searchStr) ||
                (n.description ?? '').toLowerCase().includes(searchStr)
            );
        })
    };

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
                name={programDetails?.name ?? 'GMES & Africa Phase 2'}
                oneLiner={programDetails?.description ?? ''}
                onSearch={handleSearch}
                searchValue={searchQuery}
            />

            <main className="mt-6">
                <ImpactPanel metrics={metrics} />

                {/* Tab bar at the same level as Program Overview (keeps design mostly unchanged) */}
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

                            {activeTab === 'networks' && (
                                <div id="panel-networks" role="tabpanel" aria-labelledby="tab-networks">
                                    <NetworksPanel networks={filteredNetworks} crossCutting={metrics?.crossCutting} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>
        </div>
    );
}
