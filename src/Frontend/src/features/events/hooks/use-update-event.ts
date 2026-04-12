import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvent } from '@/shared/api';
import { eventKeys } from '@/shared/api';
import { useToast } from '@/shared/ui/toast';
import type { UpdateEventRequest } from '@/shared/types';

/**
 * TanStack Query mutation for updating an existing event.
 *
 * On success:
 * - Invalidates both the event detail and all event list queries
 *   so the UI stays consistent.
 * - Shows a success toast.
 */
export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateEventRequest) => updateEvent(eventId, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      addToast({
        variant: 'success',
        title: 'Event updated',
        description: `"${updatedEvent.title}" has been updated successfully.`,
      });
    },
    onError: () => {
      addToast({
        variant: 'error',
        title: 'Failed to update event',
        description: 'An unexpected error occurred. Please try again.',
      });
    },
  });
}
