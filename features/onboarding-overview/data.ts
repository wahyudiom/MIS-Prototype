import type { TimeGranularity } from "../customer-onboarding/types";
import { dateInputValue, periodBounds } from "../customer-onboarding/utils";

export const CHANNELS = ["Offline", "Web", "Mobile"] as const;
export const SOURCES = ["Organic", "Sales-Assisted", "Non Organic"] as const;
export const ACCOUNT_TYPES = [
  "Regular",
  "Sharia",
  "Margin",
  "Institutional",
] as const;
export const BANKS = ["BCA", "BRI", "Mandiri", "CIMB"] as const;
export type Channel = (typeof CHANNELS)[number];
export type Source = (typeof SOURCES)[number];
export type AccountType = (typeof ACCOUNT_TYPES)[number];
export interface GlobalFilters {
  channel: Channel | "All";
  source: Source | "All";
  accountType: AccountType | "All";
}
export const DEFAULT_FILTERS: GlobalFilters = {
  channel: "All",
  source: "All",
  accountType: "All",
};

export interface Counts {
  total: number;
  submitted: number;
  completed: number;
  inProgress: number;
  kycRejected: number;
  firstTimeRight: number;
  rdnSubmitted: number;
  rdnRejected: number;
  eligible7: number;
  eligible30: number;
  funded7: number;
  funded30: number;
}
/** Daily registration cohorts. All counts represent unique accounts, not attempts.
 * Replace createDemoRecords with an API adapter returning this shape to use real data.
 * Completion = RDN active / registrations; KYC & FTR = count / submissions;
 * RDN reject = rejected / bank submissions; funding = funded / age-eligible registrations.
 * D+7/D+30 cohorts are evaluated as of the observation date, never before maturity.
 */
export interface CohortRecord extends Counts {
  date: string;
  channel: Channel;
  source: Source;
  accountType: AccountType;
  bank: (typeof BANKS)[number];
}
const emptyCounts = (): Counts => ({
  total: 0,
  submitted: 0,
  completed: 0,
  inProgress: 0,
  kycRejected: 0,
  firstTimeRight: 0,
  rdnSubmitted: 0,
  rdnRejected: 0,
  eligible7: 0,
  eligible30: 0,
  funded7: 0,
  funded30: 0,
});
export const percent = (n: number, d: number): number | null =>
  d > 0 ? (n / d) * 100 : null;
const DAY = 86_400_000;

// Deterministic demo assumptions live here, independently of presentation and filtering.
export function createDemoRecords(
  granularity: TimeGranularity,
  period: string,
  now = new Date(),
): CohortRecord[] {
  const { startDate, endDate } = periodBounds(granularity, period);
  const asOf = Date.parse(`${dateInputValue(now)}T00:00:00Z`);
  const end = Math.min(Date.parse(`${endDate}T00:00:00Z`), asOf);
  const records: CohortRecord[] = [];
  for (let day = Date.parse(`${startDate}T00:00:00Z`); day <= end; day += DAY) {
    const date = new Date(day).toISOString().slice(0, 10);
    const age = Math.floor((asOf - day) / DAY);
    CHANNELS.forEach((channel, c) =>
      SOURCES.forEach((source, s) =>
        ACCOUNT_TYPES.forEach((accountType, a) =>
          BANKS.forEach((bank, b) => {
            if (channel === "Mobile" && accountType === "Institutional") return;
            const wave = Math.sin(day / DAY / 27 + c) * 0.09;
            const seed =
              (Math.floor(day / DAY) * 13 + c * 31 + s * 17 + a * 7 + b * 11) %
              23;
            // Seeded fractional rounding keeps small daily segments from always rounding
            // rare events to zero, while retaining integer, repeatable account counts.
            const count = (expected: number, salt: number) => {
              const hash =
                Math.sin(
                  (day / DAY) * 12.9898 +
                    c * 78.233 +
                    s * 37.719 +
                    a * 19.13 +
                    b * 4.17 +
                    salt * 11.37,
                ) * 43758.5453;
              return Math.floor(expected + hash - Math.floor(hash));
            };
            const total = Math.max(
              1,
              Math.round(
                36 *
                  [0.65, 0.45, 1.2][c] *
                  [1, 0.58, 0.42][s] *
                  [1, 0.22, 0.13, 0.08][a] *
                  [1, 0.7, 0.8, 0.5][b] *
                  (1 + wave + seed / 100),
              ),
            );
            const submitted = count(total * (0.83 - s * 0.07 + c * 0.025), 1);
            const kycRejected = count(
              submitted * (0.09 + s * 0.075 + a * 0.022 + seed / 1000),
              2,
            );
            const rdnSubmitted = Math.max(
              0,
              submitted - kycRejected - count(total * 0.025, 3),
            );
            const rdnRejected = count(
              rdnSubmitted *
                ([0.028, 0.049, 0.091, 0.034][b] + s * 0.009 + a * 0.004),
              4,
            );
            const completionRate =
              [0.68, 0.64, 0.73][c] - s * 0.09 - a * 0.075 + wave / 3;
            const completed = Math.min(
              rdnSubmitted - rdnRejected,
              count(total * completionRate * Math.min(1, (age + 2) / 9), 5),
            );
            const inProgress = Math.min(
              total - completed - kycRejected - rdnRejected,
              count(total * (age < 10 ? 0.25 : 0.09), 6),
            );
            const firstTimeRight = Math.min(
              submitted - kycRejected,
              count(submitted * (0.77 - s * 0.065 - a * 0.03 + wave / 4), 7),
            );
            const eligible7 = age >= 7 ? total : 0;
            const eligible30 = age >= 30 ? total : 0;
            const fundingRate =
              0.44 + c * 0.022 - s * 0.08 - a * 0.045 + wave / 4;
            const funded7 = eligible7
              ? Math.min(completed, count(total * fundingRate * 0.64, 8))
              : 0;
            const funded30 = eligible30
              ? Math.min(
                  completed,
                  Math.max(funded7, count(total * fundingRate, 9)),
                )
              : 0;
            records.push({
              date,
              channel,
              source,
              accountType,
              bank,
              total,
              submitted,
              completed,
              inProgress,
              kycRejected,
              firstTimeRight,
              rdnSubmitted,
              rdnRejected,
              eligible7,
              eligible30,
              funded7,
              funded30,
            });
          }),
        ),
      ),
    );
  }
  return records;
}

