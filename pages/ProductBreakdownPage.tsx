import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeftIcon, CalendarIcon, ChevronDownIcon } from '../components/Icons';
import { formatCurrency } from '../components/Shared';
import { addValueDatasets } from '../constants/productBreakdownData';
import type {
  BreakdownChart,
  BreakdownDataPoint,
  BreakdownPageConfig,
  BreakdownSeries,
  ChartValueTab,
  ProductChartProduct,
  ProductBreakdownKey,
} from '../constants/productBreakdownData';

type ProductBreakdownPageProps = {
  config: BreakdownPageConfig;
  productKey: ProductBreakdownKey;
  onBack: () => void;
};

type FilterMode = 'monthly' | 'quarterly' | 'annual';
type FilterState = {
  monthly: {
    year: number;
    from: number;
    to: number;
  };
  quarterly: {
    year: number;
  };
  annual: {
    fromYear: number;
    toYear: number;
  };
};

type TimeGranularity = 'monthly' | 'quarterly' | 'annual';

type ResolvedChartData = {
  data: BreakdownDataPoint[];
  granularity: TimeGranularity;
};

const VALUE_TABS: { label: string; value: ChartValueTab }[] = [
  { label: 'Transaction Value', value: 'transactionValue' },
  { label: 'Asset Value', value: 'assetValue' },
];

const PRODUCT_ROUTE_NAMES: Record<ProductBreakdownKey, ProductChartProduct> = {
  equity: 'equity',
  mutualFund: 'mutual-fund',
  bonds: 'bonds',
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const AVAILABLE_YEARS = [2022, 2023, 2024, 2025, 2026] as const;
const CURRENT_YEAR = 2026;
const CURRENT_MONTH_INDEX = 4;
const LATEST_FULL_QUARTER_YEAR =
  [...AVAILABLE_YEARS].reverse().find((year) => year < CURRENT_YEAR) ?? 2025;

const MONTHS_AVAILABLE_BY_YEAR: Record<number, number> = {
  2022: 12,
  2023: 12,
  2024: 12,
  2025: 12,
  2026: CURRENT_MONTH_INDEX + 1,
};

const createDefaultFilterState = (): FilterState => ({
  monthly: {
    year: CURRENT_YEAR,
    from: 0,
    to: CURRENT_MONTH_INDEX,
  },
  quarterly: {
    year: LATEST_FULL_QUARTER_YEAR,
  },
  annual: {
    fromYear: CURRENT_YEAR - 4,
    toYear: CURRENT_YEAR,
  },
});

const buildYearGridCells = (decadeStart: number) =>
  Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);

const getDecadeStart = (year: number) => Math.floor(year / 10) * 10;

const formatPageSubtitle = (mode: FilterMode, filterState: FilterState) => {
  if (mode === 'monthly') {
    const monthCount = filterState.monthly.to - filterState.monthly.from + 1;
    return `Monthly Overview · ${monthCount}-Month Range: ${MONTH_LABELS[filterState.monthly.from]}–${MONTH_LABELS[filterState.monthly.to]} ${filterState.monthly.year}`;
  }

  if (mode === 'quarterly') {
    return `Quarterly Overview · 4-Quarter Range: ${filterState.quarterly.year}`;
  }

  const yearCount = filterState.annual.toYear - filterState.annual.fromYear + 1;
  return `Annual Overview · ${yearCount}-Year Range: ${filterState.annual.fromYear}–${filterState.annual.toYear}`;
};

const formatBreakdownAmount = (value: number) =>
  formatCurrency(value * 1e9);

const formatCompactBillions = (value: number) => {
  if (Math.abs(value) >= 1000) {
    return `${Number((value / 1000).toFixed(1))}T`;
  }

  return `${Number(value.toFixed(0))}B`;
};

const branchPerformanceSeries: BreakdownSeries[] = [
  { key: 'InvestmentSpecialist', name: 'Investment Specialist', color: '#2563eb' },
  { key: 'PWM', name: 'PWM', color: '#8b5cf6' },
  { key: 'InvestmentSolution', name: 'Priority Client Services', color: '#10b981' },
  { key: 'InstitutionalBusiness', name: 'Institutional Business', color: '#f59e0b' },
];

