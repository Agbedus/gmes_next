"use client";

import React from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";

type Point = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  group?: string;
};

type Props = {
  open: boolean;
  onCloseAction: () => void;
  points?: Point[];
};

const groupsColor: Record<string, string> = {
  West: "#06b6d4",
  East: "#34d399",
  North: "#f59e0b",
  South: "#ef4444",
  Central: "#a78bfa",
};

// Types to avoid `any`
type PointGeometry = { type: "Point"; coordinates: [number, number] };
type MapPointDatum = {
  geometry: PointGeometry;
  name: string;
  group: string;
  color: string;
};
// Use the library's settings to type geoJSON without `any`
type PolygonGeoJSON = NonNullable<am5map.IMapPolygonSeriesSettings["geoJSON"]>;

const GROUPS = Object.keys(groupsColor);

function buildRandomPoints(n: number): Point[] {
  // pool of real African cities so markers are on land
  const pool: Point[] = [
    { id: "ng-lag", name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792, group: "West" },
    { id: "gh-acc", name: "Accra, Ghana", lat: 5.6037, lon: -0.1870, group: "West" },
    { id: "sn-dkr", name: "Dakar, Senegal", lat: 14.6928, lon: -17.4467, group: "West" },
    { id: "ci-abj", name: "Abidjan, Côte d’Ivoire", lat: 5.348, lon: -4.027, group: "West" },
    { id: "ke-nbo", name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, group: "East" },
    { id: "tz-dar", name: "Dar es Salaam, Tanzania", lat: -6.7924, lon: 39.2083, group: "East" },
    { id: "et-add", name: "Addis Ababa, Ethiopia", lat: 8.9806, lon: 38.7578, group: "East" },
    { id: "ug-kla", name: "Kampala, Uganda", lat: 0.3476, lon: 32.5825, group: "East" },
    { id: "eg-cai", name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357, group: "North" },
    { id: "dz-alg", name: "Algiers, Algeria", lat: 36.7538, lon: 3.0588, group: "North" },
    { id: "ma-rab", name: "Rabat, Morocco", lat: 34.0209, lon: -6.8416, group: "North" },
    { id: "tn-tun", name: "Tunis, Tunisia", lat: 36.8065, lon: 10.1815, group: "North" },
    { id: "za-cpt", name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241, group: "South" },
    { id: "za-jnb", name: "Johannesburg, South Africa", lat: -26.2041, lon: 28.0473, group: "South" },
    { id: "mz-mpm", name: "Maputo, Mozambique", lat: -25.9692, lon: 32.5732, group: "South" },
    { id: "bw-gbe", name: "Gaborone, Botswana", lat: -24.6282, lon: 25.9231, group: "South" },
    { id: "cd-kin", name: "Kinshasa, DRC", lat: -4.4419, lon: 15.2663, group: "Central" },
    { id: "cm-yao", name: "Yaoundé, Cameroon", lat: 3.848, lon: 11.5021, group: "Central" },
    { id: "ga-lbv", name: "Libreville, Gabon", lat: 0.4162, lon: 9.4673, group: "Central" },
    { id: "cf-bgi", name: "Bangui, CAR", lat: 4.3947, lon: 18.5582, group: "Central" },
  ];
  const res: Point[] = [];
  for (let i = 0; i < n; i++) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    // jitter slightly
    const jitterLat = base.lat + (Math.random() - 0.5) * 0.6;
    const jitterLon = base.lon + (Math.random() - 0.5) * 0.6;
    const group = GROUPS[Math.floor(Math.random() * GROUPS.length)];
    res.push({
      id: `${base.id}-${i}`,
      name: base.name,
      lat: jitterLat,
      lon: jitterLon,
      group,
    });
  }
  return res;
}

export default function MapModal({ open, onCloseAction, points }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rootRef = React.useRef<am5.Root | null>(null);
  const chartRef = React.useRef<am5map.MapChart | null>(null);

  // Escape to close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCloseAction]);

  // Initialize amCharts when modal opens
  React.useEffect(() => {
    if (!open || !containerRef.current) return;
    // create root
    const root = am5.Root.new(containerRef.current);
    rootRef.current = root;

    // Create chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        wheelY: "zoom",
        projection: am5map.geoOrthographic(),
      })
    );
    chartRef.current = chart;

    chart.set("rotationX", -20); // center roughly over 20°E
    chart.set("rotationY", 0);   // equatorial view

    // Zoom control
    chart.set("zoomControl", am5map.ZoomControl.new(root, { }));

    // Country polygons (World)
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow as unknown as PolygonGeoJSON,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xe6f0ff),
      stroke: am5.color(0xcbd5e1),
      strokeWidth: 1,
      cursorOverStyle: "pointer",
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x93c5fd),
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x2563eb),
    });

    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const target = ev.target;
      target.set("active", !target.get("active"));
    });

    // Graticule (optional nice lat/lon lines)
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0xffffff),
      strokeOpacity: 0.2,
    });

    // Points
    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    pointSeries.bullets.push(function (root, series, dataItem) {
      const circle = am5.Circle.new(root, {
        radius: 6,
        stroke: am5.color(0xffffff),
        strokeWidth: 1.5,
        tooltipText: "{name} ({group})",
      });
      circle.adapters.add("fill", (fill, target) => {
        const dc = target.dataItem?.dataContext;
        const hex = (typeof dc === "object" && dc !== null && "color" in dc)
          ? (dc as { color?: string }).color
          : undefined;
        return hex ? am5.color(hex) : am5.color(0x60a5fa);
      });
      return am5.Bullet.new(root, { sprite: circle });
    });

    const rawPoints = points?.length ? points : buildRandomPoints(30);
    const data: MapPointDatum[] = rawPoints.map((p) => ({
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      name: p.name,
      group: p.group || "Central",
      color: groupsColor[p.group || "Central"] || "#60a5fa",
    }));
    pointSeries.data.setAll(data);

    return () => {
      chartRef.current = null;
      root.dispose();
      rootRef.current = null;
    };
  }, [open, points]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/60"
    >
      <div className="relative w-full h-full">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            className="rounded-lg bg-white/90 px-3 py-2 text-sm text-zinc-800 hover:bg-white"
            onClick={onCloseAction}
            aria-label="Close map"
          >
            Close
          </button>
        </div>

        <div className="absolute left-4 top-4 z-20 bg-white/90 rounded-md px-3 py-2 text-sm text-zinc-800">
          <strong>Legend</strong>
          <div className="mt-2 flex flex-col gap-1">
            {Object.entries(groupsColor).map(([k, c]) => (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span style={{ width: 12, height: 12, background: c, borderRadius: 6, display: "inline-block" }} />
                <span>{k}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={containerRef} className="w-full h-full bg-white" />
      </div>
    </div>
  );
}
