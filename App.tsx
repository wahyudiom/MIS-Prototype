
import React, { useEffect, useState } from 'react';
import { View } from './types';
import Dashboard from './pages/Dashboard';
import DetailInvestmentSpecialist from './pages/DetailInvestmentSpecialist';
import DetailPWM from './pages/DetailPWM';
import DetailInvestmentSolution from './pages/DetailInvestmentSolution';
import DetailInstitutionalBusiness from './pages/DetailInstitutionalBusiness';
import DetailFixedIncome from './pages/DetailFixedIncome';
import SalespersonDetails from './pages/SalespersonDetails';
import ProfitLossOverview from './pages/ProfitLossOverview';
import ProfitLossDetailTesting from './pages/ProfitLossDetailTesting';
import ProfitLossTrend from './pages/ProfitLossTrend';
import ProfitLossMonthly from './pages/ProfitLossMonthly';
import ProfitLossQuarterly from './pages/ProfitLossQuarterly';
import ProfitLossAnnually from './pages/ProfitLossAnnually';
import ProductCommissionTrend from './pages/ProductCommissionTrend';
import ProductPerformanceV2 from './pages/ProductPerformanceV2';
import ProductBreakdownPage from './pages/ProductBreakdownPage';
import RevenueTrendPage from './pages/RevenueTrendPage';
import ExpenseTrendPage from './pages/ExpenseTrendPage';
import StrategicReport from './pages/StrategicReport';
import AccountOverview from './pages/AccountOverview';
import AccountSnapshotData from './pages/AccountSnapshotData';
import AccountCohortData from './pages/AccountCohortData';
import CompetitorOverview from './pages/CompetitorOverview';
import CompetitorOverviewLanding from './pages/CompetitorOverviewLanding';
import CompetitorFeatureComparison from './pages/CompetitorFeatureComparison';
import OnboardingSLATrend from './pages/OnboardingSLATrend';
import OnboardingCustomerFunnel from './pages/OnboardingCustomerFunnel';
import OnboardingKYCRejection from './pages/OnboardingKYCRejection';
import OnboardingCompletionRate from './pages/OnboardingCompletionRate';
import OnboardingOverview from './pages/OnboardingOverview';
import OnboardingOverviewV2 from './pages/OnboardingOverviewV2';
import CustomerOnboarding from './pages/CustomerOnboarding';
import { 
  ArrowLeftIcon, 
  HomeIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  MenuIcon,
  XIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  LayoutIcon,
  PresentationChartLineIcon,
  CalendarIcon,
  PieChartIcon,
  UserXIcon
} from './components/Icons';
import { productBreakdownConfigs, type ProductBreakdownKey } from './constants/productBreakdownData';
import './components/sidebar.css';

const SIDEBAR_COLLAPSED_KEY = 'mis.sidebar.collapsed';

const productDetailViews: Record<ProductBreakdownKey, View> = {
    equity: View.ProductPerformanceEquity,
    mutualFund: View.ProductPerformanceMutualFund,
    bonds: View.ProductPerformanceBonds,
};

const viewPaths: Partial<Record<View, string>> = {
    [View.Dashboard]: '/',
    [View.DetailInvestmentSpecialist]: '/branch-performance/investment-specialist',
    [View.DetailInvestmentSolution]: '/branch-performance/priority-client-services',
    [View.DetailInstitutionalBusiness]: '/branch-performance/institutional-business',
    [View.DetailFixedIncome]: '/branch-performance/fixed-income',
    [View.ProfitLossOverview]: '/profit-and-loss',
    [View.ProfitLossDetailTesting]: '/profit-and-loss/performance',
    [View.AccountOverview]: '/account-overview',
    [View.AccountSnapshotData]: '/account-overview/snapshot-data',
    [View.AccountCohortData]: '/account-overview/cohort-data',
    [View.ProductPerformance]: '/product-performance',
    [View.ProductPerformanceV2]: '/product-performance',
    [View.ProductPerformanceEquity]: '/product-performance/equity',
    [View.ProductPerformanceMutualFund]: '/product-performance/mutual-fund',
    [View.ProductPerformanceBonds]: '/product-performance/bonds',
    [View.CompetitorOverview]: '/competitor-analysis/competitor-overview',
    [View.CompetitorAnalysisReport]: '/competitor-analysis/analysis-report',
    [View.CompetitorFeatureComparison]: '/competitor-analysis/feature-comparison',
    [View.OnboardingOverview]: '/onboarding-process',
    [View.OnboardingOverviewV2]: '/onboarding-process/overview-v2',
    [View.OnboardingCompletionRate]: '/onboarding-process/completion-rate',
    [View.OnboardingKYCRejection]: '/onboarding-process/kyc-rejection',
    [View.OnboardingCustomerFunnel]: '/onboarding-process/customer-funnel',
    [View.OnboardingSLATrend]: '/onboarding-process/sla-trend',
    [View.CustomerOnboarding]: '/customer-onboarding',
};

