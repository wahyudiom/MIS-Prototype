import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { onboardingTatSeries, onboardingTrendViews, onboardingVolumeSeries } from '../features/customer-onboarding/Charts';
import { DashboardEmptyState } from '../features/customer-onboarding/DashboardStates';
import { BranchBreakdown, KpiCard } from '../features/customer-onboarding/KpiCard';
import { OnProgressCustomerOverview } from '../features/customer-onboarding/OnProgressCustomerOverview';
import { OnboardingConversionCard, OnboardingOverviewCards } from '../features/customer-onboarding/OnboardingOverviewCards';
import { buildOnProgressCustomerCsv, onProgressCustomerCsvFilename } from '../features/customer-onboarding/csv';
import { createCustomerOnboardingMock, partialCustomerOnboardingFixture } from '../features/customer-onboarding/mockData';
import type { KpiMetric } from '../features/customer-onboarding/types';
import {
  calculateMovement, calculatePercentage, createDefaultTimeFilterState, defaultPeriod, earliestDailyDate, formatMetricValue,
  getTargetValueTone, getTrendSemantic, periodBounds, periodOptions, timeFilterSummary, timeFilterValue,
} from '../features/customer-onboarding/utils';

test('period controls provide daily, monthly, quarterly, and yearly choices with current defaults', () => {
  const now = new Date(2026, 7, 4);
  assert.equal(defaultPeriod('daily', now), '2026-08-04');
  assert.equal(defaultPeriod('monthly', now), '2026-08');
  assert.equal(defaultPeriod('quarterly', now), '2026-Q3');
  assert.equal(defaultPeriod('yearly', now), '2026');
  assert.equal(periodOptions('monthly', now)[0].label, 'August 2026');
  assert.equal(periodOptions('quarterly', now)[0].label, 'Q3 2026');
});

test('trend point granularity follows the selected time filter', () => {
  assert.equal(createCustomerOnboardingMock('daily', '2026-08-01..2026-08-04').trends.volume.length, 4);
  assert.equal(createCustomerOnboardingMock('monthly', '2026-08').trends.volume.length, 31);
  assert.equal(createCustomerOnboardingMock('quarterly', '2026-Q3').trends.volume.length, 3);
  assert.equal(createCustomerOnboardingMock('yearly', '2026').trends.volume.length, 12);
});

test('equity-style time filter serializes daily, monthly, quarterly, and annual ranges', () => {
  const now = new Date(2026, 7, 4);
  const state = createDefaultTimeFilterState(now);
  assert.equal(timeFilterValue('daily', state, now), '2026-08-01..2026-08-04');
  assert.equal(timeFilterSummary('daily', state, now), 'Aug 01 – Aug 04');
  assert.equal(timeFilterValue('monthly', state, now), '2026-01..2026-08');
  assert.equal(timeFilterValue('quarterly', state, now), '2026-Q1..2026-Q3');
  assert.equal(timeFilterValue('yearly', state, now), '2023..2026');
  assert.equal(timeFilterSummary('monthly', state, now), '2026 · Jan – Aug');
});

test('daily filter is constrained to a rolling 90-working-day window', () => {
  const end = new Date(2026, 7, 4);
  const startValue = earliestDailyDate(end);
  const start = new Date(`${startValue}T00:00:00Z`);
  const endUtc = new Date('2026-08-04T00:00:00Z');
  let workingDays = 0;
  for (let date = start; date <= endUtc; date = new Date(date.getTime() + 86_400_000)) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) workingDays += 1;
  }
  assert.equal(workingDays, 90);
  assert.deepEqual(periodBounds('daily', '2026-07-01..2026-07-15'), { startDate: '2026-07-01', endDate: '2026-07-15' });
});

