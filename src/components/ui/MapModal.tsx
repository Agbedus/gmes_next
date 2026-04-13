'use client';

import React from "react";
import isoMapJson from '@/data/country_iso_map.json';
import countryPhasesJson from '@/data/country_phases.json';
// Note: react-leaflet and leaflet are dynamically imported at runtime to avoid server-side errors
import africanCountriesData from "@/data/africa_boundaries.geo.json";
const basePath = "/leaflet_assets/";

import { GeoJsonObject, Feature, GeoJsonProperties } from "geojson";
import { Plus, Minus, Compass, X, Sun, Moon, Layers } from "lucide-react";

const africanCountriesObject = africanCountriesData as any;
const countryPhases: Record<string, { phase1: boolean; phase2: boolean }> = countryPhasesJson as any;

// Pre-filter the GeoJSON for each phase to represent the "coverage" shapefiles
const phase1Features = (africanCountriesObject.features || []).filter((f: any) => 
    countryPhases[f.properties?.iso_a3]?.phase1
);
const phase2Features = (africanCountriesObject.features || []).filter((f: any) => 
    countryPhases[f.properties?.iso_a3]?.phase2
);

// Unified coverage (Phase 1 OR Phase 2)
const allPhasesFeatures = (africanCountriesObject.features || []).filter((f: any) => {
    const p = countryPhases[f.properties?.iso_a3];
    return p?.phase1 || p?.phase2;
});

const phase1Object = { ...africanCountriesObject, features: phase1Features };
const phase2Object = { ...africanCountriesObject, features: phase2Features };
const allPhasesObject = { ...africanCountriesObject, features: allPhasesFeatures };

type Point = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  group?: string;
};

type LegendItem = { label: string; color: string };

type CountryMap = Record<
    string,
    { iso_a2: string; iso_a3: string }
>;
const isoMap: CountryMap = isoMapJson as any;

type Props = {
  open: boolean;
  onCloseAction: () => void;
  points?: Point[];
  highlightCountries?: string[];
  members?: { name?: string; country?: string; logo?: string }[];
  consortiumName?: string;
  consortiumLogo?: string;
  consortiumKeywords?: string[];
  consortiumDescription?: string;
  legendItems?: LegendItem[];
  groupsColor?: Record<string, string>;
  polygonGeoJSON?: unknown;
};

const DEFAULT_GROUPS_COLOR: Record<string, string> = {
  West: "#06b6d4",
  East: "#34d399",
  North: "#f59e0b",
  South: "#ef4444",
  Central: "#a78bfa",
};

const PHASE_COLORS = {
    phase1: "#10B981", // Green
    phase2: "#F59E0B", // Gold
    both: "#1E3A8A",   // Dark Blue
    none: "#cbd5e1"    // Slate-300 for faded
};

// Center of Africa roughly
const center: [number, number] = [1.5, 20]; // [lat, lon]

// Zoom level for a continental view
const zoom = 3;

