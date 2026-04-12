---
name: migrate-react-to-angular
description: Guides end-to-end migration of a React SPA to Angular, covering codebase analysis, pattern mapping, file-by-file conversion, and validation. Use when user wants to migrate React to Angular, convert a React app, port React components to Angular, or restructure a React codebase into Angular.
---

# Migrate React to Angular

Systematically migrate a React SPA to an Angular application. Works across any repository.

## Workflow

### 1. Analyze the React codebase

Spawn parallel Explore agents to inventory every React pattern in use:

- **Agent A — Dependencies & structure**: Read `package.json`. Catalog React libraries (state, routing, forms, UI, i18n, testing, real-time). Map the directory tree — identify feature modules, shared utilities, barrel exports, path aliases.
- **Agent B — Patterns & edge cases**: Scan for hooks, context providers, HOCs, render props, forwardRef, class components, error boundaries, portals. Count occurrences. Flag complex patterns.
- **Agent C — Build & test**: Inventory build config (Vite/CRA/Next), env vars, proxy settings, test setup (Vitest/Jest, MSW, Playwright/Cypress).

Present a summary table to the user:

| React Pattern | Count | Angular Target | Complexity |
|---|---|---|---|
| Zustand stores | 2 | Signal services | Low |
| TanStack Query hooks | 12 | HttpClient + RxJS | Medium |
| ... | ... | ... | ... |

### 2. Create the migration plan

Produce a phased plan. Each phase is independently buildable:

1. **Scaffold** — `ng new` with standalone components, routing, Tailwind. Configure path aliases, linting, Prettier.
2. **Core infrastructure** — HTTP interceptors (auth, retry, correlation ID, error parsing), auth service, error handler, feature flag service, SignalR service, i18n setup.
3. **Shared UI** — Migrate UI primitives (button, input, card, select, dialog, toast). Keep Tailwind + `cn()`. Replace Radix UI with Angular CDK equivalents.
4. **Feature modules** — One feature at a time. Convert hooks → services/signals, pages → components, forms → Reactive Forms, routes → Angular Router.
5. **Testing** — Migrate per feature. Replace Vitest with Jest, Testing Library with `@testing-library/angular`, MSW with `HttpClientTestingModule`.
6. **Build & deploy** — Remove React dependencies, wire Angular CLI build, update CI/CD.

Ask the user: "Does this phasing work? Should any phase be split or reordered?"

### 3. Execute migration (per file)

For each React file:

1. Read the React source completely
2. Identify patterns used (cross-reference [REFERENCE.md](REFERENCE.md))
3. Generate the Angular equivalent, preserving business logic exactly
4. Generate or update the corresponding test file
5. Run `ng build` and `ng test` to validate
6. Commit the migrated file

Use [REFERENCE.md](REFERENCE.md) for all pattern transformations. Use [EXAMPLES.md](EXAMPLES.md) for complex multi-pattern files.

### 4. Migration order (bottom-up by dependency)

Migrate in this order to avoid forward references:

1. **Types & models** — `shared/types/` (no framework dependency, often copy-paste)
2. **Utilities** — `shared/utils/` (`cn()`, date/currency formatters)
3. **Validation schemas** — `shared/validation/` (Zod schemas reusable as-is)
4. **Core services** — Auth, HTTP interceptors, SignalR, feature flags, i18n
5. **Shared UI components** — Button, Input, Card, DataTable, Modal, Toast, etc.
6. **Feature services** — API service methods (one per feature)
7. **Feature components** — Pages, child components, feature-specific UI
8. **Routing** — `app.routes.ts` + per-feature `routes.ts`
9. **App shell** — Layout, providers → `app.config.ts`, root component
10. **Tests** — Unit tests, then E2E

### 5. Validate the migration

After all features are migrated:

- `ng build --configuration production` — zero errors
- `ng test` — all tests pass
- `ng e2e` (if Playwright retained) — E2E pass
- Route-by-route browser verification: same URLs, same behavior
- Bundle size within 20% of React build
- Remove all React dependencies from `package.json`

Present a migration report: files migrated, tests passing, known gaps.

### 6. Cleanup

- Delete React source files, configs (`vite.config.ts`, React-specific tsconfig entries)
- Remove React/ReactDOM, Vite, TanStack Query/Router, Zustand, Radix UI, React Hook Form from `package.json`
- Update CI/CD scripts (`vite build` → `ng build`, `vitest` → `ng test`)
- Update README with Angular dev instructions

See [REFERENCE.md](REFERENCE.md) for pattern mappings and [EXAMPLES.md](EXAMPLES.md) for complex transformations.
