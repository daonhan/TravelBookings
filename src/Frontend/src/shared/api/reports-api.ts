import type {
  DashboardDto,
  BookingSummaryDto,
  RevenueReportDto,
  PagedResult,
} from '@/shared/types';
import { httpClient } from './http-client';

const BASE = '/api/reports';

/**
 * Retrieves the main dashboard summary.
 * GET /api/reports/dashboard
 */
export async function getDashboard(): Promise<DashboardDto> {
  return httpClient.get<DashboardDto>(`${BASE}/dashboard`);
}

/**
 * Retrieves paginated booking reports.
 * GET /api/reports/bookings
 */
export async function getBookingReports(
  params?: { page?: number; pageSize?: number },
): Promise<PagedResult<BookingSummaryDto>> {
  return httpClient.get<PagedResult<BookingSummaryDto>>(
    `${BASE}/bookings`,
    params as Record<string, unknown> | undefined,
  );
}

/**
 * Retrieves a revenue report for a given date range.
 * GET /api/reports/revenue
 */
export async function getRevenueReport(
  params?: { from?: string; to?: string },
): Promise<RevenueReportDto> {
  return httpClient.get<RevenueReportDto>(
    `${BASE}/revenue`,
    params as Record<string, unknown> | undefined,
  );
}
