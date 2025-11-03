"use client";
import React, { useLayoutEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5radar from "@amcharts/amcharts5/radar";
import { serviceDistribution, userActivity, regionalPerformance } from '@/data/dummy-chart-data';

// --- Types & Palette ---
type BaseChartProps = {
  chartId: string;
  title: string;
  icon?: string;
};

// Small, reusable data type to avoid `any` and satisfy ESLint
type ChartData = Record<string, unknown>;
// Minimal renderer interface used for typing axis.renderer access without `any`
type AxisRendererLike = {
  labels: { template: { setAll: (arg: Record<string, unknown>) => void } };
  ticks: { template: { setAll: (arg: Record<string, unknown>) => void } };
};

// --- Palette & helpers ---
const PASTEL_PALETTE = [
  0xA7F3D0, // mint
  0xC7D2FE, // lavender
  0xFED7AA, // peach
  0xFCE7F3, // pink
  0xE6FFFA, // aqua
  0xE0F2FE, // light sky
];
function getPastel(index: number) {
  return am5.color(PASTEL_PALETTE[index % PASTEL_PALETTE.length]);
}

// small service color mapping so slices have consistent colors
const SERVICE_COLOR_INDEX: Record<string, number> = {
  "Land & Water": 0,
  "Marine & Coastal": 1,
  Conservation: 2,
  "Disaster Risk": 3,
};

// --- props types reused by chart components ---
type BarChartProps = BaseChartProps & {
  data: ChartData[];
  categoryField: string;
  valueField: string;
};

type LineChartProps = BaseChartProps & {
  data: ChartData[];
  dateField: string;
  valueField: string;
};

// --- Chart Components ---

const BarChart: React.FC<BarChartProps> = ({ chartId, data, categoryField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false, panY: false, wheelX: "none", wheelY: "none", paddingLeft: 0,
    }));

    const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 30, minorGridEnabled: true });
    yRenderer.grid.template.set("location", 1);

    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0, categoryField, renderer: yRenderer,
    }));

    // make axis labels/ticks smaller and subtle (typed-safe cast)
    ((yAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ fontSize: 10, fill: am5.color(0x64748b) });
    ((yAxis.get('renderer') as unknown) as AxisRendererLike).ticks.template.setAll({ strokeOpacity: 0.2 });

    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0, min: 0, renderer: am5xy.AxisRendererX.new(root, { strokeOpacity: 0.06 }),
    }));

    ((xAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ fontSize: 10, fill: am5.color(0x64748b) });
    ((xAxis.get('renderer') as unknown) as AxisRendererLike).ticks.template.setAll({ strokeOpacity: 0.2 });

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: title, xAxis, yAxis, valueXField: valueField, sequencedInterpolation: true, categoryYField: categoryField,
    }));

    series.columns.template.setAll({
      tooltipText: "{valueX}", cornerRadiusBR: 8, cornerRadiusTR: 8, height: am5.percent(80),
    });

    // Apply a pastel fill - safely read dataItem.index without using `any`
    series.columns.template.adapters.add("fill", (fill, target) => {
      const di = (target.dataItem as unknown) as { index?: number } | undefined;
      const index = di && typeof di.index === 'number' ? di.index : 0;
      return getPastel(index);
    });

    // subtle stroke
    series.columns.template.set("strokeOpacity", 0.15);

    // replace previous yAxis.data.setAll(data as any); with typed-safe call
    (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    // previously: series.data.setAll(data as any);
    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

    series.appear(800);
    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

const AreaChart: React.FC<LineChartProps> = ({ chartId, data, dateField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true, panY: true, wheelX: "panX", wheelY: "zoomX", pinchZoomX: true,
    }));

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "month", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      tooltip: am5.Tooltip.new(root, {}),
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }));

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      name: title, xAxis, yAxis, valueYField: valueField, valueXField: dateField, tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" }),
    }));

    series.strokes.template.setAll({ strokeWidth: 2 });
    series.fills.template.setAll({ fillOpacity: 0.15 });

    // pastel color
    series.set("stroke", getPastel(0));
    series.set("fill", getPastel(0));

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    series.appear(800);
    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, dateField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

const LineChart: React.FC<LineChartProps> = ({ chartId, data, dateField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true, panY: true, wheelX: "panX", wheelY: "zoomX", pinchZoomX: true,
    }));

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "month", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      tooltip: am5.Tooltip.new(root, {}),
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    }));

    const series = chart.series.push(am5xy.LineSeries.new(root, {
      name: title, xAxis, yAxis, valueYField: valueField, valueXField: dateField, tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" }),
    }));
    series.strokes.template.setAll({ strokeWidth: 2 });
    series.set("fill", getPastel(1));
    series.set("stroke", getPastel(1));

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    series.appear(800);
    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, dateField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "260px" }}></div>
    </div>
  );
};

const PieChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
    }));

    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField, categoryField,
    }));

    // smaller labels + subtle styling
    series.labels.template.setAll({ fontSize: 11, fill: am5.color(0x475569) });
    series.ticks.template.setAll({ strokeOpacity: 0.22 });
    series.slices.template.setAll({ templateField: "sliceSettings" });

    // pastel fills for slices - map by category name for consistent colors
    series.slices.template.adapters.add("fill", (fill, target) => {
      const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
      const cat = dataCtx[categoryField] as string | undefined;
      // prefer SERVICE_COLOR_INDEX mapping, otherwise find index by matching category value in series.data
      const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
      const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
      return getPastel(idx as number);
    });

    series.slices.template.setAll({ stroke: am5.color(0xffffff), strokeWidth: 1, strokeOpacity: 0.8 });

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

    // legend
    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50), x: am5.percent(50), layout: root.horizontalLayout,
    }));
    // small legend fonts and marker sizes
    legend.labels.template.setAll({ fontSize: 10, fill: am5.color(0x475569) });
    legend.markers.template.setAll({ width: 12, height: 8 });
    // show only the first word in legend labels
    legend.labels.template.adapters.add('text', (text, target) => {
      const di = target.dataItem as unknown as { dataContext?: ChartData } | undefined;
      const ctx = di?.dataContext ?? {};
      const name = (ctx as ChartData)['name'] as string | undefined ?? (ctx as ChartData)['category'] as string | undefined ?? text;
      return String(name).split(' ')[0] ?? String(name);
    });
    legend.data.setAll(series.dataItems);

    series.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

// --- New: DonutChart (variant of Pie) ---
const DonutChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.verticalLayout }));
    const series = chart.series.push(am5percent.PieSeries.new(root, { valueField, categoryField }));

    // donut style
    series.set("innerRadius", am5.percent(52));

    series.labels.template.setAll({ fontSize: 11, fill: am5.color(0x475569) });
    series.ticks.template.setAll({ strokeOpacity: 0.2 });

    series.slices.template.adapters.add("fill", (fill, target) => {
      const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
      const cat = dataCtx[categoryField] as string | undefined;
      const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
      const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
      return getPastel((idx as number) + 1);
    });

    series.slices.template.setAll({ stroke: am5.color(0xffffff), strokeWidth: 1.2, strokeOpacity: 0.85 });

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
    legend.labels.template.setAll({ fontSize: 10, fill: am5.color(0x475569) });
    legend.markers.template.setAll({ width: 12, height: 8 });
    legend.labels.template.adapters.add('text', (text, target) => {
      const di = target.dataItem as unknown as { dataContext?: ChartData } | undefined;
      const ctx = di?.dataContext ?? {};
      const name = (ctx as ChartData)['name'] as string | undefined ?? (ctx as ChartData)['category'] as string | undefined ?? text;
      return String(name).split(' ')[0] ?? String(name);
    });
    legend.data.setAll(series.dataItems);

    series.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

// --- New: RadarChart (uses amcharts radar module) ---
const RadarChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5radar.RadarChart.new(root, {}));

    const xRenderer = am5radar.AxisRendererRadial.new(root, {});
    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, { categoryField, renderer: xRenderer }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5radar.AxisRendererRadial.new(root, {}) }));

    const series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
      name: title, valueYField: valueField, categoryXField: categoryField, xAxis, yAxis, clustered: false,
    }));

    series.columns.template.setAll({ cornerRadius: 6 });
    series.columns.template.adapters.add("fill", (fill, target) => {
      const di = (target.dataItem as unknown) as { index?: number } | undefined;
      const index = di && typeof di.index === 'number' ? di.index : 0;
      return getPastel(index);
    });

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, valueField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

// --- New: Gantt-style chart (using XY ColumnSeries with openValueXField for ranges) ---
const GanttChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; startField: string; endField: string }> = ({ chartId, data, categoryField, startField, endField, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, { baseInterval: { timeUnit: "day", count: 1 }, renderer: am5xy.AxisRendererX.new(root, {}) }));
    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { categoryField, renderer: am5xy.AxisRendererY.new(root, {}) }));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      xAxis, yAxis, valueXField: endField, openValueXField: startField, categoryYField: categoryField, clustered: false,
    }));

    series.columns.template.setAll({ height: am5.percent(60), cornerRadiusTR: 6, cornerRadiusBR: 6 });
    series.columns.template.adapters.add("fill", (fill, target) => {
      const di = (target.dataItem as unknown) as { index?: number } | undefined;
      const index = di && typeof di.index === 'number' ? di.index : 0;
      return getPastel(index);
    });

    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, startField, endField, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
    </div>
  );
};

