import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  CapacityGauge                                                              */
/*  Visual capacity indicator with a progress bar and color coding.            */
/* -------------------------------------------------------------------------- */

interface CapacityGaugeProps {
  /** Total capacity of the event. */
  capacity: number;
  /** Number of slots already taken. */
  used: number;
}

/**
 * Renders a horizontal progress bar that fills according to the used / total
 * ratio. Colors shift from green (< 80%) to yellow (80-95%) to red (> 95%)
 * to communicate urgency.
 */
export function CapacityGauge({ capacity, used }: CapacityGaugeProps) {
  const safeCapacity = Math.max(capacity, 1);
  const safeUsed = Math.min(Math.max(used, 0), safeCapacity);
  const available = safeCapacity - safeUsed;
  const percentage = (safeUsed / safeCapacity) * 100;

  let barColor: string;
  let textColor: string;

  if (percentage > 95) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else {
    barColor = 'bg-green-500';
    textColor = 'text-green-700';
  }

  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={safeUsed}
        aria-valuemin={0}
        aria-valuemax={safeCapacity}
        aria-label={`${available} of ${safeCapacity} available`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Text label */}
      <p className={cn('text-xs font-medium', textColor)}>
        {available} / {safeCapacity} available
      </p>
    </div>
  );
}
