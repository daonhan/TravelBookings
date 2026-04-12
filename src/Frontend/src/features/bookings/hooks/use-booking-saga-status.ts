import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { bookingKeys } from '@/shared/api/query-keys';
import { useSignalREvent } from '@/shared/realtime/use-signalr-event';
import { useBookingDetail } from './use-booking-detail';
import type { BookingStatus, BookingConfirmedEvent, BookingCancelledEvent } from '@/shared/types';

interface UseBookingSagaStatusResult {
  booking: ReturnType<typeof useBookingDetail>['data'];
  sagaState: BookingStatus;
  isTransitioning: boolean;
  isLoading: boolean;
  error: ReturnType<typeof useBookingDetail>['error'];
}

/**
 * Combines the booking detail query with real-time SignalR events so the UI
 * automatically updates when the saga orchestrator transitions the booking
 * through its state machine.
 *
 * Listens for `BookingConfirmed` and `BookingCancelled` SignalR events that
 * match the given `bookingId` and invalidates the detail query so fresh
 * server state is fetched.
 */
export function useBookingSagaStatus(
  bookingId: string | undefined,
): UseBookingSagaStatusResult {
  const queryClient = useQueryClient();
  const { data: booking, isLoading, error } = useBookingDetail(bookingId);

  // Track whether we're in a transitional period between the SignalR event
  // arriving and the query finishing its refetch.
  const [isTransitioning, setIsTransitioning] = useState(false);

  const invalidateBooking = useCallback(() => {
    if (!bookingId) return;
    setIsTransitioning(true);
    queryClient
      .invalidateQueries({ queryKey: bookingKeys.detail(bookingId) })
      .then(() => setIsTransitioning(false));
  }, [bookingId, queryClient]);

  // Listen for BookingConfirmed
  useSignalREvent<BookingConfirmedEvent>('BookingConfirmed', (event) => {
    if (event.bookingId === bookingId) {
      invalidateBooking();
    }
  });

  // Listen for BookingCancelled
  useSignalREvent<BookingCancelledEvent>('BookingCancelled', (event) => {
    if (event.bookingId === bookingId) {
      invalidateBooking();
    }
  });

  const sagaState: BookingStatus = booking?.status ?? 'Requested';

  return {
    booking,
    sagaState,
    isTransitioning,
    isLoading,
    error,
  };
}
