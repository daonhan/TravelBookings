import { http, HttpResponse } from 'msw';
import {
  createMockDashboard,
  createMockBookingSummary,
  createMockRevenueReport,
  createMockPagedResult,
} from '../fixtures';

export const reportHandlers = [
  // GET /api/reports/dashboard — main dashboard aggregation
  http.get('/api/reports/dashboard', () => {
    return HttpResponse.json(createMockDashboard());
  }),

  // GET /api/reports/bookings — booking summary report (paginated)
  http.get('/api/reports/bookings', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    const destinations = ['Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart'];
    const statuses = ['Confirmed', 'Requested', 'Cancelled', 'Confirmed', 'Confirmed'];

    const summaries = destinations.map((destination, i) =>
      createMockBookingSummary({
        destination,
        totalAmount: 900 + i * 200,
        status: statuses[i],
        cancelledAt: statuses[i] === 'Cancelled' ? '2026-06-20T12:00:00.000Z' : null,
      }),
    );

    return HttpResponse.json(createMockPagedResult(summaries, page, pageSize));
  }),

  // GET /api/reports/revenue — revenue breakdown report
  http.get('/api/reports/revenue', () => {
    return HttpResponse.json(createMockRevenueReport());
  }),
];
