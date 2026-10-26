import React from 'react';
import type { PipelineStage } from './types';
import { formatMetricValue } from './utils';

export const OnboardingPipeline: React.FC<{ stages: PipelineStage[] }> = ({ stages }) => (
  <div className="overflow-x-auto pb-3" aria-label="Customer onboarding process pipeline">
    <div className="flex min-w-[1500px] items-stretch">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          <article className="flex min-h-56 w-44 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700">{index + 1}</div>
            <h3 className="min-h-10 text-sm font-bold leading-5 text-slate-700">{stage.label}</h3>
            <div className={`${stage.breakdown?.length ? 'mt-1' : 'mt-auto'} pt-2`}>
              {stage.breakdown?.length ? <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Total</div> : null}
              <div className="text-2xl font-black text-slate-900">{formatMetricValue(stage.value, 'count')}</div>
            </div>
            {stage.breakdown?.length ? (
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3" aria-label={`${stage.label} approval breakdown`}>
                {stage.breakdown.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <div className="min-h-7 text-[9px] font-bold leading-3 text-slate-500">{item.label}</div>
                    <div className="mt-1 text-sm font-black text-slate-800">{formatMetricValue(item.value, 'count')}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
          {index < stages.length - 1 && (
            <div className="flex w-10 shrink-0 flex-col items-center justify-center" title="Percentage of applications that progressed from this stage to the next stage during the selected period.">
              <span className="whitespace-nowrap text-[10px] font-extrabold text-slate-500">{stage.conversionToNext == null ? '—' : `${stage.conversionToNext.toFixed(1)}%`}</span>
              <span className="mt-2 text-xl text-blue-400" aria-hidden="true">→</span>
              <span className="sr-only">Conversion to next stage: {stage.conversionToNext == null ? 'unavailable' : `${stage.conversionToNext.toFixed(1)} percent`}</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);
