# Project Milestones

Phases below are reconstructed from Git history on this repository (`git log`) and from the current project layout. They are not formal sprint names from an external plan.

Branch practice is documented in the root README (**Git Workflow**): base branch `dev`, feature branches, PRs into `dev`.

## Phase A — Frontend mock foundation

**Evidence (approx. 2026-05-21 – 2026-05-26):** commits such as placeholder pages, mock data entities, generic client services, authentication flow, routing, role-based navigation, teacher exam pages, exam status management, student exam flow, student results page, UI consistency, `project_explanation.txt`, and early text diagrams under `diagrams/`.

**Outcome visible in repo:** React client with mock/localStorage-oriented services and pages under `client/`.

## Phase B — Backend foundation

**Evidence (2026-06-09 – 2026-07-08):** commits such as adding a server package and configuring Supabase database connection / protecting env secrets.

**Outcome visible in repo:** Path toward a real Postgres-backed API (later reorganized; see Phase D).

## Phase C — Full-stack API integration

**Evidence (cluster dated 2026-07-09):** commits/PRs covering API contract (`docs/api-contract.md`), schema alignment, JWT `ApiService`, auth register/login and JWT middleware, exams CRUD/status/student available routes, submissions submit/auto-grade and teacher grading, frontend wiring for auth/exams/submissions/grading/feedback/loading states, `docs/frontend-integration.md`, and Mermaid architecture/ERD under `diagrams/`.

**Outcome visible in repo:** Client ↔ JWT API contract and related docs/diagrams.

## Phase D — Microservices, Docker, deployment, publish-results

**Evidence (cluster dated 2026-07-17):** commits/PRs for stopping tracked `node_modules`, Docker Compose, splitting the API into gateway + auth/exams/submissions, moving DB scripts to `tools/database`, Safari CSS fix, live Vercel/Render URLs in the README, and publishing exam results separately from grading (`results_published` / publish-results).

**Outcome visible in repo:** Current layout — `client/`, `services/` (gateway, auth, exams, submissions), `packages/common/`, `tools/database/`, `docker-compose.yml`, deployment notes in the root README.
