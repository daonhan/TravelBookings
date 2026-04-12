import { useQuery } from '@tanstack/react-query';
import { bookingKeys } from '@/shared/api/query-keys';
import { getBooking } from '@/shared/api/bookings-api';
import type { BookingDto } from '@/shared/types';

/**
 * TanStack Query hook for fetching a single booking by ID.
 * The query is enabled only when `id` is truthy, so it can safely
 * receive an empty string or undefined from route params.
 */
export function useBookingDetail(id: string | undefined) {
  return useQuery<BookingDto>({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => getBooking(id!),
    enabled: Boolean(id),
  });
}
