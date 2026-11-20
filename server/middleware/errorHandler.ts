import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request data',
      code: 400,
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof Error) {
    if (err.message.includes('CORS origin denied')) {
      res.status(403).json({ error: 'Origin not allowed', code: 403 });
      return;
    }
    // Generic sanitized error response - NEVER expose stack traces
    const statusCode = (err as { status?: number; statusCode?: number }).status ?? 500;
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal server error' : err.message,
      code: statusCode,
    });
    return;
  }

  res.status(500).json({ error: 'Internal server error', code: 500 });
}
