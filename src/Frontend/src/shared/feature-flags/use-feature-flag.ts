import { useContext } from 'react';
import { FeatureFlagContext } from './feature-flag-context';

export function useFeatureFlag(flagName: string): boolean {
  const { flags, isLoading } = useContext(FeatureFlagContext);

  // Fail-closed: return false if loading or flag is unknown
  if (isLoading) {
    return false;
  }

  return flags[flagName] ?? false;
}
