'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DataTable from './DataTable';
import MapModal from '../MapModal';

type Member = { name?: string; country?: string; role?: string };
type DigitalPlatforms = Record<string, unknown> | undefined;

// Extended Consortium type to support both legacy and new phase two schema
type Consortium = {
  // legacy
  name?: string;
  acronym?: string;
  logo?: string;
  leadInstitution?: string;
  leadCountry?: string;
  region?: string;
  description?: string;
  services?: string[];
  members?: Member[];
  digitalPlatforms?: DigitalPlatforms;
  regional_coverage?: any;
  // phase-two fields
  project_title?: string;
  coordinator?: { name?: string; city?: string; country?: string };
  partners?: string[]; // raw partner strings
  period_months?: number;
  budget?: { total_eur?: number; grant_eur?: number; contribution_eur?: number };
  locations?: string[]; // countries
  sector?: string;
  programme_priorities?: string[];
  contact_persons?: Array<{ name?: string; role?: string; email?: string | null }>;
  website?: string[];
  outputs?: string[];
  images?: any;
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

// New helper: sanitize image/anchor srcs so they don't end with spaces or contain control characters
function sanitizeSrc(raw?: string | null | undefined): string | undefined {
  if (!raw && raw !== '') return undefined;
  const s = String(raw ?? '').replace(/\u0000/g, ''); // remove nulls
  // remove control chars and trim whitespace
  const cleaned = s.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned) return undefined;
  // if it's a data: or absolute/relative path, leave as-is; otherwise encode to be safe
  if (cleaned.startsWith('data:') || cleaned.startsWith('/') || cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('mailto:') || cleaned.startsWith('//')) {
    return cleaned;
  }
  try {
    return encodeURI(cleaned);
  } catch {
    return cleaned;
  }
}

// Formatting helpers for budget and period
function formatCurrencyEUR(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '—';
  // remove any characters that are not digits, dot, or minus (single-line regex)
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]+/g, ''));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
}

function formatPeriod(months?: number | null) {
  if (!months && months !== 0) return '—';
  const m = Number(months || 0);
  if (Number.isNaN(m)) return String(months ?? '—');
  const years = Math.floor(m / 12);
  const rem = m % 12;
  if (years > 0 && rem > 0) return `${m} months (${years} yr ${rem} mo)`;
  if (years > 0) return `${m} months (${years} yr${years > 1 ? 's' : ''})`;
  return `${m} months`;
}

// New helper: parse partner strings like "Org (Country)" -> { name, country }
function parsePartnerString(p?: string): Member {
  if (!p) return { name: undefined };
  const m = String(p).trim();
  // try to find last parenthesis with country info
  const parenMatch = m.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const country = parenMatch[1].trim();
    const name = m.slice(0, parenMatch.index).replace(/[,:;]$/,'').trim();
    return { name: name || m, country: country || undefined };
  }
  // try "Name (Country) - extra" or comma-separated
  const commaParts = m.split(',');
  if (commaParts.length > 1) {
    const last = commaParts[commaParts.length - 1].trim();
    // if last looks like a country (short heuristic: single word or contains spaces but no digits)
    if (/^[A-Za-z '\-()]+$/.test(last)) {
      const name = commaParts.slice(0, -1).join(',').trim();
      return { name: name || m, country: last };
    }
  }
  return { name: m };
}

