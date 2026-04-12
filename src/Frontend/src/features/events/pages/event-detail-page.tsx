import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Calendar,
  Tag,
  Pencil,
  XCircle,
  UserPlus,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Skeleton,
  ConfirmDialog,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui';
import { useAuth } from '@/shared/auth';
import { useSignalREvent } from '@/shared/realtime/use-signalr-event';
import { eventKeys } from '@/shared/api';
import { formatDateRange } from '@/shared/utils/date';
import type { EventStatus } from '@/shared/types';
import { useEventDetail } from '../hooks/use-event-detail';
import { useCancelEvent } from '../hooks/use-cancel-event';
import { useRegisterAttendee } from '../hooks/use-register-attendee';
import { CapacityGauge } from '../components/capacity-gauge';
import { SessionList } from '../components/session-list';
import { RegistrationList } from '../components/registration-list';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_COLOR: Record<EventStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Draft: 'default',
  Published: 'info',
  InProgress: 'warning',
  Completed: 'success',
  Cancelled: 'error',
};

/* -------------------------------------------------------------------------- */
/*  Route type helper                                                          */
/*  TanStack Router file-based routes expose a `Route.useParams` pattern.      */
/*  We replicate the same shape here for compatibility.                        */
/* -------------------------------------------------------------------------- */

interface RouteParams {
  eventId: string;
}

/**
 * Use this with your TanStack Router file route:
 *   const { eventId } = Route.useParams();
 * Or pass the params from the parent route.
 */
export interface EventDetailPageProps {
  /** When using code-based routing, pass params directly. */
  params?: RouteParams;
}

/* -------------------------------------------------------------------------- */
/*  EventDetailPage                                                            */
/* -------------------------------------------------------------------------- */

export function EventDetailPage({ params }: EventDetailPageProps) {
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  // Support both direct params and route-based params
  // In file-based routing: const { eventId } = Route.useParams();
  const eventId = params?.eventId ?? '';

  const { data: event, isLoading, isError } = useEventDetail(eventId);

  const isOrganizer = hasRole('EventOrganizer') || hasRole('Admin');

  /* ----- SignalR live capacity updates ----- */
  useSignalREvent<{ eventId: string }>('EventCapacityUpdated', (payload) => {
    if (payload.eventId === eventId) {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    }
  });

  /* ----- Cancel dialog ----- */
  const [cancelOpen, setCancelOpen] = useState(false);
  const cancelMutation = useCancelEvent(eventId);

  const handleConfirmCancel = useCallback(() => {
    cancelMutation.mutate(undefined, {
      onSettled: () => setCancelOpen(false),
    });
  }, [cancelMutation]);

  /* ----- Registration ----- */
  const registerMutation = useRegisterAttendee(eventId);

  const isAlreadyRegistered = useMemo(() => {
    if (!event || !user) return false;
    return event.registrations.some((r) => r.userId === user.id);
  }, [event, user]);

  const handleRegister = useCallback(() => {
    if (!user) return;
    registerMutation.mutate({
      userId: user.id,
      attendeeName: user.displayName,
      registrationType: 'Standard',
    });
  }, [user, registerMutation]);

  /* ----- Loading skeleton ----- */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="heading" />
        <Skeleton variant="rectangle" height={200} />
        <Skeleton variant="rectangle" height={120} />
        <Skeleton variant="rectangle" height={200} />
        <Skeleton variant="rectangle" height={200} />
      </div>
    );
  }

  /* ----- Error / not found ----- */
  if (isError || !event) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          {t('detail.notFound', 'Event not found or an error occurred.')}
        </p>
      </div>
    );
  }

  const used = event.capacity - event.availableCapacity;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={event.title}
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.events', 'Events'), href: '/events' },
          { label: event.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Register button */}
            {!isAlreadyRegistered && event.status !== 'Cancelled' && event.status !== 'Completed' && (
              <Button
                variant="primary"
                onClick={handleRegister}
                loading={registerMutation.isPending}
              >
                <UserPlus className="h-4 w-4" />
                {t('detail.register', 'Register')}
              </Button>
            )}

            {/* Edit button (organizer only) */}
            {isOrganizer && (
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: '/events/$eventId/edit', params: { eventId } })
                }
              >
                <Pencil className="h-4 w-4" />
                {t('detail.edit', 'Edit')}
              </Button>
            )}

            {/* Cancel button (organizer only, non-cancelled events) */}
            {isOrganizer && event.status !== 'Cancelled' && (
              <Button
                variant="destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                {t('detail.cancel', 'Cancel Event')}
              </Button>
            )}
          </div>
        }
      />

      {/* ---- Section 1: Overview ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg">
              {t('detail.overview', 'Overview')}
            </CardTitle>
            <Badge color={STATUS_COLOR[event.status]} size="sm">
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Venue */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span>
              {event.venue}, {event.city}, {event.country}
            </span>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>

          {/* Categories */}
          {event.categories && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <div className="flex flex-wrap gap-1.5">
                {event.categories.split(',').map((cat) => (
                  <Badge key={cat.trim()} color="purple" size="sm">
                    {cat.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Section 2: Capacity (live via SignalR) ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('detail.capacity', 'Capacity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityGauge capacity={event.capacity} used={used} />
        </CardContent>
      </Card>

      {/* ---- Section 3: Sessions ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('detail.sessions', 'Sessions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionList sessions={event.sessions} />
        </CardContent>
      </Card>

      {/* ---- Section 4: Registrations ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('detail.registrations', 'Registrations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationList registrations={event.registrations} />
        </CardContent>
      </Card>

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('cancel.dialogTitle', 'Cancel Event')}
        description={t(
          'cancel.dialogDescription',
          `Are you sure you want to cancel "${event.title}"? This action cannot be undone.`,
        )}
        confirmLabel={t('cancel.confirm', 'Cancel Event')}
        cancelLabel={t('cancel.dismiss', 'Keep Event')}
        variant="destructive"
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
