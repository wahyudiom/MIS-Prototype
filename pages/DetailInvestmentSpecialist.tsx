import React, { useState, useMemo } from 'react';
import type { DetailKPICardData, MonthlyTrendData, BreakdownData, DailyTrendData } from '../types';
import { 
    DetailKPICard, 
    DataTable, 
    MonthlyTrendChart, 
    BreakdownDonutChart, 
    TrendComposedChart,
    formatCurrency, 
    formatNumber,
    SectionTitle,
    DateRangeSelector,
    DateSelection
} from '../components/Shared';

interface DetailInvestmentSpecialistProps {
  onSalespersonClick: (name: string) => void;
}

const kpiData: DetailKPICardData[] = [
  { 
    label: 'Total New Accounts', 
    valueYTD: formatNumber(1234), 
    valueMTD: formatNumber(112),
    changeYTD: 5.2, 
    changeMTD: 1.1 
  },
  { 
    label: 'Total Activation Rate', 
    valueYTD: '85.4%', 
    valueMTD: '88.1%',
    changeYTD: -1.3, 
    changeMTD: 0.5 
  },
  { 
    label: 'Transaction Volume (Retail)', 
    valueYTD: formatCurrency(5.6e11), 
    valueMTD: formatCurrency(0.8e11),
    changeYTD: 12.1, 
    changeMTD: 2.8 
  },
  { 
    label: 'Total Revenue', 
    valueYTD: formatCurrency(1.2e10), 
    valueMTD: formatCurrency(0.15e10),
    subValue: 'YTD: Fee: 700 Juta, Interest: 500 Juta', 
    changeYTD: 8.5, 
    changeMTD: 1.9 
  },
  { 
    label: 'Total AUM Mutual Funds', 
    valueYTD: formatCurrency(2.1e11), 
    valueMTD: formatCurrency(2.15e11),
  },
];

const generateDailyData = (baseVal: number, lineBase: number): DailyTrendData[] => {
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: baseVal + Math.floor(Math.random() * baseVal * 0.4),
            lineValue: lineBase + (Math.random() * 10 - 5)
        };
    });
};

const generateDailyMutualFundsTrend = (initialAUM: number): DailyTrendData[] => {
    let currentAUM = initialAUM;
    return Array.from({length: 30}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        const dailyFlow = (Math.random() * 5e8) - 1e8;
        currentAUM += dailyFlow;
        return {
            date: d.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}),
            barValue1: currentAUM,
            lineValue: dailyFlow
        };
    });
};

const trendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 90, trend: 70 }, { month: 'Apr 2025', value1: 95, trend: 72 },
  { month: 'May 2025', value1: 100, trend: 75 }, { month: 'Jun 2025', value1: 105, trend: 78 },
  { month: 'Jul 2025', value1: 110, trend: 80 }, { month: 'Aug 2025', value1: 115, trend: 82 },
  { month: 'Sep 2025', value1: 120, trend: 84 }, { month: 'Oct 2025', value1: 125, trend: 85 },
  { month: 'Nov 2025', value1: 130, trend: 87 }, { month: 'Dec 2025', value1: 135, trend: 88 },
  { month: 'Jan 2026', value1: 140, trend: 90 }, { month: 'Feb 2026', value1: 145, trend: 92 },
];

const revenueTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 1.5e9, trend: 2.0 }, { month: 'Apr 2025', value1: 1.6e9, trend: 6.7 },
  { month: 'May 2025', value1: 1.7e9, trend: 6.3 }, { month: 'Jun 2025', value1: 1.8e9, trend: 5.9 },
  { month: 'Jul 2025', value1: 1.9e9, trend: 5.6 }, { month: 'Aug 2025', value1: 2.0e9, trend: 5.3 },
  { month: 'Sep 2025', value1: 2.1e9, trend: 5.0 }, { month: 'Oct 2025', value1: 2.2e9, trend: 4.8 },
  { month: 'Nov 2025', value1: 2.3e9, trend: 4.5 }, { month: 'Dec 2025', value1: 2.4e9, trend: 4.3 },
  { month: 'Jan 2026', value1: 2.5e9, trend: 4.2 }, { month: 'Feb 2026', value1: 2.6e9, trend: 4.0 },
];

const monthlyMutualFundsAccountTrendData: MonthlyTrendData[] = [
  { month: 'Mar 2025', value1: 150e9, trend: 5e9 }, { month: 'Apr 2025', value1: 155e9, trend: 5e9 },
  { month: 'May 2025', value1: 160e9, trend: 5e9 }, { month: 'Jun 2025', value1: 165e9, trend: 5e9 },
  { month: 'Jul 2025', value1: 170e9, trend: 5e9 }, { month: 'Aug 2025', value1: 175e9, trend: 5e9 },
  { month: 'Sep 2025', value1: 180e9, trend: 5e9 }, { month: 'Oct 2025', value1: 192e9, trend: 12e9 },
  { month: 'Nov 2025', value1: 205e9, trend: 13e9 }, { month: 'Dec 2025', value1: 210e9, trend: 5e9 },
  { month: 'Jan 2026', value1: 215e9, trend: 5e9 }, { month: 'Feb 2026', value1: 235e9, trend: 20e9 },
];

