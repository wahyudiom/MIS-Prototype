
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { 
  UserGroupIcon, 
  UserIcon, 
  UserXIcon, 
  DocumentIcon, 
  CalendarIcon, 
  ChevronDownIcon,
  ClockIcon
} from '../components/Icons';

const completionTrendData = [
  { month: 'July', web: 63, mstock: 53 },
  { month: 'August', web: 61, mstock: 48 },
  { month: 'September', web: 63, mstock: 51 },
  { month: 'October', web: 64, mstock: 54 },
  { month: 'November', web: 62, mstock: 52 },
  { month: 'December', web: 64, mstock: 55 },
];

const rejectionTrendData = [
  { month: 'July', kyc: 16 },
  { month: 'August', kyc: 18.2 },
  { month: 'September', kyc: 16 },
  { month: 'October', kyc: 16 },
  { month: 'November', kyc: 17.1 },
  { month: 'December', kyc: 16 },
];

const funnelData = [
  { name: 'Total Leads', continue: 10260, drop: 2945 },
  { name: 'Step Document', continue: 9053, drop: 1211 },
  { name: 'Step Data Profile', continue: 8652, drop: 398 },
  { name: 'Step Data Bank', continue: 8399, drop: 251 },
  { name: 'Step Data Occupation', continue: 8198, drop: 202 },
  { name: 'Completed', continue: 8201, drop: 0 },
].reverse();

const slaTrendData = [
  { month: 'July', submit: 3.2, ready: 34.5 },
  { month: 'August', submit: 3.1, ready: 36.2 },
  { month: 'September', submit: 3.2, ready: 36.8 },
  { month: 'October', submit: 3.3, ready: 36.3 },
  { month: 'November', submit: 3.2, ready: 35.8 },
  { month: 'December', submit: 3.1, ready: 39.2 },
];

const KPICard: React.FC<{ 
  label: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  color: string;
}> = ({ label, value, subtitle, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{subtitle}</p>
    </div>
  </div>
);

const PlatformComparisonCard: React.FC<{
  title: string;
  leads: string;
  completed: string;
  rate: string;
  color: string;
}> = ({ title, leads, completed, rate, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 flex-1">
    <h4 className="text-sm font-black text-slate-700 mb-6">{title}</h4>
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-400">Total Leads</span>
        <span className="font-bold text-slate-800">{leads}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-400">Completed</span>
        <span className="font-bold text-slate-800">{completed}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-400">Completion Rate</span>
        <span className={`font-black ${color}`}>{rate}</span>
      </div>
    </div>
    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ease-out`}
        style={{ width: rate, backgroundColor: color.includes('orange') ? '#f97316' : '#1e293b' }}
      />
    </div>
  </div>
);

const OnboardingOverview: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-[#2e3a59] tracking-tight">Onboarding Process</h2>
          <p className="text-sm font-medium text-gray-400 mt-0.5">Monitor customer onboarding performance and drop-off rates</p>
        </div>
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
            <span className="text-sm font-bold text-slate-700">YTD</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
            <span className="text-sm font-bold text-slate-700">2025</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard 
          label="Total Leads" 
          value="70,314" 
          subtitle="Web: 41,205 | MSTOCK: 29,109" 
          icon={<UserGroupIcon className="w-5 h-5" />} 
          color="text-orange-500"
        />
        <KPICard 
          label="Completion Rate" 
          value="57.6%" 
          subtitle="Web: 62.86% | MSTOCK: 52.3%" 
          icon={<UserIcon className="w-5 h-5" />} 
          color="text-slate-800"
        />
        <KPICard 
          label="KYC Rejection" 
          value="17%" 
          subtitle="8,625 of 52,221 activities" 
          icon={<UserXIcon className="w-5 h-5" />} 
          color="text-red-500"
        />
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completion Rate Trend */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-10">
            <UserIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-700">Completion Rate Trend</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                <YAxis domain={[40, 70]} ticks={[40, 48, 56, 70]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="web" name="Web Based" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316', stroke: '#f97316' }} />
                <Line type="monotone" dataKey="mstock" name="MSTOCK" stroke="transparent" strokeWidth={0} dot={{ r: 4, fill: '#1e293b', stroke: '#1e293b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KYC Rejection Trend */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-10">
            <UserXIcon className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-slate-700">KYC Rejection Trend</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rejectionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                <YAxis domain={[10, 30]} ticks={[10, 15, 20, 25, 30]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="kyc" name="KYC Rejection" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444', stroke: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="grid grid-cols-1 gap-8">
        {/* Customer Funnel */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-10">
            <DocumentIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold text-slate-700">Customer Journey Funnel (Web Based)</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 14000]} ticks={[0, 3500, 7000, 10500, 14000]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="rect" wrapperStyle={{ paddingTop: '30px', fontSize: '13px', fontWeight: 'bold' }} />
                <Bar dataKey="continue" name="Continue" stackId="a" fill="#1e293b" barSize={24} />
                <Bar dataKey="drop" name="Drop" stackId="a" fill="#f87171" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA Trend */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold text-slate-700">SLA Trend - Time to Complete Onboarding</h3>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 font-medium">Avg. Time to Submit:</span>
              <span className="font-black text-orange-500">3.2 hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 font-medium">Avg. Time to Account Ready:</span>
              <span className="font-black text-sky-400">36.3 hours</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-600">All Months</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slaTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReady" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
              <YAxis domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="submit" name="Time to Submit" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmit)" />
              <Area type="monotone" dataKey="ready" name="Time to Account Ready" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorReady)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Comparison */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800">Platform Comparison - YTD 2025</h3>
        <div className="flex flex-col lg:flex-row gap-6">
          <PlatformComparisonCard 
            title="Web Based" 
            leads="41,205" 
            completed="25,901" 
            rate="62.86%" 
            color="text-[#f97316]"
          />
          <PlatformComparisonCard 
            title="MSTOCK" 
            leads="29,109" 
            completed="15,224" 
            rate="52.3%" 
            color="text-[#f97316]"
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverview;
