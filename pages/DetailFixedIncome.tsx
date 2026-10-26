
import React, { useMemo, useState } from 'react';
import type { DetailKPICardData, MonthlyTrendData, BreakdownData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    MonthlyTrendChart, 
    BreakdownDonutChart, 
    TrendComposedChart,
    formatCurrency, 
    formatNumber,
    SectionTitle
} from '../components/Shared';

interface DetailFixedIncomeProps {
  onSalespersonClick: (name: string) => void;
}

type FixedIncomeAudience = 'Online' | 'Offline';

const audienceLabels: Record<FixedIncomeAudience, string> = {
    Online: 'Online',
    Offline: 'Offline (Over the Counter)',
};

const previousMonthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
}).format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

const audienceProfiles: Record<FixedIncomeAudience, {
    volumeYTD: number;
    volumeMTD: number;
    revenueYTD: number;
    revenueMTD: number;
    accountYTD: number;
    accountMTD: number;
    averageYTD: number;
    averageMTD: number;
    dailyVolumeBase: number;
    dailyRevenueBase: number;
    dailyAccountBase: number;
    trendScale: number;
}> = {
    Online: {
        volumeYTD: 25e12,
        volumeMTD: 3.5e12,
        revenueYTD: 55e9,
        revenueMTD: 9e9,
        accountYTD: 842,
        accountMTD: 95,
        averageYTD: 29.6e9,
        averageMTD: 36.8e9,
        dailyVolumeBase: 150e9,
        dailyRevenueBase: 350e6,
        dailyAccountBase: 45,
        trendScale: 1,
    },
    Offline: {
        volumeYTD: 42e12,
        volumeMTD: 6.4e12,
        revenueYTD: 81e9,
        revenueMTD: 13.6e9,
        accountYTD: 318,
        accountMTD: 42,
        averageYTD: 132.1e9,
        averageMTD: 152.4e9,
        dailyVolumeBase: 260e9,
        dailyRevenueBase: 540e6,
        dailyAccountBase: 22,
        trendScale: 1.45,
    },
};

const buildKpiData = (audience: FixedIncomeAudience): DetailKPICardData[] => {
    const profile = audienceProfiles[audience];
    const combinedRevenueYTD = audienceProfiles.Online.revenueYTD + audienceProfiles.Offline.revenueYTD;
    const combinedRevenueMTD = audienceProfiles.Online.revenueMTD + audienceProfiles.Offline.revenueMTD;

    return [
      { 
        label: 'Total Revenue (Combined Online and Offline)', 
        valueYTD: formatCurrency(combinedRevenueYTD), 
        valueMTD: formatCurrency(combinedRevenueMTD),
        changeYTD: 7.5, 
        changeMTD: 1.8 
      },
      { 
        label: 'Transaction Volume (Bonds)', 
        valueYTD: formatCurrency(profile.volumeYTD), 
        valueMTD: formatCurrency(profile.volumeMTD),
        changeYTD: audience === 'Online' ? 7.8 : 9.1, 
        changeMTD: audience === 'Online' ? 1.8 : 2.4 
      },
      { 
        label: 'Total Transaction Account', 
        valueYTD: formatNumber(profile.accountYTD), 
        valueMTD: formatNumber(profile.accountMTD),
        changeYTD: audience === 'Online' ? 12.4 : 6.9,
        changeMTD: audience === 'Online' ? 5.2 : 3.3
      },
      { 
        label: 'Average Transaction per Account', 
        valueYTD: formatCurrency(profile.averageYTD), 
        valueMTD: formatCurrency(profile.averageMTD),
        changeYTD: audience === 'Online' ? -2.1 : 4.7,
        changeMTD: audience === 'Online' ? 1.5 : 2.8
      },
    ];
};

const generateDailyBarLine = (baseVal: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: baseVal + Math.floor(Math.random() * baseVal * 0.4),
            lineValue: (Math.random() * 8 - 4)
        };
    });
};

const generateDailyAccountTrend = (baseVal: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: Math.floor(baseVal + (Math.random() * 15 - 5)),
            lineValue: parseFloat((Math.random() * 12 - 6).toFixed(2))
        };
    });
};

const volumeTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 2.0e12, trend: 1.0 }, { month: 'Apr 2025', value1: 2.2e12, trend: 1.5 },
  { month: 'May 2025', value1: 2.3e12, trend: 1.2 }, { month: 'Jun 2025', value1: 2.4e12, trend: 1.1 },
  { month: 'Jul 2025', value1: 2.45e12, trend: 0.8 }, { month: 'Aug 2025', value1: 2.5e12, trend: 0.5 },
  { month: 'Sep 2025', value1: 2.5e12, trend: 1.1 }, { month: 'Oct 2025', value1: 3e12, trend: 2.5 },
  { month: 'Nov 2025', value1: 2.8e12, trend: -0.8 }, { month: 'Dec 2025', value1: 3.5e12, trend: 5.1 },
  { month: 'Jan 2026', value1: 4e12, trend: 6.2 }, { month: 'Feb 2026', value1: 3.8e12, trend: -2.0 },
];

const revenueTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 7e9, trend: 1.5 }, { month: 'Apr 2025', value1: 7.5e9, trend: 2.0 },
  { month: 'May 2025', value1: 7.8e9, trend: 1.8 }, { month: 'Jun 2025', value1: 8e9, trend: 1.5 },
  { month: 'Jul 2025', value1: 8.2e9, trend: 1.2 }, { month: 'Aug 2025', value1: 8.5e9, trend: 1.0 },
  { month: 'Jan', value1: 8e9, trend: 2.1 }, { month: 'Feb', value1: 9.5e9, trend: 4.3 },
  { month: 'Mar', value1: 9e9, trend: -1.0 }, { month: 'Apr', value1: 10e9, trend: 2.2 },
  { month: 'May', value1: 11e9, trend: 3.5 }, { month: 'Jun', value1: 10.5e9, trend: -1.5 },
];

const monthlyAccountTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 650, trend: 2.0 }, { month: 'Apr 2025', value1: 665, trend: 2.3 },
  { month: 'May 2025', value1: 680, trend: 2.2 }, { month: 'Jun 2025', value1: 695, trend: 2.1 },
  { month: 'Jul 2025', value1: 705, trend: 1.5 }, { month: 'Aug 2025', value1: 715, trend: 1.4 },
  { month: 'Sep 2025', value1: 720, trend: 2.5 },
  { month: 'Oct 2025', value1: 755, trend: 4.8 },
  { month: 'Nov 2025', value1: 792, trend: 4.9 },
  { month: 'Dec 2025', value1: 810, trend: 2.2 },
  { month: 'Jan 2026', value1: 842, trend: 3.9 },
  { month: 'Feb 2026', value1: 915, trend: 8.6 },
];

const volumeBreakdown: BreakdownData[] = [
    { name: 'Offline', value: 18e12 },
    { name: 'Online', value: 7e12 },
];

const scaleMonthlyData = (data: MonthlyTrendData[], scale: number): MonthlyTrendData[] =>
    data.map((item) => ({ ...item, value1: item.value1 * scale }));

const scaleBreakdownData = (data: BreakdownData[], scale: number): BreakdownData[] =>
    data.map((item) => ({ ...item, value: item.value * scale }));

const buildLeaderboardData = (audience: FixedIncomeAudience) => {
    const scale = audienceProfiles[audience].trendScale;

    return [
        [1, "Jack Ma", formatCurrency(5e12 * scale), formatCurrency(4e12 * scale), formatCurrency(1e12 * scale), formatCurrency(10e9 * scale)],
        [2, "Karen Blixen", formatCurrency(4.5e12 * scale), formatCurrency(3.5e12 * scale), formatCurrency(1e12 * scale), formatCurrency(9e9 * scale)],
        [3, "Leo Tolstoy", formatCurrency(4e12 * scale), formatCurrency(3e12 * scale), formatCurrency(1e12 * scale), formatCurrency(8e9 * scale)],
    ];
};

