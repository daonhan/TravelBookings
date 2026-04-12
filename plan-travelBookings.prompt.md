# TravelBookings Phase 1 Completion Plan

**Date**: April 1, 2026 | **Phase 1 Timeline**: May 2026 – Jan 2027 (9 months)
**Team**: 5 backend engineers + frontend support
**Current State**: ~60% code implemented, 0% infrastructure/deployment

---

## TL;DR

Complete the monolith-to-microservices modernization across 6 phases. The code foundation is solid (~60%) but critical gaps exist in event consumers, notification senders, infrastructure-as-code, CI/CD pipelines, and testing.

---

## Phase 0: Foundation & Infrastructure (Months 1–2)

1. **IaC (Bicep)** — Provision Azure SQL (5 DBs), Service Bus, App Services, Front Door, APIM, SignalR, Key Vault, App Configuration. Create `infra/` directory with modular templates + env parameter files. *No dependencies — start Day 1.*
2. **CI/CD Pipelines** — Azure DevOps YAML: build → test → staging → smoke → prod (blue/green swap) per service + frontend. Create `pipelines/` directory. *Depends on #1.*
3. **APIM Configuration** — Policy XML for rate limiting, JWT validation, CORS, versioning. Route definitions per service + legacy fallback. Create `infra/apim/`. *Parallel with #2.*
4. **Docker & Local Dev** — Dockerfiles per service (multi-stage), `docker-compose.yml` (5 services + SQL + RabbitMQ + Azurite), `appsettings.Development.json`. *Parallel with #2–3.*
5. **Database Migrations** — Audit EF migrations, create initial scripts + seed data per service. *Parallel with #2–4.*

---

## Phase 1: Backend Service Completion (Months 2–5)

6. **Notification Service — CRITICAL** — Currently has domain model + preferences but **NO senders or consumers**. Implement `IEmailSender` (SendGrid), `ISmsSender` (Twilio), `IPushNotificationSender` (SignalR), template engine (Scriban), and 6 event consumers (`BookingConfirmedConsumer`, `BookingCancelledConsumer`, `EventCreatedConsumer`, `AttendeeRegisteredConsumer`, `PaymentProcessedConsumer`, `PaymentFailedConsumer`). Files: `src/Services/Notification/Notification.Infrastructure/`, `src/Services/Notification/Notification.Application/`. *Depends on #1.*
7. **Payment Service — Complete ACL** — Replace mock processor with configurable gateway adapter, implement idempotency keys, actual refund workflow, reconciliation job, webhook handler. Files: `src/Services/Payment/Payment.Infrastructure/`, `src/Services/Payment/Payment.Application/`. *Parallel with #6.*
8. **Reporting Service — Fill Projectors** — Complete `BookingConfirmedProjector`, `BookingCancelledProjector`, `EventCreatedProjector`, `PaymentProcessedProjector` logic. Add CDC-based data sync, scheduled report generation, CSV/PDF export. Files: `src/Services/Reporting/Reporting.Infrastructure/`. *Parallel with #6–7.*
9. **EventManagement — Polish** — Add cancellation compensation, capacity management, session workflows, waitlist. *Parallel with #6–8.*
10. **TravelBooking — Hardening** — Complete compensation validation, allocation management, search caching, concurrent booking detection. *Parallel with #6–9.*

---

## Phase 2: Event-Driven Architecture Completion (Months 3–5)

11. **Idempotency Framework** — Create `ProcessedEvents` table + `IdempotencyFilter` MassTransit middleware across all 5 services. Check eventId before processing, store after success. *Depends on #5.*
12. **Dead-Letter Queue Processing** — Azure Function DLQ processor per topic. Classify: transient (re-enqueue) vs. poison (alert + store). Wire `DeadLetteredMessageCount > 0` alerts. Create `src/Functions/DlqProcessor/`. *Parallel with #11.*
13. **Service Bus Sessions** — Configure `SessionId` on entity-scoped messages for FIFO ordering per entity. Add stale event detection via timestamp. *Parallel with #11–12.*
14. **SignalR Hub Backend** — Implement server-side SignalR hub publishing on domain events. Use Azure SignalR Service for scale-out. Push: booking status, payment status, event updates, notifications. *Depends on #1.*

---

## Phase 3: Frontend Completion (Months 3–6)

