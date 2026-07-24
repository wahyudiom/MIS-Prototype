import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon } from '../components/Icons';
import { formatCurrency } from '../components/Shared';
import type { ProductBreakdownKey } from '../constants/productBreakdownData';

type FilterMode = 'monthly' | 'quarterly' | 'annual';

type ProductMetric = {
  label: string;
  value: string;
  change: string;
  trend: 'positive' | 'negative' | 'neutral';
};

type ProductCardData = {
  name: string;
  aum: string;
  detailTarget: ProductBreakdownKey;
  metrics: ProductMetric[];
};

type AumTrendPoint = {
  label: string;
  totalAum: number;
  equity: number;
  mutualFund: number;
  bonds: number;
};

type MonthlyHistoryPoint = {
  year: number;
  monthIndex: number;
  label: string;
  totalAum: number;
  equity: number;
  mutualFund: number;
  bonds: number;
};

type FilterState = {
  monthly: {
    year: number;
    from: number;
    to: number;
  };
  quarterly: {
    year: number;
    from: number;
    to: number;
  };
  annual: {
    fromYear: number;
    toYear: number;
  };
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const AVAILABLE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
const PRODUCT_CURRENT_YEAR = 2026;
const PRODUCT_CURRENT_MONTH_INDEX = 4;
const MONTHLY_AVAILABLE_BY_YEAR: Record<number, number> = {
  2022: 12,
  2023: 12,
  2024: 12,
  2025: 12,
  2026: PRODUCT_CURRENT_MONTH_INDEX + 1,
};
const QUARTERLY_AVAILABLE_BY_YEAR: Record<number, number> = {
  2022: 4,
  2023: 4,
  2024: 4,
  2025: 4,
  2026: Math.ceil((PRODUCT_CURRENT_MONTH_INDEX + 1) / 3),
};

const YEARLY_AUM_ANCHORS: Record<number, Omit<AumTrendPoint, 'label'>> = {
  2021: { totalAum: 58.4, equity: 32.1, mutualFund: 9.3, bonds: 16.2 },
  2022: { totalAum: 69.2, equity: 38.6, mutualFund: 11.1, bonds: 18.7 },
  2023: { totalAum: 74.8, equity: 41.5, mutualFund: 12.6, bonds: 20.7 },
  2024: { totalAum: 71.6, equity: 39.8, mutualFund: 12.1, bonds: 19.7 },
  2025: { totalAum: 86.3, equity: 48.1, mutualFund: 14.9, bonds: 22.4 },
  2026: { totalAum: 88.5, equity: 49.4, mutualFund: 15.3, bonds: 22.5 },
};

const composition = [
  { name: 'Equity', percentage: 55.8, value: 49.4, color: '#2563EB' },
  { name: 'Bonds', percentage: 25.4, value: 22.5, color: '#10B981' },
  { name: 'Mutual Fund', percentage: 17.3, value: 15.3, color: '#F59E0B' },
];

const formatBillion = (value: number) => formatCurrency(value * 1e9, 'IDR');
const formatMillion = (value: number) => formatCurrency(value * 1e6, 'IDR');

const aumTrendSummary = [
  { label: 'DoD', change: '+0.34%', value: formatBillion(88.2) },
  { label: 'MTD', change: '+1.84%', value: formatBillion(86.9) },
  { label: 'YTD', change: '+8.72%', value: formatBillion(81.4) },
];

const chartSeries = [
  { key: 'totalAum', name: 'Total AUM', color: '#0f172a', fill: 'totalAumFill' },
  { key: 'equity', name: 'Equity', color: '#2563EB', fill: 'equityFill' },
  { key: 'mutualFund', name: 'Mutual Fund', color: '#F59E0B', fill: 'mutualFundFill' },
  { key: 'bonds', name: 'Bonds', color: '#10B981', fill: 'bondsFill' },
] as const;

const productCards: ProductCardData[] = [
  {
    name: 'Equity',
    aum: formatBillion(47.6),
    detailTarget: 'equity',
    metrics: [
      { label: 'Trading Value', value: formatBillion(8.8), change: '', trend: 'neutral' },
      { label: 'Avg Daily Volume', value: formatBillion(0.3), change: '', trend: 'neutral' },
      { label: 'Active Clients', value: '12,701', change: '', trend: 'neutral' },
      { label: 'Fee Brokerage', value: formatMillion(68.6), change: '', trend: 'neutral' },
    ],
  },
  {
    name: 'Mutual Fund',
    aum: formatBillion(19.5),
    detailTarget: 'mutualFund',
    metrics: [
      { label: 'Subscription', value: formatMillion(169.6), change: '', trend: 'neutral' },
      { label: 'Redemption', value: formatMillion(124.8), change: '', trend: 'neutral' },
      { label: 'Net Flow', value: formatMillion(44.8), change: 'Net Inflow', trend: 'positive' },
      { label: 'Fee Distribution', value: formatMillion(44.8), change: '', trend: 'neutral' },
    ],
  },
  {
    name: 'Bonds',
    aum: formatBillion(21.6),
    detailTarget: 'bonds',
    metrics: [
      { label: 'Sales Volume', value: formatMillion(241.9), change: '', trend: 'neutral' },
      { label: 'Best-Selling Series', value: 'FR0102', change: '', trend: 'neutral' },
      { label: 'Fee Distribution', value: formatMillion(32.4), change: '', trend: 'neutral' },
    ],
  },
];

const interpolate = (start: number, end: number, progress: number) =>
  Number((start + (end - start) * progress).toFixed(1));

const TURBULENCE_PATTERNS = {
  totalAum: [-1.2, 1.4, -2.3, 1.1, 0, 1.7, -1.1, 1.5, -0.8, 0.9, -0.4, 0],
  equity: [-0.8, 1.0, -1.7, 0.8, 0, 1.2, -0.9, 1.0, -0.6, 0.7, -0.3, 0],
  mutualFund: [-0.25, 0.35, -0.5, 0.25, 0, 0.4, -0.3, 0.32, -0.18, 0.24, -0.12, 0],
  bonds: [-0.45, 0.65, -0.85, 0.4, 0, 0.7, -0.55, 0.6, -0.3, 0.38, -0.15, 0],
} as const;

const TURBULENCE_FLOORS = {
  totalAum: 1.4,
  equity: 0.9,
  mutualFund: 0.28,
  bonds: 0.45,
} as const;

const turbulentInterpolate = (
  start: number,
  end: number,
  progress: number,
  monthIndex: number,
  seriesKey: keyof typeof TURBULENCE_PATTERNS,
) => {
  const base = interpolate(start, end, progress);
  const swingBase = Math.max(Math.abs(end - start) * 0.22, TURBULENCE_FLOORS[seriesKey]);
  const turbulence = TURBULENCE_PATTERNS[seriesKey][monthIndex] * swingBase;
  return Number(Math.max(0, base + turbulence).toFixed(1));
};

const buildMonthlyHistory = (): MonthlyHistoryPoint[] =>
  AVAILABLE_YEARS.flatMap((year) => {
    const start = YEARLY_AUM_ANCHORS[year - 1];
    const end = YEARLY_AUM_ANCHORS[year];
    const availableMonths = MONTHLY_AVAILABLE_BY_YEAR[year];

    return Array.from({ length: availableMonths }, (_, monthIndex) => {
      const progress = (monthIndex + 1) / availableMonths;

      return {
        year,
        monthIndex,
        label: MONTH_LABELS[monthIndex],
        totalAum: turbulentInterpolate(start.totalAum, end.totalAum, progress, monthIndex, 'totalAum'),
        equity: turbulentInterpolate(start.equity, end.equity, progress, monthIndex, 'equity'),
        mutualFund: turbulentInterpolate(start.mutualFund, end.mutualFund, progress, monthIndex, 'mutualFund'),
        bonds: turbulentInterpolate(start.bonds, end.bonds, progress, monthIndex, 'bonds'),
      };
    });
  });

const MONTHLY_HISTORY = buildMonthlyHistory();

const createDefaultFilterState = (): FilterState => ({
  monthly: {
    year: PRODUCT_CURRENT_YEAR,
    from: 0,
    to: MONTHLY_AVAILABLE_BY_YEAR[PRODUCT_CURRENT_YEAR] - 1,
  },
  quarterly: {
    year: PRODUCT_CURRENT_YEAR,
    from: 0,
    to: QUARTERLY_AVAILABLE_BY_YEAR[PRODUCT_CURRENT_YEAR] - 1,
  },
  annual: {
    fromYear: PRODUCT_CURRENT_YEAR - 4,
    toYear: PRODUCT_CURRENT_YEAR,
  },
});

const ProductPerformance: React.FC<{
  onNavigateDetail?: (target: ProductBreakdownKey) => void;
}> = ({ onNavigateDetail }) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const [filterState, setFilterState] = useState<FilterState>(createDefaultFilterState);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFilterOpen]);

  const availableMonthOptions = useMemo(
    () => MONTH_LABELS.slice(0, MONTHLY_AVAILABLE_BY_YEAR[filterState.monthly.year]),
    [filterState.monthly.year],
  );

  const availableQuarterOptions = useMemo(
    () => QUARTER_LABELS.slice(0, QUARTERLY_AVAILABLE_BY_YEAR[filterState.quarterly.year]),
    [filterState.quarterly.year],
  );

  const chartData = useMemo<AumTrendPoint[]>(() => {
    if (filterMode === 'monthly') {
      return MONTHLY_HISTORY
        .filter((point) => point.year === filterState.monthly.year)
        .slice(filterState.monthly.from, filterState.monthly.to + 1)
        .map((point) => ({
          label: point.label,
          totalAum: point.totalAum,
          equity: point.equity,
          mutualFund: point.mutualFund,
          bonds: point.bonds,
        }));
    }

    if (filterMode === 'quarterly') {
      const pointsInYear = MONTHLY_HISTORY.filter((point) => point.year === filterState.quarterly.year);

      return QUARTER_LABELS.slice(filterState.quarterly.from, filterState.quarterly.to + 1).map((quarterLabel, index) => {
        const quarterIndex = filterState.quarterly.from + index;
        const quarterStartMonth = quarterIndex * 3;
        const quarterPoints = pointsInYear.slice(quarterStartMonth, Math.min(quarterStartMonth + 3, pointsInYear.length));
        const anchorPoint = quarterPoints[quarterPoints.length - 1] ?? pointsInYear[pointsInYear.length - 1];

        return {
          label: quarterLabel,
          totalAum: anchorPoint.totalAum,
          equity: anchorPoint.equity,
          mutualFund: anchorPoint.mutualFund,
          bonds: anchorPoint.bonds,
        };
      });
    }

    return AVAILABLE_YEARS
      .filter((year) => year >= filterState.annual.fromYear && year <= filterState.annual.toYear)
      .map((year) => {
        const pointsInYear = MONTHLY_HISTORY.filter((point) => point.year === year);
        const anchorPoint = pointsInYear[pointsInYear.length - 1];

        return {
          label: year.toString(),
          totalAum: anchorPoint.totalAum,
          equity: anchorPoint.equity,
          mutualFund: anchorPoint.mutualFund,
          bonds: anchorPoint.bonds,
        };
      });
  }, [filterMode, filterState]);

  const chartMax = useMemo(() => {
    const values = chartData.flatMap((item) => [item.totalAum, item.equity, item.mutualFund, item.bonds]);
    return Math.ceil((Math.max(...values) + 6) / 5) * 5;
  }, [chartData]);

  const chartSubtitle = useMemo(() => {
    if (filterMode === 'monthly') {
      const fromLabel = MONTH_LABELS[filterState.monthly.from];
      const toLabel = MONTH_LABELS[filterState.monthly.to];
      return `Monthly Overview · ${fromLabel} ${filterState.monthly.year} - ${toLabel} ${filterState.monthly.year}`;
    }

    if (filterMode === 'quarterly') {
      const fromLabel = QUARTER_LABELS[filterState.quarterly.from];
      const toLabel = QUARTER_LABELS[filterState.quarterly.to];
      const rangeLabel = fromLabel === toLabel ? fromLabel : `${fromLabel}-${toLabel}`;
      return `Quarterly Overview · ${filterState.quarterly.year} · ${rangeLabel}`;
    }

    const yearCount = filterState.annual.toYear - filterState.annual.fromYear + 1;
    if (yearCount === 1) {
      return `Annual Overview · ${filterState.annual.fromYear}`;
    }

    return `Annual Overview · ${yearCount}-Year Range: ${filterState.annual.fromYear}-${filterState.annual.toYear}`;
  }, [filterMode, filterState]);

  const filterSummary = useMemo(() => {
    if (filterMode === 'monthly') {
      const fromLabel = MONTH_LABELS[filterState.monthly.from];
      const toLabel = MONTH_LABELS[filterState.monthly.to];
      return `${filterState.monthly.year} · ${fromLabel}${fromLabel === toLabel ? '' : `-${toLabel}`}`;
    }

    if (filterMode === 'quarterly') {
      const fromLabel = QUARTER_LABELS[filterState.quarterly.from];
      const toLabel = QUARTER_LABELS[filterState.quarterly.to];
      return `${filterState.quarterly.year} · ${fromLabel}${fromLabel === toLabel ? '' : `-${toLabel}`}`;
    }

    return filterState.annual.fromYear === filterState.annual.toYear
      ? filterState.annual.fromYear.toString()
      : `${filterState.annual.fromYear}-${filterState.annual.toYear}`;
  }, [filterMode, filterState]);

  const filterHint = useMemo(() => {
    if (filterMode === 'monthly') {
      const count = filterState.monthly.to - filterState.monthly.from + 1;
      return `${MONTH_LABELS[filterState.monthly.from]} to ${MONTH_LABELS[filterState.monthly.to]} · ${count} month${count > 1 ? 's' : ''}`;
    }

    if (filterMode === 'quarterly') {
      const count = filterState.quarterly.to - filterState.quarterly.from + 1;
      return `${QUARTER_LABELS[filterState.quarterly.from]} to ${QUARTER_LABELS[filterState.quarterly.to]} · ${count} quarter${count > 1 ? 's' : ''}`;
    }

    const count = filterState.annual.toYear - filterState.annual.fromYear + 1;
    return `${filterState.annual.fromYear} to ${filterState.annual.toYear} · ${count} year${count > 1 ? 's' : ''}`;
  }, [filterMode, filterState]);

  const resetModeToDefault = (mode: FilterMode) => {
    const defaults = createDefaultFilterState();
    setFilterMode(mode);
    setFilterState((prev) => ({
      ...prev,
      [mode]: defaults[mode],
    }));
    setIsFilterOpen(false);
  };

  const updateMonthlyYear = (year: number) => {
    const maxIndex = MONTHLY_AVAILABLE_BY_YEAR[year] - 1;
    setFilterState((prev) => ({
      ...prev,
      monthly: {
        year,
        from: Math.min(prev.monthly.from, maxIndex),
        to: Math.min(Math.max(prev.monthly.to, prev.monthly.from), maxIndex),
      },
    }));
  };

  const updateQuarterlyYear = (year: number) => {
    const maxIndex = QUARTERLY_AVAILABLE_BY_YEAR[year] - 1;
    setFilterState((prev) => ({
      ...prev,
      quarterly: {
        year,
        from: Math.min(prev.quarterly.from, maxIndex),
        to: Math.min(Math.max(prev.quarterly.to, prev.quarterly.from), maxIndex),
      },
    }));
  };

  const updateMonthlyRange = (field: 'from' | 'to', value: number) => {
    setFilterState((prev) => {
      const next = { ...prev.monthly, [field]: value };
      if (field === 'from' && next.to < value) next.to = value;
      if (field === 'to' && value < next.from) next.from = value;
      return { ...prev, monthly: next };
    });
  };

  const updateQuarterlyRange = (field: 'from' | 'to', value: number) => {
    setFilterState((prev) => {
      const next = { ...prev.quarterly, [field]: value };
      if (field === 'from' && next.to < value) next.to = value;
      if (field === 'to' && value < next.from) next.from = value;
      return { ...prev, quarterly: next };
    });
  };

  const updateAnnualRange = (field: 'fromYear' | 'toYear', value: number) => {
    setFilterState((prev) => {
      const next = { ...prev.annual, [field]: value };
      if (field === 'fromYear' && next.toYear < value) next.toYear = value;
      if (field === 'toYear' && value < next.fromYear) next.fromYear = value;
      return { ...prev, annual: next };
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in space-y-8 bg-gray-50/30 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Performance</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">Total AUM Trend</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">{chartSubtitle}</p>
            </div>

            <div ref={filterRef} className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="inline-flex rounded-[18px] border border-[#e5edf7] bg-white/80 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                {(['monthly', 'quarterly', 'annual'] as FilterMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => resetModeToDefault(mode)}
                    className={`rounded-[14px] px-4 py-2.5 text-sm font-bold transition-all ${
                      filterMode === mode
                        ? 'border border-[#dbe5f2] bg-white text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.06)]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mode === 'monthly' ? 'Monthly' : mode === 'quarterly' ? 'Quarterly' : 'Annual'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="inline-flex items-center gap-3 rounded-2xl border border-[#e5edf7] bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:shadow-md"
                  aria-expanded={isFilterOpen}
                  aria-haspopup="dialog"
                >
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Filter</div>
                    <div className="whitespace-nowrap text-sm font-black text-slate-800">{filterSummary}</div>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[340px] rounded-[22px] border border-[#e5edf7] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] max-sm:left-0 max-sm:right-auto max-sm:w-[min(100vw-36px,340px)]">
                    <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Time Filter</div>

                    {filterMode !== 'annual' && (
                      <div className="mb-4">
                        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Statement Year</div>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_YEARS.map((year) => {
                            const isSelected = filterMode === 'monthly'
                              ? filterState.monthly.year === year
                              : filterState.quarterly.year === year;

                            return (
                              <button
                                key={year}
                                type="button"
                                onClick={() => (filterMode === 'monthly' ? updateMonthlyYear(year) : updateQuarterlyYear(year))}
                                className={`rounded-xl border px-3 py-2 text-xs font-black transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-[#dbe5f2] bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                        {filterMode === 'annual' ? 'Year Range' : 'Custom Range'}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-[#e7eef8] bg-[#f8fbff] p-3">
                          <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                            From
                          </label>
                          <select
                            value={
                              filterMode === 'monthly'
                                ? filterState.monthly.from
                                : filterMode === 'quarterly'
                                  ? filterState.quarterly.from
                                  : filterState.annual.fromYear
                            }
                            onChange={(event) => {
                              const nextValue = Number(event.target.value);
                              if (filterMode === 'monthly') updateMonthlyRange('from', nextValue);
                              else if (filterMode === 'quarterly') updateQuarterlyRange('from', nextValue);
                              else updateAnnualRange('fromYear', nextValue);
                            }}
                            className="w-full rounded-xl border border-[#dbe5f2] bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none"
                          >
                            {(filterMode === 'monthly'
                              ? availableMonthOptions.map((label, index) => ({ value: index, label }))
                              : filterMode === 'quarterly'
                                ? availableQuarterOptions.map((label, index) => ({ value: index, label }))
                                : AVAILABLE_YEARS.map((year) => ({ value: year, label: year.toString() }))
                            ).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="rounded-2xl border border-[#e7eef8] bg-[#f8fbff] p-3">
                          <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                            To
                          </label>
                          <select
                            value={
                              filterMode === 'monthly'
                                ? filterState.monthly.to
                                : filterMode === 'quarterly'
                                  ? filterState.quarterly.to
                                  : filterState.annual.toYear
                            }
                            onChange={(event) => {
                              const nextValue = Number(event.target.value);
                              if (filterMode === 'monthly') updateMonthlyRange('to', nextValue);
                              else if (filterMode === 'quarterly') updateQuarterlyRange('to', nextValue);
                              else updateAnnualRange('toYear', nextValue);
                            }}
                            className="w-full rounded-xl border border-[#dbe5f2] bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none"
                          >
                            {(filterMode === 'monthly'
                              ? availableMonthOptions.map((label, index) => ({ value: index, label }))
                              : filterMode === 'quarterly'
                                ? availableQuarterOptions.map((label, index) => ({ value: index, label }))
                                : AVAILABLE_YEARS.map((year) => ({ value: year, label: year.toString() }))
                            ).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-extrabold text-teal-700">{filterHint}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
                <defs>
                  {chartSeries.map((series) => (
                    <linearGradient key={series.fill} id={series.fill} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={series.color} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={series.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  domain={[0, chartMax]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(value) => `${value}B`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number | string, name: string) => [formatBillion(Number(value)), name]}
                  labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                />
                {chartSeries.map((series) => (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.name}
                    stroke={series.color}
                    fill={`url(#${series.fill})`}
                    strokeWidth={series.key === 'totalAum' ? 2.8 : 2.2}
                    dot={{ r: 3.5, fill: series.color, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {chartSeries.map((series) => (
              <div key={series.key} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                <span className="text-xs font-bold text-slate-500">{series.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Total AUM</p>
          <div className="flex flex-col items-center">
            <div className="relative h-[210px] w-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={composition}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    stroke="none"
                    paddingAngle={1}
                  >
                    {composition.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | string, _name, item: { payload?: { name?: string } }) => [
                      `${Number(value).toFixed(1)}%`,
                      item.payload?.name ?? '',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-slate-900">{formatBillion(88.5)}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Total AUM</p>
              </div>
            </div>

            <div className="mt-6 w-full space-y-4">
              {composition.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 w-full space-y-3 border-t border-gray-100 pt-5">
              {aumTrendSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                    {item.change} {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {productCards.map((card) => (
          <section
            key={card.name}
            className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="border-b-2 border-slate-100 pb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{card.name}</p>
            </div>

            <div className="mt-6">
              <p className="text-[34px] font-black tracking-tight text-slate-900">{card.aum}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">AUM</p>
            </div>

            <div className="mt-6 space-y-4">
              {card.metrics.map((metric) => (
                <div key={metric.label} className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{metric.value}</p>
                    {metric.change && (metric.change.includes('Inflow') || metric.change.includes('Outflow')) ? (
                      <p className={`mt-1 text-xs font-bold ${metric.trend === 'positive' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {metric.change}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onNavigateDetail?.(card.detailTarget)}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                View Detailed Breakdown
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ProductPerformance;
