export interface DashboardDto {
  totalBookings: number;
  totalEvents: number;
  totalRevenue: number;
  currency: string;
  recentBookings: BookingSummaryDto[];
  upcomingEvents: EventSummaryDto[];
}

export interface BookingSummaryDto {
  bookingId: string;
  userId: string;
  destination: string;
  travelDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  cancelledAt: string | null;
}

export interface EventSummaryDto {
  eventId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  registeredCount: number;
  status: string;
}

export interface RevenueReportDto {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  currency: string;
  transactionCount: number;
  items: RevenueItemDto[];
}

export interface RevenueItemDto {
  paymentId: string;
  bookingId: string;
  amount: number;
  status: string;
  processedAt: string;
}
