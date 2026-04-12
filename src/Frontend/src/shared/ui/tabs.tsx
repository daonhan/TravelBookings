import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Tabs                                                                      */
/*  Wraps @radix-ui/react-tabs with underline-style active indicator.         */
/* -------------------------------------------------------------------------- */

const Tabs = TabsPrimitive.Root;

/* ---------------------------------- List ---------------------------------- */

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center gap-4 border-b border-gray-200',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

/* -------------------------------- Trigger --------------------------------- */

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex h-10 items-center justify-center whitespace-nowrap px-1 pb-3 pt-2 text-sm font-medium text-gray-500',
      'transition-colors hover:text-gray-700',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      // Active underline via data-state
      'data-[state=active]:text-blue-600',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:scale-x-0 after:bg-blue-600 after:transition-transform',
      'data-[state=active]:after:scale-x-100',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

/* -------------------------------- Content --------------------------------- */

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-white',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

/* -------------------------------- Exports --------------------------------- */

export { Tabs, TabsList, TabsTrigger, TabsContent };
