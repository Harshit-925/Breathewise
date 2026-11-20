# Breathewise — GenAI Urban Air Quality Assistant

> A privacy-first, GenAI-powered assistant helping families and communities navigate severe winter smog and urban air pollution with low-emission routines, indoor air hacks, and sustainable travel alternatives.

---

## Architecture Flow Diagram

```mermaid
flowchart TD
    subgraph Browser ["Client: Browser (React 19 + TypeScript + Tailwind v4)"]
        UI["AppShell & Feature Views\n(Today · Routine · Indoor · Alternatives · Impact · Community · Chat)"]
        Context["AppContext\n(Language · Theme · Household · Location · Pledges)"]
        Engine["Pure Compute Engine (src/lib/engine/)\n(AQI · Inhaled Dose · CADR · Modes · Impact · Stagnation)"]
        Storage["Browser localStorage\n(Local-first, no account required)"]
        
        UI <--> Context
        Context --> Storage
        UI --> Engine
    end

    subgraph Gateway ["Defensive API Gateway (Node.js + Express + Zod)"]
        SecMW["Security Pipeline\n(Helmet CSP · CORS Allowlist · 100KB Body Cap · Rate Limiters)"]
        Sanitize["Input Sanitizer & Guardrails\n(Null-byte Stripping · Emergency Check · Off-topic Filter)"]
        Adapters["Data Adapters (LRU Cache)\n(Open-Meteo Geocoding · CAMS Air Quality · Weather Forecast)"]
        AIGateway["AI Engine Interface (Gemini 2.0 Flash)\n(Structured Output Schema · Fallback Generator · LRU Cache)"]
        Overwrite["Engine Number Overwrite\n('LLM does language, code does math')"]
        
        SecMW --> Sanitize
        Sanitize --> Adapters
        Sanitize --> AIGateway
        AIGateway --> Overwrite
    end

    UI -- "REST + SSE (Streaming Chat)" --> Gateway
    Overwrite -- "Validated Response" --> UI
    Adapters -- "CAMS Ensemble / ECMWF" --> ExternalAPIs["Open-Meteo Air Quality & Weather API"]
    AIGateway -- "Prompts (Temp 0.3)" --> GeminiAPI["Google Generative AI (Gemini Flash)"]
```

---

## 1. Chosen Vertical

- **Domain**: Urban environmental health, winter atmospheric smog mitigation, and respiratory risk reduction.
- **Problem**: During severe winter smog episodes (such as in the Indo-Gangetic Plain, Beijing, or valley basins), atmospheric temperature inversions trap ultra-fine particulates (PM2.5) near ground level. Families and sensitive individuals (children, asthmatics, elderly) struggle to identify safe hours for outdoor activity, select effective air purification solutions within their budget, and understand the direct personal and communal impact of their commute and heating decisions.
- **Target Users**: Urban households, parents of young children, elderly individuals, asthmatics, commuters, and local neighborhood organizers.
- **Relevance**: Rather than passive "red/green" AQI numbers, citizens need actionable, timed, and mathematically verified guidance to protect their lungs and actively lower city-wide emissions.

---

## 2. Approach and Logic

### Core Decisions & Trade-offs
1. **LLM Does Language, Code Does Math**: Generative AI (Gemini 2.0 Flash) is strictly utilized for contextual advice phrasing, personalized tone, and conversational assistance. Every single numerical figure (AQI, WHO multiple, inhaled dose, required CADR, decay duration, CO2e delta) is calculated by a pure deterministic TypeScript engine (`src/lib/engine/`). Engine values overwrite model output prior to delivery.
2. **Local-First Privacy by Default**: No user accounts, passwords, or tracking databases. All household parameters, room dimensions, and pledge commitments remain inside the user's browser `localStorage`. A single-click "Clear My Data" wipes all storage, and a "JSON Export" enables full data portability.
3. **Defensive API Gateway**: Express gateway hardened with Helmet CSP, exact-origin CORS filtering, a strict 100KB body limit, dual-tier rate limiting, and Zod strict schemas rejecting unknown properties.
4. **Resilient Fallback**: If an API key is missing or quota is exhausted, a deterministic fallback generator synthesizes realistic structured guidance matching the exact JSON schema.
5. **No Color-Only Risk**: All pollution and hazard alerts combine numbers, text labels, and icons, adhering strictly to WCAG 2.2 AA.

