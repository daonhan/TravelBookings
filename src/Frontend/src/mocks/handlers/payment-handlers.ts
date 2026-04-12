import { http, HttpResponse } from 'msw';
import {
  createMockPayment,
  createMockTransaction,
  createMockPagedResult,
} from '../fixtures';

export const paymentHandlers = [
  // GET /api/payments/:id — retrieve a single payment
  http.get('/api/payments/:id', ({ params }) => {
    const payment = createMockPayment({ id: params.id as string });
    return HttpResponse.json(payment);
  }),

  // GET /api/payments/user/:userId — list payments for a user (paginated)
  http.get('/api/payments/user/:userId', ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const userId = params.userId as string;

    const payments = Array.from({ length: 4 }, (_, i) =>
      createMockPayment({
        userId,
        amount: 500 + i * 250,
        status: i === 0 ? 'Pending' : 'Completed',
        method: i % 2 === 0 ? 'CreditCard' : 'DebitCard',
      }),
    );

    return HttpResponse.json(createMockPagedResult(payments, page, pageSize));
  }),

  // POST /api/payments/:id/refund — process a refund
  http.post('/api/payments/:id/refund', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const refundAmount = (body.refundAmount as number) ?? 0;

    const payment = createMockPayment({
      id: params.id as string,
      status: 'Refunded',
      transactions: [
        createMockTransaction({ type: 'Charge', amount: refundAmount }),
        createMockTransaction({ type: 'Refund', amount: -refundAmount }),
      ],
    });

    return HttpResponse.json(payment);
  }),
];
