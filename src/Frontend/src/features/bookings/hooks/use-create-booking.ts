import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { bookingKeys } from '@/shared/api/query-keys';
import { createBooking } from '@/shared/api/bookings-api';
import { useToast } from '@/shared/ui/toast';
import type { CreateBookingRequest, BookingDto } from '@/shared/types';

/**
 * Mutation hook for creating a new booking.
 *
 * On success the hook:
 * 1. Invalidates all booking list queries so they refetch.
 * 2. Navigates to the new booking's detail page.
 * 3. Shows a "Booking Requested" success toast.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  return useMutation<BookingDto, Error, CreateBookingRequest>({
    mutationFn: (data) => createBooking(data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      navigate({ to: '/bookings/$bookingId', params: { bookingId: booking.id } });

      addToast({
        variant: 'success',
        title: 'Booking Requested',
        description:
          'Your booking has been submitted and is being processed by the saga orchestrator.',
      });
    },
  });
}
