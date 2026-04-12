import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceDegradedBannerProps {
  /** Name of the service that is experiencing issues. */
  serviceName: string;
  /** Optional additional context about the degradation. */
  message?: string;
  /** Callback fired when the user dismisses the banner. */
  onDismiss?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Amber/yellow alert banner shown when a downstream service is degraded.
 * Fully accessible (`role="alert"`) and dismissible via the close button.
 */
export function ServiceDegradedBanner({
  serviceName,
  message,
  onDismiss,
}: ServiceDegradedBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex w-full items-center gap-3 border-b px-4 py-3',
        'border-amber-300 bg-amber-50 text-amber-900',
        'dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
      )}
    >
      {/* Warning icon */}
      <AlertTriangle
        className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />

      {/* Message body */}
      <p className="flex-1 text-sm font-medium">
        <span className="font-semibold">{serviceName}</span> is currently
        experiencing issues.
        {message && (
          <span className="ml-1 font-normal text-amber-700 dark:text-amber-300">
            {message}
          </span>
        )}
      </p>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${serviceName} service degradation notice`}
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-md p-1',
            'text-amber-600 hover:bg-amber-100 hover:text-amber-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
            'dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-200',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
