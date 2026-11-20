import { Router, type Request, type Response } from 'express';
import { getCacheStats } from '../ai/cache.js';

export const usageRouter = Router();

usageRouter.get('/', (_req: Request, res: Response): void => {
  const cacheStats = getCacheStats();
  res.json({
    status: 'healthy',
    rateLimits: {
      general: { limit: 100, windowMinutes: 15 },
      ai: { limit: 30, windowMinutes: 15 },
    },
    cache: {
      itemsCached: cacheStats.size,
      maxCapacity: cacheStats.max,
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
});
