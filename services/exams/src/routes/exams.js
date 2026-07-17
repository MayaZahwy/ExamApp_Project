import { Router } from 'express';
import * as examController from '../controllers/examController.js';
import { authenticate, requireRole } from '@exam-app/common/middleware/auth';

const router = Router();
const teacherOnly = [authenticate, requireRole('teacher')];
const studentOnly = [authenticate, requireRole('student')];

router.get('/available', ...studentOnly, examController.getAvailable);
router.get('/available/:id', ...studentOnly, examController.getAvailableById);
router.get('/mine', ...teacherOnly, examController.getMine);
router.post('/', ...teacherOnly, examController.create);
router.patch('/:id/status', ...teacherOnly, examController.updateStatus);
router.post('/:id/publish-results', ...teacherOnly, examController.publishResults);
router.get('/:id', ...teacherOnly, examController.getById);
router.put('/:id', ...teacherOnly, examController.update);

export default router;
