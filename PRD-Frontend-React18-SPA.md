# PRD: TravelBookings Frontend — React 18 SPA

## Problem Statement

The TravelBookings platform currently serves ~40,000 internal employees through a legacy .NET Framework monolithic application. The frontend is tightly coupled to the monolith's server-rendered views, creating:

1. **Deployment bottleneck** — UI changes require full monolith redeployment. A CSS fix risks all 5 bounded contexts.
2. **No real-time capability** — users must manually refresh to see booking/payment status changes; incompatible with the new event-driven backend using saga orchestration and eventual consistency.
3. **No optimistic UI** — the legacy UI cannot show provisional states or saga progress (Requested → InventoryReserved → PaymentProcessing → Confirmed). Users see nothing until the full saga completes.
4. **Strangler Fig gap** — backend routes through APIM, but the legacy UI bypasses it entirely, breaking the end-to-end migration facade.
5. **Accessibility debt** — legacy UI does not meet WCAG 2.1 AA standards. With 40,000 users, accessibility compliance is required.
6. **No feature flag integration** — cannot participate in canary releases (5% → 25% → 100%), making progressive screen migration impossible.
7. **Blocks micro-frontends path** — no modern SPA foundation for Phase 2 Module Federation decomposition.

## Solution

Build a React 18 Single Page Application deployed to Azure Front Door (CDN + WAF), routing all API calls through Azure API Management. The SPA is intentionally monolithic in Phase 1 (not micro-frontends) to match the 5-engineer team's capacity over 9 months. The codebase is structured as feature-sliced modules aligned to bounded contexts, enabling future Module Federation extraction.

Key characteristics:
- **Single deployment unit** on Azure Front Door CDN with blue/green slots and canary releases
- **APIM-first API access** — all backend calls route through `/api/bookings/*`, `/api/events/*`, `/api/payments/*`, `/api/reports/*`, `/api/legacy/*`
- **SignalR integration** for real-time domain event push (BookingConfirmed, PaymentProcessed, etc.)
- **Optimistic UI** for saga-orchestrated write operations (show "Requested" immediately, transition states via SignalR)
- **Feature flags** via Azure App Configuration for per-screen progressive rollout
- **CorrelationId propagation** via W3C Trace Context headers on every API call
- **Standard error envelope handling** (`{ "error": { "code", "message", "traceId" } }`)
- **WCAG 2.1 AA** accessibility compliance

## User Stories

### Travel Booking (1-12)

1. As a traveler, I want to search for available travel options by destination, date range, and travel class, so that I can find suitable bookings for my trip.
2. As a traveler, I want to create a new booking with one or more itinerary legs (origin, destination, departure date, return date, travel class), so that I can reserve travel for myself and my passengers.
3. As a traveler, I want to add multiple passengers (first name, last name, date of birth) to a booking, so that I can book group travel in a single transaction.
4. As a traveler, I want to see the real-time saga status of my booking (Requested, InventoryReserved, PaymentProcessing, Confirmed, or Failed) update live via SignalR without refreshing, so that I understand exactly where my booking stands.
5. As a traveler, I want to see an optimistic "Booking Requested" confirmation immediately after submission (before the saga completes), with a clear visual indicator that processing is in progress, so that I am not left waiting on a spinner for 10-30 seconds.
6. As a traveler, I want to cancel an existing booking with a reason, and see the cancellation status update in real-time (including refund information from the BookingCancelled event), so that I can manage my travel plans.
7. As a traveler, I want to view a paginated list of my bookings with search/filter capabilities (by destination, date range, status), so that I can quickly find specific bookings.
8. As a traveler, I want to view a detailed itinerary for a confirmed booking showing all legs, passengers, amounts, and payment reference, so that I have a complete record.
9. As a traveler, I want to receive an in-app notification (via SignalR) when my booking is confirmed or fails, even if I have navigated away from the booking page, so that I am always aware of booking outcomes.
10. As a traveler, I want to see a clear error state when my booking fails due to inventory unavailability or payment failure, with saga compensation details (e.g., "Inventory released, payment refunded"), so that I understand what happened and can retry.
11. As a traveler, I want to see a "provisional booking" state when the Payment Service circuit breaker is open, with an explanation that payment will be processed when the service recovers, so that I understand my booking is not lost.
12. As a travel coordinator, I want to search all bookings across all users (with appropriate role-based access), so that I can manage travel on behalf of my team.

