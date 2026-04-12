import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserPreferences } from '@/shared/api';
import { notificationKeys } from '@/shared/api/query-keys';
import { useAuth } from '@/shared/auth';
import { useNotificationStore } from '@/shared/stores';
import type { UpdateUserPreferenceRequest } from '@/shared/types';

/**
 * Mutation hook that persists notification-preference changes and keeps
 * the query cache in sync.  Shows a success toast on completion.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user!.id;
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: Omit<UpdateUserPreferenceRequest, 'userId'>) =>
      updateUserPreferences({ ...data, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(userId),
      });
      addToast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
        variant: 'success',
      });
    },
    onError: () => {
      addToast({
        title: 'Failed to save preferences',
        description:
          'Something went wrong while updating your preferences. Please try again.',
        variant: 'error',
      });
    },
  });
}
