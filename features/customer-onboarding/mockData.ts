import type { CustomerOnboardingDashboardData, FavorableDirection, KpiMetric, MetricUnit, PipelineStage, TimeGranularity, TrendPoint } from './types';
import { calculateMovement, calculatePercentage, periodBounds, rangeCalendarDayCount, rangeMonthCount } from './utils';

const definitions: Record<string, string> = {
  newApplications: 'Number of new customer onboarding applications submitted during the selected period.',
  opened: 'Number of applications that reached the Account Opened status during the selected period.',
  tat: 'Average elapsed time between application submission and successful account opening for accounts opened during the selected period.',
  onProgress: 'All onboarding applications that have not yet reached Account Opened status.',
  rejectRate: 'Percentage of rejected applications among applications active during the selected period.',
  overSla: 'Number of active onboarding applications that exceed the defined overall onboarding SLA.',
  overSlaBri: 'Number of BRI onboarding applications currently over SLA.',
  overSlaBca: 'Number of BCA onboarding applications currently over SLA.',
  overSlaMandiri: 'Number of Mandiri onboarding applications currently over SLA.',
  overSlaCimb: 'Number of CIMB onboarding applications currently over SLA.',
  overSlaSinarmas: 'Number of Sinarmas onboarding applications currently over SLA.',
  overSlaDbs: 'Number of DBS onboarding applications currently over SLA.',
  pendingKyc: 'Number of active applications currently waiting for completion or approval in the KYC stage.',
  pendingAml: 'Number of active applications currently waiting for completion or approval in the AML stage.',
  pendingKsei: 'Number of active applications currently waiting for completion or approval in the KSEI stage.',
  pendingRdn: 'Number of active applications currently waiting for completion or approval in the RDN stage.',
  pendingThreeDays: 'Number of active applications that have remained uncompleted for more than three days.',
  amlRate: 'Percentage of applications that successfully pass AML screening among applications reviewed at the AML stage.',
  kycRate: 'Percentage of applications that successfully complete KYC among applications that reached the KYC stage.',
  rdnRate: 'Percentage of applications that successfully complete RDN opening among applications that reached bank verification.',
  ftrRate: 'Percentage of applications completed correctly without rework or resubmission.',
  incomplete: 'Number of customer-submitted applications that are missing mandatory data or required documents.',
};

function hash(value: string): number {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 9973, 17);
}

function scaleFor(granularity: TimeGranularity, value: string): number {
  if (granularity === 'daily') return Math.max(0.1, rangeCalendarDayCount(value) / 30);
  const months = rangeMonthCount(granularity, value);
  return granularity === 'monthly' && months === 1 ? 1 : months;
}

function metric(id: string, label: string, value: number | null, unit: MetricUnit, favorableDirection: FavorableDirection, seed: number, unavailable = false): KpiMetric {
  const previousMtd = unavailable ? 0 : (value ?? 100) * (0.89 + (seed % 7) / 100);
  const previousYtd = (value ?? 100) * (0.82 + (seed % 9) / 100);
  const mtd = value == null
    ? { value: null, direction: 'unavailable' as const }
    : id === 'onProgress'
      ? { value: 0, direction: 'flat' as const }
      : id === 'rejectRate'
        ? calculateMovement(value, value * 1.08)
        : calculateMovement(value, previousMtd);
  return {
    id,
    label,
    value,
    unit,
    mtd,
    ytd: value == null ? { value: null, direction: 'unavailable' } : calculateMovement(value, previousYtd),
    favorableDirection,
    definition: definitions[id],
  };
}

function countBranches(total: number, mstockShare: number, naviShare: number): KpiMetric['branches'] {
  const mstock = Math.round(total * mstockShare);
  const navi = Math.round(total * naviShare);
  return [
    { id: 'mstock', label: 'MSTOCK', value: mstock },
    { id: 'navi', label: 'MFUND', value: navi },
    { id: 'ooa3', label: 'OOA3', value: total - mstock - navi },
  ];
}

function buildTrendPoints(granularity: TimeGranularity, value: string, base: Record<string, number>): TrendPoint[] {
  const bounds = periodBounds(granularity, value);
  const start = new Date(`${bounds.startDate}T00:00:00Z`);
  const monthCount = rangeMonthCount(granularity, value);
  const isDaily = granularity === 'daily';
  const isSingleMonth = granularity === 'monthly' && monthCount === 1;
  const isSingleYear = granularity === 'yearly' && monthCount === 12;
  const pointCount = isDaily
    ? rangeCalendarDayCount(value)
    : isSingleMonth
    ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate()
    : granularity === 'yearly' && !isSingleYear ? Math.max(1, Math.round(monthCount / 12)) : monthCount;
  return Array.from({ length: pointCount }, (_, index) => {
    const pointDate = isDaily
      ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + index))
      : isSingleMonth
      ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), index + 1))
      : granularity === 'yearly' && !isSingleYear
        ? new Date(Date.UTC(start.getUTCFullYear() + index, 0, 1))
        : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const label = isDaily
      ? pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
      : isSingleMonth
      ? pointDate.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
      : granularity === 'yearly' && !isSingleYear
        ? String(pointDate.getUTCFullYear())
        : pointDate.toLocaleDateString('en-US', {
          month: 'short',
          ...(monthCount > 12 ? { year: '2-digit' as const } : {}),
          timeZone: 'UTC',
        });
    return {
      period: label,
      values: Object.fromEntries(Object.entries(base).map(([key, baseValue], seriesIndex) => {
        const wave = Math.sin((index + seriesIndex) * 0.72) * 0.08;
        const slope = (index / Math.max(pointCount - 1, 1)) * 0.12;
        return [key, Number((baseValue * (0.88 + wave + slope)).toFixed(key.toLowerCase().includes('rate') ? 1 : 2))];
      })),
    };
  });
}

