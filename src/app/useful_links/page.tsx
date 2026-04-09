"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import usefulLinksData from '@/data/general_useful_links.json';
import { LinkCard, LinkItem } from '@/components/ui/useful_links/LinkCard';
import { ConsortiaTabs } from '@/components/ui/useful_links/ConsortiaTabs';

type PolicyItem = {
    id: number;
    title: string;
    links: LinkItem[];
};

type UsefulLinksData = {
    PMU: PolicyItem[];
    use_cases: PolicyItem[];
    continental_policies: PolicyItem[];
    global_agendas: PolicyItem[];
};

const data = usefulLinksData as UsefulLinksData;

type Tab = 'policies' | 'agendas' | 'consortia' | 'pmu' | 'useCases';

const SECTION_LABELS: Record<Tab, string> = {
    pmu: 'Program Mgt. Unit',
    consortia: 'Consortia Resources',
    useCases: 'Use Cases',
    policies: 'Continental Policies',
    agendas: 'Global Agendas'
};

const VALID_SECTIONS = new Set<Tab>(['pmu', 'consortia', 'useCases', 'policies', 'agendas']);

export default function UsefulLinksPage() {
    const searchParams = useSearchParams();
    const requestedSection = searchParams.get('section');
    const activeTab: Tab = requestedSection && VALID_SECTIONS.has(requestedSection as Tab)
        ? (requestedSection as Tab)
        : 'pmu';

    const renderPolicyGrid = (items: PolicyItem[], colorTheme: 'green' | 'gold') => (
        <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                }
            }}
            initial="hidden"
            animate="show"
        >
            {items.map((item) => (
                <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <LinkCard title={item.title} links={item.links} colorTheme={colorTheme} />
                </motion.div>
            ))}
        </motion.div>
    );

    const sectionContent: Record<Tab, React.ReactNode> = {
        pmu: renderPolicyGrid(data.PMU, 'green'),
        consortia: <ConsortiaTabs colorTheme="burgundy" />,
        useCases: renderPolicyGrid(data.use_cases, 'green'),
        policies: renderPolicyGrid(data.continental_policies, 'green'),
        agendas: renderPolicyGrid(data.global_agendas, 'gold')
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-0 py-12 sm:px-0 lg:px-0">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Useful Links</h1>
                <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500">Access key documents, strategies, and resources related to GMES & Africa.</p>
            </header>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.section
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                    >
                        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Showing</div>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{SECTION_LABELS[activeTab]}</h2>
                        </div>
                        {sectionContent[activeTab]}
                    </motion.section>
                </AnimatePresence>
            </div>
        </div>
    );
}
