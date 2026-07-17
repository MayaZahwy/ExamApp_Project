# Exam Management System — API Contract

Backend base URL (local): `http://localhost:3000`

Frontend dev origin (CORS): `http://localhost:5173`

All authenticated requests must include:

```
Authorization: Bearer <jwt_token>
```

---

## Conventions

### Roles

| Frontend | API JSON | Database |
|----------|----------|----------|
| `teacher` | `teacher` | `teacher` |
| `student` | `student` | `student` |

### Exam status

| Value | Meaning |
|-------|---------|
| `draft` | Visible only to the owning teacher |
| `published` | Visible to students; submissions allowed |
| `closed` | No longer available for new submissions |

Allowed transitions: `draft` → `published` → `closed` (forward only).

### Question types

| Type | Grading |
|------|---------|
| `MULTIPLE_CHOICE` | Auto-graded on submit |
| `OPEN_ENDED` | Manual grade required from teacher |

### Submission status

| Value | Meaning |
|-------|---------|
| `pending` | Submitted; contains open-ended answers awaiting teacher review |
| `graded` | Fully graded (auto and/or manual) |
| `partial` | MCQ auto-graded; open-ended still pending |

### Error response

```json
{
  "error": "Human-readable message"
}
```

HTTP status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `500` server error.

### Timestamps

ISO 8601 strings in UTC, e.g. `2026-05-15T13:30:00.000Z`.

---

## Field mapping (Frontend ↔ API ↔ Database)

### User

| Frontend (`User.js`) | API JSON | Database column |
|----------------------|----------|-----------------|
| `id` | `id` | `users.id` |
| `fullName` | `fullName` | `users.full_name` |
| `email` | `email` | `users.email` |
| `password` | *(never returned)* | `users.password` (bcrypt hash) |
| `role` | `role` | `users.role` |

### Exam

| Frontend (`Exam.js`) | API JSON | Database column |
|--------------------|----------|-----------------|
| `id` | `id` | `exams.id` |
| `title` | `title` | `exams.title` |
| `description` | `description` | `exams.description` |
| `teacherId` | `teacherId` | `exams.teacher_id` |
| `durationMinutes` | `durationMinutes` | `exams.duration_minutes` |
| `questionIds` | `questionIds` | derived from `questions` table |
| `status` | `status` | `exams.status` |
| `availableFrom` | `availableFrom` | `exams.available_from` |
| `availableUntil` | `availableUntil` | `exams.available_until` |
| — | `passingGrade` | `exams.passing_grade` |
| `questions` *(attached)* | `questions` | joined from `questions` table |

### Question

| Frontend (`Question.js`) | API JSON | Database column |
|--------------------------|----------|-----------------|
| `id` | `id` | `questions.id` |
| `examId` | `examId` | `questions.exam_id` |
| `text` | `text` | `questions.text` |
| `options` | `options` | `questions.options` (JSONB) |
| `correctOptionId` | `correctOptionId` | `questions.correct_option_id` |
| `points` | `points` | `questions.points` |
| — | `type` | `questions.type` |

`options` shape: `[{ "id": "a", "text": "Answer A" }, ...]`

For `OPEN_ENDED` questions: `options` is `[]`, `correctOptionId` is `null`.

### Submission

| Frontend (`Submission.js`) | API JSON | Database column |
|----------------------------|----------|-----------------|
| `id` | `id` | `submissions.id` |
| `examId` | `examId` | `submissions.exam_id` |
| `studentId` | `studentId` | `submissions.student_id` |
| `answers` | `answers` | `submissions.answers` (JSONB) |
| `score` | `score` | `submissions.score` |
| `maxScore` | `maxScore` | `submissions.max_score` |
| `percentage` | `percentage` | `submissions.percentage` |
| `submittedAt` | `submittedAt` | `submissions.submitted_at` |
| `status` | `status` | `submissions.status` |
| — | `feedback` | `submissions.feedback` |

Answer item shapes:

- **MULTIPLE_CHOICE:** `{ "questionId": "uuid", "selectedOptionId": "a" }`
- **OPEN_ENDED:** `{ "questionId": "uuid", "text": "Student's written answer" }`