15. **SignalR Connection** — Connect `<SignalRProvider>` to Azure SignalR Service, wire `useSignalREvent<T>()` → TanStack Query cache invalidation, toast notifications, saga tracker live updates. Files: `src/Frontend/src/shared/realtime/`. *Depends on #14.*
16. **Feature Flag Integration** — Wire `useFeatureFlag()` to Azure App Configuration, 30s refresh, route guards, legacy redirect. Files: `src/Frontend/src/shared/feature-flags/`. *Parallel with #15.*
17. **OpenAPI Client Generation** — Set up `orval` for typed API client from backend OpenAPI specs. Replace manual API functions. *Parallel with #15–16.*
18. **Accessibility & Performance** — Run axe-core audit, fix WCAG 2.1 AA violations, implement high-contrast theme, verify Core Web Vitals (LCP < 2.5s), virtual scrolling, bundle optimization (< 200KB gzipped). *Depends on #15–17.*

---

## Phase 4: Testing & Quality (Months 4–7)

19. **Unit Tests (80% coverage)** — Domain entity tests, handler tests, validator tests for all 5 services. *Parallel with Phases 1–3.*
20. **Integration Tests** — `WebApplicationFactory<T>` + Testcontainers per service. Test API endpoints with real DB, MassTransit consumers with in-memory transport, outbox pattern flow. *Depends on Phase 1.*
21. **Saga E2E Tests** — Happy path (Create → Confirmed), compensation paths (PaymentFailed → InventoryReleased → BookingFailed), timeout path. MassTransit test harness. *Depends on #7, #10.*
22. **Contract Tests (Pact)** — Consumer-driven contracts between services, event schema verification. Add to CI. *Parallel with #20–21.*
23. **Frontend E2E (Playwright)** — Complete 10–15 critical journey tests + accessibility tests. Files: `src/Frontend/e2e/`. *Depends on Phase 3.*
24. **Load Testing** — k6 scripts targeting 40K concurrent users, Service Bus throughput, DB connection pool limits. Create `tests/load/`. *Depends on #20–21.*

---

## Phase 5: Production Readiness (Months 7–9)

25. **Security Hardening** — Key Vault for all secrets, CORS/CSP headers, input validation audit, rate limiting, SQL injection audit.
26. **Observability Completion** — App Insights dashboards (p50/p95/p99), Service Bus monitoring (lag, DLQ depth), custom business metrics, alert rules (5xx > 1%, circuit breaker, DLQ > 0).
27. **Resilience Policies (Polly)** — Retry + circuit breaker + bulkhead + timeout on ALL external HTTP calls across services.
28. **Blue/Green Deployment** — App Service slots, swap scripts, canary release via APIM (5% → 25% → 100%), auto-rollback on 5xx spike.
29. **Strangler Fig Cutover** — Progressive APIM route migration: Reporting → Notifications → Events → Travel → Payments. Feature flag per screen. *Depends on #25–28.*
30. **Documentation & Runbooks** — Operational runbooks, OpenAPI in APIM developer portal, ADRs, on-call playbook.

---

## Verification Strategy

1. Hit `/health` on all 5 services — expect 200 with SQL + Service Bus checks
2. POST `/api/bookings` → verify full saga flow → notification sent → reporting updated
3. Deploy to staging slot → smoke tests → swap → verify zero-downtime
4. Simulate 40K users with k6 → p99 < 2s, zero message loss
5. OWASP ZAP scan against APIM → zero critical/high findings
6. axe-core on all pages → zero WCAG 2.1 AA violations
7. Pact contracts pass for all publisher/subscriber pairs
8. Disable feature flag → traffic routes to legacy within 30s

---

## Decisions & Assumptions

- **net9.0**: Code targets net9.0 (not net8.0 per docs) — assume acceptable
- **SignalR**: Recommend Azure SignalR Service with per-service REST publishing (avoids coupling)
- **CDC**: Recommend SQL Server native CDC for Phase 1 simplicity over Debezium
- **Payment gateway**: Interface-based adapter — real gateway TBD (Stripe, Pan Gateway, or legacy)
- **Excluded from Phase 1**: Mobile app, AI features, workforce management, multi-language (English only)

---

## Workstream Ownership (5 Engineers)

| Engineer | Primary Service | Secondary |
|----------|----------------|-----------|
| Eng 1 | TravelBooking | Saga orchestration, Service Bus config |
| Eng 2 | EventManagement | Frontend (events + reporting) |
| Eng 3 | Payment | Security, Key Vault, APIM policies |
| Eng 4 | Reporting | IaC (Bicep), CI/CD, observability |
| Eng 5 | Notification | SignalR hub, DLQ processing, frontend real-time |
