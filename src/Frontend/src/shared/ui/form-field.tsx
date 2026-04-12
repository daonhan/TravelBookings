import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
} from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Internal context – wires aria attributes between siblings          */
/* ------------------------------------------------------------------ */

interface FormFieldContextValue {
  id: string;
  name: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormFieldContext() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error(
      'useFormFieldContext must be used within a <FormField /> component.',
    );
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  FormField                                                          */
/* ------------------------------------------------------------------ */

/**
 * Wrapper around React Hook Form's `Controller` that provides a shared
 * context for `FormLabel`, `FormControl`, and `FormMessage`.
 */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  const id = useId();

  return (
    <FormFieldContext.Provider value={{ id, name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook – derive IDs & error state from RHF context                   */
/* ------------------------------------------------------------------ */

function useFormField() {
  const { id, name } = useFormFieldContext();
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(name, formState);

  const controlId = `${id}-control`;
  const messageId = `${id}-message`;

  return {
    id: controlId,
    name,
    messageId,
    error: fieldState.error,
    invalid: fieldState.invalid,
  };
}

/* ------------------------------------------------------------------ */
/*  FormLabel                                                          */
/* ------------------------------------------------------------------ */

const FormLabel = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { id, invalid } = useFormField();

  return (
    <LabelPrimitive.Root
      ref={ref}
      htmlFor={id}
      className={cn(
        'text-sm font-medium leading-none',
        invalid
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-700 dark:text-gray-300',
        className,
      )}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

/* ------------------------------------------------------------------ */
/*  FormControl                                                        */
/* ------------------------------------------------------------------ */

interface FormControlProps {
  children: ReactNode;
  className?: string;
}

/**
 * Renders a wrapper `<div>` around the control element and applies the
 * correct `id`, `aria-invalid`, and `aria-describedby` attributes via
 * context values.  Children should be a single form input/select/etc.
 */
const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, children, ...props }, ref) => {
    const { id, messageId, invalid } = useFormField();

    return (
      <div
        ref={ref}
        className={cn('mt-1.5', className)}
        {...props}
      >
        {/* Clone aria attrs onto the child control */}
        <div
          id={id}
          role="group"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? messageId : undefined}
        >
          {children}
        </div>
      </div>
    );
  },
);
FormControl.displayName = 'FormControl';

/* ------------------------------------------------------------------ */
/*  FormMessage                                                        */
/* ------------------------------------------------------------------ */

interface FormMessageProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Renders the first validation error for the field. Falls back to
 * `children` if no error is present (useful for helper text).
 */
const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const { messageId, error } = useFormField();
    const body = error?.message ?? children;

    if (!body) return null;

    return (
      <p
        ref={ref}
        id={messageId}
        role={error ? 'alert' : undefined}
        className={cn(
          'mt-1.5 text-xs',
          error
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400',
          className,
        )}
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = 'FormMessage';

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { FormField, FormLabel, FormControl, FormMessage, useFormField };
