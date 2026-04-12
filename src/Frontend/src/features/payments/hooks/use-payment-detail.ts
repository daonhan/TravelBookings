import { useQuery } from '@tanstack/react-query';
import { getPayment } from '@/shared/api';
import { paymentKeys } from '@/shared/api';

/**
 * TanStack Query hook for fetching a single payment by its ID.
 *
 * The query is only enabled when `paymentId` is a non-empty string so it
 * can safely be called with a potentially undefined route param.
 */
export function usePaymentDetail(paymentId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => getPayment(paymentId),
    enabled: Boolean(paymentId),
    staleTime: 30_000,
  });
}
