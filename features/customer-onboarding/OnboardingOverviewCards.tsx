import React from 'react';
import { BranchBreakdown, KpiCard } from './KpiCard';
import type { KpiMetric } from './types';
import { calculatePercentage, formatMetricValue, getTargetValueTone } from './utils';

const ACCOUNT_OPENING_TAT_TARGET_DAYS = 1;

interface OnboardingConversionCardProps {
  applications: KpiMetric;
  opened: KpiMetric;
}

export const OnboardingConversionCard: React.FC<OnboardingConversionCardProps> = ({ applications, opened }) => {
  const conversion = applications.value == null || opened.value == null
    ? null
    : calculatePercentage(opened.value, applications.value);
  const formattedConversion = formatMetricValue(conversion, 'percentage');

  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
      <h3 className="text-xs font-extrabold uppercase leading-5 tracking-[0.08em] text-slate-500">Onboarding Conversion</h3>
      <div
        className="mt-5 grid flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch"
        aria-label="New Account Application converts to Account Successfully Opened"
      >
        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-extrabold uppercase leading-5 tracking-[0.08em] text-slate-500">{applications.label}</p>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{formatMetricValue(applications.value, applications.unit)}</p>
          {applications.branches?.length ? (
            <div className="mt-auto">
              <BranchBreakdown branches={applications.branches} unit={applications.unit} percentageTotal={applications.value} />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-center text-blue-600" aria-hidden="true">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold md:hidden">↓</span>
          <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold md:flex">→</span>
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-extrabold uppercase leading-5 tracking-[0.08em] text-slate-500">{opened.label}</p>
          <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{formatMetricValue(opened.value, opened.unit)}</p>
          <div className="mt-2">
            <p className="text-lg font-bold leading-6 text-blue-600">
              {formattedConversion === '—' ? '—' : `${formattedConversion} conversion rate`}
            </p>
            <p className="text-xs font-semibold text-slate-400">of applications</p>
          </div>
          {opened.branches?.length ? (
            <div className="mt-auto">
              <BranchBreakdown branches={opened.branches} unit={opened.unit} percentageTotal={opened.value} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

interface OnboardingOverviewCardsProps {
  metrics: KpiMetric[];
}

export const OnboardingOverviewCards: React.FC<OnboardingOverviewCardsProps> = ({ metrics }) => {
  const applications = metrics.find((metric) => metric.id === 'newApplications');
  const opened = metrics.find((metric) => metric.id === 'opened');
  const tat = metrics.find((metric) => metric.id === 'tat');

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {applications && opened ? <OnboardingConversionCard applications={applications} opened={opened} /> : null}
      {tat ? (
        <KpiCard
          metric={tat}
          supportingText="Target: 1 day"
          supportingTextPlacement="inline"
          valueTone={getTargetValueTone(tat.value, ACCOUNT_OPENING_TAT_TARGET_DAYS, 'lower')}
          showDownload={false}
        />
      ) : null}
    </div>
  );
};