const branchPerformanceCharts: Record<ProductBreakdownKey, BreakdownChart> = {
  equity: {
    title: 'By Branch Performance',
    subtitle: 'AUM share by branch channel',
    series: branchPerformanceSeries,
    data30d: [
      { label: '1', InvestmentSpecialist: 39, PWM: 27, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 248.4 },
      { label: '2', InvestmentSpecialist: 41, PWM: 25, InvestmentSolution: 19, InstitutionalBusiness: 15, totalAmount: 263.1 },
      { label: '3', InvestmentSpecialist: 38, PWM: 28, InvestmentSolution: 21, InstitutionalBusiness: 13, totalAmount: 239.7 },
      { label: '4', InvestmentSpecialist: 40, PWM: 26, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 271.3 },
      { label: '5', InvestmentSpecialist: 42, PWM: 25, InvestmentSolution: 18, InstitutionalBusiness: 15, totalAmount: 285.6 },
      { label: '6', InvestmentSpecialist: 39, PWM: 27, InvestmentSolution: 19, InstitutionalBusiness: 15, totalAmount: 251.4 },
      { label: '7', InvestmentSpecialist: 40, PWM: 26, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 266.8 },
      { label: '8', InvestmentSpecialist: 41, PWM: 24, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 274.2 },
      { label: '9', InvestmentSpecialist: 38, PWM: 27, InvestmentSolution: 21, InstitutionalBusiness: 14, totalAmount: 246.9 },
      { label: '10', InvestmentSpecialist: 39, PWM: 26, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 258.7 },
      { label: '11', InvestmentSpecialist: 42, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 15, totalAmount: 281.4 },
      { label: '12', InvestmentSpecialist: 40, PWM: 25, InvestmentSolution: 21, InstitutionalBusiness: 14, totalAmount: 264.5 },
    ],
    data12m: [
      { label: 'Jan', InvestmentSpecialist: 39, PWM: 27, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 252.6 },
      { label: 'Feb', InvestmentSpecialist: 40, PWM: 26, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 264.8 },
      { label: 'Mar', InvestmentSpecialist: 38, PWM: 28, InvestmentSolution: 21, InstitutionalBusiness: 13, totalAmount: 241.3 },
      { label: 'Apr', InvestmentSpecialist: 41, PWM: 25, InvestmentSolution: 19, InstitutionalBusiness: 15, totalAmount: 276.1 },
      { label: 'May', InvestmentSpecialist: 42, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 15, totalAmount: 284.7 },
      { label: 'Jun', InvestmentSpecialist: 39, PWM: 27, InvestmentSolution: 20, InstitutionalBusiness: 14, totalAmount: 255.4 },
      { label: 'Jul', InvestmentSpecialist: 40, PWM: 25, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 268.9 },
      { label: 'Aug', InvestmentSpecialist: 41, PWM: 24, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 273.5 },
      { label: 'Sep', InvestmentSpecialist: 38, PWM: 26, InvestmentSolution: 22, InstitutionalBusiness: 14, totalAmount: 249.2 },
      { label: 'Oct', InvestmentSpecialist: 40, PWM: 25, InvestmentSolution: 21, InstitutionalBusiness: 14, totalAmount: 262.1 },
      { label: 'Nov', InvestmentSpecialist: 41, PWM: 24, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 278.6 },
      { label: 'Dec', InvestmentSpecialist: 42, PWM: 23, InvestmentSolution: 20, InstitutionalBusiness: 15, totalAmount: 286.4 },
    ],
  },
  mutualFund: {
    title: 'By Branch Performance',
    subtitle: 'AUM share by branch channel',
    series: branchPerformanceSeries,
    data30d: [
      { label: '1', InvestmentSpecialist: 34, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 11, totalAmount: 95.2 },
      { label: '2', InvestmentSpecialist: 35, PWM: 30, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 104.6 },
      { label: '3', InvestmentSpecialist: 33, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 92.8 },
      { label: '4', InvestmentSpecialist: 36, PWM: 29, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 108.1 },
      { label: '5', InvestmentSpecialist: 37, PWM: 28, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 115.4 },
      { label: '6', InvestmentSpecialist: 34, PWM: 30, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 97.3 },
      { label: '7', InvestmentSpecialist: 35, PWM: 29, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 101.5 },
      { label: '8', InvestmentSpecialist: 36, PWM: 28, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 109.2 },
      { label: '9', InvestmentSpecialist: 33, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 93.7 },
      { label: '10', InvestmentSpecialist: 35, PWM: 30, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 102.6 },
      { label: '11', InvestmentSpecialist: 36, PWM: 28, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 111.4 },
      { label: '12', InvestmentSpecialist: 37, PWM: 27, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 117.6 },
    ],
    data12m: [
      { label: 'Jan', InvestmentSpecialist: 34, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 11, totalAmount: 97.1 },
      { label: 'Feb', InvestmentSpecialist: 35, PWM: 30, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 105.8 },
      { label: 'Mar', InvestmentSpecialist: 33, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 94.2 },
      { label: 'Apr', InvestmentSpecialist: 36, PWM: 29, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 110.4 },
      { label: 'May', InvestmentSpecialist: 37, PWM: 28, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 118.7 },
      { label: 'Jun', InvestmentSpecialist: 34, PWM: 30, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 98.6 },
      { label: 'Jul', InvestmentSpecialist: 35, PWM: 29, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 103.5 },
      { label: 'Aug', InvestmentSpecialist: 36, PWM: 28, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 109.8 },
      { label: 'Sep', InvestmentSpecialist: 33, PWM: 31, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 95.1 },
      { label: 'Oct', InvestmentSpecialist: 35, PWM: 30, InvestmentSolution: 23, InstitutionalBusiness: 12, totalAmount: 104.7 },
      { label: 'Nov', InvestmentSpecialist: 36, PWM: 28, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 112.6 },
      { label: 'Dec', InvestmentSpecialist: 37, PWM: 27, InvestmentSolution: 24, InstitutionalBusiness: 12, totalAmount: 119.9 },
    ],
  },
  bonds: {
    title: 'By Branch Performance',
    subtitle: 'AUM share by branch channel',
    series: branchPerformanceSeries,
    data30d: [
      { label: '1', InvestmentSpecialist: 22, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 176.2 },
      { label: '2', InvestmentSpecialist: 21, PWM: 23, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 188.6 },
      { label: '3', InvestmentSpecialist: 23, PWM: 24, InvestmentSolution: 18, InstitutionalBusiness: 35, totalAmount: 180.4 },
      { label: '4', InvestmentSpecialist: 22, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 36, totalAmount: 195.8 },
      { label: '5', InvestmentSpecialist: 21, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 37, totalAmount: 208.1 },
      { label: '6', InvestmentSpecialist: 22, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 179.5 },
      { label: '7', InvestmentSpecialist: 21, PWM: 23, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 186.3 },
      { label: '8', InvestmentSpecialist: 22, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 194.7 },
      { label: '9', InvestmentSpecialist: 23, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 183.8 },
      { label: '10', InvestmentSpecialist: 22, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 36, totalAmount: 191.6 },
      { label: '11', InvestmentSpecialist: 21, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 37, totalAmount: 201.4 },
      { label: '12', InvestmentSpecialist: 22, PWM: 22, InvestmentSolution: 19, InstitutionalBusiness: 37, totalAmount: 209.3 },
    ],
    data12m: [
      { label: 'Jan', InvestmentSpecialist: 22, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 179.8 },
      { label: 'Feb', InvestmentSpecialist: 21, PWM: 23, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 191.7 },
      { label: 'Mar', InvestmentSpecialist: 23, PWM: 24, InvestmentSolution: 18, InstitutionalBusiness: 35, totalAmount: 184.1 },
      { label: 'Apr', InvestmentSpecialist: 22, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 36, totalAmount: 198.3 },
      { label: 'May', InvestmentSpecialist: 21, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 37, totalAmount: 210.2 },
      { label: 'Jun', InvestmentSpecialist: 22, PWM: 24, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 182.5 },
      { label: 'Jul', InvestmentSpecialist: 21, PWM: 23, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 189.9 },
      { label: 'Aug', InvestmentSpecialist: 22, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 36, totalAmount: 197.1 },
      { label: 'Sep', InvestmentSpecialist: 23, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 35, totalAmount: 186.8 },
      { label: 'Oct', InvestmentSpecialist: 22, PWM: 23, InvestmentSolution: 19, InstitutionalBusiness: 36, totalAmount: 194.6 },
      { label: 'Nov', InvestmentSpecialist: 21, PWM: 22, InvestmentSolution: 20, InstitutionalBusiness: 37, totalAmount: 204.1 },
      { label: 'Dec', InvestmentSpecialist: 22, PWM: 22, InvestmentSolution: 19, InstitutionalBusiness: 37, totalAmount: 211.5 },
    ],
  },
};

