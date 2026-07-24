
import React, { useState, useMemo, useEffect } from 'react';
import { 
  formatCurrency, 
  formatNumber, 
  DateRangeSelector,
  DateSelection,
  MonthlyTrendChart,
  ClientTrendChart
} from '../components/Shared';
import { ArrowLeftIcon } from '../components/Icons';

interface SalespersonDetailsProps {
  name: string;
  onBack: () => void;
}

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ALL_YEARS = ["2024", "2025", "2026"];

// Custom KPI Card component to match the screenshot's specific layout
const SalespersonKPICard: React.FC<{
  label: string;
  value: string;
  mtdValue?: string;
  showYTDLabel?: boolean;
  isLarge?: boolean;
}> = ({ label, value, mtdValue, showYTDLabel, isLarge }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[180px]">
    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-4">{label}</p>
    
    <div className="flex-1 flex flex-col justify-center">
      {showYTDLabel && <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">YTD</p>}
      <p className={`${isLarge ? 'text-5xl' : 'text-[32px]'} font-black text-slate-900 leading-tight tracking-tighter`}>
        {value}
      </p>
    </div>

    {mtdValue && (
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">MTD</p>
        <p className="text-xl font-bold text-slate-700">{mtdValue}</p>
      </div>
    )}
  </div>
);

const SalespersonDetails: React.FC<SalespersonDetailsProps> = ({ name, onBack }) => {
  const [startDate, setStartDate] = useState<DateSelection>({ month: 'Aug', year: '2025' });
  const [endDate, setEndDate] = useState<DateSelection>({ month: 'Jan', year: '2026' });
  const [isLoading, setIsLoading] = useState(false);

  // Mock area mapping based on name hash
  const getArea = (salesName: string) => {
    const areas = ['Jakarta', 'Surabaya', 'Bandung'];
    const charSum = salesName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return areas[charSum % areas.length];
  };

  // Mock branch mapping - Ensures not "all" are shown unless appropriate
  const getBranch = (salesName: string) => {
    const branches = [
        "PWM", 
        "Institutional Business", 
        "Fixed Income", 
        "Institutional Business, Fixed Income"
    ];
    const charSum = salesName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return branches[charSum % branches.length];
  };

  const toDateVal = (sel: DateSelection) => {
    const mIdx = ALL_MONTHS.indexOf(sel.month);
    return parseInt(sel.year) * 100 + mIdx;
  };

  const fullPerformanceData = useMemo(() => {
    const data = [];
    for (const year of ALL_YEARS) {
      for (const month of ALL_MONTHS) {
        data.push({
          month: `${month} ${year}`,
          dateVal: parseInt(year) * 100 + ALL_MONTHS.indexOf(month),
          aumValue: 8e9 + Math.random() * 7e9,
          aumTrend: (Math.random() * 10 - 2).toFixed(1),
          revenueValue: 150e6 + Math.random() * 200e6,
          revenueTrend: (Math.random() * 25 - 5).toFixed(1),
          existing: 500 + Math.floor(Math.random() * 200),
          new: Math.floor(Math.random() * 25)
        });
      }
    }
    return data;
  }, []);

  const filteredData = useMemo(() => {
    const start = toDateVal(startDate);
    const end = toDateVal(endDate);
    return fullPerformanceData.filter(d => d.dateVal >= start && d.dateVal <= end);
  }, [startDate, endDate, fullPerformanceData]);

  const aumChartData = filteredData.map(d => ({ month: d.month, value1: d.aumValue, trend: parseFloat(d.aumTrend) }));
  const revenueChartData = filteredData.map(d => ({ month: d.month, value1: d.revenueValue, trend: parseFloat(d.revenueTrend) }));
  const clientsChartData = filteredData.map(d => ({ month: d.month, existing: d.existing, new: d.new }));

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onBack}
            className="p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 transition-all group"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
          </button>
          <div>
            <h2 className="text-[44px] font-black text-slate-900 leading-tight tracking-tighter">{name}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">SALESPERSON PERFORMANCE PROFILE</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          {/* Level Pill */}
          <div className="inline-flex items-center space-x-2.5 bg-blue-50/50 px-5 py-2.5 rounded-full border border-blue-100/50 shadow-sm">
             <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
             <span className="text-sm font-bold text-blue-700 tracking-tight">Level: Senior Relationship Manager</span>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Area Badge */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm min-w-[120px] justify-between">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AREA</span>
               <span className="text-[13px] font-black text-slate-700 ml-2">{getArea(name)}</span>
            </div>
            
            {/* Branch Badge (Refined) */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm min-w-[120px] justify-between">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BRANCH</span>
               <span className="text-[13px] font-black text-slate-700 ml-2">{getBranch(name)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary KPI Cards matching the screenshot layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <SalespersonKPICard 
          label="Total AUM"
          value="Rp 115.00 Miliar"
          mtdValue="Rp 118.00 Miliar"
        />
        <SalespersonKPICard 
          label="Net Inflow AUM"
          value="Rp 12.00 Miliar"
          mtdValue="Rp 1.50 Miliar"
        />
        <SalespersonKPICard 
          label="Total Revenue"
          showYTDLabel
          value="Rp 2.40 Miliar"
          mtdValue="Rp 320.00 Juta"
        />
        <SalespersonKPICard 
          label="Avg Revenue per Client (RPA)"
          value="Rp 38.00 Juta"
          mtdValue="Rp 39.00 Juta"
        />
        <SalespersonKPICard 
          label="Total Active Clients"
          value="142"
          isLarge
        />
      </div>

      {/* Performance Visuals Section */}
      <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-800">Performance Analytics</h3>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">Trend analysis for the selected period</p>
          </div>
          <DateRangeSelector 
            start={startDate} 
            end={endDate} 
            onStartChange={setStartDate} 
            onEndChange={setEndDate} 
          />
        </div>
        
        <div className={`grid grid-cols-1 gap-12 transition-all duration-500 ${isLoading ? 'opacity-30 blur-[2px]' : 'opacity-100 blur-0'}`}>
          <MonthlyTrendChart 
            data={aumChartData} 
            dataKey1="AUM Growth" 
            trendKey="MoM %" 
            title="Monthly AUM Growth Trend" 
            isCurrency={true} 
          />
          <MonthlyTrendChart 
            data={revenueChartData} 
            dataKey1="Revenue" 
            trendKey="Changes" 
            title="Revenue Trend" 
            isCurrency={true} 
          />
          <ClientTrendChart 
            data={clientsChartData}
            title="Monthly New Client Acquisition vs. Total Client"
          />
        </div>
        
        {filteredData.length === 0 && !isLoading && (
          <div className="bg-gray-50/50 p-20 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
             <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <p className="font-black uppercase tracking-widest text-xs">No data available</p>
             <p className="text-sm mt-1">Try adjusting the date range filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SalespersonDetails;
