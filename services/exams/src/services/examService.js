import pool from '@exam-app/common/db';
import { createError } from '@exam-app/common/utils/errors';

function mapQuestionRow(row) {
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

function mapQuestionRowForStudent(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    type: row.type,
    text: row.text,
    options: row.options,
    points: row.points,
  };
}

function mapExamRow(row, questions) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    teacherId: row.teacher_id,
    durationMinutes: row.duration_minutes,
    questionIds: questions.map((question) => question.id),
    status: row.status,
    availableFrom: row.available_from,
    availableUntil: row.available_until,
    passingGrade: row.passing_grade,
    questions,
  };
}

function validateExamInput({ title, description, durationMinutes, passingGrade, questions }) {
  if (!title?.trim()) {
    throw createError(400, 'Title is required.');
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw createError(400, 'At least one question is required.');
  }

  return {
    title: title.trim(),
    description: description?.trim() || '',
    durationMinutes: Number(durationMinutes) || 30,
    passingGrade: Number(passingGrade) || 60,
    questions,
  };
}

function normalizeQuestionInput(question, sortOrder) {
  if (!question.text?.trim()) {
    throw createError(400, 'Each question must include text.');
  }

  const type = question.type || 'MULTIPLE_CHOICE';

  if (type === 'OPEN_ENDED') {
    return {
      type,
      text: question.text.trim(),
      options: [],
      correctOptionId: null,
      points: Number(question.points) || 10,
      sortOrder,
    };
  }

  const options = (question.options || []).map((option, optionIndex) => ({
    id: option.id || `${sortOrder}-${optionIndex}`,
    text: option.text?.trim() || '',
  }));

  if (options.length < 2) {
    throw createError(400, 'Multiple choice questions need at least 2 options.');
  }

  if (options.some((option) => !option.text)) {
    throw createError(400, 'Each option must include text.');
  }

  const correctOptionId = question.correctOptionId || options[0]?.id;

  if (!options.some((option) => option.id === correctOptionId)) {
    throw createError(400, 'Correct option must match one of the provided options.');
  }

  return {
    type: 'MULTIPLE_CHOICE',
    text: question.text.trim(),
    options,
    correctOptionId,
    points: Number(question.points) || 10,
    sortOrder,
  };
}

async function fetchQuestionsForExams(examIds, client = pool) {
  if (examIds.length === 0) {
    return new Map();
  }

  const result = await client.query(
    `SELECT *
     FROM questions
     WHERE exam_id = ANY($1::uuid[])
     ORDER BY sort_order, created_at`,
    [examIds],
  );

  const questionsByExamId = new Map();

  for (const row of result.rows) {
    const questions = questionsByExamId.get(row.exam_id) || [];
    questions.push(mapQuestionRow(row));
    questionsByExamId.set(row.exam_id, questions);
  }

  return questionsByExamId;
}

async function insertQuestions(client, examId, questions) {
  const insertedQuestions = [];

  for (let index = 0; index < questions.length; index += 1) {
    const question = normalizeQuestionInput(questions[index], index);
    const result = await client.query(
      `INSERT INTO questions (
         exam_id, type, text, options, correct_option_id, points, sort_order
       )
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
       RETURNING *`,
      [
        examId,
        question.type,
        question.text,
        JSON.stringify(question.options),
        question.correctOptionId,
        question.points,
        question.sortOrder,
      ],
    );

    insertedQuestions.push(mapQuestionRow(result.rows[0]));
  }

  return insertedQuestions;
}

async function getOwnedExamRow(examId, teacherId, client = pool) {
  const result = await client.query(
    `SELECT *
     FROM exams
     WHERE id = $1 AND teacher_id = $2`,
    [examId, teacherId],
  );

  return result.rows[0] || null;
}

const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['published'],
  published: ['closed'],
  closed: [],
};