const DetailFixedIncome: React.FC<DetailFixedIncomeProps> = ({ onSalespersonClick }) => {
    const [selectedAudience, setSelectedAudience] = useState<FixedIncomeAudience>('Online');
    const selectedProfile = audienceProfiles[selectedAudience];
    const kpiCards = useMemo(() => buildKpiData(selectedAudience), [selectedAudience]);
    const dailyVolumeTrend = useMemo(() => generateDailyBarLine(selectedProfile.dailyVolumeBase), [selectedProfile.dailyVolumeBase]);
    const dailyRevenueTrend = useMemo(() => generateDailyBarLine(selectedProfile.dailyRevenueBase), [selectedProfile.dailyRevenueBase]);
    const dailyAccountTrend = useMemo(() => generateDailyAccountTrend(selectedProfile.dailyAccountBase), [selectedProfile.dailyAccountBase]);
    const selectedVolumeTrendData = useMemo(() => scaleMonthlyData(volumeTrendData, selectedProfile.trendScale), [selectedProfile.trendScale]);
    const selectedRevenueTrendData = useMemo(() => scaleMonthlyData(revenueTrendData, selectedProfile.trendScale), [selectedProfile.trendScale]);
    const selectedAccountTrendData = useMemo(() => scaleMonthlyData(monthlyAccountTrendData, selectedAudience === 'Online' ? 1 : 0.46), [selectedAudience]);
    const selectedVolumeBreakdown = useMemo(() => scaleBreakdownData(volumeBreakdown, selectedProfile.trendScale), [selectedProfile.trendScale]);
    const leaderboardData = useMemo(() => buildLeaderboardData(selectedAudience), [selectedAudience]);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header className="mb-4">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Fixed Income</h2>
              {selectedAudience === 'Offline' && (
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">DATA AS OF {previousMonthLabel}</p>
              )}
            </header>

            <div className="flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {(['Online', 'Offline'] as FixedIncomeAudience[]).map((audience) => (
                    <button
                        key={audience}
                        type="button"
                        onClick={() => setSelectedAudience(audience)}
                        className={`flex-1 rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                            selectedAudience === audience
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                        aria-pressed={selectedAudience === audience}
                    >
                        {audienceLabels[audience]}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((kpi, index) => (
                  <DetailKPICard 
                    key={kpi.label} 
                    data={kpi} 
                    variant={index === 0 ? 'blue' : 'default'}
                  />
                ))}
            </div>

            {/* Daily Trends Section */}
            <section>
                <SectionTitle title="DAILY TRENDS" />
                <div className="grid grid-cols-1 gap-6">
                    <TrendComposedChart 
                        data={dailyVolumeTrend} 
                        title="Daily Transaction Volume Trends Last 30 Calendar Days" 
                        barLabel1="Volume"
                        lineLabel="Changes %"
                        isCurrency={true}
                        isLinePercentage={true}
                    />
                    <TrendComposedChart 
                        data={dailyAccountTrend} 
                        title="Daily Transaction Account Trend Last 30 Calendar Days" 
                        barLabel1="Transaction Account"
                        lineLabel="Changes %"
                    />
                    <TrendComposedChart 
                        data={dailyRevenueTrend} 
                        title="Combined Daily Total Revenue Trends" 
                        barLabel1="Revenue"
                        lineLabel="Changes %"
                        isCurrency={true}
                        isLinePercentage={true}
                    />
                </div>
            </section>

            {/* Monthly Trends Section */}
            <section>
                <SectionTitle title="MONTHLY TRENDS" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MonthlyTrendChart 
                        data={selectedAccountTrendData} 
                        dataKey1="Transaction Account" 
                        trendKey="Changes" 
                        title="Monthly Transaction Account"
                        subtitle="Number of transaction Account"
                    />
                    <MonthlyTrendChart data={selectedRevenueTrendData} dataKey1="Revenue" trendKey="Change" title="Combined Monthly Total Revenue Trend" isCurrency={true} />
                    <MonthlyTrendChart data={selectedVolumeTrendData} dataKey1="Transaction Volume" trendKey="Change" title="Monthly Transaction Volume Trend (MoM)" isCurrency={true} />
                    {selectedAudience === 'Online' && (
                      <BreakdownDonutChart data={selectedVolumeBreakdown} title="Volume Breakdown (Offline vs. Online)" isCurrency />
                    )}
                </div>
            </section>

            {selectedAudience === 'Online' && (
              <DataTable 
                title={`Leaderboard Salesperson (Fixed Income - ${audienceLabels[selectedAudience]})`} 
                columns={["Ranking", "Salesperson", "Volume (Total)", "Volume (Offline)", "Volume (Online)", "Total Revenue (Combined Online and Offline)"]} 
                data={leaderboardData} 
                onRowClick={(row) => onSalespersonClick(row[1] as string)}
              />
            )}
        </div>
    );
};

export default DetailFixedIncome;
