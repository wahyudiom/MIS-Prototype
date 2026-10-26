export type ProductBreakdownKey = 'equity' | 'mutualFund' | 'bonds';
export type Period = '30d' | '12m';
export type ProductChartProduct = 'equity' | 'mutual-fund' | 'bonds';
export type ChartValueTab = 'transactionValue' | 'assetValue';

export type BreakdownDataPoint = {
  label: string;
  [key: string]: string | number;
};

export type BreakdownSeries = {
  key: string;
  name: string;
  color: string;
  kind?: 'bar' | 'line';
};

export type BreakdownChartType = 'stacked-percentage' | 'buy-sell-trend' | 'asset-value-trend';

export type BreakdownChartDataset = {
  data30d: BreakdownDataPoint[];
  data12m: BreakdownDataPoint[];
  series?: BreakdownSeries[];
  chartType?: BreakdownChartType;
};

export type BreakdownChartValueDatasets = Record<ChartValueTab, BreakdownChartDataset | undefined>;

export type BreakdownChart = {
  title: string;
  subtitle: string;
  chartType?: BreakdownChartType;
  series: BreakdownSeries[];
  data30d: BreakdownDataPoint[];
  data12m: BreakdownDataPoint[];
  valueDatasets?: BreakdownChartValueDatasets;
};

export type BreakdownPageConfig = {
  title: string;
  subtitle: string;
  charts: BreakdownChart[];
};

const clientSegmentSeries: BreakdownSeries[] = [
  { key: 'Retail', name: 'Retail', color: '#2563eb' },
  { key: 'Corporate', name: 'Corporate', color: '#f97316' },
  { key: 'Institutional', name: 'Institutional', color: '#8b5cf6' },
];

const withInstitutionalSegment = (
  data: BreakdownDataPoint[],
  institutionalPattern: number[] = [12, 14, 13, 15, 11],
): BreakdownDataPoint[] =>
  data.map((point, index) => {
    const institutional = institutionalPattern[index % institutionalPattern.length];
    const retailBase = Number(point.Retail) || 0;
    const corporateBase = Number(point.Corporate) || 0;
    const remaining = 100 - institutional;
    const baseTotal = retailBase + corporateBase || 100;
    const retail = Math.round((retailBase / baseTotal) * remaining);
    const corporate = remaining - retail;

    return {
      label: point.label,
      Retail: retail,
      Corporate: corporate,
      Institutional: institutional,
    };
  });

const withTotalAmount = (
  data: BreakdownDataPoint[],
  totalsPattern: number[],
): BreakdownDataPoint[] =>
  data.map((point, index) => ({
    ...point,
    totalAmount: totalsPattern[index % totalsPattern.length],
  }));

