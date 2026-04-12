import { useQuery } from '@tanstack/react-query';
import { getEvent } from '@/shared/api';
import { eventKeys } from '@/shared/api';

/**
 * TanStack Query hook for fetching a single event by its ID.
 *
 * The query is only enabled when `eventId` is a non-empty string so it
 * can safely be called with a potentially undefined route param.
 */
export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    enabled: Boolean(eventId),
    staleTime: 30_000,
  });
}
