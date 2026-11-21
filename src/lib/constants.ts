import type { AqiBreakpoint, AqiCategory } from '../types/index.js';

// ─── US EPA AQI PM2.5 Breakpoints (2024 Revised) ───────────
// Source: US EPA 40 CFR Part 58, Final Rule 2024-02-07
// Reconsideration of the National Ambient Air Quality Standards for PM.
// URL: https://www.epa.gov/pm-pollution (Retrieved: 2024-05)
export const EPA_PM25_BREAKPOINTS: readonly AqiBreakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
  { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
] as const;

// ─── AQI Category Labels / Colors / Icons ───────────────────
// Source: US EPA AirNow.gov category definitions (Verified standard)
export const AQI_CATEGORIES: readonly AqiCategory[] = [
  { label: 'Good', color: '#00E400', icon: '😊', min: 0, max: 50 },
  { label: 'Moderate', color: '#FFFF00', icon: '🙂', min: 51, max: 100 },
  { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00', icon: '😷', min: 101, max: 150 },
  { label: 'Unhealthy', color: '#FF0000', icon: '🤢', min: 151, max: 200 },
  { label: 'Very Unhealthy', color: '#8F3F97', icon: '😨', min: 201, max: 300 },
  { label: 'Hazardous', color: '#7E0023', icon: '☠️', min: 301, max: 500 },
] as const;

// ─── WHO PM Guidelines (2021) ───────────────────────────────
// Source: WHO Global Air Quality Guidelines 2021 (Verified standard)
// URL: https://www.who.int/publications/i/item/9789240034228 (Retrieved: 2024-02)
export const WHO_GUIDELINES = {
  pm25AnnualMean: 5, // µg/m³
  pm25_24hMean: 15, // µg/m³
  pm10AnnualMean: 15, // µg/m³
  pm10_24hMean: 45, // µg/m³
} as const;

// ─── Breathing Rates (L/min) by Activity and Age ────────────
// Source: US EPA Exposure Factors Handbook (2011 Edition, EPA/600/R-09/052F), Table 6-2
// Adult conversion: 7.5 L/min = 0.45 m³/h; 16 L/min = 0.96 m³/h; 30 L/min = 1.80 m³/h; 45 L/min = 2.70 m³/h
// Status: Adult values verified against Table 6-2; infant/elderly are age-bracket adjusted literature estimates
export const BREATHING_RATES: Record<string, Record<string, number>> = {
  rest: { infant: 3.5, child: 5.0, adult: 7.5, elderly: 6.5 },
  light: { infant: 7.0, child: 12.0, adult: 16.0, elderly: 13.0 },
  moderate: { infant: 12.0, child: 22.0, adult: 30.0, elderly: 24.0 },
  heavy: { infant: 15.0, child: 30.0, adult: 45.0, elderly: 35.0 },
} as const;

// ─── Mask Filtration Efficiency Ranges ──────────────────────
// Source: NIOSH / 3M Technical Bulletin 2020 (N95: 95% typical, 90-99% range);
// Davies et al. 2013 / Shakya et al. 2017 (Surgical: 65% typical; Cloth: 30% typical)
// Status: N95 certified NIOSH standard; surgical and cloth are empirical literature averages
export const MASK_EFFICIENCY: Record<string, { min: number; max: number; typical: number }> = {
  N95: { min: 0.90, max: 0.99, typical: 0.95 },
  surgical: { min: 0.50, max: 0.80, typical: 0.65 },
  cloth: { min: 0.15, max: 0.50, typical: 0.30 },
  none: { min: 0, max: 0, typical: 0 },
} as const;

// ─── Transport Emission Factors (kg CO2e per km) ────────────
// Source: UK DEFRA GHG Conversion Factors 2024 & CPCB Urban Transport Emission Guidelines
// Status: DEFRA 2024 standard factors adapted with Indian transit averages (Empirical)
export const EMISSION_FACTORS: Record<string, number> = {
  metro: 0.035,
  bus: 0.089,
  car: 0.170,
  ev: 0.050,
  two_wheeler: 0.060,
  cycle: 0,
  walk: 0,
} as const;

// ─── Transport Exposure Multipliers (relative to ambient) ───
// Source: Cepeda et al. 2017 / Int. Journal of Environmental Research 2018
// Status: Empirical literature microenvironment exposure ratios (Partial verification)
export const MODE_EXPOSURE_MULTIPLIER: Record<string, number> = {
  metro: 0.5,
  bus: 0.7,
  car: 0.6,
  ev: 0.6,
  two_wheeler: 1.5,
  cycle: 1.2,
  walk: 1.0,
} as const;

// ─── Transport Mode Physics (Speeds & Inhalation Exertion) ────
// Realistic urban transit speeds (km/h) and active exertion breathing rates (L/min)
export interface ModePhysics {
  readonly speedKmh: number;
  readonly breathingRateLpm: number;
  readonly exposureMultiplier: number;
  readonly emissionFactorKgKm: number;
}

export const MODE_PHYSICS: Record<string, ModePhysics> = {
  metro: { speedKmh: 32, breathingRateLpm: 14, exposureMultiplier: 0.5, emissionFactorKgKm: 0.035 },
  bus: { speedKmh: 16, breathingRateLpm: 14, exposureMultiplier: 0.7, emissionFactorKgKm: 0.089 },
  car: { speedKmh: 22, breathingRateLpm: 12, exposureMultiplier: 0.6, emissionFactorKgKm: 0.170 },
  ev: { speedKmh: 22, breathingRateLpm: 12, exposureMultiplier: 0.6, emissionFactorKgKm: 0.050 },
  two_wheeler: { speedKmh: 24, breathingRateLpm: 16, exposureMultiplier: 1.5, emissionFactorKgKm: 0.060 },
  cycle: { speedKmh: 14, breathingRateLpm: 32, exposureMultiplier: 1.2, emissionFactorKgKm: 0 },
  walk: { speedKmh: 4.5, breathingRateLpm: 24, exposureMultiplier: 1.0, emissionFactorKgKm: 0 },
};

// ─── Indoor/Outdoor PM2.5 Ratios by Building Type ──────────
// Source: Chen & Zhao 2011, Building & Environment
// Status: Empirical literature ranges for infiltration factors (Partial verification)
export const IO_RATIOS: Record<string, number> = {
  modern_sealed: 0.2,
  standard: 0.5,
  older_leaky: 0.8,
  open_plan: 0.95,
} as const;

// ─── Pledge Action Impact Estimates ─────────────────────────
// Source: Derived from DEFRA 2024 emission factors & municipal biomass burn literature
// Status: Modelled empirical estimates for community action accounting
export const PLEDGE_IMPACTS: Record<string, { co2eKgPerDay: number; pm25UgPerDay: number }> = {
  carpool: { co2eKgPerDay: 2.5, pm25UgPerDay: 0.8 },
  public_transit: { co2eKgPerDay: 3.0, pm25UgPerDay: 1.0 },
  wfh: { co2eKgPerDay: 4.0, pm25UgPerDay: 1.5 },
  ev_switch: { co2eKgPerDay: 3.5, pm25UgPerDay: 1.2 },
  no_burn: { co2eKgPerDay: 5.0, pm25UgPerDay: 8.0 },
  plant_tree: { co2eKgPerDay: 0.06, pm25UgPerDay: 0.02 },
} as const;

// ─── Stagnation Thresholds ──────────────────────────────────
// Source: NOAA / CPCB Winter Inversion Meteorology Heuristics
// Status: Atmospheric boundary layer physics heuristic
export const STAGNATION_THRESHOLDS = {
  windLow: 2.0, // m/s — below this counts as stagnant wind
  windVeryLow: 1.0, // m/s — very stagnant
  mixingHeightLow: 500, // m — shallow boundary layer
  inversionStrong: 3.0, // °C — strong inversion delta
} as const;
