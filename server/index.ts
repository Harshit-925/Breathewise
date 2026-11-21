import express from 'express';
import { createSecurityMiddleware, validateSanitizedInput } from './middleware/security.js';
import { generalRateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { airRouter } from './routes/air.js';
import { geocodeRouter } from './routes/geocode.js';
import { adviceRouter } from './routes/advice.js';
import { chatRouter } from './routes/chat.js';
import { askRouter } from './routes/ask.js';
import { usageRouter } from './routes/usage.js';
import { healthRouter } from './routes/health.js';

export function createApp() {
  const app = express();

  // 1. Security middleware (Helmet, CORS, body size cap)
  const securityMiddleware = createSecurityMiddleware();
  securityMiddleware.forEach((mw) => app.use(mw));

  // 2. Input sanitization (null byte / control char stripping)
  app.use(validateSanitizedInput);

  // 3. Global rate limiting
  app.use(generalRateLimiter);

  // 4. API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/usage', usageRouter);
  app.use('/api/geocode', geocodeRouter);
  app.use('/api/air', airRouter);
  app.use('/api/advice', adviceRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/ask', askRouter);

  // 5. Centralized Error Handler (masks internal traces)
  app.use(errorHandler);

  return app;
}

const app = createApp();
const PORT = process.env['PORT'] ?? 3001;

if (process.env['NODE_ENV'] !== 'test' && !process.env['VERCEL']) {
  app.listen(PORT, () => {
    console.log(`Breathewise API Gateway running on port ${PORT}`);
  });
}

export default app;
