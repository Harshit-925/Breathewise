import rateLimit from 'express-rate-limit';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true, // Return X-RateLimit-* and RateLimit-* headers
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.', code: 429 },
});

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'AI rate limit exceeded, please try again shortly.', code: 429 },
});