const createBranchChart = (productKey: ProductBreakdownKey) =>
  addValueDatasets(branchPerformanceCharts[productKey], productKey);

const injectBranchChart = (charts: BreakdownChart[], productKey: ProductBreakdownKey) => {
  const branchChart = createBranchChart(productKey);
  const insertionIndex = Math.max(
    charts.findIndex((chart) => chart.title === 'By Client Segment') + 1,
    1,
  );

  return [
    ...charts.slice(0, insertionIndex),
    branchChart,
    ...charts.slice(insertionIndex),
  ];
};

const getYearAmountFactor = (year: number) => 0.82 + (year - 2022) * 0.07;

const normalizePercentages = (values: number[]) => {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const scaled = values.map((value) => (value / total) * 100);
  const rounded = scaled.map((value) => Number(value.toFixed(2)));
  const diff = Number((100 - rounded.reduce((sum, value) => sum + value, 0)).toFixed(2));
  rounded[rounded.length - 1] = Number((rounded[rounded.length - 1] + diff).toFixed(2));
  return rounded;
};

const scaleStackedPoint = (chart: BreakdownChart, point: BreakdownDataPoint, year: number, monthIndex: number) => {
  const yearOffset = year - CURRENT_YEAR;
  const scaledValues = chart.series.map((series, index) => {
    const baseValue = Number(point[series.key] ?? 0);
    const drift = 1 + yearOffset * (-0.018 + index * 0.012) + (((monthIndex + index) % 3) - 1) * 0.015;
    return Math.max(0.1, baseValue * drift);
  });

  const normalizedValues = normalizePercentages(scaledValues);
  const nextPoint: BreakdownDataPoint = { label: point.label };
  chart.series.forEach((series, index) => {
    nextPoint[series.key] = normalizedValues[index];
  });

  const baseTotalAmount = Number(point.totalAmount ?? 100);
  nextPoint.totalAmount = Number((baseTotalAmount * getYearAmountFactor(year) * (1 + (((monthIndex % 4) - 1.5) * 0.02))).toFixed(2));
  return nextPoint;
};

