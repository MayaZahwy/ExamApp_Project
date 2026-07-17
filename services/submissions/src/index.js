import express from 'express';
import cors from 'cors';
import { config } from '@exam-app/common/config';
import { authenticate, requireRole } from '@exam-app/common/middleware/auth';
import { errorHandler } from '@exam-app/common/middleware/errorHandler';
import submissionsRouter from './routes/submissions.js';
import * as submissionController from './controllers/submissionController.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'submissions' });
});

// Nested path kept for frontend compatibility (was under exams router).
app.get(
  '/api/exams/:examId/submissions',
  authenticate,
  requireRole('teacher'),
  submissionController.getByExam,
);

app.use('/api/submissions', submissionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Submissions service running on http://localhost:${config.port}`);
});
