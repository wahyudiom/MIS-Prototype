import React from 'react';

const INAV_URL = 'https://masi-inav-etf.masi-8874.chatgpt.site/';

const IFrameTest: React.FC = () => (
  <div className="px-4 py-5 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
      <div>
        <div className="text-[11px] font-bold tracking-widest uppercase text-blue-500 mb-1">Integration prototype</div>
        <h3 className="text-xl font-bold text-slate-900">ETF Primary Market</h3>
        <p className="text-sm text-slate-500 mt-1">External iNAV ETF page embedded within the MIS Dashboard.</p>
      </div>
      <a
        href={INAV_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
      >
        Open original page
        <span className="ml-2" aria-hidden="true">↗</span>
      </a>
    </div>

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <iframe
        title="ETF Primary Market iNAV"
        src={INAV_URL}
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        className="block w-full h-[1100px] sm:h-[1400px] border-0 bg-white"
      />
    </div>
    <p className="mt-3 text-xs text-slate-500">
      Prototype only. If the frame is blank, the external site may restrict embedding; use “Open original page” to view it directly.
    </p>
  </div>
);

export default IFrameTest;