### Event Management (13-25)

13. As an event organizer, I want to create a new event with title, description, venue, city, country, start/end dates, capacity, and categories, so that I can set up events for the organization.
14. As an event organizer, I want to edit an existing event's details (title, description, venue, dates, capacity), so that I can update event information as plans evolve.
15. As an event organizer, I want to cancel an event with a reason, triggering notifications to all registered attendees, so that participants are informed promptly.
16. As an event organizer, I want to manage event sessions within an event (add/edit/remove sessions with title, speaker, time, and per-session capacity), so that I can structure multi-session events.
17. As an event organizer, I want to view a real-time attendee list for my event showing registration status, type, and date, so that I can track participation.
18. As an event organizer, I want to see a live capacity tracker (registrations vs. total capacity) updating via SignalR when AttendeeRegistered events arrive, so that I know when an event is approaching capacity.
19. As an event organizer, I want to search and filter events I organize by title, location, date range, and status (Draft, Published, InProgress, Completed, Cancelled), so that I can manage my events.
20. As an employee, I want to browse published events by title, location, date range, and category, so that I can discover events relevant to me.
21. As an employee, I want to register for an event, specifying my registration type, and receive immediate visual confirmation with a SignalR-driven status update, so that I know my registration is confirmed.
22. As an employee, I want to see a calendar view of events I am registered for, so that I can plan my schedule.
23. As an employee, I want to view the detail page of an event showing description, venue, sessions, available capacity, and my registration status, so that I have all relevant information.
24. As an event organizer, I want to receive a real-time notification when the EventCreated event is published, confirming my event is live in the system.
25. As an event organizer, I want to export an attendee list for an event as CSV, so that I can share it with venue coordinators.

### Payments (26-33)

26. As a user, I want to view my payment history as a paginated list showing amount, currency, method, status (Pending, Processing, Completed, Failed, Refunded, PartiallyRefunded), gateway transaction ID, and timestamps, so that I have a complete financial record.
27. As a user, I want to view a single payment's full detail including all associated transactions (charges, refunds) with their gateway references, so that I can audit individual payments.
28. As a user, I want to see a real-time status update via SignalR when my payment transitions (PaymentProcessed or PaymentFailed domain event), so that I am immediately informed.
29. As a finance administrator, I want to initiate a refund on a completed payment by specifying refund amount and reason, and see the status update, so that I can process refund requests.
30. As a finance administrator, I want to view all payments across users with filtering by user, status, date range, and amount range, so that I can perform financial reconciliation.
31. As a user, I want to see a clear "Payment Pending" indicator on bookings created while the Payment Service circuit breaker was open, with an explanation that payment will be processed automatically, so that I understand the provisional state.
32. As a finance administrator, I want to see the payment method (credit card, invoice, digital wallet) for each transaction, so that I can categorize and reconcile payments.
33. As a user, I want to see the linked booking for each payment (navigable to the booking detail page), so that I can trace payments to their associated travel or event.

### Reporting & Analytics (34-42)

34. As a manager, I want to view a dashboard showing total bookings, total events, total revenue, recent bookings, and upcoming events, so that I have an at-a-glance operational overview.
35. As a manager, I want to view a revenue report for a configurable date range showing total revenue, transaction count, and line item breakdown, so that I can analyze financial performance.
36. As a manager, I want to view a paginated booking summary report showing booking ID, user, destination, travel date, amount, status, and cancellation date, so that I can analyze booking patterns.
37. As a manager, I want dashboard metrics to update in near-real-time (via periodic polling or SignalR) as new BookingConfirmed and PaymentProcessed events flow through, so that the dashboard reflects current state.
38. As a manager, I want to export report data as CSV or Excel, so that I can perform further analysis in external tools.
39. As a manager, I want to filter dashboard data by date range, status, destination, or user, so that I can drill into specific segments.
40. As a manager, I want to see trend charts (bookings over time, revenue over time), so that I can identify patterns and anomalies visually.
41. As an analyst, I want to save report filter configurations as named "saved views", so that I can quickly access frequently used report configurations.
42. As a manager, I want to see event attendance summary data (registrations per event, fill rate) alongside booking data, so that I get a holistic operational view.

### Notifications (43-51)

