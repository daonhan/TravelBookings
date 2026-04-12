# TravelBookings PR Review Reference

## Backend (.NET 8)

### Clean Architecture layers
Each service: `API` → `Application` → `Domain` → `Infrastructure`
- **Violation**: Domain referencing Infrastructure types (e.g., EF entities leaking into domain)
- **Violation**: Application layer calling `DbContext` directly (must go through repository interface)

### Transactional Outbox (HIGH if violated)
All Service Bus publishes MUST go through the Outbox — never publish directly.
```csharp
// WRONG
await _serviceBus.PublishAsync(new BookingConfirmedEvent(...));

// CORRECT
await _outbox.AddMessageAsync(new BookingConfirmedEvent(...));
```

### Saga Orchestration (MassTransit State Machine)
- State transitions must be idempotent
- Compensating transactions required for every forward step
- Saga state must be persisted before sending commands
- Flag missing compensation steps as HIGH

### Bounded Context rules
- Services must NOT share databases or domain models
- Cross-service data access must go through published events or API calls
- Payment Service uses ACL (Anti-Corruption Layer) — flag any direct domain coupling to legacy system as HIGH

### CQRS
- Write services: TravelBooking, EventManagement, Payment
- Read service: Reporting (no writes, read model only)
- Flag write operations in Reporting Service as HIGH

### Error envelope compliance (HIGH if violated)
All API errors must use this envelope:
```json
{ "error": { "code": "VALIDATION_ERROR|NOT_FOUND|CONFLICT|INTERNAL_ERROR", "message": "...", "traceId": "..." } }
```
Flag any controller returning raw exceptions, custom error shapes, or missing `traceId`.

### Observability
- Serilog structured logging — no `Console.WriteLine`, no string interpolation in log calls
- Application Insights correlation — `Activity`/`ILogger` must carry trace context
- Missing log on exception boundary = MEDIUM

### General .NET patterns
- Always propagate `CancellationToken` through async call chains (missing = MEDIUM)
- No `async void` except event handlers
- EF queries: use `.AsNoTracking()` for read-only paths
- No raw SQL strings — use parameterized queries or EF (SQL injection = HIGH)

---

## Frontend (React 18 + TypeScript)

### State management
- **Server state**: TanStack Query only — no manual `fetch` stored in Zustand/useState
- **Client state**: Zustand for global UI state, `useState` for local component state
- Flag mixing these (e.g., storing API responses in Zustand) as MEDIUM

### Type conventions
- Use **union types** for enums, not TypeScript `enum` (backend serializes as strings)
```ts
// WRONG
enum BookingStatus { Confirmed = 'CONFIRMED' }

// CORRECT
type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED'
```

### API client
- Hand-written API client — no OpenAPI codegen, no auto-generated types
- Check responses are typed against the error envelope shape
- Flag any raw `fetch`/`axios` calls outside the API client layer as MEDIUM

### Routing
- TanStack Router, programmatic route definitions in `src/app/router.tsx`
- No file-based routing (TanStack Router Vite plugin was removed)
- Flag any attempts to add file-based routes as HIGH

### Dates
- Keep as ISO strings internally, format at render time with `date-fns`
- Flag `new Date()` stored in state or sent to API as MEDIUM

### SignalR
- Must include graceful fallback to polling when hub is unavailable
- Flag missing fallback as MEDIUM

### Feature flags
- Fail-closed: unknown flag = `false` = legacy UI
- Flag any `unknown flag → true` logic as HIGH

### Path aliases
- Use `@/` for imports from `src/` — flag relative imports that escape the feature module as LOW

### Testing
- Vitest + Testing Library for unit/component tests
- MSW v2 for API mocking in tests
- Playwright for E2E
- Flag tests that mock internals (instead of using MSW) as MEDIUM

---

## Security checklist (all PRs)

- [ ] No secrets, tokens, or connection strings in source
- [ ] User input validated at API boundary (FluentValidation or Zod)
- [ ] Authorization attributes present on new endpoints
- [ ] No `[AllowAnonymous]` added without explicit justification in PR description
- [ ] No direct object references without ownership check
- [ ] CORS not widened without justification
- [ ] Dependencies added: check for known vulnerabilities (`dotnet list package --vulnerable` / `npm audit`)
