import { useCallback, useEffect, useState } from 'react';
import { customerOnboardingService } from './service';
import type { CustomerOnboardingDashboardData, TimeGranularity } from './types';

export function useCustomerOnboarding(granularity: TimeGranularity, period: string) {
  const [data, setData] = useState<CustomerOnboardingDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => setRequestKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    customerOnboardingService.getDashboard(granularity, period)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError('Customer onboarding data could not be loaded.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [granularity, period, requestKey]);

  return { data, isLoading, error, retry };
}
