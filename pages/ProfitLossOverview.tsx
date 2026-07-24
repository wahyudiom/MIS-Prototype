
import React, { useState, useMemo } from 'react';
import { View } from '../types';
import { AchievementBanner, PNLKPICard, PNLDonutChart, PNLProfitLossFlowChart, PNLRevenueSankeyChart, formatCurrency } from '../components/Shared';

interface ProfitLossOverviewProps {
  setView: (view: View) => void;
}

const ProfitLossOverview: React.FC<ProfitLossOverviewProps> = ({ setView }) => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  // Dynamic multiplier to simulate data changes per year
  const multiplier = useMemo(() => {
    const yearNum = parseInt(selectedYear);
    return 1 + (yearNum - 2024) * 0.08;
  }, [selectedYear]);

  // Derived dynamic data
  const productCommission = useMemo(() => [
    { name: 'Equity', value: 150.2e9 * multiplier },
    { name: 'Mutual Funds', value: 95.8e9 * multiplier },
    { name: 'Bonds', value: 75.4e9 * multiplier },
    { name: 'ETF', value: 45.2e9 * multiplier },
    { name: 'Structured Warrant', value: 35.3e9 * multiplier },
  ], [multiplier]);

  const clientCommission = useMemo(() => [
    { name: 'Institutional', value: 180.4e9 * multiplier },
    { name: 'Retail', value: 120.9e9 * multiplier },
  ], [multiplier]);

  const revenueBreakdown = useMemo(() => [
    { name: 'Brokerage commission', value: 250.4e9 * multiplier },
    { name: "Interest on Broker's Loans", value: 180.2e9 * multiplier },
    { name: 'PI', value: -120.5e9 * multiplier },
    { name: 'IB Revenue', value: 85.7e9 * multiplier },
    { name: 'Fund Sales Revenue', value: -45.2e9 * multiplier },
    { name: 'FI Sales Revenue', value: 28.9e9 * multiplier },
  ], [multiplier]);

  const expenseBreakdown = useMemo(() => {
    const yearOffset = parseInt(selectedYear) - 2024;
    const totalExpense = 457.73e9 * (1 + yearOffset * 0.02);
    const knownExpenses = [
      { name: 'Personnel expenses', value: 150.2e9 * (1 + yearOffset * 0.03) },
      { name: 'Office rental', value: 45.5e9 },
      { name: 'Depreciation', value: 35.8e9 },
      { name: 'Marketing expense', value: 28.4e9 * multiplier },
      { name: 'System maintenance', value: 22.1e9 },
      { name: 'Professional fees', value: 18.5e9 },
    ];
    const knownTotal = knownExpenses.reduce((sum, item) => sum + item.value, 0);
    const otherValue = Math.max(totalExpense - knownTotal, 0);
    const otherExpenseWeights = [
      { name: 'IT Infrastructure', weight: 8.2 },
      { name: 'Legal fees', weight: 6.1 },
      { name: 'Travel & entertainment', weight: 4.5 },
      { name: 'Insurance', weight: 3.8 },
      { name: 'Training & development', weight: 3.2 },
      { name: 'Utilities', weight: 2.9 },
      { name: 'Communication expense', weight: 2.6 },
      { name: 'Office supplies', weight: 2.2 },
      { name: 'Recruitment expense', weight: 1.9 },
      { name: 'Consulting services', weight: 1.7 },
      { name: 'Bank charges', weight: 1.4 },
      { name: 'License & subscription', weight: 1.2 },
      { name: 'Repair & maintenance', weight: 1.0 },
      { name: 'CSR program', weight: 0.8 },
      { name: 'Miscellaneous expense', weight: 0.6 },
    ];
    const otherWeightTotal = otherExpenseWeights.reduce((sum, item) => sum + item.weight, 0);

    return [
      ...knownExpenses,
      {
        name: 'Other',
        value: otherValue,
        children: otherExpenseWeights.map((item) => ({
          name: item.name,
          value: otherValue * (item.weight / otherWeightTotal),
        })),
      },
    ];
  }, [multiplier, selectedYear]);

  const achievementStats = useMemo(() => ({
    percentage: 110 + (parseInt(selectedYear) % 5) * 2.5,
    target: 215 * multiplier,
    actual: (215 * multiplier) * (1.1 + (parseInt(selectedYear) % 3) * 0.05),
    trend: 8 + (parseInt(selectedYear) % 10)
  }), [selectedYear, multiplier]);

  const kpis = useMemo(() => ({
    revenue: 710.99 * multiplier,
    expense: 457.73 * (1 + (parseInt(selectedYear) - 2024) * 0.02),
    income: 253.26 * multiplier,
    fiSales: 103.57 * multiplier
  }), [multiplier, selectedYear]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header Section with Time Filter */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profit and Loss</h1>
          <p className="text-sm font-bold text-gray-400 uppercase mt-1">Statement Year {selectedYear}</p>
        </div>

        <div className="flex items-center space-x-3 relative">
           <div className="text-gray-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
             </svg>
           </div>
           <div className="relative">
             <button 
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 min-w-[100px] justify-between"
             >
               <span>{selectedYear}</span>
               <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
               </svg>
             </button>

             {isDropdownOpen && (
               <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-down py-2">
                 {years.map((year) => (
                   <button
                     key={year}
                     onClick={() => {
                       setSelectedYear(year);
                       setIsDropdownOpen(false);
                     }}
                     className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors ${selectedYear === year ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-gray-50'}`}
                   >
                     <span>{year}</span>
                     {selectedYear === year && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                     )}
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>
      </header>

      {/* Achievement Section */}
      <AchievementBanner 
        percentage={achievementStats.percentage}
        targetAmount={formatCurrency(achievementStats.target * 1e9)}
        actualAmount={formatCurrency(achievementStats.actual * 1e9)}
        trend={achievementStats.trend}
      />

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PNLKPICard label="Total Revenue" value={formatCurrency(kpis.revenue * 1e9)} />
        <PNLKPICard label="Total Expense" value={formatCurrency(kpis.expense * 1e9)} />
        <PNLKPICard label="Income Before Tax" value={formatCurrency(kpis.income * 1e9)} />
        <PNLKPICard label="FI Sales Revenue" value={formatCurrency(kpis.fiSales * 1e9)} />
      </div>

      <PNLProfitLossFlowChart
        revenueData={revenueBreakdown}
        expenseData={expenseBreakdown}
        revenueTotal={kpis.revenue}
        expenseTotal={kpis.expense}
        incomeBeforeTax={kpis.income}
      />

      {/* Donut Charts Grid - Refined responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PNLRevenueSankeyChart 
            title="Revenue Breakdown" 
            data={revenueBreakdown} 
            onClick={() => setView(View.RevenueTrendPage)} 
        />
        <PNLDonutChart 
            title="Expense Breakdown" 
            data={expenseBreakdown} 
            onClick={() => setView(View.ExpenseTrendPage)}
        />
        <PNLDonutChart 
            title="Product Commission Breakdown" 
            data={productCommission} 
            onClick={() => setView(View.ProductCommissionTrend)} 
        />
        <PNLDonutChart
            title="Client Commission Breakdown"
            data={clientCommission}
        />
      </div>
    </div>
  );
};

export default ProfitLossOverview;
