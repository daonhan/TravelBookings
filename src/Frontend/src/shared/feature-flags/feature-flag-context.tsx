import { createContext } from 'react';

export interface FeatureFlagContextValue {
  flags: Record<string, boolean>;
  isLoading: boolean;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  isLoading: true,
});
