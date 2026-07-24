
import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { ClockIcon } from '../components/Icons';
import { DateRangeSelector, DateSelection } from '../components/Shared';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Generate mock data for multiple years to facilitate filtering
const generateMockData = () => {
  const data = [];
  const years = [2024, 2025, 2026];
  for (const year of years) {
    for (let m = 0; m < 12; m++) {
      data.push({
        fullDate: new Date(year, m, 1),
        month: MONTH_NAMES[m],
        year: year.toString(),
        label: `${MONTH_NAMES[m]} ${year}`,
        submit: 3.5 + Math.random() * 1.5,
        ready: 40 + Math.random() * 12,
      });
    }
  }
  return data;
};

const ALL_DATA = generateMockData();

const SLAKPICard: React.FC<{
  title: string;
  value: string;
  unit: string;
  subtitle: string;
  colorClass: string;
}> = ({ title, value, unit, subtitle, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-4">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <span className={`text-4xl font-black ${colorClass}`}>{value}</span>
        <span className="text-gray-400 font-bold">{unit}</span>
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-4 font-medium">{subtitle}</p>
  </div>
);

const GuidelineCard: React.FC<{
  title: string;
  target: string;
  description: string;
  bgColor: string;
  textColor: string;
}> = ({ title, target, description, bgColor, textColor }) => (
  <div className={`${bgColor} p-6 rounded-2xl border border-opacity-20 flex flex-col justify-center`}>
    <h4 className="text-sm font-bold text-slate-700 mb-4">{title}</h4>
    <p className={`text-3xl font-black ${textColor} mb-2`}>{target}</p>
    <p className="text-xs text-gray-500 font-medium leading-relaxed">{description}</p>
  </div>
);

const OnboardingSLATrend: React.FC = () => {
  // Today's date reference (consistent with dashboard: Feb 2026)
  const today = new Date(2026, 1, 4);
  
  // Default state: Last 12 months from today
  const [startDate, setStartDate] = useState<DateSelection>({ 
    month: MONTH_NAMES[(today.getMonth() + 1) % 12], 
    year: (today.getFullYear() - 1).toString() 
  });
  const [endDate, setEndDate] = useState<DateSelection>({ 
    month: MONTH_NAMES[today.getMonth()], 
    year: today.getFullYear().toString() 
  });

  const [isLoading, setIsLoading] = useState(false);

  // Filter the data based on selected range
  const filteredData = useMemo(() => {
    const startM = MONTH_NAMES.indexOf(startDate.month);
    const startY = parseInt(startDate.year);
    const endM = MONTH_NAMES.indexOf(endDate.month);
    const endY = parseInt(endDate.year);

    const startVal = startY * 12 + startM;
    const endVal = endY * 12 + endM;

    return ALL_DATA.filter(item => {
      const itemVal = item.fullDate.getFullYear() * 12 + item.fullDate.getMonth();
      return itemVal >= startVal && itemVal <= endVal;
    }).map(item => ({
      ...item,
      // Change the chart label to include year if the range spans multiple years
      chartLabel: startY !== endY ? `${item.month} ${item.year.slice(2)}` : item.month
    }));
  }, [startDate, endDate]);

  // Loading simulation when filter changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [startDate, endDate]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-gray-50/30">
      {/* Header with Icon and Range Filter */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-2">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-sky-50 rounded-lg mt-1">
            <ClockIcon className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#2e3a59] tracking-tight">SLA Trend Analysis</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">Track onboarding completion time performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <DateRangeSelector 
            start={startDate} 
            end={endDate} 
            onStartChange={setStartDate} 
            onEndChange={setEndDate} 
          />
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SLAKPICard 
          title="Avg. Time to Submit"
          value="4"
          unit="hours"
          subtitle="From registration to form submission"
          colorClass="text-orange-500"
        />
        <SLAKPICard 
          title="Avg. Time to Account Ready"
          value="45.6"
          unit="hours"
          subtitle="From registration to account activation"
          colorClass="text-sky-400"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-base font-bold text-[#1e293b]">Monthly SLA Trend</h3>
          {isLoading && (
            <div className="flex items-center space-x-2 text-sky-500">
               <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="text-[10px] font-bold uppercase tracking-widest">Updating...</span>
            </div>
          )}
        </div>
        
        <div className={`h-[400px] w-full transition-all duration-300 ${isLoading ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <XAxis 
                dataKey="chartLabel" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} 
                dy={10}
              />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'} }}
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                domain={[0, 60]}
                ticks={[0, 15, 30, 45, 60]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ fontWeight: 'black', color: '#1e293b', marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="submit" 
                name="Time to Submit" 
                stroke="#f97316" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSubmit)" 
                isAnimationActive={!isLoading}
              />
              <Area 
                type="monotone" 
                dataKey="ready" 
                name="Time to Account Ready" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorReady)" 
                isAnimationActive={!isLoading}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SLA Guidelines Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-[#1e293b] mb-6">SLA Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GuidelineCard 
            title="Time to Submit Target"
            target="≤ 4 hours"
            description="Target waktu nasabah menyelesaikan pengisian form dari awal registrasi"
            bgColor="bg-orange-50/50"
            textColor="text-orange-600"
          />
          <GuidelineCard 
            title="Time to Account Ready Target"
            target="≤ 24 hours"
            description="Target waktu total dari registrasi sampai akun nasabah siap digunakan"
            bgColor="bg-sky-50/50"
            textColor="text-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingSLATrend;
