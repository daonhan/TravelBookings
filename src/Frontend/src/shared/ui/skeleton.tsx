import * as React from 'react';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/*  Animated loading placeholders in several shape variants.                  */
/* -------------------------------------------------------------------------- */

type SkeletonVariant = 'text' | 'heading' | 'circle' | 'rectangle';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant. Defaults to `"text"`. */
  variant?: SkeletonVariant;
  /** Override width (CSS value). */
  width?: string | number;
  /** Override height (CSS value). */
  height?: string | number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  heading: 'h-8 w-3/4 rounded',
  circle: 'h-10 w-10 rounded-full',
  rectangle: 'h-24 w-full rounded-lg',
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, className, style, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse bg-gray-200',
        variantClasses[variant],
        className,
      )}
      style={{
        ...(width != null ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
        ...(height != null ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
        ...style,
      }}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';

/* -------------------------------------------------------------------------- */
/*  SkeletonTable                                                             */
/*  Renders multiple rows of skeleton lines mimicking a table.                */
/* -------------------------------------------------------------------------- */

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows to render. Defaults to 5. */
  rows?: number;
  /** Number of columns per row. Defaults to 4. */
  columns?: number;
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div role="status" aria-label="Loading table" className={cn('w-full', className)} {...props}>
      {/* Header row */}
      <div className="flex gap-4 border-b border-gray-200 pb-3 mb-3">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton
            key={`header-${colIdx}`}
            variant="text"
            className="h-4"
            style={{ flex: 1 }}
          />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              variant="text"
              className="h-4"
              style={{ flex: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- Exports --------------------------------- */

export {
  Skeleton,
  SkeletonTable,
  type SkeletonProps,
  type SkeletonVariant,
  type SkeletonTableProps,
};
