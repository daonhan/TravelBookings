import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  DataTable,
  Select,
  DatePicker,
} from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { FeatureGate } from '@/shared/feature-flags';
import { FEATURE_FLAGS } from '@/shared/feature-flags/flags';
import { useAuth } from '@/shared/auth';
import { usePagination } from '@/shared/hooks/use-pagination';
import { formatCurrency } from '@/shared/utils/currency';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import type { PaymentDto, PaymentStatus } from '@/shared/types';
import { useUserPayments } from '../hooks/use-user-payments';
import { PaymentStatusBadge } from '../components/payment-status-badge';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'PartiallyRefunded', label: 'Partially Refunded' },
];

/* -------------------------------------------------------------------------- */
/*  PaymentHistoryPage                                                         */
/* -------------------------------------------------------------------------- */

export function PaymentHistoryPage() {
  const { t } = useTranslation('payments');
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isFinanceAdmin = hasRole('FinanceAdmin');

  /* ----- Filter state ----- */
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  /* ----- Pagination ----- */
  const { page, pageSize, setPage } = usePagination();

  /* ----- Query ----- */
  const { data, isLoading } = useUserPayments({ page, pageSize });

  /* ----- Client-side filtering ----- */
  // Status and date-range filters are applied client-side since the API
  // paginates by user. When server-side filtering is available these can
  // be passed as query params instead.
  const filteredItems = (data?.items ?? []).filter((payment) => {
    if (statusFilter && payment.status !== statusFilter) {
      return false;
    }
    if (fromDate && payment.createdAt < fromDate) {
      return false;
    }
    if (toDate && payment.createdAt > `${toDate}T23:59:59`) {
      return false;
    }
    return true;
  });

  /* ----- Table columns ----- */
  const columns: DataTableColumn<PaymentDto>[] = [
    {
      key: 'id',
      header: t('table.paymentId', 'Payment ID'),
      cell: (row) => (
        <button
          type="button"
          className="font-mono text-sm text-blue-600 hover:underline focus:outline-none focus:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/payments/$paymentId', params: { paymentId: row.id } });
          }}
        >
          {row.id.slice(0, 8)}
        </button>
      ),
    },
    {
      key: 'bookingId',
      header: t('table.bookingId', 'Booking'),
      cell: (row) => (
        <button
          type="button"
          className="font-mono text-sm text-blue-600 hover:underline focus:outline-none focus:underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/bookings/$bookingId', params: { bookingId: row.bookingId } });
          }}
        >
          {row.bookingId.slice(0, 8)}
        </button>
      ),
    },
    {
      key: 'amount',
      header: t('table.amount', 'Amount'),
      sortable: true,
      cell: (row) => (
        <span className="font-medium">
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'method',
      header: t('table.method', 'Method'),
      cell: (row) => <span>{row.method}</span>,
    },
    {
      key: 'status',
      header: t('table.status', 'Status'),
      cell: (row) => <PaymentStatusBadge status={row.status as PaymentStatus} />,
    },
    {
      key: 'gatewayTransactionId',
      header: t('table.gateway', 'Gateway Txn ID'),
      cell: (row) => (
        <span className="font-mono text-xs text-gray-500 truncate max-w-[120px] inline-block">
          {row.gatewayTransactionId}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: t('table.createdAt', 'Created'),
      sortable: true,
      cell: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'processedAt',
      header: t('table.processedAt', 'Processed'),
      sortable: true,
      cell: (row) => (
        <span className="text-sm">{formatDateTime(row.processedAt)}</span>
      ),
    },
  ];

  return (
    <FeatureGate flag={FEATURE_FLAGS.PAYMENTS_HISTORY}>
      <PageHeader
        title={t('history.title', 'Payments')}
        description={
          isFinanceAdmin
            ? t('history.descriptionAdmin', 'View and manage all payment records')
            : t('history.description', 'View your payment history')
        }
        breadcrumbs={[
          { label: t('breadcrumb.home', 'Home'), href: '/' },
          { label: t('breadcrumb.payments', 'Payments') },
        ]}
      />

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          placeholder={t('filters.status', 'All statuses')}
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
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
      </div>

      {/* Payments table */}
      <DataTable<PaymentDto>
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        emptyMessage={t('history.empty', 'No payments found')}
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
    </FeatureGate>
  );
}
