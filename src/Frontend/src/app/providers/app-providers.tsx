import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/auth';
import { TelemetryProvider } from '@/shared/telemetry';
import { SignalRProvider } from '@/shared/realtime';
import { FeatureFlagProvider } from '@/shared/feature-flags';
import { ToastProvider, ToastViewport } from '@/shared/ui';
import { queryClient } from './query-client';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Composes all application-level providers in the correct dependency order.
 *
 * Ordering rationale:
 *   AuthProvider        — outermost; no dependencies on other providers
 *   TelemetryProvider   — uses useAuth() to tag traces with the authenticated user
 *   QueryClientProvider — React Query cache; auth-agnostic but placed after auth
 *   SignalRProvider     — uses useAuth() for the access-token factory
 *   FeatureFlagProvider — standalone; periodically refreshes flags
 *   ToastProvider       — Radix Toast; renders viewport at the end
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <QueryClientProvider client={queryClient}>
          <SignalRProvider>
            <FeatureFlagProvider>
              <ToastProvider>
                {children}
                <ToastViewport />
              </ToastProvider>
            </FeatureFlagProvider>
          </SignalRProvider>
        </QueryClientProvider>
      </TelemetryProvider>
    </AuthProvider>
  );
}