const breakdownData: BreakdownData[] = [
  { name: 'Regular', value: 400 }, { name: 'Margin', value: 300 },
  { name: 'Day Trade', value: 180 }, { name: 'Syariah', value: 120 },
];

const portfolioBreakdownData: BreakdownData[] = [
    { name: 'Stocks', value: 2.5e11 },
    { name: 'Bonds', value: 1.8e11 },
    { name: 'Mutual Funds', value: 1.3e11 },
];

const areaManagerData = [
    ["Jakarta 1", 300, '115%', '88%', formatCurrency(1.5e11), formatCurrency(3e9)],
    ["Bandung", 250, '105%', '85%', formatCurrency(1.1e11), formatCurrency(2.5e9)],
    ["Surabaya", 200, '95%', '82%', formatCurrency(0.9e11), formatCurrency(2e9)],
];
const branchSalesData: { [key: string]: any[][] } = {
    "Jakarta 1": [
        ["John Doe", 80, '120%', '90%', formatCurrency(0.5e11), formatCurrency(1e9)],
        ["Jane Smith", 75, '118%', '89%', formatCurrency(0.4e11), formatCurrency(0.8e9)],
    ],
    "Bandung": [
        ["Ahmad Subarjo", 60, '110%', '88%', formatCurrency(0.3e11), formatCurrency(0.6e9)],
    ],
    "Surabaya": [
        ["Budi Santoso", 55, '98%', '85%', formatCurrency(0.25e11), formatCurrency(0.5e9)],
    ],
};

const DetailInvestmentSpecialist: React.FC<DetailInvestmentSpecialistProps> = ({ onSalespersonClick }) => {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<DateSelection>({ month: 'Jan', year: '2026' });
    const [endDate, setEndDate] = useState<DateSelection>({ month: 'Jun', year: '2026' });

    const dailyNewAccountsData = useMemo(() => generateDailyData(10, 85), []);
    const dailyRevenueTrend = useMemo(() => generateDailyData(50000000, 2), []);
    const dailyMutualFundsTrend = useMemo(() => generateDailyMutualFundsTrend(2.1e11), []);

    const handleAreaClick = (rowData: any[]) => {
        const areaName = rowData[0];
        setSelectedArea(areaName === selectedArea ? null : areaName);
    };

    const tableColumns = ["Name", "New Accounts", "% vs. Target", "Activation Rate %", "Transaction Volume", "Revenue"];

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpiData.map((kpi, idx) => (
                  <DetailKPICard 
                    key={kpi.label} 
                    data={kpi} 
                    hideMTD={idx === 4} 
                    hideLabels={idx === 4}
                  />
                ))}
            </div>

            {/* Daily Trends Section */}
            <section>
                <SectionTitle title="DAILY TRENDS" />
                <div className="grid grid-cols-1 gap-6">
                    <TrendComposedChart 
                        data={dailyNewAccountsData} 
                        title="Daily New Account & Activation Trends Last 30 Calendar Days" 
                        barLabel1="New Accounts"
                        lineLabel="Activation Rate (%)"
                        isLinePercentage={true}
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
                        data={dailyRevenueTrend} 
                        title="Daily Total Revenue Trends Last 30 Calendar Days" 
                        barLabel1="Revenue"
                        lineLabel="Change %"
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
                        data={trendData} 
                        dataKey1="New Accounts" 
                        trendKey="Activation Rate (%)" 
                        title="Monthly New Accounts & Activation Trends (MoM)" 
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
                    <MonthlyTrendChart 
                        data={revenueTrendData} 
                        dataKey1="Revenue" 
                        trendKey="Trends (%)"
                        title="Monthly Total Revenue Trends (MoM)" 
                        isCurrency={true} 
                    />
                    <BreakdownDonutChart data={portfolioBreakdownData} title="Portfolio Breakdown" isCurrency />
                    <BreakdownDonutChart data={breakdownData} title="New Account Type Breakdown" />
                </div>
            </section>

            <DataTable 
              title="Performance per Area Manager" 
              columns={tableColumns} 
              data={areaManagerData} 
              onRowClick={handleAreaClick}
              headerAction={
                <DateRangeSelector 
                  start={startDate} 
                  end={endDate} 
                  onStartChange={setStartDate} 
                  onEndChange={setEndDate} 
                />
              }
            />
            {selectedArea && branchSalesData[selectedArea] && (
                <div className="mt-4 animate-fade-in-down">
                     <DataTable 
                        title={`Drill-down: Branch Sales for ${selectedArea}`} 
                        columns={tableColumns} 
                        data={branchSalesData[selectedArea]} 
                        onRowClick={(row) => onSalespersonClick(row[0] as string)}
                     />
                </div>
            )}
        </div>
    );
}

export default DetailInvestmentSpecialist;