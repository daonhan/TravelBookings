import { Bell, Calendar, CreditCard, Info } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatRelative } from '@/shared/utils';
import type { NotificationDto } from '@/shared/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function iconForType(type: string) {
  switch (type) {
    case 'BookingConfirmation':
    case 'BookingCancellation':
      return <Bell className="h-5 w-5 text-blue-500" aria-hidden="true" />;
    case 'EventCreated':
    case 'EventUpdated':
    case 'AttendeeRegistered':
      return <Calendar className="h-5 w-5 text-purple-500" aria-hidden="true" />;
    case 'PaymentReceipt':
    case 'PaymentFailed':
      return <CreditCard className="h-5 w-5 text-green-500" aria-hidden="true" />;
    default:
      return <Info className="h-5 w-5 text-gray-400" aria-hidden="true" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface NotificationItemProps {
  notification: NotificationDto;
  onClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Renders a single notification as a compact, clickable card.
 * An unread indicator (blue dot) is shown when the status has not yet
 * reached "Delivered".
 */
export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const isUnread = notification.status !== 'Delivered';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors',
        'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        isUnread && 'border-l-4 border-l-blue-500',
      )}
      aria-label={`${isUnread ? 'Unread: ' : ''}${notification.subject}`}
    >
      {/* Icon */}
      <span className="mt-0.5 shrink-0">{iconForType(notification.type)}</span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm',
            isUnread ? 'font-semibold text-gray-900' : 'text-gray-700',
          )}
        >
          {notification.subject}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {formatRelative(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"
          aria-label="Unread"
        />
      )}
    </button>
  );
}
