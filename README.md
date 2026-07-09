# Exam Management System

Full Stack Exam Management System for lecturers and students.

## Project Goal

Build a course-ready Exam Management System where:

- Lecturers can create/manage exams, publish, review submissions, and grade.
- Students can log in, view exams, submit answers, and view results/feedback.
- Frontend uses React and connects to a real JWT API (with mock fallback during development).

## Repository Structure

- `client/` - React + Vite frontend (owned by frontend developer)
- `server/` - backend and database (owned by backend developer; do not edit from frontend tasks)
- `docs/` - contracts and integration notes
- `diagrams/` - architecture and ERD diagrams

## Tech Stack

- Frontend: React, Vite, JavaScript
- API integration: custom `ApiService` with JWT bearer token
- Local fallback: `MockApiService` + browser localStorage
- Backend API contract: `docs/api-contract.md`

## Frontend Setup

### 1) Install dependencies

```bash
cd client
npm install
```

### 2) Configure environment

Create `.env` in `client/` (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_API=true
```

- Set `VITE_USE_MOCK_API=true` to use local mock data.
- Set `VITE_USE_MOCK_API=false` to use real backend API endpoints.

### 3) Run frontend

```bash
cd client
npm run dev
```

Frontend default dev URL: `http://localhost:5173`

## API Integration Notes

- Base API URL comes from `VITE_API_URL` (default: `http://localhost:3000`).
- JWT token is stored via `StorageService` and attached as:
  `Authorization: Bearer <token>`
- API contract source of truth: `docs/api-contract.md`
- Role mapping is aligned as:
  - frontend `teacher` <-> API `teacher`
  - frontend `student` <-> API `student`

## Current Frontend Progress

### Completed

- [x] API client layer (`ApiService`) with consistent error handling
- [x] Auth wired to API (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`)
- [x] Exam service wired to API (`/api/exams/*`) with mock fallback
- [x] Submission service wired to API (`/api/submissions/*`) with mock fallback
- [x] Teacher submissions review page (`/teacher/exam-submissions/:id`)
- [x] Question type selector in `ExamForm` (`MULTIPLE_CHOICE`, `OPEN_ENDED`)
- [x] `TakeExamPage` question-type rendering + countdown timer

### Remaining / In Progress

- [ ] Manual grading + feedback UI for open-ended answers
- [ ] Show lecturer feedback in student results page
- [ ] Unified loading and error states across all API pages
- [ ] Restore/create `docs/frontend-integration.md`
- [ ] Add `diagrams/` mermaid architecture and ERD

## Demo Accounts

Demo accounts depend on backend seed data when API mode is enabled.

- If using mock mode, register accounts directly from the app.
- If using API mode, use backend-provided seeded users (see backend/docs).

## Git Workflow

- Base branch: `dev`
- Create one feature branch per feature:
  - `feature/frontend-<task>`
- Open small PRs to `dev` (not `main`)
- Keep commits focused and reviewable (one feature per commit)

## Deployment (Later)

- Frontend can be deployed to Vercel/Netlify after API is ready.
- Set `VITE_API_URL` to production backend URL.
- Docker setup is not part of current frontend phase.