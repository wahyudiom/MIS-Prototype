import React, { useMemo, useState } from 'react';
import { CalendarIcon, DownloadIcon } from '../components/Icons';

type ReportMode = 'weekly' | 'monthly';

type SnapshotPoint = {
  label: string;
  value: number;
};

type SnapshotRow = {
  competitor: string;
  focus: string;
  movement: string;
  signal: 'Rising' | 'Stable' | 'Watch';
};

type ReportConfig = {
  sectionLabel: string;
  title: string;
  summaryHeading: string;
  summary: string;
  changesHeading: string;
  bullets: string[];
  tableTitle: string;
  tableRows: SnapshotRow[];
};

type ReportListItem = {
  id: string;
  mode: ReportMode;
  title: string;
  date: string;
  typeLabel: 'Weekly' | 'Monthly';
  filterValue: string;
  previewTitle: string;
};

const reports: Record<ReportMode, ReportConfig> = {
  weekly: {
    sectionLabel: 'Weekly Competitor Report',
    title: '12-18 May 2026',
    summaryHeading: 'Executive Summary',
    summary:
      'This benchmark compares public mobile stock trading app updates from Stockbit, Ajaib, MStock, and Growin\' by Mandiri Sekuritas for the main period of 12-18 May 2026, using fallback updates from the last 30-90 days where no explicit main-period feature update was found. Stockbit is the only app with a clearly explicit and substantial new stock-trading feature update in the main period, strengthening insight-based workflows, market flow visibility, broker activity analysis, and historical data capabilities. Ajaib, MStock, and Growin\' mainly show experience improvements, bug fixing, performance, reliability, or compatibility improvements rather than clearly new stock-trading features.',
    changesHeading: 'What Changed This Week',
    bullets: [
      'Stockbit launched the most explicit feature expansion, including AI Summary in Stream Report, Merge Order ID in Running Trade, Accumulation & Distribution Scale, Trade Flow Historical Data with custom date range, Shareholder Composition, Total Transaction Value/Orders, and Broker Daily Activity.',
      'Ajaib had relevant public updates around 13 May 2026 and 27 April 2026, but the visible release notes were broad experience improvements and did not clearly mention new stock-trading features.',
      'MStock did not show a main-period feature launch; the latest fallback update emphasized faster, more reliable, and smoother trading experience.',
      'Growin\' had a same-week update, but it focused on bug fixes, performance improvements, and UI fixes for Samsung Ultra Series rather than a new stock-trading feature.',
      'Feature-update strength for the period is best read as: Stockbit > Growin\' / Ajaib > MStock.',
    ],
    tableTitle: 'Mobile Trading Feature Benchmark',
    tableRows: [
      { competitor: 'Stockbit', focus: 'Analytics, market flow, broker activity, decision support', movement: 'Clear new feature launch', signal: 'Rising' },
      { competitor: 'Ajaib', focus: 'Smoothing, improvement, experience enhancement', movement: 'No explicit stock feature', signal: 'Stable' },
      { competitor: 'MStock', focus: 'Speed, reliability, smoother trading experience', movement: 'Fallback improvement update', signal: 'Watch' },
      { competitor: 'Growin\'', focus: 'Bug fixes, performance, Samsung Ultra UI compatibility', movement: 'Quality improvement', signal: 'Stable' },
    ],
  },
  monthly: {
    sectionLabel: 'Monthly Competitor Report',
    title: 'January 2026',
    summaryHeading: 'Monthly Summary',
    summary:
      'January showed a broad return to product-led communication after year-end campaign activity. Competitors leaned into wealth product education, recurring market notes, and account activation messaging rather than heavy promotional discounting.',
    changesHeading: 'What Changed This Month',
    bullets: [
      'Product education became the strongest monthly theme, especially across fixed income and mutual fund communication.',
      'Retail onboarding campaigns were more consistent than December, with clearer calls to activate and fund accounts.',
      'Institutional messaging remained selective, mostly centered on research distribution and market access.',
      'Competitor positioning stayed rational; no aggressive price war pattern was visible during the month.',
    ],
    tableTitle: 'Monthly Signal Table',
    tableRows: [
      { competitor: 'Broker A', focus: 'Education content', movement: 'Strong increase', signal: 'Rising' },
      { competitor: 'Broker B', focus: 'Activation journey', movement: 'Moderate increase', signal: 'Rising' },
      { competitor: 'Broker C', focus: 'Research notes', movement: 'Stable cadence', signal: 'Stable' },
      { competitor: 'Others', focus: 'Campaign offers', movement: 'Fragmented', signal: 'Watch' },
    ],
  },
};