// --- New: SolidGauge (ring-style gauge built from PieSeries) ---
const SolidGauge: React.FC<BaseChartProps & { value: number; max?: number }> = ({ chartId, value, max = 100, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.verticalLayout }));

    const series = chart.series.push(am5percent.PieSeries.new(root, { valueField: 'val', categoryField: 'cat' }));
    series.set('innerRadius', am5.percent(72));
    series.slices.template.setAll({ stroke: am5.color(0xffffff), strokeWidth: 1, strokeOpacity: 0.9 });

    // color first slice as pastel, second as muted grey
    series.slices.template.adapters.add('fill', (fill, target) => {
      const di = (target.dataItem as unknown) as { index?: number } | undefined;
      const idx = di && typeof di.index === 'number' ? di.index : 0;
      if (idx === 0) return getPastel(2); // gauge color
      return am5.color(0xE6E9EE);
    });

    const pct = Math.max(0, Math.min(1, value / max));
    ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll([
      { cat: 'value', val: pct * max },
      { cat: 'rest', val: (1 - pct) * max },
    ]);

    chart.children.push(am5.Label.new(root, {
      text: `${Math.round(pct * 100)}%`, centerX: am5.percent(50), centerY: am5.percent(50), fontSize: 18, fontWeight: '600', fill: am5.color(0x334155),
    }));

    series.appear(800, 100);

    return () => root.dispose();
  }, [chartId, value, max, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: '100%', height: '320px' }}></div>
    </div>
  );
};

// --- Added: StackedBarChart (explicitly named) ---
const StackedBarChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; fields: string[] }> = ({ chartId, data, categoryField, fields, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, { panX: false, panY: false }));

    const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });
    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { renderer: yRenderer, categoryField }));
    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererX.new(root, {}) }));

    fields.forEach((f, i) => {
      const series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: f, xAxis, yAxis, valueXField: f, categoryYField: categoryField, stacked: true,
      }));

      series.columns.template.setAll({ height: am5.percent(80), cornerRadiusTR: 6, cornerRadiusBR: 6 });
      series.columns.template.adapters.add('fill', () => getPastel(i));
      series.columns.template.set('strokeOpacity', 0);
      ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    });

    (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, categoryField, fields, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: '100%', height: '320px' }}></div>
    </div>
  );
};

// --- Added: MultiSeriesAreaChart (explicitly named) ---
const MultiSeriesAreaChart: React.FC<BaseChartProps & { data: ChartData[]; dateField: string; fields: string[] }> = ({ chartId, data, dateField, fields, title, icon }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(chartId);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, { panX: true, panY: false }));

    const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, { baseInterval: { timeUnit: 'month', count: 1 }, renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }) }));
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));

    fields.forEach((f, i) => {
      const series = chart.series.push(am5xy.LineSeries.new(root, {
        name: f, xAxis, yAxis, valueYField: f, valueXField: dateField, tooltip: am5.Tooltip.new(root, { labelText: '{valueY}' }),
      }));

      series.strokes.template.setAll({ strokeWidth: 2 });
      series.fills.template.setAll({ fillOpacity: 0.18 });
      series.set('stroke', getPastel(i));
      series.set('fill', getPastel(i));

      ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
    });

    // add legend for multi-series and make labels small; show only first word
    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
    legend.labels.template.setAll({ fontSize: 10, fill: am5.color(0x475569) });
    legend.markers.template.setAll({ width: 12, height: 8 });
    legend.labels.template.adapters.add('text', (text, target) => {
      const di = target.dataItem as unknown as { dataContext?: ChartData } | undefined;
      const ctx = di?.dataContext ?? {};
      const name = (ctx as ChartData)['name'] as string | undefined ?? (ctx as ChartData)['category'] as string | undefined ?? text;
      return String(name).split(' ')[0] ?? String(name);
    });
    legend.data.setAll(chart.series.values);
    chart.appear(800, 100);

    return () => root.dispose();
  }, [chartId, data, dateField, fields, title]);

  return (
    <div className="chart-container">
      <h3 className="chart-title"><span className="material-symbols-outlined">{icon}</span> {title}</h3>
      <div id={chartId} style={{ width: '100%', height: '320px' }}></div>
    </div>
  );
};

// --- Main Modal Component ---

