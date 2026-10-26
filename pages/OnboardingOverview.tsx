import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartBarIcon,
  ClockIcon,
  DocumentIcon,
  UserGroupIcon,
  UserIcon,
  UserXIcon,
} from "../components/Icons";
import { TimeFilter } from "../features/customer-onboarding/TimeFilter";
import {
  AnnotationProvider,
  AnnotationTarget,
  AnnotationToggle,
  type AnnotationId,
} from "../features/onboarding-overview/Annotations";
import type { TimeGranularity } from "../features/customer-onboarding/types";
import {
  createDefaultTimeFilterState,
  timeFilterValue,
} from "../features/customer-onboarding/utils";
import {
  ACCOUNT_TYPES,
  buildDashboard,
  CHANNELS,
  createDemoRecords,
  DEFAULT_FILTERS,
  GlobalFilters,
  percent,
  SOURCES,
} from "../features/onboarding-overview/data";

const colors = { Offline: "#38bdf8", Web: "#f97316", Mobile: "#1e293b" };
const tick = { fill: "#94a3b8", fontSize: 11, fontWeight: 600 };
const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  fontSize: 12,
};
const legendStyle = { fontSize: 11, fontWeight: 600, paddingTop: 12 };
const pageSubtitle =
  "Account acquisition, completion, rejection, and funding performance.";
const formatCount = (value: number) => value.toLocaleString("en-US");
const formatRate = (value: number | null | undefined) =>
  value == null
    ? "—"
    : `${value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const compact = (value: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const percentTick = (value: number) => `${value}%`;
const percentLabel = (value: unknown) =>
  typeof value === "number" ? formatRate(value) : "";

const KpiCard: React.FC<{
  annotationId: AnnotationId;
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}> = ({ annotationId, label, value, subtitle, icon, color }) => (
  <AnnotationTarget
    annotationId={annotationId}
    className="flex min-w-0 flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm xl:p-6"
  >
    <div className="mb-4 flex items-start justify-between gap-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <div className={`shrink-0 rounded-lg bg-gray-50 p-2 ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p
        className="text-3xl font-black tracking-tight text-slate-800"
        data-kpi-value
      >
        {value}
      </p>
      <p className="mt-2 min-h-[40px] text-[11px] font-medium leading-5 text-gray-400">
        {subtitle}
      </p>
    </div>
  </AnnotationTarget>
);

