import type { AqiBreakpoint, AqiCategory } from '../types/index.js';

// ─── 1. US EPA AQI PM2.5 Breakpoints (2024 Revised) ───────────
// Source: US EPA 40 CFR Part 58, Final Rule (89 FR 16202, Feb 2024, effective May 2024).
// Reconsideration of the National Ambient Air Quality Standards for Particulate Matter.
// URL: https://www.federalregister.gov/documents/2024/03/06/2024-04317/reconsideration-of-the-national-ambient-air-quality-standards-for-particulate-matter
// Secondary URL: https://www.airnow.gov/aqi/aqi-basics/
// Retrieval Date: 2024-05-15 | Status: Verified Regulatory Standard
export const EPA_PM25_BREAKPOINTS: readonly AqiBreakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
  { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
] as const;

// ─── 2. AQI Category Labels / Colors / Icons ───────────────────
// Source: US EPA AirNow.gov Category Definitions
// URL: https://www.airnow.gov/aqi/aqi-basics/
// Retrieval Date: 2024-05-15 | Status: Verified Standard
export const AQI_CATEGORIES: readonly AqiCategory[] = [
  { label: 'Good', color: '#00E400', icon: '😊', min: 0, max: 50 },
  { label: 'Moderate', color: '#FFFF00', icon: '🙂', min: 51, max: 100 },
  { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00', icon: '😷', min: 101, max: 150 },
  { label: 'Unhealthy', color: '#FF0000', icon: '🤢', min: 151, max: 200 },
  { label: 'Very Unhealthy', color: '#8F3F97', icon: '😨', min: 201, max: 300 },
  { label: 'Hazardous', color: '#7E0023', icon: '☠️', min: 301, max: 500 },
] as const;

// ─── 3. WHO PM Guidelines (2021) ───────────────────────────────
// Source: WHO Global Air Quality Guidelines 2021
// URL: https://iris.who.int/handle/10665/345329
// Secondary URL: https://www.who.int/news-room/feature-stories/detail/what-are-the-who-air-quality-guidelines
// Retrieval Date: 2024-02-10 | Status: Verified International Standard
export const WHO_GUIDELINES = {
  pm25AnnualMean: 5, // µg/m³
  pm25_24hMean: 15, // µg/m³
  pm10AnnualMean: 15, // µg/m³
  pm10_24hMean: 45, // µg/m³
} as const;

// ─── 4. Breathing Rates (L/min) by Activity and Age ────────────
// Source: US EPA Exposure Factors Handbook (2011 Edition, EPA/600/R-09/052F), Chapter 6: Inhalation Rates, Table 6-1 & 6-2.
// URL: https://www.epa.gov/expobox/exposure-factors-handbook-chapter-6
// Adult conversion: 7.5 L/min = 0.45 m³/h; 16 L/min = 0.96 m³/h; 30 L/min = 1.80 m³/h; 45 L/min = 2.70 m³/h
// Retrieval Date: 2024-02-18 | Status: Adult Verified Standard; Infant/Elderly are age-bracket adjusted literature estimates
export const BREATHING_RATES: Record<string, Record<string, number>> = {
  rest: { infant: 3.5, child: 5.0, adult: 7.5, elderly: 6.5 },
  light: { infant: 7.0, child: 12.0, adult: 16.0, elderly: 13.0 },
  moderate: { infant: 12.0, child: 22.0, adult: 30.0, elderly: 24.0 },
  heavy: { infant: 15.0, child: 30.0, adult: 45.0, elderly: 35.0 },
} as const;

// ─── 5. Mask Filtration Efficiency Ranges ──────────────────────
// Source (N95): NIOSH 42 CFR Part 84 / 3M Technical Data Bulletin (May 2020) "Respiratory Protection Against Bioaerosols"
// URL: https://multimedia.3m.com/mws/media/409903O/respiratory-protection-against-bioaerosols.pdf
// Source (Surgical): Davies et al. (2013), Disaster Med Public Health Prep, 7(4): 413-418
// URL: https://doi.org/10.1017/dmp.2013.43
// Source (Cloth): Shakya et al. (2017), J Expo Sci Environ Epidemiol, 27(3): 352-357
// URL: https://doi.org/10.1038/jes.2016.42
// Retrieval Date: 2024-03-14 | Status: N95 Certified NIOSH Standard; Surgical & Cloth are Empirical Literature Estimates
export const MASK_EFFICIENCY: Record<string, { min: number; max: number; typical: number }> = {
  N95: { min: 0.90, max: 0.99, typical: 0.95 },
  surgical: { min: 0.50, max: 0.80, typical: 0.65 },
  cloth: { min: 0.15, max: 0.50, typical: 0.30 },
  none: { min: 0, max: 0, typical: 0 },
} as const;

// ─── 6. Transport Emission Factors (kg CO2e per km) ────────────
// Source: UK Department for Energy Security and Net Zero (DESNZ) / DEFRA (2024) GHG Conversion Factors
// URL: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024
// Indian Vehicle Emission Factors: Central Pollution Control Board (CPCB), MoEF&CC, Govt of India
// URL: https://cpcb.nic.in/air-pollution/
// Retrieval Date: 2024-06-15 | Status: Verified Government Standard
export const EMISSION_FACTORS: Record<string, number> = {
  metro: 0.035,
  bus: 0.089,
  car: 0.170,
  ev: 0.050,
  two_wheeler: 0.060,
  cycle: 0,
  walk: 0,
} as const;

// ─── 7. Transport Exposure Multipliers (relative to ambient) ───
// Source: Cepeda et al. (2017), "Levels of ambient air pollution according to mode of transport", Lancet Public Health, 2(1): e23-e34
// URL: https://doi.org/10.1016/S2468-2667(16)30021-4
// Source: Goel et al. (2015), "On-road PM2.5 pollution exposure in multiple transport microenvironments in Delhi", Atmos Environ, 123: 129-138
// URL: https://doi.org/10.1016/j.atmosenv.2015.10.037
// Retrieval Date: 2024-05-18 | Status: Empirical Literature Microenvironment Estimates (Partial Verification)
export const MODE_EXPOSURE_MULTIPLIER: Record<string, number> = {
  metro: 0.5,
  bus: 0.7,
  car: 0.6,
  ev: 0.6,
  two_wheeler: 1.5,
  cycle: 1.2,
  walk: 1.0,
} as const;

// ─── 8. Transport Mode Physics (Speeds & Inhalation Exertion) ────
// Realistic urban transit speeds (km/h) and active exertion breathing rates (L/min)
// Derived from urban transit time-motion surveys (Delhi Metro, BMTC, EPA light vs heavy exertion)
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

// ─── 9. Indoor/Outdoor PM2.5 Ratios by Building Type ──────────
// Source: Chen, C., & Zhao, B. (2011), "Review of relationship between indoor and outdoor particles", Atmos Environ, 45(2): 275-288
// URL: https://doi.org/10.1016/j.atmosenv.2010.09.048
// Retrieval Date: 2024-05-20 | Status: Empirical Literature Envelope Infiltration Ranges (Partial Verification)
export const IO_RATIOS: Record<string, number> = {
  modern_sealed: 0.2,
  standard: 0.5,
  older_leaky: 0.8,
  open_plan: 0.95,
} as const;

// ─── 10. Pledge Action Impact Estimates ─────────────────────────
// Source: IPCC Sixth Assessment Report (AR6), Working Group III: Mitigation of Climate Change, Chapter 10: Transport
// URL: https://www.ipcc.ch/report/ar6/wg3/
// Retrieval Date: 2024-04-10 | Status: Modelled Empirical Estimates
export const PLEDGE_IMPACTS: Record<string, { co2eKgPerDay: number; pm25UgPerDay: number }> = {
  carpool: { co2eKgPerDay: 2.5, pm25UgPerDay: 0.8 },
  public_transit: { co2eKgPerDay: 3.0, pm25UgPerDay: 1.0 },
  wfh: { co2eKgPerDay: 4.0, pm25UgPerDay: 1.5 },
  ev_switch: { co2eKgPerDay: 3.5, pm25UgPerDay: 1.2 },
  no_burn: { co2eKgPerDay: 5.0, pm25UgPerDay: 8.0 },
  plant_tree: { co2eKgPerDay: 0.06, pm25UgPerDay: 0.02 },
} as const;

// ─── 11. Stagnation Thresholds ──────────────────────────────────
// Source: NOAA Air Resources Laboratory (ARL), Air Stagnation Index Formulation (Wang & Angell 1999)
// URL: https://www.arl.noaa.gov/research/air-quality/
// Secondary Reference: CPCB Winter Action Plan Boundary Layer Dynamics (https://cpcb.nic.in/air-pollution/)
// Retrieval Date: 2024-04-22 | Status: Meteorological Boundary Layer Heuristic
export const STAGNATION_THRESHOLDS = {
  windLow: 2.0, // m/s — below this counts as stagnant wind
  windVeryLow: 1.0, // m/s — very stagnant
  mixingHeightLow: 500, // m — shallow boundary layer
  inversionStrong: 3.0, // °C — strong inversion delta
} as const;
