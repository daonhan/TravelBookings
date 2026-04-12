/* =================================================================== */
/*  Bookings Feature -- Barrel Export                                   */
/*  Re-exports all hooks, components, and pages for the bookings        */
/*  bounded context.                                                    */
/* =================================================================== */

/* --- Hooks ------------------------------------------------------------- */
export { useBookingsSearch } from './hooks/use-bookings-search';
export { useBookingDetail } from './hooks/use-booking-detail';
export { useCreateBooking } from './hooks/use-create-booking';
export { useCancelBooking } from './hooks/use-cancel-booking';
export { useBookingSagaStatus } from './hooks/use-booking-saga-status';

/* --- Components -------------------------------------------------------- */
export { SagaTracker } from './components/saga-tracker';
export { BookingStatusBadge } from './components/booking-status-badge';
export { ItineraryFormRow } from './components/itinerary-form-row';
export { PassengerFormRow } from './components/passenger-form-row';
export { BookingSummaryCard } from './components/booking-summary-card';

/* --- Pages ------------------------------------------------------------- */
export { BookingSearchPage } from './pages/booking-search-page';
export { BookingDetailPage } from './pages/booking-detail-page';
export { CreateBookingPage } from './pages/create-booking-page';
