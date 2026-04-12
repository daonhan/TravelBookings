import { z } from 'zod';

export const refundPaymentSchema = z.object({
  refundAmount: z.number().positive('Refund amount must be positive'),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
