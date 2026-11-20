import { describe, it, expect } from 'vitest';
import {
  pm25ToAqi,
  aqiCategory,
  whoMultiple,
  inhaledDose,
  bestOutdoorWindows,
  getBreathingRate,
  getMaskEfficiency,
  cadrRequired,
  purificationTime,
  windowSchedule,
  compareModes,
  actionImpact,
  communityTotals,
  stagnationRisk,
} from '../lib/engine/index.js';
import type { HourlyData, Persona, PledgeAction, StagnationSignals } from '../types/index.js';

// ─── Helper ──────────────────────────────────────────────────
const persona: Persona = {
  ageGroup: 'adult',
  activityLevel: 'light',
  mask: 'none',
  outdoorHoursPerDay: 2,
  maxPm25: 35,
};

// ═══════════════════════════════════════════════════════════════
// AQI Tests (1-15)
// ═══════════════════════════════════════════════════════════════
describe('pm25ToAqi', () => {
  it('1: returns AQI 0 for PM2.5 = 0', () => {
    expect(pm25ToAqi(0).aqi).toBe(0);
  });

  it('2: boundary — PM2.5 = 9.0 gives AQI 50', () => {
    expect(pm25ToAqi(9.0).aqi).toBe(50);
  });

  it('3: boundary — PM2.5 = 9.1 gives AQI 51', () => {
    expect(pm25ToAqi(9.1).aqi).toBeCloseTo(51, 0);
  });

  it('4: boundary — PM2.5 = 35.4 gives AQI 100', () => {
    expect(pm25ToAqi(35.4).aqi).toBe(100);
  });

  it('5: boundary — PM2.5 = 35.5 gives AQI 101', () => {
    expect(pm25ToAqi(35.5).aqi).toBeCloseTo(101, 0);
  });

  it('6: boundary — PM2.5 = 55.4 gives AQI 150', () => {
    expect(pm25ToAqi(55.4).aqi).toBe(150);
  });

  it('7: boundary — PM2.5 = 55.5 gives AQI 151', () => {
    expect(pm25ToAqi(55.5).aqi).toBeCloseTo(151, 0);
  });

  it('8: boundary — PM2.5 = 125.4 gives AQI 200', () => {
    expect(pm25ToAqi(125.4).aqi).toBe(200);
  });

  it('9: boundary — PM2.5 = 225.4 gives AQI 300', () => {
    expect(pm25ToAqi(225.4).aqi).toBe(300);
  });

  it('10: boundary — PM2.5 = 325.4 gives AQI 400', () => {
    expect(pm25ToAqi(325.4).aqi).toBe(400);
  });

  it('11: boundary — PM2.5 = 500.4 gives AQI 500', () => {
    expect(pm25ToAqi(500.4).aqi).toBe(500);
  });

  it('12: monotonicity — higher PM2.5 → higher AQI', () => {
    const values = [0, 5, 12, 35.5, 55.5, 125.5, 225.5, 325.5, 500];
    const aqis = values.map(v => pm25ToAqi(v).aqi);
    for (let i = 1; i < aqis.length; i++) {
      expect(aqis[i]!).toBeGreaterThan(aqis[i - 1]!);
    }
  });

  it('13: negative input clamps to AQI 0 with assumption', () => {
    const result = pm25ToAqi(-10);
    expect(result.aqi).toBe(0);
    expect(result.assumptions.length).toBeGreaterThan(0);
  });

  it('14: NaN input clamps to AQI 0', () => {
    expect(pm25ToAqi(NaN).aqi).toBe(0);
  });

  it('15: concentration beyond table clamps to 500', () => {
    const result = pm25ToAqi(999);
    expect(result.aqi).toBe(500);
    expect(result.assumptions).toContain(
      'Concentration exceeds breakpoint table; clamped to AQI 500',
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// AQI Category Tests (16-19)
// ═══════════════════════════════════════════════════════════════
describe('aqiCategory', () => {
  it('16: AQI 25 → Good', () => {
    expect(aqiCategory(25).label).toBe('Good');
  });

  it('17: AQI 75 → Moderate', () => {
    expect(aqiCategory(75).label).toBe('Moderate');
  });

  it('18: AQI 175 → Unhealthy', () => {
    expect(aqiCategory(175).label).toBe('Unhealthy');
  });

  it('19: AQI 500 → Hazardous', () => {
    expect(aqiCategory(500).label).toBe('Hazardous');
  });
});

// ═══════════════════════════════════════════════════════════════
// WHO Multiple Tests (20-23)
// ═══════════════════════════════════════════════════════════════
describe('whoMultiple', () => {
  it('20: PM2.5 = 15 → multiple = 1.0', () => {
    expect(whoMultiple(15).multiple).toBe(1);
  });

  it('21: PM2.5 = 75 → multiple = 5.0', () => {
    expect(whoMultiple(75).multiple).toBe(5);
  });

  it('22: PM2.5 = 0 → multiple = 0', () => {
    expect(whoMultiple(0).multiple).toBe(0);
  });

  it('23: negative PM2.5 → multiple = 0 with assumption', () => {
    const r = whoMultiple(-5);
    expect(r.multiple).toBe(0);
    expect(r.assumptions.length).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════
// Inhaled Dose Tests (24-29)
// ═══════════════════════════════════════════════════════════════
describe('inhaledDose', () => {
  it('24: basic dose calculation', () => {
    // 50 µg/m³ × 1 h × (16 L/min × 60/1000 = 0.96 m³/h) × 1.0 × (1-0) = 48
    const r = inhaledDose(50, 1, 16, 1, 0);
    expect(r.doseUg).toBeCloseTo(48, 1);
  });

  it('25: N95 mask reduces dose by ~95%', () => {
    const noMask = inhaledDose(100, 1, 16, 1, 0).doseUg;
    const withMask = inhaledDose(100, 1, 16, 1, 0.95).doseUg;
    expect(withMask).toBeCloseTo(noMask * 0.05, 1);
  });

  it('26: zero PM2.5 → zero dose', () => {
    expect(inhaledDose(0, 2, 16).doseUg).toBe(0);
  });

  it('27: zero hours → zero dose', () => {
    expect(inhaledDose(100, 0, 16).doseUg).toBe(0);
  });

  it('28: negative PM2.5 → zero dose', () => {
    expect(inhaledDose(-10, 1, 16).doseUg).toBe(0);
  });

  it('29: NaN PM2.5 → zero dose', () => {
    expect(inhaledDose(NaN, 1, 16).doseUg).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Best Outdoor Windows Tests (30-33)
// ═══════════════════════════════════════════════════════════════
describe('bestOutdoorWindows', () => {
  const hourly: HourlyData[] = [
    { hour: 6, pm25: 20 },
    { hour: 7, pm25: 25 },
    { hour: 8, pm25: 30 },
    { hour: 9, pm25: 50 },
    { hour: 10, pm25: 60 },
    { hour: 16, pm25: 28 },
    { hour: 17, pm25: 32 },
  ];

  it('30: finds windows below persona threshold', () => {
    const r = bestOutdoorWindows(hourly, persona);
    expect(r.windows.length).toBeGreaterThan(0);
    r.windows.forEach(w => expect(w.avgPm25).toBeLessThanOrEqual(35));
  });

  it('31: windows sorted by avgPm25 ascending', () => {
    const r = bestOutdoorWindows(hourly, persona);
    for (let i = 1; i < r.windows.length; i++) {
      expect(r.windows[i]!.avgPm25).toBeGreaterThanOrEqual(r.windows[i - 1]!.avgPm25);
    }
  });

  it('32: empty hourly data → empty windows', () => {
    const r = bestOutdoorWindows([], persona);
    expect(r.windows).toHaveLength(0);
  });

  it('33: all above threshold → empty windows', () => {
    const high: HourlyData[] = [
      { hour: 0, pm25: 100 },
      { hour: 1, pm25: 200 },
    ];
    const r = bestOutdoorWindows(high, persona);
    expect(r.windows).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// CADR Tests (34-38)
// ═══════════════════════════════════════════════════════════════
describe('cadrRequired', () => {
  it('34: 30 m³ room × 5 ACH = 150 m³/h CADR', () => {
    expect(cadrRequired(30, 5).cadrM3h).toBe(150);
  });

  it('35: zero volume → 0', () => {
    expect(cadrRequired(0, 5).cadrM3h).toBe(0);
  });

  it('36: negative ACH → 0', () => {
    expect(cadrRequired(30, -1).cadrM3h).toBe(0);
  });
});

describe('purificationTime', () => {
  it('37: returns finite time for valid inputs', () => {
    const r = purificationTime(30, 150, 0.95);
    expect(r.minutes).toBeGreaterThan(0);
    expect(Number.isFinite(r.minutes)).toBe(true);
  });

  it('38: zero CADR → Infinity', () => {
    expect(purificationTime(30, 0).minutes).toBe(Infinity);
  });
});

// ═══════════════════════════════════════════════════════════════
// Window Schedule Tests (39-40)
// ═══════════════════════════════════════════════════════════════
describe('windowSchedule', () => {
  it('39: recommends slot with low PM2.5 and adequate wind', () => {
    const data: HourlyData[] = [
      { hour: 6, pm25: 20, windSpeed: 3 },
      { hour: 7, pm25: 50, windSpeed: 4 },
      { hour: 8, pm25: 10, windSpeed: 1 },
    ];
    const r = windowSchedule(data);
    expect(r.slots[0]!.recommended).toBe(true); // pm25<35, wind>=2
    expect(r.slots[1]!.recommended).toBe(false); // pm25>=35
    expect(r.slots[2]!.recommended).toBe(false); // wind<2
  });

  it('40: empty data → empty slots', () => {
    expect(windowSchedule([]).slots).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Comparison Tests (41-45)
// ═══════════════════════════════════════════════════════════════
describe('compareModes', () => {
  const trip = { distanceKm: 10, durationMinutes: 30 };

  it('41: returns results for all default modes', () => {
    const r = compareModes(trip, 100);
    expect(r.results.length).toBe(7);
  });

  it('42: walking has zero CO2e', () => {
    const r = compareModes(trip, 100, ['walk']);
    expect(r.results[0]!.co2eKg).toBe(0);
  });

  it('43: car has higher CO2e than metro', () => {
    const r = compareModes(trip, 100, ['car', 'metro']);
    const car = r.results.find(m => m.mode === 'car')!;
    const metro = r.results.find(m => m.mode === 'metro')!;
    expect(car.co2eKg).toBeGreaterThan(metro.co2eKg);
  });

  it('44: two-wheeler has higher exposure than metro', () => {
    const r = compareModes(trip, 100, ['two_wheeler', 'metro']);
    const tw = r.results.find(m => m.mode === 'two_wheeler')!;
    const metro = r.results.find(m => m.mode === 'metro')!;
    expect(tw.inhaledPm25Ug).toBeGreaterThan(metro.inhaledPm25Ug);
  });

  it('45: zero PM2.5 → zero inhaled dose for all modes', () => {
    const r = compareModes(trip, 0);
    r.results.forEach(m => expect(m.inhaledPm25Ug).toBe(0));
  });
});

// ═══════════════════════════════════════════════════════════════
// Impact Tests (46-50)
// ═══════════════════════════════════════════════════════════════
describe('actionImpact', () => {
  const ctx = { dailyDriveKm: 20, currentMode: 'car' as const };

  it('46: carpool yields positive savings', () => {
    const r = actionImpact('carpool', ctx);
    expect(r.co2eSavedKg).toBeGreaterThan(0);
    expect(r.pm25ReducedUg).toBeGreaterThan(0);
  });

  it('47: no_burn has the highest PM2.5 reduction', () => {
    const burn = actionImpact('no_burn', ctx);
    const carpool = actionImpact('carpool', ctx);
    expect(burn.pm25ReducedUg).toBeGreaterThan(carpool.pm25ReducedUg);
  });
});

describe('communityTotals', () => {
  it('48: aggregates pledges correctly', () => {
    const pledges: PledgeAction[] = [
      { type: 'carpool', count: 10 },
      { type: 'wfh', count: 5 },
    ];
    const r = communityTotals(pledges);
    expect(r.pledgeCount).toBe(15);
    expect(r.totalCo2eSavedKg).toBeGreaterThan(0);
  });

  it('49: empty pledges → zero totals', () => {
    const r = communityTotals([]);
    expect(r.pledgeCount).toBe(0);
    expect(r.totalCo2eSavedKg).toBe(0);
  });

  it('50: single pledge with count 1', () => {
    const r = communityTotals([{ type: 'plant_tree', count: 1 }]);
    expect(r.pledgeCount).toBe(1);
    expect(r.totalCo2eSavedKg).toBeCloseTo(0.06, 2);
  });
});

// ═══════════════════════════════════════════════════════════════
// Stagnation Tests (51-55)
// ═══════════════════════════════════════════════════════════════
describe('stagnationRisk', () => {
  it('51: high wind → low risk', () => {
    expect(stagnationRisk({ windSpeed: 10 }).level).toBe('low');
  });

  it('52: very low wind → at least medium', () => {
    const r = stagnationRisk({ windSpeed: 0.5 });
    expect(['medium', 'high']).toContain(r.level);
  });

  it('53: all bad signals → high risk', () => {
    const signals: StagnationSignals = {
      windSpeed: 0.5,
      mixingHeight: 200,
      deltaTemp: 5,
    };
    expect(stagnationRisk(signals).level).toBe('high');
    expect(stagnationRisk(signals).score).toBe(1.0);
  });

  it('54: moderate wind only → low risk', () => {
    expect(stagnationRisk({ windSpeed: 1.5 }).level).toBe('low');
  });

  it('55: low wind + shallow mixing → medium', () => {
    const r = stagnationRisk({ windSpeed: 1.5, mixingHeight: 300 });
    expect(r.level).toBe('medium');
  });
});

// ═══════════════════════════════════════════════════════════════
// Helper Function Tests (56-58)
// ═══════════════════════════════════════════════════════════════
describe('getBreathingRate', () => {
  it('56: adult rest = 7.5 L/min', () => {
    expect(getBreathingRate('adult', 'rest')).toBe(7.5);
  });

  it('57: unknown group falls back to adult rest', () => {
    expect(getBreathingRate('unknown', 'rest')).toBe(7.5);
  });
});

describe('getMaskEfficiency', () => {
  it('58: N95 typical = 0.95', () => {
    expect(getMaskEfficiency('N95')).toBe(0.95);
  });
});

// ═══════════════════════════════════════════════════════════════
// Units & Edge Cases (59-62)
// ═══════════════════════════════════════════════════════════════
describe('edge cases', () => {
  it('59: AQI mid-range interpolation (PM2.5 = 20)', () => {
    const r = pm25ToAqi(20);
    expect(r.aqi).toBeGreaterThan(0);
    expect(r.aqi).toBeLessThan(100);
  });

  it('60: purificationTime with naturalLoss exceeding CADR', () => {
    const r = purificationTime(30, 10, 0.5, 100);
    expect(r.minutes).toBe(Infinity);
  });

  it('61: compareModes with filtered mode list', () => {
    const r = compareModes({ distanceKm: 5, durationMinutes: 15 }, 50, ['walk', 'cycle']);
    expect(r.results).toHaveLength(2);
    r.results.forEach(m => expect(m.co2eKg).toBe(0));
  });

  it('62: whoMultiple with NaN → 0', () => {
    expect(whoMultiple(NaN).multiple).toBe(0);
  });
});
