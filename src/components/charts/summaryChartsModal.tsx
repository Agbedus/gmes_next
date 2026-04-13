"use client";
import React, { useLayoutEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import programData from '@/data/program.json';
import consortiaData from '@/data/consortia_deliverables.json';
import IconlyIcon from "../ui/IconlyIcon";
import { X } from "lucide-react";

// --- Types & Palette ---
type BaseChartProps = {
    chartId: string;
    title: string;
    icon?: string;
};

type ChartData = Record<string, unknown>;

type AxisRendererLike = {
    labels: { template: { setAll: (arg: Record<string, unknown>) => void } };
    ticks: { template: { setAll: (arg: Record<string, unknown>) => void } };
};

// Theme Palette (Blue, Gold, Green)
const THEME_COLORS = [
    0x1E3A8A, // au-dark-green (Blue)
    0xF59E0B, // au-gold
    0x10B981, // au-green
    0x3B82F6, // blue-primary
    0x6366F1, // indigo
];

function getThemeColor(index: number) {
    return am5.color(THEME_COLORS[index % THEME_COLORS.length]);
}

// Service color mapping for consistency
const SERVICE_COLOR_INDEX: Record<string, number> = {
    "Land & water": 0,
    "Marine & coastal": 3,
    "Conservation & wetlands": 2,
    "Disaster risk & early warning": 1,
};

// --- Chart Components ---

const BarChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false, panY: false, wheelX: "none", wheelY: "none", paddingLeft: 0,
        }));

        const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 30, minorGridEnabled: true });
        yRenderer.grid.template.set("location", 1);
        yRenderer.grid.template.setAll({ stroke: am5.color(0x1E3A8A), strokeOpacity: 0.08 });

        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0, categoryField, renderer: yRenderer,
        }));

        ((yAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ fontSize: 10, fill: am5.color(0x1E3A8A), fontWeight: "600" });

        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0, min: 0, renderer: am5xy.AxisRendererX.new(root, { strokeOpacity: 0.06 }),
        }));

        ((xAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ fontSize: 10, fill: am5.color(0x1E3A8A), fontWeight: "500" });

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: title, xAxis, yAxis, valueXField: valueField, sequencedInterpolation: true, categoryYField: categoryField,
        }));

        series.columns.template.setAll({
            tooltipText: "{valueX}", cornerRadiusBR: 12, cornerRadiusTR: 12, height: am5.percent(70), strokeOpacity: 0
        });

        series.columns.template.adapters.add("fill", (fill, target) => {
            const di = (target.dataItem as unknown) as { index?: number } | undefined;
            const index = di && typeof di.index === 'number' ? di.index : 0;
            const color = getThemeColor(index);
            
            return am5.LinearGradient.new(root, {
                stops: [
                    { color: color, opacity: 1 },
                    { color: color, opacity: 0.85 }
                ]
            }) as any;
        });

        (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        series.appear(800);
        chart.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                <IconlyIcon name={icon ?? "Document"} size={18} color="#1E3A8A" /> 
                {title}
            </h3>
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
            innerRadius: am5.percent(40)
        }));

        const series = chart.series.push(am5percent.PieSeries.new(root, {
            valueField, categoryField,
        }));

        series.labels.template.setAll({ fontSize: 11, fill: am5.color(0x1E3A8A), fontWeight: "600" });
        series.ticks.template.setAll({ stroke: am5.color(0x1E3A8A), strokeOpacity: 0.2 });
        series.slices.template.setAll({ cornerRadius: 10, stroke: am5.color(0xffffff), strokeWidth: 3 });

        series.slices.template.adapters.add("fill", (fill, target) => {
            const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
            const cat = dataCtx[categoryField] as string | undefined;
            const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
            const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
            return getThemeColor(idx as number);
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        const legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50), x: am5.percent(50), layout: root.gridLayout,
        }));
        legend.labels.template.setAll({ fontSize: 10, fill: am5.color(0x1E3A8A), fontWeight: "700" });
        legend.markers.template.setAll({ width: 14, height: 14 });
        legend.data.setAll(series.dataItems);

        series.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                <IconlyIcon name={icon ?? "Document"} size={18} color="#1E3A8A" /> 
                {title}
            </h3>
            <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
        </div>
    );
};

const DonutChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.verticalLayout }));
        const series = chart.series.push(am5percent.PieSeries.new(root, { valueField, categoryField }));

        series.set("innerRadius", am5.percent(65));
        series.labels.template.setAll({ fontSize: 11, fill: am5.color(0x1E3A8A), fontWeight: "600" });
        series.ticks.template.setAll({ stroke: am5.color(0x1E3A8A), strokeOpacity: 0.2 });
        series.slices.template.setAll({ cornerRadius: 12, stroke: am5.color(0xffffff), strokeWidth: 3 });

        series.slices.template.adapters.add("fill", (fill, target) => {
            const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
            const cat = dataCtx[categoryField] as string | undefined;
            const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
            const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
            return getThemeColor((idx as number));
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50) }));
        legend.labels.template.setAll({ fontSize: 10, fill: am5.color(0x1E3A8A), fontWeight: "700" });
        legend.data.setAll(series.dataItems);

        series.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                <IconlyIcon name={icon ?? "Document"} size={18} color="#1E3A8A" /> 
                {title}
            </h3>
            <div id={chartId} style={{ width: "100%", height: "320px" }}></div>
        </div>
    );
};

const GanttChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; startField: string; endField: string }> = ({ chartId, data, categoryField, startField, endField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(am5xy.XYChart.new(root, { layout: root.verticalLayout }));

        const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, { 
            baseInterval: { timeUnit: "day", count: 1 }, 
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50, stroke: am5.color(0x1E3A8A), strokeOpacity: 0.1 }) 
        }));
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { 
            categoryField, 
            renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 20, stroke: am5.color(0x1E3A8A), strokeOpacity: 0.1 }) 
        }));

        ((yAxis.get('renderer') as unknown) as AxisRendererLike).labels.template.setAll({ 
            fontSize: 10, fill: am5.color(0x1E3A8A), fontWeight: "600", maxWidth: 150, oversizedBehavior: "wrap"
        });

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis, yAxis, valueXField: endField, openValueXField: startField, categoryYField: categoryField, clustered: false,
        }));

        series.columns.template.setAll({ height: am5.percent(50), cornerRadiusTR: 10, cornerRadiusBR: 10, cornerRadiusTL: 10, cornerRadiusBL: 10, strokeOpacity: 0 });
        series.columns.template.adapters.add("fill", (fill, target) => {
            const di = (target.dataItem as unknown) as { index?: number } | undefined;
            const index = di && typeof di.index === 'number' ? di.index : 0;
            return getThemeColor(index);
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
        (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        chart.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, startField, endField, title]);

    return (
        <div className="chart-container">
            <h3 className="chart-title">
                <IconlyIcon name={icon ?? "Document"} size={18} color="#1E3A8A" /> 
                {title}
            </h3>
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
    const serviceDistribution = programData.services.map(s => ({
        service: s.category,
        value: s.items.length
    }));

    const fundingData = programData.kpis
        .filter(k => k.amount_eur_millions)
        .map(k => ({
            category: k.label,
            value: k.amount_eur_millions
        }));

    const reachData = [
        { category: "Institutions", value: 122 },
        { category: "Countries", value: 45 },
    ];

    const capacityData = [
        { category: "Trainees", value: 5000 },
        { category: "Degrees", value: 46 },
        { category: "Internships", value: 11 },
    ];

    const infrastructureData = [
        { category: "Stations", value: 188 },
        { category: "Equipped", value: 12 },
    ];

    const timelineData = programData.timeline.map(t => {
        let start, end;
        if (t.year) {
            start = new Date(t.year, 0, 1).getTime();
            end = new Date(t.year, 11, 31).getTime();
        } else if (t.years) {
            const parts = t.years.split('–').map(y => parseInt(y.trim()));
            start = new Date(parts[0], 0, 1).getTime();
            end = new Date(parts[1] || parts[0], 11, 31).getTime();
        }
        return { category: t.event, start, end };
    });

    const getConsortiaData = (resultCode: string) => {
        return (consortiaData as any[])
            .filter(c => c.Institution !== "Overall")
            .map(c => {
                const indicator = c.Indicators.find((i: any) => i.Result === resultCode);
                return { category: c.Institution, value: indicator ? indicator.Value : 0 };
            })
            .sort((a, b) => b.value - a.value);
    };

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex flex-col bg-au-bg animate-in slide-in-from-bottom duration-500">
            {/* Header with White Background and Theme Accents */}
            <header className="flex items-center justify-between p-8 bg-white border-b border-au-dark-green/10 z-10">
                <div className="flex items-center gap-6">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-au-dark-green border border-au-dark-green/10">
                        <IconlyIcon name="monitoring" size={28} color="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-au-dark-green tracking-tighter">Programme Analytics</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-au-gold animate-pulse" />
                            <p className="text-[11px] font-black text-au-dark-green/40 uppercase tracking-[0.25em]">Continental Performance Metrics • GMES & Africa</p>
                        </div>
                    </div>
                </div>
                <button 
                    className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-au-dark-green/5 text-au-dark-green hover:bg-au-dark-green hover:text-white transition-all duration-300 border border-au-dark-green/10" 
                    onClick={onCloseAction}
                >
                    <X size={24} className="transition-transform group-hover:rotate-90" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 scrollbar-hide">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Service Portfolio */}
                    <section>
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-au-dark-green rounded-full" />
                                <h3 className="text-3xl font-black text-au-dark-green tracking-tight">Service Portfolio</h3>
                            </div>
                            <p className="text-base font-bold text-au-dark-green/50 ml-6 uppercase tracking-wider">Breakdown of operational services across continental priorities.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <DonutChart chartId="service-donut-chart" data={serviceDistribution} categoryField="service"
                                            valueField="value" title="Service Distribution" icon="donut_large"/>
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <PieChart chartId="service-pie-chart" data={serviceDistribution} categoryField="service"
                                          valueField="value" title="Continental Breakdown" icon="pie_chart"/>
                            </div>
                        </div>
                    </section>

                    {/* Impact & Reach */}
                    <section>
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-au-green rounded-full" />
                                <h3 className="text-3xl font-black text-au-dark-green tracking-tight">Impact & Reach</h3>
                            </div>
                            <p className="text-base font-bold text-au-dark-green/50 ml-6 uppercase tracking-wider">Key performance indicators for funding and program coverage.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <BarChart chartId="funding-chart" data={fundingData} categoryField="category" 
                                          valueField="value" title="Funding (EUR Millions)" icon="attach_money" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <BarChart chartId="reach-chart" data={reachData} categoryField="category" 
                                          valueField="value" title="Target Reach" icon="public" />
                            </div>
                        </div>
                    </section>

                    {/* Capacity Building */}
                    <section>
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-au-gold rounded-full" />
                                <h3 className="text-3xl font-black text-au-dark-green tracking-tight">Capacity & Infrastructure</h3>
                            </div>
                            <p className="text-base font-bold text-au-dark-green/50 ml-6 uppercase tracking-wider">Training impact and technical station deployment status.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="au-card p-10 bg-white border border-au-gold/10">
                                <BarChart chartId="capacity-chart" data={capacityData} categoryField="category" 
                                          valueField="value" title="Capacity Building" icon="school" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-gold/10">
                                <BarChart chartId="infra-chart" data={infrastructureData} categoryField="category" 
                                          valueField="value" title="Infrastructure" icon="satellite_alt" />
                            </div>
                        </div>
                    </section>

                    {/* Consortia Benchmarking */}
                    <section>
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-au-dark-green rounded-full" />
                                <h3 className="text-3xl font-black text-au-dark-green tracking-tight">Consortia Benchmarking</h3>
                            </div>
                            <p className="text-base font-bold text-au-dark-green/50 ml-6 uppercase tracking-wider">Comparative performance across regional consortia.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <BarChart chartId="c-training" data={getConsortiaData("4.1")} categoryField="category"
                                          valueField="value" title="Trainees per Consortium" icon="school" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <BarChart chartId="c-access" data={getConsortiaData("2.3")} categoryField="category"
                                          valueField="value" title="Data Access (Inst.)" icon="cloud_download" />
                            </div>
                        </div>
                    </section>

                    {/* Programme Timeline */}
                    <section>
                        <div className="flex flex-col gap-2 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-2 bg-au-dark-green rounded-full" />
                                <h3 className="text-3xl font-black text-au-dark-green tracking-tight">Programme Timeline</h3>
                            </div>
                            <p className="text-base font-bold text-au-dark-green/50 ml-6 uppercase tracking-wider">Historical milestones and future phase projections.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-12 pb-24">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10">
                                <GanttChart chartId="timeline-chart" data={timelineData} categoryField="category" 
                                            startField="start" endField="end" title="Key Milestones" icon="history" />
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            {/* Sticky Footer with Theme Colors */}
            <footer className="p-12 bg-white border-t border-au-dark-green/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <img src="/logos/expanded_logo.png" alt="GMES & Africa" className="h-14 w-auto" />
                        <div className="h-12 w-px bg-au-dark-green/20 hidden md:block" />
                        <div className="text-xs font-black text-au-dark-green/40 uppercase tracking-[0.2em] leading-relaxed">
                            Knowledge Product of the <br/><span className="text-au-dark-green font-black">African Union Commission</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-green/10 border border-au-green/20 text-[11px] font-black text-au-green uppercase tracking-[0.2em]">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-au-green opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-au-green" />
                            </div>
                            Data Synchronized
                         </div>
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-gold/10 border border-au-gold/20 text-[11px] font-black text-au-gold uppercase tracking-[0.2em]">
                            Phase II Validated
                         </div>
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-dark-green/5 border border-au-dark-green/10 text-[11px] font-black text-au-dark-green uppercase tracking-[0.2em]">
                            Analytics Hub v2.0
                         </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                .au-card {
                    border-radius: 3rem;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .au-card:hover {
                    transform: translateY(-12px) scale(1.02);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
