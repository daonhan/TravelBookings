import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BreadcrumbItem {
  label: string;
  /** When provided the breadcrumb renders as a link; otherwise plain text. */
  href?: string;
}

interface PageHeaderProps {
  /** Page title. */
  title: string;
  /** Optional subtitle / description shown below the title. */
  description?: string;
  /** Breadcrumb trail rendered above the title. */
  breadcrumbs?: BreadcrumbItem[];
  /** Action buttons / controls aligned to the right of the title row. */
  actions?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Consistent page header used across all pages.  Renders an optional
 * breadcrumb trail, page title, description, and right-aligned actions.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {/* Separator (skip for the first item) */}
                  {index > 0 && (
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-600"
                      aria-hidden="true"
                    />
                  )}

                  {crumb.href && !isLast ? (
                    <a
                      href={crumb.href}
                      className={cn(
                        'hover:text-gray-900 dark:hover:text-gray-100',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded',
                      )}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={cn(isLast && 'font-medium text-gray-900 dark:text-gray-100')}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
