import React, { useState } from 'react';
import { CartesianGrid, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type PlatformRetentionPoint = {
  month: `M${number}`;
  mstock: number | null;
  neoHots: number | null;
  desktopHots: number | null;
};

type PlatformRetentionCohort = {
  cohort: string;
  cohortStartDate: string;
  cohortSize: number;
  availableThroughMonth: number;
  data: PlatformRetentionPoint[];
};

type RetentionDataState = 'loading' | 'ready' | 'error';
type RetentionSeriesKey = 'mstock' | 'neoHots' | 'desktopHots';

const RETENTION_SERIES: Array<{
  key: RetentionSeriesKey;
  name: string;
  color: string;
  strokeDasharray?: string;
}> = [
  { key: 'mstock', name: 'MSTOCK', color: '#2563eb' },
  { key: 'neoHots', name: 'Neo HOTS', color: '#8b5cf6', strokeDasharray: '8 5' },
  { key: 'desktopHots', name: 'Desktop HOTS', color: '#64748b', strokeDasharray: '2 5' },
];

const PLATFORM_RETENTION_COHORTS: PlatformRetentionCohort[] = [
  {
    cohort: 'Jul 2025',
    cohortStartDate: '2025-07-01',
    cohortSize: 6207,
    availableThroughMonth: 11,
    data: [
      { month: 'M0', mstock: 63, neoHots: 46, desktopHots: 23 },
      { month: 'M1', mstock: 44, neoHots: 28, desktopHots: 13 },
      { month: 'M2', mstock: 37, neoHots: 22, desktopHots: 10 },
      { month: 'M3', mstock: 35, neoHots: 19, desktopHots: 8 },
      { month: 'M4', mstock: 33, neoHots: 17, desktopHots: 6.5 },
      { month: 'M5', mstock: 31, neoHots: 16, desktopHots: 5.5 },
      { month: 'M6', mstock: 27, neoHots: 13, desktopHots: 4 },
      { month: 'M7', mstock: 23, neoHots: 11.5, desktopHots: 3.5 },
      { month: 'M8', mstock: 23, neoHots: 11.5, desktopHots: 3.5 },
      { month: 'M9', mstock: 20.5, neoHots: 10, desktopHots: 2.5 },
      { month: 'M10', mstock: 18.5, neoHots: 9, desktopHots: 2 },
      { month: 'M11', mstock: 15, neoHots: 7, desktopHots: 1.5 },
    ],
  },
  {
    cohort: 'Jan 2026',
    cohortStartDate: '2026-01-01',
    cohortSize: 7014,
    availableThroughMonth: 6,
    data: [
      { month: 'M0', mstock: 65, neoHots: 48, desktopHots: 24 },
      { month: 'M1', mstock: 46, neoHots: 30, desktopHots: 14 },
      { month: 'M2', mstock: 40, neoHots: 24, desktopHots: 11 },
      { month: 'M3', mstock: 37, neoHots: 21, desktopHots: 8.5 },
      { month: 'M4', mstock: 34, neoHots: 18.5, desktopHots: 7 },
      { month: 'M5', mstock: 31.5, neoHots: 16.5, desktopHots: 5.5 },
      { month: 'M6', mstock: 29, neoHots: 14, desktopHots: 4.5 },
      { month: 'M7', mstock: null, neoHots: null, desktopHots: null },
      { month: 'M8', mstock: null, neoHots: null, desktopHots: null },
      { month: 'M9', mstock: null, neoHots: null, desktopHots: null },
      { month: 'M10', mstock: null, neoHots: null, desktopHots: null },
      { month: 'M11', mstock: null, neoHots: null, desktopHots: null },
    ],
  },
];

/*
 * TODO(customer-retention-api): Replace the mock cohorts with an API backed by
 * customer_id, registration_timestamp, platform, activity_timestamp,
 * qualifying_activity_type, cohort_month, and months_since_registration.
 * Confirm the activity definition, cohort eligibility, platform attribution,
 * Asia/Jakarta month boundaries, and minimum cohort maturity.
 */

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

const formatRetentionPercent = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return 'Not available';
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
};

