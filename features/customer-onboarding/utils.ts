import type { FavorableDirection, KpiMetric, MetricUnit, MetricValueTone, OnboardingTimeFilterState, TimeGranularity, TrendComparison } from './types';

const countFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimalFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const MTD_TOOLTIP = 'Change versus the comparable period in the previous month.';
export const YTD_TOOLTIP = 'Change versus the equivalent year-to-date period in the previous year.';
export const UNAVAILABLE_TREND_TOOLTIP = 'Trend is unavailable because the comparison period value is zero or unavailable.';
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const FIRST_ONBOARDING_YEAR = 2022;

export function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function earliestDailyDate(now = new Date(), workingDayLimit = 90): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isWorkingDay = (value: Date) => value.getDay() !== 0 && value.getDay() !== 6;
  let workingDays = isWorkingDay(date) ? 1 : 0;
  while (workingDays < workingDayLimit) {
    date.setDate(date.getDate() - 1);
    if (isWorkingDay(date)) workingDays += 1;
  }
  return dateInputValue(date);
}

export function createDefaultTimeFilterState(now = new Date()): OnboardingTimeFilterState {
  const year = now.getFullYear();
  const today = dateInputValue(now);
  const monthStart = dateInputValue(new Date(year, now.getMonth(), 1));
  return {
    daily: { from: monthStart < earliestDailyDate(now) ? earliestDailyDate(now) : monthStart, to: today },
    monthly: { year, from: 0, to: now.getMonth() },
    quarterly: { year },
    yearly: { fromYear: Math.max(FIRST_ONBOARDING_YEAR, year - 3), toYear: year },
  };
}

const monthValue = (year: number, monthIndex: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

export function timeFilterValue(granularity: TimeGranularity, state: OnboardingTimeFilterState, now = new Date()): string {
  if (granularity === 'daily') return `${state.daily.from}..${state.daily.to}`;
  if (granularity === 'monthly') {
    return `${monthValue(state.monthly.year, state.monthly.from)}..${monthValue(state.monthly.year, state.monthly.to)}`;
  }
  if (granularity === 'quarterly') {
    const lastQuarter = state.quarterly.year === now.getFullYear() ? Math.floor(now.getMonth() / 3) + 1 : 4;
    return `${state.quarterly.year}-Q1..${state.quarterly.year}-Q${lastQuarter}`;
  }
  return `${state.yearly.fromYear}..${state.yearly.toYear}`;
}

export function timeFilterSummary(granularity: TimeGranularity, state: OnboardingTimeFilterState, now = new Date()): string {
  if (granularity === 'daily') {
    const formatDate = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', timeZone: 'UTC',
    });
    return `${formatDate(state.daily.from)} – ${formatDate(state.daily.to)}`;
  }
  if (granularity === 'monthly') {
    return `${state.monthly.year} · ${MONTH_LABELS[state.monthly.from]} – ${MONTH_LABELS[state.monthly.to]}`;
  }
  if (granularity === 'quarterly') {
    const lastQuarter = state.quarterly.year === now.getFullYear() ? Math.floor(now.getMonth() / 3) + 1 : 4;
    return `${state.quarterly.year} · Q1 – Q${lastQuarter}`;
  }
  return `${state.yearly.fromYear} – ${state.yearly.toYear}`;
}

export function formatMetricValue(value: number | null | undefined, unit: MetricUnit): string {
  if (value == null || !Number.isFinite(value)) return '—';
  if (unit === 'count') return countFormatter.format(value);
  if (unit === 'percentage') return `${oneDecimalFormatter.format(value)}%`;
  return `${oneDecimalFormatter.format(value)} ${unit}`;
}

