/* =================================================================== */
/*  Events Feature -- Barrel Export                                     */
/* =================================================================== */

/* --- Hooks ---------------------------------------------------------  */
export { useEventsSearch } from './hooks/use-events-search';
export { useEventDetail } from './hooks/use-event-detail';
export { useCreateEvent } from './hooks/use-create-event';
export { useUpdateEvent } from './hooks/use-update-event';
export { useCancelEvent } from './hooks/use-cancel-event';
export { useRegisterAttendee } from './hooks/use-register-attendee';

/* --- Components ---------------------------------------------------  */
export { EventCard } from './components/event-card';
export { CapacityGauge } from './components/capacity-gauge';
export { SessionList } from './components/session-list';
export { RegistrationList } from './components/registration-list';

/* --- Pages --------------------------------------------------------  */
export { EventSearchPage } from './pages/event-search-page';
export { EventDetailPage } from './pages/event-detail-page';
export { CreateEventPage } from './pages/create-event-page';
export { EditEventPage } from './pages/edit-event-page';
