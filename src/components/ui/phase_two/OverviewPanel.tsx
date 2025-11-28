"use client";
import React from "react";
import Image from 'next/image';
import { motion } from "framer-motion";
import OverviewCard from './OverviewCard';

type Funder = { name: string; role?: string; logo?: string };
type Pillar = { id?: string; name?: string; description?: string };

export default function OverviewPanel({ programDetails, strategicFramework, metrics }: { programDetails: Record<string, unknown>; strategicFramework: Record<string, unknown>; metrics?: Record<string, unknown> }) {
  const pd = programDetails as Record<string, unknown>;
  const sf = strategicFramework as Record<string, unknown>;

  const name = (pd['name'] as string | undefined) ?? 'Program';
  const description = (pd['description'] as string | undefined) ?? '';
  const timeline = (pd['timeline'] as string | undefined) ?? '\u2014';
  // budget: show total only — previously included currency label 'EU'; remove that
  const budgetTotalRaw = ((pd['budget'] as Record<string, unknown> | undefined)?.['total'] as string | undefined) ?? '\u2014';
  const budgetTotal = budgetTotalRaw?.replace(/\s*EU\b/gi, '').trim();
  const thematic = pd['thematicFocus'];

  const funders = Array.isArray(pd['funders']) ? (pd['funders'] as unknown as Funder[]) : [];
  const pillars = Array.isArray(sf['pillars_LogFrame']) ? (sf['pillars_LogFrame'] as unknown as Pillar[]) : [];
  const alignment = sf['alignment'] as Record<string, unknown> | undefined;

  // helper to pick a material symbol for a thematic item
  const iconForTheme = (t?: string) => {
    if (!t) return 'public';
    const s = t.toLowerCase();
    if (s.includes('water')) return 'water_drop';
    if (s.includes('marine') || s.includes('coast') || s.includes('ocean')) return 'beach_access';
    if (s.includes('natural') || s.includes('resources') || s.includes('environment')) return 'park';
    return 'public';
  };

  const sdgChipLabel = (s?: string) => {
    if (!s) return '';
    const digits = s.match(/\d+/g);
    if (digits && digits.length > 0) return `SDG ${digits.join(',')}`;
    return s.split(/\s+/)[0];
  };

  const agendaChipLabel = (g?: string) => {
    if (!g) return '';
    const digits = g.match(/\d+/g);
    if (digits && digits.length > 0) return `Goal ${digits.join(',')}`;
    return g.split(/\s+/)[0];
  };

  // prepare alignment arrays for safer rendering
  const continentalPoliciesArr = alignment && Array.isArray(alignment['continentalPolicies']) ? (alignment['continentalPolicies'] as unknown as string[]) : [];
  const globalAgendasObj = alignment && typeof alignment === 'object' ? (alignment['globalAgendas'] as Record<string, unknown> | undefined) : undefined;
  const sdgs = globalAgendasObj && Array.isArray(globalAgendasObj['sdgs']) ? (globalAgendasObj['sdgs'] as unknown as string[]) : [];
  const agenda2063 = globalAgendasObj && Array.isArray(globalAgendasObj['agenda2063']) ? (globalAgendasObj['agenda2063'] as unknown as string[]) : [];

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-zinc-900">Program overview</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-zinc-900 hidden">{name}</h3>
            <p className="mt-2 text-sm text-zinc-700 hidden">{description}</p>

            <motion.div 
              className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {/* Increase the visual weight of values by passing a larger font size via className prop on OverviewCard */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <OverviewCard title="Timeline" value={timeline} icon="calendar_month" iconColor="#fff" iconBg="#038a36" valueClassName="text-2xl font-semibold" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <OverviewCard title="Budget (total)" value={budgetTotal} icon="account_balance" iconColor="#fff" iconBg="#e0c063" valueClassName="text-2xl font-semibold" />
              </motion.div>

              {/* Replace the small left thematic box with the thematic block that previously lived under the logos on the aside (i.e. show the concise themed list here with colored icons) */}
              <motion.div className="rounded-xl border border-zinc-200 bg-white p-4" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <h4 className="text-xs font-semibold text-zinc-700">Thematic focus</h4>
                <div className="mt-2 text-sm text-zinc-700">
                  {Array.isArray(thematic) ? (thematic as unknown as string[]).map((t, i) => (
                    <div key={i} className="py-1 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{backgroundColor: '#038a3610'}} aria-hidden>
                        <span className="material-symbols-outlined text-base" style={{color: '#038a36'}}>{iconForTheme(t)}</span>
                      </span>
                      <div className="text-sm">{t}</div>
                    </div>
                  )) : String(thematic ?? '\u2014')}
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <OverviewCard title="Snapshot" value={(metrics?.['snapshotDate'] as string | undefined) ?? (pd['snapshotDate'] as string | undefined) ?? ((pd['snapshot_date'] as string | undefined) ?? 'mid-2025')} icon="schedule" iconColor="#fff" iconBg="#009639" valueClassName="text-2xl font-semibold" />
              </motion.div>
            </motion.div>

          </div>

        </motion.div>

        <aside className="md:col-span-1 space-y-4">
          <motion.div 
            className="rounded-xl border border-zinc-200 bg-white p-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-zinc-900">Funders</h4>
            <div className="mt-3 space-y-3">
              {funders.length === 0 ? (
                <div className="text-sm text-zinc-600">No funders listed</div>
              ) : (
                funders.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {typeof f.logo === 'string' && f.logo ? (
                      <Image src={f.logo} alt={`${f.name} logo`} width={64} height={64} className="w-16 h-16 rounded-md object-center object-cover bg-white p-1 border border-zinc-100" unoptimized />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center text-sm font-semibold text-zinc-700">
                        {String(f.name).split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="text-lg font-semibold text-zinc-900">{f.name}</div>
                      {f.role ? <div className="text-xs text-zinc-500">{f.role}</div> : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Remove the duplicate thematic block from the aside (we moved it into the left card). If required elsewhere, we can keep a short summary here. */}

         </aside>
       </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-3 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900">Strategic pillars</h3>
            <div className="mt-2 flex-1">
              {pillars.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {pillars.map((p, idx) => (
                      <details key={p.id ?? idx} className="rounded-md border border-zinc-100 p-3 bg-accent-50">
                        <summary className="cursor-pointer list-none text-sm font-medium text-zinc-900">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{backgroundColor: '#038a3610', color: '#038a36'}} aria-hidden>
                              <span className="material-symbols-outlined text-base">layers</span>
                            </span>
                            <span>{p.name ?? '-'}</span>
                          </div>
                          <span className="chev material-symbols-outlined text-zinc-500 text-base" aria-hidden>chevron_right</span>
                        </summary>
                        <div className="mt-2 text-sm text-zinc-700 whitespace-pre-line">{p.description ?? '—'}</div>
                      </details>
                    ))}
                  </div>

                  <style jsx>{`
                    details > summary { display: flex; align-items: center; justify-content: space-between; }
                    details > summary .chev { transition: transform .18s ease; }
                    details[open] > summary .chev { transform: rotate(90deg); }
                  `}</style>
                </>
              ) : (
                <div className="text-sm text-zinc-500">—</div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="rounded-xl border border-zinc-200 bg-white p-3 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-900">Alignment</h3>
            <div className="mt-2 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-auto">
              <div className="rounded-xl border border-zinc-200 bg-white p-3">
                <h4 className="text-xs font-medium text-zinc-800">Continental policies</h4>
                <div className="mt-2 text-sm text-zinc-700 space-y-2">
                  {continentalPoliciesArr.length > 0 ? (
                    continentalPoliciesArr.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-0.5" style={{color: '#038a36'}} aria-hidden>check_circle</span>
                        <div className="text-sm text-zinc-700">{c}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-500">—</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-3">
                <h4 className="text-xs font-medium text-zinc-800">Global agendas</h4>
                <div className="mt-2 text-sm text-zinc-700">
                  <div>
                    <div className="text-xs uppercase font-medium text-zinc-800 mb-4">SDGs</div>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {sdgs.length > 0 ? sdgs.map((s, idx) => (
                        <span key={idx} className="inline-flex items-center px-4 py-1.5 text-lg rounded-full text-zinc-800" style={{backgroundColor: '#038a3620'}}>{sdgChipLabel(s)}</span>
                      )) : <span className="text-sm text-zinc-500">—</span>}
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="text-xs uppercase font-medium text-zinc-800 mb-4">Agenda2063</div>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {agenda2063.length > 0 ? agenda2063.map((g, idx) => (
                        <span key={idx} className="inline-flex items-center px-4 py-1.5 text-lg rounded-full text-zinc-800" style={{backgroundColor: '#e0c06320'}}>{agendaChipLabel(g)}</span>
                      )) : <span className="text-sm text-zinc-500">—</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

     </section>
   );
 }
