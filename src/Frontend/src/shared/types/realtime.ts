export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  eventVersion: number;
  timestamp: string;
  correlationId: string;
  source: string;
}

export interface BookingConfirmedEvent extends IntegrationEvent {
  bookingId: string;
  userId: string;
  travelType: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  totalAmount: number;
  currency: string;
  passengerCount: number;
  paymentReference: string;
}

export interface BookingCancelledEvent extends IntegrationEvent {
  bookingId: string;
  userId: string;
  reason: string;
  cancellationFee: number;
  refundAmount: number;
  currency: string;
  originalPaymentId: string;
}

export interface EventCreatedEvent extends IntegrationEvent {
  orgEventId: string;
  organizerId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: string;
  categories: string[];
}

export interface AttendeeRegisteredEvent extends IntegrationEvent {
  registrationId: string;
  orgEventId: string;
  userId: string;
  attendeeName: string;
  registrationType: string;
  sessionPreferences: string[];
}

export interface PaymentProcessedEvent extends IntegrationEvent {
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  gatewayTransactionId: string;
  processedAt: string;
}

export interface PaymentFailedEvent extends IntegrationEvent {
  paymentId: string;
  bookingId: string;
  reason: string;
  errorCode: string;
}

export type SignalREventMap = {
  BookingConfirmed: BookingConfirmedEvent;
  BookingCancelled: BookingCancelledEvent;
  EventCreated: EventCreatedEvent;
  AttendeeRegistered: AttendeeRegisteredEvent;
  PaymentProcessed: PaymentProcessedEvent;
  PaymentFailed: PaymentFailedEvent;
};

export type SignalREventName = keyof SignalREventMap;