function buildTatTrendPoints(granularity: TimeGranularity, value: string, tat: number): TrendPoint[] {
  return buildTrendPoints(granularity, value, { tat }).map((point, index) => {
    const average = point.values.tat ?? tat;
    const min = average * (0.58 + Math.cos(index * 0.7) * 0.02);
    const max = average * (1.32 + Math.sin(index * 0.55) * 0.04);
    const median = average * (0.9 + Math.sin(index * 0.62) * 0.01);
    return {
      ...point,
      values: {
        tatMin: Number(min.toFixed(2)),
        tatMedian: Number(median.toFixed(2)),
        tat: average,
        tatMax: Number(max.toFixed(2)),
      },
    };
  });
}

export function createCustomerOnboardingMock(granularity: TimeGranularity, value: string): CustomerOnboardingDashboardData {
  const seed = hash(`${granularity}-${value}`);
  const scale = scaleFor(granularity, value);
  const newApplications = Math.round((11840 + (seed % 2100)) * scale);
  const aml = Math.round(newApplications * 0.91);
  const kyc = Math.round(aml * 0.94);
  const autoApproval = Math.round(kyc * (0.72 + (seed % 5) / 100));
  const manualApproval = kyc - autoApproval;
  const ksei = Math.round(kyc * 0.965);
  const rdn = Math.round(ksei * 0.935);
  const clSent = Math.round(rdn * 0.972);
  const opened = Math.round(clSent * 0.955);
  const pendingKyc = Math.round((630 + (seed % 140)) * Math.sqrt(scale));
  const pendingAml = Math.round((390 + (seed % 90)) * Math.sqrt(scale));
  const pendingKsei = Math.round((270 + (seed % 80)) * Math.sqrt(scale));
  const pendingRdn = Math.round((510 + (seed % 120)) * Math.sqrt(scale));
  const pendingThreeDays = Math.round((320 + (seed % 60)) * Math.sqrt(scale));
  const overSla = Math.round((145 + (seed % 40)) * Math.sqrt(scale));
  const incomplete = Math.round((420 + (seed % 100)) * Math.sqrt(scale));
  const tat = Number((1.6 + (seed % 6) / 10).toFixed(1));
  const rejectRate = Number((5.7 + (seed % 18) / 10).toFixed(1));
  const amlRate = Number((94.2 + (seed % 24) / 10).toFixed(1));
  const kycRate = Number((91.4 + (seed % 35) / 10).toFixed(1));
  const rdnRate = Number((92.1 + (seed % 28) / 10).toFixed(1));
  const ftrRate = Number((86.8 + (seed % 40) / 10).toFixed(1));

  const stageValues = [newApplications, aml, kyc, ksei, rdn, clSent, opened];
  const stageLabels = ['New Application', 'AML', 'KYC', 'KSEI', 'RDN', 'CL Sent', 'Complete'];
  const pipeline: PipelineStage[] = stageLabels.map((label, index) => ({
    id: label.toLowerCase().replace(/[^a-z]+/g, '-'),
    label,
    value: stageValues[index],
    conversionToNext: index === stageLabels.length - 1 ? null : calculatePercentage(stageValues[index + 1], stageValues[index]),
    ...(label === 'KYC' ? {
      breakdown: [
        { id: 'manual-approval', label: 'Manual Approval', value: manualApproval },
        { id: 'auto-approval', label: 'Auto Approval', value: autoApproval },
      ],
    } : {}),
  }));

  const overview = [
    {
      ...metric('newApplications', 'New Account Application', newApplications, 'count', 'higher', seed),
      branches: countBranches(newApplications, 45210 / 101832, 32100 / 101832),
    },
    {
      ...metric('opened', 'Account Successfully Opened', opened, 'count', 'higher', seed + 1),
      branches: countBranches(opened, 31200 / 72955, 25800 / 72955),
    },
    {
      ...metric('tat', 'Average Account Opening TAT', tat, 'days', 'lower', seed + 2),
      branches: [
        { id: 'mstock' as const, label: 'MSTOCK' as const, value: 1.5, target: 1 },
        { id: 'navi' as const, label: 'MFUND' as const, value: 1.8, target: 1 },
        { id: 'ooa3' as const, label: 'OOA3' as const, value: 2.1, target: 1 },
      ],
    },
  ];
  const onProgressOverview = [
    {
      id: 'pre-registration',
      label: 'Pre Registration',
      total: 101832,
      branches: [
        { id: 'mstock', label: 'MSTOCK', value: 45210 },
        { id: 'navi', label: 'MFUND', value: 32100 },
        { id: 'ooa3', label: 'OOA3', value: 24522 },
      ],
    },
    {
      id: 'internal-process',
      label: 'Internal Process',
      total: 72955,
      branches: [
        { id: 'aml', label: 'AML', value: 18200 },
        { id: 'kyc', label: 'KYC', value: 21300 },
        { id: 'ypid', label: 'YPID', value: 19800 },
        { id: 'cl-sent', label: 'CL SENT', value: 13655 },
      ],
    },
    {
      id: 'third-party-process',
      label: 'Third-Party Process',
      total: 372,
      branches: [
        { id: 'ksei', label: 'KSEI', value: 210 },
        { id: 'rdn', label: 'RDN', value: 162 },
      ],
    },
  ];
  const overSlaBreakdown = [
    metric('overSlaBri', 'BRI', 32, 'count', 'lower', seed + 5, true),
    metric('overSlaBca', 'BCA', 28, 'count', 'lower', seed + 6),
    metric('overSlaMandiri', 'Mandiri', 24, 'count', 'lower', seed + 7),
    metric('overSlaCimb', 'CIMB', 22, 'count', 'lower', seed + 8),
    metric('overSlaSinarmas', 'Sinarmas', 18, 'count', 'lower', seed + 9),
    metric('overSlaDbs', 'DBS', 15, 'count', 'lower', seed + 10),
  ];
  const overSlaTotal = metric(
    'overSla',
    'Total Over SLA Account',
    overSlaBreakdown.reduce((total, item) => total + (item.value ?? 0), 0),
    'count',
    'lower',
    seed + 11,
  );
  const pending = [
    metric('pendingAml', 'Pending AML', pendingAml, 'count', 'lower', seed + 8),
    metric('pendingKyc', 'Pending KYC', pendingKyc, 'count', 'lower', seed + 9),
    metric('pendingKsei', 'Pending KSEI', pendingKsei, 'count', 'lower', seed + 10),
    metric('pendingRdn', 'Pending RDN', pendingRdn, 'count', 'lower', seed + 11),
    metric('pendingThreeDays', 'Account Pending >3 Days', pendingThreeDays, 'count', 'lower', seed + 12),
  ];
  const quality = [
    metric('amlRate', 'AML Success Rate', amlRate, 'percentage', 'higher', seed + 11),
    metric('kycRate', 'KYC Success Rate', kycRate, 'percentage', 'higher', seed + 12),
    metric('rdnRate', 'RDN Opening Success Rate', rdnRate, 'percentage', 'higher', seed + 13),
    metric('ftrRate', 'First Time Right Rate', ftrRate, 'percentage', 'higher', seed + 14),
    metric('incomplete', 'Incomplete Application', incomplete, 'count', 'lower', seed + 15),
  ];

  return {
    selectedPeriod: { granularity, value, ...periodBounds(granularity, value) },
    lastUpdated: '2026-08-04T08:30:00+07:00',
    overview,
    onProgressOverview,
    overSlaTotal,
    overSlaBreakdown,
    pending,
    quality,
    pipeline,
    trends: {
      volume: buildTrendPoints(granularity, value, { newApplications: newApplications / Math.max(1, scale), opened: opened / Math.max(1, scale) }),
      pending: buildTrendPoints(granularity, value, { pendingAml, pendingKyc, pendingKsei, pendingRdn, pendingThreeDays, overSla, incomplete }),
      successRates: buildTrendPoints(granularity, value, { amlRate, kycRate, rdnRate, ftrRate, rejectRate }),
      tat: buildTatTrendPoints(granularity, value, tat),
    },
  };
}

export const emptyCustomerOnboardingFixture: CustomerOnboardingDashboardData = {
  ...createCustomerOnboardingMock('monthly', '2026-08'),
  overSlaTotal: { ...createCustomerOnboardingMock('monthly', '2026-08').overSlaTotal, value: null },
  overview: [], onProgressOverview: [], overSlaBreakdown: [], pending: [], quality: [], pipeline: [],
  trends: { volume: [], pending: [], successRates: [], tat: [] },
};

export const partialCustomerOnboardingFixture: CustomerOnboardingDashboardData = {
  ...createCustomerOnboardingMock('monthly', '2026-08'),
  overview: createCustomerOnboardingMock('monthly', '2026-08').overview.map((item, index) => index === 2 ? { ...item, value: null } : item),
};
