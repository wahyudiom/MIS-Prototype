import React, { useEffect, useRef, useState } from 'react';
import { DownloadIcon } from '../../components/Icons';
import type { BranchBreakdownItem, KpiMetric, MetricUnit, MetricValueTone } from './types';
import { calculatePercentage, formatMetricValue } from './utils';

interface BranchBreakdownProps {
  branches: BranchBreakdownItem[];
  unit: MetricUnit;
  percentageTotal?: number | null;
}

export const BranchBreakdown: React.FC<BranchBreakdownProps> = ({ branches, unit, percentageTotal }) => (
  <div className="mt-3 border-t border-[#F0F0F0] pt-3" aria-label="Branch breakdown">
    <div className="flex flex-nowrap items-start">
      {branches.map((branch, index) => {
        const isAboveTarget = branch.target != null && branch.value != null && branch.value > branch.target;
        const percentage = percentageTotal == null || branch.value == null
          ? null
          : calculatePercentage(branch.value, percentageTotal);
        return (
          <React.Fragment key={branch.id}>
            {index > 0 ? <span aria-hidden="true" className="shrink-0 px-2 text-[11px] font-normal leading-4 text-[#E0E0E0]">|</span> : null}
            <div className="min-w-0 flex-1 text-center">
              <div className="text-[11px] font-semibold leading-4 tracking-[0.5px] text-[#999999]">{branch.label}</div>
              <div className={`mt-1 text-sm font-bold leading-5 ${isAboveTarget ? 'text-[#DC2626]' : 'text-[#1A1A1A]'}`}>
                {formatMetricValue(branch.value, unit)}
                {percentageTotal !== undefined ? (
                  <span className="block font-medium text-blue-600 2xl:ml-1 2xl:inline">({formatMetricValue(percentage, 'percentage')})</span>
                ) : null}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

interface KpiCardProps {
  metric: KpiMetric;
  supportingText?: string;
  variant?: 'default' | 'highlight';
  valueTone?: MetricValueTone;
  showDownload?: boolean;
  supportingTextPlacement?: 'below' | 'inline';
  supportingTextVariant?: 'default' | 'prominent';
  showBranchPercentages?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  metric,
  supportingText,
  variant = 'default',
  valueTone = 'default',
  showDownload = true,
  supportingTextPlacement = 'below',
  supportingTextVariant = 'default',
  showBranchPercentages = false,
}) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const definitionId = `kpi-definition-${metric.id}`;
  const popoverId = `kpi-download-${metric.id}`;

  useEffect(() => {
    if (!isDownloadOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) setIsDownloadOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDownloadOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isDownloadOpen]);

  const isHighlighted = variant === 'highlight';
  const valueToneClass = isHighlighted
    ? 'text-white'
    : valueTone === 'positive'
      ? 'text-emerald-600'
      : valueTone === 'negative' ? 'text-red-600' : 'text-slate-900';
  const supportingTextClass = `${supportingTextVariant === 'prominent' ? 'text-2xl font-medium' : 'text-sm font-bold'} ${isHighlighted ? 'text-blue-100' : 'text-blue-600'}`;

  return (
    <article
      aria-describedby={definitionId}
      className={`flex min-h-40 flex-col rounded-2xl border p-5 shadow-sm ${isHighlighted ? 'border-blue-600 bg-blue-600 shadow-blue-100' : 'border-gray-100 bg-white'}`}
    >
      <p id={definitionId} className="sr-only">{metric.definition}</p>
      <div className="flex min-h-12 items-start justify-between gap-3">
        <h3 className={`text-xs font-extrabold uppercase leading-5 tracking-[0.08em] ${isHighlighted ? 'text-blue-100' : 'text-slate-500'}`}>{metric.label}</h3>
        {showDownload ? <div ref={downloadRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDownloadOpen((open) => !open)}
            aria-label={`Download ${metric.label} as XLSX`}
            aria-expanded={isDownloadOpen}
            aria-controls={popoverId}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 ${isHighlighted ? 'border-blue-300 text-white hover:border-white hover:bg-white/10 focus:ring-white' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-500'}`}
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
          {isDownloadOpen && (
            <div id={popoverId} role="status" className="absolute right-0 top-[calc(100%+8px)] z-20 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-lg">
              Download XLSX
            </div>
          )}
        </div> : null}
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div className={`text-3xl font-black tracking-tight ${valueToneClass}`}>{formatMetricValue(metric.value, metric.unit)}</div>
        {supportingText && supportingTextPlacement === 'inline' ? <p className={supportingTextClass}>{supportingText}</p> : null}
      </div>
      {supportingText && supportingTextPlacement === 'below' ? <p className={`mt-2 ${supportingTextClass}`}>{supportingText}</p> : null}
      {metric.branches?.length ? (
        <BranchBreakdown
          branches={metric.branches}
          unit={metric.unit}
          percentageTotal={showBranchPercentages ? metric.value : undefined}
        />
      ) : null}
    </article>
  );
};

interface KpiCardGridProps {
  metrics: KpiMetric[];
  columns?: 'six' | 'five' | 'four' | 'three';
  getSupportingText?: (metric: KpiMetric) => string | undefined;
  getValueTone?: (metric: KpiMetric) => MetricValueTone;
  getSupportingTextPlacement?: (metric: KpiMetric) => 'below' | 'inline';
  getSupportingTextVariant?: (metric: KpiMetric) => 'default' | 'prominent';
  getShowBranchPercentages?: (metric: KpiMetric) => boolean;
  showDownload?: boolean;
}

export const KpiCardGrid: React.FC<KpiCardGridProps> = ({ metrics, columns = 'six', getSupportingText, getValueTone, getSupportingTextPlacement, getSupportingTextVariant, getShowBranchPercentages, showDownload = true }) => {
  const columnClass = columns === 'five'
    ? 'xl:grid-cols-5'
    : columns === 'four' ? 'xl:grid-cols-4' : columns === 'three' ? 'lg:grid-cols-3' : 'xl:grid-cols-3 2xl:grid-cols-6';
  return <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${columnClass}`}>{metrics.map((metric) => (
    <KpiCard
      key={metric.id}
      metric={metric}
      supportingText={getSupportingText?.(metric)}
      supportingTextPlacement={getSupportingTextPlacement?.(metric)}
      supportingTextVariant={getSupportingTextVariant?.(metric)}
      valueTone={getValueTone?.(metric)}
      showBranchPercentages={getShowBranchPercentages?.(metric)}
      showDownload={showDownload}
    />
  ))}</div>;
};
