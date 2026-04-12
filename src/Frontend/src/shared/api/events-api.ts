import type {
  EventDto,
  CreateEventRequest,
  UpdateEventRequest,
  RegisterAttendeeRequest,
  RegistrationDto,
  SearchEventsParams,
  PagedResult,
} from '@/shared/types';
import { httpClient } from './http-client';

const BASE = '/api/events';

/**
 * Creates a new event.
 * POST /api/events
 */
export async function createEvent(
  data: CreateEventRequest,
): Promise<EventDto> {
  return httpClient.post<EventDto>(BASE, data);
}

/**
 * Retrieves a single event by its ID.
 * GET /api/events/{id}
 */
export async function getEvent(id: string): Promise<EventDto> {
  return httpClient.get<EventDto>(`${BASE}/${id}`);
}

/**
 * Updates an existing event.
 * PUT /api/events/{id}
 */
export async function updateEvent(
  id: string,
  data: UpdateEventRequest,
): Promise<EventDto> {
  return httpClient.put<EventDto>(`${BASE}/${id}`, data);
}

/**
 * Cancels an event, optionally providing a reason.
 * DELETE /api/events/{id}?reason=
 */
export async function cancelEvent(
  id: string,
  reason?: string,
): Promise<void> {
  await httpClient.del<void>(`${BASE}/${id}`, { reason });
}

/**
 * Searches events with filtering and pagination.
 * GET /api/events/search
 */
export async function searchEvents(
  params: SearchEventsParams,
): Promise<PagedResult<EventDto>> {
  return httpClient.get<PagedResult<EventDto>>(
    `${BASE}/search`,
    params as Record<string, unknown>,
  );
}

/**
 * Registers an attendee for an event.
 * POST /api/events/{id}/registrations
 */
export async function registerAttendee(
  eventId: string,
  data: RegisterAttendeeRequest,
): Promise<RegistrationDto> {
  return httpClient.post<RegistrationDto>(
    `${BASE}/${eventId}/registrations`,
    data,
  );
}