export function formatTrendValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${oneDecimalFormatter.format(Math.abs(value))}%`;
}

export function calculatePercentage(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function calculateMovement(current: number, comparison: number): TrendComparison {
  if (!Number.isFinite(current) || !Number.isFinite(comparison) || comparison === 0) {
    return { value: null, direction: 'unavailable' };
  }
  const value = ((current - comparison) / Math.abs(comparison)) * 100;
  return { value, direction: value > 0 ? 'up' : value < 0 ? 'down' : 'flat' };
}

export type TrendSemantic = 'positive' | 'negative' | 'neutral';

export function getTrendSemantic(trend: TrendComparison, favorableDirection: FavorableDirection): TrendSemantic {
  if (trend.direction === 'unavailable' || trend.direction === 'flat' || favorableDirection === 'neutral') return 'neutral';
  const isIncrease = trend.direction === 'up';
  return (favorableDirection === 'higher' && isIncrease) || (favorableDirection === 'lower' && !isIncrease)
    ? 'positive'
    : 'negative';
}

export function getTargetValueTone(value: number | null | undefined, target: number, favorableDirection: FavorableDirection): MetricValueTone {
  if (value == null || !Number.isFinite(value) || !Number.isFinite(target) || value === target || favorableDirection === 'neutral') return 'default';
  const isFavorable = favorableDirection === 'higher' ? value > target : value < target;
  return isFavorable ? 'positive' : 'negative';
}

export function periodOptions(granularity: TimeGranularity, now = new Date()): Array<{ value: string; label: string }> {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (granularity === 'daily') {
    return Array.from({ length: 90 }, (_, offset) => {
      const date = new Date(year, month, now.getDate() - offset);
      return { value: dateInputValue(date), label: date.toLocaleDateString('en-US', { dateStyle: 'medium' }) };
    });
  }
  if (granularity === 'monthly') {
    return Array.from({ length: 24 }, (_, offset) => {
      const date = new Date(year, month - offset, 1);
      return {
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    });
  }
  if (granularity === 'quarterly') {
    const currentQuarterIndex = year * 4 + Math.floor(month / 3);
    return Array.from({ length: 12 }, (_, offset) => {
      const quarterIndex = currentQuarterIndex - offset;
      const optionYear = Math.floor(quarterIndex / 4);
      const quarter = (quarterIndex % 4) + 1;
      return { value: `${optionYear}-Q${quarter}`, label: `Q${quarter} ${optionYear}` };
    });
  }
  return Array.from({ length: 5 }, (_, offset) => ({ value: String(year - offset), label: String(year - offset) }));
}

export function defaultPeriod(granularity: TimeGranularity, now = new Date()): string {
  return periodOptions(granularity, now)[0].value;
}

export function periodBounds(granularity: TimeGranularity, value: string): { startDate: string; endDate: string } {
  let start: Date;
  let end: Date;
  if (granularity === 'daily') {
    const [startValue, endValue = startValue] = value.split('..');
    start = new Date(`${startValue}T00:00:00Z`);
    end = new Date(`${endValue}T00:00:00Z`);
  } else if (granularity === 'monthly') {
    const [startValue, endValue = startValue] = value.split('..');
    const [startYear, startMonth] = startValue.split('-').map(Number);
    const [endYear, endMonth] = endValue.split('-').map(Number);
    start = new Date(Date.UTC(startYear, startMonth - 1, 1));
    end = new Date(Date.UTC(endYear, endMonth, 0));
  } else if (granularity === 'quarterly') {
    const [startValue, endValue = startValue] = value.split('..');
    const [startYear, startQuarter] = startValue.split('-Q').map(Number);
    const [endYear, endQuarter] = endValue.split('-Q').map(Number);
    start = new Date(Date.UTC(startYear, (startQuarter - 1) * 3, 1));
    end = new Date(Date.UTC(endYear, endQuarter * 3, 0));
  } else {
    const [startYear, endYear = startYear] = value.split('..').map(Number);
    start = new Date(Date.UTC(startYear, 0, 1));
    end = new Date(Date.UTC(endYear, 11, 31));
  }
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

export function rangeMonthCount(granularity: TimeGranularity, value: string): number {
  const { startDate, endDate } = periodBounds(granularity, value);
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(1, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1);
}

export function rangeCalendarDayCount(value: string): number {
  const { startDate, endDate } = periodBounds('daily', value);
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}

export function hasDashboardData(data: { overview: KpiMetric[]; overSlaTotal: KpiMetric; overSlaBreakdown: KpiMetric[]; pending: KpiMetric[]; quality: KpiMetric[] }): boolean {
  return [data.overSlaTotal, ...data.overview, ...data.overSlaBreakdown, ...data.pending, ...data.quality]
    .some((metric) => metric.value != null);
}
