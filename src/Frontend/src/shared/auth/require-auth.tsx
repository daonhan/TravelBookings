import { type ReactNode } from 'react';
import { useAuth } from './use-auth';

interface RequireAuthProps {
  children: ReactNode;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">Authenticating...</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Trigger login flow; the component will re-render once authenticated
    void login();
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