type Props = {
  open: boolean;
  onCloseAction: () => void;
}

export default function SummaryChartsModal({ open, onCloseAction }: Props) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseAction();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCloseAction]);

  if (!open) return null;

  // Local dummy data for stacked chart (impact breakdown)
  const impactBreakdown = [
    { region: "West", social: 30, environmental: 40, economic: 15 },
    { region: "East", social: 25, environmental: 50, economic: 10 },
    { region: "North", social: 20, environmental: 35, economic: 23 },
    { region: "South", social: 28, environmental: 45, economic: 10 },
    { region: "Central", social: 18, environmental: 30, economic: 27 },
  ];

  // additional dummy: multi-metric series (for MultiSeriesAreaChart)
  const multiMetrics = userActivity.map((d) => ({
    date: d.date,
    actual: d.value,
    projected: Math.round((d.value ?? 0) * 1.12),
  }));

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60">
      <div className="relative w-full h-full bg-zinc-50 shadow-xl flex flex-col">

        <header className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">monitoring</span>
            Programme Analytics
          </h2>
          <button className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-200" onClick={onCloseAction} aria-label="Close charts">
            Close
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">

            {/* Distribution Section */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="chart-card">
                  <PieChart chartId="service-dist-chart" data={serviceDistribution} categoryField="service"
                            valueField="value" title="Service Distribution (Pie)" icon="pie_chart"/>
                </div>

                <div className="chart-card">
                  <DonutChart chartId="service-donut-chart" data={serviceDistribution} categoryField="service"
                              valueField="value" title="Service Distribution (Donut)" icon="donut_large"/>
                </div>

                <div className="chart-card">
                  <StackedBarChart chartId="impact-stacked-chart" data={impactBreakdown} categoryField="region"
                                   fields={["social", "environmental", "economic"]} title="Impact Breakdown"
                                   icon="stacked_bar_chart"/>
                </div>

                <div className="chart-card">
                  <RadarChart chartId="service-radar-chart" data={serviceDistribution} categoryField="service"
                              valueField="value" title="Service Distribution (Radar)" icon="radar"/>
                </div>

                <div className="chart-card">
                  <SolidGauge chartId="service-gauge-chart" value={65} max={100} title="Service Level" icon="speed"/>
                </div>
                <div className="chart-card">
                  <AreaChart chartId="user-activity-area" data={userActivity} dateField="date" valueField="value"
                             title="User Activity (Area)" icon="show_chart"/>
                </div>
              </div>
            </section>

            {/* Trends Section */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">Trends</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="chart-card lg:col-span-2">
                  <MultiSeriesAreaChart chartId="user-multi-area" data={multiMetrics} dateField="date" fields={["actual", "projected"]} title="User Activity vs Projected" icon="insights" />
                </div>

                <div className="chart-card">
                  <LineChart chartId="user-activity-line" data={userActivity} dateField="date" valueField="value" title="User Activity (Line)" icon="timeline" />
                </div>
              </div>
            </section>

            {/* Regional Section */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-zinc-700">Regional</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="chart-card lg:col-span-3">
                  <BarChart chartId="regional-perf-chart" data={regionalPerformance} categoryField="region" valueField="value" title="Regional Performance" icon="bar_chart" />
                </div>

                <div className="chart-card lg:col-span-3">
                  <GanttChart chartId="regional-gantt-chart" data={regionalPerformance} categoryField="region" startField="value" endField="value" title="Regional Performance (Gantt)" icon="view_timeline" />
                </div>
              </div>
            </section>

          </div>
        </main>

        <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-zinc-200">
          <div className="flex items-center justify-center gap-4">
            <button className="filter-button active">
              <span className="material-symbols-outlined">today</span>
              Today
            </button>
            <button className="filter-button">
              <span className="material-symbols-outlined">calendar_month</span>
              Last 7 Days
            </button>
            <button className="filter-button">
              <span className="material-symbols-outlined">date_range</span>
              Last 30 Days
            </button>
            <div className="w-px h-6 bg-zinc-300"></div>
            <button className="filter-button">
              <span className="material-symbols-outlined">public</span>
              All Regions
            </button>
          </div>
        </footer>

      </div>
      <style jsx>{`
        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.2s ease-in-out;
        }
        .chart-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .chart-title .material-symbols-outlined {
          font-size: 1.25rem;
          color: #64748b;
        }
        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .filter-button:hover {
          background: #f1f5f9;
        }
        .filter-button.active {
          background: #e0f2fe;
          color: #0284c7;
          border-color: #bae6fd;
        }
        .filter-button .material-symbols-outlined {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}
