
import React, { useState, useMemo } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { formatCurrency } from '../components/Shared';

const mockData2025 = [
  { quarter: "Q1", revenue: 213702761772, expense: 16573433742, income: 20808334979, target: 18000000000 },
  { quarter: "Q2", revenue: 218259131495, expense: 12998909421, income: 27888927920, target: 21600000000 },
  { quarter: "Q3", revenue: 210633126185, expense: 14793572452, income: 34420894833, target: 27000000000 },
  { quarter: "Q4", revenue: 184770076776, expense: 15991879445, income: 23445189263, target: 25200000000 },
];

const ProfitLossQuarterly: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  const data = useMemo(() => {
    const mult = 1 + (parseInt(selectedYear) - 2025) * 0.05;
    return mockData2025.map(d => {
        const currentIncome = d.income * mult;
        const currentTarget = d.target * mult;
        return {
            ...d,
            revenue: d.revenue * mult,
            expense: d.expense * mult,
            income: currentIncome,
            target: currentTarget,
            achievement: (currentIncome / currentTarget) * 100
        };
    });
  }, [selectedYear]);

  const totals = useMemo(() => {
    const res = data.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      expense: acc.expense + curr.expense,
      income: acc.income + curr.income,
      target: acc.target + curr.target,
      achievementSum: acc.achievementSum + curr.achievement
    }), { revenue: 0, expense: 0, income: 0, target: 0, achievementSum: 0 });
    const count = data.length || 1;
    
    return {
        ...res,
        achievement: (res.income / res.target) * 100,
        avgRevenue: res.revenue / count,
        avgExpense: res.expense / count,
        avgIncome: res.income / count,
        avgTarget: res.target / count,
        avgAchievement: res.achievementSum / count
    };
  }, [data]);

  const formatIDR = (val: number) => {
    return formatCurrency(val);
  };

  const formatBillion = (val: number) => {
    return formatCurrency(val);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header with Year Filter */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-[#2e3a59] tracking-tight">Quarterly Performance</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase">Financial performance breakdown by quarter - {selectedYear}</p>
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
               className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-bold text-[#4a5568] min-w-[110px] justify-between"
             >
               <span>{selectedYear}</span>
               <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
               </svg>
             </button>

             {isDropdownOpen && (
               <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
                 {years.map((year) => (
                   <button
                     key={year}
                     onClick={() => {
                       setSelectedYear(year);
                       setIsDropdownOpen(false);
                     }}
                     className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${selectedYear === year ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-gray-50'}`}
                   >
                     <span>{year}</span>
                   </button>
                 ))}
               </div>
             )}
           </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Total Revenue</p>
           <p className="text-3xl font-black text-[#1e293b] mb-1">{formatBillion(totals.revenue)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Total Expense</p>
           <p className="text-3xl font-black text-[#1e293b] mb-1">{formatBillion(totals.expense)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Income Before Tax</p>
           <p className="text-3xl font-black text-[#f97316] mb-1">{formatBillion(totals.income)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Achievement</p>
           <div className="flex items-center space-x-2">
             <p className="text-3xl font-black text-[#f97316] mb-1">{totals.achievement.toFixed(2)}%</p>
             <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
           </div>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">vs Target</p>
        </div>
      </div>

      {/* Trend Charts Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">P/L Quarterly Trend - {selectedYear}</h3>
        </div>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} formatter={(v: number) => formatIDR(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#gradRevenue)" animationDuration={1500} />
              <Area type="monotone" dataKey="income" stroke="#ea580c" strokeWidth={3} fill="none" animationDuration={1500} />
              <Area type="monotone" dataKey="expense" stroke="#0ea5e9" strokeWidth={2} fill="none" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Quarterly Breakdown - {selectedYear}</h3>
        </div>
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => formatIDR(v)} />
                    <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} name="Revenue" />
                    <Bar dataKey="expense" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Expense" />
                    <Bar dataKey="income" fill="#ea580c" radius={[6, 6, 0, 0]} name="Income" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly Details Table Section */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Quarterly Details - {selectedYear}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-bold text-gray-500">
                <th className="pb-6">Quarter</th>
                <th className="pb-6 text-right">Revenue</th>
                <th className="pb-6 text-right">Expense</th>
                <th className="pb-6 text-right">Income Before Tax</th>
                <th className="pb-6 text-right">Target</th>
                <th className="pb-6 text-right">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row) => (
                <tr key={row.quarter} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 text-sm font-bold text-[#4a5568]">{row.quarter} {selectedYear}</td>
                  <td className="py-5 text-sm font-semibold text-slate-500 text-right">{formatIDR(row.revenue)}</td>
                  <td className="py-5 text-sm font-semibold text-slate-500 text-right">{formatIDR(row.expense)}</td>
                  <td className="py-5 text-sm font-black text-[#f97316] text-right">{formatIDR(row.income)}</td>
                  <td className="py-5 text-sm font-semibold text-slate-500 text-right">{formatIDR(row.target)}</td>
                  <td className={`py-5 text-sm font-black text-right ${row.achievement >= 100 ? 'text-green-500' : 'text-red-500'}`}>
                    {row.achievement.toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-100 bg-slate-50/30">
                <td className="py-8 text-base font-black text-slate-900">Total {selectedYear}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.revenue)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.expense)}</td>
                <td className="py-8 text-base font-black text-[#f97316] text-right">{formatIDR(totals.income)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right"></td>
                <td className="py-8 text-base font-black text-green-500 text-right"></td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-8 text-base font-black text-slate-900">Average</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.avgRevenue)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.avgExpense)}</td>
                <td className="py-8 text-base font-black text-[#f97316] text-right">{formatIDR(totals.avgIncome)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.avgTarget)}</td>
                <td className="py-8 text-base font-black text-green-500 text-right">{totals.avgAchievement.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossQuarterly;
