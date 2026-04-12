import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getUserNotifications } from '@/shared/api';
import { notificationKeys } from '@/shared/api/query-keys';
import { useAuth } from '@/shared/auth';

interface UseUserNotificationsOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Fetches a paginated list of notifications for the currently authenticated user.
 * Uses `keepPreviousData` so that pagination transitions don't flash loading states.
 */
export function useUserNotifications(
  options: UseUserNotificationsOptions = {},
) {
  const { page = 1, pageSize = 20 } = options;
  const { user } = useAuth();
  const userId = user!.id;

  return useQuery({
    queryKey: notificationKeys.list({ userId, page, pageSize }),
    queryFn: () => getUserNotifications(userId, { page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: Boolean(userId),
  });
}
