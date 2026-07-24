import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type AccountTab = 'All' | 'Regular' | 'Margin' | 'Syariah' | 'Day Trade';
type DormantRiskBucket = { bucket: string; users: number; riskLevel: string; description: string };
type AccountOwnershipBucket = { bucket: string; users: number };
type AccountTypeCombination = { combination: string; users: number };
type RdnBalanceStatus = 'negative' | 'zero' | 'positive';
type RdnBalanceRange =
  | 'negative_medium'
  | 'negative_small'
  | 'zero'
  | 'positive_small'
  | 'positive_1_mio'
  | 'positive_10_mio'
  | 'positive_100_mio'
  | 'positive_1_bio'
  | 'positive_5_bio'
  | 'positive_10_bio_plus';
type RdnBalanceBucketConfig = {
  range: RdnBalanceRange;
  label: string;
  status: RdnBalanceStatus;
  minBalance: number;
  maxBalance: number | null;
};
type RdnBalanceBucket = RdnBalanceBucketConfig & {
  bucket: string;
  users: number | null;
  chartUsers: number;
  valueLabel: string;
};

const ACCOUNT_TABS: AccountTab[] = ['All', 'Regular', 'Margin', 'Syariah', 'Day Trade'];
const OWNERSHIP_BUCKET_COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f97316'];
const RDN_BALANCE_STATUS_COLORS: Record<RdnBalanceStatus, string> = {
  negative: '#ef4444',
  zero: '#94a3b8',
  positive: '#2563eb',
};
const RDN_BALANCE_BUCKET_CONFIG: RdnBalanceBucketConfig[] = [
  { range: 'negative_medium', label: 'IDR -10 Mio to IDR -1 Mio', status: 'negative', minBalance: -10000000, maxBalance: -1000000 },
  { range: 'negative_small', label: 'IDR -999,999 to IDR -1', status: 'negative', minBalance: -999999, maxBalance: -1 },
  { range: 'zero', label: 'IDR 0', status: 'zero', minBalance: 0, maxBalance: 0 },
  { range: 'positive_small', label: 'IDR 1 to IDR 999,999', status: 'positive', minBalance: 1, maxBalance: 999999 },
  { range: 'positive_1_mio', label: 'IDR 1 Mio to IDR 9.9 Mio', status: 'positive', minBalance: 1000000, maxBalance: 9999999 },
  { range: 'positive_10_mio', label: 'IDR 10 Mio to IDR 99.9 Mio', status: 'positive', minBalance: 10000000, maxBalance: 99999999 },
  { range: 'positive_100_mio', label: 'IDR 100 Mio to IDR 999.9 Mio', status: 'positive', minBalance: 100000000, maxBalance: 999999999 },
  { range: 'positive_1_bio', label: 'IDR 1 Bio to IDR 4.9 Bio', status: 'positive', minBalance: 1000000000, maxBalance: 4999999999 },
  { range: 'positive_5_bio', label: 'IDR 5 Bio to IDR 9.9 Bio', status: 'positive', minBalance: 5000000000, maxBalance: 9999999999 },
  { range: 'positive_10_bio_plus', label: '>= IDR 10 Bio', status: 'positive', minBalance: 10000000000, maxBalance: null },
];
const RDN_BALANCE_MOCK_USERS: Record<RdnBalanceRange, number | null> = {
  negative_medium: 1650,
  negative_small: 8000,
  zero: 420000,
  positive_small: 220350,
  positive_1_mio: 185000,
  positive_10_mio: 102000,
  positive_100_mio: 58000,
  positive_1_bio: 19500,
  positive_5_bio: 6200,
  positive_10_bio_plus: 1350,
};
function formatRdnBucketValue(users: number | null) {
  if (users === null) return 'N/A';
  if (users === 0) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(users);
}
const RDN_BALANCE_SNAPSHOT: RdnBalanceBucket[] = RDN_BALANCE_BUCKET_CONFIG.map((config) => {
  const users = RDN_BALANCE_MOCK_USERS[config.range];
  return {
    ...config,
    bucket: config.label,
    users,
    chartUsers: typeof users === 'number' && users > 0 ? users : Number.EPSILON,
    valueLabel: formatRdnBucketValue(users),
  };
});

// TODO: Confirm backend handling for balances below IDR -10 Mio before adding another visible bucket.
const classifyRdnBalance = (balance: number): RdnBalanceRange | null => {
  const match = RDN_BALANCE_BUCKET_CONFIG.find(
    ({ minBalance, maxBalance }) => balance >= minBalance && (maxBalance === null || balance <= maxBalance),
  );
  return match?.range ?? null;
};

