import React from 'react';

export type LinkItem = {
    type: string;
    description: string;
    url: string;
};

export type LinkCardProps = {
    title: string;
    links: LinkItem[];
    colorTheme: 'blue' | 'green' | 'purple';
};

export function LinkCard({ title, links, colorTheme }: LinkCardProps) {
    const themeStyles = {
        blue: {
            hoverBorder: 'group-hover:border-blue-200',
            iconBg: 'bg-blue-50 text-blue-600',
            linkHover: 'hover:bg-blue-50 hover:text-blue-700',
            iconHover: 'group-hover:text-blue-600'
        },
        green: {
            hoverBorder: 'group-hover:border-green-200',
            iconBg: 'bg-green-50 text-green-600',
            linkHover: 'hover:bg-green-50 hover:text-green-700',
            iconHover: 'group-hover:text-green-600'
        },
        purple: {
            hoverBorder: 'group-hover:border-purple-200',
            iconBg: 'bg-purple-50 text-purple-600',
            linkHover: 'hover:bg-purple-50 hover:text-purple-700',
            iconHover: 'group-hover:text-purple-600'
        }
    };

    const theme = themeStyles[colorTheme];

    return (
        <div className={`bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col h-full transition-colors duration-200 group ${theme.hoverBorder}`}>
            <h3 className="font-semibold text-zinc-800 mb-4 min-h-[3rem] line-clamp-2" title={title}>{title}</h3>
            <div className="space-y-2 mt-auto">
                {links.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-sm text-zinc-600 transition-all duration-200 group/link ${theme.linkHover}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                            <span className="material-symbols-outlined text-[18px]">
                                {getIconForType(link.type)}
                            </span>
                        </div>
                        <span className="flex-1 font-medium truncate">{link.description}</span>
                        <span className={`material-symbols-outlined text-[16px] text-zinc-300 transition-colors ${theme.iconHover}`}>
                            open_in_new
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}

function getIconForType(type: string) {
    switch (type.toLowerCase()) {
        case 'pdf':
            return 'picture_as_pdf';
        case 'website':
            return 'language';
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
