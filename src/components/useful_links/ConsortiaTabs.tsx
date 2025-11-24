"use client";

import React, { useState, useMemo } from 'react';
import phaseTwoData from '@/data/phase_two_data.json';
import { LinkCard, LinkItem } from './LinkCard';

type ConsortiumData = typeof phaseTwoData.gmesAndAfricaPhase2.consortia[0];

export function ConsortiaTabs() {
    const [activeTab, setActiveTab] = useState<string>("");

    // Process and memoize the consortia data
    const consortia = useMemo(() => {
        const processed = phaseTwoData.gmesAndAfricaPhase2.consortia.map((c) => {
            const name = getConsortiumName(c);
            const links: LinkItem[] = [];
            const rawLinks = c.consortium.useful_links;
            
            // Extract logo
            let logo: string | undefined = undefined;
            if (c.images && Array.isArray(c.images.logos) && c.images.logos.length > 0) {
                const l = c.images.logos[0];
                logo = l.path ?? l.url ?? undefined;
            }

            if (rawLinks) {
                Object.entries(rawLinks).forEach(([key, value]) => {
                    if (!value) return;

                    const cleanKey = key.replace(/_/g, ' ');
                    const type = key.toLowerCase().includes('website') ? 'website' :
                                 key.toLowerCase().includes('geoportal') ? 'geoportal' :
                                 key.toLowerCase().includes('learning') ? 'learning' :
                                 key.toLowerCase().includes('social') ? 'social' : 'link';

                    if (Array.isArray(value)) {
                        value.forEach(url => {
                            links.push({ type, description: cleanKey, url });
                        });
                    } else {
                        links.push({ type, description: cleanKey, url: value as string });
                    }
                });
            }

            return {
                id: name, // Use name as ID for simplicity
                name: name,
                fullTitle: c.project_title,
                logo,
                links
            };
        }).filter(item => item.links.length > 0);

        return processed;
    }, []);

    // Set initial active tab
    React.useEffect(() => {
        if (consortia.length > 0 && !activeTab) {
            setActiveTab(consortia[0].name);
        }
    }, [consortia, activeTab]);

    const activeConsortium = consortia.find(c => c.name === activeTab);

    if (consortia.length === 0) return null;

    return (
        <div className="space-y-6">
            {/* Scrollable Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {consortia.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => setActiveTab(c.name)}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${activeTab === c.name 
                                ? 'bg-purple-600 text-white shadow-md pl-2' 
                                : 'bg-white text-zinc-600 hover:bg-purple-50 hover:text-purple-700 border border-zinc-200 pl-2'}
                        `}
                    >
                        {c.logo && (
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                                <img src={c.logo} alt="" className="w-full h-full object-contain p-0.5" />
                            </div>
                        )}
                        <span>{c.name}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeConsortium && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <LinkCard 
                        title={activeConsortium.fullTitle} 
                        links={activeConsortium.links} 
                        colorTheme="purple" 
                    />
                </div>
            )}
        </div>
    );
}

function getConsortiumName(c: ConsortiumData): string {
    const title = c.project_title;
    const coordinator = c.consortium.coordinator;

    // 1. Try to find acronym in title (e.g., "WeMAST: ...")
    // Looks for a word ending with colon at start, or acronym in parens
    const titleAcronymMatch = title.match(/^([A-Za-z0-9]+):/) || title.match(/\(([A-Za-z0-9]+)\)$/);
    if (titleAcronymMatch) {
        return titleAcronymMatch[1];
    }

    // 2. Try to find acronym in coordinator (e.g., "... (OSS)")
    const coordAcronymMatch = coordinator.match(/\(([A-Za-z0-9\s-]+)\)/);
    if (coordAcronymMatch) {
        return coordAcronymMatch[1];
    }

    // 3. Fallback: First few words of coordinator
    return coordinator.split('(')[0].split(',')[0].trim().substring(0, 15) + '...';
}
