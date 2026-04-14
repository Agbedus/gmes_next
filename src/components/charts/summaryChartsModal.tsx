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

// --- Theme & Palette ---
const THEME_COLORS = [
    0x1E3A8A, // au-dark-green (Primary Blue)
    0xF59E0B, // au-gold
    0x10B981, // au-green
    0x004526, // Official AU Dark Green
    0xFDB813, // Official AU Gold
    0x00843D, // Official AU Green
];

function getThemeColor(index: number) {
    return am5.color(THEME_COLORS[index % THEME_COLORS.length]);
}

// Custom amCharts 5 Theme for AU branding
class AUTheme extends am5.Theme {
    setupDefaultRules() {
        this.rule("Label").setAll({
            fill: am5.color(0x1E3A8A),
            fontSize: 11,
            fontWeight: "700",
            fontFamily: "inherit"
        });

        this.rule("Grid").setAll({
            stroke: am5.color(0x1E3A8A),
            strokeOpacity: 0.05
        });

        this.rule("AxisRendererY").setAll({
            minGridDistance: 30
        });

        this.rule("AxisRendererX").setAll({
            minGridDistance: 50
        });

        // Color palette
        this.rule("ColorSet").set("colors", THEME_COLORS.map(c => am5.color(c)));

        this.rule("Tooltip").setAll({
            getFillFromSprite: false,
            autoTextColor: false
        });

        this.rule("PointedRectangle", ["tooltip", "background"]).setAll({
            fill: am5.color(0xFFFFFF),
            fillOpacity: 1,
            stroke: am5.color(0x1E3A8A),
            strokeOpacity: 0.1,
            cornerRadius: 12,
            shadowColor: am5.color(0x000000),
            shadowBlur: 10,
            shadowOpacity: 0.1,
            shadowOffsetX: 0,
            shadowOffsetY: 5
        });

        this.rule("Label", ["tooltip"]).setAll({
            fill: am5.color(0x1E3A8A),
            fontSize: 12,
            fontWeight: "800"
        });
    }
}

// Service color mapping for consistency
const SERVICE_COLOR_INDEX: Record<string, number> = {
    "Land & water": 2, // Green
    "Marine & coastal": 0, // Blue
    "Conservation & wetlands": 3, // Dark Green
    "Disaster risk & early warning": 1, // Gold
};

// --- Chart Components ---

const BarChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([
            am5themes_Animated.new(root),
            AUTheme.new(root)
        ]);

        const chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false, panY: false, wheelX: "none", wheelY: "none", paddingLeft: 0,
        }));

        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0, 
            categoryField, 
            renderer: am5xy.AxisRendererY.new(root, { 
                minorGridEnabled: true,
                strokeOpacity: 0
            }),
        }));

        const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0, 
            min: 0, 
            renderer: am5xy.AxisRendererX.new(root, {
                strokeOpacity: 0
            }),
        }));

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: title, xAxis, yAxis, valueXField: valueField, sequencedInterpolation: true, categoryYField: categoryField,
        }));

        series.columns.template.setAll({
            tooltipText: "{categoryY}: [bold]{valueX}[/]", 
            cornerRadiusBR: 8, 
            cornerRadiusTR: 8, 
            height: am5.percent(60), 
            strokeOpacity: 0
        });

        series.columns.template.adapters.add("fill", (fill, target) => {
            const di = (target.dataItem as unknown) as { index?: number } | undefined;
            const index = di && typeof di.index === 'number' ? di.index : 0;
            const color = getThemeColor(index);

            // Use solid color for better visibility
            return color;
        });

        (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        series.appear(800);
        chart.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container group transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10 transition-colors group-hover:bg-au-dark-green/10">
                    <IconlyIcon name={icon ?? "Document"} size={20} color="currentColor" />
                </div>
                <h3 className="text-sm font-black text-au-dark-green uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div id={chartId} style={{ width: "100%", height: "300px" }}></div>
        </div>
    );
};

const PieChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([
            am5themes_Animated.new(root),
            AUTheme.new(root)
        ]);

        const chart = root.container.children.push(am5percent.PieChart.new(root, {
            layout: root.verticalLayout,
            innerRadius: am5.percent(40)
        }));

        const series = chart.series.push(am5percent.PieSeries.new(root, {
            valueField, categoryField,
        }));

        series.slices.template.setAll({ 
            cornerRadius: 10, 
            stroke: am5.color(0xffffff), 
            strokeWidth: 3,
            tooltipText: "{category}: [bold]{value}[/]"
        });

        series.slices.template.adapters.add("fill", (fill, target) => {
            const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
            const cat = dataCtx[categoryField] as string | undefined;
            const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
            const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
            const color = getThemeColor(idx as number);

            // Use solid color for better visibility
            return color;
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        const legend = chart.children.push(am5.Legend.new(root, {
            centerX: am5.percent(50), x: am5.percent(50), layout: root.gridLayout,
        }));
        legend.markers.template.setAll({ width: 14, height: 14 });
        legend.markerRectangles.template.setAll({ cornerRadiusTL: 4, cornerRadiusTR: 4, cornerRadiusBL: 4, cornerRadiusBR: 4 });
        legend.data.setAll(series.dataItems);

        series.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container group transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10 transition-colors group-hover:bg-au-dark-green/10">
                    <IconlyIcon name={icon ?? "Document"} size={20} color="currentColor" />
                </div>
                <h3 className="text-sm font-black text-au-dark-green uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div id={chartId} style={{ width: "100%", height: "300px" }}></div>
        </div>
    );
};

const DonutChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; valueField: string }> = ({ chartId, data, categoryField, valueField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([
            am5themes_Animated.new(root),
            AUTheme.new(root)
        ]);

        const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.verticalLayout }));
        const series = chart.series.push(am5percent.PieSeries.new(root, { valueField, categoryField }));

        series.set("innerRadius", am5.percent(65));
        series.slices.template.setAll({ 
            cornerRadius: 12, 
            stroke: am5.color(0xffffff), 
            strokeWidth: 4,
            tooltipText: "{category}: [bold]{value}[/]"
        });

        series.slices.template.adapters.add("fill", (fill, target) => {
            const dataCtx = (target.dataItem?.dataContext as ChartData) ?? {};
            const cat = dataCtx[categoryField] as string | undefined;
            const mapped = cat && typeof SERVICE_COLOR_INDEX[cat] === 'number' ? SERVICE_COLOR_INDEX[cat] : undefined;
            const idx = typeof mapped === 'number' ? mapped : Math.max(0, series.dataItems.findIndex(di => ((di.dataContext as ChartData)[categoryField]) === cat));
            const color = getThemeColor(idx as number);

            // Use solid color for better visibility
            return color;
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        const legend = chart.children.push(am5.Legend.new(root, { 
            centerX: am5.percent(50), 
            x: am5.percent(50),
            layout: root.gridLayout
        }));
        legend.markers.template.setAll({ width: 14, height: 14 });
        legend.markerRectangles.template.setAll({ cornerRadiusTL: 4, cornerRadiusTR: 4, cornerRadiusBL: 4, cornerRadiusBR: 4 });
        legend.data.setAll(series.dataItems);

        series.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, valueField, title]);

    return (
        <div className="chart-container group transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10 transition-colors group-hover:bg-au-dark-green/10">
                    <IconlyIcon name={icon ?? "Document"} size={20} color="currentColor" />
                </div>
                <h3 className="text-sm font-black text-au-dark-green uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div id={chartId} style={{ width: "100%", height: "300px" }}></div>
        </div>
    );
};

