import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import { DollarSign, Receipt } from 'lucide-react';
import { PageHeader, DataTable, Badge, DatePicker } from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { formatCurrency, formatDateTime } from '@/shared/utils';
import type { RevenueItemDto } from '@/shared/types';
import { useRevenueReport } from '../hooks/use-revenue-report';
import { KpiCard } from '../components/kpi-card';
import { RevenueChart } from '../components/revenue-chart';
import { CsvExportButton } from '../components/csv-export-button';

/* -------------------------------------------------------------------------- */
/*  Status helpers                                                            */
/* -------------------------------------------------------------------------- */

type BadgeColor = 'success' | 'warning' | 'default' | 'error' | 'info';

function paymentStatusColor(status: string): BadgeColor {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'succeeded':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'refunded':
      return 'default';
    default:
      return 'info';
  }
}

/* -------------------------------------------------------------------------- */
/*  CSV column definitions                                                    */
/* -------------------------------------------------------------------------- */

const CSV_COLUMNS = [
  { key: 'paymentId', header: 'Payment ID' },
  { key: 'bookingId', header: 'Booking ID' },
  { key: 'amount', header: 'Amount' },
  { key: 'status', header: 'Status' },
  { key: 'processedAt', header: 'Processed At' },
];

/* -------------------------------------------------------------------------- */
/*  RevenueReportPage                                                         */
/* -------------------------------------------------------------------------- */

export function RevenueReportPage() {
  const { t } = useTranslation('reports');

  // Default to last 30 days
  const [fromDate, setFromDate] = useState<string>(
    format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  );
  const [toDate, setToDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const { data: report, isLoading } = useRevenueReport({
    from: fromDate,
    to: toDate,
  });

  /* ---------- Revenue chart data ---------- */

  const chartData = useMemo(() => {
    if (!report?.items) return [];

    // Aggregate revenue by date
    const revenueByDate = new Map<string, number>();
    for (const item of report.items) {
      const date = item.processedAt.split('T')[0];
      if (!date) continue;
      revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + item.amount);
    }

    return Array.from(revenueByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [report?.items]);

  /* ---------- Table columns ---------- */

  const columns = useMemo<DataTableColumn<RevenueItemDto>[]>(
    () => [
      {
        key: 'paymentId',
        header: t('revenueReport.paymentId', 'Payment ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.paymentId}</span>
        ),
      },
      {
        key: 'bookingId',
        header: t('revenueReport.bookingId', 'Booking ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.bookingId}</span>
        ),
      },
      {
        key: 'amount',
        header: t('revenueReport.amount', 'Amount'),
        cell: (row) => formatCurrency(row.amount, report?.currency),
        sortable: true,
      },
      {
        key: 'status',
        header: t('revenueReport.status', 'Status'),
        cell: (row) => (
          <Badge color={paymentStatusColor(row.status)}>{row.status}</Badge>
        ),
      },
      {
        key: 'processedAt',
        header: t('revenueReport.processedAt', 'Processed At'),
        cell: (row) => formatDateTime(row.processedAt),
        sortable: true,
      },
    ],
    [t, report?.currency],
  );

  /* ---------- CSV data ---------- */

  const csvData = useMemo<Record<string, unknown>[]>(
    () =>
      (report?.items ?? []).map((item) => ({
        ...item,
        amount: item.amount,
        processedAt: formatDateTime(item.processedAt),
      })),
    [report?.items],
  );

  /* ---------- Render ---------- */

  return (
    <>
      <PageHeader
        title={t('revenueReport.title', 'Revenue Report')}
        actions={
          <CsvExportButton
            columns={CSV_COLUMNS}
            data={csvData}
            filename={`revenue-report-${fromDate}-to-${toDate}`}
          />
        }
      />

      {/* Date range picker */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <DatePicker
          label={t('revenueReport.from', 'From')}
          value={fromDate}
          onChange={setFromDate}
        />
        <DatePicker
          label={t('revenueReport.to', 'To')}
          value={toDate}
          onChange={setToDate}
        />
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          title={t('revenueReport.totalRevenue', 'Total Revenue')}
          value={
            report
              ? formatCurrency(report.totalRevenue, report.currency)
              : '-'
          }
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KpiCard
          title={t('revenueReport.transactionCount', 'Transactions')}
          value={report?.transactionCount.toLocaleString() ?? '-'}
          icon={<Receipt className="h-6 w-6" />}
        />
      </div>

      {/* Revenue chart */}
      <div className="mb-6">
        <RevenueChart data={chartData} isLoading={isLoading} />
      </div>

      {/* Line items table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('revenueReport.lineItems', 'Transaction Details')}
        </h2>
        <DataTable
          columns={columns}
          data={report?.items ?? []}
          isLoading={isLoading}
          rowKey={(row) => row.paymentId}
          emptyMessage={t('revenueReport.empty', 'No transactions found for the selected period')}
        />
      </section>
    </>
  );
}
