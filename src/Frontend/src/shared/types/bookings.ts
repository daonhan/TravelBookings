export type BookingStatus =
  | 'Draft'
  | 'Requested'
  | 'InventoryReserved'
  | 'PaymentProcessing'
  | 'Confirmed'
  | 'Cancelled'
  | 'Failed'
  | 'Compensating';

export type AllocationStatus = 'Pending' | 'Reserved' | 'Confirmed' | 'Released' | 'Failed';

export interface BookingDto {
  id: string;
  userId: string;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  paymentReference: string;
  createdAt: string;
  confirmedAt: string | null;
  itineraries: ItineraryDto[];
  passengers: PassengerDto[];
}

export interface ItineraryDto {
  id: string;
  origin: string;
  destination: string;
  travelClass: string;
  departureDate: string;
  returnDate: string | null;
}

export interface PassengerDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface CreateBookingRequest {
  userId: string;
  totalAmount: number;
  currency: string;
  itineraries: CreateItineraryRequest[];
  passengers: CreatePassengerRequest[];
}

export interface CreateItineraryRequest {
  origin: string;
  destination: string;
  travelClass: string;
  departureDate: string;
  returnDate?: string;
}

export interface CreatePassengerRequest {
  firstName: string;
  lastName: string;
  passportNumber: string;
  dateOfBirth: string;
}

export interface SearchBookingsParams {
  userId?: string;
  destination?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}