const GanttChart: React.FC<BaseChartProps & { data: ChartData[]; categoryField: string; startField: string; endField: string }> = ({ chartId, data, categoryField, startField, endField, title, icon }) => {
    useLayoutEffect(() => {
        const root = am5.Root.new(chartId);
        root.setThemes([
            am5themes_Animated.new(root),
            AUTheme.new(root)
        ]);

        const chart = root.container.children.push(am5xy.XYChart.new(root, { 
            layout: root.verticalLayout,
            paddingLeft: 0
        }));

        const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, { 
            baseInterval: { timeUnit: "day", count: 1 }, 
            renderer: am5xy.AxisRendererX.new(root, { 
                strokeOpacity: 0,
                minGridDistance: 80
            }) 
        }));
        
        const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { 
            categoryField, 
            renderer: am5xy.AxisRendererY.new(root, { 
                strokeOpacity: 0,
                minorGridEnabled: false
            }) 
        }));

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            xAxis, yAxis, valueXField: endField, openValueXField: startField, categoryYField: categoryField, clustered: false,
        }));

        series.columns.template.setAll({ 
            height: am5.percent(40), 
            cornerRadiusTR: 10, 
            cornerRadiusBR: 10, 
            cornerRadiusTL: 10, 
            cornerRadiusBL: 10, 
            strokeOpacity: 0,
            tooltipText: "{categoryY}: [bold]{openValueX.formatDate('MMM yyyy')} - {valueX.formatDate('MMM yyyy')}[/]"
        });
        
        series.columns.template.adapters.add("fill", (fill, target) => {
            const di = (target.dataItem as unknown) as { index?: number } | undefined;
            const index = di && typeof di.index === 'number' ? di.index : 0;
            const color = getThemeColor(index);

            // Use solid color for better visibility
            return color;
        });

        ((series.data) as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);
        (yAxis.data as unknown as { setAll: (arg: ChartData[]) => void }).setAll(data);

        chart.appear(800, 100);

        return () => root.dispose();
    }, [chartId, data, categoryField, startField, endField, title]);

    return (
        <div className="chart-container group transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10 transition-colors group-hover:bg-au-dark-green/10">
                    <IconlyIcon name={icon ?? "Document"} size={20} color="currentColor" />
                </div>
                <h3 className="text-sm font-black text-au-dark-green uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div id={chartId} style={{ width: "100%", height: "400px" }}></div>
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex flex-col bg-au-bg animate-in fade-in duration-300">
            {/* Header: Unified Finova Style */}
            <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-au-dark-green/10 z-10">
                <div className="flex items-center gap-6">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-au-dark-green/5 text-au-dark-green border border-au-dark-green/10 shadow-sm">
                        <IconlyIcon name="monitoring" size={28} color="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-au-dark-green tracking-tighter">Programme Analytics</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-au-gold animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Continental Performance Hub • GMES & Africa</p>
                        </div>
                    </div>
                </div>
                <button 
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-au-dark-green hover:bg-au-dark-green hover:text-white transition-all duration-300 border border-au-dark-green/10 shadow-sm hover:shadow-md" 
                    onClick={onCloseAction}
                >
                    <X size={24} className="transition-transform group-hover:rotate-90" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 scrollbar-hide">
                <div className="max-w-7xl mx-auto space-y-32">

                    {/* Service Portfolio */}
                    <section>
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-au-dark-green rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Strategic Domain</h3>
                            </div>
                            <h4 className="text-4xl font-black text-au-dark-green tracking-tight ml-4">Service Portfolio</h4>
                            <p className="text-sm font-bold text-slate-400 ml-4 max-w-2xl">Operational status and continental breakdown of the core GMES & Africa service domains.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <DonutChart chartId="service-donut-chart" data={serviceDistribution} categoryField="service"
                                            valueField="value" title="Continental Service Mix" icon="category"/>
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <PieChart chartId="service-pie-chart" data={serviceDistribution} categoryField="service"
                                          valueField="value" title="Service Distribution" icon="pie_chart"/>
                            </div>
                        </div>
                    </section>

                    {/* Impact & Reach */}
                    <section>
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-au-green rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Operational Footprint</h3>
                            </div>
                            <h4 className="text-4xl font-black text-au-dark-green tracking-tight ml-4">Impact & Financials</h4>
                            <p className="text-sm font-bold text-slate-400 ml-4 max-w-2xl">Quantitative metrics reflecting financial investment and territorial expansion across the continent.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="funding-chart" data={fundingData} categoryField="category" 
                                          valueField="value" title="Funding (EUR Millions)" icon="wallet" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="reach-chart" data={reachData} categoryField="category" 
                                          valueField="value" title="Geographical Reach" icon="location" />
                            </div>
                        </div>
                    </section>

                    {/* Capacity Building */}
                    <section>
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-au-gold rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Human Capital</h3>
                            </div>
                            <h4 className="text-4xl font-black text-au-dark-green tracking-tight ml-4">Capacity & Infrastructure</h4>
                            <p className="text-sm font-bold text-slate-400 ml-4 max-w-2xl">Human resource development and technical infrastructure deployment monitoring.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="au-card p-10 bg-white border border-au-gold/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="capacity-chart" data={capacityData} categoryField="category" 
                                          valueField="value" title="Training & Education" icon="school" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-gold/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="infra-chart" data={infrastructureData} categoryField="category" 
                                          valueField="value" title="Observation Networks" icon="activity" />
                            </div>
                        </div>
                    </section>

                    {/* Consortia Benchmarking */}
                    <section>
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-au-dark-green rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Performance Benchmarking</h3>
                            </div>
                            <h4 className="text-4xl font-black text-au-dark-green tracking-tight ml-4">Consortia Analytics</h4>
                            <p className="text-sm font-bold text-slate-400 ml-4 max-w-2xl">Comparative data across regional implementing partners and consortia members.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="c-training" data={getConsortiaData("4.1")} categoryField="category"
                                          valueField="value" title="Trainees per Lead Institution" icon="user" />
                            </div>
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <BarChart chartId="c-access" data={getConsortiaData("2.3")} categoryField="category"
                                          valueField="value" title="Data Access Nodes" icon="paper" />
                            </div>
                        </div>
                    </section>

                    {/* Programme Timeline */}
                    <section>
                        <div className="flex flex-col gap-3 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-au-dark-green rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Strategic Roadmap</h3>
                            </div>
                            <h4 className="text-4xl font-black text-au-dark-green tracking-tight ml-4">Programme Timeline</h4>
                            <p className="text-sm font-bold text-slate-400 ml-4 max-w-2xl">Milestones, current progress and future projections for GMES & Africa phases.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 pb-32">
                            <div className="au-card p-10 bg-white border border-au-dark-green/10 shadow-sm hover:shadow-md transition-all duration-500">
                                <GanttChart chartId="timeline-chart" data={timelineData} categoryField="category" 
                                            startField="start" endField="end" title="Operational Roadmap" icon="time_circle" />
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            {/* Footer: Finova Visual Standards */}
            <footer className="px-12 py-10 bg-white border-t border-au-dark-green/10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-10">
                        <img src="/logos/expanded_logo.png" alt="GMES & Africa" className="h-16 w-auto" />
                        <div className="h-14 w-px bg-au-dark-green/10 hidden lg:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Knowledge Ecosystem</span>
                            <span className="text-sm font-black text-au-dark-green">African Union Commission</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4">
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-green/5 border border-au-green/10 text-[10px] font-black text-au-green uppercase tracking-[0.2em]">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-au-green opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-au-green" />
                            </div>
                            Live Data Feed
                         </div>
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-gold/5 border border-au-gold/10 text-[10px] font-black text-au-gold uppercase tracking-[0.2em]">
                            Phase II Validated
                         </div>
                         <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-au-dark-green/5 border border-au-dark-green/10 text-[10px] font-black text-au-dark-green uppercase tracking-[0.2em]">
                            v2.0 Performance Engine
                         </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                .au-card {
                    border-radius: 2rem;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );

}
