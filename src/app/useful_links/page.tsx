"use client";

import React, { useState } from 'react';
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
    PMU:PolicyItem[];
    use_cases:PolicyItem[];
    continental_policies: PolicyItem[];
    global_agendas: PolicyItem[];
};

// Cast the imported JSON to the type
const data = usefulLinksData as UsefulLinksData;

type Tab = 'policies' | 'agendas' | 'consortia' | 'pmu' | 'useCases' ;

export default function UsefulLinksPage() {
    const [activeTab, setActiveTab] = useState<Tab>('pmu');

    // Theme color map for tabs (policy/agendas/consortia)
    const tabColors: Record<Tab, string> = {
        pmu: '#a3bd44',
        useCases: '#9948d2',
        policies: '#009639', // green
        agendas: '#c9b33a',  // gold
        consortia: '#952038' // deep red
    };

    const getButtonStyle = (tab: Tab) => {
        const color = tabColors[tab];
        if (activeTab === tab) {
            return { backgroundColor: color, color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } as React.CSSProperties;
        }
        return {} as React.CSSProperties;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-24 px-4 sm:px-6 lg:px-8">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-bold text-zinc-900">Useful Links</h1>
                <p className="text-zinc-500 mt-3 max-w-2xl mx-auto text-lg">Access key documents, strategies, and resources related to GMES & Africa.</p>
            </header>

            {/* Main Tabs */}
            <div className="flex justify-center mb-12">
                <motion.div 
                    className="bg-zinc-100 p-1.5 rounded-xl inline-flex shadow-inner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {['pmu', 'consortia', 'useCases', 'policies', 'agendas'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            style={getButtonStyle(tab as Tab)}
                            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab ? '' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                        >
                            {tab === 'pmu' && 'Program Mgt. Unit'}
                            {tab === 'consortia' && 'Consortia Resources'}
                            {tab === 'useCases' && 'Use Cases'}
                            {tab === 'policies' && 'Continental Policies'}
                            {tab === 'agendas' && 'Global Agendas'}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'pmu' && (
                        <motion.section
                            key="pmu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/*JSON.stringify(data.PMU)}*/}
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                                {data.PMU.map((item) => (
                                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                        <LinkCard
                                            title={item.title}
                                            links={item.links}
                                            colorTheme="green"
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}

                    {activeTab === 'consortia' && (
                        <motion.section
                            key="consortia"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ConsortiaTabs colorTheme="burgundy" />
                        </motion.section>
                    )}

                    {activeTab === 'useCases' && (
                        <motion.section
                            key="useCases"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                                {data.use_cases.map((item) => (
                                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                        <LinkCard
                                            title={item.title}
                                            links={item.links}
                                            colorTheme="green"
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}

                    {activeTab === 'policies' && (
                        <motion.section
                            key="policies"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                                {data.continental_policies.map((item) => (
                                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                        <LinkCard 
                                            title={item.title} 
                                            links={item.links} 
                                            colorTheme="green"
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}

                    {activeTab === 'agendas' && (
                        <motion.section
                            key="agendas"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                                {data.global_agendas.map((item) => (
                                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                        <LinkCard 
                                            title={item.title} 
                                            links={item.links} 
                                            colorTheme="gold"
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
