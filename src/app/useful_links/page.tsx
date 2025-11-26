"use client";

import React, { useState } from 'react';
import usefulLinksData from '@/data/general_useful_links.json';
import { LinkCard, LinkItem } from '@/components/useful_links/LinkCard';
import { ConsortiaTabs } from '@/components/useful_links/ConsortiaTabs';

type PolicyItem = {
    id: number;
    title: string;
    links: LinkItem[];
};

type UsefulLinksData = {
    continental_policies: PolicyItem[];
    global_agendas: PolicyItem[];
};

// Cast the imported JSON to the type
const data = usefulLinksData as UsefulLinksData;

type Tab = 'policies' | 'agendas' | 'consortia';

export default function UsefulLinksPage() {
    const [activeTab, setActiveTab] = useState<Tab>('policies');

    // Theme color map for tabs (policy/agendas/consortia)
    const tabColors: Record<Tab, string> = {
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
                <div className="bg-zinc-100 p-1.5 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('policies')}
                        style={getButtonStyle('policies')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'policies' ? '' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}>
                        Continental Policies
                    </button>

                    <button
                        onClick={() => setActiveTab('agendas')}
                        style={getButtonStyle('agendas')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'agendas' ? '' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}>
                        Global Agendas
                    </button>

                    <button
                        onClick={() => setActiveTab('consortia')}
                        style={getButtonStyle('consortia')}
                        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'consortia' ? '' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}>
                        Consortia Resources
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 min-h-[400px]">
                {activeTab === 'policies' && (
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.continental_policies.map((item) => (
                                <LinkCard 
                                    key={item.id} 
                                    title={item.title} 
                                    links={item.links} 
                                    colorTheme="green"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'agendas' && (
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.global_agendas.map((item) => (
                                <LinkCard 
                                    key={item.id} 
                                    title={item.title} 
                                    links={item.links} 
                                    colorTheme="gold"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'consortia' && (
                    <section>
                        <ConsortiaTabs colorTheme="burgundy" />
                    </section>
                )}
            </div>
        </div>
    );
}
