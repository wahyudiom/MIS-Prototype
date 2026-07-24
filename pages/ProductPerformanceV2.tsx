import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
type ChartValueMode = 'absolute' | 'growth';

type HistoryPoint = {
  year: number;
  monthIndex: number;
  monthLabel: string;
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
    quarter: number;
  };
  annual: {
    fromYear: number;
    toYear: number;
  };
};

type ProductSnapshot = {
  composition: { name: string; color: string; value: number; percentage: number }[];
  cards: {
    name: string;
    detailTarget: ProductBreakdownKey;
    aum: string;
    metrics: { label: string; value: string; change: string; changeClass: string; valueClass?: string }[];
  }[];
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const AVAILABLE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
const CURRENT_YEAR = 2026;
const CURRENT_MONTH_INDEX = 4;
const CURRENT_TOTAL_AUM = 88.5;
const currentPerformanceDateLabel = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date(Date.now() - 24 * 60 * 60 * 1000));

const MONTHS_AVAILABLE_BY_YEAR: Record<number, number> = {
  2022: 12,
  2023: 12,
  2024: 12,
  2025: 12,
  2026: CURRENT_MONTH_INDEX + 1,
};

const YEARLY_ANCHORS: Record<number, number> = {
  2021: 58.8,
  2022: 68.4,
  2023: 74.2,
  2024: 71.8,
  2025: 84.7,
  2026: CURRENT_TOTAL_AUM,
};

const TURBULENCE_PATTERN = [-1.1, 0.9, -1.8, 1.3, 0.2, 1.6, -1.2, 1.5, -0.9, 0.8, -0.4, 0];

const CHART_SERIES = [
  { key: 'totalAum', label: 'Total AUM', color: '#111827', fillId: 'productPerformanceV2Total' },
  { key: 'equity', label: 'Equity', color: '#2563eb', fillId: 'productPerformanceV2Equity' },
  { key: 'mutualFund', label: 'Mutual Fund', color: '#f59e0b', fillId: 'productPerformanceV2MutualFund' },
  { key: 'bonds', label: 'Bonds', color: '#10b981', fillId: 'productPerformanceV2Bonds' },
] as const;

const STACKED_BAR_SERIES = CHART_SERIES.filter((series) => series.key !== 'totalAum');

const deriveCompositionValues = (totalAum: number, seed: number) => {
  const equityShare = 0.55 + Math.sin(seed) * 0.018;
  const bondsShare = 0.255 + Math.cos(seed / 2) * 0.012;
  const mutualFundShare = Math.max(0.13, 1 - equityShare - bondsShare);
  const normalizedTotal = equityShare + bondsShare + mutualFundShare;

  const equity = Number(((totalAum * equityShare) / normalizedTotal).toFixed(1));
  const bonds = Number(((totalAum * bondsShare) / normalizedTotal).toFixed(1));
  const mutualFund = Number((totalAum - equity - bonds).toFixed(1));

  return { equity, mutualFund, bonds };
};

const buildMonthlyHistory = (): HistoryPoint[] =>
  AVAILABLE_YEARS.flatMap((year) => {
    const startValue = YEARLY_ANCHORS[year - 1];
    const endValue = YEARLY_ANCHORS[year];
    const monthCount = MONTHS_AVAILABLE_BY_YEAR[year];

    return Array.from({ length: monthCount }, (_, monthIndex) => {
      const progress = (monthIndex + 1) / monthCount;
      const baseline = startValue + (endValue - startValue) * progress;
      const swing = Math.max(Math.abs(endValue - startValue) * 0.18, 0.85);
      const totalAum = Number(Math.max(0, baseline + TURBULENCE_PATTERN[monthIndex] * swing).toFixed(1));

      return {
        year,
        monthIndex,
        monthLabel: MONTH_LABELS[monthIndex],
        totalAum,
        ...deriveCompositionValues(totalAum, year * 17 + monthIndex * 7 + monthCount),
      };
    });
  });

const MONTHLY_HISTORY = buildMonthlyHistory();
const LATEST_FULL_QUARTER_YEAR =
  [...AVAILABLE_YEARS].reverse().find((year) => Math.ceil(MONTHS_AVAILABLE_BY_YEAR[year] / 3) === 4) ?? CURRENT_YEAR;

const createDefaultFilterState = (): FilterState => ({
  monthly: {
    year: CURRENT_YEAR,
    from: 0,
    to: CURRENT_MONTH_INDEX,
  },
  quarterly: {
    year: LATEST_FULL_QUARTER_YEAR,
    quarter: 3,
  },
  annual: {
    fromYear: CURRENT_YEAR - 3,
    toYear: CURRENT_YEAR,
  },
});

