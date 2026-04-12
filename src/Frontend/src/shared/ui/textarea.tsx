import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/shared/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label text */
  label?: string;
  /** Error message to display below the textarea */
  error?: string;
  /** Helper text displayed below the textarea when there is no error */
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const hasError = Boolean(error);

    const describedBy = [
      hasError ? errorId : undefined,
      helperText && !hasError ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <LabelPrimitive.Root
            htmlFor={textareaId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </LabelPrimitive.Root>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300',
            className,
          )}
          {...props}
        />
        {hasError && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
