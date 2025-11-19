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
    <div className="bg-white p-6 rounded-xl border border-zinc-200 h-full flex flex-col">
      <div className="flex items-start gap-4">
        <div>
          {/* Use same style as previous details view: 160x160 image with w-40 h-40 */}
          <Image src={imgSrc} alt={`${consortium.name ?? 'consortium'} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2" unoptimized />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900">{consortium.project_title ?? consortium.name} {consortium.acronym ? `(${consortium.acronym})` : ''}</h3>
          <p className="mt-1 text-sm text-zinc-600">{consortium.coordinator?.name ?? consortium.leadInstitution ?? ''} {consortium.coordinator?.city ? `, ${consortium.coordinator.city}` : ''} {consortium.coordinator?.country ? `— ${consortium.coordinator.country}` : consortium.leadCountry ? `— ${consortium.leadCountry}` : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex items-center gap-2 border-b border-zinc-100">
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)} className={`px-3 py-2 -mb-[1px] ${active === t ? 'border-b-2 border-teal-600 text-teal-700' : 'text-zinc-600 hover:text-zinc-800'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {active === 'Metrics' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-50 p-4 rounded">
                <div className="text-sm text-zinc-500">Partners</div>
                <div className="text-2xl font-semibold text-zinc-900">{partnerCount}</div>
              </div>
              <div className="bg-zinc-50 p-4 rounded">
                <div className="text-sm text-zinc-500">Budget (EUR)</div>
                <div className="text-2xl font-semibold text-zinc-900">{totalBudget ? formatCurrencyEUR(totalBudget) : '—'}</div>
              </div>
              <div className="bg-zinc-50 p-4 rounded">
                <div className="text-sm text-zinc-500">Period</div>
                <div className="text-2xl font-semibold text-zinc-900">{periodMonths ? formatPeriod(periodMonths) : '—'}</div>
              </div>
              <div className="sm:col-span-3 mt-2">
                <div className="text-sm text-zinc-500">Locations</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {locations.length > 0 ? locations.map((loc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-accent-50 text-accent-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-accent-700">
                        <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="max-w-xs truncate">{String(loc)}</span>
                    </span>
                  )) : (
                    <div className="text-sm text-zinc-500">—</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {active === 'Overview' && (
            <div className="text-sm text-zinc-700">
              {consortium.description ? (
                <div className="whitespace-pre-line">{consortium.description}</div>
              ) : (
                <div className="text-zinc-500">—</div>
              )}

              {Array.isArray(consortium.programme_priorities) && consortium.programme_priorities.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Programme priorities</h4>
                  <ul className="list-disc pl-5 mt-2">
                    {consortium.programme_priorities.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              ) : null}

              {Array.isArray(consortium.services) && consortium.services.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Services</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {consortium.services.map((s, i) => <span key={i} className="px-2 py-1 bg-accent-50 rounded text-sm">{s}</span>)}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {active === 'Partners' && (
            <div>
              <div className="mb-2 text-sm text-zinc-500">Total partners: <strong>{partnerCount}</strong></div>
              <div className="overflow-auto hide-scrollbar max-h-72 border rounded">
                <DataTable columns={memberColumns} rows={memberRows} compact />
              </div>
            </div>
          )}

          {active === 'Documents' && (
            <div>
              {documents.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-zinc-700">
                  {documents.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              ) : (
                <div className="text-sm text-zinc-500">—</div>
              )}
            </div>
          )}

          {active === 'Contacts' && (
            <div>
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((c: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-700">{String(c.name ?? '').split(/\s+/).map((p:any)=>p[0]).slice(0,2).join('').toUpperCase() || 'CP'}</div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{c.name ?? '\u2014'} {c.role ? `— ${c.role}` : ''}</div>
                        {c.email ? <div className="text-xs text-zinc-500"><a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a></div> : null}
                      </div>
                    </div>
                  ))}
                </div>
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
