
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    LineChart,
    Line,
    Legend
} from 'recharts';
import { formatCurrency } from '../components/Shared';

const mockData10Years = [
  { year: "2016", revenue: 615736966596, expense: 467038547034, income: 148698419562, achievement: 26.83 },
  { year: "2017", revenue: 701967181054, expense: 516728933113, income: 185238247941, achievement: 29.32 },
  { year: "2018", revenue: 703544860982, expense: 447326342188, income: 256218518794, achievement: 40.46 },
  { year: "2019", revenue: 746698445377, expense: 474057367026, income: 272641078351, achievement: 40.57 },
  { year: "2020", revenue: 923236018742, expense: 647246419734, income: 275989599008, achievement: 33.22 },
  { year: "2021", revenue: 1083637856720, expense: 768263289678, income: 315374567042, achievement: 32.34 },
  { year: "2022", revenue: 1079674863938, expense: 699201645969, income: 380473217969, achievement: 39.16 },
  { year: "2023", revenue: 1005659207837, expense: 750751277558, income: 254907930279, achievement: 28.16 },
  { year: "2024", revenue: 1259938828148, expense: 844514611105, income: 415424217043, achievement: 36.64 },
  { year: "2025", revenue: 1175277752682, expense: 768576003697, income: 406701748985, achievement: 38.45 },
];

const BASELINE_START_YEAR = Number.parseInt(mockData10Years[0].year, 10);
const BASELINE_END_YEAR = Number.parseInt(mockData10Years[mockData10Years.length - 1].year, 10);
const BASELINE_DATA_MAP = new Map(mockData10Years.map((item) => [Number.parseInt(item.year, 10), item]));
const MIN_SELECTABLE_YEAR = 1996;
const MIN_AVAILABLE_YEAR = BASELINE_START_YEAR;
const MAX_RANGE_YEARS = 10;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const generateAnnualPoint = (year: number) => {
  const exactMatch = BASELINE_DATA_MAP.get(year);
  if (exactMatch) {
    return { ...exactMatch, year: year.toString() };
  }

  if (year > BASELINE_END_YEAR) {
    const diff = year - BASELINE_END_YEAR;
    const anchor = mockData10Years[mockData10Years.length - 1];

    return {
      year: year.toString(),
      revenue: Math.round(anchor.revenue * Math.pow(1.035, diff)),
      expense: Math.round(anchor.expense * Math.pow(1.03, diff)),
      income: Math.round(anchor.income * Math.pow(1.04, diff)),
      achievement: Number(clamp(anchor.achievement + diff * 0.72, 18, 52).toFixed(2)),
    };
  }

  const diff = BASELINE_START_YEAR - year;
  const anchor = mockData10Years[0];

  return {
    year: year.toString(),
    revenue: Math.round(anchor.revenue / Math.pow(1.035, diff)),
    expense: Math.round(anchor.expense / Math.pow(1.03, diff)),
    income: Math.round(anchor.income / Math.pow(1.04, diff)),
    achievement: Number(clamp(anchor.achievement - diff * 0.58, 18, 52).toFixed(2)),
  };
};