const baseProductBreakdownConfigs: Record<ProductBreakdownKey, BreakdownPageConfig> = {
  equity: {
    title: 'Equity Breakdown Diagnostic',
    subtitle: 'Trading value share by Client Segment & Regional Area',
    charts: [
      {
        title: 'Transaction Trend',
        subtitle: 'Buy and sell activity with nett amount',
        chartType: 'buy-sell-trend',
        series: [
          { key: 'Buy', name: 'Buy', color: '#10b981', kind: 'bar' },
          { key: 'Sell', name: 'Sell', color: '#ef4444', kind: 'bar' },
          { key: 'Nett', name: 'Nett', color: '#f97316', kind: 'line' },
        ],
        data30d: withTotalAmount([
          { label: '1', Buy: 11.8, Sell: 9.4, Nett: 2.4 }, { label: '2', Buy: 13.6, Sell: 10.7, Nett: 2.9 },
          { label: '3', Buy: 10.2, Sell: 12.1, Nett: -1.9 }, { label: '4', Buy: 14.1, Sell: 11.2, Nett: 2.9 },
          { label: '5', Buy: 16.5, Sell: 12.8, Nett: 3.7 }, { label: '6', Buy: 12.4, Sell: 13.9, Nett: -1.5 },
          { label: '7', Buy: 15.2, Sell: 11.5, Nett: 3.7 }, { label: '8', Buy: 17.8, Sell: 12.4, Nett: 5.4 },
          { label: '9', Buy: 13.5, Sell: 14.2, Nett: -0.7 }, { label: '10', Buy: 12.7, Sell: 15.1, Nett: -2.4 },
          { label: '11', Buy: 18.9, Sell: 13.6, Nett: 5.3 }, { label: '12', Buy: 16.1, Sell: 12.3, Nett: 3.8 },
          { label: '13', Buy: 14.8, Sell: 13.5, Nett: 1.3 }, { label: '14', Buy: 11.9, Sell: 14.7, Nett: -2.8 },
          { label: '15', Buy: 19.4, Sell: 13.2, Nett: 6.2 }, { label: '16', Buy: 17.1, Sell: 14.8, Nett: 2.3 },
          { label: '17', Buy: 15.6, Sell: 12.6, Nett: 3.0 }, { label: '18', Buy: 13.8, Sell: 15.9, Nett: -2.1 },
          { label: '19', Buy: 20.1, Sell: 14.1, Nett: 6.0 }, { label: '20', Buy: 18.7, Sell: 15.4, Nett: 3.3 },
          { label: '21', Buy: 12.9, Sell: 16.7, Nett: -3.8 }, { label: '22', Buy: 16.2, Sell: 13.1, Nett: 3.1 },
          { label: '23', Buy: 21.4, Sell: 15.2, Nett: 6.2 }, { label: '24', Buy: 18.3, Sell: 16.4, Nett: 1.9 },
          { label: '25', Buy: 14.7, Sell: 12.6, Nett: 2.1 }, { label: '26', Buy: 11.6, Sell: 14.9, Nett: -3.3 },
          { label: '27', Buy: 17.5, Sell: 13.8, Nett: 3.7 }, { label: '28', Buy: 19.8, Sell: 14.7, Nett: 5.1 },
          { label: '29', Buy: 13.4, Sell: 15.6, Nett: -2.2 }, { label: '30', Buy: 22.3, Sell: 16.1, Nett: 6.2 },
        ], [182.4, 196.7, 188.5, 204.2, 216.8]),
        data12m: withTotalAmount([
          { label: 'Jan', Buy: 188, Sell: 172, Nett: 16 }, { label: 'Feb', Buy: 214, Sell: 186, Nett: 28 },
          { label: 'Mar', Buy: 176, Sell: 194, Nett: -18 }, { label: 'Apr', Buy: 228, Sell: 201, Nett: 27 },
          { label: 'May', Buy: 245, Sell: 218, Nett: 27 }, { label: 'Jun', Buy: 203, Sell: 226, Nett: -23 },
          { label: 'Jul', Buy: 258, Sell: 214, Nett: 44 }, { label: 'Aug', Buy: 271, Sell: 223, Nett: 48 },
          { label: 'Sep', Buy: 219, Sell: 235, Nett: -16 }, { label: 'Oct', Buy: 286, Sell: 241, Nett: 45 },
          { label: 'Nov', Buy: 243, Sell: 228, Nett: 15 }, { label: 'Dec', Buy: 302, Sell: 247, Nett: 55 },
        ], [186.3, 201.5, 193.8, 211.7]),
      },
      {
        title: 'By Client Segment',
        subtitle: 'Trading value share by Client Segment',
        series: clientSegmentSeries,
        data30d: withTotalAmount(withInstitutionalSegment([
          { label: '1', Retail: 59, Corporate: 41 }, { label: '2', Retail: 65, Corporate: 35 }, { label: '3', Retail: 58, Corporate: 42 },
          { label: '4', Retail: 62, Corporate: 38 }, { label: '5', Retail: 66, Corporate: 34 }, { label: '6', Retail: 60, Corporate: 40 },
          { label: '7', Retail: 64, Corporate: 36 }, { label: '8', Retail: 61, Corporate: 39 }, { label: '9', Retail: 62, Corporate: 38 },
          { label: '10', Retail: 57, Corporate: 43 }, { label: '11', Retail: 57, Corporate: 43 }, { label: '12', Retail: 61, Corporate: 39 },
          { label: '13', Retail: 62, Corporate: 38 }, { label: '14', Retail: 61, Corporate: 39 }, { label: '15', Retail: 64, Corporate: 36 },
          { label: '16', Retail: 69, Corporate: 31 }, { label: '17', Retail: 60, Corporate: 40 }, { label: '18', Retail: 69, Corporate: 31 },
          { label: '19', Retail: 63, Corporate: 37 }, { label: '20', Retail: 65, Corporate: 35 }, { label: '21', Retail: 61, Corporate: 39 },
          { label: '22', Retail: 62, Corporate: 38 }, { label: '23', Retail: 57, Corporate: 43 }, { label: '24', Retail: 61, Corporate: 39 },
          { label: '25', Retail: 63, Corporate: 37 }, { label: '26', Retail: 65, Corporate: 35 }, { label: '27', Retail: 60, Corporate: 40 },
          { label: '28', Retail: 62, Corporate: 38 }, { label: '29', Retail: 58, Corporate: 42 }, { label: '30', Retail: 65, Corporate: 35 },
        ], [12, 13, 14, 12, 15, 11]), [248.6, 264.2, 239.8, 271.4, 286.1, 252.7]),
        data12m: withTotalAmount(withInstitutionalSegment([
          { label: 'Jan', Retail: 62, Corporate: 38 }, { label: 'Feb', Retail: 64, Corporate: 36 }, { label: 'Mar', Retail: 61, Corporate: 39 },
          { label: 'Apr', Retail: 66, Corporate: 34 }, { label: 'May', Retail: 63, Corporate: 37 }, { label: 'Jun', Retail: 65, Corporate: 35 },
          { label: 'Jul', Retail: 67, Corporate: 33 }, { label: 'Aug', Retail: 64, Corporate: 36 }, { label: 'Sep', Retail: 60, Corporate: 40 },
          { label: 'Oct', Retail: 62, Corporate: 38 }, { label: 'Nov', Retail: 65, Corporate: 35 }, { label: 'Dec', Retail: 68, Corporate: 32 },
        ], [13, 12, 14, 11]), [252.4, 268.1, 244.7, 279.5]),
      },
      {
        title: 'By Regional Area',
        subtitle: 'Trading value share by Area Manager cluster',
        series: [
          { key: 'Jabodetabek', name: 'Jabodetabek', color: '#2563eb' },
          { key: 'WestJava', name: 'West Java', color: '#8b5cf6' },
          { key: 'CentralJava', name: 'Central Java', color: '#10b981' },
          { key: 'EastJava', name: 'East Java', color: '#f59e0b' },
          { key: 'OutsideJava', name: 'Outside Java', color: '#ef4444' },
        ],
        data30d: withTotalAmount([
          { label: '1', Jabodetabek: 41, WestJava: 16, CentralJava: 13, EastJava: 10, OutsideJava: 20 },
          { label: '2', Jabodetabek: 40, WestJava: 17, CentralJava: 14, EastJava: 10, OutsideJava: 19 },
          { label: '3', Jabodetabek: 39, WestJava: 16, CentralJava: 14, EastJava: 11, OutsideJava: 20 },
          { label: '4', Jabodetabek: 47, WestJava: 14, CentralJava: 11, EastJava: 8, OutsideJava: 20 },
          { label: '5', Jabodetabek: 40, WestJava: 17, CentralJava: 13, EastJava: 10, OutsideJava: 20 },
          { label: '6', Jabodetabek: 42, WestJava: 15, CentralJava: 14, EastJava: 10, OutsideJava: 19 },
          { label: '7', Jabodetabek: 43, WestJava: 15, CentralJava: 13, EastJava: 9, OutsideJava: 20 },
          { label: '8', Jabodetabek: 46, WestJava: 15, CentralJava: 12, EastJava: 9, OutsideJava: 18 },
          { label: '9', Jabodetabek: 43, WestJava: 16, CentralJava: 12, EastJava: 9, OutsideJava: 20 },
          { label: '10', Jabodetabek: 44, WestJava: 16, CentralJava: 12, EastJava: 9, OutsideJava: 19 },
          { label: '11', Jabodetabek: 46, WestJava: 15, CentralJava: 12, EastJava: 10, OutsideJava: 17 },
          { label: '12', Jabodetabek: 42, WestJava: 16, CentralJava: 13, EastJava: 11, OutsideJava: 18 },
          { label: '13', Jabodetabek: 41, WestJava: 16, CentralJava: 13, EastJava: 11, OutsideJava: 19 },
          { label: '14', Jabodetabek: 43, WestJava: 15, CentralJava: 15, EastJava: 10, OutsideJava: 17 },
          { label: '15', Jabodetabek: 42, WestJava: 15, CentralJava: 15, EastJava: 8, OutsideJava: 20 },
          { label: '16', Jabodetabek: 39, WestJava: 16, CentralJava: 13, EastJava: 11, OutsideJava: 21 },
          { label: '17', Jabodetabek: 41, WestJava: 15, CentralJava: 14, EastJava: 10, OutsideJava: 20 },
          { label: '18', Jabodetabek: 44, WestJava: 16, CentralJava: 12, EastJava: 10, OutsideJava: 18 },
          { label: '19', Jabodetabek: 43, WestJava: 16, CentralJava: 12, EastJava: 9, OutsideJava: 20 },
          { label: '20', Jabodetabek: 39, WestJava: 17, CentralJava: 14, EastJava: 10, OutsideJava: 20 },
          { label: '21', Jabodetabek: 40, WestJava: 16, CentralJava: 14, EastJava: 10, OutsideJava: 20 },
          { label: '22', Jabodetabek: 39, WestJava: 17, CentralJava: 15, EastJava: 10, OutsideJava: 19 },
          { label: '23', Jabodetabek: 43, WestJava: 15, CentralJava: 13, EastJava: 9, OutsideJava: 20 },
          { label: '24', Jabodetabek: 38, WestJava: 17, CentralJava: 15, EastJava: 10, OutsideJava: 20 },
          { label: '25', Jabodetabek: 38, WestJava: 17, CentralJava: 15, EastJava: 10, OutsideJava: 20 },
          { label: '26', Jabodetabek: 40, WestJava: 16, CentralJava: 13, EastJava: 9, OutsideJava: 22 },
          { label: '27', Jabodetabek: 39, WestJava: 17, CentralJava: 14, EastJava: 10, OutsideJava: 20 },
          { label: '28', Jabodetabek: 40, WestJava: 17, CentralJava: 15, EastJava: 10, OutsideJava: 18 },
          { label: '29', Jabodetabek: 40, WestJava: 17, CentralJava: 15, EastJava: 10, OutsideJava: 18 },
          { label: '30', Jabodetabek: 40, WestJava: 17, CentralJava: 13, EastJava: 10, OutsideJava: 20 },
        ], [261.8, 258.4, 249.6, 284.3, 266.7, 272.9]),
        data12m: withTotalAmount([
          { label: 'Jan', Jabodetabek: 42, WestJava: 16, CentralJava: 13, EastJava: 10, OutsideJava: 19 },
          { label: 'Feb', Jabodetabek: 43, WestJava: 15, CentralJava: 14, EastJava: 9, OutsideJava: 19 },
          { label: 'Mar', Jabodetabek: 41, WestJava: 17, CentralJava: 13, EastJava: 10, OutsideJava: 19 },
          { label: 'Apr', Jabodetabek: 45, WestJava: 15, CentralJava: 12, EastJava: 9, OutsideJava: 19 },
          { label: 'May', Jabodetabek: 40, WestJava: 18, CentralJava: 13, EastJava: 10, OutsideJava: 19 },
          { label: 'Jun', Jabodetabek: 44, WestJava: 15, CentralJava: 13, EastJava: 10, OutsideJava: 18 },
          { label: 'Jul', Jabodetabek: 43, WestJava: 16, CentralJava: 12, EastJava: 9, OutsideJava: 20 },
          { label: 'Aug', Jabodetabek: 41, WestJava: 17, CentralJava: 14, EastJava: 10, OutsideJava: 18 },
          { label: 'Sep', Jabodetabek: 39, WestJava: 18, CentralJava: 14, EastJava: 10, OutsideJava: 19 },
          { label: 'Oct', Jabodetabek: 42, WestJava: 16, CentralJava: 13, EastJava: 10, OutsideJava: 19 },
          { label: 'Nov', Jabodetabek: 40, WestJava: 17, CentralJava: 14, EastJava: 10, OutsideJava: 19 },
          { label: 'Dec', Jabodetabek: 44, WestJava: 15, CentralJava: 12, EastJava: 9, OutsideJava: 20 },
        ], [264.5, 271.2, 255.8, 289.1]),
      },
    ],
  },
  mutualFund: {
    title: 'Mutual Fund Breakdown Diagnostic',
    subtitle: 'Subscription share by Client Segment & Fund Type',
    charts: [
      {
        title: 'Transaction Trend',
        subtitle: 'Subscription and redemption activity with nett amount',
        chartType: 'buy-sell-trend',
        series: [
          { key: 'Subscribe', name: 'Subscribe', color: '#10b981', kind: 'bar' },
          { key: 'Redeem', name: 'Redeem', color: '#ef4444', kind: 'bar' },
          { key: 'Nett', name: 'Nett', color: '#f97316', kind: 'line' },
        ],
        data30d: withTotalAmount([
          { label: '1', Subscribe: 8.4, Redeem: 6.1, Nett: 2.3 }, { label: '2', Subscribe: 9.7, Redeem: 7.5, Nett: 2.2 },
          { label: '3', Subscribe: 7.1, Redeem: 8.3, Nett: -1.2 }, { label: '4', Subscribe: 10.4, Redeem: 7.8, Nett: 2.6 },
          { label: '5', Subscribe: 11.8, Redeem: 9.4, Nett: 2.4 }, { label: '6', Subscribe: 8.6, Redeem: 9.8, Nett: -1.2 },
          { label: '7', Subscribe: 10.9, Redeem: 8.1, Nett: 2.8 }, { label: '8', Subscribe: 12.5, Redeem: 8.6, Nett: 3.9 },
          { label: '9', Subscribe: 9.2, Redeem: 9.7, Nett: -0.5 }, { label: '10', Subscribe: 8.4, Redeem: 10.8, Nett: -2.4 },
          { label: '11', Subscribe: 13.6, Redeem: 9.3, Nett: 4.3 }, { label: '12', Subscribe: 11.4, Redeem: 8.5, Nett: 2.9 },
          { label: '13', Subscribe: 10.5, Redeem: 8.8, Nett: 1.7 }, { label: '14', Subscribe: 7.8, Redeem: 10.6, Nett: -2.8 },
          { label: '15', Subscribe: 14.2, Redeem: 9.1, Nett: 5.1 }, { label: '16', Subscribe: 12.6, Redeem: 10.4, Nett: 2.2 },
          { label: '17', Subscribe: 11.1, Redeem: 8.7, Nett: 2.4 }, { label: '18', Subscribe: 9.6, Redeem: 11.2, Nett: -1.6 },
          { label: '19', Subscribe: 14.8, Redeem: 9.8, Nett: 5.0 }, { label: '20', Subscribe: 13.1, Redeem: 10.7, Nett: 2.4 },
          { label: '21', Subscribe: 8.2, Redeem: 11.8, Nett: -3.6 }, { label: '22', Subscribe: 10.8, Redeem: 8.6, Nett: 2.2 },
          { label: '23', Subscribe: 15.3, Redeem: 10.2, Nett: 5.1 }, { label: '24', Subscribe: 12.7, Redeem: 11.1, Nett: 1.6 },
          { label: '25', Subscribe: 9.9, Redeem: 8.4, Nett: 1.5 }, { label: '26', Subscribe: 7.4, Redeem: 10.7, Nett: -3.3 },
          { label: '27', Subscribe: 11.7, Redeem: 9.2, Nett: 2.5 }, { label: '28', Subscribe: 13.9, Redeem: 9.8, Nett: 4.1 },
          { label: '29', Subscribe: 8.8, Redeem: 11.1, Nett: -2.3 }, { label: '30', Subscribe: 16.2, Redeem: 10.5, Nett: 5.7 },
        ], [182.4, 196.7, 188.5, 204.2, 216.8]),
        data12m: withTotalAmount([
          { label: 'Jan', Subscribe: 132, Redeem: 118, Nett: 14 }, { label: 'Feb', Subscribe: 146, Redeem: 126, Nett: 20 },
          { label: 'Mar', Subscribe: 121, Redeem: 135, Nett: -14 }, { label: 'Apr', Subscribe: 158, Redeem: 139, Nett: 19 },
          { label: 'May', Subscribe: 171, Redeem: 151, Nett: 20 }, { label: 'Jun', Subscribe: 138, Redeem: 162, Nett: -24 },
          { label: 'Jul', Subscribe: 182, Redeem: 148, Nett: 34 }, { label: 'Aug', Subscribe: 196, Redeem: 154, Nett: 42 },
          { label: 'Sep', Subscribe: 149, Redeem: 167, Nett: -18 }, { label: 'Oct', Subscribe: 208, Redeem: 173, Nett: 35 },
          { label: 'Nov', Subscribe: 172, Redeem: 161, Nett: 11 }, { label: 'Dec', Subscribe: 224, Redeem: 179, Nett: 45 },
        ], [186.3, 201.5, 193.8, 211.7]),
      },
      {
        title: 'By Client Segment',
        subtitle: 'Subscription share by Client Segment',
        series: clientSegmentSeries,
        data30d: withTotalAmount(withInstitutionalSegment([
          { label: '1', Retail: 73, Corporate: 27 }, { label: '2', Retail: 70, Corporate: 30 }, { label: '3', Retail: 73, Corporate: 27 },
          { label: '4', Retail: 74, Corporate: 26 }, { label: '5', Retail: 67, Corporate: 33 }, { label: '6', Retail: 74, Corporate: 26 },
          { label: '7', Retail: 68, Corporate: 32 }, { label: '8', Retail: 75, Corporate: 25 }, { label: '9', Retail: 71, Corporate: 29 },
          { label: '10', Retail: 69, Corporate: 31 }, { label: '11', Retail: 70, Corporate: 30 }, { label: '12', Retail: 74, Corporate: 26 },
          { label: '13', Retail: 72, Corporate: 28 }, { label: '14', Retail: 73, Corporate: 27 }, { label: '15', Retail: 70, Corporate: 30 },
          { label: '16', Retail: 75, Corporate: 25 }, { label: '17', Retail: 71, Corporate: 29 }, { label: '18', Retail: 70, Corporate: 30 },
          { label: '19', Retail: 69, Corporate: 31 }, { label: '20', Retail: 71, Corporate: 29 }, { label: '21', Retail: 73, Corporate: 27 },
          { label: '22', Retail: 69, Corporate: 31 }, { label: '23', Retail: 73, Corporate: 27 }, { label: '24', Retail: 71, Corporate: 29 },
          { label: '25', Retail: 74, Corporate: 26 }, { label: '26', Retail: 73, Corporate: 27 }, { label: '27', Retail: 75, Corporate: 25 },
          { label: '28', Retail: 69, Corporate: 31 }, { label: '29', Retail: 72, Corporate: 28 }, { label: '30', Retail: 75, Corporate: 25 },
        ], [10, 12, 11, 13, 9]), [96.4, 104.8, 92.3, 110.7, 118.2]),
        data12m: withTotalAmount(withInstitutionalSegment([
          { label: 'Jan', Retail: 71, Corporate: 29 }, { label: 'Feb', Retail: 72, Corporate: 28 }, { label: 'Mar', Retail: 70, Corporate: 30 },
          { label: 'Apr', Retail: 74, Corporate: 26 }, { label: 'May', Retail: 69, Corporate: 31 }, { label: 'Jun', Retail: 73, Corporate: 27 },
          { label: 'Jul', Retail: 75, Corporate: 25 }, { label: 'Aug', Retail: 72, Corporate: 28 }, { label: 'Sep', Retail: 70, Corporate: 30 },
          { label: 'Oct', Retail: 73, Corporate: 27 }, { label: 'Nov', Retail: 74, Corporate: 26 }, { label: 'Dec', Retail: 75, Corporate: 25 },
        ], [11, 10, 12, 9]), [98.6, 107.1, 95.2, 116.4]),
      },
      {
        title: 'By Fund Type',
        subtitle: 'Subscription share by mutual fund category',
        series: [
          { key: 'EquityFund', name: 'Equity Fund', color: '#2563eb' },
          { key: 'MoneyMarketFund', name: 'Money Market Fund', color: '#10b981' },
          { key: 'FixedIncomeFund', name: 'Fixed Income Fund', color: '#f59e0b' },
          { key: 'BalancedFund', name: 'Balanced Fund', color: '#8b5cf6' },
        ],
        data30d: withTotalAmount([
          { label: '1', EquityFund: 40, MoneyMarketFund: 26, FixedIncomeFund: 18, BalancedFund: 16 }, { label: '2', EquityFund: 35, MoneyMarketFund: 29, FixedIncomeFund: 19, BalancedFund: 17 },
          { label: '3', EquityFund: 35, MoneyMarketFund: 29, FixedIncomeFund: 20, BalancedFund: 16 }, { label: '4', EquityFund: 40, MoneyMarketFund: 27, FixedIncomeFund: 19, BalancedFund: 14 },
          { label: '5', EquityFund: 34, MoneyMarketFund: 30, FixedIncomeFund: 20, BalancedFund: 16 }, { label: '6', EquityFund: 34, MoneyMarketFund: 29, FixedIncomeFund: 20, BalancedFund: 17 },
          { label: '7', EquityFund: 34, MoneyMarketFund: 27, FixedIncomeFund: 22, BalancedFund: 17 }, { label: '8', EquityFund: 37, MoneyMarketFund: 28, FixedIncomeFund: 20, BalancedFund: 15 },
          { label: '9', EquityFund: 39, MoneyMarketFund: 27, FixedIncomeFund: 20, BalancedFund: 14 }, { label: '10', EquityFund: 40, MoneyMarketFund: 27, FixedIncomeFund: 20, BalancedFund: 13 },
          { label: '11', EquityFund: 38, MoneyMarketFund: 24, FixedIncomeFund: 23, BalancedFund: 15 }, { label: '12', EquityFund: 37, MoneyMarketFund: 25, FixedIncomeFund: 23, BalancedFund: 15 },
          { label: '13', EquityFund: 38, MoneyMarketFund: 28, FixedIncomeFund: 19, BalancedFund: 15 }, { label: '14', EquityFund: 33, MoneyMarketFund: 28, FixedIncomeFund: 24, BalancedFund: 15 },
          { label: '15', EquityFund: 33, MoneyMarketFund: 29, FixedIncomeFund: 22, BalancedFund: 16 }, { label: '16', EquityFund: 35, MoneyMarketFund: 29, FixedIncomeFund: 22, BalancedFund: 14 },
          { label: '17', EquityFund: 36, MoneyMarketFund: 28, FixedIncomeFund: 22, BalancedFund: 14 }, { label: '18', EquityFund: 37, MoneyMarketFund: 28, FixedIncomeFund: 20, BalancedFund: 15 },
          { label: '19', EquityFund: 40, MoneyMarketFund: 26, FixedIncomeFund: 20, BalancedFund: 14 }, { label: '20', EquityFund: 36, MoneyMarketFund: 27, FixedIncomeFund: 23, BalancedFund: 14 },
          { label: '21', EquityFund: 37, MoneyMarketFund: 27, FixedIncomeFund: 22, BalancedFund: 14 }, { label: '22', EquityFund: 40, MoneyMarketFund: 28, FixedIncomeFund: 16, BalancedFund: 16 },
          { label: '23', EquityFund: 39, MoneyMarketFund: 28, FixedIncomeFund: 17, BalancedFund: 16 }, { label: '24', EquityFund: 40, MoneyMarketFund: 28, FixedIncomeFund: 17, BalancedFund: 15 },
          { label: '25', EquityFund: 35, MoneyMarketFund: 32, FixedIncomeFund: 18, BalancedFund: 15 }, { label: '26', EquityFund: 34, MoneyMarketFund: 27, FixedIncomeFund: 25, BalancedFund: 14 },
          { label: '27', EquityFund: 35, MoneyMarketFund: 26, FixedIncomeFund: 24, BalancedFund: 15 }, { label: '28', EquityFund: 39, MoneyMarketFund: 25, FixedIncomeFund: 20, BalancedFund: 16 },
          { label: '29', EquityFund: 39, MoneyMarketFund: 27, FixedIncomeFund: 21, BalancedFund: 13 }, { label: '30', EquityFund: 33, MoneyMarketFund: 29, FixedIncomeFund: 23, BalancedFund: 15 },
        ], [94.8, 102.6, 90.9, 108.3, 115.7]),
        data12m: withTotalAmount([
          { label: 'Jan', EquityFund: 37, MoneyMarketFund: 28, FixedIncomeFund: 20, BalancedFund: 15 }, { label: 'Feb', EquityFund: 35, MoneyMarketFund: 29, FixedIncomeFund: 21, BalancedFund: 15 },
          { label: 'Mar', EquityFund: 36, MoneyMarketFund: 27, FixedIncomeFund: 21, BalancedFund: 16 }, { label: 'Apr', EquityFund: 39, MoneyMarketFund: 27, FixedIncomeFund: 19, BalancedFund: 15 },
          { label: 'May', EquityFund: 34, MoneyMarketFund: 30, FixedIncomeFund: 21, BalancedFund: 15 }, { label: 'Jun', EquityFund: 38, MoneyMarketFund: 28, FixedIncomeFund: 19, BalancedFund: 15 },
          { label: 'Jul', EquityFund: 40, MoneyMarketFund: 26, FixedIncomeFund: 18, BalancedFund: 16 }, { label: 'Aug', EquityFund: 36, MoneyMarketFund: 29, FixedIncomeFund: 20, BalancedFund: 15 },
          { label: 'Sep', EquityFund: 35, MoneyMarketFund: 30, FixedIncomeFund: 21, BalancedFund: 14 }, { label: 'Oct', EquityFund: 37, MoneyMarketFund: 27, FixedIncomeFund: 21, BalancedFund: 15 },
          { label: 'Nov', EquityFund: 39, MoneyMarketFund: 26, FixedIncomeFund: 20, BalancedFund: 15 }, { label: 'Dec', EquityFund: 36, MoneyMarketFund: 28, FixedIncomeFund: 21, BalancedFund: 15 },
        ], [96.2, 104.4, 92.8, 113.5]),
      },
    ],
  },
  bonds: {
    title: 'Bonds Breakdown Diagnostic',
    subtitle: 'Volume share by Bond Type & Client Segment',
    charts: [
      {
        title: 'Transaction Trend',
        subtitle: 'Subscription and redemption activity with nett amount',
        chartType: 'buy-sell-trend',
        series: [
          { key: 'Subscribe', name: 'Subscribe', color: '#10b981', kind: 'bar' },
          { key: 'Redeem', name: 'Redeem', color: '#ef4444', kind: 'bar' },
          { key: 'Nett', name: 'Nett', color: '#f97316', kind: 'line' },
        ],
        data30d: [
          { label: '1', Subscribe: 8.4, Redeem: 8.0, Nett: 0.4 },
          { label: '2', Subscribe: 9.3, Redeem: 8.6, Nett: 0.7 },
          { label: '3', Subscribe: 8.7, Redeem: 9.1, Nett: -0.4 },
          { label: '4', Subscribe: 10.2, Redeem: 8.6, Nett: 1.6 },
          { label: '5', Subscribe: 10.8, Redeem: 9.7, Nett: 1.1 },
          { label: '6', Subscribe: 9.5, Redeem: 10.7, Nett: -1.2 },
          { label: '7', Subscribe: 10.8, Redeem: 9.3, Nett: 1.5 },
          { label: '8', Subscribe: 11.1, Redeem: 10.3, Nett: 0.8 },
          { label: '9', Subscribe: 9.4, Redeem: 10.8, Nett: -1.4 },
          { label: '10', Subscribe: 9.8, Redeem: 10.3, Nett: -0.5 },
          { label: '11', Subscribe: 11.8, Redeem: 9.5, Nett: 2.3 },
          { label: '12', Subscribe: 10.4, Redeem: 11.2, Nett: -0.8 },
          { label: '13', Subscribe: 10.6, Redeem: 10.9, Nett: -0.3 },
          { label: '14', Subscribe: 9.9, Redeem: 10.8, Nett: -0.9 },
          { label: '15', Subscribe: 12.2, Redeem: 9.7, Nett: 2.5 },
          { label: '16', Subscribe: 10.7, Redeem: 11.5, Nett: -0.8 },
          { label: '17', Subscribe: 10.4, Redeem: 11.0, Nett: -0.6 },
          { label: '18', Subscribe: 10.1, Redeem: 10.8, Nett: -0.7 },
          { label: '19', Subscribe: 12.5, Redeem: 10.0, Nett: 2.5 },
          { label: '20', Subscribe: 11.2, Redeem: 12.0, Nett: -0.8 },
          { label: '21', Subscribe: 10.2, Redeem: 11.5, Nett: -1.3 },
          { label: '22', Subscribe: 11.1, Redeem: 10.4, Nett: 0.7 },
          { label: '23', Subscribe: 12.9, Redeem: 11.1, Nett: 1.8 },
          { label: '24', Subscribe: 11.0, Redeem: 12.1, Nett: -1.1 },
          { label: '25', Subscribe: 10.6, Redeem: 11.5, Nett: -0.9 },
          { label: '26', Subscribe: 10.4, Redeem: 11.1, Nett: -0.7 },
          { label: '27', Subscribe: 11.8, Redeem: 10.3, Nett: 1.5 },
          { label: '28', Subscribe: 12.2, Redeem: 11.3, Nett: 0.9 },
          { label: '29', Subscribe: 10.7, Redeem: 12.2, Nett: -1.5 },
          { label: '30', Subscribe: 13.2, Redeem: 10.8, Nett: 2.4 },
        ],
        data12m: [
          { label: 'Jan', Subscribe: 92, Redeem: 86, Nett: 6 },
          { label: 'Feb', Subscribe: 101, Redeem: 93, Nett: 8 },
          { label: 'Mar', Subscribe: 95, Redeem: 100, Nett: -5 },
          { label: 'Apr', Subscribe: 108, Redeem: 96, Nett: 12 },
          { label: 'May', Subscribe: 114, Redeem: 100, Nett: 14 },
          { label: 'Jun', Subscribe: 98, Redeem: 115, Nett: -17 },
          { label: 'Jul', Subscribe: 123, Redeem: 97, Nett: 26 },
          { label: 'Aug', Subscribe: 117, Redeem: 110, Nett: 7 },
          { label: 'Sep', Subscribe: 102, Redeem: 117, Nett: -15 },
          { label: 'Oct', Subscribe: 124, Redeem: 102, Nett: 22 },
          { label: 'Nov', Subscribe: 110, Redeem: 119, Nett: -9 },
          { label: 'Dec', Subscribe: 128, Redeem: 111, Nett: 17 },
        ],
      },
      {
        title: 'By Bond Type',
        subtitle: 'Volume share - Government / Corporate',
        series: [
          { key: 'Government', name: 'Government', color: '#2563eb' },
          { key: 'Corporate', name: 'Corporate', color: '#f59e0b' },
        ],
        data30d: withTotalAmount([
          { label: '1', Government: 55, Corporate: 45 }, { label: '2', Government: 52, Corporate: 48 },
          { label: '3', Government: 57, Corporate: 43 }, { label: '4', Government: 56, Corporate: 44 },
          { label: '5', Government: 53, Corporate: 47 }, { label: '6', Government: 54, Corporate: 46 },
          { label: '7', Government: 54, Corporate: 46 }, { label: '8', Government: 57, Corporate: 43 },
          { label: '9', Government: 52, Corporate: 48 }, { label: '10', Government: 56, Corporate: 44 },
          { label: '11', Government: 57, Corporate: 43 }, { label: '12', Government: 57, Corporate: 43 },
          { label: '13', Government: 56, Corporate: 44 }, { label: '14', Government: 52, Corporate: 48 },
          { label: '15', Government: 51, Corporate: 49 }, { label: '16', Government: 53, Corporate: 47 },
          { label: '17', Government: 54, Corporate: 46 }, { label: '18', Government: 56, Corporate: 44 },
          { label: '19', Government: 49, Corporate: 51 }, { label: '20', Government: 56, Corporate: 44 },
          { label: '21', Government: 56, Corporate: 44 }, { label: '22', Government: 56, Corporate: 44 },
          { label: '23', Government: 52, Corporate: 48 }, { label: '24', Government: 58, Corporate: 42 },
          { label: '25', Government: 58, Corporate: 42 }, { label: '26', Government: 57, Corporate: 43 },
          { label: '27', Government: 60, Corporate: 40 }, { label: '28', Government: 56, Corporate: 44 },
          { label: '29', Government: 54, Corporate: 46 }, { label: '30', Government: 54, Corporate: 46 },
        ], [182.4, 196.7, 188.5, 204.2, 216.8]),
        data12m: withTotalAmount([
          { label: 'Jan', Government: 55, Corporate: 45 }, { label: 'Feb', Government: 53, Corporate: 47 },
          { label: 'Mar', Government: 56, Corporate: 44 }, { label: 'Apr', Government: 52, Corporate: 48 },
          { label: 'May', Government: 57, Corporate: 43 }, { label: 'Jun', Government: 54, Corporate: 46 },
          { label: 'Jul', Government: 51, Corporate: 49 }, { label: 'Aug', Government: 55, Corporate: 45 },
          { label: 'Sep', Government: 56, Corporate: 44 }, { label: 'Oct', Government: 53, Corporate: 47 },
          { label: 'Nov', Government: 54, Corporate: 46 }, { label: 'Dec', Government: 52, Corporate: 48 },
        ], [186.3, 201.5, 193.8, 211.7]),
      },
      {
        title: 'By Client Segment',
        subtitle: 'Volume share by Client Segment',
        series: clientSegmentSeries,
        data30d: withTotalAmount(withInstitutionalSegment([
          { label: '1', Retail: 49, Corporate: 51 }, { label: '2', Retail: 43, Corporate: 57 }, { label: '3', Retail: 48, Corporate: 52 },
          { label: '4', Retail: 46, Corporate: 54 }, { label: '5', Retail: 52, Corporate: 48 }, { label: '6', Retail: 48, Corporate: 52 },
          { label: '7', Retail: 48, Corporate: 52 }, { label: '8', Retail: 52, Corporate: 48 }, { label: '9', Retail: 49, Corporate: 51 },
          { label: '10', Retail: 49, Corporate: 51 }, { label: '11', Retail: 48, Corporate: 52 }, { label: '12', Retail: 50, Corporate: 50 },
          { label: '13', Retail: 48, Corporate: 52 }, { label: '14', Retail: 47, Corporate: 53 }, { label: '15', Retail: 46, Corporate: 54 },
          { label: '16', Retail: 46, Corporate: 54 }, { label: '17', Retail: 49, Corporate: 51 }, { label: '18', Retail: 49, Corporate: 51 },
          { label: '19', Retail: 49, Corporate: 51 }, { label: '20', Retail: 47, Corporate: 53 }, { label: '21', Retail: 46, Corporate: 54 },
          { label: '22', Retail: 51, Corporate: 49 }, { label: '23', Retail: 49, Corporate: 51 }, { label: '24', Retail: 50, Corporate: 50 },
          { label: '25', Retail: 51, Corporate: 49 }, { label: '26', Retail: 52, Corporate: 48 }, { label: '27', Retail: 49, Corporate: 51 },
          { label: '28', Retail: 49, Corporate: 51 }, { label: '29', Retail: 46, Corporate: 54 }, { label: '30', Retail: 49, Corporate: 51 },
        ], [15, 16, 14, 17, 13]), [176.2, 189.4, 181.7, 198.5, 209.1]),
        data12m: withTotalAmount(withInstitutionalSegment([
          { label: 'Jan', Retail: 47, Corporate: 53 }, { label: 'Feb', Retail: 49, Corporate: 51 }, { label: 'Mar', Retail: 46, Corporate: 54 },
          { label: 'Apr', Retail: 50, Corporate: 50 }, { label: 'May', Retail: 48, Corporate: 52 }, { label: 'Jun', Retail: 51, Corporate: 49 },
          { label: 'Jul', Retail: 49, Corporate: 51 }, { label: 'Aug', Retail: 47, Corporate: 53 }, { label: 'Sep', Retail: 50, Corporate: 50 },
          { label: 'Oct', Retail: 52, Corporate: 48 }, { label: 'Nov', Retail: 48, Corporate: 52 }, { label: 'Dec', Retail: 49, Corporate: 51 },
        ], [15, 14, 16, 13]), [179.6, 192.8, 185.1, 204.3]),
      },
    ],
  },
};

