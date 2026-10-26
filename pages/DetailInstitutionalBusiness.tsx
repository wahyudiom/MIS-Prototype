
import React, { useMemo, useState } from 'react';
import type { DetailKPICardData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    ConcentrationChart, 
    TrendComposedChart,
    ADVCombinedBreakdown,
    formatCurrency, 
    formatNumber,
} from '../components/Shared';
import { CalendarIcon } from '../components/Icons';

interface DetailInstitutionalBusinessProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total Transaction Volume', 
    valueYTD: formatCurrency(15e12), 
    valueMTD: formatCurrency(2.1e12),
    changeYTD: 10.5, 
    changeMTD: 2.2 
  },
  { 
    label: 'Total Revenue (Fee)', 
    valueYTD: formatCurrency(75e9), 
    valueMTD: formatCurrency(12e9),
    changeYTD: 11.2, 
    changeMTD: 2.5 
  },
  { 
    label: 'New Institutional Accounts', 
    valueYTD: formatNumber(42), 
    valueMTD: formatNumber(5),
    changeYTD: 8.1, 
    changeMTD: 1.2 
  },
  { 
    label: 'Average Volume per Client', 
    valueYTD: formatCurrency(357e9), 
    valueMTD: formatCurrency(360e9),
    changeYTD: 1.5, 
    changeMTD: 0.3 
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

type InstitutionalDailyFact = {
    volume: number;
    volumeChange: number;
    newClients: number;
    totalClients: number;
    revenue: number;
    revenueChange: number;
    domesticAdv: number;
    foreignAdv: number;
    corporateAdv: number;
    financialInstitutionAdv: number;
    otherInstitutionAdv: number;
    retailAdv: number;
    securitiesCompanyAdv: number;
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

const buildDailyFact = (date: Date): InstitutionalDailyFact => {
    const dayIndex = Math.round((date.getTime() - DATA_EPOCH.getTime()) / DAY_MS);
    const shortWave = Math.sin(dayIndex / 9);
    const longWave = Math.cos(dayIndex / 33);
    const totalAdv = 15.5 + dayIndex * 0.0065 + longWave * 2.8;
    const domesticShare = 0.63 + shortWave * 0.055;
    const retailShare = 0.48 + shortWave * 0.04;
    const corporateShare = 0.09 + longWave * 0.01;
    const financialShare = 0.24 - shortWave * 0.02;
    const securitiesShare = 0.09 + longWave * 0.01;
    const otherShare = 1 - retailShare - corporateShare - financialShare - securitiesShare;

    return {
        volume: Math.round(58e9 + dayIndex * 12e6 + Math.abs(shortWave) * 31e9),
        volumeChange: Number((1.6 + Math.sin(dayIndex / 8) * 5.4).toFixed(1)),
        newClients: Math.abs((dayIndex * 11 + 3) % 3),
        totalClients: 120 + Math.floor(dayIndex / 27),
        revenue: Math.round(255e6 + Math.abs(Math.cos(dayIndex / 10)) * 175e6 + (dayIndex % 4) * 9e6),
        revenueChange: Number((2.2 + Math.cos(dayIndex / 11) * 5.8).toFixed(1)),
        domesticAdv: Number((totalAdv * domesticShare).toFixed(2)),
        foreignAdv: Number((totalAdv * (1 - domesticShare)).toFixed(2)),
        corporateAdv: Number((totalAdv * corporateShare).toFixed(2)),
        financialInstitutionAdv: Number((totalAdv * financialShare).toFixed(2)),
        otherInstitutionAdv: Number((totalAdv * otherShare).toFixed(2)),
        retailAdv: Number((totalAdv * retailShare).toFixed(2)),
        securitiesCompanyAdv: Number((totalAdv * securitiesShare).toFixed(2)),
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

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

const aggregateBucket = (bucket: TrendBucket) => {
    const facts = eachDate(bucket.start, bucket.end).map(buildDailyFact);
    const finalFact = facts[facts.length - 1] ?? buildDailyFact(bucket.start);

    return {
        label: bucket.label,
        volume: facts.reduce((sum, fact) => sum + fact.volume, 0),
        volumeChange: Number(average(facts.map((fact) => fact.volumeChange)).toFixed(1)),
        newClients: facts.reduce((sum, fact) => sum + fact.newClients, 0),
        totalClients: finalFact.totalClients,
        revenue: facts.reduce((sum, fact) => sum + fact.revenue, 0),
        revenueChange: Number(average(facts.map((fact) => fact.revenueChange)).toFixed(1)),
        domesticAdv: Number(average(facts.map((fact) => fact.domesticAdv)).toFixed(2)),
        foreignAdv: Number(average(facts.map((fact) => fact.foreignAdv)).toFixed(2)),
        corporateAdv: Number(average(facts.map((fact) => fact.corporateAdv)).toFixed(2)),
        financialInstitutionAdv: Number(average(facts.map((fact) => fact.financialInstitutionAdv)).toFixed(2)),
        otherInstitutionAdv: Number(average(facts.map((fact) => fact.otherInstitutionAdv)).toFixed(2)),
        retailAdv: Number(average(facts.map((fact) => fact.retailAdv)).toFixed(2)),
        securitiesCompanyAdv: Number(average(facts.map((fact) => fact.securitiesCompanyAdv)).toFixed(2)),
    };
};

const percentage = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

const buildTrendDatasets = (buckets: TrendBucket[]) => {
    const aggregates = buckets.map(aggregateBucket);
    const selectedVolume = aggregates.reduce((sum, point) => sum + point.volume, 0);
    const concentrationSignal = aggregates[aggregates.length - 1]?.totalClients ?? 0;
    const topTenShare = 87 + Math.round(Math.sin(concentrationSignal / 13) * 2);
    const clientWeights = [20, 16, 13, 11, 10, 8, 7, 6, 5, 4];
    const concentration = clientWeights.map((weight, index) => ({
        name: `Client ${String.fromCharCode(65 + index)}`,
        volume: selectedVolume * (topTenShare / 100) * (weight / 100),
    }));
    concentration.push({ name: 'Other Clients', volume: selectedVolume * ((100 - topTenShare) / 100) });

    return {
        volume: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.volume,
            lineValue: point.volumeChange,
        })),
        clients: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.newClients,
            lineValue: point.totalClients,
        })),
        revenue: aggregates.map<DailyTrendData>((point) => ({
            date: point.label,
            barValue1: point.revenue,
            lineValue: point.revenueChange,
        })),
        concentration,
        topTenShare,
        domesticForeign: aggregates.map((point) => {
            const total = point.domesticAdv + point.foreignAdv;
            return {
                month: point.label,
                domestic: point.domesticAdv,
                foreign: point.foreignAdv,
                total: Number(total.toFixed(2)),
                domPct: percentage(point.domesticAdv, total),
                forPct: percentage(point.foreignAdv, total),
            };
        }),
        investorTypes: aggregates.map((point) => {
            const total = point.corporateAdv + point.financialInstitutionAdv + point.otherInstitutionAdv + point.retailAdv + point.securitiesCompanyAdv;
            return {
                month: point.label,
                retail: point.retailAdv,
                corporate: point.corporateAdv,
                finInst: point.financialInstitutionAdv,
                secCo: point.securitiesCompanyAdv,
                otherInst: point.otherInstitutionAdv,
                total: Number(total.toFixed(2)),
                retailPct: percentage(point.retailAdv, total),
                corpPct: percentage(point.corporateAdv, total),
                finPct: percentage(point.financialInstitutionAdv, total),
                secPct: percentage(point.securitiesCompanyAdv, total),
                otherPct: percentage(point.otherInstitutionAdv, total),
            };
        }),
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

