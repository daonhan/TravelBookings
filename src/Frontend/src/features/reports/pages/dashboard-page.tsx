import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plane,
  CalendarDays,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Skeleton,
  Card,
  CardContent,
} from '@/shared/ui';
import type { DataTableColumn } from '@/shared/ui/data-table';
import { FeatureGate } from '@/shared/feature-flags';
import { formatDate, formatDateRange, formatCurrency } from '@/shared/utils';
import type { BookingSummaryDto, EventSummaryDto } from '@/shared/types';
import { useDashboard } from '../hooks/use-dashboard';
import { KpiCard } from '../components/kpi-card';

/* -------------------------------------------------------------------------- */
/*  Status helpers                                                            */
/* -------------------------------------------------------------------------- */

type BadgeColor = 'success' | 'warning' | 'default' | 'error' | 'info';

function bookingStatusColor(status: string): BadgeColor {
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

function eventStatusColor(status: string): BadgeColor {
  switch (status.toLowerCase()) {
    case 'published':
    case 'active':
      return 'success';
    case 'draft':
      return 'warning';
    case 'cancelled':
      return 'default';
    case 'completed':
      return 'info';
    default:
      return 'info';
  }
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                          */
/* -------------------------------------------------------------------------- */

function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard">
      {/* KPI skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`kpi-skel-${i}`}>
            <CardContent className="p-6">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="heading" className="mt-2" width="60%" />
              <Skeleton variant="text" className="mt-2" width="30%" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeletons */}
      <Card>
        <CardContent className="p-6">
          <Skeleton variant="heading" width="25%" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`row-skel-${i}`} variant="text" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DashboardPage                                                             */
/* -------------------------------------------------------------------------- */

function DashboardPageContent() {
  const { t } = useTranslation('reports');
  const { data: dashboard, isLoading } = useDashboard();

  /* ---------- Booking columns ---------- */

  const bookingColumns = useMemo<DataTableColumn<BookingSummaryDto>[]>(
    () => [
      {
        key: 'bookingId',
        header: t('dashboard.bookingId', 'Booking ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.bookingId.slice(0, 8)}</span>
        ),
      },
      {
        key: 'userId',
        header: t('dashboard.userId', 'User ID'),
        cell: (row) => (
          <span className="font-mono text-xs">{row.userId}</span>
        ),
      },
      {
        key: 'destination',
        header: t('dashboard.destination', 'Destination'),
        sortable: true,
      },
      {
        key: 'travelDate',
        header: t('dashboard.travelDate', 'Travel Date'),
        cell: (row) => formatDate(row.travelDate),
        sortable: true,
      },
      {
        key: 'totalAmount',
        header: t('dashboard.amount', 'Amount'),
        cell: (row) => formatCurrency(row.totalAmount, row.currency),
        sortable: true,
      },
      {
        key: 'status',
        header: t('dashboard.status', 'Status'),
        cell: (row) => (
          <Badge color={bookingStatusColor(row.status)}>{row.status}</Badge>
        ),
      },
    ],
    [t],
  );

  /* ---------- Event columns ---------- */

  const eventColumns = useMemo<DataTableColumn<EventSummaryDto>[]>(
    () => [
      {
        key: 'title',
        header: t('dashboard.eventTitle', 'Title'),
        sortable: true,
      },
      {
        key: 'location',
        header: t('dashboard.location', 'Location'),
        sortable: true,
      },
      {
        key: 'dateRange',
        header: t('dashboard.dates', 'Dates'),
        cell: (row) => formatDateRange(row.startDate, row.endDate),
      },
      {
        key: 'capacity',
        header: t('dashboard.capacity', 'Capacity'),
        cell: (row) => `${row.registeredCount} / ${row.capacity}`,
        sortable: true,
      },
      {
        key: 'registeredCount',
        header: t('dashboard.registered', 'Registered'),
        sortable: true,
      },
      {
        key: 'status',
        header: t('dashboard.status', 'Status'),
        cell: (row) => (
          <Badge color={eventStatusColor(row.status)}>{row.status}</Badge>
        ),
      },
    ],
    [t],
  );

  /* ---------- Render ---------- */

  if (isLoading || !dashboard) {
    return (
      <>
        <PageHeader title={t('dashboard.title', 'Dashboard')} />
        <DashboardSkeleton />
      </>
    );
  }

  const recentActivityCount =
    dashboard.recentBookings.length + dashboard.upcomingEvents.length;

  return (
    <>
      <PageHeader title={t('dashboard.title', 'Dashboard')} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t('dashboard.totalBookings', 'Total Bookings')}
          value={dashboard.totalBookings.toLocaleString()}
          icon={<Plane className="h-6 w-6" />}
        />
        <KpiCard
          title={t('dashboard.totalEvents', 'Total Events')}
          value={dashboard.totalEvents.toLocaleString()}
          icon={<CalendarDays className="h-6 w-6" />}
        />
        <KpiCard
          title={t('dashboard.totalRevenue', 'Total Revenue')}
          value={formatCurrency(dashboard.totalRevenue, dashboard.currency)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KpiCard
          title={t('dashboard.recentActivity', 'Recent Activity')}
          value={recentActivityCount}
          icon={<Activity className="h-6 w-6" />}
          description={t('dashboard.recentActivityDesc', 'bookings & events')}
        />
      </div>

      {/* Recent Bookings */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('dashboard.recentBookings', 'Recent Bookings')}
        </h2>
        <DataTable
          columns={bookingColumns}
          data={dashboard.recentBookings}
          isLoading={false}
          rowKey={(row) => row.bookingId}
          emptyMessage={t('dashboard.noBookings', 'No recent bookings')}
        />
      </section>

      {/* Upcoming Events */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('dashboard.upcomingEvents', 'Upcoming Events')}
        </h2>
        <DataTable
          columns={eventColumns}
          data={dashboard.upcomingEvents}
          isLoading={false}
          rowKey={(row) => row.eventId}
          emptyMessage={t('dashboard.noEvents', 'No upcoming events')}
        />
      </section>
    </>
  );
}

export function DashboardPage() {
  return (
    <FeatureGate flag="reports-dashboard">
      <DashboardPageContent />
    </FeatureGate>
  );
}