const viewFromPath = (pathname: string): View | undefined => {
    switch (pathname.replace(/\/$/, '') || '/') {
        case '/':
            return View.Dashboard;
        case '/branch-performance/investment-specialist':
            return View.DetailInvestmentSpecialist;
        case '/branch-performance/priority-client-services':
            return View.DetailInvestmentSolution;
        case '/branch-performance/institutional-business':
            return View.DetailInstitutionalBusiness;
        case '/branch-performance/fixed-income':
            return View.DetailFixedIncome;
        case '/profit-and-loss':
            return View.ProfitLossOverview;
        case '/profit-and-loss/performance':
            return View.ProfitLossDetailTesting;
        case '/account-overview':
            return View.AccountOverview;
        case '/account-overview/snapshot-data':
            return View.AccountSnapshotData;
        case '/account-overview/cohort-data':
            return View.AccountCohortData;
        case '/product-performance':
            return View.ProductPerformanceV2;
        case '/product-performance-v2':
            return View.ProductPerformanceV2;
        case '/product-performance/equity':
            return View.ProductPerformanceEquity;
        case '/product-performance/mutual-fund':
            return View.ProductPerformanceMutualFund;
        case '/product-performance/bonds':
            return View.ProductPerformanceBonds;
        case '/competitor-analysis/competitor-overview':
        case '/competitor-analysis/overview':
            return View.CompetitorOverview;
        case '/competitor-analysis/analysis-report':
            return View.CompetitorAnalysisReport;
        case '/competitor-analysis/feature-comparison':
            return View.CompetitorFeatureComparison;
        case '/onboarding-process':
            return View.OnboardingOverview;
        case '/onboarding-process/overview-v2':
            return View.OnboardingOverviewV2;
        case '/onboarding-process/completion-rate':
            return View.OnboardingCompletionRate;
        case '/onboarding-process/kyc-rejection':
            return View.OnboardingKYCRejection;
        case '/onboarding-process/customer-funnel':
            return View.OnboardingCustomerFunnel;
        case '/onboarding-process/sla-trend':
            return View.OnboardingSLATrend;
        case '/customer-onboarding':
            return View.CustomerOnboarding;
        default:
            return undefined;
    }
};

const branchPerformanceViews = [
    View.Dashboard,
    View.DetailInvestmentSpecialist,
    View.DetailInvestmentSolution,
    View.DetailInstitutionalBusiness,
    View.DetailFixedIncome,
];
const profitLossViews = [View.ProfitLossOverview, View.ProfitLossDetailTesting];
const productPerformanceViews = [
    View.ProductPerformanceV2,
    View.ProductPerformanceEquity,
    View.ProductPerformanceMutualFund,
    View.ProductPerformanceBonds,
];
const competitorViews = [View.CompetitorOverview, View.CompetitorAnalysisReport, View.CompetitorFeatureComparison];
const accountViews = [View.AccountOverview, View.AccountSnapshotData, View.AccountCohortData];
const onboardingProcessViews = [
    View.OnboardingOverview,
    View.OnboardingOverviewV2,
    View.CustomerOnboarding,
    View.OnboardingCompletionRate,
    View.OnboardingKYCRejection,
    View.OnboardingCustomerFunnel,
    View.OnboardingSLATrend,
];

