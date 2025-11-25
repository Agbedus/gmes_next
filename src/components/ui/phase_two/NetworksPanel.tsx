"use client";
import React from "react";

type InternalNetwork = { name?: string; description?: string };
type PrivateSector = { serviceDevelopment?: string; outreach?: string; examples?: string[] };
type InstitutionType = { type?: string; percentage?: string | number };

// helpers: map type/partner names to pastel colors for badges and stronger colors for donuts
function colorForCategory(name?: string) {
  const s = String(name ?? '').toLowerCase();
  if (s.includes('public') || s.includes('commission') || s.includes('agency') || s.includes('union') || s.includes('authority')) {
    return { badgeBg: '#DFF6F2', badgeText: '#0E766C', donut: '#0ea5a1' };
  }
  if (s.includes('private') || s.includes('company') || s.includes('enterprise') || s.includes('start') || s.includes('firm')) {
    return { badgeBg: '#F3E8FF', badgeText: '#6B21A8', donut: '#7C3AED' };
  }
  if (s.includes('university') || s.includes('institute') || s.includes('college') || s.includes('research') || s.includes('school')) {
    return { badgeBg: '#E8F0FF', badgeText: '#1E40AF', donut: '#2563EB' };
  }
  if (s.includes('ngo') || s.includes('foundation') || s.includes('association') || s.includes('network')) {
    return { badgeBg: '#FFF8E6', badgeText: '#92400E', donut: '#F59E0B' };
  }
  // fallback pastel
  return { badgeBg: '#EEF2FF', badgeText: '#0F172A', donut: '#60A5FA' };
}

function MetricCard({ title, value, accent }: { title: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl p-3 bg-white border border-zinc-100 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500">{title}</div>
          <div className="mt-1 text-lg font-semibold text-zinc-900">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ?? 'bg-accent-50'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="8" stroke="#0E766C" strokeWidth="1.5" opacity="0.12" />
            <path d="M7 12h10" stroke="#0E766C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RadialDonut({ size = 80, stroke = 20, value = 0, color = '#0ea5a1', label = '' }: { size?: number; stroke?: number; value?: number; color?: string; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(value))); // 0..100
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="flex flex-col items-center text-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`g-${label}`} x1="0%" x2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="transparent" stroke="#eef2f7" strokeWidth={stroke} />
          <circle r={radius} fill="transparent" stroke={`url(#g-${label})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90)`} />
        </g>
      </svg>
      <div className="mt-2 text-xs text-zinc-700 font-medium">{clamped}%</div>
      <div className="text-[11px] text-zinc-500 mt-1 truncate max-w-[90px]">{label}</div>
    </div>
  );
}

