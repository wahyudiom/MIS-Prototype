
import React from 'react';
import type { WidgetData } from '../types';
import { View } from '../types';
import { formatCurrency, formatNumber } from '../components/Shared';

interface WidgetProps {
  data: WidgetData;
  setView: (view: View) => void;
}

const Widget: React.FC<WidgetProps> = ({ data, setView }) => {
  const renderTrend = (trend?: number) => {
    if (trend === undefined) return null;

    const isPositive = trend >= 0;

    return (
      <span className={`ml-1.5 whitespace-nowrap text-[11px] font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(trend).toFixed(2)}%
      </span>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 h-full min-h-[220px]"
      onClick={() => setView(data.id)}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-900 text-sm md:text-base leading-tight truncate">{data.title}</h3>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight mt-1 truncate">{data.subtitle}</p>
        </div>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${data.bgColor} ml-4`}>
            <span className={`text-[11px] font-black ${data.color}`}>
                {data.initials}
            </span>
        </div>
      </div>
      
      {/* Main Metric Area - Responsive Font Size optimized for 3-column layout */}
      <div className="flex-1 flex flex-col justify-center mb-8 overflow-hidden">
        <div className="flex min-w-0 items-baseline">
          <p
            className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 leading-none tracking-tighter truncate"
            title={data.fixedIncomeBreakdown ? `Online & Offline Transaction Volume YTD\nOnline Transaction Volume: ${data.fixedIncomeBreakdown.channels[0]?.volume}\nOffline Transaction Volume: ${data.fixedIncomeBreakdown.channels[1]?.volume}\nCombined Total: ${data.mainMetric}` : data.mainMetric}
          >
              {data.mainMetric}
          </p>
          {renderTrend(data.mainMetricTrend)}
        </div>
        <p className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2 truncate">{data.mainMetricLabel}</p>
      </div>

      {data.fixedIncomeBreakdown ? (
        <div className="pt-4 border-t border-gray-50 flex justify-between gap-4 overflow-hidden">
          {data.fixedIncomeBreakdown.channels.map((channel, index) => (
            <div key={channel.label} className={`flex-1 min-w-0 ${index === 1 ? 'text-right' : ''}`}>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{channel.label} Total Transaction Volume</p>
              <div
                className={`mt-0.5 flex min-w-0 items-baseline ${index === 1 ? 'justify-end' : ''}`}
                title={`${channel.label} Total Transaction Volume\nSelected period/YTD: ${channel.volume}\nGrowth: ${channel.growth.toFixed(2)}%`}
              >
                <p className="text-sm xl:text-base font-black text-slate-700 truncate">{channel.volume}</p>
                {renderTrend(channel.growth)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Footer Metrics Row */}
          <div className="pt-4 border-t border-gray-50 flex justify-between gap-4 overflow-hidden">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{data.secondaryMetricLabel}</p>
              <div className="mt-0.5 flex min-w-0 items-baseline">
                <p className="text-sm xl:text-base font-black text-slate-700 truncate" title={data.secondaryMetric}>{data.secondaryMetric}</p>
                {renderTrend(data.secondaryMetricTrend)}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{data.targetMetricLabel}</p>
              <div className="mt-0.5 flex min-w-0 items-baseline justify-end">
                <p className="text-sm xl:text-base font-black text-slate-700 truncate" title={data.targetMetric}>{data.targetMetric}</p>
                {renderTrend(data.targetMetricTrend)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


const dashboardData: WidgetData[] = [
    {
        id: View.DetailInvestmentSpecialist,
        title: 'Investment Specialist',
        subtitle: 'Retail Performance',
        mainMetric: formatCurrency(560e9),
        mainMetricLabel: 'Transaction Value YTD',
        mainMetricTrend: 8.7,
        secondaryMetric: formatNumber(6465),
        secondaryMetricLabel: 'Total New Account YTD',
        secondaryMetricTrend: 12.4,
        targetMetric: formatCurrency(12e9),
        targetMetricLabel: 'Total Revenue YTD',
        targetMetricTrend: 11.3,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        initials: 'IS',
    },
    {
        id: View.DetailInvestmentSolution,
        title: 'Priority Client Services',
        subtitle: 'Asset Value Growth',
        mainMetric: formatCurrency(800e9),
        mainMetricLabel: 'Total Asset Value',
        mainMetricTrend: 7.8,
        secondaryMetric: formatCurrency(35e9),
        secondaryMetricLabel: 'Net Inflow YTD',
        secondaryMetricTrend: 4.2,
        targetMetric: formatCurrency(18e9),
        targetMetricLabel: 'Total Revenue YTD',
        targetMetricTrend: 11.3,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        initials: 'InvS',
    },
    {
        id: View.DetailInstitutionalBusiness,
        title: 'Institutional Business',
        subtitle: 'Transaction Value (Equities)',
        mainMetric: formatCurrency(15e12),
        mainMetricLabel: 'Transaction Value YTD',
        mainMetricTrend: 10.5,
        secondaryMetric: formatNumber(42),
        secondaryMetricLabel: 'Total Institutional Account YTD',
        secondaryMetricTrend: 8.1,
        targetMetric: formatCurrency(75e9),
        targetMetricLabel: 'Total Revenue YTD',
        targetMetricTrend: 11.2,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        initials: 'IB',
    },
    {
        id: View.DetailFixedIncome,
        title: 'Fixed Income',
        subtitle: 'Combined Revenue and Transaction Volume',
        mainMetric: formatCurrency(67e12),
        mainMetricLabel: 'Online & Offline Transaction Volume YTD',
        mainMetricTrend: 8.6,
        secondaryMetric: formatCurrency(25e12),
        secondaryMetricLabel: 'Online Transaction Volume',
        secondaryMetricTrend: 7.8,
        targetMetric: formatCurrency(42e12),
        targetMetricLabel: 'Offline Transaction Volume',
        targetMetricTrend: 9.1,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        initials: 'FI',
        fixedIncomeBreakdown: {
            channels: [
                {
                    label: 'Online',
                    volume: formatCurrency(25e12),
                    growth: 7.8,
                },
                {
                    label: 'Offline',
                    volume: formatCurrency(42e12),
                    growth: 9.1,
                },
            ],
        },
    },
];

interface DashboardProps {
    setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
            <header className="mb-10">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-gray-500 font-medium">Real-time Management Information System Overview</p>
              </div>
            </header>

            {/* Changed from 5 columns to 3 columns on large screens to achieve 3x2 layout for 5 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dashboardData.map(data => (
                    <Widget key={`${data.id}-${data.title}`} data={data} setView={setView} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