test('range filters update selected bounds and historical series', () => {
  assert.deepEqual(periodBounds('monthly', '2026-01..2026-05'), { startDate: '2026-01-01', endDate: '2026-05-31' });
  assert.equal(createCustomerOnboardingMock('monthly', '2026-01..2026-05').trends.volume.length, 5);
  assert.equal(createCustomerOnboardingMock('quarterly', '2026-Q1..2026-Q3').trends.volume.length, 9);
  assert.equal(createCustomerOnboardingMock('yearly', '2023..2026').trends.volume.length, 4);
});

test('onboarding trends only expose Volume and Account Opening TAT tabs', () => {
  assert.deepEqual(onboardingTrendViews, ['volume', 'tat']);
});

test('Volume trend excludes the On Progress Customer data point', () => {
  assert.deepEqual(onboardingVolumeSeries, [
    { key: 'newApplications', label: 'New Account Application' },
    { key: 'opened', label: 'Account Successfully Opened' },
  ]);
  const points = createCustomerOnboardingMock('monthly', '2026-01..2026-08').trends.volume;
  assert.ok(points.every((point) => !Object.hasOwn(point.values, 'onProgress')));
});

test('Account Opening TAT trends are ordered Minimum, Median, Average, Maximum', () => {
  assert.deepEqual(onboardingTatSeries.map((series) => series.label), [
    'Minimum Account Opening TAT',
    'Median Account Opening TAT',
    'Average Account Opening TAT',
    'Maximum Account Opening TAT',
  ]);
  const points = createCustomerOnboardingMock('monthly', '2026-01..2026-08').trends.tat;
  assert.ok(points.length > 0);
  for (const point of points) {
    assert.deepEqual(Object.keys(point.values), ['tatMin', 'tatMedian', 'tat', 'tatMax']);
    assert.ok((point.values.tatMin ?? 0) <= (point.values.tatMedian ?? 0));
    assert.ok((point.values.tatMedian ?? 0) <= (point.values.tat ?? 0));
    assert.ok((point.values.tat ?? 0) <= (point.values.tatMax ?? 0));
  }
});

test('visible mock KPI data covers upward and unavailable comparisons', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-08');
  const trends = [...data.overview, ...data.overSlaBreakdown].map((metric) => metric.mtd.direction);
  assert.ok(trends.includes('up'));
  assert.ok(trends.includes('unavailable'));
});

test('overview separates the over-SLA total and static bank breakdown from the first-row KPIs', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-01..2026-08');
  assert.deepEqual(
    data.overview.map((metric) => metric.label),
    ['New Account Application', 'Account Successfully Opened', 'Average Account Opening TAT'],
  );
  assert.deepEqual(data.overview[0].branches?.map(({ label, value }) => ({ label, value })), [
    { label: 'MSTOCK', value: 45210 },
    { label: 'MFUND', value: 32100 },
    { label: 'OOA3', value: 24522 },
  ]);
  assert.deepEqual(data.overview[1].branches?.map(({ label, value }) => ({ label, value })), [
    { label: 'MSTOCK', value: 31200 },
    { label: 'MFUND', value: 25800 },
    { label: 'OOA3', value: 15955 },
  ]);
  assert.deepEqual(
    data.overSlaBreakdown.map(({ label, value }) => ({ label, value })),
    [
      { label: 'BRI', value: 32 },
      { label: 'BCA', value: 28 },
      { label: 'Mandiri', value: 24 },
      { label: 'CIMB', value: 22 },
      { label: 'Sinarmas', value: 18 },
      { label: 'DBS', value: 15 },
    ],
  );
  assert.deepEqual(
    { label: data.overSlaTotal.label, value: data.overSlaTotal.value },
    { label: 'Total Over SLA Account', value: 139 },
  );
  assert.equal(
    data.overSlaTotal.value,
    data.overSlaBreakdown.reduce((total, metric) => total + (metric.value ?? 0), 0),
  );
});

