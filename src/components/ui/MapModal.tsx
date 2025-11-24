'use client';

import React from "react";
import isoMapJson from '@/data/country_iso_map.json';
// Note: react-leaflet and leaflet are dynamically imported at runtime to avoid server-side errors
import africanCountriesData from "@/data/africa_boundaries.geo.json";
const basePath = "/leaflet_assets/";

import { GeoJsonObject, Feature, GeoJsonProperties } from "geojson";

const africanCountriesObject: GeoJsonObject = africanCountriesData as GeoJsonObject;
// const countries = africanCountriesObject.features
//     .map(f => f.properties.name)    // or NAME, name_en, etc.
//     .filter(Boolean);
// console.log(countries)
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

// Center of Africa roughly
const center: [number, number] = [1.5, 20]; // [lat, lon]

// Zoom level for a continental view
const zoom = 3;

// Bounds to restrict map to Africa (southwest, northeast corners)
const africaBounds: [[number, number], [number, number]] = [
    [-35.0, -20.0], // SW: southern tip of Africa, westernmost point
    [38.0, 55.0],   // NE: northernmost tip, easternmost point
];

// Leaflet map options (kept simple and serializable)
const mapOptions = {
    center,
    zoom,
    // removed hard bounds to allow free panning/movement across the map
    minZoom: 2,
    maxZoom: 8, // allow more zoom in
    zoomControl: true,
    // enable interaction controls explicitly
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

    type IsoEntry = { iso_a2: string; iso_a3: string };
    const matched: Record<string, IsoEntry> = {};
    const unmatched: string[] = [];
    const consortiumDefaultColor = "#ff5833"

    const geoStyle = (_L: any) => (
        feature?: Feature<GeoJSON.Geometry, GeoJsonProperties>
    ) => {
        let fill = "#3388ff";
        let fillOpacity = 0.2
        if (!feature) {
            return {
                color: "#000",
                weight: 1,
                fillColor: fill,
                fillOpacity
            };
        }
        if(consortiumName){
            const iso2 = feature.properties?.iso_a2 as string | undefined;
            const iso3 = feature.properties?.iso_a3 as string | undefined;
            const isHighlighted = Object.values(matched).some(
                (entry) => entry.iso_a2 === iso2 || entry.iso_a3 === iso3
            );
            fill =isHighlighted? consortiumDefaultColor : "#3388ff"; // default
            fillOpacity = isHighlighted? 0.6:0
        }else{
            const region = feature.properties?.subregion as string | undefined;
            if (region === "Northern Africa") fill = DEFAULT_GROUPS_COLOR['North'];
            if (region === "Southern Africa") fill = DEFAULT_GROUPS_COLOR['South'];
            if (region === "Eastern Africa") fill = DEFAULT_GROUPS_COLOR['East'];
            if (region === "Western Africa") fill = DEFAULT_GROUPS_COLOR['West'];
            if (region === "Middle Africa") fill = DEFAULT_GROUPS_COLOR['Central'];
            fillOpacity = 0.5
        }
        return {
            color: "#000",
            weight: 1,
            fillColor: fill,
            fillOpacity: fillOpacity,
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

                <Control position='topright' >
                    <button className="rounded-lg bg-white/90 px-3 py-2 text-sm text-zinc-800 hover:bg-white" onClick={onCloseAction} aria-label="Close map">Close</button>
                </Control>

                <Control position='topright' >
                    <div className="bg-white/90 rounded-md px-2 py-2 flex gap-2">
                        <button
                            onClick={() => setBaseLayer('light')}
                            className={`px-2 py-1 text-xs rounded ${baseLayer === 'light' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-800'}`}>
                            Light
                        </button>
                        <button
                            onClick={() => setBaseLayer('dark')}
                            className={`px-2 py-1 text-xs rounded ${baseLayer === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-800'}`}>
                            Dark
                        </button>
                        <button
                            onClick={() => setBaseLayer('satellite')}
                            className={`px-2 py-1 text-xs rounded ${baseLayer === 'satellite' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-800'}`}>
                            Satellite
                        </button>
                    </div>
                </Control>

                <Control position='bottomleft' >
                    <img src={"/GMES.png"} width={200} />
                </Control>

                {consortiumName ? (
                    <Control position='topleft'>
                        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-5 text-zinc-800 max-w-sm border border-zinc-100/50">
                            <div className="flex items-start gap-4">
                                {consortiumLogo && (
                                    <div className="shrink-0 bg-white rounded-lg p-1 border border-zinc-100 shadow-sm">
                                        <img 
                                            src={consortiumLogo} 
                                            alt={`${consortiumName} logo`} 
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold leading-tight text-zinc-900">{consortiumName}</h3>
                                    {consortiumKeywords && consortiumKeywords.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {consortiumKeywords.map((keyword, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {consortiumDescription && (
                                        <p className="mt-2 text-sm text-zinc-600 line-clamp-4 leading-relaxed">
                                            {consortiumDescription}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-2 rounded-lg">
                                <span style={{ width: 10, height: 10, background: consortiumDefaultColor, borderRadius: '50%', display: "inline-block" }} />
                                <span>Member Countries Highlighted</span>
                            </div>
                        </div>
                    </Control>
                ) : (
                    Array.isArray(legendItems) && legendItems.length > 0 ? (
                        <Control position='topleft' >
                            <div className="bg-white/90 rounded-md px-3 py-2 text-sm text-zinc-800" style={{ maxWidth:'400px' }}>
                                <strong>Legend</strong>
                                <div className="mt-2 flex flex-col gap-1">
                                    {legendItems.map((li:any) => (
                                        <div key={li.label} className="flex items-center gap-2 text-xs">
                                            <span style={{ width: 12, height: 12, background: li.color, borderRadius: 6, display: "inline-block" }} />
                                            <span>{li.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Control>
                    ) : null
                )}

                <GeoJSON
                    data={africanCountriesObject}
                    style={geoStyle(L)}
                    onEachFeature={(feature: any, layer: any) => {
                        const iso2 = feature.properties?.iso_a2;
                        const iso3 = feature.properties?.iso_a3;
                        const countryName = feature.properties?.name;

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
                                    <div class="font-bold text-sm border-b border-zinc-200 pb-1 mb-2">${countryName}</div>
                                    <div class="space-y-2">
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
                            layer.bindTooltip(`<strong>${countryName}</strong>`, { sticky: true });
                        }
                    }}
                />
            </MapContainer>

          {/*<div className="w-full h-full bg-white" />*/}
        </div>
      </div>
  );
}
