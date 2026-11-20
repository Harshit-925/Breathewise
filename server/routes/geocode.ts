import { Router, type Request, type Response, type NextFunction } from 'express';
import { GeocodeQuerySchema } from '../schemas/index.js';
import { searchGeocode } from '../adapters/geocode.js';

export const geocodeRouter = Router();

geocodeRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = GeocodeQuerySchema.parse(req.query);
    const results = await searchGeocode(query.q);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});
