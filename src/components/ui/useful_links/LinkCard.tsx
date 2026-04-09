import React from 'react';
import IconlyIcon from '../IconlyIcon';

export type LinkItem = {
    type: string;
    description: string;
    url: string;
};

export type LinkCardProps = {
    title: string;
    links: LinkItem[];
    // allow additional theme names (gold, burgundy) or any string; we'll fallback safely
    colorTheme?: string;
};

export function LinkCard({ title, links, colorTheme }: LinkCardProps) {
    const themeStyles: Record<string, {
        hoverBorder: string;
        iconBg: string;
        linkHover: string;
        iconHover: string;
    }> = {
        blue: {
            hoverBorder: 'group-hover:border-blue-200',
            iconBg: 'bg-slate-50 text-slate-600',
            linkHover: 'hover:bg-slate-50 hover:text-slate-700',
            iconHover: 'group-hover:text-blue-600'
        },
        green: {
            hoverBorder: 'group-hover:border-green-200',
            iconBg: 'bg-slate-50 text-[#1A5632]',
            linkHover: 'hover:bg-slate-50 hover:text-[#1A5632]',
            iconHover: 'group-hover:text-green-600'
        },
        purple: {
            hoverBorder: 'group-hover:border-purple-200',
            iconBg: 'bg-slate-50 text-slate-600',
            linkHover: 'hover:bg-slate-50 hover:text-slate-700',
            iconHover: 'group-hover:text-purple-600'
        },
        gold: {
            hoverBorder: 'group-hover:border-amber-200',
            iconBg: 'bg-slate-50 text-[#1A5632]',
            linkHover: 'hover:bg-slate-50 hover:text-[#1A5632]',
            iconHover: 'group-hover:text-amber-600'
        },
        burgundy: {
            // use a conservative rose variant for burgundy-ish theme
            hoverBorder: 'group-hover:border-rose-200',
            iconBg: 'bg-slate-50 text-slate-600',
            linkHover: 'hover:bg-slate-50 hover:text-slate-700',
            iconHover: 'group-hover:text-rose-700'
        }
    };

    // pick theme if available, otherwise fall back to a neutral theme
    const defaultTheme = {
        hoverBorder: '',
        iconBg: 'bg-slate-50 text-slate-600',
        linkHover: 'hover:bg-slate-50 hover:text-slate-700',
        iconHover: ''
    };

    const theme = colorTheme ? (themeStyles[colorTheme] ?? defaultTheme) : defaultTheme;

    return (
        <div className={`rounded-[24px] border border-slate-200 bg-white p-5 transition-colors duration-200 group ${theme.hoverBorder}`}>
            <h3 className="mb-4 font-semibold text-slate-800" title={title}>{title}</h3>
            <div className="space-y-2">
                {links.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 rounded-xl p-2.5 text-sm text-slate-600 transition-colors duration-200 group/link ${theme.linkHover}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                            <IconlyIcon name={getIconForType(link.type)} size={18} color="currentColor" />
                        </div>
                        <span className="flex-1 font-medium truncate">{link.description}</span>
                        <IconlyIcon name="open_in_new" size={16} color="#cbd5e1" className={`transition-colors ${theme.iconHover}`} />
                    </a>
                ))}
            </div>
        </div>
    );
}

function getIconForType(type: string) {
    switch (type.toLowerCase()) {
        case 'pdf':
            return 'document';
        case 'website':
            return 'public';
        case 'geoportal':
            return 'map';
        case 'learning':
            return 'school';
        case 'social':
            return 'share';
        default:
            return 'link';
    }
}
