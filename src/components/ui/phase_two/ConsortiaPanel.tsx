'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DataTable from './DataTable';

type Member = { name?: string; country?: string };
type DigitalPlatforms = Record<string, unknown> | undefined;

type Consortium = {
  name: string;
  acronym?: string;
  logo?: string;
  leadInstitution?: string;
  leadCountry?: string;
  region?: string;
  description?: string;
  services?: string[];
  members?: Member[];
  digitalPlatforms?: DigitalPlatforms;
};

const LOGO_FALLBACK = '/file.svg';

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
  const h = Math.abs(hash) % 360; // hue
  return `hsl(${h} 70% 60%)`;
}

function svgInitialsDataUrl(initials: string, bgColor: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='${bgColor}'/><text x='50%' y='50%' dy='.08em' font-family='Inter, Roboto, Arial, sans-serif' font-size='96' fill='white' text-anchor='middle'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function ConsortiaTab({ name, acronym, logo, active, onClick }: { name: string; acronym?: string; logo?: string; active: boolean; onClick: () => void }) {
  const preferredLogo = logo && logo.startsWith('http://') ? logo.replace('http://', 'https://') : logo;
  const [fallbackSrc, setFallbackSrc] = useState<string | undefined>(undefined);
  const initials = initialsFrom(name, acronym);
  const bg = colorFromString(name ?? acronym);
  const svgUrl = svgInitialsDataUrl(initials, bg);

  const preferred = preferredLogo ?? svgUrl;
  const imgSrc = fallbackSrc ?? preferred;

  useEffect(() => {
    // reset any previous fallback when the preferred src changes
    if (fallbackSrc !== undefined) setFallbackSrc(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferred]);

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        active ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'text-zinc-700 hover:bg-zinc-50'
      }`}>
      <div className="flex-shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={`${name} logo`}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-contain bg-white p-1"
            unoptimized
            onError={(e) => {
              const target = (e?.target as HTMLImageElement | null);
              if (target) {
                if (target.src !== svgUrl) {
                  setFallbackSrc(svgUrl);
                } else {
                  setFallbackSrc(LOGO_FALLBACK);
                }
              }
            }}
          />
        ) : (
          <Image src={svgUrl} alt={`${initials} logo`} width={32} height={32} className="w-8 h-8 rounded-md object-contain bg-white p-1" unoptimized />
        )}
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold text-zinc-900">{acronym}</div>
        <div className="text-xs font-normal text-zinc-500">{name}</div>
      </div>
    </button>
  );
}

function ConsortiaDetails({ consortium }: { consortium: Consortium }) {
  const { name, acronym, logo, leadInstitution, leadCountry, region, description, services, members, digitalPlatforms } = consortium;
  const preferredLogo = logo && logo.startsWith('http://') ? logo.replace('http://', 'https://') : logo;
  const [fallbackSrc, setFallbackSrc] = useState<string | undefined>(undefined);
  const initials = initialsFrom(name, acronym);
  const bg = colorFromString(name ?? acronym);
  const svgUrl = svgInitialsDataUrl(initials, bg);

  const preferred = preferredLogo ?? svgUrl;
  const imgSrc = fallbackSrc ?? preferred;

  useEffect(() => {
    if (fallbackSrc !== undefined) setFallbackSrc(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferred]);

  const memberColumns = [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
  ];

  const memberRows = Array.isArray(members)
    ? members.map((m) => {
        const initialsInner = String(m.name ?? '').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'NM';
        return {
          name: (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-700">{initialsInner}</div>
              <div className="text-sm font-medium text-zinc-900">{m.name ?? '\u2014'}</div>
            </div>
          ),
          country: m.country ?? '\u2014',
        } as Record<string, React.ReactNode>;
      })
    : [];

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 h-full flex flex-col">
      <div className="flex items-start gap-4">
        <div>
          {imgSrc ? (
            <a href={logo ?? imgSrc} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Image src={imgSrc} alt={`${name} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2" unoptimized onError={(e)=>{
                const target = (e?.target as HTMLImageElement | null);
                if (target) {
                  if (target.src !== svgUrl) {
                    setFallbackSrc(svgUrl);
                  } else {
                    setFallbackSrc(LOGO_FALLBACK);
                  }
                }
              }} />
            </a>
          ) : (
            <Image src={svgUrl} alt={`${initials} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2" unoptimized />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900">{name} {acronym ? `(${acronym})` : ''}</h3>
          <p className="mt-1 text-sm text-zinc-600">{leadInstitution ?? ''} {leadCountry ? `— ${leadCountry}` : ''} {region ? `— ${region}` : ''}</p>
        </div>
      </div>

      {description ? <p className="mt-4 text-sm text-zinc-700">{description}</p> : null}

      <div className="mt-6 flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <h4 className="text-sm font-semibold text-zinc-800">Services</h4>

          <div className="mt-3 border border-transparent rounded-lg overflow-hidden">
            {Array.isArray(services) && services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-4 px-3 py-1 text-sm rounded-full bg-accent-50 text-accent-700 max-w-full">
                    <span className="material-symbols-outlined text-teal-600 text-[10px] leading-none" aria-hidden>fiber_manual_record</span>
                    <span className="truncate block max-w-xs">{s}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-500">—</div>
            )}

            <div className="mt-6 flex-1">
              <h4 className="text-sm font-semibold text-zinc-800">Members</h4>
              <div className="mt-3 overflow-auto hide-scrollbar max-h-64">
                <DataTable columns={memberColumns} rows={memberRows} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      {digitalPlatforms ? (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-zinc-800">Digital Platforms</h4>
          <div className="mt-2 text-sm text-zinc-700 space-y-2 bg-zinc-50 p-4 rounded-lg">
            {Object.entries(digitalPlatforms).map(([k, v]) => (
              <div key={k} className="capitalize">
                <strong className="font-medium">{k.replace(/([A-Z])/g, ' $1')}:</strong>
                {Array.isArray(v) ? (
                  <span className="ml-2">{(v as unknown[]).map(x => {
                    if (typeof x === 'object' && x !== null) {
                      const obj = x as Record<string, unknown>;
                      return String(obj['name'] ?? obj['url'] ?? JSON.stringify(obj));
                    }
                    return String(x);
                  }).join(', ')}</span>
                ) : (
                  <a href={String(v)} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">{String(v)}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ConsortiaPanel({ consortia }: { consortia: Consortium[] }) {
  const [activeConsortium, setActiveConsortium] = useState<string | undefined>(consortia[0]?.acronym);

  if (!Array.isArray(consortia) || consortia.length === 0) return null;

  const selectedConsortium = consortia.find((c) => c.acronym === activeConsortium);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-zinc-900">Consortia</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 lg:col-span-3">
          <div className="space-y-2">
            {consortia.map((c) => (
              <ConsortiaTab
                key={c.acronym ?? c.name}
                name={c.name}
                acronym={c.acronym}
                logo={c.logo}
                active={activeConsortium === c.acronym}
                onClick={() => setActiveConsortium(c.acronym)}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-9 lg:col-span-9">{selectedConsortium && <ConsortiaDetails consortium={selectedConsortium} />}</div>
      </div>
    </section>
  );
}
