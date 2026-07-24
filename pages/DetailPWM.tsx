import React, { useMemo, useState } from 'react';
import type { DetailKPICardData, MonthlyTrendData, ClientTrendData, BreakdownData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    MonthlyTrendChart, 
    ClientTrendChart, 
    BreakdownDonutChart, 
    TrendComposedChart,
    formatCurrency,
    SectionTitle,
    DateRangeSelector,
    DateSelection
} from '../components/Shared';

interface DetailPWMProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total AUM', 
    valueYTD: formatCurrency(1.2e12), 
    valueMTD: formatCurrency(1.25e12)
  },
  { 
    label: 'Net Inflow AUM', 
    valueYTD: formatCurrency(50e9), 
    valueMTD: formatCurrency(8e9)
  },
  { 
    label: 'Total Revenue (Fee)', 
    valueYTD: formatCurrency(25e9), 
    valueMTD: formatCurrency(4e9),
    changeYTD: 9.8, 
    changeMTD: 1.5 
  },
  { 
    label: 'Avg Revenue per Client (RPA)', 
    valueYTD: formatCurrency(50e6), 
    valueMTD: formatCurrency(52e6)
  },
  { 
    label: 'Total AUM Mutual Funds', 
    valueYTD: formatCurrency(0.45e12), 
    valueMTD: formatCurrency(0.46e12)
  },
];

const generateDailyAssetTrend = (initialAUM: number): DailyTrendData[] => {
    let currentAUM = initialAUM;
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        // Daily net flow between -500M and +1.5B
        const dailyFlow = (Math.random() * 2e9) - 0.5e9;
        currentAUM += dailyFlow;
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: currentAUM,
            lineValue: dailyFlow
        };
    });
};

const generateDailyMutualFundsTrend = (initialAUM: number): DailyTrendData[] => {
    let currentAUM = initialAUM;
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        const dailyFlow = (Math.random() * 1e9) - 2e8;
        currentAUM += dailyFlow;
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: currentAUM,
            lineValue: dailyFlow
        };
    });
};

const generateDailyClientTrend = (base1: number, base2: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: base2 + Math.floor(Math.random() * base2 * 0.5), // New Clients as Bar
            lineValue: base1 + Math.floor(Math.random() * base1 * 0.2)  // Existing Clients as Line
        };
    });
};

const generateDailyBarLine = (baseVal: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: baseVal + Math.floor(Math.random() * baseVal * 0.4),
            lineValue: (Math.random() * 6 - 3)
        };
    });
};

const aumTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 1.05e12, trend: 5e9 }, { month: 'Apr 2025', value1: 1.08e12, trend: 5e9 },
  { month: 'May 2025', value1: 1.10e12, trend: 5e9 }, { month: 'Jun 2025', value1: 1.12e12, trend: 5e9 },
  { month: 'Jul 2025', value1: 1.13e12, trend: 5e9 }, { month: 'Aug 2025', value1: 1.14e12, trend: 5e9 },
  { month: 'Sep 2025', value1: 1.15e12, trend: 8.5e9 }, { month: 'Oct 2025', value1: 1.18e12, trend: 12.2e9 },
  { month: 'Nov 2025', value1: 1.16e12, trend: -4.1e9 }, { month: 'Dec 2025', value1: 1.22e12, trend: 15.6e9 },
  { month: 'Jan 2026', value1: 1.25e12, trend: 9.8e9 }, { month: 'Feb 2026', value1: 1.28e12, trend: 11.2e9 },
];

const clientTrendData: ClientTrendData[] = [
    { month: 'Mar 2025', existing: 400, new: 15 }, { month: 'Apr 2025', existing: 415, new: 18 },
    { month: 'May 2025', existing: 433, new: 20 }, { month: 'Jun 2025', existing: 453, new: 15 },
    { month: 'Jul 2025', existing: 468, new: 12 }, { month: 'Aug 2025', existing: 480, new: 20 },
    { month: 'Sep 2025', existing: 500, new: 20 }, { month: 'Oct 2025', existing: 520, new: 25 },
    { month: 'Nov 2025', existing: 545, new: 30 }, { month: 'Dec 2025', existing: 575, new: 28 },
    { month: 'Jan 2026', existing: 603, new: 35 }, { month: 'Feb 2026', existing: 638, new: 40 },
];

const revenueTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 2.5e9, trend: 1.0 }, { month: 'Apr 2025', value1: 2.7e9, trend: 8.0 },
  { month: 'May 2025', value1: 2.9e9, trend: 7.4 }, { month: 'Jun 2025', value1: 3.1e9, trend: 6.9 },
  { month: 'Jul 2025', value1: 3.2e9, trend: 3.2 }, { month: 'Aug 2025', value1: 3.3e9, trend: 3.1 },
  { month: 'Sep 2025', value1: 3.5e9, trend: 1.2 }, { month: 'Oct 2025', value1: 4.0e9, trend: 14.3 },
  { month: 'Nov 2025', value1: 3.8e9, trend: -5.0 }, { month: 'Dec 2025', value1: 4.2e9, trend: 10.5 },
  { month: 'Jan 2026', value1: 4.8e9, trend: 14.2 }, { month: 'Feb 2026', value1: 5.0e9, trend: 4.1 },
];

const monthlyMutualFundsAccountTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 350e9, trend: 10e9 }, { month: 'Apr 2025', value1: 360e9, trend: 10e9 },
  { month: 'May 2025', value1: 370e9, trend: 10e9 }, { month: 'Jun 2025', value1: 380e9, trend: 10e9 },
  { month: 'Jul 2025', value1: 390e9, trend: 10e9 }, { month: 'Aug 2025', value1: 400e9, trend: 10e9 },
  { month: 'Sep 2025', value1: 410e9, trend: 15e9 }, { month: 'Oct 2025', value1: 435e9, trend: 25e9 },
  { month: 'Nov 2025', value1: 442e9, trend: 7e9 }, { month: 'Dec 2025', value1: 450e9, trend: 8e9 },
  { month: 'Jan 2026', value1: 455e9, trend: 5e9 }, { month: 'Feb 2026', value1: 475e9, trend: 20e9 },
];

const portfolioBreakdownData: BreakdownData[] = [
    { name: 'Stocks', value: 0.5e12 },
    { name: 'Bonds', value: 0.4e12 },
    { name: 'Mutual Funds', value: 0.3e12 },
];

const leaderboardData = [
    [1, "Alice Wonderland", formatCurrency(150e9), formatCurrency(10e9), formatCurrency(3e9), formatCurrency(55e6), 80],
    [2, "Bob Builder", formatCurrency(120e9), formatCurrency(8e9), formatCurrency(2.5e9), formatCurrency(52e6), 75],
    [3, "Charlie Chaplin", formatCurrency(100e9), formatCurrency(7e9), formatCurrency(2.2e9), formatCurrency(48e6), 70],
];

const DetailPWM: React.FC<DetailPWMProps> = ({ onSalespersonClick }) => {
    const dailyAssetTrend = useMemo(() => generateDailyAssetTrend(1.18e12), []);
    const dailyMutualFundsTrend = useMemo(() => generateDailyMutualFundsTrend(0.46e12), []);
    const dailyClientTrend = useMemo(() => generateDailyClientTrend(600, 5), []);
    const dailyRevenueTrend = useMemo(() => generateDailyBarLine(150000000), []);

    const [startDate, setStartDate] = useState<DateSelection>({ month: 'Jan', year: '2026' });
    const [endDate, setEndDate] = useState<DateSelection>({ month: 'Jun', year: '2026' });

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <DetailKPICard data={kpiData[0]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[1]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[2]} />
                <DetailKPICard data={kpiData[3]} />
                <DetailKPICard data={kpiData[4]} hideMTD hideLabels />
            </div>

            {/* Product Penetration Rate */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PRODUCT PENETRATION RATE</h3>
                <p className="text-6xl font-black text-blue-600">35%</p>
                <p className="text-sm font-medium text-gray-500 mt-4">Clients with multiple investment products (e.g., Stocks & Bonds)</p>
             </div>

            {/* Daily Trends Section */}
            <section>
                <SectionTitle title="DAILY TRENDS" />
                <div className="grid grid-cols-1 gap-6">
                    <TrendComposedChart 
                        data={dailyAssetTrend} 
                        title="Daily Asset Value Growth Last 30 Calendar Days" 
                        subtitle="In IDR Billion"
                        barLabel1="Total Asset"
                        lineLabel="Nett"
                        isCurrency={true}
                        isLineCurrency={true}
                    />
                    <TrendComposedChart 
                        data={dailyMutualFundsTrend} 
                        title="Daily AUM Mutual Funds Growth Last 30 Calendar Days" 
                        subtitle="In IDR Billion"
                        barLabel1="Total Mutual Funds Asset"
                        lineLabel="Nett"
                        isCurrency={true}
                        isLineCurrency={true}
                    />
                    <TrendComposedChart 
                        data={dailyClientTrend} 
                        title="Daily New Client Acquisition vs. Total Client Last 30 Calendar Days" 
                        barLabel1="New Clients"
                        lineLabel="Existing Clients"
                    />
                    <TrendComposedChart 
                        data={dailyRevenueTrend} 
                        title="Daily Total Revenue Trends Last 30 Calendar Days" 
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
                        data={aumTrendData} 
                        dataKey1="Total Asset" 
                        trendKey="Nett"
                        title="Monthly Total Asset Trend (MoM)" 
                        subtitle="In IDR Billion"
                        isCurrency={true} 
                        isTrendCurrency={true}
                    />
                    <MonthlyTrendChart 
                        data={monthlyMutualFundsAccountTrendData} 
                        dataKey1="Total Mutual Funds Asset" 
                        trendKey="Nett" 
                        title="Monthly AUM Mutual Funds Growth"
                        subtitle="In IDR Billion"
                        isCurrency={true}
                        isTrendCurrency={true}
                    />
                    <ClientTrendChart 
                        data={clientTrendData}
                        title="Monthly New Client Acquisition vs. Total Client"
                    />
                    <MonthlyTrendChart 
                        data={revenueTrendData} 
                        dataKey1="Revenue" 
                        trendKey="Change"
                        title="Monthly Total Revenue Trends (MoM)" 
                        isCurrency={true} 
                    />
                    <BreakdownDonutChart data={portfolioBreakdownData} title="Portfolio Breakdown" isCurrency />
                </div>
            </section>

            <DataTable 
              title="Leaderboard Salesperson (PWM)" 
              columns={["Ranking", "Salesperson", "Total AUM", "Net Inflow AUM (YTD)", "Total Revenue", "RPA", "Active Clients"]} 
              data={leaderboardData} 
              onRowClick={(row) => onSalespersonClick(row[1] as string)}
              headerAction={
                <DateRangeSelector 
                  start={startDate} 
                  end={endDate} 
                  onStartChange={setStartDate} 
                  onEndChange={setEndDate} 
                />
              }
            />
        </div>
    );
};

export default DetailPWM;