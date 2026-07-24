
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
  Cell
} from 'recharts';
import { ChevronDownIcon, CalendarIcon } from '../components/Icons';

interface FunnelStage {
  step: number;
  name: string;
  total: number;
  continueVal: number;
  dropVal: number;
  continuePct: string;
  dropPct: string;
}

const funnelData: FunnelStage[] = [
  { step: 1, name: 'Total Leads', total: 13205, continueVal: 10260, dropVal: 2945, continuePct: '77.7%', dropPct: '22.3%' },
  { step: 2, name: 'Step Document', total: 10264, continueVal: 9053, dropVal: 1211, continuePct: '88.2%', dropPct: '11.8%' },
  { step: 3, name: 'Step Data Profile', total: 9050, continueVal: 8652, dropVal: 398, continuePct: '95.6%', dropPct: '4.4%' },
  { step: 4, name: 'Step Data Bank', total: 8650, continueVal: 8399, dropVal: 251, continuePct: '97.1%', dropPct: '2.9%' },
  { step: 5, name: 'Step Data Occupation', total: 8400, continueVal: 8198, dropVal: 202, continuePct: '97.6%', dropPct: '2.4%' },
  { step: 6, name: 'Completed', total: 8201, continueVal: 8201, dropVal: 0, continuePct: '100.0%', dropPct: '0.0%' },
];

const BreakdownCard: React.FC<{ stage: FunnelStage }> = ({ stage }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
          {stage.step}
        </div>
        <h4 className="text-base font-bold text-slate-700">{stage.name}</h4>
      </div>
      <div className="flex items-center space-x-6 text-[13px] font-bold">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Total:</span>
          <span className="text-slate-800">{stage.total.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Continue:</span>
          <span className="text-slate-800">{stage.continuePct}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Drop:</span>
          <span className="text-red-500">{stage.dropPct}</span>
        </div>
      </div>
    </div>
    {/* Segmented Progress Bar */}
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
      <div 
        className="h-full bg-black transition-all duration-1000" 
        style={{ width: stage.continuePct }}
      />
      <div 
        className="h-full bg-[#f87171] transition-all duration-1000" 
        style={{ width: stage.dropPct }}
      />
    </div>
  </div>
);

const OnboardingCustomerFunnel: React.FC = () => {
  const [platform, setPlatform] = useState('Web Based');
  const [year, setYear] = useState('2025');

  // Reverse data for chart so "Total Leads" is at the top
  const chartData = [...funnelData].reverse();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg mt-1">
             <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2e3a59] tracking-tight">Customer Journey Funnel</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">Analyze drop-off rates at each onboarding step</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border-2 border-orange-500 shadow-sm cursor-pointer transition-all">
            <span className="text-[13px] font-bold text-slate-700">{platform}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all">
            <span className="text-[13px] font-bold text-slate-700">{year}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Main Chart Card */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-700 mb-10">{platform} - Continue vs Drop per Stage</h3>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                domain={[0, 14000]} 
                ticks={[0, 3500, 7000, 10500, 14000]}
                axisLine={false}
                tickLine={false}
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="rect"
                wrapperStyle={{ paddingTop: '30px', fontSize: '13px', fontWeight: 'bold' }}
              />
              <Bar dataKey="continueVal" name="Continue" stackId="a" fill="black" barSize={32} />
              <Bar dataKey="dropVal" name="Drop" stackId="a" fill="#f87171" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown List Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 px-1">Stage-by-Stage Breakdown</h3>
        <div className="space-y-4">
          {funnelData.map((stage) => (
            <BreakdownCard key={stage.step} stage={stage} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingCustomerFunnel;
