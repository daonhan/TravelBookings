import { useQuery } from '@tanstack/react-query';
import { getRevenueReport } from '@/shared/api';
import { reportKeys } from '@/shared/api/query-keys';

interface UseRevenueReportParams {
  from?: string;
  to?: string;
}

export function useRevenueReport({ from, to }: UseRevenueReportParams) {
  return useQuery({
    queryKey: reportKeys.revenue({ from, to }),
    queryFn: () => getRevenueReport({ from, to }),
    enabled: Boolean(from && to),
  });
}
