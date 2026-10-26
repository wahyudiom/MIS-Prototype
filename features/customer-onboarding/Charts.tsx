import React, { useMemo, useState } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { MetricUnit, TrendPoint, TrendView } from './types';
import { formatMetricValue } from './utils';

const chartColors = ['#2563eb', '#f97316', '#0f766e', '#7c3aed', '#dc2626', '#0891b2', '#64748b'];
export const onboardingTrendViews: TrendView[] = ['volume', 'tat'];
export const onboardingVolumeSeries = [
  { key: 'newApplications', label: 'New Account Application' },
  { key: 'opened', label: 'Account Successfully Opened' },
];
export const onboardingTatSeries = [
  { key: 'tatMin', label: 'Minimum Account Opening TAT' },
  { key: 'tatMedian', label: 'Median Account Opening TAT' },
  { key: 'tat', label: 'Average Account Opening TAT' },
  { key: 'tatMax', label: 'Maximum Account Opening TAT' },
];

const trendConfig: Record<TrendView, { label: string; unit: MetricUnit; series: Array<{ key: string; label: string }> }> = {
  volume: {
    label: 'Volume', unit: 'count', series: onboardingVolumeSeries,
  },
  pending: {
    label: 'Pending', unit: 'count', series: [
      { key: 'pendingAml', label: 'Pending AML' },
      { key: 'pendingKyc', label: 'Pending KYC' },
      { key: 'pendingKsei', label: 'Pending KSEI' },
      { key: 'pendingRdn', label: 'Pending RDN' },
      { key: 'pendingThreeDays', label: 'Account Pending >3 Days' },
      { key: 'overSla', label: 'Over SLA Account' },
      { key: 'incomplete', label: 'Incomplete Application' },
    ],
  },
  successRates: {
    label: 'Success Rates', unit: 'percentage', series: [
      { key: 'amlRate', label: 'AML Success Rate' },
      { key: 'kycRate', label: 'KYC Success Rate' },
      { key: 'rdnRate', label: 'RDN Opening Success Rate' },
      { key: 'ftrRate', label: 'First Time Right Rate' },
      { key: 'rejectRate', label: 'Reject Rate' },
    ],
  },
  tat: {
    label: 'Account Opening TAT', unit: 'days', series: onboardingTatSeries,
  },
};

const ChartTooltip: React.FC<{ active?: boolean; payload?: Array<{ dataKey?: string; value?: number; color?: string; name?: string }>; label?: string; unit: MetricUnit }> = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="mb-2 text-xs font-black text-slate-800">{label}</div>
      {payload.map((entry) => <div key={String(entry.dataKey)} className="mt-1 flex items-center justify-between gap-5 text-xs font-semibold" style={{ color: entry.color }}><span>{entry.name}</span><span>{formatMetricValue(entry.value, unit)}</span></div>)}
    </div>
  );
};

const OrderedChartLegend: React.FC<{
  series: Array<{ key: string; label: string }>;
  hiddenSeries: string[];
}> = ({ series, hiddenSeries }) => (
  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 text-[11px] font-bold" aria-label="Chart legend">
    {series.map((item, index) => {
      const hidden = hiddenSeries.includes(item.key);
      return (
        <span key={item.key} className={`inline-flex items-center ${hidden ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
          <span className="mr-1.5 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index] }} />
          {item.label}
        </span>
      );
    })}
  </div>
);

export const TrendSection: React.FC<{ trends: Record<TrendView, TrendPoint[]> }> = ({ trends }) => {
  const [view, setView] = useState<TrendView>('volume');
  const config = trendConfig[view];
  const [hiddenSeriesByView, setHiddenSeriesByView] = useState<Partial<Record<TrendView, string[]>>>({});
  const hiddenSeries = hiddenSeriesByView[view] ?? [];
  const data = useMemo(() => trends[view].map((point) => ({ period: point.period, ...point.values })), [trends, view]);
  const toggleSeries = (key: string) => setHiddenSeriesByView((current) => {
    const currentHidden = current[view] ?? [];
    return { ...current, [view]: currentHidden.includes(key) ? currentHidden.filter((item) => item !== key) : [...currentHidden, key] };
  });

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="trend-chart-title">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h3 id="trend-chart-title" className="text-base font-bold text-slate-800">Historical {config.label}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">Select a view to keep counts, rates, and duration on separate axes.</p>
        </div>
        <div className="inline-flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto" role="tablist" aria-label="Onboarding trend view">
          {onboardingTrendViews.map((key) => (
            <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${view === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {trendConfig[key].label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">No historical data is available for this view.</div>
      ) : (
        <>
          <div className="mt-6 h-96 w-full" role="img" aria-label={`${config.label} onboarding line chart`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} minTickGap={24} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => formatMetricValue(Number(value), config.unit)} />
                <Tooltip content={<ChartTooltip unit={config.unit} />} />
                <Legend
                  verticalAlign="bottom"
                  height={54}
                  content={() => <OrderedChartLegend series={config.series} hiddenSeries={hiddenSeries} />}
                />
                {config.series.map((series, index) => (
                  <Line key={series.key} type="monotone" dataKey={series.key} name={series.label} stroke={chartColors[index]} strokeWidth={2.5} dot={data.length <= 12 ? { r: 3 } : false} hide={hiddenSeries.includes(series.key)} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Toggle chart series">
            {config.series.map((series, index) => {
              const hidden = hiddenSeries.includes(series.key);
              return <button key={series.key} type="button" aria-pressed={!hidden} onClick={() => toggleSeries(series.key)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${hidden ? 'border-slate-200 bg-white text-slate-400 line-through' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[index] }} />{series.label}</button>;
            })}
          </div>
        </>
      )}
    </section>
  );
};