const riskRows = (values: number[]): DormantRiskBucket[] => [
  { bucket: '30-60 days', users: values[0], riskLevel: 'Low Risk', description: 'Inactive for 30 to 60 days.' },
  { bucket: '61-90 days', users: values[1], riskLevel: 'Medium Risk', description: 'Inactive for 61 to 90 days.' },
  { bucket: '91-180 days', users: values[2], riskLevel: 'High Risk', description: 'Inactive for 91 to 180 days.' },
  { bucket: '181-360 days', users: values[3], riskLevel: 'Critical', description: 'Inactive for 181 to 360 days.' },
];

const DORMANT_RISK_PROFILE: Record<AccountTab, DormantRiskBucket[]> = {
  All: riskRows([92000, 74000, 118000, 84553]),
  Regular: riskRows([71000, 58500, 89000, 63200]),
  Margin: riskRows([8200, 6100, 11200, 8300]),
  Syariah: riskRows([10900, 7600, 13800, 9500]),
  'Day Trade': riskRows([1900, 1800, 4000, 3553]),
};

// TODO: Replace this mock with the latest user-level ownership snapshot from the API.
// Preferred backend fields: user_id, has_regular_account, has_margin_account,
// has_syariah_account, has_day_trade_account, and latest_snapshot_date.
// Alternative row shape: user_id + account_type. Deduplicate account types by user_id,
// then derive each user's distinct account count and ownership combination before aggregating.
const ACCOUNT_OWNERSHIP_SNAPSHOT: {
  distributionByAccountTypeCount: AccountOwnershipBucket[];
  accountTypeCombinations: AccountTypeCombination[];
} = {
  distributionByAccountTypeCount: [
    { bucket: '1 account type', users: 820000 },
    { bucket: '2 account types', users: 185000 },
    { bucket: '3 account types', users: 42000 },
    { bucket: '4 account types', users: 8500 },
  ],
  accountTypeCombinations: [
    { combination: 'Regular only', users: 780000 },
    { combination: 'Regular + Margin', users: 120000 },
    { combination: 'Regular + Syariah', users: 42000 },
    { combination: 'Regular + Day Trade', users: 31000 },
    { combination: 'Regular + Margin + Day Trade', users: 18000 },
    { combination: 'Regular + Margin + Syariah', users: 9500 },
    { combination: 'All 4 account types', users: 8500 },
  ],
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const formatRdnUsers = (value: number | null) => value === null ? 'N/A' : formatNumber(value);
const formatRdnShare = (users: number | null, totalUsers: number | null) =>
  users === null || totalUsers === null || totalUsers === 0 ? 'N/A' : `${((users / totalUsers) * 100).toFixed(1)}% of unique users`;
const getRdnUsersByStatus = (status: RdnBalanceStatus) => {
  const buckets = RDN_BALANCE_SNAPSHOT.filter((bucket) => bucket.status === status);
  return buckets.some((bucket) => bucket.users === null)
    ? null
    : buckets.reduce((sum, bucket) => sum + (bucket.users ?? 0), 0);
};

const AccountSnapshotData: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<AccountTab>('All');
  const rdnNegativeUsers = getRdnUsersByStatus('negative');
  const rdnZeroUsers = getRdnUsersByStatus('zero');
  const rdnPositiveUsers = getRdnUsersByStatus('positive');
  const rdnTotalUsers = [rdnNegativeUsers, rdnZeroUsers, rdnPositiveUsers].some((value) => value === null)
    ? null
    : (rdnNegativeUsers ?? 0) + (rdnZeroUsers ?? 0) + (rdnPositiveUsers ?? 0);
  const dormantRiskData = DORMANT_RISK_PROFILE[selectedTab];
  const dormantRiskTotal = dormantRiskData.reduce((sum, bucket) => sum + bucket.users, 0);
  const severeDormancy = dormantRiskData
    .filter((bucket) => bucket.bucket === '91-180 days' || bucket.bucket === '181-360 days')
    .reduce((sum, bucket) => sum + bucket.users, 0);
  const ownershipDistribution = ACCOUNT_OWNERSHIP_SNAPSHOT.distributionByAccountTypeCount;
  const uniqueOwnershipUsers = ownershipDistribution.reduce((sum, bucket) => sum + bucket.users, 0);
  const multiAccountUsers = ownershipDistribution
    .filter((_, index) => index > 0)
    .reduce((sum, bucket) => sum + bucket.users, 0);
  const multiAccountUserRate = uniqueOwnershipUsers > 0 ? (multiAccountUsers / uniqueOwnershipUsers) * 100 : null;
  const topAccountTypeCombinations = [...ACCOUNT_OWNERSHIP_SNAPSHOT.accountTypeCombinations]
    .sort((a, b) => b.users - a.users)
    .slice(0, 8);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.28em] uppercase text-gray-400">Account Overview</p>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Snapshot Data</h2>
        </div>
        <div className="flex w-fit max-w-full flex-wrap gap-2 rounded-2xl border border-blue-100 bg-white p-1 shadow-sm">
          {ACCOUNT_TABS.map((tab) => (
            <button key={tab} onClick={() => setSelectedTab(tab)} className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${selectedTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-black text-slate-950">RDN Balance Snapshot</h3>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 border border-blue-100">Today Snapshot</span>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Latest end-of-day RDN balance distribution by unique users, grouped into negative, zero, and positive balance ranges.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-rose-500">Users with Negative RDN</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatRdnUsers(rdnNegativeUsers)}</p>
            <p className="mt-1 text-xs font-bold text-rose-600">{formatRdnShare(rdnNegativeUsers, rdnTotalUsers)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Users with Zero RDN</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatRdnUsers(rdnZeroUsers)}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{formatRdnShare(rdnZeroUsers, rdnTotalUsers)}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-blue-500">Users with Positive RDN</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{formatRdnUsers(rdnPositiveUsers)}</p>
            <p className="mt-1 text-xs font-bold text-blue-600">{formatRdnShare(rdnPositiveUsers, rdnTotalUsers)}</p>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-500" aria-label="RDN balance status legend">
          {(['negative', 'zero', 'positive'] as RdnBalanceStatus[]).map((status) => (
            <span key={status} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RDN_BALANCE_STATUS_COLORS[status] }} />
              {status === 'negative' ? 'Negative balance' : status === 'zero' ? 'Zero balance' : 'Positive balance'}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto" role="img" aria-label="RDN balance distribution by signed balance range and balance status">
          <div className="h-[440px] min-w-[720px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={RDN_BALANCE_SNAPSHOT} barCategoryGap="24%" margin={{ top: 4, right: 56, left: 18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }} tickFormatter={formatCompactNumber} />
              <YAxis type="category" dataKey="bucket" width={260} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 800 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const bucket = payload[0]?.payload as RdnBalanceBucket | undefined;
                  if (!bucket) return null;
                  const statusLabel = bucket.status.charAt(0).toUpperCase() + bucket.status.slice(1);
                  return (
                    <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[310px]">
                      <div className="space-y-3 text-xs font-bold">
                        <div><p className="text-slate-400">Balance Range</p><p className="mt-1 text-sm font-black text-slate-900">{bucket.label}</p></div>
                        <div><p className="text-slate-400">Users</p><p className="mt-1 text-slate-900">{bucket.users === null ? 'Data unavailable' : formatNumber(bucket.users)}</p></div>
                        <div><p className="text-slate-400">Share of Unique Users</p><p className="mt-1 text-slate-900">{formatRdnShare(bucket.users, rdnTotalUsers).replace(' of unique users', '')}</p></div>
                        <div><p className="text-slate-400">Balance Status</p><p className="mt-1" style={{ color: RDN_BALANCE_STATUS_COLORS[bucket.status] }}>{statusLabel}</p></div>
                        <div className="border-t border-gray-100 pt-2 text-slate-500 leading-relaxed">
                          <p>Based on latest end-of-day RDN balance.</p>
                          <p className="mt-1">Not affected by Time Filter.</p>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="chartUsers" name="Unique Users" radius={[0, 10, 10, 0]} barSize={24} minPointSize={1}>
                {RDN_BALANCE_SNAPSHOT.map((entry) => (
                  <Cell
                    key={entry.range}
                    fill={RDN_BALANCE_STATUS_COLORS[entry.status]}
                    fillOpacity={entry.users === null || entry.users === 0 ? 0 : 1}
                    aria-label={`${entry.label}: ${entry.users === null ? 'data unavailable' : `${formatNumber(entry.users)} users`}. ${entry.status} balance.`}
                  />
                ))}
                <LabelList dataKey="valueLabel" position="right" formatter={(value: string) => value} fill="#0f172a" fontSize={11} fontWeight={900} />
              </Bar>
            </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-black text-slate-950">Dormant Risk Breakdown</h3>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 border border-slate-200">Latest Snapshot</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
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
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#8090aa', fontSize: 11, fontWeight: 800 }} tickFormatter={formatCompactNumber} />
              <YAxis type="category" dataKey="bucket" width={130} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 800 }} />
              <Tooltip formatter={(value: number, _name: string, item) => [formatNumber(value), `${item.payload.riskLevel}: ${item.payload.description}`]} />
              <Bar dataKey="users" name="Dormant Accounts" radius={[0, 10, 10, 0]} barSize={34}>
                {dormantRiskData.map((entry) => <Cell key={entry.bucket} fill={entry.riskLevel === 'Critical' ? '#ef4444' : entry.riskLevel === 'High Risk' ? '#f97316' : entry.riskLevel === 'Medium Risk' ? '#f59e0b' : '#10b981'} />)}
                <LabelList dataKey="users" position="right" formatter={(value: number) => formatCompactNumber(value)} fill="#0f172a" fontSize={11} fontWeight={900} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-black text-slate-950">Account Ownership Distribution</h3>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 border border-slate-200">Latest Snapshot</span>
        </div>

        {ownershipDistribution.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-8 text-center mt-6">
            <p className="text-lg font-black text-slate-900">No account ownership data available.</p>
            <p className="text-sm font-semibold text-slate-500 mt-2">This section requires user-level account type ownership data.</p>
          </div>
        ) : uniqueOwnershipUsers === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-8 text-center mt-6">
            <p className="text-lg font-black text-slate-900">No unique users found in latest ownership snapshot.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4" title="Users who own at least one account type.">
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Unique Users</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(uniqueOwnershipUsers)}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4" title="Users who own more than one account type.">
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Multi-Account Users</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{formatNumber(multiAccountUsers)}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4" title={multiAccountUserRate === null ? 'Rate cannot be calculated because unique users is 0.' : 'Multi-Account Users divided by total Unique Users.'}>
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-blue-500">Multi-Account User Rate</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{multiAccountUserRate === null ? 'N/A' : `${multiAccountUserRate.toFixed(1)}%`}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5">
              <h4 className="text-lg font-black text-slate-950">Users by Number of Account Types</h4>
              <p className="text-xs font-semibold text-slate-500 mt-1">Distribution of unique users by the number of distinct account types they own.</p>
              <div className="h-[340px] mt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ownershipDistribution} dataKey="users" nameKey="bucket" innerRadius={82} outerRadius={124} paddingAngle={2}>
                      {ownershipDistribution.map((entry, index) => (
                        <Cell key={entry.bucket} fill={OWNERSHIP_BUCKET_COLORS[index % OWNERSHIP_BUCKET_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const users = Number(payload[0]?.value ?? 0);
                        const share = uniqueOwnershipUsers > 0 ? (users / uniqueOwnershipUsers) * 100 : null;
                        return (
                          <div className="rounded-2xl bg-white p-4 shadow-xl border border-gray-100 min-w-[240px]">
                            <p className="text-sm font-black text-slate-900 mb-3">{payload[0]?.name ?? label}</p>
                            <div className="space-y-2 text-xs font-bold">
                              <div className="flex justify-between gap-6"><span className="text-blue-600">Users</span><span>{formatNumber(users)}</span></div>
                              <div className="flex justify-between gap-6"><span className="text-slate-500">Share</span><span>{share === null ? 'Share unavailable because unique users is 0.' : `${share.toFixed(1)}% of unique users`}</span></div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-7">
                  <div className="text-center">
                    <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Unique Users</p>
                    <p className="text-2xl font-black text-slate-950">{formatCompactNumber(uniqueOwnershipUsers)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 mt-6 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h4 className="text-lg font-black text-slate-950">Account Type Combination</h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">Showing top account type combinations by unique users.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                      <th className="px-5 py-3">Account Combination</th>
                      <th className="px-5 py-3 text-right">Users</th>
                      <th className="px-5 py-3 text-right">Share of Unique Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topAccountTypeCombinations.map((row) => (
                      <tr key={row.combination} className="text-sm font-bold text-slate-700 hover:bg-gray-50/70">
                        <td className="px-5 py-4">{row.combination}</td>
                        <td className="px-5 py-4 text-right text-slate-950">{formatNumber(row.users)}</td>
                        <td className="px-5 py-4 text-right text-blue-600">{uniqueOwnershipUsers > 0 ? `${((row.users / uniqueOwnershipUsers) * 100).toFixed(1)}%` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AccountSnapshotData;
