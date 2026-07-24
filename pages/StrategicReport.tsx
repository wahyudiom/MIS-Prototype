
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { formatCurrency, formatNumber } from '../components/Shared';
import { TrendingUpIcon, UserGroupIcon, GlobeAltIcon, ChartBarIcon } from '../components/Icons';

interface StrategicReportProps {
  onBack: () => void;
}

const branchComparisonData = [
  { name: 'Inv Specialist', transitionScore: 88, hnwEngagement: 72, volume: 5.6e11 },
  { name: 'PWM', transitionScore: 94, hnwEngagement: 92, volume: 1.2e12 },
  { name: 'Inv Solution', transitionScore: 78, hnwEngagement: 65, volume: 0.8e12 },
  { name: 'Institutional Business', transitionScore: 82, hnwEngagement: 45, volume: 15e12 },
  { name: 'Fixed Income', transitionScore: 91, hnwEngagement: 58, volume: 25e12 },
];

const hnwSegmentData = [
  { name: 'Identified', value: 450, color: '#94a3b8' },
  { name: 'Contacted', value: 310, color: '#3b82f6' },
  { name: 'Engaged', value: 185, color: '#8b5cf6' },
  { name: 'Converted', value: 82, color: '#f59e0b' },
];

const milestones = [
  { date: 'Feb 15, 2026', title: 'Q3 Product Training Completion', status: 'Completed', color: 'bg-green-500' },
  { date: 'Feb 28, 2026', title: 'HNW Engagement Portal Launch', status: 'In Progress', color: 'bg-blue-500' },
  { date: 'Mar 10, 2026', title: 'Strategic Fixed Income Roadshow', status: 'Upcoming', color: 'bg-gray-400' },
  { date: 'Mar 31, 2026', title: 'Q3 Milestone Assessment', status: 'Upcoming', color: 'bg-gray-400' },
];

const CircularProgress: React.FC<{ percentage: number; label: string; sublabel: string; color: string }> = ({ percentage, label, sublabel, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
          <circle 
            cx="48" cy="48" r={radius} 
            stroke={color} 
            strokeWidth="8" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-slate-900">
          {percentage}%
        </div>
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700 text-center">{sublabel}</p>
    </div>
  );
};

const StrategicReport: React.FC<StrategicReportProps> = ({ onBack }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Strategic Report</h2>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-[0.1em] mt-1">Q3 TRANSITION & HNW ENGAGEMENT TRACKER</p>
        </div>
        <div className="flex items-center space-x-4 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Status</span>
           <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse"></span>
              <span className="text-sm font-black text-slate-800">ON TRACK</span>
           </div>
        </div>
      </header>

      {/* Goal Progress Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CircularProgress percentage={84} label="Transition" sublabel="Q3 System Adoption" color="#3b82f6" />
        <CircularProgress percentage={62} label="Engagement" sublabel="HNW Contact Rate" color="#8b5cf6" />
        <CircularProgress percentage={45} label="Conversion" sublabel="FI Cross-Sell Goal" color="#f59e0b" />
        <CircularProgress percentage={91} label="Training" sublabel="Staff Certification" color="#10b981" />
      </section>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Comparative Analysis */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-blue-50 rounded-xl">
                    <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800">Branch Transition Performance</h3>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                 <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div><span>Transition Score</span></div>
                 <div className="flex items-center space-x-1"><div className="w-2.5 h-2.5 bg-purple-400 rounded-sm"></div><span>HNW Engagement</span></div>
              </div>
           </div>
           
           <div className="flex-1 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchComparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="transitionScore" name="Transition Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="hnwEngagement" name="HNW Engagement" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* HNW Engagement Funnel */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
           <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-purple-50 rounded-xl">
                 <UserGroupIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Engagement Funnel</h3>
           </div>
           
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={hnwSegmentData}
                      cx="50%" cy="40%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {hnwSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Performance Insight</p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <p className="text-sm font-bold text-slate-600">PWM branch shows the highest HNW conversion rate (18.4%), while Institutional Business has the largest unidentified pool.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Timeline & Comparison Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
         {/* Strategic Milestones */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-xl font-black text-slate-800 mb-8">Strategic Milestones</h3>
            <div className="space-y-8 relative">
               <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
               {milestones.map((m, idx) => (
                 <div key={idx} className="relative pl-8 group">
                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 z-10 ${m.color}`}></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.date}</p>
                    <h4 className="text-sm font-black text-slate-800 leading-tight">{m.title}</h4>
                    <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 uppercase">{m.status}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Branch Comparative Matrix */}
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden">
            <h3 className="text-xl font-black text-slate-800 mb-8">Branch Comparative Matrix</h3>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="border-b border-gray-100">
                     <tr className="text-left">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">T-Score</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">HNW Eng%</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Volume Contrib</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {branchComparisonData.map((row) => (
                        <tr key={row.name} className="group hover:bg-gray-50/50 transition-colors">
                           <td className="py-5">
                              <span className="text-sm font-black text-slate-700">{row.name}</span>
                           </td>
                           <td className="py-5 text-center">
                              <span className={`text-sm font-black px-3 py-1 rounded-lg ${row.transitionScore >= 90 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                 {row.transitionScore}%
                              </span>
                           </td>
                           <td className="py-5 text-center">
                              <div className="w-24 mx-auto bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                 <div 
                                    className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${row.hnwEngagement}%` }}
                                 ></div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 mt-1 inline-block">{row.hnwEngagement}%</span>
                           </td>
                           <td className="py-5 text-right">
                              <span className="text-sm font-bold text-slate-600">{formatCurrency(row.volume)}</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StrategicReport;