const OUTFLOW_SERIES_KEYS = new Set(['Redeem', 'Sell']);

const applySignedFlowMetrics = (chart: BreakdownChart, point: BreakdownDataPoint) => {
  const barSeries = chart.series.filter((series) => series.kind !== 'line');
  const outflowSeries = barSeries.find((series) => OUTFLOW_SERIES_KEYS.has(series.key));
  const inflowSeries = barSeries.find((series) => series.key !== outflowSeries?.key);

  if (!outflowSeries || !inflowSeries) return point;

  const outflow = -Math.abs(Number(point[outflowSeries.key] ?? 0));
  const inflow = Number(point[inflowSeries.key] ?? 0);
  point[outflowSeries.key] = outflow;
  point.Nett = Number((inflow + outflow).toFixed(1));

  return point;
};

const scaleBuySellPoint = (chart: BreakdownChart, point: BreakdownDataPoint, year: number, monthIndex: number) => {
  const amountFactor = getYearAmountFactor(year) * (1 + (((monthIndex % 3) - 1) * 0.03));
  const nextPoint: BreakdownDataPoint = { label: point.label };

  chart.series.forEach((series, index) => {
    const baseValue = Number(point[series.key] ?? 0);
    if (series.kind !== 'line') {
      nextPoint[series.key] = Number((baseValue * amountFactor * (1 + index * 0.02)).toFixed(1));
    }
  });

  return applySignedFlowMetrics(chart, nextPoint);
};

const scaleAssetValuePoint = (chart: BreakdownChart, point: BreakdownDataPoint, year: number, monthIndex: number) => {
  const yearFactor = 0.86 + (year - 2022) * 0.035;
  const monthDrift = 1 + (((monthIndex % 4) - 1.5) * 0.004);
  const nextPoint: BreakdownDataPoint = { label: point.label };

  chart.series.forEach((series) => {
    const baseValue = Number(point[series.key] ?? 0);
    nextPoint[series.key] = Number((baseValue * yearFactor * (series.kind === 'line' ? 1 : monthDrift)).toFixed(1));
  });

  return nextPoint;
};

const buildScaledMonthlyData = (chart: BreakdownChart, year: number) =>
  chart.data12m.map((point, monthIndex) =>
    chart.chartType === 'buy-sell-trend'
      ? scaleBuySellPoint(chart, point, year, monthIndex)
      : chart.chartType === 'asset-value-trend'
        ? scaleAssetValuePoint(chart, point, year, monthIndex)
      : scaleStackedPoint(chart, point, year, monthIndex),
  );

const aggregateQuarterData = (chart: BreakdownChart, data: BreakdownDataPoint[]) =>
  QUARTER_LABELS.map((quarterLabel, quarterIndex) => {
    const chunk = data.slice(quarterIndex * 3, quarterIndex * 3 + 3);
    const point: BreakdownDataPoint = { label: quarterLabel };

    if (chart.chartType === 'buy-sell-trend') {
      chart.series.forEach((series) => {
        if (series.kind !== 'line') {
          point[series.key] = Number(chunk.reduce((sum, item) => sum + Number(item[series.key] ?? 0), 0).toFixed(1));
        }
      });
      return applySignedFlowMetrics(chart, point);
    }

    if (chart.chartType === 'asset-value-trend') {
      const barSeries = chart.series.find((series) => series.kind !== 'line');
      const lineSeries = chart.series.find((series) => series.kind === 'line');
      const latestPoint = chunk[chunk.length - 1];

      if (barSeries) {
        point[barSeries.key] = Number(latestPoint?.[barSeries.key] ?? 0);
      }
      if (lineSeries) {
        point[lineSeries.key] = Number(
          chunk.reduce((sum, item) => sum + Number(item[lineSeries.key] ?? 0), 0).toFixed(1),
        );
      }
      return point;
    }

    const averagedValues = chart.series.map((series) =>
      chunk.reduce((sum, item) => sum + Number(item[series.key] ?? 0), 0) / Math.max(chunk.length, 1),
    );
    const normalizedValues = normalizePercentages(averagedValues);
    chart.series.forEach((series, index) => {
      point[series.key] = normalizedValues[index];
    });
    point.totalAmount = Number(chunk.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0).toFixed(2));
    return point;
  });

const aggregateAnnualPoint = (chart: BreakdownChart, data: BreakdownDataPoint[], year: number) => {
  const point: BreakdownDataPoint = { label: String(year) };

  if (chart.chartType === 'buy-sell-trend') {
    chart.series.forEach((series) => {
      if (series.kind !== 'line') {
        point[series.key] = Number(data.reduce((sum, item) => sum + Number(item[series.key] ?? 0), 0).toFixed(1));
      }
    });
    return applySignedFlowMetrics(chart, point);
  }

  if (chart.chartType === 'asset-value-trend') {
    const barSeries = chart.series.find((series) => series.kind !== 'line');
    const lineSeries = chart.series.find((series) => series.kind === 'line');
    const latestPoint = data[data.length - 1];

    if (barSeries) {
      point[barSeries.key] = Number(latestPoint?.[barSeries.key] ?? 0);
    }
    if (lineSeries) {
      point[lineSeries.key] = Number(
        data.reduce((sum, item) => sum + Number(item[lineSeries.key] ?? 0), 0).toFixed(1),
      );
    }
    return point;
  }

  const averagedValues = chart.series.map((series) =>
    data.reduce((sum, item) => sum + Number(item[series.key] ?? 0), 0) / Math.max(data.length, 1),
  );
  const normalizedValues = normalizePercentages(averagedValues);
  chart.series.forEach((series, index) => {
    point[series.key] = normalizedValues[index];
  });
  point.totalAmount = Number(data.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0).toFixed(2));
  return point;
};