function canChangeStatus(currentStatus, nextStatus) {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

export async function getTeacherExams(teacherId) {
  const examsResult = await pool.query(
    `SELECT *
     FROM exams
     WHERE teacher_id = $1
     ORDER BY created_at DESC`,
    [teacherId],
  );

  const examIds = examsResult.rows.map((row) => row.id);
  const questionsByExamId = await fetchQuestionsForExams(examIds);

  return examsResult.rows.map((row) =>
    mapExamRow(row, questionsByExamId.get(row.id) || []),
  );
}

export async function getTeacherExamById(examId, teacherId) {
  const examRow = await getOwnedExamRow(examId, teacherId);

  if (!examRow) {
    throw createError(404, 'Exam was not found.');
  }

  const questionsByExamId = await fetchQuestionsForExams([examId]);
  return mapExamRow(examRow, questionsByExamId.get(examId) || []);
}

export async function createExam(teacherId, input) {
  const examInput = validateExamInput(input);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const examResult = await client.query(
      `INSERT INTO exams (
         title, description, teacher_id, duration_minutes, passing_grade, status
       )
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING *`,
      [
        examInput.title,
        examInput.description,
        teacherId,
        examInput.durationMinutes,
        examInput.passingGrade,
      ],
    );

    const examRow = examResult.rows[0];
    const questions = await insertQuestions(client, examRow.id, examInput.questions);

    await client.query('COMMIT');
    return mapExamRow(examRow, questions);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateExam(examId, teacherId, input) {
  const examInput = validateExamInput(input);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const examRow = await getOwnedExamRow(examId, teacherId, client);

    if (!examRow) {
      throw createError(404, 'Exam was not found.');
    }

    const examResult = await client.query(
      `UPDATE exams
       SET title = $1,
           description = $2,
           duration_minutes = $3,
           passing_grade = $4
       WHERE id = $5
       RETURNING *`,
      [
        examInput.title,
        examInput.description,
        examInput.durationMinutes,
        examInput.passingGrade,
        examId,
      ],
    );

    await client.query('DELETE FROM questions WHERE exam_id = $1', [examId]);
    const questions = await insertQuestions(client, examId, examInput.questions);

    await client.query('COMMIT');
    return mapExamRow(examResult.rows[0], questions);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateExamStatus(examId, teacherId, nextStatus) {
  if (!['published', 'closed'].includes(nextStatus)) {
    throw createError(400, 'Status must be published or closed.');
  }

  const examRow = await getOwnedExamRow(examId, teacherId);

  if (!examRow) {
    throw createError(404, 'Exam was not found.');
  }

  if (!canChangeStatus(examRow.status, nextStatus)) {
    throw createError(400, 'This status change is not allowed.');
  }

  const result = await pool.query(
    `UPDATE exams
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [nextStatus, examId],
  );

  const questionsByExamId = await fetchQuestionsForExams([examId]);
  return mapExamRow(result.rows[0], questionsByExamId.get(examId) || []);
}

export async function getAvailableExams() {
  const examsResult = await pool.query(
    `SELECT *
     FROM exams
     WHERE status = 'published'
     ORDER BY created_at DESC`,
  );

  const examIds = examsResult.rows.map((row) => row.id);
  const questionsByExamId = await fetchQuestionsForExams(examIds);

  return examsResult.rows.map((row) => {
    const questions = (questionsByExamId.get(row.id) || []).map(mapQuestionRowForStudent);
    return mapExamRow(row, questions);
  });
}

export async function getAvailableExamById(examId) {
  const examResult = await pool.query(
    `SELECT *
     FROM exams
     WHERE id = $1 AND status = 'published'`,
    [examId],
  );

  const examRow = examResult.rows[0];

  if (!examRow) {
    throw createError(404, 'Exam was not found.');
  }

  const questionsByExamId = await fetchQuestionsForExams([examId]);
  const questions = (questionsByExamId.get(examId) || []).map(mapQuestionRowForStudent);

  return mapExamRow(examRow, questions);
}