// Normalize both legacy and new schemas into our internal Consortium shape
function normalizeConsortium(raw: any): Consortium {
  if (!raw) return {} as Consortium;

  // New Phase II shape often nests consortium details under `consortium`.
  if (raw.project_title || raw.consortium || raw.coordinator || raw.locations) {
    // prefer nested object when present
    const cons = raw.consortium ?? raw;

    // project/title/acronym
    const name = raw.project_title ?? raw.name ?? raw.acronym ?? cons.project_title ?? '';
    const acronym = raw.acronym ?? cons.acronym ?? undefined;

    // parse coordinator which may be a string like "Org (Acronym), City" or an object
    let coordinator: any = cons.coordinator ?? cons.coordinatorName ?? undefined;
    function parseCoordinatorString(cstr: string) {
      if (!cstr) return undefined;
      // try to split by last comma to separate city/country
      const s = String(cstr).trim();
      // examples: "Observatoire du Sahara et du Sahel (OSS), Tunis"
      // try to capture name and trailing city/country
      const lastComma = s.lastIndexOf(',');
      if (lastComma > -1) {
        const namePart = s.slice(0, lastComma).trim();
        const cityPart = s.slice(lastComma + 1).trim();
        return { name: namePart || s, city: cityPart || undefined };
      }
      // try parentheses for city/country
      const paren = s.match(/\(([^)]+)\)\s*$/);
      if (paren) {
        const maybeAcr = paren[1].trim();
        const namePart = s.slice(0, paren.index).replace(/[,:;]$/,'').trim();
        return { name: namePart || s, city: undefined, acronym: maybeAcr };
      }
      return { name: s };
    }

    if (typeof coordinator === 'string') {
      coordinator = parseCoordinatorString(coordinator);
    }

    // members/partners: prefer explicit partners array
    const partnersRaw: string[] = Array.isArray(cons.partners) ? cons.partners : Array.isArray(cons.partner) ? cons.partner : [];
    const partnersFromStrings: Member[] = partnersRaw.map(parsePartnerString);

    // regional_coverage: extract partners per country
    const regionalMembers: Member[] = [];
    // Also collect countries from regional_coverage to populate locations if present
    const regionalCoverageCountries: string[] = [];
     try {
       if (cons.regional_coverage && typeof cons.regional_coverage === 'object') {
         Object.values(cons.regional_coverage).forEach((regionBlock: any) => {
           if (!regionBlock) return;
           const countries = regionBlock.countries ?? regionBlock.countries_list ?? [];
           countries.forEach((countryEntry: any) => {
             const countryName = countryEntry?.name ?? countryEntry?.country ?? undefined;
             if (countryName) regionalCoverageCountries.push(String(countryName).trim());
             const partnersList = countryEntry?.partners ?? [];
             if (Array.isArray(partnersList)) {
               partnersList.forEach((p: any) => {
                 // partner could be a string or an object {name, logo}
                 if (typeof p === 'string') {
                  const parsed = parsePartnerString(p);
                  regionalMembers.push({ name: parsed.name, country: countryName ?? parsed.country });
                 } else if (p && typeof p === 'object') {
                  const pname = p.name ?? p.partner ?? undefined;
                  regionalMembers.push({ name: String(pname ?? '').trim() || undefined, country: countryName });
                 }
               });
             }
           });
         });
       }
     } catch (e) {
       // ignore malformed regional_coverage
     }

    // if no partners array but regionalMembers exist, use them
    const mergedMembers = [] as Member[];
    const seen = new Set<string>();
    // Prefer the richer regionalMembers (they include country info). If none, fall back to partnersFromStrings.
    const primary = regionalMembers.length > 0 ? regionalMembers : partnersFromStrings;
    const secondary = primary === regionalMembers ? partnersFromStrings : regionalMembers;

    primary.concat(secondary).forEach((m) => {
      const key = (m.name ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (!key) return;
      if (!seen.has(key)) {
        seen.add(key);
        mergedMembers.push({ name: m.name, country: m.country });
      } else {
        // if already seen, fill missing country info from later source
        const idx = mergedMembers.findIndex(mm => (String(mm.name ?? '').toLowerCase().replace(/\s+/g,' ').trim()) === key);
        if (idx > -1 && !mergedMembers[idx].country && m.country) mergedMembers[idx].country = m.country;
      }
    });

    // locations: might be an object mapping region keys to arrays — flatten to a simple list of countries
    // Build locations list from explicit cons.locations AND regional_coverage country entries
    let locationsList: string[] | undefined = undefined;
    const explicitLocations: string[] = [];
    if (cons.locations && typeof cons.locations === 'object' && !Array.isArray(cons.locations)) {
      explicitLocations.push(...Object.values(cons.locations).flatMap((v: any) => (Array.isArray(v) ? v : [])).map((s:any) => String(s).trim()).filter(Boolean));
    } else if (Array.isArray(cons.locations)) {
      explicitLocations.push(...(cons.locations as string[]).map((s:any) => String(s).trim()).filter(Boolean));
    }
    // merge explicitLocations and regionalCoverageCountries
    const mergedLocations = explicitLocations.concat(regionalCoverageCountries || []).filter(Boolean).map((s:any)=>String(s).trim());
    locationsList = mergedLocations.length > 0 ? mergedLocations : undefined;
     // dedupe locations
     if (Array.isArray(locationsList) && locationsList.length > 0) {
       const seenLoc = new Set<string>();
       locationsList = locationsList.map(l => String(l).trim()).filter(l => {
         const key = l.toLowerCase();
         if (seenLoc.has(key)) return false;
         seenLoc.add(key);
         return true;
       });
     }

    // services / priorities
    const services = Array.isArray(cons.programme_priorities) && cons.programme_priorities.length > 0 ? cons.programme_priorities : (cons.services ?? (cons.sector ? [cons.sector] : undefined));

    // budget mapping for new keys
    const budget = (cons.total_budget_eur || cons.total_budget_eur === 0 || cons.grant_eur || cons.contribution_eur)
      ? {
          total_eur: cons.total_budget_eur ?? cons.total_eur ?? undefined,
          grant_eur: cons.grant_eur ?? undefined,
          contribution_eur: cons.contribution_eur ?? undefined,
        }
      : cons.budget ?? undefined;

    // contact persons: prefer contact_persons array, then cons.contact or raw.contact
    let contact_persons = cons.contact_persons ?? cons.contact_persons ?? undefined;
    if (!contact_persons && cons.contact && typeof cons.contact === 'object') {
      contact_persons = [cons.contact];
    }
    if (!contact_persons && raw.contact_persons) contact_persons = raw.contact_persons;

    // images: prefer cons.images
    let images = cons.images ?? raw.images ?? undefined;

    // pick a logo candidate
    let logo: string | undefined = undefined;
    try {
      if (images && Array.isArray(images.logos) && images.logos.length > 0) {
        const l = images.logos[0];
        logo = l.path ?? l.url ?? undefined;
      }
    } catch (e) {
      // ignore
    }

    // description / outputs: join outputs if present as a description fallback
    const description = cons.outputs ? (Array.isArray(cons.outputs) ? cons.outputs.join('\n') : String(cons.outputs)) : (cons.description ?? raw.description);

    return {
      name: name,
      acronym: acronym,
      logo: logo || cons.logo || raw.logo,
      leadInstitution: coordinator?.name ?? cons.leadInstitution ?? raw.leadInstitution ?? undefined,
      leadCountry: coordinator?.country ?? cons.leadCountry ?? raw.leadCountry ?? undefined,
      region: cons.region ?? raw.region ?? undefined,
      description: description,
      services: services,
      members: mergedMembers.length > 0 ? mergedMembers : undefined,
      digitalPlatforms: cons.digitalPlatforms ?? undefined,
      project_title: raw.project_title ?? cons.project_title,
      coordinator: coordinator,
      partners: cons.partners ?? cons.partners_list ?? undefined,
      period_months: cons.period_months ?? cons.period ?? undefined,
      budget: budget,
      locations: locationsList,
      sector: cons.sector ?? undefined,
      programme_priorities: cons.programme_priorities ?? undefined,
      contact_persons: contact_persons,
      website: cons.website ?? cons.websites ?? raw.website,
      outputs: cons.outputs ?? raw.outputs,
      images: images,
      // preserve raw regional coverage so we can later extract countries directly for mapping
      regional_coverage: cons.regional_coverage ?? raw.regional_coverage ?? undefined,
    } as Consortium;
  }

  // else assume legacy shape and return as-is (shallow copy)
  return { ...raw } as Consortium;
}