43. As a user, I want to see a notification center (bell icon with unread count badge) in the application header, showing recent notifications in a dropdown panel, so that I stay informed without navigating away.
44. As a user, I want to receive real-time in-app notifications via SignalR when domain events relevant to me occur (BookingConfirmed, BookingCancelled, PaymentProcessed, PaymentFailed, EventCreated, AttendeeRegistered), so that I am immediately aware of important changes.
45. As a user, I want to view a full notification history page with pagination and filtering by type and read/unread status, so that I can review past notifications.
46. As a user, I want to mark individual notifications as read, or mark all as read with a single action, so that I can manage my notification inbox.
47. As a user, I want to configure notification preferences (enable/disable each channel: Email, SMS, Push; set preferred channel; update contact details), so that I receive notifications through preferred channels.
48. As a user, I want to click on a notification to navigate directly to the relevant entity (e.g., booking detail, event detail), so that I can quickly act on notifications.
49. As a user, I want toast/snackbar pop-ups to appear briefly (3-5 seconds) when a real-time notification arrives, clickable to navigate to the relevant entity, so that I am notified without disruption.
50. As a user, I want to see notification delivery status (sent, delivered, failed) and any error message, so that I can troubleshoot communication issues.
51. As a user, I want my notification preferences to persist across sessions and devices, so that I only configure them once.

### Authentication & Authorization (52-56)

52. As a user, I want to log in via the organization's OAuth2/OIDC identity provider (Azure AD) with single sign-on, so that I do not need a separate password.
53. As a user, I want my JWT access token to be automatically refreshed before expiration, so that I am not unexpectedly logged out during an active session.
54. As a user, I want to see a role-appropriate navigation menu (traveler sees bookings/events; organizer sees event management; finance admin sees payments/reports; manager sees dashboards), so that I only see features relevant to my role.
55. As the system, I want all API requests to include the JWT bearer token in the Authorization header and a W3C Trace Context `traceparent` header with a CorrelationId, so that every frontend action is authenticated and traceable.
56. As a user, I want to be redirected to a login page when my session expires, with a message explaining why, and be returned to my previous page after re-authentication, so that session expiration is minimally disruptive.

### Search & Navigation (57-60)

57. As a user, I want a global search bar that searches across bookings, events, and payments simultaneously, returning results grouped by entity type with direct links, so that I can quickly find any entity.
58. As a user, I want breadcrumb navigation on all detail and sub-pages, so that I always understand my location in the hierarchy and can navigate back efficiently.
59. As a user, I want the application URL to reflect my current view (deep linking), so that I can bookmark pages, share URLs with colleagues, and use browser back/forward navigation.
60. As a user, I want keyboard navigation shortcuts (Ctrl+K for global search, Escape to close modals) and full keyboard-only operability, so that I can work efficiently without a mouse.

### Error Handling & Resilience (61-67)

61. As a user, I want to see a user-friendly error message when an API call fails, with the traceId from the error envelope displayed (or copyable) so that I can report the issue to support with a traceable reference.
62. As a user, I want failed API calls to be automatically retried (with exponential backoff) for transient errors (5xx, network timeouts), so that temporary issues do not result in user-visible errors.
63. As a user, I want to see a clear "Service Temporarily Unavailable" banner when the frontend detects that a backend service is degraded (e.g., repeated 503s from `/api/payments/*`), indicating which functionality is affected, so that I understand which parts are available.
64. As a user, I want to see a loading skeleton (not a spinner) while data is being fetched, so that the page structure is visible immediately and feels fast.
65. As a user, I want to see an empty state illustration and message (not a blank page) when a list or search returns no results, so that I understand the query succeeded but found nothing.
66. As a user, I want form validation errors to appear inline next to the relevant field (not in a top-of-page banner), with clear messages, so that I can correct errors efficiently.
67. As a user, I want an application-wide error boundary that catches unhandled JavaScript errors and shows a recovery page with a "Reload" button and option to report the error (including correlationId), rather than a blank white screen.

### Accessibility & Performance (68-73)

68. As a user with a screen reader, I want all interactive elements to have appropriate ARIA labels, roles, and live regions (especially for real-time SignalR updates and toast notifications), so that the application is fully usable with assistive technology.
69. As a user, I want the application to meet WCAG 2.1 AA contrast ratios, focus indicators, and text sizing requirements, so that the application is visually accessible.
70. As a user on a slow network, I want the initial page load to complete within 3 seconds on 4G (LCP < 2.5s, FID < 100ms, CLS < 0.1), so that the application feels responsive.
71. As a user, I want route-based code splitting so that I only download JavaScript for the bounded context I am currently using, so that initial load is fast.
72. As a user, I want data tables (bookings, events, payments, notifications) to support virtual scrolling for large result sets, so that the UI remains performant with hundreds of rows.
73. As a user with limited vision, I want a high-contrast theme option and the ability to increase base font size, so that I can customize the UI for my needs.