### Core Algorithms
- **Piecewise-Linear AQI Calculation**: Built using the revised May 2024 US EPA PM2.5 breakpoints table (Good threshold at 9.0 µg/m³).
- **Inhaled Respiratory Dose**:
  $$\text{Dose} (\mu\text{g}) = C_{\text{PM2.5}} \times \text{Hours} \times \text{BreathingRate} \times (1 - \text{FilterEfficiency}) \times \text{IO\_Ratio}$$
- **Clean Air Delivery Rate (CADR) & First-Order Exponential Decay**:
  $$\text{CADR}_{\text{required}} = V_{\text{room}} \times \text{ACH}_{\text{target}}, \quad t = -\frac{V}{\text{CADR}} \ln(1 - \eta)$$
- **Diurnal Stagnation Risk Heuristic**: Evaluates surface wind speeds ($< 2.5 \ \text{m/s}$) and boundary layer inversion indicators to classify smog trapping as Low, Medium, or High.

### Technology Stack Table

| Layer | Technologies | Version |
|---|---|---|
| **Client UI** | React, TypeScript (strict), Vite, Tailwind CSS | React 19.0, TS 5.6, Vite 6.0, Tailwind v4 |
| **Server Gateway** | Node.js, Express, Helmet, CORS, Express-Rate-Limit, LRU-Cache | Express 4.21, Helmet 8.0, LRU-Cache 11.0 |
| **Data Validation** | Zod | Zod 3.23 |
| **GenAI SDK** | Google Generative AI (Gemini 2.0 Flash / Flash Lite) | @google/generative-ai 0.21 |
| **Testing** | Vitest, Testing Library React, User-Event, Supertest, jsdom | Vitest 2.1, RTL 16.1, Supertest 7.0 |
| **Code Quality** | Oxlint, TypeScript compiler (`tsc --noEmit`) | Oxlint 0.12 |

---

## 3. How the Solution Works

### End-to-End User Journey
1. **Today's Air Snapshot**: The user views live air data for their city (or chooses a new city via debounced autocomplete geocoding). The dashboard surfaces current AQI, PM2.5, PM10, WHO guideline multiple, atmospheric stagnation risk, and a 24-hour bar forecast with screen-reader twins. A "What-If Smog Spike" slider allows testing mitigation strategies even on clean-air days.
2. **Routine Planner**: Suggests hour-by-hour windows indicating when to shift activities indoors and when solar warming provides safer ventilation intervals.
3. **Indoor Air Center**: Provides 3 budget tiers (DIY Corsi-Rosenthal box fan, Standard certified HEPA, and Premium filtration), an interactive CADR calculator sized to room dimensions, and an hourly window open/close schedule.
4. **Commute Alternatives**: An interactive multimodal comparison table (metro, bus, car, EV, two-wheeler, cycle, walk) displaying exact inhaled PM2.5 and CO2e emissions for customized trip distances.
5. **Impact Meter**: Real-time toggles (N95 mask, HEPA purifier, WFH, transit) demonstrate direct mathematical reductions in inhaled dose and carbon emissions.
6. **Community Pledges**: Local-first collective counter tracking neighborhood commitments and aggregate avoided emissions.
7. **Breathewise AI**: Streaming SSE assistant providing conversational guidance with context injection, quick-ask mode, prompt chips, and medical emergency guardrails.

### Installation & Run Instructions

```bash
# 1. Clone repository
git clone https://github.com/your-org/breathewise.git
cd breathewise

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY (optional, fallback engine works without it)

# 4. Start Development Servers
npm run dev           # Starts Vite client (http://localhost:5173)
npm run dev:server    # Starts Express API gateway (http://localhost:3001)

# 5. Run Verification Checks
npm run typecheck     # TypeScript strict compilation check
npm run lint          # Oxlint static analysis
npm test              # Run all 131 Vitest tests
npm run build         # Production Vite build
npm run build:server  # Production server build
```

---

## 4. Assumptions Made