const Panel: React.FC<{
  id: AnnotationId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ id, title, subtitle, icon, children, className = "" }) => (
  <AnnotationTarget
    as="section"
    annotationId={id}
    aria-labelledby={`heading-${id}`}
    data-widget={id}
    className={`flex min-w-0 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}
  >
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-slate-400">{icon}</span>
        <h3
          id={`heading-${id}`}
          className="text-sm font-bold text-slate-700 xl:text-base"
        >
          {title}
        </h3>
      </div>
      <p
        className="mt-2 truncate text-xs leading-5 text-gray-400"
        title={subtitle}
      >
        {subtitle}
      </p>
    </div>
    {children}
  </AnnotationTarget>
);

const SmallKpi: React.FC<{
  label: string;
  value: string;
  detail?: string;
  color?: string;
}> = ({ label, value, detail, color = "text-slate-800" }) => (
  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:p-4">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {label}
    </p>
    <p className={`mt-2 text-2xl font-black tracking-tight ${color}`}>
      {value}
    </p>
    {detail && (
      <p className="mt-1 text-[11px] leading-4 text-gray-400">{detail}</p>
    )}
  </div>
);
const EmptyChart: React.FC<{ children?: React.ReactNode }> = ({
  children = "No data is available for the selected filters.",
}) => (
  <div className="flex h-[220px] items-center justify-center rounded-xl bg-gray-50/60 px-6 text-center text-sm text-slate-400">
    {children}
  </div>
);
const GlobalSelect = <K extends keyof GlobalFilters>({
  label,
  field,
  options,
  value,
  onChange,
}: {
  label: string;
  field: K;
  options: readonly string[];
  value: GlobalFilters[K];
  onChange: (field: K, value: GlobalFilters[K]) => void;
}) => (
  <label className="flex min-w-0 flex-col gap-1.5 sm:min-w-[145px]">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <select
      aria-label={label}
      value={value}
      onChange={(event) =>
        onChange(field, event.target.value as GlobalFilters[K])
      }
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="All">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const OnboardingOverview: React.FC<{ variant?: "full" | "cohort" }> = ({
  variant = "full",
}) => {
  const isFullOverview = variant === "full";
  const [granularity, setGranularity] = useState<TimeGranularity>("monthly");
  const [timeFilter, setTimeFilter] = useState(createDefaultTimeFilterState);
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);
  const period = timeFilterValue(granularity, timeFilter);
  const records = useMemo(
    () => createDemoRecords(granularity, period),
    [granularity, period],
  );
  const dashboard = useMemo(
    () => buildDashboard(records, granularity, filters),
    [records, granularity, filters],
  );
  const { total, monthly, trends } = dashboard;
  const updateFilter = <K extends keyof GlobalFilters>(
    field: K,
    value: GlobalFilters[K],
  ) => setFilters((current) => ({ ...current, [field]: value }));
  const hasFilters = Object.values(filters).some((value) => value !== "All");
  const conversion = [
    ["Submission Rate", "submissionRate"],
    ["Completion Rate", "completionRate"],
    ["Funded Rate D+30", "funded30Rate"],
    ["KYC Rejection Rate", "kycRate"],
  ].map(([label, key]) => ({
    label,
    ...Object.fromEntries(
      dashboard.conversion.map((row) => [
        row.channel,
        row[
          key as
            "submissionRate" | "completionRate" | "funded30Rate" | "kycRate"
        ],
      ]),
    ),
  }));
  const [organic, sales] = dashboard.sources;
  const difference = (a: number | null, b: number | null) =>
    a == null || b == null
      ? "—"
      : `${b - a > 0 ? "+" : ""}${(b - a).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} pp`;
  const icon = <ChartBarIcon className="h-4 w-4" />;

  return (
    <AnnotationProvider>
      <div className="mx-auto max-w-[1600px] space-y-6 bg-gray-50/30 p-4 animate-fade-in sm:p-6 md:p-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <AnnotationTarget
            annotationId="overview"
            className="min-w-0 rounded-lg"
          >
            <h2 className="text-2xl font-black tracking-tight text-[#2e3a59]">
              Onboarding Process
            </h2>
            <p
              className="mt-0.5 truncate text-sm font-medium text-gray-400"
              title={pageSubtitle}
            >
              {pageSubtitle}
            </p>
          </AnnotationTarget>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
            {isFullOverview && <AnnotationToggle />}
            <AnnotationTarget annotationId="filters" className="rounded-2xl">
              <TimeFilter
                granularity={granularity}
                value={timeFilter}
                onGranularityChange={setGranularity}
                onChange={setTimeFilter}
              />
            </AnnotationTarget>
          </div>
        </header>
        <AnnotationTarget
          annotationId="filters"
          className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:px-6"
        >
          <div className="grid w-full grid-cols-1 gap-4 min-[400px]:grid-cols-3 sm:w-auto">
            <GlobalSelect
              label="Channel"
              field="channel"
              options={CHANNELS}
              value={filters.channel}
              onChange={updateFilter}
            />
            <GlobalSelect
              label="Source"
              field="source"
              options={SOURCES}
              value={filters.source}
              onChange={updateFilter}
            />
            <GlobalSelect
              label="Account Type"
              field="accountType"
              options={ACCOUNT_TYPES}
              value={filters.accountType}
              onChange={updateFilter}
            />
          </div>
          <div className="flex items-center gap-4 pb-2">
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="rounded text-xs font-bold text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset Filters
              </button>
            )}
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Demo Data
            </span>
          </div>
        </AnnotationTarget>
        <div aria-live="polite" className="sr-only">
          {formatCount(total.total)} accounts. Channel {filters.channel}, source{" "}
          {filters.source}, account type {filters.accountType}.
        </div>
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isFullOverview ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
        >
          <KpiCard
            annotationId="total"
            label="Total Accounts"
            value={formatCount(total.total)}
            subtitle={`${formatCount(total.submitted)} submitted accounts`}
            icon={<UserGroupIcon className="h-4 w-4" />}
            color="text-orange-500"
          />
          <KpiCard
            annotationId="completion"
            label="Completion Rate"
            value={formatRate(total.completionRate)}
            subtitle={`${formatCount(total.completed)} accounts with active RDN`}
            icon={<UserIcon className="h-4 w-4" />}
            color="text-slate-800"
          />
          <KpiCard
            annotationId="kyc"
            label="KYC Rejection Rate"
            value={formatRate(total.kycRate)}
            subtitle={`${formatCount(total.kycRejected)} of ${formatCount(total.submitted)} submissions`}
            icon={<UserXIcon className="h-4 w-4" />}
            color="text-red-500"
          />
          <KpiCard
            annotationId="rdn"
            label="RDN Rejection Rate"
            value={formatRate(total.rdnRate)}
            subtitle={`${formatCount(total.rdnRejected)} of ${formatCount(total.rdnSubmitted)} applications`}
            icon={<DocumentIcon className="h-4 w-4" />}
            color="text-red-400"
          />
          {isFullOverview && (
            <KpiCard
              annotationId="funded"
              label="Funded Rate D+30"
              value={formatRate(total.funded30Rate)}
              subtitle={`${formatCount(total.funded30)} funded · ${formatCount(total.eligible30)} accounts aged ≥30 days`}
              icon={<ClockIcon className="h-4 w-4" />}
              color="text-sky-500"
            />
          )}
        </div>
        <div
          className={`grid grid-cols-1 gap-6 ${isFullOverview ? "lg:grid-cols-2" : ""}`}
        >
          {isFullOverview && (
            <>
              <Panel
                id="M1"
                title="Channel & Source Mix"
                subtitle="Monthly account mix by channel and acquisition source."
                icon={icon}
              >
                {!total.total ? (
                  <EmptyChart />
                ) : (
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthly}
                        margin={{ top: 5, right: 4, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          minTickGap={20}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={compact}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ fill: "#f8fafc" }}
                          formatter={(value) => formatCount(Number(value))}
                        />
                        <Legend iconType="circle" wrapperStyle={legendStyle} />
                        {dashboard.channels.map((channel) => (
                          <Bar
                            isAnimationActive={false}
                            key={channel}
                            dataKey={channel}
                            stackId="channel"
                            fill={colors[channel]}
                            maxBarSize={42}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-xs">
                  {dashboard.sources.map((row) => (
                    <span key={row.source} className="text-gray-400">
                      {row.source}{" "}
                      <strong className="ml-2 font-bold text-slate-700">
                        {formatCount(row.total)}
                      </strong>
                      <span className="ml-1">
                        ({formatRate(percent(row.total, total.total))})
                      </span>
                    </span>
                  ))}
                </div>
              </Panel>
              <Panel
                id="M2"
                title="Web Volume Trend"
                subtitle="Monthly web account volume over the selected period."
                icon={icon}
              >
                {!total.total ||
                filters.channel === "Offline" ||
                filters.channel === "Mobile" ? (
                  <EmptyChart>
                    No Web data is available for the selected filters.
                  </EmptyChart>
                ) : (
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trends}
                        margin={{ top: 10, right: 14, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          minTickGap={25}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={compact}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => formatCount(Number(value))}
                        />
                        <Legend iconType="circle" wrapperStyle={legendStyle} />
                        <Line
                          isAnimationActive={false}
                          dataKey="web"
                          name="Web"
                          type="monotone"
                          stroke={colors.Web}
                          strokeWidth={2}
                          dot={{ r: 3, fill: colors.Web }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
                  Web Volume{" "}
                  <strong className="ml-2 text-slate-700">
                    {formatCount(
                      monthly.reduce((sum, row) => sum + Number(row.Web), 0),
                    )}
                  </strong>
                </p>
              </Panel>
              <Panel
                id="M3"
                title="Web vs Mobile Conversion"
                subtitle="Comparison of submission, completion, funding, and KYC rejection rates."
                icon={icon}
              >
                {!total.total || !dashboard.conversion.length ? (
                  <EmptyChart>
                    No Web or Mobile data is available for the selected filters.
                  </EmptyChart>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={conversion}
                        margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                        barGap={4}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={percentTick}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={112}
                          axisLine={false}
                          tickLine={false}
                          tick={{ ...tick, fill: "#64748b", fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => formatRate(Number(value))}
                          cursor={{ fill: "#f8fafc" }}
                        />
                        <Legend iconType="circle" wrapperStyle={legendStyle} />
                        {dashboard.conversion.map((row) => (
                          <Bar
                            isAnimationActive={false}
                            key={row.channel}
                            dataKey={row.channel}
                            fill={colors[row.channel]}
                            maxBarSize={15}
                            radius={[0, 3, 3, 0]}
                          >
                            <LabelList
                              dataKey={row.channel}
                              position="right"
                              formatter={percentLabel}
                              fontSize={10}
                              fill="#64748b"
                            />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-5 text-gray-400">
                  Submission and completion rates: % of total accounts. KYC
                  rejection rate: % of submissions. Funded rate: % of accounts
                  aged ≥30 days.
                </p>
              </Panel>
              <Panel
                id="M4"
                title="Organic vs Sales-Assisted Scorecard"
                subtitle="Performance comparison between Organic and Sales-Assisted acquisition."
                icon={<DocumentIcon className="h-4 w-4" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[470px] text-left text-xs">
                    <caption className="sr-only">
                      Acquisition source scorecard. Difference is Sales-Assisted
                      minus Organic.
                    </caption>
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400">
                        {[
                          "Source",
                          "Volume",
                          "Share",
                          "Completion Rate",
                          "Rejection Rate",
                          "Funded Rate",
                        ].map((label) => (
                          <th
                            key={label}
                            scope="col"
                            className={`px-3 py-4 font-bold ${label !== "Source" ? "text-right" : ""}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.sources.map((row) => (
                        <tr
                          key={row.source}
                          className="border-b border-gray-100 text-slate-700"
                        >
                          <th
                            scope="row"
                            className="whitespace-nowrap px-3 py-5 font-bold"
                          >
                            {row.source}
                          </th>
                          <td className="px-3 py-5 text-right tabular-nums">
                            {formatCount(row.total)}
                          </td>
                          <td className="px-3 py-5 text-right tabular-nums">
                            {formatRate(percent(row.total, total.total))}
                          </td>
                          <td className="px-3 py-5 text-right font-bold tabular-nums">
                            {formatRate(row.completionRate)}
                          </td>
                          <td className="px-3 py-5 text-right tabular-nums">
                            {formatRate(row.kycRate)}
                          </td>
                          <td className="px-3 py-5 text-right tabular-nums">
                            {formatRate(row.funded30Rate)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50/60 text-slate-500">
                        <th scope="row" className="px-3 py-4 font-bold">
                          Difference
                        </th>
                        <td className="px-3 py-4 text-right">—</td>
                        <td className="px-3 py-4 text-right">—</td>
                        {(
                          ["completionRate", "kycRate", "funded30Rate"] as const
                        ).map((key) => (
                          <td
                            key={key}
                            className="whitespace-nowrap px-3 py-4 text-right tabular-nums"
                          >
                            {difference(organic[key], sales[key])}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-5 text-[11px] leading-5 text-gray-400">
                  Difference = Sales-Assisted − Organic, in percentage points
                  (pp).
                  <br />
                  Rejection Rate = KYC rejections / submissions. Funded Rate =
                  accounts funded by D+30 / accounts aged ≥30 days.
                </p>
              </Panel>
            </>
          )}
          <Panel
            id="M5"
            title="Completion Rate (Cohort)"
            subtitle="Completion and in-progress rates by registration cohort."
            icon={<UserIcon className="h-4 w-4" />}
          >
            <div className="mb-5 grid grid-cols-2 gap-3">
              <SmallKpi
                label="Completion Rate"
                value={formatRate(total.completionRate)}
                detail={`${formatCount(total.completed)} of ${formatCount(total.total)} accounts`}
              />
              <SmallKpi
                label="In Progress"
                value={formatRate(total.inProgressRate)}
                detail={`${formatCount(total.inProgress)} accounts`}
                color="text-orange-500"
              />
            </div>
            {!total.total ? (
              <EmptyChart />
            ) : (
              <div className="h-[160px] min-h-[160px] w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthly}
                    margin={{ top: 5, right: 4, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={tick}
                      minTickGap={20}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={tick}
                      tickFormatter={percentTick}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatRate(Number(value))}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      isAnimationActive={false}
                      dataKey="completionRate"
                      name="Completion Rate"
                      fill="#1e293b"
                      maxBarSize={30}
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
          {isFullOverview && (
            <>
              <Panel
                id="M7"
                title="KYC Rejection & First-Time-Right"
                subtitle="KYC rejection and first-time-right rates over time."
                icon={<UserXIcon className="h-4 w-4 text-red-400" />}
              >
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <SmallKpi
                    label="KYC Rejection Rate"
                    value={formatRate(total.kycRate)}
                    color="text-red-500"
                  />
                  <SmallKpi
                    label="First-Time-Right"
                    value={formatRate(total.ftrRate)}
                  />
                </div>
                {!total.submitted ? (
                  <EmptyChart />
                ) : (
                  <div className="h-[190px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trends}
                        margin={{ top: 5, right: 8, left: -15, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          minTickGap={30}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={percentTick}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => formatRate(Number(value))}
                        />
                        <Legend iconType="circle" wrapperStyle={legendStyle} />
                        <Line
                          isAnimationActive={false}
                          dataKey="kycRate"
                          name="KYC Rejection Rate"
                          type="monotone"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                        <Line
                          isAnimationActive={false}
                          dataKey="ftrRate"
                          name="First-Time-Right"
                          type="monotone"
                          stroke="#1e293b"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-4 text-[11px] leading-5 text-gray-400">
                  First-Time-Right: accounts passing KYC without corrections or
                  resubmission.
                </p>
              </Panel>
              <Panel
                id="M8"
                title="RDN Rejection by Bank"
                subtitle="RDN rejection rates by bank, ranked highest to lowest."
                icon={<DocumentIcon className="h-4 w-4 text-orange-500" />}
              >
                {!dashboard.banks.length ? (
                  <EmptyChart />
                ) : (
                  <div className="h-[275px] min-h-[275px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={dashboard.banks}
                        margin={{ top: 5, right: 48, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={percentTick}
                        />
                        <YAxis
                          type="category"
                          dataKey="bank"
                          width={60}
                          axisLine={false}
                          tickLine={false}
                          tick={{ ...tick, fill: "#64748b" }}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => formatRate(Number(value))}
                          cursor={{ fill: "#f8fafc" }}
                        />
                        <Bar
                          isAnimationActive={false}
                          dataKey="rdnRate"
                          name="RDN Rejection Rate"
                          fill="#f97316"
                          maxBarSize={18}
                          radius={[0, 3, 3, 0]}
                        >
                          <LabelList
                            dataKey="rdnRate"
                            position="right"
                            formatter={percentLabel}
                            fontSize={11}
                            fill="#64748b"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-4 border-t border-gray-100 pt-4 text-[11px] text-gray-400">
                  Total RDN applications{" "}
                  <strong className="ml-2 text-slate-700">
                    {formatCount(total.rdnSubmitted)}
                  </strong>
                </p>
              </Panel>
              <Panel
                id="M9"
                title="Funded Rate D+7 & D+30"
                subtitle="Funding rates within 7 and 30 days after registration."
                icon={<ClockIcon className="h-4 w-4 text-sky-500" />}
              >
                <div className="mb-5 grid grid-cols-3 gap-2">
                  <SmallKpi label="D+7" value={formatRate(total.funded7Rate)} />
                  <SmallKpi
                    label="D+30"
                    value={formatRate(total.funded30Rate)}
                  />
                  <SmallKpi
                    label="Dormant"
                    value={formatRate(total.dormantRate)}
                  />
                </div>
                {!total.eligible30 ? (
                  <EmptyChart>
                    No cohorts aged ≥30 days are available for this selection.
                  </EmptyChart>
                ) : (
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={dashboard.segments}
                        margin={{ top: 0, right: 44, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={tick}
                          tickFormatter={percentTick}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={120}
                          axisLine={false}
                          tickLine={false}
                          tick={{ ...tick, fill: "#64748b", fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => formatRate(Number(value))}
                          cursor={{ fill: "#f8fafc" }}
                        />
                        <Bar
                          isAnimationActive={false}
                          dataKey="funded30Rate"
                          name="Funded Rate D+30"
                          fill="#1e293b"
                          maxBarSize={13}
                          radius={[0, 3, 3, 0]}
                        >
                          <LabelList
                            dataKey="funded30Rate"
                            position="right"
                            formatter={percentLabel}
                            fontSize={10}
                            fill="#64748b"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-4 text-[11px] leading-5 text-gray-400">
                  Bars: funded rate D+30. Dormant: not funded by D+30.
                  <br />
                  Eligible accounts — D+7: {formatCount(total.eligible7)}{" "}
                  accounts · D+30: {formatCount(total.eligible30)} accounts.
                </p>
              </Panel>
            </>
          )}
        </div>
      </div>
    </AnnotationProvider>
  );
};
export default OnboardingOverview;
