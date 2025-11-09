"use client";

import React from "react";
import Tooltip from './Tooltip';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import isoMap from '@/data/country_iso_map.json';

type Point = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  group?: string;
};

type LegendItem = { label: string; color: string };

type Props = {
  open: boolean;
  onCloseAction: () => void;
  points?: Point[]; // optional point markers to render
  highlightCountries?: string[]; // optional list of country names or ids to highlight
  members?: { name?: string; country?: string }[]; // used only for country tooltips
  consortiumName?: string;
  // Optional legend/items and group color mapping provided by the parent; if omitted, no legend is shown
  legendItems?: LegendItem[];
  groupsColor?: Record<string, string>;
  // Optional geoJSON override for polygons (defaults to worldLow)
  polygonGeoJSON?: unknown;
};

// Default palette in case parent doesn't provide group mapping
const DEFAULT_GROUPS_COLOR: Record<string, string> = {
  West: "#06b6d4",
  East: "#34d399",
  North: "#f59e0b",
  South: "#ef4444",
  Central: "#a78bfa",
};

// Types for amCharts objects
type PointGeometry = { type: "Point"; coordinates: [number, number] };
type MapPointDatum = {
  geometry: PointGeometry;
  name: string;
  group?: string;
  color?: string;
};

type PolygonGeoJSON = NonNullable<am5map.IMapPolygonSeriesSettings["geoJSON"]>;

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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rootRef = React.useRef<am5.Root | null>(null);
  const chartRef = React.useRef<am5map.MapChart | null>(null);

  // Tooltip state for React-rendered tooltip (we'll delegate rendering/clamping to Tooltip)
  const [tooltipContent, setTooltipContent] = React.useState<React.ReactNode | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [tooltipAnnouncement, setTooltipAnnouncement] = React.useState<string | undefined>(undefined);

  // Escape to close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCloseAction]);

  React.useEffect(() => {
    if (!open || !containerRef.current) return;

    const root = am5.Root.new(containerRef.current);
    rootRef.current = root;

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        wheelY: "zoom",
        projection: am5map.geoOrthographic(),
      })
    );
    chartRef.current = chart;

    chart.set("rotationX", -20);
    chart.set("rotationY", 0);
    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

    // polygon series (countries)
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: (polygonGeoJSON as PolygonGeoJSON) ?? (am5geodata_worldLow as unknown as PolygonGeoJSON),
        exclude: ["AQ"],
      })
    );

    // Map members by country for tooltip building
    const membersByCountry: Record<string, string[]> = {};
    if (Array.isArray(members)) {
      for (const member of members) {
        if (member.country && member.name) {
          const country = member.country.replace(/\s*\(Lead\)\s*/i, "").trim();
          if (!membersByCountry[country]) membersByCountry[country] = [];
          membersByCountry[country].push(member.name);
        }
      }
    }

    // Configure polygon styling (tooltips will be handled by React portal)
    polygonSeries.mapPolygons.template.setAll({
      interactive: true,
      fill: am5.color(0xe6f0ff),
      stroke: am5.color(0xcbd5e1),
      strokeWidth: 1,
      cursorOverStyle: "pointer",
    });

    // React-based tooltip: show on pointerover/move, hide on pointerout
    // amCharts event object typing is dynamic; allow `any` for the handler param
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPolygonPointerOver = (ev: any) => {
      const target = ev.target as unknown as { dataItem?: { dataContext?: Record<string, unknown> } };
      const dc = target.dataItem?.dataContext as Record<string, unknown> | undefined;
      if (!dc) return;
      const countryName = String(dc.name ?? '');
      const countryMembers = membersByCountry[countryName] ?? [];

      // Build React tooltip content
      const content: React.ReactNode = (
        <div style={{ fontFamily: 'Inter, Roboto, Arial, sans-serif', fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{countryName}</div>
          {countryMembers.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {consortiumName ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{consortiumName} Members:</div> : null}
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {countryMembers.map((m) => <li key={m as string} style={{ marginBottom: 2 }}>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      );

      // Position from original DOM event
      const original = ev.originalEvent as MouseEvent | undefined;
      const left = original ? original.clientX + 12 : (containerRef.current?.getBoundingClientRect().left ?? 0) + 12;
      const top = original ? original.clientY + 12 : (containerRef.current?.getBoundingClientRect().top ?? 0) + 12;

      setTooltipContent(content);
      setTooltipPos({ left, top });
      setTooltipAnnouncement(countryMembers.length > 0 ? `${countryName} members: ${countryMembers.join(', ')}` : countryName);
      setTooltipVisible(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPolygonPointerMove = (ev: any) => {
      const original = ev.originalEvent as MouseEvent | undefined;
      if (!original) return;
      setTooltipPos({ left: original.clientX + 12, top: original.clientY + 12 });
    };

    const onPolygonPointerOut = () => {
      setTooltipVisible(false);
      setTooltipContent(null);
    };

    // amCharts event typings are strict; cast to any to allow pointermove/pointerover/pointerout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (polygonSeries.mapPolygons.template.events as any).on("pointerover", onPolygonPointerOver);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (polygonSeries.mapPolygons.template.events as any).on("pointermove", onPolygonPointerMove);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (polygonSeries.mapPolygons.template.events as any).on("pointerout", onPolygonPointerOut);

    // Graticule
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({ stroke: am5.color(0xffffff), strokeOpacity: 0.2 });

    // Points series (create before using)
    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    pointSeries.bullets.push(function (root) {
      const circle = am5.Circle.new(root, {
        radius: 6,
        stroke: am5.color(0xffffff),
        strokeWidth: 1.5,
        tooltipText: "{name} ({group})",
      });
      circle.adapters.add("fill", (fill, target) => {
        const dc = target.dataItem?.dataContext as Record<string, unknown> | undefined;
        const hex = (typeof dc === "object" && dc !== null && "color" in dc)
          ? (dc as { color?: string }).color
          : undefined;
        return hex ? am5.color(hex) : am5.color(0x60a5fa);
      });
      // bullets: show React tooltip for points as well
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      circle.events.on('pointerover', (ev: any) => {
        const dc = ev.target.dataItem?.dataContext as Record<string, unknown> | undefined;
        if (!dc) return;
        const name = String(dc.name ?? '');
        const group = String(dc.group ?? '');
        const content: React.ReactNode = (
          <div style={{ fontFamily: 'Inter, Roboto, Arial, sans-serif', fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{name}</div>
            {group ? <div style={{ marginTop: 6 }}>{group}</div> : null}
          </div>
        );
        // original mouse pos
        const original = ev.originalEvent as MouseEvent | undefined;
        const left = original ? original.clientX + 12 : 0;
        const top = original ? original.clientY + 12 : 0;
        setTooltipContent(content);
        setTooltipPos({ left, top });
        setTooltipAnnouncement(name + (group ? ` — ${group}` : ''));
        setTooltipVisible(true);
      });
      circle.events.on('pointerout', () => {
        setTooltipVisible(false);
        setTooltipContent(null);
        setTooltipAnnouncement(undefined);
      });
      return am5.Bullet.new(root, { sprite: circle });
    });

    // If highlightCountries provided, activate matching polygons
    if (Array.isArray(highlightCountries) && highlightCountries.length > 0) {
      // normalize strings for more robust matching (remove diacritics, punctuation, extra spaces)
      const normalize = (input?: unknown) => {
        if (!input && input !== 0) return '';
        let s = String(input ?? '');
        // decompose accents, remove diacritics
        s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        // lower, remove punctuation, collapse spaces, remove leading 'the '
        s = s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\bthe\s+/g, '').replace(/\s+/g, ' ').trim();
        return s;
      };

      const normalizedInput = Array.from(new Set(highlightCountries.map((s) => normalize(s))));

      const expanded = new Set<string>(normalizedInput);
      try {
        for (const raw of normalizedInput) {
          // try to find matching key in isoMap by normalizing keys
          for (const [key, codes] of Object.entries(isoMap as Record<string, { iso_a2?: string; iso_a3?: string } | undefined>)) {
            const nk = String(key).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
            if (nk === raw) {
              if (codes?.iso_a2) expanded.add(normalize(codes.iso_a2));
              if (codes?.iso_a3) expanded.add(normalize(codes.iso_a3));
            }
          }
        }
      } catch {
        // ignore if isoMap lookup fails
      }

      const lookup = new Set(Array.from(expanded));

      const matched = new Set<string>();
      const available = new Set<string>();

      polygonSeries.mapPolygons.each((polygon) => {
        const dc = polygon.dataItem?.dataContext as Record<string, unknown> | undefined;
        if (!dc) return;

        const rawName = String(dc.name || '');
        const rawId = String(dc.id || '');
        const props = (dc.properties as Record<string, unknown> | undefined) || undefined;
        const rawIso2 = String((props && props['iso_a2']) || '');
        const rawIso3 = String((props && props['iso_a3']) || '');

        const candidates = [rawName, rawId, rawIso2, rawIso3].map((x) => normalize(x)).filter(Boolean);
        candidates.forEach((c) => available.add(c));

        // Try matching any normalized identifier against the lookup
        for (const identifier of candidates) {
          if (lookup.has(identifier)) {
            polygon.set('active', true);
            polygon.set('fill', am5.color(0x00008B));
            matched.add(identifier);
            break;
          }
        }
      });

      // Log matching summary to help debugging
      try {
        const lookupArr = Array.from(lookup).sort();
        const matchedArr = Array.from(matched).sort();
        const availableArr = Array.from(available).sort();
        const unmatched = lookupArr.filter(x => !matched.has(x));
        console.log('Map highlight lookup:', lookupArr);
        console.log('Map matched identifiers:', matchedArr);
        console.log('Map available polygon identifiers sample:', availableArr.slice(0, 20));
        if (unmatched.length) console.log('Map unmatched identifiers:', unmatched);
      } catch {
        // ignore logging errors
      }
    }

    // Set points data only if provided by parent
    if (Array.isArray(points) && points.length > 0) {
      const data: MapPointDatum[] = points.map((p) => ({ geometry: { type: "Point", coordinates: [p.lon, p.lat] }, name: p.name, group: p.group, color: (groupsColor || DEFAULT_GROUPS_COLOR)[p.group || "Central"] }));
      pointSeries.data.setAll(data);
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygonSeries.mapPolygons.template.events as any).off("pointerover", onPolygonPointerOver);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygonSeries.mapPolygons.template.events as any).off("pointermove", onPolygonPointerMove);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygonSeries.mapPolygons.template.events as any).off("pointerout", onPolygonPointerOut);
      chartRef.current = null;
      root.dispose();
      rootRef.current = null;
    };
  }, [open, points, highlightCountries, members, consortiumName, groupsColor, polygonGeoJSON]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/60">
      <div className="relative w-full h-full">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button className="rounded-lg bg-white/90 px-3 py-2 text-sm text-zinc-800 hover:bg-white" onClick={onCloseAction} aria-label="Close map">Close</button>
        </div>

        {/* Render legend only if parent provided legendItems */}
        {Array.isArray(legendItems) && legendItems.length > 0 ? (
          <div className="absolute left-4 top-4 z-20 bg-white/90 rounded-md px-3 py-2 text-sm text-zinc-800">
            <strong>Legend</strong>
            <div className="mt-2 flex flex-col gap-1">
              {legendItems.map((li) => (
                <div key={li.label} className="flex items-center gap-2 text-xs">
                  <span style={{ width: 12, height: 12, background: li.color, borderRadius: 6, display: "inline-block" }} />
                  <span>{li.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* React-rendered tooltip via reusable Tooltip component */}
        <Tooltip
          visible={tooltipVisible}
          left={tooltipPos.left}
          top={tooltipPos.top}
          onCloseAction={() => { setTooltipVisible(false); setTooltipContent(null); setTooltipAnnouncement(undefined); }}
          announcement={tooltipAnnouncement}
        >
          {tooltipContent}
        </Tooltip>

        <div ref={containerRef} className="w-full h-full bg-white" />
      </div>
    </div>
  );
}
