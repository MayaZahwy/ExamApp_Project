-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS users;
-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('LECTURER', 'STUDENT')) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 2. Create Exams Table (using JSONB for questions)
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  time_limit INTEGER NOT NULL, -- in minutes
  passing_grade INTEGER NOT NULL DEFAULT 60,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 3. Create Submissions Table (using JSONB for student responses)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Seed Initial Data
INSERT INTO users (username, password, role, name) VALUES
('lecturer1', 'password', 'LECTURER', 'Dr. Smith'),
('student1', 'password', 'STUDENT', 'John Doe');
INSERT INTO exams (title, time_limit, passing_grade, questions) VALUES
('JavaScript Basics', 60, 60, '[
  {"id": "q1", "type": "MULTIPLE_CHOICE", "text": "What is typeof null?", "options": ["object", "null", "undefined"], "answer": "object"},
  {"id": "q2", "type": "OPEN_ENDED", "text": "Explain Closures in JS."}
]'::jsonb);