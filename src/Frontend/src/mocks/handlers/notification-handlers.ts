import { http, HttpResponse } from 'msw';
import {
  createMockNotification,
  createMockUserPreference,
  createMockPagedResult,
} from '../fixtures';

export const notificationHandlers = [
  // GET /api/notifications/:id — retrieve a single notification
  http.get('/api/notifications/:id', ({ params }) => {
    const notification = createMockNotification({ id: params.id as string });
    return HttpResponse.json(notification);
  }),

  // GET /api/notifications/user/:userId — list notifications for a user (paginated)
  http.get('/api/notifications/user/:userId', ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const userId = params.userId as string;

    const types = [
      'BookingConfirmation',
      'PaymentReceipt',
      'EventCreated',
      'BookingCancellation',
      'AttendeeRegistered',
    ] as const;

    const channels = ['Email', 'Push', 'Email', 'Sms', 'Push'] as const;

    const notifications = types.map((type, i) =>
      createMockNotification({
        userId,
        type,
        channel: channels[i],
        status: i < 3 ? 'Delivered' : 'Sent',
        subject: `Notification: ${type.replace(/([A-Z])/g, ' $1').trim()}`,
      }),
    );

    return HttpResponse.json(
      createMockPagedResult(notifications, page, pageSize),
    );
  }),

  // GET /api/notifications/preferences/:userId — get user notification preferences
  http.get('/api/notifications/preferences/:userId', ({ params }) => {
    const preference = createMockUserPreference({
      userId: params.userId as string,
    });
    return HttpResponse.json(preference);
  }),

  // PUT /api/notifications/preferences — update user notification preferences
  http.put('/api/notifications/preferences', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const preference = createMockUserPreference({
      userId: (body.userId as string) ?? undefined,
      preferredChannel: (body.preferredChannel as string) ?? 'Email',
      emailEnabled: (body.emailEnabled as boolean) ?? true,
      smsEnabled: (body.smsEnabled as boolean) ?? false,
      pushEnabled: (body.pushEnabled as boolean) ?? true,
      email: (body.email as string) ?? null,
      phoneNumber: (body.phoneNumber as string) ?? null,
    });
    return HttpResponse.json(preference);
  }),
];
