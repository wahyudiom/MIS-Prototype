import React from 'react';
import { DownloadIcon } from '../../components/Icons';
import { downloadOnProgressCustomerCsv } from './csv';
import { BranchBreakdown } from './KpiCard';
import type { OnProgressCustomerMetric } from './types';
import { formatMetricValue } from './utils';

interface OnProgressCustomerCardProps {
  metric: OnProgressCustomerMetric;
}

export const OnProgressCustomerCard: React.FC<OnProgressCustomerCardProps> = ({ metric }) => (
  <article className="flex min-h-[235px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex min-h-12 items-start justify-between gap-3">
      <h3 className="text-xs font-extrabold uppercase leading-5 tracking-[0.08em] text-slate-500">{metric.label}</h3>
      <button
        type="button"
        onClick={() => downloadOnProgressCustomerCsv(metric)}
        aria-label={`Download ${metric.label} CSV`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#999999] transition-colors hover:border-slate-300 hover:text-[#333333] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <DownloadIcon className="h-4 w-4" />
      </button>
    </div>
    <div className="mt-4 text-3xl font-black tracking-tight text-slate-900">{formatMetricValue(metric.total, 'count')}</div>
    <div className="mt-auto">
      <BranchBreakdown branches={metric.branches} unit="count" />
    </div>
  </article>
);

interface OnProgressCustomerOverviewProps {
  metrics: OnProgressCustomerMetric[];
}

export const OnProgressCustomerOverview: React.FC<OnProgressCustomerOverviewProps> = ({ metrics }) => (
  <section className="space-y-5" aria-labelledby="on-progress-overview-heading">
    <h2 id="on-progress-overview-heading" className="text-xl font-black tracking-tight text-slate-900">ON PROGRESS CUSTOMER OVERVIEW</h2>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => <OnProgressCustomerCard key={metric.id} metric={metric} />)}
    </div>
  </section>
);
