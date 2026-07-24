import React from 'react';
import prototypeHtml from '../preview-profit-loss-unified.html?raw';

const ProfitLossDetailTesting: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#2e3a59] tracking-tight">Profit and Loss Performance</h1>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Prototype page for unified Profit and Loss filter testing.
            </p>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Monthly / Quarterly filter prototype
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        <iframe
          title="Profit and Loss Performance Prototype"
          srcDoc={prototypeHtml}
          className="w-full min-h-[1500px] border-0 bg-white"
        />
      </div>
    </div>
  );
};

export default ProfitLossDetailTesting;
