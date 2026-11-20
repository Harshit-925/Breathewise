// ─── AQI Standards ───────────────────────────────────────────
/** Supported AQI standard identifiers */
export type AqiStandard = 'epa' | 'who';

/** A single row in an AQI breakpoint table */
export interface AqiBreakpoint {
  readonly cLow: number;
  readonly cHigh: number;
  readonly iLow: number;
  readonly iHigh: number;
}

/** AQI category metadata */
export interface AqiCategory {
  readonly label: string;
  readonly color: string;
  readonly icon: string;
  readonly min: number;
  readonly max: number;
}

// ─── Air-quality data ────────────────────────────────────────
export interface HourlyData {
  readonly hour: number; // 0-23
  readonly pm25: number; // µg/m³
  readonly windSpeed?: number; // m/s
}

export interface AirData {
  readonly city: string;
  readonly pm25: number;
  readonly pm10: number;
  readonly aqi: number;
  readonly standard: AqiStandard;
  readonly hourly: readonly HourlyData[];
  readonly temperature?: number; // °C
  readonly humidity?: number; // %
  readonly windSpeed?: number; // m/s
  readonly updatedAt: string; // ISO-8601
}

// ─── Household / Persona ─────────────────────────────────────
export type ActivityLevel = 'rest' | 'light' | 'moderate' | 'heavy';
export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';
export type MaskType = 'N95' | 'surgical' | 'cloth' | 'none';

export interface Persona {
  readonly ageGroup: AgeGroup;
  readonly activityLevel: ActivityLevel;
  readonly mask: MaskType;
  readonly outdoorHoursPerDay: number;
  readonly maxPm25: number; // personal threshold µg/m³
}

export interface HouseholdProfile {
  readonly id: string;
  readonly name: string;
  readonly members: readonly Persona[];
  readonly buildingType: BuildingType;
  readonly roomVolume: number; // m³
  readonly hasPurifier: boolean;
  readonly purifierCadr?: number; // m³/h
}

// ─── Indoor ──────────────────────────────────────────────────
export type BuildingType = 'modern_sealed' | 'standard' | 'older_leaky' | 'open_plan';

export type IndoorTier = 'sealed' | 'moderate' | 'leaky';

// ─── Transport ───────────────────────────────────────────────
export type TransportMode =
  | 'metro'
  | 'bus'
  | 'car'
  | 'ev'
  | 'two_wheeler'
  | 'cycle'
  | 'walk';

export interface TripInput {
  readonly distanceKm: number;
  readonly durationMinutes: number;
}

export interface ModeResult {
  readonly mode: TransportMode;
  readonly inhaledPm25Ug: number;
  readonly co2eKg: number;
  readonly assumptions: readonly string[];
}

// ─── Impact & Pledges ────────────────────────────────────────
export type PledgeActionType =
  | 'carpool'
  | 'public_transit'
  | 'wfh'
  | 'ev_switch'
  | 'no_burn'
  | 'plant_tree';

export interface PledgeAction {
  readonly type: PledgeActionType;
  readonly count: number;
}

export interface ActionImpactResult {
  readonly co2eSavedKg: number;
  readonly pm25ReducedUg: number;
  readonly assumptions: readonly string[];
}

export interface CommunityTotalsResult {
  readonly totalCo2eSavedKg: number;
  readonly totalPm25ReducedUg: number;
  readonly pledgeCount: number;
  readonly assumptions: readonly string[];
}

// ─── Stagnation ──────────────────────────────────────────────
export type StagnationLevel = 'low' | 'medium' | 'high';

export interface StagnationSignals {
  readonly windSpeed: number; // m/s
  readonly mixingHeight?: number; // metres
  readonly deltaTemp?: number; // inversion strength °C
}

export interface StagnationResult {
  readonly level: StagnationLevel;
  readonly score: number;
  readonly assumptions: readonly string[];
}

// ─── Advice / Chat ───────────────────────────────────────────
export interface AdviceResponse {
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly generatedAt: string;
  readonly model?: string;
}

export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: string;
}

// ─── Engine result wrappers ──────────────────────────────────
export interface AqiResult {
  readonly aqi: number;
  readonly assumptions: readonly string[];
}

export interface WhoMultipleResult {
  readonly multiple: number;
  readonly guidelineValue: number;
  readonly assumptions: readonly string[];
}

export interface InhaledDoseResult {
  readonly doseUg: number;
  readonly assumptions: readonly string[];
}

export interface OutdoorWindow {
  readonly startHour: number;
  readonly endHour: number;
  readonly avgPm25: number;
}

export interface BestWindowsResult {
  readonly windows: readonly OutdoorWindow[];
  readonly assumptions: readonly string[];
}

export interface CadrRequiredResult {
  readonly cadrM3h: number;
  readonly assumptions: readonly string[];
}

export interface PurificationTimeResult {
  readonly minutes: number;
  readonly assumptions: readonly string[];
}

export interface WindowScheduleSlot {
  readonly hour: number;
  readonly pm25: number;
  readonly windSpeed: number;
  readonly recommended: boolean;
}

export interface WindowScheduleResult {
  readonly slots: readonly WindowScheduleSlot[];
  readonly assumptions: readonly string[];
}

export interface CompareModeResult {
  readonly results: readonly ModeResult[];
  readonly assumptions: readonly string[];
}

export interface ActionContext {
  readonly dailyDriveKm: number;
  readonly currentMode: TransportMode;
}
