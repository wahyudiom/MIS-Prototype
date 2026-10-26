import React from 'react';

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8" role="status" aria-label="Loading customer onboarding dashboard">
    <div className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-white" />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white" />)}
    </div>
    <div className="h-72 animate-pulse rounded-2xl border border-slate-100 bg-white" />
    <span className="sr-only">Loading dashboard data</span>
  </div>
);

export const DashboardEmptyState: React.FC = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center" role="status">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">—</div>
    <h2 className="text-lg font-bold text-slate-800">No customer onboarding data is available for the selected period.</h2>
    <p className="mt-2 text-sm font-medium text-slate-500">Choose another period to review onboarding performance.</p>
  </div>
);

export const DashboardErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
    <h2 className="text-lg font-bold text-red-800">Unable to load customer onboarding data</h2>
    <p className="mt-2 text-sm font-medium text-red-700">{message}</p>
    <button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
      Retry
    </button>
  </div>
);
