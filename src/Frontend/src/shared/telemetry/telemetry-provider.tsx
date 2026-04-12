import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/shared/auth';

import {
  initAppInsights,
  setAuthenticatedUser,
  trackException,
} from './app-insights';

interface TelemetryProviderProps {
  children: ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
  // Initialize Application Insights on mount
  useEffect(() => {
    const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

    if (connectionString) {
      initAppInsights(connectionString);
    }
  }, []);

  // Set up global error handlers
  useEffect(() => {
    function handleError(event: ErrorEvent): void {
      trackException(
        event.error instanceof Error
          ? event.error
          : new Error(event.message || 'Unknown error'),
        { source: 'window.onerror' },
      );
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent): void {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      trackException(error, { source: 'unhandledrejection' });
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
    };
  }, []);

  // Track authenticated user
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setAuthenticatedUser(user.id);
    }
  }, [user?.id]);

  return <>{children}</>;
}
