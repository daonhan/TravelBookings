import { useQuery } from '@tanstack/react-query';
import { getUserPreferences } from '@/shared/api';
import { notificationKeys } from '@/shared/api/query-keys';
import { useAuth } from '@/shared/auth';

/**
 * Fetches notification preferences for the currently authenticated user.
 */
export function useNotificationPreferences() {
  const { user } = useAuth();
  const userId = user!.id;

  return useQuery({
    queryKey: notificationKeys.preferences(userId),
    queryFn: () => getUserPreferences(userId),
    staleTime: 60_000,
    enabled: Boolean(userId),
  });
}
