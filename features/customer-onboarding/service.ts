import { createCustomerOnboardingMock } from './mockData';
import type { CustomerOnboardingDashboardData, TimeGranularity } from './types';

export interface CustomerOnboardingDataSource {
  getDashboard(granularity: TimeGranularity, period: string): Promise<CustomerOnboardingDashboardData>;
}

const mockDataSource: CustomerOnboardingDataSource = {
  async getDashboard(granularity, period) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return createCustomerOnboardingMock(granularity, period);
  },
};

export const customerOnboardingService: CustomerOnboardingDataSource = mockDataSource;
