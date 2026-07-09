import { Router } from 'express';
import * as examController from '../controllers/examController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
const teacherOnly = [authenticate, requireRole('teacher')];

router.get('/mine', ...teacherOnly, examController.getMine);
router.post('/', ...teacherOnly, examController.create);
router.patch('/:id/status', ...teacherOnly, examController.updateStatus);
router.get('/:id', ...teacherOnly, examController.getById);
router.put('/:id', ...teacherOnly, examController.update);

export default router;
