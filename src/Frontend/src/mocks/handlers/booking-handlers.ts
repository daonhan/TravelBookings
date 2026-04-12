import { http, HttpResponse } from 'msw';
import {
  createMockBooking,
  createMockPagedResult,
} from '../fixtures';

export const bookingHandlers = [
  // POST /api/bookings — create a new booking
  http.post('/api/bookings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const booking = createMockBooking({
      status: 'Requested',
      userId: (body.userId as string) ?? undefined,
      totalAmount: (body.totalAmount as number) ?? undefined,
      currency: (body.currency as string) ?? undefined,
      confirmedAt: null,
    });
    return HttpResponse.json(booking, { status: 201 });
  }),

  // GET /api/bookings/:id — retrieve a single booking
  http.get('/api/bookings/:id', ({ params }) => {
    const booking = createMockBooking({ id: params.id as string });
    return HttpResponse.json(booking);
  }),

  // DELETE /api/bookings/:id — cancel / delete a booking
  http.delete('/api/bookings/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/bookings/search — search bookings (paginated)
  http.get('/api/bookings/search', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    const bookings = Array.from({ length: 5 }, (_, i) =>
      createMockBooking({
        totalAmount: 800 + i * 150,
        status: i % 2 === 0 ? 'Confirmed' : 'Requested',
      }),
    );

    return HttpResponse.json(createMockPagedResult(bookings, page, pageSize));
  }),
];
