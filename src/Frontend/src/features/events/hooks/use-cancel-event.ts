import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelEvent } from '@/shared/api';
import { eventKeys } from '@/shared/api';
import { useToast } from '@/shared/ui/toast';

/**
 * TanStack Query mutation for cancelling an event.
 *
 * On success:
 * - Invalidates the event detail and all event list queries.
 * - Shows a cancellation toast.
 */
export function useCancelEvent(eventId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (reason?: string) => cancelEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      addToast({
        variant: 'warning',
        title: 'Event cancelled',
        description: 'The event has been cancelled successfully.',
      });
    },
    onError: () => {
      addToast({
        variant: 'error',
        title: 'Failed to cancel event',
        description: 'An unexpected error occurred. Please try again.',
      });
    },
  });
}
