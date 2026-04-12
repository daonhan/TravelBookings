import { Badge } from '@/shared/ui';
import type { PaymentStatus } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  PaymentStatusBadge                                                         */
/*  Renders a Badge with a color mapped to the payment status.                 */
/* -------------------------------------------------------------------------- */

const STATUS_COLOR_MAP: Record<
  PaymentStatus,
  'warning' | 'info' | 'success' | 'error' | 'purple'
> = {
  Pending: 'warning',
  Processing: 'info',
  Completed: 'success',
  Failed: 'error',
  Refunded: 'purple',
  PartiallyRefunded: 'purple',
};

const STATUS_LABEL_MAP: Record<PaymentStatus, string> = {
  Pending: 'Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Failed: 'Failed',
  Refunded: 'Refunded',
  PartiallyRefunded: 'Partially Refunded',
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge
      color={STATUS_COLOR_MAP[status]}
      size="sm"
      srText={`Payment status: ${STATUS_LABEL_MAP[status]}`}
    >
      {STATUS_LABEL_MAP[status]}
    </Badge>
  );
}
