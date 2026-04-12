import type {
  NotificationDto,
  UserPreferenceDto,
  UpdateUserPreferenceRequest,
  PagedResult,
} from '@/shared/types';
import { httpClient } from './http-client';

const BASE = '/api/notifications';

/**
 * Retrieves a single notification by its ID.
 * GET /api/notifications/{id}
 */
export async function getNotification(
  id: string,
): Promise<NotificationDto> {
  return httpClient.get<NotificationDto>(`${BASE}/${id}`);
}

/**
 * Retrieves paginated notifications for a specific user.
 * GET /api/notifications/user/{userId}
 */
export async function getUserNotifications(
  userId: string,
  params?: { page?: number; pageSize?: number },
): Promise<PagedResult<NotificationDto>> {
  return httpClient.get<PagedResult<NotificationDto>>(
    `${BASE}/user/${userId}`,
    params as Record<string, unknown> | undefined,
  );
}

/**
 * Retrieves notification preferences for a specific user.
 * GET /api/notifications/preferences/{userId}
 */
export async function getUserPreferences(
  userId: string,
): Promise<UserPreferenceDto> {
  return httpClient.get<UserPreferenceDto>(`${BASE}/preferences/${userId}`);
}

/**
 * Updates notification preferences.
 * PUT /api/notifications/preferences
 */
export async function updateUserPreferences(
  data: UpdateUserPreferenceRequest,
): Promise<UserPreferenceDto> {
  return httpClient.put<UserPreferenceDto>(`${BASE}/preferences`, data);
}
