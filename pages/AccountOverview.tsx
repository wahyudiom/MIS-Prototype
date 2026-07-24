import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarIcon,
  UserGroupIcon,
} from '../components/Icons';

type AccountType = 'Regular' | 'Margin' | 'Syariah' | 'Day Trade';
type AccountTab = 'All' | AccountType;
type TypeOverviewMetric = 'totalAccounts' | 'newAccounts' | 'active' | 'dormant';
type PeriodType = 'Daily' | 'Monthly' | 'Quarterly' | 'Annual';
type PeriodBucketType = 'daily' | 'monthly' | 'quarterly' | 'annual';

type DailyAccountSnapshot = {
  date: string;
  accountType: AccountType;
  totalAccounts: number;
  newAccounts: number;
  closedAccounts: number;
  active: number;
  dormant: number;
  closed: number;
};

type AccountSummary = {
  totalAccounts: number;
  newAccounts: number;
  active: number;
  dormant: number;
  closed: number;
};

type FirstDepositBucket = {
  bucket: string;
  users: number;
};

type FirstDepositMetrics = {
  median: number;
  average: number;
  shortest: number;
  longest: number;
  distribution: FirstDepositBucket[];
  usersWithoutFirstDeposit: number;
};

type RdnBalanceRange =
  | 'negative'
  | 'zero'
  | 'oneTo999999'
  | 'oneMioTo9_9Mio'
  | 'tenMioTo99_9Mio'
  | 'hundredMioTo999_9Mio'
  | 'oneBioTo4_9Bio'
  | 'fiveBioTo9_9Bio'
  | 'tenBioAndAbove';

type RdnBalanceBucket = {
  range: RdnBalanceRange;
  bucket: string;
  users: number;
};

type DormantRiskBucket = {
  bucket: string;
  users: number;
  riskLevel: string;
  description: string;
};

type ActiveTradingUsersPoint = {
  label: string;
  activeTradingUsers: number;
};

const ACCOUNT_TYPES: AccountType[] = ['Regular', 'Margin', 'Syariah', 'Day Trade'];
const ACCOUNT_TABS: AccountTab[] = ['All', ...ACCOUNT_TYPES];
const PERIOD_TYPES: PeriodType[] = ['Daily', 'Monthly', 'Quarterly', 'Annual'];
const YEARS = [2022, 2023, 2024, 2025, 2026];
const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
];
const QUARTERS = [
  { label: 'Q1', startMonth: 0, endMonth: 2 },
  { label: 'Q2', startMonth: 3, endMonth: 5 },
  { label: 'Q3', startMonth: 6, endMonth: 8 },
  { label: 'Q4', startMonth: 9, endMonth: 11 },
];
const LATEST_AVAILABLE_DATE = '2026-06-30';

const STATUS_COLORS = {
  active: '#2563eb',
  close: '#ef4444',
  freezeKsei: '#f59e0b',
  block: '#f97316',
  badDebt: '#be123c',
  onboarding: '#14b8a6',
};

const TYPE_COLORS: Record<AccountType, string> = {
  Regular: '#2563eb',
  Margin: '#8b5cf6',
  Syariah: '#10b981',
  'Day Trade': '#f97316',
};

const TYPE_OVERVIEW_LABELS: Record<TypeOverviewMetric, string> = {
  totalAccounts: 'Total Accounts',
  newAccounts: 'New Accounts',
  active: 'Active Accounts',
  dormant: 'Dormant Accounts',
};

const UNIQUE_USER_RATIO: Record<AccountType, number> = {
  Regular: 0.89,
  Margin: 0.72,
  Syariah: 0.81,
  'Day Trade': 0.64,
};

const ALL_UNIQUE_USER_DEDUP_FACTOR = 0.83;

const FIRST_DEPOSIT_BUCKETS = ['0-15 min', '16-30 min', '31-60 min', '1-3 hours', '3-6 hours', '6-24 hours', '>24 hours'];

const TRADING_ACTIVITY_SCALE: Record<AccountTab, number> = {
  All: 1,
  Regular: 0.74,
  Margin: 0.13,
  Syariah: 0.08,
  'Day Trade': 0.05,
};

const RDN_BALANCE_BUCKET_LABELS: Record<RdnBalanceRange, string> = {
  negative: 'Balance < IDR 0',
  zero: 'Balance = IDR 0',
  oneTo999999: 'IDR 1 - IDR 999,999',
  oneMioTo9_9Mio: 'IDR 1 Mio - IDR 9.9 Mio',
  tenMioTo99_9Mio: 'IDR 10 Mio - IDR 99.9 Mio',
  hundredMioTo999_9Mio: 'IDR 100 Mio - IDR 999.9 Mio',
  oneBioTo4_9Bio: 'IDR 1 Bio - IDR 4.9 Bio',
  fiveBioTo9_9Bio: 'IDR 5 Bio - IDR 9.9 Bio',
  tenBioAndAbove: '>= IDR 10 Bio',
};

const createRdnBalanceBucket = (range: RdnBalanceRange, users: number): RdnBalanceBucket => ({
  range,
  bucket: RDN_BALANCE_BUCKET_LABELS[range],
  users,
});

const RDN_BALANCE_SNAPSHOT: RdnBalanceBucket[] = [
  createRdnBalanceBucket('zero', 420000),
  createRdnBalanceBucket('oneTo999999', 230000),
  createRdnBalanceBucket('oneMioTo9_9Mio', 185000),
  createRdnBalanceBucket('tenMioTo99_9Mio', 102000),
  createRdnBalanceBucket('hundredMioTo999_9Mio', 58000),
  createRdnBalanceBucket('oneBioTo4_9Bio', 19500),
  createRdnBalanceBucket('fiveBioTo9_9Bio', 6200),
  createRdnBalanceBucket('tenBioAndAbove', 1350),
];

