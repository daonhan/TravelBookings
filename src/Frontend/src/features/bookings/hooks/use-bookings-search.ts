import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingKeys } from '@/shared/api/query-keys';
import { searchBookings } from '@/shared/api/bookings-api';
import type { SearchBookingsParams, PagedResult, BookingDto } from '@/shared/types';

/**
 * TanStack Query hook for searching bookings with server-side pagination.
 * Uses `keepPreviousData` so the UI remains stable while a new page loads.
 */
export function useBookingsSearch(params: SearchBookingsParams) {
  return useQuery<PagedResult<BookingDto>>({
    queryKey: bookingKeys.list(params as Record<string, unknown>),
    queryFn: () => searchBookings(params),
    placeholderData: keepPreviousData,
  });
}
