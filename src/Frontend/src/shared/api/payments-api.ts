import type {
  PaymentDto,
  RefundPaymentRequest,
  PagedResult,
} from '@/shared/types';
import { httpClient } from './http-client';

const BASE = '/api/payments';

/**
 * Retrieves a single payment by its ID.
 * GET /api/payments/{id}
 */
export async function getPayment(id: string): Promise<PaymentDto> {
  return httpClient.get<PaymentDto>(`${BASE}/${id}`);
}

/**
 * Retrieves paginated payments for a specific user.
 * GET /api/payments/user/{userId}
 */
export async function getPaymentsByUser(
  userId: string,
  params?: { page?: number; pageSize?: number },
): Promise<PagedResult<PaymentDto>> {
  return httpClient.get<PagedResult<PaymentDto>>(
    `${BASE}/user/${userId}`,
    params as Record<string, unknown> | undefined,
  );
}

/**
 * Initiates a refund for a payment.
 * POST /api/payments/{id}/refund
 */
export async function refundPayment(
  id: string,
  data: RefundPaymentRequest,
): Promise<PaymentDto> {
  return httpClient.post<PaymentDto>(`${BASE}/${id}/refund`, data);
}