const reportListItems: Record<ReportMode, ReportListItem[]> = {
  weekly: [
    { id: 'week-22', mode: 'weekly', title: 'Week 22 competitor report', date: '22/05/2026', typeLabel: 'Weekly', filterValue: '12-18 May 2026', previewTitle: '12-18 May 2026' },
    { id: 'week-21', mode: 'weekly', title: 'Week 21 competitor report', date: '19/05/2026', typeLabel: 'Weekly', filterValue: 'Week 21 2026', previewTitle: 'Week 21 2026' },
    { id: 'week-20', mode: 'weekly', title: 'Week 20 competitor report', date: '12/05/2026', typeLabel: 'Weekly', filterValue: 'Week 20 2026', previewTitle: 'Week 20 2026' },
    { id: 'week-19', mode: 'weekly', title: 'Week 19 competitor report', date: '05/05/2026', typeLabel: 'Weekly', filterValue: 'Week 19 2026', previewTitle: 'Week 19 2026' },
    { id: 'week-18', mode: 'weekly', title: 'Week 18 competitor report', date: '28/04/2026', typeLabel: 'Weekly', filterValue: 'Week 18 2026', previewTitle: 'Week 18 2026' },
  ],
  monthly: [
    { id: 'month-may-2026', mode: 'monthly', title: 'May 2026 competitor report', date: '31/05/2026', typeLabel: 'Monthly', filterValue: 'May 2026', previewTitle: 'May 2026' },
  ],
};

const signalClasses: Record<SnapshotRow['signal'], string> = {
  Rising: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Stable: 'bg-blue-50 text-blue-700 ring-blue-100',
  Watch: 'bg-amber-50 text-amber-700 ring-amber-100',
};

const sanitizePdfText = (value: string) =>
  value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '');

