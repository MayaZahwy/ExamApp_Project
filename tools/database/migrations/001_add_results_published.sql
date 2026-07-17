-- Additive migration for existing databases (does not wipe data).
-- Run once against your Postgres / Supabase database.

ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS results_published BOOLEAN NOT NULL DEFAULT FALSE;

-- Demo seed exam with a graded submission can stay visible to students.
UPDATE exams
SET results_published = TRUE
WHERE id = 'b0000000-0000-4000-8000-000000000001';
