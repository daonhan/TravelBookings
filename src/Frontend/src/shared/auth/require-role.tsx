import { type ReactNode } from 'react';
import type { UserRole } from '@/shared/types';
import { useAuth } from './use-auth';

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

function AccessDenied() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          403 Access Denied
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          You do not have the required permissions to view this page.
        </p>
      </div>
    </div>
  );
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { hasRole } = useAuth();

  const hasRequiredRole = roles.some((role) => hasRole(role));

  if (!hasRequiredRole) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
