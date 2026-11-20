import { Router, type Request, type Response, type NextFunction } from 'express';
import { AskRequestSchema } from '../schemas/index.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import { checkEmergencySymptoms, checkOffTopic, EMERGENCY_REDIRECT_MESSAGE, OFF_TOPIC_REDIRECT_MESSAGE } from '../ai/guardrails.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const askRouter = Router();

askRouter.post('/', aiRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = AskRequestSchema.parse(req.body);

    if (checkEmergencySymptoms(body.question)) {
      res.json({ answer: EMERGENCY_REDIRECT_MESSAGE, isEmergency: true });
      return;
    }

    if (checkOffTopic(body.question)) {
      res.json({ answer: OFF_TOPIC_REDIRECT_MESSAGE, isOffTopic: true });
      return;
    }

    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey || apiKey === 'mock-key' || apiKey === 'YOUR_GEMINI_API_KEY') {
      const mockAnswer = generateLiteAnswer(body.question, body.context?.airData?.aqi);
      res.json({ answer: mockAnswer, model: 'mock-lite' });
      return;
    }

    const modelName = process.env['GEMINI_MODEL_LITE'] ?? 'gemini-2.0-flash-lite';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.2, maxOutputTokens: 250 },
    });

    const contextStr = body.context?.airData
      ? `[AQI: ${body.context.airData.aqi}, PM2.5: ${body.context.airData.pm25}]`
      : '';
    const result = await model.generateContent(
      `Keep answer brief (under 3 sentences), practical, no medical diagnosis: ${contextStr} ${body.question}`
    );
    res.json({ answer: result.response.text(), model: modelName });
  } catch (err) {
    next(err);
  }
});

function generateLiteAnswer(question: string, aqi = 120): string {
  const lower = question.toLowerCase();
  if (lower.includes('mask')) {
    return 'Wear an N95 respirator outdoors; cloth masks provide negligible filtration against hazardous fine PM2.5.';
  }
  if (lower.includes('window')) {
    return 'Keep windows closed during early morning and late evening smog peaks; open only briefly around 13:00-15:00 if fresh air is needed.';
  }
  return `With AQI around ${aqi}, limit prolonged outdoor exertion and run HEPA air filtration in sleeping areas.`;
}