const leaderboardData = [
    [1, "Grace Hopper", formatCurrency(3.5e12), formatCurrency(18e9), 15, 500],
    [2, "Henry Ford", formatCurrency(3.2e12), formatCurrency(16e9), 12, 450],
    [3, "Ivy Lee", formatCurrency(2.8e12), formatCurrency(14e9), 10, 400],
];

const DetailInstitutionalBusiness: React.FC<DetailInstitutionalBusinessProps> = ({ onSalespersonClick }) => {
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

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => <DetailKPICard key={kpi.label} data={kpi} />)}
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
                                aria-label="Institutional Business trends time filter"
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendComposedChart
                        data={trendDatasets.volume}
                        title={`${frequencyLabel} Transaction Volume Trends`}
                        barLabel1="Volume"
                        lineLabel="Changes (%)"
                        isCurrency={true}
                        isLinePercentage={true}
                    />
                    <TrendComposedChart
                        data={trendDatasets.clients}
                        title={`${frequencyLabel} New vs Total Client Trends`}
                        barLabel1="New Clients"
                        lineLabel="Total Clients"
                    />
                    <TrendComposedChart
                        data={trendDatasets.revenue}
                        title={`${frequencyLabel} Total Revenue Trends`}
                        barLabel1="Revenue"
                        lineLabel="Changes (%)"
                        isCurrency={true}
                        isLinePercentage={true}
                    />
                    <ConcentrationChart
                        data={trendDatasets.concentration}
                        title={`Client Concentration (Top 10 Contribute ${trendDatasets.topTenShare}% Volume)`}
                    />
                    <div className="lg:col-span-2">
                        <ADVCombinedBreakdown
                            domesticData={trendDatasets.domesticForeign}
                            investorTypeData={trendDatasets.investorTypes}
                            title="Average Daily Value - Breakdown by Investor"
                            subtitle="In IDR Billion"
                            note="Note: Percentages represent value share of total ADV on IDX stock market. Other Institutions include Insurance, Pension Fund, Foundation, and Others."
                        />
                    </div>
                </div>
            </section>

            <DataTable 
              title="Leaderboard Sales/Dealer (Institutional Business)" 
              columns={["Ranking", "Sales/Dealer", "Transaction Volume", "Total Revenue (Fee)", "Active Clients", "Total Transactions"]} 
              data={leaderboardData} 
              onRowClick={(row) => onSalespersonClick(row[1] as string)}
            />
        </div>
    );
};

export default DetailInstitutionalBusiness;
