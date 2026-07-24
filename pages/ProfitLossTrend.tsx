
import React, { useState, useMemo } from 'react';
import { MultiLineTrendChart, StackedBarTrendChart, SmallMultiplesTrendChart } from '../components/Shared';

interface ProfitLossTrendProps {
  title: string;
  subtitle: string;
  initialYear?: string;
  categories: string[];
  chartType?: 'line' | 'stacked-bar' | 'small-multiples';
}

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ALL_YEARS = ["2021", "2022", "2023", "2024", "2025"];

const ProfitLossTrend: React.FC<ProfitLossTrendProps> = ({ title, subtitle, categories, initialYear = "2025", chartType = 'line' }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [granularity, setGranularity] = useState('Monthly');
  const [year, setYear] = useState(initialYear);

  const trendData = useMemo(() => {
    return ALL_MONTHS.map(month => {
      const entry: any = { month };
      categories.forEach(cat => {
        entry[cat] = 10e9 + Math.random() * 20e9;
      });
      return entry;
    });
  }, [categories]);

  const yearlyData = useMemo(() => {
    return ALL_YEARS.map(yr => {
      const entry: any = { month: yr };
      categories.forEach(cat => {
        entry[cat] = 50e9 + Math.random() * 120e9;
      });
      return entry;
    });
  }, [categories]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1', '#14b8a6', '#f59e0b', '#64748b'];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          <p className="text-xs font-bold text-gray-400 uppercase mt-1">{granularity === 'Yearly' ? 'Yearly trend overview' : subtitle.replace('YYYY', year)}</p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
           <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
           </svg>
           <select 
             value={granularity} 
             onChange={(e) => setGranularity(e.target.value)}
             className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer"
           >
              <option>Monthly</option>
              <option>Yearly</option>
           </select>
           {granularity !== 'Yearly' && (
             <>
               <div className="h-4 w-px bg-gray-200"></div>
               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer pr-2"
               >
                 <option>2025</option>
                 <option>2024</option>
                 <option>2023</option>
                 <option>2022</option>
                 <option>2021</option>
               </select>
             </>
           )}
        </div>
      </header>

      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Categories</h3>
            <div className="flex items-center space-x-4">
               <button 
                 onClick={() => setSelectedCategories(categories)}
                 className="text-[10px] font-black text-blue-600 uppercase hover:underline"
               >
                 Select All
               </button>
               <button 
                 onClick={() => setSelectedCategories([])}
                 className="text-[10px] font-black text-gray-400 uppercase hover:underline"
               >
                 Clear All
               </button>
            </div>
         </div>
         <div className="flex flex-wrap gap-4">
            {categories.map((cat, idx) => (
               <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <div 
                      className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedCategories.includes(cat) ? 'border-transparent' : 'border-gray-200 bg-white group-hover:border-gray-300'}`}
                      style={{ backgroundColor: selectedCategories.includes(cat) ? CHART_COLORS[idx % CHART_COLORS.length] : undefined }}
                    >
                       {selectedCategories.includes(cat) && (
                         <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                         </svg>
                       )}
                    </div>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${selectedCategories.includes(cat) ? 'text-gray-900' : 'text-gray-400'}`}>
                    {cat}
                  </span>
               </label>
            ))}
         </div>
      </section>

      <div className="relative">
        {selectedCategories.length === 0 ? (
          <div className="bg-white h-[450px] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
             <p className="font-bold text-lg">Please select at least one category to display</p>
          </div>
        ) : granularity === 'Yearly' ? (
          <MultiLineTrendChart
            data={yearlyData}
            categories={selectedCategories}
            title="Performance Trends"
            subtitle="Values in IDR"
          />
        ) : chartType === 'stacked-bar' ? (
          <StackedBarTrendChart
            data={trendData}
            categories={selectedCategories}
            title="Performance Trends"
            subtitle="Values in IDR"
          />
        ) : chartType === 'small-multiples' ? (
          <SmallMultiplesTrendChart
            data={trendData}
            categories={selectedCategories}
            title="Performance Trends"
            subtitle="Values in IDR"
          />
        ) : (
          <MultiLineTrendChart
            data={trendData}
            categories={selectedCategories}
            title="Performance Trends"
            subtitle="Values in IDR"
          />
        )}
      </div>
    </div>
  );
};

export default ProfitLossTrend;
