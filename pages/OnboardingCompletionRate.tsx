
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Scatter
} from 'recharts';
import { ChevronDownIcon, CalendarIcon, UserIcon } from '../components/Icons';

const trendData = [
  { month: 'July', web: 63, mstock: 53 },
  { month: 'August', web: 61, mstock: 48 },
  { month: 'September', web: 63, mstock: 51 },
  { month: 'October', web: 64, mstock: 54 },
  { month: 'November', web: 62, mstock: 52 },
  { month: 'December', web: 64, mstock: 55 },
];

const PerformanceCard: React.FC<{ 
  title: string; 
  leads: string; 
  completed: string; 
  rate: string; 
  color: string;
}> = ({ title, leads, completed, rate, color }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
    <h4 className="text-lg font-bold text-slate-700 mb-8">{title}</h4>
    
    <div className="space-y-6 mb-10">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-400">Total Leads</span>
        <span className="text-sm font-bold text-slate-800">{leads}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-400">Completed</span>
        <span className="text-sm font-bold text-slate-800">{completed}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-400">Completion Rate</span>
        <span className={`text-xl font-black ${color}`}>{rate}</span>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ease-out`}
        style={{ width: rate, backgroundColor: color === 'text-[#f97316]' ? '#f97316' : '#1e293b' }}
      />
    </div>
  </div>
);

const SLAKPICard: React.FC<{ label: string; value: string; colorClass?: string }> = ({ label, value, colorClass = "text-slate-800" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-full">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-4">{label}</p>
    <p className={`text-3xl font-black tracking-tight ${colorClass}`}>{value}</p>
  </div>
);

const OnboardingCompletionRate: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg mt-1">
            <UserIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2e3a59] tracking-tight">Completion Rate Analysis</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">Track onboarding completion rates by platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
            <span className="text-sm font-bold text-slate-700">{selectedYear}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SLAKPICard label="Web Based - Leads" value="41,205" />
        <SLAKPICard label="Web Based - Rate" value="62.86%" colorClass="text-[#f97316]" />
        <SLAKPICard label="MSTOCK - Leads" value="29,109" />
        <SLAKPICard label="MSTOCK - Rate" value="52.3%" />
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-700 mb-10">Monthly Completion Rate Trend</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                domain={[40, 70]}
                ticks={[40, 48, 56, 70]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="web" 
                name="Web Based" 
                stroke="#f97316" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#f97316', stroke: '#f97316' }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="mstock" 
                name="MSTOCK" 
                stroke="transparent" 
                strokeWidth={0} 
                dot={{ r: 3, fill: '#1e293b', stroke: '#1e293b' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PerformanceCard 
          title="Web Based Performance"
          leads="41,205"
          completed="25,901"
          rate="62.86%"
          color="text-[#f97316]"
        />
        <PerformanceCard 
          title="MSTOCK Performance"
          leads="29,109"
          completed="15,224"
          rate="52.3%"
          color="text-slate-800"
        />
      </div>
    </div>
  );
};

export default OnboardingCompletionRate;
