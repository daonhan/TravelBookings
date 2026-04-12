import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, Badge } from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { formatDate, formatDateTime, formatCurrency } from '@/shared/utils';
import { usePagination } from '@/shared/hooks';
import type { BookingSummaryDto } from '@/shared/types';
import { useBookingReports } from '../hooks/use-booking-reports';
import { CsvExportButton } from '../components/csv-export-button';

/* -------------------------------------------------------------------------- */
/*  Status helpers                                                            */
/* -------------------------------------------------------------------------- */

type BadgeColor = 'success' | 'warning' | 'default' | 'error' | 'info';

function statusColor(status: string): BadgeColor {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'default';
    case 'failed':
      return 'error';
    default:
      return 'info';
  }
}

/* -------------------------------------------------------------------------- */
/*  CSV column definitions                                                    */
/* -------------------------------------------------------------------------- */

const CSV_COLUMNS = [
  { key: 'bookingId', header: 'Booking ID' },
  { key: 'userId', header: 'User ID' },
  { key: 'destination', header: 'Destination' },
  { key: 'travelDate', header: 'Travel Date' },
  { key: 'totalAmount', header: 'Total Amount' },
  { key: 'currency', header: 'Currency' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'cancelledAt', header: 'Cancelled At' },
];

/* -------------------------------------------------------------------------- */
/*  BookingReportsPage                                                        */
/* -------------------------------------------------------------------------- */

export function BookingReportsPage() {
  const { t } = useTranslation('reports');
  const { page, pageSize, setPage } = usePagination();
  const { data, isLoading } = useBookingReports({ page, pageSize });

  const columns = useMemo<DataTableColumn<BookingSummaryDto>[]>(
    () => [
      {
        key: 'bookingId',
        header: t('bookingReports.bookingId', 'Booking ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.bookingId}</span>
        ),
      },
      {
        key: 'userId',
        header: t('bookingReports.userId', 'User ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.userId}</span>
        ),
      },
      {
        key: 'destination',
        header: t('bookingReports.destination', 'Destination'),
        sortable: true,
      },
      {
        key: 'travelDate',
        header: t('bookingReports.travelDate', 'Travel Date'),
        cell: (row) => formatDate(row.travelDate),
        sortable: true,
      },
      {
        key: 'totalAmount',
        header: t('bookingReports.amount', 'Amount'),
        cell: (row) => formatCurrency(row.totalAmount, row.currency),
        sortable: true,
      },
      {
        key: 'currency',
        header: t('bookingReports.currency', 'Currency'),
      },
      {
        key: 'status',
        header: t('bookingReports.status', 'Status'),
        cell: (row) => (
          <Badge color={statusColor(row.status)}>{row.status}</Badge>
        ),
      },
      {
        key: 'createdAt',
        header: t('bookingReports.createdAt', 'Created At'),
        cell: (row) => formatDateTime(row.createdAt),
        sortable: true,
      },
      {
        key: 'cancelledAt',
        header: t('bookingReports.cancelledAt', 'Cancelled At'),
        cell: (row) => formatDateTime(row.cancelledAt),
      },
    ],
    [t],
  );

  const csvData = useMemo<Record<string, unknown>[]>(
    () =>
      (data?.items ?? []).map((item) => ({
        ...item,
        travelDate: formatDate(item.travelDate),
        totalAmount: item.totalAmount,
        createdAt: formatDateTime(item.createdAt),
        cancelledAt: formatDateTime(item.cancelledAt),
      })),
    [data?.items],
  );

  return (
    <>
      <PageHeader
        title={t('bookingReports.title', 'Booking Reports')}
        actions={
          <CsvExportButton
            columns={CSV_COLUMNS}
            data={csvData}
            filename={`booking-reports-page-${page}`}
          />
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        rowKey={(row) => row.bookingId}
        emptyMessage={t('bookingReports.empty', 'No booking reports found')}
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
    </>
  );
}
