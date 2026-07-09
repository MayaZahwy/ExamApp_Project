import * as submissionService from '../services/submissionService.js';

export async function submit(req, res, next) {
  try {
    const submission = await submissionService.submitExam(req.user.id, req.body);
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
}
