import { z } from 'zod';

export const AqiStandardSchema = z.enum(['epa', 'who']);
export const ActivityLevelSchema = z.enum(['rest', 'light', 'moderate', 'heavy']);
export const AgeGroupSchema = z.enum(['infant', 'child', 'adult', 'elderly']);
export const MaskTypeSchema = z.enum(['N95', 'surgical', 'cloth', 'none']);
export const BuildingTypeSchema = z.enum(['modern_sealed', 'standard', 'older_leaky', 'open_plan']);
export const TransportModeSchema = z.enum(['metro', 'bus', 'car', 'ev', 'two_wheeler', 'cycle', 'walk']);
export const LanguageSchema = z.enum(['en', 'hi']);

export const PersonaSchema = z.object({
  ageGroup: AgeGroupSchema,
  activityLevel: ActivityLevelSchema,
  mask: MaskTypeSchema,
  outdoorHoursPerDay: z.number().min(0).max(24),
  maxPm25: z.number().min(0),
}).strict();

export const HouseholdProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(PersonaSchema),
  buildingType: BuildingTypeSchema,
  roomVolume: z.number().positive(),
  hasPurifier: z.boolean(),
  purifierCadr: z.number().positive().optional(),
}).strict();

export const HourlyDataSchema = z.object({
  hour: z.number().int().min(0).max(23),
  pm25: z.number().min(0),
  windSpeed: z.number().min(0).optional(),
}).strict();

export const AirDataSchema = z.object({
  city: z.string(),
  pm25: z.number().min(0),
  pm10: z.number().min(0),
  aqi: z.number().min(0),
  standard: AqiStandardSchema,
  hourly: z.array(HourlyDataSchema),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  updatedAt: z.string(),
}).strict();

export const GeocodeQuerySchema = z.object({
  q: z.string().min(1).max(100),
}).strict();

export const AirQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
}).strict();

export const AdviceRequestSchema = z.object({
  household: HouseholdProfileSchema,
  airData: AirDataSchema,
  lang: LanguageSchema.default('en'),
}).strict();

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1000),
  timestamp: z.string().optional(),
}).strict();

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  context: z.object({
    airData: AirDataSchema.optional(),
    household: HouseholdProfileSchema.optional(),
  }).strict().optional(),
  quickAsk: z.boolean().optional(),
}).strict();

export const AskRequestSchema = z.object({
  question: z.string().min(1).max(500),
  context: z.object({
    airData: AirDataSchema.optional(),
  }).strict().optional(),
  lang: LanguageSchema.default('en'),
}).strict();

export const StagnationSignalsSchema = z.object({
  windSpeed: z.number().min(0),
  mixingHeight: z.number().positive().optional(),
  deltaTemp: z.number().optional(),
}).strict();

export type GeocodeQuery = z.infer<typeof GeocodeQuerySchema>;
export type AirQuery = z.infer<typeof AirQuerySchema>;
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AskRequest = z.infer<typeof AskRequestSchema>;
