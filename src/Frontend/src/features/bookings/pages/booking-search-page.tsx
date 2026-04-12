import { useState, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { DatePicker } from '@/shared/ui/date-picker';
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table';
import { FeatureGate } from '@/shared/feature-flags/feature-gate';
import { formatDate } from '@/shared/utils/date';
import { formatCurrency } from '@/shared/utils/currency';
import { useBookingsSearch } from '@/features/bookings/hooks/use-bookings-search';
import { BookingStatusBadge } from '@/features/bookings/components/booking-status-badge';
import type { BookingDto, SearchBookingsParams } from '@/shared/types';

/* -------------------------------------------------------------------------- */
/*  BookingSearchPage                                                         */
/*  Server-side paginated listing of bookings with search filters.            */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 20;

export function BookingSearchPage() {
  const { t } = useTranslation('bookings');
  const navigate = useNavigate();

  /* ---- filter state ---- */
  const [userId, setUserId] = useState('');
  const [destination, setDestination] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const params: SearchBookingsParams = {
    ...(userId ? { userId } : {}),
    ...(destination ? { destination } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading } = useBookingsSearch(params);

  /* ---- column definitions ---- */
  const columns: DataTableColumn<BookingDto>[] = [
    {
      key: 'id',
      header: t('search.columns.bookingId', { defaultValue: 'Booking ID' }),
      cell: (row) => (
        <Link
          to="/bookings/$bookingId"
          params={{ bookingId: row.id }}
          className="font-mono text-sm text-blue-600 hover:underline"
        >
          {row.id.slice(0, 8)}
        </Link>
      ),
      className: 'w-28',
    },
    {
      key: 'userId',
      header: t('search.columns.userId', { defaultValue: 'User ID' }),
      cell: (row) => (
        <span className="font-mono text-sm">{row.userId.slice(0, 8)}</span>
      ),
    },
    {
      key: 'destination',
      header: t('search.columns.destination', { defaultValue: 'Destination' }),
      cell: (row) => row.itineraries[0]?.destination ?? '-',
    },
    {
      key: 'departureDate',
      header: t('search.columns.departureDate', { defaultValue: 'Departure' }),
      cell: (row) => formatDate(row.itineraries[0]?.departureDate),
      sortable: true,
    },
    {
      key: 'totalAmount',
      header: t('search.columns.totalAmount', { defaultValue: 'Amount' }),
      cell: (row) => formatCurrency(row.totalAmount, row.currency),
      sortable: true,
    },
    {
      key: 'status',
      header: t('search.columns.status', { defaultValue: 'Status' }),
      cell: (row) => <BookingStatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: t('search.columns.createdAt', { defaultValue: 'Created' }),
      cell: (row) => formatDate(row.createdAt),
      sortable: true,
    },
  ];

  /* ---- handlers ---- */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <FeatureGate flag="bookings-search">
      <PageHeader
        title={t('search.title', { defaultValue: 'Bookings' })}
        description={t('search.description', {
          defaultValue: 'Search and manage travel booking requests.',
        })}
        breadcrumbs={[
          { label: t('breadcrumbs.home', { defaultValue: 'Home' }), href: '/' },
          { label: t('breadcrumbs.bookings', { defaultValue: 'Bookings' }) },
        ]}
        actions={
          <Button
            onClick={() => navigate({ to: '/bookings/new' })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('search.createBooking', { defaultValue: 'Create Booking' })}
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label={t('search.filters.userId', { defaultValue: 'User ID' })}
          placeholder={t('search.filters.userIdPlaceholder', { defaultValue: 'Filter by user...' })}
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label={t('search.filters.destination', { defaultValue: 'Destination' })}
          placeholder={t('search.filters.destinationPlaceholder', {
            defaultValue: 'e.g. LAX, London',
          })}
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setPage(1);
          }}
        />
        <DatePicker
          label={t('search.filters.fromDate', { defaultValue: 'From Date' })}
          value={fromDate}
          onChange={(val) => {
            setFromDate(val);
            setPage(1);
          }}
        />
        <DatePicker
          label={t('search.filters.toDate', { defaultValue: 'To Date' })}
          value={toDate}
          onChange={(val) => {
            setToDate(val);
            setPage(1);
          }}
        />
      </div>

      {/* Results table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable<BookingDto>
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          rowKey={(row) => row.id}
          emptyMessage={t('search.empty', { defaultValue: 'No bookings found.' })}
          onRowClick={(row) =>
            navigate({ to: '/bookings/$bookingId', params: { bookingId: row.id } })
          }
          pagination={
            data
              ? {
                  page: data.page,
                  pageSize: data.pageSize,
                  totalCount: data.totalCount,
                  totalPages: data.totalPages,
                  onPageChange: handlePageChange,
                }
              : undefined
          }
        />
      </div>
    </FeatureGate>
  );
}
