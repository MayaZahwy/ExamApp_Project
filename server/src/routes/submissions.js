import { Router } from 'express';
import * as submissionController from '../controllers/submissionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, requireRole('student'), submissionController.submit);

export default router;
