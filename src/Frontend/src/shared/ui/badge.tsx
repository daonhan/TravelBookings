import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium',
  {
    variants: {
      color: {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  srText?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color, size, srText, children, ...props }, ref) => {
    const defaultSrText = color ?? 'default';

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ color, size, className }))}
        {...props}
      >
        <span className="sr-only">{srText ?? `Status: ${defaultSrText}`}</span>
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
