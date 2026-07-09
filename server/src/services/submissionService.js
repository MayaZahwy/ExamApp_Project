import pool from '../db/connect.js';
import { createError } from '../utils/errors.js';

function mapQuestionForStudent(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    type: row.type,
    text: row.text,
    options: row.options,
    points: row.points,
  };
}

function mapExamForStudent(examRow, questionRows) {
  const questions = questionRows.map(mapQuestionForStudent);

  return {
    id: examRow.id,
    title: examRow.title,
    description: examRow.description,
    teacherId: examRow.teacher_id,
    durationMinutes: examRow.duration_minutes,
    questionIds: questions.map((question) => question.id),
    status: examRow.status,
    availableFrom: examRow.available_from,
    availableUntil: examRow.available_until,
    passingGrade: examRow.passing_grade,
    questions,
  };
}

function mapSubmissionRow(row, exam = null) {
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    answers: row.answers,
    score: Number(row.score),
    maxScore: Number(row.max_score),
    percentage: row.percentage,
    submittedAt: row.submitted_at,
    status: row.status,
    ...(exam ? { exam } : {}),
  };
}

async function getPublishedExamWithQuestions(examId) {
  const examResult = await pool.query(
    `SELECT *
     FROM exams
     WHERE id = $1 AND status = 'published'`,
    [examId],
  );

  const examRow = examResult.rows[0];

  if (!examRow) {
    return null;
  }

  const questionsResult = await pool.query(
    `SELECT *
     FROM questions
     WHERE exam_id = $1
     ORDER BY sort_order, created_at`,
    [examId],
  );

  return {
    examRow,
    questionRows: questionsResult.rows,
  };
}

function normalizeAnswersInput(answersInput, questionRows) {
  const answerMap = {};

  if (Array.isArray(answersInput)) {
    for (const answer of answersInput) {
      answerMap[answer.questionId] = answer.selectedOptionId ?? answer.text ?? null;
    }
  } else if (answersInput && typeof answersInput === 'object') {
    Object.assign(answerMap, answersInput);
  }

  return questionRows.map((question) => {
    const value = answerMap[question.id];

    if (question.type === 'OPEN_ENDED') {
      return {
        questionId: question.id,
        text: typeof value === 'string' ? value : '',
      };
    }

    return {
      questionId: question.id,
      selectedOptionId: value ?? null,
    };
  });
}

function calculateScore(questionRows, answers) {
  return questionRows.reduce((total, question) => {
    if (question.type !== 'MULTIPLE_CHOICE') {
      return total;
    }

    const answer = answers.find((item) => item.questionId === question.id);

    if (answer?.selectedOptionId !== question.correct_option_id) {
      return total;
    }

    return total + question.points;
  }, 0);
}

function calculateMaxScore(questionRows) {
  return questionRows.reduce((total, question) => total + question.points, 0);
}

function determineStatus(questionRows) {
  const hasOpenEnded = questionRows.some((question) => question.type === 'OPEN_ENDED');
  return hasOpenEnded ? 'partial' : 'graded';
}

export async function submitExam(studentId, input) {
  const { examId, answers: answersInput } = input;

  if (!examId) {
    throw createError(400, 'Exam ID is required.');
  }

  const publishedExam = await getPublishedExamWithQuestions(examId);

  if (!publishedExam) {
    throw createError(400, 'This exam is not available.');
  }

  const { examRow, questionRows } = publishedExam;

  if (questionRows.length === 0) {
    throw createError(400, 'This exam has no questions.');
  }

  const existingSubmission = await pool.query(
    `SELECT id
     FROM submissions
     WHERE exam_id = $1 AND student_id = $2`,
    [examId, studentId],
  );

  if (existingSubmission.rows[0]) {
    throw createError(409, 'You have already submitted this exam.');
  }

  const answers = normalizeAnswersInput(answersInput, questionRows);
  const score = calculateScore(questionRows, answers);
  const maxScore = calculateMaxScore(questionRows);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const status = determineStatus(questionRows);

  const result = await pool.query(
    `INSERT INTO submissions (
       exam_id, student_id, answers, score, max_score, percentage, status
     )
     VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
     RETURNING *`,
    [examId, studentId, JSON.stringify(answers), score, maxScore, percentage, status],
  );

  const exam = mapExamForStudent(examRow, questionRows);
  return mapSubmissionRow(result.rows[0], exam);
}
