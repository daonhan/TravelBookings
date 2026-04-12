import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDateTime } from '@/shared/utils/date';
import type { TransactionDto } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  PaymentTimeline                                                            */
/*  Visual vertical timeline of payment transactions (charges & refunds).      */
/* -------------------------------------------------------------------------- */

interface PaymentTimelineProps {
  transactions: TransactionDto[];
}

/**
 * Renders a vertical timeline of payment transactions, most recent first.
 * Each node shows an icon (green ArrowUp for CHARGE, red ArrowDown for REFUND),
 * the formatted amount, gateway reference, and timestamp.
 */
export function PaymentTimeline({ transactions }: PaymentTimelineProps) {
  // Sort by createdAt descending so the most recent transaction is at the top
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-gray-500">No transactions recorded.</p>
    );
  }

  return (
    <div className="relative" role="list" aria-label="Payment transactions timeline">
      {sorted.map((txn, index) => {
        const isCharge = txn.type === 'CHARGE';
        const isLast = index === sorted.length - 1;

        return (
          <div
            key={txn.id}
            className="relative flex gap-4 pb-6 last:pb-0"
            role="listitem"
          >
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className="absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            )}

            {/* Icon node */}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                isCharge
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600',
              )}
            >
              {isCharge ? (
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isCharge ? 'text-green-700' : 'text-red-700',
                  )}
                >
                  {isCharge ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
                <span className="text-xs font-medium uppercase text-gray-500">
                  {txn.type}
                </span>
              </div>

              {txn.gatewayReference && (
                <p className="mt-0.5 text-xs text-gray-500 truncate">
                  Ref: {txn.gatewayReference}
                </p>
              )}

              <p className="mt-0.5 text-xs text-gray-400">
                {formatDateTime(txn.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
