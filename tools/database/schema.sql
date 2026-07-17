-- WARNING: This script resets all application tables and inserts demo data.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('teacher', 'student')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'closed')) NOT NULL DEFAULT 'draft',
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  passing_grade INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('MULTIPLE_CHOICE', 'OPEN_ENDED')) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_id VARCHAR(50),
  points INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score NUMERIC(7,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(7,2) NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'partial', 'graded')) NOT NULL DEFAULT 'pending',
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_submissions_exam_id ON submissions(exam_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);

INSERT INTO users (id, full_name, email, password, role) VALUES
(
  'a0000000-0000-4000-8000-000000000001',
  'Dana Cohen',
  'teacher@example.com',
  crypt('teacher123', gen_salt('bf')),
  'teacher'
),
(
  'a0000000-0000-4000-8000-000000000002',
  'Noam Levi',
  'student@example.com',
  crypt('student123', gen_salt('bf')),
  'student'
);

INSERT INTO exams (
  id, title, description, teacher_id, duration_minutes, status,
  available_from, available_until, passing_grade
) VALUES
(
  'b0000000-0000-4000-8000-000000000001',
  'Basic Math Quiz',
  'A short quiz covering arithmetic basics.',
  'a0000000-0000-4000-8000-000000000001',
  30,
  'published',
  '2026-05-01T08:00:00.000Z',
  '2026-06-01T20:00:00.000Z',
  60
),
(
  'b0000000-0000-4000-8000-000000000002',
  'Science Checkpoint',
  'A sample exam for introductory science topics.',
  'a0000000-0000-4000-8000-000000000001',
  25,
  'published',
  '2026-05-10T08:00:00.000Z',
  '2026-06-10T20:00:00.000Z',
  60
),
(
  'b0000000-0000-4000-8000-000000000003',
  'English Practice',
  'A draft exam for spelling and language practice.',
  'a0000000-0000-4000-8000-000000000001',
  20,
  'draft',
  NULL,
  NULL,
  60
);

INSERT INTO questions (
  id, exam_id, type, text, options, correct_option_id, points, sort_order
) VALUES
(
  'c0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'MULTIPLE_CHOICE',
  'What is 8 + 7?',
  '[{"id":"a","text":"13"},{"id":"b","text":"15"},{"id":"c","text":"17"},{"id":"d","text":"18"}]'::jsonb,
  'b',
  10,
  0
),
(
  'c0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000001',
  'MULTIPLE_CHOICE',
  'What is 6 x 4?',
  '[{"id":"a","text":"18"},{"id":"b","text":"20"},{"id":"c","text":"24"},{"id":"d","text":"28"}]'::jsonb,
  'c',
  10,
  1
),
(
  'c0000000-0000-4000-8000-000000000003',
  'b0000000-0000-4000-8000-000000000002',
  'MULTIPLE_CHOICE',
  'Which planet is known as the Red Planet?',
  '[{"id":"a","text":"Venus"},{"id":"b","text":"Mars"},{"id":"c","text":"Jupiter"},{"id":"d","text":"Saturn"}]'::jsonb,
  'b',
  10,
  0
),
(
  'c0000000-0000-4000-8000-000000000004',
  'b0000000-0000-4000-8000-000000000003',
  'MULTIPLE_CHOICE',
  'Choose the correctly spelled word.',
  '[{"id":"a","text":"Recieve"},{"id":"b","text":"Receive"},{"id":"c","text":"Receeve"},{"id":"d","text":"Receve"}]'::jsonb,
  'b',
  10,
  0
),
(
  'c0000000-0000-4000-8000-000000000005',
  'b0000000-0000-4000-8000-000000000003',
  'OPEN_ENDED',
  'Write a short paragraph explaining the difference between "their" and "there".',
  '[]'::jsonb,
  NULL,
  20,
  1
);

INSERT INTO submissions (
  id, exam_id, student_id, answers, score, max_score, percentage, status,
  submitted_at
) VALUES
(
  'd0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  '[
    {"questionId":"c0000000-0000-4000-8000-000000000001","selectedOptionId":"b"},
    {"questionId":"c0000000-0000-4000-8000-000000000002","selectedOptionId":"c"}
  ]'::jsonb,
  20,
  20,
  100,
  'graded',
  '2026-05-15T13:30:00.000Z'
);
