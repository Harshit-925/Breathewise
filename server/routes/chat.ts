import { Router, type Request, type Response, type NextFunction } from 'express';
import { ChatRequestSchema } from '../schemas/index.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';
import {
  checkEmergencySymptoms,
  checkOffTopic,
  EMERGENCY_REDIRECT_MESSAGE,
  OFF_TOPIC_REDIRECT_MESSAGE,
  wrapUserInput,
} from '../ai/guardrails.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from '../ai/prompts.js';

export const chatRouter = Router();

chatRouter.post('/', aiRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = ChatRequestSchema.parse(req.body);
    const lastMsg = body.messages[body.messages.length - 1];
    if (!lastMsg) {
      res.status(400).json({ error: 'At least one message is required', code: 400 });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Emergency check
    if (checkEmergencySymptoms(lastMsg.content)) {
      sendSseChunk(res, EMERGENCY_REDIRECT_MESSAGE);
      sendSseDone(res);
      return;
    }

    // Off-topic check
    if (checkOffTopic(lastMsg.content)) {
      sendSseChunk(res, OFF_TOPIC_REDIRECT_MESSAGE);
      sendSseDone(res);
      return;
    }

    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey || apiKey === 'mock-key' || apiKey === 'YOUR_GEMINI_API_KEY') {
      // Deterministic streaming mock
      const mockReply = generateMockChatReply(lastMsg.content, body.context?.airData?.aqi);
      await streamTextChunks(res, mockReply);
      sendSseDone(res);
      return;
    }

    const modelName = process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 0.3 },
    });

    const contextStr = body.context?.airData
      ? `[Current Context: AQI ${body.context.airData.aqi}, PM2.5 ${body.context.airData.pm25} µg/m³, City: ${body.context.airData.city}]`
      : '';

    const prompt = `${contextStr}\n${wrapUserInput(lastMsg.content)}`;
    const streamResult = await model.generateContentStream(prompt);

    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        sendSseChunk(res, text);
      }
    }
    sendSseDone(res);
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
});

function sendSseChunk(res: Response, text: string): void {
  res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
}

function sendSseDone(res: Response): void {
  res.write('data: [DONE]\n\n');
  res.end();
}

async function streamTextChunks(res: Response, text: string): Promise<void> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + ' ';
    sendSseChunk(res, chunk);
    await new Promise((r) => setTimeout(r, 20));
  }
}

function generateMockChatReply(query: string, aqi = 145): string {
  const lower = query.toLowerCase();
  if (lower.includes('mask') || lower.includes('n95')) {
    return 'For current pollution levels, a well-fitted N95 or FFP2 respirator reduces inhaled fine particulate matter (PM2.5) by roughly 90-95%. Cloth and surgical masks offer minimal protection against sub-micron urban smog particles.';
  }
  if (lower.includes('exercise') || lower.includes('run') || lower.includes('walk')) {
    return `With an AQI around ${aqi}, outdoor cardiovascular exertion is best rescheduled to mid-day hours (12:00-15:00) when solar warming lifts the boundary layer. Alternatively, indoor yoga or stationary cycling with air filtration is recommended.`;
  }
  if (lower.includes('purifier') || lower.includes('cadr')) {
    return 'When selecting an air purifier, prioritize Clean Air Delivery Rate (CADR). Aim for at least 4-5 air changes per hour (ACH) for your room volume. A Corsi-Rosenthal DIY box fan with MERV-13 filters delivers equivalent performance to commercial HEPA units at a fraction of the cost.';
  }
  return `At current AQI levels (${aqi}), vulnerable family members should limit prolonged outdoor exertion. Keep windows sealed during morning and evening rush hour spikes, and utilize mechanical filtration indoors.`;
}
