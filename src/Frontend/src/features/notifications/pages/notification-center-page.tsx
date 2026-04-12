import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Calendar,
  CreditCard,
  Info,
  CheckCheck,
} from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Select,
  Button,
} from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { formatRelative, formatDate } from '@/shared/utils';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useUserNotifications } from '@/features/notifications/hooks/use-user-notifications';
import type { NotificationDto, NotificationType } from '@/shared/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NOTIFICATION_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'BookingConfirmation', label: 'Booking Confirmation' },
  { value: 'BookingCancellation', label: 'Booking Cancellation' },
  { value: 'PaymentReceipt', label: 'Payment Receipt' },
  { value: 'PaymentFailed', label: 'Payment Failed' },
  { value: 'EventCreated', label: 'Event Created' },
  { value: 'EventUpdated', label: 'Event Updated' },
  { value: 'AttendeeRegistered', label: 'Attendee Registered' },
];

const READ_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function typeIcon(type: string) {
  switch (type) {
    case 'BookingConfirmation':
    case 'BookingCancellation':
      return <Bell className="h-4 w-4 text-blue-500" aria-hidden="true" />;
    case 'EventCreated':
    case 'EventUpdated':
    case 'AttendeeRegistered':
      return <Calendar className="h-4 w-4 text-purple-500" aria-hidden="true" />;
    case 'PaymentReceipt':
    case 'PaymentFailed':
      return <CreditCard className="h-4 w-4 text-green-500" aria-hidden="true" />;
    default:
      return <Info className="h-4 w-4 text-gray-400" aria-hidden="true" />;
  }
}

function typeLabel(type: string): string {
  const option = NOTIFICATION_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.label ?? type;
}

function statusBadge(status: string) {
  switch (status) {
    case 'Delivered':
      return (
        <Badge color="success" size="sm">
          Delivered
        </Badge>
      );
    case 'Sent':
      return (
        <Badge color="info" size="sm">
          Sent
        </Badge>
      );
    case 'Pending':
      return (
        <Badge color="warning" size="sm">
          Pending
        </Badge>
      );
    case 'Failed':
      return (
        <Badge color="error" size="sm">
          Failed
        </Badge>
      );
    default:
      return (
        <Badge color="default" size="sm">
          {status}
        </Badge>
      );
  }
}

function routeForNotification(notification: NotificationDto): string | null {
  const { referenceId, type } = notification;
  if (!referenceId) return null;

  switch (type as NotificationType) {
    case 'BookingConfirmation':
    case 'BookingCancellation':
      return `/bookings/${referenceId}`;
    case 'EventCreated':
    case 'EventUpdated':
    case 'AttendeeRegistered':
      return `/events/${referenceId}`;
    case 'PaymentReceipt':
    case 'PaymentFailed':
      return `/payments/${referenceId}`;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export function NotificationCenterPage() {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();
  const { page, pageSize, setPage } = usePagination();

  /* ----- Filters ----- */
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  /* ----- Data ----- */
  const { data, isLoading } = useUserNotifications({ page, pageSize });

  /* ----- Client-side filtering (type + read/unread) ----- */
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items;

    if (typeFilter) {
      items = items.filter((n) => n.type === typeFilter);
    }

    if (readFilter === 'unread') {
      items = items.filter((n) => n.status !== 'Delivered');
    } else if (readFilter === 'read') {
      items = items.filter((n) => n.status === 'Delivered');
    }

    return items;
  }, [data?.items, typeFilter, readFilter]);

  /* ----- Row click handler ----- */
  const handleRowClick = useCallback(
    (row: NotificationDto) => {
      const route = routeForNotification(row);
      if (route) {
        navigate({ to: route });
      }
    },
    [navigate],
  );

  /* ----- Mark all read (placeholder — depends on backend API) ----- */
  const handleMarkAllRead = useCallback(() => {
    // TODO: Call a batch "mark read" API when available
  }, []);

  /* ----- Column definitions ----- */
  const columns: DataTableColumn<NotificationDto>[] = useMemo(
    () => [
      {
        key: 'type',
        header: t('columns.type', 'Type'),
        cell: (row) => (
          <span className="inline-flex items-center gap-2">
            {typeIcon(row.type)}
            <span className="text-sm">{typeLabel(row.type)}</span>
          </span>
        ),
        sortable: true,
      },
      {
        key: 'subject',
        header: t('columns.subject', 'Subject'),
        cell: (row) => (
          <span
            className={
              row.status !== 'Delivered'
                ? 'font-semibold text-gray-900'
                : 'text-gray-700'
            }
          >
            {row.subject}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'channel',
        header: t('columns.channel', 'Channel'),
        sortable: true,
      },
      {
        key: 'status',
        header: t('columns.status', 'Status'),
        cell: (row) => statusBadge(row.status),
        sortable: true,
      },
      {
        key: 'createdAt',
        header: t('columns.createdAt', 'Created'),
        cell: (row) => (
          <span className="text-sm text-gray-500">
            {formatRelative(row.createdAt)}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'sentAt',
        header: t('columns.sentAt', 'Sent'),
        cell: (row) => (
          <span className="text-sm text-gray-500">
            {formatDate(row.sentAt)}
          </span>
        ),
        sortable: true,
      },
    ],
    [t],
  );

  /* ----- Pagination ----- */
  const pagination = data
    ? {
        page: data.page,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        onPageChange: setPage,
      }
    : undefined;

  /* ----- Render ----- */
  return (
    <div>
      <PageHeader
        title={t('center.title', 'Notifications')}
        description={t(
          'center.description',
          'View and manage all your notifications in one place.',
        )}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            {t('center.markAllRead', 'Mark all read')}
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <Select
          label={t('filters.type', 'Type')}
          options={NOTIFICATION_TYPE_OPTIONS}
          value={typeFilter}
          onValueChange={setTypeFilter}
          placeholder="All types"
          className="w-56"
        />
        <Select
          label={t('filters.readStatus', 'Status')}
          options={READ_FILTER_OPTIONS}
          value={readFilter}
          onValueChange={setReadFilter}
          placeholder="All"
          className="w-40"
        />
      </div>

      {/* Table */}
      <DataTable<NotificationDto>
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        emptyMessage={t('center.empty', 'No notifications yet.')}
        pagination={pagination}
        onRowClick={handleRowClick}
        rowKey={(row) => row.id}
      />
    </div>
  );
}
