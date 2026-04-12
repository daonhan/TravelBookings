import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ConfirmDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean;
  /** Callback to control the open state. */
  onOpenChange: (open: boolean) => void;
  /** Dialog title displayed in the header. */
  title: string;
  /** Descriptive text explaining what the user is confirming. */
  description: string;
  /** Label for the confirm button. @default "Confirm" */
  confirmLabel?: string;
  /** Label for the cancel button. @default "Cancel" */
  cancelLabel?: string;
  /** Callback fired when the user confirms the action. */
  onConfirm: () => void;
  /** Visual variant. Destructive applies red styling to the confirm button. @default "default" */
  variant?: 'default' | 'destructive';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Modal confirmation dialog built on top of Radix UI Dialog.
 * Supports a `destructive` variant that styles the confirm button in red
 * to signal irreversible or dangerous actions.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          )}
        />

        {/* Content */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-gray-200 bg-white p-6 shadow-lg',
            'focus-visible:outline-none',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'dark:border-gray-800 dark:bg-gray-950',
          )}
        >
          {/* Close (X) button */}
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              'absolute right-4 top-4 rounded-sm p-1',
              'text-gray-500 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
              'dark:text-gray-400 dark:hover:text-gray-100',
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogPrimitive.Close>

          {/* Header */}
          <DialogPrimitive.Title className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {title}
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </DialogPrimitive.Description>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            {/* Cancel */}
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
                  'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
                  'dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900',
                )}
              >
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>

            {/* Confirm */}
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={cn(
                'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isDestructive
                  ? cn(
                      'bg-red-600 text-white hover:bg-red-700',
                      'focus-visible:ring-red-500',
                      'dark:bg-red-700 dark:hover:bg-red-600',
                    )
                  : cn(
                      'bg-blue-600 text-white hover:bg-blue-700',
                      'focus-visible:ring-blue-500',
                      'dark:bg-blue-700 dark:hover:bg-blue-600',
                    ),
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
