import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Avatar                                                                    */
/*  Wraps @radix-ui/react-avatar with image + initials fallback and sizes.    */
/* -------------------------------------------------------------------------- */

const avatarSizeVariants = cva(
  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

/* ------------------------------ Helpers ----------------------------------- */

/**
 * Derives initials from a full name string.
 * "John Doe" -> "JD", "Alice" -> "A", "" -> "?"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return `${(parts[0]?.[0] ?? '').toUpperCase()}${(parts[parts.length - 1]?.[0] ?? '').toUpperCase()}`;
}

/* ------------------------------ Props ------------------------------------- */

interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'children'>,
    VariantProps<typeof avatarSizeVariants> {
  /** URL of the avatar image. */
  src?: string;
  /** Full name used for alt text and initials fallback. */
  name: string;
}

/* ------------------------------- Component -------------------------------- */

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, src, name, ...props }, ref) => {
  const initials = getInitials(name);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarSizeVariants({ size }), className)}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={name}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center bg-gray-200 font-medium text-gray-600"
        delayMs={src ? 600 : 0}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = 'Avatar';

/* -------------------------------- Exports --------------------------------- */

export { Avatar, getInitials, type AvatarProps };
