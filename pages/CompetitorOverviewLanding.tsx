import React, { useMemo, useState } from 'react';

type MetricKey = 'volume' | 'value' | 'frequency';

type CompetitorCard = {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  accent: string;
  avatar: string;
  fill: string;
  rank: number;
  volume: number;
  value: number;
  frequency: number;
  appStoreDownload: string;
  playStoreDownload: string;
  appStoreRating: string;
  playStoreRating: string;
};

const competitors: CompetitorCard[] = [
  {
    id: 'stockbit',
    name: 'Stockbit',
    initials: 'SB',
    subtitle: 'External competitor',
    accent: 'from-blue-500 to-violet-500',
    avatar: 'bg-gradient-to-br from-blue-500 to-violet-500',
    fill: 'bg-gradient-to-r from-blue-500 to-violet-500',
    rank: 1,
    volume: 12.8,
    value: 8.4,
    frequency: 14.2,
    appStoreDownload: '1.8 M',
    playStoreDownload: '5.6 M',
    appStoreRating: '4.8',
    playStoreRating: '4.7',
  },
  {
    id: 'ajaib',
    name: 'Ajaib',
    initials: 'AJ',
    subtitle: 'External competitor',
    accent: 'from-amber-400 to-orange-500',
    avatar: 'bg-gradient-to-br from-amber-400 to-orange-500',
    fill: 'bg-gradient-to-r from-amber-400 to-orange-500',
    rank: 2,
    volume: 10.3,
    value: 7.1,
    frequency: 12.6,
    appStoreDownload: '1.4 M',
    playStoreDownload: '4.8 M',
    appStoreRating: '4.7',
    playStoreRating: '4.6',
  },
  {
    id: 'mirae',
    name: 'Mirae Asset Sekuritas Indonesia',
    initials: 'MA',
    subtitle: 'Company profile',
    accent: 'from-teal-500 to-emerald-500',
    avatar: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    fill: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    rank: 3,
    volume: 9.6,
    value: 6.4,
    frequency: 11.4,
    appStoreDownload: '1.1 M',
    playStoreDownload: '4.2 M',
    appStoreRating: '4.6',
    playStoreRating: '4.5',
  },
  {
    id: 'ipot',
    name: 'IPOT',
    initials: 'IP',
    subtitle: 'External competitor',
    accent: 'from-cyan-500 to-teal-500',
    avatar: 'bg-gradient-to-br from-cyan-500 to-teal-500',
    fill: 'bg-gradient-to-r from-cyan-500 to-teal-500',
    rank: 4,
    volume: 8.9,
    value: 6.0,
    frequency: 10.8,
    appStoreDownload: '920 K',
    playStoreDownload: '3.9 M',
    appStoreRating: '4.5',
    playStoreRating: '4.4',
  },
  {
    id: 'growin',
    name: "Growin' (Mandiri Sekuritas)",
    initials: 'GR',
    subtitle: 'External competitor',
    accent: 'from-violet-500 to-pink-500',
    avatar: 'bg-gradient-to-br from-violet-500 to-pink-500',
    fill: 'bg-gradient-to-r from-violet-500 to-pink-500',
    rank: 5,
    volume: 6.1,
    value: 4.2,
    frequency: 8.5,
    appStoreDownload: '610 K',
    playStoreDownload: '2.7 M',
    appStoreRating: '4.3',
    playStoreRating: '4.2',
  },
];

const metricLabels: Record<MetricKey, { label: string; unit: string; valueLabel: string }> = {
  volume: { label: 'Volume', unit: 'IDR T', valueLabel: 'Transaction Volume' },
  value: { label: 'Value', unit: 'IDR T', valueLabel: 'Transaction Value' },
  frequency: { label: 'Frequency', unit: 'M', valueLabel: 'Transaction Frequency' },
};

const formatMetric = (value: number, metric: MetricKey) => `${value.toFixed(1)} ${metricLabels[metric].unit}`;

const MetricRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-slate-200/80 py-3 last:border-b-0 last:pb-0">
    <span className="text-sm font-black text-slate-500">{label}</span>
    <span className="text-right text-xl font-black tracking-tight text-slate-950">{value}</span>
  </div>
);

