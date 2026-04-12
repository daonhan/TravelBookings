import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createEvent } from '@/shared/api';
import { eventKeys } from '@/shared/api';
import { useToast } from '@/shared/ui/toast';
import type { CreateEventRequest } from '@/shared/types';

/**
 * TanStack Query mutation for creating a new event.
 *
 * On success:
 * - Invalidates all event list queries so search results refresh.
 * - Navigates the user to the newly created event detail page.
 * - Shows a success toast notification.
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    onSuccess: (createdEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      addToast({
        variant: 'success',
        title: 'Event created',
        description: `"${createdEvent.title}" has been created successfully.`,
      });

      navigate({ to: '/events/$eventId', params: { eventId: createdEvent.id } });
    },
    onError: () => {
      addToast({
        variant: 'error',
        title: 'Failed to create event',
        description: 'An unexpected error occurred. Please try again.',
      });
    },
  });
}
