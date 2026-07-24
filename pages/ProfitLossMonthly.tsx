
import React, { useState, useMemo } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../components/Shared';

const mockData2025 = [
  { month: "January", revenue: 39525207675, expense: 14112572596, income: 10075940621 },
  { month: "February", revenue: 35569768945, expense: 17018115824, income: 8098651936 },
  { month: "March", revenue: 41734898055, expense: 18321806910, income: 6169989396 },
  { month: "April", revenue: 42685864767, expense: 15938608286, income: 11854142478 },
  { month: "May", revenue: 38704009932, expense: 15822131426, income: 11166305086 },
  { month: "June", revenue: 54442421595, expense: 16803508837, income: 18714612145 },
  { month: "July", revenue: 69483126175, expense: 17712743916, income: 25805591913 },
  { month: "August", revenue: 65661158089, expense: 19854156117, income: 24858287615 },
  { month: "September", revenue: 83891177295, expense: 20544955911, income: 33167777573 },
  { month: "October", revenue: 100643492391, expense: 20901190759, income: 56136684236 },
  { month: "November", revenue: 70194325527, expense: 21977985628, income: 27352705455 },
  { month: "December", revenue: 68457196109, expense: 23237022523, income: 19855962929 },
];

const ProfitLossMonthly: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  const data = useMemo(() => {
    const mult = 1 + (parseInt(selectedYear) - 2025) * 0.1;
    return mockData2025.map(d => ({
      ...d,
      revenue: d.revenue * mult,
      expense: d.expense * mult,
      income: d.income * mult,
      shortMonth: d.month.substring(0, 3)
    }));
  }, [selectedYear]);

  const totals = useMemo(() => {
    const res = data.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      expense: acc.expense + curr.expense,
      income: acc.income + curr.income
    }), { revenue: 0, expense: 0, income: 0 });
    const count = data.length || 1;

    return {
      ...res,
      avgRevenue: res.revenue / count,
      avgExpense: res.expense / count,
      avgIncome: res.income / count,
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
      {/* Year Filter Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-[#2e3a59] tracking-tight">Monthly Profit & Loss</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase">Detailed monthly breakdown for Statement Year {selectedYear}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-sm font-semibold text-gray-500 mb-2">Total Revenue</p>
           <p className="text-3xl font-black text-[#1e293b] mb-1">{formatBillion(totals.revenue)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-sm font-semibold text-gray-500 mb-2">Total Expense</p>
           <p className="text-3xl font-black text-[#1e293b] mb-1">{formatBillion(totals.expense)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
           <p className="text-sm font-semibold text-gray-500 mb-2">Income Before Tax</p>
           <p className="text-3xl font-black text-[#f97316] mb-1">{formatBillion(totals.income)}</p>
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{selectedYear} Annual</p>
        </div>
      </div>

      {/* Area Chart Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">P/L Monthly Trend - {selectedYear}</h3>
        </div>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="shortMonth" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} 
                tickFormatter={(v) => formatCurrency(v)} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '16px' }} 
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(v: number) => formatIDR(v)}
              />
              {/* Revenue: Top Orange Line/Area */}
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#gradRevenue)" 
                animationDuration={1500}
              />
              {/* Income: Lower Orange Line/Area */}
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#f97316" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#gradIncome)" 
                animationDuration={1500}
              />
              {/* Expense: Blue Line/Area */}
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#gradExpense)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Details Table Section */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-[#f97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Monthly Details - {selectedYear}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-bold text-gray-500">
                <th className="pb-6 w-1/4">Month</th>
                <th className="pb-6 text-right w-1/4">Revenue</th>
                <th className="pb-6 text-right w-1/4">Expense</th>
                <th className="pb-6 text-right w-1/4">Income Before Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row) => (
                <tr key={row.month} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 text-sm font-bold text-[#4a5568]">{row.month} {selectedYear}</td>
                  <td className="py-5 text-sm font-semibold text-slate-500 text-right">{formatIDR(row.revenue)}</td>
                  <td className="py-5 text-sm font-semibold text-slate-500 text-right">{formatIDR(row.expense)}</td>
                  <td className="py-5 text-sm font-black text-[#f97316] text-right">{formatIDR(row.income)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-100">
                <td className="py-8 text-base font-black text-slate-900">Grand Total</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.revenue)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.expense)}</td>
                <td className="py-8 text-base font-black text-[#f97316] text-right">{formatIDR(totals.income)}</td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-8 text-base font-black text-slate-900">Average</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.avgRevenue)}</td>
                <td className="py-8 text-base font-black text-slate-900 text-right">{formatIDR(totals.avgExpense)}</td>
                <td className="py-8 text-base font-black text-[#f97316] text-right">{formatIDR(totals.avgIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossMonthly;
