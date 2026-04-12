import { Badge } from '@/shared/ui/badge';
import type { BookingStatus } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  BookingStatusBadge                                                        */
/*  Maps each saga state to the correct Badge colour.                         */
/* -------------------------------------------------------------------------- */

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

type BadgeColor = 'default' | 'info' | 'warning' | 'success' | 'error';

const STATUS_COLOR_MAP: Record<BookingStatus, BadgeColor> = {
  Draft: 'default',
  Requested: 'info',
  InventoryReserved: 'info',
  PaymentProcessing: 'warning',
  Confirmed: 'success',
  Cancelled: 'default',
  Failed: 'error',
  Compensating: 'warning',
};

const STATUS_LABEL_MAP: Record<BookingStatus, string> = {
  Draft: 'Draft',
  Requested: 'Requested',
  InventoryReserved: 'Inventory Reserved',
  PaymentProcessing: 'Payment Processing',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  Failed: 'Failed',
  Compensating: 'Compensating',
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <Badge color={STATUS_COLOR_MAP[status]} srText={`Status: ${STATUS_LABEL_MAP[status]}`}>
      {STATUS_LABEL_MAP[status]}
    </Badge>
  );
}
