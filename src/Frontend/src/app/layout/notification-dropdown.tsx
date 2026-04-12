import { useCallback, useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Bell,
  Plane,
  Calendar,
  CreditCard,
  CheckCheck,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/shared/auth';
import { useNotificationStore } from '@/shared/stores';
import { getUserNotifications } from '@/shared/api/notifications-api';
import { formatRelative } from '@/shared/utils/date';
import type { NotificationDto } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getNotificationIcon(type: string) {
  switch (type) {
    case 'BookingConfirmation':
    case 'BookingCancellation':
      return <Plane className="h-4 w-4 text-blue-500" />;
    case 'EventCreated':
    case 'EventUpdated':
    case 'AttendeeRegistered':
      return <Calendar className="h-4 w-4 text-green-500" />;
    case 'PaymentReceipt':
    case 'PaymentFailed':
      return <CreditCard className="h-4 w-4 text-amber-500" />;
    default:
      return <Mail className="h-4 w-4 text-gray-500" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function NotificationDropdown() {
  const { user } = useAuth();
  const { unreadCount, resetUnread } = useNotificationStore();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /* ---- Fetch latest notifications when popover opens ---- */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await getUserNotifications(user.id, { page: 1, pageSize: 5 });
      setNotifications(result.items);
    } catch {
      // Silently handle fetch errors
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  /* ---- Mark all as read ---- */
  const handleMarkAllRead = useCallback(() => {
    resetUnread();
  }, [resetUnread]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="relative rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white',
                unreadCount > 9 ? 'h-5 w-5' : 'h-4 w-4',
              )}
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                Loading...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}

            {!isLoading &&
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {notification.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                  {notification.status === 'Failed' && (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2">
            <Popover.Close asChild>
              <Link
                to="/notifications"
                className="block text-center text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                View all notifications
              </Link>
            </Popover.Close>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
