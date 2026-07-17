import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '@exam-app/common/middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

export default router;
