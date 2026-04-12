# Editing Guidelines

## Content Rules

- All documentation content is Markdown with embedded Mermaid diagrams
- When editing diagrams, keep them consistent with the architecture described in the surrounding text
- Maintain consistency across document versions when updating architectural decisions

## Project Constraints

- **Team:** 5 backend engineers + frontend and DevOps resources
- **Phase 1 timeline:** 9 months, May 2026 – January 2027
- Respect these constraints when suggesting modifications

## Migration Timeline (Phase 1)

| Milestone | Period | Focus |
|---|---|---|
| **MS1 — Foundation** | May–Jun 2026 | IaC, CI/CD, APIM facade, observability, shared libraries |
| **MS2 — Reporting** | Jul–Aug 2026 | First service extraction (read-only, lowest risk) |
| **MS3 — Events + Notifications** | Aug–Oct 2026 | Event-driven messaging backbone |
| **MS4 — Travel Booking** | Nov 2026–Jan 2027 | Saga orchestrator, core booking workflow |
| **MS5 — Payment + Stabilization** | Dec 2026–Jan 2027 | Payment isolation, end-to-end testing, hardening |