const AccountCohortData: React.FC = () => {
  const [selectedCohortName, setSelectedCohortName] = useState(PLATFORM_RETENTION_COHORTS[0].cohort);
  const [dataState] = useState<RetentionDataState>('ready');
  const selectedCohort = PLATFORM_RETENTION_COHORTS.find((cohort) => cohort.cohort === selectedCohortName);

  const renderEndLabel = (seriesKey: RetentionSeriesKey, seriesName: string, color: string) => ({
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
    if (!selectedCohort || index !== selectedCohort.availableThroughMonth) return null;
    if (value === undefined || value === null || x === undefined || y === undefined) return null;

    const numericValue = Number(value);
    const valueLabel = seriesKey === 'desktopHots' && numericValue < 2 ? '<2%' : formatRetentionPercent(numericValue);

    return (
      <text
        className="hidden md:block"
        x={Number(x) - 10}
        y={Number(y)}
        textAnchor="end"
        dominantBaseline="middle"
        fill={color}
        fontSize={11}
        fontWeight={900}
        aria-hidden="true"
      >
        {seriesName} {valueLabel}
      </text>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header>
        <p className="text-[10px] font-black tracking-[0.28em] uppercase text-gray-400">Account Overview</p>
        <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Cohort Data</h2>
        <p className="text-sm font-semibold text-slate-500 mt-2 max-w-3xl">
          Customer retention insights by registration cohort and trading platform.
        </p>
      </header>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6" aria-labelledby="platform-retention-title">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="min-w-0">
            <h3 id="platform-retention-title" className="text-xl font-black text-slate-950">
              12-Month New Customer Retention by Platform
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-2 max-w-3xl">
              Percentage of new customers remaining active by months since registration.
            </p>
            {selectedCohort && (
              <p className="text-sm font-black text-slate-700 mt-3">
                {selectedCohort.cohort} cohort · {formatNumber(selectedCohort.cohortSize)} new customers
              </p>
            )}
          </div>

          <label className="w-full sm:w-auto shrink-0">
            <span className="block text-[10px] font-black tracking-[0.18em] uppercase text-gray-400 mb-2">Cohort Month</span>
            <select
              aria-label="Cohort Month"
              value={selectedCohortName}
              onChange={(event) => setSelectedCohortName(event.target.value)}
              className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-black text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {PLATFORM_RETENTION_COHORTS.map((cohort) => (
                <option key={cohort.cohortStartDate} value={cohort.cohort}>{cohort.cohort}</option>
              ))}
            </select>
          </label>
        </div>

        {dataState === 'loading' ? (
          <div className="mt-6 h-[390px] rounded-2xl bg-gray-50 p-6 animate-pulse" aria-label="Loading customer retention chart">
            <div className="h-4 w-52 rounded bg-gray-200" />
            <div className="mt-8 h-[290px] rounded-xl bg-gray-100" />
          </div>
        ) : dataState === 'error' ? (
          <div className="mt-6 h-[390px] flex flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 text-center" role="alert">
            <p className="text-lg font-black text-slate-900">Unable to load customer retention data.</p>
            <p className="text-sm font-semibold text-slate-500 mt-2">Please try again when the retention service is available.</p>
          </div>
        ) : !selectedCohort || selectedCohort.data.length === 0 ? (
          <div className="mt-6 h-[390px] flex flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 text-center">
            <p className="text-lg font-black text-slate-900">No retention data is available for the selected cohort.</p>
            <p className="text-sm font-semibold text-slate-500 mt-2">Select another cohort month or confirm that platform activity data is available.</p>
          </div>
        ) : (
          <>
            <ul aria-label="Platform retention legend" className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-black text-slate-600">
              {RETENTION_SERIES.map((series) => (
                <li key={series.key} className="flex items-center gap-2 whitespace-nowrap">
                  <span
                    className="inline-block w-8 border-t-[3px]"
                    style={{ borderTopColor: series.color, borderTopStyle: series.key === 'mstock' ? 'solid' : series.key === 'neoHots' ? 'dashed' : 'dotted' }}
                    aria-hidden="true"
                  />
                  {series.name}
                </li>
              ))}
            </ul>

            <div
              className="mt-3 h-[390px] sm:h-[410px]"
              role="img"
              aria-label={`${selectedCohort.cohort} new customer retention from M0 through M${selectedCohort.availableThroughMonth} for MSTOCK, Neo HOTS, and Desktop HOTS`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={selectedCohort.data} margin={{ top: 24, right: 18, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis
                    dataKey="month"
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#8090aa', fontSize: 10, fontWeight: 800 }}
                    label={{ value: 'Months since registration', position: 'insideBottom', offset: -8, fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                  />
                  <YAxis
                    domain={[0, 70]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                    width={46}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }}
                    tickFormatter={(value: number) => `${value}%`}
                    label={{ value: 'Active customers (%)', angle: -90, position: 'insideLeft', offset: 8, fill: '#64748b', fontSize: 11, fontWeight: 800 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0]?.payload as PlatformRetentionPoint | undefined;
                      if (!point) return null;
                      return (
                        <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[270px]">
                          <p className="text-[10px] font-black tracking-[0.16em] uppercase text-gray-400">Month Since Registration</p>
                          <p className="text-sm font-black text-slate-900 mt-1 mb-3">{label}</p>
                          <div className="space-y-2 text-xs font-bold">
                            {RETENTION_SERIES.map((series) => (
                              <div key={series.key} className="flex justify-between gap-6">
                                <span style={{ color: series.color }}>{series.name}</span>
                                <span>{formatRetentionPercent(point[series.key])}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between gap-6">
                              <span className="text-slate-500">Cohort</span><span>{selectedCohort.cohort}</span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-500">Original Cohort Size</span><span>{formatNumber(selectedCohort.cohortSize)} customers</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  {RETENTION_SERIES.map((series) => (
                    <Line
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={series.name}
                      stroke={series.color}
                      strokeWidth={series.key === 'mstock' ? 3.5 : 2.5}
                      strokeDasharray={series.strokeDasharray}
                      dot={{ r: 3.5, strokeWidth: 2, fill: '#ffffff' }}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      connectNulls={false}
                      aria-label={`${series.name} retention series`}
                    >
                      <LabelList content={renderEndLabel(series.key, series.name, series.color)} />
                    </Line>
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {selectedCohort.availableThroughMonth < 11 && (
              <p className="mt-1 text-xs font-black text-amber-600">Retention data is available through M{selectedCohort.availableThroughMonth} for this cohort.</p>
            )}

            <ul className="sr-only" aria-label="Platform retention data points">
              {selectedCohort.data.map((point) => (
                <li key={point.month}>{point.month}: {RETENTION_SERIES.map((series) => `${series.name} ${formatRetentionPercent(point[series.key])}`).join(', ')}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default AccountCohortData;
