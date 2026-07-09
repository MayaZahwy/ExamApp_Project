import * as examService from '../services/examService.js';

export async function getMine(req, res, next) {
  try {
    const exams = await examService.getTeacherExams(req.user.id);
    res.status(200).json(exams);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const exam = await examService.getTeacherExamById(req.params.id, req.user.id);
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const exam = await examService.createExam(req.user.id, req.body);
    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const exam = await examService.updateExam(req.params.id, req.user.id, req.body);
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const exam = await examService.updateExamStatus(
      req.params.id,
      req.user.id,
      req.body.status,
    );
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
}

export async function getAvailable(req, res, next) {
  try {
    const exams = await examService.getAvailableExams();
    res.status(200).json(exams);
  } catch (error) {
    next(error);
  }
}

export async function getAvailableById(req, res, next) {
  try {
    const exam = await examService.getAvailableExamById(req.params.id);
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
}