const escapePdfText = (value: string) => sanitizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapText = (text: string, maxChars: number) => {
  const words = sanitizePdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

const buildCompetitorReportPdf = (mode: ReportMode, report: ReportConfig, filter: { label: string; value: string }) => {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 48;
  const bottomMargin = 56;
  const lineHeight = 14;
  const pages: string[] = [];
  let cursorY = pageHeight - 56;
  let content = '';

  const append = (line: string) => {
    content += `${line}\n`;
  };

  const ensureSpace = (height: number) => {
    if (cursorY - height < bottomMargin) {
      pages.push(content);
      content = '';
      cursorY = pageHeight - 56;
    }
  };

  const text = (value: string, x: number, y: number, size = 10, font = 'F1') => {
    append(`BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(value)}) Tj ET`);
  };

  const paragraph = (value: string, x = marginX, maxChars = 92, size = 10, font = 'F1') => {
    const lines = wrapText(value, maxChars);
    ensureSpace(lines.length * lineHeight + 4);
    lines.forEach((line) => {
      text(line, x, cursorY, size, font);
      cursorY -= lineHeight;
    });
    cursorY -= 6;
  };

  const heading = (value: string) => {
    ensureSpace(32);
    text(value, marginX, cursorY, 13, 'F2');
    cursorY -= 24;
  };

  text('Competitor Overview', marginX, cursorY, 20, 'F2');
  cursorY -= 22;
  text(`${filter.label}: ${filter.value}`, marginX, cursorY, 10, 'F2');
  cursorY -= 18;
  text(`${report.sectionLabel} - ${report.title}`, marginX, cursorY, 14, 'F2');
  cursorY -= 34;

  heading(report.summaryHeading);
  paragraph(report.summary);

  heading(report.changesHeading);
  report.bullets.forEach((bullet) => paragraph(`- ${bullet}`, marginX + 10, 88, 10));

  heading('Supporting Snapshot');
  ensureSpace(40);
  text('Competitor', marginX, cursorY, 9, 'F2');
  text('Focus', 160, cursorY, 9, 'F2');
  text('Movement', 360, cursorY, 9, 'F2');
  text('Signal', 485, cursorY, 9, 'F2');
  cursorY -= 18;

  report.tableRows.forEach((row) => {
    const focusLines = wrapText(row.focus, 32);
    const rowHeight = Math.max(1, focusLines.length) * 12 + 10;
    ensureSpace(rowHeight);
    text(row.competitor, marginX, cursorY, 9, 'F2');
    focusLines.forEach((line, index) => text(line, 160, cursorY - index * 12, 8.5));
    text(row.movement, 360, cursorY, 8.5);
    text(row.signal, 485, cursorY, 8.5, 'F2');
    cursorY -= rowHeight;
  });

  pages.push(content);

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const addObject = (object: string) => {
    objects.push(object);
    return objects.length;
  };

  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('');
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  pages.forEach((pageContent) => {
    const contentId = addObject(`<< /Length ${pageContent.length} >>\nstream\n${pageContent}endstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageObjectIds.push(pageId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

const downloadTextFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ReportTable: React.FC<{ rows: SnapshotRow[] }> = ({ rows }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-100">
    <table className="w-full min-w-[560px] text-left">
      <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        <tr>
          <th className="px-5 py-4">Competitor</th>
          <th className="px-5 py-4">Focus</th>
          <th className="px-5 py-4">Movement</th>
          <th className="px-5 py-4">Signal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={`${row.competitor}-${row.focus}`}>
            <td className="px-5 py-4 font-black text-slate-900">{row.competitor}</td>
            <td className="px-5 py-4 font-semibold text-slate-600">{row.focus}</td>
            <td className="px-5 py-4 font-semibold text-slate-500">{row.movement}</td>
            <td className="px-5 py-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${signalClasses[row.signal]}`}>
                {row.signal}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CompetitorOverview: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ReportMode>('weekly');
  const [selectedReportId, setSelectedReportId] = useState(reportListItems.weekly[0].id);

  const currentReportItems = reportListItems[activeMode];
  const selectedReport = currentReportItems.find((item) => item.id === selectedReportId) ?? currentReportItems[0];
  const report = reports[selectedReport.mode];

  const filter = useMemo(
    () => ({
      label: selectedReport.mode === 'weekly' ? 'Weekly Filter' : 'Monthly Filter',
      value: selectedReport.filterValue,
    }),
    [selectedReport],
  );

  const handleModeChange = (mode: ReportMode) => {
    setActiveMode(mode);
    setSelectedReportId(reportListItems[mode][0].id);
  };

  const handleDownloadPdf = () => {
    const pdf = buildCompetitorReportPdf(selectedReport.mode, { ...report, title: selectedReport.previewTitle }, filter);
    const fileName = `competitor-report-${selectedReport.id}.pdf`;
    downloadTextFile(pdf, fileName, 'application/pdf');
  };

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in space-y-6 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Competitor Reports</h1>
        <p className="text-sm font-bold text-slate-500">
          Last updated <span className="text-slate-900">May 19, 2026</span>
        </p>
      </header>

      <section className="grid min-h-[760px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex border-b border-slate-200">
            {(['weekly', 'monthly'] as ReportMode[]).map((mode) => {
              const isActive = activeMode === mode;
              const label = mode === 'weekly' ? 'Weekly' : 'Monthly';
              const count = reportListItems[mode].length;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-5 py-4 text-sm font-black transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/40 text-blue-600'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-slate-100">
            {currentReportItems.map((item) => {
              const isSelected = item.id === selectedReport.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedReportId(item.id)}
                  className={`group flex w-full items-center justify-between gap-4 border-l-4 px-5 py-5 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent bg-white hover:border-blue-100 hover:bg-slate-50'
                  }`}
                >
                  <span>
                    <span className="block text-base font-black text-slate-800">{item.title}</span>
                    <span className="mt-1 block text-sm font-semibold text-slate-400">{item.date}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-black text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {item.typeLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-[760px] flex-col bg-slate-50/70">
          <div className="border-b border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">{selectedReport.title}</h2>
                <p className="mt-1 text-sm font-bold text-slate-400">
                  {selectedReport.date} · {selectedReport.typeLabel.toLowerCase()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/competitor-analysis/analysis-report?report=${selectedReport.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
                >
                  Open in new tab ↗
                </a>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                >
                  <DownloadIcon className="h-5 w-5" />
                  Download PDF
                </button>

                <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{filter.label}</p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{filter.value}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 sm:p-8">
            <article className="mx-auto max-w-[980px] rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
              <div className="mb-8 border-b border-slate-100 pb-7">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">{report.sectionLabel}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{selectedReport.previewTitle}</h2>
              </div>

              <div className="space-y-8">
                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{report.summaryHeading}</p>
                  <p className="mt-4 text-base font-semibold leading-8 text-slate-600">{report.summary}</p>
                </section>

                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{report.changesHeading}</p>
                  <ul className="mt-4 grid gap-3 pl-5 text-base font-semibold leading-7 text-slate-600">
                    {report.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Supporting Snapshot</p>
                  <div className="mt-4 overflow-x-auto">
                    <ReportTable rows={report.tableRows} />
                  </div>
                </section>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  );
};

export default CompetitorOverview;
