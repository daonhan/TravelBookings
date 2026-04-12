import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { ApiException } from '@/shared/api/api-exception';
import { cn } from '@/shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback to render instead of the default error UI. */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * React error boundary that catches render-time exceptions and displays
 * a recoverable fallback UI.  When the caught error is an `ApiException`
 * the trace ID is surfaced to help with diagnostics.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /* ----- lifecycle ----- */

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console (placeholder for telemetry integration)
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  /* ----- helpers ----- */

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReport = (): void => {
    const { error } = this.state;
    // Placeholder: forward to telemetry / error-tracking service
    console.info('[ErrorBoundary] Error reported by user:', error);
  };

  /* ----- render ----- */

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    /* Custom fallback ------------------------------------------------ */
    if (fallback !== undefined) {
      if (typeof fallback === 'function') {
        return fallback(error, this.handleReset);
      }
      return fallback;
    }

    /* Default fallback ----------------------------------------------- */
    const traceId =
      error instanceof ApiException ? error.traceId : undefined;

    return (
      <div
        role="alert"
        className={cn(
          'mx-auto flex max-w-lg flex-col items-center gap-6 rounded-xl',
          'border border-red-200 bg-red-50 p-8 text-center shadow-sm',
          'dark:border-red-800 dark:bg-red-950',
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full',
            'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
          )}
          aria-hidden="true"
        >
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-sm text-red-700 dark:text-red-300">
          {error.message || 'An unexpected error occurred.'}
        </p>

        {/* Trace ID (only when the error is an ApiException) */}
        {traceId && (
          <p className="rounded bg-red-100 px-3 py-1.5 font-mono text-xs text-red-600 dark:bg-red-900 dark:text-red-400">
            Trace ID: {traceId}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={this.handleReload}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              'bg-red-600 text-white hover:bg-red-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'dark:bg-red-700 dark:hover:bg-red-600',
            )}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reload
          </button>

          <button
            type="button"
            onClick={this.handleReport}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              'border border-red-300 bg-white text-red-700 hover:bg-red-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              'dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900',
            )}
          >
            <Bug className="h-4 w-4" aria-hidden="true" />
            Report Error
          </button>
        </div>
      </div>
    );
  }
}
