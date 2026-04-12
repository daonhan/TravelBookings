import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingKeys } from '@/shared/api/query-keys';
import { cancelBooking } from '@/shared/api/bookings-api';
import { useToast } from '@/shared/ui/toast';

interface CancelBookingVariables {
  id: string;
  reason: string;
}

/**
 * Mutation hook for cancelling a booking.
 *
 * On success the hook:
 * 1. Invalidates all booking queries (lists + the specific detail).
 * 2. Shows a cancellation success toast.
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, CancelBookingVariables>({
    mutationFn: ({ id, reason }) => cancelBooking(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(variables.id),
      });

      addToast({
        variant: 'info',
        title: 'Booking Cancelled',
        description:
          'The cancellation has been submitted. Compensation steps are in progress.',
      });
    },
  });
}
