import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from '../../components/Icons';
import type { OnboardingTimeFilterState, TimeGranularity } from './types';
import { dateInputValue, earliestDailyDate, FIRST_ONBOARDING_YEAR, MONTH_LABELS, timeFilterSummary } from './utils';

const buildYearGrid = (decadeStart: number) => Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);
const decadeStartFor = (year: number) => Math.floor(year / 10) * 10;
const monthValue = (year: number, monthIndex: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

interface TimeFilterProps {
  granularity: TimeGranularity;
  value: OnboardingTimeFilterState;
  onGranularityChange: (granularity: TimeGranularity) => void;
  onChange: (value: OnboardingTimeFilterState) => void;
}

const modeLabels: Record<TimeGranularity, string> = {
  daily: 'Daily',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Annual',
};

const YearGrid: React.FC<{
  panelStart: number;
  selected: (year: number) => boolean;
  inRange?: (year: number) => boolean;
  onSelect: (year: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  currentYear: number;
}> = ({ panelStart, selected, inRange, onSelect, onPrevious, onNext, currentYear }) => (
  <div>
    <div className="flex items-center justify-between">
      <button type="button" onClick={onPrevious} className="rounded-lg px-2 text-xl font-black text-slate-300 transition-colors hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Previous year block">‹</button>
      <span className="text-sm font-black text-slate-700">{panelStart}-{panelStart + 9}</span>
      <button type="button" onClick={onNext} className="rounded-lg px-2 text-xl font-black text-slate-300 transition-colors hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Next year block">›</button>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3">
      {buildYearGrid(panelStart).map((year) => {
        const disabled = year < FIRST_ONBOARDING_YEAR || year > currentYear;
        const edge = selected(year);
        const between = inRange?.(year) ?? false;
        return (
          <button
            key={year}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(year)}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              disabled ? 'cursor-not-allowed bg-slate-50 text-slate-300' : edge ? 'bg-blue-600 text-white shadow-sm' : between ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-700 hover:bg-blue-50'
            }`}
          >
            {year}
          </button>
        );
      })}
    </div>
  </div>
);

export const TimeFilter: React.FC<TimeFilterProps> = ({ granularity, value, onGranularityChange, onChange }) => {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const todayValue = dateInputValue(now);
  const earliestDailyValue = earliestDailyDate(now);
  const [isOpen, setIsOpen] = useState(false);
  const [monthlyAnchor, setMonthlyAnchor] = useState<number | null>(null);
  const [yearlyAnchor, setYearlyAnchor] = useState<number | null>(null);
  const [monthlyYearPanel, setMonthlyYearPanel] = useState(decadeStartFor(value.monthly.year));
  const [quarterlyYearPanel, setQuarterlyYearPanel] = useState(decadeStartFor(value.quarterly.year));
  const [yearlyYearPanel, setYearlyYearPanel] = useState(decadeStartFor(value.yearly.fromYear));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const switchMode = (next: TimeGranularity) => {
    setMonthlyAnchor(null);
    setYearlyAnchor(null);
    onGranularityChange(next);
  };

  const updateDailyFrom = (from: string) => {
    if (!from) return;
    const nextFrom = from < earliestDailyValue ? earliestDailyValue : from > todayValue ? todayValue : from;
    onChange({ ...value, daily: { from: nextFrom, to: nextFrom > value.daily.to ? nextFrom : value.daily.to } });
  };

  const updateDailyTo = (to: string) => {
    if (!to) return;
    const nextTo = to < earliestDailyValue ? earliestDailyValue : to > todayValue ? todayValue : to;
    onChange({ ...value, daily: { from: nextTo < value.daily.from ? nextTo : value.daily.from, to: nextTo } });
  };

  const updateMonthlyYear = (year: number) => {
    const lastAvailableMonth = year === currentYear ? now.getMonth() : 11;
    onChange({ ...value, monthly: { year, from: 0, to: lastAvailableMonth } });
    setMonthlyAnchor(null);
  };

  const selectMonth = (monthIndex: number) => {
    const lastAvailableMonth = value.monthly.year === currentYear ? now.getMonth() : 11;
    if (monthIndex > lastAvailableMonth) return;
    if (monthlyAnchor === null) {
      onChange({ ...value, monthly: { ...value.monthly, from: monthIndex, to: monthIndex } });
      setMonthlyAnchor(monthIndex);
      return;
    }
    onChange({
      ...value,
      monthly: { ...value.monthly, from: Math.min(monthlyAnchor, monthIndex), to: Math.max(monthlyAnchor, monthIndex) },
    });
    setMonthlyAnchor(null);
  };

  const selectYearRange = (year: number) => {
    if (yearlyAnchor === null) {
      onChange({ ...value, yearly: { fromYear: year, toYear: year } });
      setYearlyAnchor(year);
      return;
    }
    onChange({ ...value, yearly: { fromYear: Math.min(yearlyAnchor, year), toYear: Math.max(yearlyAnchor, year) } });
    setYearlyAnchor(null);
  };

  return (
    <div ref={containerRef} className="relative w-fit">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-3 rounded-2xl border border-[#e5edf7] bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <CalendarIcon className="h-5 w-5 text-slate-400" />
        <span>
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Time Filter</span>
          <span className="block whitespace-nowrap text-sm font-black text-slate-800">{timeFilterSummary(granularity, value, now)}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div role="dialog" aria-label="Customer onboarding time filter" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(calc(100vw-2rem),560px)] rounded-[24px] border border-[#e5edf7] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:p-6">
          <h2 className="text-[28px] font-black tracking-tight text-slate-900">Time Filter</h2>
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-700">Frequency</p>
            <div className="mt-3 grid w-full grid-cols-4 rounded-[14px] bg-slate-50 p-1" aria-label="Time filter frequency">
              {(Object.keys(modeLabels) as TimeGranularity[]).map((mode) => (
                <button key={mode} type="button" onClick={() => switchMode(mode)} aria-pressed={granularity === mode} className={`rounded-[10px] px-2 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:text-sm ${granularity === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{modeLabels[mode]}</button>
              ))}
            </div>
          </div>

          {granularity === 'daily' && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">From</span>
                  <input
                    type="date"
                    value={value.daily.from}
                    min={earliestDailyValue}
                    max={todayValue}
                    onChange={(event) => updateDailyFrom(event.target.value)}
                    aria-label="Daily range start date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">To</span>
                  <input
                    type="date"
                    value={value.daily.to}
                    min={earliestDailyValue}
                    max={todayValue}
                    onChange={(event) => updateDailyTo(event.target.value)}
                    aria-label="Daily range end date"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <p className="text-xs font-medium leading-5 text-slate-500">Metrics are aggregated based on the selected frequency.</p>
              <p className="text-xs font-bold text-blue-600">Daily range can show up to the last 90 working days.</p>
            </div>
          )}

          {granularity === 'monthly' && (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-slate-700">Time Range</p>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] px-4 py-3">
                  <span className="text-sm font-bold text-slate-800">{monthValue(value.monthly.year, value.monthly.from)}</span><span className="text-slate-400">→</span><span className="text-sm font-bold text-slate-800">{monthValue(value.monthly.year, value.monthly.to)}</span>
                </div>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Statement Year</p>
                <YearGrid panelStart={monthlyYearPanel} selected={(year) => year === value.monthly.year} onSelect={updateMonthlyYear} onPrevious={() => setMonthlyYearPanel((year) => year - 10)} onNext={() => setMonthlyYearPanel((year) => year + 10)} currentYear={currentYear} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Month Range</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {MONTH_LABELS.map((label, monthIndex) => {
                    const disabled = value.monthly.year === currentYear && monthIndex > now.getMonth();
                    const edge = monthIndex === value.monthly.from || monthIndex === value.monthly.to;
                    const between = monthIndex > value.monthly.from && monthIndex < value.monthly.to;
                    return <button key={label} type="button" disabled={disabled} onClick={() => selectMonth(monthIndex)} className={`rounded-xl px-4 py-3 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'cursor-not-allowed bg-slate-50 text-slate-300' : edge ? 'bg-blue-600 text-white shadow-sm' : between ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-700 hover:bg-blue-50'}`}>{label}</button>;
                  })}
                </div>
              </div>
            </div>
          )}

          {granularity === 'quarterly' && (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-slate-700">Statement Year</p>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] px-4 py-3"><span className="text-sm font-bold text-slate-800">{value.quarterly.year}</span><CalendarIcon className="h-4 w-4 text-slate-400" /></div>
              </div>
              <YearGrid panelStart={quarterlyYearPanel} selected={(year) => year === value.quarterly.year} onSelect={(year) => onChange({ ...value, quarterly: { year } })} onPrevious={() => setQuarterlyYearPanel((year) => year - 10)} onNext={() => setQuarterlyYearPanel((year) => year + 10)} currentYear={currentYear} />
            </div>
          )}

          {granularity === 'yearly' && (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-slate-700">Time Range</p>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#bfdbfe] px-4 py-3"><span className="text-sm font-bold text-slate-800">{value.yearly.fromYear}</span><span className="text-slate-400">→</span><span className="text-sm font-bold text-slate-800">{value.yearly.toYear}</span><CalendarIcon className="h-4 w-4 text-slate-400" /></div>
              </div>
              <YearGrid panelStart={yearlyYearPanel} selected={(year) => year === value.yearly.fromYear || year === value.yearly.toYear} inRange={(year) => year > value.yearly.fromYear && year < value.yearly.toYear} onSelect={selectYearRange} onPrevious={() => setYearlyYearPanel((year) => year - 10)} onNext={() => setYearlyYearPanel((year) => year + 10)} currentYear={currentYear} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
