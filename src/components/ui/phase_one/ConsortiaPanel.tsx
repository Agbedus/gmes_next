'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DataTable from '../phase_two/DataTable';
import MapModal from '../MapModal';

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

function ConsortiaTab({ name, acronym, logo, active, onClick, onOpenMap }: { name: string; acronym?: string; logo?: string; active: boolean; onClick: () => void; onOpenMap?: (e: React.MouseEvent) => void }) {
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

  return (
    <button
      onClick={onClick}
      className={`relative flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
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

      <div className="ml-2 flex items-center">
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenMap) onOpenMap(e as React.MouseEvent);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              if (onOpenMap) onOpenMap(e as unknown as React.MouseEvent);
            }
          }}
          title="View countries on map"
          className="p-2 rounded-md hover:bg-zinc-100 text-zinc-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </span>
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

const COUNTRY_NAME_MAP: Record<string, string> = {
  "DRC": "Democratic Republic of the Congo",
  "Congo": "Republic of Congo",
  "Burkina-Faso": "Burkina Faso",
  "Burkina Faso": "Burkina Faso",
  "CAR": "Central African Republic",
  "Congo (Lead)": "Republic of Congo",
  "Tanzania": "United Republic of Tanzania",
  "Ivory Coast": "Ivory Coast",
  "Gambia": "The Gambia",
  "The Gambia": "The Gambia",
  "South Africa (Lead)": "South Africa",
  "Republic of Congo": "Congo",
  "Democratic Republic of the Congo": "Democratic Republic of the Congo",
  "Equatorial Guinea": "Equatorial Guinea",
  "Cote d'Ivoire": "Ivory Coast",
  "Somalia": "Somalia",
  "South Sudan": "South Sudan",
  "Guinea": "Guinea",
  "Mauritania": "Mauritania",
  "Madagascar": "Madagascar",
  "Mozambique": "Mozambique",
  "Namibia": "Namibia",
  "Botswana": "Botswana",
  "Zimbabwe": "Zimbabwe",
  "Zambia": "Zambia",
  "Cameroon": "Cameroon",
  "Gabon": "Gabon",
  "Burundi": "Burundi",
  "Tunisia": "Tunisia",
  "Morocco": "Morocco",
  "Egypt": "Egypt",
  "Libya": "Libya",
  "Algeria": "Algeria",
  "Kenya (Lead)": "Kenya",
  "Kenya": "Kenya",
  "Rwanda": "Rwanda",
  "Eritrea": "Eritrea",
  "Djibouti": "Djibouti",
  "Comoros": "Comoros",
  "Ethiopia": "Ethiopia",
  "Uganda": "Uganda",
  "Sudan": "Sudan",
  "Senegal": "Senegal",
  "Niger": "Niger",
  "Nigeria": "Nigeria",
  "Ghana": "Ghana",
  "Benin": "Benin",
  "Namibia (Lead)": "Namibia",
};

function normalizeCountryName(name: string): string {
  const cleaned = String(name)
    .replace(/\s*\(Lead\)\s*/i, '')
    .trim();

  return COUNTRY_NAME_MAP[cleaned] || cleaned;
}

export default function ConsortiaPanel({ consortia }: { consortia: Consortium[] }) {
  const [activeConsortium, setActiveConsortium] = useState<string | undefined>(consortia[0]?.acronym);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCountries, setMapCountries] = useState<string[]>([]);

  if (!Array.isArray(consortia) || consortia.length === 0) return null;

  const selectedConsortium = consortia.find((c) => c.acronym === activeConsortium);

  function getCountriesForConsortium(c?: Consortium) {
    if (!c) return [];
    const set = new Set<string>();

    if (c.leadCountry) {
      const normalized = normalizeCountryName(c.leadCountry);
      set.add(normalized);
    }

    if (Array.isArray(c.members)) {
      c.members.forEach((m) => {
        if (m?.country) {
          const normalized = normalizeCountryName(m.country);
          set.add(normalized);
        }
      });
    }

    return Array.from(set).filter(Boolean);
  }

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
                onClick={() => {
                  setActiveConsortium(c.acronym);
                  setMapCountries([]);
                  setMapOpen(false);
                }}
                onOpenMap={() => {
                  const countries = getCountriesForConsortium(c);
                  setMapCountries(countries);
                  setMapOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-9 lg:col-span-9">{selectedConsortium && <ConsortiaDetails consortium={selectedConsortium} />}</div>
      </div>

      <MapModal
        open={mapOpen}
        onCloseAction={() => setMapOpen(false)}
        highlightCountries={mapCountries}
        members={selectedConsortium?.members}
        consortiumName={selectedConsortium?.name}
        consortiumLogo={selectedConsortium?.logo}
        consortiumDescription={selectedConsortium?.description}
        groupsColor={{ West: '#06b6d4', East: '#34d399', North: '#f59e0b', South: '#ef4444', Central: '#a78bfa' }}
        legendItems={[
          { label: 'West', color: '#06b6d4' },
          { label: 'East', color: '#34d399' },
          { label: 'North', color: '#f59e0b' },
          { label: 'South', color: '#ef4444' },
          { label: 'Central', color: '#a78bfa' },
        ]}
      />
    </section>
  );
}