const App: React.FC = () => {
    const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname) ?? View.Dashboard);
    const [previousView, setPreviousView] = useState<View>(View.Dashboard);
    const [productBreakdownParentView, setProductBreakdownParentView] = useState<View>(View.ProductPerformanceV2);
    const [selectedSalesperson, setSelectedSalesperson] = useState<string>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
        } catch {
            return false;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
        } catch {
            // Navigation remains usable when browser storage is unavailable.
        }
    }, [isSidebarCollapsed]);
    const latestDeploymentLabel = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(__APP_BUILD_TIME__));
    const dataAsOfLabel = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    // States for collapsible menu sections
    const [isBranchPerformanceOpen, setIsBranchPerformanceOpen] = useState(true);
    const [isPLOpen, setIsPLOpen] = useState(true);
    const [isProductPerformanceOpen, setIsProductPerformanceOpen] = useState(true);
    const [isAccountOpen, setIsAccountOpen] = useState(true);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
    const [isCompetitorOpen, setIsCompetitorOpen] = useState(true);

    const getViewTitle = (currentView: View) => {
        switch (currentView) {
            case View.Dashboard: return 'Branch Performance';
            case View.AccountOverview: return 'Account Overview';
            case View.AccountSnapshotData: return 'Snapshot Data';
            case View.AccountCohortData: return 'Cohort Data';
            case View.DetailInvestmentSpecialist: return 'Investment Specialist';
            case View.DetailPWM: return 'PWM';
            case View.DetailInvestmentSolution: return 'Priority Client Services';
            case View.DetailInstitutionalBusiness: return 'Institutional Business';
            case View.DetailFixedIncome: return 'Fixed Income';
            case View.SalespersonDetails: return selectedSalesperson;
            case View.ProfitLossOverview: return 'Profit and Loss Overview';
            case View.ProfitLossDetailTesting: return 'Profit and Loss Performance';
            case View.ProfitLossMonthly: return 'Monthly P&L';
            case View.ProfitLossQuarterly: return 'Quarterly P&L';
            case View.ProfitLossAnnually: return 'Annual P&L';
            case View.ProductCommissionTrend: return 'Product Commission Trend';
            case View.ProductPerformance:
            case View.ProductPerformanceV2:
                return 'Product Performance';
            case View.ProductPerformanceEquity: return 'Equity Breakdown';
            case View.ProductPerformanceMutualFund: return 'Mutual Fund Breakdown';
            case View.ProductPerformanceBonds: return 'Bonds Breakdown';
            case View.RevenueTrendPage: return 'Revenue Trend';
            case View.ExpenseTrendPage: return 'Expense Trend';
            case View.StrategicReport: return 'Q3 Strategic Growth Report';
            case View.CompetitorOverview: return 'Competitor Overview';
            case View.CompetitorAnalysisReport: return 'Analysis Report';
            case View.CompetitorFeatureComparison: return 'Feature Comparison';
            case View.OnboardingOverview: return 'Onboarding Overview';
            case View.OnboardingOverviewV2: return 'Onboarding Overview v2';
            case View.OnboardingCompletionRate: return 'Onboarding Completion Rate';
            case View.OnboardingKYCRejection: return 'KYC Rejection';
            case View.OnboardingCustomerFunnel: return 'Customer Funnel';
            case View.OnboardingSLATrend: return 'SLA Trend';
            case View.CustomerOnboarding: return 'Regular Customer Onboarding';
            default: return 'MIS Panel';
        }
    };

    const navigateToSalesperson = (name: string) => {
      setPreviousView(view);
      setSelectedSalesperson(name);
      setView(View.SalespersonDetails);
    };

    const renderPlaceholder = (title: string) => (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <h3 className="text-2xl font-black text-slate-800">{title}</h3>
        <p className="mt-2 font-medium">Page details will be provided later.</p>
      </div>
    );

    const renderView = () => {
        switch (view) {
            case View.Dashboard:
                return <Dashboard setView={setView} />;
            case View.AccountOverview:
                return <AccountOverview />;
            case View.AccountSnapshotData:
                return <AccountSnapshotData />;
            case View.AccountCohortData:
                return <AccountCohortData />;
            case View.ProfitLossOverview:
                return <ProfitLossOverview setView={setView} />;
            case View.ProfitLossDetailTesting:
                return <ProfitLossDetailTesting />;
            case View.ProfitLossMonthly:
                return <ProfitLossMonthly />;
            case View.ProfitLossQuarterly:
                return <ProfitLossQuarterly />;
            case View.ProfitLossAnnually:
                return <ProfitLossAnnually />;
            case View.ProductCommissionTrend:
                return <ProductCommissionTrend />;
            case View.ProductPerformanceV2:
                return <ProductPerformanceV2 onNavigateDetail={(target) => {
                    setProductBreakdownParentView(View.ProductPerformanceV2);
                    navigateTo(productDetailViews[target]);
                }} />;
            case View.ProductPerformanceEquity:
                return <ProductBreakdownPage key="equity" productKey="equity" config={productBreakdownConfigs.equity} onBack={() => navigateTo(productBreakdownParentView)} />;
            case View.ProductPerformanceMutualFund:
                return <ProductBreakdownPage key="mutual-fund" productKey="mutualFund" config={productBreakdownConfigs.mutualFund} onBack={() => navigateTo(productBreakdownParentView)} />;
            case View.ProductPerformanceBonds:
                return <ProductBreakdownPage key="bonds" productKey="bonds" config={productBreakdownConfigs.bonds} onBack={() => navigateTo(productBreakdownParentView)} />;
            case View.RevenueTrendPage:
                return <RevenueTrendPage />;
            case View.ExpenseTrendPage:
                return <ExpenseTrendPage />;
            case View.DetailInvestmentSpecialist:
                return <DetailInvestmentSpecialist onSalespersonClick={navigateToSalesperson} />;
            case View.DetailPWM:
                return <DetailPWM onSalespersonClick={navigateToSalesperson} />;
            case View.DetailInvestmentSolution:
                return <DetailInvestmentSolution onSalespersonClick={navigateToSalesperson} />;
            case View.DetailInstitutionalBusiness:
                return <DetailInstitutionalBusiness onSalespersonClick={navigateToSalesperson} />;
            case View.DetailFixedIncome:
                return <DetailFixedIncome onSalespersonClick={navigateToSalesperson} />;
            case View.SalespersonDetails:
                return <SalespersonDetails name={selectedSalesperson} onBack={() => setView(previousView)} />;
            case View.StrategicReport:
                return <StrategicReport onBack={() => setView(View.Dashboard)} />;
            case View.CompetitorOverview:
                return <CompetitorOverviewLanding />;
            case View.CompetitorAnalysisReport:
                return <CompetitorOverview />;
            case View.CompetitorFeatureComparison:
                return <CompetitorFeatureComparison />;
            case View.OnboardingOverview: return <OnboardingOverview />;
            case View.OnboardingOverviewV2: return <OnboardingOverviewV2 />;
            case View.OnboardingCompletionRate: return <OnboardingCompletionRate />;
            case View.OnboardingKYCRejection: return <OnboardingKYCRejection />;
            case View.OnboardingCustomerFunnel: return <OnboardingCustomerFunnel />;
            case View.OnboardingSLATrend: return <OnboardingSLATrend />;
            case View.CustomerOnboarding: return <CustomerOnboarding />;
            default:
                return <Dashboard setView={setView} />;
        }
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const navigateTo = (newView: View) => {
      setView(newView);
      setIsSidebarOpen(false);
      const nextPath = viewPaths[newView] ?? '/';
      if (nextPath && window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
    };

    useEffect(() => {
      const handlePopState = () => {
        setView(viewFromPath(window.location.pathname) ?? View.Dashboard);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
      if (branchPerformanceViews.includes(view)) setIsBranchPerformanceOpen(true);
      if (profitLossViews.includes(view)) setIsPLOpen(true);
      if (productPerformanceViews.includes(view)) setIsProductPerformanceOpen(true);
      if (competitorViews.includes(view)) setIsCompetitorOpen(true);
      if (accountViews.includes(view)) setIsAccountOpen(true);
      if (onboardingProcessViews.includes(view)) setIsOnboardingOpen(true);
    }, [view]);

    const isBranchPerformanceView = branchPerformanceViews.includes(view);
    const isProfitLossView = profitLossViews.includes(view);
    const isProductPerformanceView = productPerformanceViews.includes(view);
    const isCompetitorAnalysisView = competitorViews.includes(view);
    const isAccountView = accountViews.includes(view);
    const isOnboardingProcessView = onboardingProcessViews.includes(view);

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex overflow-hidden">
            {isSidebarOpen && !isSidebarCollapsed && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggleSidebar} />}
            
            <aside aria-label="MIS sidebar" data-collapsed={isSidebarCollapsed} className={`mis-sidebar shrink-0 inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarCollapsed ? 'static w-20 translate-x-0' : `fixed lg:static w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}`}>
                <div className="h-full flex flex-col">
                    <div className={`flex ${isSidebarCollapsed ? 'flex-col items-center gap-3 px-2 py-6' : 'items-start justify-between p-6'}`}>
                        <div className="flex min-w-0 items-start space-x-3">
                            <div className="h-8 w-8 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                                <span className="text-white font-black text-lg">M</span>
                              </div>
                              <div className={isSidebarCollapsed ? 'hidden' : 'min-w-0'}>
                                  <span className="text-xl font-black text-gray-900 tracking-tight">MIS Panel</span>
                                  <p className="mt-1 text-[11px] font-semibold text-gray-400">
                                      Latest Update/Deployment: {latestDeploymentLabel}
                                  </p>
                              </div>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <button type="button" aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isSidebarCollapsed} aria-controls="mis-navigation" onClick={() => {
                                setIsSidebarCollapsed(!isSidebarCollapsed);
                                setIsSidebarOpen(isSidebarCollapsed);
                            }} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <ChevronRightIcon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
                            </button>
                            {!isSidebarCollapsed && <button aria-label="Close sidebar" onClick={toggleSidebar} className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"><XIcon className="h-5 w-5" /></button>}
                        </div>
                    </div>

                    <nav id="mis-navigation" aria-label="MIS navigation" className="flex-1 px-4 space-y-6 overflow-y-auto mt-2 pb-8">
                        {/* 1. Overview */}
                        <div>
                          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Overview</p>
                          <div className="space-y-1">
                            <button title={isSidebarCollapsed ? 'Branch Performance' : undefined} type="button" aria-expanded={isBranchPerformanceOpen} onClick={() => setIsBranchPerformanceOpen(!isBranchPerformanceOpen)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${isBranchPerformanceView ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                              <HomeIcon className="h-5 w-5 shrink-0" />
                              <span className="flex-1 text-left text-sm font-bold">Branch Performance</span>
                              {isBranchPerformanceOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                            {isBranchPerformanceOpen && (
                              <div className="space-y-1">
                                <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.Dashboard ? 'page' : undefined} onClick={() => navigateTo(View.Dashboard)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.Dashboard ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <HomeIcon className="h-5 w-5" />
                                  <span className="text-sm font-semibold">Overview</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Investment Specialist' : undefined} aria-current={view === View.DetailInvestmentSpecialist ? 'page' : undefined} onClick={() => navigateTo(View.DetailInvestmentSpecialist)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.DetailInvestmentSpecialist ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <UserGroupIcon className="h-5 w-5" />
                                  <span className="text-sm font-semibold">Investment Specialist</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Priority Client Services' : undefined} aria-current={view === View.DetailInvestmentSolution ? 'page' : undefined} onClick={() => navigateTo(View.DetailInvestmentSolution)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.DetailInvestmentSolution ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <BeakerIcon className="h-5 w-5" />
                                  <span className="text-sm font-semibold">Priority Client Services</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Institutional Business' : undefined} aria-current={view === View.DetailInstitutionalBusiness ? 'page' : undefined} onClick={() => navigateTo(View.DetailInstitutionalBusiness)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.DetailInstitutionalBusiness ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <GlobeAltIcon className="h-5 w-5" />
                                  <span className="text-sm font-semibold">Institutional Business</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Fixed Income' : undefined} aria-current={view === View.DetailFixedIncome ? 'page' : undefined} onClick={() => navigateTo(View.DetailFixedIncome)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.DetailFixedIncome ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <ChartBarIcon className="h-5 w-5" />
                                  <span className="text-sm font-semibold">Fixed Income</span>
                                </button>
                              </div>
                            )}
                          </div>
                          <button title={isSidebarCollapsed ? 'Strategy Report' : undefined} aria-current={view === View.StrategicReport ? 'page' : undefined} onClick={() => navigateTo(View.StrategicReport)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${view === View.StrategicReport ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <TrendingUpIcon className="h-5 w-5" />
                            <span className="text-sm font-bold">Strategy Report</span>
                          </button>
                        </div>

                        {/* 2. Performance */}
                        <div>
                          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Performance</p>
                          <div className="space-y-1">
                            <button title={isSidebarCollapsed ? 'Profit and Loss' : undefined} type="button" aria-expanded={isPLOpen} onClick={() => setIsPLOpen(!isPLOpen)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${isProfitLossView ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                              <LayoutIcon className="h-5 w-5 shrink-0" />
                              <span className="flex-1 text-left text-[14px] font-semibold">Profit and Loss</span>
                              {isPLOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                            {isPLOpen && (
                              <div className="space-y-1">
                                <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.ProfitLossOverview ? 'page' : undefined} onClick={() => navigateTo(View.ProfitLossOverview)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProfitLossOverview ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <HomeIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Overview</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Performance' : undefined} aria-current={view === View.ProfitLossDetailTesting ? 'page' : undefined} onClick={() => navigateTo(View.ProfitLossDetailTesting)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProfitLossDetailTesting ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <PresentationChartLineIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Performance</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. Product Performance */}
                        <div className="space-y-1">
                          <button title={isSidebarCollapsed ? 'Product Performance' : undefined} type="button" aria-expanded={isProductPerformanceOpen} onClick={() => setIsProductPerformanceOpen(!isProductPerformanceOpen)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${isProductPerformanceView ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <PieChartIcon className="h-5 w-5 shrink-0" />
                            <span className="flex-1 text-left text-sm font-bold">Product Performance</span>
                            {isProductPerformanceOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                          </button>
                          {isProductPerformanceOpen && (
                            <div className="space-y-1">
                              <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.ProductPerformanceV2 ? 'page' : undefined} onClick={() => navigateTo(View.ProductPerformanceV2)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProductPerformanceV2 ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <HomeIcon className="h-5 w-5" />
                                <span className="text-[14px] font-semibold">Overview</span>
                              </button>
                              <button title={isSidebarCollapsed ? 'Equity' : undefined} aria-current={view === View.ProductPerformanceEquity ? 'page' : undefined} onClick={() => navigateTo(View.ProductPerformanceEquity)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProductPerformanceEquity ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <PresentationChartLineIcon className="h-5 w-5" />
                                <span className="text-[14px] font-semibold">Equity</span>
                              </button>
                              <button title={isSidebarCollapsed ? 'Mutual Fund' : undefined} aria-current={view === View.ProductPerformanceMutualFund ? 'page' : undefined} onClick={() => navigateTo(View.ProductPerformanceMutualFund)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProductPerformanceMutualFund ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <PresentationChartLineIcon className="h-5 w-5" />
                                <span className="text-[14px] font-semibold">Mutual Fund</span>
                              </button>
                              <button title={isSidebarCollapsed ? 'Bonds' : undefined} aria-current={view === View.ProductPerformanceBonds ? 'page' : undefined} onClick={() => navigateTo(View.ProductPerformanceBonds)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.ProductPerformanceBonds ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <PresentationChartLineIcon className="h-5 w-5" />
                                <span className="text-[14px] font-semibold">Bonds</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Competitor Analysis</p>
                          <div className="space-y-1">
                            <button title={isSidebarCollapsed ? 'Competitor' : undefined} type="button" aria-expanded={isCompetitorOpen} onClick={() => setIsCompetitorOpen(!isCompetitorOpen)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${isCompetitorAnalysisView ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                              <PresentationChartLineIcon className="h-5 w-5 shrink-0" />
                              <span className="flex-1 text-left text-sm font-bold">Competitor</span>
                              {isCompetitorOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                            {isCompetitorOpen && (
                              <div className="space-y-1">
                                <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.CompetitorOverview ? 'page' : undefined} onClick={() => navigateTo(View.CompetitorOverview)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.CompetitorOverview ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <HomeIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Overview</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Analysis Report' : undefined} aria-current={view === View.CompetitorAnalysisReport ? 'page' : undefined} onClick={() => navigateTo(View.CompetitorAnalysisReport)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.CompetitorAnalysisReport ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <PresentationChartLineIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Analysis Report</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Feature Comparison' : undefined} aria-current={view === View.CompetitorFeatureComparison ? 'page' : undefined} onClick={() => navigateTo(View.CompetitorFeatureComparison)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.CompetitorFeatureComparison ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <LayoutIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Feature Comparison</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Account</p>
                          <div className="space-y-1">
                            <button title={isSidebarCollapsed ? 'Account' : undefined} type="button" aria-expanded={isAccountOpen} onClick={() => setIsAccountOpen(!isAccountOpen)} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${isAccountView ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                              <UserIcon className="h-5 w-5 shrink-0" />
                              <span className="flex-1 text-left text-sm font-bold">Account</span>
                              {isAccountOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                            {isAccountOpen && (
                              <div className="space-y-1">
                                <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.AccountOverview ? 'page' : undefined} onClick={() => navigateTo(View.AccountOverview)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.AccountOverview ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <HomeIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Overview</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Snapshot Data' : undefined} aria-current={view === View.AccountSnapshotData ? 'page' : undefined} onClick={() => navigateTo(View.AccountSnapshotData)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.AccountSnapshotData ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <CalendarIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Snapshot Data</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Cohort Data' : undefined} aria-current={view === View.AccountCohortData ? 'page' : undefined} onClick={() => navigateTo(View.AccountCohortData)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.AccountCohortData ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <PresentationChartLineIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Cohort Data</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 4. Onboarding Process */}
                        <div>
                          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Onboarding Process</p>
                          <div className="space-y-1">
                            <button title={isSidebarCollapsed ? 'Onboarding Process' : undefined} type="button" aria-expanded={isOnboardingOpen} onClick={() => setIsOnboardingOpen(!isOnboardingOpen)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ${isOnboardingProcessView ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                              <UserGroupIcon className="h-5 w-5 shrink-0" />
                              <span className="flex-1 text-left text-[14px] font-semibold">Onboarding Process</span>
                              {isOnboardingOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                            {isOnboardingOpen && (
                              <div className="space-y-1">
                                <button title={isSidebarCollapsed ? 'Overview' : undefined} aria-current={view === View.OnboardingOverview ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingOverview)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingOverview ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <ChartBarIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Overview</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Overview_v2' : undefined} aria-current={view === View.OnboardingOverviewV2 ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingOverviewV2)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingOverviewV2 ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <ChartBarIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Overview_v2</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Regular Customer Onboarding' : undefined} aria-current={view === View.CustomerOnboarding ? 'page' : undefined} onClick={() => navigateTo(View.CustomerOnboarding)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.CustomerOnboarding ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <LayoutIcon className="h-5 w-5" />
                                  <span className="min-w-0 flex-1 text-left text-[14px] font-semibold leading-5">Regular Customer Onboarding</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Completion Rate' : undefined} aria-current={view === View.OnboardingCompletionRate ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingCompletionRate)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingCompletionRate ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <UserIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Completion Rate</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'KYC Rejection' : undefined} aria-current={view === View.OnboardingKYCRejection ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingKYCRejection)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingKYCRejection ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <UserXIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">KYC Rejection</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'Customer Funnel' : undefined} aria-current={view === View.OnboardingCustomerFunnel ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingCustomerFunnel)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingCustomerFunnel ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <ChevronRightIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">Customer Funnel</span>
                                </button>
                                <button title={isSidebarCollapsed ? 'SLA Trend' : undefined} aria-current={view === View.OnboardingSLATrend ? 'page' : undefined} onClick={() => navigateTo(View.OnboardingSLATrend)} className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all ml-6 ${view === View.OnboardingSLATrend ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                  <ClockIcon className="h-5 w-5" />
                                  <span className="text-[14px] font-semibold">SLA Trend</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                    </nav>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 shrink-0 shadow-sm relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button aria-label="Open sidebar" onClick={toggleSidebar} className={`${isSidebarCollapsed ? 'hidden' : 'lg:hidden'} p-2 text-gray-500 hover:bg-gray-100 rounded-md mr-1`}>
                                <MenuIcon className="h-6 w-6" />
                            </button>
                            {view !== View.Dashboard && (
                                <button onClick={() => navigateTo(View.Dashboard)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </button>
                            )}
                            <h2 className="text-2xl font-black text-[#1e3a8a] tracking-tight">
                                {getViewTitle(view)}
                            </h2>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-3 px-4 py-2 border border-gray-100 rounded-full shadow-sm bg-white hover:bg-gray-50 transition-all cursor-pointer mb-2">
                                <div className="p-1 rounded-full bg-gray-50">
                                    <UserIcon className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Wahyudio Mahesa</span>
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <div className="flex items-center space-x-1.5 text-[14px] font-medium mr-1">
                                <span className="text-slate-500">Data as of</span>
                                <span className="text-[#f97316] font-bold">{dataAsOfLabel}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50/50">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;