---

## Auth

### `POST /api/auth/register`

Register a new user.

**Auth:** none

**Request body:**

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "student"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `fullName` | string | yes | Trimmed |
| `email` | string | yes | Normalized to lowercase |
| `password` | string | yes | Min 6 characters |
| `role` | string | no | Default `student`; one of `teacher`, `student` |

**Response `201`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "student"
  }
}
```

**Errors:** `409` email already exists, `400` validation.

---

### `POST /api/auth/login`

**Auth:** none

**Request body:**

```json
{
  "email": "teacher@example.com",
  "password": "teacher123"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "fullName": "Dr. Smith",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

**Errors:** `401` invalid credentials.

---

### `GET /api/auth/me`

Return the currently authenticated user.

**Auth:** required

**Response `200`:**

```json
{
  "id": "uuid",
  "fullName": "Dr. Smith",
  "email": "teacher@example.com",
  "role": "teacher"
}
```

**Errors:** `401` missing or invalid token.

---

## Health

### `GET /api/health`

**Auth:** none

**Response `200`:**

```json
{
  "status": "ok"
}
```

---

## Exams (teacher)

All teacher exam routes require `role: teacher`. Teachers may only access exams they own (`teacher_id` matches JWT user id).

### `GET /api/exams/mine`

List all exams owned by the authenticated teacher, each with embedded `questions` array (including `correctOptionId`).

**Auth:** teacher

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "title": "Basic Math Quiz",
    "description": "A short quiz covering arithmetic basics.",
    "teacherId": "uuid",
    "durationMinutes": 30,
    "questionIds": ["uuid", "uuid"],
    "status": "draft",
    "availableFrom": null,
    "availableUntil": null,
    "passingGrade": 60,
    "questions": [
      {
        "id": "uuid",
        "examId": "uuid",
        "type": "MULTIPLE_CHOICE",
        "text": "What is 8 + 7?",
        "options": [
          { "id": "a", "text": "13" },
          { "id": "b", "text": "15" }
        ],
        "correctOptionId": "b",
        "points": 10
      }
    ]
  }
]
```

---

### `POST /api/exams`

Create a new exam in `draft` status.

**Auth:** teacher

**Request body:**

```json
{
  "title": "Basic Math Quiz",
  "description": "A short quiz covering arithmetic basics.",
  "durationMinutes": 30,
  "passingGrade": 60,
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "text": "What is 8 + 7?",
      "options": [
        { "id": "a", "text": "13" },
        { "id": "b", "text": "15" }
      ],
      "correctOptionId": "b",
      "points": 10
    },
    {
      "type": "OPEN_ENDED",
      "text": "Explain the order of operations.",
      "points": 20
    }
  ]
}
```

**Response `201`:** Exam object (same shape as `GET /api/exams/mine` item).

**Errors:** `400` validation.

---

### `GET /api/exams/:id`

Get a single exam owned by the teacher, with full questions (including correct answers).

**Auth:** teacher (owner only)

**Response `200`:** Exam object.

**Errors:** `404` not found or not owned.

---

### `PUT /api/exams/:id`

Replace exam metadata and questions. Status is not changed by this endpoint.

**Auth:** teacher (owner only)

**Request body:** Same as `POST /api/exams` (without `status`).

**Response `200`:** Updated exam object.

**Errors:** `404`, `400`.

---

### `PATCH /api/exams/:id/status`

Change exam status forward only.

**Auth:** teacher (owner only)

**Request body:**

```json
{
  "status": "published"
}
```

Allowed values: `published`, `closed` (must follow allowed transition from current status).

**Response `200`:** Updated exam object.

**Errors:** `400` invalid transition, `404`.

---

## Exams (student)

### `GET /api/exams/available`

List exams with `status: published`. Questions are included but **correct answers are hidden** (`correctOptionId` omitted).

**Auth:** student

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "title": "Basic Math Quiz",
    "description": "A short quiz covering arithmetic basics.",
    "teacherId": "uuid",
    "durationMinutes": 30,
    "questionIds": ["uuid"],
    "status": "published",
    "availableFrom": "2026-05-01T08:00:00.000Z",
    "availableUntil": "2026-06-01T20:00:00.000Z",
    "questions": [
      {
        "id": "uuid",
        "examId": "uuid",
        "type": "MULTIPLE_CHOICE",
        "text": "What is 8 + 7?",
        "options": [
          { "id": "a", "text": "13" },
          { "id": "b", "text": "15" }
        ],
        "points": 10
      }
    ]
  }
]
```