const ASSET_VALUE_SCALE: Record<ProductBreakdownKey, number> = {
  equity: 1.72,
  mutualFund: 2.18,
  bonds: 2.45,
};

const ASSET_TREND_BASE_BILLIONS: Record<ProductBreakdownKey, number> = {
  equity: 680,
  mutualFund: 520,
  bonds: 1280,
};

const ASSET_NETT_SCALE: Record<ProductBreakdownKey, number> = {
  equity: 1,
  mutualFund: 0.76,
  bonds: 1.42,
};

const ASSET_NETT_PATTERN = [12, -8, 15, -6, 22, -14, 18, 5, -9, 16, -12, 24] as const;

const ASSET_TREND_SERIES: BreakdownSeries[] = [
  { key: 'TotalAsset', name: 'Total Asset', color: '#2563eb', kind: 'bar' },
  { key: 'Nett', name: 'Nett', color: '#f97316', kind: 'line' },
];

const ASSET_SEGMENT_BIAS: Record<ProductBreakdownKey, Record<string, number>> = {
  equity: { Retail: 0.96, Corporate: 1.16, Institutional: 1.12 },
  mutualFund: { Retail: 1.04, Corporate: 0.92, Institutional: 1.08 },
  bonds: { Retail: 0.9, Corporate: 1.08, Institutional: 1.18 },
};