// TODO: Replace static dormant risk mock data with date-filtered and account-type-aware API data.
const DORMANT_RISK_PROFILE: Record<AccountTab, DormantRiskBucket[]> = {
  All: [
    { bucket: '30-60 days', users: 92000, riskLevel: 'Low Risk', description: 'Users in this bucket have been inactive for 30 to 60 days.' },
    { bucket: '61-90 days', users: 74000, riskLevel: 'Medium Risk', description: 'Users in this bucket have been inactive for 61 to 90 days.' },
    { bucket: '91-180 days', users: 118000, riskLevel: 'High Risk', description: 'Users in this bucket have been inactive for 91 to 180 days.' },
    { bucket: '>180 days', users: 84553, riskLevel: 'Critical', description: 'Users in this bucket have been inactive for more than 180 days.' },
  ],
  Regular: [
    { bucket: '30-60 days', users: 71000, riskLevel: 'Low Risk', description: 'Users in this bucket have been inactive for 30 to 60 days.' },
    { bucket: '61-90 days', users: 58500, riskLevel: 'Medium Risk', description: 'Users in this bucket have been inactive for 61 to 90 days.' },
    { bucket: '91-180 days', users: 89000, riskLevel: 'High Risk', description: 'Users in this bucket have been inactive for 91 to 180 days.' },
    { bucket: '>180 days', users: 63200, riskLevel: 'Critical', description: 'Users in this bucket have been inactive for more than 180 days.' },
  ],
  Margin: [
    { bucket: '30-60 days', users: 8200, riskLevel: 'Low Risk', description: 'Users in this bucket have been inactive for 30 to 60 days.' },
    { bucket: '61-90 days', users: 6100, riskLevel: 'Medium Risk', description: 'Users in this bucket have been inactive for 61 to 90 days.' },
    { bucket: '91-180 days', users: 11200, riskLevel: 'High Risk', description: 'Users in this bucket have been inactive for 91 to 180 days.' },
    { bucket: '>180 days', users: 8300, riskLevel: 'Critical', description: 'Users in this bucket have been inactive for more than 180 days.' },
  ],
  Syariah: [
    { bucket: '30-60 days', users: 10900, riskLevel: 'Low Risk', description: 'Users in this bucket have been inactive for 30 to 60 days.' },
    { bucket: '61-90 days', users: 7600, riskLevel: 'Medium Risk', description: 'Users in this bucket have been inactive for 61 to 90 days.' },
    { bucket: '91-180 days', users: 13800, riskLevel: 'High Risk', description: 'Users in this bucket have been inactive for 91 to 180 days.' },
    { bucket: '>180 days', users: 9500, riskLevel: 'Critical', description: 'Users in this bucket have been inactive for more than 180 days.' },
  ],
  'Day Trade': [
    { bucket: '30-60 days', users: 1900, riskLevel: 'Low Risk', description: 'Users in this bucket have been inactive for 30 to 60 days.' },
    { bucket: '61-90 days', users: 1800, riskLevel: 'Medium Risk', description: 'Users in this bucket have been inactive for 61 to 90 days.' },
    { bucket: '91-180 days', users: 4000, riskLevel: 'High Risk', description: 'Users in this bucket have been inactive for 91 to 180 days.' },
    { bucket: '>180 days', users: 3553, riskLevel: 'Critical', description: 'Users in this bucket have been inactive for more than 180 days.' },
  ],
};

const FIRST_DEPOSIT_PROFILE: Record<AccountTab, { median: number; average: number; shortest: number; longest: number; distribution: number[]; pendingRate: number }> = {
  All: {
    median: 42,
    average: 68,
    shortest: 3,
    longest: 2480,
    distribution: [1240, 2860, 3420, 2100, 980, 620, 210],
    pendingRate: 0.34,
  },
  Regular: {
    median: 39,
    average: 63,
    shortest: 2,
    longest: 2215,
    distribution: [980, 2260, 2760, 1680, 760, 440, 150],
    pendingRate: 0.31,
  },
  Margin: {
    median: 55,
    average: 84,
    shortest: 6,
    longest: 2710,
    distribution: [120, 310, 470, 360, 210, 155, 64],
    pendingRate: 0.39,
  },
  Syariah: {
    median: 47,
    average: 73,
    shortest: 4,
    longest: 2360,
    distribution: [210, 520, 690, 420, 190, 130, 42],
    pendingRate: 0.36,
  },
  'Day Trade': {
    median: 31,
    average: 52,
    shortest: 1,
    longest: 1560,
    distribution: [75, 180, 230, 140, 62, 40, 12],
    pendingRate: 0.24,
  },
};

const monthlyTargets: Record<string, number> = {
  '2026-04': 22000,
  '2026-05': 23500,
  '2026-06': 25000,
  '2026-07': 26000,
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const endOfMonth = (year: number, month: number) => new Date(year, month, 0);

const daysBetweenInclusive = (start: Date, end: Date) => {
  const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.max(0, Math.round((endMs - startMs) / 86400000) + 1);
};

const dateRange = (start: Date, end: Date) => {
  const dates: Date[] = [];
  for (let current = new Date(start); current <= end; current = addDays(current, 1)) {
    dates.push(new Date(current));
  }
  return dates;
};

const clampEndToAvailable = (dateKey: string) => (dateKey > LATEST_AVAILABLE_DATE ? LATEST_AVAILABLE_DATE : dateKey);

const getPeriodSelection = ({
  periodType,
  dailyStart,
  dailyEnd,
  monthlyYear,
  monthlyStartMonth,
  monthlyEndMonth,
  quarterlyYear,
  annualStartYear,
  annualEndYear,
}: {
  periodType: PeriodType;
  dailyStart: string;
  dailyEnd: string;
  monthlyYear: number;
  monthlyStartMonth: number;
  monthlyEndMonth: number;
  quarterlyYear: number;
  annualStartYear: number;
  annualEndYear: number;
}) => {
  if (periodType === 'Daily') {
    const selectedStart = dailyStart <= dailyEnd ? dailyStart : dailyEnd;
    const selectedEnd = dailyStart <= dailyEnd ? dailyEnd : dailyStart;
    return {
      selectedStart,
      selectedEnd,
      effectiveSelectedEnd: clampEndToAvailable(selectedEnd),
      bucketType: 'daily' as PeriodBucketType,
      summaryLabel: `${formatShortDate(selectedStart)} - ${formatShortDate(selectedEnd)}`,
    };
  }

  if (periodType === 'Monthly') {
    const startMonth = Math.min(monthlyStartMonth, monthlyEndMonth);
    const endMonth = Math.max(monthlyStartMonth, monthlyEndMonth);
    const selectedStart = toDateKey(new Date(monthlyYear, startMonth - 1, 1));
    const selectedEnd = toDateKey(endOfMonth(monthlyYear, endMonth));
    return {
      selectedStart,
      selectedEnd,
      effectiveSelectedEnd: clampEndToAvailable(selectedEnd),
      bucketType: 'daily' as PeriodBucketType,
      summaryLabel: `${monthlyYear} ${MONTHS[startMonth - 1].short} - ${MONTHS[endMonth - 1].short}`,
    };
  }

  if (periodType === 'Quarterly') {
    const selectedStart = `${quarterlyYear}-01-01`;
    const selectedEnd = `${quarterlyYear}-12-31`;
    return {
      selectedStart,
      selectedEnd,
      effectiveSelectedEnd: clampEndToAvailable(selectedEnd),
      bucketType: 'quarterly' as PeriodBucketType,
      summaryLabel: `${quarterlyYear} Q1 - Q4`,
    };
  }

  const startYear = Math.min(annualStartYear, annualEndYear);
  const endYear = Math.max(annualStartYear, annualEndYear);
  const selectedStart = `${startYear}-01-01`;
  const selectedEnd = `${endYear}-12-31`;
  return {
    selectedStart,
    selectedEnd,
    effectiveSelectedEnd: clampEndToAvailable(selectedEnd),
    bucketType: 'annual' as PeriodBucketType,
    summaryLabel: `${startYear} - ${endYear}`,
  };
};

const formatLongDate = (dateKey: string) =>
  new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(parseDateKey(dateKey));

const formatShortDate = (dateKey: string) =>
  new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(parseDateKey(dateKey));

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: value >= 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000000 ? 2 : 0,
  }).format(Math.round(value));

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

const formatMinutes = (value: number) => `${formatNumber(value)} min`;

