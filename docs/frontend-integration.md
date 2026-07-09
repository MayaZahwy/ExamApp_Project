# Frontend Integration Guide

This document describes how the React frontend in `client/` integrates with the Exam Management API.

## Scope

- Frontend only (`client/`)
- API contract reference: `docs/api-contract.md`
- Backend implementation is owned separately under `server/`

## Environment Configuration

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_API=true
```

- `VITE_API_URL`: Base URL for API requests.
- `VITE_USE_MOCK_API`:
  - `true`: use `MockApiService` + localStorage
  - `false`: call real backend endpoints via `ApiService`

## Runtime Modes

## Mock Mode (`VITE_USE_MOCK_API=true`)

- Uses seeded mock collections in `MockApiService`.
- Persists updates in browser localStorage (with `StorageService` key prefix).
- Useful for UI development when backend is unavailable.

## API Mode (`VITE_USE_MOCK_API=false`)

- Uses HTTP requests through `ApiService`.
- Authenticated endpoints include bearer token from local storage automatically.
- Backend API must be available and aligned with `docs/api-contract.md`.

## JWT and Session Flow

## Storage keys

- `authToken`: JWT token returned from auth endpoints.
- `currentUser`: safe user object used by route guards/navigation.

## Login/Register

- `AuthService.login()` -> `POST /api/auth/login`
- `AuthService.register()` -> `POST /api/auth/register`
- On success, store both `authToken` and `currentUser`.

## Restore session

- `AuthService.restoreSession()` runs on app bootstrap.
- If token exists, calls `GET /api/auth/me`.
- On success: refreshes `currentUser`.
- On failure: clears token and user.

## Logout

- Clears both `authToken` and `currentUser`.

## Role Mapping

Frontend and API are aligned:

- `teacher` <-> `teacher`
- `student` <-> `student`

Routing access control is based on these frontend role strings.

## Service to Endpoint Mapping

## AuthService

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

## ExamService

- `GET /api/exams/mine`
- `GET /api/exams/:id`
- `POST /api/exams`
- `PUT /api/exams/:id`
- `PATCH /api/exams/:id/status`
- `GET /api/exams/available`
- `GET /api/exams/available/:id`

## SubmissionService

- `POST /api/submissions`
- `GET /api/submissions/mine`
- `GET /api/exams/:examId/submissions`
- `GET /api/submissions/:id`
- `PATCH /api/submissions/:id/grade`

## Error Handling Conventions

- `ApiService` throws `Error` with:
  - `message` resolved from API payload (`error` or `message`) or fallback status text
  - `status`
  - `payload`
- Pages render inline loading/error states for initial API fetches.
- Action failures (submit/save/grade/status change) use `notifyService.error`.

## Integrated Frontend Features

- API client layer with bearer auth support
- Auth endpoints integration and session restore
- Teacher and student exam APIs
- Submission APIs for student submit/results and teacher review
- Teacher manual grading + feedback UI
- Student results feedback display
- Loading and error states on API-backed pages
- Question type support (`MULTIPLE_CHOICE`, `OPEN_ENDED`)
- Student exam timer and auto-submit on timeout

## Blockers and Dependencies

- API mode requires backend server to be running and reachable at `VITE_API_URL`.
- Contract mismatches should be reconciled in `docs/api-contract.md`.
- If backend endpoint group is unavailable, keep `VITE_USE_MOCK_API=true` until ready.

## Verification Checklist

- [ ] `npm install` and `npm run dev` succeed in `client/`
- [ ] Mock mode works (`VITE_USE_MOCK_API=true`)
- [ ] API mode works (`VITE_USE_MOCK_API=false`)
- [ ] Login/register returns token and routes correctly by role
- [ ] Teacher can create/edit/publish exams
- [ ] Student can view/take/submit exams
- [ ] Teacher can review and manually grade open-ended answers
- [ ] Student can see score and lecturer feedback
