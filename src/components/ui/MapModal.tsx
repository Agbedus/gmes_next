"use client";

import React from "react";
import isoMapJson from '@/data/country_iso_map.json';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, GeoJSON  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, {PathOptions} from 'leaflet';
import Control from 'react-leaflet-custom-control'
import africanCountriesData from "@/data/africa_boundaries.geo.json";
const basePath = "/leaflet_assets/";
import { GeoJsonObject, Feature, GeoJsonProperties } from "geojson";

const africanCountriesObject: GeoJsonObject = africanCountriesData as GeoJsonObject;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: basePath + "marker-icon-2x.png",
    iconUrl: basePath + "marker-icon.png",
    shadowUrl: basePath + "marker-shadow.png",
});

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
const isoMap: CountryMap = isoMapJson;

type Props = {
  open: boolean;
  onCloseAction: () => void;
  points?: Point[];
  highlightCountries?: string[];
  members?: { name?: string; country?: string }[];
  consortiumName?: string;
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

// Leaflet map options
const mapOptions = {
    center,
    zoom,
    maxBounds: africaBounds,
    maxBoundsViscosity: 1.0, // prevents panning outside bounds
    minZoom: 2,
    maxZoom: 6, // optional
    zoomControl: true,
};

type IsoEntry = { iso_a2: string; iso_a3: string };
const matched: Record<string, IsoEntry> = {};
const unmatched: string[] = [];
const consortiumDefaultColor = "#ff5833"

export default function MapModal({
                                   open,
                                   onCloseAction,
                                   points,
                                   highlightCountries,
                                   members,
                                   consortiumName,
                                   legendItems,
                                   groupsColor = DEFAULT_GROUPS_COLOR,
                                   polygonGeoJSON,
                                 }: Props) {
    let filteredMap: Record<string, { iso_a2: string; iso_a3: string }> = {};

    if (Array.isArray(highlightCountries) && highlightCountries.length > 0) {
        filteredMap = highlightCountries.reduce((acc, name) => {
            if (isoMap[name]) acc[name] = isoMap[name];
            return acc;
        }, {} as Record<string, { iso_a2: string; iso_a3: string }>);
    }
    const geoStyle: L.StyleFunction = (
        feature?: Feature<GeoJSON.Geometry, GeoJsonProperties>
    ) => {

        let fill = "#3388ff";
        let fillOpacity = 0.2
        // Leaflet might call style() with undefined
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
        } as L.PathOptions;
    };


    if(highlightCountries){
        highlightCountries.forEach((name) => {
        if (isoMap[name]) {
            matched[name] = isoMap[name];
        } else {
            unmatched.push(name);
        }
    });
        console.log(Object.values(matched))
        console.log(unmatched)
    }

  // Escape key closes modal
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCloseAction]);

  if (!open) return null;

  return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/60">
        <div className="relative w-full h-full">
            <MapContainer {...mapOptions} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {points?.map((p, i) => (
                    <Marker key={i} position={[p.lat, p.lon]}>
                        <Tooltip >{p.name}</Tooltip>
                    </Marker>
                ))}
                <Control position='topright' >
                    <button className="rounded-lg bg-white/90 px-3 py-2 text-sm text-zinc-800 hover:bg-white" onClick={onCloseAction} aria-label="Close map">Close</button>

                </Control>
                <Control position='bottomleft' >
                    <img src={"/GMES.png"} width={"200px"}/>
                </Control>

                {/*<Control position='bottomleft' >*/}
                {/*    <div className="bg-white/90 rounded-md px-3 py-2 text-sm text-zinc-800 text-primary">*/}
                {/*        {consortiumName} polygonGeoJSON:{JSON.stringify(polygonGeoJSON)}*/}
                {/*    </div>*/}
                {/*</Control>*/}
                {/* Render legend only if parent provided legendItems */}
                {Array.isArray(legendItems) && legendItems.length > 0 ? (
                        <Control position='topleft' >
                    <div className="bg-white/90 rounded-md px-3 py-2 text-sm text-zinc-800" style={{ maxWidth:'400px' }}>
                        <strong>Legend</strong>
                        <div className="mt-2 flex flex-col gap-1">
                            {!consortiumName ?legendItems.map((li) => (
                                <div key={li.label} className="flex items-center gap-2 text-xs">
                                    <span style={{ width: 12, height: 12, background: li.color, borderRadius: 6, display: "inline-block" }} />
                                    <span>{li.label}</span>
                                </div>
                            )):
                                <div className="flex items-center gap-2 text-xs">
                                    <span style={{ width: 12, height: 12, background: consortiumDefaultColor, borderRadius: 6, display: "inline-block" }} />
                                    <span>{consortiumName}</span>
                                </div>
                            }
                        </div>
                    </div>
                        </Control>
                ) : null}
                <GeoJSON
                    data={africanCountriesObject}
                    style={geoStyle}
                    onEachFeature={(feature, layer) => {
                        if (feature.properties?.name) {
                            layer.bindTooltip(`<strong>${feature.properties.name}</strong>`);
                        }
                    }}
                />
            </MapContainer>

          {/*<div className="w-full h-full bg-white" />*/}
        </div>
      </div>
  );
}
