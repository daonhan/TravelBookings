import { useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { FEATURE_FLAGS } from './flags';
import {
  FeatureFlagContext,
  type FeatureFlagContextValue,
} from './feature-flag-context';

const REFRESH_INTERVAL_MS = 30_000;

function getAllFlagsEnabled(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const value of Object.values(FEATURE_FLAGS)) {
    flags[value] = true;
  }
  return flags;
}

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFlags = useCallback(async () => {
    if (import.meta.env.DEV) {
      setFlags(getAllFlagsEnabled());
      setIsLoading(false);
      return;
    }

    // Production: fetch from Azure App Configuration
    try {
      const endpoint = import.meta.env.VITE_APP_CONFIG_ENDPOINT;
      if (!endpoint) {
        console.warn(
          'VITE_APP_CONFIG_ENDPOINT not configured; all feature flags disabled.',
        );
        setFlags({});
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${endpoint}/api/feature-flags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch feature flags: ${response.statusText}`);
      }

      const data: Record<string, boolean> = await response.json();
      setFlags(data);
    } catch (error) {
      console.warn('Failed to fetch feature flags:', error);
      // On error, keep existing flags (fail-closed for new consumers)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFlags();

    // Refresh flags periodically
    intervalRef.current = setInterval(() => {
      void fetchFlags();
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchFlags]);

  const value = useMemo<FeatureFlagContextValue>(
    () => ({ flags, isLoading }),
    [flags, isLoading],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