const MapButton = ({ onClick, children, active, className = "", title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all shadow-md border ${
      active 
        ? "bg-au-dark-green text-white border-au-dark-green" 
        : "bg-white text-au-dark-green border-au-dark-green/10 hover:bg-slate-50"
    } ${className}`}
  >
    {children}
  </button>
);

function CustomCompass() {
    return (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-au-dark-green/10 flex items-center justify-center relative w-[100px] h-[100px]">
            {/* Cardinal points */}
            <span className="absolute top-1 text-[10px] font-bold text-au-dark-green">N</span>
            <span className="absolute bottom-1 text-[10px] font-bold text-slate-400">S</span>
            <span className="absolute right-2 text-[10px] font-bold text-slate-400">E</span>
            <span className="absolute left-2 text-[10px] font-bold text-slate-400">W</span>
            
            {/* Compass needle */}
            <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute w-1 h-4 bg-au-gold rounded-full -top-1 shadow-sm" />
                <div className="absolute w-1 h-4 bg-slate-200 rounded-full -bottom-1" />
                <div className="w-1.5 h-1.5 bg-au-dark-green rounded-full z-10 border border-white" />
            </div>
            
            {/* Decorative ring */}
            <div className="absolute inset-2 border border-slate-100 rounded-full" />
        </div>
    );
}

function CustomMapControls({ MapLib, baseLayer, setBaseLayer, center, zoom, onCloseAction }: any) {
    const map = MapLib.useMap();
    const { Control } = MapLib;
    
    return (
        <>
            <Control position="topright">
                <div className="flex flex-col gap-2 mt-4 mr-4">
                    <MapButton onClick={onCloseAction} title="Close map">
                        <X size={20} />
                    </MapButton>
                </div>
            </Control>

            <Control position="topright">
                <div className="flex flex-col gap-2 mr-4">
                    <MapButton 
                        onClick={() => setBaseLayer('satellite')} 
                        active={baseLayer === 'satellite'}
                        title="Satellite view"
                    >
                        <Layers size={20} />
                    </MapButton>
                    <MapButton 
                        onClick={() => setBaseLayer('light')} 
                        active={baseLayer === 'light'}
                        title="Light view"
                    >
                        <Sun size={20} />
                    </MapButton>
                    <MapButton 
                        onClick={() => setBaseLayer('dark')} 
                        active={baseLayer === 'dark'}
                        title="Dark view"
                    >
                        <Moon size={20} />
                    </MapButton>
                </div>
            </Control>

            <Control position="bottomright">
                <div className="flex flex-col gap-2 mb-4 mr-4">
                    <MapButton onClick={() => map.zoomIn()} title="Zoom in">
                        <Plus size={20} />
                    </MapButton>
                    <MapButton onClick={() => map.zoomOut()} title="Zoom out">
                        <Minus size={20} />
                    </MapButton>
                    <MapButton onClick={() => map.setView(center, zoom)} title="Reset view">
                        <Compass size={20} />
                    </MapButton>
                </div>
            </Control>
        </>
    );
}

// Leaflet map options (kept simple and serializable)
const mapOptions = {
    center,
    zoom,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: false,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
};

export default function MapModal({
                                   open,
                                   onCloseAction,
                                   points,
                                   highlightCountries,
                                   members,
                                   consortiumName,
                                   consortiumLogo,
                                   consortiumKeywords,
                                   consortiumDescription,
                                   legendItems,
                                   groupsColor = DEFAULT_GROUPS_COLOR,
                                   polygonGeoJSON,
                                 }: Props) {
    // matched/unmatched mapping
    let filteredMap: Record<string, { iso_a2: string; iso_a3: string }> = {};

    if (Array.isArray(highlightCountries) && highlightCountries.length > 0) {
        filteredMap = highlightCountries.reduce((acc, name) => {
            if ((isoMap as any)[name]) acc[name] = (isoMap as any)[name];
            return acc;
        }, {} as Record<string, { iso_a2: string; iso_a3: string }>);
    }

    // Base layer state: 'satellite' | 'light' | 'dark'
    const [baseLayer, setBaseLayer] = React.useState<'satellite' | 'light' | 'dark'>('satellite');
    const [phaseFilter, setPhaseFilter] = React.useState<'All' | 'Phase 1' | 'Phase 2'>('All');

    type IsoEntry = { iso_a2: string; iso_a3: string };
    const matched: Record<string, IsoEntry> = {};
    const unmatched: string[] = [];
    const consortiumDefaultColor = "#ff5833"

    const geoStyle = (_L: any) => (
        feature?: Feature<GeoJSON.Geometry, GeoJsonProperties>
    ) => {
        let fill = "#3388ff";
        let fillOpacity = 0.2;
        let weight = 1;
        let color = "#000";

        if (!feature) {
            return { color, weight, fillColor: fill, fillOpacity };
        }

        const iso3 = feature.properties?.iso_a3 as string;
        const phases = countryPhases[iso3];

        if (consortiumName) {
            const iso2 = feature.properties?.iso_a2 as string | undefined;
            const isHighlighted = Object.values(matched).some(
                (entry) => entry.iso_a2 === iso2 || entry.iso_a3 === iso3
            );
            fill = isHighlighted ? consortiumDefaultColor : "#3388ff";
            fillOpacity = isHighlighted ? 0.6 : 0;
        } else if (phases) {
            const inP1 = phases.phase1;
            const inP2 = phases.phase2;

            if (phaseFilter === 'All') {
                if (inP1 && inP2) fill = PHASE_COLORS.both;
                else if (inP1) fill = PHASE_COLORS.phase1;
                else if (inP2) fill = PHASE_COLORS.phase2;
                fillOpacity = 0.6;
            } else if (phaseFilter === 'Phase 1') {
                if (inP1) {
                    fill = PHASE_COLORS.phase1;
                    fillOpacity = 0.7;
                } else {
                    fill = "transparent";
                    fillOpacity = 0;
                    weight = 0;
                }
            } else if (phaseFilter === 'Phase 2') {
                if (inP2) {
                    fill = PHASE_COLORS.phase2;
                    fillOpacity = 0.7;
                } else {
                    fill = "transparent";
                    fillOpacity = 0;
                    weight = 0;
                }
            }
        } else {
            // Default region view if no phase data
            const region = feature.properties?.subregion as string | undefined;
            if (region === "Northern Africa") fill = DEFAULT_GROUPS_COLOR['North'];
            if (region === "Southern Africa") fill = DEFAULT_GROUPS_COLOR['South'];
            if (region === "Eastern Africa") fill = DEFAULT_GROUPS_COLOR['East'];
            if (region === "Western Africa") fill = DEFAULT_GROUPS_COLOR['West'];
            if (region === "Middle Africa") fill = DEFAULT_GROUPS_COLOR['Central'];
            fillOpacity = 0.5;
        }

        return {
            color,
            weight,
            fillColor: fill,
            fillOpacity,
        } as any;
    };


    if(highlightCountries){
        highlightCountries.forEach((name) => {
        if ((isoMap as any)[name]) {
            matched[name] = (isoMap as any)[name];
        } else {
            unmatched.push(name);
        }
    });
        // avoid console spamming during SSR/build
        if (typeof window !== 'undefined') {
          console.log(Object.values(matched))
          console.log(unmatched)
        }
    }

  // We will dynamically import leaflet/react-leaflet on the client to avoid server-side errors
  const [MapLib, setMapLib] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    // Only load in browser
    if (typeof window === 'undefined') return;

    (async () => {
      try {
        const [L, RL, customControl] = await Promise.all([
          import('leaflet'),
          import('react-leaflet'),
          import('react-leaflet-custom-control').catch(() => ({})),
        ] as any);

        // configure default marker icons
        try {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: basePath + "marker-icon-2x.png",
            iconUrl: basePath + "marker-icon.png",
            shadowUrl: basePath + "marker-shadow.png",
          });
        } catch (e) {
          // ignore
        }

        if (mounted) {
          setMapLib({ ...RL, L, Control: (customControl && customControl.default) ? customControl.default : (RL as any).Control });
        }
      } catch (e) {
        // dynamic import failed; leave MapLib null and fallback UI will render
        // eslint-disable-next-line no-console
        console.error('Failed to load map libraries', e);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Escape key closes modal
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
    }
    if (typeof window !== 'undefined' && open) window.addEventListener("keydown", onKey);
    return () => { if (typeof window !== 'undefined') window.removeEventListener("keydown", onKey); };
  }, [open, onCloseAction]);

  if (!open) return null;

  // Render a lightweight fallback while map libraries load
  if (!MapLib) {
    return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/60">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow">Loading map…</div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Tooltip: RLTooltip, GeoJSON, Control } = MapLib;
  const L = MapLib.L;

  return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/60">
        <div className="relative w-full h-full">
            <MapContainer {...mapOptions} style={{ height: '100%', width: '100%' }}>
                {baseLayer === 'satellite' ? (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP'
                    />
                ) : baseLayer === 'dark' ? (
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
                ) : (
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                )}

                {points?.map((p, i) => (
                    <Marker key={i} position={[p.lat, p.lon]}>
                        <RLTooltip>{p.name}</RLTooltip>
                    </Marker>
                ))}

                <CustomMapControls 
                    MapLib={MapLib} 
                    baseLayer={baseLayer} 
                    setBaseLayer={setBaseLayer} 
                    center={center} 
                    zoom={zoom} 
                    onCloseAction={onCloseAction} 
                />

                <Control position='topleft' >
                    <img src={"/GMES.png"} width={140} className="ml-4 mt-4 drop-shadow-lg" />
                </Control>

                <Control position='bottomleft' >
                    <div className="flex items-end gap-3 ml-4 mb-4">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 text-zinc-800 border border-au-dark-green/10 flex flex-col gap-3 min-w-[280px]">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-4 bg-au-gold rounded-full" />
                                <strong className="text-xs font-bold uppercase tracking-wider text-au-dark-green">Phase Filter</strong>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPhaseFilter('All')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 border ${phaseFilter === 'All' ? 'bg-au-dark-green text-white border-au-dark-green shadow-md' : 'bg-white text-slate-600 border-au-dark-green/10 hover:bg-au-green/5 hover:text-au-dark-green'}`}>
                                    All
                                </button>
                                <button
                                    onClick={() => setPhaseFilter('Phase 1')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 border ${phaseFilter === 'Phase 1' ? 'bg-[#10B981] text-white border-[#10B981] shadow-md' : 'bg-white text-slate-600 border-au-dark-green/10 hover:bg-au-green/5 hover:text-au-dark-green'}`}>
                                    Phase 1
                                </button>
                                <button
                                    onClick={() => setPhaseFilter('Phase 2')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 border ${phaseFilter === 'Phase 2' ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-md' : 'bg-white text-slate-600 border-au-dark-green/10 hover:bg-au-green/5 hover:text-au-dark-green'}`}>
                                    Phase 2
                                </button>
                            </div>
                        </div>
                        <CustomCompass />
                    </div>
                </Control>

                {!consortiumName && (
                    <Control position='bottomright'>
                         <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 text-zinc-800 min-w-[200px] border border-au-dark-green/10 mr-4 mb-4">
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <div className="w-1.5 h-4 bg-au-green rounded-full" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-au-dark-green">Map Legend</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: PHASE_COLORS.phase1 }} />
                                    <span className="text-xs font-semibold text-slate-700">Phase 1 only</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: PHASE_COLORS.phase2 }} />
                                    <span className="text-xs font-semibold text-slate-700">Phase 2 only</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: PHASE_COLORS.both }} />
                                    <span className="text-xs font-semibold text-slate-700">Involved in Both</span>
                                </div>
                                <div className="pt-3 mt-1 border-t border-slate-100">
                                     <div className="flex items-center gap-3 opacity-50">
                                        <span className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: PHASE_COLORS.none }} />
                                        <span className="text-[10px] font-medium text-slate-500 italic">Not in selection</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </Control>
                )}

                {consortiumName && (
                    <Control position='topleft'>
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 text-zinc-800 max-w-sm border border-au-dark-green/10 mt-4 ml-4">
                            <div className="flex items-start gap-5">
                                {consortiumLogo && (
                                    <div className="shrink-0 bg-white rounded-xl p-2 border border-slate-100 shadow-md">
                                        <img 
                                            src={consortiumLogo} 
                                            alt={`${consortiumName} logo`} 
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold leading-tight text-au-dark-green tracking-tight">{consortiumName}</h3>
                                    {consortiumKeywords && consortiumKeywords.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {consortiumKeywords.map((keyword, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {consortiumDescription && (
                                <p className="mt-4 text-sm text-slate-600 line-clamp-4 leading-relaxed font-medium">
                                    {consortiumDescription}
                                </p>
                            )}
                            <div className="mt-5 flex items-center gap-3 text-xs font-bold text-au-dark-green bg-au-dark-green/5 px-4 py-2.5 rounded-xl border border-au-dark-green/10">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: consortiumDefaultColor }}></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: consortiumDefaultColor }}></span>
                                </span>
                                <span>Member Countries Highlighted</span>
                            </div>
                        </div>
                    </Control>
                )}

                <GeoJSON
                    key={phaseFilter}
                    data={
                        phaseFilter === 'Phase 1' ? phase1Object :
                        phaseFilter === 'Phase 2' ? phase2Object :
                        allPhasesObject
                    }
                    style={geoStyle(L)}
                    onEachFeature={(feature: any, layer: any) => {
                        const iso2 = feature.properties?.iso_a2;
                        const iso3 = feature.properties?.iso_a3;
                        const countryName = feature.properties?.name;

                        // Phase info for tooltip
                        const phases = countryPhases[iso3];
                        let phaseText = '';
                        if (phases) {
                            if (phases.phase1 && phases.phase2) phaseText = '<div class="text-[10px] text-zinc-500 mt-0.5">Participated in Phase 1 & 2</div>';
                            else if (phases.phase1) phaseText = '<div class="text-[10px] text-zinc-500 mt-0.5">Participated in Phase 1</div>';
                            else if (phases.phase2) phaseText = '<div class="text-[10px] text-zinc-500 mt-0.5">Participated in Phase 2</div>';
                        }

                        // Find members for this country
                        const countryMembers = members?.filter(m => {
                            if (!m.country) return false;
                            // Check against ISO map if possible, or direct name match
                            const entry = (isoMap as any)[m.country];
                            if (entry) {
                                return entry.iso_a2 === iso2 || entry.iso_a3 === iso3;
                            }
                            // Fallback to name match (loose)
                            return m.country === countryName; 
                        }) || [];

                        if (countryMembers.length > 0) {
                             const tooltipContent = `
                                <div class="p-2 w-64">
                                    <div class="font-bold text-sm border-b border-zinc-200 pb-1 mb-1">${countryName}</div>
                                    ${phaseText}
                                    <div class="space-y-2 mt-2">
                                        ${countryMembers.map(m => `
                                            <div class="flex items-start gap-2">
                                                ${m.logo ? `<img src="${m.logo}" class="w-6 h-6 object-contain bg-white rounded-full p-0.5 border border-zinc-100 shrink-0 mt-0.5" />` : ''}
                                                <span class="text-xs font-medium text-zinc-700 whitespace-normal break-words leading-tight">${m.name || 'Partner'}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                            layer.bindTooltip(tooltipContent, { sticky: true, className: 'custom-tooltip-html', opacity: 1 });
                        } else if (countryName) {
                            layer.bindTooltip(`
                                <div class="px-1 py-0.5">
                                    <div class="font-bold text-sm">${countryName}</div>
                                    ${phaseText}
                                </div>
                            `, { sticky: true });
                        }
                    }}
                />
            </MapContainer>

          {/*<div className="w-full h-full bg-white" />*/}
        </div>
      </div>
  );
}
