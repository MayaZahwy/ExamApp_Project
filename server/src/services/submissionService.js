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

function mapQuestionForTeacher(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    type: row.type,
    text: row.text,
    options: row.options,
    correctOptionId: row.correct_option_id,
    points: row.points,
  };
}

function mapExamSummary(examRow) {
  return {
    id: examRow.id,
    title: examRow.title,
    status: examRow.status,
  };
}

function mapExamDetail(examRow, questionRows, includeCorrectAnswers) {
  const questions = questionRows.map((row) =>
    includeCorrectAnswers ? mapQuestionForTeacher(row) : mapQuestionForStudent(row),
  );

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

function mapSubmissionRow(row, exam = null, extras = {}) {
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
    feedback: row.feedback ?? null,
    ...(extras.studentName ? { studentName: extras.studentName } : {}),
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

async function getSubmissionRecord(submissionId) {
  const result = await pool.query(
    `SELECT s.*, e.teacher_id
     FROM submissions s
     JOIN exams e ON e.id = s.exam_id
     WHERE s.id = $1`,
    [submissionId],
  );

  return result.rows[0] || null;
}

async function getExamQuestions(examId) {
  const result = await pool.query(
    `SELECT *
     FROM questions
     WHERE exam_id = $1
     ORDER BY sort_order, created_at`,
    [examId],
  );

  return result.rows;
}

function assertSubmissionAccess(submissionRow, user) {
  if (!submissionRow) {
    throw createError(404, 'Submission was not found.');
  }

  const isOwner = submissionRow.student_id === user.id;
  const isTeacher = user.role === 'teacher' && submissionRow.teacher_id === user.id;

  if (!isOwner && !isTeacher) {
    throw createError(403, 'Forbidden.');
  }
}

export async function getStudentSubmissions(studentId) {
  const result = await pool.query(
    `SELECT s.*, e.id AS exam_ref_id, e.title AS exam_title, e.status AS exam_status
     FROM submissions s
     JOIN exams e ON e.id = s.exam_id
     WHERE s.student_id = $1
     ORDER BY s.submitted_at DESC`,
    [studentId],
  );

  return result.rows.map((row) =>
    mapSubmissionRow(row, {
      id: row.exam_ref_id,
      title: row.exam_title,
      status: row.exam_status,
    }),
  );
}

export async function getExamSubmissionsForTeacher(examId, teacherId) {
  const examResult = await pool.query(
    `SELECT id
     FROM exams
     WHERE id = $1 AND teacher_id = $2`,
    [examId, teacherId],
  );

  if (!examResult.rows[0]) {
    throw createError(404, 'Exam was not found.');
  }

  const result = await pool.query(
    `SELECT s.*, u.full_name AS student_name
     FROM submissions s
     JOIN users u ON u.id = s.student_id
     WHERE s.exam_id = $1
     ORDER BY s.submitted_at DESC`,
    [examId],
  );

  return result.rows.map((row) =>
    mapSubmissionRow(row, null, { studentName: row.student_name }),
  );
}

export async function getSubmissionById(submissionId, user) {
  const submissionRow = await getSubmissionRecord(submissionId);
  assertSubmissionAccess(submissionRow, user);

  const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [
    submissionRow.exam_id,
  ]);
  const questionRows = await getExamQuestions(submissionRow.exam_id);
  const includeCorrectAnswers = user.role === 'teacher';
  const exam = mapExamDetail(
    examResult.rows[0],
    questionRows,
    includeCorrectAnswers,
  );

  return mapSubmissionRow(submissionRow, exam);
}

export async function gradeSubmission(submissionId, teacherId, input) {
  const { questionGrades = [], feedback = null } = input;
  const submissionRow = await getSubmissionRecord(submissionId);

  if (!submissionRow) {
    throw createError(404, 'Submission was not found.');
  }

  if (submissionRow.teacher_id !== teacherId) {
    throw createError(403, 'Forbidden.');
  }

  const questionRows = await getExamQuestions(submissionRow.exam_id);
  const openEndedQuestions = questionRows.filter((question) => question.type === 'OPEN_ENDED');
  const gradesByQuestionId = new Map(
    questionGrades.map((grade) => [grade.questionId, grade.pointsAwarded]),
  );

  let openEndedScore = 0;

  if (openEndedQuestions.length > 0) {
    for (const question of openEndedQuestions) {
      if (!gradesByQuestionId.has(question.id)) {
        throw createError(400, 'All open-ended questions must be graded.');
      }

      const pointsAwarded = Number(gradesByQuestionId.get(question.id));

      if (Number.isNaN(pointsAwarded) || pointsAwarded < 0 || pointsAwarded > question.points) {
        throw createError(400, 'Points awarded must be between 0 and the question maximum.');
      }

      openEndedScore += pointsAwarded;
    }

    for (const grade of questionGrades) {
      const question = questionRows.find((item) => item.id === grade.questionId);

      if (!question) {
        throw createError(400, 'Question was not found on this exam.');
      }

      if (question.type !== 'OPEN_ENDED') {
        throw createError(400, 'Only open-ended questions can be manually graded.');
      }
    }
  }

  const mcqScore = calculateScore(questionRows, submissionRow.answers);
  const score = mcqScore + openEndedScore;
  const maxScore = calculateMaxScore(questionRows);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const result = await pool.query(
    `UPDATE submissions
     SET score = $1,
         max_score = $2,
         percentage = $3,
         status = 'graded',
         feedback = $4
     WHERE id = $5
     RETURNING *`,
    [score, maxScore, percentage, feedback, submissionId],
  );

  const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [
    submissionRow.exam_id,
  ]);
  const exam = mapExamDetail(examResult.rows[0], questionRows, true);

  return mapSubmissionRow(result.rows[0], exam);
}
