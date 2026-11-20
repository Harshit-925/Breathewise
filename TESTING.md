# Automated Testing Report & Test Suite Inventory

Breathewise is protected by **131 automated tests** spanning 8 test suites. Every test is passing with 100% green status under Vitest.

## Test Summary

| Suite Name | File Path | Tests | Scope |
|---|---|---|---|
| **Deterministic Engine** | `src/test/engine.test.ts` | **62** | EPA 2024 breakpoints, WHO multiple, CADR required, decay math, inhaled dose, transport modes, stagnation heuristic, edge cases (NaN/negative). |
| **API Gateway & Routes** | `src/test/api.test.ts` | **15** | Health check, usage stats, geocoding validation, air route validation, advice generation, SSE streaming chat, emergency redirect, rate limits, strict schema rejection. |
| **AI Layer & Guardrails** | `src/test/ai.test.ts` | **14** | Input sanitization, null byte removal, prompt wrapping, emergency symptom detection (EN & Hindi), off-topic detection, LRU response cache hashing, fallback plan generation. |
| **Data Adapters** | `src/test/adapters.test.ts` | **12** | Open-Meteo geocode search, query normalization, air quality 24h forecast, weather adapter, in-memory caching, mock fallback on network timeout. |
| **UI Rendering & A11y Twins**| `src/test/rendering.test.tsx`| **12** | AqiBadge color independence, Sparkline SVG and sr-only twins, Disclaimer visibility, LoadingSpinner live region, VerdictCard, AirSnapshot, Header badges. |
| **DOM Events & Interactions** | `src/test/dom.test.tsx` | **10** | Tab navigation clicks, Arrow key roving focus, Theme toggle persistence, Language switch, CADR calculator updates, Impact meter live checkboxes, Community pledges. |
| **WCAG 2.2 Accessibility** | `src/test/a11y.test.tsx` | **5** | Skip-to-content landmark, ARIA tablist/tab structure, role="status" announcements, accessible landmarks, keyboard focusable targets. |
| **End-to-End User Journey** | `src/test/journey.test.tsx` | **1** | Full flow: load air data -> navigate tabs -> calculate CADR -> toggle impact options -> pledge clean transit -> verify persistence -> clear data. |
| **Total Automated Tests** | **8 Test Suites** | **131** | **All 131 tests passing (100% pass rate)** |

---

## Suite Breakdown & Evidence

### 1. Deterministic Engine (`src/test/engine.test.ts` — 62 tests)
- **Breakpoint Boundaries**: Tests every boundary of the revised 2024 US EPA PM2.5 table (0.0, 9.0, 9.1, 35.4, 35.5, 55.4, 55.5, 125.4, 125.5, 225.4, etc.).
- **Monotonicity**: Formally validates that higher PM2.5 concentrations strictly produce monotonically non-decreasing AQI values.
- **Inhaled Dose Calculation**: Validates formula across all 4 activity breathing rates (rest, light, moderate, heavy) and mask types (N95, surgical, cloth, none).
- **CADR & Decay**: Verifies required CADR for target air changes per hour and first-order exponential decay times ($t = -\frac{V}{\text{CADR}} \ln(1 - \eta)$).
- **Mode Comparison**: Validates exposure and emissions deltas across 7 travel modes (metro, bus, car, EV, two-wheeler, cycle, walk).

### 2. API Gateway (`src/test/api.test.ts` — 15 tests)
- Tests strict Zod validation rejecting unexpected keys (`.strict()`).
- Tests SSE streaming response format with chunk delivery and `data: [DONE]`.
- Tests emergency redirect trigger when medical distress terms appear in prompt.
- Tests CORS rejection when unknown origins connect.

### 3. AI Layer & Guardrails (`src/test/ai.test.ts` — 14 tests)
- Verifies that `sanitizeUserInput` strips null bytes (`\x00`) and control characters.
- Tests English and Hindi emergency keywords (e.g. "chest pain", "सांस नहीं आ रही").
- Tests deterministic fallback plan when no API key is supplied.

---

## How to Run the Tests

```bash
# Run all 131 tests:
npm test

# Run tests in watch mode:
npm run test:watch

# Run a specific suite:
npx vitest run src/test/engine.test.ts
npx vitest run src/test/api.test.ts
npx vitest run src/test/a11y.test.tsx
```
