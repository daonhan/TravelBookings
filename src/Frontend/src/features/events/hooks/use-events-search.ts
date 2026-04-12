import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchEvents } from '@/shared/api';
import { eventKeys } from '@/shared/api';
import type { SearchEventsParams } from '@/shared/types';

/**
 * TanStack Query hook for searching events with server-side pagination
 * and filtering. Wraps the `searchEvents` API call.
 *
 * Uses `keepPreviousData` so the UI does not flash empty states when
 * navigating between pages or changing filters.
 */
export function useEventsSearch(params: SearchEventsParams) {
  return useQuery({
    queryKey: eventKeys.list(params as Record<string, unknown>),
    queryFn: () => searchEvents(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
