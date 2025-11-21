'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import DataTable from './DataTable';
import type { Consortium, Member } from './ConsortiaPanel';
import { formatCurrencyEUR, formatPeriod, sanitizeSrc } from './ConsortiaPanel';

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

const TABS = ['Metrics', 'Overview', 'Partners', 'Documents', 'Contacts'] as const;
type TabKey = typeof TABS[number];

const TAB_STYLES: Record<string, { text: string; bg: string; ring: string }> = {
  Metrics: { text: 'text-teal-700', bg: 'bg-gradient-to-r from-teal-50 to-white', ring: 'ring-teal-200' },
  Overview: { text: 'text-indigo-700', bg: 'bg-gradient-to-r from-indigo-50 to-white', ring: 'ring-indigo-200' },
  Partners: { text: 'text-emerald-700', bg: 'bg-gradient-to-r from-emerald-50 to-white', ring: 'ring-emerald-200' },
  Documents: { text: 'text-amber-700', bg: 'bg-gradient-to-r from-amber-50 to-white', ring: 'ring-amber-200' },
  Contacts: { text: 'text-rose-700', bg: 'bg-gradient-to-r from-rose-50 to-white', ring: 'ring-rose-200' },
};

export default function ConsortiumDetail({ consortium }: { consortium: Consortium }) {
  const [active, setActive] = useState<TabKey>('Metrics');

  // derive metrics
  const partnerCount = Array.isArray(consortium.members) ? consortium.members.length : (Array.isArray(consortium.partners) ? consortium.partners.length : 0);
  const totalBudget = (consortium.budget && (consortium.budget.total_eur ?? consortium.budget.total_eur === 0)) ? consortium.budget.total_eur : undefined;
  const periodMonths = consortium.period_months ?? undefined;
  const locations = Array.isArray(consortium.locations) ? consortium.locations : [];

  // Partners table rows
  const memberColumns = [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
  ];
  const memberRows = Array.isArray(consortium.members)
    ? consortium.members.map((m: Member) => ({
        name: m.name ?? '\u2014',
        country: m.country ?? '\u2014',
      }))
    : [];

  // Documents / outputs
  const documents = Array.isArray(consortium.outputs) ? consortium.outputs : [];

  // Contacts
  const contacts = Array.isArray((consortium as any).contact_persons) ? (consortium as any).contact_persons : [];

  const rawLogo = consortium.logo ? String(consortium.logo).replace(/\s+/g, ' ').trim() : undefined;
  const preferredLogo = rawLogo && rawLogo.startsWith('http://') ? rawLogo.replace('http://', 'https://') : rawLogo;
  const initials = initialsFrom(consortium.name ?? consortium.project_title, consortium.acronym);
  const bg = colorFromString(consortium.name ?? consortium.acronym);
  const svgUrl = svgInitialsDataUrl(initials, bg);
  const imgSrc = preferredLogo ?? svgUrl;

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 h-full flex flex-col shadow-sm">
      <div className="flex items-start gap-4">
        <div>
          {/* Use same style as previous details view: 160x160 image with w-40 h-40 */}
          <Image src={imgSrc} alt={`${consortium.name ?? 'consortium'} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2 ring-1 ring-zinc-100" unoptimized />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900">{consortium.project_title ?? consortium.name} {consortium.acronym ? `(${consortium.acronym})` : ''}</h3>
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
                {t === 'Metrics' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M9 17V9" /><path d="M13 17V5" /><path d="M17 17v-3" /></svg>
                )}
                {t === 'Overview' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7 7 0 0 0 0-6"/></svg>
                )}
                {t === 'Partners' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                )}
                {t === 'Documents' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                )}
                {t === 'Contacts' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4"/><path d="M7 20h10"/><circle cx="12" cy="7" r="4"/></svg>
                )}
                <span className={active === t ? '' : 'text-zinc-700'}>{t}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {active === 'Metrics' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Metrics cards with colorful accents */}
              <div className="p-4 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-300 text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M9 17V9" /><path d="M13 17V5" /><path d="M17 17v-3" /></svg>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Partners</div>
                  <div className="text-lg font-semibold text-zinc-900">{partnerCount}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-300 text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"/><path d="M3 6h18"/></svg>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Budget (EUR)</div>
                  <div className="text-lg font-semibold text-zinc-900">{totalBudget ? formatCurrencyEUR(totalBudget) : '—'}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-300 text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Period</div>
                  <div className="text-lg font-semibold text-zinc-900">{periodMonths ? formatPeriod(periodMonths) : '—'}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white shadow-sm border border-zinc-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-300 text-white shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">Locations</div>
                    <div className="text-lg font-semibold text-zinc-900">{locations.length}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.length > 0 ? locations.map((loc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-accent-50 text-accent-700 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-zinc-600">
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

          {active === 'Overview' && (
            <div className="text-sm text-zinc-700 space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-white border border-indigo-100">
                {consortium.description ? (
                  <div className="whitespace-pre-line">{consortium.description}</div>
                ) : (
                  <div className="text-zinc-500">—</div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.isArray(consortium.programme_priorities) && consortium.programme_priorities.length > 0 ? (
                  <div className="p-4 rounded-lg bg-white border shadow-sm">
                    <h4 className="text-sm font-semibold">Programme priorities</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-zinc-700">
                      {consortium.programme_priorities.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                ) : null}

                {Array.isArray(consortium.services) && consortium.services.length > 0 ? (
                  <div className="p-4 rounded-lg bg-white border shadow-sm">
                    <h4 className="text-sm font-semibold">Services</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {consortium.services.map((s, i) => <span key={i} className="px-2 py-1 bg-accent-50 rounded text-sm">{s}</span>)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {active === 'Partners' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-zinc-500">Total partners: <strong className="text-zinc-800">{partnerCount}</strong></div>
              </div>
              <div className="overflow-auto hide-scrollbar max-h-72 border rounded shadow-sm">
                <DataTable columns={memberColumns} rows={memberRows} compact />
              </div>
            </div>
          )}

          {active === 'Documents' && (
            <div className="space-y-3">
              {documents.length > 0 ? (
                documents.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white border shadow-sm flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center text-amber-700">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    </div>
                    <div className="text-sm text-zinc-700">{d}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500">—</div>
              )}
            </div>
          )}

          {active === 'Contacts' && (
            <div className="space-y-3">
              {contacts.length > 0 ? (
                contacts.map((c: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-white border shadow-sm flex items-start gap-3">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
