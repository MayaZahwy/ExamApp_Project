import { Router } from 'express';
import * as submissionController from '../controllers/submissionController.js';
import { authenticate, requireRole } from '@exam-app/common/middleware/auth';

const router = Router();

router.get('/mine', authenticate, requireRole('student'), submissionController.getMine);
router.post('/', authenticate, requireRole('student'), submissionController.submit);
router.patch(
  '/:id/grade',
  authenticate,
  requireRole('teacher'),
  submissionController.grade,
);
router.get('/:id', authenticate, submissionController.getById);

export default router;
