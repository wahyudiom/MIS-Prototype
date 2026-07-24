import React, { useMemo, useState } from 'react';

const AVAILABLE = '✓';
const UNAVAILABLE = '✗';
const PARTIAL = 'Partial';

type StatusValue = typeof AVAILABLE | typeof UNAVAILABLE | typeof PARTIAL;

type CompetitorKey = 'mstock' | 'neoHots' | 'ajaib' | 'stockbit' | 'growin';

type CompetitorColumn = {
  key: CompetitorKey;
  label: string;
  accent: string;
  checkbox: string;
  chip: string;
};

type ComparisonRow = {
  no: number;
  feature: string;
  values: Record<CompetitorKey, StatusValue>;
};

type ComparisonGroup = {
  title: string;
  rows: ComparisonRow[];
};

const competitors: CompetitorColumn[] = [
  {
    key: 'mstock',
    label: 'M-STOCK (Mirae Asset)',
    accent: 'text-blue-600',
    checkbox: 'border-blue-200 bg-blue-50 text-blue-600',
    chip: 'bg-blue-500',
  },
  {
    key: 'neoHots',
    label: 'Neo HOTS (Mirae Asset)',
    accent: 'text-violet-600',
    checkbox: 'border-violet-200 bg-violet-50 text-violet-600',
    chip: 'bg-violet-500',
  },
  {
    key: 'ajaib',
    label: 'Ajaib',
    accent: 'text-emerald-600',
    checkbox: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    chip: 'bg-emerald-500',
  },
  {
    key: 'stockbit',
    label: 'Stockbit',
    accent: 'text-orange-600',
    checkbox: 'border-orange-200 bg-orange-50 text-orange-600',
    chip: 'bg-orange-500',
  },
  {
    key: 'growin',
    label: "Growin' (Mandiri Sekuritas)",
    accent: 'text-cyan-600',
    checkbox: 'border-cyan-200 bg-cyan-50 text-cyan-600',
    chip: 'bg-cyan-500',
  },
];

const values = (
  mstock: StatusValue,
  neoHots: StatusValue,
  ajaib: StatusValue,
  stockbit: StatusValue,
  growin: StatusValue,
): ComparisonRow['values'] => ({ mstock, neoHots, ajaib, stockbit, growin });

