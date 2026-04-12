import { Bell, Calendar, CreditCard, AlertTriangle, Info } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function iconForEventType(eventType: string) {
  switch (eventType) {
    case 'BookingConfirmed':
    case 'BookingCancelled':
      return <Bell className="h-4 w-4 text-blue-500" aria-hidden="true" />;
    case 'EventCreated':
    case 'AttendeeRegistered':
      return <Calendar className="h-4 w-4 text-purple-500" aria-hidden="true" />;
    case 'PaymentProcessed':
      return <CreditCard className="h-4 w-4 text-green-500" aria-hidden="true" />;
    case 'PaymentFailed':
      return <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />;
    default:
      return <Info className="h-4 w-4 text-gray-400" aria-hidden="true" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface NotificationToastProps {
  /** The SignalR event type (e.g. "BookingConfirmed"). */
  eventType: string;
  /** A short, human-readable description of what happened. */
  message: string;
  /** Optional deep-link the user can click to see more details. */
  href?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Lightweight toast body used when a real-time notification arrives.
 * Designed to be passed into a toast provider's custom content slot.
 */
export function NotificationToast({
  eventType,
  message,
  href,
}: NotificationToastProps) {
  const content = (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0">{iconForEventType(eventType)}</span>
      <p className="min-w-0 flex-1 text-sm text-gray-800">{message}</p>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-md transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        {content}
      </a>
    );
  }

  return content;
}
