import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  BookingConfirmedEvent,
  BookingCancelledEvent,
  EventCreatedEvent,
  AttendeeRegisteredEvent,
  PaymentProcessedEvent,
  PaymentFailedEvent,
} from '@/shared/types';
import {
  bookingKeys,
  eventKeys,
  paymentKeys,
  reportKeys,
} from '@/shared/api/query-keys';
import { useSignalREvent } from './use-signalr-event';

export function useRealtimeInvalidation(): void {
  const queryClient = useQueryClient();

  const onBookingConfirmed = useCallback(
    (_event: BookingConfirmedEvent) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    [queryClient],
  );

  const onBookingCancelled = useCallback(
    (_event: BookingCancelledEvent) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    [queryClient],
  );

  const onEventCreated = useCallback(
    (_event: EventCreatedEvent) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    [queryClient],
  );

  const onAttendeeRegistered = useCallback(
    (_event: AttendeeRegisteredEvent) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    [queryClient],
  );

  const onPaymentProcessed = useCallback(
    (_event: PaymentProcessedEvent) => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    [queryClient],
  );

  const onPaymentFailed = useCallback(
    (_event: PaymentFailedEvent) => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
    [queryClient],
  );

  useSignalREvent<BookingConfirmedEvent>('BookingConfirmed', onBookingConfirmed);
  useSignalREvent<BookingCancelledEvent>('BookingCancelled', onBookingCancelled);
  useSignalREvent<EventCreatedEvent>('EventCreated', onEventCreated);
  useSignalREvent<AttendeeRegisteredEvent>('AttendeeRegistered', onAttendeeRegistered);
  useSignalREvent<PaymentProcessedEvent>('PaymentProcessed', onPaymentProcessed);
  useSignalREvent<PaymentFailedEvent>('PaymentFailed', onPaymentFailed);
}
