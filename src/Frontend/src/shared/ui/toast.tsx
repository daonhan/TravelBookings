import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Toast System                                                              */
/*  Wraps @radix-ui/react-toast with variant styling and a useToast() hook.   */
/* -------------------------------------------------------------------------- */

/* -------------------------------- Provider -------------------------------- */

const ToastProvider = ToastPrimitive.Provider;

/* -------------------------------- Viewport -------------------------------- */

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

/* ----------------------------- Toast variants ----------------------------- */

const toastVariants = cva(
  [
    'group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:fade-in-0',
    'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-80',
    'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
  ],
  {
    variants: {
      variant: {
        success: 'border-green-200 bg-green-50 text-green-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

/* --------------------------------- Toast ---------------------------------- */

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = 'Toast';

/* ------------------------------- ToastAction ------------------------------ */

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-current/20 bg-transparent px-3 text-sm font-medium',
      'transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

/* ------------------------------- ToastClose ------------------------------- */

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity',
      'hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
      'group-hover:opacity-100',
      className,
    )}
    toast-close=""
    aria-label="Close"
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';

/* ------------------------------- ToastTitle ------------------------------- */

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

/* ----------------------------- ToastDescription --------------------------- */

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

/* -------------------------------------------------------------------------- */
/*  useToast() hook                                                           */
/* -------------------------------------------------------------------------- */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
}

interface AddToastOptions {
  variant?: ToastVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Auto-dismiss delay in milliseconds. Defaults to 5000. */
  duration?: number;
}

let toastCount = 0;

function genId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString(36);
}

function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((options: AddToastOptions) => {
    const id = genId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        variant: options.variant ?? 'info',
        title: options.title,
        description: options.description,
        action: options.action,
        duration: options.duration ?? 5000,
      },
    ]);
    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast } as const;
}

/* -------------------------------- Exports --------------------------------- */

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  useToast,
  type ToastData,
  type AddToastOptions,
  type ToastVariant,
};
