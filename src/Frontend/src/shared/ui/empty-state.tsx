import * as React from 'react';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Empty State                                                               */
/*  Centered placeholder for lists/tables with zero results.                  */
/* -------------------------------------------------------------------------- */

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Decorative icon rendered above the title. */
  icon?: React.ReactNode;
  /** Primary message. */
  title: string;
  /** Secondary explanatory text. */
  description?: string;
  /** Optional call-to-action button. */
  action?: EmptyStateAction;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-gray-400" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm',
            'transition-colors hover:bg-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* -------------------------------- Exports --------------------------------- */

export { EmptyState, type EmptyStateProps, type EmptyStateAction };
