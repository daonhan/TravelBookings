import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerAttendee } from '@/shared/api';
import { eventKeys } from '@/shared/api';
import { useToast } from '@/shared/ui/toast';
import type { RegisterAttendeeRequest } from '@/shared/types';

/**
 * TanStack Query mutation for registering an attendee for an event.
 *
 * On success:
 * - Invalidates the event detail query so the capacity gauge and
 *   registration list update immediately.
 * - Shows a success toast.
 */
export function useRegisterAttendee(eventId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: RegisterAttendeeRequest) =>
      registerAttendee(eventId, data),
    onSuccess: (registration) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });

      addToast({
        variant: 'success',
        title: 'Registration successful',
        description: `${registration.attendeeName} has been registered for this event.`,
      });
    },
    onError: () => {
      addToast({
        variant: 'error',
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    },
  });
}
