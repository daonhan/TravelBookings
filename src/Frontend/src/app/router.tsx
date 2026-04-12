import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { lazy } from 'react';
import { RootLayout } from '@/app/layout/root-layout';
import { NotFoundPage } from '@/app/not-found';

/* -------------------------------------------------------------------------- */
/*  Lazy-loaded feature pages                                                 */
/* -------------------------------------------------------------------------- */

const DashboardPage = lazy(() =>
  import('@/features/reports/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const BookingReportsPage = lazy(() =>
  import('@/features/reports/pages/booking-reports-page').then((m) => ({
    default: m.BookingReportsPage,
  })),
);
const RevenueReportPage = lazy(() =>
  import('@/features/reports/pages/revenue-report-page').then((m) => ({
    default: m.RevenueReportPage,
  })),
);
const NotificationCenterPage = lazy(() =>
  import('@/features/notifications/pages/notification-center-page').then((m) => ({
    default: m.NotificationCenterPage,
  })),
);
const NotificationPreferencesPage = lazy(() =>
  import('@/features/notifications/pages/notification-preferences-page').then((m) => ({
    default: m.NotificationPreferencesPage,
  })),
);
const EventSearchPage = lazy(() =>
  import('@/features/events/pages/event-search-page').then((m) => ({
    default: m.EventSearchPage,
  })),
);
const CreateEventPage = lazy(() =>
  import('@/features/events/pages/create-event-page').then((m) => ({
    default: m.CreateEventPage,
  })),
);
const EventDetailPage = lazy(() =>
  import('@/features/events/pages/event-detail-page').then((m) => ({
    default: m.EventDetailPage,
  })),
);
const EditEventPage = lazy(() =>
  import('@/features/events/pages/edit-event-page').then((m) => ({ default: m.EditEventPage })),
);
const BookingSearchPage = lazy(() =>
  import('@/features/bookings/pages/booking-search-page').then((m) => ({
    default: m.BookingSearchPage,
  })),
);
const CreateBookingPage = lazy(() =>
  import('@/features/bookings/pages/create-booking-page').then((m) => ({
    default: m.CreateBookingPage,
  })),
);
const BookingDetailPage = lazy(() =>
  import('@/features/bookings/pages/booking-detail-page').then((m) => ({
    default: m.BookingDetailPage,
  })),
);
const PaymentHistoryPage = lazy(() =>
  import('@/features/payments/pages/payment-history-page').then((m) => ({
    default: m.PaymentHistoryPage,
  })),
);
const PaymentDetailPage = lazy(() =>
  import('@/features/payments/pages/payment-detail-page').then((m) => ({
    default: m.PaymentDetailPage,
  })),
);

/* -------------------------------------------------------------------------- */
/*  Feature section layouts                                                   */
/* -------------------------------------------------------------------------- */

function SectionLayout() {
  return <Outlet />;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">Coming soon.</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Route Tree                                                                */
/* -------------------------------------------------------------------------- */

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/reports' });
  },
});

/* ── Reports ─────────────────────────────────────────────────────────────── */

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'reports',
  component: SectionLayout,
});

const reportsIndexRoute = createRoute({
  getParentRoute: () => reportsRoute,
  path: '/',
  component: DashboardPage,
});

const reportsBookingsRoute = createRoute({
  getParentRoute: () => reportsRoute,
  path: 'bookings',
  component: BookingReportsPage,
});

const reportsRevenueRoute = createRoute({
  getParentRoute: () => reportsRoute,
  path: 'revenue',
  component: RevenueReportPage,
});

/* ── Notifications ───────────────────────────────────────────────────────── */

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'notifications',
  component: SectionLayout,
});

const notificationsIndexRoute = createRoute({
  getParentRoute: () => notificationsRoute,
  path: '/',
  component: NotificationCenterPage,
});

const notificationsPreferencesRoute = createRoute({
  getParentRoute: () => notificationsRoute,
  path: 'preferences',
  component: NotificationPreferencesPage,
});

/* ── Events ──────────────────────────────────────────────────────────────── */

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'events',
  component: SectionLayout,
});

const eventsIndexRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: '/',
  component: EventSearchPage,
});

const eventsNewRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: 'new',
  component: CreateEventPage,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: '$eventId',
  component: SectionLayout,
});

const eventDetailIndexRoute = createRoute({
  getParentRoute: () => eventDetailRoute,
  path: '/',
  component: EventDetailPage,
});

const eventEditRoute = createRoute({
  getParentRoute: () => eventDetailRoute,
  path: 'edit',
  component: EditEventPage,
});

/* ── Bookings ────────────────────────────────────────────────────────────── */

const bookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'bookings',
  component: SectionLayout,
});

const bookingsIndexRoute = createRoute({
  getParentRoute: () => bookingsRoute,
  path: '/',
  component: BookingSearchPage,
});

const bookingsNewRoute = createRoute({
  getParentRoute: () => bookingsRoute,
  path: 'new',
  component: CreateBookingPage,
});

const bookingDetailRoute = createRoute({
  getParentRoute: () => bookingsRoute,
  path: '$bookingId',
  component: BookingDetailPage,
});

/* ── Payments ────────────────────────────────────────────────────────────── */

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'payments',
  component: SectionLayout,
});

const paymentsIndexRoute = createRoute({
  getParentRoute: () => paymentsRoute,
  path: '/',
  component: PaymentHistoryPage,
});

const paymentDetailRoute = createRoute({
  getParentRoute: () => paymentsRoute,
  path: '$paymentId',
  component: PaymentDetailPage,
});

/* ── Settings ────────────────────────────────────────────────────────────── */

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'settings',
  component: SectionLayout,
});

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: () => <PlaceholderPage title="Settings" />,
});

/* -------------------------------------------------------------------------- */
/*  Compose route tree                                                        */
/* -------------------------------------------------------------------------- */

const routeTree = rootRoute.addChildren([
  indexRoute,
  reportsRoute.addChildren([reportsIndexRoute, reportsBookingsRoute, reportsRevenueRoute]),
  notificationsRoute.addChildren([notificationsIndexRoute, notificationsPreferencesRoute]),
  eventsRoute.addChildren([
    eventsIndexRoute,
    eventsNewRoute,
    eventDetailRoute.addChildren([eventDetailIndexRoute, eventEditRoute]),
  ]),
  bookingsRoute.addChildren([bookingsIndexRoute, bookingsNewRoute, bookingDetailRoute]),
  paymentsRoute.addChildren([paymentsIndexRoute, paymentDetailRoute]),
  settingsRoute.addChildren([settingsIndexRoute]),
]);

/* -------------------------------------------------------------------------- */
/*  Create router                                                             */
/* -------------------------------------------------------------------------- */

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
});

/* -------------------------------------------------------------------------- */
/*  Type safety                                                               */
/* -------------------------------------------------------------------------- */

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
