export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'PartiallyRefunded';

export type PaymentMethod = 'CreditCard' | 'DebitCard' | 'BankTransfer' | 'PayPal';

export interface PaymentDto {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  gatewayTransactionId: string;
  createdAt: string;
  processedAt: string | null;
  transactions: TransactionDto[];
}

export interface TransactionDto {
  id: string;
  type: string;
  amount: number;
  gatewayReference: string;
  createdAt: string;
}

export interface RefundPaymentRequest {
  refundAmount: number;
}
