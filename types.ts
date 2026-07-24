
// Add missing view types for P&L detail drill-downs and Onboarding process
export enum View {
  Dashboard,
  AccountOverview,
  AccountSnapshotData,
  AccountCohortData,
  DetailInvestmentSpecialist,
  DetailPWM,
  DetailInvestmentSolution,
  DetailInstitutionalBusiness,
  DetailFixedIncome,
  ProductPerformance,
  ProductPerformanceV2,
  ProductPerformanceEquity,
  ProductPerformanceMutualFund,
  ProductPerformanceBonds,
  SalesPerformance,
  SalespersonDetails,
  ProfitLossOverview,
  ProfitLossDetailTesting,
  ProfitLossMonthly,
  ProfitLossQuarterly,
  ProfitLossAnnually,
  ProductCommissionTrend,
  RevenueTrendPage,
  ExpenseTrendPage,
  StrategicReport,
  CompetitorOverview,
  CompetitorAnalysisReport,
  CompetitorFeatureComparison,
  // Onboarding Process Views
  OnboardingOverview,
  OnboardingCompletionRate,
  OnboardingKYCRejection,
  OnboardingCustomerFunnel,
  OnboardingSLATrend,
}

export interface WidgetData {
  id: View;
  title: string;
  subtitle: string;
  mainMetric: string;
  mainMetricLabel: string;
  mainMetricTrend?: number;
  mtdMetric?: string;
  mtdMetricLabel?: string;
  dailyMetric?: string;
  dailyMetricLabel?: string;
  secondaryMetric: string;
  secondaryMetricLabel: string;
  secondaryMetricTrend?: number;
  targetMetric: string;
  targetMetricLabel: string;
  targetMetricTrend?: number;
  color: string;
  bgColor: string;
  initials: string;
  fixedIncomeBreakdown?: {
    channels: Array<{
      label: string;
      volume: string;
      growth: number;
    }>;
  };
}

export interface KPICardData {
    label: string;
    value: string;
    subValue?: string;
    change?: number;
}

export interface DetailKPICardData {
    label: string;
    valueYTD: string;
    valueMTD: string;
    subValue?: string;
    changeYTD?: number;
    changeMTD?: number;
}

export interface MonthlyTrendData {
    month: string;
    value1: number; // Bar
    value2?: number; // Bar or Line
    trend?: number; // Percentage trend line
}

export interface DailyTrendData {
    date: string; // Format: MMM DD
    barValue1: number;
    barValue2?: number;
    lineValue?: number;
}

export interface BreakdownData {
    name: string;
    value: number;
    children?: BreakdownData[];
}

export interface ClientTrendData {
    month: string;
    new: number;
    existing: number;
}

// Export missing interface for multi-series trend charts to fix Shared.tsx import
export interface MultiLineTrendData {
    month: string;
    [key: string]: string | number;
}
