'use client';
import React from 'react';
import Image from 'next/image';

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

// Re-using the REPORTS list from the original /app/reports page
const REPORTS: Report[] = [
  {
    id: 'gdz',
    title: 'GDZHIAO',
    filename: 'GDZHIAO.pdf',
    href: '/reports/GDZHIAO.pdf',
    // removed large base64 inline image to avoid unterminated string issues; use no logo so the DocumentIcon is shown
    logo: undefined,
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
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkC_8XA8nwyybwHAwospvKhfgYuJuWLU9S3w&scd'.trim(),
  },
];

export default function ImpactReportsPanel() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-zinc-900">Impact Reports</h2>

      <div className="mt-4">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {REPORTS.map((r) => (
            <li key={r.id} className="bg-white border h-[480px] border-slate-200 rounded-lg p-4 flex flex-col justify-between relative">
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
      </div>
    </section>
  );
}
