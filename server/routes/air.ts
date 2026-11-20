import { Router, type Request, type Response, type NextFunction } from 'express';
import { AirQuerySchema } from '../schemas/index.js';
import { fetchAirQuality, transformToAirData } from '../adapters/airQuality.js';
import { fetchWeather } from '../adapters/weather.js';
import { stagnationRisk } from '../../src/lib/engine/stagnation.js';
import { whoMultiple } from '../../src/lib/engine/aqi.js';
import { bestOutdoorWindows } from '../../src/lib/engine/exposure.js';

export const airRouter = Router();

airRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = AirQuerySchema.parse(req.query);
    const [rawAir, rawWeather] = await Promise.all([
      fetchAirQuality(query.lat, query.lon),
      fetchWeather(query.lat, query.lon),
    ]);

    const weatherInfo = {
      temperature: rawWeather.current.temperature_2m,
      windSpeed: rawWeather.current.wind_speed_10m,
      humidity: rawWeather.hourly.relative_humidity_2m[0],
    };

    const airData = transformToAirData('Selected Location', rawAir, weatherInfo);

    const stagnation = stagnationRisk({
      windSpeed: weatherInfo.windSpeed ?? 2.0,
      mixingHeight: 600,
    });

    const who = whoMultiple(airData.pm25);

    const defaultPersona = {
      ageGroup: 'adult' as const,
      activityLevel: 'light' as const,
      mask: 'none' as const,
      outdoorHoursPerDay: 2,
      maxPm25: 35,
    };
    const bestWindows = bestOutdoorWindows(airData.hourly, defaultPersona);

    res.json({
      airData,
      stagnation,
      whoMultiple: who,
      bestWindows,
      attribution: 'Data: CAMS ENSEMBLE + Open-Meteo',
      isMock: Boolean(rawAir.isMock),
      isStale: Boolean(rawAir.isStale),
    });
  } catch (err) {
    next(err);
  }
});