---

### `GET /api/exams/available/:id`

Get a single published exam. Correct answers hidden.

**Auth:** student

**Response `200`:** Exam object (student view).

**Errors:** `404` not found or not published.

---

## Submissions

### `POST /api/submissions`

Submit answers for a published exam. Auto-grades `MULTIPLE_CHOICE` questions immediately.

**Auth:** student

**Request body:**

```json
{
  "examId": "uuid",
  "answers": {
    "question-uuid-1": "b",
    "question-uuid-2": "My explanation of closures..."
  }
}
```

`answers` is a map of `questionId` → `selectedOptionId` (MCQ) or answer text (open-ended).

Alternatively, array form (matches frontend model):

```json
{
  "examId": "uuid",
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "b" },
    { "questionId": "uuid", "text": "My explanation of closures..." }
  ]
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "examId": "uuid",
  "studentId": "uuid",
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "b" }
  ],
  "score": 10,
  "maxScore": 30,
  "percentage": 33,
  "submittedAt": "2026-05-15T13:30:00.000Z",
  "status": "partial",
  "exam": { }
}
```

- If all questions are MCQ and graded: `status` is `graded`.
- If exam contains open-ended questions: `status` is `partial` until teacher grades.

**Errors:** `400` exam not available, `409` already submitted.

---

### `GET /api/submissions/mine`

List the authenticated student's submissions with exam summary, `maxScore`, and `percentage`.

**Auth:** student

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "examId": "uuid",
    "studentId": "uuid",
    "answers": [],
    "score": 20,
    "maxScore": 30,
    "percentage": 67,
    "submittedAt": "2026-05-15T13:30:00.000Z",
    "status": "graded",
    "feedback": null,
    "exam": {
      "id": "uuid",
      "title": "Basic Math Quiz",
      "status": "published"
    }
  }
]
```

---

### `GET /api/exams/:examId/submissions`

List all submissions for an exam (teacher review).

**Auth:** teacher (exam owner)

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "examId": "uuid",
    "studentId": "uuid",
    "studentName": "John Doe",
    "score": 20,
    "maxScore": 30,
    "percentage": 67,
    "submittedAt": "2026-05-15T13:30:00.000Z",
    "status": "partial"
  }
]
```

---

### `GET /api/submissions/:id`

Submission detail for teacher or owning student.

**Auth:** teacher (exam owner) or student (owner)

**Response `200`:** Full submission with answers and linked exam/questions.

**Errors:** `403`, `404`.

---

### `PATCH /api/submissions/:id/grade`

Teacher manually grades open-ended answers and optionally adds feedback. Recalculates `score`, `maxScore`, `percentage`, and sets `status` to `graded`.

**Auth:** teacher (exam owner)

**Request body:**

```json
{
  "questionGrades": [
    { "questionId": "uuid", "pointsAwarded": 15 },
    { "questionId": "uuid", "pointsAwarded": 8 }
  ],
  "feedback": "Good work on the essay question."
}
```

**Response `200`:** Updated submission object.

**Errors:** `400`, `403`, `404`.

---

## Database schema (target)

Tables aligned with frontend models (see `tools/database/schema.sql`):

- **users** — `id`, `full_name`, `email`, `password`, `role`, `created_at`
- **exams** — `id`, `title`, `description`, `teacher_id`, `duration_minutes`, `status`, `available_from`, `available_until`, `passing_grade`, `created_at`
- **questions** — `id`, `exam_id`, `type`, `text`, `options`, `correct_option_id`, `points`, `sort_order`
- **submissions** — `id`, `exam_id`, `student_id`, `answers`, `score`, `max_score`, `percentage`, `status`, `feedback`, `submitted_at`

Unique constraint: one submission per `(exam_id, student_id)`.
