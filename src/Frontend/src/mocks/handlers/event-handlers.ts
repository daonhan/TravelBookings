import { http, HttpResponse } from 'msw';
import {
  createMockEvent,
  createMockRegistration,
  createMockPagedResult,
} from '../fixtures';

export const eventHandlers = [
  // POST /api/events — create a new event
  http.post('/api/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const event = createMockEvent({
      title: (body.title as string) ?? undefined,
      description: (body.description as string) ?? undefined,
      status: 'Draft',
    });
    return HttpResponse.json(event, { status: 201 });
  }),

  // GET /api/events/:id — retrieve a single event
  http.get('/api/events/:id', ({ params }) => {
    const event = createMockEvent({ id: params.id as string });
    return HttpResponse.json(event);
  }),

  // PUT /api/events/:id — update an event
  http.put('/api/events/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const event = createMockEvent({
      id: params.id as string,
      title: (body.title as string) ?? undefined,
      description: (body.description as string) ?? undefined,
    });
    return HttpResponse.json(event);
  }),

  // DELETE /api/events/:id — delete an event
  http.delete('/api/events/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/events/search — search events (paginated)
  http.get('/api/events/search', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    const events = Array.from({ length: 5 }, (_, i) =>
      createMockEvent({
        title: `Tech Conference ${i + 1}`,
        capacity: 200 + i * 50,
        availableCapacity: 100 + i * 20,
        status: i === 0 ? 'Draft' : 'Published',
      }),
    );

    return HttpResponse.json(createMockPagedResult(events, page, pageSize));
  }),

  // POST /api/events/:id/registrations — register an attendee
  http.post('/api/events/:id/registrations', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const registration = createMockRegistration({
      userId: (body.userId as string) ?? undefined,
      attendeeName: (body.attendeeName as string) ?? undefined,
      registrationType: (body.registrationType as string) ?? 'Standard',
      status: 'Confirmed',
    });
    return HttpResponse.json(registration, { status: 201 });
  }),
];