const ProfitLossAnnually: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const maxSelectableYear = currentYear;
  const defaultStartYear = Math.max(MIN_AVAILABLE_YEAR, maxSelectableYear - 5);
  const initialSelectedYears = Array.from(
    { length: maxSelectableYear - defaultStartYear + 1 },
    (_, index) => defaultStartYear + index
  );

  const [selectedYears, setSelectedYears] = useState<number[]>(initialSelectedYears);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayedDecadeStart, setDisplayedDecadeStart] = useState(Math.floor(maxSelectableYear / 10) * 10);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedYearsAsc = useMemo(() => [...selectedYears].sort((a, b) => a - b), [selectedYears]);
  const selectedYearsDesc = useMemo(() => [...selectedYears].sort((a, b) => b - a), [selectedYears]);
  const selectedYearCount = selectedYears.length;
  const displayedDecadeLabel = `${displayedDecadeStart}-${displayedDecadeStart + 9}`;
  const visibleYears = useMemo(
    () => Array.from({ length: 12 }, (_, index) => displayedDecadeStart - 1 + index),
    [displayedDecadeStart]
  );
  const areSelectedYearsContiguous = useMemo(
    () => selectedYearsAsc.every((year, index) => index === 0 || year - selectedYearsAsc[index - 1] === 1),
    [selectedYearsAsc]
  );

  const selectedYearsLabel = useMemo(() => {
    if (selectedYearsAsc.length === 1) {
      return selectedYearsAsc[0].toString();
    }

    if (areSelectedYearsContiguous) {
      return `${selectedYearsAsc[0]}-${selectedYearsAsc[selectedYearsAsc.length - 1]}`;
    }

    if (selectedYearsAsc.length <= 4) {
      return selectedYearsAsc.join(', ');
    }

    const preview = selectedYearsAsc.slice(0, 3).join(', ');
    return `${preview} +${selectedYearsAsc.length - 3} more`;
  }, [areSelectedYearsContiguous, selectedYearsAsc]);

  const pickerButtonLabel = useMemo(() => {
    if (selectedYearsAsc.length === 1) {
      return selectedYearsAsc[0].toString();
    }

    if (areSelectedYearsContiguous) {
      return `${selectedYearsAsc[0]} → ${selectedYearsAsc[selectedYearsAsc.length - 1]}`;
    }

    return `${selectedYearsAsc.length} years selected`;
  }, [areSelectedYearsContiguous, selectedYearsAsc]);

  useEffect(() => {
    const latestSelectedYear = Math.max(...selectedYearsAsc);
    setDisplayedDecadeStart(Math.floor(latestSelectedYear / 10) * 10);
  }, [selectedYearsAsc]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const selectedData = useMemo(
    () => selectedYearsAsc.map((year) => {
      const point = generateAnnualPoint(year);
      return {
        ...point,
        target: point.achievement > 0 ? Math.round(point.income / (point.achievement / 100)) : 0,
      };
    }),
    [selectedYearsAsc]
  );

  const chartData = selectedData;
  const tableData = useMemo(() => [...selectedData].sort((a, b) => Number(b.year) - Number(a.year)), [selectedData]);

  const totals = useMemo(() => {
    const res = selectedData.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      expense: acc.expense + curr.expense,
      income: acc.income + curr.income,
      target: acc.target + curr.target,
      achievementSum: acc.achievementSum + curr.achievement
    }), { revenue: 0, expense: 0, income: 0, target: 0, achievementSum: 0 });
    const count = selectedData.length || 1;
    
    return {
        ...res,
        avgRevenue: res.revenue / count,
        avgExpense: res.expense / count,
        avgIncome: res.income / count,
        avgTarget: res.target / count,
        avgAchievement: selectedData.length > 0 ? res.achievementSum / selectedData.length : 0
    };
  }, [selectedData]);

  const formatIDR = (val: number) => {
    return formatCurrency(val);
  };

  const formatTrillion = (val: number) => {
    return `${(val / 1e12).toFixed(2)}T`;
  };

  const formatBillionLabel = (val: number) => {
    return formatCurrency(val);
  };

  const openPicker = () => {
    setDisplayedDecadeStart(Math.floor(Math.max(...selectedYearsAsc) / 10) * 10);
    setIsDropdownOpen((prev) => !prev);
  };

  const handleYearToggle = (year: number) => {
    const isSelected = selectedYears.includes(year);

    if (isSelected) {
      if (selectedYears.length === 1) return;
      setSelectedYears((prev) => prev.filter((selectedYear) => selectedYear !== year).sort((a, b) => a - b));
      return;
    }

    if (selectedYears.length >= MAX_RANGE_YEARS) {
      return;
    }

    setSelectedYears((prev) => [...prev, year].sort((a, b) => a - b));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header with Year Range Filter */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-[#2e3a59] tracking-tight">Annual Performance</h1>
          <p className="text-sm font-bold text-gray-400 mt-1">Financial overview for selected year(s): {selectedYearsLabel}</p>
        </div>

        <div ref={pickerRef} className="flex items-center space-x-3 relative">
           <div className="text-gray-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
           </div>
           <div className="relative">
             <button 
               onClick={openPicker}
               className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all text-sm font-bold text-[#4a5568] min-w-[188px] justify-between"
               aria-haspopup="dialog"
               aria-expanded={isDropdownOpen}
             >
               <span>{pickerButtonLabel}</span>
               <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
               </svg>
             </button>

             {isDropdownOpen && (
               <div className="absolute top-full right-0 mt-3 w-[320px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                 <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/80">
                   <div className="flex items-center justify-between">
                     <button
                       onClick={() => setDisplayedDecadeStart((prev) => prev - 10)}
                       className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-blue-600 transition-colors"
                       aria-label="Previous decade"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                       </svg>
                     </button>
                     <div className="text-sm font-black text-slate-700 tracking-tight">{displayedDecadeLabel}</div>
                     <button
                       onClick={() => setDisplayedDecadeStart((prev) => prev + 10)}
                       className="p-2 rounded-lg text-slate-400 hover:bg-white hover:text-blue-600 transition-colors"
                       aria-label="Next decade"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                       </svg>
                     </button>
                   </div>
                 </div>

                 <div className="p-4">
                   <div className="grid grid-cols-3 gap-2">
                     {visibleYears.map((year) => {
                       const isInDecade = year >= displayedDecadeStart && year <= displayedDecadeStart + 9;
                       const hasData = year >= MIN_AVAILABLE_YEAR && year <= maxSelectableYear;
                       const isDisabled = year < MIN_SELECTABLE_YEAR || year > maxSelectableYear || !hasData;
                       const isSelected = selectedYears.includes(year);
                       const maxReached = selectedYears.length >= MAX_RANGE_YEARS && !isSelected;

                       return (
                         <button
                           key={year}
                           onClick={() => {
                             if (isDisabled) return;
                             handleYearToggle(year);
                           }}
                           disabled={isDisabled || maxReached}
                           className={`h-11 rounded-xl text-sm font-black transition-all ${
                             isSelected
                               ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                               : isDisabled
                                 ? 'text-gray-300 cursor-not-allowed'
                                 : maxReached
                                   ? 'text-gray-300 cursor-not-allowed'
                                 : isInDecade
                                   ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                                   : 'text-slate-400 hover:bg-slate-50'
                           }`}
                         >
                           {year}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </header>

      {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
             </div>
             <p className="text-xs font-semibold text-gray-400">{selectedYearCount}-Year Revenue</p>
           </div>
           <p className="text-3xl font-black text-slate-900 mb-1">{formatBillionLabel(totals.revenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
               </svg>
             </div>
             <p className="text-xs font-semibold text-gray-400">{selectedYearCount}-Year Expense</p>
           </div>
           <p className="text-3xl font-black text-slate-900 mb-1">{formatBillionLabel(totals.expense)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
             </div>
             <p className="text-xs font-semibold text-gray-400">{selectedYearCount}-Year Income</p>
           </div>
           <p className="text-3xl font-black text-slate-900 mb-1">{formatBillionLabel(totals.income)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                 <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                 <circle cx="12" cy="12" r="2" fill="currentColor" />
               </svg>
             </div>
             <p className="text-xs font-semibold text-gray-400">Avg Achievement</p>
           </div>
           <p className="text-3xl font-black text-slate-900 mb-1">{totals.avgAchievement.toFixed(2)}%</p>
        </div>
      </div>

      {/* Annual Trend Charts Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-sky-50 rounded-lg">
              <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-[#1e293b]">P/L Annual Trend</h3>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedYearsLabel}</span>
        </div>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevAnn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradExpAnn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradIncAnn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} formatter={(v: number) => formatIDR(v)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#gradRevAnn)" animationDuration={1500} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#gradExpAnn)" animationDuration={1500} />
              <Area type="monotone" dataKey="income" name="Income Before Tax" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#gradIncAnn)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Comparison Charts Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-orange-50 rounded-lg">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Yearly Financial Comparison - {selectedYearsLabel}</h3>
        </div>
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => formatIDR(v)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold' }} />
                    <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} name="Revenue" />
                    <Bar dataKey="expense" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Expense" />
                    <Bar dataKey="income" fill="#ea580c" radius={[6, 6, 0, 0]} name="Income Before Tax" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Achievement Trend Line Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Achievement Trend (%) - {selectedYearsLabel}</h3>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} tickFormatter={(v) => `${v}%`} domain={[0, 60]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Achievement']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="achievement" name="Achievement" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 10-Year Summary Table */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-1.5 bg-slate-50 rounded-lg">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#1e293b]">Year Performance Summary - {selectedYearsLabel}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                <th className="pb-6">Year</th>
                <th className="pb-6 text-right">Revenue</th>
                <th className="pb-6 text-right">Expense</th>
                <th className="pb-6 text-right">Income Before Tax</th>
                <th className="pb-6 text-right">Target</th>
                <th className="pb-6 text-right">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.map((row) => (
                <tr key={row.year} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 text-sm font-bold text-[#4a5568]">{row.year}</td>
                  <td className="py-5 text-sm font-semibold text-orange-600 text-right">{formatBillionLabel(row.revenue)}</td>
                  <td className="py-5 text-sm font-semibold text-red-600 text-right">{formatBillionLabel(row.expense)}</td>
                  <td className="py-5 text-sm font-black text-green-600 text-right">{formatBillionLabel(row.income)}</td>
                  <td className="py-5 text-sm font-bold text-slate-600 text-right">{formatBillionLabel(row.target)}</td>
                  <td className="py-5 text-sm font-bold text-blue-500 text-right">{row.achievement.toFixed(2)}%</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-100 bg-slate-50/30">
                <td className="py-8 text-base font-black text-slate-900">Total</td>
                <td className="py-8 text-base font-black text-orange-600 text-right">{formatBillionLabel(totals.revenue)}</td>
                <td className="py-8 text-base font-black text-red-600 text-right">{formatBillionLabel(totals.expense)}</td>
                <td className="py-8 text-base font-black text-green-600 text-right">{formatBillionLabel(totals.income)}</td>
                <td className="py-8 text-base font-black text-slate-700 text-right"></td>
                <td className="py-8 text-base font-black text-blue-500 text-right"></td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-8 text-base font-black text-slate-900">Average</td>
                <td className="py-8 text-base font-black text-orange-600 text-right">{formatBillionLabel(totals.avgRevenue)}</td>
                <td className="py-8 text-base font-black text-red-600 text-right">{formatBillionLabel(totals.avgExpense)}</td>
                <td className="py-8 text-base font-black text-green-600 text-right">{formatBillionLabel(totals.avgIncome)}</td>
                <td className="py-8 text-base font-black text-slate-700 text-right">{formatBillionLabel(totals.avgTarget)}</td>
                <td className="py-8 text-base font-black text-blue-500 text-right">{totals.avgAchievement.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossAnnually;
