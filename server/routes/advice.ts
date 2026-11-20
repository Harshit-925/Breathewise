import { Router, type Request, type Response, type NextFunction } from 'express';
import { AdviceRequestSchema } from '../schemas/index.js';
import { generateAdviceWithGemini } from '../ai/gemini.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';

export const adviceRouter = Router();

adviceRouter.post('/', aiRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = AdviceRequestSchema.parse(req.body);
    const advice = await generateAdviceWithGemini(body.household, body.airData, body.lang);
    res.json(advice);
  } catch (err) {
    next(err);
  }
});
