export type TimeGranularity = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export interface OnboardingTimeFilterState {
  daily: {
    from: string;
    to: string;
  };
  monthly: {
    year: number;
    from: number;
    to: number;
  };
  quarterly: {
    year: number;
  };
  yearly: {
    fromYear: number;
    toYear: number;
  };
}
export type MetricUnit = 'count' | 'percentage' | 'days' | 'hours';
export type TrendDirection = 'up' | 'down' | 'flat' | 'unavailable';
export type FavorableDirection = 'higher' | 'lower' | 'neutral';
export type MetricValueTone = 'default' | 'positive' | 'negative';

export interface TrendComparison {
  value: number | null;
  direction: TrendDirection;
}

export interface BranchBreakdownItem {
  id: string;
  label: string;
  value: number | null;
  target?: number;
}

export interface OnProgressCustomerMetric {
  id: string;
  label: string;
  total: number;
  branches: BranchBreakdownItem[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number | null;
  unit: MetricUnit;
  mtd: TrendComparison;
  ytd: TrendComparison;
  favorableDirection: FavorableDirection;
  definition: string;
  branches?: BranchBreakdownItem[];
}

export interface PipelineStage {
  id: string;
  label: string;
  value: number;
  conversionToNext: number | null;
  breakdown?: Array<{
    id: string;
    label: string;
    value: number;
  }>;
}

export interface TrendPoint {
  period: string;
  values: Record<string, number | null>;
}

export interface SelectedPeriod {
  granularity: TimeGranularity;
  value: string;
  startDate: string;
  endDate: string;
}

export interface CustomerOnboardingDashboardData {
  selectedPeriod: SelectedPeriod;
  lastUpdated: string | null;
  overview: KpiMetric[];
  onProgressOverview: OnProgressCustomerMetric[];
  overSlaTotal: KpiMetric;
  overSlaBreakdown: KpiMetric[];
  pending: KpiMetric[];
  quality: KpiMetric[];
  pipeline: PipelineStage[];
  trends: {
    volume: TrendPoint[];
    pending: TrendPoint[];
    successRates: TrendPoint[];
    tat: TrendPoint[];
  };
}

export type TrendView = keyof CustomerOnboardingDashboardData['trends'];
