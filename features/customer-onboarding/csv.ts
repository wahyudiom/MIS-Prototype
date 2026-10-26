import type { OnProgressCustomerMetric } from './types';

const escapeCsvCell = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildOnProgressCustomerCsv(metric: OnProgressCustomerMetric): string {
  const rows: Array<[string, string | number]> = [
    ['Label', 'Value'],
    ['Total', metric.total],
    ...metric.branches.map((branch): [string, string | number] => [branch.label, branch.value ?? '']),
  ];
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

export function formatCsvDate(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function onProgressCustomerCsvFilename(metric: OnProgressCustomerMetric, date = new Date()): string {
  return `${metric.id}-${formatCsvDate(date)}.csv`;
}

export function downloadOnProgressCustomerCsv(metric: OnProgressCustomerMetric, date = new Date()): void {
  const url = URL.createObjectURL(new Blob([buildOnProgressCustomerCsv(metric)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = onProgressCustomerCsvFilename(metric, date);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