test('metric formatting handles counts, percentages, durations, and missing values', () => {
  assert.equal(formatMetricValue(12540, 'count'), '12,540');
  assert.equal(formatMetricValue(93.45, 'percentage'), '93.5%');
  assert.equal(formatMetricValue(1.75, 'days'), '1.8 days');
  assert.equal(formatMetricValue(null, 'count'), '—');
  assert.equal(formatMetricValue(Number.POSITIVE_INFINITY, 'percentage'), '—');
});

test('zero comparison periods and zero conversion denominators are unavailable', () => {
  assert.deepEqual(calculateMovement(100, 0), { value: null, direction: 'unavailable' });
  assert.equal(calculatePercentage(12, 0), null);
  assert.equal(calculatePercentage(90, 100), 90);
});

test('favorability semantics support higher, lower, and neutral metrics', () => {
  assert.equal(getTrendSemantic({ value: 10, direction: 'up' }, 'higher'), 'positive');
  assert.equal(getTrendSemantic({ value: 10, direction: 'up' }, 'lower'), 'negative');
  assert.equal(getTrendSemantic({ value: -10, direction: 'down' }, 'lower'), 'positive');
  assert.equal(getTrendSemantic({ value: 10, direction: 'up' }, 'neutral'), 'neutral');
});

test('pipeline conversions are calculated safely from adjacent stages', () => {
  const pipeline = createCustomerOnboardingMock('monthly', '2026-08').pipeline;
  assert.equal(pipeline.length, 7);
  assert.deepEqual(
    pipeline.map((stage) => stage.label),
    ['New Application', 'AML', 'KYC', 'KSEI', 'RDN', 'CL Sent', 'Complete'],
  );
  const kycStage = pipeline.find((stage) => stage.label === 'KYC');
  assert.deepEqual(kycStage?.breakdown?.map((item) => item.label), ['Manual Approval', 'Auto Approval']);
  assert.equal(kycStage?.breakdown?.reduce((total, item) => total + item.value, 0), kycStage?.value);
  assert.equal(pipeline[0].conversionToNext, calculatePercentage(pipeline[1].value, pipeline[0].value));
  assert.equal(pipeline[6].conversionToNext, null);
});

test('pending metrics follow the onboarding sequence and use RDN', () => {
  const pending = createCustomerOnboardingMock('monthly', '2026-08').pending;
  assert.deepEqual(
    pending.map((metric) => metric.label),
    ['Pending AML', 'Pending KYC', 'Pending KSEI', 'Pending RDN', 'Account Pending >3 Days'],
  );
});

test('quality metrics include AML and KYC success rates in process order', () => {
  const quality = createCustomerOnboardingMock('monthly', '2026-08').quality;
  assert.deepEqual(
    quality.map((metric) => metric.label),
    ['AML Success Rate', 'KYC Success Rate', 'RDN Opening Success Rate', 'First Time Right Rate', 'Incomplete Application'],
  );
  assert.equal(quality.find((metric) => metric.id === 'amlRate')?.unit, 'percentage');
  assert.equal(quality.find((metric) => metric.id === 'kycRate')?.unit, 'percentage');
});

test('empty state communicates that the selected period has no data', () => {
  const markup = renderToStaticMarkup(React.createElement(DashboardEmptyState));
  assert.match(markup, /No customer onboarding data is available for the selected period/);
});

test('partial KPI data renders an em dash without leaking null-like values', () => {
  const missingMetric = partialCustomerOnboardingFixture.overview.find((metric) => metric.value === null) as KpiMetric;
  const markup = renderToStaticMarkup(React.createElement(KpiCard, { metric: missingMetric }));
  assert.match(markup, /—/);
  assert.doesNotMatch(markup, />null</);
  assert.doesNotMatch(markup, />undefined</);
  assert.doesNotMatch(markup, />NaN</);
  assert.doesNotMatch(markup, />Infinity</);
});

test('KPI cards do not render MTD or YTD comparisons', () => {
  const metric = createCustomerOnboardingMock('monthly', '2026-08').overview[0];
  const markup = renderToStaticMarkup(React.createElement(KpiCard, { metric }));
  assert.doesNotMatch(markup, /MTD|YTD/);
});

