import express from 'express';
import cors from 'cors';
import { config } from '@exam-app/common/config';
import { errorHandler } from '@exam-app/common/middleware/errorHandler';
import examsRouter from './routes/exams.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'exams' });
});

app.use('/api/exams', examsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Exams service running on http://localhost:${config.port}`);
});
