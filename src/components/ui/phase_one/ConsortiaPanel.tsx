'use client';
import React from 'react';
import Image from 'next/image';
import PhaseTwoConsortiaPanel from '../phase_two/ConsortiaPanel';
import phaseOneData from '../../../data/phase_one_data.json';

// Wrap Phase Two's ConsortiaPanel so Phase One reuses the same UI, ensuring consistent style and theme.
// The Phase Two component normalizes both legacy and new schemas internally, so we can pass Phase One's
// consortia array directly.
export default function ConsortiaPanel({ consortia }: { consortia: any[] }) {
  if (!Array.isArray(consortia) || consortia.length === 0) return null;

  const funders = phaseOneData.gmesAndAfricaPhase1.programDetails.funders;

  return (
    <div className="space-y-8">
      {/* Funders Section */}
      {funders && funders.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Funded By</h3>
          <div className="flex flex-wrap items-center gap-8">
            {funders.map((funder, idx) => (
              <div key={idx} className="flex items-center gap-3" title={funder.name}>
                <div className="relative h-12 w-12 flex-shrink-0">
                  <Image
                    src={funder.logo}
                    alt={`${funder.name} logo`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-sm font-medium text-zinc-900">{funder.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PhaseTwoConsortiaPanel consortia={consortia} />
    </div>
  );
}
