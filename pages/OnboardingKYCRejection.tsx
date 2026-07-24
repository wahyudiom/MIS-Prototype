
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Cell
} from 'recharts';
import { ChevronDownIcon, CalendarIcon, UserXIcon } from '../components/Icons';

interface RejectionReason {
  id: number;
  label: string;
  value: number;
  percentage: string;
}

const monthlyTrendData = [
  { month: 'July', rate: 16 },
  { month: 'August', rate: 18.2 },
  { month: 'September', rate: 16 },
  { month: 'October', rate: 16 },
  { month: 'November', rate: 17.1 },
  { month: 'December', rate: 16 },
];

const rejectionReasons: RejectionReason[] = [
  { id: 1, label: 'Both Selfie & KTP Not Exist', value: 45, percentage: '45%' },
  { id: 2, label: 'KTP Exist & Selfie Not', value: 15, percentage: '15%' },
  { id: 3, label: 'KSEI Reject', value: 10, percentage: '10%' },
  { id: 4, label: 'Document Quality Issue', value: 20, percentage: '20%' },
  { id: 5, label: 'Data Mismatch', value: 10, percentage: '10%' },
];

const SLAKPICard: React.FC<{ label: string; value: string; isAlert?: boolean }> = ({ label, value, isAlert }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-full">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-4">{label}</p>
    <p className={`text-3xl font-black tracking-tight ${isAlert ? 'text-red-500' : 'text-slate-800'}`}>
      {value}
    </p>
  </div>
);

const BreakdownItem: React.FC<{ reason: RejectionReason }> = ({ reason }) => (
  <div className="py-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-400">{reason.id}.</span>
        <span className="text-sm font-bold text-slate-700">{reason.label}</span>
      </div>
      <span className="text-sm font-black text-red-500">{reason.percentage}</span>
    </div>
    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
      <div 
        className="h-full bg-red-500/80 transition-all duration-1000 ease-out" 
        style={{ width: reason.percentage }}
      />
    </div>
  </div>
);

const OnboardingKYCRejection: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-50 rounded-lg mt-1">
            <UserXIcon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2e3a59] tracking-tight">KYC Rejection Analysis</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">Track KYC rejection rates and reasons</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SLAKPICard label="Total Activities" value="52,221" />
        <SLAKPICard label="Total Rejection" value="8,625" isAlert />
        <SLAKPICard label="Rejection Rate" value="17%" isAlert />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-700 mb-10">Monthly KYC Rejection Trend</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
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
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="Rejection Rate (%)"
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Rejection Reasons Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-700 mb-10">Top Rejection Reasons</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[...rejectionReasons].reverse()}
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  domain={[0, 60]} 
                  ticks={[0, 15, 30, 45, 60]}
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                />
                <YAxis 
                  type="category" 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" name="Percentage (%)" fill="#f87171" barSize={32} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown List Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 px-1">Rejection Reasons Breakdown</h3>
        <div className="divide-y divide-gray-50">
          {rejectionReasons.map((reason) => (
            <BreakdownItem key={reason.id} reason={reason} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingKYCRejection;
