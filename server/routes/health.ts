import { Router, type Request, type Response } from 'express';
import { getCacheStats } from '../ai/cache.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response): void => {
  // Liveness check: status, uptime, cache size. NO secrets, NO config exposed.
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    cacheSize: getCacheStats().size,
  });
});