const StoreMetric: React.FC<{ label: string; downloads: string; rating: string }> = ({ label, downloads, rating }) => (
  <div className="flex min-h-[154px] flex-col rounded-[18px] border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-4">
    <p className="text-sm font-black tracking-tight text-slate-950">{label}</p>
    <div className="mt-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Downloads</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{downloads}</p>
    </div>
    <div className="mt-auto border-t border-dashed border-slate-200 pt-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Rating</p>
      <p className="mt-1 text-lg font-black text-slate-900">{rating}</p>
    </div>
  </div>
);

const CompetitorOverviewLanding: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('volume');

  const sortedCompetitors = useMemo(
    () => [...competitors].sort((a, b) => b[selectedMetric] - a[selectedMetric]),
    [selectedMetric],
  );
  const maxMetricValue = Math.max(...sortedCompetitors.map((item) => item[selectedMetric]));

  return (
    <div className="mx-auto max-w-[1840px] animate-fade-in p-4 sm:p-6 md:p-8">
      <div className="rounded-[30px] border border-slate-200/90 bg-white/60 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] sm:p-6">
        <header className="mb-5">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.24em] text-slate-400">Competitor Analysis</p>
            <h1 className="mt-2 text-4xl font-black leading-none tracking-[-0.03em] text-slate-950 md:text-5xl">
              Competitor Overview
            </h1>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-5">
          {competitors.map((competitor) => (
            <article
              key={competitor.id}
              className="flex min-h-[560px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
            >
              <div className={`h-1.5 bg-gradient-to-r ${competitor.accent}`} />
              <div className="flex min-h-[116px] items-center gap-4 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-5">
                <div
                  className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full ${competitor.avatar} text-lg font-black text-white shadow-sm`}
                >
                  {competitor.initials}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[22px] font-black leading-tight tracking-[-0.02em] text-slate-950">{competitor.name}</h2>
                  <p className="mt-1.5 text-xs font-bold leading-5 text-slate-400">{competitor.subtitle}</p>
                </div>
              </div>

              <div className="grid gap-1 border-b border-slate-200 p-5">
                <MetricRow label="Ranking" value={`#${competitor.rank}`} />
                <MetricRow label="Transaction Volume" value={`IDR ${competitor.volume.toFixed(1)} T`} />
                <MetricRow label="Transaction Value" value={`IDR ${competitor.value.toFixed(1)} T`} />
                <MetricRow label="Transaction Frequency" value={`${competitor.frequency.toFixed(1)} M`} />
              </div>

              <div className="grid flex-1 gap-4 bg-white p-5">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Store Metrics</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <StoreMetric label="App Store" downloads={competitor.appStoreDownload} rating={competitor.appStoreRating} />
                  <StoreMetric label="Play Store" downloads={competitor.playStoreDownload} rating={competitor.playStoreRating} />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.24em] text-slate-400">Comparison Chart</p>
              <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.02em] text-slate-950">Ranked Product Comparison</h2>
              <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-500">
                Compare the five products on one metric at a time using a ranked horizontal bar chart, avoiding mixed units in a single visual.
              </p>
            </div>

            <div className="inline-flex w-fit flex-wrap gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              {(['volume', 'value', 'frequency'] as MetricKey[]).map((metric) => (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setSelectedMetric(metric)}
                  className={`rounded-full px-4 py-2.5 text-sm font-black transition-all ${
                    selectedMetric === metric
                      ? 'bg-white text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.08)]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {metricLabels[metric].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <div className="grid gap-4">
              {sortedCompetitors.map((competitor, index) => {
                const metricValue = competitor[selectedMetric];
                const width = `${Math.max(8, (metricValue / maxMetricValue) * 100)}%`;

                return (
                  <div key={competitor.id} className="grid grid-cols-[42px_minmax(0,1fr)_120px] items-center gap-3 sm:grid-cols-[42px_minmax(0,1fr)_140px] sm:gap-4">
                    <div className="text-center text-sm font-black text-slate-400">#{index + 1}</div>
                    <div className="min-w-0">
                      <div className="mb-2 flex min-w-0 items-center gap-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${competitor.avatar} text-[11px] font-black text-white`}>
                          {competitor.initials}
                        </div>
                        <span className="truncate text-sm font-extrabold text-slate-800">{competitor.name}</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-gradient-to-b from-slate-100 to-slate-200">
                        <div className={`h-full rounded-full ${competitor.fill}`} style={{ width }} />
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm font-black text-slate-900">{formatMetric(metricValue, selectedMetric)}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${competitor.fill}`} />
                  {competitor.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CompetitorOverviewLanding;
