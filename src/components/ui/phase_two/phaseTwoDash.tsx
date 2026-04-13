'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgramHeader from "@/components/ui/programHeader";
import phaseTwoData from '@/data/phase_two_data.json';
import { SearchResult } from "@/components/ui/GlobalSearch";

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

    const searchResults = useMemo(() => {
        if (searchQuery.length < 2) return [];
        const q = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // 1. Search Consortia
        consortia.forEach((c: any) => {
            const title = c.project_title || c.name || "";
            const acronym = c.acronym || "";
            const coordinator = c.consortium?.coordinator?.name || c.coordinator?.name || "";
            const keywords = c.keywords || [];
            const description = c.description || "";

            if (
                title.toLowerCase().includes(q) ||
                acronym.toLowerCase().includes(q) ||
                coordinator.toLowerCase().includes(q) ||
                keywords.some((k: string) => k.toLowerCase().includes(q)) ||
                description.toLowerCase().includes(q)
            ) {
                results.push({
                    id: `consortium-${acronym || title}`,
                    title: acronym ? `${title} (${acronym})` : title,
                    subtitle: coordinator,
                    category: "Consortia",
                    icon: "groups",
                    action: () => {
                        setActiveTab("consortia");
                        // We might need a way to tell ConsortiaPanel to select this one.
                        // For now, switching to the tab is a good start.
                        setTimeout(() => {
                            const el = document.getElementById('panel-consortia');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                });
            }
        });

        // 2. Search Networks
        (networks.regional_networks ?? []).forEach((n: any) => {
            if (n.name?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)) {
                results.push({
                    id: `network-${n.name}`,
                    title: n.name,
                    subtitle: n.description,
                    category: "Networks",
                    icon: "hub",
                    action: () => {
                        setActiveTab("networks");
                        setTimeout(() => {
                            const el = document.getElementById('panel-networks');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                });
            }
        });

        // 3. Search Pillars
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
                        setTimeout(() => {
                            const el = document.querySelector('details'); // Try to find the details element
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                });
            }
        });

        // 4. Search Alignment
        (strategicFramework.alignment?.continentalPolicies ?? []).forEach((policy: string) => {
            if (policy.toLowerCase().includes(q)) {
                results.push({
                    id: `policy-${policy}`,
                    title: policy,
                    category: "Alignment",
                    icon: "check_circle",
                    action: () => {
                        setActiveTab("overview");
                    }
                });
            }
        });

        return results;
    }, [searchQuery, consortia, networks, strategicFramework]);

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
                searchResults={searchResults}
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