export function filterRecords(
  records: CohortRecord[],
  filters: GlobalFilters,
): CohortRecord[] {
  return records.filter(
    (row) =>
      (filters.channel === "All" || row.channel === filters.channel) &&
      (filters.source === "All" || row.source === filters.source) &&
      (filters.accountType === "All" ||
        row.accountType === filters.accountType),
  );
}

export function summarize(records: CohortRecord[]) {
  const counts = records.reduce((sum, row) => {
    for (const key of Object.keys(sum) as (keyof Counts)[])
      sum[key] += row[key];
    return sum;
  }, emptyCounts());
  return {
    ...counts,
    submissionRate: percent(counts.submitted, counts.total),
    completionRate: percent(counts.completed, counts.total),
    inProgressRate: percent(counts.inProgress, counts.total),
    kycRate: percent(counts.kycRejected, counts.submitted),
    ftrRate: percent(counts.firstTimeRight, counts.submitted),
    rdnRate: percent(counts.rdnRejected, counts.rdnSubmitted),
    funded7Rate: percent(counts.funded7, counts.eligible7),
    funded30Rate: percent(counts.funded30, counts.eligible30),
    dormantRate: percent(
      counts.eligible30 - counts.funded30,
      counts.eligible30,
    ),
  };
}
export type Summary = ReturnType<typeof summarize>;

function groupBy(records: CohortRecord[], key: (row: CohortRecord) => string) {
  const groups = new Map<string, CohortRecord[]>();
  records.forEach((row) => {
    const value = key(row);
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value)!.push(row);
  });
  return [...groups].sort(([a], [b]) => a.localeCompare(b));
}

export function buildDashboard(
  records: CohortRecord[],
  granularity: TimeGranularity,
  filters: GlobalFilters,
) {
  const selected = filterRecords(records, filters);
  const channels = CHANNELS.filter(
    (channel) => filters.channel === "All" || channel === filters.channel,
  );
  const accountTypes = ACCOUNT_TYPES.filter(
    (type) => filters.accountType === "All" || type === filters.accountType,
  );
  const sources = SOURCES.filter(
    (source) => filters.source === "All" || source === filters.source,
  );
  const monthLabel = (key: string) =>
    new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  const monthly = groupBy(selected, (row) => row.date.slice(0, 7)).map(
    ([key, rows]) => ({
      label: monthLabel(key),
      ...summarize(rows),
      ...(Object.fromEntries(
        CHANNELS.map((channel) => [
          channel,
          summarize(rows.filter((row) => row.channel === channel)).total,
        ]),
      ) as Record<Channel, number>),
    }),
  );
  const trends = groupBy(selected, (row) => {
    if (granularity === "daily") return row.date;
    if (granularity === "yearly") return row.date.slice(0, 4);
    if (granularity === "quarterly")
      return `${row.date.slice(0, 4)}-Q${Math.ceil(Number(row.date.slice(5, 7)) / 3)}`;
    return row.date.slice(0, 7);
  }).map(([key, rows]) => ({
    label:
      granularity === "monthly"
        ? monthLabel(key)
        : granularity === "daily"
          ? `${key.slice(8)} ${monthLabel(key.slice(0, 7))}`
          : key,
    ...summarize(rows),
    web: summarize(rows.filter((row) => row.channel === "Web")).total,
  }));
  return {
    total: summarize(selected),
    channels,
    accountTypes,
    monthly,
    trends,
    conversion: channels
      .filter((channel) => channel !== "Offline")
      .map((channel) => ({
        channel,
        ...summarize(selected.filter((row) => row.channel === channel)),
      })),
    sources: SOURCES.map((source) => ({
      source,
      ...summarize(selected.filter((row) => row.source === source)),
    })),
    matrix: channels.map((channel) => ({
      channel,
      cells: accountTypes.map((type) => ({
        type,
        ...summarize(
          selected.filter(
            (row) => row.channel === channel && row.accountType === type,
          ),
        ),
      })),
    })),
    banks: BANKS.map((bank) => ({
      bank,
      ...summarize(selected.filter((row) => row.bank === bank)),
    }))
      .filter((row) => row.rdnSubmitted > 0)
      .sort((a, b) => (b.rdnRate ?? 0) - (a.rdnRate ?? 0)),
    segments: channels
      .flatMap((channel) =>
        sources.map((source) => ({
          label: `${channel} · ${source}`,
          ...summarize(
            selected.filter(
              (row) => row.channel === channel && row.source === source,
            ),
          ),
        })),
      )
      .filter((row) => row.total > 0),
  };
}