const formatReadableDuration = (minutes: number) => {
  if (minutes < 60) return null;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatPercent = (value: number | null, fractionDigits = 1) => {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(fractionDigits)}%`;
};

const safeChangePct = (current: number, previous: number) => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const buildMockAccountData = (): DailyAccountSnapshot[] => {
  const config: Record<AccountType, { base: number; activeRate: number; dormantRate: number; closedRate: number; newBase: number }> = {
    Regular: { base: 1125000, activeRate: 0.71, dormantRate: 0.22, closedRate: 0.07, newBase: 520 },
    Margin: { base: 138000, activeRate: 0.67, dormantRate: 0.26, closedRate: 0.07, newBase: 68 },
    Syariah: { base: 214000, activeRate: 0.64, dormantRate: 0.28, closedRate: 0.08, newBase: 105 },
    'Day Trade': { base: 46000, activeRate: 0.78, dormantRate: 0.17, closedRate: 0.05, newBase: 34 },
  };

  const start = new Date(2022, 0, 1);
  const end = parseDateKey(LATEST_AVAILABLE_DATE);
  const snapshots: DailyAccountSnapshot[] = [];

  ACCOUNT_TYPES.forEach((accountType, typeIndex) => {
    let total = config[accountType].base;
    dateRange(start, end).forEach((date, dayIndex) => {
      const seasonal = Math.sin((dayIndex + typeIndex * 5) / 4) * 0.11;
      const weekdayBoost = date.getDay() >= 1 && date.getDay() <= 5 ? 1 : 0.42;
      const newAccounts = Math.max(3, Math.round(config[accountType].newBase * weekdayBoost * (1 + seasonal)));
      const closedToday = Math.round(newAccounts * (0.11 + typeIndex * 0.012));
      total += newAccounts - closedToday;

      const activeRate = config[accountType].activeRate + Math.sin(dayIndex / 11 + typeIndex) * 0.012;
      const dormantRate = config[accountType].dormantRate + Math.cos(dayIndex / 13 + typeIndex) * 0.009;
      const closedRate = Math.max(0.035, 1 - activeRate - dormantRate);
      const active = Math.round(total * activeRate);
      const dormant = Math.round(total * dormantRate);
      const closed = Math.max(0, total - active - dormant);

      snapshots.push({
        date: toDateKey(date),
        accountType,
        totalAccounts: total,
        newAccounts,
        closedAccounts: closedToday,
        active,
        dormant,
        closed: Math.max(closed, Math.round(total * closedRate)),
      });
    });
  });

  return snapshots;
};

const accountData = buildMockAccountData();

const getGranularity = (days: number) => {
  if (days <= 31) return 'Daily';
  if (days <= 120) return 'Weekly';
  return 'Monthly';
};

const filterByType = (rows: DailyAccountSnapshot[], tab: AccountTab) =>
  tab === 'All' ? rows : rows.filter((row) => row.accountType === tab);

const getPeriodRows = (rows: DailyAccountSnapshot[], startKey: string, endKey: string, tab: AccountTab) => {
  const filtered = filterByType(rows, tab);
  return filtered.filter((row) => row.date >= startKey && row.date <= endKey);
};

const summarizePeriod = (rows: DailyAccountSnapshot[], startKey: string, endKey: string, tab: AccountTab): AccountSummary | null => {
  const periodRows = getPeriodRows(rows, startKey, endKey, tab);
  if (periodRows.length === 0) return null;

  const endRows = periodRows.filter((row) => row.date === endKey);
  const fallbackLatestDate = periodRows.map((row) => row.date).sort().at(-1);
  const latestRows = endRows.length > 0 ? endRows : periodRows.filter((row) => row.date === fallbackLatestDate);

  return {
    totalAccounts: latestRows.reduce((sum, row) => sum + row.totalAccounts, 0),
    newAccounts: periodRows.reduce((sum, row) => sum + row.newAccounts, 0),
    active: latestRows.reduce((sum, row) => sum + row.active, 0),
    dormant: latestRows.reduce((sum, row) => sum + row.dormant, 0),
    closed: latestRows.reduce((sum, row) => sum + row.closed, 0),
  };
};

const getPreviousRange = (startKey: string, endKey: string) => {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const days = daysBetweenInclusive(start, end);
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(days - 1));
  return {
    start: toDateKey(previousStart),
    end: toDateKey(previousEnd),
    days,
  };
};

const getTargetForRange = (startKey: string, endKey: string) => {
  const months = new Set<string>();
  dateRange(parseDateKey(startKey), parseDateKey(endKey)).forEach((date) => {
    months.add(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`);
  });
  const target = [...months].reduce((sum, monthKey) => {
    const monthTarget = monthlyTargets[monthKey];
    return monthTarget ? sum + monthTarget : sum;
  }, 0);
  return target > 0 ? target : null;
};

const valueFromSummary = (summary: AccountSummary, metric: TypeOverviewMetric) => {
  return summary[metric];
};

const getTargetPaceForOffset = (startKey: string, endKey: string, elapsedDays: number) => {
  const totalDays = daysBetweenInclusive(parseDateKey(startKey), parseDateKey(endKey));
  const totalTarget = getTargetForRange(startKey, endKey);
  if (!totalTarget || totalDays === 0) return null;
  return Math.round((totalTarget / totalDays) * elapsedDays);
};

const buildPeriodBuckets = (
  periodType: PeriodType,
  selection: ReturnType<typeof getPeriodSelection>,
  options: {
    monthlyYear?: number;
    monthlyStartMonth?: number;
    monthlyEndMonth?: number;
    quarterlyYear?: number;
    annualStartYear?: number;
    annualEndYear?: number;
  } = {},
) => {
  if (periodType === 'Daily') {
    return dateRange(parseDateKey(selection.selectedStart), parseDateKey(selection.selectedEnd)).map((date) => {
      const key = toDateKey(date);
      return { label: formatShortDate(key), startKey: key, endKey: key };
    });
  }

  if (periodType === 'Monthly') {
    const year = options.monthlyYear ?? 2026;
    const startMonth = Math.min(options.monthlyStartMonth ?? 1, options.monthlyEndMonth ?? 12);
    const endMonth = Math.max(options.monthlyStartMonth ?? 1, options.monthlyEndMonth ?? 12);
    return MONTHS.filter((monthItem) => monthItem.value >= startMonth && monthItem.value <= endMonth).map((monthItem) => {
      return {
        label: monthItem.short,
        startKey: toDateKey(new Date(year, monthItem.value - 1, 1)),
        endKey: toDateKey(endOfMonth(year, monthItem.value)),
      };
    });
  }

  if (periodType === 'Quarterly') {
    const year = options.quarterlyYear ?? 2026;
    return QUARTERS.map((quarter) => ({
      label: quarter.label,
      startKey: toDateKey(new Date(year, quarter.startMonth, 1)),
      endKey: toDateKey(endOfMonth(year, quarter.endMonth + 1)),
    }));
  }

  const startYear = Math.min(options.annualStartYear ?? 2022, options.annualEndYear ?? 2026);
  const endYear = Math.max(options.annualStartYear ?? 2022, options.annualEndYear ?? 2026);
  return YEARS.filter((year) => year >= startYear && year <= endYear).map((year) => ({
    label: String(year),
    startKey: `${year}-01-01`,
    endKey: `${year}-12-31`,
  }));
};

