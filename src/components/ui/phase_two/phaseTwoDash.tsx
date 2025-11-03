'use client';
import React from 'react';
import ProgramHeader from "@/components/ui/programHeader";
import DashboardToolbar from "@/components/ui/dashboardToolbar";
import phaseTwoData from '@/data/phase_two_data.json';

import OverviewPanel from './OverviewPanel';
import ImpactPanel from './ImpactPanel';
import ConsortiaPanel from './ConsortiaPanel';
import NetworksPanel from './NetworksPanel';

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

    return (
        <div>
            <ProgramHeader name={programDetails?.name ?? 'GMES & Africa Phase 2'} oneLiner={programDetails?.description ?? ''} />

            <div className="mt-4">
                <DashboardToolbar onSearch={(q: string) => handleSearch(q)} onFilterClick={() => alert('Filter not implemented')} onDateClick={() => alert('Date not implemented')} />
            </div>

            <main className="mt-6">
                <ImpactPanel metrics={metrics} />

                {/* Pass metrics so OverviewPanel can render reach (countries/institutions) */}
                <OverviewPanel programDetails={programDetails} strategicFramework={strategicFramework} metrics={metrics} />

                <ConsortiaPanel consortia={consortia} />

                <NetworksPanel networks={networks} />

            </main>
        </div>
    );
}