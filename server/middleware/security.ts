import helmet from 'helmet';
import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';

export function createSecurityMiddleware() {
  const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const corsMiddleware = cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || isAllowedVercelOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS origin denied'));
      }
    },
    credentials: true,
  });

  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://*.open-meteo.com', 'https://generativelanguage.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // Body limit 16KB to prevent memory exhaustion / payload bomb attacks
  const jsonParser = express.json({ limit: '16kb' });

  return [helmetMiddleware, corsMiddleware, jsonParser];
}

export function validateSanitizedInput(req: Request, _res: Response, next: NextFunction): void {
  // Strip null bytes and control chars from body strings
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      obj[key] = Array.from(value)
        .filter((char) => {
          const code = char.charCodeAt(0);
          return (code >= 32 || code === 9 || code === 10 || code === 13) && code !== 127;
        })
        .join('');
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitizeObject(value as Record<string, unknown>);
    }
  }
}

function isAllowedVercelOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    if (url.hostname.endsWith('.vercel.app')) return true;
    if (process.env['VERCEL_URL'] && (url.hostname === process.env['VERCEL_URL'] || url.host === process.env['VERCEL_URL'])) return true;
    if (process.env['VERCEL_PROJECT_PRODUCTION_URL'] && (url.hostname === process.env['VERCEL_PROJECT_PRODUCTION_URL'] || url.host === process.env['VERCEL_PROJECT_PRODUCTION_URL'])) return true;
    return false;
  } catch {
    return false;
  }
}