const hasRowsForRange = (rows: DailyAccountSnapshot[], startKey: string, endKey: string, tab: AccountTab) =>
  getPeriodRows(rows, startKey, endKey, tab).length > 0;

const buildFirstDepositMetrics = (tab: AccountTab, startKey: string, endKey: string, isPreviousPeriod = false): FirstDepositMetrics | null => {
  const days = daysBetweenInclusive(parseDateKey(startKey), parseDateKey(endKey));
  if (days === 0) return null;

  const profile = FIRST_DEPOSIT_PROFILE[tab];
  const startDate = parseDateKey(startKey);
  const dateInfluence = Math.sin((startDate.getMonth() + 1) * 0.75 + startDate.getDate() / 9);
  const periodScale = Math.max(0.2, days / 30);
  const speedFactor = 1 + dateInfluence * 0.035 + (isPreviousPeriod ? 0.08 : 0);
  const volumeFactor = periodScale * (1 + dateInfluence * 0.08 + (isPreviousPeriod ? -0.06 : 0));

  const distribution = profile.distribution.map((baseUsers, index) => ({
    bucket: FIRST_DEPOSIT_BUCKETS[index],
    users: Math.max(0, Math.round(baseUsers * volumeFactor)),
  }));

  const totalFirstDepositUsers = distribution.reduce((sum, bucket) => sum + bucket.users, 0);
  return {
    median: Math.max(1, Math.round(profile.median * speedFactor)),
    average: Math.max(1, Math.round(profile.average * speedFactor)),
    shortest: Math.max(1, Math.round(profile.shortest * speedFactor)),
    longest: Math.max(1, Math.round(profile.longest * speedFactor)),
    distribution,
    usersWithoutFirstDeposit: Math.round(totalFirstDepositUsers * profile.pendingRate),
  };
};

// TODO: Replace M-STOCK equity trading mock data with API data filtered by:
// user_id, transaction_date/timestamp_wib, account_type, Buy/Sell side, Equity asset class,
// M-STOCK platform, and Completed/Matched status. Exclude cancelled, rejected, expired, or failed orders.
const buildDailyTradingValue = (date: Date, index: number, tab: AccountTab) => {
  const weekdayFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.68 : 1;
  const momentum = 1 + Math.sin((index + date.getMonth() * 3) / 3.2) * 0.13;
  const monthLift = 1 + date.getMonth() * 0.012;
  return Math.max(0, Math.round(1320 * weekdayFactor * momentum * monthLift * TRADING_ACTIVITY_SCALE[tab]));
};

const buildActiveTradingUsersData = (
  tab: AccountTab,
  periodType: PeriodType,
  selection: ReturnType<typeof getPeriodSelection>,
  bucketOptions: Parameters<typeof buildPeriodBuckets>[2],
): ActiveTradingUsersPoint[] =>
  buildPeriodBuckets(periodType, selection, bucketOptions)
    .filter((bucket) => bucket.startKey <= LATEST_AVAILABLE_DATE)
    .map((bucket, index) => {
      const dates = dateRange(parseDateKey(bucket.startKey), parseDateKey(clampEndToAvailable(bucket.endKey)));
      const rawTotal = dates.reduce((sum, date, dayIndex) => sum + buildDailyTradingValue(date, index * 31 + dayIndex, tab), 0);
      const dedupFactor = periodType === 'Quarterly' ? 0.42 : periodType === 'Annual' ? 0.22 : periodType === 'Monthly' ? 0.55 : 1;
      return {
        label: bucket.label,
        activeTradingUsers: Math.max(0, Math.round(rawTotal * dedupFactor)),
      };
    });

const estimateUniqueUsers = (summary: AccountSummary, accountType: AccountType) =>
  Math.round(summary.totalAccounts * UNIQUE_USER_RATIO[accountType]);

const estimatePeriodUniqueUsers = (rows: DailyAccountSnapshot[], startKey: string, endKey: string, tab: AccountTab) => {
  if (tab !== 'All') {
    const summary = summarizePeriod(rows, startKey, endKey, tab);
    return summary ? estimateUniqueUsers(summary, tab) : null;
  }

  const typeValues = ACCOUNT_TYPES.map((accountType) => {
    const summary = summarizePeriod(rows, startKey, endKey, accountType);
    return summary ? estimateUniqueUsers(summary, accountType) : null;
  });

  if (typeValues.some((value) => value === null)) return null;

  // Mock user-ID deduplication: users can own multiple account types, so All is intentionally not a raw sum.
  return Math.round((typeValues as number[]).reduce((sum, value) => sum + value, 0) * ALL_UNIQUE_USER_DEDUP_FACTOR);
};

const buildUniqueUserTrendData = (
  rows: DailyAccountSnapshot[],
  periodType: PeriodType,
  selection: ReturnType<typeof getPeriodSelection>,
  bucketOptions: Parameters<typeof buildPeriodBuckets>[2],
  tab: AccountTab,
) => {
  const buckets = buildPeriodBuckets(periodType, selection, bucketOptions);
  const data: Array<{
    label: string;
    selectedPeriodUniqueUsers: number | null;
  }> = [];

  buckets.forEach((bucket) => {
    const selectedEnd = clampEndToAvailable(bucket.endKey);
    const selectedValue = bucket.startKey > LATEST_AVAILABLE_DATE ? null : estimatePeriodUniqueUsers(rows, bucket.startKey, selectedEnd, tab);

    data.push({
      label: bucket.label,
      selectedPeriodUniqueUsers: selectedValue,
    });
  });

  return { granularity: periodType, data };
};

