'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Consortium, Member } from './ConsortiaPanel';
import { formatCurrencyEUR, formatPeriod, sanitizeSrc } from './ConsortiaPanel';
import { motion, AnimatePresence } from "framer-motion";
import IconlyIcon from "../IconlyIcon";

function initialsFrom(name?: string, acronym?: string) {
  if (acronym && acronym.trim()) return acronym.trim().split(/\s+/)[0].slice(0, 2).toUpperCase();
  if (!name) return 'GM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function colorFromString(s?: string) {
  const str = String(s ?? 'gm');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h} 70% 60%)`;
}
function svgInitialsDataUrl(initials: string, bgColor: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='${bgColor}'/><text x='50%' y='50%' dy='.08em' font-family='Inter, Roboto, Arial, sans-serif' font-size='96' fill='white' text-anchor='middle'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const TABS = ['Overview', 'Metrics', 'Partners', 'Contacts'] as const;
type TabKey = typeof TABS[number];

const TAB_STYLES: Record<string, { text: string; bg: string; ring: string }> = {
  Overview: { text: 'text-indigo-700', bg: 'bg-gradient-to-r from-indigo-50 to-white', ring: 'ring-indigo-200' },
  Metrics: { text: 'text-teal-700', bg: 'bg-gradient-to-r from-teal-50 to-white', ring: 'ring-teal-200' },
  Partners: { text: 'text-emerald-700', bg: 'bg-gradient-to-r from-emerald-50 to-white', ring: 'ring-emerald-200' },
  Contacts: { text: 'text-rose-700', bg: 'bg-gradient-to-r from-rose-50 to-white', ring: 'ring-rose-200' },
};

export default function ConsortiumDetail({ consortium, onOpenMap }: { consortium: Consortium; onOpenMap?: () => void }) {
  const [active, setActive] = useState<TabKey>('Overview');

  // derive metrics
  const hasRawPartners = Array.isArray(consortium.partners) && consortium.partners.length > 0;
  const hasCoordinator = Boolean(consortium.coordinator?.name ?? consortium.leadInstitution);
  const partnerCount = hasRawPartners
    ? (consortium.partners || []).length + (hasCoordinator ? 1 : 0)
    : (Array.isArray(consortium.members) ? consortium.members.length : 0);
  // prefer explicit presence check for total_eur to avoid mixing `??` with logical operators
  const totalBudget = (consortium.budget && (consortium.budget.total_eur !== undefined && consortium.budget.total_eur !== null)) ? consortium.budget.total_eur : undefined;
  const periodMonths = consortium.period_months ?? undefined;
  const locations = Array.isArray(consortium.locations) ? consortium.locations : [];

  // Partners table rows
  // These variables were related to a DataTable component that is no longer used.

  // Contacts
  const contacts = Array.isArray((consortium as any).contact_persons) ? (consortium as any).contact_persons : [];

  // Useful links: phase_two JSON stores these as an object of keyed values
  // (strings, arrays or null). Normalize into an array of { url, title, description }
  const rawUseful = consortium.useful_links;
  let usefulLinks: any[] = [];
  if (Array.isArray(rawUseful)) {
    // already an array of links (legacy), use as-is
    usefulLinks = rawUseful;
  } else if (rawUseful && typeof rawUseful === 'object') {
    const keyTitleMap: Record<string, string> = {
      Official_Website_Main_Portal: 'Official website',
      Geoportal_Data_Platforms: 'Geoportal / data platform',
      Digital_Learning_Platform_DLP: 'Digital learning platform',
      Blogs_Social_Media_Presence: 'Blogs / social',
      Innovative_Applications_Tools: 'Innovative applications',
    };
    usefulLinks = [];
    Object.entries(rawUseful).forEach(([k, v]) => {
      const baseTitle = keyTitleMap[k] ?? k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(v)) {
        v.forEach((u: any, i: number) => {
          if (!u) return;
          usefulLinks.push({ url: String(u).trim(), title: v.length > 1 ? `${baseTitle} ${i + 1}` : baseTitle, description: '' });
        });
      } else if (v) {
        usefulLinks.push({ url: String(v).trim(), title: baseTitle, description: '' });
      }
    });
  } else {
    usefulLinks = [];
  }

  const rawLogo = consortium.logo ? String(consortium.logo).replace(/\s+/g, ' ').trim() : undefined;
  const preferredLogo = rawLogo && rawLogo.startsWith('http://') ? rawLogo.replace('http://', 'https://') : rawLogo;
  const initials = initialsFrom(consortium.name ?? consortium.project_title, consortium.acronym);
  const bg = colorFromString(consortium.name ?? consortium.acronym);
  const svgUrl = svgInitialsDataUrl(initials, bg);
  const imgSrc = preferredLogo ?? svgUrl;

  return (
    <div className="bg-white p-6 rounded-[24px] border border-zinc-200 h-full flex flex-col shadow-sm">
      <div className="flex items-start gap-4">
        <div>
          {/* Use same style as previous details view: 160x160 image with w-40 h-40 */}
          <Image src={imgSrc} alt={`${consortium.name ?? 'consortium'} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2 ring-1 ring-zinc-100" unoptimized />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-zinc-900">{consortium.project_title ?? consortium.name} {consortium.acronym ? `(${consortium.acronym})` : ''}</h3>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                title="View countries on map"
                className="p-2 rounded-md hover:bg-zinc-100 text-zinc-500 flex items-center justify-center transition-colors"
              >
                <IconlyIcon name="map" size={18} color="#6b7280" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">{consortium.coordinator?.name ?? consortium.leadInstitution ?? ''} {consortium.coordinator?.city ? `, ${consortium.coordinator.city}` : ''} {consortium.coordinator?.country ? `— ${consortium.coordinator.country}` : consortium.leadCountry ? `— ${consortium.leadCountry}` : ''}</p>

          <div className="mt-3 flex items-center gap-3">
            {consortium.sector ? <span className="text-xs px-2 py-1 rounded-md bg-zinc-50 text-zinc-700">{consortium.sector}</span> : null}
            {Array.isArray(consortium.programme_priorities) && consortium.programme_priorities.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {consortium.programme_priorities.slice(0,3).map((p, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-zinc-50 text-zinc-700">{p}</span>
                ))}
                {consortium.programme_priorities.length > 3 ? <span className="text-xs text-zinc-500">+{consortium.programme_priorities.length - 3}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>





      {/* Tabs */}
      <div className="mt-6">
        <div role="tablist" aria-label="Consortium sections" className="flex items-center gap-2">
          {TABS.map(t => {
            const activeStyle = active === t ? TAB_STYLES[t].text + ' ' + TAB_STYLES[t].bg + ' shadow-sm' : 'text-zinc-600 bg-white hover:bg-zinc-50';
            return (
              <button
                role="tab"
                aria-selected={active === t}
                key={t}
                onClick={() => setActive(t)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${activeStyle} focus:outline-none focus:ring-2 ${active ? 'focus:ring-offset-1' : ''}`}
              >
                {/* small icons per tab */}
                {t === 'Overview' && <IconlyIcon name="Discovery" size={16} color="currentColor" />}
                {t === 'Metrics' && <IconlyIcon name="Chart" size={16} color="currentColor" />}
                {t === 'Partners' && <IconlyIcon name="People" size={16} color="currentColor" />}
                {t === 'Contacts' && <IconlyIcon name="User" size={16} color="currentColor" />}
                <span className={active === t ? '' : 'text-zinc-700'}>{t}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {active === 'Overview' && (
                <div className="text-sm text-zinc-700 space-y-6">
                  <div className="p-4 rounded-[24px] bg-gradient-to-r from-indigo-50 to-white border border-indigo-100">
                    {consortium.description ? (
                      <div className="whitespace-pre-line">{consortium.description}</div>
                    ) : (
                      <div className="text-zinc-500">—</div>
                    )}
                  </div>

                  {/* Rationale & Focus */}
                  {(consortium.rationale?.length || consortium.focus?.length) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {consortium.rationale && consortium.rationale.length > 0 && (
                        <div className="p-4 rounded-[24px] bg-white border shadow-sm h-full">
                          <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <IconlyIcon name="InfoCircle" size={16} color="#6366f1" />
                            Rationale
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-sm">
                            {consortium.rationale.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                      {consortium.focus && consortium.focus.length > 0 && (
                        <div className="p-4 rounded-[24px] bg-white border shadow-sm h-full">
                          <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <IconlyIcon name="Category" size={16} color="#6366f1" />
                            Focus Areas
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-sm">
                            {consortium.focus.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Challenges */}
                  {consortium.challenges && consortium.challenges.length > 0 && (
                    <div className="p-4 rounded-[24px] bg-amber-50 border border-amber-100">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <IconlyIcon name="Danger" size={16} color="#d97706" />
                        Key Challenges
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-amber-800 text-sm">
                        {consortium.challenges.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Impacts & Outcomes */}
                  {(consortium.impacts?.length || consortium.outcomes?.length) ? (
                    <div className="space-y-4">
                      {consortium.impacts && consortium.impacts.length > 0 && (
                        <div className="p-4 rounded-[24px] bg-teal-50 border border-teal-100">
                          <h4 className="text-sm font-semibold text-teal-900 mb-2 flex items-center gap-2">
                            <IconlyIcon name="TickSquare" size={16} color="#0d9488" />
                            Expected Impacts
                          </h4>
                          <ul className="list-disc pl-4 space-y-1 text-teal-800 text-sm">
                            {consortium.impacts.map((imp, i) => <li key={i}>{imp}</li>)}
                          </ul>
                        </div>
                      )}

                      {consortium.outcomes && consortium.outcomes.length > 0 && (
                        <div className="p-4 rounded-[24px] bg-white border shadow-sm">
                          <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                            <IconlyIcon name="Document" size={16} color="#71717a" />
                            Outcomes & Services
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {consortium.outcomes.map((out, i) => (
                              <div key={i} className="bg-zinc-50 p-3 rounded-[24px] border border-zinc-100">
                                <div className="text-sm text-zinc-800">{out.description}</div>
                                {out.service && (
                                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                                    Service: {out.service}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Keywords */}
                  {consortium.keywords && consortium.keywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {consortium.keywords.map((k, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs border border-zinc-200">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Priorities & Services */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                    {Array.isArray(consortium.programme_priorities) && consortium.programme_priorities.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 mb-2">Programme priorities</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-zinc-600">
                          {consortium.programme_priorities.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(consortium.services) && consortium.services.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {consortium.services.map((s, i) => <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-sm border border-teal-100">{s}</span>)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {active === 'Metrics' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Metrics cards with colorful accents */}
                    <div className="p-4 rounded-[24px] bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md bg-au-dark-green text-au-gold">
                        <IconlyIcon name="groups" size={24} color="currentColor" />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Partners</div>
                        <div className="text-lg font-semibold text-zinc-900">{partnerCount}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-[24px] bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md bg-au-dark-green text-au-gold">
                        <IconlyIcon name="account_balance" size={24} color="currentColor" />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Budget (EUR)</div>
                        <div className="text-lg font-semibold text-zinc-900">{totalBudget ? formatCurrencyEUR(totalBudget) : '—'}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-[24px] bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md bg-au-dark-green text-au-gold">
                        <IconlyIcon name="schedule" size={24} color="currentColor" />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Period</div>
                        <div className="text-lg font-semibold text-zinc-900">{periodMonths ? formatPeriod(periodMonths) : '—'}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-[24px] bg-white shadow-sm border border-zinc-100 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md bg-au-dark-green text-au-gold">
                        <IconlyIcon name="location_on" size={24} color="currentColor" />
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500">Locations</div>
                          <div className="text-lg font-semibold text-zinc-900">{locations.length}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="flex flex-wrap w-full gap-2 mt-12">
                        {locations.length > 0 ? locations.map((loc, idx) => (
                            <span key={idx}
                                  className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full badge-au-dark-green shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                               aria-hidden className="text-zinc-600">
                            <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span className="max-w-[10rem] truncate">{String(loc)}</span>
                        </span>
                        )) : (
                            <div className="text-sm text-zinc-500">—</div>
                        )}
                      </div>
                    </div>
                  </div>
              )}

              {active === 'Partners' && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="text-sm text-zinc-500">Total partners: <strong className="text-zinc-800">{partnerCount}</strong></div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {consortium.members?.map((m, i) => {
                      const hasLogo = m.logo && m.logo.trim().length > 0;
                      const logoSrc = hasLogo ? m.logo : undefined;
                      const safeLogo = sanitizeSrc(logoSrc);
                      const initials = m.name ? m.name.slice(0, 2).toUpperCase() : 'PT';
                      
                      return (
                        <div key={i} className="group flex flex-col items-center text-center p-4 rounded-[24px] bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:border-indigo-100">
                          <div className="w-16 h-16 mb-3 rounded-full bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100 group-hover:scale-105 transition-transform">
                            {safeLogo ? (
                              <Image 
                                src={safeLogo} 
                                alt={m.name || 'Partner'} 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-contain p-2"
                                unoptimized
                              />
                            ) : (
                              <div className="text-zinc-400 font-semibold text-lg">{initials}</div>
                            )}
                          </div>
                          <div className="w-full">
                            <div className="text-xs font-medium text-zinc-900 line-clamp-2 leading-tight mb-1" title={m.name}>
                              {m.name}
                            </div>
                            {m.country && (
                              <div className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium px-1.5 py-0.5 rounded bg-zinc-50 inline-block">
                                {m.country}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {active === 'Contacts' && (
                <div className="space-y-3">
                  {contacts.length > 0 ? (
                    contacts.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-[24px] bg-white border shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-700">{String(c.name ?? '').split(/\s+/).map((p:any)=>p[0]).slice(0,2).join('').toUpperCase() || 'CP'}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-900">{c.name ?? '\u2014'} {c.role ? <span className="text-zinc-500">— {c.role}</span> : null}</div>
                          {c.email ? <div className="text-xs text-zinc-500 mt-1"><a href={`mailto:${c.email}`} className="text-teal-600 hover:underline">{c.email}</a></div> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-500">—</div>
                  )}

                  {/* Useful links from consortium.useful_links */}
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-zinc-800 mb-2">Useful links</h4>
                    {usefulLinks.length > 0 ? (
                      <div className="space-y-2">
                        {usefulLinks.map((l, idx) => {
                          const url = String(l?.url ?? l?.href ?? l?.link ?? l?.uri ?? '').trim();
                          // Parenthesize the nullish coalesce results when mixing with ||
                          const title = String((l?.title ?? l?.name ?? l?.label ?? url) || 'Link');
                          const desc = String(l?.description ?? l?.summary ?? '');

                          // choose icon by url heuristics
                          let icon: React.ReactNode = (
                            <svg className="w-5 h-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M10 14l2-2 2 2" />
                              <path d="M12 12v6" />
                              <path d="M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0z" />
                            </svg>
                          );
                          try {
                            if (url) {
                              const host = new URL(url).hostname.toLowerCase();
                              if (host.includes('github.com')) {
                                // github icon
                                icon = (
                                  <svg className="w-5 h-5 text-zinc-700" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.89.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.09 11.09 0 0 1 2.92-.39c.99 0 1.98.13 2.92.39 2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.77.12 3.06.75.81 1.19 1.84 1.19 3.1 0 4.44-2.71 5.4-5.29 5.68.42.36.8 1.08.8 2.18 0 1.58-.01 2.86-.01 3.25 0 .31.21.68.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                                  </svg>
                                );
                              } else if (url.toLowerCase().endsWith('.pdf')) {
                                icon = (
                                  <svg className="w-5 h-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M10 12h4" />
                                    <path d="M10 16h4" />
                                  </svg>
                                );
                              } else {
                                // generic external link icon
                                icon = (
                                  <svg className="w-5 h-5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <path d="M15 3h6v6" />
                                    <path d="M10 14L21 3" />
                                  </svg>
                                );
                              }
                            }
                          } catch (e) {
                            // ignore URL parse errors and fall back to generic icon
                          }

                          return (
                            <div key={idx} className="p-3 rounded-[24px] bg-white border shadow-sm flex items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-md bg-zinc-50 flex items-center justify-center">{icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-zinc-900 truncate">{title}</div>
                                  {desc ? <div className="text-xs text-zinc-500 mt-1 truncate">{desc}</div> : null}
                                  {url ? <div className="text-xs text-zinc-400 mt-1 truncate">{url}</div> : null}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {url ? (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-600 text-white text-sm hover:bg-teal-700 transition">
                                    Open
                                    <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                      <path d="M15 3h6v6" />
                                      <path d="M10 14L21 3" />
                                    </svg>
                                  </a>
                                ) : (
                                  <button disabled className="px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-400 text-sm">No link</button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500">—</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
