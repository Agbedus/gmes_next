"use client";
import React, { useLayoutEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import programData from '@/data/program.json';

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
    "Land & water": 0,
    "Marine & coastal": 1,
    "Conservation & wetlands": 2,
    "Disaster risk & early warning": 3,
};

// --- props types reused by chart components ---
type BarChartProps = BaseChartProps & {
    data: ChartData[];
    categoryField: string;
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

// --- New: Gantt-style chart (using XY ColumnSeries with openValueXField for ranges) ---
const GanttChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; startField: string; endField: string }> = ({ chartId, data, categoryField, startField, endField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));

        const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, { 
            baseInterval: { timeUnit: "day", count: 1 }, 
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }) 
        }));
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { 
            categoryField, 
            renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 20 }) 
        }));

        // Make y-axis labels smaller to fit long text
        ((yAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ 
            fontSize: 10, 
            maxWidth: 150,
            oversizedBehavior: "wrap"
        });

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis, yAxis, valueXField: endField, openValueXField: startField, categoryYField: categoryField, clustered: false,
        }));

        series.columns.template.setAll({ height: am5.percent(60), cornerRadiusTR: 6, cornerRadiusBR: 6, cornerRadiusTL: 6, cornerRadiusBL: 6 });
        series.columns.template.adapters.add("fill", (fill, target) => {
            const di = (target.dataItem as unknown) as { index?: number } | undefined;
            const index = di && typeof di.index === 'number' ? di.index : 0;
            return getPastel(index);
        });
        series.columns.template.set("strokeOpacity", 0);

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

    // --- Data Transformation ---
    
    // 1. Service Distribution (Count of items per category)
    const serviceDistribution = programData.services.map(s => ({
        service: s.category,
        value: s.items.length
    }));

    // 2. Funding Overview (KPIs)
    const fundingData = programData.kpis
        .filter(k => k.amount_eur_millions)
        .map(k => ({
            category: k.label,
            value: k.amount_eur_millions
        }));

    // 3. Program Reach (Institutions & Countries)
    const reachData = [
        { category: "Institutions", value: 122 }, // From Phase 1 grant & coverage
        { category: "Countries", value: 45 },     // From Phase 1 grant & coverage
    ];

    // 4. Capacity Building
    const capacityData = [
        { category: "Trained", value: 5000 },
        { category: "Degrees", value: 46 },
        { category: "Internships", value: 11 },
    ];

    // 5. Infrastructure
    const infrastructureData = [
        { category: "Equipped Inst.", value: 12 },
        { category: "eStations", value: 188 },
    ];

    // 6. Timeline
    const timelineData = programData.timeline.map(t => {
        let start, end;
        if (t.year) {
            start = new Date(t.year, 0, 1).getTime();
            end = new Date(t.year, 11, 31).getTime();
        } else if (t.years) {
            const [s, e] = t.years.split('–').map(y => parseInt(y.trim()));
            start = new Date(s, 0, 1).getTime();
            end = new Date(e, 11, 31).getTime();
        }
        return {
            category: t.event,
            start,
            end
        };
    });

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
                            <h3 className="mb-4 text-sm font-semibold text-zinc-700">Service Portfolio</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="chart-card">
                                    <DonutChart chartId="service-donut-chart" data={serviceDistribution} categoryField="service"
                                                valueField="value" title="Service Distribution" icon="donut_large"/>
                                </div>
                                <div className="chart-card">
                                    <PieChart chartId="service-pie-chart" data={serviceDistribution} categoryField="service"
                                              valueField="value" title="Services Breakdown" icon="pie_chart"/>
                                </div>
                            </div>
                        </section>

                        {/* Financials & Reach Section */}
                        <section>
                            <h3 className="mb-4 text-sm font-semibold text-zinc-700">Impact & Reach</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="chart-card">
                                    <BarChart chartId="funding-chart" data={fundingData} categoryField="category" 
                                              valueField="value" title="Funding (EUR Millions)" icon="attach_money" />
                                </div>

                                <div className="chart-card">
                                    <BarChart chartId="reach-chart" data={reachData} categoryField="category" 
                                              valueField="value" title="Program Reach (Count)" icon="public" />
                                </div>
                            </div>
                        </section>

                        {/* Capacity & Infrastructure Section */}
                        <section>
                            <h3 className="mb-4 text-sm font-semibold text-zinc-700">Capacity & Infrastructure</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="chart-card">
                                    <BarChart chartId="capacity-chart" data={capacityData} categoryField="category" 
                                              valueField="value" title="Capacity Building" icon="school" />
                                </div>

                                <div className="chart-card">
                                    <BarChart chartId="infra-chart" data={infrastructureData} categoryField="category" 
                                              valueField="value" title="Infrastructure" icon="satellite_alt" />
                                </div>
                            </div>
                        </section>

                        {/* Timeline Section */}
                        <section>
                            <h3 className="mb-4 text-sm font-semibold text-zinc-700">Programme Timeline</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="chart-card">
                                    <GanttChart chartId="timeline-chart" data={timelineData} categoryField="category" 
                                                startField="start" endField="end" title="Key Milestones" icon="history" />
                                </div>
                            </div>
                        </section>

                    </div>
                </main>

                <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-zinc-200">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-sm text-zinc-500">
                            Data source: GMES & Africa Support Programme
                        </div>
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
      `}</style>
        </div>
    );
}
