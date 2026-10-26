import React, { useMemo, useState } from 'react';
import { TrendSection } from '../features/customer-onboarding/Charts';
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton } from '../features/customer-onboarding/DashboardStates';
import { KpiCard, KpiCardGrid } from '../features/customer-onboarding/KpiCard';
import { OnProgressCustomerOverview } from '../features/customer-onboarding/OnProgressCustomerOverview';
import { OnboardingOverviewCards } from '../features/customer-onboarding/OnboardingOverviewCards';
import { OnboardingPipeline } from '../features/customer-onboarding/OnboardingPipeline';
import { TimeFilter } from '../features/customer-onboarding/TimeFilter';
import type { TimeGranularity } from '../features/customer-onboarding/types';
import { useCustomerOnboarding } from '../features/customer-onboarding/useCustomerOnboarding';
import { calculatePercentage, createDefaultTimeFilterState, formatMetricValue, hasDashboardData, timeFilterValue } from '../features/customer-onboarding/utils';

const SectionHeading: React.FC<{ id: string; title: string; description: string }> = ({ id, title, description }) => (
  <div>
    <h2 id={id} className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
    <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
  </div>
);

const overSlaShareLabel = (value: number | null, total: number | null): string => {
  const share = value == null || total == null ? null : calculatePercentage(value, total);
  return `${formatMetricValue(share, 'percentage')} of total`;
};

const CustomerOnboarding: React.FC = () => {
  const [granularity, setGranularity] = useState<TimeGranularity>('monthly');
  const [timeFilter, setTimeFilter] = useState(createDefaultTimeFilterState);
  const period = useMemo(() => timeFilterValue(granularity, timeFilter), [granularity, timeFilter]);
  const { data, isLoading, error, retry } = useCustomerOnboarding(granularity, period);

  return (
    <div className="mx-auto max-w-[1600px] space-y-10 p-4 sm:p-6 md:p-8">
      <div className="flex justify-end">
        <TimeFilter granularity={granularity} value={timeFilter} onGranularityChange={setGranularity} onChange={setTimeFilter} />
      </div>

      {isLoading ? <DashboardSkeleton /> : error ? <DashboardErrorState message={error} onRetry={retry} /> : !data || !hasDashboardData(data) ? <DashboardEmptyState /> : (
        <>
          <section className="space-y-5" aria-labelledby="overview-heading">
            <SectionHeading id="overview-heading" title="Onboarding Overview" description="Current onboarding performance for the selected period." />
            <OnboardingOverviewCards metrics={data.overview} />
          </section>

          <section className="space-y-5" aria-labelledby="trends-heading">
            <SectionHeading id="trends-heading" title="Onboarding Trends" description="Historical movement at the selected period granularity." />
            <TrendSection trends={data.trends} />
          </section>

          <section className="space-y-5" aria-labelledby="pipeline-heading">
            <SectionHeading id="pipeline-heading" title="Onboarding Process Pipeline" description="Applications reaching each stage and conversion to the next stage." />
            <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-5 shadow-sm"><OnboardingPipeline stages={data.pipeline} /></div>
          </section>

          <OnProgressCustomerOverview metrics={data.onProgressOverview} />

          <section className="space-y-3" aria-labelledby="over-sla-heading">
            <h2 id="over-sla-heading" className="text-xl font-black tracking-tight text-slate-900">Over SLA Account</h2>
            <KpiCard metric={data.overSlaTotal} variant="highlight" />
            <KpiCardGrid
              metrics={data.overSlaBreakdown}
              columns="six"
              getSupportingText={(metric) => overSlaShareLabel(metric.value, data.overSlaTotal.value)}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default CustomerOnboarding;
