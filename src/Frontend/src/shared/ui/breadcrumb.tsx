import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Breadcrumb                                                                */
/*  Semantic breadcrumb navigation with aria-label & aria-current="page".     */
/* -------------------------------------------------------------------------- */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)} {...props}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-gray-900' : 'text-gray-500',
                  )}
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className={cn(
                    'text-gray-500 transition-colors hover:text-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm',
                  )}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------- Exports --------------------------------- */

export { Breadcrumb, type BreadcrumbItem, type BreadcrumbProps };
