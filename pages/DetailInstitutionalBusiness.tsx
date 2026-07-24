
import React, { useMemo, useState } from 'react';
import type { DetailKPICardData, MonthlyTrendData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    MonthlyTrendChart, 
    ConcentrationChart, 
    TrendComposedChart,
    ClientTrendChart,
    ADVCombinedBreakdown,
    formatCurrency, 
    formatNumber,
    SectionTitle,
    DateRangeSelector,
    DateSelection
} from '../components/Shared';

interface DetailInstitutionalBusinessProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total Transaction Volume', 
    valueYTD: formatCurrency(15e12), 
    valueMTD: formatCurrency(2.1e12),
    changeYTD: 10.5, 
    changeMTD: 2.2 
  },
  { 
    label: 'Total Revenue (Fee)', 
    valueYTD: formatCurrency(75e9), 
    valueMTD: formatCurrency(12e9),
    changeYTD: 11.2, 
    changeMTD: 2.5 
  },
  { 
    label: 'New Institutional Accounts', 
    valueYTD: formatNumber(42), 
    valueMTD: formatNumber(5),
    changeYTD: 8.1, 
    changeMTD: 1.2 
  },
  { 
    label: 'Average Volume per Client', 
    valueYTD: formatCurrency(357e9), 
    valueMTD: formatCurrency(360e9),
    changeYTD: 1.5, 
    changeMTD: 0.3 
  },
];

const generateDailyBarLine = (baseVal: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: baseVal + Math.floor(Math.random() * baseVal * 0.4),
            lineValue: (Math.random() * 10 - 5)
        };
    });
};

const generateDailyClientLineTrend = (base1: number, base2: number): DailyTrendData[] => {
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

const volumeTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 1.0e12, trend: 1.0 }, { month: 'Apr 2025', value1: 1.1e12, trend: 1.2 },
  { month: 'May 2025', value1: 1.15e12, trend: 1.1 }, { month: 'Jun 2025', value1: 1.18e12, trend: 1.0 },
  { month: 'Jul 2025', value1: 1.19e12, trend: 0.8 }, { month: 'Aug 2025', value1: 1.2e12, trend: 0.5 },
  { month: 'Sep 2025', value1: 1.2e12, trend: 1.5 }, { month: 'Oct 2025', value1: 1.5e12, trend: 2.1 },
  { month: 'Nov 2025', value1: 1.4e12, trend: 0.5 }, { month: 'Dec 2025', value1: 1.8e12, trend: 3.2 },
  { month: 'Jan 2026', value1: 2.1e12, trend: 4.1 }, { month: 'Feb 2026', value1: 2.0e12, trend: -1.2 },
];

const revenueTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 9e9, trend: 1.5 }, { month: 'Apr 2025', value1: 9.5e9, trend: 2.0 },
  { month: 'May 2025', value1: 10e9, trend: 1.8 }, { month: 'Jun 2025', value1: 10.2e9, trend: 1.5 },
  { month: 'Jul 2025', value1: 10.5e9, trend: 1.2 }, { month: 'Aug 2025', value1: 10.8e9, trend: 1.0 },
  { month: 'Sep 2025', value1: 11e9, trend: 2.2 }, { month: 'Oct 2025', value1: 12.5e9, trend: 5.1 },
  { month: 'Nov 2025', value1: 12e9, trend: -1.0 }, { month: 'Dec 2025', value1: 14e9, trend: 8.2 },
  { month: 'Jan 2026', value1: 15.5e9, trend: 10.5 }, { month: 'Feb 2026', value1: 15e9, trend: -2.1 },
];

const concentrationData = [
    { name: 'Client A', volume: 3e12 }, { name: 'Client B', volume: 2.5e12 },
    { name: 'Client C', volume: 2e12 }, { name: 'Client D', volume: 1.5e12 },
    { name: 'Client E', volume: 1e12 }, { name: 'Client F', volume: 0.8e12 },
    { name: 'Client G', volume: 0.5e12 }, { name: 'Others', volume: 3.7e12 },
];

