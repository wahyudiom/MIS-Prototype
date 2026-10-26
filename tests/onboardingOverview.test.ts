import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDashboard,
  createDemoRecords,
  DEFAULT_FILTERS,
  filterRecords,
  summarize,
  type CohortRecord,
} from "../features/onboarding-overview/data";

const now = new Date(2026, 8, 15);
const records = createDemoRecords("monthly", "2026-07..2026-09", now);

test("all dashboard breakdowns reconcile with the same combined global filter", () => {
  for (const filters of [
    DEFAULT_FILTERS,
    {
      channel: "Web",
      source: "Sales-Assisted",
      accountType: "Margin",
    } as const,
    { ...DEFAULT_FILTERS, source: "Organic" } as const,
  ]) {
    const data = buildDashboard(records, "monthly", filters);
    const selected = filterRecords(records, filters);
    assert.deepEqual(data.total, summarize(selected));
    for (const breakdown of [
      data.monthly,
      data.trends,
      data.sources,
      data.segments,
      data.matrix.flatMap((row) => row.cells),
    ]) {
      assert.equal(
        breakdown.reduce((sum, row) => sum + row.total, 0),
        data.total.total,
      );
      assert.equal(
        breakdown.reduce((sum, row) => sum + row.completed, 0),
        data.total.completed,
      );
    }
    assert.equal(
      data.banks.reduce((sum, row) => sum + row.rdnRejected, 0),
      data.total.rdnRejected,
    );
    assert.equal(
      data.banks.reduce((sum, row) => sum + row.rdnSubmitted, 0),
      data.total.rdnSubmitted,
    );
    assert.equal(
      data.trends.reduce((sum, row) => sum + row.web, 0),
      summarize(selected.filter((row) => row.channel === "Web")).total,
    );
    assert.ok(
      data.banks.every(
        (row, i) => i === 0 || row.rdnRate! <= data.banks[i - 1].rdnRate!,
      ),
    );
  }
});

test("rates weight counts instead of averaging segment percentages", () => {
  const fixture = (total: number, completed: number): CohortRecord => ({
    ...records[0],
    total,
    completed,
  });
  assert.ok(
    Math.abs(
      summarize([fixture(10, 10), fixture(90, 45)]).completionRate! - 55,
    ) < 1e-10,
  );
});

test("unavailable combinations have zero volume and unavailable rates in every widget", () => {
  const data = buildDashboard(records, "monthly", {
    channel: "Mobile",
    source: "All",
    accountType: "Institutional",
  });
  assert.equal(data.total.total, 0);
  assert.equal(data.total.completionRate, null);
  assert.equal(data.total.funded30Rate, null);
  assert.equal(data.total.kycRate, null);
  assert.equal(data.total.rdnRate, null);
  assert.deepEqual(data.banks, []);
  assert.deepEqual(data.trends, []);
  assert.ok(
    data.matrix.every((row) => row.cells.every((cell) => cell.total === 0)),
  );
});

test("funding waits for exact cohort maturity and never generates future registrations", () => {
  const recent = createDemoRecords("monthly", "2026-09", now);
  assert.ok(recent.every((row) => row.date <= "2026-09-15"));
  assert.equal(summarize(recent).funded30Rate, null);
  assert.equal(summarize(recent).dormantRate, null);
  assert.ok(
    recent
      .filter((row) => row.date === "2026-09-08")
      .every((row) => row.eligible7 === row.total),
  );
  assert.ok(
    recent
      .filter((row) => row.date === "2026-09-09")
      .every((row) => row.eligible7 === 0),
  );
  assert.ok(
    records
      .filter((row) => row.date === "2026-08-16")
      .every((row) => row.eligible30 === row.total),
  );
  assert.ok(
    records
      .filter((row) => row.date === "2026-08-17")
      .every((row) => row.eligible30 === 0),
  );
  const mature = summarize(records);
  assert.ok(Math.abs(mature.funded30Rate! + mature.dormantRate! - 100) < 1e-10);
  assert.ok(
    records.every(
      (row) =>
        row.completed <= row.submitted &&
        row.funded30 <= row.completed &&
        row.funded7 <= row.completed &&
        row.inProgress >= 0,
    ),
  );
});

test("existing time modes select exact bounds and aggregate their respective trend frequencies", () => {
  const daily = createDemoRecords("daily", "2026-08-01..2026-08-02", now);
  assert.deepEqual(
    [...new Set(daily.map((row) => row.date))],
    ["2026-08-01", "2026-08-02"],
  );
  assert.equal(
    buildDashboard(daily, "daily", DEFAULT_FILTERS).trends.length,
    2,
  );
  const quarterly = createDemoRecords("quarterly", "2026-Q1..2026-Q3", now);
  assert.deepEqual(
    buildDashboard(quarterly, "quarterly", DEFAULT_FILTERS).trends.map(
      (row) => row.label,
    ),
    ["2026-Q1", "2026-Q2", "2026-Q3"],
  );
  assert.equal(
    buildDashboard(quarterly, "monthly", DEFAULT_FILTERS).monthly.length,
    9,
  );
  const annual = createDemoRecords("yearly", "2025..2026", now);
  assert.deepEqual(
    buildDashboard(annual, "yearly", DEFAULT_FILTERS).trends.map(
      (row) => row.label,
    ),
    ["2025", "2026"],
  );
  assert.deepEqual(createDemoRecords("monthly", "2026-10", now), []);
});
