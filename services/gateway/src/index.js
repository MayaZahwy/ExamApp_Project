import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

const port = Number(process.env.PORT) || 3000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const examsUrl = process.env.EXAMS_SERVICE_URL || 'http://localhost:3002';
const submissionsUrl = process.env.SUBMISSIONS_SERVICE_URL || 'http://localhost:3003';

app.use(cors({ origin: corsOrigin }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    upstream: {
      auth: authUrl,
      exams: examsUrl,
      submissions: submissionsUrl,
    },
  });
});

// Use pathFilter (not app.use mount) so full paths like /api/auth/login are preserved.
app.use(
  createProxyMiddleware({
    target: authUrl,
    changeOrigin: true,
    pathFilter: '/api/auth',
  }),
);

app.use(
  createProxyMiddleware({
    target: submissionsUrl,
    changeOrigin: true,
    pathFilter: '/api/submissions',
  }),
);

app.use(
  createProxyMiddleware({
    target: submissionsUrl,
    changeOrigin: true,
    pathFilter: (pathname) => /^\/api\/exams\/[^/]+\/submissions/.test(pathname),
  }),
);

app.use(
  createProxyMiddleware({
    target: examsUrl,
    changeOrigin: true,
    pathFilter: '/api/exams',
  }),
);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`API gateway running on http://localhost:${port}`);
  console.log(`  auth         → ${authUrl}`);
  console.log(`  exams        → ${examsUrl}`);
  console.log(`  submissions  → ${submissionsUrl}`);
});
