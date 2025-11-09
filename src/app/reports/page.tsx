'use client';
import React from 'react';
import Image from 'next/image';

// Inline SVG replacements for the two heroicons used on this page.
function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloudArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.9-1.2A4.5 4.5 0 0 1 21 13.5 4.5 4.5 0 0 1 16.5 18H7z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13v6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 16l3 3 3-3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type Report = {
  id: string;
  title: string;
  filename: string;
  logo?: string;
  href: string;
};

const REPORTS: Report[] = [
  {
    id: 'gdz',
    title: 'GDZHIAO',
    filename: 'GDZHIAO.pdf',
    href: '/reports/GDZHIAO.pdf',
    // small embedded logo from phase_two_data.json
    logo: 'data:image/png;base64,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',
  },
  {
    id: 'gernac',
    title: 'GERNAC',
    filename: 'GERNAC.pdf',
    href: '/reports/GERNAC.pdf',
    logo: 'https://www.cicos.int/wp-content/themes/cicos/images/logo-cicos-n.png',
  },
  {
    id: 'icpac',
    title: 'IGAD / ICPAC',
    filename: 'IGAD_ICPAC.pdf',
    href: '/reports/IGAD_ICPAC.pdf',
    logo: 'https://www.icpac.net/media/images/ICPAC_LOGO_WithSLogan.width-800.png',
  },
  {
    id: 'marcnowa',
    title: 'MarCNOWA',
    filename: 'MARCNOWA.pdf',
    href: '/reports/MARCNOWA.pdf',
    logo: 'https://geoportal.gmes.ug.edu.gh/assets/MarCNoWA_blue.509ffdfd.jpeg',
  },
  {
    id: 'marcosio',
    title: 'MarCOSIO',
    filename: 'MARCOSIO.pdf',
    href: '/reports/MARCOSIO.pdf',
    logo: 'https://marcosio.org/wp-content/uploads/2022/08/MarCoSio-Logo.png',
  },
  {
    id: 'oss',
    title: 'OSS',
    filename: 'OSS.pdf',
    href: '/reports/OSS.pdf',
    logo: 'https://www.oss-online.org/sites/default/files/logo-h.png',
  },
  {
    id: 'rcmrd',
    title: 'RCMRD',
    filename: 'RCMRD.pdf',
    href: '/reports/RCMRD.pdf',
    logo: 'https://phosphor.utils.elfsightcdn.com/?url=https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1580193677904863240%2FiKNVj99r_400x400.jpg',
  },
  {
    id: 'wemast',
    title: 'WeMAST',
    filename: 'WEMAST.pdf',
    href: '/reports/WEMAST.pdf',
    // trimmed trailing space to avoid image src errors
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkC_8XA8nwyybwHAwospvKhfgYuJuWLU9S3w&scd'.trim(),
  },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-zinc-600 mt-1">Download or view consolidated consortium reports (PDF).</p>
          </div>
        </header>

        <section aria-label="Available reports">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {REPORTS.map((r) => (
              <li key={r.id} className="bg-white border h-96 border-slate-200 rounded-lg p-4 flex flex-col justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-zinc-50 border border-zinc-100 overflow-hidden">
                    {r.logo ? (
                      <Image src={r.logo} alt={`${r.title} logo`} width={48} height={48} unoptimized className="object-contain p-1 bg-white" />
                    ) : (
                      <DocumentIcon className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate">{r.title}</div>
                    <div className="text-xs text-zinc-500 truncate">{r.filename}</div>
                  </div>
                </div>

                <Image
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Emblem_of_the_African_Union.svg/230px-Emblem_of_the_African_Union.svg.png"
                    alt=""
                    fill
                    className="absolute inset-0 w-full h-2/6 object-center object-cover filter opacity-5"
                />

                <div className="mt-4 flex items-center gap-2 z-1">
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                    aria-label={`View ${r.title} report`}
                  >
                    Read Report
                  </a>

                  <a
                    href={r.href}
                    download={r.filename}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#9F2241] text-white"
                    aria-label={`Download ${r.title} report`}
                  >
                    <CloudArrowDownIcon className="w-4 h-4 text-white" />
                    <span>Download</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 text-sm text-zinc-500">If you need other formats or a different ordering, let me know.</footer>
      </div>
    </div>
  );
}