import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPaymentsByUser } from '@/shared/api';
import { paymentKeys } from '@/shared/api';
import { useAuth } from '@/shared/auth';

/**
 * TanStack Query hook for fetching the current user's payments with
 * server-side pagination. Wraps `getPaymentsByUser`.
 *
 * Uses `keepPreviousData` so the table does not flash empty states when
 * the user navigates between pages.
 */
export function useUserPayments(params: { page: number; pageSize: number }) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: paymentKeys.list({ userId, page: params.page, pageSize: params.pageSize }),
    queryFn: () =>
      getPaymentsByUser(userId, {
        page: params.page,
        pageSize: params.pageSize,
      }),
    placeholderData: keepPreviousData,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