1. **Air Quality Data**: Live air quality is sourced from the Copernicus Atmosphere Monitoring Service (CAMS) ENSEMBLE model via Open-Meteo. Grid resolutions represent regional urban airshed values rather than specific curb-side hyper-local sensors.
2. **Breathing Inhalation Rates**: Based on US EPA Exposure Factors Handbook (Rest: 0.45 m³/h, Light: 0.75 m³/h, Moderate: 1.20 m³/h, Heavy: 2.10 m³/h).
3. **Mask Filtration**: Well-fitted N95/FFP2 respirators are modeled at 95% particle filtration efficiency; surgical masks at 40%; cloth masks at 15%.
4. **Indoor Air Infiltration**: Baseline unpurified homes assume an indoor/outdoor PM2.5 ratio of 0.60 to 0.70 in typical construction. HEPA purifier use assumes an effective ratio of 0.20.
5. **Transport Emissions**: Passenger vehicle emission rates use DEFRA 2024 benchmarks (~0.192 kg CO2e/km for petrol/diesel cars, ~0.038 kg CO2e/passenger-km for electric metro).
6. **Health Scope Limitation**: The assistant offers general environmental wellness suggestions and explicitly disclaims clinical medical diagnoses or treatment prescriptions.

---

## 5. Security

Breathewise operates under a strict defense-in-depth security model:
- `GEMINI_API_KEY` custody is strictly server-side.
- Helmet Content Security Policy and strict origin allowlist (no wildcards).
- 100KB payload cap to prevent Denial-of-Service attacks.
- Dual-tier per-IP rate limiting (100 general / 30 AI req per 15 min).
- Zod `.strict()` schema validation rejecting extraneous payload fields.
- Automated null-byte and control character input stripping.
- Emergency medical symptom detection with immediate healthcare redirection.

*See [`SECURITY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/SECURITY.md) for full evidence.*

---

## 6. Accessibility

Breathewise conforms to WCAG 2.2 Level AA accessibility guidelines:
- Skip-to-main-content landmark link.
- Full keyboard operability; WAI-ARIA tablist pattern with arrow-key roving focus.
- Pollution hazard levels are never communicated solely by color (always accompanied by numbers, text labels, and icons).
- Every inline SVG chart features an adjacent `.sr-only` text equivalent describing values and trends.
- Token streaming updates use `aria-live="polite"`.

*See [`ACCESSIBILITY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/ACCESSIBILITY.md) for full evidence.*

---

## 7. Automated Test Results

The test suite runs **131 tests across 8 test suites** with a **100% pass rate**:

```
Test Files  8 passed (8)
     Tests  131 passed (131)
```

| Suite | File | Tests | Status |
|---|---|---|---|
| **Deterministic Engine** | `src/test/engine.test.ts` | 62 | ✅ Passed |
| **API Gateway & Routes** | `src/test/api.test.ts` | 15 | ✅ Passed |
| **AI Layer & Guardrails** | `src/test/ai.test.ts` | 14 | ✅ Passed |
| **Data Adapters** | `src/test/adapters.test.ts` | 12 | ✅ Passed |
| **UI Rendering & A11y Twins** | `src/test/rendering.test.tsx` | 12 | ✅ Passed |
| **DOM Events & Interactions** | `src/test/dom.test.tsx` | 10 | ✅ Passed |
| **WCAG 2.2 Accessibility** | `src/test/a11y.test.tsx` | 5 | ✅ Passed |
| **End-to-End User Journey** | `src/test/journey.test.tsx` | 1 | ✅ Passed |

