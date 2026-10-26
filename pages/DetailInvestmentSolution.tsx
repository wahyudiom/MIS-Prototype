import React, { useMemo, useState } from 'react';
import type { DetailKPICardData, BreakdownData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    BreakdownDonutChart, 
    TrendComposedChart,
    formatCurrency,
    SectionTitle
} from '../components/Shared';
import { CalendarIcon } from '../components/Icons';

interface DetailInvestmentSolutionProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total AUM', 
    valueYTD: formatCurrency(0.8e12), 
    valueMTD: formatCurrency(0.82e12)
  },
  { 
    label: 'Net Inflow AUM', 
    valueYTD: formatCurrency(35e9), 
    valueMTD: formatCurrency(6e9)
  },
  { 
    label: 'Total Revenue', 
    valueYTD: formatCurrency(18e9), 
    valueMTD: formatCurrency(3e9),
    changeYTD: 11.3, 
    changeMTD: 1.8 
  },
  { 
    label: 'Avg Revenue per Client (RPA)', 
    valueYTD: formatCurrency(30e6), 
    valueMTD: formatCurrency(31e6)
  },
  { 
    label: 'Total AUM Mutual Funds', 
    valueYTD: formatCurrency(0.32e12), 
    valueMTD: formatCurrency(0.33e12)
  },
];

type TrendFrequency = 'daily' | 'monthly' | 'yearly';

type TrendRanges = {
    daily: { start: string; end: string };
    monthly: { start: string; end: string };
    yearly: { start: number; end: number };
};

type TrendBucket = {
    label: string;
    start: Date;
    end: Date;
};

type PriorityDailyFact = {
    totalAsset: number;
    assetNett: number;
    newClients: number;
    totalClients: number;
    mutualFundAum: number;
    mutualFundNett: number;
    revenue: number;
    revenueChange: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DATA_EPOCH = new Date(Date.UTC(2022, 0, 1));
const LATEST_AVAILABLE_DATE = '2026-08-17';
const EARLIEST_AVAILABLE_DATE = '2022-01-01';
const AVAILABLE_YEARS = [2022, 2023, 2024, 2025, 2026];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseIsoDate = (value: string) => new Date(`${value}T00:00:00Z`);

const startOfMonth = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
};

const endOfMonth = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month, 0));
};

const minDate = (left: Date, right: Date) => left.getTime() <= right.getTime() ? left : right;

const eachDate = (start: Date, end: Date) => {
    const dates: Date[] = [];
    for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
        dates.push(new Date(time));
    }
    return dates;
};

const buildDailyFact = (date: Date): PriorityDailyFact => {
    const dayIndex = Math.round((date.getTime() - DATA_EPOCH.getTime()) / DAY_MS);
    const shortWave = Math.sin(dayIndex / 10);
    const longWave = Math.cos(dayIndex / 31);

    return {
        totalAsset: Math.round(620e9 + dayIndex * 108e6 + longWave * 8e9),
        assetNett: Math.round(420e6 + shortWave * 710e6),
        newClients: 1 + Math.abs((dayIndex * 13 + 7) % 5),
        totalClients: 340 + Math.floor(dayIndex * 0.18),
        mutualFundAum: Math.round(220e9 + dayIndex * 64e6 + longWave * 3.2e9),
        mutualFundNett: Math.round(120e6 + shortWave * 260e6),
        revenue: Math.round(44e6 + Math.abs(Math.sin(dayIndex / 8)) * 17e6 + (dayIndex % 5) * 1.5e6),
        revenueChange: Number((2.1 + Math.sin(dayIndex / 9) * 4.6).toFixed(1)),
    };
};

const formatDailyAxisLabel = (date: Date) => new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
}).format(date);

