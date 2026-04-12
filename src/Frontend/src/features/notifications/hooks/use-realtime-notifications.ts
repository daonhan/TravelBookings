import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalREvent } from '@/shared/realtime';
import { notificationKeys } from '@/shared/api/query-keys';
import { useNotificationStore } from '@/shared/stores';
import type {
  BookingConfirmedEvent,
  BookingCancelledEvent,
  EventCreatedEvent,
  AttendeeRegisteredEvent,
  PaymentProcessedEvent,
  PaymentFailedEvent,
} from '@/shared/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toastMessageForEvent(
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: Record<string, any>,
): { title: string; description: string; href?: string } {
  switch (eventType) {
    case 'BookingConfirmed':
      return {
        title: 'Booking Confirmed',
        description: `Your booking from ${event.origin} to ${event.destination} has been confirmed.`,
        href: `/bookings/${event.bookingId}`,
      };
    case 'BookingCancelled':
      return {
        title: 'Booking Cancelled',
        description: `A booking has been cancelled. Refund: ${event.refundAmount} ${event.currency}.`,
        href: `/bookings/${event.bookingId}`,
      };
    case 'EventCreated':
      return {
        title: 'New Event',
        description: `"${event.title}" has been created at ${event.location}.`,
        href: `/events/${event.orgEventId}`,
      };
    case 'AttendeeRegistered':
      return {
        title: 'Attendee Registered',
        description: `${event.attendeeName} registered for an event.`,
        href: `/events/${event.orgEventId}`,
      };
    case 'PaymentProcessed':
      return {
        title: 'Payment Processed',
        description: `Payment of ${event.amount} ${event.currency} was processed successfully.`,
        href: `/payments/${event.paymentId}`,
      };
    case 'PaymentFailed':
      return {
        title: 'Payment Failed',
        description: `A payment failed: ${event.reason}.`,
        href: `/payments/${event.paymentId}`,
      };
    default:
      return {
        title: 'Notification',
        description: 'You have a new notification.',
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Subscribes to all six SignalR real-time event types. On each event the
 * hook increments the unread badge count, shows an in-app toast, and
 * invalidates the notification list queries so the table stays fresh.
 */
export function useRealtimeNotifications(): void {
  const queryClient = useQueryClient();
  const incrementUnread = useNotificationStore((s) => s.incrementUnread);
  const addToast = useNotificationStore((s) => s.addToast);

  const handleEvent = useCallback(
    (eventType: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: Record<string, any>) => {
        incrementUnread();

        const { title, description, href } = toastMessageForEvent(
          eventType,
          event,
        );

        addToast({
          title,
          description,
          variant: 'info',
          ...(href ? { action: { label: 'View', href } } : {}),
        });

        queryClient.invalidateQueries({
          queryKey: notificationKeys.lists(),
        });
      },
    [queryClient, incrementUnread, addToast],
  );

  useSignalREvent<BookingConfirmedEvent>(
    'BookingConfirmed',
    handleEvent('BookingConfirmed'),
  );

  useSignalREvent<BookingCancelledEvent>(
    'BookingCancelled',
    handleEvent('BookingCancelled'),
  );

  useSignalREvent<EventCreatedEvent>(
    'EventCreated',
    handleEvent('EventCreated'),
  );

  useSignalREvent<AttendeeRegisteredEvent>(
    'AttendeeRegistered',
    handleEvent('AttendeeRegistered'),
  );

  useSignalREvent<PaymentProcessedEvent>(
    'PaymentProcessed',
    handleEvent('PaymentProcessed'),
  );

  useSignalREvent<PaymentFailedEvent>(
    'PaymentFailed',
    handleEvent('PaymentFailed'),
  );
}