const clientTrendData = [
    { month: 'Mar 2025', existing: 120, new: 3 }, { month: 'Apr 2025', existing: 123, new: 4 },
    { month: 'May 2025', existing: 127, new: 5 }, { month: 'Jun 2025', existing: 132, new: 4 },
    { month: 'Jul 2025', existing: 136, new: 3 }, { month: 'Aug 2025', existing: 142, new: 5 },
    { month: 'Sep 2025', existing: 150, new: 5 }, { month: 'Oct 2025', existing: 155, new: 7 },
    { month: 'Nov 2025', existing: 162, new: 6 }, { month: 'Dec 2025', existing: 168, new: 8 },
    { month: 'Jan 2026', existing: 176, new: 10 }, { month: 'Feb 2026', existing: 186, new: 12 },
];

const advBreakdownData = [
  { month: 'Mar 2025', domestic: 8.03, foreign: 5.82, total: 13.85, domPct: 58, forPct: 42, change: 0 },
  { month: 'Apr 2025', domestic: 8.16, foreign: 4.80, total: 12.96, domPct: 63, forPct: 37, change: -6.43 },
  { month: 'May 2025', domestic: 9.31, foreign: 5.47, total: 14.78, domPct: 63, forPct: 37, change: 14.04 },
  { month: 'Jun 2025', domestic: 9.31, foreign: 5.96, total: 15.27, domPct: 61, forPct: 39, change: 3.32 },
  { month: 'Jul 2025', domestic: 9.26, foreign: 4.77, total: 14.03, domPct: 66, forPct: 34, change: -8.12 },
  { month: 'Aug 2025', domestic: 12.55, foreign: 7.69, total: 20.24, domPct: 62, forPct: 38, change: 44.26 },
  { month: 'Sep 2025', domestic: 14.41, foreign: 9.61, total: 24.02, domPct: 60, forPct: 40, change: 18.68 },
  { month: 'Oct 2025', domestic: 17.54, foreign: 7.52, total: 25.06, domPct: 70, forPct: 30, change: 4.33 },
  { month: 'Nov 2025', domestic: 15.27, foreign: 7.87, total: 23.14, domPct: 66, forPct: 34, change: -7.66 },
  { month: 'Dec 2025', domestic: 19.03, foreign: 8.16, total: 27.19, domPct: 70, forPct: 30, change: 17.50 },
  { month: 'Jan 2026', domestic: 24.09, foreign: 10.82, total: 34.91, domPct: 69, forPct: 31, change: 28.39 },
  { month: 'Feb 2026', domestic: 22.50, foreign: 10.50, total: 33.00, domPct: 68, forPct: 32, change: -5.47 },
];

const advInvestorTypeData = [
  { month: 'Mar 2025', retail: 6.5, corporate: 1.2, finInst: 3.5, secCo: 1.5, otherInst: 1.15, total: 13.85, retailPct: 47, corpPct: 9, finPct: 25, secPct: 11, otherPct: 8, change: 0 },
  { month: 'Apr 2025', retail: 6.0, corporate: 1.1, finInst: 3.2, secCo: 1.4, otherInst: 1.26, total: 12.96, retailPct: 46, corpPct: 8, finPct: 25, secPct: 11, otherPct: 10, change: -6.43 },
  { month: 'May 2025', retail: 7.2, corporate: 1.3, finInst: 3.8, secCo: 1.6, otherInst: 0.88, total: 14.78, retailPct: 49, corpPct: 9, finPct: 26, secPct: 11, otherPct: 6, change: 14.04 },
  { month: 'Jun 2025', retail: 7.5, corporate: 1.4, finInst: 3.9, secCo: 1.7, otherInst: 0.77, total: 15.27, retailPct: 49, corpPct: 9, finPct: 26, secPct: 11, otherPct: 5, change: 3.32 },
  { month: 'Jul 2025', retail: 7.0, corporate: 1.2, finInst: 3.6, secCo: 1.5, otherInst: 0.73, total: 14.03, retailPct: 50, corpPct: 9, finPct: 26, secPct: 11, otherPct: 5, change: -8.12 },
  { month: 'Aug 2025', retail: 10.5, corporate: 1.8, finInst: 5.2, secCo: 2.1, otherInst: 0.64, total: 20.24, retailPct: 52, corpPct: 9, finPct: 26, secPct: 10, otherPct: 3, change: 44.26 },
  { month: 'Sep 2025', retail: 12.0, corporate: 2.2, finInst: 6.5, secCo: 2.5, otherInst: 0.82, total: 24.02, retailPct: 50, corpPct: 9, finPct: 27, secPct: 10, otherPct: 3, change: 18.68 },
  { month: 'Oct 2025', retail: 14.5, corporate: 2.5, finInst: 5.5, secCo: 1.8, otherInst: 0.76, total: 25.06, retailPct: 58, corpPct: 10, finPct: 22, secPct: 7, otherPct: 3, change: 4.33 },
  { month: 'Nov 2025', retail: 12.5, corporate: 2.1, finInst: 5.8, secCo: 2.0, otherInst: 0.74, total: 23.14, retailPct: 54, corpPct: 9, finPct: 25, secPct: 9, otherPct: 3, change: -7.66 },
  { month: 'Dec 2025', retail: 15.0, corporate: 2.8, finInst: 6.2, secCo: 2.4, otherInst: 0.79, total: 27.19, retailPct: 55, corpPct: 10, finPct: 23, secPct: 9, otherPct: 3, change: 17.50 },
  { month: 'Jan 2026', retail: 20.5, corporate: 3.5, finInst: 8.2, secCo: 1.8, otherInst: 0.91, total: 34.91, retailPct: 59, corpPct: 10, finPct: 23, secPct: 5, otherPct: 3, change: 28.39 },
  { month: 'Feb 2026', retail: 19.5, corporate: 3.2, finInst: 7.8, secCo: 1.7, otherInst: 0.80, total: 33.00, retailPct: 59, corpPct: 10, finPct: 24, secPct: 5, otherPct: 2, change: -5.47 },
];

