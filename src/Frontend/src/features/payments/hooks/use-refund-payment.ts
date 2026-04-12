import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refundPayment } from '@/shared/api';
import { paymentKeys } from '@/shared/api';
import { useToast } from '@/shared/ui/toast';

/**
 * TanStack Query mutation for initiating a refund on a payment.
 *
 * On success:
 * - Invalidates the payment detail cache so the UI reflects the new status.
 * - Invalidates all payment list queries (status/amounts may have changed).
 * - Shows a success toast.
 *
 * On error:
 * - Shows an error toast with a generic message.
 */
export function useRefundPayment(paymentId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: { refundAmount: number }) =>
      refundPayment(paymentId, { refundAmount: data.refundAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });

      addToast({
        variant: 'success',
        title: 'Refund initiated',
        description: 'The refund has been submitted for processing.',
      });
    },
    onError: () => {
      addToast({
        variant: 'error',
        title: 'Refund failed',
        description: 'An unexpected error occurred while processing the refund. Please try again.',
      });
    },
  });
}
