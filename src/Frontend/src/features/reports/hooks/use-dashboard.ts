import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/shared/api';
import { reportKeys } from '@/shared/api/query-keys';

export function useDashboard() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: getDashboard,
    staleTime: 60_000,
  });
}