test('KPI cards expose an XLSX download control instead of an information button', () => {
  const metric = createCustomerOnboardingMock('monthly', '2026-08').pending[0];
  const markup = renderToStaticMarkup(React.createElement(KpiCard, { metric }));
  assert.match(markup, /Download Pending AML as XLSX/);
  assert.doesNotMatch(markup, />i<\/button>/);
});

test('KPI cards can omit the download control', () => {
  const metric = createCustomerOnboardingMock('monthly', '2026-08').overview[0];
  const markup = renderToStaticMarkup(React.createElement(KpiCard, { metric, showDownload: false }));
  assert.doesNotMatch(markup, /Download New Account Application as XLSX/);
  assert.doesNotMatch(markup, /kpi-download-newApplications/);
});

test('over-SLA cards show percentage shares and a highlighted total', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-08');
  const totalMarkup = renderToStaticMarkup(React.createElement(KpiCard, { metric: data.overSlaTotal, variant: 'highlight' }));
  const briShare = formatMetricValue(calculatePercentage(data.overSlaBreakdown[0].value ?? 0, data.overSlaTotal.value ?? 0), 'percentage');
  const briMarkup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: data.overSlaBreakdown[0],
    supportingText: `${briShare} of total`,
  }));

  assert.match(totalMarkup, /bg-blue-600/);
  assert.match(totalMarkup, />139</);
  assert.match(briMarkup, /23\.0% of total/);
});

test('Account Opening TAT target uses red above target and green below target', () => {
  const tatMetric = createCustomerOnboardingMock('monthly', '2026-08').overview.find((metric) => metric.id === 'tat') as KpiMetric;
  const aboveTargetMarkup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: { ...tatMetric, value: 1.7 },
    supportingText: 'Target: 1 day',
    valueTone: getTargetValueTone(1.7, 1, 'lower'),
  }));
  const belowTargetMarkup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: { ...tatMetric, value: 0.8 },
    supportingText: 'Target: 1 day',
    valueTone: getTargetValueTone(0.8, 1, 'lower'),
  }));

  assert.match(aboveTargetMarkup, /text-red-600/);
  assert.match(aboveTargetMarkup, /Target: 1 day/);
  assert.match(belowTargetMarkup, /text-emerald-600/);
  assert.equal(getTargetValueTone(1, 1, 'lower'), 'default');
});

test('Account Opening TAT target can render inline to the right of the value', () => {
  const tatMetric = createCustomerOnboardingMock('monthly', '2026-08').overview.find((metric) => metric.id === 'tat') as KpiMetric;
  const markup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: { ...tatMetric, value: 1.7 },
    supportingText: 'Target: 1 day',
    supportingTextPlacement: 'inline',
    valueTone: 'negative',
  }));

  assert.match(markup, /items-baseline/);
  assert.match(markup, /1\.7 days<\/div><p[^>]*>Target: 1 day<\/p>/);
});

