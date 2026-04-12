import type {
  BookingDto,
  CreateBookingRequest,
  SearchBookingsParams,
  PagedResult,
} from '@/shared/types';
import { httpClient } from './http-client';

const BASE = '/api/bookings';

/**
 * Creates a new travel booking.
 * POST /api/bookings
 */
export async function createBooking(
  data: CreateBookingRequest,
): Promise<BookingDto> {
  return httpClient.post<BookingDto>(BASE, data);
}

/**
 * Retrieves a single booking by its ID.
 * GET /api/bookings/{id}
 */
export async function getBooking(id: string): Promise<BookingDto> {
  return httpClient.get<BookingDto>(`${BASE}/${id}`);
}

/**
 * Cancels a booking, optionally providing a reason.
 * DELETE /api/bookings/{id}?reason=
 */
export async function cancelBooking(
  id: string,
  reason?: string,
): Promise<void> {
  await httpClient.del<void>(`${BASE}/${id}`, { reason });
}

/**
 * Searches bookings with filtering and pagination.
 * GET /api/bookings/search
 */
export async function searchBookings(
  params: SearchBookingsParams,
): Promise<PagedResult<BookingDto>> {
  return httpClient.get<PagedResult<BookingDto>>(
    `${BASE}/search`,
    params as Record<string, unknown>,
  );
}