const resolveChartData = (chart: BreakdownChart, mode: FilterMode, filterState: FilterState) => {
  if (mode === 'monthly') {
    const monthlyData = buildScaledMonthlyData(chart, filterState.monthly.year);
    return {
      data: monthlyData.slice(filterState.monthly.from, filterState.monthly.to + 1),
      granularity: 'monthly' as TimeGranularity,
    };
  }

  if (mode === 'quarterly') {
    const monthlyData = buildScaledMonthlyData(chart, filterState.quarterly.year);
    return {
      data: aggregateQuarterData(chart, monthlyData),
      granularity: 'quarterly' as TimeGranularity,
    };
  }

  const annualData = AVAILABLE_YEARS
    .filter((year) => year >= filterState.annual.fromYear && year <= filterState.annual.toYear)
    .map((year) => aggregateAnnualPoint(chart, buildScaledMonthlyData(chart, year), year));

  return {
    data: annualData,
    granularity: 'annual' as TimeGranularity,
  };
};

const getMetricChartConfiguration = (chart: BreakdownChart, activeTab: ChartValueTab): BreakdownChart => {
  const dataset = chart.valueDatasets?.[activeTab];
  if (!dataset) return chart;

  return {
    ...chart,
    series: dataset.series ?? chart.series,
    chartType: dataset.chartType ?? chart.chartType,
  };
};

const resolveValueChartData = (
  chart: BreakdownChart,
  activeTab: ChartValueTab,
  mode: FilterMode,
  filterState: FilterState,
): ResolvedChartData | null => {
  const dataset = chart.valueDatasets?.[activeTab];
  if (!dataset) return null;
  const metricChart = getMetricChartConfiguration(chart, activeTab);

  return resolveChartData(
    {
      ...metricChart,
      data30d: dataset.data30d,
      data12m: dataset.data12m,
    },
    mode,
    filterState,
  );
};

