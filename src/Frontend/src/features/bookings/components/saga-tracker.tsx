import { useTranslation } from 'react-i18next';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatDateTime } from '@/shared/utils/date';
import type { BookingStatus } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  SagaTracker                                                               */
/*  Visual horizontal step tracker for the booking saga state machine.        */
/* -------------------------------------------------------------------------- */

interface SagaTrackerProps {
  status: BookingStatus;
  createdAt?: string;
  confirmedAt?: string | null;
}

/**
 * Ordered saga steps and the statuses that mark each step complete or active.
 */
const STEPS = [
  { label: 'Requested', completedWhen: ['InventoryReserved', 'PaymentProcessing', 'Confirmed'] },
  { label: 'Inventory Reserved', completedWhen: ['PaymentProcessing', 'Confirmed'] },
  { label: 'Payment Processing', completedWhen: ['Confirmed'] },
  { label: 'Confirmed', completedWhen: [] as string[] },
] as const;

/** Map status to the 0-based step index that is "current". */
function currentStepIndex(status: BookingStatus): number {
  switch (status) {
    case 'Draft':
    case 'Requested':
      return 0;
    case 'InventoryReserved':
      return 1;
    case 'PaymentProcessing':
      return 2;
    case 'Confirmed':
      return 3;
    default:
      // Failed / Cancelled / Compensating — stay at whatever step we were on.
      return -1;
  }
}

function isErrorState(status: BookingStatus): boolean {
  return status === 'Failed' || status === 'Cancelled' || status === 'Compensating';
}

export function SagaTracker({ status, createdAt, confirmedAt }: SagaTrackerProps) {
  const { t } = useTranslation('bookings');
  const activeIdx = currentStepIndex(status);
  const hasError = isErrorState(status);

  // Determine the step that was active when the error happened.
  // If we have no clear "active" step (activeIdx === -1), try to infer from status.
  const errorStepIdx = hasError ? Math.max(activeIdx, 0) : -1;

  const stepCount = STEPS.length;
  const completedCount = activeIdx >= 0 ? activeIdx : 0;

  /** Timestamp for a step (only first and last have known timestamps). */
  function stepTimestamp(idx: number): string | null {
    if (idx === 0 && createdAt) return formatDateTime(createdAt);
    if (idx === stepCount - 1 && status === 'Confirmed' && confirmedAt) {
      return formatDateTime(confirmedAt);
    }
    return null;
  }

  return (
    <div
      role="group"
      aria-label={t('sagaTracker.ariaLabel', {
        defaultValue: `Booking status: ${status}. Step ${completedCount + 1} of ${stepCount}.`,
        status,
        step: completedCount + 1,
        total: stepCount,
      })}
      className="w-full"
    >
      {/* Step row */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted =
            !hasError && activeIdx > idx;
          const isCurrent =
            (!hasError && activeIdx === idx) || (hasError && errorStepIdx === idx);
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Connector line (before circle, except first step) */}
              {idx > 0 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 transition-colors',
                    isCompleted || isCurrent
                      ? hasError && isCurrent
                        ? 'bg-red-400'
                        : 'bg-green-500'
                      : 'bg-gray-200',
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step circle + label column */}
              <div className="flex flex-col items-center gap-1.5">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    // Completed
                    isCompleted &&
                      'border-green-500 bg-green-500 text-white',
                    // Current (normal)
                    isCurrent &&
                      !hasError &&
                      'animate-pulse border-blue-500 bg-blue-50 text-blue-600',
                    // Current (error)
                    isCurrent &&
                      hasError &&
                      'border-red-500 bg-red-50 text-red-600',
                    // Future
                    isFuture && 'border-gray-300 bg-white text-gray-400',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : isCurrent && hasError ? (
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{idx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium text-center whitespace-nowrap',
                    isCompleted && 'text-green-700',
                    isCurrent && !hasError && 'text-blue-700',
                    isCurrent && hasError && 'text-red-700',
                    isFuture && 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>

                {/* Timestamp under completed / confirmed step */}
                {(() => {
                  const ts = stepTimestamp(idx);
                  return ts ? (
                    <span className="text-[10px] text-gray-400">{ts}</span>
                  ) : null;
                })()}
              </div>

              {/* Connector line (after circle, except last step) */}
              {idx < stepCount - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 transition-colors',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error state banner */}
      {hasError && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {status === 'Compensating'
              ? t('sagaTracker.compensating', {
                  defaultValue:
                    'Compensation in progress. Previous steps are being rolled back.',
                })
              : status === 'Cancelled'
                ? t('sagaTracker.cancelled', {
                    defaultValue: 'This booking has been cancelled.',
                  })
                : t('sagaTracker.failed', {
                    defaultValue:
                      'The booking process encountered an error. Our team has been notified.',
                  })}
          </span>
        </div>
      )}
    </div>
  );
}
