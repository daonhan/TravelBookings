import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/shared/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text displayed below the input when there is no error */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
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
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </LabelPrimitive.Root>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
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

Input.displayName = 'Input';

export { Input };