### Feature Flags & Legacy Coexistence (74-78)

74. As the system, I want individual UI screens to be controlled by feature flags from Azure App Configuration, so that new screens can be rolled out progressively (5% → 25% → 100%) alongside the legacy UI.
75. As a user, I want to be seamlessly redirected to the legacy UI for screens that have not yet been migrated to the new SPA (via `/api/legacy/*` routing), so that there is no functionality gap during migration.
76. As the system, I want feature flag values to be cached locally and refreshed every 30 seconds, so that flag checks do not add latency to page renders.
77. As a developer, I want feature flags to be injectable as React hooks (`useFeatureFlag('booking-v2')`), so that flag-gated rendering is simple and consistent.
78. As a user, I want the transition between legacy and new UI screens to preserve my authentication state and navigation context, so that switching between old and new feels seamless.

## Implementation Decisions

### Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript 5.x | Already decided; strict TypeScript for type safety across 5 engineers |
| Build tool | Vite 6 | Fast HMR, native ESM, tree-shaking, Module Federation plugin path for Phase 2 |
| Server state | TanStack Query | Caching, deduplication, retry, optimistic updates for all API calls |
| Client state | Zustand | Lightweight UI-only state (sidebar, theme, notification drawer) |
| Routing | TanStack Router | Type-safe routing, file-based routes, built-in code splitting, loader patterns |
| Forms | React Hook Form + Zod | Performant uncontrolled forms; Zod schemas align with OpenAPI-generated types |
| UI primitives | Radix UI + Tailwind CSS 4 | Unstyled accessible primitives + rapid consistent styling = TravelBookings Design System |
| API client | OpenAPI-generated (orval) | Spec-first type alignment with backend OpenAPI 3.0 specs |
| Real-time | @microsoft/signalr | Azure SignalR Service client with auto-reconnection |
| Testing | Vitest + Testing Library + Playwright | Unit/component/E2E coverage |
| Observability | @microsoft/applicationinsights-web | Browser SDK, W3C Trace Context propagation |
| Feature flags | Azure App Configuration | 30-second cache refresh, user targeting via userId claim |
| i18n | react-i18next | English-only Phase 1, all strings extracted for future localization |
| Charts | Tremor (wraps Recharts) | Enterprise dashboard components |
| Dates | date-fns | Tree-shakeable, timezone-aware display of UTC timestamps |

### Major Modules

**10 deep modules with simple interfaces:**

1. **Design System** (`shared/ui/`) — Radix UI + Tailwind CSS component library: Button, Input, Select, DatePicker, DataTable (virtual scroll, sort, filter, paginate), Modal/Dialog, Toast/Snackbar, Skeleton loaders, Empty states, Badge, Card, Tabs, Breadcrumb, Avatar, Dropdown, Sidebar, Header, ErrorBoundary. All WCAG 2.1 AA compliant.

2. **Auth Module** (`shared/auth/`) — MSAL.js for Azure AD OAuth2/OIDC. Interface: `<AuthProvider>`, `useAuth()` hook (user, roles, login, logout, token), `<RequireRole>` guard, `<RequireAuth>` wrapper. Deep: silent token acquisition, auto-refresh, session expiry detection, return-URL preservation.

3. **API Client Layer** (`shared/api/`) — OpenAPI-generated TypeScript functions per endpoint (e.g., `bookingsApi.create(command)`). Deep: JWT bearer injection, W3C `traceparent` header with CorrelationId, retry with exponential backoff (3 retries: 1s/2s/4s), standard error envelope parsing, request logging to Application Insights.

4. **Real-Time Event Hub** (`shared/realtime/`) — Interface: `<SignalRProvider>`, `useSignalREvent<T>(eventType, callback)`, `useConnectionStatus()`. Deep: hub lifecycle (connect/reconnect/disconnect), domain event deserialization matching backend IntegrationEvent schema, TanStack Query cache invalidation on events, toast triggering, fallback to polling if connection fails.

5. **Routing & Navigation** (`app/router.ts`) — TanStack Router with lazy routes per bounded context. Route guards check feature flags and user roles. Loaders prefetch data. Routes: `/` (dashboard), `/bookings/*`, `/events/*`, `/payments/*`, `/reports/*`, `/notifications/*`, `/settings/*`, `/legacy/*`.

