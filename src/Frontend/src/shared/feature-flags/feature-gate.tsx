import { type ReactNode } from 'react';
import { useFeatureFlag } from './use-feature-flag';

interface FeatureGateProps {
  flag: string;
  fallback?: ReactNode;
  children: ReactNode;
}

const DEFAULT_FALLBACK = (
  <div className="flex min-h-[200px] items-center justify-center">
    <p className="text-sm text-gray-500">Feature not available</p>
  </div>
);

export function FeatureGate({
  flag,
  fallback = DEFAULT_FALLBACK,
  children,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
