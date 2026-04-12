import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, XCircle } from 'lucide-react';
import {
  PageHeader,
  Button,
  Input,
  Badge,
  DataTable,
  DatePicker,
  Select,
  ConfirmDialog,
} from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { FeatureGate } from '@/shared/feature-flags';
import { FEATURE_FLAGS } from '@/shared/feature-flags/flags';
import { useAuth } from '@/shared/auth';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { usePagination } from '@/shared/hooks/use-pagination';
import { formatDateRange } from '@/shared/utils/date';
import type { EventDto, EventStatus, SearchEventsParams } from '@/shared/types';
import { useEventsSearch } from '../hooks/use-events-search';
import { useCancelEvent } from '../hooks/use-cancel-event';
import { CapacityGauge } from '../components/capacity-gauge';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const STATUS_COLOR: Record<EventStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Draft: 'default',
  Published: 'info',
  InProgress: 'warning',
  Completed: 'success',
  Cancelled: 'error',
};

/* -------------------------------------------------------------------------- */
/*  EventSearchPage                                                            */
/* -------------------------------------------------------------------------- */

export function EventSearchPage() {
  const { t } = useTranslation('events');
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isOrganizer = hasRole('EventOrganizer') || hasRole('Admin');

  /* ----- Filter state ----- */
  const [titleFilter, setTitleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  const debouncedTitle = useDebounce(titleFilter, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);

  /* ----- Pagination ----- */
  const { page, pageSize, setPage } = usePagination();

  /* ----- Search query ----- */
  const searchParams: SearchEventsParams = {
    title: debouncedTitle || undefined,
    location: debouncedLocation || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize,
  };

  const { data, isLoading } = useEventsSearch(searchParams);

  /* ----- Cancel dialog state ----- */
  const [cancelTarget, setCancelTarget] = useState<EventDto | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const cancelMutation = useCancelEvent(cancelTarget?.id ?? '');

  const handleConfirmCancel = useCallback(() => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelReason || undefined, {
      onSettled: () => {
        setCancelTarget(null);
        setCancelReason('');
      },
    });
  }, [cancelTarget, cancelReason, cancelMutation]);

  /* ----- Table columns ----- */
  const columns: DataTableColumn<EventDto>[] = [
    {
      key: 'title',
      header: t('table.title', 'Title'),
      sortable: true,
      cell: (row) => (
        <button
          type="button"
          className="text-left font-medium text-blue-600 hover:underline focus:outline-none focus:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/events/$eventId', params: { eventId: row.id } });
          }}
        >
          {row.title}
        </button>
      ),
    },
    {
      key: 'venue',
      header: t('table.venue', 'Venue'),
      cell: (row) => (
        <span>
          {row.venue}, {row.city}
        </span>
      ),
    },
    {
      key: 'dates',
      header: t('table.dates', 'Dates'),
      cell: (row) => <span>{formatDateRange(row.startDate, row.endDate)}</span>,
    },
    {
      key: 'capacity',
      header: t('table.capacity', 'Capacity'),
      cell: (row) => (
        <CapacityGauge
          capacity={row.capacity}
          used={row.capacity - row.availableCapacity}
        />
      ),
      className: 'min-w-[160px]',
    },
    {
      key: 'status',
      header: t('table.status', 'Status'),
      cell: (row) => (
        <Badge color={STATUS_COLOR[row.status]} size="sm">
          {row.status}
        </Badge>
      ),
    },
    ...(isOrganizer
      ? [
          {
            key: 'actions',
            header: '',
            cell: (row: EventDto) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigate({ to: '/events/$eventId/edit', params: { eventId: row.id } });
                  }}
                  aria-label={t('actions.edit', 'Edit event')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {row.status !== 'Cancelled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setCancelTarget(row);
                    }}
                    aria-label={t('actions.cancel', 'Cancel event')}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ),
            className: 'w-[100px]',
          } satisfies DataTableColumn<EventDto>,
        ]
      : []),
  ];

  return (
    <FeatureGate flag={FEATURE_FLAGS.EVENTS_LIST}>
      <PageHeader
        title={t('search.title', 'Events')}
        description={t('search.description', 'Browse and manage events')}
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.events', 'Events') },
        ]}
        actions={
          isOrganizer ? (
            <Button
              variant="primary"
              onClick={() => navigate({ to: '/events/new' })}
            >
              <Plus className="h-4 w-4" />
              {t('search.create', 'Create Event')}
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder={t('filters.title', 'Search by title...')}
          value={titleFilter}
          onChange={(e) => {
            setTitleFilter(e.target.value);
            setPage(1);
          }}
        />
        <Input
          placeholder={t('filters.location', 'Filter by location...')}
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value);
            setPage(1);
          }}
        />
        <DatePicker
          placeholder={t('filters.fromDate', 'From date')}
          value={fromDate}
          onChange={(val) => {
            setFromDate(val);
            setPage(1);
          }}
        />
        <DatePicker
          placeholder={t('filters.toDate', 'To date')}
          value={toDate}
          onChange={(val) => {
            setToDate(val);
            setPage(1);
          }}
        />
        <Select
          placeholder={t('filters.status', 'All statuses')}
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        />
      </div>

      {/* Events table */}
      <DataTable<EventDto>
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={t('search.empty', 'No events found')}
        rowKey={(row) => row.id}
        pagination={
          data
            ? {
                page: data.page,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                totalPages: data.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason('');
          }
        }}
        title={t('cancel.dialogTitle', 'Cancel Event')}
        description={t(
          'cancel.dialogDescription',
          `Are you sure you want to cancel "${cancelTarget?.title ?? ''}"? This action cannot be undone.`,
        )}
        confirmLabel={t('cancel.confirm', 'Cancel Event')}
        cancelLabel={t('cancel.dismiss', 'Keep Event')}
        variant="destructive"
        onConfirm={handleConfirmCancel}
      />
    </FeatureGate>
  );
}