const buildTrendData = (
  rows: DailyAccountSnapshot[],
  periodType: PeriodType,
  selection: ReturnType<typeof getPeriodSelection>,
  bucketOptions: Parameters<typeof buildPeriodBuckets>[2],
  tab: AccountTab,
) => {
  const period = selection;
  const bucketsToRender = buildPeriodBuckets(periodType, selection, bucketOptions);
  const buckets: Array<{
    label: string;
    newAccounts: number | null;
    closedAccounts: number | null;
    dormantAccounts: number | null;
    netGrowth: number | null;
    cumulativeNewAccounts: number;
    cumulativeTargetPace: number | null;
    selectedIndex: number | null;
    selectedTotalAccounts: number;
  }> = [];
  let cumulativeNewAccounts = 0;
  let firstSelectedTotal: number | null = null;

  bucketsToRender.forEach((bucket, index) => {
    const selectedEndKey = clampEndToAvailable(bucket.endKey);
    const isAvailable = bucket.startKey <= LATEST_AVAILABLE_DATE && hasRowsForRange(rows, bucket.startKey, selectedEndKey, tab);
    const selectedSummary = isAvailable ? summarizePeriod(rows, bucket.startKey, selectedEndKey, tab) : null;
    const selectedRows = isAvailable ? getPeriodRows(rows, bucket.startKey, selectedEndKey, tab) : [];

    const newAccounts = selectedSummary ? selectedRows.reduce((sum, row) => sum + row.newAccounts, 0) : null;
    const closedAccounts = selectedSummary ? selectedRows.reduce((sum, row) => sum + row.closedAccounts, 0) : null;
    const dormantAccounts = selectedSummary ? selectedRows.reduce((sum, row) => sum + Math.max(1, Math.round(row.newAccounts * 0.07)), 0) : null;
    cumulativeNewAccounts += newAccounts ?? 0;
    if (selectedSummary) firstSelectedTotal ??= selectedSummary.totalAccounts;
    const elapsedDays = Math.min(daysBetweenInclusive(parseDateKey(period.selectedStart), parseDateKey(bucket.endKey)), daysBetweenInclusive(parseDateKey(period.selectedStart), parseDateKey(period.selectedEnd)));
    const selectedIndex =
      firstSelectedTotal && firstSelectedTotal > 0 && selectedSummary ? (selectedSummary.totalAccounts / firstSelectedTotal) * 100 : null;

    buckets.push({
      label: bucket.label,
      newAccounts,
      closedAccounts,
      dormantAccounts,
      netGrowth: newAccounts !== null && closedAccounts !== null ? newAccounts - closedAccounts : null,
      cumulativeNewAccounts,
      cumulativeTargetPace: getTargetPaceForOffset(period.selectedStart, period.selectedEnd, elapsedDays),
      selectedIndex,
      selectedTotalAccounts: selectedSummary?.totalAccounts ?? 0,
    });
  });

  return { granularity: periodType, data: buckets };
};