6. **Form System** — React Hook Form + Zod per bounded context. Key forms: CreateBookingForm (multi-step), CreateEventForm, EditEventForm, RegisterAttendeeForm, RefundPaymentForm, NotificationPreferencesForm, SearchFilterForms. All with inline validation, dirty-state tracking, unsaved-changes prompts.

7. **Error Handling** (`shared/`) — Route-level and widget-level error boundaries. `<ServiceDegradedBanner>` for circuit breaker detection. TraceId extraction and display. Offline detection. "Retry" action wiring.

8. **Feature Flag Module** (`shared/feature-flags/`) — Interface: `useFeatureFlag(name)` → boolean, `<FeatureGate flag="...">`. Deep: Azure App Configuration fetch on init, 30-second background refresh, user targeting via userId, fail-closed for new features.

9. **Observability** (`shared/telemetry/`) — Application Insights browser SDK init, auto page views, auto exception tracking, custom business events (booking created, event registered), dependency tracking with correlationId, source map upload for production stack traces.

10. **Bounded Context UI Modules** (`features/bookings|events|payments|reports|notifications/`) — Each contains routes, pages, components, hooks, types, and colocated tests. No cross-feature imports except shared modules.

### SignalR Event → Frontend Action Mapping

| Domain Event | Frontend Action |
|---|---|
| `BookingConfirmed` | Invalidate `bookingKeys.detail(bookingId)`, update list cache, show toast |
| `BookingCancelled` | Invalidate booking queries, show toast |
| `EventCreated` | Invalidate `eventKeys.lists`, show toast to organizer |
| `AttendeeRegistered` | Invalidate `eventKeys.detail(eventId)` (capacity), show toast |
| `PaymentProcessed` | Invalidate `paymentKeys.detail(paymentId)` + linked booking, show toast |
| `PaymentFailed` | Invalidate payment queries, show error toast |

### Component Architecture

- **Page components** are thin orchestrators: compose layout, fetch data via query hooks, render feature components. No business logic.
- **Feature components** (BookingSagaTracker, EventCapacityGauge, PaymentTimeline) encapsulate domain-specific behavior.
- **UI primitives** come exclusively from the design system.
- **Colocation**: each feature module colocates routes, components, hooks, types, and tests. No cross-feature imports.

### Performance Budgets

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5 seconds |
| First Input Delay (FID) | < 100 ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Initial JS bundle (gzipped) | < 200 KB |
| Per-route chunk (gzipped) | < 80 KB |
| Time to Interactive | < 3.5 seconds on 4G |

### Testing Strategy

- **Unit (Vitest)**: Zod schemas, utilities, state logic. 90% coverage on shared modules.
- **Component (Testing Library + Vitest)**: Design system components tested for accessibility (axe-core) and keyboard navigation. Feature components tested with mocked queries. 80% coverage.
- **Integration (Testing Library + MSW)**: Full page renders with Mock Service Worker. Test user flows: create booking, see saga status, register for event.
- **E2E (Playwright)**: 10-15 critical user journeys against staging. Cross-browser.
- **Contract**: Generated API client types validated against backend OpenAPI specs in CI.
- **Visual regression**: Playwright screenshot comparison for design system components.
- **Accessibility audit**: Automated axe-core scans in CI on every page.

### Accessibility Standards

- WCAG 2.1 Level AA compliance
- All interactive elements keyboard-accessible
- ARIA live regions for real-time updates (SignalR events, toast notifications)
- Focus management on route transitions and modal open/close
- Color-independent information encoding
- Minimum 4.5:1 contrast ratio for text
- Screen reader testing with NVDA and VoiceOver

### Frontend Build Sequencing (aligned with backend Strangler Fig)

1. **Reporting screens first** — lowest risk, read-only, validates full pipeline (APIM → API client → rendering)
2. **Notification center** — establishes SignalR infrastructure used by all other modules
3. **Event management** — first CRUD bounded context
4. **Travel booking** — most complex, saga status tracking, multi-step forms
5. **Payment screens** — last, after Payment ACL is stable

Each screen is feature-flagged. The legacy UI remains default until a screen's flag is enabled for 100% of users.

### Deployment & CI/CD