const leaderboardData = [
    [1, "Grace Hopper", formatCurrency(3.5e12), formatCurrency(18e9), 15, 500],
    [2, "Henry Ford", formatCurrency(3.2e12), formatCurrency(16e9), 12, 450],
    [3, "Ivy Lee", formatCurrency(2.8e12), formatCurrency(14e9), 10, 400],
];

const DetailInstitutionalBusiness: React.FC<DetailInstitutionalBusinessProps> = ({ onSalespersonClick }) => {
    const dailyVolumeTrend = useMemo(() => generateDailyBarLine(80e9), []);
    const dailyClientTrend = useMemo(() => generateDailyClientLineTrend(180, 2), []);
    const dailyRevenueTrend = useMemo(() => generateDailyBarLine(400e6), []);

    const [startDate, setStartDate] = useState<DateSelection>({ month: 'Jan', year: '2026' });
    const [endDate, setEndDate] = useState<DateSelection>({ month: 'Jun', year: '2026' });

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => <DetailKPICard key={kpi.label} data={kpi} />)}
            </div>

            {/* Daily Trends Section - Changed to 1x3 (1 chart each row) format */}
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
                    <MonthlyTrendChart data={volumeTrendData} dataKey1="Transaction Volume" trendKey="Change" title="Monthly Transaction Volume Trend (MoM)" isCurrency={true} />
                    <ConcentrationChart data={concentrationData} title='Monthly Client Concentration (Top 10 Contributors by Transaction Value)' />
                    <ClientTrendChart 
                        data={clientTrendData}
                        title="Monthly New Client Acquisition vs. Total Client"
                    />
                    <MonthlyTrendChart data={revenueTrendData} dataKey1="Revenue" trendKey="Change" title="Monthly Total Revenue Trend (MoM)" isCurrency={true} />
                    <div className="lg:col-span-2">
                        <ADVCombinedBreakdown 
                            domesticData={advBreakdownData}
                            investorTypeData={advInvestorTypeData}
                            title="Average Daily Value - Breakdown by Investor"
                            subtitle="In IDR Billion"
                            note="Note: Percentages represent value share of total ADV on IDX stock market. Other Institutions include Insurance, Pension Fund, Foundation, and Others."
                        />
                    </div>
                </div>
            </section>

            <DataTable 
              title="Leaderboard Sales/Dealer (Institutional Business)" 
              columns={["Ranking", "Sales/Dealer", "Transaction Volume", "Total Revenue (Fee)", "Active Clients", "Total Transactions"]} 
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

export default DetailInstitutionalBusiness;