const AccountOverview: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<AccountTab>('All');
  const [periodType, setPeriodType] = useState<PeriodType>('Daily');
  const [dailyStartDate, setDailyStartDate] = useState('2026-06-01');
  const [dailyEndDate, setDailyEndDate] = useState('2026-06-30');
  const [monthlyYear, setMonthlyYear] = useState(2026);
  const [monthlyStartMonth, setMonthlyStartMonth] = useState(1);
  const [monthlyEndMonth, setMonthlyEndMonth] = useState(6);
  const [quarterlyYear, setQuarterlyYear] = useState(2026);
  const [annualStartYear, setAnnualStartYear] = useState(2022);
  const [annualEndYear, setAnnualEndYear] = useState(2026);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [typeMetric, setTypeMetric] = useState<TypeOverviewMetric>('totalAccounts');
  const showFirstDeposit = false;

  const periodSelection = getPeriodSelection({
    periodType,
    dailyStart: dailyStartDate,
    dailyEnd: dailyEndDate,
    monthlyYear,
    monthlyStartMonth,
    monthlyEndMonth,
    quarterlyYear,
    annualStartYear,
    annualEndYear,
  });
  const bucketOptions = { monthlyYear, monthlyStartMonth, monthlyEndMonth, quarterlyYear, annualStartYear, annualEndYear };
  const normalizedStart = periodSelection.selectedStart;
  const normalizedEnd = periodSelection.effectiveSelectedEnd;
  const dailyWorkingDays = dateRange(parseDateKey(periodSelection.selectedStart), parseDateKey(periodSelection.effectiveSelectedEnd)).filter((date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }).length;
  const validationMessage =
    periodType === 'Daily' && dailyWorkingDays > 90
      ? 'Daily filter can only show up to the last 90 working days.'
      : periodType === 'Monthly' && monthlyStartMonth > monthlyEndMonth
        ? 'Monthly range must be within the same year.'
        : annualStartYear > annualEndYear
          ? 'Annual start year cannot be after end year.'
          : null;
  const helperCopy =
    periodType === 'Daily'
      ? 'Daily range can show up to the last 90 working days.'
      : periodType === 'Monthly'
        ? 'Monthly range must be within the same year.'
        : periodType === 'Quarterly'
          ? 'Quarterly view shows Q1-Q4 breakdown for the selected year.'
          : 'Annual view shows one data point per selected year.';

  const currentSummary = useMemo(
    () => summarizePeriod(accountData, normalizedStart, normalizedEnd, selectedTab),
    [normalizedStart, normalizedEnd, selectedTab],
  );

  const trend = buildTrendData(accountData, periodType, periodSelection, bucketOptions, selectedTab);
  const uniqueUserTrend = buildUniqueUserTrendData(accountData, periodType, periodSelection, bucketOptions, selectedTab);
  const hasUniqueUserTrendData = uniqueUserTrend.data.some((point) => point.selectedPeriodUniqueUsers !== null);
  const uniqueVisibleValues = uniqueUserTrend.data.flatMap((point) =>
    [point.selectedPeriodUniqueUsers].filter((value): value is number => value !== null),
  );
  const uniqueMinValue = uniqueVisibleValues.length > 0 ? Math.min(...uniqueVisibleValues) : 0;
  const uniqueMaxValue = uniqueVisibleValues.length > 0 ? Math.max(...uniqueVisibleValues) : 0;
  const uniqueRange = Math.max(uniqueMaxValue - uniqueMinValue, 1);
  const uniquePadding = Math.max(uniqueRange * 0.05, 1000);
  const uniqueYAxisDomain: [number, number] = [
    Math.max(0, Math.floor(uniqueMinValue - uniquePadding)),
    Math.ceil(uniqueMaxValue + uniquePadding),
  ];
  const uniqueSelectedSummary = (() => {
    const points = uniqueUserTrend.data.filter((point) => point.selectedPeriodUniqueUsers !== null);
    if (points.length === 0) return null;
    const start = points[0].selectedPeriodUniqueUsers as number;
    const end = points[points.length - 1].selectedPeriodUniqueUsers as number;
    return { start, end, difference: end - start, growth: safeChangePct(end, start) };
  })();
  const activeTradingUsersData = buildActiveTradingUsersData(selectedTab, periodType, periodSelection, bucketOptions);
  // TODO: When this uses an API, avoid fetching first-deposit detail while the section is hidden.
  const firstDepositMetrics = showFirstDeposit ? buildFirstDepositMetrics(selectedTab, normalizedStart, normalizedEnd) : null;
  const firstDepositTotalUsers = firstDepositMetrics?.distribution.reduce((sum, bucket) => sum + bucket.users, 0) ?? 0;
  const rdnTotalUsers = RDN_BALANCE_SNAPSHOT.reduce((sum, bucket) => sum + bucket.users, 0);
  const rdnZeroUsers = RDN_BALANCE_SNAPSHOT.find((bucket) => bucket.range === 'zero')?.users ?? 0;
  const rdnPositiveUsers = Math.max(0, rdnTotalUsers - rdnZeroUsers);
  const dormantRiskData = DORMANT_RISK_PROFILE[selectedTab];
  const dormantRiskTotal = dormantRiskData.reduce((sum, bucket) => sum + bucket.users, 0);
  const severeDormancy = dormantRiskData
    .filter((bucket) => bucket.bucket === '91-180 days' || bucket.bucket === '>180 days')
    .reduce((sum, bucket) => sum + bucket.users, 0);
  const firstDepositKpis = firstDepositMetrics
    ? [
        {
          label: 'Median Time',
          value: firstDepositMetrics.median,
          helper: 'Middle value across users with first deposit',
          outlierNote: '',
        },
        {
          label: 'Average Time',
          value: firstDepositMetrics.average,
          helper: 'Average minutes from activation to first deposit',
          outlierNote: '',
        },
        {
          label: 'Shortest Time',
          value: firstDepositMetrics.shortest,
          helper: 'Fastest observed first deposit time',
          outlierNote: '',
        },
        {
          label: 'Longest Time',
          value: firstDepositMetrics.longest,
          helper: 'Slowest observed first deposit time',
          outlierNote: 'This value may be affected by outliers.',
        },
      ]
    : [];
  const renderUniqueEndpointLabel = ({
    x,
    y,
    value,
    index,
  }: {
    x?: number | string;
    y?: number | string;
    value?: number | string;
    index?: number;
  }) => {
    if (index !== 0 && index !== uniqueUserTrend.data.length - 1) return null;
    if (value === undefined || value === null || x === undefined || y === undefined) return null;
    const labelX = Number(x);
    const labelY = Number(y) - 12;
    const isLastPoint = index === uniqueUserTrend.data.length - 1;
    return (
      <text x={labelX} y={labelY} textAnchor={isLastPoint ? 'end' : 'start'} fill="#1d4ed8" fontSize={11} fontWeight={900}>
        {formatCompactNumber(Number(value))}
      </text>
    );
  };

  const typeOverviewData = ACCOUNT_TYPES.map((accountType) => {
    const summary = summarizePeriod(accountData, normalizedStart, normalizedEnd, accountType);
    return {
      name: accountType,
      value: summary ? valueFromSummary(summary, typeMetric) : 0,
      fill: TYPE_COLORS[accountType],
    };
  });

  const hasData = Boolean(currentSummary);
  const isPositive = false;

  const metricCards = currentSummary
    ? [
        {
          label: 'Total Accounts',
          value: formatNumber(currentSummary.totalAccounts),
          change: null,
          description: 'Total account base at period end',
          icon: <UserGroupIcon className="w-5 h-5" />,
          metric: 'totalAccounts' as keyof AccountSummary,
        },
      ]
    : [];

  const statusComposition = currentSummary
    ? (() => {
        const freezeKsei = Math.round(currentSummary.dormant * 0.36);
        const block = Math.round(currentSummary.dormant * 0.24);
        const badDebt = Math.round(currentSummary.dormant * 0.18);
        const onboarding = Math.max(0, currentSummary.dormant - freezeKsei - block - badDebt);

        return [
          { name: 'Active', value: currentSummary.active, fill: STATUS_COLORS.active },
          { name: 'Close', value: currentSummary.closed, fill: STATUS_COLORS.close },
          { name: 'Freeze KSEI', value: freezeKsei, fill: STATUS_COLORS.freezeKsei },
          { name: 'Block', value: block, fill: STATUS_COLORS.block },
          { name: 'Bad Debt', value: badDebt, fill: STATUS_COLORS.badDebt },
          { name: 'Onboarding', value: onboarding, fill: STATUS_COLORS.onboarding },
        ];
      })()
    : [];

  const accountOverviewBreakdownCharts = (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-xl font-black text-slate-950">Account Status Composition</h3>
        <div className="h-[340px] mt-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusComposition} dataKey="value" nameKey="name" innerRadius={82} outerRadius={124} paddingAngle={2}>
                {statusComposition.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [formatNumber(value), name]} />
              <Legend
                verticalAlign="bottom"
                content={() => (
                  <ul
                    aria-label="Account status legend"
                    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-extrabold"
                  >
                    {statusComposition.map((entry) => (
                      <li key={entry.name} className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: entry.fill }}>
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} aria-hidden="true" />
                        {entry.name}
                      </li>
                    ))}
                  </ul>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-400">Total Accounts</p>
              <p className="text-2xl font-black text-slate-950">{formatCompactNumber(currentSummary?.totalAccounts ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedTab === 'All' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xl font-black text-slate-950">Account Type Overview</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_OVERVIEW_LABELS) as TypeOverviewMetric[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setTypeMetric(metric)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                    typeMetric === metric ? 'bg-blue-600 text-white' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'
                  }`}
                >
                  {TYPE_OVERVIEW_LABELS[metric]}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[340px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeOverviewData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={82}
                  outerRadius={124}
                  paddingAngle={2}
                >
                  {typeOverviewData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [formatNumber(value), name]} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-black tracking-[0.28em] uppercase text-gray-400">Account Performance</p>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Account Overview</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-3xl">
            Executive summary for account base, acquisition, status composition, and account activity across the selected time filter.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTimeFilterOpen((open) => !open)}
            className="min-w-[260px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Time Filter</p>
                  <p className="text-sm font-black text-slate-950">{periodSelection.summaryLabel}</p>
                </div>
              </div>
              <span className="text-slate-400 text-lg">{isTimeFilterOpen ? '⌃' : '⌄'}</span>
            </div>
          </button>

          {isTimeFilterOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-black text-slate-950">Time Filter</h3>
                <button type="button" onClick={() => setIsTimeFilterOpen(false)} className="text-sm font-black text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 mb-4">
                {PERIOD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPeriodType(type)}
                    className={`flex-1 min-w-[76px] px-3 py-2 rounded-xl text-xs font-black transition-all ${
                      periodType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {periodType === 'Daily' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">From</span>
                    <input
                      type="date"
                      value={dailyStartDate}
                      max={LATEST_AVAILABLE_DATE}
                      onChange={(event) => setDailyStartDate(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">To</span>
                    <input
                      type="date"
                      value={dailyEndDate}
                      max={LATEST_AVAILABLE_DATE}
                      onChange={(event) => setDailyEndDate(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
              )}

              {periodType === 'Monthly' && (
                <div className="grid grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Year</span>
                    <select value={monthlyYear} onChange={(event) => setMonthlyYear(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                      {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Start</span>
                    <select value={monthlyStartMonth} onChange={(event) => setMonthlyStartMonth(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                      {MONTHS.map((month) => <option key={month.value} value={month.value}>{month.short}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">End</span>
                    <select value={monthlyEndMonth} onChange={(event) => setMonthlyEndMonth(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                      {MONTHS.map((month) => <option key={month.value} value={month.value}>{month.short}</option>)}
                    </select>
                  </label>
                </div>
              )}

              {periodType === 'Quarterly' && (
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Year</span>
                  <select value={quarterlyYear} onChange={(event) => setQuarterlyYear(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                    {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </label>
              )}

              {periodType === 'Annual' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Start Year</span>
                    <select value={annualStartYear} onChange={(event) => setAnnualStartYear(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                      {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400">End Year</span>
                    <select value={annualEndYear} onChange={(event) => setAnnualEndYear(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-400">
                      {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </label>
                </div>
              )}

              {validationMessage && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-600">{validationMessage}</p>}
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Metrics are aggregated based on the selected frequency. Snapshot sections are not affected by this filter.
              </p>
              <p className="mt-2 text-xs font-bold text-blue-600">{helperCopy}</p>
            </div>
          )}
        </div>
      </header>

      <div>
        <div className="flex flex-wrap gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm w-fit">
          {ACCOUNT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                selectedTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-900">No data available for the selected time filter.</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2">Try selecting another frequency or time range.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4">
            {metricCards.map((card) => (
                <div
                  key={card.label}
                  title={`Selected filter: ${periodSelection.summaryLabel}\nValue: ${card.value}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[164px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">{card.label}</p>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">{card.icon}</div>
                  </div>
                  <p className="text-2xl font-black text-slate-950 mt-5">{card.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600">{periodType}</span>
                    <span className="hidden">
                      {card.change === null ? 'N/A' : `${isPositive ? '↗' : '↘'} ${formatPercent(card.change)}`}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">{periodSelection.summaryLabel}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">{card.description}</p>
                </div>
              ))}
          </section>

          {accountOverviewBreakdownCharts}

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-950">Account Movement Trend</h3>
              </div>
            </div>
            {trend.data.length === 0 ? (
              <div className="h-[260px] flex flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
                <p className="text-lg font-black text-slate-900">No data available for the selected time filter.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">Try selecting another frequency or time range.</p>
              </div>
            ) : (
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trend.data} margin={{ top: 20, right: 28, left: 8, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }} tickFormatter={formatCompactNumber} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const newAccounts = Number(payload.find((item) => item.dataKey === 'newAccounts')?.value ?? 0);
                        const closedAccounts = Number(payload.find((item) => item.dataKey === 'closedAccounts')?.value ?? 0);
                        const netGrowth = Number(payload.find((item) => item.dataKey === 'netGrowth')?.value ?? 0);
                        return (
                          <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[240px]">
                            <p className="text-sm font-black text-slate-900 mb-3">Date: {label}</p>
                            <div className="space-y-2 text-xs font-bold">
                              <div className="flex justify-between gap-6"><span className="text-blue-600">New Accounts</span><span>{formatNumber(newAccounts)}</span></div>
                              <div className="flex justify-between gap-6"><span className="text-rose-500">Closed Accounts</span><span>{formatNumber(closedAccounts)}</span></div>
                              <div className="border-t border-gray-100 pt-2 flex justify-between gap-6">
                                <span className="text-emerald-600">Net Growth</span>
                                <span>{netGrowth > 0 ? '+' : ''}{formatNumber(netGrowth)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
                    <Bar dataKey="newAccounts" name="New Accounts" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={26} />
                    <Bar dataKey="closedAccounts" name="Closed Accounts" fill="#f97316" radius={[8, 8, 0, 0]} barSize={26} />
                    <Line type="monotone" dataKey="netGrowth" name="Net Account Growth" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h3 className="text-xl font-black text-slate-950">Cumulative Unique Users Trend</h3>
              <p className="text-xs font-semibold text-slate-500 mt-2 max-w-2xl">
                Cumulative Unique Users counts each user once, even if the user owns multiple account types.
              </p>
            </div>
            {!hasUniqueUserTrendData ? (
              <div className="h-[260px] flex flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
                <p className="text-lg font-black text-slate-900">No data available for the selected time filter.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">Try selecting another frequency or time range.</p>
              </div>
            ) : (
              <>
                {uniqueSelectedSummary && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 mb-5">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-blue-500">Selected Period Growth</p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {formatNumber(uniqueSelectedSummary.start)} {'->'} {formatNumber(uniqueSelectedSummary.end)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-blue-700">
                      {uniqueSelectedSummary.difference > 0 ? '+' : ''}{formatNumber(uniqueSelectedSummary.difference)} users
                      <span className="ml-2">{formatPercent(uniqueSelectedSummary.growth)}</span>
                    </p>
                  </div>
                )}
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uniqueUserTrend.data} margin={{ top: 28, right: 34, left: 8, bottom: 10 }}>
                      <defs>
                        <linearGradient id="selectedUniqueUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }} />
                      <YAxis
                        domain={uniqueYAxisDomain}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }}
                        tickFormatter={formatCompactNumber}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const selectedValue = payload[0]?.payload?.selectedPeriodUniqueUsers as number | null;
                          return (
                            <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[250px]">
                              <p className="text-sm font-black text-slate-900 mb-3">Date: {label}</p>
                              <div className="flex justify-between gap-6 text-xs font-bold">
                                <span className="text-blue-600">Unique Users</span>
                                <span>{selectedValue === null ? 'N/A' : `${formatNumber(selectedValue)} unique users`}</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
                      <Area
                        type="monotone"
                        dataKey="selectedPeriodUniqueUsers"
                        name="Selected Period"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#selectedUniqueUsers)"
                        dot={{ r: 4, strokeWidth: 2 }}
                        connectNulls
                      >
                        <LabelList content={renderUniqueEndpointLabel} />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-[11px] font-bold text-slate-400">Y-axis is zoomed to highlight movement.</p>
              </>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-950">Active Trading Users</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-3xl">
                  Unique users who completed at least one buy or sell equity transaction in M-STOCK.
                </p>
              </div>
              <span className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-600">
                {periodType} view
              </span>
            </div>

            {activeTradingUsersData.length === 0 ? (
              <div className="h-[260px] flex flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
                <p className="text-lg font-black text-slate-900">No data available for the selected time filter.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">Try selecting another frequency or time range.</p>
              </div>
            ) : (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={activeTradingUsersData} margin={{ top: 20, right: 28, left: 8, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 700 }}
                      tickFormatter={formatCompactNumber}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const users = Number(payload[0]?.value ?? 0);
                        return (
                          <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[250px]">
                            <p className="text-sm font-black text-slate-900 mb-3">{label}</p>
                            <div className="flex justify-between gap-6 text-xs font-bold">
                              <span className="text-blue-600">Active Trading Users</span>
                              <span>{formatNumber(users)} users</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
                    <Line
                      type="monotone"
                      dataKey="activeTradingUsers"
                      name="Active Trading Users"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {showFirstDeposit && (
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-400">Deposit Activation</p>
                <h3 className="text-xl font-black text-slate-950 mt-1">Time to First Deposit</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-2xl">
                  Shows how long users take from account activation to their first deposit.
                </p>
              </div>
              {firstDepositMetrics && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Users Without First Deposit</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{formatNumber(firstDepositMetrics.usersWithoutFirstDeposit)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Not included in time calculation because first deposit has not occurred yet.
                  </p>
                </div>
              )}
            </div>

            {!firstDepositMetrics || firstDepositTotalUsers === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center">
                <p className="text-lg font-black text-slate-900">No first deposit data available for the selected time filter.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">Only users who already made their first deposit are included.</p>
                {firstDepositMetrics && (
                  <p className="mt-4 text-sm font-black text-slate-700">
                    Users Without First Deposit: {formatNumber(firstDepositMetrics.usersWithoutFirstDeposit)}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {firstDepositKpis.map((card) => {
                    const readableDuration = formatReadableDuration(card.value);
                    return (
                      <div
                        key={card.label}
                        title={`${card.label} to First Deposit\nSelected filter: ${periodSelection.summaryLabel}\nValue: ${formatMinutes(card.value)}\n\nLower is better.${card.outlierNote ? `\n${card.outlierNote}` : ''}`}
                        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">{card.label}</p>
                        <p className="mt-3 text-2xl font-black text-slate-950">{formatMinutes(card.value)}</p>
                        {readableDuration && <p className="mt-1 text-xs font-black text-slate-400">{readableDuration}</p>}
                        <div className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600">
                          Lower is better
                        </div>
                        <p className="mt-3 text-xs font-semibold text-slate-500 leading-relaxed">{card.helper}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-950">First Deposit Time Distribution</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Only users who already made their first deposit are included.</p>
                    </div>
                  </div>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={firstDepositMetrics.distribution} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }} tickFormatter={formatCompactNumber} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const users = Number(payload[0]?.value ?? 0);
                            const share = firstDepositTotalUsers > 0 ? (users / firstDepositTotalUsers) * 100 : null;
                            return (
                              <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[240px]">
                                <p className="text-sm font-black text-slate-900 mb-3">{label}</p>
                                <div className="space-y-2 text-xs font-bold">
                                  <div className="flex justify-between gap-6">
                                    <span className="text-blue-600">Users</span>
                                    <span>{formatNumber(users)}</span>
                                  </div>
                                  <div className="flex justify-between gap-6">
                                    <span className="text-slate-500">Share</span>
                                    <span>
                                      {share === null
                                        ? 'Share unavailable because there are no first deposit users in the selected period.'
                                        : `${share.toFixed(1)}% of first deposit users`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="users" name="Users" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={54} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            </section>
          )}

          {false && <>
          <section className="rounded-3xl border border-blue-100 bg-blue-50/40 px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black text-slate-950">Snapshot Overview</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 border border-blue-100">
                    Not affected by Time Filter
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-600 mt-2">
                  Latest available snapshot data. The sections below are not affected by Time Filter.
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  RDN Balance uses latest end-of-day data. Dormant Risk Breakdown shows latest dormancy condition for alerting.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black text-slate-950">RDN Balance Snapshot</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 border border-blue-100">
                    Today Snapshot
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-3xl">
                  Latest end-of-day RDN balance distribution by unique users. Not affected by Time Filter or account type tabs.
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-2">Last updated: 8 Jul 2026, EOD</p>
              </div>
            </div>

            {rdnTotalUsers === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center">
                <p className="text-lg font-black text-slate-900">No RDN balance snapshot data available.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">This section requires latest end-of-day RDN balance data.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Users with Zero RDN</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(rdnZeroUsers)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{((rdnZeroUsers / rdnTotalUsers) * 100).toFixed(1)}% of unique users</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Users with RDN &gt; 0</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(rdnPositiveUsers)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{((rdnPositiveUsers / rdnTotalUsers) * 100).toFixed(1)}% of unique users</p>
                  </div>
                </div>
                <div className="h-[440px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={RDN_BALANCE_SNAPSHOT} margin={{ top: 10, right: 56, left: 22, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }}
                        tickFormatter={formatCompactNumber}
                      />
                      <YAxis
                        type="category"
                        dataKey="bucket"
                        width={250}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 800 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const users = Number(payload[0]?.value ?? 0);
                          const share = rdnTotalUsers > 0 ? (users / rdnTotalUsers) * 100 : null;
                          const balanceRange = String(payload[0]?.payload?.bucket ?? label ?? '');
                          return (
                            <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[310px]">
                              <p className="text-sm font-black text-slate-900 mb-3">Balance Range: {balanceRange}</p>
                              <div className="space-y-2 text-xs font-bold">
                                <div className="flex justify-between gap-6">
                                  <span className="text-blue-600">Users</span>
                                  <span>{formatNumber(users)}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-slate-500">Share</span>
                                  <span>
                                    {share === null
                                      ? 'Share unavailable because there are no users in the RDN balance snapshot.'
                                      : `${share.toFixed(1)}% of unique users`}
                                  </span>
                                </div>
                                <div className="border-t border-gray-100 pt-2 text-slate-500 leading-relaxed">
                                  <p>Snapshot only. Based on latest end-of-day RDN balance.</p>
                                  <p className="mt-1">Not affected by Time Filter or account type tabs.</p>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="users" name="Unique Users" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={28}>
                        <LabelList dataKey="users" position="right" formatter={(value: number) => formatCompactNumber(value)} fill="#0f172a" fontSize={11} fontWeight={900} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-black text-slate-950">Dormant Risk Breakdown</h3>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 border border-slate-200">
                    Latest Snapshot
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-2 max-w-3xl">
                  Latest dormant account risk based on current inactivity duration. Not affected by Time Filter, but follows selected account type.
                </p>
              </div>
            </div>

            {dormantRiskTotal === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center">
                <p className="text-lg font-black text-slate-900">No dormant risk snapshot data available.</p>
                <p className="text-sm font-semibold text-slate-500 mt-2">This section requires latest available dormancy data.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Total Dormant Accounts</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(dormantRiskTotal)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">Across selected account type: {selectedTab}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-rose-400">Severe Dormancy</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(severeDormancy)}</p>
                    <p className="mt-1 text-xs font-bold text-rose-600">Dormant for more than 90 days.</p>
                  </div>
                </div>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={dormantRiskData} margin={{ top: 10, right: 56, left: 22, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                      <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }}
                        tickFormatter={formatCompactNumber}
                      />
                      <YAxis
                        type="category"
                        dataKey="bucket"
                        width={130}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 800 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const point = payload[0]?.payload as DormantRiskBucket;
                          const users = Number(point.users ?? 0);
                          const share = dormantRiskTotal > 0 ? (users / dormantRiskTotal) * 100 : null;
                          return (
                            <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[300px]">
                              <p className="text-sm font-black text-slate-900 mb-3">{label}</p>
                              <div className="space-y-2 text-xs font-bold">
                                <div className="flex justify-between gap-6">
                                  <span className="text-blue-600">Dormant Accounts</span>
                                  <span>{formatNumber(users)}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-slate-500">Share</span>
                                  <span>
                                    {share === null
                                      ? 'Share unavailable because there are no dormant accounts in the latest snapshot.'
                                      : `${share.toFixed(1)}% of dormant accounts`}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-slate-500">Risk Level</span>
                                  <span>{point.riskLevel}</span>
                                </div>
                                <p className="border-t border-gray-100 pt-2 text-slate-500 leading-relaxed">
                                  {point.description}
                                  <br />
                                  Latest snapshot. Used for severe dormancy alerting. Not affected by Time Filter. Follows selected account type if applicable.
                                </p>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="users" name="Dormant Accounts" radius={[0, 10, 10, 0]} barSize={34}>
                        {dormantRiskData.map((entry) => {
                          const fill =
                            entry.riskLevel === 'Critical'
                              ? '#ef4444'
                              : entry.riskLevel === 'High Risk'
                                ? '#f97316'
                                : entry.riskLevel === 'Medium Risk'
                                  ? '#f59e0b'
                                  : '#10b981';
                          return <Cell key={entry.bucket} fill={fill} />;
                        })}
                        <LabelList dataKey="users" position="right" formatter={(value: number) => formatCompactNumber(value)} fill="#0f172a" fontSize={11} fontWeight={900} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </section>
          </>}
        </>
      )}
    </div>
  );
};

export default AccountOverview;
