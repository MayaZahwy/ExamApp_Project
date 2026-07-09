import { Router } from 'express';
import * as examController from '../controllers/examController.js';
import * as submissionController from '../controllers/submissionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const teacherOnly = [authenticate, requireRole('teacher')];
const studentOnly = [authenticate, requireRole('student')];

router.get('/available', ...studentOnly, examController.getAvailable);
router.get('/available/:id', ...studentOnly, examController.getAvailableById);
router.get('/mine', ...teacherOnly, examController.getMine);
router.post('/', ...teacherOnly, examController.create);
router.get(
  '/:examId/submissions',
  ...teacherOnly,
  submissionController.getByExam,
);
router.patch('/:id/status', ...teacherOnly, examController.updateStatus);
router.get('/:id', ...teacherOnly, examController.getById);
router.put('/:id', ...teacherOnly, examController.update);

export default router;
