import * as submissionService from '../services/submissionService.js';

export async function submit(req, res, next) {
  try {
    const submission = await submissionService.submitExam(req.user.id, req.body);
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
}

export async function getMine(req, res, next) {
  try {
    const submissions = await submissionService.getStudentSubmissions(req.user.id);
    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id, req.user);
    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
}

export async function getByExam(req, res, next) {
  try {
    const submissions = await submissionService.getExamSubmissionsForTeacher(
      req.params.examId,
      req.user.id,
    );
    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
}

export async function grade(req, res, next) {
  try {
    const submission = await submissionService.gradeSubmission(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
}