const comparisonGroups: ComparisonGroup[] = [
  {
    title: 'Instrumen Investasi',
    rows: [
      { no: 1, feature: 'Saham IDX (800+ emiten)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 2, feature: 'Reksa Dana', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 3, feature: 'Obligasi / SBN', values: values(PARTIAL, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 4, feature: 'e-IPO', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 5, feature: 'ETF', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 6, feature: 'Saham AS (US Stocks)', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 7, feature: 'Aset Kripto (Spot)', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 8, feature: 'Crypto Perpetual Futures', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 9, feature: 'Produk Syariah', values: values(AVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 10, feature: 'Emas / Komoditas Global', values: values(UNAVAILABLE, UNAVAILABLE, PARTIAL, UNAVAILABLE, UNAVAILABLE) },
    ],
  },
  {
    title: 'Trading & Order',
    rows: [
      { no: 11, feature: 'Market Order & Limit Order', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 12, feature: 'Auto Order', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 13, feature: 'GTC Order (Good Till Cancelled)', values: values(AVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 14, feature: 'Stop Loss & Take Profit', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 15, feature: 'Trailing Stop', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 16, feature: 'Margin Trading', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, PARTIAL, UNAVAILABLE) },
      { no: 17, feature: 'Day Trade / Intraday Leverage', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 18, feature: 'Intraday leverage hingga 20x+', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 19, feature: 'Auto Buy DCA', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 20, feature: 'Fast Trade / Speed Execution', values: values(AVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 21, feature: 'OTC Exchange (crypto)', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 22, feature: 'Multi-Account Login', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Analisis Teknikal & Fundamental',
    rows: [
      { no: 23, feature: 'Advanced Charting Tools', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 24, feature: 'Indikator Teknikal (RSI, MACD, dll)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 25, feature: '100+ Indikator Teknikal', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 26, feature: 'Data Harga 15+ Tahun', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 27, feature: 'Screener Saham', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 28, feature: 'Stock Fundamental Data', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 29, feature: 'Financial Statement / Laporan Keu.', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 30, feature: 'Broker Summary / Broker Flow', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 31, feature: 'Foreign Flow / Dana Asing', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 32, feature: 'Insider Transaction Tracker', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 33, feature: 'Corporate Actions', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 34, feature: 'Smart Running Trade', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 35, feature: 'Real-Time Estimated P&L', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 36, feature: 'Key Stats / Financial Ratios', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 37, feature: 'Stock Overview (lengkap)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Fitur AI & Otomasi',
    rows: [
      { no: 38, feature: 'AI Assistant (built-in)', values: values(AVAILABLE, PARTIAL, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 39, feature: 'MAIA (AI trading otomatis)', values: values(AVAILABLE, PARTIAL, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 40, feature: 'DIMA (AI advisor Mandiri)', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 41, feature: 'Stock Recommendation (AI/expert)', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 42, feature: 'Trading Signals', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 43, feature: 'Algo / Strategi Otomatis', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
    ],
  },
  {
    title: 'Komunitas & Edukasi',
    rows: [
      { no: 44, feature: 'Forum / Komunitas Investor', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 45, feature: 'Stream / Social Feed', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 46, feature: 'Virtual Trading (simulasi)', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 47, feature: 'Edukasi / Learning Center', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 48, feature: 'Stockbit Academy (video on-demand)', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 49, feature: 'Market News Real-time', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 50, feature: 'Stock News Filter', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 51, feature: "Growin' News & Stock Pick", values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 52, feature: 'MOST Forum', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 53, feature: 'Webinar / Event Edukasi', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Passive Income & Rewards',
    rows: [
      { no: 54, feature: 'Crypto Staking / Earn', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 55, feature: 'Dividend Tracking', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, UNAVAILABLE) },
      { no: 56, feature: 'Cashback / Stockback Program', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 57, feature: 'HOTS Championship (trading contest)', values: values(AVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 58, feature: 'Loyalty / Referral Program', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Onboarding & Akun',
    rows: [
      { no: 59, feature: 'Registrasi 100% Online', values: values(PARTIAL, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 60, feature: 'Biometric Login', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 61, feature: '2FA (Two-Factor Auth)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 62, feature: 'Modal Minimal < Rp10.000', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 63, feature: 'Saham AS mulai $1', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 64, feature: 'RDN terintegrasi', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 65, feature: 'Multi-RDN Bank options', values: values(AVAILABLE, AVAILABLE, PARTIAL, PARTIAL, AVAILABLE) },
      { no: 66, feature: 'Integrasi Super-App Bank', values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 67, feature: 'Sharia Account', values: values(AVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Portfolio & Manajemen',
    rows: [
      { no: 68, feature: 'Portfolio Dashboard Multi-aset', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 69, feature: 'Unrealized & Realized P&L', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 70, feature: 'Riwayat Transaksi', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 71, feature: 'Price Alert / Notifikasi Harga', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 72, feature: 'Goals / Target Keuangan', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 73, feature: 'Tax Report', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 74, feature: '24/7 Deposit & Withdrawal', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
    ],
  },
  {
    title: 'Keamanan & Regulasi',
    rows: [
      { no: 75, feature: 'Diawasi OJK', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 76, feature: 'Terdaftar BEI / Bursa Efek', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 77, feature: 'Fireblocks / Enterprise Security', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, UNAVAILABLE) },
      { no: 78, feature: 'Enkripsi Data Transaksi', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 79, feature: 'Dana di RDN (terpisah)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 80, feature: 'Trusted Device / Session Mgmt', values: values(PARTIAL, UNAVAILABLE, AVAILABLE, AVAILABLE, PARTIAL) },
    ],
  },
  {
    title: 'Platform & Aksesibilitas',
    rows: [
      { no: 81, feature: 'Aplikasi Mobile (iOS & Android)', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 82, feature: 'Web / Desktop App', values: values(AVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 83, feature: 'Pro / Dark Mode', values: values(UNAVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 84, feature: 'Lite Mode (pemula)', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 85, feature: 'Pro View (advanced trader)', values: values(AVAILABLE, UNAVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
      { no: 86, feature: "Integrasi Livin' by Mandiri", values: values(UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, UNAVAILABLE, AVAILABLE) },
      { no: 87, feature: 'Customer Support Chat in-app', values: values(AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE, AVAILABLE) },
    ],
  },
];

const statusClasses: Record<StatusValue, string> = {
  [AVAILABLE]: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  [UNAVAILABLE]: 'bg-red-50 text-red-600 ring-red-100',
  [PARTIAL]: 'bg-amber-50 text-amber-700 ring-amber-100',
};

const statusLabels: Record<StatusValue, string> = {
  [AVAILABLE]: 'Tersedia',
  [UNAVAILABLE]: 'Tidak tersedia',
  [PARTIAL]: 'Tersedia sebagian / terbatas',
};

const StatusBadge: React.FC<{ value: StatusValue }> = ({ value }) => (
  <span className={`inline-flex min-w-[58px] justify-center rounded-full px-3 py-1.5 text-xs font-black ring-1 ${statusClasses[value]}`} title={statusLabels[value]}>
    {value}
  </span>
);

const CompetitorFeatureComparison: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<CompetitorKey[]>(competitors.map((competitor) => competitor.key));

  const selectedCompetitors = useMemo(
    () => competitors.filter((competitor) => selectedProducts.includes(competitor.key)),
    [selectedProducts],
  );

  const toggleProduct = (productKey: CompetitorKey) => {
    setSelectedProducts((current) =>
      current.includes(productKey)
        ? current.filter((key) => key !== productKey)
        : [...current, productKey],
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in space-y-6 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Competitor Analysis</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Feature Comparison</h1>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-semibold text-slate-500 shadow-sm lg:text-right">
          <p>
            Latest Update <span className="font-black text-orange-500">18 May 2026</span>
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Legend</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {([AVAILABLE, UNAVAILABLE, PARTIAL] as StatusValue[]).map((status) => (
            <div key={status} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2">
              <StatusBadge value={status} />
              <span className="text-sm font-bold text-slate-600">{statusLabels[status]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Select Products</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {competitors.map((competitor) => {
                const isSelected = selectedProducts.includes(competitor.key);

                return (
                  <label
                    key={competitor.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-black transition ${competitor.checkbox} ${isSelected ? 'shadow-sm' : 'opacity-55 grayscale'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProduct(competitor.key)}
                      className="sr-only"
                    />
                    <span className={`flex h-4 w-4 items-center justify-center rounded-md text-[10px] text-white ${isSelected ? competitor.chip : 'bg-slate-300'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span>{competitor.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 md:pt-1">
            <button
              type="button"
              onClick={() => setSelectedProducts(competitors.map((competitor) => competitor.key))}
              className="text-[11px] font-black uppercase tracking-[0.12em] text-blue-600 transition hover:text-blue-700"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSelectedProducts([])}
              className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 transition hover:text-slate-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-visible rounded-[28px] border border-slate-100 bg-white shadow-sm">
        <div className="sticky top-0 z-30 rounded-t-[28px] border-b border-slate-100 bg-white px-6 py-5 shadow-[0_1px_0_#e2e8f0]">
          <h2 className="text-xl font-black text-slate-900">Comparison Matrix</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Grouped by feature category and benchmarked across selected competitor apps.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead className="sticky top-[89px] z-20 bg-white shadow-[0_1px_0_#e2e8f0]">
              <tr className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                <th className="sticky left-0 z-30 w-20 bg-white px-5 py-5">No.</th>
                <th className="sticky left-20 z-30 w-[330px] bg-white px-5 py-5">Fitur / Kategori</th>
                {selectedCompetitors.map((competitor) => (
                  <th key={competitor.key} className="w-[170px] px-4 py-5 text-center">
                    <span className={competitor.accent}>{competitor.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center">
                    <p className="text-lg font-black text-slate-800">No products selected</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Choose at least one product to view comparison columns.</p>
                  </td>
                </tr>
              ) : (
                comparisonGroups.map((group) => (
                  <React.Fragment key={group.title}>
                    <tr>
                      <td colSpan={2 + selectedCompetitors.length} className="bg-slate-50 px-5 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">{group.title}</p>
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.no} className="group border-b border-slate-100 hover:bg-blue-50/30">
                        <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-5 py-4 text-sm font-black text-slate-400 group-hover:bg-blue-50">
                          {row.no}
                        </td>
                        <td className="sticky left-20 z-10 border-b border-slate-100 bg-white px-5 py-4 text-sm font-black text-slate-800 group-hover:bg-blue-50">
                          {row.feature}
                        </td>
                        {selectedCompetitors.map((competitor) => (
                          <td key={`${row.no}-${competitor.key}`} className="border-b border-slate-100 px-4 py-4 text-center">
                            <StatusBadge value={row.values[competitor.key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CompetitorFeatureComparison;