export default function NetworksPanel({ networks, crossCutting }: { networks: Record<string, unknown> | undefined; crossCutting?: Record<string, unknown> | undefined }) {
  if (!networks && !crossCutting) return null;

  const internal = networks && Array.isArray(networks['internalNetworks']) ? (networks['internalNetworks'] as unknown as InternalNetwork[]) : [];
  const strategic = networks && Array.isArray(networks['strategicPartnerships']) ? (networks['strategicPartnerships'] as unknown as string[]) : [];
  const privateSector = networks && (networks['privateSectorEngagement'] as unknown as PrivateSector) ?? undefined;
  const types = networks && Array.isArray(networks['institutionTypesInvolved']) ? (networks['institutionTypesInvolved'] as unknown as InstitutionType[]) : [];

  // crossCutting may contain GAIA clubs info (youthInnovation_GAIAClubs)
  const gaia = crossCutting && (crossCutting['youthInnovation_GAIAClubs'] as Record<string, unknown> | undefined);
  const gaiaUniversities = gaia && (gaia['universities'] ?? gaia['universitiesList'] ?? undefined);
  const gaiaCountries = gaia && (gaia['countries'] ?? undefined);
  const gaiaPresent = Boolean(gaiaUniversities || gaiaCountries);

  // metrics
  const metricInternal = String(internal.length);
  const metricStrategic = String(strategic.length || '\u2014');
  const metricPrivate = privateSector && Array.isArray(privateSector.examples) ? String(privateSector.examples.length) : (privateSector ? '1+' : '\u2014');
  const metricTypes = String(types.length || '\u2014');

  // prepare radial data from types (try to parse percentage digits)
  const parsedTypes = types.map((t) => {
    const label = typeof t.type === 'string' ? t.type.split(/\s+/)[0] : String(t.type ?? '-');
    let pct = 0;
    if (typeof t.percentage === 'number') pct = t.percentage as number;
    else if (typeof t.percentage === 'string') {
      const m = t.percentage.match(/(\d+(?:\.\d+)?)/);
      pct = m ? Number(m[1]) : 0;
    }
    return { label, pct };
  });

  // make sure 'Public' (if present) is first so it can occupy the large top slot
  const publicIndex = parsedTypes.findIndex(p => String(p.label).toLowerCase() === 'public');
  const orderedTypes = (() => {
    if (publicIndex > 0) {
      const copy = [...parsedTypes];
      const [pub] = copy.splice(publicIndex, 1);
      return [pub, ...copy];
    }
    return parsedTypes;
  })();

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-zinc-900">Networks & Partnerships</h2>

      {/* metrics cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Internal networks" value={metricInternal} />
        <MetricCard title="Strategic partnerships" value={metricStrategic} />
        <MetricCard title="Private sector examples" value={metricPrivate} />
        <MetricCard title="Institution types" value={metricTypes} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* left: internal networks + private sector */}
        <div className="lg:col-span-2 h-full flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 flex-none">
            <h3 className="text-sm font-semibold text-zinc-900">Internal networks</h3>
            <ul className="mt-3 text-sm text-zinc-700 space-y-3">
              {internal.map((n, i) => (
                <li key={i} className="p-3 rounded-md bg-accent-50">
                  <div className="font-medium text-zinc-900">{n.name ?? '\u2014'}</div>
                  <div className="text-xs text-zinc-600 mt-1">{n.description ?? '\u2014'}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900">Strategic partnerships</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {strategic.length ? strategic.map((s, idx) => {
                const first = String(s ?? '').split(/\s+/)[0] || s;
                const clr = colorForCategory(s);
                return (
                  <span key={idx} className="inline-flex items-center px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: clr.badgeBg, color: clr.badgeText }} title={String(s)}>
                    {String(first)}
                  </span>
                );
              }) : <span className="text-zinc-500">—</span>}
            </div>

            {privateSector ? (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-zinc-800">Private sector engagement</h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg p-3 bg-accent-50 border border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-sm">engineering</span>
                      <div className="text-xs text-zinc-500">Service development</div>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900">{String(privateSector.serviceDevelopment ?? '—')}</div>
                  </div>

                  <div className="rounded-lg p-3 bg-accent-50 border border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-sm">campaign</span>
                      <div className="text-xs text-zinc-500">Outreach</div>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900">{String(privateSector.outreach ?? '—')}</div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* GAIA youth info (from crossCutting) */}
            {gaiaPresent ? (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-zinc-800">GAIA youth innovation clubs</h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gaiaUniversities && (
                    <div className="rounded-lg p-3 bg-accent-50 border border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600 text-sm">school</span>
                        <div className="text-xs text-zinc-500">Universities</div>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-zinc-900">
                        {Array.isArray(gaiaUniversities) && gaiaUniversities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(gaiaUniversities as string[]).map((uni, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-white/50 text-zinc-800 border border-zinc-100" title={uni}>
                                {uni.length > 20 ? `${uni.slice(0,18)}…` : uni}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </div>
                    </div>
                  )}

                  {gaiaCountries && (
                    <div className="rounded-lg p-3 bg-accent-50 border border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-600 text-sm">public</span>
                        <div className="text-xs text-zinc-500">Countries</div>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-zinc-900">
                        {Array.isArray(gaiaCountries) && gaiaCountries.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(gaiaCountries as string[]).map((country, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-white/50 text-zinc-800 border border-zinc-100" title={country}>
                                {country.length > 20 ? `${country.slice(0,18)}…` : country}
                              </span>
                            ))}
                          </div>
                        ) : '—'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
           </div>
         </div>

        {/* right: radial charts for institution types */}
        <aside className="space-y-4 h-full flex flex-col">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900">Institution types</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center flex-1 hide-scrollbar overflow-auto">
              {orderedTypes.length ? (
                orderedTypes.map((pt, i) => {
                  const clr = colorForCategory(pt.label);
                  if (i === 0) {
                    // large top donut (spans entire right panel width on md)
                    return (
                      <div key={i} className="col-span-1 sm:col-span-2 md:col-span-3 flex items-center justify-center p-2 bg-white">
                        <RadialDonut size={160} stroke={20} value={pt.pct} label={pt.label} color={clr.donut} />
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="col-span-1 flex items-center justify-center p-2 bg-white">
                      <RadialDonut size={96} stroke={12} value={pt.pct} label={pt.label} color={clr.donut} />
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-zinc-500">No institution type data</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