test('branch breakdown renders static labels, formatted values, separators, and TAT target colors', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-01..2026-08');
  const countMarkup = renderToStaticMarkup(React.createElement(BranchBreakdown, {
    branches: data.overview[0].branches ?? [],
    unit: 'count',
  }));
  const tatMarkup = renderToStaticMarkup(React.createElement(BranchBreakdown, {
    branches: data.overview[2].branches ?? [],
    unit: 'days',
  }));

  assert.match(countMarkup, /MSTOCK/);
  assert.match(countMarkup, /45,210/);
  assert.match(countMarkup, /MFUND/);
  assert.match(countMarkup, /OOA3/);
  assert.match(countMarkup, /\|/);
  assert.doesNotMatch(countMarkup, /<button/);
  assert.match(tatMarkup, /1\.5 days/);
  assert.match(tatMarkup, /2\.1 days/);
  assert.equal((tatMarkup.match(/text-\[#DC2626\]/g) ?? []).length, 3);
});

test('overview KPI cards render branch shares without an opened total conversion', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-01..2026-08');
  const newApplications = data.overview[0];
  const opened = data.overview[1];
  const newApplicationsMarkup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: newApplications,
    showBranchPercentages: true,
  }));
  const openedMarkup = renderToStaticMarkup(React.createElement(KpiCard, {
    metric: opened,
    showBranchPercentages: true,
  }));

  assert.match(newApplicationsMarkup, /45,210/);
  assert.match(newApplicationsMarkup, /\(44\.4%\)/);
  assert.match(newApplicationsMarkup, /\(31\.5%\)/);
  assert.match(newApplicationsMarkup, /\(24\.1%\)/);
  assert.doesNotMatch(openedMarkup, /\(71\.6%\)/);
  assert.match(openedMarkup, /\(42\.8%\)/);
  assert.match(openedMarkup, /\(35\.4%\)/);
  assert.match(openedMarkup, /\(21\.9%\)/);
});

test('onboarding overview combines application and opened metrics with a calculated conversion', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-01..2026-08');
  const markup = renderToStaticMarkup(React.createElement(OnboardingOverviewCards, { metrics: data.overview }));

  assert.match(markup, /Onboarding Conversion/);
  assert.match(markup, /New Account Application/);
  assert.match(markup, /Account Successfully Opened/);
  assert.match(markup, /71\.6% conversion rate/);
  assert.match(markup, /of applications/);
  assert.match(markup, /→/);
  assert.match(markup, /Average Account Opening TAT/);
  assert.match(markup, /Target: 1 day/);
  assert.equal((markup.match(/<article/g) ?? []).length, 2);
  assert.ok(markup.indexOf('New Account Application') < markup.indexOf('Account Successfully Opened'));
});

test('onboarding conversion safely handles a zero application denominator', () => {
  const data = createCustomerOnboardingMock('monthly', '2026-01..2026-08');
  const applications = { ...data.overview[0], value: 0 };
  const markup = renderToStaticMarkup(React.createElement(OnboardingConversionCard, {
    applications,
    opened: data.overview[1],
  }));

  assert.match(markup, />—<\/p>/);
  assert.doesNotMatch(markup, /NaN|Infinity/);
  assert.equal((markup.match(/<article/g) ?? []).length, 1);
});

test('on-progress customer overview supports two, three, and four branch layouts', () => {
  const metrics = createCustomerOnboardingMock('monthly', '2026-01..2026-08').onProgressOverview;
  assert.deepEqual(metrics.map((metric) => ({ label: metric.label, total: metric.total, branchCount: metric.branches.length })), [
    { label: 'Pre Registration', total: 101832, branchCount: 3 },
    { label: 'Internal Process', total: 72955, branchCount: 4 },
    { label: 'Third-Party Process', total: 372, branchCount: 2 },
  ]);
  for (const metric of metrics) {
    assert.equal(metric.branches.reduce((total, branch) => total + (branch.value ?? 0), 0), metric.total);
  }

  const markup = renderToStaticMarkup(React.createElement(OnProgressCustomerOverview, { metrics }));
  assert.match(markup, /ON PROGRESS CUSTOMER OVERVIEW/);
  assert.match(markup, /Download Pre Registration CSV/);
  assert.match(markup, /CL SENT/);
  assert.match(markup, /RDN/);
});

test('on-progress customer CSV contains the total and card-specific branch rows', () => {
  const metric = createCustomerOnboardingMock('monthly', '2026-01..2026-08').onProgressOverview[0];
  assert.equal(
    buildOnProgressCustomerCsv(metric),
    ['Label,Value', 'Total,101832', 'MSTOCK,45210', 'MFUND,32100', 'OOA3,24522'].join('\n'),
  );
  assert.equal(onProgressCustomerCsvFilename(metric, new Date(2026, 7, 4)), 'pre-registration-2026-08-04.csv');
});
