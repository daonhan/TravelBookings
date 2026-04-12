import type {
  BookingDto,
  ItineraryDto,
  PassengerDto,
  EventDto,
  SessionDto,
  RegistrationDto,
  PaymentDto,
  TransactionDto,
  DashboardDto,
  BookingSummaryDto,
  EventSummaryDto,
  RevenueReportDto,
  RevenueItemDto,
  NotificationDto,
  UserPreferenceDto,
  PagedResult,
} from '@/shared/types';

// ---------------------------------------------------------------------------
// Helper: deterministic ISO date strings relative to a base epoch
// ---------------------------------------------------------------------------

const BASE_DATE = '2026-06-15T10:00:00.000Z';
const PAST_DATE = '2026-05-01T08:30:00.000Z';

// ---------------------------------------------------------------------------
// Itinerary & Passenger helpers
// ---------------------------------------------------------------------------

export function createMockItinerary(
  overrides?: Partial<ItineraryDto>,
): ItineraryDto {
  return {
    id: crypto.randomUUID(),
    origin: 'Sydney',
    destination: 'Melbourne',
    travelClass: 'Economy',
    departureDate: '2026-07-01T06:00:00.000Z',
    returnDate: '2026-07-08T18:00:00.000Z',
    ...overrides,
  };
}

export function createMockPassenger(
  overrides?: Partial<PassengerDto>,
): PassengerDto {
  return {
    id: crypto.randomUUID(),
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1990-03-15',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

export function createMockBooking(
  overrides?: Partial<BookingDto>,
): BookingDto {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    status: 'Confirmed',
    totalAmount: 1250.0,
    currency: 'AUD',
    paymentReference: `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: BASE_DATE,
    confirmedAt: '2026-06-15T10:05:00.000Z',
    itineraries: [createMockItinerary()],
    passengers: [createMockPassenger()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Session & Registration helpers
// ---------------------------------------------------------------------------

export function createMockSession(
  overrides?: Partial<SessionDto>,
): SessionDto {
  return {
    id: crypto.randomUUID(),
    title: 'Keynote: Future of Cloud-Native Architecture',
    speaker: 'Dr. Sarah Chen',
    startTime: '2026-08-10T09:00:00.000Z',
    endTime: '2026-08-10T10:30:00.000Z',
    capacity: 200,
    ...overrides,
  };
}

export function createMockRegistration(
  overrides?: Partial<RegistrationDto>,
): RegistrationDto {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    attendeeName: 'John Smith',
    registrationType: 'Standard',
    status: 'Confirmed',
    registeredAt: BASE_DATE,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export function createMockEvent(overrides?: Partial<EventDto>): EventDto {
  return {
    id: crypto.randomUUID(),
    organizerId: crypto.randomUUID(),
    title: 'Azure Tech Summit 2026',
    description:
      'Annual cloud-native technology conference featuring workshops, talks, and networking sessions.',
    venue: 'International Convention Centre',
    city: 'Sydney',
    country: 'Australia',
    startDate: '2026-08-10T08:00:00.000Z',
    endDate: '2026-08-12T17:00:00.000Z',
    capacity: 500,
    availableCapacity: 342,
    status: 'Published',
    categories: 'Technology,Cloud,Azure',
    createdAt: PAST_DATE,
    sessions: [createMockSession()],
    registrations: [createMockRegistration()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Transaction helper
// ---------------------------------------------------------------------------

export function createMockTransaction(
  overrides?: Partial<TransactionDto>,
): TransactionDto {
  return {
    id: crypto.randomUUID(),
    type: 'Charge',
    amount: 1250.0,
    gatewayReference: `GW-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    createdAt: BASE_DATE,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export function createMockPayment(
  overrides?: Partial<PaymentDto>,
): PaymentDto {
  return {
    id: crypto.randomUUID(),
    bookingId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    amount: 1250.0,
    currency: 'AUD',
    method: 'CreditCard',
    status: 'Completed',
    gatewayTransactionId: `TXN-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    createdAt: BASE_DATE,
    processedAt: '2026-06-15T10:02:00.000Z',
    transactions: [createMockTransaction()],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export function createMockNotification(
  overrides?: Partial<NotificationDto>,
): NotificationDto {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: 'BookingConfirmation',
    channel: 'Email',
    status: 'Delivered',
    subject: 'Your booking has been confirmed',
    body: 'Dear Jane, your booking to Melbourne on 1 Jul 2026 is confirmed. Reference: BK-00001.',
    recipient: 'jane.doe@example.com',
    errorMessage: null,
    referenceId: crypto.randomUUID(),
    createdAt: BASE_DATE,
    sentAt: '2026-06-15T10:06:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Reports – summaries
// ---------------------------------------------------------------------------

export function createMockBookingSummary(
  overrides?: Partial<BookingSummaryDto>,
): BookingSummaryDto {
  return {
    bookingId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    destination: 'Melbourne',
    travelDate: '2026-07-01T06:00:00.000Z',
    totalAmount: 1250.0,
    currency: 'AUD',
    status: 'Confirmed',
    createdAt: BASE_DATE,
    cancelledAt: null,
    ...overrides,
  };
}

export function createMockEventSummary(
  overrides?: Partial<EventSummaryDto>,
): EventSummaryDto {
  return {
    eventId: crypto.randomUUID(),
    title: 'Azure Tech Summit 2026',
    location: 'Sydney, Australia',
    startDate: '2026-08-10T08:00:00.000Z',
    endDate: '2026-08-12T17:00:00.000Z',
    capacity: 500,
    registeredCount: 158,
    status: 'Published',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function createMockDashboard(
  overrides?: Partial<DashboardDto>,
): DashboardDto {
  return {
    totalBookings: 1247,
    totalEvents: 38,
    totalRevenue: 984_350.0,
    currency: 'AUD',
    recentBookings: [
      createMockBookingSummary({ destination: 'Melbourne' }),
      createMockBookingSummary({ destination: 'Brisbane' }),
      createMockBookingSummary({ destination: 'Perth' }),
    ],
    upcomingEvents: [
      createMockEventSummary({ title: 'Azure Tech Summit 2026' }),
      createMockEventSummary({ title: 'DevOps Days Sydney' }),
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Revenue Report
// ---------------------------------------------------------------------------

export function createMockRevenueItem(
  overrides?: Partial<RevenueItemDto>,
): RevenueItemDto {
  return {
    paymentId: crypto.randomUUID(),
    bookingId: crypto.randomUUID(),
    amount: 1250.0,
    status: 'Completed',
    processedAt: BASE_DATE,
    ...overrides,
  };
}

export function createMockRevenueReport(
  overrides?: Partial<RevenueReportDto>,
): RevenueReportDto {
  return {
    fromDate: '2026-06-01T00:00:00.000Z',
    toDate: '2026-06-30T23:59:59.999Z',
    totalRevenue: 87_420.0,
    currency: 'AUD',
    transactionCount: 64,
    items: [
      createMockRevenueItem(),
      createMockRevenueItem({ amount: 890.0 }),
      createMockRevenueItem({ amount: 2100.5 }),
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// User Preference
// ---------------------------------------------------------------------------

export function createMockUserPreference(
  overrides?: Partial<UserPreferenceDto>,
): UserPreferenceDto {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    preferredChannel: 'Email',
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    email: 'jane.doe@example.com',
    phoneNumber: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Generic paged result wrapper
// ---------------------------------------------------------------------------

export function createMockPagedResult<T>(
  items: T[],
  page = 1,
  pageSize = 20,
): PagedResult<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
