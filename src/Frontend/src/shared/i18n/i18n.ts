import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/en/common.json';
import bookings from './locales/en/bookings.json';
import events from './locales/en/events.json';
import payments from './locales/en/payments.json';
import reports from './locales/en/reports.json';
import notifications from './locales/en/notifications.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'bookings', 'events', 'payments', 'reports', 'notifications'],
  defaultNS: 'common',
  resources: {
    en: {
      common,
      bookings,
      events,
      payments,
      reports,
      notifications,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