const formatMonthLabel = (date: Date) => `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

const buildTrendBuckets = (frequency: TrendFrequency, ranges: TrendRanges): TrendBucket[] => {
    const latestDate = parseIsoDate(LATEST_AVAILABLE_DATE);

    if (frequency === 'daily') {
        const start = parseIsoDate(ranges.daily.start);
        const end = minDate(parseIsoDate(ranges.daily.end), latestDate);
        return eachDate(start, end).map((date) => ({ label: formatDailyAxisLabel(date), start: date, end: date }));
    }

    if (frequency === 'monthly') {
        const start = startOfMonth(ranges.monthly.start);
        const end = startOfMonth(ranges.monthly.end);
        const buckets: TrendBucket[] = [];
        for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))) {
            buckets.push({
                label: formatMonthLabel(cursor),
                start: cursor,
                end: minDate(endOfMonth(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`), latestDate),
            });
        }
        return buckets;
    }

    return Array.from({ length: ranges.yearly.end - ranges.yearly.start + 1 }, (_, index) => {
        const year = ranges.yearly.start + index;
        return {
            label: String(year),
            start: new Date(Date.UTC(year, 0, 1)),
            end: minDate(new Date(Date.UTC(year, 11, 31)), latestDate),
        };
    });
};

const aggregateBucket = (bucket: TrendBucket) => {
    const facts = eachDate(bucket.start, bucket.end).map(buildDailyFact);
    const divisor = Math.max(facts.length, 1);
    const finalFact = facts[facts.length - 1] ?? buildDailyFact(bucket.start);

    return {
        totalAsset: finalFact.totalAsset,
        assetNett: facts.reduce((sum, fact) => sum + fact.assetNett, 0),
        newClients: facts.reduce((sum, fact) => sum + fact.newClients, 0),
        totalClients: finalFact.totalClients,
        mutualFundAum: finalFact.mutualFundAum,
        mutualFundNett: facts.reduce((sum, fact) => sum + fact.mutualFundNett, 0),
        revenue: facts.reduce((sum, fact) => sum + fact.revenue, 0),
        revenueChange: Number((facts.reduce((sum, fact) => sum + fact.revenueChange, 0) / divisor).toFixed(1)),
    };
};

const buildTrendDatasets = (buckets: TrendBucket[]) => {
    const aggregates = buckets.map((bucket) => ({ label: bucket.label, ...aggregateBucket(bucket) }));

    return {
        assetValue: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.totalAsset,
            lineValue: point.assetNett,
        })),
        clients: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.newClients,
            lineValue: point.totalClients,
        })),
        mutualFunds: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.mutualFundAum,
            lineValue: point.mutualFundNett,
        })),
        revenue: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.revenue,
            lineValue: point.revenueChange,
        })),
    };
};

const formatDailyRange = (startValue: string, endValue: string) => {
    const start = parseIsoDate(startValue);
    const end = parseIsoDate(endValue);
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    const startLabel = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: sameYear ? undefined : 'numeric',
        timeZone: 'UTC',
    }).format(start);
    const endLabel = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(end);
    return `${startLabel} – ${endLabel}`;
};

const countMonths = (startValue: string, endValue: string) => {
    const start = startOfMonth(startValue);
    const end = startOfMonth(endValue);
    return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1;
};

const portfolioBreakdownData: BreakdownData[] = [
    { name: 'Stocks', value: 0.35e12 },
    { name: 'Bonds', value: 0.25e12 },
    { name: 'Mutual Funds', value: 0.20e12 },
];

const baseLeaderboard = [
    { name: "David Copperfield", aum: 100e9, inflow: 9e9, revenue: 2e9, rpa: 35e6, clients: 120 },
    { name: "Eva Green", aum: 90e9, inflow: 7.5e9, revenue: 1.8e9, rpa: 32e6, clients: 110 },
    { name: "Frank White", aum: 80e9, inflow: 6e9, revenue: 1.5e9, rpa: 28e6, clients: 100 },
];