- Vite build produces static bundle → Azure Blob Storage → Azure Front Door CDN
- Blue/green: new version to staging slot, swap to production after smoke tests
- Canary: Azure Front Door traffic splitting (5% → 25% → 100%)
- CI pipeline: lint (ESLint + Prettier) → type check (`tsc --noEmit`) → unit/component tests → build → bundle size check → accessibility audit (axe-core) → deploy staging → E2E tests (Playwright) → promote production
- Source maps uploaded to Application Insights for production error deobfuscation

### Project Structure

```
src/
  app/                      # App shell: providers, layout, router
    providers/              # Auth, QueryClient, SignalR, FeatureFlag providers
    layout/                 # Shell: header, sidebar, main content
    router.ts               # Route tree definition
  shared/
    ui/                     # Design system (Radix + Tailwind)
    api/                    # API client, interceptors, error types
    auth/                   # MSAL, hooks, guards
    realtime/               # SignalR hub, event hooks
    hooks/                  # Shared custom hooks
    utils/                  # Date formatting, currency, validators
    types/                  # Generated OpenAPI types, shared interfaces
    feature-flags/          # Feature flag hooks and provider
    telemetry/              # Application Insights setup
  features/
    bookings/               # Routes, pages, components, hooks, types, tests
    events/                 # Routes, pages, components, hooks, types, tests
    payments/               # Routes, pages, components, hooks, types, tests
    reports/                # Routes, pages, components, hooks, types, tests
    notifications/          # Routes, pages, components, hooks, types, tests
```

## Out of Scope

1. **Micro-frontends / Module Federation** — Phase 1 is a monolithic SPA. Feature-sliced architecture prepares for Phase 2 extraction but does not implement it.
2. **Mobile applications** — web SPA only.
3. **Offline-first / PWA** — graceful network error handling, but no service workers, IndexedDB caching, or background sync.
4. **Legacy UI rewrite** — screens served by `/api/legacy/*` are not re-implemented. The SPA redirects to legacy for unmigrated screens.
5. **Payment checkout/card-entry UI** — Payment Service is a legacy wrapper (ACL) in Phase 1. Payments are initiated server-side by the booking saga, not by user-facing card entry.
6. **Custom report builder** — Phase 1 provides fixed dashboards and parameterized reports. Drag-and-drop report builder is a future enhancement.
7. **Multi-language translations** — i18n infrastructure in place (react-i18next, extracted strings), but only English locale files created.
8. **RTL layout support** — deferred to Phase 2 alongside multi-language.
9. **System admin panel** — APIM, Service Bus, feature flags managed via Azure Portal.
10. **User management / provisioning** — managed in Azure AD; SPA reads identity and roles from JWT only.
11. **Manual WCAG accessibility audit** — automated axe-core in CI; specialist audit contracted separately.
12. **Frontend load testing** — bundle budgets and Core Web Vitals defined, but simulating 40,000 concurrent CDN users is an infrastructure concern.

## Further Notes

### Team Allocation (5 engineers, 9 months)

- **Months 1-3**: 1 engineer owns shared infrastructure (design system, auth, API client, SignalR, feature flags, observability). 4 engineers begin reporting screens (lowest risk, validates pipeline).
- **Months 3-9**: All 5 engineers on bounded context features, following the build sequencing order. Shared infrastructure engineer transitions to feature work.

### Key Risk: Backend API Readiness

The frontend depends on APIs behind APIM. The Strangler Fig facade means the frontend doesn't need to know whether a request is served by the new microservice or the monolith — it just calls APIM endpoints. Mock Service Worker (MSW) enables frontend development to proceed before backend APIs are ready.

### Key Risk: SignalR Hub

Not yet defined in backend. The frontend needs a SignalR hub (e.g., `/hubs/events`) with JWT auth and user-context-filtered event push. The Real-Time Event Hub module should gracefully degrade to TanStack Query `refetchInterval` polling if SignalR connection fails.

### Phase 2 Migration Path

The feature-sliced structure (`features/bookings/`, `features/events/`, etc.) is aligned to bounded contexts so each can be extracted to an independent Module Federation remote. The shared design system becomes a shared Module Federation remote consumed by all micro-frontends.

### Strangler Fig Frontend Sequencing

Each new screen is feature-flagged independently. The legacy UI remains the default for any screen until its feature flag is enabled for 100% of users. This allows:
- Rolling back individual screens without affecting others
- A/B testing new vs. legacy screens
- Gradual user migration with real usage metrics before full cutover