const formatBillions = (value: number) => formatCurrency(value * 1e9, 'IDR');
const formatMillions = (value: number) => formatCurrency(value * 1e6, 'IDR');
const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}%`;

const formatSharePercent = (value: number) => `${value.toFixed(2).replace(/\.?0+$/, '')}%`;

const calculateDynamicAxisRange = (values: number[], mode: ChartValueMode) => {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    return {
      min: mode === 'growth' ? -10 : 0,
      max: mode === 'growth' ? 15 : 100,
      ticks: mode === 'growth' ? [-10, -5, 0, 5, 10, 15] : [0, 20, 40, 60, 80, 100],
    };
  }

  if (mode === 'growth') {
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin;
    const padding = range === 0 ? Math.max(Math.abs(rawMax) * 0.15, 1) : range * 0.15;
    const min = rawMin - padding;
    const max = rawMax + padding;
    const paddedRange = Math.max(max - min, 1);
    const roughStep = paddedRange / 7;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;
    const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
    const step = niceFactor * magnitude;
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const tickCount = Math.min(10, Math.max(8, Math.round((niceMax - niceMin) / step) + 1));
    const ticks = Array.from({ length: tickCount }, (_, index) => Number((niceMin + index * step).toFixed(2))).filter(
      (value) => value <= niceMax + step * 0.5,
    );

    return {
      min: Number(niceMin.toFixed(2)),
      max: Number(niceMax.toFixed(2)),
      ticks,
    };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const min = rawMin === rawMax ? rawMin * 0.85 : rawMin * 0.85;
  const max = rawMin === rawMax ? rawMax * 1.15 : rawMax * 1.15;
  const range = Math.max(max - min, 1);
  const roughStep = range / 7;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const step = niceFactor * magnitude;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const tickCount = Math.min(10, Math.max(8, Math.round((niceMax - niceMin) / step) + 1));
  const ticks = Array.from({ length: tickCount }, (_, index) => Number((niceMin + index * step).toFixed(2))).filter(
    (value) => value <= niceMax + step * 0.5,
  );

  return {
    min: Number(niceMin.toFixed(2)),
    max: Number(niceMax.toFixed(2)),
    ticks,
  };
};

type StackedTooltipPayload = {
  name?: string;
  color?: string;
  value?: number | string;
  payload?: {
    totalAumAbsolute?: number;
  };
};

const AbsoluteStackedTooltip: React.FC<{
  active?: boolean;
  label?: string;
  payload?: StackedTooltipPayload[];
}> = ({ active, label, payload }) => {
  if (!active || !payload?.length) return null;

  const total = payload[0]?.payload?.totalAumAbsolute ?? 0;
  const order: Record<string, number> = { Bonds: 3, 'Mutual Fund': 2, Equity: 1 };
  const rows = [...payload]
    .filter((item) => Number(item.value) > 0)
    .sort((a, b) => (order[b.name ?? ''] ?? 0) - (order[a.name ?? ''] ?? 0));

  return (
    <div className="min-w-[260px] rounded-2xl bg-white px-4 py-3 shadow-[0_18px_30px_-12px_rgba(15,23,42,0.22)]">
      <p className="mb-2 text-sm font-semibold text-slate-500">{label}</p>
      <div className="space-y-1.5">
        <div className="grid grid-cols-[12px_minmax(92px,1fr)_auto_auto] items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-900" />
          <span className="font-semibold text-slate-700">Total AUM</span>
          <span className="font-black text-slate-900">({formatBillions(total)})</span>
          <span className="font-black text-slate-900">100%</span>
        </div>
        {rows.map((item) => {
          const value = Number(item.value);
          const percentage = total > 0 ? (value / total) * 100 : 0;

          return (
            <div key={item.name} className="grid grid-cols-[12px_minmax(92px,1fr)_auto_auto] items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="font-black text-slate-900">({formatBillions(value)})</span>
              <span className="font-black text-slate-900">{formatSharePercent(percentage)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getQuarterRange = (quarterIndex: number) => ({
  startMonth: quarterIndex * 3,
  endMonth: quarterIndex * 3 + 2,
});

const clampQuarterByYear = (year: number, quarterIndex: number) =>
  Math.min(quarterIndex, Math.ceil(MONTHS_AVAILABLE_BY_YEAR[year] / 3) - 1);

const getQuarterLabelForPoint = (monthIndex: number) => QUARTER_LABELS[Math.floor(monthIndex / 3)];

const getMonthEndDay = (monthIndex: number) => {
  if ([0, 2, 4, 6, 7, 9, 11].includes(monthIndex)) return 31;
  if (monthIndex === 1) return 28;
  return 30;
};

const getSnapshotDateLabel = (mode: FilterMode, state: FilterState) => {
  if (mode === 'monthly') {
    const monthIndex = state.monthly.to;
    return `${MONTH_LABELS[monthIndex]} ${getMonthEndDay(monthIndex)}, ${state.monthly.year}`;
  }

  if (mode === 'quarterly') {
    const quarter = clampQuarterByYear(state.quarterly.year, Math.ceil(MONTHS_AVAILABLE_BY_YEAR[state.quarterly.year] / 3) - 1);
    const { endMonth } = getQuarterRange(quarter);
    const cappedEndMonth = Math.min(endMonth, MONTHS_AVAILABLE_BY_YEAR[state.quarterly.year] - 1);
    return `${MONTH_LABELS[cappedEndMonth]} ${getMonthEndDay(cappedEndMonth)}, ${state.quarterly.year}`;
  }

  return `Dec 31, ${state.annual.toYear}`;
};

const buildChartSubtitle = (mode: FilterMode, state: FilterState) => {
  if (mode === 'monthly') {
    return `Monthly Overview · ${MONTH_LABELS[state.monthly.from]} ${state.monthly.year} – ${MONTH_LABELS[state.monthly.to]} ${state.monthly.year}`;
  }

  if (mode === 'quarterly') {
    return `Quarterly Overview · ${state.quarterly.year}`;
  }

  return `Annual Overview · ${state.annual.fromYear} – ${state.annual.toYear}`;
};

const getFilterSummary = (mode: FilterMode, state: FilterState) => {
  if (mode === 'monthly') {
    return `${state.monthly.year} · ${MONTH_LABELS[state.monthly.from]} – ${MONTH_LABELS[state.monthly.to]}`;
  }

  if (mode === 'quarterly') {
    return `${state.quarterly.year} · 4-Quarter`;
  }

  return `${state.annual.fromYear} – ${state.annual.toYear}`;
};

const getChangeClass = (value: number) => (value >= 0 ? 'text-emerald-600' : 'text-red-600');

const buildProductSnapshot = (totalAum: number, mode: FilterMode, filterState: FilterState): ProductSnapshot => {
  const availableQuarterCount = Math.ceil(MONTHS_AVAILABLE_BY_YEAR[filterState.quarterly.year] / 3);
  const seed =
    mode === 'monthly'
      ? filterState.monthly.year * 17 + filterState.monthly.to * 7 + (filterState.monthly.to - filterState.monthly.from + 1)
      : mode === 'quarterly'
        ? filterState.quarterly.year * 13 + availableQuarterCount * 11
        : filterState.annual.fromYear * 3 + filterState.annual.toYear;

  const equityShare = 0.55 + Math.sin(seed) * 0.018;
  const bondsShare = 0.255 + Math.cos(seed / 2) * 0.012;
  const mutualFundShare = Math.max(0.13, 1 - equityShare - bondsShare);
  const normalizedTotal = equityShare + bondsShare + mutualFundShare;

  const equityValue = Number(((totalAum * equityShare) / normalizedTotal).toFixed(1));
  const bondsValue = Number(((totalAum * bondsShare) / normalizedTotal).toFixed(1));
  const mutualFundValue = Number((totalAum - equityValue - bondsValue).toFixed(1));

  const compositionValues = [
    { name: 'Equity', color: '#2563EB', value: equityValue },
    { name: 'Bonds', color: '#10B981', value: bondsValue },
    { name: 'Mutual Fund', color: '#F59E0B', value: mutualFundValue },
  ];

  const composition = compositionValues.map((item) => ({
    ...item,
    percentage: Number(((item.value / totalAum) * 100).toFixed(1)),
  }));

  const monthlyCount = filterState.monthly.to - filterState.monthly.from + 1;
  const periodFactor = mode === 'monthly' ? monthlyCount : mode === 'quarterly' ? availableQuarterCount : filterState.annual.toYear - filterState.annual.fromYear + 1;

  const equityTrading = Number((equityValue * (0.16 + periodFactor * 0.005)).toFixed(1));
  const equityDailyVolume = Number((equityTrading / Math.max(periodFactor * 5, 1)).toFixed(2));
  const equityClients = Math.round(9300 + equityValue * 62 + periodFactor * 90);
  const equityFee = Number((equityTrading * 7.8).toFixed(1));
  const equityChange = Number((Math.sin(seed / 2.2) * 2.4).toFixed(1));

  const mutualSubscription = Number((mutualFundValue * (5.2 + periodFactor * 0.7)).toFixed(1));
  const mutualRedemption = Number((mutualFundValue * (4.6 + (seed % 3) * 0.9)).toFixed(1));
  const mutualNetFlow = Number((mutualSubscription - mutualRedemption).toFixed(1));
  const mutualFee = Number((mutualFundValue * 2.3).toFixed(1));
  const mutualChange = Number((Math.cos(seed / 2.7) * 1.9).toFixed(1));

  const bondsSales = Number((bondsValue * (8.2 + periodFactor * 0.6)).toFixed(1));
  const bondsYield = Number((6.72 + ((seed % 5) * 0.07)).toFixed(2));
  const bondsFee = Number((bondsValue * 1.5).toFixed(1));
  const bondsChange = Number((Math.sin(seed / 1.9) * 1.8).toFixed(1));
  const bestSeries = ['FR0091', 'PBS037', 'ORI026', 'FR0102'][seed % 4];
  const bestSeriesValue = Number((bondsSales * 0.42).toFixed(0));

  return {
    composition,
    cards: [
      {
        name: 'Equity',
        detailTarget: 'equity',
        aum: formatBillions(equityValue),
        metrics: [
          { label: 'Trading Value', value: formatBillions(equityTrading), change: '', changeClass: 'text-slate-500' },
          { label: 'Avg Daily Volume', value: formatBillions(equityDailyVolume), change: formatSignedPercent(5 + Math.sin(seed) * 2.2), changeClass: getChangeClass(5 + Math.sin(seed) * 2.2) },
          { label: 'Active Clients', value: equityClients.toLocaleString('en-US'), change: formatSignedPercent(0.8 + Math.cos(seed / 3) * 0.7), changeClass: getChangeClass(0.8 + Math.cos(seed / 3) * 0.7) },
          { label: 'Fee Brokerage', value: formatMillions(equityFee), change: formatSignedPercent(7.4 + Math.sin(seed / 2) * 1.8), changeClass: getChangeClass(7.4 + Math.sin(seed / 2) * 1.8) },
        ],
      },
      {
        name: 'Mutual Fund',
        detailTarget: 'mutualFund',
        aum: formatBillions(mutualFundValue),
        metrics: [
          { label: 'Subscription', value: formatMillions(mutualSubscription), change: formatSignedPercent(10.8 + Math.cos(seed / 2) * 2.4), changeClass: getChangeClass(10.8 + Math.cos(seed / 2) * 2.4) },
          { label: 'Redemption', value: formatMillions(mutualRedemption), change: formatSignedPercent(17.4 + Math.sin(seed / 2.4) * 5.6), changeClass: getChangeClass(17.4 + Math.sin(seed / 2.4) * 5.6) },
          { label: 'Net Flow', value: `${mutualNetFlow >= 0 ? '' : '-'}${formatMillions(Math.abs(mutualNetFlow))}`, change: '', changeClass: getChangeClass(mutualNetFlow), valueClass: 'text-emerald-600' },
          { label: 'Fee Distribution', value: formatMillions(mutualFee), change: formatSignedPercent(3.5 + Math.cos(seed / 3.4) * 1.5), changeClass: getChangeClass(3.5 + Math.cos(seed / 3.4) * 1.5) },
        ],
      },
      {
        name: 'Bonds',
        detailTarget: 'bonds',
        aum: formatBillions(bondsValue),
        metrics: [
          { label: 'Sales Volume', value: formatMillions(bondsSales), change: formatSignedPercent(11.2 + Math.sin(seed / 2.3) * 3.1), changeClass: getChangeClass(11.2 + Math.sin(seed / 2.3) * 3.1) },
          { label: 'Most Active Series', value: bestSeries, change: formatMillions(bestSeriesValue), changeClass: 'text-slate-500' },
          { label: 'Fee Distribution', value: formatMillions(bondsFee), change: formatSignedPercent(9.4 + Math.cos(seed / 2.1) * 2.1), changeClass: getChangeClass(9.4 + Math.cos(seed / 2.1) * 2.1) },
        ],
      },
    ],
  };
};

const getDecadeStart = (year: number) => Math.floor(year / 10) * 10;

const buildYearGridCells = (decadeStart: number) =>
  Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);

const formatMonthPeriodValue = (year: number, monthIndex: number) =>
  `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const ProductPerformanceV2: React.FC<{
  onNavigateDetail?: (target: ProductBreakdownKey) => void;
}> = ({ onNavigateDetail }) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const [filterState, setFilterState] = useState<FilterState>(createDefaultFilterState);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [monthlyRangeAnchor, setMonthlyRangeAnchor] = useState<number | null>(null);
  const [annualRangeAnchor, setAnnualRangeAnchor] = useState<number | null>(null);
  const [monthlyYearPanel, setMonthlyYearPanel] = useState<number>(getDecadeStart(CURRENT_YEAR));
  const [quarterlyYearPanel, setQuarterlyYearPanel] = useState<number>(getDecadeStart(CURRENT_YEAR));
  const [annualYearPanel, setAnnualYearPanel] = useState<number>(getDecadeStart(CURRENT_YEAR));
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

  const availableMonths = useMemo(
    () => MONTH_LABELS.slice(0, MONTHS_AVAILABLE_BY_YEAR[filterState.monthly.year]),
    [filterState.monthly.year],
  );

  const monthlyYearGrid = useMemo(() => buildYearGridCells(monthlyYearPanel), [monthlyYearPanel]);
  const quarterlyYearGrid = useMemo(() => buildYearGridCells(quarterlyYearPanel), [quarterlyYearPanel]);
  const annualYearGrid = useMemo(() => buildYearGridCells(annualYearPanel), [annualYearPanel]);

  const chartData = useMemo(() => {
    if (filterMode === 'monthly') {
      return MONTHLY_HISTORY
        .filter((point) => point.year === filterState.monthly.year)
        .slice(filterState.monthly.from, filterState.monthly.to + 1)
        .map((point) => ({
          label: point.monthLabel,
          totalAum: point.totalAum,
          equity: point.equity,
          mutualFund: point.mutualFund,
          bonds: point.bonds,
        }));
    }

    if (filterMode === 'quarterly') {
      const yearPoints = MONTHLY_HISTORY.filter((point) => point.year === filterState.quarterly.year);
      const availableQuarterCount = Math.ceil(MONTHS_AVAILABLE_BY_YEAR[filterState.quarterly.year] / 3);

      return QUARTER_LABELS.slice(0, availableQuarterCount).map((label, quarterIndex) => {
        const { endMonth } = getQuarterRange(quarterIndex);
        const cappedEndMonth = Math.min(endMonth, yearPoints.length - 1);
        const anchor = yearPoints[cappedEndMonth];

        return {
          label,
          totalAum: anchor?.totalAum ?? yearPoints[yearPoints.length - 1]?.totalAum ?? 0,
          equity: anchor?.equity ?? yearPoints[yearPoints.length - 1]?.equity ?? 0,
          mutualFund: anchor?.mutualFund ?? yearPoints[yearPoints.length - 1]?.mutualFund ?? 0,
          bonds: anchor?.bonds ?? yearPoints[yearPoints.length - 1]?.bonds ?? 0,
        };
      });
    }

    return AVAILABLE_YEARS
      .filter((year) => year >= filterState.annual.fromYear && year <= filterState.annual.toYear)
      .map((year) => ({
        label: String(year),
        totalAum: MONTHLY_HISTORY.filter((point) => point.year === year).slice(-1)[0]?.totalAum ?? 0,
        equity: MONTHLY_HISTORY.filter((point) => point.year === year).slice(-1)[0]?.equity ?? 0,
        mutualFund: MONTHLY_HISTORY.filter((point) => point.year === year).slice(-1)[0]?.mutualFund ?? 0,
        bonds: MONTHLY_HISTORY.filter((point) => point.year === year).slice(-1)[0]?.bonds ?? 0,
      }));
  }, [filterMode, filterState]);

  const chartDisplayData = useMemo(() => {
    const baseTotal = chartData[0]?.totalAum ?? 0;
    const baseEquity = chartData[0]?.equity ?? 0;
    const baseMutualFund = chartData[0]?.mutualFund ?? 0;
    const baseBonds = chartData[0]?.bonds ?? 0;

    return chartData.map((point) => {
      const totalAumGrowth = Number(Math.max(0, point.totalAum - baseTotal).toFixed(2));
      const equityGrowth = Number(Math.max(0, point.equity - baseEquity).toFixed(2));
      const mutualFundGrowth = Number(Math.max(0, point.mutualFund - baseMutualFund).toFixed(2));
      const bondsGrowth = Number(Math.max(0, point.bonds - baseBonds).toFixed(2));

      return {
        ...point,
        totalAumAbsolute: point.totalAum,
        equityAbsolute: point.equity,
        mutualFundAbsolute: point.mutualFund,
        bondsAbsolute: point.bonds,
        totalAumGrowth,
        equityGrowth,
        mutualFundGrowth,
        bondsGrowth,
      };
    });
  }, [chartData]);

  const chartAxis = useMemo(
    () =>
      calculateDynamicAxisRange(
        chartDisplayData.flatMap((item) => [
          item.totalAumGrowth,
          item.equityGrowth,
          item.mutualFundGrowth,
          item.bondsGrowth,
        ]),
        'absolute',
      ),
    [chartDisplayData],
  );
  const stackedBarAxis = useMemo(
    () => calculateDynamicAxisRange([0, ...chartData.map((item) => item.totalAum)], 'absolute'),
    [chartData],
  );
  const chartSubtitle = useMemo(() => buildChartSubtitle(filterMode, filterState), [filterMode, filterState]);
  const filterSummary = useMemo(() => getFilterSummary(filterMode, filterState), [filterMode, filterState]);
  const snapshot = useMemo(
    () =>
      buildProductSnapshot(CURRENT_TOTAL_AUM, 'monthly', {
        monthly: { year: CURRENT_YEAR, from: 0, to: CURRENT_MONTH_INDEX },
        quarterly: { year: CURRENT_YEAR, quarter: 1 },
        annual: { fromYear: CURRENT_YEAR, toYear: CURRENT_YEAR },
      }),
    [],
  );

  const updateMonthlyYear = (year: number) => {
    const maxIndex = MONTHS_AVAILABLE_BY_YEAR[year] - 1;
    setFilterState((prev) => ({
      ...prev,
      monthly: {
        year,
        from: Math.min(prev.monthly.from, maxIndex),
        to: Math.min(Math.max(prev.monthly.to, prev.monthly.from), maxIndex),
      },
    }));
    setMonthlyRangeAnchor(null);
  };

  const updateQuarterlyYear = (year: number) => {
    setFilterState((prev) => ({
      ...prev,
      quarterly: {
        year,
        quarter: clampQuarterByYear(year, Math.ceil(MONTHS_AVAILABLE_BY_YEAR[year] / 3) - 1),
      },
    }));
  };

  const selectMonthlyMonth = (monthIndex: number) => {
    if (monthIndex >= MONTHS_AVAILABLE_BY_YEAR[filterState.monthly.year]) return;

    if (monthlyRangeAnchor === null) {
      setFilterState((prev) => ({
        ...prev,
        monthly: {
          ...prev.monthly,
          from: monthIndex,
          to: monthIndex,
        },
      }));
      setMonthlyRangeAnchor(monthIndex);
      return;
    }

    const start = Math.min(monthlyRangeAnchor, monthIndex);
    const end = Math.max(monthlyRangeAnchor, monthIndex);
    setFilterState((prev) => ({
      ...prev,
      monthly: {
        ...prev.monthly,
        from: start,
        to: end,
      },
    }));
    setMonthlyRangeAnchor(null);
  };

  const selectAnnualYear = (year: number) => {
    if (!AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number])) return;

    if (annualRangeAnchor === null) {
      setFilterState((prev) => ({
        ...prev,
        annual: {
          fromYear: year,
          toYear: year,
        },
      }));
      setAnnualRangeAnchor(year);
      return;
    }

    const start = Math.min(annualRangeAnchor, year);
    const end = Math.max(annualRangeAnchor, year);
    setFilterState((prev) => ({
      ...prev,
      annual: {
        fromYear: start,
        toYear: end,
      },
    }));
    setAnnualRangeAnchor(null);
  };

  const switchMode = (mode: FilterMode) => {
    setFilterMode(mode);
    setMonthlyRangeAnchor(null);
    setAnnualRangeAnchor(null);
    if (mode === 'monthly') {
      setMonthlyYearPanel(getDecadeStart(filterState.monthly.year));
    }
    if (mode === 'quarterly') {
      setQuarterlyYearPanel(getDecadeStart(filterState.quarterly.year));
    }
    if (mode === 'annual') {
      setAnnualYearPanel(getDecadeStart(filterState.annual.fromYear));
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in space-y-8 bg-gray-50/30 p-4 sm:p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Performance</h1>
      </header>

      <section className="space-y-5">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Current Performance</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">As of {currentPerformanceDateLabel}</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
          <div className="rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-700">Product Composition</h3>
            <div className="relative mx-auto mt-5 h-[170px] w-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={snapshot.composition}
                    dataKey="percentage"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={1}
                    stroke="none"
                  >
                    {snapshot.composition.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | string, _name, item: { payload?: { value?: number } }) => [
                      `${Number(value).toFixed(1)}%`,
                      item.payload?.value ? formatBillions(item.payload.value) : '',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-lg font-black tracking-tight text-slate-900">{formatBillions(CURRENT_TOTAL_AUM)}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Total AUM</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {snapshot.composition.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Total AUM', value: formatBillions(CURRENT_TOTAL_AUM), comparison: '' },
              { label: 'Month to Date (MTD)', value: '+1.84%', comparison: `From ${formatBillions(86.9)}` },
              { label: 'Day over Day (DoD)', value: '+0.34%', comparison: `From ${formatBillions(88.2)}` },
              { label: 'Year to Date (YTD)', value: '+8.72%', comparison: `From ${formatBillions(81.4)}` },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-[12px] font-black text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{item.value}</p>
                {item.comparison ? <p className="mt-4 text-sm font-semibold text-slate-600">{item.comparison}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Historical Analysis</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Trends</h2>
          </div>

          <div ref={filterRef} className="relative w-fit">
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
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Time Filter</div>
                  <div className="whitespace-nowrap text-sm font-black text-slate-800">{filterSummary}</div>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-[min(100vw-36px,560px)] rounded-[24px] border border-[#e5edf7] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <h3 className="text-[28px] font-black tracking-tight text-slate-900">Time Filter</h3>

                  <div className="mt-5">
                    <p className="text-sm font-bold text-slate-700">Frequency</p>
                    <div className="mt-3 inline-flex rounded-[14px] bg-slate-50 p-1">
                      {(['monthly', 'quarterly', 'annual'] as FilterMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => switchMode(mode)}
                          className={`rounded-[10px] px-5 py-2 text-sm font-bold transition-all ${
                            filterMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {mode === 'monthly' ? 'Monthly' : mode === 'quarterly' ? 'Quarterly' : 'Annual'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filterMode === 'monthly' && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Time Range</p>
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]">
                          <span className="text-sm font-bold text-slate-800">{formatMonthPeriodValue(filterState.monthly.year, filterState.monthly.from)}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-sm font-bold text-slate-800">{formatMonthPeriodValue(filterState.monthly.year, filterState.monthly.to)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Statement Year</p>
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setMonthlyYearPanel((prev) => prev - 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Previous year block"
                          >
                            ‹
                          </button>
                          <span className="text-sm font-black text-slate-700">{monthlyYearPanel}-{monthlyYearPanel + 9}</span>
                          <button
                            type="button"
                            onClick={() => setMonthlyYearPanel((prev) => prev + 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Next year block"
                          >
                            ›
                          </button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {monthlyYearGrid.map((year) => {
                            const isDisabled = !AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number]);
                            const isSelected = filterState.monthly.year === year;

                            return (
                              <button
                                key={year}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => updateMonthlyYear(year)}
                                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                                  isDisabled
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                    : isSelected
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-white text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Month Range</p>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {MONTH_LABELS.map((label, monthIndex) => {
                            const isDisabled = monthIndex >= MONTHS_AVAILABLE_BY_YEAR[filterState.monthly.year];
                            const isSelectedEdge = monthIndex === filterState.monthly.from || monthIndex === filterState.monthly.to;
                            const isInRange = monthIndex > filterState.monthly.from && monthIndex < filterState.monthly.to;

                            return (
                              <button
                                key={label}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => selectMonthlyMonth(monthIndex)}
                                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                                  isDisabled
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                    : isSelectedEdge
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : isInRange
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-white text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {filterMode === 'quarterly' && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Statement Year</p>
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]">
                          <span className="text-sm font-bold text-slate-800">{filterState.quarterly.year}</span>
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <div className="mt-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setQuarterlyYearPanel((prev) => prev - 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Previous year block"
                          >
                            ‹
                          </button>
                          <span className="text-sm font-black text-slate-700">{quarterlyYearPanel}-{quarterlyYearPanel + 9}</span>
                          <button
                            type="button"
                            onClick={() => setQuarterlyYearPanel((prev) => prev + 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Next year block"
                          >
                            ›
                          </button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {quarterlyYearGrid.map((year) => {
                            const isDisabled =
                              !AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number]) ||
                              Math.ceil((MONTHS_AVAILABLE_BY_YEAR[year] ?? 0) / 3) < 4;
                            const isSelected = filterState.quarterly.year === year;

                            return (
                              <button
                                key={year}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => updateQuarterlyYear(year)}
                                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                                  isDisabled
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                    : isSelected
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-white text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {filterMode === 'annual' && (
                    <div className="mt-6 space-y-5">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Time Range</p>
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]">
                          <span className="text-sm font-bold text-slate-800">{filterState.annual.fromYear}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-sm font-bold text-slate-800">{filterState.annual.toYear}</span>
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <div className="mt-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setAnnualYearPanel((prev) => prev - 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Previous year block"
                          >
                            ‹
                          </button>
                          <span className="text-sm font-black text-slate-700">{annualYearPanel}-{annualYearPanel + 9}</span>
                          <button
                            type="button"
                            onClick={() => setAnnualYearPanel((prev) => prev + 10)}
                            className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500"
                            aria-label="Next year block"
                          >
                            ›
                          </button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {annualYearGrid.map((year) => {
                            const isDisabled = !AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number]);
                            const isSelectedEdge = year === filterState.annual.fromYear || year === filterState.annual.toYear;
                            const isInRange = year > filterState.annual.fromYear && year < filterState.annual.toYear;

                            return (
                              <button
                                key={year}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => selectAnnualYear(year)}
                                className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                                  isDisabled
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                                    : isSelectedEdge
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : isInRange
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-white text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="relative rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm">
            <div>
              <div>
                <h3 className="text-lg font-black text-slate-900">AUM Composition</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">{chartSubtitle}</p>
              </div>
            </div>

            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDisplayData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid vertical={false} stroke="#edf2f7" strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <YAxis
                    domain={[stackedBarAxis.min, stackedBarAxis.max]}
                    ticks={stackedBarAxis.ticks}
                    tickCount={Math.max(8, stackedBarAxis.ticks.length)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(value) => formatBillions(Number(value))}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                    content={<AbsoluteStackedTooltip />}
                  />
                  {STACKED_BAR_SERIES.map((series) => (
                    <Bar
                      key={series.key}
                      name={series.label}
                      dataKey={`${series.key}Absolute`}
                      stackId="aum"
                      fill={series.color}
                      radius={series.key === 'bonds' ? [10, 10, 0, 0] : [0, 0, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={450}
                      animationEasing="ease-out"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {STACKED_BAR_SERIES.map((series) => (
                <div key={series.key} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: series.color }} />
                  <span className="text-sm font-bold text-slate-500">{series.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="relative rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-slate-900">AUM Growth Trend</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{chartSubtitle}</p>
            </div>

            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDisplayData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {CHART_SERIES.map((series) => (
                      <linearGradient key={series.fillId} id={series.fillId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={series.color} stopOpacity={series.key === 'totalAum' ? 0.18 : 0.1} />
                        <stop offset="100%" stopColor={series.color} stopOpacity={0.03} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="#edf2f7" strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                  <YAxis
                    domain={[chartAxis.min, chartAxis.max]}
                    ticks={chartAxis.ticks}
                    tickCount={Math.max(8, chartAxis.ticks.length)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(value) => formatBillions(Number(value))}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 18px 30px -12px rgb(15 23 42 / 0.18)', padding: '14px 16px' }}
                    formatter={(value: number | string, name: string, item: { color?: string; payload?: any }) => {
                      const payload = item.payload ?? {};
                      const formatLine = (absolute: number, growth: number) => `Growth ${formatBillions(growth)} · Current ${formatBillions(absolute)}`;

                      if (name === 'Bonds') {
                        return [formatLine(payload.bondsAbsolute ?? 0, payload.bondsGrowth ?? 0), 'Bonds'];
                      }
                      if (name === 'Equity') {
                        return [formatLine(payload.equityAbsolute ?? 0, payload.equityGrowth ?? 0), 'Equity'];
                      }
                      if (name === 'Mutual Fund') {
                        return [formatLine(payload.mutualFundAbsolute ?? 0, payload.mutualFundGrowth ?? 0), 'Mutual Fund'];
                      }
                      return [formatLine(payload.totalAumAbsolute ?? Number(value), payload.totalAumGrowth ?? 0), 'Total AUM'];
                    }}
                    itemSorter={(entry) => {
                      const order: Record<string, number> = { Bonds: 4, Equity: 3, 'Mutual Fund': 2, 'Total AUM': 1 };
                      return -(order[entry.name as string] ?? 0);
                    }}
                    labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                  />
                  {CHART_SERIES.map((series) => (
                    <Area
                      key={series.key}
                      type="monotone"
                      name={series.label}
                      dataKey={`${series.key}Growth`}
                      stroke={series.color}
                      fill={`url(#${series.fillId})`}
                      strokeWidth={3}
                      dot={{ r: 5, fill: series.color, stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={true}
                      animationDuration={450}
                      animationEasing="ease-out"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {CHART_SERIES.map((series) => (
                <div key={series.key} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: series.color }} />
                  <span className="text-sm font-bold text-slate-500">{series.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Product Breakdown</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Snapshot per Product</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {snapshot.cards.map((card) => (
            <section
              key={card.name}
              className="relative rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
                      <p className={`text-sm font-bold ${metric.valueClass ?? 'text-slate-900'}`}>{metric.value}</p>
                      {metric.change && (metric.change.includes('Inflow') || metric.change.includes('Outflow')) ? (
                        <p className={`mt-1 text-xs font-bold ${metric.changeClass}`}>{metric.change}</p>
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
      </section>
    </div>
  );
};

export default ProductPerformanceV2;
