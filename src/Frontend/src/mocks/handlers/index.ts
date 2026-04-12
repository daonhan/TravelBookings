import { bookingHandlers } from './booking-handlers';
import { eventHandlers } from './event-handlers';
import { paymentHandlers } from './payment-handlers';
import { reportHandlers } from './report-handlers';
import { notificationHandlers } from './notification-handlers';

export const handlers = [
  ...bookingHandlers,
  ...eventHandlers,
  ...paymentHandlers,
  ...reportHandlers,
  ...notificationHandlers,
];
