export const FEATURE_FLAGS = {
  REPORTS_DASHBOARD: 'reports-dashboard',
  REPORTS_BOOKINGS: 'reports-bookings',
  REPORTS_REVENUE: 'reports-revenue',
  NOTIFICATIONS_CENTER: 'notifications-center',
  NOTIFICATIONS_PREFERENCES: 'notifications-preferences',
  EVENTS_LIST: 'events-list',
  EVENTS_CRUD: 'events-crud',
  EVENTS_REGISTRATION: 'events-registration',
  BOOKINGS_SEARCH: 'bookings-search',
  BOOKINGS_CREATE: 'bookings-create',
  BOOKINGS_SAGA_TRACKER: 'bookings-saga-tracker',
  PAYMENTS_HISTORY: 'payments-history',
  PAYMENTS_REFUND: 'payments-refund',
} as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