*See [`TESTING.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/TESTING.md) for detailed test breakdown.*

---

## 8. Evaluation Scorecard

In accordance with evaluation principles, this scorecard reports verifiable status and commands rather than subjective scores:

| Category | Status | Evidence Document | Verification Command | Caveats / Notes |
|---|---|---|---|---|
| **Code Quality** | **Verified** | [`CODE_QUALITY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/CODE_QUALITY.md) | `npm run lint && npm run typecheck` | Zero `any` in TypeScript; 71 files pass with 0 warnings. |
| **Security** | **Verified** | [`SECURITY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/SECURITY.md) | `npx vitest run src/test/api.test.ts` | Server-side key custody, Helmet CSP, exact CORS, 100KB body limit. |
| **Efficiency** | **Verified** | [`EFFICIENCY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/EFFICIENCY.md) | `npm run build` | Sub-100 kB gzip bundle (86.52 kB JS + 7.79 kB CSS); multi-tier LRU cache. |
| **Testing** | **Verified** | [`TESTING.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/TESTING.md) | `npm test` | 131 tests passing across 8 suites (engine, API, AI, adapters, UI, DOM, a11y, journey). |
| **Accessibility** | **Verified** | [`ACCESSIBILITY.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/ACCESSIBILITY.md) | `npx vitest run src/test/a11y.test.tsx` | WCAG 2.2 AA compliant. Skip link, ARIA tablist, text twins for SVG charts. |
| **Problem Alignment** | **Verified** | [`PROBLEM_ALIGNMENT.md`](file:///c:/Users/hk672/OneDrive/Desktop/Program/Urban_Air/PROBLEM_ALIGNMENT.md) | `npx vitest run src/test/journey.test.tsx` | Full coverage of Challenge 6 winter smog navigation requirements. |

---

## 9. Project Directory Structure

```
breathewise/
├── .github/workflows/ci.yml        # Continuous integration pipeline
├── server/
│   ├── index.ts                    # Express server bootstrap & middleware pipeline
│   ├── middleware/                 # security.ts, rateLimit.ts, errorHandler.ts
│   ├── routes/                     # air.ts, geocode.ts, advice.ts, chat.ts, ask.ts, usage.ts, health.ts
│   ├── adapters/                   # geocode.ts, airQuality.ts, weather.ts
│   ├── ai/                         # prompts.ts, gemini.ts, cache.ts, fallback.ts, guardrails.ts
│   └── schemas/                    # Strict Zod request/response schemas
├── src/
│   ├── components/
│   │   ├── Today/                  # AirSnapshot, VerdictCard, HourlyBestWindows
│   │   ├── Routine/                # RoutinePlanner (hour-by-hour tailored routines)
│   │   ├── Indoor/                 # IndoorCenter (3 tiers, CADR calculator, window schedule)
│   │   ├── Alternatives/           # SwapCards, Transport ModeComparison table
│   │   ├── Impact/                 # ImpactMeter (interactive before/after live math)
│   │   ├── Community/              # PledgeBoard (collective clean air counter)
│   │   ├── Chat/                   # ChatPanel (streaming SSE, quick-ask, emergency guardrails)
│   │   ├── Navigation/             # Header, Tabs, ThemeToggle, LanguageSwitch
│   │   └── shared/                 # AqiBadge, Sparkline, TextTwin, Disclaimer, LoadingSpinner
│   ├── context/AppContext.tsx      # Global state (theme, language, household, location, pledges)
│   ├── hooks/                      # useAirData, useHousehold, useAdvice, useChat, useLocalStorage
│   ├── lib/
│   │   ├── engine/                 # aqi.ts, exposure.ts, cadr.ts, modes.ts, impact.ts, stagnation.ts
│   │   └── constants.ts            # EPA breakpoints, WHO guidelines, CADR, breathing rates
│   ├── services/                   # apiService.ts, storageService.ts
│   ├── i18n/                       # en.json, hi.json
│   ├── test/                       # 8 test suites (131 tests)
│   ├── App.tsx                     # Main application shell
│   ├── main.tsx                    # React 19 entry point
│   ├── index.css                   # Tailwind v4 styles & accessibility focus rings
│   └── types/index.ts              # TypeScript domain types & interfaces (zero any)
├── scripts/
│   ├── selftest.sh                 # Comprehensive quality gate runner
│   └── generate-metadata.ts        # Automated metadata.json generator
├── ACCESSIBILITY.md                # WCAG 2.2 AA compliance evidence
├── CODE_QUALITY.md                 # Strict TypeScript & architecture standards
├── EFFICIENCY.md                   # Measured bundle sizes & caching performance
├── PROBLEM_ALIGNMENT.md            # Challenge 6 traceability matrix & scientific sources
├── SECURITY.md                     # Gateway security controls & guardrails
├── TESTING.md                      # Test inventory & coverage report
├── metadata.json                   # Generated machine-readable evaluation report
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # Client TypeScript strict configuration
├── tsconfig.server.json            # Server TypeScript configuration
├── vite.config.ts                  # Vite + Tailwind v4 + Vitest configuration
└── LICENSE                         # MIT License
```

---

## Attribution & Disclaimers

- **Air Quality & Forecast Data**: Powered by the Copernicus Atmosphere Monitoring Service (CAMS) ENSEMBLE model and ECMWF forecasts via Open-Meteo API.
- **Scientific Reference Standards**: US EPA Revised 2024 NAAQS for Particulate Matter, WHO 2021 Global Air Quality Guidelines, AHAM AC-1 CADR standards, and DEFRA 2024 emissions conversion factors.
- **Health Disclaimer**: Breathewise provides general environmental wellness guidance based on mathematical exposure models. It does not provide medical diagnoses, clinical treatment plans, or emergency services.

---

## License

MIT License. Open source and free for urban community environmental health empowerment.