const DetailInvestmentSolution: React.FC<DetailInvestmentSolutionProps> = ({ onSalespersonClick }) => {
    const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>('daily');
    const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
    const [trendRanges, setTrendRanges] = useState<TrendRanges>({
        daily: { start: '2026-07-19', end: LATEST_AVAILABLE_DATE },
        monthly: { start: '2025-09', end: '2026-08' },
        yearly: { start: 2022, end: 2026 },
    });

    const trendBuckets = useMemo(
        () => buildTrendBuckets(trendFrequency, trendRanges),
        [trendFrequency, trendRanges],
    );
    const trendDatasets = useMemo(() => buildTrendDatasets(trendBuckets), [trendBuckets]);
    const frequencyLabel = `${trendFrequency.charAt(0).toUpperCase()}${trendFrequency.slice(1)}`;
    const trendRangeSubtitle = useMemo(() => {
        if (trendFrequency === 'daily') {
            return formatDailyRange(trendRanges.daily.start, trendRanges.daily.end);
        }

        if (trendFrequency === 'monthly') {
            const monthCount = countMonths(trendRanges.monthly.start, trendRanges.monthly.end);
            return `${monthCount}-month range: ${formatMonthLabel(startOfMonth(trendRanges.monthly.start))} – ${formatMonthLabel(startOfMonth(trendRanges.monthly.end))}`;
        }

        const yearCount = trendRanges.yearly.end - trendRanges.yearly.start + 1;
        return `${yearCount}-year range: ${trendRanges.yearly.start} – ${trendRanges.yearly.end}`;
    }, [trendFrequency, trendRanges]);

    const updateDailyStart = (start: string) => {
        setTrendRanges((current) => ({
            ...current,
            daily: {
                start,
                end: start > current.daily.end ? start : current.daily.end,
            },
        }));
    };

    const updateDailyEnd = (end: string) => {
        setTrendRanges((current) => ({
            ...current,
            daily: {
                start: end < current.daily.start ? end : current.daily.start,
                end,
            },
        }));
    };

    const updateMonthlyStart = (start: string) => {
        setTrendRanges((current) => ({
            ...current,
            monthly: {
                start,
                end: start > current.monthly.end ? start : current.monthly.end,
            },
        }));
    };

    const updateMonthlyEnd = (end: string) => {
        setTrendRanges((current) => ({
            ...current,
            monthly: {
                start: end < current.monthly.start ? end : current.monthly.start,
                end,
            },
        }));
    };

    const leaderboardData = useMemo(() => {
        const multiplier = 1.1;
        const offset = 0.15;

        return baseLeaderboard.map((item, idx) => [
            idx + 1,
            item.name,
            formatCurrency(item.aum * multiplier * (1 + offset)),
            formatCurrency(item.inflow * multiplier),
            formatCurrency(item.revenue * multiplier),
            formatCurrency(item.rpa * multiplier),
            Math.floor(item.clients * multiplier)
        ]);
    }, []);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <DetailKPICard data={kpiData[0]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[1]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[2]} />
                <DetailKPICard data={kpiData[3]} />
                <DetailKPICard data={kpiData[4]} hideMTD hideLabels />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PRODUCT PENETRATION RATE</h3>
                <p className="text-6xl font-black text-pink-500">42%</p>
                <p className="text-sm font-medium text-gray-500 mt-4">Clients with multiple investment products</p>
            </div>

            <section className="border-t border-slate-200 pt-8">
                <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Trends</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{frequencyLabel} Trends Overview</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">{trendRangeSubtitle}</p>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsTimeFilterOpen((open) => !open)}
                            aria-expanded={isTimeFilterOpen}
                            aria-haspopup="dialog"
                            className="min-w-[270px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-200"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Time Filter</p>
                                        <p className="text-sm font-black text-slate-950">{trendRangeSubtitle}</p>
                                    </div>
                                </div>
                                <span aria-hidden="true" className="text-lg text-slate-400">{isTimeFilterOpen ? '⌃' : '⌄'}</span>
                            </div>
                        </button>

                        {isTimeFilterOpen && (
                            <div
                                role="dialog"
                                aria-label="Priority Client Services trends time filter"
                                className="absolute right-0 top-full z-50 mt-3 w-[430px] max-w-[calc(100vw-2rem)] rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl"
                            >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h3 className="text-lg font-black text-slate-950">Time Filter</h3>
                                    <button type="button" onClick={() => setIsTimeFilterOpen(false)} className="text-sm font-black text-slate-400 hover:text-slate-700" aria-label="Close time filter">
                                        ✕
                                    </button>
                                </div>

                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Frequency</p>
                                <div className="mb-5 flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
                                    {(['daily', 'monthly', 'yearly'] as TrendFrequency[]).map((frequency) => (
                                        <button
                                            key={frequency}
                                            type="button"
                                            onClick={() => setTrendFrequency(frequency)}
                                            aria-pressed={trendFrequency === frequency}
                                            className={`flex-1 rounded-xl px-3 py-2 text-xs font-black transition-all ${
                                                trendFrequency === frequency ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
                                            }`}
                                        >
                                            {frequency.charAt(0).toUpperCase()}{frequency.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {trendFrequency === 'daily' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">From date</span>
                                            <input
                                                type="date"
                                                min={EARLIEST_AVAILABLE_DATE}
                                                max={LATEST_AVAILABLE_DATE}
                                                value={trendRanges.daily.start}
                                                onChange={(event) => updateDailyStart(event.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">To date</span>
                                            <input
                                                type="date"
                                                min={EARLIEST_AVAILABLE_DATE}
                                                max={LATEST_AVAILABLE_DATE}
                                                value={trendRanges.daily.end}
                                                onChange={(event) => updateDailyEnd(event.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            />
                                        </label>
                                    </div>
                                )}

                                {trendFrequency === 'monthly' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">From month</span>
                                            <input
                                                type="month"
                                                min="2022-01"
                                                max="2026-08"
                                                value={trendRanges.monthly.start}
                                                onChange={(event) => updateMonthlyStart(event.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            />
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">To month</span>
                                            <input
                                                type="month"
                                                min="2022-01"
                                                max="2026-08"
                                                value={trendRanges.monthly.end}
                                                onChange={(event) => updateMonthlyEnd(event.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            />
                                        </label>
                                    </div>
                                )}

                                {trendFrequency === 'yearly' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">Start year</span>
                                            <select
                                                value={trendRanges.yearly.start}
                                                onChange={(event) => {
                                                    const start = Number(event.target.value);
                                                    setTrendRanges((current) => ({ ...current, yearly: { start, end: Math.max(start, current.yearly.end) } }));
                                                }}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            >
                                                {AVAILABLE_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">End year</span>
                                            <select
                                                value={trendRanges.yearly.end}
                                                onChange={(event) => {
                                                    const end = Number(event.target.value);
                                                    setTrendRanges((current) => ({ ...current, yearly: { start: Math.min(end, current.yearly.start), end } }));
                                                }}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                                            >
                                                {AVAILABLE_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                                            </select>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <TrendComposedChart
                        data={trendDatasets.assetValue}
                        title={`${frequencyLabel} Asset Value Growth`}
                        subtitle="In IDR Billion"
                        barLabel1="Total Asset"
                        lineLabel="Nett"
                        isCurrency={true}
                        isLineCurrency={true}
                    />
                    <TrendComposedChart
                        data={trendDatasets.clients}
                        title={`${frequencyLabel} New vs Total Client Trends`}
                        barLabel1="New Clients"
                        lineLabel="Total Clients"
                    />
                    <TrendComposedChart
                        data={trendDatasets.mutualFunds}
                        title={`${frequencyLabel} AUM Mutual Funds Growth`}
                        subtitle="In IDR Billion"
                        barLabel1="Total Asset"
                        lineLabel="Nett"
                        isCurrency={true}
                        isLineCurrency={true}
                    />
                    <TrendComposedChart
                        data={trendDatasets.revenue}
                        title={`${frequencyLabel} Total Revenue Trends`}
                        barLabel1="Revenue"
                        lineLabel="Changes (%)"
                        isCurrency={true}
                        isLinePercentage={true}
                    />
                </div>
            </section>

            <section>
                <SectionTitle title="YEAR TO DATE BREAKDOWN" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BreakdownDonutChart data={portfolioBreakdownData} title="Portfolio Breakdown" isCurrency />
                </div>
            </section>

            <DataTable
                title="Leaderboard Salesperson (Priority Client Services)" 
                columns={["Ranking", "Salesperson", "Total AUM", "Net Inflow AUM (YTD)", "Total Revenue", "RPA", "Active Clients"]} 
                data={leaderboardData} 
                onRowClick={(row) => onSalespersonClick(row[1] as string)}
            />
        </div>
    );
};

export default DetailInvestmentSolution;