const ASSET_SERIES_OFFSET: Record<ProductBreakdownKey, number> = {
  equity: 0,
  mutualFund: 1,
  bonds: 2,
};

const normalizeAssetPercentages = (values: number[]) => {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const normalized = values.map((value) => Number(((value / total) * 100).toFixed(2)));
  const difference = Number((100 - normalized.reduce((sum, value) => sum + value, 0)).toFixed(2));
  normalized[normalized.length - 1] = Number((normalized[normalized.length - 1] + difference).toFixed(2));
  return normalized;
};

const createAssetValueData = (
  chart: BreakdownChart,
  productKey: ProductBreakdownKey,
  data: BreakdownDataPoint[],
): BreakdownDataPoint[] =>
  data.map((point, pointIndex) => {
    const nextPoint: BreakdownDataPoint = { label: point.label };
    const periodDrift = 1 + ((pointIndex % 5) - 2) * 0.018;

    if (chart.chartType === 'buy-sell-trend') {
      const progress = data.length > 1 ? pointIndex / (data.length - 1) : 0;
      const dailyAdjustment = data.length > 12 ? 0.35 : 1;
      const totalAsset = ASSET_TREND_BASE_BILLIONS[productKey] * (0.9 + progress * 0.1) * (1 + ((pointIndex % 4) - 1.5) * 0.006);
      const nett = ASSET_NETT_PATTERN[pointIndex % ASSET_NETT_PATTERN.length] * ASSET_NETT_SCALE[productKey] * dailyAdjustment;

      nextPoint.TotalAsset = Number(totalAsset.toFixed(1));
      nextPoint.Nett = Number(nett.toFixed(1));
    } else {
      const biasedValues = chart.series.map((series, seriesIndex) => {
        const fallbackBias = 1 + (((seriesIndex + ASSET_SERIES_OFFSET[productKey]) % 3) - 1) * 0.07;
        const assetBias = ASSET_SEGMENT_BIAS[productKey][series.key] ?? fallbackBias;
        return Math.max(0.1, Number(point[series.key] ?? 0) * assetBias);
      });
      const normalizedValues = normalizeAssetPercentages(biasedValues);
      chart.series.forEach((series, seriesIndex) => {
        nextPoint[series.key] = normalizedValues[seriesIndex];
      });
    }

    if (typeof point.totalAmount === 'number') {
      nextPoint.totalAmount = Number((point.totalAmount * ASSET_VALUE_SCALE[productKey] * periodDrift).toFixed(2));
    }

    return nextPoint;
  });

export const addValueDatasets = (
  chart: BreakdownChart,
  productKey: ProductBreakdownKey,
): BreakdownChart => {
  return {
    ...chart,
    valueDatasets: {
      transactionValue: {
        data30d: chart.data30d,
        data12m: chart.data12m,
      },
      assetValue: {
        data30d: createAssetValueData(chart, productKey, chart.data30d),
        data12m: createAssetValueData(chart, productKey, chart.data12m),
        series: chart.chartType === 'buy-sell-trend' ? ASSET_TREND_SERIES : chart.series,
        chartType: chart.chartType === 'buy-sell-trend' ? 'asset-value-trend' : chart.chartType,
      },
    },
  };
};

export const productBreakdownConfigs = Object.fromEntries(
  (Object.entries(baseProductBreakdownConfigs) as [ProductBreakdownKey, BreakdownPageConfig][]).map(
    ([productKey, config]) => [
      productKey,
      {
        ...config,
        charts: config.charts.map((chart) => addValueDatasets(chart, productKey)),
      },
    ],
  ),
) as Record<ProductBreakdownKey, BreakdownPageConfig>;