function ConsortiaTab({ id, name, logo, active, onClick, onOpenMap }: { id: string; name: string; logo?: string; active: boolean; onClick: () => void; onOpenMap?: (e: React.MouseEvent) => void }) {
  // simple tab: logo (or initials), name and a map button
  const rawLogo = logo ? String(logo).replace(/\s+/g, ' ').trim() : undefined;
  const preferredLogo = rawLogo && rawLogo.startsWith('http://') ? rawLogo.replace('http://', 'https://') : rawLogo;
  const [fallbackSrc, setFallbackSrc] = useState<string | undefined>(undefined);
  const initials = initialsFrom(name, undefined);
  const bg = colorFromString(name ?? 'gm');
  const svgUrl = svgInitialsDataUrl(initials, bg);

  const preferred = preferredLogo ?? svgUrl;
  const imgSrc = fallbackSrc ?? preferred;
  const safeImgSrc = imgSrc ? sanitizeSrc(imgSrc as string) ?? svgUrl : svgUrl;

  useEffect(() => {
    if (fallbackSrc !== undefined) setFallbackSrc(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferred]);

  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md ${active ? 'bg-teal-50' : 'hover:bg-zinc-50'}`}>
      <div className="flex-shrink-0">
        <Image src={safeImgSrc} alt={`${name} logo`} width={40} height={40} className="w-10 h-10 rounded-md object-contain bg-white p-1" unoptimized onError={(e)=>{
          const target = (e?.target as HTMLImageElement | null);
          if (target) {
            if (fallbackSrc !== svgUrl) setFallbackSrc(svgUrl); else setFallbackSrc(LOGO_FALLBACK);
          }
        }} />
      </div>

      <div className="flex-1 text-sm font-medium text-zinc-900 truncate">{name}</div>

      <div>
        <button
          onClick={(e) => { e.stopPropagation(); if (onOpenMap) onOpenMap(e as React.MouseEvent); }}
          title="View countries on map"
          className="p-2 rounded-md hover:bg-zinc-100 text-zinc-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </button>
      </div>
    </button>
  );
}

function ConsortiaDetails({ consortium }: { consortium: Consortium }) {
  const { name, acronym, logo, leadInstitution, leadCountry, region, description, services, members, digitalPlatforms } = consortium;
  // include phase-two specific fields as well
  const project_title = (consortium as any).project_title ?? undefined;
  const coordinator = (consortium as any).coordinator ?? undefined;
  const period_months = (consortium as any).period_months ?? undefined;
  const budget = (consortium as any).budget ?? undefined;
  const locations = (consortium as any).locations ?? undefined;
  const programme_priorities = (consortium as any).programme_priorities ?? undefined;

  const rawLogo = logo ? String(logo).replace(/\s+/g, ' ').trim() : undefined;
  const preferredLogo = rawLogo && rawLogo.startsWith('http://') ? rawLogo.replace('http://', 'https://') : rawLogo;
  const [fallbackSrc, setFallbackSrc] = useState<string | undefined>(undefined);
  const initials = initialsFrom(name, acronym);
  const bg = colorFromString(name ?? acronym);
  const svgUrl = svgInitialsDataUrl(initials, bg);

  const preferred = preferredLogo ?? svgUrl;
  const imgSrc = fallbackSrc ?? preferred;
  const safeImgSrc = imgSrc ? sanitizeSrc(imgSrc as string) ?? svgUrl : svgUrl;
  const safeHref = sanitizeSrc(logo ?? imgSrc) ?? (imgSrc ?? '#');

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
          {safeImgSrc ? (
            <a href={safeHref} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Image src={safeImgSrc} alt={`${name} logo`} width={160} height={160} className="w-40 h-40 rounded-lg object-contain bg-white p-2" unoptimized onError={(e)=>{
                const target = (e?.target as HTMLImageElement | null);
                if (target) {
                  if (fallbackSrc !== svgUrl) {
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
          <h3 className="text-lg font-semibold text-zinc-900">{project_title ?? name} {acronym ? `(${acronym})` : ''}</h3>
          <p className="mt-1 text-sm text-zinc-600">{coordinator?.name ?? leadInstitution ?? ''} {coordinator?.city ? `, ${coordinator.city}` : ''} {coordinator?.country ? `— ${coordinator.country}` : leadCountry ? `— ${leadCountry}` : ''} {region ? `— ${region}` : ''}</p>

          {/* period and budget */}
          <div className="mt-3 text-sm text-zinc-700 flex flex-wrap gap-4">
            <div className="flex items-center gap-2"><strong className="text-zinc-800">Period:</strong> <span className="text-zinc-600">{formatPeriod(period_months)}</span></div>
            <div className="flex items-center gap-2"><strong className="text-zinc-800">Budget:</strong> <span className="text-zinc-600">{budget ? formatCurrencyEUR(budget.total_eur) : '—'}</span></div>
            {budget ? (
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <span className="text-zinc-500">(Grant: {formatCurrencyEUR(budget.grant_eur)} · Contribution: {formatCurrencyEUR(budget.contribution_eur)})</span>
              </div>
            ) : null}
            {consortium.sector ? (<div className="flex items-center gap-2"><strong className="text-zinc-800">Sector:</strong> <span className="text-zinc-600">{consortium.sector}</span></div>) : null}
            {Array.isArray(locations) && locations.length > 0 ? (<div className="flex items-center gap-2"><strong className="text-zinc-800">Locations:</strong> <span className="text-zinc-600">{locations.join(', ')}</span></div>) : null}
          </div>
        </div>
      </div>

      {description ? <p className="mt-4 text-sm text-zinc-700 whitespace-pre-line">{description}</p> : null}

      {Array.isArray(programme_priorities) && programme_priorities.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-zinc-800">Programme priorities</h4>
          <div className="mt-2 text-sm text-zinc-700">
            <ul className="list-disc pl-5">
              {programme_priorities.map((p: any, idx: number) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

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

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-800">Partners</h4>
              <div className="mt-3 text-sm text-zinc-700">
                <div className="mb-2">Total partners: <strong>{Array.isArray(members) ? members.length : 0}</strong></div>
                <div className="overflow-auto hide-scrollbar max-h-48">
                  <DataTable columns={memberColumns} rows={memberRows} compact />
                </div>
              </div>
            </div>

            {/* additional fields: contacts, websites, outputs */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-800">Contact persons</h4>
              <div className="mt-2 text-sm text-zinc-700 space-y-2">
                {Array.isArray((consortium as any).contact_persons) && (consortium as any).contact_persons.length > 0 ? (
                  (consortium as any).contact_persons.map((cp: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-700">{String(cp.name ?? '').split(/\s+/).map((p:any)=>p[0]).slice(0,2).join('').toUpperCase() || 'CP'}</div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{cp.name ?? '\u2014'} {cp.role ? `— ${cp.role}` : ''}</div>
                        {cp.email ? <div className="text-xs text-zinc-500"><a href={`mailto:${cp.email}`} className="text-blue-600 hover:underline">{cp.email}</a></div> : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-500">—</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-800">Websites</h4>
              <div className="mt-2 text-sm text-zinc-700 space-y-1">
                {Array.isArray((consortium as any).website) && (consortium as any).website.length > 0 ? (
                  (consortium as any).website.map((w: any, i: number) => (
                    <div key={i}><a href={sanitizeSrc(w) ?? '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{w}</a></div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-500">—</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-zinc-800">Key outputs</h4>
              <div className="mt-2 text-sm text-zinc-700 space-y-1">
                {Array.isArray((consortium as any).outputs) && (consortium as any).outputs.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {(consortium as any).outputs.map((o: any, idx: number) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-zinc-500">—</div>
                )}
              </div>
            </div>

            {/* images / photographs preview (if any) */}
            {consortium.images ? (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-zinc-800">Images</h4>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {Array.isArray((consortium as any).images.logos) && (consortium as any).images.logos.map((l:any, idx:number)=>(
                    <div key={`logo-${idx}`} className="w-20 h-20 rounded overflow-hidden bg-white border border-zinc-100 p-1 flex items-center justify-center">
                      <img src={sanitizeSrc(l.path ?? l.url) ?? ''} alt={String(l.partner ?? 'logo')} className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                  {Array.isArray((consortium as any).images.photographs) && (consortium as any).images.photographs.map((p:any, idx:number)=>(
                    <div key={`photo-${idx}`} className="w-28 h-20 rounded overflow-hidden bg-white border border-zinc-100 p-1">
                      <img src={sanitizeSrc(p.path ?? p.url) ?? ''} alt={String(p.description ?? 'photo')} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

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

// Add country name normalization map for African countries
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
  // Remove (Lead) suffix and trim
  const cleaned = String(name)
    .replace(/\s*\(Lead\)\s*/i, '')
    .trim();

  // Look up standard name in our mapping
  return COUNTRY_NAME_MAP[cleaned] || cleaned;
}

export default function ConsortiaPanel({ consortia }: { consortia: Consortium[] }) {
  // normalize all consortia so the rest of the component can rely on a consistent shape
  const normalized: Consortium[] = Array.isArray(consortia) ? consortia.map(normalizeConsortium) : [];

  // use a stable id for selection: acronym || project_title || name
  const firstId = normalized[0] ? (normalized[0].acronym ?? normalized[0].project_title ?? normalized[0].name) : undefined;
  const [activeConsortium, setActiveConsortium] = useState<string | undefined>(firstId);
   const [mapOpen, setMapOpen] = useState(false);
   const [mapCountries, setMapCountries] = useState<string[]>([]);

   if (!Array.isArray(normalized) || normalized.length === 0) return null;

   const selectedConsortium = normalized.find((c) => (c.acronym ?? c.project_title ?? c.name) === activeConsortium) ?? normalized[0];

   function getCountriesForConsortium(c?: Consortium) {
     if (!c) return [];
     const set = new Set<string>();

    // Prefer explicit regional_coverage countries if present: this ensures we include all
    // the country entries defined under regional_coverage.*.countries[].name in phase_two_data.json
    try {
      const rc = (c as any).regional_coverage;
      if (rc && typeof rc === 'object') {
        Object.values(rc).forEach((regionBlock: any) => {
          if (!regionBlock) return;
          const countries = regionBlock.countries ?? [];
          if (Array.isArray(countries)) {
            countries.forEach((countryEntry: any) => {
              const cname = countryEntry?.name ?? countryEntry?.country;
              if (cname) set.add(normalizeCountryName(String(cname).trim()));
            });
          }
        });
        // return regional_coverage-derived countries only
        const rcCountries = Array.from(set).filter(Boolean);
        if (rcCountries.length > 0) return rcCountries;
      }
    } catch (e) {
      // ignore malformed regional_coverage
    }

  // Prefer explicit locations array (flattened regional_coverage). Use coordinator/leadCountry only as fallback.
  if (Array.isArray(c.locations) && c.locations.length > 0) {
    c.locations.forEach((lc) => {
      if (lc) set.add(normalizeCountryName(lc));
    });
    // return locations-derived countries only
    return Array.from(set).filter(Boolean);
  }

  // If no locations provided, fall back to coordinator / lead country if available
  if (c.leadCountry) {
    const normalizedCountry = normalizeCountryName(c.leadCountry);
    set.add(normalizedCountry);
  }

  if (c.coordinator && (c.coordinator as any).country) {
    set.add(normalizeCountryName((c.coordinator as any).country));
  }

  const countries = Array.from(set).filter(Boolean);
  return countries;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-zinc-900">Consortia</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 lg:col-span-3">
          <div className="space-y-2">
            {normalized.map((c) => {
              const id = c.acronym ?? c.project_title ?? c.name ?? '';
              return (
                <ConsortiaTab
                  key={id}
                  id={id}
                  name={c.name ?? c.project_title ?? ''}
                  logo={c.logo}
                  active={activeConsortium === id}
                  onClick={() => {
                    setActiveConsortium(id);
                    // Reset map countries when changing consortium
                    setMapCountries([]);
                    setMapOpen(false);
                  }}
                  onOpenMap={() => {
                    // Prefer the explicit locations array from the normalized consortium (same as shown in the Details view).
                    // Trim each entry to be safe. Fall back to getCountriesForConsortium if locations is not present.
                    const countries = Array.isArray((c as any).locations) && (c as any).locations.length > 0
                      ? (c as any).locations.map((s: any) => String(s).trim()).filter(Boolean)
                      : getCountriesForConsortium(c);
                    setMapCountries(countries);
                    setMapOpen(true);
                  }}
                />
              );
            })}
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