const useChartValueData = ({
  chart,
  activeTab,
  product,
  timePeriod,
  filterMode,
  filterState,
}: {
  chart: BreakdownChart;
  activeTab: ChartValueTab;
  product: ProductChartProduct;
  timePeriod: string;
  filterMode: FilterMode;
  filterState: FilterState;
}) => {
  const requestKey = `${product}:${activeTab}:${timePeriod}`;
  const resolvedData = useMemo(
    () => resolveValueChartData(chart, activeTab, filterMode, filterState),
    [chart, activeTab, filterMode, filterState],
  );
  const [loadedResult, setLoadedResult] = useState<{
    requestKey: string;
    result: ResolvedChartData | null;
  }>(() => ({ requestKey, result: resolvedData }));

  useEffect(() => {
    if (loadedResult.requestKey === requestKey) return;

    const timeoutId = window.setTimeout(() => {
      setLoadedResult({ requestKey, result: resolvedData });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [loadedResult.requestKey, requestKey, resolvedData]);

  return {
    isLoading: loadedResult.requestKey !== requestKey,
    result: loadedResult.requestKey === requestKey ? loadedResult.result : null,
  };
};

const BreakdownTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const totalAmount = Number(payload[0]?.payload?.totalAmount ?? 0);

  return (
    <div className="min-w-[220px] rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
      <div className="mb-3 flex items-center justify-between gap-5 border-b border-gray-100 pb-3">
        <span className="text-xs font-black text-slate-700">Total</span>
        <span className="text-right text-xs font-black text-slate-900">
          {`(${formatBreakdownAmount(totalAmount)}) 100.00%`}
        </span>
      </div>
      <div className="space-y-2">
        {payload.map((item: any) => {
          const amount = (totalAmount * Number(item.value)) / 100;

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
              <span className="text-right text-xs font-black text-slate-900">
                {`(${formatBreakdownAmount(amount)}) ${Number(item.value).toFixed(2)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MixedTrendTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const orderedPayload = [...payload].sort((left: any, right: any) => {
    const leftIsLine = left.dataKey === 'Nett' || left.dataKey === 'TrendChange';
    const rightIsLine = right.dataKey === 'Nett' || right.dataKey === 'TrendChange';

    if (leftIsLine === rightIsLine) return 0;
    return leftIsLine ? -1 : 1;
  });

  return (
    <div className="min-w-[200px] rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
      <div className="space-y-2">
        {orderedPayload.map((item: any) => {
          const isLine = item.dataKey === 'Nett' || item.dataKey === 'TrendChange';
          const value = Number(item.value) * 1e9;
          const absoluteValueLabel = formatCurrency(Math.abs(value));
          const valueLabel = value < 0 ? absoluteValueLabel.replace(/^IDR /, 'IDR -') : absoluteValueLabel;

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2">
                <span
                  className={isLine ? 'h-[3px] w-4 rounded-full' : 'h-2.5 w-2.5 rounded-full'}
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{valueLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StackedBarChart: React.FC<{
  chart: BreakdownChart;
  data: BreakdownDataPoint[];
  granularity: TimeGranularity;
}> = ({ chart, data, granularity }) => (
  <div className="h-[360px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 20 }} barCategoryGap={granularity === 'monthly' ? '24%' : '30%'}>
        <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          interval={0}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
          dy={10}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<BreakdownTooltip />} cursor={{ fill: '#f8fafc' }} />
        {chart.series.map((series, index) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.name}
            stackId="share"
            fill={series.color}
            radius={index === chart.series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const BuySellTrendChart: React.FC<{
  chart: BreakdownChart;
  data: BreakdownDataPoint[];
  granularity: TimeGranularity;
}> = ({ chart, data, granularity }) => {
  const barSeries = chart.series.filter((series) => series.kind !== 'line');
  const lineSeries = chart.series.filter((series) => series.kind === 'line');

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 18, right: 18, left: 0, bottom: 20 }}
          barCategoryGap={granularity === 'monthly' ? '28%' : '34%'}
          stackOffset="sign"
        >
          <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            yAxisId="amount"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
            tickFormatter={formatCompactBillions}
          />
          <ReferenceLine yAxisId="amount" y={0} stroke="#64748b" strokeWidth={1.5} />
          <YAxis
            yAxisId="trend"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
            tickFormatter={formatCompactBillions}
          />
          {chart.chartType === 'asset-value-trend' ? (
            <ReferenceLine yAxisId="trend" y={0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.25} />
          ) : null}
          <Tooltip content={<MixedTrendTooltip />} cursor={{ fill: '#f8fafc' }} />
          {barSeries.map((series) => (
            <Bar
              key={series.key}
              yAxisId="amount"
              dataKey={series.key}
              name={series.name}
              fill={series.color}
              stackId="aumFlow"
              radius={OUTFLOW_SERIES_KEYS.has(series.key) ? [0, 0, 6, 6] : [6, 6, 0, 0]}
            />
          ))}
          {lineSeries.map((series) => (
            <Line
              key={series.key}
              yAxisId="trend"
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stroke={series.color}
              strokeWidth={3}
              dot={{ r: 3.5, fill: '#ffffff', stroke: series.color, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export type ChartTabToggleProps = {
  tabs: { label: string; value: ChartValueTab }[];
  activeTab: ChartValueTab;
  onChange: (value: ChartValueTab) => void;
};

export const ChartTabToggle: React.FC<ChartTabToggleProps> = ({ tabs, activeTab, onChange }) => (
  <div
    role="tablist"
    aria-label="Chart value type"
    className="inline-flex shrink-0 overflow-hidden rounded-[6px] border border-[#E0E0E0] bg-white"
  >
    {tabs.map((tab) => {
      const isActive = activeTab === tab.value;
      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ease-out ${
            isActive ? 'bg-[#2563EB] text-white' : 'bg-transparent text-[#666666] hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

const ChartLoadingSkeleton = () => (
  <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-slate-50/70" aria-label="Loading chart data">
    <div className="absolute inset-x-8 bottom-10 top-8 flex items-end justify-around gap-3 border-b border-l border-slate-200 px-5 pb-px animate-pulse">
      {[42, 66, 54, 78, 61, 72, 49, 82].map((height, index) => (
        <div key={`${height}-${index}`} className="flex h-full flex-1 items-end gap-1.5">
          <div className="w-1/2 rounded-t bg-slate-200" style={{ height: `${height}%` }} />
          <div className="w-1/2 rounded-t bg-slate-300/70" style={{ height: `${Math.max(24, height - 18)}%` }} />
        </div>
      ))}
    </div>
  </div>
);

const ChartDataBoundary: React.FC<{
  activeTab: ChartValueTab;
  isLoading: boolean;
  result: ResolvedChartData | null;
  children: (result: ResolvedChartData) => React.ReactNode;
}> = ({ activeTab, isLoading, result, children }) => {
  if (isLoading) return <ChartLoadingSkeleton />;

  if (!result || result.data.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
        <div>
          <p className="text-sm font-bold text-slate-700">
            {activeTab === 'assetValue' ? 'Asset value data not available for this period' : 'Transaction value data not available for this period'}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-400">Try adjusting the time filter</p>
        </div>
      </div>
    );
  }

  return <>{children(result)}</>;
};

type SharedValueChartProps = {
  activeTab: ChartValueTab;
  product: ProductChartProduct;
  timePeriod: string;
  chart: BreakdownChart;
  filterMode: FilterMode;
  filterState: FilterState;
};

export const TransactionTrendChart: React.FC<SharedValueChartProps> = (props) => {
  const { isLoading, result } = useChartValueData(props);

  return (
    <ChartDataBoundary activeTab={props.activeTab} isLoading={isLoading} result={result}>
      {(resolved) => (
        <BuySellTrendChart chart={props.chart} data={resolved.data} granularity={resolved.granularity} />
      )}
    </ChartDataBoundary>
  );
};

export const ByClientSegmentChart: React.FC<SharedValueChartProps> = (props) => {
  const { isLoading, result } = useChartValueData(props);

  return (
    <ChartDataBoundary activeTab={props.activeTab} isLoading={isLoading} result={result}>
      {(resolved) => (
        <StackedBarChart chart={props.chart} data={resolved.data} granularity={resolved.granularity} />
      )}
    </ChartDataBoundary>
  );
};

const getMetricChartCopy = (chart: BreakdownChart, activeTab: ChartValueTab) => {
  if (chart.chartType === 'buy-sell-trend') {
    return activeTab === 'transactionValue'
      ? { title: 'Transaction Trend', subtitle: 'Buy and sell activity with nett amount' }
      : { title: 'Asset Value Trend', subtitle: 'Total asset value with nett movement' };
  }

  if (chart.title === 'By Client Segment') {
    return activeTab === 'transactionValue'
      ? { title: chart.title, subtitle: 'Trading value share by Client Segment' }
      : { title: chart.title, subtitle: 'Asset value share by Client Segment' };
  }

  if (chart.title === 'By Branch Performance') {
    return activeTab === 'transactionValue'
      ? { title: chart.title, subtitle: 'Transaction value share by branch channel' }
      : { title: chart.title, subtitle: 'Asset value share by branch channel' };
  }

  if (activeTab === 'transactionValue') {
    return { title: chart.title, subtitle: chart.subtitle };
  }

  return {
    title: chart.title,
    subtitle: chart.subtitle
      .replace(/^Trading value share/i, 'Asset value share')
      .replace(/^Subscription share/i, 'Asset value share')
      .replace(/^Volume share/i, 'Asset value share')
      .replace(/^AUM share/i, 'Asset value share'),
  };
};

const MetricBreakdownChartCard: React.FC<{
  chart: BreakdownChart;
  activeTab: ChartValueTab;
  product: ProductChartProduct;
  timePeriod: string;
  filterMode: FilterMode;
  filterState: FilterState;
}> = ({ chart, activeTab, product, timePeriod, filterMode, filterState }) => {
  const isTransactionTrend = chart.chartType === 'buy-sell-trend';
  const metricChart = getMetricChartConfiguration(chart, activeTab);
  const copy = getMetricChartCopy(chart, activeTab);
  const sharedProps: SharedValueChartProps = {
    activeTab,
    product,
    timePeriod,
    chart: metricChart,
    filterMode,
    filterState,
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">{copy.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{copy.subtitle}</p>
        </div>
      </div>

      {isTransactionTrend ? (
        <TransactionTrendChart {...sharedProps} />
      ) : (
        <ByClientSegmentChart {...sharedProps} />
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {metricChart.series.map((series) => (
          <div key={series.key} className="flex items-center gap-2">
            <span
              className={series.kind === 'line' ? 'h-[3px] w-5 rounded-full' : 'h-3 w-3 rounded-full'}
              style={{ backgroundColor: series.color }}
            />
            <span className="text-xs font-bold text-slate-500">{series.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const BreakdownChartCard: React.FC<{
  chart: BreakdownChart;
  data: BreakdownDataPoint[];
  granularity: TimeGranularity;
}> = ({ chart, data, granularity }) => {
  const isBuySellTrend = chart.chartType === 'buy-sell-trend';

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">{chart.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{chart.subtitle}</p>
        </div>
      </div>

      {isBuySellTrend ? (
        <BuySellTrendChart chart={chart} data={data} granularity={granularity} />
      ) : (
        <StackedBarChart chart={chart} data={data} granularity={granularity} />
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {chart.series.map((series) => (
          <div key={series.key} className="flex items-center gap-2">
            <span
              className={series.kind === 'line' ? 'h-[3px] w-5 rounded-full' : 'h-3 w-3 rounded-full'}
              style={{ backgroundColor: series.color }}
            />
            <span className="text-xs font-bold text-slate-500">{series.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProductBreakdownPage: React.FC<ProductBreakdownPageProps> = ({ config, productKey, onBack }) => {
  const [metricMode, setMetricMode] = useState<ChartValueTab>('transactionValue');
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const [filterState, setFilterState] = useState<FilterState>(createDefaultFilterState);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [monthlyRangeAnchor, setMonthlyRangeAnchor] = useState<number | null>(null);
  const [annualRangeAnchor, setAnnualRangeAnchor] = useState<number | null>(null);
  const [monthlyYearPanel, setMonthlyYearPanel] = useState<number>(getDecadeStart(CURRENT_YEAR));
  const [quarterlyYearPanel, setQuarterlyYearPanel] = useState<number>(getDecadeStart(LATEST_FULL_QUARTER_YEAR));
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

  const monthlyYearGrid = useMemo(() => buildYearGridCells(monthlyYearPanel), [monthlyYearPanel]);
  const quarterlyYearGrid = useMemo(() => buildYearGridCells(quarterlyYearPanel), [quarterlyYearPanel]);
  const annualYearGrid = useMemo(() => buildYearGridCells(annualYearPanel), [annualYearPanel]);

  const availableMonths = useMemo(
    () => MONTH_LABELS.slice(0, MONTHS_AVAILABLE_BY_YEAR[filterState.monthly.year]),
    [filterState.monthly.year],
  );

  const charts = useMemo(() => injectBranchChart(config.charts, productKey), [config.charts, productKey]);
  const visibleCharts = useMemo(
    () => (productKey === 'equity' ? charts.filter((chart) => chart.title !== 'By Regional Area') : charts),
    [charts, productKey],
  );

  const resolvedCharts = useMemo(
    () =>
      visibleCharts.map((chart) => ({
        chart,
        ...resolveChartData(chart, filterMode, filterState),
      })),
    [visibleCharts, filterMode, filterState],
  );

  const pageSubtitle = useMemo(
    () => formatPageSubtitle(filterMode, filterState),
    [filterMode, filterState],
  );

  const filterSummary = useMemo(() => {
    if (filterMode === 'monthly') {
      return `${filterState.monthly.year} · ${MONTH_LABELS[filterState.monthly.from]} – ${MONTH_LABELS[filterState.monthly.to]}`;
    }

    if (filterMode === 'quarterly') {
      return `${filterState.quarterly.year} · 4-Quarter`;
    }

    return `${filterState.annual.fromYear} – ${filterState.annual.toYear}`;
  }, [filterMode, filterState]);

  const updateMonthlyYear = (year: number) => {
    const maxIndex = MONTHS_AVAILABLE_BY_YEAR[year] - 1;
    setFilterState((prev) => ({
      ...prev,
      monthly: {
        year,
        from: Math.min(prev.monthly.from, maxIndex),
        to: Math.min(prev.monthly.to, maxIndex),
      },
    }));
    setMonthlyRangeAnchor(null);
  };

  const updateQuarterlyYear = (year: number) => {
    setFilterState((prev) => ({
      ...prev,
      quarterly: {
        year,
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
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 bg-gray-50/30 p-4 animate-fade-in sm:p-6 md:p-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Product Performance
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{config.title}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">{pageSubtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Metric View</span>
            <ChartTabToggle tabs={VALUE_TABS} activeTab={metricMode} onChange={setMetricMode} />
          </div>
        </div>

        <div ref={filterRef} className="relative">
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
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(100vw-36px,560px)] rounded-[24px] border border-[#e5edf7] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] max-sm:left-0 max-sm:right-auto">
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
                      <span className="text-sm font-bold text-slate-800">{`${filterState.monthly.year}-${String(filterState.monthly.from + 1).padStart(2, '0')}`}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-sm font-bold text-slate-800">{`${filterState.monthly.year}-${String(filterState.monthly.to + 1).padStart(2, '0')}`}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Statement Year</p>
                    <div className="mt-3 flex items-center justify-between">
                      <button type="button" onClick={() => setMonthlyYearPanel((prev) => prev - 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">‹</button>
                      <span className="text-sm font-black text-slate-700">{monthlyYearPanel}-{monthlyYearPanel + 9}</span>
                      <button type="button" onClick={() => setMonthlyYearPanel((prev) => prev + 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">›</button>
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

                  <div className="mt-1 flex items-center justify-between">
                    <button type="button" onClick={() => setQuarterlyYearPanel((prev) => prev - 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">‹</button>
                    <span className="text-sm font-black text-slate-700">{quarterlyYearPanel}-{quarterlyYearPanel + 9}</span>
                    <button type="button" onClick={() => setQuarterlyYearPanel((prev) => prev + 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">›</button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {quarterlyYearGrid.map((year) => {
                      const isDisabled =
                        !AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number]) ||
                        year > LATEST_FULL_QUARTER_YEAR;
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

                  <div className="mt-1 flex items-center justify-between">
                    <button type="button" onClick={() => setAnnualYearPanel((prev) => prev - 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">‹</button>
                    <span className="text-sm font-black text-slate-700">{annualYearPanel}-{annualYearPanel + 9}</span>
                    <button type="button" onClick={() => setAnnualYearPanel((prev) => prev + 10)} className="text-xl font-black text-slate-300 transition-colors hover:text-slate-500">›</button>
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
              )}
            </div>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {resolvedCharts.map(({ chart, data, granularity }) =>
          chart.valueDatasets ? (
            <MetricBreakdownChartCard
              key={chart.title}
              chart={chart}
              activeTab={metricMode}
              product={PRODUCT_ROUTE_NAMES[productKey]}
              timePeriod={`${filterMode}:${filterSummary}`}
              filterMode={filterMode}
              filterState={filterState}
            />
          ) : (
            <BreakdownChartCard key={chart.title} chart={chart} data={data} granularity={granularity} />
          ),
        )}
      </div>
    </div>
  );
};

export default ProductBreakdownPage;
