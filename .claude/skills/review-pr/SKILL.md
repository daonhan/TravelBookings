---
name: review-pr
description: Performs a structured PR review covering security, code quality, architecture consistency, and style. Outputs inline comments, a severity-rated checklist, and a summary with suggested fixes. Use when asked to review a PR, code review, check a pull request, or audit changes for TravelBookings .NET 8 backend or React 18 frontend code.
---

# PR Review

## Quick start

```
/review-pr <PR number or branch>
```

Fetches diff, runs all review dimensions, outputs structured feedback.

## Workflows

### 1. Fetch the diff
- `gh pr diff <number>` or `git diff main...<branch>`
- Note: changed files, service(s) affected, PR description

### 2. Run review dimensions (in parallel)

| Dimension | What to check |
|---|---|
| **Security** | Input validation, auth enforcement, secrets in code, SQL injection, XSS |
| **Code Quality** | Null handling, error paths, test coverage, dead code, logging |
| **Architecture** | Bounded context leakage, Outbox usage, Saga state machine correctness, ACL for Payment |
| **Frontend conventions** | See [REFERENCE.md](REFERENCE.md#frontend) |
| **Style** | Naming, file structure, Clean Architecture layer violations |

### 3. Output format

**Inline comments** — one per issue, cite file + line:
```
src/Services/TravelBooking/Application/Commands/BookTripCommand.cs:42
[HIGH] Direct Service Bus publish bypasses Outbox — use OutboxPublisher instead.
Fix: Replace `_serviceBus.PublishAsync(...)` with `_outbox.AddMessageAsync(...)`.
```

**Severity checklist** at the end:
```
## Review Summary

### 🔴 HIGH (must fix before merge)
- [ ] BookTripCommand.cs:42 — Direct Service Bus publish bypasses Outbox

### 🟡 MEDIUM (should fix)
- [ ] PaymentService.cs:18 — Missing cancellation token propagation

### 🟢 LOW (consider fixing)
- [ ] BookingController.cs:5 — Unused using directive
```

**Overall verdict**: APPROVE / REQUEST CHANGES / COMMENT

### 4. Suggest fixes

For each HIGH/MEDIUM issue, provide a concrete fix snippet, not just a description.

## Severity definitions

| Level | Meaning |
|---|---|
| HIGH | Security risk, data loss, broken contract, pattern violation that will cause bugs |
| MEDIUM | Correctness concern, missing test, tech debt that compounds quickly |
| LOW | Style, naming, minor cleanup |

See [REFERENCE.md](REFERENCE.md) for TravelBookings-specific pattern rules.
