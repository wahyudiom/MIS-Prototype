import React, { useMemo, useState, useEffect } from 'react';
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

interface DetailInvestmentSolutionProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total AUM', 
    valueYTD: formatCurrency(0.8e12), 
    valueMTD: formatCurrency(0.82e12)
  },
  { 
    label: 'Net Inflow AUM', 
    valueYTD: formatCurrency(35e9), 
    valueMTD: formatCurrency(6e9)
  },
  { 
    label: 'Total Revenue', 
    valueYTD: formatCurrency(18e9), 
    valueMTD: formatCurrency(3e9),
    changeYTD: 11.3, 
    changeMTD: 1.8 
  },
  { 
    label: 'Avg Revenue per Client (RPA)', 
    valueYTD: formatCurrency(30e6), 
    valueMTD: formatCurrency(31e6)
  },
  { 
    label: 'Total AUM Mutual Funds', 
    valueYTD: formatCurrency(0.32e12), 
    valueMTD: formatCurrency(0.33e12)
  },
];

const generateDailyAssetTrend = (initialAUM: number): DailyTrendData[] => {
    let currentAUM = initialAUM;
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        // Daily net flow between -300M and +1.2B
        const dailyFlow = (Math.random() * 1.5e9) - 0.3e9;
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
        const dailyFlow = (Math.random() * 8e8) - 1.5e8;
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
            lineValue: (Math.random() * 8 - 4)
        };
    });
};

const aumTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 0.70e12, trend: 4e9 }, { month: 'Apr 2025', value1: 0.72e12, trend: 4e9 },
  { month: 'May 2025', value1: 0.74e12, trend: 4e9 }, { month: 'Jun 2025', value1: 0.75e12, trend: 4e9 },
  { month: 'Jul 2025', value1: 0.76e12, trend: 4e9 }, { month: 'Aug 2025', value1: 0.77e12, trend: 4e9 },
  { month: 'Sep 2025', value1: 0.78e12, trend: 5.2e9 }, { month: 'Oct 2025', value1: 0.8e12, trend: 7.8e9 },
  { month: 'Nov 2025', value1: 0.79e12, trend: -3.2e9 }, { month: 'Dec 2025', value1: 0.81e12, trend: 9.1e9 },
  { month: 'Jan 2026', value1: 0.83e12, trend: 6.4e9 }, { month: 'Feb 2026', value1: 0.85e12, trend: 8.2e9 },
];

const clientTrendData: ClientTrendData[] = [
    { month: 'Mar 2025', existing: 400, new: 18 }, { month: 'Apr 2025', existing: 418, new: 20 },
    { month: 'May 2025', existing: 438, new: 22 }, { month: 'Jun 2025', existing: 460, new: 15 },
    { month: 'Jul 2025', existing: 475, new: 12 }, { month: 'Aug 2025', existing: 487, new: 13 },
    { month: 'Sep 2025', existing: 500, new: 22 }, { month: 'Oct 2025', existing: 518, new: 28 },
    { month: 'Nov 2025', existing: 544, new: 32 }, { month: 'Dec 2025', existing: 574, new: 30 },
    { month: 'Jan 2026', existing: 602, new: 38 }, { month: 'Feb 2026', existing: 638, new: 42 },
];

const revenueTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 1.8e9, trend: 1.0 }, { month: 'Apr 2025', value1: 2.0e9, trend: 11.1 },
  { month: 'May 2025', value1: 2.1e9, trend: 5.0 }, { month: 'Jun 2025', value1: 2.2e9, trend: 4.8 },
  { month: 'Jul 2025', value1: 2.3e9, trend: 4.5 }, { month: 'Aug 2025', value1: 2.4e9, trend: 4.2 },
  { month: 'Sep 2025', value1: 2.5e9, trend: 1.5 }, { month: 'Oct 2025', value1: 2.8e9, trend: 12 },
  { month: 'Nov 2025', value1: 2.6e9, trend: -7.1 }, { month: 'Dec 2025', value1: 3.0e9, trend: 15.3 },
  { month: 'Jan 2026', value1: 3.2e9, trend: 6.6 }, { month: 'Feb 2026', value1: 3.5e9, trend: 9.3 },
];

const monthlyMutualFundsAccountTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 250e9, trend: 5e9 }, { month: 'Apr 2025', value1: 255e9, trend: 5e9 },
  { month: 'May 2025', value1: 260e9, trend: 5e9 }, { month: 'Jun 2025', value1: 265e9, trend: 5e9 },
  { month: 'Jul 2025', value1: 270e9, trend: 5e9 }, { month: 'Aug 2025', value1: 280e9, trend: 10e9 },
  { month: 'Sep 2025', value1: 290e9, trend: 8e9 }, { month: 'Oct 2025', value1: 315e9, trend: 25e9 },
  { month: 'Nov 2025', value1: 322e9, trend: 7e9 }, { month: 'Dec 2025', value1: 330e9, trend: 8e9 },
  { month: 'Jan 2026', value1: 342e9, trend: 12e9 }, { month: 'Feb 2026', value1: 365e9, trend: 23e9 },
];

const portfolioBreakdownData: BreakdownData[] = [
    { name: 'Stocks', value: 0.35e12 },
    { name: 'Bonds', value: 0.25e12 },
    { name: 'Mutual Funds', value: 0.20e12 },
];

const baseLeaderboard = [
    { name: "David Copperfield", aum: 100e9, inflow: 9e9, revenue: 2e9, rpa: 35e6, clients: 120 },
    { name: "Eva Green", aum: 90e9, inflow: 7.5e9, revenue: 1.8e9, rpa: 32e6, clients: 110 },
    { name: "Frank White", aum: 80e9, inflow: 6e9, revenue: 1.5e9, rpa: 28e6, clients: 100 },
];

const DetailInvestmentSolution: React.FC<DetailInvestmentSolutionProps> = ({ onSalespersonClick }) => {
    const dailyAssetTrend = useMemo(() => generateDailyAssetTrend(0.8e12), []);
    const dailyMutualFundsTrend = useMemo(() => generateDailyMutualFundsTrend(0.33e12), []);
    const dailyClientTrend = useMemo(() => generateDailyClientTrend(1000, 10), []);
    const dailyRevenueTrend = useMemo(() => generateDailyBarLine(120000000), []);

    const [startDate, setStartDate] = useState<DateSelection>({ month: 'Oct', year: '2024' });
    const [endDate, setEndDate] = useState<DateSelection>({ month: 'Apr', year: '2025' });
    const [isLoading, setIsLoading] = useState(false);

    // Filter effect simulation
    const leaderboardData = useMemo(() => {
        const multiplier = (parseInt(endDate.year) - parseInt(startDate.year)) * 0.1 + 1.0;
        const offset = (startDate.month.length % 5) * 0.05;

        return baseLeaderboard.map((item, idx) => [
            idx + 1,
            item.name,
            formatCurrency(item.aum * multiplier * (1 + offset)),
            formatCurrency(item.inflow * multiplier),
            formatCurrency(item.revenue * multiplier),
            formatCurrency(item.rpa * multiplier),
            Math.floor(item.clients * multiplier)
        ]);
    }, [startDate, endDate]);

    // UI Feedback for filtering
    useEffect(() => {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }, [startDate, endDate]);

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <DetailKPICard data={kpiData[0]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[1]} hideMTD hideLabels />
                <DetailKPICard data={kpiData[2]} />
                <DetailKPICard data={kpiData[3]} />
                <DetailKPICard data={kpiData[4]} hideMTD hideLabels />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PRODUCT PENETRATION RATE</h3>
                <p className="text-6xl font-black text-pink-500">42%</p>
                <p className="text-sm font-medium text-gray-500 mt-4">Clients with multiple investment products</p>
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

            <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "opacity-100 transition-opacity duration-300"}>
              <DataTable 
                title="Leaderboard Salesperson (Priority Client Services)" 
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
        </div>
    );
};

export default DetailInvestmentSolution;
